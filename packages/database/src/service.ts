import {
  createEqualSplit,
  formatUsdcFromBaseUnits,
  parseUsdcToBaseUnits,
  type BalanceEntry,
  type EqualSplitResult,
  type ParticipantShare
} from "@splitstable/split-engine";
import { getPrismaClient, type PrismaClient } from "./client.js";
import { canonicalize, type ChatId } from "./members.js";

/**
 * Persistence layer for SplitStable.
 *
 * `recordSplit` saves a new expense for a Telegram chat, applies its
 * balance entries to the running per-chat ledger (with netting), and
 * returns a summary for the bot to format.
 *
 * Participants come from the persisted ChatMember list, not from the
 * caller, so the demo always reflects the real chat membership.
 *
 * `getBalances` reads the current net outstanding balances for a chat
 * directly from SQLite, so they survive bot restarts.
 *
 * All amounts are USDC base units (6 decimals) to avoid float drift.
 * This is still a demo flow: no real settlement, no wallets yet.
 */

export type { ChatId } from "./members.js";

export type RecordSplitInput = {
  chatId: ChatId;
  description: string;
  /** USDC amount as a decimal string, e.g. "50" or "12.50". */
  amount: string;
  /** Telegram first name of the user who paid. Will be auto-added as a member. */
  payerDisplayName: string;
};

export type PersistedShare = {
  participantName: string;
  shareBaseUnits: bigint;
};

export type PersistedBalance = {
  fromParticipant: string;
  toParticipant: string;
  amountBaseUnits: bigint;
};

export type RecordSplitResult = {
  expenseId: string;
  chatId: bigint;
  description: string;
  token: "USDC";
  amountBaseUnits: bigint;
  payerName: string;
  participantNames: string[];
  shares: PersistedShare[];
  /** Balances created by THIS split (not the running totals). */
  splitBalances: PersistedBalance[];
};

function toBigIntChatId(chatId: ChatId): bigint {
  return typeof chatId === "bigint" ? chatId : BigInt(chatId);
}

/**
 * Persist a new equal split and update the chat's running balances.
 *
 * Auto-adds the payer to the chat's member list if missing. Errors
 * cleanly if there are not at least two members to split among.
 */
export async function recordSplit(
  input: RecordSplitInput,
  client: PrismaClient = getPrismaClient()
): Promise<RecordSplitResult> {
  const chatId = toBigIntChatId(input.chatId);
  const amountBaseUnits = parseUsdcToBaseUnits(input.amount);
  const payerName = canonicalize(input.payerDisplayName);
  const payerDisplayName = input.payerDisplayName.trim();

  if (payerDisplayName.length === 0) {
    throw new Error("Payer name is required");
  }

  return client.$transaction(async (tx) => {
    await tx.telegramChat.upsert({
      where: { id: chatId },
      create: { id: chatId },
      update: {}
    });

    await tx.chatMember.upsert({
      where: { chatId_name: { chatId, name: payerName } },
      create: { chatId, name: payerName, displayName: payerDisplayName },
      update: {}
    });

    const memberRows = await tx.chatMember.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" }
    });

    if (memberRows.length < 2) {
      throw new Error(
        "Need at least two chat members to split. Use /addmember <name> to add someone."
      );
    }

    const participantNames = memberRows.map((m) => m.name);

    const split = createEqualSplit({
      amountBaseUnits,
      participantIds: participantNames,
      payerId: payerName
    });

    const expense = await tx.expense.create({
      data: {
        chatId,
        description: input.description,
        token: "USDC",
        amountBaseUnits,
        payerName,
        participants: {
          create: split.shares.map((share: ParticipantShare) => ({
            participantName: share.participantId,
            shareBaseUnits: share.shareBaseUnits
          }))
        }
      },
      select: { id: true }
    });

    for (const balance of split.balances) {
      await applyBalanceDelta(tx, chatId, balance);
    }

    return {
      expenseId: expense.id,
      chatId,
      description: input.description,
      token: "USDC",
      amountBaseUnits: split.amountBaseUnits,
      payerName,
      participantNames,
      shares: split.shares.map((share) => ({
        participantName: share.participantId,
        shareBaseUnits: share.shareBaseUnits
      })),
      splitBalances: balanceEntriesToPersisted(split.balances)
    };
  });
}

export type RecordSettlementInput = {
  chatId: ChatId;
  /** Telegram first name of the user who ran /settle. */
  senderDisplayName: string;
  /** Raw name argument passed to /settle. */
  counterpartyRawName: string;
  /** Optional partial USDC amount as a decimal string. Omit to settle the full debt. */
  amount?: string;
};

export type RecordSettlementResult = {
  /** Canonical name of the debtor (the one who paid). */
  fromParticipant: string;
  /** Canonical name of the creditor (the one who got paid). */
  toParticipant: string;
  settledBaseUnits: bigint;
  remainingBaseUnits: bigint;
  fullSettlement: boolean;
};

/**
 * Mark a debt between two members as (partially or fully) paid.
 *
 * Auto-detects direction: whichever side currently has positive
 * outstanding debt is treated as the debtor. The sender of the
 * command can be either side; both members must already exist
 * in the chat.
 *
 * Demo only: nothing moves on-chain. We just adjust the ledger.
 */
export async function recordSettlement(
  input: RecordSettlementInput,
  client: PrismaClient = getPrismaClient()
): Promise<RecordSettlementResult> {
  const chatId = toBigIntChatId(input.chatId);
  const senderName = canonicalize(input.senderDisplayName);
  const counterpartyName = canonicalize(input.counterpartyRawName);

  if (senderName.length === 0) {
    throw new Error("Sender name is required");
  }
  if (counterpartyName.length === 0) {
    throw new Error("Counterparty name is required");
  }
  if (senderName === counterpartyName) {
    throw new Error("You cannot settle a debt with yourself");
  }

  return client.$transaction(async (tx) => {
    const [sender, counterparty] = await Promise.all([
      tx.chatMember.findUnique({
        where: { chatId_name: { chatId, name: senderName } }
      }),
      tx.chatMember.findUnique({
        where: { chatId_name: { chatId, name: counterpartyName } }
      })
    ]);

    if (counterparty === null) {
      throw new Error(`No member named "${input.counterpartyRawName}" in this chat`);
    }
    if (sender === null) {
      throw new Error(
        "You are not a member of this chat yet. Run /split or /addmember first."
      );
    }

    const [forward, reverse] = await Promise.all([
      tx.balance.findUnique({
        where: {
          chatId_fromParticipant_toParticipant: {
            chatId,
            fromParticipant: senderName,
            toParticipant: counterpartyName
          }
        }
      }),
      tx.balance.findUnique({
        where: {
          chatId_fromParticipant_toParticipant: {
            chatId,
            fromParticipant: counterpartyName,
            toParticipant: senderName
          }
        }
      })
    ]);

    let debtorName: string;
    let creditorName: string;
    let debtAmount: bigint;

    if (forward !== null && forward.amountBaseUnits > 0n) {
      debtorName = senderName;
      creditorName = counterpartyName;
      debtAmount = forward.amountBaseUnits;
    } else if (reverse !== null && reverse.amountBaseUnits > 0n) {
      debtorName = counterpartyName;
      creditorName = senderName;
      debtAmount = reverse.amountBaseUnits;
    } else {
      throw new Error(
        `No outstanding balance between ${sender.displayName} and ${counterparty.displayName}`
      );
    }

    let settledAmount: bigint;
    if (input.amount === undefined) {
      settledAmount = debtAmount;
    } else {
      settledAmount = parseUsdcToBaseUnits(input.amount);
      if (settledAmount <= 0n) {
        throw new Error("Settlement amount must be greater than zero");
      }
      if (settledAmount > debtAmount) {
        throw new Error(
          `Cannot settle more than the outstanding debt (${formatUsdcFromBaseUnits(debtAmount)} USDC)`
        );
      }
    }

    const remaining = debtAmount - settledAmount;
    const balanceKey = {
      chatId_fromParticipant_toParticipant: {
        chatId,
        fromParticipant: debtorName,
        toParticipant: creditorName
      }
    };

    if (remaining === 0n) {
      await tx.balance.delete({ where: balanceKey });
    } else {
      await tx.balance.update({
        where: balanceKey,
        data: { amountBaseUnits: remaining }
      });
    }

    return {
      fromParticipant: debtorName,
      toParticipant: creditorName,
      settledBaseUnits: settledAmount,
      remainingBaseUnits: remaining,
      fullSettlement: remaining === 0n
    };
  });
}

/**
 * Read the chat's current net balances, ordered for stable display.
 */
export async function getBalances(
  chatId: ChatId,
  client: PrismaClient = getPrismaClient()
): Promise<PersistedBalance[]> {
  const id = toBigIntChatId(chatId);

  const rows = await client.balance.findMany({
    where: { chatId: id, amountBaseUnits: { gt: 0n } },
    orderBy: [{ fromParticipant: "asc" }, { toParticipant: "asc" }]
  });

  return rows.map((row) => ({
    fromParticipant: row.fromParticipant,
    toParticipant: row.toParticipant,
    amountBaseUnits: row.amountBaseUnits
  }));
}

type TransactionClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

/**
 * Apply a single (from -> to, amount) delta to the per-chat balance
 * ledger, netting against any reverse-direction debt that already
 * exists. Keeps at most one row per directed pair.
 */
async function applyBalanceDelta(
  tx: TransactionClient,
  chatId: bigint,
  entry: BalanceEntry
): Promise<void> {
  const forwardKey = {
    chatId_fromParticipant_toParticipant: {
      chatId,
      fromParticipant: entry.fromParticipantId,
      toParticipant: entry.toParticipantId
    }
  };
  const reverseKey = {
    chatId_fromParticipant_toParticipant: {
      chatId,
      fromParticipant: entry.toParticipantId,
      toParticipant: entry.fromParticipantId
    }
  };

  const [forward, reverse] = await Promise.all([
    tx.balance.findUnique({ where: forwardKey }),
    tx.balance.findUnique({ where: reverseKey })
  ]);

  const forwardAmount = forward?.amountBaseUnits ?? 0n;
  const reverseAmount = reverse?.amountBaseUnits ?? 0n;
  const net = forwardAmount + entry.amountBaseUnits - reverseAmount;

  if (net > 0n) {
    if (reverse !== null) {
      await tx.balance.delete({ where: reverseKey });
    }
    await tx.balance.upsert({
      where: forwardKey,
      create: {
        chatId,
        fromParticipant: entry.fromParticipantId,
        toParticipant: entry.toParticipantId,
        amountBaseUnits: net
      },
      update: { amountBaseUnits: net }
    });
    return;
  }

  if (net < 0n) {
    if (forward !== null) {
      await tx.balance.delete({ where: forwardKey });
    }
    await tx.balance.upsert({
      where: reverseKey,
      create: {
        chatId,
        fromParticipant: entry.toParticipantId,
        toParticipant: entry.fromParticipantId,
        amountBaseUnits: -net
      },
      update: { amountBaseUnits: -net }
    });
    return;
  }

  if (forward !== null) {
    await tx.balance.delete({ where: forwardKey });
  }
  if (reverse !== null) {
    await tx.balance.delete({ where: reverseKey });
  }
}

function balanceEntriesToPersisted(entries: EqualSplitResult["balances"]): PersistedBalance[] {
  return entries.map((entry) => ({
    fromParticipant: entry.fromParticipantId,
    toParticipant: entry.toParticipantId,
    amountBaseUnits: entry.amountBaseUnits
  }));
}

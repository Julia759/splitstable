import {
  createEqualSplit,
  parseUsdcToBaseUnits,
  type BalanceEntry,
  type EqualSplitResult,
  type ParticipantShare
} from "@splitstable/split-engine";
import { getPrismaClient, type PrismaClient } from "./client.js";

/**
 * Persistence layer for SplitStable.
 *
 * `recordSplit` saves a new expense for a Telegram chat, applies its
 * balance entries to the running per-chat ledger (with netting), and
 * returns a summary for the bot to format.
 *
 * `getBalances` reads the current net outstanding balances for a chat
 * directly from SQLite, so they survive bot restarts.
 *
 * All amounts are USDC base units (6 decimals) to avoid float drift.
 * This is still a demo flow: no real settlement, no wallets yet.
 */

export type ChatId = bigint | number;

export type RecordSplitInput = {
  chatId: ChatId;
  description: string;
  /** USDC amount as a decimal string, e.g. "50" or "12.50". */
  amount: string;
  payerName: string;
  participantNames: string[];
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
 */
export async function recordSplit(
  input: RecordSplitInput,
  client: PrismaClient = getPrismaClient()
): Promise<RecordSplitResult> {
  const chatId = toBigIntChatId(input.chatId);
  const amountBaseUnits = parseUsdcToBaseUnits(input.amount);

  const split = createEqualSplit({
    amountBaseUnits,
    participantIds: input.participantNames,
    payerId: input.payerName
  });

  const expenseId = await client.$transaction(async (tx) => {
    await tx.telegramChat.upsert({
      where: { id: chatId },
      create: { id: chatId },
      update: {}
    });

    const expense = await tx.expense.create({
      data: {
        chatId,
        description: input.description,
        token: "USDC",
        amountBaseUnits,
        payerName: input.payerName,
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

    return expense.id;
  });

  return {
    expenseId,
    chatId,
    description: input.description,
    token: "USDC",
    amountBaseUnits: split.amountBaseUnits,
    payerName: input.payerName,
    participantNames: [...input.participantNames],
    shares: split.shares.map((share) => ({
      participantName: share.participantId,
      shareBaseUnits: share.shareBaseUnits
    })),
    splitBalances: balanceEntriesToPersisted(split.balances)
  };
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

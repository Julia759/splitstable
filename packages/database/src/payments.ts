import {
  createUsdcTransferUrl,
  generatePaymentReference,
  resolveSolanaPayConfig,
  type SolanaCluster
} from "@splitstable/solana";
import {
  formatUsdcFromBaseUnits,
  parseUsdcToBaseUnits
} from "@splitstable/split-engine";
import { getPrismaClient, type PrismaClient } from "./client.js";
import { canonicalize, type ChatId } from "./members.js";

/**
 * Solana Pay payment intents.
 *
 * A PaymentIntent represents a pending on-chain USDC transfer between
 * two chat members. Created by /settle when both parties have wallets
 * linked. The payment-watcher polls the chain for transactions tagged
 * with the intent's reference key and, on confirmation, applies the
 * settlement to the ledger by calling `recordSettlement`.
 *
 * Demo scope: devnet only. Mainnet flips a single env var but is not
 * recommended until we add monitoring + rate limits.
 */

export type CreatePaymentIntentInput = {
  chatId: ChatId;
  /** Telegram first name of the user who ran /settle (auto-detected as creditor or debtor). */
  senderDisplayName: string;
  /** Raw counterparty argument from /settle. */
  counterpartyRawName: string;
  /** Optional partial USDC amount; omit for full debt. */
  amount?: string;
  /** Override default expiry (default: 30 minutes from now). */
  expiresInMinutes?: number;
};

export type CreatedPaymentIntent = {
  id: string;
  chatId: bigint;
  fromName: string;
  toName: string;
  amountBaseUnits: bigint;
  reference: string;
  recipientWallet: string;
  senderWallet: string;
  cluster: SolanaCluster;
  paymentUrl: string;
  expiresAt: Date;
};

const DEFAULT_EXPIRY_MINUTES = 30;

function toBigIntChatId(chatId: ChatId): bigint {
  return typeof chatId === "bigint" ? chatId : BigInt(chatId);
}

/**
 * Create a Solana Pay payment intent for the matching outstanding debt
 * between sender and counterparty. Auto-detects direction (whichever
 * side has positive debt is the debtor).
 *
 * Does NOT touch the Balance ledger. The ledger is only updated when
 * the payment-watcher confirms an on-chain transaction matching this
 * intent.
 *
 * Throws when:
 *  - either party is not a chat member
 *  - either party has no wallet linked
 *  - no outstanding debt exists between them
 *  - a partial amount exceeds the outstanding debt
 */
export async function createPaymentIntent(
  input: CreatePaymentIntentInput,
  client: PrismaClient = getPrismaClient()
): Promise<CreatedPaymentIntent> {
  const chatId = toBigIntChatId(input.chatId);
  const senderName = canonicalize(input.senderDisplayName);
  const counterpartyName = canonicalize(input.counterpartyRawName);

  if (senderName === counterpartyName) {
    throw new Error("You cannot settle a debt with yourself");
  }

  const config = resolveSolanaPayConfig();

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
        "You are not a member of this chat yet. Run /setwallet <address> or /addmember first."
      );
    }
    if (sender.walletAddress === null) {
      throw new Error(
        `${sender.displayName} has not linked a wallet. Run /setwallet <address> first.`
      );
    }
    if (counterparty.walletAddress === null) {
      throw new Error(
        `${counterparty.displayName} has not linked a wallet yet. Ask them to run /setwallet <address>.`
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
    let debtorWallet: string;
    let creditorWallet: string;
    let debtAmount: bigint;

    if (forward !== null && forward.amountBaseUnits > 0n) {
      debtorName = senderName;
      creditorName = counterpartyName;
      debtorWallet = sender.walletAddress;
      creditorWallet = counterparty.walletAddress;
      debtAmount = forward.amountBaseUnits;
    } else if (reverse !== null && reverse.amountBaseUnits > 0n) {
      debtorName = counterpartyName;
      creditorName = senderName;
      debtorWallet = counterparty.walletAddress;
      creditorWallet = sender.walletAddress;
      debtAmount = reverse.amountBaseUnits;
    } else {
      throw new Error(
        `No outstanding balance between ${sender.displayName} and ${counterparty.displayName}`
      );
    }

    let payAmount: bigint;
    if (input.amount === undefined) {
      payAmount = debtAmount;
    } else {
      payAmount = parseUsdcToBaseUnits(input.amount);
      if (payAmount <= 0n) {
        throw new Error("Settlement amount must be greater than zero");
      }
      if (payAmount > debtAmount) {
        throw new Error(
          `Cannot settle more than the outstanding debt (${formatUsdcFromBaseUnits(debtAmount)} USDC)`
        );
      }
    }

    const reference = generatePaymentReference();
    const expiryMinutes = input.expiresInMinutes ?? DEFAULT_EXPIRY_MINUTES;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const paymentUrl = createUsdcTransferUrl({
      recipientWallet: creditorWallet,
      amountBaseUnits: payAmount,
      reference,
      cluster: config.cluster,
      label: "SplitStable",
      message: `Settle ${formatUsdcFromBaseUnits(payAmount)} USDC to ${counterparty.displayName}`,
      memo: `splitstable:${reference.slice(0, 8)}`
    });

    const intent = await tx.paymentIntent.create({
      data: {
        chatId,
        fromName: debtorName,
        toName: creditorName,
        amountBaseUnits: payAmount,
        reference,
        recipientWallet: creditorWallet,
        senderWallet: debtorWallet,
        tokenMint: config.usdcMint,
        status: "pending",
        expiresAt
      }
    });

    return {
      id: intent.id,
      chatId,
      fromName: debtorName,
      toName: creditorName,
      amountBaseUnits: payAmount,
      reference,
      recipientWallet: creditorWallet,
      senderWallet: debtorWallet,
      cluster: config.cluster,
      paymentUrl,
      expiresAt
    };
  });
}

export type PendingPaymentIntent = {
  id: string;
  chatId: bigint;
  fromName: string;
  toName: string;
  amountBaseUnits: bigint;
  reference: string;
  recipientWallet: string;
  senderWallet: string;
  tokenMint: string;
  expiresAt: Date;
};

/**
 * List all payment intents that are still `pending` and not past expiry.
 * Used by the background watcher to know which intents to verify.
 */
export async function listPendingPaymentIntents(
  client: PrismaClient = getPrismaClient(),
  now: Date = new Date()
): Promise<PendingPaymentIntent[]> {
  const rows = await client.paymentIntent.findMany({
    where: {
      status: "pending",
      expiresAt: { gt: now }
    },
    orderBy: { createdAt: "asc" }
  });

  return rows.map((row) => ({
    id: row.id,
    chatId: row.chatId,
    fromName: row.fromName,
    toName: row.toName,
    amountBaseUnits: row.amountBaseUnits,
    reference: row.reference,
    recipientWallet: row.recipientWallet,
    senderWallet: row.senderWallet,
    tokenMint: row.tokenMint,
    expiresAt: row.expiresAt
  }));
}

export type ConfirmPaymentIntentInput = {
  intentId: string;
  txSignature: string;
};

/**
 * Mark a payment intent as confirmed and apply the settlement to the
 * ledger atomically. Idempotent: if the intent is already confirmed,
 * does nothing.
 */
export async function confirmPaymentIntent(
  input: ConfirmPaymentIntentInput,
  client: PrismaClient = getPrismaClient()
): Promise<{ alreadyConfirmed: boolean; intent: PendingPaymentIntent }> {
  return client.$transaction(async (tx) => {
    const intent = await tx.paymentIntent.findUnique({
      where: { id: input.intentId }
    });

    if (intent === null) {
      throw new Error("Payment intent not found");
    }

    if (intent.status === "confirmed") {
      return {
        alreadyConfirmed: true,
        intent: {
          id: intent.id,
          chatId: intent.chatId,
          fromName: intent.fromName,
          toName: intent.toName,
          amountBaseUnits: intent.amountBaseUnits,
          reference: intent.reference,
          recipientWallet: intent.recipientWallet,
          senderWallet: intent.senderWallet,
          tokenMint: intent.tokenMint,
          expiresAt: intent.expiresAt
        }
      };
    }

    await tx.paymentIntent.update({
      where: { id: intent.id },
      data: {
        status: "confirmed",
        txSignature: input.txSignature,
        confirmedAt: new Date()
      }
    });

    const balanceKey = {
      chatId_fromParticipant_toParticipant: {
        chatId: intent.chatId,
        fromParticipant: intent.fromName,
        toParticipant: intent.toName
      }
    };

    const existing = await tx.balance.findUnique({ where: balanceKey });

    if (existing !== null && existing.amountBaseUnits > 0n) {
      const remaining = existing.amountBaseUnits - intent.amountBaseUnits;
      if (remaining <= 0n) {
        await tx.balance.delete({ where: balanceKey });
      } else {
        await tx.balance.update({
          where: balanceKey,
          data: { amountBaseUnits: remaining }
        });
      }
    }

    return {
      alreadyConfirmed: false,
      intent: {
        id: intent.id,
        chatId: intent.chatId,
        fromName: intent.fromName,
        toName: intent.toName,
        amountBaseUnits: intent.amountBaseUnits,
        reference: intent.reference,
        recipientWallet: intent.recipientWallet,
        senderWallet: intent.senderWallet,
        tokenMint: intent.tokenMint,
        expiresAt: intent.expiresAt
      }
    };
  });
}

/**
 * Mark all expired pending intents as `expired`. Returns the count.
 * Called periodically by the watcher.
 */
export async function expirePastIntents(
  client: PrismaClient = getPrismaClient(),
  now: Date = new Date()
): Promise<number> {
  const result = await client.paymentIntent.updateMany({
    where: { status: "pending", expiresAt: { lte: now } },
    data: { status: "expired" }
  });
  return result.count;
}
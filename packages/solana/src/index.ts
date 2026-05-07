import { address } from "@solana/kit";
import { encodeURL } from "@solana/pay";
import { Keypair, PublicKey } from "@solana/web3.js";

/**
 * SplitStable Solana helpers.
 *
 * Scope: validate wallet addresses, build Solana Pay transfer URLs for
 * USDC settlement on devnet, and verify that an on-chain transaction
 * matches a given payment intent.
 *
 * Non-custodial by design: nothing here ever signs a transaction or
 * holds private keys. We only generate payment requests and read the
 * chain to confirm they were paid.
 */

export type SolanaCluster = "devnet" | "mainnet-beta";

/**
 * USDC SPL mint addresses per cluster.
 * Devnet uses the official Solana Foundation devnet faucet mint.
 */
export const USDC_MINT_ADDRESSES: Record<SolanaCluster, string> = {
  devnet: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  "mainnet-beta": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
};

/** Default public RPC URLs per cluster. Override via env in production. */
export const DEFAULT_RPC_URLS: Record<SolanaCluster, string> = {
  devnet: "https://api.devnet.solana.com",
  "mainnet-beta": "https://api.mainnet-beta.solana.com"
};

/**
 * Validate and normalize a Solana base58 wallet address.
 * Throws a friendly error if the input is not a valid Ed25519 public key.
 */
export function assertValidSolanaAddress(rawAddress: string): string {
  const address = rawAddress.trim();

  if (address.length === 0) {
    throw new Error("Wallet address is required");
  }

  let parsed: PublicKey;
  try {
    parsed = new PublicKey(address);
  } catch {
    throw new Error("That does not look like a valid Solana wallet address");
  }

  if (!PublicKey.isOnCurve(parsed.toBytes())) {
    throw new Error(
      "That address is not on the Ed25519 curve. Use a regular Solana wallet (Phantom, Solflare, etc.)"
    );
  }

  return parsed.toBase58();
}

/** Render a wallet address as a short, user-friendly preview. */
export function shortenAddress(address: string): string {
  if (address.length <= 8) {
    return address;
  }
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

const USDC_DECIMALS = 6;
const USDC_BASE_UNITS_PER_TOKEN = 10 ** USDC_DECIMALS;

/**
 * Convert USDC base units (BigInt) to a JS number of whole USDC.
 *
 * Solana Pay's `encodeURL` takes a plain `number` for `amount`. Real
 * settlement amounts are tiny (well under MAX_SAFE_INTEGER / 1e6), so
 * the precision risk is negligible. We still guard against overflow.
 */
function baseUnitsToUsdcNumber(amountBaseUnits: bigint): number {
  if (amountBaseUnits > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("USDC amount too large to encode in a Solana Pay URL");
  }
  return Number(amountBaseUnits) / USDC_BASE_UNITS_PER_TOKEN;
}

/**
 * Generate a fresh Solana Pay reference key (a base58 public key
 * that has no role on chain except to "tag" the transfer so we can
 * find it again when verifying). Each payment intent gets a new one.
 */
export function generatePaymentReference(): string {
  return Keypair.generate().publicKey.toBase58();
}

export type CreateUsdcTransferUrlInput = {
  recipientWallet: string;
  amountBaseUnits: bigint;
  reference: string;
  cluster: SolanaCluster;
  /** Short label shown by wallets, e.g. "SplitStable". */
  label?: string;
  /** Longer message shown by wallets, e.g. "Pay Julia for dinner". */
  message?: string;
  /** Memo recorded on chain (visible in explorers). */
  memo?: string;
};

/**
 * Build a Solana Pay transfer-request URL for a USDC settlement.
 *
 * Returns a `solana:` URL string suitable for pasting into Telegram
 * or rendering as a QR code. Wallets that support Solana Pay
 * (Phantom, Solflare, Backpack, …) will open it directly into a
 * pre-filled USDC transfer screen.
 */
export function createUsdcTransferUrl(input: CreateUsdcTransferUrlInput): string {
  const recipient = address(input.recipientWallet);
  const reference = address(input.reference);
  const splToken = address(USDC_MINT_ADDRESSES[input.cluster]);
  const amount = baseUnitsToUsdcNumber(input.amountBaseUnits);

  const url = encodeURL({
    recipient,
    amount,
    reference: [reference],
    splToken,
    label: input.label,
    message: input.message,
    memo: input.memo
  });

  return url.toString();
}

export type SolanaPayConfig = {
  cluster: SolanaCluster;
  rpcUrl: string;
  usdcMint: string;
};

/**
 * Resolve the cluster + RPC URL + USDC mint to use, based on env vars.
 * Defaults to public devnet if nothing is configured.
 */
export function resolveSolanaPayConfig(env: NodeJS.ProcessEnv = process.env): SolanaPayConfig {
  const rawCluster = (env.SOLANA_CLUSTER ?? "devnet").trim() as SolanaCluster;
  const cluster: SolanaCluster =
    rawCluster === "mainnet-beta" ? "mainnet-beta" : "devnet";

  const rpcUrl = env.SOLANA_RPC_URL?.trim() || DEFAULT_RPC_URLS[cluster];
  const usdcMint = env.USDC_MINT?.trim() || USDC_MINT_ADDRESSES[cluster];

  return { cluster, rpcUrl, usdcMint };
}

export type VerifyPaymentInput = {
  rpcUrl: string;
  /** Reference key embedded in the original Solana Pay URL. */
  reference: string;
  expectedRecipient: string;
  expectedTokenMint: string;
  expectedAmountBaseUnits: bigint;
};

export type VerifyPaymentResult =
  | { status: "not-found" }
  | { status: "confirmed"; signature: string }
  | { status: "mismatch"; signature: string; reason: string };

/**
 * Look for a confirmed transaction tagged with `reference` and verify
 * that it actually transfers the expected amount of the expected SPL
 * token to the expected recipient.
 *
 * Returns { status: "not-found" } when the chain has no transaction
 * referencing this key yet (the normal pending state).
 *
 * Returns { status: "confirmed", signature } only when the transfer is
 * fully validated. The bot uses this signal to update the ledger.
 *
 * Returns { status: "mismatch", reason } when a tx exists but does not
 * match the intent (wrong recipient, wrong mint, wrong amount). The bot
 * surfaces this so users know something is off without auto-clearing.
 */
export async function verifyUsdcPayment(
  input: VerifyPaymentInput
): Promise<VerifyPaymentResult> {
  const { Connection, PublicKey: Web3PublicKey } = await import("@solana/web3.js");
  const connection = new Connection(input.rpcUrl, "confirmed");
  const referencePk = new Web3PublicKey(input.reference);

  const signatures = await connection.getSignaturesForAddress(
    referencePk,
    { limit: 5 },
    "confirmed"
  );

  if (signatures.length === 0) {
    return { status: "not-found" };
  }

  for (const sig of signatures) {
    if (sig.err !== null) {
      continue;
    }

    const tx = await connection.getParsedTransaction(sig.signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed"
    });

    if (tx === null) {
      continue;
    }

    const instructions = tx.transaction.message.instructions;

    for (const ix of instructions) {
      if (!("parsed" in ix)) continue;
      const parsedIx = ix as { program?: string; parsed?: { type?: string; info?: Record<string, unknown> } };
      if (parsedIx.program !== "spl-token") continue;
      const parsedType = parsedIx.parsed?.type;
      if (parsedType !== "transferChecked" && parsedType !== "transfer") continue;

      const info = parsedIx.parsed?.info ?? {};
      const mint = typeof info.mint === "string" ? info.mint : undefined;
      const destinationOwner =
        typeof info.destination === "string"
          ? info.destination
          : typeof (info as { destinationOwner?: string }).destinationOwner === "string"
            ? (info as { destinationOwner?: string }).destinationOwner
            : undefined;

      const tokenAmountInfo = (info as { tokenAmount?: { amount?: string; decimals?: number } }).tokenAmount;
      const rawAmount =
        typeof info.amount === "string"
          ? info.amount
          : typeof tokenAmountInfo?.amount === "string"
            ? tokenAmountInfo.amount
            : undefined;

      if (rawAmount === undefined) continue;

      let actualBaseUnits: bigint;
      try {
        actualBaseUnits = BigInt(rawAmount);
      } catch {
        continue;
      }

      const tokenOK =
        mint === input.expectedTokenMint || (parsedType === "transfer" && mint === undefined);
      const amountOK = actualBaseUnits === input.expectedAmountBaseUnits;

      const recipientOK = await recipientMatches(
        connection,
        destinationOwner,
        input.expectedRecipient,
        input.expectedTokenMint
      );

      if (tokenOK && amountOK && recipientOK) {
        return { status: "confirmed", signature: sig.signature };
      }

      const reasons: string[] = [];
      if (!tokenOK) reasons.push(`mint=${mint ?? "unknown"}`);
      if (!amountOK)
        reasons.push(`amount=${rawAmount} (expected ${input.expectedAmountBaseUnits.toString()})`);
      if (!recipientOK) reasons.push(`recipient=${destinationOwner ?? "unknown"}`);

      return {
        status: "mismatch",
        signature: sig.signature,
        reason: reasons.join(", ")
      };
    }
  }

  return { status: "not-found" };
}

/**
 * Confirm that the destination token account in a parsed instruction
 * is owned by the expected recipient wallet. Solana Pay transfers go
 * to the recipient's *associated token account*, not their main wallet
 * pubkey, so we have to dereference the account owner.
 */
async function recipientMatches(
  connection: import("@solana/web3.js").Connection,
  destinationAccount: string | undefined,
  expectedRecipientWallet: string,
  expectedMint: string
): Promise<boolean> {
  if (destinationAccount === undefined) return false;
  if (destinationAccount === expectedRecipientWallet) return true;

  const { PublicKey: Web3PublicKey } = await import("@solana/web3.js");
  const accountInfo = await connection.getParsedAccountInfo(
    new Web3PublicKey(destinationAccount)
  );
  const data = accountInfo.value?.data;
  if (data === undefined || data === null || !("parsed" in data)) {
    return false;
  }
  const parsed = (data as { parsed?: { info?: { owner?: string; mint?: string } } }).parsed;
  return parsed?.info?.owner === expectedRecipientWallet && parsed?.info?.mint === expectedMint;
}

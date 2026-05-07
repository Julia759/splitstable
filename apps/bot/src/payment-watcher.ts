import type { Bot } from "grammy";
import { formatUsdcFromBaseUnits } from "@splitstable/split-engine";
import {
  resolveSolanaPayConfig,
  verifyUsdcPayment,
  type SolanaPayConfig
} from "@splitstable/solana";
import {
  confirmPaymentIntent,
  expirePastIntents,
  listPendingPaymentIntents,
  type PendingPaymentIntent
} from "@splitstable/database";

/**
 * Background poller that finalises Solana Pay settlements.
 *
 * Every `pollIntervalMs`:
 *  1. Mark expired pending intents as `expired`.
 *  2. Fetch all still-pending intents.
 *  3. For each one, ask the chain (via Solana RPC) whether a tx
 *     tagged with the intent's reference key has confirmed.
 *  4. If yes, validate amount/mint/recipient match, then
 *     atomically mark the intent confirmed AND reduce the ledger.
 *  5. Notify the Telegram chat that the settlement is complete.
 *
 * This is intentionally a single-process poller. For scale we'd move
 * to a queue + Helius webhooks, but for the demo SQLite + polling is
 * the simplest thing that works on Railway.
 */

export type PaymentWatcherOptions = {
  bot: Bot;
  pollIntervalMs?: number;
  config?: SolanaPayConfig;
};

const DEFAULT_POLL_INTERVAL_MS = 15_000;

export class PaymentWatcher {
  private timer: NodeJS.Timeout | null = null;
  private readonly bot: Bot;
  private readonly pollIntervalMs: number;
  private readonly config: SolanaPayConfig;
  private running = false;

  constructor(options: PaymentWatcherOptions) {
    this.bot = options.bot;
    this.pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
    this.config = options.config ?? resolveSolanaPayConfig();
  }

  start(): void {
    if (this.timer !== null) return;
    console.log(
      `Payment watcher started (cluster=${this.config.cluster}, interval=${this.pollIntervalMs}ms)`
    );
    this.timer = setInterval(() => {
      void this.tick();
    }, this.pollIntervalMs);
  }

  async stop(): Promise<void> {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    while (this.running) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  /** Run a single poll cycle. Exposed for tests. */
  async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      await expirePastIntents();
      const pending = await listPendingPaymentIntents();
      for (const intent of pending) {
        try {
          await this.verifyAndFinalise(intent);
        } catch (error) {
          console.error(`Watcher error on intent ${intent.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Watcher tick failed:", error);
    } finally {
      this.running = false;
    }
  }

  private async verifyAndFinalise(intent: PendingPaymentIntent): Promise<void> {
    const result = await verifyUsdcPayment({
      rpcUrl: this.config.rpcUrl,
      reference: intent.reference,
      expectedRecipient: intent.recipientWallet,
      expectedTokenMint: intent.tokenMint,
      expectedAmountBaseUnits: intent.amountBaseUnits
    });

    if (result.status === "not-found") return;

    if (result.status === "mismatch") {
      console.warn(
        `Intent ${intent.id} mismatch (sig ${result.signature}): ${result.reason}`
      );
      return;
    }

    const confirmation = await confirmPaymentIntent({
      intentId: intent.id,
      txSignature: result.signature
    });

    if (confirmation.alreadyConfirmed) return;

    const amount = formatUsdcFromBaseUnits(intent.amountBaseUnits);
    const explorer = explorerUrl(result.signature, this.config.cluster);
    const message = [
      `On-chain settlement confirmed.`,
      `${capitalize(intent.fromName)} paid ${capitalize(intent.toName)} ${amount} USDC.`,
      `Tx: ${explorer}`
    ].join("\n");

    try {
      await this.bot.api.sendMessage(Number(intent.chatId), message, {
        link_preview_options: { is_disabled: true }
      });
    } catch (error) {
      console.error(`Failed to notify chat ${intent.chatId}:`, error);
    }
  }
}

function capitalize(name: string): string {
  if (name.length === 0) return name;
  return name[0].toUpperCase() + name.slice(1);
}

function explorerUrl(signature: string, cluster: string): string {
  const clusterParam = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`;
  return `https://explorer.solana.com/tx/${signature}${clusterParam}`;
}

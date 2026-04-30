import { pathToFileURL } from "node:url";
import { Bot } from "grammy";
import { formatUsdcFromBaseUnits } from "@splitstable/split-engine";
import {
  getBalances,
  getPrismaClient,
  recordSplit,
  type PersistedBalance,
  type RecordSplitResult
} from "@splitstable/database";

const DEMO_PARTICIPANTS = ["me", "anna", "max", "leo"];

export type ParsedSplitCommand = {
  amount: string;
  token: "USDC";
  description: string;
};

export function createDemoParticipantNames(payerName: string): string[] {
  if (DEMO_PARTICIPANTS.includes(payerName)) {
    return [payerName, ...DEMO_PARTICIPANTS.filter((participantName) => participantName !== payerName)];
  }

  return [payerName, ...DEMO_PARTICIPANTS.filter((participantName) => participantName !== "me")];
}

export function parseSplitCommand(text: string): ParsedSplitCommand {
  const match = /^\/split(?:@\w+)?\s+(\S+)\s+(\S+)\s+(.+)$/i.exec(text.trim());

  if (!match) {
    throw new Error("Use /split 50 USDC dinner");
  }

  const [, amount, token, rawDescription] = match;

  if (token.toUpperCase() !== "USDC") {
    throw new Error("For the MVP, only USDC splits are supported");
  }

  const description = rawDescription.trim();

  if (description.length === 0) {
    throw new Error("Add a short description, like dinner or groceries");
  }

  return {
    amount,
    token: "USDC",
    description
  };
}

export function createSplitReply(result: RecordSplitResult): string {
  const total = formatUsdcFromBaseUnits(result.amountBaseUnits);
  const everyoneShare = formatUsdcFromBaseUnits(result.shares[0]?.shareBaseUnits ?? 0n);

  const lines = [
    `${result.description}: ${total} ${result.token}`,
    `Everyone owes: ${everyoneShare} ${result.token}`,
    "",
    `Paid by ${result.payerName}`,
    ...result.splitBalances.map(
      (balance) =>
        `${balance.fromParticipant} owes ${formatUsdcFromBaseUnits(balance.amountBaseUnits)} ${result.token}`
    ),
    "",
    "[Demo only - wallet payments coming next]"
  ];

  return lines.join("\n");
}

export function createBalancesReply(balances: PersistedBalance[]): string {
  if (balances.length === 0) {
    return "No balances yet. Create a demo split with /split 50 USDC dinner.";
  }

  return [
    "Current demo balances for this chat:",
    ...balances.map(
      (balance) =>
        `${balance.fromParticipant} owes ${formatUsdcFromBaseUnits(balance.amountBaseUnits)} USDC to ${balance.toParticipant}`
    ),
    "",
    "Demo only: wallet payments and real settlement are coming next."
  ].join("\n");
}

export function createSplitStableBot(token: string): Bot {
  const bot = new Bot(token);

  bot.command("start", async (ctx) => {
    await ctx.reply(
      [
        "SplitStable turns Telegram group expenses into USDC settlement on Solana.",
        "",
        "Try:",
        "/split 50 USDC dinner",
        "",
        "MVP status: split tracking works locally. Wallet payments come next."
      ].join("\n")
    );
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      [
        "Commands:",
        "/start - intro",
        "/help - command list",
        "/split 50 USDC dinner - create a demo equal split",
        "/balances - show outstanding demo balances for this chat",
        "",
        "For now, the bot uses the payer plus demo members: anna, max, leo.",
        "Balances are stored locally so they survive bot restarts."
      ].join("\n")
    );
  });

  bot.command("split", async (ctx) => {
    try {
      const parsed = parseSplitCommand(ctx.message?.text ?? "");
      const payerName = ctx.from?.first_name?.toLowerCase() ?? "me";
      const participantNames = createDemoParticipantNames(payerName);
      const chatId = ctx.chat?.id;

      if (chatId === undefined) {
        await ctx.reply("Could not identify this Telegram chat.");
        return;
      }

      const result = await recordSplit({
        chatId,
        description: parsed.description,
        amount: parsed.amount,
        payerName,
        participantNames
      });

      await ctx.reply(createSplitReply(result));
    } catch (error) {
      await ctx.reply(error instanceof Error ? error.message : "Could not create split");
    }
  });

  bot.command("balances", async (ctx) => {
    const chatId = ctx.chat?.id;

    if (chatId === undefined) {
      await ctx.reply("Could not identify this Telegram chat.");
      return;
    }

    try {
      const balances = await getBalances(chatId);
      await ctx.reply(createBalancesReply(balances));
    } catch (error) {
      await ctx.reply(error instanceof Error ? error.message : "Could not load balances");
    }
  });

  bot.catch((error) => {
    console.error("Bot error", error);
  });

  return bot;
}

export async function startBot(): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN. Add it to .env before running the bot.");
  }

  const bot = createSplitStableBot(token);
  const prisma = getPrismaClient();

  const shutdown = async (signal: NodeJS.Signals) => {
    console.log(`Received ${signal}, stopping SplitStable bot...`);
    await bot.stop();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  await bot.start({
    onStart: (botInfo) => {
      console.log(`SplitStable bot is running as @${botInfo.username}`);
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startBot().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

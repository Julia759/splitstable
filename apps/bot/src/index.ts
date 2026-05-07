import { pathToFileURL } from "node:url";
import { Bot, InputFile } from "grammy";
import QRCode from "qrcode";
import { formatUsdcFromBaseUnits } from "@splitstable/split-engine";
import { shortenAddress } from "@splitstable/solana";
import { PaymentWatcher } from "./payment-watcher.js";
import {
  addMember,
  createPaymentIntent,
  getBalances,
  getMember,
  getPrismaClient,
  listMembers,
  recordSettlement,
  recordSplit,
  removeMember,
  setMemberWallet,
  type CreatedPaymentIntent,
  type Member,
  type PersistedBalance,
  type RecordSettlementResult,
  type RecordSplitResult
} from "@splitstable/database";

export type ParsedSplitCommand = {
  amount: string;
  token: "USDC";
  description: string;
};

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

export function parseSingleArgCommand(commandName: string, text: string): string {
  const pattern = new RegExp(`^/${commandName}(?:@\\w+)?\\s+(.+)$`, "i");
  const match = pattern.exec(text.trim());

  if (!match) {
    throw new Error(`Use /${commandName} <name>`);
  }

  return match[1].trim();
}

export type ParsedSettleCommand = {
  counterpartyName: string;
  amount?: string;
};

export function parseSettleCommand(text: string): ParsedSettleCommand {
  const match = /^\/settle(?:@\w+)?\s+(\S+)(?:\s+(\S+)(?:\s+(\S+))?)?$/i.exec(text.trim());

  if (!match) {
    throw new Error("Use /settle <name> [amount]. Example: /settle Tom 10");
  }

  const [, counterpartyName, amount, token] = match;

  if (token !== undefined && token.toUpperCase() !== "USDC") {
    throw new Error("For the MVP, only USDC settlements are supported");
  }

  return { counterpartyName, amount };
}

function buildDisplayMap(members: Member[]): Map<string, string> {
  return new Map(members.map((member) => [member.name, member.displayName]));
}

function display(displayMap: Map<string, string>, name: string): string {
  return displayMap.get(name) ?? name;
}

export function createSplitReply(result: RecordSplitResult, members: Member[]): string {
  const displayMap = buildDisplayMap(members);
  const total = formatUsdcFromBaseUnits(result.amountBaseUnits);
  const everyoneShare = formatUsdcFromBaseUnits(result.shares[0]?.shareBaseUnits ?? 0n);

  const lines = [
    `${result.description}: ${total} ${result.token}`,
    `Everyone owes: ${everyoneShare} ${result.token}`,
    "",
    `Paid by ${display(displayMap, result.payerName)}`,
    ...result.splitBalances.map(
      (balance) =>
        `${display(displayMap, balance.fromParticipant)} owes ${formatUsdcFromBaseUnits(balance.amountBaseUnits)} ${result.token}`
    ),
    "",
    "[Demo only - wallet payments coming next]"
  ];

  return lines.join("\n");
}

export function createBalancesReply(balances: PersistedBalance[], members: Member[]): string {
  if (balances.length === 0) {
    return "No balances yet. Add members with /addmember <name>, then /split 50 USDC dinner.";
  }

  const displayMap = buildDisplayMap(members);

  return [
    "Current demo balances for this chat:",
    ...balances.map(
      (balance) =>
        `${display(displayMap, balance.fromParticipant)} owes ${formatUsdcFromBaseUnits(balance.amountBaseUnits)} USDC to ${display(displayMap, balance.toParticipant)}`
    ),
    "",
    "Demo only: wallet payments and real settlement are coming next."
  ].join("\n");
}

export function createSettleReply(
  result: RecordSettlementResult,
  members: Member[]
): string {
  const displayMap = buildDisplayMap(members);
  const fromName = display(displayMap, result.fromParticipant);
  const toName = display(displayMap, result.toParticipant);
  const settled = formatUsdcFromBaseUnits(result.settledBaseUnits);

  if (result.fullSettlement) {
    return [
      `Settled: ${fromName} paid ${toName} ${settled} USDC.`,
      `${fromName} and ${toName} are even.`,
      "",
      "[Demo only - no real funds moved]"
    ].join("\n");
  }

  const remaining = formatUsdcFromBaseUnits(result.remainingBaseUnits);
  return [
    `Settled: ${fromName} paid ${toName} ${settled} USDC.`,
    `${fromName} still owes ${toName} ${remaining} USDC.`,
    "",
    "[Demo only - no real funds moved]"
  ].join("\n");
}

export function createMembersReply(members: Member[]): string {
  if (members.length === 0) {
    return "No members yet. Add one with /addmember <name>.";
  }

  return [
    `Members (${members.length}):`,
    ...members.map((member) => {
      const walletNote = member.walletAddress
        ? `wallet ${shortenAddress(member.walletAddress)}`
        : "no wallet";
      return `- ${member.displayName} (${walletNote})`;
    }),
    "",
    "Add more with /addmember <name>. Remove with /removemember <name>.",
    "Each member can run /setwallet <address> to enable on-chain settlement."
  ].join("\n");
}

export function createWalletReply(member: Member): string {
  if (member.walletAddress === null) {
    return "No wallet linked yet. Run /setwallet <address> to link your Solana wallet.";
  }
  return [
    `${member.displayName} → ${member.walletAddress}`,
    "",
    "Use /setwallet <address> to change it."
  ].join("\n");
}

export function createSetWalletReply(
  member: Member,
  newlyLinked: boolean
): string {
  const verb = newlyLinked ? "Linked" : "Updated";
  return [
    `${verb} wallet for ${member.displayName}.`,
    `Address: ${member.walletAddress}`,
    "",
    "On-chain USDC settlement (devnet) will activate once your counterparty also runs /setwallet."
  ].join("\n");
}

export function createPaymentIntentReply(
  intent: CreatedPaymentIntent,
  members: Member[]
): string {
  const displayMap = buildDisplayMap(members);
  const fromName = display(displayMap, intent.fromName);
  const toName = display(displayMap, intent.toName);
  const amount = formatUsdcFromBaseUnits(intent.amountBaseUnits);
  const minutes = Math.max(
    1,
    Math.round((intent.expiresAt.getTime() - Date.now()) / 60000)
  );

  return [
    `Payment request: ${fromName} → ${toName}, ${amount} USDC (${intent.cluster}).`,
    "",
    `${fromName}, open this in your wallet to pay:`,
    intent.paymentUrl,
    "",
    `Recipient: ${shortenAddress(intent.recipientWallet)}`,
    `Expires in ~${minutes} min. The bot will detect your payment automatically.`
  ].join("\n");
}

export function createSplitStableBot(token: string): Bot {
  const bot = new Bot(token);

  bot.command("start", async (ctx) => {
    await ctx.reply(
      [
        "SplitStable turns Telegram group expenses into USDC settlement on Solana.",
        "",
        "Quick start:",
        "1. /setwallet <your Solana address>",
        "2. /addmember Tom",
        "3. /split 30 USDC dinner",
        "4. /balances",
        "5. /settle Tom 10",
        "",
        "If both you and the counterparty have linked wallets, /settle creates a real Solana Pay USDC request (devnet) — pay it from Phantom and the bot auto-clears the debt.",
        "",
        "If wallets are missing, /settle still works as a demo ledger update."
      ].join("\n")
    );
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      [
        "Commands:",
        "/start - intro",
        "/help - this list",
        "/addmember <name> - add someone to this chat",
        "/removemember <name> - remove a member (only if they have no balance)",
        "/members - list current chat members and their wallets",
        "/setwallet <address> - link your Solana wallet for on-chain settlement",
        "/wallet - show your linked wallet address",
        "/split 30 USDC dinner - create an equal split among all members",
        "/balances - show outstanding demo balances for this chat",
        "/settle <name> [amount] - mark a debt paid (full or partial)",
        "",
        "The person who runs /split is auto-added as a member.",
        "All data is stored locally and survives restarts."
      ].join("\n")
    );
  });

  bot.command("addmember", async (ctx) => {
    const chatId = ctx.chat?.id;

    if (chatId === undefined) {
      await ctx.reply("Could not identify this Telegram chat.");
      return;
    }

    try {
      const rawName = parseSingleArgCommand("addmember", ctx.message?.text ?? "");
      const result = await addMember(chatId, rawName);
      const members = await listMembers(chatId);
      const verb = result.alreadyExisted ? "is already a member" : "added";
      await ctx.reply(
        [
          `${result.member.displayName} ${verb}.`,
          `Members (${members.length}): ${members.map((m) => m.displayName).join(", ")}`
        ].join("\n")
      );
    } catch (error) {
      await ctx.reply(error instanceof Error ? error.message : "Could not add member");
    }
  });

  bot.command("removemember", async (ctx) => {
    const chatId = ctx.chat?.id;

    if (chatId === undefined) {
      await ctx.reply("Could not identify this Telegram chat.");
      return;
    }

    try {
      const rawName = parseSingleArgCommand("removemember", ctx.message?.text ?? "");
      const removed = await removeMember(chatId, rawName);
      const members = await listMembers(chatId);
      const remaining =
        members.length === 0
          ? "No members left. Add one with /addmember <name>."
          : `Members (${members.length}): ${members.map((m) => m.displayName).join(", ")}`;
      await ctx.reply(`Removed ${removed.displayName}.\n${remaining}`);
    } catch (error) {
      await ctx.reply(error instanceof Error ? error.message : "Could not remove member");
    }
  });

  bot.command("setwallet", async (ctx) => {
    const chatId = ctx.chat?.id;

    if (chatId === undefined) {
      await ctx.reply("Could not identify this Telegram chat.");
      return;
    }

    try {
      const rawAddress = parseSingleArgCommand("setwallet", ctx.message?.text ?? "");
      const senderDisplayName = ctx.from?.first_name ?? "me";
      const result = await setMemberWallet({
        chatId,
        senderDisplayName,
        walletAddress: rawAddress
      });
      await ctx.reply(createSetWalletReply(result.member, result.newlyLinked));
    } catch (error) {
      await ctx.reply(error instanceof Error ? error.message : "Could not link wallet");
    }
  });

  bot.command("wallet", async (ctx) => {
    const chatId = ctx.chat?.id;

    if (chatId === undefined) {
      await ctx.reply("Could not identify this Telegram chat.");
      return;
    }

    try {
      const senderDisplayName = ctx.from?.first_name ?? "me";
      const member = await getMember(chatId, senderDisplayName);

      if (member === null) {
        await ctx.reply(
          "You are not a member of this chat yet. Run /setwallet <address> to link your wallet and join."
        );
        return;
      }

      await ctx.reply(createWalletReply(member));
    } catch (error) {
      await ctx.reply(error instanceof Error ? error.message : "Could not load wallet");
    }
  });

  bot.command("members", async (ctx) => {
    const chatId = ctx.chat?.id;

    if (chatId === undefined) {
      await ctx.reply("Could not identify this Telegram chat.");
      return;
    }

    try {
      const members = await listMembers(chatId);
      await ctx.reply(createMembersReply(members));
    } catch (error) {
      await ctx.reply(error instanceof Error ? error.message : "Could not load members");
    }
  });

  bot.command("split", async (ctx) => {
    const chatId = ctx.chat?.id;

    if (chatId === undefined) {
      await ctx.reply("Could not identify this Telegram chat.");
      return;
    }

    try {
      const parsed = parseSplitCommand(ctx.message?.text ?? "");
      const payerDisplayName = ctx.from?.first_name ?? "me";

      const result = await recordSplit({
        chatId,
        description: parsed.description,
        amount: parsed.amount,
        payerDisplayName
      });

      const members = await listMembers(chatId);
      await ctx.reply(createSplitReply(result, members));
    } catch (error) {
      await ctx.reply(error instanceof Error ? error.message : "Could not create split");
    }
  });

  bot.command("settle", async (ctx) => {
    const chatId = ctx.chat?.id;

    if (chatId === undefined) {
      await ctx.reply("Could not identify this Telegram chat.");
      return;
    }

    try {
      const parsed = parseSettleCommand(ctx.message?.text ?? "");
      const senderDisplayName = ctx.from?.first_name ?? "me";

      const [sender, counterparty] = await Promise.all([
        getMember(chatId, senderDisplayName),
        getMember(chatId, parsed.counterpartyName)
      ]);

      const bothWalletsLinked =
        sender !== null &&
        counterparty !== null &&
        sender.walletAddress !== null &&
        counterparty.walletAddress !== null;

      if (bothWalletsLinked) {
        const intent = await createPaymentIntent({
          chatId,
          senderDisplayName,
          counterpartyRawName: parsed.counterpartyName,
          amount: parsed.amount
        });
        const members = await listMembers(chatId);
        const caption = createPaymentIntentReply(intent, members);
        const qrPng = await QRCode.toBuffer(intent.paymentUrl, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 512
        });
        await ctx.replyWithPhoto(new InputFile(qrPng, "payment-qr.png"), {
          caption
        });
        return;
      }

      const result = await recordSettlement({
        chatId,
        senderDisplayName,
        counterpartyRawName: parsed.counterpartyName,
        amount: parsed.amount
      });

      const members = await listMembers(chatId);
      await ctx.reply(createSettleReply(result, members));
    } catch (error) {
      await ctx.reply(error instanceof Error ? error.message : "Could not settle");
    }
  });

  bot.command("balances", async (ctx) => {
    const chatId = ctx.chat?.id;

    if (chatId === undefined) {
      await ctx.reply("Could not identify this Telegram chat.");
      return;
    }

    try {
      const [balances, members] = await Promise.all([
        getBalances(chatId),
        listMembers(chatId)
      ]);
      await ctx.reply(createBalancesReply(balances, members));
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
  const watcher = new PaymentWatcher({ bot });

  const shutdown = async (signal: NodeJS.Signals) => {
    console.log(`Received ${signal}, stopping SplitStable bot...`);
    await watcher.stop();
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

  watcher.start();

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

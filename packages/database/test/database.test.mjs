import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { createPrismaClient, getBalances, recordSplit } from "../dist/index.js";

const prisma = createPrismaClient();

before(async () => {
  await prisma.$connect();
});

after(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Order matters: child rows first to satisfy foreign keys.
  await prisma.expenseParticipant.deleteMany();
  await prisma.balance.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.telegramChat.deleteMany();
});

describe("recordSplit", () => {
  it("persists an expense and its participant shares", async () => {
    const result = await recordSplit(
      {
        chatId: 1001n,
        description: "dinner",
        amount: "50",
        payerName: "me",
        participantNames: ["me", "anna", "max", "leo"]
      },
      prisma
    );

    assert.equal(result.token, "USDC");
    assert.equal(result.amountBaseUnits, 50_000_000n);
    assert.equal(result.shares.length, 4);
    assert.deepEqual(
      result.shares.map((share) => [share.participantName, share.shareBaseUnits]),
      [
        ["me", 12_500_000n],
        ["anna", 12_500_000n],
        ["max", 12_500_000n],
        ["leo", 12_500_000n]
      ]
    );

    const expense = await prisma.expense.findUniqueOrThrow({
      where: { id: result.expenseId },
      include: { participants: true }
    });
    assert.equal(expense.description, "dinner");
    assert.equal(expense.payerName, "me");
    assert.equal(expense.participants.length, 4);
  });

  it("creates running balances that survive across multiple splits", async () => {
    await recordSplit(
      {
        chatId: 2002n,
        description: "dinner",
        amount: "50",
        payerName: "me",
        participantNames: ["me", "anna", "max", "leo"]
      },
      prisma
    );

    await recordSplit(
      {
        chatId: 2002n,
        description: "groceries",
        amount: "20",
        payerName: "me",
        participantNames: ["me", "anna", "max", "leo"]
      },
      prisma
    );

    const balances = await getBalances(2002n, prisma);
    assert.equal(balances.length, 3);
    for (const balance of balances) {
      assert.equal(balance.toParticipant, "me");
      assert.equal(balance.amountBaseUnits, 17_500_000n);
    }
  });

  it("nets offsetting balances when the payer flips", async () => {
    await recordSplit(
      {
        chatId: 3003n,
        description: "dinner",
        amount: "20",
        payerName: "me",
        participantNames: ["me", "anna"]
      },
      prisma
    );

    let balances = await getBalances(3003n, prisma);
    assert.equal(balances.length, 1);
    assert.equal(balances[0].fromParticipant, "anna");
    assert.equal(balances[0].toParticipant, "me");
    assert.equal(balances[0].amountBaseUnits, 10_000_000n);

    await recordSplit(
      {
        chatId: 3003n,
        description: "coffee",
        amount: "4",
        payerName: "anna",
        participantNames: ["me", "anna"]
      },
      prisma
    );

    balances = await getBalances(3003n, prisma);
    assert.equal(balances.length, 1);
    assert.equal(balances[0].fromParticipant, "anna");
    assert.equal(balances[0].toParticipant, "me");
    assert.equal(balances[0].amountBaseUnits, 8_000_000n);
  });

  it("clears the balance row when debts cancel exactly", async () => {
    await recordSplit(
      {
        chatId: 4004n,
        description: "dinner",
        amount: "10",
        payerName: "me",
        participantNames: ["me", "anna"]
      },
      prisma
    );

    await recordSplit(
      {
        chatId: 4004n,
        description: "coffee",
        amount: "10",
        payerName: "anna",
        participantNames: ["me", "anna"]
      },
      prisma
    );

    const balances = await getBalances(4004n, prisma);
    assert.equal(balances.length, 0);
  });

  it("isolates balances per Telegram chat", async () => {
    await recordSplit(
      {
        chatId: 5005n,
        description: "dinner",
        amount: "10",
        payerName: "me",
        participantNames: ["me", "anna"]
      },
      prisma
    );

    const otherChat = await getBalances(9999n, prisma);
    assert.equal(otherChat.length, 0);

    const sameChat = await getBalances(5005n, prisma);
    assert.equal(sameChat.length, 1);
  });

  it("rejects unsupported amounts via the split engine", async () => {
    await assert.rejects(
      () =>
        recordSplit(
          {
            chatId: 6006n,
            description: "dinner",
            amount: "0",
            payerName: "me",
            participantNames: ["me", "anna"]
          },
          prisma
        ),
      /greater than zero/
    );
  });
});

describe("getBalances", () => {
  it("returns an empty list for a chat with no expenses", async () => {
    const balances = await getBalances(7007n, prisma);
    assert.deepEqual(balances, []);
  });
});

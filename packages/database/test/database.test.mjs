import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import {
  addMember,
  createPrismaClient,
  getBalances,
  listMembers,
  recordSplit,
  removeMember
} from "../dist/index.js";

const prisma = createPrismaClient();

before(async () => {
  await prisma.$connect();
});

after(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.expenseParticipant.deleteMany();
  await prisma.balance.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.chatMember.deleteMany();
  await prisma.telegramChat.deleteMany();
});

async function seedMembers(chatId, names) {
  for (const name of names) {
    await addMember(chatId, name, prisma);
  }
}

describe("addMember", () => {
  it("adds a new member and creates the chat if needed", async () => {
    const result = await addMember(1001n, "Tom", prisma);
    assert.equal(result.alreadyExisted, false);
    assert.equal(result.member.name, "tom");
    assert.equal(result.member.displayName, "Tom");

    const members = await listMembers(1001n, prisma);
    assert.deepEqual(
      members.map((m) => m.displayName),
      ["Tom"]
    );
  });

  it("is idempotent on duplicate canonical names", async () => {
    await addMember(1002n, "Sara", prisma);
    const second = await addMember(1002n, "sara", prisma);
    assert.equal(second.alreadyExisted, true);
    assert.equal(second.member.displayName, "Sara");

    const members = await listMembers(1002n, prisma);
    assert.equal(members.length, 1);
  });

  it("rejects empty or invalid names", async () => {
    await assert.rejects(() => addMember(1003n, "   ", prisma), /cannot be empty/);
    await assert.rejects(() => addMember(1003n, "Tom!@#", prisma), /can only contain/);
  });
});

describe("removeMember", () => {
  it("removes a member who has no balance", async () => {
    await seedMembers(2001n, ["Julia", "Tom"]);
    await removeMember(2001n, "Tom", prisma);
    const members = await listMembers(2001n, prisma);
    assert.deepEqual(
      members.map((m) => m.displayName),
      ["Julia"]
    );
  });

  it("refuses if the member has outstanding balances", async () => {
    await seedMembers(2002n, ["Julia", "Tom"]);
    await recordSplit(
      {
        chatId: 2002n,
        description: "dinner",
        amount: "10",
        payerDisplayName: "Julia"
      },
      prisma
    );
    await assert.rejects(() => removeMember(2002n, "Tom", prisma), /outstanding balances/);
  });

  it("errors when the member does not exist", async () => {
    await seedMembers(2003n, ["Julia"]);
    await assert.rejects(() => removeMember(2003n, "Ghost", prisma), /No member named/);
  });
});

describe("recordSplit", () => {
  it("auto-adds the payer if missing and uses real members", async () => {
    await seedMembers(3001n, ["Tom", "Sara"]);

    const result = await recordSplit(
      {
        chatId: 3001n,
        description: "dinner",
        amount: "30",
        payerDisplayName: "Julia"
      },
      prisma
    );

    assert.equal(result.amountBaseUnits, 30_000_000n);
    assert.equal(result.payerName, "julia");
    assert.deepEqual(result.participantNames.sort(), ["julia", "sara", "tom"]);

    const members = await listMembers(3001n, prisma);
    assert.equal(members.length, 3);

    const balances = await getBalances(3001n, prisma);
    assert.equal(balances.length, 2);
    for (const balance of balances) {
      assert.equal(balance.toParticipant, "julia");
      assert.equal(balance.amountBaseUnits, 10_000_000n);
    }
  });

  it("rejects when fewer than two members exist", async () => {
    await assert.rejects(
      () =>
        recordSplit(
          {
            chatId: 3002n,
            description: "dinner",
            amount: "10",
            payerDisplayName: "Julia"
          },
          prisma
        ),
      /at least two/i
    );
  });

  it("accumulates and nets balances across splits", async () => {
    await seedMembers(3003n, ["Julia", "Tom"]);

    await recordSplit(
      { chatId: 3003n, description: "dinner", amount: "20", payerDisplayName: "Julia" },
      prisma
    );

    let balances = await getBalances(3003n, prisma);
    assert.equal(balances.length, 1);
    assert.equal(balances[0].fromParticipant, "tom");
    assert.equal(balances[0].toParticipant, "julia");
    assert.equal(balances[0].amountBaseUnits, 10_000_000n);

    await recordSplit(
      { chatId: 3003n, description: "coffee", amount: "4", payerDisplayName: "Tom" },
      prisma
    );

    balances = await getBalances(3003n, prisma);
    assert.equal(balances.length, 1);
    assert.equal(balances[0].fromParticipant, "tom");
    assert.equal(balances[0].toParticipant, "julia");
    assert.equal(balances[0].amountBaseUnits, 8_000_000n);
  });

  it("clears the balance row when debts cancel exactly", async () => {
    await seedMembers(3004n, ["Julia", "Tom"]);

    await recordSplit(
      { chatId: 3004n, description: "dinner", amount: "10", payerDisplayName: "Julia" },
      prisma
    );
    await recordSplit(
      { chatId: 3004n, description: "coffee", amount: "10", payerDisplayName: "Tom" },
      prisma
    );

    const balances = await getBalances(3004n, prisma);
    assert.equal(balances.length, 0);
  });

  it("isolates members and balances per Telegram chat", async () => {
    await seedMembers(4001n, ["Julia", "Tom"]);
    await seedMembers(4002n, ["Anna", "Max"]);

    const julia = await listMembers(4001n, prisma);
    const anna = await listMembers(4002n, prisma);
    assert.deepEqual(julia.map((m) => m.name).sort(), ["julia", "tom"]);
    assert.deepEqual(anna.map((m) => m.name).sort(), ["anna", "max"]);
  });
});

describe("getBalances", () => {
  it("returns an empty list for a chat with no expenses", async () => {
    const balances = await getBalances(5001n, prisma);
    assert.deepEqual(balances, []);
  });
});

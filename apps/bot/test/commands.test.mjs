import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createBalancesReply, createDemoParticipantNames, createSplitReply, parseSplitCommand } from "../dist/index.js";

describe("parseSplitCommand", () => {
  it("parses the MVP split command", () => {
    assert.deepEqual(parseSplitCommand("/split 50 USDC dinner"), {
      amount: "50",
      token: "USDC",
      description: "dinner"
    });
  });

  it("supports commands addressed to the bot", () => {
    assert.deepEqual(parseSplitCommand("/split@SplitStableBot 12.50 usdc groceries"), {
      amount: "12.50",
      token: "USDC",
      description: "groceries"
    });
  });

  it("rejects unsupported tokens", () => {
    assert.throws(() => parseSplitCommand("/split 50 SOL dinner"), /only USDC/);
  });
});

describe("createDemoParticipantNames", () => {
  it("uses the payer plus demo participants without duplicates", () => {
    assert.deepEqual(createDemoParticipantNames("julia"), ["julia", "anna", "max", "leo"]);
    assert.deepEqual(createDemoParticipantNames("anna"), ["anna", "me", "max", "leo"]);
  });
});

describe("createSplitReply", () => {
  it("creates a Telegram-ready response from a persisted split result", () => {
    const result = {
      expenseId: "exp_test",
      chatId: 123n,
      description: "dinner",
      token: "USDC",
      amountBaseUnits: 50_000_000n,
      payerName: "me",
      participantNames: ["me", "anna", "max", "leo"],
      shares: [
        { participantName: "me", shareBaseUnits: 12_500_000n },
        { participantName: "anna", shareBaseUnits: 12_500_000n },
        { participantName: "max", shareBaseUnits: 12_500_000n },
        { participantName: "leo", shareBaseUnits: 12_500_000n }
      ],
      splitBalances: [
        { fromParticipant: "anna", toParticipant: "me", amountBaseUnits: 12_500_000n },
        { fromParticipant: "max", toParticipant: "me", amountBaseUnits: 12_500_000n },
        { fromParticipant: "leo", toParticipant: "me", amountBaseUnits: 12_500_000n }
      ]
    };

    assert.equal(
      createSplitReply(result),
      [
        "dinner: 50 USDC",
        "Everyone owes: 12.5 USDC",
        "",
        "Paid by me",
        "anna owes 12.5 USDC",
        "max owes 12.5 USDC",
        "leo owes 12.5 USDC",
        "",
        "[Demo only - wallet payments coming next]"
      ].join("\n")
    );
  });
});

describe("createBalancesReply", () => {
  it("explains when a chat has no balances yet", () => {
    assert.equal(createBalancesReply([]), "No balances yet. Create a demo split with /split 50 USDC dinner.");
  });

  it("formats persisted balances for the chat", () => {
    const balances = [
      { fromParticipant: "anna", toParticipant: "me", amountBaseUnits: 12_500_000n },
      { fromParticipant: "leo", toParticipant: "me", amountBaseUnits: 12_500_000n },
      { fromParticipant: "max", toParticipant: "me", amountBaseUnits: 12_500_000n }
    ];

    assert.equal(
      createBalancesReply(balances),
      [
        "Current demo balances for this chat:",
        "anna owes 12.5 USDC to me",
        "leo owes 12.5 USDC to me",
        "max owes 12.5 USDC to me",
        "",
        "Demo only: wallet payments and real settlement are coming next."
      ].join("\n")
    );
  });
});

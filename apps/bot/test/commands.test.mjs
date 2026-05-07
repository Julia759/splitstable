import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createBalancesReply,
  createMembersReply,
  createSettleReply,
  createSplitReply,
  parseSettleCommand,
  parseSingleArgCommand,
  parseSplitCommand
} from "../dist/index.js";

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

describe("parseSingleArgCommand", () => {
  it("extracts the argument for /addmember", () => {
    assert.equal(parseSingleArgCommand("addmember", "/addmember Tom"), "Tom");
    assert.equal(parseSingleArgCommand("addmember", "/addmember@SplitStableBot Sara"), "Sara");
  });

  it("trims whitespace and supports multi-word names", () => {
    assert.equal(parseSingleArgCommand("addmember", "/addmember   Anna Karenina  "), "Anna Karenina");
  });

  it("rejects empty argument", () => {
    assert.throws(() => parseSingleArgCommand("addmember", "/addmember"), /Use \/addmember/);
  });
});

const SAMPLE_MEMBERS = [
  { name: "julia", displayName: "Julia", walletAddress: null },
  { name: "tom", displayName: "Tom", walletAddress: null },
  { name: "sara", displayName: "Sara", walletAddress: null }
];

describe("createSplitReply", () => {
  it("renders display names and per-person shares", () => {
    const result = {
      expenseId: "exp_test",
      chatId: 123n,
      description: "dinner",
      token: "USDC",
      amountBaseUnits: 30_000_000n,
      payerName: "julia",
      participantNames: ["julia", "tom", "sara"],
      shares: [
        { participantName: "julia", shareBaseUnits: 10_000_000n },
        { participantName: "tom", shareBaseUnits: 10_000_000n },
        { participantName: "sara", shareBaseUnits: 10_000_000n }
      ],
      splitBalances: [
        { fromParticipant: "tom", toParticipant: "julia", amountBaseUnits: 10_000_000n },
        { fromParticipant: "sara", toParticipant: "julia", amountBaseUnits: 10_000_000n }
      ]
    };

    assert.equal(
      createSplitReply(result, SAMPLE_MEMBERS),
      [
        "dinner: 30 USDC",
        "Everyone owes: 10 USDC",
        "",
        "Paid by Julia",
        "Tom owes 10 USDC",
        "Sara owes 10 USDC",
        "",
        "[Demo only - wallet payments coming next]"
      ].join("\n")
    );
  });
});

describe("createBalancesReply", () => {
  it("explains when a chat has no balances yet", () => {
    assert.equal(
      createBalancesReply([], SAMPLE_MEMBERS),
      "No balances yet. Add members with /addmember <name>, then /split 50 USDC dinner."
    );
  });

  it("renders persisted balances using member display names", () => {
    const balances = [
      { fromParticipant: "tom", toParticipant: "julia", amountBaseUnits: 10_000_000n },
      { fromParticipant: "sara", toParticipant: "julia", amountBaseUnits: 10_000_000n }
    ];

    assert.equal(
      createBalancesReply(balances, SAMPLE_MEMBERS),
      [
        "Current demo balances for this chat:",
        "Tom owes 10 USDC to Julia",
        "Sara owes 10 USDC to Julia",
        "",
        "Demo only: wallet payments and real settlement are coming next."
      ].join("\n")
    );
  });

  it("falls back to canonical name when display map lacks it", () => {
    const balances = [
      { fromParticipant: "ghost", toParticipant: "julia", amountBaseUnits: 5_000_000n }
    ];

    assert.equal(
      createBalancesReply(balances, SAMPLE_MEMBERS),
      [
        "Current demo balances for this chat:",
        "ghost owes 5 USDC to Julia",
        "",
        "Demo only: wallet payments and real settlement are coming next."
      ].join("\n")
    );
  });
});

describe("parseSettleCommand", () => {
  it("parses /settle with just a name (full settlement)", () => {
    assert.deepEqual(parseSettleCommand("/settle Tom"), {
      counterpartyName: "Tom",
      amount: undefined
    });
  });

  it("parses /settle with a partial amount", () => {
    assert.deepEqual(parseSettleCommand("/settle Tom 5"), {
      counterpartyName: "Tom",
      amount: "5"
    });
  });

  it("accepts an explicit USDC token", () => {
    assert.deepEqual(parseSettleCommand("/settle@SplitStableBot Tom 12.50 usdc"), {
      counterpartyName: "Tom",
      amount: "12.50"
    });
  });

  it("rejects unsupported tokens", () => {
    assert.throws(() => parseSettleCommand("/settle Tom 10 SOL"), /only USDC/);
  });

  it("rejects when no name is supplied", () => {
    assert.throws(() => parseSettleCommand("/settle"), /Use \/settle/);
  });
});

describe("createSettleReply", () => {
  it("renders a full settlement", () => {
    const result = {
      fromParticipant: "tom",
      toParticipant: "julia",
      settledBaseUnits: 15_000_000n,
      remainingBaseUnits: 0n,
      fullSettlement: true
    };

    assert.equal(
      createSettleReply(result, SAMPLE_MEMBERS),
      [
        "Settled: Tom paid Julia 15 USDC.",
        "Tom and Julia are even.",
        "",
        "[Demo only - no real funds moved]"
      ].join("\n")
    );
  });

  it("renders a partial settlement with the remaining debt", () => {
    const result = {
      fromParticipant: "tom",
      toParticipant: "julia",
      settledBaseUnits: 5_000_000n,
      remainingBaseUnits: 10_000_000n,
      fullSettlement: false
    };

    assert.equal(
      createSettleReply(result, SAMPLE_MEMBERS),
      [
        "Settled: Tom paid Julia 5 USDC.",
        "Tom still owes Julia 10 USDC.",
        "",
        "[Demo only - no real funds moved]"
      ].join("\n")
    );
  });
});

describe("createMembersReply", () => {
  it("nudges to add a member when empty", () => {
    assert.equal(createMembersReply([]), "No members yet. Add one with /addmember <name>.");
  });

  it("lists members with display names", () => {
    assert.equal(
      createMembersReply(SAMPLE_MEMBERS),
      [
        "Members (3):",
        "- Julia",
        "- Tom",
        "- Sara",
        "",
        "Add more with /addmember <name>. Remove with /removemember <name>."
      ].join("\n")
    );
  });
});

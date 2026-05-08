import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createBalancesReply,
  createMembersReply,
  createSetWalletReply,
  createSettleReply,
  createSplitReply,
  createWalletReply,
  parseSetWalletForCommand,
  parseSettleCommand,
  parseSingleArgCommand,
  parseSplitCommand
} from "../dist/index.js";

const SAMPLE_WALLET = "9hHs1J5gPRSkjucZxdCKsqLQGY2nUaSuwqcDR7zRXkTo";

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
        "When both people in a /settle have linked /setwallet addresses, the bot sends a Solana Pay QR (devnet USDC). Otherwise only the ledger here updates."
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
        "Current balances for this chat:",
        "Tom owes 10 USDC to Julia",
        "Sara owes 10 USDC to Julia",
        "",
        "Link wallets (/setwallet) so /settle can open real devnet USDC; otherwise this is ledger-only until then."
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
        "Current balances for this chat:",
        "ghost owes 5 USDC to Julia",
        "",
        "Link wallets (/setwallet) so /settle can open real devnet USDC; otherwise this is ledger-only until then."
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

  it("supports multi-word names with no amount", () => {
    assert.deepEqual(parseSettleCommand("/settle Anna Karenina"), {
      counterpartyName: "Anna Karenina",
      amount: undefined
    });
  });

  it("supports multi-word names with an amount", () => {
    assert.deepEqual(parseSettleCommand("/settle Юлия Золотухина 5"), {
      counterpartyName: "Юлия Золотухина",
      amount: "5"
    });
  });

  it("supports multi-word names with amount and USDC", () => {
    assert.deepEqual(parseSettleCommand("/settle Юлия Золотухина 5 USDC"), {
      counterpartyName: "Юлия Золотухина",
      amount: "5"
    });
  });

  it("rejects unsupported tokens", () => {
    assert.throws(() => parseSettleCommand("/settle Tom 10 SOL"), /only USDC/);
  });

  it("rejects when no name is supplied", () => {
    assert.throws(() => parseSettleCommand("/settle"), /Use \/settle/);
  });
});

describe("parseSetWalletForCommand", () => {
  it("parses single-word name", () => {
    assert.deepEqual(
      parseSetWalletForCommand(`/setwalletfor Tom ${SAMPLE_WALLET}`),
      { memberName: "Tom", walletAddress: SAMPLE_WALLET }
    );
  });

  it("parses multi-word name", () => {
    assert.deepEqual(
      parseSetWalletForCommand(`/setwalletfor Юлия Золотухина ${SAMPLE_WALLET}`),
      { memberName: "Юлия Золотухина", walletAddress: SAMPLE_WALLET }
    );
  });

  it("parses with bot suffix", () => {
    assert.deepEqual(
      parseSetWalletForCommand(`/setwalletfor@SplitStableBot Tom ${SAMPLE_WALLET}`),
      { memberName: "Tom", walletAddress: SAMPLE_WALLET }
    );
  });

  it("rejects when address is missing", () => {
    assert.throws(() => parseSetWalletForCommand("/setwalletfor Tom"), /Use \/setwalletfor/);
  });

  it("rejects when nothing is supplied", () => {
    assert.throws(() => parseSetWalletForCommand("/setwalletfor"), /Use \/setwalletfor/);
  });
});

describe("parseSingleArgCommand argLabel", () => {
  it("uses default <name> label", () => {
    assert.throws(
      () => parseSingleArgCommand("addmember", "/addmember"),
      /Use \/addmember <name>/
    );
  });

  it("uses custom argLabel when provided", () => {
    assert.throws(
      () => parseSingleArgCommand("setwallet", "/setwallet", { argLabel: "address" }),
      /Use \/setwallet <address>/
    );
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
        "Ledger only (no chain): both members need /setwallet for a Solana Pay payment."
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
        "Ledger only (no chain): both members need /setwallet for a Solana Pay payment."
      ].join("\n")
    );
  });
});

describe("createMembersReply", () => {
  it("nudges to add a member when empty", () => {
    assert.equal(createMembersReply([]), "No members yet. Add one with /addmember <name>.");
  });

  it("lists members with their wallet status", () => {
    const membersWithWallet = [
      { name: "julia", displayName: "Julia", walletAddress: SAMPLE_WALLET },
      { name: "tom", displayName: "Tom", walletAddress: null }
    ];

    assert.equal(
      createMembersReply(membersWithWallet),
      [
        "Members (2):",
        "- Julia (wallet 9hHs…XkTo)",
        "- Tom (no wallet)",
        "",
        "Add more with /addmember <name>. Remove with /removemember <name>.",
        "Each member can run /setwallet <address> to enable on-chain settlement."
      ].join("\n")
    );
  });
});

describe("createWalletReply", () => {
  it("nudges to link when no wallet is set", () => {
    const member = { name: "julia", displayName: "Julia", walletAddress: null };
    assert.equal(
      createWalletReply(member),
      "No wallet linked yet. Run /setwallet <address> to link your Solana wallet."
    );
  });

  it("shows the linked wallet", () => {
    const member = { name: "julia", displayName: "Julia", walletAddress: SAMPLE_WALLET };
    assert.equal(
      createWalletReply(member),
      [
        `Julia → ${SAMPLE_WALLET}`,
        "",
        "Use /setwallet <address> to change it."
      ].join("\n")
    );
  });
});

describe("createSetWalletReply", () => {
  it("renders 'Linked' on first link", () => {
    const member = { name: "julia", displayName: "Julia", walletAddress: SAMPLE_WALLET };
    const reply = createSetWalletReply(member, true);
    assert.match(reply, /^Linked wallet for Julia\./);
    assert.match(reply, new RegExp(SAMPLE_WALLET));
  });

  it("renders 'Updated' when changing an existing wallet", () => {
    const member = { name: "julia", displayName: "Julia", walletAddress: SAMPLE_WALLET };
    const reply = createSetWalletReply(member, false);
    assert.match(reply, /^Updated wallet for Julia\./);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createEqualSplit,
  formatUsdcFromBaseUnits,
  parseUsdcToBaseUnits
} from "../dist/index.js";

describe("parseUsdcToBaseUnits", () => {
  it("parses whole and decimal USDC amounts", () => {
    assert.equal(parseUsdcToBaseUnits("50"), 50_000_000n);
    assert.equal(parseUsdcToBaseUnits("12.50"), 12_500_000n);
    assert.equal(parseUsdcToBaseUnits("0.000001"), 1n);
  });

  it("rejects more than 6 decimal places", () => {
    assert.throws(() => parseUsdcToBaseUnits("1.0000001"), /at most 6 places/);
  });
});

describe("formatUsdcFromBaseUnits", () => {
  it("formats base units without trailing zeroes", () => {
    assert.equal(formatUsdcFromBaseUnits(50_000_000n), "50");
    assert.equal(formatUsdcFromBaseUnits(12_500_000n), "12.5");
    assert.equal(formatUsdcFromBaseUnits(1n), "0.000001");
  });
});

describe("createEqualSplit", () => {
  it("splits 50 USDC across 4 people", () => {
    const result = createEqualSplit({
      amountBaseUnits: parseUsdcToBaseUnits("50"),
      participantIds: ["me", "anna", "max", "leo"],
      payerId: "me"
    });

    assert.deepEqual(
      result.shares.map((share) => [share.participantId, formatUsdcFromBaseUnits(share.shareBaseUnits)]),
      [
        ["me", "12.5"],
        ["anna", "12.5"],
        ["max", "12.5"],
        ["leo", "12.5"]
      ]
    );

    assert.deepEqual(
      result.balances.map((balance) => [
        balance.fromParticipantId,
        balance.toParticipantId,
        formatUsdcFromBaseUnits(balance.amountBaseUnits)
      ]),
      [
        ["anna", "me", "12.5"],
        ["max", "me", "12.5"],
        ["leo", "me", "12.5"]
      ]
    );
  });

  it("assigns rounding dust deterministically by participant order", () => {
    const result = createEqualSplit({
      amountBaseUnits: parseUsdcToBaseUnits("10"),
      participantIds: ["payer", "one", "two"],
      payerId: "payer"
    });

    assert.deepEqual(
      result.shares.map((share) => share.shareBaseUnits),
      [3_333_334n, 3_333_333n, 3_333_333n]
    );
  });

  it("rejects invalid split inputs", () => {
    assert.throws(
      () =>
        createEqualSplit({
          amountBaseUnits: 0n,
          participantIds: ["me", "anna"],
          payerId: "me"
        }),
      /greater than zero/
    );

    assert.throws(
      () =>
        createEqualSplit({
          amountBaseUnits: 1n,
          participantIds: ["me"],
          payerId: "me"
        }),
      /at least two participants/
    );

    assert.throws(
      () =>
        createEqualSplit({
          amountBaseUnits: 1n,
          participantIds: ["me", "me"],
          payerId: "me"
        }),
      /unique/
    );
  });
});

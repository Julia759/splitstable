import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  USDC_MINT_ADDRESSES,
  assertValidSolanaAddress,
  createUsdcTransferUrl,
  generatePaymentReference,
  resolveSolanaPayConfig,
  shortenAddress
} from "../dist/index.js";

const VALID_WALLET = "9hHs1J5gPRSkjucZxdCKsqLQGY2nUaSuwqcDR7zRXkTo";
const VALID_REFERENCE = "B1QouLB16HeoAY1AQiEBMMfLoLp2zVo38SvoMMQEPuTb";

describe("assertValidSolanaAddress", () => {
  it("returns the normalized base58 form for a valid address", () => {
    assert.equal(assertValidSolanaAddress(`  ${VALID_WALLET}  `), VALID_WALLET);
  });

  it("rejects garbage input", () => {
    assert.throws(() => assertValidSolanaAddress("not-an-address"), /not look like a valid Solana wallet/);
  });

  it("rejects empty input", () => {
    assert.throws(() => assertValidSolanaAddress(""), /required/);
  });
});

describe("shortenAddress", () => {
  it("returns the full string for short inputs", () => {
    assert.equal(shortenAddress("abc"), "abc");
  });

  it("renders 4…4 ellipsis for full addresses", () => {
    assert.equal(shortenAddress(VALID_WALLET), "9hHs…XkTo");
  });
});

describe("generatePaymentReference", () => {
  it("returns a valid base58 Solana public key", () => {
    const ref = generatePaymentReference();
    assert.equal(typeof ref, "string");
    assert.equal(assertValidSolanaAddress(ref), ref);
  });

  it("never returns the same key twice", () => {
    const ref1 = generatePaymentReference();
    const ref2 = generatePaymentReference();
    assert.notEqual(ref1, ref2);
  });
});

describe("createUsdcTransferUrl", () => {
  it("encodes a valid Solana Pay URL with all required params", () => {
    const url = createUsdcTransferUrl({
      recipientWallet: VALID_WALLET,
      amountBaseUnits: 5_000_000n,
      reference: VALID_REFERENCE,
      cluster: "devnet",
      label: "SplitStable",
      message: "test payment"
    });

    assert.match(url, /^solana:/);
    assert.ok(url.includes(VALID_WALLET), "url must include recipient");
    assert.ok(url.includes(VALID_REFERENCE), "url must include reference");
    assert.ok(url.includes(USDC_MINT_ADDRESSES.devnet), "url must include devnet USDC mint");
    assert.ok(url.includes("amount=5") || url.includes("amount=5%2E"), "amount must be 5 USDC");
  });

  it("uses the mainnet USDC mint when cluster is mainnet-beta", () => {
    const url = createUsdcTransferUrl({
      recipientWallet: VALID_WALLET,
      amountBaseUnits: 1_000_000n,
      reference: VALID_REFERENCE,
      cluster: "mainnet-beta"
    });
    assert.ok(url.includes(USDC_MINT_ADDRESSES["mainnet-beta"]));
  });
});

describe("resolveSolanaPayConfig", () => {
  it("defaults to devnet with no env", () => {
    const config = resolveSolanaPayConfig({});
    assert.equal(config.cluster, "devnet");
    assert.equal(config.usdcMint, USDC_MINT_ADDRESSES.devnet);
    assert.match(config.rpcUrl, /devnet/);
  });

  it("respects SOLANA_RPC_URL override", () => {
    const config = resolveSolanaPayConfig({
      SOLANA_CLUSTER: "devnet",
      SOLANA_RPC_URL: "https://example.com/rpc"
    });
    assert.equal(config.rpcUrl, "https://example.com/rpc");
  });

  it("switches to mainnet-beta when explicitly set", () => {
    const config = resolveSolanaPayConfig({ SOLANA_CLUSTER: "mainnet-beta" });
    assert.equal(config.cluster, "mainnet-beta");
    assert.equal(config.usdcMint, USDC_MINT_ADDRESSES["mainnet-beta"]);
  });
});

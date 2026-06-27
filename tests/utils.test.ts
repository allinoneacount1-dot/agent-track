import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  detectChain,
  resolveChain,
  ok,
  err,
  validateAddress,
  validateTxHash,
} from "../src/utils.js";

describe("detectChain", () => {
  it("detects Solana from base58 address", () => {
    assert.equal(detectChain("7xKX8kABJqj2dkTFaHPL8q3Gm2K3JGgGjqKnXPtATqGt"), "solana");
    assert.equal(detectChain("So11111111111111111111111111111111111111112"), "solana");
  });

  it("detects Ethereum from 0x address", () => {
    assert.equal(detectChain("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"), "ethereum");
  });

  it("returns null for invalid input", () => {
    assert.equal(detectChain(""), null);
    assert.equal(detectChain("0xshort"), null);
    assert.equal(detectChain("not-a-valid-address!!!"), null);
  });

  it("returns null for 0x with wrong length", () => {
    assert.equal(detectChain("0x123"), null);
  });
});

describe("resolveChain", () => {
  it("uses chain option when provided", () => {
    assert.equal(resolveChain("bsc", "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"), "bsc");
    assert.equal(resolveChain("ethereum", "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"), "ethereum");
  });

  it("auto-detects Solana", () => {
    assert.equal(resolveChain(undefined, "7xKX8kABJqj2dkTFaHPL8q3Gm2K3JGgGjqKnXPtATqGt"), "solana");
  });

  it("throws for unsupported chain", () => {
    assert.throws(() => resolveChain("bitcoin", "abc"), /Unsupported chain/);
  });

  it("throws for undetectable input", () => {
    assert.throws(() => resolveChain(undefined, "???invalid"), /Cannot detect chain/);
  });
});

describe("response builders", () => {
  it("ok builds success response", () => {
    const r = ok("solana", { foo: "bar" });
    assert.equal(r.status, "ok");
    assert.equal(r.chain, "solana");
    assert.deepEqual(r.data, { foo: "bar" });
  });

  it("err builds error response", () => {
    const r = err("ethereum", "Something broke");
    assert.equal(r.status, "error");
    assert.equal(r.error, "Something broke");
  });
});

describe("validateAddress", () => {
  it("accepts valid Solana address", () => {
    const addr = "7xKX8kABJqj2dkTFaHPL8q3Gm2K3JGgGjqKnXPtATqGt";
    assert.equal(validateAddress(addr), addr);
  });

  it("accepts valid EVM address", () => {
    const addr = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
    assert.equal(validateAddress(addr), addr);
  });

  it("throws for empty input", () => {
    assert.throws(() => validateAddress(""), /required/);
  });

  it("throws for invalid EVM length", () => {
    assert.throws(() => validateAddress("0x123"), /Invalid EVM address/);
  });

  it("throws for gibberish", () => {
    assert.throws(() => validateAddress("not-a-valid-address!!!"), /Invalid address format/);
  });
});

describe("validateTxHash", () => {
  it("accepts valid Solana tx hash", () => {
    const h = "5KtN3qCjKgmPqFxmP3mQykAz7mUGKTuLXMGLFQ4WqBg";
    assert.equal(validateTxHash(h), h);
  });

  it("accepts valid EVM tx hash", () => {
    const h = "0x" + "a".repeat(64);
    assert.equal(validateTxHash(h), h);
  });

  it("throws for invalid EVM length", () => {
    assert.throws(() => validateTxHash("0x123"), /Invalid EVM tx hash/);
  });

  it("throws for empty", () => {
    assert.throws(() => validateTxHash(""), /required/);
  });
});

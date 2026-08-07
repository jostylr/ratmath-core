import { describe, expect, it } from "bun:test";
import { toExactBigInt } from "../src/bigint.js";

describe("toExactBigInt", () => {
  it("accepts every exact integer input form", () => {
    expect(toExactBigInt(12)).toBe(12n);
    expect(toExactBigInt(-12n)).toBe(-12n);
    expect(toExactBigInt("  +12  ")).toBe(12n);
  });

  it("rejects rounded numbers and malformed inputs", () => {
    expect(() => toExactBigInt(Number.MAX_SAFE_INTEGER + 1, "Count")).toThrow(
      "Count must be a safe integer",
    );
    expect(() => toExactBigInt("1.5")).toThrow("must be an integer");
    expect(() => toExactBigInt({})).toThrow("must be an integer");
  });
});

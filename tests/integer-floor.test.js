import { describe, expect, it } from "bun:test";
import { Integer, Rational } from "../index.js";

const I = (n) => new Integer(n);

describe("Integer floor division, floor modulo and divmod", () => {
  it("agree with floor(a / b) and a - b * floor(a / b) across signs", () => {
    for (let a = -13; a <= 13; a++) {
      for (const b of [-5, -3, -1, 1, 2, 3, 7]) {
        const q = Math.floor(a / b);
        const r = a - b * q;
        expect(I(a).floorDivide(I(b)).value).toBe(BigInt(q));
        expect(I(a).floorModulo(I(b)).value).toBe(BigInt(r));
        const [dq, dr] = I(a).divmod(I(b));
        expect([dq.value, dr.value]).toEqual([BigInt(q), BigInt(r)]);
      }
    }
  });

  it("matches Rational floor division on large values", () => {
    const a = -(10n ** 40n) - 7n;
    const b = 10n ** 17n + 3n;
    expect(I(a).floorDivide(I(b)).value).toBe(new Rational(a, b).floor());
  });

  it("leaves existing divide and modulo meanings unchanged", () => {
    expect(I(-7).modulo(I(3)).value).toBe(-1n);
    expect(I(-7).floorModulo(I(3)).value).toBe(2n);
    expect(I(7).divide(I(2))).toBeInstanceOf(Rational);
  });

  it("rejects zero and non-Integer divisors", () => {
    expect(() => I(1).floorDivide(I(0))).toThrow("Division by zero");
    expect(() => I(1).floorModulo(I(0))).toThrow("Modulo by zero");
    expect(() => I(1).divmod(I(0))).toThrow("Division by zero");
    expect(() => I(1).floorDivide(new Rational(1, 2))).toThrow(TypeError);
  });
});

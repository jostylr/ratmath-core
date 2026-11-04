import { describe, expect, it } from "bun:test";
import { Integer, Rational, RationalInterval } from "../index.js";

const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const canonical = (r) => r.denominator > 0n && gcd(r.numerator, r.denominator) === 1n && (r.numerator !== 0n || r.denominator === 1n);

// Deterministic pseudo-random BigInts with shared factors to exercise every branch.
let seed = 12345n;
const next = () => (seed = (seed * 6364136223846793005n + 1442695040888963407n) % (1n << 64n));
const factors = [1n, 2n, 3n, 4n, 6n, 9n, 10n, 12n, 35n, 360n, 2n ** 70n, 3n ** 40n];
const pick = () => factors[Number(next() % BigInt(factors.length))];
const randomValue = () => {
  const sign = next() % 2n === 0n ? 1n : -1n;
  const zero = next() % 13n === 0n;
  return [zero ? 0n : sign * (next() % 1000n + 1n) * pick(), (next() % 50n + 1n) * pick()];
};

describe("Rational arithmetic fast paths", () => {
  it("match the general cross-multiplied results and stay canonical", () => {
    for (let i = 0; i < 2000; i++) {
      const [a, b] = randomValue();
      const [c, d] = randomValue();
      const x = new Rational(a, b);
      const y = new Rational(c, d);
      const expected = {
        add: new Rational(a * d + c * b, b * d),
        subtract: new Rational(a * d - c * b, b * d),
        multiply: new Rational(a * c, b * d),
      };
      if (c !== 0n) expected.divide = new Rational(a * d, b * c);
      for (const [op, want] of Object.entries(expected)) {
        const got = x[op](y);
        expect(got).toBeInstanceOf(Rational);
        expect(canonical(got)).toBe(true);
        expect([got.numerator, got.denominator]).toEqual([want.numerator, want.denominator]);
        expect(got.isNegative ?? got.numerator < 0n).toBe(got.numerator < 0n);
      }
      const n = new Integer(a);
      const viaInteger = x.add(n);
      expect(viaInteger.equals(new Rational(a * b + a, b))).toBe(true);
      expect(canonical(viaInteger)).toBe(true);
    }
  });

  it("rejects division by a zero Rational or Integer", () => {
    expect(() => new Rational(1, 2).divide(new Rational(0))).toThrow("Division by zero");
    expect(() => new Rational(1, 2).divide(new Integer(0))).toThrow("Division by zero");
  });

  it("returns fresh objects", () => {
    const x = new Rational(1, 2);
    const zero = new Rational(0);
    expect(x.add(zero)).not.toBe(x);
    expect(x.multiply(new Rational(1))).not.toBe(x);
  });

  it("leaves subclasses, overridden accessors and intervals on the general path", () => {
    class Scaled extends Rational {
      get numerator() { return super.numerator * 2n; }
    }
    const scaled = new Scaled(1, 3);
    expect(new Rational(1, 3).add(scaled).equals(new Rational(1))).toBe(true);

    const shadowed = new Rational(1, 3);
    Object.defineProperty(shadowed, "denominator", { value: 6n });
    expect(new Rational(1, 6).add(shadowed).equals(new Rational(1, 3))).toBe(true);

    const interval = new RationalInterval(new Rational(1), new Rational(2));
    const sum = new Rational(1, 2).add(interval);
    expect(sum).toBeInstanceOf(RationalInterval);
    expect(sum.low.equals(new Rational(3, 2)) && sum.high.equals(new Rational(5, 2))).toBe(true);
  });
});

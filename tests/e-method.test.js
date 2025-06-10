import { describe, expect, it, test } from "bun:test";
import { Rational, RationalInterval, Fraction, FractionInterval, Integer } from "../index.js";

describe("E Method", () => {
  describe("Rational.E()", () => {
    it("applies positive E notation to integers", () => {
      const result = new Rational(5).E(2);
      expect(result.equals(new Rational(500))).toBe(true);
    });

    it("applies negative E notation to integers", () => {
      const result = new Rational(123).E(-2);
      expect(result.equals(new Rational(123, 100))).toBe(true);
    });

    it("applies E notation to fractions", () => {
      const result = new Rational(1, 4).E(-1);
      expect(result.equals(new Rational(1, 40))).toBe(true);
    });

    it("applies positive E notation to fractions", () => {
      const result = new Rational(1, 3).E(3);
      expect(result.equals(new Rational(1000, 3))).toBe(true);
    });

    it("handles zero exponent", () => {
      const result = new Rational(42, 7).E(0);
      expect(result.equals(new Rational(42, 7))).toBe(true);
    });

    it("handles zero value", () => {
      const result = new Rational(0).E(5);
      expect(result.equals(new Rational(0))).toBe(true);
    });

    it("handles negative numbers", () => {
      const result = new Rational(-25).E(-2);
      expect(result.equals(new Rational(-25, 100))).toBe(true);
    });

    it("handles large exponents", () => {
      const result = new Rational(1).E(10);
      expect(result.equals(new Rational(10000000000n))).toBe(true);
    });

    it("handles large negative exponents", () => {
      const result = new Rational(1).E(-10);
      expect(result.equals(new Rational(1, 10000000000n))).toBe(true);
    });

    it("accepts BigInt exponents", () => {
      const result = new Rational(7).E(3n);
      expect(result.equals(new Rational(7000))).toBe(true);
    });
  });

  describe("RationalInterval.E()", () => {
    it("applies E notation to both endpoints", () => {
      const interval = new RationalInterval(1, 2);
      const result = interval.E(2);
      expect(result.low.equals(new Rational(100))).toBe(true);
      expect(result.high.equals(new Rational(200))).toBe(true);
    });

    it("applies negative E notation to intervals", () => {
      const interval = new RationalInterval(15, 25);
      const result = interval.E(-1);
      expect(result.low.equals(new Rational(15, 10))).toBe(true);
      expect(result.high.equals(new Rational(25, 10))).toBe(true);
    });

    it("handles fraction endpoints", () => {
      const interval = new RationalInterval("1/3", "2/3");
      const result = interval.E(3);
      expect(result.low.equals(new Rational(1000, 3))).toBe(true);
      expect(result.high.equals(new Rational(2000, 3))).toBe(true);
    });

    it("preserves interval ordering", () => {
      const interval = new RationalInterval(5, 2); // Will be reordered to [2, 5]
      const result = interval.E(1);
      expect(result.low.equals(new Rational(20))).toBe(true);
      expect(result.high.equals(new Rational(50))).toBe(true);
    });

    it("handles zero exponent", () => {
      const interval = new RationalInterval(3, 7);
      const result = interval.E(0);
      expect(result.low.equals(new Rational(3))).toBe(true);
      expect(result.high.equals(new Rational(7))).toBe(true);
    });

    it("handles negative intervals", () => {
      const interval = new RationalInterval(-5, -2);
      const result = interval.E(2);
      expect(result.low.equals(new Rational(-500))).toBe(true);
      expect(result.high.equals(new Rational(-200))).toBe(true);
    });

    it("handles intervals spanning zero", () => {
      const interval = new RationalInterval(-1, 1);
      const result = interval.E(2);
      expect(result.low.equals(new Rational(-100))).toBe(true);
      expect(result.high.equals(new Rational(100))).toBe(true);
    });
  });

  describe("Fraction.E()", () => {
    it("applies positive E notation to fractions", () => {
      const fraction = new Fraction(5, 4);
      const result = fraction.E(2);
      expect(result.numerator).toBe(500n);
      expect(result.denominator).toBe(4n);
    });

    it("applies negative E notation to fractions", () => {
      const fraction = new Fraction(3, 8);
      const result = fraction.E(-1);
      expect(result.numerator).toBe(3n);
      expect(result.denominator).toBe(80n);
    });

    it("handles zero exponent", () => {
      const fraction = new Fraction(7, 11);
      const result = fraction.E(0);
      expect(result.numerator).toBe(7n);
      expect(result.denominator).toBe(11n);
    });

    it("handles negative fractions", () => {
      const fraction = new Fraction(-15, 4);
      const result = fraction.E(1);
      expect(result.numerator).toBe(-150n);
      expect(result.denominator).toBe(4n);
    });

    it("preserves exact fraction representation", () => {
      const fraction = new Fraction(2, 4); // Not reduced
      const result = fraction.E(1);
      expect(result.numerator).toBe(20n);
      expect(result.denominator).toBe(4n); // Still not reduced
    });

    it("handles large exponents", () => {
      const fraction = new Fraction(1, 3);
      const result = fraction.E(5);
      expect(result.numerator).toBe(100000n);
      expect(result.denominator).toBe(3n);
    });

    it("handles large negative exponents", () => {
      const fraction = new Fraction(7, 2);
      const result = fraction.E(-4);
      expect(result.numerator).toBe(7n);
      expect(result.denominator).toBe(20000n);
    });
  });

  describe("FractionInterval.E()", () => {
    it("applies E notation to both fraction endpoints", () => {
      const interval = new FractionInterval(
        new Fraction(1, 2),
        new Fraction(3, 4)
      );
      const result = interval.E(2);
      expect(result.low.numerator).toBe(100n);
      expect(result.low.denominator).toBe(2n);
      expect(result.high.numerator).toBe(300n);
      expect(result.high.denominator).toBe(4n);
    });

    it("applies negative E notation to fraction intervals", () => {
      const interval = new FractionInterval(
        new Fraction(5, 2),
        new Fraction(7, 2)
      );
      const result = interval.E(-1);
      expect(result.low.numerator).toBe(5n);
      expect(result.low.denominator).toBe(20n);
      expect(result.high.numerator).toBe(7n);
      expect(result.high.denominator).toBe(20n);
    });

    it("handles zero exponent", () => {
      const interval = new FractionInterval(
        new Fraction(2, 3),
        new Fraction(4, 5)
      );
      const result = interval.E(0);
      expect(result.low.numerator).toBe(2n);
      expect(result.low.denominator).toBe(3n);
      expect(result.high.numerator).toBe(4n);
      expect(result.high.denominator).toBe(5n);
    });

    it("preserves fraction representation", () => {
      const interval = new FractionInterval(
        new Fraction(2, 6), // Not reduced
        new Fraction(4, 8)  // Not reduced
      );
      const result = interval.E(1);
      expect(result.low.numerator).toBe(20n);
      expect(result.low.denominator).toBe(6n); // Still not reduced
      expect(result.high.numerator).toBe(40n);
      expect(result.high.denominator).toBe(8n); // Still not reduced
    });
  });

  describe("Integer.E()", () => {
    it("applies positive E notation and returns Integer", () => {
      const integer = new Integer(5);
      const result = integer.E(2);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(500n);
    });

    it("applies zero E notation and returns Integer", () => {
      const integer = new Integer(42);
      const result = integer.E(0);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(42n);
    });

    it("applies negative E notation and returns Rational", () => {
      const integer = new Integer(45);
      const result = integer.E(-1);
      expect(result).toBeInstanceOf(Rational);
      expect(result.equals(new Rational(45, 10))).toBe(true);
    });

    it("handles negative integers with positive exponent", () => {
      const integer = new Integer(-7);
      const result = integer.E(3);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(-7000n);
    });

    it("handles negative integers with negative exponent", () => {
      const integer = new Integer(-100);
      const result = integer.E(-2);
      expect(result).toBeInstanceOf(Rational);
      expect(result.equals(new Rational(-1))).toBe(true);
    });

    it("handles zero with any exponent", () => {
      const integer = new Integer(0);
      const resultPos = integer.E(5);
      const resultNeg = integer.E(-3);
      
      expect(resultPos).toBeInstanceOf(Integer);
      expect(resultPos.value).toBe(0n);
      
      expect(resultNeg).toBeInstanceOf(Rational);
      expect(resultNeg.equals(new Rational(0))).toBe(true);
    });

    it("handles large positive exponents", () => {
      const integer = new Integer(2);
      const result = integer.E(10);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(20000000000n);
    });

    it("handles large negative exponents", () => {
      const integer = new Integer(1);
      const result = integer.E(-8);
      expect(result).toBeInstanceOf(Rational);
      expect(result.equals(new Rational(1, 100000000n))).toBe(true);
    });

    it("accepts BigInt exponents", () => {
      const integer = new Integer(3);
      const result = integer.E(2n);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(300n);
    });
  });

  describe("E Method Integration", () => {
    it("produces same results as parser E notation for Rational", () => {
      const parserResult = new Rational(5).multiply(new Rational(10n ** 2n));
      const methodResult = new Rational(5).E(2);
      expect(methodResult.equals(parserResult)).toBe(true);
    });

    it("produces same results as parser E notation for RationalInterval", () => {
      const interval = new RationalInterval(1, 2);
      const powerOf10 = new Rational(10n ** 3n);
      const parserResult = interval.multiply(new RationalInterval(powerOf10, powerOf10));
      const methodResult = interval.E(3);
      expect(methodResult.low.equals(parserResult.low)).toBe(true);
      expect(methodResult.high.equals(parserResult.high)).toBe(true);
    });

    it("chains E method calls correctly", () => {
      const result = new Rational(2).E(2).E(1);
      expect(result.equals(new Rational(2000))).toBe(true);
    });

    it("chains E method calls with negative exponents", () => {
      const result = new Rational(5000).E(-2).E(-1);
      expect(result.equals(new Rational(5))).toBe(true);
    });

    it("works with arithmetic operations", () => {
      const a = new Rational(3).E(2);  // 300
      const b = new Rational(2).E(1);  // 20
      const result = a.add(b);         // 320
      expect(result.equals(new Rational(320))).toBe(true);
    });

    it("works with interval arithmetic", () => {
      const a = new RationalInterval(1, 2).E(1);  // [10, 20]
      const b = new RationalInterval(3, 4).E(1);  // [30, 40]
      const result = a.add(b);                    // [40, 60]
      expect(result.low.equals(new Rational(40))).toBe(true);
      expect(result.high.equals(new Rational(60))).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("handles very large numbers", () => {
      const large = new Rational(123456789n);
      const result = large.E(10);
      expect(result.numerator).toBe(1234567890000000000n);
    });

    it("handles very small fractions", () => {
      const small = new Rational(1, 1000000n);
      const result = small.E(-6);
      expect(result.equals(new Rational(1, 1000000000000n))).toBe(true);
    });

    it("maintains precision with repeated operations", () => {
      const value = new Rational(1, 3);
      const result = value.E(6).E(-6);
      expect(result.equals(value)).toBe(true);
    });

    it("handles integer overflow scenarios gracefully", () => {
      const bigInteger = new Integer(999999999n);
      const result = bigInteger.E(20);
      expect(result).toBeInstanceOf(Integer);
      // Should not throw, even with very large numbers
    });
  });
});
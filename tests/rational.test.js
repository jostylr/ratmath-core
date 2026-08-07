import { describe, expect, it, test } from "bun:test";
import { BaseSystem } from "../src/base-system.js";
import { parseRepeatingDecimal, Rational } from "../index.js";

describe("Rational", () => {
  describe("static constants", () => {
    it("provides a zero constant", () => {
      expect(Rational.zero.numerator).toBe(0n);
      expect(Rational.zero.denominator).toBe(1n);
    });

    it("provides a one constant", () => {
      expect(Rational.one.numerator).toBe(1n);
      expect(Rational.one.denominator).toBe(1n);
    });
  });

  describe("constructor", () => {
    it("creates a rational from integers", () => {
      const r = new Rational(3, 4);
      expect(r.numerator).toBe(3n);
      expect(r.denominator).toBe(4n);
    });

    it("creates a rational from bigints", () => {
      const r = new Rational(3n, 4n);
      expect(r.numerator).toBe(3n);
      expect(r.denominator).toBe(4n);
    });

    it("copies another Rational", () => {
      const original = new Rational(3n, 4n);
      expect(new Rational(original).equals(original)).toBe(true);
    });

    it("accepts an exact integer string denominator", () => {
      const rational = new Rational("777", "10");
      expect(rational.toString()).toBe("777/10");
    });

    it("rejects unsafe JavaScript number components", () => {
      expect(() => new Rational(Number.MAX_SAFE_INTEGER + 1, 1)).toThrow(
        "safe integer",
      );
      expect(() => new Rational(1, Number.MAX_SAFE_INTEGER + 1)).toThrow(
        "safe integer",
      );
      expect(new Rational("9007199254740993/2").numerator).toBe(
        9007199254740993n,
      );
    });

    it("creates a rational from a string", () => {
      const r = new Rational("3/4");
      expect(r.numerator).toBe(3n);
      expect(r.denominator).toBe(4n);
    });

    it("creates a rational from a whole number string", () => {
      const r = new Rational("5");
      expect(r.numerator).toBe(5n);
      expect(r.denominator).toBe(1n);
    });

    it("normalizes the rational to lowest terms", () => {
      const r = new Rational(6, 8);
      expect(r.numerator).toBe(3n);
      expect(r.denominator).toBe(4n);
    });

    it("handles negative numbers", () => {
      const r1 = new Rational(-3, 4);
      expect(r1.numerator).toBe(-3n);
      expect(r1.denominator).toBe(4n);

      const r2 = new Rational(3, -4);
      expect(r2.numerator).toBe(-3n);
      expect(r2.denominator).toBe(4n);

      const r3 = new Rational(-3, -4);
      expect(r3.numerator).toBe(3n);
      expect(r3.denominator).toBe(4n);
    });

    it("throws an error for zero denominator", () => {
      expect(() => new Rational(1, 0)).toThrow("Denominator cannot be zero");
    });

    it("handles zero numerator", () => {
      const r = new Rational(0, 5);
      expect(r.numerator).toBe(0n);
      expect(r.denominator).toBe(1n);
    });
  });

  describe("arithmetic operations", () => {
    it("adds two rationals", () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(1, 3);
      const sum = r1.add(r2);
      expect(sum.numerator).toBe(5n);
      expect(sum.denominator).toBe(6n);
    });

    it("subtracts two rationals", () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(1, 3);
      const diff = r1.subtract(r2);
      expect(diff.numerator).toBe(1n);
      expect(diff.denominator).toBe(6n);
    });

    it("multiplies two rationals", () => {
      const r1 = new Rational(2, 3);
      const r2 = new Rational(3, 4);
      const product = r1.multiply(r2);
      expect(product.numerator).toBe(1n);
      expect(product.denominator).toBe(2n);
    });

    it("divides two rationals", () => {
      const r1 = new Rational(2, 3);
      const r2 = new Rational(3, 4);
      const quotient = r1.divide(r2);
      expect(quotient.numerator).toBe(8n);
      expect(quotient.denominator).toBe(9n);
    });

    it("throws an error when dividing by zero", () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(0, 1);
      expect(() => r1.divide(r2)).toThrow("Division by zero");
    });

    it("negates a rational", () => {
      const r = new Rational(3, 4);
      const neg = r.negate();
      expect(neg.numerator).toBe(-3n);
      expect(neg.denominator).toBe(4n);
    });

    it("computes the reciprocal of a rational", () => {
      const r = new Rational(3, 4);
      const recip = r.reciprocal();
      expect(recip.numerator).toBe(4n);
      expect(recip.denominator).toBe(3n);
    });

    it("throws an error when computing the reciprocal of zero", () => {
      const r = new Rational(0, 1);
      expect(() => r.reciprocal()).toThrow("Cannot take reciprocal of zero");
    });

    it("computes absolute value", () => {
      const r1 = new Rational(3, 4);
      const r2 = new Rational(-3, 4);

      expect(r1.abs().equals(r1)).toBe(true);
      expect(r2.abs().equals(r1)).toBe(true);
    });
  });

  describe("exponentiation", () => {
    it("raises a rational to a positive integer power", () => {
      const r = new Rational(2, 3);
      const result = r.pow(3);
      expect(result.numerator).toBe(8n);
      expect(result.denominator).toBe(27n);
    });

    it("raises a rational to a negative integer power", () => {
      const r = new Rational(2, 3);
      const result = r.pow(-2);
      expect(result.numerator).toBe(9n);
      expect(result.denominator).toBe(4n);
    });

    it("raises a rational to power 0", () => {
      const r = new Rational(2, 3);
      const result = r.pow(0);
      expect(result.numerator).toBe(1n);
      expect(result.denominator).toBe(1n);
    });

    it("throws an error when raising zero to a negative power", () => {
      const r = new Rational(0, 1);
      expect(() => r.pow(-1)).toThrow(
        "Zero cannot be raised to a negative power",
      );
    });

    it("throws an error when raising zero to power 0", () => {
      const r = new Rational(0, 1);
      expect(() => r.pow(0)).toThrow(
        "Zero cannot be raised to the power of zero",
      );
    });
  });

  describe("comparison", () => {
    it("checks equality of rationals", () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(2, 4);
      const r3 = new Rational(2, 3);

      expect(r1.equals(r2)).toBe(true);
      expect(r1.equals(r3)).toBe(false);
    });

    it("compares rationals", () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(2, 3);
      const r3 = new Rational(1, 2);

      expect(r1.compareTo(r2)).toBe(-1);
      expect(r2.compareTo(r1)).toBe(1);
      expect(r1.compareTo(r3)).toBe(0);
    });

    it("checks if one rational is less than another", () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(2, 3);

      expect(r1.lessThan(r2)).toBe(true);
      expect(r2.lessThan(r1)).toBe(false);
      expect(r1.lessThan(new Rational(1, 2))).toBe(false);
    });

    it("checks if one rational is less than or equal to another", () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(2, 3);

      expect(r1.lessThanOrEqual(r2)).toBe(true);
      expect(r2.lessThanOrEqual(r1)).toBe(false);
      expect(r1.lessThanOrEqual(new Rational(1, 2))).toBe(true);
    });

    it("checks if one rational is greater than another", () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(2, 3);

      expect(r1.greaterThan(r2)).toBe(false);
      expect(r2.greaterThan(r1)).toBe(true);
      expect(r1.greaterThan(new Rational(1, 2))).toBe(false);
    });

    it("checks if one rational is greater than or equal to another", () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(2, 3);

      expect(r1.greaterThanOrEqual(r2)).toBe(false);
      expect(r2.greaterThanOrEqual(r1)).toBe(true);
      expect(r1.greaterThanOrEqual(new Rational(1, 2))).toBe(true);
    });
  });

  describe("conversion", () => {
    it("converts a rational to string", () => {
      const r1 = new Rational(3, 4);
      const r2 = new Rational(5, 1);

      expect(r1.toString()).toBe("3/4");
      expect(r2.toString()).toBe("5");
    });

    it("converts a rational to a number", () => {
      const r = new Rational(3, 4);
      expect(r.toNumber()).toBe(0.75);
    });

    it("converts a rational to a mixed number string", () => {
      const r1 = new Rational(17, 3); // 5..2/3
      const r2 = new Rational(5, 1); // Just 5
      const r3 = new Rational(3, 4); // Just 0..3/4
      const r4 = new Rational(-9, 4); // -2..1/4

      expect(r1.toMixedString()).toBe("5..2/3");
      expect(r2.toMixedString()).toBe("5");
      expect(r3.toMixedString()).toBe("3/4");
      expect(r4.toMixedString()).toBe("-2..1/4");
    });

    it("handles zero and negative mixed numbers", () => {
      const r1 = new Rational(0, 1); // Just 0
      const r2 = new Rational(-5, 1); // Just -5
      const r3 = new Rational(-1, 2); // -0..1/2 (no whole part)

      expect(r1.toMixedString()).toBe("0");
      expect(r2.toMixedString()).toBe("-5");
      expect(r3.toMixedString()).toBe("-1/2");
    });
  });

  describe("repeating decimal conversion", () => {
    it("converts simple fractions to repeating decimals", () => {
      const oneThird = new Rational(1, 3);
      expect(oneThird.toRepeatingDecimal()).toBe("0.#3");

      const twoThirds = new Rational(2, 3);
      expect(twoThirds.toRepeatingDecimal()).toBe("0.#6");

      const oneSixth = new Rational(1, 6);
      expect(oneSixth.toRepeatingDecimal()).toBe("0.1#6");

      const oneSeventh = new Rational(1, 7);
      expect(oneSeventh.toRepeatingDecimal()).toBe("0.#142857");
    });

    it("converts terminating decimals", () => {
      const half = new Rational(1, 2);
      expect(half.toRepeatingDecimal()).toBe("0.5#0");

      const quarter = new Rational(1, 4);
      expect(quarter.toRepeatingDecimal()).toBe("0.25#0");

      const oneEighth = new Rational(1, 8);
      expect(oneEighth.toRepeatingDecimal()).toBe("0.125#0");

      const threeFourths = new Rational(3, 4);
      expect(threeFourths.toRepeatingDecimal()).toBe("0.75#0");
    });

    it("converts integers", () => {
      const zero = new Rational(0);
      expect(zero.toRepeatingDecimal()).toBe("0");

      const five = new Rational(5);
      expect(five.toRepeatingDecimal()).toBe("5");

      const negative = new Rational(-7);
      expect(negative.toRepeatingDecimal()).toBe("-7");
    });

    it("converts mixed numbers with repeating parts", () => {
      const mixedRepeating = new Rational(10, 3); // 3.#3
      expect(mixedRepeating.toRepeatingDecimal()).toBe("3.#3");

      const largerMixed = new Rational(22, 7); // 3.#142857
      expect(largerMixed.toRepeatingDecimal()).toBe("3.#142857");
    });

    it("converts mixed numbers with terminating parts", () => {
      const mixedTerminating = new Rational(5, 2); // 2.5
      expect(mixedTerminating.toRepeatingDecimal()).toBe("2.5#0");

      const anotherMixed = new Rational(7, 4); // 1.75
      expect(anotherMixed.toRepeatingDecimal()).toBe("1.75#0");
    });

    it("handles negative fractions", () => {
      const negativeThird = new Rational(-1, 3);
      expect(negativeThird.toRepeatingDecimal()).toBe("-0.#3");

      const negativeMixed = new Rational(-10, 3);
      expect(negativeMixed.toRepeatingDecimal()).toBe("-3.#3");

      const negativeTerminating = new Rational(-3, 4);
      expect(negativeTerminating.toRepeatingDecimal()).toBe("-0.75#0");
    });

    it("handles complex repeating patterns", () => {
      const oneNinth = new Rational(1, 9);
      expect(oneNinth.toRepeatingDecimal()).toBe("0.#1");

      const twoNinths = new Rational(2, 9);
      expect(twoNinths.toRepeatingDecimal()).toBe("0.#2");

      const oneEleventh = new Rational(1, 11);
      expect(oneEleventh.toRepeatingDecimal()).toBe("0.#09");
    });

    it("roundtrip conversion works correctly", () => {
      const testCases = [
        new Rational(1, 3),
        new Rational(1, 6),
        new Rational(1, 7),
        new Rational(22, 7),
        new Rational(1, 2),
        new Rational(3, 4),
        new Rational(-2, 3),
        new Rational(5),
        new Rational(0),
      ];

      testCases.forEach((original) => {
        const repeatingDecimal = original.toRepeatingDecimal();
        expect(parseRepeatingDecimal(repeatingDecimal).equals(original)).toBe(true);
      });
    });
  });

  describe("static methods", () => {
    it("creates a rational from various types", () => {
      const r1 = Rational.from(new Rational(3, 4));
      expect(r1.numerator).toBe(3n);
      expect(r1.denominator).toBe(4n);

      const r2 = Rational.from("5/6");
      expect(r2.numerator).toBe(5n);
      expect(r2.denominator).toBe(6n);

      const r3 = Rational.from(7);
      expect(r3.numerator).toBe(7n);
      expect(r3.denominator).toBe(1n);
    });
  });

  describe("continued-fraction utilities", () => {
    it("calculates terminating and repeating periods in a base", () => {
      expect(new Rational(5).periodModulo(BaseSystem.DECIMAL)).toBe(0);
      expect(new Rational(1, 8).periodModulo(BaseSystem.DECIMAL)).toBe(0);
      expect(new Rational(1, 3).periodModulo(BaseSystem.DECIMAL)).toBe(1);
      expect(new Rational(-1, 7).periodModulo(BaseSystem.DECIMAL)).toBe(6);
      expect(new Rational(1, 3).periodModulo(BaseSystem.BINARY)).toBe(2);
      expect(() => new Rational(1, 3).periodModulo({})).toThrow(
        "must be a BaseSystem",
      );
      expect(() =>
        new Rational(1, 7).periodModulo(BaseSystem.DECIMAL, 2),
      ).toThrow("exceeded limit of 2");
    });

    it("validates arbitrary-base expansion and period limits", () => {
      const value = new Rational(1, 7);
      const invalidLimits = [0, -1, 1.5, NaN, Infinity];

      for (const limit of invalidLimits) {
        expect(() =>
          value.toRepeatingBaseWithPeriod(BaseSystem.DECIMAL, { limit }),
        ).toThrow("positive safe integer");
        expect(() =>
          value.periodModulo(BaseSystem.DECIMAL, limit),
        ).toThrow("positive safe integer");
      }
    });

    it("recognizes a period exactly at the global discovery boundary", () => {
      const originalLimit = Rational.MAX_PERIOD_CHECK;
      try {
        Rational.MAX_PERIOD_CHECK = 6;
        const metadata = new Rational(1, 7).computeDecimalMetadata(6);
        expect(metadata.periodLength).toBe(6);
        expect(metadata.periodDigits).toBe("142857");
      } finally {
        Rational.MAX_PERIOD_CHECK = originalLimit;
      }
    });

    it("parses continued-fraction strings and rejects malformed terms", () => {
      expect(Rational.fromContinuedFractionString("3.~7~15").toString()).toBe(
        "333/106",
      );
      expect(Rational.fromContinuedFractionString("-5.~0").toString()).toBe(
        "-5",
      );
      expect(() => Rational.fromContinuedFractionString("3/4")).toThrow(
        "Invalid continued fraction format",
      );
      expect(() => Rational.fromContinuedFractionString("3.~")).toThrow(
        "at least one term",
      );
      expect(() => Rational.fromContinuedFractionString("3.~7~")).toThrow(
        "cannot end",
      );
      expect(() => Rational.fromContinuedFractionString("3.~7~~2")).toThrow(
        "double tilde",
      );
      expect(() => Rational.fromContinuedFractionString("3.~7~x")).toThrow(
        "Invalid continued fraction term",
      );
      expect(() => Rational.fromContinuedFractionString("3.~7~0")).toThrow(
        "must be positive integers",
      );
    });

    it("computes, limits, and indexes convergents without poisoning the cache", () => {
      const value = new Rational(355, 113);
      expect(value.convergents(2).map((term) => term.toString())).toEqual([
        "3",
        "22/7",
      ]);
      expect(value.convergents().map((term) => term.toString())).toEqual([
        "3",
        "22/7",
        "355/113",
      ]);
      expect(value.getConvergent(1).toString()).toBe("22/7");
      expect(() => value.getConvergent(-1)).toThrow(
        "nonnegative safe integer",
      );
      expect(() => value.getConvergent(3)).toThrow("out of range");

      expect(
        new Rational(4).convergents().map((term) => term.toString()),
      ).toEqual(["4"]);
    });

    it("rejects invalid continued-fraction counts and indexes", () => {
      const value = new Rational(355, 113);
      const invalidCounts = [0, -1, 1.5, NaN, Infinity];

      for (const count of invalidCounts) {
        expect(() => value.toContinuedFraction(count)).toThrow(
          "positive safe integer",
        );
        expect(() => value.convergents(count)).toThrow(
          "positive safe integer",
        );
        expect(() => Rational.convergentsFromCF([3n, 7n], count)).toThrow(
          "positive safe integer",
        );
      }

      for (const index of [1.5, NaN, Infinity]) {
        expect(() => value.getConvergent(index)).toThrow(
          "nonnegative safe integer",
        );
      }
    });

    it("computes convergents from arrays and strings", () => {
      expect(
        Rational.convergentsFromCF([3n, 7n, 15n]).map((term) => term.toString()),
      ).toEqual(["3", "22/7", "333/106"]);
      expect(
        Rational.convergentsFromCF("3.~7~15", 2).map((term) => term.toString()),
      ).toEqual(["3", "22/7"]);
    });

    it("returns a nonnegative approximation error", () => {
      const target = new Rational(1, 2);

      expect(new Rational(1, 3).approximationError(target).toString()).toBe(
        "1/6",
      );
      expect(new Rational(2, 3).approximationError(target).toString()).toBe(
        "1/6",
      );
    });
  });
});

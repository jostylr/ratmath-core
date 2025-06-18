import { describe, expect, it, test } from "bun:test";
import { Rational, RationalInterval } from "../index.js";

describe("RationalInterval", () => {
  describe("constructor", () => {
    it("creates an interval from two rationals", () => {
      const low = new Rational(1, 2);
      const high = new Rational(3, 4);
      const interval = new RationalInterval(low, high);

      expect(interval.low.equals(low)).toBe(true);
      expect(interval.high.equals(high)).toBe(true);
    });

    it("creates an interval from strings", () => {
      const interval = new RationalInterval("1/2", "3/4");

      expect(interval.low.equals(new Rational(1, 2))).toBe(true);
      expect(interval.high.equals(new Rational(3, 4))).toBe(true);
    });

    it("creates an interval from numbers", () => {
      const interval = new RationalInterval(1, 2);

      expect(interval.low.equals(new Rational(1))).toBe(true);
      expect(interval.high.equals(new Rational(2))).toBe(true);
    });

    it("orders the endpoints correctly", () => {
      const interval = new RationalInterval("3/4", "1/2");

      expect(interval.low.equals(new Rational(1, 2))).toBe(true);
      expect(interval.high.equals(new Rational(3, 4))).toBe(true);
    });
  });

  describe("arithmetic operations", () => {
    it("adds two intervals", () => {
      const a = new RationalInterval("1/2", "3/4");
      const b = new RationalInterval("1/4", "1/2");
      const result = a.add(b);

      expect(result.low.equals(new Rational(3, 4))).toBe(true);
      expect(result.high.equals(new Rational(5, 4))).toBe(true);
    });

    it("subtracts two intervals", () => {
      const a = new RationalInterval("1/2", "3/4");
      const b = new RationalInterval("1/4", "1/2");
      const result = a.subtract(b);

      expect(result.low.equals(new Rational(0))).toBe(true);
      expect(result.high.equals(new Rational(1, 2))).toBe(true);
    });

    it("multiplies two positive intervals", () => {
      const a = new RationalInterval("1/2", "3/4");
      const b = new RationalInterval("2/3", "4/3");
      const result = a.multiply(b);

      expect(result.low.equals(new Rational(1, 3))).toBe(true);
      expect(result.high.equals(new Rational(1))).toBe(true);
    });

    it("multiplies intervals with negative values", () => {
      const a = new RationalInterval("-1/2", "3/4");
      const b = new RationalInterval("-2/3", "1/3");
      const result = a.multiply(b);

      // Min and max of products: -1/2 * 1/3, -1/2 * -2/3, 3/4 * 1/3, 3/4 * -2/3
      // = -1/6, 1/3, 1/4, -1/2
      expect(result.low.equals(new Rational(-1, 2))).toBe(true);
      expect(result.high.equals(new Rational(1, 3))).toBe(true);
    });

    it("divides two intervals not containing zero", () => {
      const a = new RationalInterval("1/2", "3/4");
      const b = new RationalInterval("2/3", "4/3");
      const result = a.divide(b);

      // Min and max of divisions: 1/2 ÷ 2/3, 1/2 ÷ 4/3, 3/4 ÷ 2/3, 3/4 ÷ 4/3
      // = 3/4, 3/8, 9/8, 9/16
      expect(result.low.equals(new Rational(3, 8))).toBe(true);
      expect(result.high.equals(new Rational(9, 8))).toBe(true);
    });

    it("throws an error when dividing by an interval containing zero", () => {
      const a = new RationalInterval("1/2", "3/4");
      const b = new RationalInterval("-1/2", "1/2");

      expect(() => a.divide(b)).toThrow(
        "Cannot divide by an interval containing zero",
      );
    });
  });

  describe("static constants", () => {
    it("provides a zero constant", () => {
      expect(RationalInterval.zero.low.equals(Rational.zero)).toBe(true);
      expect(RationalInterval.zero.high.equals(Rational.zero)).toBe(true);
    });

    it("provides a one constant", () => {
      expect(RationalInterval.one.low.equals(Rational.one)).toBe(true);
      expect(RationalInterval.one.high.equals(Rational.one)).toBe(true);
    });

    it("provides a unit interval constant", () => {
      expect(RationalInterval.unitInterval.low.equals(Rational.zero)).toBe(
        true,
      );
      expect(RationalInterval.unitInterval.high.equals(Rational.one)).toBe(
        true,
      );
    });
  });

  describe("exponentiation", () => {
    it("raises a positive interval to a positive power", () => {
      const interval = new RationalInterval("1/2", "3/4");
      const result = interval.pow(2);

      expect(result.low.equals(new Rational(1, 4))).toBe(true);
      expect(result.high.equals(new Rational(9, 16))).toBe(true);
    });

    it("raises a negative interval to an even power", () => {
      const interval = new RationalInterval("-3/4", "-1/4");
      const result = interval.pow(2);

      expect(result.low.equals(new Rational(1, 16))).toBe(true);
      expect(result.high.equals(new Rational(9, 16))).toBe(true);
    });

    it("raises a negative interval to an odd power", () => {
      const interval = new RationalInterval("-3/4", "-1/4");
      const result = interval.pow(3);

      expect(result.low.equals(new Rational(-27, 64))).toBe(true);
      expect(result.high.equals(new Rational(-1, 64))).toBe(true);
    });

    it("raises an interval containing zero to an even power", () => {
      const interval = new RationalInterval("-1/2", "3/4");
      const result = interval.pow(2);

      expect(result.low.equals(new Rational(0))).toBe(true);
      expect(result.high.equals(new Rational(9, 16))).toBe(true);
    });

    it("raises an interval to power 0", () => {
      const interval = new RationalInterval("1/2", "3/4");
      const result = interval.pow(0);

      expect(result.low.equals(new Rational(1))).toBe(true);
      expect(result.high.equals(new Rational(1))).toBe(true);
    });

    it("raises an interval to a negative power", () => {
      const interval = new RationalInterval("2/3", "4/3");
      const result = interval.pow(-1);

      expect(result.low.equals(new Rational(3, 4))).toBe(true);
      expect(result.high.equals(new Rational(3, 2))).toBe(true);
    });

    it("throws an error when raising zero to power 0", () => {
      const interval = new RationalInterval(0, 0);

      expect(() => interval.pow(0)).toThrow(
        "Zero cannot be raised to the power of zero",
      );
    });

    it("throws an error when raising an interval containing zero to power 0", () => {
      const interval = new RationalInterval("-1/2", "1/2");

      expect(() => interval.pow(0)).toThrow(
        "Cannot raise an interval containing zero to the power of zero",
      );
    });

    it("throws an error when raising an interval containing zero to a negative power", () => {
      const interval = new RationalInterval("-1/2", "1/2");

      expect(() => interval.pow(-1)).toThrow(
        "Cannot raise an interval containing zero to a negative power",
      );
    });
  });

  describe("multiplicative exponentiation", () => {
    it("raises a positive interval to a positive power using multiplication", () => {
      const interval = new RationalInterval("1/2", "3/4");
      const result = interval.mpow(2);

      // mpow should be equivalent to interval * interval
      const expected = interval.multiply(interval);
      expect(result.equals(expected)).toBe(true);
    });

    it("handles higher powers with multiplicative exponentiation", () => {
      const interval = new RationalInterval("1/2", "3/4");
      const result = interval.mpow(3);

      // mpow should be equivalent to interval * interval * interval
      const expected = interval.multiply(interval).multiply(interval);
      expect(result.equals(expected)).toBe(true);
    });

    it("raises an interval to a negative power using reciprocal and multiplication", () => {
      const interval = new RationalInterval("2", "3");
      const result = interval.mpow(-2);

      // Should be equivalent to (1/interval)^2
      const reciprocal = new RationalInterval("1/3", "1/2");
      const expected = reciprocal.multiply(reciprocal);
      expect(result.equals(expected)).toBe(true);
    });

    it("throws an error for exponent 0", () => {
      const interval = new RationalInterval("1/2", "3/4");

      expect(() => interval.mpow(0)).toThrow(
        "Multiplicative exponentiation requires at least one factor",
      );
    });
  });

  describe("negation and reciprocation", () => {
    it("negates an interval", () => {
      const interval = new RationalInterval("1/2", "3/4");
      const result = interval.negate();

      expect(result.low.equals(new Rational(-3, 4))).toBe(true);
      expect(result.high.equals(new Rational(-1, 2))).toBe(true);
    });

    it("reciprocates an interval not containing zero", () => {
      const interval = new RationalInterval("2/3", "4/3");
      const result = interval.reciprocate();

      expect(result.low.equals(new Rational(3, 4))).toBe(true);
      expect(result.high.equals(new Rational(3, 2))).toBe(true);
    });

    it("throws an error when reciprocating an interval containing zero", () => {
      const interval = new RationalInterval("-1/2", "1/2");

      expect(() => interval.reciprocate()).toThrow(
        "Cannot reciprocate an interval containing zero",
      );
    });
  });

  describe("interval operations", () => {
    it("checks for overlap between intervals", () => {
      const a = new RationalInterval("1/2", "3/4");
      const b = new RationalInterval("2/3", "5/6");
      const c = new RationalInterval("4/5", "6/7");

      expect(a.overlaps(b)).toBe(true);
      expect(a.overlaps(c)).toBe(false);
    });

    it("checks if one interval contains another", () => {
      const a = new RationalInterval("1/2", "3/4");
      const b = new RationalInterval("1/2", "2/3");
      const c = new RationalInterval("1/3", "4/5");

      expect(a.contains(b)).toBe(true);
      expect(a.contains(c)).toBe(false);
    });

    it("checks if an interval contains a value", () => {
      const interval = new RationalInterval("1/2", "3/4");

      expect(interval.containsValue("2/3")).toBe(true);
      expect(interval.containsValue("1/3")).toBe(false);
      expect(interval.containsValue("4/5")).toBe(false);
    });

    it("computes the intersection of two intervals", () => {
      const a = new RationalInterval("1/2", "3/4");
      const b = new RationalInterval("2/3", "5/6");
      const c = new RationalInterval("4/5", "6/7");

      const intersectionAB = a.intersection(b);
      const intersectionAC = a.intersection(c);

      expect(intersectionAB).not.toBeNull();
      expect(intersectionAB.low.equals(new Rational(2, 3))).toBe(true);
      expect(intersectionAB.high.equals(new Rational(3, 4))).toBe(true);

      expect(intersectionAC).toBeNull();
    });

    it("computes the union of two overlapping intervals", () => {
      const a = new RationalInterval("1/2", "3/4");
      const b = new RationalInterval("2/3", "5/6");
      const union = a.union(b);

      expect(union).not.toBeNull();
      expect(union.low.equals(new Rational(1, 2))).toBe(true);
      expect(union.high.equals(new Rational(5, 6))).toBe(true);
    });

    it("returns null for union of disjoint intervals", () => {
      const a = new RationalInterval("1/2", "3/4");
      const c = new RationalInterval("4/5", "6/7");

      expect(a.union(c)).toBeNull();
    });
  });

  describe("conversion", () => {
    it("converts an interval to string", () => {
      const interval = new RationalInterval("1/2", "3/4");

      expect(interval.toString()).toBe("1/2:3/4");
    });

    it("converts an interval to mixed number string format", () => {
      const interval = new RationalInterval(
        new Rational(17, 3), // 5..2/3
        new Rational(27, 4), // 6..3/4
      );

      expect(interval.toMixedString()).toBe("5..2/3:6..3/4");
    });

    it("handles zero and negative values in mixed string format", () => {
      const interval = new RationalInterval(
        new Rational(-5, 2), // -2..1/2
        new Rational(3, 4), // 0..3/4
      );

      expect(interval.toMixedString()).toBe("-2..1/2:3/4");
    });

    it("handles whole numbers in mixed string format", () => {
      const interval = new RationalInterval("3", "5");

      expect(interval.toMixedString()).toBe("3:5");
    });
  });

  describe("static methods", () => {
    it("creates a point interval", () => {
      const interval = RationalInterval.point("2/3");

      expect(interval.low.equals(new Rational(2, 3))).toBe(true);
      expect(interval.high.equals(new Rational(2, 3))).toBe(true);
    });

    it("creates an interval from a string", () => {
      const interval = RationalInterval.fromString("1/2:3/4");

      expect(interval.low.equals(new Rational(1, 2))).toBe(true);
      expect(interval.high.equals(new Rational(3, 4))).toBe(true);
    });

    it("throws an error for invalid string format", () => {
      expect(() => RationalInterval.fromString("1/2")).toThrow(
        "Invalid interval format",
      );
    });
  });

  describe("new methods", () => {
    describe("mediant", () => {
      it("calculates the mediant of interval endpoints", () => {
        const interval = new RationalInterval("1/2", "2/3");
        const mediant = interval.mediant();

        // Mediant of 1/2 and 2/3 is (1+2)/(2+3) = 3/5
        expect(mediant.equals(new Rational(3, 5))).toBe(true);
      });

      it("works with integer endpoints", () => {
        const interval = new RationalInterval(1, 3);
        const mediant = interval.mediant();

        // Mediant of 1/1 and 3/1 is (1+3)/(1+1) = 4/2 = 2/1
        expect(mediant.equals(new Rational(2, 1))).toBe(true);
      });
    });

    describe("midpoint", () => {
      it("calculates the arithmetic midpoint", () => {
        const interval = new RationalInterval("1/2", "3/2");
        const midpoint = interval.midpoint();

        // Midpoint of 1/2 and 3/2 is (1/2 + 3/2)/2 = 2/2 / 2 = 1/2
        expect(midpoint.equals(new Rational(1, 1))).toBe(true);
      });

      it("works with different denominators", () => {
        const interval = new RationalInterval("1/3", "1/2");
        const midpoint = interval.midpoint();

        // Midpoint of 1/3 and 1/2 is (1/3 + 1/2)/2 = (2/6 + 3/6)/2 = 5/6 / 2 = 5/12
        expect(midpoint.equals(new Rational(5, 12))).toBe(true);
      });
    });

    describe("shortestDecimal", () => {
      it("finds integers when they exist in the interval", () => {
        const interval = new RationalInterval("1/2", "3/2");
        const shortest = interval.shortestDecimal();

        // Should find 1 (denominator = 10^0 = 1)
        expect(shortest.equals(new Rational(1, 1))).toBe(true);
      });

      it("finds decimal fractions with base 10", () => {
        const interval = new RationalInterval("1/5", "2/5");
        const shortest = interval.shortestDecimal();

        // Should find 2/10 = 1/5 (first valid rational with denominator 10^1)
        expect(shortest.equals(new Rational(1, 5))).toBe(true);
      });

      it("works with different bases", () => {
        const interval = new RationalInterval("1/4", "3/4");
        const shortest = interval.shortestDecimal(2);

        // With base 2, should find 1/2 (denominator = 2^1)
        expect(shortest.equals(new Rational(1, 2))).toBe(true);
      });

      it("throws error for invalid base", () => {
        const interval = new RationalInterval("1/2", "3/4");
        expect(() => interval.shortestDecimal(1)).toThrow(
          "Base must be greater than 1",
        );
        expect(() => interval.shortestDecimal(0)).toThrow(
          "Base must be greater than 1",
        );
      });

      it("uses mathematical bound efficiently for large intervals", () => {
        // Large interval with length 1, should find integer quickly
        const largeInterval = new RationalInterval("10", "11");
        const shortest = largeInterval.shortestDecimal();

        // Should find 10 or 11 (denominator = 1)
        expect(shortest.denominator).toBe(1n);
        expect(shortest.numerator >= 10n && shortest.numerator <= 11n).toBe(
          true,
        );
      });

      it("handles very small intervals correctly", () => {
        // Very small interval: [1/1000, 1/999]
        const smallInterval = new RationalInterval("1/1000", "1/999");
        const shortest = smallInterval.shortestDecimal();

        // Should be within the interval
        expect(smallInterval.containsValue(shortest)).toBe(true);
      });

      it("works with point intervals that have power-of-base representation", () => {
        const pointInterval = new RationalInterval("1/4", "1/4");
        const shortest = pointInterval.shortestDecimal(2);

        // Should return the exact value since 1/4 = 1/2^2
        expect(shortest.equals(new Rational(1, 4))).toBe(true);
      });

      it("returns null for point intervals without power-of-base representation", () => {
        const pointInterval = new RationalInterval("3/7", "3/7");
        const shortest = pointInterval.shortestDecimal();

        // Should return null since 3/7 cannot be represented as p/10^k
        expect(shortest).toBe(null);
      });
    });

    describe("randomRational", () => {
      it("returns a rational within the interval", () => {
        const interval = new RationalInterval("1/4", "3/4");
        const random = interval.randomRational(100);

        expect(interval.containsValue(random)).toBe(true);
      });

      it("returns different values on multiple calls (probabilistically)", () => {
        const interval = new RationalInterval("0", "1");
        const values = new Set();

        // Generate multiple random values
        for (let i = 0; i < 10; i++) {
          const random = interval.randomRational(50);
          values.add(random.toString());
        }

        // Should have some variety (this is probabilistic, so we check for at least 2 different values)
        expect(values.size).toBeGreaterThan(1);
      });

      it("works with point intervals", () => {
        const interval = new RationalInterval("1/2", "1/2");
        const random = interval.randomRational(100);

        expect(random.equals(new Rational(1, 2))).toBe(true);
      });

      it("throws error for invalid maxDenominator", () => {
        const interval = new RationalInterval("1/2", "3/4");
        expect(() => interval.randomRational(0)).toThrow(
          "maxDenominator must be positive",
        );
        expect(() => interval.randomRational(-1)).toThrow(
          "maxDenominator must be positive",
        );
      });
    });
  });
});

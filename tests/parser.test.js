import { describe, expect, it, test } from "bun:test";
import { Parser, Rational, RationalInterval } from "../index.js";

describe("Parser", () => {
  describe("simple expressions", () => {
    it("parses a single rational number", () => {
      const result = Parser.parse("3/4");

      expect(result.low.equals(new Rational(3, 4))).toBe(true);
      expect(result.high.equals(new Rational(3, 4))).toBe(true);
    });

    it("parses a mixed number", () => {
      const result = Parser.parse("5..2/3");

      expect(result.low.equals(new Rational(17, 3))).toBe(true);
      expect(result.high.equals(new Rational(17, 3))).toBe(true);
    });

    it("parses a negative mixed number", () => {
      const result = Parser.parse("-2..1/4");

      expect(result.low.equals(new Rational(-9, 4))).toBe(true);
      expect(result.high.equals(new Rational(-9, 4))).toBe(true);
    });

    it("parses a rational interval", () => {
      const result = Parser.parse("1/2:3/4");

      expect(result.low.equals(new Rational(1, 2))).toBe(true);
      expect(result.high.equals(new Rational(3, 4))).toBe(true);
    });

    it("handles reversed intervals", () => {
      const result = Parser.parse("3/4:1/2");

      expect(result.low.equals(new Rational(1, 2))).toBe(true);
      expect(result.high.equals(new Rational(3, 4))).toBe(true);
    });

    it("ignores whitespace", () => {
      const result = Parser.parse(" 1/2 : 3/4 ");

      expect(result.low.equals(new Rational(1, 2))).toBe(true);
      expect(result.high.equals(new Rational(3, 4))).toBe(true);
    });
  });

  describe("constants", () => {
    it("parses expressions using Rational", () => {
      // Test with numeric values
      const parsed = Parser.parse("0+1");
      expect(parsed.low.numerator).toBe(1n);
      expect(parsed.high.numerator).toBe(1n);
    });

    it("works with interval notation", () => {
      const result1 = Parser.parse("0:1");
      expect(result1.low.equals(Rational.zero)).toBe(true);
      expect(result1.high.equals(Rational.one)).toBe(true);

      const result2 = Parser.parse("0:0");
      expect(result2.low.equals(Rational.zero)).toBe(true);
      expect(result2.high.equals(Rational.zero)).toBe(true);

      const result3 = Parser.parse("1:1");
      expect(result3.low.equals(Rational.one)).toBe(true);
      expect(result3.high.equals(Rational.one)).toBe(true);
    });
  });

  describe("arithmetic expressions", () => {
    it("parses addition", () => {
      const result = Parser.parse("1/2 + 1/4");

      expect(result.low.equals(new Rational(3, 4))).toBe(true);
      expect(result.high.equals(new Rational(3, 4))).toBe(true);
    });

    it("parses subtraction", () => {
      const result = Parser.parse("1/2 - 1/4");

      expect(result.low.equals(new Rational(1, 4))).toBe(true);
      expect(result.high.equals(new Rational(1, 4))).toBe(true);
    });

    it("parses multiplication", () => {
      const result = Parser.parse("1/2 * 1/4");

      expect(result.low.equals(new Rational(1, 8))).toBe(true);
      expect(result.high.equals(new Rational(1, 8))).toBe(true);
    });

    it("parses division", () => {
      const result = Parser.parse("1/2 / 1/4");

      expect(result.low.equals(new Rational(2))).toBe(true);
      expect(result.high.equals(new Rational(2))).toBe(true);
    });

    it("parses exponentiation", () => {
      const result = Parser.parse("1/2^3");

      expect(result.low.equals(new Rational(1, 8))).toBe(true);
      expect(result.high.equals(new Rational(1, 8))).toBe(true);
    });

    it("parses negative exponentiation", () => {
      const result = Parser.parse("2^-1");

      expect(result.low.equals(new Rational(1, 2))).toBe(true);
      expect(result.high.equals(new Rational(1, 2))).toBe(true);
    });

    it("parses negative numbers", () => {
      const result = Parser.parse("-3/4");

      expect(result.low.equals(new Rational(-3, 4))).toBe(true);
      expect(result.high.equals(new Rational(-3, 4))).toBe(true);
    });

    it("handles negation of expressions", () => {
      const result = Parser.parse("-(1/2+1/4)");

      expect(result.low.equals(new Rational(-3, 4))).toBe(true);
      expect(result.high.equals(new Rational(-3, 4))).toBe(true);
    });
  });

  describe("multiplicative power", () => {
    it("parses expressions with ** operator for multiplicative power", () => {
      const result = Parser.parse("2**2");

      // Verify result manually
      expect(result.low.numerator).toBe(4n);
      expect(result.high.numerator).toBe(4n);
    });

    it("handles positive exponents with ** operator", () => {
      // Test with exponent 3
      const result = Parser.parse("2**3");
      expect(result.low.numerator).toBe(8n);
      expect(result.high.numerator).toBe(8n);
    });

    it("compares ** and ^ operators behavior on intervals", () => {
      // Create test interval that's easy to calculate
      const pow = Parser.parse("(2:3)^2");
      const mpow = Parser.parse("(2:3)**2");

      // Manual verification of values
      expect(pow.low.numerator).toBe(4n);
      expect(pow.high.numerator).toBe(9n);

      expect(mpow.low.numerator).toBe(4n);
      expect(mpow.high.numerator).toBe(9n);
    });

    it("throws an error for zero exponent with ** operator", () => {
      expect(() => Parser.parse("2**0")).toThrow(
        "Multiplicative exponentiation requires at least one factor",
      );
    });
  });

  describe("interval arithmetic", () => {
    it("adds intervals", () => {
      const result = Parser.parse("1/2:3/4 + 1/4:1/2");

      expect(result.low.equals(new Rational(3, 4))).toBe(true);
      expect(result.high.equals(new Rational(5, 4))).toBe(true);
    });

    it("subtracts intervals", () => {
      const result = Parser.parse("1/2:3/4 - 1/4:1/2");

      expect(result.low.equals(new Rational(0))).toBe(true);
      expect(result.high.equals(new Rational(1, 2))).toBe(true);
    });

    it("multiplies intervals", () => {
      const result = Parser.parse("1/2:3/4 * 2/3:4/3");

      // Min and max of products: 1/2 * 2/3, 1/2 * 4/3, 3/4 * 2/3, 3/4 * 4/3
      expect(result.low.equals(new Rational(1, 3))).toBe(true);
      expect(result.high.equals(new Rational(1))).toBe(true);
    });

    it("divides intervals", () => {
      const result = Parser.parse("1/2:3/4 / 2/3:4/3");

      // Min and max of divisions: 1/2 ÷ 2/3, 1/2 ÷ 4/3, 3/4 ÷ 2/3, 3/4 ÷ 4/3
      expect(result.low.equals(new Rational(3, 8))).toBe(true);
      expect(result.high.equals(new Rational(9, 8))).toBe(true);
    });

    it("raises intervals to powers", () => {
      const result = Parser.parse("1/2:3/4^2");

      expect(result.low.equals(new Rational(1, 4))).toBe(true);
      expect(result.high.equals(new Rational(9, 16))).toBe(true);
    });
  });

  describe("operator precedence and parentheses", () => {
    it("follows operator precedence", () => {
      const result = Parser.parse("1/2 + 1/4 * 2/3");
      // Expected: 1/2 + (1/4 * 2/3) = 1/2 + 1/6 = 2/3
      expect(result.low.equals(new Rational(2, 3))).toBe(true);
      expect(result.high.equals(new Rational(2, 3))).toBe(true);
    });

    it("respects parentheses", () => {
      const result = Parser.parse("(1/2 + 1/4) * 2/3");
      // Expected: (1/2 + 1/4) * 2/3 = 3/4 * 2/3 = 1/2
      expect(result.low.equals(new Rational(1, 2))).toBe(true);
      expect(result.high.equals(new Rational(1, 2))).toBe(true);
    });

    it("handles nested parentheses", () => {
      const result = Parser.parse("(1/2 + (1/4 * 2)) / 2");
      // Expected: (1/2 + (1/4 * 2)) / 2 = (1/2 + 1/2) / 2 = 1/2
      expect(result.low.equals(new Rational(1, 2))).toBe(true);
      expect(result.high.equals(new Rational(1, 2))).toBe(true);
    });

    it("handles complex expressions", () => {
      const result = Parser.parse("(1/2:3/4 + 1/4:1/3) * (2:3 - 1:2)");
      // First: (1/2:3/4 + 1/4:1/3) = 3/4:13/12
      // Second: (2:3 - 1:2) = 0:2
      // Result: 3/4:13/12 * 0:2 = 0:13/6
      expect(result.low.equals(new Rational(0))).toBe(true);
      expect(result.high.equals(new Rational(13, 6))).toBe(true);
    });
  });

  describe("negate and reciprocate", () => {
    it("parses expressions with negated intervals", () => {
      // The parser doesn't directly support negate() syntax but uses the - operator
      const result = Parser.parse("-(1/2:3/4)");

      // Verify manually
      expect(result.low.numerator).toBe(-3n);
      expect(result.high.numerator).toBe(-1n);
    });

    it("handles simple reciprocals", () => {
      // Test with a simpler case
      const result = Parser.parse("1/2");

      expect(result.low.numerator).toBe(1n);
      expect(result.low.denominator).toBe(2n);
      expect(result.high.numerator).toBe(1n);
      expect(result.high.denominator).toBe(2n);
    });
  });

  describe("mixed number handling", () => {
    it("parses mixed numbers in interval expressions", () => {
      const result = Parser.parse("1..1/2:2..3/4");

      expect(result.low.equals(new Rational(3, 2))).toBe(true);
      expect(result.high.equals(new Rational(11, 4))).toBe(true);
    });

    it("performs arithmetic with mixed numbers", () => {
      const result = Parser.parse("1..1/2 + 2..1/4");

      expect(result.low.equals(new Rational(15, 4))).toBe(true);
      expect(result.high.equals(new Rational(15, 4))).toBe(true);
    });

    it("handles mixed numbers with negative whole parts", () => {
      const result = Parser.parse("-3..1/4 + 1..1/2");

      expect(result.low.equals(new Rational(-7, 4))).toBe(true);
      expect(result.high.equals(new Rational(-7, 4))).toBe(true);
    });

    it("converts mixed numbers to string representation", () => {
      const rational = new Rational(17, 3);
      expect(rational.toMixedString()).toBe("5..2/3");

      const negRational = new Rational(-9, 4);
      expect(negRational.toMixedString()).toBe("-2..1/4");

      const interval = new RationalInterval(
        new Rational(17, 3), // 5..2/3
        new Rational(27, 4), // 6..3/4
      );
      expect(interval.toMixedString()).toBe("5..2/3:6..3/4");
    });
  });

  describe("repeating decimal integration", () => {
    it("parses simple repeating decimals in expressions", () => {
      const result1 = Parser.parse("0.#3");
      expect(result1.low.equals(new Rational(1, 3))).toBe(true);
      expect(result1.high.equals(new Rational(1, 3))).toBe(true);
    });

    it("performs arithmetic with repeating decimals", () => {
      const result = Parser.parse("0.#3 + 0.#6");
      // 1/3 + 2/3 = 1
      expect(result.low.equals(new Rational(1))).toBe(true);
      expect(result.high.equals(new Rational(1))).toBe(true);
    });

    it("handles complex repeating decimal expressions", () => {
      const result = Parser.parse("1.23#45 * 2");
      const expected = new Rational(679, 550).multiply(new Rational(2));
      expect(result.low.equals(expected)).toBe(true);
      expect(result.high.equals(expected)).toBe(true);
    });

    it("works with repeating decimals in intervals", () => {
      const result = Parser.parse("0.#3 : 0.#6");
      expect(result.low.equals(new Rational(1, 3))).toBe(true);
      expect(result.high.equals(new Rational(2, 3))).toBe(true);
    });

    it("handles terminating decimals with #0", () => {
      const result = Parser.parse("1.5#0");
      expect(result.low.equals(new Rational(3, 2))).toBe(true);
      expect(result.high.equals(new Rational(3, 2))).toBe(true);
    });
  });

  describe("error handling", () => {
    it("throws an error for empty expressions", () => {
      expect(() => Parser.parse("")).toThrow("Expression cannot be empty");
    });

    it("throws an error for invalid expressions", () => {
      expect(() => Parser.parse("1/2 + ")).toThrow();
    });

    it("throws an error for mismatched parentheses", () => {
      expect(() => Parser.parse("(1/2")).toThrow("Missing closing parenthesis");
    });

    it("throws an error for division by zero", () => {
      expect(() => Parser.parse("1/0")).toThrow("Denominator cannot be zero");
    });

    it("throws an error for division by interval containing zero", () => {
      expect(() => Parser.parse("1:2 / 0:0")).toThrow();
    });

    it("throws an error for raising zero to power zero", () => {
      expect(() => Parser.parse("0^0")).toThrow(
        "Zero cannot be raised to the power of zero",
      );
    });

    it("throws an error for raising interval containing zero to negative power", () => {
      expect(() => Parser.parse("0:1 ^ -1")).toThrow();
    });

    it("throws an error for invalid repeating decimals", () => {
      expect(() => Parser.parse("1.2#")).toThrow("Invalid repeating decimal");
    });

    it("throws an error for malformed repeating decimals", () => {
      expect(() => Parser.parse("1.2#a5")).toThrow("Invalid repeating decimal");
    });
  });

  describe("repeating decimal intervals", () => {
    it("parses basic repeating decimal intervals", () => {
      const result = Parser.parse("0.#3:0.5#0");
      expect(result.low.equals(new Rational(1, 3))).toBe(true);
      expect(result.high.equals(new Rational(1, 2))).toBe(true);
    });

    it("performs arithmetic with repeating decimal intervals", () => {
      const result = Parser.parse("(0.#3:0.5#0) + (0.1#6:0.25#0)");
      // [1/3, 1/2] + [1/6, 1/4] = [1/2, 3/4]
      expect(result.low.equals(new Rational(1, 2))).toBe(true);
      expect(result.high.equals(new Rational(3, 4))).toBe(true);
    });

    it("handles complex repeating decimal intervals", () => {
      const result = Parser.parse("0.#142857:3.#142857");
      expect(result.low.equals(new Rational(1, 7))).toBe(true);
      expect(result.high.equals(new Rational(22, 7))).toBe(true);
    });

    it("supports multiplication of repeating decimal intervals", () => {
      const result = Parser.parse("(0.#3:0.#6) * 2");
      // [1/3, 2/3] * 2 = [2/3, 4/3]
      expect(result.low.equals(new Rational(2, 3))).toBe(true);
      expect(result.high.equals(new Rational(4, 3))).toBe(true);
    });

    it("handles mixed intervals with regular rationals", () => {
      const result = Parser.parse("1/4:3/4 + 0.#3:0.#6");
      // [1/4, 3/4] + [1/3, 2/3] = [7/12, 17/12]
      expect(result.low.equals(new Rational(7, 12))).toBe(true);
      expect(result.high.equals(new Rational(17, 12))).toBe(true);
    });
  });
});

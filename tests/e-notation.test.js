import { describe, expect, it, test } from "bun:test";
import { Parser, Integer, Rational, RationalInterval } from "../index.js";

describe("E Notation", () => {
  describe("Standard Decimals", () => {
    it("parses integer E notation as exact values", () => {
      const result = Parser.parse("5E-3");
      expect(result).toBeInstanceOf(Rational);
      expect(result.equals(new Rational(5, 1000))).toBe(true);
    });

    it("parses positive E notation with integers", () => {
      const result = Parser.parse("3E2");
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(300n);
    });

    it("parses decimal E notation with intervals", () => {
      // With type-aware parsing, 1.23 becomes exact Rational, then E4 makes it exact integer
      const result = Parser.parse("1.23E4");
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(12300n);
    });

    it("parses decimal E notation with negative exponent", () => {
      // With type-aware parsing, 5.0 becomes exact Rational, then E-3 makes it exact
      const result = Parser.parse("5.0E-3");
      expect(result).toBeInstanceOf(Rational);
      expect(result.equals(new Rational(5, 1000))).toBe(true);
    });
  });

  describe("Decimals with Uncertainty", () => {
    it("allows E notation in interval offsets", () => {
      // 1.23[+2E2,-3E3] means +200, -3000 in thousandths place
      // Base: 1.23, offsets: +0.2, -3.0 → -1.77:1.43
      const result = Parser.parse("1.23[+2E2,-3E3]");
      expect(result.low.equals(new Rational(-177, 100))).toBe(true);
      expect(result.high.equals(new Rational(143, 100))).toBe(true);
    });

    it("allows E notation outside interval", () => {
      // 1.23[2,3]E5 → (1.232:1.233)E5 → 123200:123300
      const result = Parser.parse("1.23[2,3]E5");
      expect(result.low.equals(new Rational(123200))).toBe(true);
      expect(result.high.equals(new Rational(123300))).toBe(true);
    });

    it("rejects E notation inside center value", () => {
      expect(() => Parser.parse("1.23E4[2,3]")).toThrow();
    });
  });

  describe("Intervals", () => {
    it("applies E notation tightly to right operand", () => {
      // 1.23:2.34E3 → 1.23:2340
      const result = Parser.parse("1.23:2.34E3");
      expect(result.low.equals(new Rational(123, 100))).toBe(true);
      expect(result.high.equals(new Rational(2340))).toBe(true);
    });

    it("applies E notation to both sides with parentheses", () => {
      // (1.23:2.34)E3 → 1230:2340
      const result = Parser.parse("(1.23:2.34)E3");
      expect(result.low.equals(new Rational(1230))).toBe(true);
      expect(result.high.equals(new Rational(2340))).toBe(true);
    });

    it("handles negative E notation in intervals", () => {
      // 1.5:2.5E-1 → 1.5:0.25 → [0.25, 1.5] (ordered)
      const result = Parser.parse("1.5:2.5E-1");
      expect(result.low.equals(new Rational(1, 4))).toBe(true); // 0.25
      expect(result.high.equals(new Rational(3, 2))).toBe(true); // 1.5
    });
  });

  describe("Rational Numbers", () => {
    it("rejects E notation directly after fraction", () => {
      expect(() => Parser.parse("5/4E2")).toThrow();
    });

    it("allows E notation with parentheses around fraction", () => {
      // (5/4)E2 → (5/4) × 100 = 125
      const result = Parser.parse("(5/4)E2");
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(125n);
    });

    it("allows E notation in denominator with parentheses", () => {
      // 5/(4E2) → 5/400 = 1/80
      const result = Parser.parse("5/(4E2)");
      expect(result).toBeInstanceOf(Rational);
      expect(result.equals(new Rational(1, 80))).toBe(true);
    });

    it("rejects E notation directly after mixed number", () => {
      expect(() => Parser.parse("1..1/4E3")).toThrow();
    });

    it("allows E notation with parentheses around mixed number", () => {
      // (1..1/4)E3 → (5/4) × 1000 = 1250
      const result = Parser.parse("(1..1/4)E3");
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(1250n);
    });
  });

  describe("Precedence and Associativity", () => {
    it("binds E more tightly than multiplication", () => {
      // 2 * 3E2 → 2 * 300 = 600
      const result = Parser.parse("2 * 3E2");
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(600n);
    });

    it("binds E more tightly than addition", () => {
      // 1 + 2E2 → 1 + 200 = 201
      const result = Parser.parse("1 + 2E2");
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(201n);
    });

    it("handles spaces around E", () => {
      // "1.3:2.4 E2" with space should apply E2 to both
      const result = Parser.parse("1.3:2.4 E2");
      expect(result.low.equals(new Rational(130))).toBe(true);
      expect(result.high.equals(new Rational(240))).toBe(true);
    });

    it("handles no spaces around E", () => {
      // "1.3:2.4E2" without space should apply E2 only to 2.4
      // 1.3 as exact rational, 2.4E2 = 240
      const result = Parser.parse("1.3:2.4E2");
      expect(result.low.equals(new Rational(13, 10))).toBe(true); // 1.3
      expect(result.high.equals(new Rational(240))).toBe(true);
    });
  });

  describe("Complex Expressions", () => {
    it("handles E notation in complex arithmetic", () => {
      // (1E2 + 2E1) * 3E-1 → (100 + 20) * 0.3 = 120 * 0.3 = 36
      const result = Parser.parse("(1E2 + 2E1) * 3E-1");
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(36n);
    });

    it("handles E notation with exponentiation", () => {
      // (2E1)^2 → 20^2 = 400
      const result = Parser.parse("(2E1)^2");
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(400n);
    });

    it("handles E notation with intervals in complex expressions", () => {
      // (1:2E1) + (3E1:4E1) → (1:20) + (30:40) = 31:60
      const result = Parser.parse("(1:2E1) + (3E1:4E1)");
      expect(result.low.equals(new Rational(31))).toBe(true);
      expect(result.high.equals(new Rational(60))).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("handles zero with E notation", () => {
      // 0E5 → 0
      const result = Parser.parse("0E5");
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(0n);
    });

    it("handles negative numbers with E notation", () => {
      // -5E2 → -500
      const result = Parser.parse("-5E2");
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(-500n);
    });

    it("handles large exponents", () => {
      // 1E10 → 10000000000
      const result = Parser.parse("1E10");
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(10000000000n);
    });

    it("handles very negative exponents", () => {
      // 1E-10 → 0.0000000001
      const result = Parser.parse("1E-10");
      expect(result).toBeInstanceOf(Rational);
      expect(result.equals(new Rational(1, 10000000000n))).toBe(true);
    });
  });

  describe("Error Cases", () => {
    it("rejects invalid E notation syntax", () => {
      expect(() => Parser.parse("E5")).toThrow();
      expect(() => Parser.parse("5E")).toThrow();
      expect(() => Parser.parse("5EE2")).toThrow();
    });

    it("rejects lowercase e notation", () => {
      expect(() => Parser.parse("5e2")).toThrow();
    });

    it("rejects non-integer exponents", () => {
      expect(() => Parser.parse("5E2.5")).toThrow();
    });

    it("rejects E notation in fraction context without parentheses", () => {
      expect(() => Parser.parse("3/2E4")).toThrow();
      // 2E3/4 is valid - E notation before division is allowed
      const result = Parser.parse("2E3/4");
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(500n);
    });
  });

  describe("Repeating Decimals with E Notation", () => {
    it("handles repeating decimals with E notation", () => {
      // 0.#3E2 → (1/3)E2 = 100/3
      const result = Parser.parse("0.#3E2");
      expect(result).toBeInstanceOf(Rational);
      expect(result.equals(new Rational(100, 3))).toBe(true);
    });

    it("handles complex repeating decimals with E notation", () => {
      // 1.23#45E-1 → (679/550)E-1 = 679/5500
      const result = Parser.parse("1.23#45E-1");
      expect(result).toBeInstanceOf(Rational);
      expect(result.equals(new Rational(679, 5500))).toBe(true);
    });
  });
});

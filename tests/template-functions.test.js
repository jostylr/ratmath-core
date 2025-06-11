import { describe, it, expect } from "bun:test";
import { R, F, Rational, RationalInterval, Fraction, FractionInterval, Integer } from "../index.js";

describe("Template String Functions", () => {
  describe("R template function", () => {
    it("parses simple fractions", () => {
      const n = 3, m = 5;
      const result = R`${n}/${m}`;
      expect(result).toBeInstanceOf(Rational);
      expect(result.toString()).toBe("3/5");
    });

    it("parses n/1 fractions as Rational", () => {
      const n = 7;
      const result = R`${n}/1`;
      expect(result).toBeInstanceOf(Rational);
      expect(result.toString()).toBe("7");
    });

    it("parses integers", () => {
      const n = 42;
      const result = R`${n}`;
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(42n);
    });

    it("parses intervals", () => {
      const a = 2, b = 4;
      const result = R`${a}:${b}`;
      expect(result).toBeInstanceOf(RationalInterval);
      expect(result.low.equals(new Rational(2))).toBe(true);
      expect(result.high.equals(new Rational(4))).toBe(true);
    });

    it("parses complex expressions", () => {
      const x = 1, y = 2, z = 3;
      const result = R`${x}/${y} + ${z}`;
      expect(result).toBeInstanceOf(Rational);
      expect(result.equals(new Rational(7, 2))).toBe(true);
    });

    it("handles negative numbers", () => {
      const n = -3, m = 4;
      const result = R`${n}/${m}`;
      expect(result).toBeInstanceOf(Rational);
      expect(result.toString()).toBe("-3/4");
    });

    it("handles mixed numbers", () => {
      const whole = 2, num = 1, den = 3;
      const result = R`${whole}..${num}/${den}`;
      expect(result).toBeInstanceOf(Rational);
      expect(result.equals(new Rational(7, 3))).toBe(true);
    });

    it("handles arithmetic operations", () => {
      const a = 3, b = 4, c = 1, d = 2;
      const result = R`${a}/${b} * ${c}/${d}`;
      expect(result).toBeInstanceOf(Rational);
      expect(result.equals(new Rational(3, 8))).toBe(true);
    });

    it("handles exact division that becomes integer", () => {
      const a = 8, b = 2;
      const result = R`${a}/${b}`;
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(4n);
    });

    it("handles multiplicative power", () => {
      const base = 2, exp = 3;
      const result = R`${base}**${exp}`;
      expect(result).toBeInstanceOf(RationalInterval);
      expect(result.low.equals(new Rational(8))).toBe(true);
      expect(result.high.equals(new Rational(8))).toBe(true);
    });
  });

  describe("F template function", () => {
    it("parses simple fractions to Fraction", () => {
      const n = 3, m = 5;
      const result = F`${n}/${m}`;
      expect(result).toBeInstanceOf(Fraction);
      expect(result.numerator).toBe(3n);
      expect(result.denominator).toBe(5n);
    });

    it("parses integers to Fraction", () => {
      const n = 7;
      const result = F`${n}`;
      expect(result).toBeInstanceOf(Fraction);
      expect(result.numerator).toBe(7n);
      expect(result.denominator).toBe(1n);
    });

    it("parses intervals to FractionInterval", () => {
      const a = 1, b = 2, c = 3, d = 4;
      const result = F`${a}/${b}:${c}/${d}`;
      expect(result).toBeInstanceOf(FractionInterval);
      expect(result.low.numerator).toBe(1n);
      expect(result.low.denominator).toBe(2n);
      expect(result.high.numerator).toBe(3n);
      expect(result.high.denominator).toBe(4n);
    });

    it("converts computed results to Fraction", () => {
      const a = 8, b = 2;
      const result = F`${a}/${b}`;
      expect(result).toBeInstanceOf(Fraction);
      expect(result.numerator).toBe(4n);
      expect(result.denominator).toBe(1n);
    });

    it("handles negative fractions", () => {
      const n = -3, m = 4;
      const result = F`${n}/${m}`;
      expect(result).toBeInstanceOf(Fraction);
      expect(result.numerator).toBe(-3n);
      expect(result.denominator).toBe(4n);
    });

    it("handles arithmetic expressions", () => {
      const a = 1, b = 2, c = 1, d = 3;
      const result = F`${a}/${b} + ${c}/${d}`;
      expect(result).toBeInstanceOf(Fraction);
      expect(result.numerator).toBe(5n);
      expect(result.denominator).toBe(6n);
    });

    it("handles interval arithmetic", () => {
      const a = 1, b = 2, c = 3, d = 4;
      const result = F`${a}:${b} + ${c}:${d}`;
      expect(result).toBeInstanceOf(FractionInterval);
      expect(result.low.numerator).toBe(4n);
      expect(result.low.denominator).toBe(1n);
      expect(result.high.numerator).toBe(6n);
      expect(result.high.denominator).toBe(1n);
    });

    it("preserves exact fractions", () => {
      const n = 5;
      const result = F`${n}/1`;
      expect(result).toBeInstanceOf(Fraction);
      expect(result.numerator).toBe(5n);
      expect(result.denominator).toBe(1n);
    });
  });

  describe("Template function edge cases", () => {
    it("handles empty interpolations", () => {
      const result = R`3/5`;
      expect(result).toBeInstanceOf(Rational);
      expect(result.toString()).toBe("3/5");
    });

    it("handles multiple interpolations", () => {
      const a = 1, b = 2, c = 3, d = 4, e = 5, f = 6;
      const result = R`${a}/${b} + ${c}/${d} - ${e}/${f}`;
      expect(result).toBeInstanceOf(Rational);
      // 1/2 + 3/4 - 5/6 = 6/12 + 9/12 - 10/12 = 5/12
      expect(result.equals(new Rational(5, 12))).toBe(true);
    });

    it("handles string concatenation correctly", () => {
      const numerator = 123, denominator = 456;
      const result = R`${numerator}/${denominator}`;
      expect(result).toBeInstanceOf(Rational);
      expect(result.equals(new Rational(123, 456))).toBe(true);
    });

    it("handles decimal inputs", () => {
      const x = 0.5;
      const result = F`${x}`;
      expect(result).toBeInstanceOf(FractionInterval);
      // 0.5 should become uncertainty interval
      expect(result.low.denominator).toBeGreaterThan(1n);
      expect(result.high.denominator).toBeGreaterThan(1n);
    });

    it("handles zero values", () => {
      const zero = 0;
      const result = R`${zero}`;
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(0n);
    });

    it("handles large numbers", () => {
      const big = 999999999;
      const result = R`${big}`;
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(999999999n);
    });
  });

  describe("Real-world usage examples", () => {
    it("calculates compound fractions", () => {
      const a = 1, b = 2, c = 3, d = 4;
      const result = R`(${a}/${b} + ${c}/${d}) * 2`;
      // (1/2 + 3/4) * 2 = (2/4 + 3/4) * 2 = 5/4 * 2 = 10/4 = 5/2
      expect(result).toBeInstanceOf(Rational);
      expect(result.equals(new Rational(5, 2))).toBe(true);
    });

    it("works with measurements and tolerances", () => {
      const nominal = 100, tolerance = 5;
      const interval = R`${nominal - tolerance}:${nominal + tolerance}`;
      expect(interval).toBeInstanceOf(RationalInterval);
      expect(interval.low.equals(new Rational(95))).toBe(true);
      expect(interval.high.equals(new Rational(105))).toBe(true);
    });

    it("handles cooking recipe calculations", () => {
      const cups = 2, teaspoons = 3;
      // 2 cups + 3 teaspoons, where 1 cup = 48 teaspoons
      const totalTeaspoons = R`${cups} * 48 + ${teaspoons}`;
      expect(totalTeaspoons).toBeInstanceOf(Integer);
      expect(totalTeaspoons.value).toBe(99n);
    });

    it("calculates financial ratios", () => {
      const profit = 150, revenue = 1000;
      const margin = F`${profit}/${revenue}`;
      expect(margin).toBeInstanceOf(Fraction);
      expect(margin.equals(new Fraction(3n, 20n))).toBe(true); // 150/1000 = 3/20
    });
  });
});
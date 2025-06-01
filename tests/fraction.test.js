import { describe, expect, it } from "bun:test";
import { Fraction } from "../src/fraction.js";
import { Rational } from "../src/rational.js";

describe("Fraction", () => {
  describe("construction", () => {
    it("creates from numeric inputs", () => {
      const f = new Fraction(1, 2);
      expect(f.numerator).toBe(1n);
      expect(f.denominator).toBe(2n);
    });

    it("creates from bigint inputs", () => {
      const f = new Fraction(1n, 2n);
      expect(f.numerator).toBe(1n);
      expect(f.denominator).toBe(2n);
    });

    it("creates with default denominator", () => {
      const f = new Fraction(5);
      expect(f.numerator).toBe(5n);
      expect(f.denominator).toBe(1n);
    });

    it("creates from string with fraction notation", () => {
      const f = new Fraction("3/4");
      expect(f.numerator).toBe(3n);
      expect(f.denominator).toBe(4n);
    });

    it("creates from string with just numerator", () => {
      const f = new Fraction("7");
      expect(f.numerator).toBe(7n);
      expect(f.denominator).toBe(1n);
    });

    it("handles whitespace in string input", () => {
      const f = new Fraction(" 5/8 ");
      expect(f.numerator).toBe(5n);
      expect(f.denominator).toBe(8n);
    });

    it("throws on zero denominator", () => {
      expect(() => new Fraction(1, 0)).toThrow("Denominator cannot be zero");
      expect(() => new Fraction("1/0")).toThrow("Denominator cannot be zero");
    });

    it("throws on invalid string format", () => {
      expect(() => new Fraction("1/2/3")).toThrow("Invalid fraction format");
      expect(() => new Fraction("a/b")).toThrow();
    });
  });

  describe("arithmetic operations", () => {
    it("adds fractions with equal denominators", () => {
      const a = new Fraction(1, 4);
      const b = new Fraction(2, 4);
      const sum = a.add(b);
      expect(sum.numerator).toBe(3n);
      expect(sum.denominator).toBe(4n);
    });

    it("throws when adding fractions with different denominators", () => {
      const a = new Fraction(1, 4);
      const b = new Fraction(1, 3);
      expect(() => a.add(b)).toThrow("Addition only supported for equal denominators");
    });

    it("subtracts fractions with equal denominators", () => {
      const a = new Fraction(3, 4);
      const b = new Fraction(1, 4);
      const diff = a.subtract(b);
      expect(diff.numerator).toBe(2n);
      expect(diff.denominator).toBe(4n);
    });

    it("throws when subtracting fractions with different denominators", () => {
      const a = new Fraction(1, 4);
      const b = new Fraction(1, 3);
      expect(() => a.subtract(b)).toThrow("Subtraction only supported for equal denominators");
    });

    it("multiplies fractions", () => {
      const a = new Fraction(1, 2);
      const b = new Fraction(3, 4);
      const product = a.multiply(b);
      expect(product.numerator).toBe(3n);
      expect(product.denominator).toBe(8n);
    });

    it("multiplies by zero", () => {
      const a = new Fraction(1, 2);
      const b = new Fraction(0, 5);
      const product = a.multiply(b);
      expect(product.numerator).toBe(0n);
      expect(product.denominator).toBe(10n);
    });

    it("divides fractions", () => {
      const a = new Fraction(1, 2);
      const b = new Fraction(3, 4);
      const quotient = a.divide(b);
      expect(quotient.numerator).toBe(4n);
      expect(quotient.denominator).toBe(6n);
    });

    it("throws on division by zero", () => {
      const a = new Fraction(1, 2);
      const b = new Fraction(0, 1);
      expect(() => a.divide(b)).toThrow("Division by zero");
    });
  });

  describe("exponentiation", () => {
    it("raises a fraction to an integer power", () => {
      const f = new Fraction(2, 3);
      const result = f.pow(3);
      expect(result.numerator).toBe(8n);
      expect(result.denominator).toBe(27n);
    });

    it("handles power of zero", () => {
      const f = new Fraction(2, 3);
      const result = f.pow(0);
      expect(result.numerator).toBe(1n);
      expect(result.denominator).toBe(1n);
    });

    it("handles negative powers", () => {
      const f = new Fraction(2, 3);
      const result = f.pow(-2);
      expect(result.numerator).toBe(9n);
      expect(result.denominator).toBe(4n);
    });

    it("throws on zero raised to zero", () => {
      const f = new Fraction(0, 1);
      expect(() => f.pow(0)).toThrow("Zero cannot be raised to the power of zero");
    });

    it("throws on zero raised to negative power", () => {
      const f = new Fraction(0, 1);
      expect(() => f.pow(-1)).toThrow("Zero cannot be raised to a negative power");
    });
  });

  describe("reduction", () => {
    it("reduces a fraction to lowest terms", () => {
      const f = new Fraction(4, 6);
      const reduced = f.reduce();
      expect(reduced.numerator).toBe(2n);
      expect(reduced.denominator).toBe(3n);
    });

    it("handles zero numerator", () => {
      const f = new Fraction(0, 5);
      const reduced = f.reduce();
      expect(reduced.numerator).toBe(0n);
      expect(reduced.denominator).toBe(1n);
    });

    it("normalizes sign when denominator is negative", () => {
      // Creating with negative denominator
      const f = new Fraction(4, -6);
      const reduced = f.reduce();
      expect(reduced.numerator).toBe(-2n);
      expect(reduced.denominator).toBe(3n);
    });

    it("does not modify the original fraction", () => {
      const f = new Fraction(4, 6);
      f.reduce();
      expect(f.numerator).toBe(4n);
      expect(f.denominator).toBe(6n);
    });
  });

  describe("scaling", () => {
    it("scales a fraction by multiplying both numerator and denominator", () => {
      const f = new Fraction(1, 2);
      const scaled = f.scale(3);
      expect(scaled.numerator).toBe(3n);
      expect(scaled.denominator).toBe(6n);
    });

    it("handles BigInt scaling factor", () => {
      const f = new Fraction(1, 2);
      const scaled = f.scale(3n);
      expect(scaled.numerator).toBe(3n);
      expect(scaled.denominator).toBe(6n);
    });
  });

  describe("mediant", () => {
    it("computes the mediant of two fractions", () => {
      const a = new Fraction(1, 2);
      const b = new Fraction(2, 3);
      const med = Fraction.mediant(a, b);
      expect(med.numerator).toBe(3n);
      expect(med.denominator).toBe(5n);
    });
  });

  describe("conversion methods", () => {
    it("converts to Rational", () => {
      const f = new Fraction(4, 6);
      const r = f.toRational();
      expect(r).toBeInstanceOf(Rational);
      expect(r.numerator).toBe(2n);
      expect(r.denominator).toBe(3n);
    });

    it("creates from Rational", () => {
      const r = new Rational(2, 3);
      const f = Fraction.fromRational(r);
      expect(f).toBeInstanceOf(Fraction);
      expect(f.numerator).toBe(2n);
      expect(f.denominator).toBe(3n);
    });
  });

  describe("string representation", () => {
    it("converts to string with denominator", () => {
      const f = new Fraction(3, 4);
      expect(f.toString()).toBe("3/4");
    });

    it("converts to string without denominator when it's 1", () => {
      const f = new Fraction(5, 1);
      expect(f.toString()).toBe("5");
    });

    it("preserves negative sign in string representation", () => {
      const f = new Fraction(-3, 4);
      expect(f.toString()).toBe("-3/4");
    });
  });

  describe("equality", () => {
    it("considers fractions equal only if both numerator and denominator match", () => {
      const a = new Fraction(1, 2);
      const b = new Fraction(1, 2);
      const c = new Fraction(2, 4);
      
      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
    });
  });

  describe("comparisons", () => {
    it("compares fractions with lessThan", () => {
      const a = new Fraction(1, 3);
      const b = new Fraction(1, 2);
      const c = new Fraction(2, 4);
      const d = new Fraction(3, 4);
      
      expect(a.lessThan(b)).toBe(true);
      expect(b.lessThan(a)).toBe(false);
      expect(b.lessThan(c)).toBe(false); // 1/2 == 2/4
      expect(b.lessThan(d)).toBe(true);
    });

    it("compares fractions with lessThanOrEqual", () => {
      const a = new Fraction(1, 3);
      const b = new Fraction(1, 2);
      const c = new Fraction(2, 4);
      
      expect(a.lessThanOrEqual(b)).toBe(true);
      expect(b.lessThanOrEqual(a)).toBe(false);
      expect(b.lessThanOrEqual(c)).toBe(true); // 1/2 == 2/4
      expect(b.lessThanOrEqual(b)).toBe(true); // equal
    });

    it("compares fractions with greaterThan", () => {
      const a = new Fraction(1, 3);
      const b = new Fraction(1, 2);
      const c = new Fraction(2, 4);
      const d = new Fraction(3, 4);
      
      expect(a.greaterThan(b)).toBe(false);
      expect(b.greaterThan(a)).toBe(true);
      expect(b.greaterThan(c)).toBe(false); // 1/2 == 2/4
      expect(d.greaterThan(b)).toBe(true);
    });

    it("compares fractions with greaterThanOrEqual", () => {
      const a = new Fraction(1, 3);
      const b = new Fraction(1, 2);
      const c = new Fraction(2, 4);
      
      expect(a.greaterThanOrEqual(b)).toBe(false);
      expect(b.greaterThanOrEqual(a)).toBe(true);
      expect(b.greaterThanOrEqual(c)).toBe(true); // 1/2 == 2/4
      expect(b.greaterThanOrEqual(b)).toBe(true); // equal
    });

    it("handles negative fractions in comparisons", () => {
      const a = new Fraction(-1, 2);
      const b = new Fraction(1, 3);
      
      expect(a.lessThan(b)).toBe(true);
      expect(b.greaterThan(a)).toBe(true);
    });

    it("handles zero in comparisons", () => {
      const zero = new Fraction(0, 1);
      const positive = new Fraction(1, 2);
      const negative = new Fraction(-1, 2);
      
      expect(zero.lessThan(positive)).toBe(true);
      expect(negative.lessThan(zero)).toBe(true);
      expect(positive.greaterThan(zero)).toBe(true);
      expect(zero.greaterThan(negative)).toBe(true);
    });

    it("compares fractions with large numerators and denominators", () => {
      const a = new Fraction(1234567890123456789012345678901234567890n, 9876543210987654321098765432109876543210n);
      const b = new Fraction(9876543210987654321098765432109876543210n, 1234567890123456789012345678901234567890n);
      
      // a/b < c/d if and only if ad < bc
      expect(a.lessThan(b)).toBe(true);
      expect(b.greaterThan(a)).toBe(true);
    });
  });
});
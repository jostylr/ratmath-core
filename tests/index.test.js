import { describe, it, expect } from "bun:test";
import { Rational, RationalInterval, Parser } from "../index.js";

describe("Main Integration Tests", () => {
  it("performs a complex calculation correctly", () => {
    // (3/4 * (1/2 + 1/3)) / (2 - 1/4)
    const a = new Rational(3, 4);
    const b = new Rational(1, 2);
    const c = new Rational(1, 3);
    const d = new Rational(2);
    const e = new Rational(1, 4);

    // Should be 5/14
    const expected = a.multiply(b.add(c)).divide(d.subtract(e));
    expect(expected.numerator).toBe(5n);
    expect(expected.denominator).toBe(14n);
    const parsed = Parser.parse("(3/4 * (1/2 + 1/3)) / (2 - 1/4)");

    expect(parsed).toBeInstanceOf(Rational);
    expect(parsed.equals(expected)).toBe(true);
  });

  it("performs interval arithmetic correctly", () => {
    const a = new RationalInterval("1/2", "2/3");
    const b = new RationalInterval("3/4", "5/4");

    // Direct calculation
    const product = a.multiply(b);
    // should come out to 3/8 : 10/12 = 3/8 : 5/6
    expect(product.low.numerator).toBe(3n);
    expect(product.low.denominator).toBe(8n);
    expect(product.high.numerator).toBe(5n);
    expect(product.high.denominator).toBe(6n);

    // Parsed calculation
    const parsed = Parser.parse("1/2:2/3 * 3/4:5/4");

    expect(parsed.equals(product)).toBe(true);
    expect(parsed.toString()).toBe(product.toString());
  });

  it("handles complex interval expressions", () => {
    const expr = "(1/2:3/4 + 1/4:1/2)^2 / (2:3 - 1/2:1)";
    const result = Parser.parse(expr);

    // Expected: (3/4:5/4)^2 / (1:5/2) = (9/16:25/16) / (1:5/2) = (9/40:25/16)
    const interval1 = new RationalInterval("1/2", "3/4");
    const interval2 = new RationalInterval("1/4", "1/2");
    const interval3 = new RationalInterval("2", "3");
    const interval4 = new RationalInterval("1/2", "1");

    const sum = interval1.add(interval2);
    const squared = sum.pow(2);
    const diff = interval3.subtract(interval4);
    const expected = squared.divide(diff);

    expect(result.equals(expected)).toBe(true);
  });

  it("throws appropriate errors", () => {
    // Demonstrating error handling for invalid expressions
    expect(() => Parser.parse("1/2 / 0")).toThrow("Division by zero");

    // Zero raised to zero
    expect(() => Parser.parse("0^0")).toThrow(
      "Zero cannot be raised to the power of zero",
    );
  });
});

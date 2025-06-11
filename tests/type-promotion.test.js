import { describe, expect, it, test } from "bun:test";
import { Parser, Integer, Rational, RationalInterval } from "../index.js";

describe("Type Promotion System", () => {
  describe("Parser Type Detection", () => {
    it("parses integers as Integer class", () => {
      const result = Parser.parse("42", { typeAware: true });
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(42n);
    });

    it("parses negative integers as Integer class", () => {
      const result = Parser.parse("-17", { typeAware: true });
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(-17n);
    });

    it("parses zero as Integer class", () => {
      const result = Parser.parse("0", { typeAware: true });
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(0n);
    });

    it("parses rationals as Rational class", () => {
      const result = Parser.parse("3/4", { typeAware: true });
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(3n);
      expect(result.denominator).toBe(4n);
    });

    it("parses decimals as Rational class", () => {
      const result = Parser.parse("1.5", { typeAware: true });
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(3n);
      expect(result.denominator).toBe(2n);
    });

    it("parses mixed numbers as Rational class", () => {
      const result = Parser.parse("2..1/3", { typeAware: true });
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(7n);
      expect(result.denominator).toBe(3n);
    });

    it("parses intervals as RationalInterval class", () => {
      const result = Parser.parse("1:2", { typeAware: true });
      expect(result).toBeInstanceOf(RationalInterval);
      expect(result.low.numerator).toBe(1n);
      expect(result.high.numerator).toBe(2n);
    });

    it("parses rational intervals as RationalInterval class", () => {
      const result = Parser.parse("1/2:3/4", { typeAware: true });
      expect(result).toBeInstanceOf(RationalInterval);
      expect(result.low.numerator).toBe(1n);
      expect(result.low.denominator).toBe(2n);
      expect(result.high.numerator).toBe(3n);
      expect(result.high.denominator).toBe(4n);
    });
  });

  describe("Type Promotion in Addition", () => {
    it("promotes Integer + Integer -> Integer", () => {
      const result = Parser.parse("5 + 3", { typeAware: true });
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(8n);
    });

    it("promotes Integer + Rational -> Rational", () => {
      const result = Parser.parse("5 + 1/2", { typeAware: true });
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(11n);
      expect(result.denominator).toBe(2n);
    });

    it("promotes Rational + Integer -> Rational", () => {
      const result = Parser.parse("1/2 + 5", { typeAware: true });
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(11n);
      expect(result.denominator).toBe(2n);
    });

    it("promotes Rational + Rational -> Rational", () => {
      const result = Parser.parse("1/2 + 1/3", { typeAware: true });
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(5n);
      expect(result.denominator).toBe(6n);
    });

    it("promotes Integer + RationalInterval -> RationalInterval", () => {
      const result = Parser.parse("5 + (1:2)", { typeAware: true });
      expect(result).toBeInstanceOf(RationalInterval);
      expect(result.low.numerator).toBe(6n);
      expect(result.high.numerator).toBe(7n);
    });

    it("promotes Rational + RationalInterval -> RationalInterval", () => {
      const result = Parser.parse("1/2 + (1:2)", { typeAware: true });
      expect(result).toBeInstanceOf(RationalInterval);
      expect(result.low.numerator).toBe(3n);
      expect(result.low.denominator).toBe(2n);
      expect(result.high.numerator).toBe(5n);
      expect(result.high.denominator).toBe(2n);
    });

    it("promotes RationalInterval + Integer -> RationalInterval", () => {
      const result = Parser.parse("(1:2) + 5", { typeAware: true });
      expect(result).toBeInstanceOf(RationalInterval);
      expect(result.low.numerator).toBe(6n);
      expect(result.high.numerator).toBe(7n);
    });

    it("promotes RationalInterval + RationalInterval -> RationalInterval", () => {
      const result = Parser.parse("(1:2) + (3:4)", { typeAware: true });
      expect(result).toBeInstanceOf(RationalInterval);
      expect(result.low.numerator).toBe(4n);
      expect(result.high.numerator).toBe(6n);
    });
  });

  describe("Type Promotion in Subtraction", () => {
    it("promotes Integer - Integer -> Integer", () => {
      const result = Parser.parse("8 - 3", { typeAware: true });
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(5n);
    });

    it("promotes Integer - Rational -> Rational", () => {
      const result = Parser.parse("5 - 1/2", { typeAware: true });
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(9n);
      expect(result.denominator).toBe(2n);
    });

    it("promotes Rational - Integer -> Rational", () => {
      const result = Parser.parse("5/2 - 1", { typeAware: true });
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(3n);
      expect(result.denominator).toBe(2n);
    });

    it("promotes Integer - RationalInterval -> RationalInterval", () => {
      const result = Parser.parse("10 - (1:3)", { typeAware: true });
      expect(result).toBeInstanceOf(RationalInterval);
      expect(result.low.numerator).toBe(7n);
      expect(result.high.numerator).toBe(9n);
    });
  });

  describe("Type Promotion in Multiplication", () => {
    it("promotes Integer * Integer -> Integer", () => {
      const result = Parser.parse("4 * 3", { typeAware: true });
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(12n);
    });

    it("promotes Integer * Rational -> Rational", () => {
      const result = Parser.parse("4 * 1/2", { typeAware: true });
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(2n);
      expect(result.denominator).toBe(1n);
    });

    it("promotes Rational * Integer -> Rational", () => {
      const result = Parser.parse("1/2 * 4", { typeAware: true });
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(2n);
      expect(result.denominator).toBe(1n);
    });

    it("promotes Integer * RationalInterval -> RationalInterval", () => {
      const result = Parser.parse("2 * (1:3)", { typeAware: true });
      expect(result).toBeInstanceOf(RationalInterval);
      expect(result.low.numerator).toBe(2n);
      expect(result.high.numerator).toBe(6n);
    });
  });

  describe("Type Promotion in Division", () => {
    it("promotes Integer / Integer -> Integer when exact", () => {
      const result = Parser.parse("8 / 2", { typeAware: true });
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(4n);
    });

    it("promotes Integer / Integer -> Rational when not exact", () => {
      const result = Parser.parse("7 / 2", { typeAware: true });
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(7n);
      expect(result.denominator).toBe(2n);
    });

    it("promotes Integer / Rational -> Rational", () => {
      const result = Parser.parse("4 / (1/2)", { typeAware: true });
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(8n);
      expect(result.denominator).toBe(1n);
    });

    it("promotes Rational / Integer -> Rational", () => {
      const result = Parser.parse("3/4 / 2", { typeAware: true });
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(3n);
      expect(result.denominator).toBe(8n);
    });
  });

  describe("Complex Expression Type Promotion", () => {
    it("handles mixed operations with proper promotion", () => {
      const result = Parser.parse("2 + 1/3 * 6", { typeAware: true });
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(4n);
      expect(result.denominator).toBe(1n);
    });

    it("promotes to interval when any operand is interval", () => {
      const result = Parser.parse("1 + 2 * (1:2)", { typeAware: true });
      expect(result).toBeInstanceOf(RationalInterval);
      expect(result.low.numerator).toBe(3n);
      expect(result.high.numerator).toBe(5n);
    });

    it("handles parenthesized expressions", () => {
      const result = Parser.parse("(2 + 3) * 4", { typeAware: true });
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(20n);
    });

    it("promotes parenthesized rational expression", () => {
      const result = Parser.parse("(1/2 + 1/3) * 6", { typeAware: true });
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(5n);
      expect(result.denominator).toBe(1n);
    });
  });

  describe("Edge Cases", () => {
    it("handles zero operations correctly", () => {
      const result = Parser.parse("0 + 0", { typeAware: true });
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(0n);
    });

    it("handles one operations correctly", () => {
      const result = Parser.parse("1 * 1", { typeAware: true });
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(1n);
    });

    it("promotes negative integer operations", () => {
      const result = Parser.parse("-5 + 3", { typeAware: true });
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(-2n);
    });

    it("handles rational simplification", () => {
      const result = Parser.parse("2/4 + 1/4", { typeAware: true });
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(3n);
      expect(result.denominator).toBe(4n);
    });
  });

  describe("E Notation Type Promotion", () => {
    it("preserves Integer type for non-negative E notation", () => {
      const result = Parser.parse("5E2", { typeAware: true });
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(500n);
    });

    it("promotes to Rational for negative E notation", () => {
      const result = Parser.parse("5E-1", { typeAware: true });
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(1n);
      expect(result.denominator).toBe(2n);
    });

    it("handles E notation with intervals", () => {
      const result = Parser.parse("(1:2)E1", { typeAware: true });
      expect(result).toBeInstanceOf(RationalInterval);
      expect(result.low.numerator).toBe(10n);
      expect(result.high.numerator).toBe(20n);
    });
  });
});
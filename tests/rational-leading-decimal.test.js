import { describe, expect, test } from "bun:test";
import { Rational } from "../index.js";

describe("leading decimal string construction", () => {
  test("supplies the implicit zero without losing the minus sign", () => {
    for (const [source, expected] of [
      ["-.5", "-1/2"], ["-.125", "-1/8"], ["-.0005", "-1/2000"],
      ["-.999", "-999/1000"], ["  -.50  ", "-1/2"],
      [".5", "1/2"], ["-0.5", "-1/2"], ["-12.5", "-25/2"],
      ["-0..1/2", "-1/2"],
    ]) expect(new Rational(source).toString()).toBe(expected);
  });

  test("normalizes negative leading decimal zero", () => {
    for (const source of ["-.0", "-.000", "  -.0000 "]) {
      const value = new Rational(source);
      expect(value.numerator).toBe(0n);
      expect(value.denominator).toBe(1n);
      expect(value.toString()).toBe("0");
    }
  });

  test("matches explicit-zero decimals across signs and fractional scales", () => {
    for (let width = 1; width <= 12; width++) {
      for (const digits of ["0", "1", "5", "9", "12", "500", "999"]) {
        for (const sign of ["", "-"]) {
          const fraction = digits.padStart(width, "0");
          const implicit = new Rational(`${sign}.${fraction}`);
          const explicit = new Rational(`${sign}0.${fraction}`);
          expect(implicit.numerator).toBe(explicit.numerator);
          expect(implicit.denominator).toBe(explicit.denominator);
        }
      }
    }
  });

  test("still rejects malformed signs and decimal components", () => {
    for (const source of ["-", "-.", "--.5", "-+.5", "-.5x", "-.5.1", "-. 5", "- .5"]) {
      expect(() => new Rational(source)).toThrow();
    }
  });
});

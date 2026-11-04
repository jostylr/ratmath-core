import { expect, test } from "bun:test";
import { Integer, Rational, RationalInterval, parseNumber } from "../index.js";
import { R } from "../index.js";

const text = (value) => value.toString();

test("Core literals and exact arithmetic", () => {
  expect(text(R`1/2 + 1/3`)).toBe("5/6");
  expect(R`0.#3 * 3`.equals(new Rational(1))).toBe(true);
  expect(text(R`1..3/4`)).toBe("7/4");
  expect(R`2^10`.value).toBe(1024n);
  expect(R`2^-2`.equals(new Rational(1, 4))).toBe(true);
  expect(R`2^3^2`.value).toBe(512n);
  expect(R`-2^2`.value).toBe(-4n);
  expect(R`5! / 3!`.value).toBe(20n);
  expect(R`1_000 * 3`.value).toBe(3000n);
});

test("intervals bind between products and sums, as in RiX", () => {
  const sum = R`1:2 + 3`;
  expect(sum).toBeInstanceOf(RationalInterval);
  expect([text(sum.low), text(sum.high)]).toEqual(["4", "5"]);
  const ratio = R`1/2:3/4`;
  expect([text(ratio.low), text(ratio.high)]).toEqual(["1/2", "3/4"]);
  const product = R`(1:2) * (3:4)`;
  expect([text(product.low), text(product.high)]).toEqual(["3", "8"]);
  const uncertain = R`1.23[56:67]`;
  expect([text(uncertain.low), text(uncertain.high)]).toEqual(["3089/2500", "12367/10000"]);
});

test("interpolations stay exact Core values", () => {
  const third = new Rational(1, 3);
  expect(R`${third} + ${third}`.equals(new Rational(2, 3))).toBe(true);
  expect(R`2 * ${-5n}`.value).toBe(-10n);
  expect(R`${new Rational(-1, 3)} ^ 2`.equals(new Rational(1, 9))).toBe(true);
  expect(R`${"0.#142857"} * 7`.equals(new Integer(1))).toBe(true);
  expect(() => R`${0.1} + 1`).toThrow("inexact number");
});

test("rejects names, stray operators and fractional powers", () => {
  expect(() => R`x + 1`).toThrow(SyntaxError);
  expect(() => R`1 +`).toThrow("ended early");
  expect(() => R`(1 + 2`).toThrow("missing ')'");
  expect(() => R`4^(1/2)`).toThrow("Integer exponent");
});

test("edge cases of the R grammar", () => {
  expect(R`+3 - -2`.value).toBe(5n);
  expect(R`-1:2`.low.equals(new Rational(-1))).toBe(true);
  expect(R`23.456? + 1`.isCertifiedApproximation ?? R`23.456? + 1` instanceof RationalInterval).toBeTruthy();
  const approx = parseNumber("1.5?");
  expect(R`${approx} * 2`).toBeDefined();
  expect(() => R`(1/2)!`).toThrow("'!' needs an Integer");
  expect(() => R`(1:2):3`).toThrow("two scalar endpoints");
  expect(() => R`1 2`).toThrow("unexpected '2'");
  expect(() => R`1 )`).toThrow("unexpected ')'");
  expect(() => R`* 2`).toThrow("unexpected '*'");
  expect(() => R`. + 1`).toThrow("unexpected '.'");
  expect(() => R`1 & 2`).toThrow("unexpected '&'");
  expect(() => R`${{}} + 1`).toThrow("cannot use object");
  expect(R`${"1:2"} + ${1}`.high.equals(new Rational(3))).toBe(true);
});

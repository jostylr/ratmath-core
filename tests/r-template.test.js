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

test("RiX-compatible literals: continued fractions, radix shifts and base prefixes", () => {
  expect(text(R`3.~7~15~1`)).toBe("355/113");
  expect(text(R`~-1.~2`)).toBe("-1/2");
  expect(text(R`-3.~7`)).toBe("-22/7"); // a leading - negates, as in RiX
  expect(R`3.~7?`.isCertifiedApproximation).toBe(true);
  expect(R`1_^3`.value).toBe(1000n);
  expect(text(R`2.5_^-2`)).toBe("1/40");
  expect(text(R`1/2_^3`)).toBe("1/2000"); // the shift belongs to the literal 2
  expect(R`3_^0`.value).toBe(3n);
  expect(R`1_000 + 1`.value).toBe(1001n);
  expect(R`0xff`.value).toBe(255n);
  expect(text(R`0xFF.8`)).toBe("511/2");
  expect(text(R`0b101.1`)).toBe("11/2");
  expect(text(R`0b0.#01`)).toBe("1/3");
  expect(text(R`0b.1`)).toBe("1/2");
  expect(R`0o17`.value).toBe(15n);
  expect(R`0z[7]66`.value).toBe(48n);
  expect(text(R`0x1/0x3`)).toBe("1/3");
  expect(R`-0xff`.value).toBe(-255n);
  expect(() => R`0e5`).toThrow("unknown base prefix '0e'");
  expect(() => R`0xg`).toThrow();
});

test("** is the same power as ^ (as in RiX) and !! is the double factorial", () => {
  expect(R`2**3`.value).toBe(8n);
  const square = R`(-1:2)**2`;
  expect([text(square.low), text(square.high)]).toEqual(["0", "4"]);
  expect(R`5!!`.value).toBe(15n);
  expect(R`3!!!`.value).toBe(6n); // 3!! = 3, then 3! = 6
  expect(() => R`(1/2)!!`).toThrow("'!!' needs an Integer");
  expect(() => R`2**(1/2)`).toThrow("'**' needs an Integer exponent");
});

test("the comma interval form is rejected, as in RiX", () => {
  expect(() => R`1.2[3,6]`).toThrow("requires ':'");
});

test("R.base reads unprefixed literals in another base", () => {
  expect(text(R.base(16)`ff.8 / 3`)).toBe("511/6");
  expect(text(R.base(2)`0.#01`)).toBe("1/3");
  expect(R.base(2n)`101 + 0x10`.value).toBe(21n);
  expect(R.base(new Integer(8))`17`.value).toBe(15n);
  expect(R.base("01234567")`17`.value).toBe(15n);
  expect(text(R.base(16)`${"1/2"} + 1`)).toBe("3/2");
  expect(() => R.base(16)`.`).toThrow("unexpected '.'");
  expect(() => R.base({})`1`).toThrow("R.base needs");
});

import { describe, expect, it } from "bun:test";
import { Integer, Rational, RationalInterval, parseInterval } from "../index.js";

describe("Integer and Rational mixed comparisons", () => {
  it("compares an Integer with a Rational by value", () => {
    expect(new Integer(3).compareTo(new Rational(7, 2))).toBe(-1);
    expect(new Integer(4).compareTo(new Rational(7, 2))).toBe(1);
    expect(new Integer(5).equals(new Rational(5))).toBe(true);
    expect(new Integer(5).equals(new Rational(9, 2))).toBe(false);
    expect(new Integer(-1).lessThan(new Rational(-1, 2))).toBe(true);
    expect(new Integer(2).greaterThanOrEqual(new Rational(4, 2))).toBe(true);
  });

  it("compares a Rational with an Integer by value", () => {
    expect(new Rational(1, 2).lessThan(new Integer(3))).toBe(true);
    expect(new Rational(6, 2).equals(new Integer(3))).toBe(true);
    expect(new Rational(7, 2).compareTo(new Integer(3))).toBe(1);
  });
});

describe("Rational.toNumber", () => {
  it("approximates values whose parts exceed the double range", () => {
    const big = 10n ** 400n;
    expect(new Rational(big + 1n, big).toNumber()).toBe(1);
    expect(new Rational(-3n * big, 2n * big).toNumber()).toBe(-1.5);
    expect(new Rational(big).toNumber()).toBe(Infinity);
    expect(new Rational(1n, big).toNumber()).toBe(0);
  });

  it("keeps correctly rounded results for small parts", () => {
    expect(new Rational(1, 10).toNumber()).toBe(0.1);
    expect(new Rational(22, 7).toNumber()).toBe(22 / 7);
  });
});

describe("Rational string construction", () => {
  it("rejects empty and partial literals", () => {
    for (const malformed of ["", " ", ".", "/2", "3/", "abc", "1e3", "1:2", "1.2.3"]) {
      expect(() => new Rational(malformed)).toThrow();
    }
  });

  it("accepts the shared literal grammar", () => {
    expect(new Rational("0.#3").equals(new Rational(1, 3))).toBe(true);
    expect(new Rational("1_000").equals(new Rational(1000))).toBe(true);
    expect(new Rational("-5..2/3").equals(new Rational(-17, 3))).toBe(true);
    expect(new Rational("1.~2").equals(new Rational(3, 2))).toBe(true);
  });

  it("divides a string value by an explicit second argument", () => {
    expect(new Rational("3/4", 5).equals(new Rational(3, 20))).toBe(true);
    expect(new Rational("3", 4).equals(new Rational(3, 4))).toBe(true);
    expect(new Rational("3", new Integer(4)).equals(new Rational(3, 4))).toBe(true);
    expect(() => new Rational("3/4", 0)).toThrow("Denominator cannot be zero");
  });
});

describe("interval decimal text encloses the interval", () => {
  const cases = [
    ["1/3", "2/3"], ["1/7", "1/6"], ["-2/3", "-1/3"], ["10/3", "11/3"],
    ["1.2356", "1.2367"], ["-1/7", "1/3"], ["2/3", "2/3"],
  ];
  for (const [a, b] of cases) {
    const interval = new RationalInterval(new Rational(a), new Rational(b));
    for (const method of ["compactedDecimalInterval", "relativeMidDecimalInterval"]) {
      it(`${method} for ${a}:${b}`, () => {
        const parsed = parseInterval(interval[method]());
        expect(parsed.low.lessThanOrEqual(interval.low)).toBe(true);
        expect(parsed.high.greaterThanOrEqual(interval.high)).toBe(true);
      });
    }
  }

  it("prints an upper bound at least 2/3", () => {
    const text = new RationalInterval(new Rational(1, 3), new Rational(2, 3)).compactedDecimalInterval();
    expect(text).toBe("0.[33333333333333333333:66666666666666666667]");
  });
});

describe("shared literal grammar edge cases", () => {
  it("rejects zero denominators and non-positive continued-fraction terms", async () => {
    const { parseRational, parseContinuedFraction, parseRepeatingDecimal } = await import("../index.js");
    expect(() => parseRational("1/0")).toThrow("Denominator cannot be zero");
    expect(() => new Rational("3/0")).toThrow("Denominator cannot be zero");
    expect(() => parseContinuedFraction("1.~0~2")).toThrow("Continued fraction terms must be positive");
    expect(() => parseRational("23.456?")).toThrow("non-point CertifiedApproximation");
    expect(parseRepeatingDecimal("0.1#6").equals(new Rational(1, 6))).toBe(true);
  });

  it("parses provisional continued-fraction terms and negative derived approximations", async () => {
    const { parseNumber } = await import("../index.js");
    const cf = parseNumber("3.~7~15?1~2");
    expect(cf.isCertifiedApproximation).toBe(true);
    const derived = parseNumber("-1/3?[=1/4:1/2]");
    expect(derived.enclosure.low.equals(new Rational(-1, 2))).toBe(true);
    expect(derived.enclosure.high.equals(new Rational(-1, 4))).toBe(true);
  });
});

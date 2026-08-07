import { describe, expect, it } from "bun:test";
import {
  Integer,
  Rational,
  RationalInterval,
  parseContinuedFraction,
  parseDecimal,
  parseInterval,
  parseMixedNumber,
  parseNumber,
  parseRational,
  parseRepeatingDecimal,
} from "../index.js";

function expectRational(actual, numerator, denominator = 1n) {
  expect(actual).toBeInstanceOf(Rational);
  expect(actual.numerator).toBe(numerator);
  expect(actual.denominator).toBe(denominator);
}

describe("number-only parsing", () => {
  it("preserves integer values and parses grouped digits", () => {
    const value = parseNumber("-1_000_000");
    expect(value).toBeInstanceOf(Integer);
    expect(value.value).toBe(-1_000_000n);
    expect(parseNumber("+42").value).toBe(42n);
  });

  it("parses fractions and finite decimals exactly", () => {
    expectRational(parseRational("-18/24"), -3n, 4n);
    expectRational(parseDecimal(".125"), 1n, 8n);
    expectRational(parseDecimal("-12.50"), -25n, 2n);
    expectRational(parseDecimal("2."), 2n);
  });

  it("parses repeating decimals exactly", () => {
    expectRational(parseRepeatingDecimal("0.#3"), 1n, 3n);
    expectRational(parseDecimal("1.2#34"), 611n, 495n);
    expectRational(parseDecimal("-0.1#6"), -1n, 6n);
    expectRational(parseDecimal("0.{0~8}1#0"), 1n, 1_000_000_000n);
  });

  it("parses and emits mixed-fraction notation", () => {
    const value = parseMixedNumber("-2..1/4");
    expectRational(value, -9n, 4n);
    expect(value.toMixedString()).toBe("-2..1/4");
    expectRational(parseMixedNumber("0..1/2"), 1n, 2n);
  });

  it("parses and emits continued fractions", () => {
    const value = parseContinuedFraction("3.~7~15~1~292");
    expectRational(value, 103_993n, 33_102n);
    expect(parseContinuedFraction(value.toContinuedFractionString()).equals(value)).toBe(
      true,
    );
    expect(parseContinuedFraction([1n, 2n, 2n]).toString()).toBe("7/5");
    expect(parseContinuedFraction("~-1.~2").toString()).toBe("-1/2");
  });

  it("parses exact colon intervals with any scalar endpoint notation", () => {
    const value = parseNumber("-1..1/2:0.#3");
    expect(value).toBeInstanceOf(RationalInterval);
    expect(value.low.toString()).toBe("-3/2");
    expect(value.high.toString()).toBe("1/3");
    expect(parseInterval("3/4").toString()).toBe("3/4:3/4");
  });

  it("parses compact decimal interval notation", () => {
    const value = parseInterval("1.23[56:67]");
    expect(value.low.equals(new Rational("1.2356"))).toBe(true);
    expect(value.high.equals(new Rational("1.2367"))).toBe(true);
    expect(value.compactedDecimalInterval()).toBe("1.23[56:67]");

    const negative = parseInterval("-1.23[56:67]");
    expect(negative.low.equals(new Rational("-1.2367"))).toBe(true);
    expect(negative.high.equals(new Rational("-1.2356"))).toBe(true);
  });

  it("parses relative and symmetric decimal intervals", () => {
    const relative = parseInterval("1.23[+5:-6]");
    expect(relative.low.equals(new Rational("1.17"))).toBe(true);
    expect(relative.high.equals(new Rational("1.28"))).toBe(true);

    const symmetric = parseInterval("1.3[+-1]");
    expect(symmetric.low.equals(new Rational("1.2"))).toBe(true);
    expect(symmetric.high.equals(new Rational("1.4"))).toBe(true);

    const fractionalOffset = parseInterval("1.2[+-0.1]");
    expect(fractionalOffset.low.equals(new Rational("1.19"))).toBe(true);
    expect(fractionalOffset.high.equals(new Rational("1.21"))).toBe(true);

    const oneSided = parseInterval("1.23[+5]");
    expect(oneSided.low.equals(new Rational("1.23"))).toBe(true);
    expect(oneSided.high.equals(new Rational("1.28"))).toBe(true);
  });

  it("round-trips relative midpoint decimal interval output", () => {
    const original = new RationalInterval(
      new Rational("1.2356"),
      new Rational("1.2367"),
    );
    const text = original.relativeMidDecimalInterval();
    expect(text).toBe("1.23615[+-55]");
    expect(parseInterval(text).equals(original)).toBe(true);

    const tenths = new RationalInterval(
      new Rational("1.2"),
      new Rational("1.3"),
    );
    const tenthsText = tenths.relativeMidDecimalInterval();
    expect(tenthsText).toBe("1.25[+-5]");
    expect(parseInterval(tenthsText).equals(tenths)).toBe(true);
  });

  it("round-trips shortest relative decimal interval output", () => {
    const original = new RationalInterval(
      new Rational("1.224"),
      new Rational("1.235"),
    );
    const text = original.relativeDecimalInterval();
    expect(text).toBe("1.23[+0.5:-0.6]");
    expect(parseInterval(text).equals(original)).toBe(true);
  });

  it("preserves exact asymmetric and repeating offsets", () => {
    const nearlySymmetric = new RationalInterval(
      Rational.zero,
      new Rational(1n, 10_000_000n),
    );
    const nearlySymmetricText = nearlySymmetric.relativeDecimalInterval();
    expect(nearlySymmetricText).toBe("0[+0.0000001:-0]");
    expect(parseInterval(nearlySymmetricText).equals(nearlySymmetric)).toBe(
      true,
    );

    const repeating = new RationalInterval(Rational.zero, new Rational(1n, 3n));
    const repeatingText = repeating.relativeDecimalInterval();
    expect(repeatingText).toBe("0[+1/3:-0]");
    expect(parseInterval(repeatingText).equals(repeating)).toBe(true);

    const point = RationalInterval.point(new Rational(1n, 3n));
    expect(parseInterval(point.relativeDecimalInterval()).equals(point)).toBe(
      true,
    );
  });

  it("round-trips terminating bases and offsets beyond 20 decimal places", () => {
    const unit = 10n ** 21n;
    const fromZero = new RationalInterval(Rational.zero, new Rational(1n, unit));
    const fromZeroText = fromZero.relativeDecimalInterval();
    expect(fromZeroText).toBe("0[+0.000000000000000000001:-0]");
    expect(parseInterval(fromZeroText).equals(fromZero)).toBe(true);

    const narrow = new RationalInterval(
      new Rational(1n, unit),
      new Rational(2n, unit),
    );
    const narrowText = narrow.relativeDecimalInterval();
    expect(narrowText).toBe("0.000000000000000000001[+1:-0]");
    expect(parseInterval(narrowText).equals(narrow)).toBe(true);
  });

  it("formats wide relative intervals without enumerating their integers", () => {
    const wide = new RationalInterval(0n, 10n ** 100n);
    const text = wide.relativeDecimalInterval();
    expect(parseInterval(text).equals(wide)).toBe(true);
  });

  it("parses decimal-point ranges with repeating endpoints", () => {
    const value = parseInterval("0.[#3:#6]");
    expect(value.low.equals(new Rational(1n, 3n))).toBe(true);
    expect(value.high.equals(new Rational(2n, 3n))).toBe(true);
  });

  it("round-trips exact repeating interval output", () => {
    const original = new RationalInterval(
      new Rational(1n, 3n),
      new Rational(2n, 5n),
    );
    const parsed = parseInterval(original.toRepeatingDecimal());
    expect(parsed.equals(original)).toBe(true);
  });

  it("rejects expressions and malformed numeric forms", () => {
    expect(() => parseNumber("1 + 2")).toThrow("Invalid rational number");
    expect(() => parseRational("1:2")).toThrow("received an interval");
    expect(() => parseMixedNumber("3/4")).toThrow("Expected mixed-fraction");
    expect(() => parseContinuedFraction("3/4")).toThrow(
      "Expected continued-fraction",
    );
    expect(() => parseDecimal("1..1/2")).toThrow("Expected decimal notation");
    expect(() => parseDecimal("1__000.0")).toThrow(
      "Underscore separators",
    );
    expect(() => parseNumber("1.2[+3:+4]")).toThrow(
      "allows one '+' and one '-'",
    );
    expect(() => parseInterval("1.23[56,67]")).toThrow("requires ':'");
    expect(() => parseInterval("1.23[+5,-6]")).toThrow("requires ':'");
    expect(() => parseInterval("0.[#3,#6]")).toThrow("requires ':'");
  });
});

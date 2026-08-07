import { describe, expect, test } from "bun:test";
import {
  BaseSystem,
  Fraction,
  FractionInterval,
  Integer,
  Rational,
  RationalInterval,
  isCoreNumber,
  isBaseSystem,
  isFraction,
  isFractionInterval,
  isInteger,
  isRational,
  isRationalInterval,
  parseRepeatingDecimal,
  parseInterval,
  reviveCoreValue,
} from "../index.js";

describe("signed string construction", () => {
  test("preserves a negative sign when the whole part is zero", () => {
    expect(new Rational("-0.5").toString()).toBe("-1/2");
    expect(new Rational("-.5").toString()).toBe("-1/2");
    expect(new Rational("-0..1/2").toString()).toBe("-1/2");
  });

  test("requires unsigned mixed-number fraction components", () => {
    expect(new Rational("+1..2/3").toString()).toBe("5/3");
    for (const malformed of [
      "1..-2/3",
      "-1..-2/3",
      "1..2/-3",
      "-1..2/-3",
    ]) {
      expect(() => new Rational(malformed)).toThrow("Invalid mixed number format");
    }
  });
});

describe("bounded repeating-decimal serialization", () => {
  test("publishes a configurable 30-digit global default limit", () => {
    expect(Rational.MAX_PERIOD_DIGITS).toBe(30);

    const originalLimit = Rational.MAX_PERIOD_DIGITS;
    try {
      const value = new Rational(1, 7);
      value.computeDecimalMetadata(30);
      Rational.MAX_PERIOD_DIGITS = 5;
      expect(() => value.toRepeatingDecimal()).toThrow("exceeding limit 5");
      expect(
        value.toRepeatingDecimalWithPeriod({ onLimit: "trunc" }).decimal,
      ).toBe("0.#14285...");
      expect(value.computeDecimalMetadata().periodDigits).toBe("14285");
    } finally {
      Rational.MAX_PERIOD_DIGITS = originalLimit;
    }
  });

  test("emits the complete 1/7 period and round-trips", () => {
    const value = new Rational(1, 7);
    expect(value.toRepeatingDecimal()).toBe("0.#142857");
    expect(parseRepeatingDecimal(value.toRepeatingDecimal()).equals(value)).toBe(true);
  });

  test("supports error, null, and visibly truncated limit behavior", () => {
    const value = new Rational(-30, 23);
    expect(value.toRepeatingDecimal(22)).toBe("-1.#3043478260869565217391");
    expect(parseRepeatingDecimal(value.toRepeatingDecimal(22)).equals(value)).toBe(true);
    expect(() => value.toRepeatingDecimal(5)).toThrow("exceeding limit 5");
    expect(value.toRepeatingDecimal(5, "null")).toBeNull();
    expect(value.toRepeatingDecimal(5, "trunc")).toBe("-1.#30434...");
    expect(new Rational(1, 194).toRepeatingDecimal(5, "trunc")).toBe(
      "0.0#05154...",
    );
  });

  test("validates limit controls", () => {
    expect(() => new Rational(1, 3).toRepeatingDecimal(0)).toThrow();
    expect(() => new Rational(1, 3).toRepeatingDecimal(30, "other")).toThrow();
  });
});

describe("denominator grids", () => {
  test("computes the inclusive grid interval", () => {
    const interval = new RationalInterval("1/3", "2/3");
    expect(interval.denominatorInterval(10).toString()).toBe("2/5:3/5");
    expect(interval.denominatorInterval().toString()).toBe("1/3:2/3");
  });

  test("handles a grid that misses the interval", () => {
    const point = RationalInterval.point("1/2");
    expect(() => point.denominatorInterval(1)).toThrow("No rational");
    expect(point.denominatorInterval(1, "null")).toBeNull();
    expect(point.denominatorInterval(1, "mid").toString()).toBe("1/2:1/2");
    expect(point.randomRational(1, "null", () => 0)).toBeNull();
    expect(point.randomRational(1, "mid", () => 0).toString()).toBe("1/2");
  });

  test("samples huge grids without enumerating candidates", () => {
    const interval = new RationalInterval("0", "1");
    const denominator = 10n ** 30n;
    expect(interval.randomRational(denominator, "error", () => 0).toString()).toBe("0");
  });
});

describe("rounding and tagged JSON", () => {
  test("rounds exactly with explicit tie behavior", () => {
    const negative = new Rational(-5, 2);
    expect(negative.floor()).toBe(-3n);
    expect(negative.ceil()).toBe(-2n);
    expect(negative.trunc()).toBe(-2n);
    expect(negative.round()).toBe(-2n);
    expect(negative.round("half-up")).toBe(-3n);
    expect(new Rational(247, 100).roundTo(1).toString()).toBe("5/2");
    expect(new Rational(149, 1).roundTo(-2).toString()).toBe("100");
  });

  test("revives nested tagged values and exposes public guards", () => {
    const original = new RationalInterval("1/3", "2/3");
    const revived = JSON.parse(JSON.stringify(original), reviveCoreValue);
    expect(revived.equals(original)).toBe(true);
    expect(isRationalInterval(revived)).toBe(true);
    expect(isRational(revived.low)).toBe(true);
    expect(isInteger(new Integer(2))).toBe(true);
    expect(isCoreNumber(revived)).toBe(true);
    expect(parseInterval("2").toString()).toBe("2:2");

    const fraction = new Fraction(2, 4);
    const fractionInterval = new FractionInterval(fraction, new Fraction(3, 4));
    const values = [
      new Integer(2),
      fraction,
      fractionInterval,
      BaseSystem.HEXADECIMAL,
    ];
    const revivedValues = JSON.parse(JSON.stringify(values), reviveCoreValue);
    expect(isInteger(revivedValues[0])).toBe(true);
    expect(isFraction(revivedValues[1])).toBe(true);
    expect(isFractionInterval(revivedValues[2])).toBe(true);
    expect(isBaseSystem(revivedValues[3])).toBe(true);
    expect(revivedValues[1].toString()).toBe("2/4");
    expect(revivedValues[2].toString()).toBe("2/4:3/4");
    expect(revivedValues[3].equals(BaseSystem.HEXADECIMAL)).toBe(true);
    expect(isCoreNumber(fraction)).toBe(false);
    expect(reviveCoreValue("", { $ratmath: "Future", value: 1 })).toEqual({
      $ratmath: "Future",
      value: 1,
    });
  });

  test("rejects inexact number inputs in newly covered conversion paths", () => {
    expect(() => new Fraction(1, 2).scale(Number.MAX_SAFE_INTEGER + 1)).toThrow();
    expect(() => Rational.fromContinuedFraction([0, Number.MAX_SAFE_INTEGER + 1])).toThrow();
  });
});

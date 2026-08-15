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
    expect(() =>
      new Rational(1, 3).toRepeatingDecimalWithPeriod({
        useRepeatNotation: "no",
      }),
    ).toThrow("must be a boolean");
    expect(() => new Rational(1, 3).toRepeatingDecimalWithPeriod(null)).toThrow(
      "boolean or an object",
    );
  });

  test("uses and validates the mutable period-discovery limit in diagnostics", () => {
    const originalLimit = Rational.MAX_PERIOD_CHECK;
    try {
      Rational.MAX_PERIOD_CHECK = 5;
      expect(new Rational(1, 7).toScientificNotation(true, 3, true)).toContain(
        "period: >5",
      );
      Rational.MAX_PERIOD_CHECK = 0;
      expect(() => new Rational(1, 7).computeDecimalMetadata(3)).toThrow(
        "positive safe integer",
      );
    } finally {
      Rational.MAX_PERIOD_CHECK = originalLimit;
    }
  });
});

describe("overridable formatting limits", () => {
  test("supports mutable defaults and explicit overrides", () => {
    const originalDecimal = Rational.DEFAULT_DECIMAL_DIGITS;
    const originalScientific = Rational.DEFAULT_SCIENTIFIC_PRECISION;
    const originalBase = Rational.DEFAULT_BASE_LIMIT;
    const originalModulo = Rational.DEFAULT_PERIOD_MODULO_LIMIT;
    try {
      Rational.DEFAULT_DECIMAL_DIGITS = 3;
      expect(new Rational(1, 7).toDecimal()).toBe("0.142");
      expect(new Rational(1, 7).toDecimal(5)).toBe("0.14285");

      Rational.DEFAULT_SCIENTIFIC_PRECISION = 3;
      expect(new Rational(1, 7).toScientificNotation()).toBe("1.42...E-1");
      expect(new Rational(1, 7).toScientificNotation(true, 6)).toBe(
        "1.#428571E-1",
      );

      Rational.DEFAULT_BASE_LIMIT = 3;
      expect(new Rational(1, 7).toRepeatingBase(BaseSystem.DECIMAL)).toBe(
        "0.142...",
      );
      expect(
        new Rational(1, 7).toRepeatingBase(BaseSystem.DECIMAL, { limit: 6 }),
      ).toBe("0.#142857");
      expect(new Rational(1, 7).toString(10, { limit: 6 })).toBe("0.#142857");

      Rational.DEFAULT_PERIOD_MODULO_LIMIT = 5;
      expect(() => new Rational(1, 7).periodModulo(BaseSystem.DECIMAL)).toThrow(
        "exceeded limit of 5",
      );
      expect(new Rational(1, 7).periodModulo(BaseSystem.DECIMAL, 6)).toBe(6);
    } finally {
      Rational.DEFAULT_DECIMAL_DIGITS = originalDecimal;
      Rational.DEFAULT_SCIENTIFIC_PRECISION = originalScientific;
      Rational.DEFAULT_BASE_LIMIT = originalBase;
      Rational.DEFAULT_PERIOD_MODULO_LIMIT = originalModulo;
    }
  });

  test("validates formatting defaults and boolean flags", () => {
    const value = new Rational(1, 3);
    expect(() => value.toDecimal(0)).toThrow("positive safe integer");
    expect(() =>
      value.toRepeatingBaseWithPeriod(BaseSystem.DECIMAL, {
        useRepeatNotation: "no",
      }),
    ).toThrow("must be a boolean");
    expect(() => value.toScientificNotation("no", 5, false)).toThrow(
      "must be a boolean",
    );
    expect(() => value.toScientificNotation(true, 5, "no")).toThrow(
      "must be a boolean",
    );
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

  test("rejects a non-varying source instead of looping forever", () => {
    const interval = new RationalInterval("0", "1");
    expect(() =>
      interval.randomRational(
        2n ** 53n,
        "error",
        () => 0.9999999999999999,
      ),
    ).toThrow("must vary between calls");
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
    const balanced = new BaseSystem("T01", "Balanced ternary", {
      radix: 3,
      digitOffset: -1,
      allowReserved: false,
    });
    const values = [
      new Integer(2),
      fraction,
      fractionInterval,
      BaseSystem.HEXADECIMAL,
      balanced,
    ];
    const revivedValues = JSON.parse(JSON.stringify(values), reviveCoreValue);
    expect(isInteger(revivedValues[0])).toBe(true);
    expect(isFraction(revivedValues[1])).toBe(true);
    expect(isFractionInterval(revivedValues[2])).toBe(true);
    expect(isBaseSystem(revivedValues[3])).toBe(true);
    expect(revivedValues[1].toString()).toBe("2/4");
    expect(revivedValues[2].toString()).toBe("2/4:3/4");
    expect(revivedValues[3].equals(BaseSystem.HEXADECIMAL)).toBe(true);
    expect(revivedValues[4].equals(balanced)).toBe(true);
    expect(revivedValues[4].digitOffset).toBe(-1);
    expect(revivedValues[4].fromDecimal(-5n)).toBe("T11");
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

  test("rejects unsafe number exponents throughout the exact API", () => {
    const unsafe = Number.MAX_SAFE_INTEGER + 2;
    const calls = [
      () => new Integer(-1).pow(unsafe),
      () => new Integer(1).E(unsafe),
      () => new Rational(-1).pow(unsafe),
      () => new Rational(1).E(unsafe),
      () => new Fraction(-1).pow(unsafe),
      () => new Fraction(1).E(unsafe),
      () => new RationalInterval(-1, -1).pow(unsafe),
      () => new RationalInterval(1, 2).mpow(unsafe),
      () => new RationalInterval(1, 2).E(unsafe),
    ];
    for (const call of calls) {
      expect(call).toThrow("safe integer");
    }
    expect(new Rational(-1).pow(9007199254740993n).toString()).toBe("-1");
  });

  test("does not expose mutable decimal factor tables", () => {
    expect(Object.hasOwn(Rational, "POWERS_OF_5")).toBe(false);
    expect(new Rational(1, 5).toRepeatingDecimal()).toBe("0.2#0");
  });
});

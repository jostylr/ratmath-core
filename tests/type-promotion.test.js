import { describe, expect, it } from "bun:test";
import {
  Integer,
  Rational,
  RationalInterval,
  TypePromotion,
} from "../index.js";

describe("TypePromotion public API", () => {
  const integer = new Integer(2);
  const rational = new Rational(3, 2);
  const interval = new RationalInterval(1, 2);

  it("is a static-only utility class", () => {
    expect(() => new TypePromotion()).toThrow("static utility class");
  });

  it("identifies every level and rejects unknown values", () => {
    expect(TypePromotion.getTypeLevel(integer)).toBe(0);
    expect(TypePromotion.getTypeLevel(rational)).toBe(1);
    expect(TypePromotion.getTypeLevel(interval)).toBe(2);
    expect(() => TypePromotion.getTypeLevel({})).toThrow("Unknown type");
  });

  it("performs the direct promotion helpers", () => {
    expect(TypePromotion.integerToRational(integer).equals(new Rational(2))).toBe(
      true,
    );
    expect(
      TypePromotion.rationalToInterval(rational).equals(
        RationalInterval.point(rational),
      ),
    ).toBe(true);
    expect(
      TypePromotion.integerToInterval(integer).equals(
        RationalInterval.point(new Rational(2)),
      ),
    ).toBe(true);
  });

  it("promotes stepwise, preserves matching values, and rejects demotion", () => {
    expect(TypePromotion.promoteToLevel(integer, 0)).toBe(integer);
    expect(TypePromotion.promoteToLevel(integer, 1).equals(new Rational(2))).toBe(
      true,
    );
    expect(
      TypePromotion.promoteToLevel(integer, 2).equals(
        RationalInterval.point(new Rational(2)),
      ),
    ).toBe(true);
    expect(() => TypePromotion.promoteToLevel(interval, 1)).toThrow(
      "Cannot demote",
    );
  });

  it("promotes pairs to their common type", () => {
    const [promotedInteger, promotedRational] =
      TypePromotion.promoteToCommonType(integer, rational);
    expect(promotedInteger).toBeInstanceOf(Rational);
    expect(promotedRational).toBe(rational);

    const [promotedToInterval, existingInterval] =
      TypePromotion.promoteToCommonType(integer, interval);
    expect(promotedToInterval).toBeInstanceOf(RationalInterval);
    expect(existingInterval).toBe(interval);
  });

  it("dispatches arithmetic after promotion", () => {
    expect(TypePromotion.add(integer, rational).equals(new Rational(7, 2))).toBe(
      true,
    );
    expect(
      TypePromotion.subtract(rational, integer).equals(new Rational(-1, 2)),
    ).toBe(true);
    expect(
      TypePromotion.multiply(integer, interval).equals(
        new RationalInterval(2, 4),
      ),
    ).toBe(true);
    expect(TypePromotion.divide(new Integer(3), new Integer(2)).equals(rational)).toBe(
      true,
    );
    expect(
      TypePromotion.divide(interval, rational).equals(
        new RationalInterval(new Rational(2, 3), new Rational(4, 3)),
      ),
    ).toBe(true);
  });

  it("dispatches exponentiation and E notation", () => {
    expect(TypePromotion.eNotation(integer, -1).equals(new Rational(1, 5))).toBe(
      true,
    );
    expect(TypePromotion.power(rational, 2).equals(new Rational(9, 4))).toBe(
      true,
    );
    expect(TypePromotion.multiplyPower(integer, 3).equals(new Integer(8))).toBe(
      true,
    );
    expect(
      TypePromotion.multiplyPower(interval, 2).equals(
        new RationalInterval(1, 4),
      ),
    ).toBe(true);
  });

  it("negates all supported types and rejects unknown values", () => {
    expect(TypePromotion.negate(integer).equals(new Integer(-2))).toBe(true);
    expect(TypePromotion.negate(rational).equals(new Rational(-3, 2))).toBe(true);
    expect(
      TypePromotion.negate(interval).equals(new RationalInterval(-2, -1)),
    ).toBe(true);
    expect(() => TypePromotion.negate({})).toThrow("Cannot negate unknown type");
  });

  it("classifies scalar and interval source strings", () => {
    expect(TypePromotion.determineTypeFromString("42")).toBe("integer");
    expect(TypePromotion.determineTypeFromString("3/4")).toBe("rational");
    expect(TypePromotion.determineTypeFromString("2..1/3")).toBe("rational");
    expect(TypePromotion.determineTypeFromString("1.25")).toBe("rational");
    expect(TypePromotion.determineTypeFromString("1:2")).toBe("interval");
    expect(TypePromotion.determineTypeFromString("1.2[+-1]")).toBe("interval");
  });
});

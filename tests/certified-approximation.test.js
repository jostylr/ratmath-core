import { describe, expect, it } from "bun:test";
import {
  BaseSystem,
  CertifiedApproximation,
  Integer,
  Rational,
  RationalInterval,
  Relation,
  certifiedContinuedFractionPrefix,
  certifiedRadixPrefix,
  boundedContinuedFractionApproximation,
  boundedDecimalApproximation,
  isCertifiedApproximation,
  normalizeCertifiedApproximation,
  parseCertifiedApproximation,
  parseNumber,
  possibleRelations,
  reviveCoreValue,
} from "../index.js";

describe("CertifiedApproximation", () => {
  it("constructs positive and negative closed decimal cylinders", () => {
    const positive = parseCertifiedApproximation("23.456?");
    expect(positive).toBeInstanceOf(CertifiedApproximation);
    expect(positive.candidate.toString()).toBe("2932/125");
    expect(positive.low.toString()).toBe("2932/125");
    expect(positive.high.toString()).toBe("23457/1000");

    const negative = parseCertifiedApproximation("-23.456?");
    expect(negative.low.toString()).toBe("-23457/1000");
    expect(negative.high.toString()).toBe("-2932/125");
  });

  it("keeps provisional digits in the candidate, not the default enclosure", () => {
    const value = parseNumber("23.456?789");
    expect(value.candidate.toString()).toBe("23456789/1000000");
    expect(value.enclosure.toString()).toBe("2932/125:23457/1000");
    expect(value.toString()).toBe("23.456?789");
  });

  it("accepts a contained explicit bound and rejects a contradictory one", () => {
    const value = parseNumber("23.456?789[+-12]");
    expect(value.low.toString()).toBe("23456777/1000000");
    expect(value.high.toString()).toBe("23456801/1000000");
    expect(() => parseNumber("23.456?789[+-2000]")).toThrow();
  });

  it("constructs arbitrary-base cylinders", () => {
    const value = certifiedRadixPrefix({
      integerDigits: "a",
      fractionalDigits: "b",
      provisionalDigits: "c",
      baseSystem: BaseSystem.HEXADECIMAL,
      original: "0xa.b?c",
    });
    expect(value.candidate.toString()).toBe("687/64");
    expect(value.enclosure.toString()).toBe("171/16:43/4");
  });

  it("constructs continued-fraction cylinders in either orientation", () => {
    const odd = parseNumber("3.~7~15?");
    expect(odd.candidate.toString()).toBe("333/106");
    expect(odd.enclosure.toString()).toBe("333/106:355/113");
    const even = parseNumber("1.~2?");
    expect(even.enclosure.containsValue(new Rational(3n, 2n))).toBe(true);
    expect(even.enclosure.containsValue(new Rational(4n, 3n))).toBe(true);
  });

  it("propagates scalar enclosure arithmetic and collapses point results", () => {
    const value = parseNumber("2.0?5");
    const sum = value.add(new Integer(3n));
    expect(isCertifiedApproximation(sum)).toBe(true);
    expect(sum.enclosure.toString()).toBe("5:51/10");
    expect(new Integer(0n).multiply(value).toString()).toBe("0");
    expect(value.subtract(value).toString()).toBe("0");
    expect(value.copy().sameSource(value)).toBe(true);
    const spelling = sum.toString();
    expect(spelling).toBe("5.0?5");
    const roundTrip = parseNumber(spelling);
    expect(roundTrip).toBeInstanceOf(CertifiedApproximation);
    expect(roundTrip.enclosure.equals(sum.enclosure)).toBe(true);

    const negative = parseNumber("-2.0?").subtract(new Integer(1n));
    expect(parseNumber(negative.toString()).enclosure.equals(negative.enclosure)).toBe(true);

    expect(parseNumber("23.456?789").add(new Integer(1n)).toString()).toBe("24.456?789");
  });

  it("uses interval-collection semantics when explicitly mixed with an interval", () => {
    const approximation = parseNumber("2?");
    const interval = new RationalInterval(10, 11);
    expect(approximation.add(interval)).toBeInstanceOf(RationalInterval);
    expect(interval.add(approximation)).toBeInstanceOf(RationalInterval);
  });

  it("preserves all possible order relations", () => {
    const a = new RationalInterval(1, 2);
    const b = new RationalInterval(2, 3);
    expect(possibleRelations(a, b)).toBe(Relation.LESS | Relation.EQUAL);
    expect(possibleRelations(new RationalInterval(1, 3), new RationalInterval(2, 4)))
      .toBe(Relation.LESS | Relation.EQUAL | Relation.GREATER);
    const value = parseNumber("2?");
    expect(possibleRelations(value, value.copy())).toBe(Relation.EQUAL);
    expect(value.possibleRelationsTo(new Rational(5, 2))).toBe(
      Relation.LESS | Relation.EQUAL | Relation.GREATER,
    );
    expect(new Integer(1).possibleRelationsTo(value)).toBe(Relation.LESS);
    expect(new Rational(5, 2).possibleRelationsTo(value)).toBe(
      Relation.LESS | Relation.EQUAL | Relation.GREATER,
    );
    expect(new RationalInterval(2, 3).possibleRelationsTo(new Integer(3))).toBe(
      Relation.LESS | Relation.EQUAL,
    );
    expect(() => new RationalInterval(2, 3).possibleRelationsTo({})).toThrow(
      "Core numeric value",
    );
  });

  it("propagates unary operations and explicit conversions", () => {
    const value = parseNumber("2.0?5");
    const negated = value.negate();
    const reciprocal = value.reciprocal();
    const quotient = value.divide(new Integer(2));
    const squared = value.pow(2);
    const shiftedExponent = value.E(1);

    expect(negated.candidate.toString()).toBe("-41/20");
    expect(negated.enclosure.toString()).toBe("-21/10:-2");
    expect(reciprocal.candidate.toString()).toBe("20/41");
    expect(reciprocal.enclosure.toString()).toBe("10/21:1/2");
    expect(quotient.enclosure.toString()).toBe("1:21/20");
    expect(value.divide(value).toString()).toBe("1");
    const zeroContaining = parseNumber("0?");
    expect(() => zeroContaining.divide(zeroContaining.copy()))
      .toThrow("containing zero");
    expect(squared.candidate.toString()).toBe("1681/400");
    expect(squared.enclosure.toString()).toBe("4:441/100");
    expect(shiftedExponent.candidate.toString()).toBe("41/2");
    expect(shiftedExponent.enclosure.toString()).toBe("20:21");
    expect(value.toRationalInterval()).toBe(value.enclosure);
    expect(() => value.toRational()).toThrow("non-point");

    const point = new CertifiedApproximation(
      new Integer(2),
      RationalInterval.point(2),
    );
    expect(point.toRational().toString()).toBe("2");
    expect(normalizeCertifiedApproximation(
      new Integer(2),
      RationalInterval.point(2),
    ).toString()).toBe("2");
  });

  it("round-trips portable JSON while preserving a stable source id", () => {
    const value = new CertifiedApproximation(
      new Rational(3n, 2n),
      new RationalInterval(1, 2),
      {
        sourceId: "sensor-7",
        dependencies: ["calibration-2", Symbol("local-only")],
        representation: {
          kind: "derived",
          reason: "derived",
          requested: { fractionalDigits: 8 },
        },
      },
    );
    expect(Object.isFrozen(value.representation.requested)).toBe(true);
    const revived = JSON.parse(JSON.stringify(value), reviveCoreValue);
    expect(revived).toBeInstanceOf(CertifiedApproximation);
    expect(revived.sameSource(value)).toBe(true);
    expect(revived.dependencies).toEqual(["calibration-2"]);
  });

  it("preserves a derived candidate in parseable string output", () => {
    const value = parseNumber("2?").add(new Rational(1, 2));
    const spelling = value.toString();
    const revived = parseNumber(spelling);

    expect(spelling).toBe("5/2?[=5/2:7/2]");
    expect(revived.candidate.equals(value.candidate)).toBe(true);
    expect(revived.enclosure.equals(value.enclosure)).toBe(true);
  });

  it("validates public construction and exact coefficient inputs", () => {
    const interval = new RationalInterval(1, 2);
    expect(() => new CertifiedApproximation(1, interval, null)).toThrow(
      "options must be an object",
    );
    expect(() => new CertifiedApproximation(1, interval, { dependencies: "source" }))
      .toThrow("dependencies must be an array");
    expect(() => certifiedContinuedFractionPrefix({
      coefficients: [0, Number.MAX_SAFE_INTEGER + 1],
    })).toThrow("safe integer");

    const balanced = new BaseSystem("T01", "Balanced ternary", {
      digitOffset: -1,
    });
    expect(() => certifiedRadixPrefix({
      integerDigits: "1",
      baseSystem: balanced,
    })).toThrow("conventional positional");
  });

  it("makes bounded conversion explicit and leaves ordinary ellipses display-only", () => {
    expect(boundedDecimalApproximation(new Rational(1n, 7n), { fractionalDigits: 5 }).toString())
      .toBe("0.14285?");
    expect(boundedContinuedFractionApproximation(
      new Rational(103_993n, 33_102n),
      { maxTerms: 3 },
    ).toString()).toBe("3.~7~15?");
    expect(new Rational(103_993n, 33_102n).toContinuedFractionString({ maxTerms: 3 }))
      .toBe("3.~7~15~...");
  });
});

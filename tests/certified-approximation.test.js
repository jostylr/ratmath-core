import { describe, expect, it } from "bun:test";
import {
  BaseSystem,
  CertifiedApproximation,
  Integer,
  Rational,
  RationalInterval,
  Relation,
  certifiedRadixPrefix,
  boundedContinuedFractionApproximation,
  boundedDecimalApproximation,
  isCertifiedApproximation,
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
    expect(spelling).toContain("?[=");
    const roundTrip = parseNumber(spelling);
    expect(roundTrip).toBeInstanceOf(CertifiedApproximation);
    expect(roundTrip.enclosure.equals(sum.enclosure)).toBe(true);

    const negative = parseNumber("-2.0?").subtract(new Integer(1n));
    expect(parseNumber(negative.toString()).enclosure.equals(negative.enclosure)).toBe(true);
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
  });

  it("round-trips portable JSON while preserving a stable source id", () => {
    const value = new CertifiedApproximation(
      new Rational(3n, 2n),
      new RationalInterval(1, 2),
      { sourceId: "sensor-7", representation: { kind: "derived", reason: "derived" } },
    );
    const revived = JSON.parse(JSON.stringify(value), reviveCoreValue);
    expect(revived).toBeInstanceOf(CertifiedApproximation);
    expect(revived.sameSource(value)).toBe(true);
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

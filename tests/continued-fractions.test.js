// Continued Fractions Test Suite
// Tests for continued fraction functionality across Parser, Rational, and Fraction classes

import { test, expect, describe } from "bun:test";
import { Integer } from "../src/integer.js";
import { Rational } from "../src/rational.js";
import { Fraction } from "../src/fraction.js";
import { Parser } from "../src/parser.js";

describe("Continued Fractions - Parser Extension", () => {
  test("should parse basic continued fraction notation", () => {
    // Parser should handle 3.~7~15~1~292 syntax
    const parser = new Parser();

    // Basic CF notation
    expect(() => parser.parse("3.~7~15~1~292")).not.toThrow();

    // Zero integer part
    expect(() => parser.parse("0.~2~3~4")).not.toThrow();

    // Integer representation
    expect(() => parser.parse("5.~0")).not.toThrow();
  });

  test("should tokenize tilde separators correctly", () => {
    const parser = new Parser();

    // Should properly handle multiple tildes
    expect(() => parser.parse("1.~2~3~4~5~6")).not.toThrow();

    // Should handle negative integer part
    expect(() => parser.parse("-2.~1~4~1~5")).not.toThrow();
  });

  test("should validate continued fraction format", () => {
    const parser = new Parser();

    // Invalid formats should throw
    expect(() => parser.parse("3.~~7")).toThrow(); // Double tilde
    expect(() => parser.parse("3.~")).toThrow(); // Trailing tilde
    expect(() => parser.parse(".~5")).toThrow(); // Missing integer part
  });

  test("should parse CF to coefficient array", () => {
    // This tests the stand-alone parsing that generates array of coefficients
    // [integer_part, ...continued_fraction_terms]

    // 3.~7~15~1~292 should parse to [3, 7, 15, 1, 292]
    const parser = new Parser();
    const result = parser.parseContinuedFraction("3.~7~15~1~292");
    expect(result).toEqual([3, 7, 15, 1, 292]);

    // 0.~2~3~4 should parse to [0, 2, 3, 4]
    const result2 = parser.parseContinuedFraction("0.~2~3~4");
    expect(result2).toEqual([0, 2, 3, 4]);

    // 5.~0 should parse to [5] (0 term should be omitted)
    const result3 = parser.parseContinuedFraction("5.~0");
    expect(result3).toEqual([5]);
  });
});

describe("Continued Fractions - Rational Class Integration", () => {
  test("should create Rational from continued fraction array", () => {
    // Test fromContinuedFraction static method
    const cf1 = [3, 7, 15, 1, 292];
    const rational1 = Rational.fromContinuedFraction(cf1);
    expect(rational1).toBeInstanceOf(Rational);

    // Simple test case: [1, 2] = 1 + 1/2 = 3/2
    const cf2 = [1, 2];
    const rational2 = Rational.fromContinuedFraction(cf2);
    expect(rational2.num).toBe(3n);
    expect(rational2.den).toBe(2n);

    // Zero integer part: [0, 3] = 1/3
    const cf3 = [0, 3];
    const rational3 = Rational.fromContinuedFraction(cf3);
    expect(rational3.num).toBe(1n);
    expect(rational3.den).toBe(3n);
  });

  test("should handle convergents computation", () => {
    // Test convergents using recurrence relation:
    // p₋₁ = 1, p₀ = a₀, pₙ = aₙ * pₙ₋₁ + pₙ₋₂
    // q₋₁ = 0, q₀ = 1, qₙ = aₙ * qₙ₋₁ + qₙ₋₂

    const cf = [3, 7, 15, 1];
    const rational = Rational.fromContinuedFraction(cf);

    // Should have convergents property as array
    expect(rational.convergents).toBeInstanceOf(Array);
    expect(rational.convergents.length).toBeGreaterThan(0);

    // First convergent should be [3/1]
    expect(rational.convergents[0].num).toBe(3n);
    expect(rational.convergents[0].den).toBe(1n);
  });

  test("should store cf coefficients on instance", () => {
    const cf = [3, 7, 15, 1, 292];
    const rational = Rational.fromContinuedFraction(cf);

    // Should have cf property without integer part
    expect(rational.cf).toEqual([7, 15, 1, 292]);

    // Should have wholePart set if not already defined
    expect(rational.wholePart).toBe(3n);
  });

  test("should convert Rational to continued fraction", () => {
    // Test toContinuedFraction() method
    const rational = new Rational(355n, 113n); // Good approximation to π
    const cf = rational.toContinuedFraction();

    expect(cf).toBeInstanceOf(Array);
    expect(cf[0]).toBe(3n); // Integer part
    expect(cf.length).toBeGreaterThan(1);

    // Should save CF on instance
    expect(rational.cf).toBeInstanceOf(Array);
  });

  test("should limit continued fraction terms", () => {
    const rational = new Rational(355n, 113n);
    const cf = rational.toContinuedFraction(3); // Limit to 3 terms

    expect(cf.length).toBeLessThanOrEqual(3);
  });

  test("should not end with 1 unless representing integer 1", () => {
    const rational = new Rational(7n, 3n); // 2.333... = [2; 3]
    const cf = rational.toContinuedFraction();

    // Should not end with 1 (canonical form)
    if (cf.length > 1) {
      expect(cf[cf.length - 1]).not.toBe(1n);
    }

    // Special case: integer 1 should be [1]
    const one = new Rational(1n, 1n);
    const cfOne = one.toContinuedFraction();
    expect(cfOne).toEqual([1n]);
  });

  test("should handle negative rationals", () => {
    const negRational = new Rational(-22n, 7n); // -π approximation
    const cf = negRational.toContinuedFraction();

    expect(cf[0]).toBeLessThan(0n); // First term should be negative

    // Should properly handle isNegative flag
    const reconstructed = Rational.fromContinuedFraction(cf);
    expect(reconstructed.isNegative).toBe(true);
  });
});

describe("Continued Fractions - String Representation", () => {
  test("should convert to CF string format", () => {
    const rational = new Rational(22n, 7n);
    const cfString = rational.toContinuedFractionString();

    // Should use 3.~7~15~1 format
    expect(cfString).toMatch(/^\d+\.~\d+(~\d+)*$/);
  });

  test("should handle zero integer part in string", () => {
    const rational = new Rational(1n, 3n);
    const cfString = rational.toContinuedFractionString();

    // Should include leading 0
    expect(cfString).toMatch(/^0\.~/);
  });

  test("should handle integer representation", () => {
    const integer = new Rational(5n, 1n);
    const cfString = integer.toContinuedFractionString();

    // Should be in verbose form: 5.~0
    expect(cfString).toBe("5.~0");
  });

  test("should parse from CF string", () => {
    const cfString = "3.~7~15~1~292";
    const rational = Rational.fromContinuedFractionString(cfString);

    expect(rational).toBeInstanceOf(Rational);
    expect(rational.cf).toEqual([7, 15, 1, 292]);
  });
});

describe("Continued Fractions - Convergents Support", () => {
  test("should compute convergents array", () => {
    const rational = new Rational(22n, 7n);
    const convergents = rational.convergents();

    expect(convergents).toBeInstanceOf(Array);
    expect(convergents.length).toBeGreaterThan(0);

    // Each convergent should be a Rational
    convergents.forEach((conv) => {
      expect(conv).toBeInstanceOf(Rational);
    });
  });

  test("should limit convergents count", () => {
    const rational = new Rational(355n, 113n);
    const limitedConvergents = rational.convergents(3);

    expect(limitedConvergents.length).toBeLessThanOrEqual(3);
  });

  test("should compute convergents from CF array", () => {
    const cf = [3, 7, 15, 1, 292];
    const convergents = Rational.convergentsFromCF(cf);

    expect(convergents).toBeInstanceOf(Array);
    expect(convergents[0].num).toBe(3n);
    expect(convergents[0].den).toBe(1n);
  });

  test("should compute convergents from CF string", () => {
    const cfString = "3.~7~15~1";
    const convergents = Rational.convergentsFromCF(cfString, 2);

    expect(convergents.length).toBeLessThanOrEqual(2);
  });
});

describe("Continued Fractions - Utility Methods", () => {
  test("should get nth convergent", () => {
    const rational = new Rational(355n, 113n);
    const convergent2 = rational.getConvergent(2);

    expect(convergent2).toBeInstanceOf(Rational);
  });

  test("should compute approximation error", () => {
    const target = new Rational(355n, 113n);
    const approx = new Rational(22n, 7n);
    const error = approx.approximationError(target);

    expect(error).toBeInstanceOf(Rational);
    expect(error.num).toBeGreaterThan(0n);
  });

  test("should find best approximation within denominator limit", () => {
    const pi = new Rational(355n, 113n);
    const best = pi.bestApproximation(100n);

    expect(best).toBeInstanceOf(Rational);
    expect(best.den).toBeLessThanOrEqual(100n);
  });
});

describe("Continued Fractions - Farey Sequence and Mediant Operations", () => {
  test("should find Farey parents", () => {
    const fraction = new Fraction(3n, 5n);
    const parents = fraction.fareyParents();

    expect(parents).toHaveProperty("left");
    expect(parents).toHaveProperty("right");
    expect(parents.left).toBeInstanceOf(Fraction);
    expect(parents.right).toBeInstanceOf(Fraction);

    // Verify Farey adjacency: |ad - bc| = 1
    const { left, right } = parents;
    const det = left.num * right.den - left.den * right.num;
    expect(det === 1n || det === -1n).toBe(true);
  });

  test("should compute mediant partner", () => {
    const endpoint = new Fraction(1n, 2n);
    const mediant = new Fraction(2n, 3n);
    const partner = Fraction.mediantPartner(endpoint, mediant);

    expect(partner).toBeInstanceOf(Fraction);

    // Verify mediant relationship
    const computedMediant = endpoint.mediant(partner);
    expect(computedMediant.equals(mediant)).toBe(true);
  });

  test("should validate mediant triple", () => {
    const left = new Fraction(1n, 3n);
    const right = new Fraction(1n, 2n);
    const mediant = left.mediant(right);

    const isValid = Fraction.isMediantTriple(left, mediant, right);
    expect(isValid).toBe(true);

    // Invalid triple
    const notMediant = new Fraction(1n, 4n);
    const isInvalid = Fraction.isMediantTriple(left, notMediant, right);
    expect(isInvalid).toBe(false);
  });

  test("should validate Farey triple", () => {
    const left = new Fraction(1n, 3n);
    const right = new Fraction(1n, 2n);
    const mediant = left.mediant(right); // 2/5

    const isFarey = Fraction.isFareyTriple(left, mediant, right);
    expect(isFarey).toBe(true);

    // Non-adjacent Farey fractions
    const farLeft = new Fraction(1n, 4n);
    const isNotFarey = Fraction.isFareyTriple(farLeft, mediant, right);
    expect(isNotFarey).toBe(false);
  });

  test("should handle integer cases in Farey operations", () => {
    const integer = new Fraction(2n, 1n);
    const parents = integer.fareyParents();

    // Should involve infinite fractions
    expect(parents.left || parents.right).toBeDefined();
  });
});

describe("Continued Fractions - Stern-Brocot Tree Support", () => {
  test("should support infinite fractions as boundaries", () => {
    // Positive infinity: 1/0
    const posInf = new Fraction(1n, 0n, { allowInfinite: true });
    expect(posInf.den).toBe(0n);
    expect(posInf.num).toBe(1n);

    // Negative infinity: -1/0
    const negInf = new Fraction(-1n, 0n, { allowInfinite: true });
    expect(negInf.den).toBe(0n);
    expect(negInf.num).toBe(-1n);
  });

  test("should find Stern-Brocot parent", () => {
    const fraction = new Fraction(3n, 5n);
    const parent = fraction.sternBrocotParent();

    expect(parent).toBeInstanceOf(Fraction);
  });

  test("should find Stern-Brocot children", () => {
    const fraction = new Fraction(1n, 1n);
    const children = fraction.sternBrocotChildren();

    expect(children).toHaveProperty("left");
    expect(children).toHaveProperty("right");
    expect(children.left).toBeInstanceOf(Fraction);
    expect(children.right).toBeInstanceOf(Fraction);
  });

  test("should generate Stern-Brocot path", () => {
    const fraction = new Fraction(3n, 5n);
    const path = fraction.sternBrocotPath();

    expect(path).toBeInstanceOf(Array);
    expect(path.every((dir) => dir === "L" || dir === "R")).toBe(true);
  });

  test("should construct fraction from Stern-Brocot path", () => {
    const path = ["L", "R", "L"];
    const fraction = Fraction.fromSternBrocotPath(path);

    expect(fraction).toBeInstanceOf(Fraction);

    // Verify round-trip
    const reconstructedPath = fraction.sternBrocotPath();
    expect(reconstructedPath).toEqual(path);
  });

  test("should validate Stern-Brocot position", () => {
    const fraction = new Fraction(3n, 5n);
    const isValid = fraction.isSternBrocotValid();

    expect(typeof isValid).toBe("boolean");
  });

  test("should compute Stern-Brocot depth", () => {
    const fraction = new Fraction(1n, 1n); // Root
    const depth = fraction.sternBrocotDepth();

    expect(typeof depth).toBe("number");
    expect(depth).toBe(0); // Root is at depth 0
  });

  test("should find Stern-Brocot ancestors", () => {
    const fraction = new Fraction(3n, 5n);
    const ancestors = fraction.sternBrocotAncestors();

    expect(ancestors).toBeInstanceOf(Array);
    expect(ancestors[ancestors.length - 1].equals(new Fraction(1n, 1n))).toBe(
      true,
    ); // Root
  });
});

describe("Continued Fractions - Roundtrip Conversion", () => {
  test("should maintain precision in Rational → CF → Rational", () => {
    const original = new Rational(355n, 113n);
    const cf = original.toContinuedFraction();
    const reconstructed = Rational.fromContinuedFraction(cf);

    expect(reconstructed.equals(original)).toBe(true);
  });

  test("should handle complex fractions", () => {
    const complex = new Rational(1234567n, 987654n);
    const cf = complex.toContinuedFraction();
    const reconstructed = Rational.fromContinuedFraction(cf);

    expect(reconstructed.equals(complex)).toBe(true);
  });

  test("should preserve negative values", () => {
    const negative = new Rational(-22n, 7n);
    const cf = negative.toContinuedFraction();
    const reconstructed = Rational.fromContinuedFraction(cf);

    expect(reconstructed.equals(negative)).toBe(true);
    expect(reconstructed.isNegative).toBe(true);
  });
});

describe("Continued Fractions - Integration Tests", () => {
  test("should work with template functions", () => {
    // Test R`` template with CF notation
    expect(() => R`3.~7~15~1`).not.toThrow();

    const rational = R`22/7`;
    const cfString = rational.toContinuedFractionString();
    const parsed = R`${cfString}`;

    expect(parsed.equals(rational)).toBe(true);
  });

  test("should work with F`` template", () => {
    // Test F`` template with CF notation
    expect(() => F`3.~7~15~1`).not.toThrow();

    const fraction = F`22/7`;
    const parents = fraction.fareyParents();

    expect(parents.left).toBeInstanceOf(Fraction);
    expect(parents.right).toBeInstanceOf(Fraction);
  });

  test("should work in arithmetic expressions", () => {
    const cf1 = R`3.~7~15`;
    const cf2 = R`22/7`;

    const sum = cf1.add(cf2);
    expect(sum).toBeInstanceOf(Rational);

    const product = cf1.multiply(cf2);
    expect(product).toBeInstanceOf(Rational);
  });
});

describe("Continued Fractions - Edge Cases", () => {
  test("should handle zero", () => {
    const zero = new Rational(0n, 1n);
    const cf = zero.toContinuedFraction();

    expect(cf).toEqual([0n]);
  });

  test("should handle unit fractions", () => {
    const unit = new Rational(1n, 5n);
    const cf = unit.toContinuedFraction();

    expect(cf[0]).toBe(0n);
    expect(cf[1]).toBe(5n);
  });

  test("should handle very large numerators/denominators", () => {
    const large = new Rational(
      BigInt("123456789012345678901234567890"),
      BigInt("987654321098765432109876543210"),
    );
    const cf = large.toContinuedFraction();

    expect(cf).toBeInstanceOf(Array);
    expect(cf.length).toBeGreaterThan(0);
  });

  test("should respect maximum terms limit", () => {
    const rational = new Rational(355n, 113n);

    // Set a default limit and verify it's respected
    Rational.DEFAULT_CF_LIMIT = 5;
    const cf = rational.toContinuedFraction();

    expect(cf.length).toBeLessThanOrEqual(5);
  });
});

describe("Continued Fractions - Performance Tests", () => {
  test("should handle moderately large continued fractions efficiently", () => {
    const start = performance.now();

    // Generate CF with many terms
    const largeCF = [
      3, 7, 15, 1, 292, 1, 1, 1, 2, 1, 3, 1, 14, 2, 1, 1, 2, 2, 2,
    ];
    const rational = Rational.fromContinuedFraction(largeCF);
    const reconstructed = rational.toContinuedFraction();

    const end = performance.now();

    expect(end - start).toBeLessThan(100); // Should complete in < 100ms
    expect(reconstructed.length).toEqual(largeCF.length);
  });

  test("should compute convergents efficiently", () => {
    const start = performance.now();

    const rational = new Rational(355n, 113n);
    const convergents = rational.convergents(10);

    const end = performance.now();

    expect(end - start).toBeLessThan(50); // Should complete in < 50ms
    expect(convergents.length).toBeLessThanOrEqual(10);
  });
});

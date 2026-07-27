import { describe, expect, it } from "bun:test";
import { BaseSystem, Fraction, Rational } from "../index.js";

const absolute = (value) => (value < 0n ? -value : value);

const gcd = (left, right) => {
  left = absolute(left);
  right = absolute(right);
  while (right !== 0n) {
    [left, right] = [right, left % right];
  }
  return left;
};

describe("publishing regressions", () => {
  describe("generalized Farey parents", () => {
    it("returns ordinary parents for a reduced fraction", () => {
      const parents = new Fraction(3, 5).fareyParents();

      expect(parents.left.toString()).toBe("1/2");
      expect(parents.right.toString()).toBe("2/3");
      expect(
        Fraction.isFareyTriple(
          parents.left,
          new Fraction(3, 5),
          parents.right,
        ),
      ).toBe(true);
    });

    it("recognizes the canonical zero root and its infinite boundaries", () => {
      const value = new Fraction(0, 1);
      const parents = value.fareyParents();

      expect(parents.left.toString()).toBe("-1/0");
      expect(parents.right.toString()).toBe("1/0");
      expect(Fraction.isMediantTriple(parents.left, value, parents.right)).toBe(
        true,
      );
      expect(Fraction.isFareyTriple(parents.left, value, parents.right)).toBe(
        true,
      );
    });

    it("lifts reduced parents to a balanced unreduced representation", () => {
      const value = new Fraction(6, 10);
      const parents = value.fareyParents();

      expect(parents.left.toString()).toBe("4/7");
      expect(parents.right.toString()).toBe("2/3");
      expect(parents.left.mediant(parents.right).equals(value)).toBe(true);
      expect(Fraction.isFareyTriple(parents.left, value, parents.right)).toBe(
        true,
      );
    });

    it("uses the component gcd as the generalized determinant", () => {
      for (const [numerator, denominator] of [
        [-6n, 10n],
        [0n, 6n],
        [6n, 2n],
        [42n, 70n],
      ]) {
        const value = new Fraction(numerator, denominator);
        const { left, right } = value.fareyParents();
        const middle = left.mediant(right);
        const determinant = absolute(
          left.numerator * right.denominator -
            left.denominator * right.numerator,
        );

        expect(middle.equals(value)).toBe(true);
        expect(determinant).toBe(gcd(numerator, denominator));
        expect(left.lessThan(middle)).toBe(true);
        expect(middle.lessThan(right)).toBe(true);
        expect(Fraction.isFareyTriple(left, middle, right)).toBe(true);
      }
    });

    it("normalizes a negative denominator before finding parents", () => {
      const parents = new Fraction(6, -10).fareyParents();
      const middle = parents.left.mediant(parents.right);

      expect(middle.toString()).toBe("-6/10");
      expect(parents.left.lessThan(middle)).toBe(true);
      expect(middle.lessThan(parents.right)).toBe(true);
    });

    it("handles large components without walking the Stern-Brocot tree", () => {
      const value = new Fraction(
        2469135780246913578n,
        2000000000000000000n,
      );
      const { left, right } = value.fareyParents();

      expect(left.mediant(right).equals(value)).toBe(true);
      expect(Fraction.isFareyTriple(left, value, right)).toBe(true);
    });
  });

  describe("exact mediant partners", () => {
    it("subtracts the known endpoint components from the mediant", () => {
      const endpoint = new Fraction(0, 1);
      const middle = new Fraction(1, 3);
      const partner = Fraction.mediantPartner(endpoint, middle);

      expect(partner.toString()).toBe("1/2");
      expect(endpoint.mediant(partner).equals(middle)).toBe(true);
    });

    it("allows a nonzero zero-denominator partner", () => {
      const endpoint = new Fraction(2, 3);
      const middle = new Fraction(1, 3);
      const partner = Fraction.mediantPartner(endpoint, middle);

      expect(partner.toString()).toBe("-1/0");
      expect(partner.isInfinite).toBe(true);
      expect(endpoint.mediant(partner).equals(middle)).toBe(true);
    });

    it("rejects identical endpoint and mediant components", () => {
      const value = new Fraction(2, 3);
      expect(() => Fraction.mediantPartner(value, value)).toThrow("0/0");
    });
  });

  describe("Fraction signs and zero denominators", () => {
    it("compares finite values independently of denominator signs", () => {
      const negativeHalf = new Fraction(1, -2);
      const zero = new Fraction(0, -7);
      const positiveHalf = new Fraction(-1, -2);

      expect(negativeHalf.lessThan(zero)).toBe(true);
      expect(zero.lessThan(positiveHalf)).toBe(true);
      expect(positiveHalf.greaterThan(new Fraction(2, 5))).toBe(true);
      expect(negativeHalf.lessThanOrEqual(new Fraction(-2, 4))).toBe(true);
    });

    it("supports signed nonzero values over zero when explicitly enabled", () => {
      const positiveInfinity = new Fraction(2, 0, { allowInfinite: true });
      const negativeInfinity = new Fraction(-3, 0, { allowInfinite: true });

      expect(negativeInfinity.lessThan(new Fraction(-1000, 1))).toBe(true);
      expect(positiveInfinity.greaterThan(new Fraction(1000, 1))).toBe(true);
      expect(
        positiveInfinity.lessThanOrEqual(
          new Fraction(1, 0, { allowInfinite: true }),
        ),
      ).toBe(true);
      expect(positiveInfinity.reduce().toString()).toBe("1/0");
      expect(negativeInfinity.reduce().toString()).toBe("-1/0");
      expect(positiveInfinity.add(positiveInfinity).toString()).toBe("4/0");
      expect(() => positiveInfinity.toRational()).toThrow("infinite");
    });

    it("always rejects 0/0, including indeterminate arithmetic", () => {
      expect(() => new Fraction(0, 0, { allowInfinite: true })).toThrow(
        "0/0",
      );

      const positiveInfinity = new Fraction(1, 0, { allowInfinite: true });
      const negativeInfinity = new Fraction(-1, 0, { allowInfinite: true });
      expect(() => positiveInfinity.add(negativeInfinity)).toThrow("0/0");
      expect(() => positiveInfinity.multiply(new Fraction(0, 1))).toThrow(
        "0/0",
      );
    });
  });

  describe("bounded rational approximations", () => {
    it("finds the closest rational, including semiconvergents", () => {
      const value = new Rational(5, 7);

      expect(value.bestApproximation(5n).toString()).toBe("3/4");
      expect(value.bestConvergent(5n).toString()).toBe("2/3");
    });

    it("separates absolute-error approximation from convergents", () => {
      const value = new Rational(355, 113);

      expect(value.bestApproximation(100n).toString()).toBe("311/99");
      expect(value.bestConvergent(100n).toString()).toBe("22/7");
      expect(value.bestApproximation(113n).toString()).toBe("355/113");
    });

    it("works symmetrically for negative values", () => {
      const value = new Rational(-5, 7);

      expect(value.bestApproximation(5n).toString()).toBe("-3/4");
      expect(value.bestConvergent(5n).toString()).toBe("-2/3");
    });

    it("rejects invalid denominator bounds", () => {
      const value = new Rational(5, 7);

      for (const invalid of [0n, -1n, 5]) {
        expect(() => value.bestApproximation(invalid)).toThrow(
          "positive bigint",
        );
        expect(() => value.bestConvergent(invalid)).toThrow("positive bigint");
      }
    });

    it("has no strictly closer small-denominator candidate", () => {
      for (const value of [
        new Rational(5, 7),
        new Rational(17, 31),
        new Rational(-23, 41),
        new Rational(355, 113),
      ]) {
        for (let limit = 1n; limit <= 12n; limit += 1n) {
          const best = value.bestApproximation(limit);
          const bestError = absolute(
            value.numerator * best.denominator -
              best.numerator * value.denominator,
          );

          for (let denominator = 1n; denominator <= limit; denominator += 1n) {
            for (let numerator = -50n; numerator <= 50n; numerator += 1n) {
              const candidateError = absolute(
                value.numerator * denominator -
                  numerator * value.denominator,
              );
              expect(
                candidateError * best.denominator >=
                  bestError * denominator,
              ).toBe(true);
            }
          }
        }
      }
    });
  });

  describe("BaseSystem validation", () => {
    it("rejects non-integral digit indexes", () => {
      expect(() => BaseSystem.DECIMAL.getChar(1.5)).toThrow("integer");
      expect(() => BaseSystem.DECIMAL.getChar(Number.NaN)).toThrow("integer");
    });

    it("rejects a bare minus sign", () => {
      expect(() => BaseSystem.DECIMAL.toDecimal("-")).toThrow(
        "followed by at least one digit",
      );
    });

    it("requires a single Unicode character per array entry", () => {
      expect(() => new BaseSystem(["0", "ten"])).toThrow(
        "single Unicode character",
      );

      const emojiBinary = new BaseSystem(["⚪", "⚫"]);
      expect(emojiBinary.toDecimal("⚫⚪")).toBe(2n);
      expect(emojiBinary.fromDecimal(2n)).toBe("⚫⚪");
    });
  });
});

import { describe, it, expect } from "bun:test";
import { TypePromotion } from "../src/type-promotion.js";
import { Integer } from "../src/integer.js";
import { Rational } from "../src/rational.js";
import { RationalInterval } from "../src/rational-interval.js";

describe("TypePromotion.promoteToLevel error handling", () => {
  it("throws when target level is greater than 2", () => {
    const int = new Integer(1);
    expect(() => TypePromotion.promoteToLevel(int, 3)).toThrow();
  });

  it("throws when target level is negative", () => {
    const rat = new Rational(1n, 2n);
    expect(() => TypePromotion.promoteToLevel(rat, -1)).toThrow();
  });

  it("throws when target level is not an integer", () => {
    const interval = new RationalInterval(new Rational(1n, 2n), new Rational(3n, 2n));
    expect(() => TypePromotion.promoteToLevel(interval, 1.5)).toThrow();
  });
});

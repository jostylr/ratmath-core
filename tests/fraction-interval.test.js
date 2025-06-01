import { describe, expect, it } from "bun:test";
import { Fraction } from "../src/fraction.js";
import { FractionInterval } from "../src/fraction-interval.js";
import { RationalInterval } from "../src/rational-interval.js";

describe("FractionInterval", () => {
  describe("construction", () => {
    it("creates from two Fraction endpoints", () => {
      const a = new Fraction(1, 3);
      const b = new Fraction(2, 3);
      const interval = new FractionInterval(a, b);
      
      expect(interval.low).toBe(a);
      expect(interval.high).toBe(b);
    });

    it("automatically orders endpoints", () => {
      const a = new Fraction(2, 3);
      const b = new Fraction(1, 3);
      const interval = new FractionInterval(a, b); // Passing in high, low
      
      expect(interval.low.equals(b)).toBe(true); // Should be reordered as low, high
      expect(interval.high.equals(a)).toBe(true);
    });

    it("throws when endpoints are not Fraction objects", () => {
      expect(() => new FractionInterval(1, 2)).toThrow("FractionInterval endpoints must be Fraction objects");
      expect(() => new FractionInterval("1/2", new Fraction(2, 3))).toThrow("FractionInterval endpoints must be Fraction objects");
    });
  });

  describe("mediantSplit", () => {
    it("splits an interval into two using mediant", () => {
      const interval = new FractionInterval(new Fraction(1, 2), new Fraction(3, 4));
      const [left, right] = interval.mediantSplit();
      
      expect(left.low.equals(new Fraction(1, 2))).toBe(true);
      expect(left.high.equals(new Fraction(4, 6))).toBe(true); // Mediant of 1/2 and 3/4 is (1+3)/(2+4) = 4/6
      
      expect(right.low.equals(new Fraction(4, 6))).toBe(true);
      expect(right.high.equals(new Fraction(3, 4))).toBe(true);
    });
    
    it("handles zero-width intervals (point intervals)", () => {
      const point = new FractionInterval(new Fraction(1, 2), new Fraction(1, 2));
      const [left, right] = point.mediantSplit();
      
      // The mediant of 1/2 and 1/2 is (1+1)/(2+2) = 2/4
      expect(left.low.equals(new Fraction(1, 2))).toBe(true);
      expect(left.high.equals(new Fraction(2, 4))).toBe(true);
      
      expect(right.low.equals(new Fraction(2, 4))).toBe(true);
      expect(right.high.equals(new Fraction(1, 2))).toBe(true);
    });
  });

  describe("partitionWithMediants", () => {
    it("returns the original interval when n = 0", () => {
      const interval = new FractionInterval(new Fraction(0, 1), new Fraction(1, 1));
      const result = interval.partitionWithMediants(0);
      
      expect(result.length).toBe(1);
      expect(result[0]).toBe(interval);
    });
    
    it("splits once with default n = 1", () => {
      const interval = new FractionInterval(new Fraction(0, 1), new Fraction(1, 1));
      const result = interval.partitionWithMediants(); // Default n = 1
      
      expect(result.length).toBe(2);
      expect(result[0].low.equals(new Fraction(0, 1))).toBe(true);
      expect(result[0].high.equals(new Fraction(1, 2))).toBe(true);
      
      expect(result[1].low.equals(new Fraction(1, 2))).toBe(true);
      expect(result[1].high.equals(new Fraction(1, 1))).toBe(true);
    });
    
    it("splits recursively with n = 2", () => {
      const interval = new FractionInterval(new Fraction(0, 1), new Fraction(1, 1));
      const result = interval.partitionWithMediants(2);
      
      expect(result.length).toBe(4);
      
      // First level splits [0/1, 1/1] into [0/1, 1/2] and [1/2, 1/1]
      // Second level splits each of those
      // [0/1, 1/2] -> [0/1, 1/3] and [1/3, 1/2]
      // [1/2, 1/1] -> [1/2, 2/3] and [2/3, 1/1]
      
      expect(result[0].low.equals(new Fraction(0, 1))).toBe(true);
      expect(result[0].high.equals(new Fraction(1, 3))).toBe(true);
      
      expect(result[1].low.equals(new Fraction(1, 3))).toBe(true);
      expect(result[1].high.equals(new Fraction(1, 2))).toBe(true);
      
      expect(result[2].low.equals(new Fraction(1, 2))).toBe(true);
      expect(result[2].high.equals(new Fraction(2, 3))).toBe(true);
      
      expect(result[3].low.equals(new Fraction(2, 3))).toBe(true);
      expect(result[3].high.equals(new Fraction(1, 1))).toBe(true);
    });
    
    it("throws when n is negative", () => {
      const interval = new FractionInterval(new Fraction(0, 1), new Fraction(1, 1));
      expect(() => interval.partitionWithMediants(-1)).toThrow("Depth of mediant partitioning must be non-negative");
    });
  });

  describe("partitionWith", () => {
    it("creates intervals using the provided function", () => {
      const interval = new FractionInterval(new Fraction(0, 1), new Fraction(1, 1));
      
      // Function that returns three equidistant points
      const fn = (a, b) => [
        new Fraction(1, 4),
        new Fraction(1, 2),
        new Fraction(3, 4)
      ];
      
      const result = interval.partitionWith(fn);
      
      expect(result.length).toBe(4);
      
      expect(result[0].low.equals(new Fraction(0, 1))).toBe(true);
      expect(result[0].high.equals(new Fraction(1, 4))).toBe(true);
      
      expect(result[1].low.equals(new Fraction(1, 4))).toBe(true);
      expect(result[1].high.equals(new Fraction(1, 2))).toBe(true);
      
      expect(result[2].low.equals(new Fraction(1, 2))).toBe(true);
      expect(result[2].high.equals(new Fraction(3, 4))).toBe(true);
      
      expect(result[3].low.equals(new Fraction(3, 4))).toBe(true);
      expect(result[3].high.equals(new Fraction(1, 1))).toBe(true);
    });
    
    it("deduplicates identical points", () => {
      const interval = new FractionInterval(new Fraction(0, 1), new Fraction(1, 1));
      
      // Function that returns points with duplicates
      const fn = (a, b) => [
        new Fraction(1, 2),
        new Fraction(1, 2), // Duplicate
        new Fraction(3, 4)
      ];
      
      const result = interval.partitionWith(fn);
      
      expect(result.length).toBe(3);
      
      expect(result[0].low.equals(new Fraction(0, 1))).toBe(true);
      expect(result[0].high.equals(new Fraction(1, 2))).toBe(true);
      
      expect(result[1].low.equals(new Fraction(1, 2))).toBe(true);
      expect(result[1].high.equals(new Fraction(3, 4))).toBe(true);
      
      expect(result[2].low.equals(new Fraction(3, 4))).toBe(true);
      expect(result[2].high.equals(new Fraction(1, 1))).toBe(true);
    });
    
    it("sorts points in ascending order", () => {
      const interval = new FractionInterval(new Fraction(0, 1), new Fraction(1, 1));
      
      // Function that returns points in arbitrary order
      const fn = (a, b) => [
        new Fraction(3, 4),
        new Fraction(1, 4),
        new Fraction(1, 2)
      ];
      
      const result = interval.partitionWith(fn);
      
      expect(result.length).toBe(4);
      
      expect(result[0].low.equals(new Fraction(0, 1))).toBe(true);
      expect(result[0].high.equals(new Fraction(1, 4))).toBe(true);
      
      expect(result[1].low.equals(new Fraction(1, 4))).toBe(true);
      expect(result[1].high.equals(new Fraction(1, 2))).toBe(true);
      
      expect(result[2].low.equals(new Fraction(1, 2))).toBe(true);
      expect(result[2].high.equals(new Fraction(3, 4))).toBe(true);
      
      expect(result[3].low.equals(new Fraction(3, 4))).toBe(true);
      expect(result[3].high.equals(new Fraction(1, 1))).toBe(true);
    });
    
    it("throws when partition function returns non-array", () => {
      const interval = new FractionInterval(new Fraction(0, 1), new Fraction(1, 1));
      const badFn = (a, b) => "not an array";
      
      expect(() => interval.partitionWith(badFn)).toThrow("Partition function must return an array of Fractions");
    });
    
    it("throws when partition function returns non-Fraction elements", () => {
      const interval = new FractionInterval(new Fraction(0, 1), new Fraction(1, 1));
      const badFn = (a, b) => [1, 2, 3];
      
      expect(() => interval.partitionWith(badFn)).toThrow("Partition function must return Fraction objects");
    });
  });

  describe("conversion methods", () => {
    it("converts to RationalInterval", () => {
      const a = new Fraction(2, 3);
      const b = new Fraction(4, 6); // Same as 2/3 when reduced
      const interval = new FractionInterval(a, b);
      
      const rationalInterval = interval.toRationalInterval();
      
      expect(rationalInterval).toBeInstanceOf(RationalInterval);
      expect(rationalInterval.low.numerator).toBe(2n);
      expect(rationalInterval.low.denominator).toBe(3n);
      expect(rationalInterval.high.numerator).toBe(2n);
      expect(rationalInterval.high.denominator).toBe(3n);
    });

    it("creates from RationalInterval", () => {
      const rationalInterval = new RationalInterval("1/3", "2/3");
      const fractionInterval = FractionInterval.fromRationalInterval(rationalInterval);
      
      expect(fractionInterval).toBeInstanceOf(FractionInterval);
      expect(fractionInterval.low.numerator).toBe(1n);
      expect(fractionInterval.low.denominator).toBe(3n);
      expect(fractionInterval.high.numerator).toBe(2n);
      expect(fractionInterval.high.denominator).toBe(3n);
    });
  });

  describe("string representation", () => {
    it("converts to string format low:high", () => {
      const a = new Fraction(1, 3);
      const b = new Fraction(2, 3);
      const interval = new FractionInterval(a, b);
      
      expect(interval.toString()).toBe("1/3:2/3");
    });
    
    it("handles integer endpoints in string representation", () => {
      const a = new Fraction(0, 1);
      const b = new Fraction(1, 1);
      const interval = new FractionInterval(a, b);
      
      expect(interval.toString()).toBe("0:1");
    });
  });

  describe("equality", () => {
    it("considers intervals equal if endpoints are equal", () => {
      const a1 = new Fraction(1, 3);
      const b1 = new Fraction(2, 3);
      const interval1 = new FractionInterval(a1, b1);
      
      const a2 = new Fraction(1, 3);
      const b2 = new Fraction(2, 3);
      const interval2 = new FractionInterval(a2, b2);
      
      expect(interval1.equals(interval2)).toBe(true);
    });
    
    it("considers intervals not equal if endpoints differ", () => {
      const interval1 = new FractionInterval(new Fraction(1, 3), new Fraction(2, 3));
      const interval2 = new FractionInterval(new Fraction(1, 3), new Fraction(3, 4));
      
      expect(interval1.equals(interval2)).toBe(false);
    });
    
    it("distinguishes intervals with same rational value but different fractions", () => {
      const interval1 = new FractionInterval(new Fraction(1, 3), new Fraction(2, 3));
      const interval2 = new FractionInterval(new Fraction(2, 6), new Fraction(4, 6));
      
      // These intervals have the same rational values but different fractions
      expect(interval1.equals(interval2)).toBe(false);
    });
  });
});
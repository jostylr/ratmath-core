/**
 * FractionInterval.js
 *
 * A class representing closed intervals of fractions.
 * Each interval is represented as [a, b] where a and b are Fraction objects.
 * Unlike RationalInterval, this preserves the exact representation of fractions
 * without automatic reduction.
 */

import { Fraction } from "./fraction.js";
import { RationalInterval } from "./rational-interval.js";

export class FractionInterval {
  #low;
  #high;

  /**
   * Creates a new FractionInterval.
   *
   * @param {Fraction} a - The first endpoint (must be a Fraction)
   * @param {Fraction} b - The second endpoint (must be a Fraction)
   * @throws {Error} If the inputs are not Fraction objects
   */
  constructor(a, b) {
    // Verify inputs are Fraction objects
    if (!(a instanceof Fraction) || !(b instanceof Fraction)) {
      throw new Error("FractionInterval endpoints must be Fraction objects");
    }

    // Ensure the interval is ordered correctly (lower endpoint first)
    if (a.lessThanOrEqual(b)) {
      this.#low = a;
      this.#high = b;
    } else {
      this.#low = b;
      this.#high = a;
    }
  }

  /**
   * Gets the lower endpoint of the interval
   * @returns {Fraction} The lower endpoint
   */
  get low() {
    return this.#low;
  }

  /**
   * Gets the higher endpoint of the interval
   * @returns {Fraction} The higher endpoint
   */
  get high() {
    return this.#high;
  }

  /**
   * Creates a single mediant partition of the interval.
   * Splits the interval into two parts using the mediant of the endpoints.
   *
   * @returns {FractionInterval[]} Array of two subintervals
   */
  mediantSplit() {
    const mediant = Fraction.mediant(this.#low, this.#high);
    return [
      new FractionInterval(this.#low, mediant),
      new FractionInterval(mediant, this.#high),
    ];
  }

  /**
   * Partitions the interval using mediants.
   * Recursively partitions the interval to a specified depth.
   * At each level, each existing interval is split into two using its mediant.
   *
   * @param {number} [n=1] - Depth of recursive mediant partitioning (must be non-negative)
   * @returns {FractionInterval[]} Array of subintervals after recursive splitting
   * @throws {Error} If n is negative
   */
  partitionWithMediants(n = 1) {
    if (n < 0) {
      throw new Error("Depth of mediant partitioning must be non-negative");
    }

    // Base case: no mediants, just return the original interval
    if (n === 0) {
      return [this];
    }

    // Start with the current interval
    let intervals = [this];

    // Recursively apply mediant splitting n times
    for (let level = 0; level < n; level++) {
      // For each interval in the current level, split it with a mediant
      const newIntervals = [];

      for (const interval of intervals) {
        const splitIntervals = interval.mediantSplit();
        newIntervals.push(...splitIntervals);
      }

      intervals = newIntervals;
    }

    return intervals;
  }

  /**
   * Partitions the interval using a custom partitioning function.
   *
   * @param {Function} fn - Function taking two Fractions and returning an array of Fractions
   * @returns {FractionInterval[]} Array of subintervals
   */
  partitionWith(fn) {
    // Get partition points from the callback
    const partitionPoints = fn(this.#low, this.#high);

    if (!Array.isArray(partitionPoints)) {
      throw new Error("Partition function must return an array of Fractions");
    }

    // Ensure all points are Fractions
    for (const point of partitionPoints) {
      if (!(point instanceof Fraction)) {
        throw new Error("Partition function must return Fraction objects");
      }
    }

    // Combine with endpoints and sort
    const allPoints = [this.#low, ...partitionPoints, this.#high];
    allPoints.sort((a, b) => {
      if (a.equals(b)) return 0;
      if (a.lessThan(b)) return -1;
      return 1;
    });

    // Check that endpoints are preserved (first point is low and last point is high)
    if (
      !allPoints[0].equals(this.#low) ||
      !allPoints[allPoints.length - 1].equals(this.#high)
    ) {
      throw new Error("Partition points should be within the interval");
    }

    // Remove duplicates (if any)
    const uniquePoints = [];
    for (let i = 0; i < allPoints.length; i++) {
      if (i === 0 || !allPoints[i].equals(allPoints[i - 1])) {
        uniquePoints.push(allPoints[i]);
      }
    }

    // Create intervals from adjacent points
    const intervals = [];
    for (let i = 0; i < uniquePoints.length - 1; i++) {
      intervals.push(
        new FractionInterval(uniquePoints[i], uniquePoints[i + 1]),
      );
    }

    return intervals;
  }

  /**
   * Converts this FractionInterval to a RationalInterval.
   * The endpoints will be automatically reduced as per Rational's behavior.
   *
   * @returns {RationalInterval} Equivalent RationalInterval
   */
  toRationalInterval() {
    return new RationalInterval(
      this.#low.toRational(),
      this.#high.toRational(),
    );
  }

  /**
   * Creates a FractionInterval from a RationalInterval
   *
   * @param {RationalInterval} interval - The interval to convert
   * @returns {FractionInterval} Equivalent FractionInterval
   */
  static fromRationalInterval(interval) {
    return new FractionInterval(
      Fraction.fromRational(interval.low),
      Fraction.fromRational(interval.high),
    );
  }

  /**
   * Converts this interval to a string in the format "low:high"
   *
   * @returns {string} String representation of this interval
   */
  toString() {
    return `${this.#low.toString()}:${this.#high.toString()}`;
  }

  /**
   * Checks if this interval equals another
   *
   * @param {FractionInterval} other - The interval to compare with
   * @returns {boolean} True if the intervals are equal
   */
  equals(other) {
    return this.#low.equals(other.low) && this.#high.equals(other.high);
  }
}

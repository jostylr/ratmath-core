/**
 * RationalInterval.js
 *
 * A class representing closed intervals of rational numbers.
 * Each interval is represented as [a, b] where a and b are Rational numbers.
 */

import { Rational } from "./rational.js";

export class RationalInterval {
  #low;
  #high;
  static zero = Object.freeze(
    new RationalInterval(Rational.zero, Rational.zero),
  );
  static one = Object.freeze(new RationalInterval(Rational.one, Rational.one));
  static unitInterval = Object.freeze(
    new RationalInterval(Rational.zero, Rational.one),
  );

  /**
   * Creates a new RationalInterval.
   *
   * @param {Rational|string|number|bigint} a - The first endpoint
   * @param {Rational|string|number|bigint} b - The second endpoint
   * @throws {Error} If the inputs cannot be converted to Rational numbers
   */
  constructor(a, b) {
    // Convert inputs to Rational objects
    const aRational = a instanceof Rational ? a : new Rational(a);
    const bRational = b instanceof Rational ? b : new Rational(b);

    // Ensure the interval is ordered correctly (lower endpoint first)
    if (aRational.lessThanOrEqual(bRational)) {
      this.#low = aRational;
      this.#high = bRational;
    } else {
      this.#low = bRational;
      this.#high = aRational;
    }
  }

  /**
   * Gets the lower endpoint of the interval
   * @returns {Rational} The lower endpoint
   */
  get low() {
    return this.#low;
  }

  /**
   * Gets the higher endpoint of the interval
   * @returns {Rational} The higher endpoint
   */
  get high() {
    return this.#high;
  }

  /**
   * Adds another number to this interval with automatic type promotion
   * [a,b] + [c,d] = [a+c, b+d]
   *
   * @param {Integer|Rational|RationalInterval} other - The number to add
   * @returns {RationalInterval} The sum as a new RationalInterval
   */
  add(other) {
    // Handle Integer type by checking for value property
    if (other.value !== undefined && typeof other.value === "bigint") {
      // Convert Integer to Rational and create point interval
      const otherAsRational = new Rational(other.value, 1n);
      const otherAsInterval = new RationalInterval(
        otherAsRational,
        otherAsRational,
      );
      return this.add(otherAsInterval);
    } else if (
      other.numerator !== undefined &&
      other.denominator !== undefined
    ) {
      // Convert Rational to point interval
      const otherAsInterval = new RationalInterval(other, other);
      return this.add(otherAsInterval);
    } else if (other.low && other.high) {
      const newLow = this.#low.add(other.low);
      const newHigh = this.#high.add(other.high);
      return new RationalInterval(newLow, newHigh);
    } else {
      throw new Error(
        `Cannot add ${other.constructor.name} to RationalInterval`,
      );
    }
  }

  /**
   * Subtracts another number from this interval with automatic type promotion
   * [a,b] - [c,d] = [a-d, b-c]
   *
   * @param {Integer|Rational|RationalInterval} other - The number to subtract
   * @returns {RationalInterval} The difference as a new RationalInterval
   */
  subtract(other) {
    // Handle Integer type by checking for value property
    if (other.value !== undefined && typeof other.value === "bigint") {
      // Convert Integer to Rational and create point interval
      const otherAsRational = new Rational(other.value, 1n);
      const otherAsInterval = new RationalInterval(
        otherAsRational,
        otherAsRational,
      );
      return this.subtract(otherAsInterval);
    } else if (
      other.numerator !== undefined &&
      other.denominator !== undefined
    ) {
      // Convert Rational to point interval
      const otherAsInterval = new RationalInterval(other, other);
      return this.subtract(otherAsInterval);
    } else if (other.low && other.high) {
      const newLow = this.#low.subtract(other.high);
      const newHigh = this.#high.subtract(other.low);
      return new RationalInterval(newLow, newHigh);
    } else {
      throw new Error(
        `Cannot subtract ${other.constructor.name} from RationalInterval`,
      );
    }
  }

  /**
   * Multiplies this interval by another number with automatic type promotion
   * For [a,b] * [c,d], compute min and max of all pairwise products
   *
   * @param {Integer|Rational|RationalInterval} other - The number to multiply by
   * @returns {RationalInterval} The product as a new RationalInterval
   */
  multiply(other) {
    // Handle Integer type by checking for value property
    if (other.value !== undefined && typeof other.value === "bigint") {
      // Convert Integer to Rational and create point interval
      const otherAsRational = new Rational(other.value, 1n);
      const otherAsInterval = new RationalInterval(
        otherAsRational,
        otherAsRational,
      );
      return this.multiply(otherAsInterval);
    } else if (
      other.numerator !== undefined &&
      other.denominator !== undefined
    ) {
      // Convert Rational to point interval
      const otherAsInterval = new RationalInterval(other, other);
      return this.multiply(otherAsInterval);
    } else if (other.low && other.high) {
      // Calculate all possible endpoint products
      const products = [
        this.#low.multiply(other.low),
        this.#low.multiply(other.high),
        this.#high.multiply(other.low),
        this.#high.multiply(other.high),
      ];

      // Find the minimum and maximum
      let min = products[0];
      let max = products[0];

      for (let i = 1; i < products.length; i++) {
        if (products[i].lessThan(min)) min = products[i];
        if (products[i].greaterThan(max)) max = products[i];
      }

      return new RationalInterval(min, max);
    } else {
      throw new Error(
        `Cannot multiply RationalInterval by ${other.constructor.name}`,
      );
    }
  }

  /**
   * Divides this interval by another number with automatic type promotion
   * For [a,b] / [c,d], if 0 ∉ [c,d], compute min and max of all pairwise divisions
   *
   * @param {Integer|Rational|RationalInterval} other - The number to divide by
   * @returns {RationalInterval} The quotient as a new RationalInterval
   * @throws {Error} If the divisor interval contains zero
   */
  divide(other) {
    // Handle Integer type by checking for value property
    if (other.value !== undefined && typeof other.value === "bigint") {
      if (other.value === 0n) {
        throw new Error("Division by zero");
      }
      // Convert Integer to Rational and create point interval
      const otherAsRational = new Rational(other.value, 1n);
      const otherAsInterval = new RationalInterval(
        otherAsRational,
        otherAsRational,
      );
      return this.divide(otherAsInterval);
    } else if (
      other.numerator !== undefined &&
      other.denominator !== undefined
    ) {
      if (other.numerator === 0n) {
        throw new Error("Division by zero");
      }
      // Convert Rational to point interval
      const otherAsInterval = new RationalInterval(other, other);
      return this.divide(otherAsInterval);
    } else if (other.low && other.high) {
      const zero = Rational.zero;

      // Check if the divisor is exactly zero
      if (other.low.equals(zero) && other.high.equals(zero)) {
        throw new Error("Division by zero");
      }

      // Check if the divisor interval contains zero
      if (other.containsZero()) {
        throw new Error("Cannot divide by an interval containing zero");
      }

      // Calculate all possible endpoint quotients
      const quotients = [
        this.#low.divide(other.low),
        this.#low.divide(other.high),
        this.#high.divide(other.low),
        this.#high.divide(other.high),
      ];

      // Find the minimum and maximum
      let min = quotients[0];
      let max = quotients[0];

      for (let i = 1; i < quotients.length; i++) {
        if (quotients[i].lessThan(min)) min = quotients[i];
        if (quotients[i].greaterThan(max)) max = quotients[i];
      }

      return new RationalInterval(min, max);
    } else {
      throw new Error(
        `Cannot divide RationalInterval by ${other.constructor.name}`,
      );
    }
  }

  /**
   * Reciprocates an interval; does not rely on division.
   *
   * @returns {RationalInterval} The reciprocal as a new RationalInterval
   * @throws {Error} If this interval contains zero
   */
  reciprocate() {
    if (this.containsZero()) {
      throw new Error("Cannot reciprocate an interval containing zero");
    }

    // order does not matter since the constructor orders it. Order given is the right one for positive intervals.
    return new RationalInterval(
      this.#high.reciprocal(),
      this.#low.reciprocal(),
    );
  }

  /**
   * Negates an interval; does not rely on subtraction
   *
   * @returns {RationalInterval} The negation as a new RationalInterval
   */
  negate() {
    return new RationalInterval(this.#high.negate(), this.#low.negate());
  }

  /**
   * Raises this interval to an integer power. The meaning is to apply the power to each rational in the interval which is encapsulated by doing it to the endpoints.
   *
   * @param {number|bigint} exponent - The exponent (must be an integer)
   * @returns {RationalInterval} The result as a new RationalInterval
   * @throws {Error} If raising to the power would involve division by zero or 0^0
   */
  pow(exponent) {
    const n = BigInt(exponent);
    const zero = Rational.zero;

    // Special case for exponent 0
    if (n === 0n) {
      if (this.#low.equals(zero) && this.#high.equals(zero)) {
        throw new Error("Zero cannot be raised to the power of zero");
      }
      if (this.containsZero()) {
        throw new Error(
          "Cannot raise an interval containing zero to the power of zero",
        );
      }
      // Any non-zero raised to 0 is 1
      return new RationalInterval(Rational.one, Rational.one);
    }

    // For negative exponents
    if (n < 0n) {
      // Check if interval contains 0
      if (this.containsZero()) {
        throw new Error(
          "Cannot raise an interval containing zero to a negative power",
        );
      }

      // Compute 1/([a,b]^|n|)
      const positivePower = this.pow(-n);
      const reciprocal = new RationalInterval(
        positivePower.high.reciprocal(),
        positivePower.low.reciprocal(),
      );
      return reciprocal;
    }

    // For positive exponents

    // Special case for exponent 1
    if (n === 1n) {
      return new RationalInterval(this.#low, this.#high);
    }

    // For even powers
    if (n % 2n === 0n) {
      // If interval contains 0, minimum is 0, otherwise compute min of endpoints^n
      let minVal;
      let maxVal;

      if (
        this.#low.lessThanOrEqual(zero) &&
        this.#high.greaterThanOrEqual(zero)
      ) {
        minVal = new Rational(0);
        // Maximum is max(low^n, high^n) if both have same sign
        // Otherwise it's max of absolute values raised to the power
        const lowPow = this.#low.abs().pow(n);
        const highPow = this.#high.abs().pow(n);
        maxVal = lowPow.greaterThan(highPow) ? lowPow : highPow;
      } else if (this.#high.lessThan(zero)) {
        // Both endpoints negative, even power
        // min = high^n, max = low^n (powers reverse the order)
        minVal = this.#high.pow(n);
        maxVal = this.#low.pow(n);
      } else {
        // Both endpoints positive, even power
        // min = low^n, max = high^n
        minVal = this.#low.pow(n);
        maxVal = this.#high.pow(n);
      }

      return new RationalInterval(minVal, maxVal);
    } else {
      // For odd powers, the order is preserved
      return new RationalInterval(this.#low.pow(n), this.#high.pow(n));
    }
  }

  /**
   * Implements power raising by multiplying or dividing the intervals to itself. This is different from the above power
   *
   * @param {number|bigint} exponent - The exponent (must be an integer)
   * @returns {RationalInterval} The result as a new RationalInterval
   * @throws {Error} If raising to the power would involve division by zero or 0^0
   */
  mpow(exponent) {
    // Handle different types of exponent input
    let n;
    if (typeof exponent === 'bigint') {
      n = exponent;
    } else if (typeof exponent === 'number') {
      n = BigInt(exponent);
    } else if (typeof exponent === 'string') {
      n = BigInt(exponent);
    } else {
      // Handle other types by converting to BigInt
      n = BigInt(exponent);
    }
    
    const zero = Rational.zero;

    // Special case for exponent 0
    if (n === 0n) {
      throw new Error(
        "Multiplicative exponentiation requires at least one factor",
      );
    }

    // For negative exponents
    if (n < 0n) {
      // Compute reciprocal first
      const recipInterval = this.reciprocate();
      // Then compute positive power of the reciprocal
      return recipInterval.mpow(-n);
    }

    // For positive exponents

    // Special case for exponent 1
    if (n === 1n) {
      return new RationalInterval(this.#low, this.#high);
    }

    // Iterate from n down to 1 multiplying each interval
    if (n === 1n) {
      return new RationalInterval(this.#low, this.#high);
    }

    let result = new RationalInterval(this.#low, this.#high);
    for (let i = 1n; i < n; i++) {
      result = result.multiply(this);
    }
    return result;
  }

  /**
   * Checks if this interval overlaps with another
   *
   * @param {RationalInterval} other - The interval to check against
   * @returns {boolean} True if the intervals overlap
   */
  overlaps(other) {
    return !(this.#high.lessThan(other.low) || other.high.lessThan(this.#low));
  }

  /**
   * Checks if this interval entirely contains another
   *
   * @param {RationalInterval} other - The interval to check against
   * @returns {boolean} True if this interval contains the other
   */
  contains(other) {
    return (
      this.#low.lessThanOrEqual(other.low) &&
      this.#high.greaterThanOrEqual(other.high)
    );
  }

  /**
   * Checks if a rational number is contained in this interval
   *
   * @param {Rational|string|number|bigint} value - The value to check
   * @returns {boolean} True if the value is in the interval
   */
  containsValue(value) {
    const r = value instanceof Rational ? value : new Rational(value);
    return this.#low.lessThanOrEqual(r) && this.#high.greaterThanOrEqual(r);
  }

  /**
   * Checks if zero is contained in this interval
   * For use in division and exponentiation error handling
   * @returns {boolean} True if the interval contains zero
   */
  containsZero() {
    const zero = Rational.zero;
    return (
      this.#low.lessThanOrEqual(zero) && this.#high.greaterThanOrEqual(zero)
    );
  }

  /**
   * Checks if this interval equals another
   *
   * @param {RationalInterval} other - The interval to compare with
   * @returns {boolean} True if the intervals are equal
   */
  equals(other) {
    return this.#low.equals(other.low) && this.#high.equals(other.high);
  }

  /**
   * Gets the intersection of this interval with another
   *
   * @param {RationalInterval} other - The interval to intersect with
   * @returns {RationalInterval|null} The intersection interval, or null if they don't overlap
   */
  intersection(other) {
    if (!this.overlaps(other)) {
      return null;
    }

    const newLow = this.#low.greaterThan(other.low) ? this.#low : other.low;
    const newHigh = this.#high.lessThan(other.high) ? this.#high : other.high;

    return new RationalInterval(newLow, newHigh);
  }

  /**
   * Gets the union of this interval with another if they overlap or are adjacent
   *
   * @param {RationalInterval} other - The interval to unite with
   * @returns {RationalInterval|null} The union interval, or null if they are disjoint
   */
  union(other) {
    // Check if intervals are disjoint and not adjacent (touching)
    // Adjacent means they share an endpoint exactly
    const adjacentRight = this.#high.equals(other.low);
    const adjacentLeft = other.high.equals(this.#low);

    if (!this.overlaps(other) && !adjacentRight && !adjacentLeft) {
      return null;
    }

    const newLow = this.#low.lessThan(other.low) ? this.#low : other.low;
    const newHigh = this.#high.greaterThan(other.high)
      ? this.#high
      : other.high;

    return new RationalInterval(newLow, newHigh);
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
   * Converts this interval to a string in mixed number format "a..b/c:d..e/f"
   * where endpoints are represented as mixed numbers
   *
   * @returns {string} Mixed number string representation of this interval
   */
  toMixedString() {
    return `${this.#low.toMixedString()}:${this.#high.toMixedString()}`;
  }

  /**
   * Creates a RationalInterval from a single value (creating a point interval)
   *
   * @param {Rational|string|number|bigint} value - The value
   * @returns {RationalInterval} A new point interval
   */
  static point(value) {
    let r;
    if (value instanceof Rational) {
      r = value;
    } else if (typeof value === "number") {
      r = new Rational(String(value));
    } else if (typeof value === "string" || typeof value === "bigint") {
      r = new Rational(value);
    } else {
      r = new Rational(0);
    }
    return new RationalInterval(r, r);
  }

  /**
   * Creates a RationalInterval from a string in the format "a:b"
   *
   * @param {string} str - The string representation
   * @returns {RationalInterval} A new interval
   * @throws {Error} If the string format is invalid
   */
  static fromString(str) {
    const parts = str.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid interval format. Use 'a:b'");
    }
    return new RationalInterval(parts[0], parts[1]);
  }

  /**
   * Converts this rational interval to its repeating decimal string representation
   * @param {boolean} useRepeatNotation - Whether to use compact repeat notation (default: true)
   * @returns {string} Repeating decimal interval string (e.g., "1/3:1/2" becomes "0.#3:0.5#0")
   */
  toRepeatingDecimal(useRepeatNotation = true) {
    const lowDecimal =
      this.#low.toRepeatingDecimalWithPeriod(useRepeatNotation).decimal;
    const highDecimal =
      this.#high.toRepeatingDecimalWithPeriod(useRepeatNotation).decimal;
    return `${lowDecimal}:${highDecimal}`;
  }

  /**
   * Exports this interval as a compacted decimal interval notation
   * Finds a common base and expresses the interval as base[low_uncertainty,high_uncertainty]
   * @returns {string} Compacted decimal interval string (e.g., "1.2356:1.2367" becomes "1.23[56,67]")
   */
  compactedDecimalInterval() {
    // Convert both endpoints to decimal strings
    const lowStr = this.#low.toDecimal();
    const highStr = this.#high.toDecimal();

    // Find the longest common prefix
    let commonPrefix = "";
    const minLength = Math.min(lowStr.length, highStr.length);

    for (let i = 0; i < minLength; i++) {
      if (lowStr[i] === highStr[i]) {
        commonPrefix += lowStr[i];
      } else {
        break;
      }
    }

    // If there's no common prefix beyond just a sign or single digit, return regular interval
    if (
      commonPrefix.length <= 1 ||
      (commonPrefix.startsWith("-") && commonPrefix.length <= 2)
    ) {
      return `${lowStr}:${highStr}`;
    }

    // Extract the differing parts
    const lowSuffix = lowStr.substring(commonPrefix.length);
    const highSuffix = highStr.substring(commonPrefix.length);

    // If either suffix is empty or they're not the same length, use regular format
    if (!lowSuffix || !highSuffix || lowSuffix.length !== highSuffix.length) {
      return `${lowStr}:${highStr}`;
    }

    // Check if both suffixes are purely numeric (no decimal point)
    if (!/^\d+$/.test(lowSuffix) || !/^\d+$/.test(highSuffix)) {
      return `${lowStr}:${highStr}`;
    }

    // For the compacted notation, we want the range to go from low to high
    // So use lowSuffix,highSuffix (which represents the actual low:high order)
    return `${commonPrefix}[${lowSuffix},${highSuffix}]`;
  }

  /**
   * Exports this interval as a relative midpoint decimal interval notation
   * Expresses the interval as midpoint[+-offset] where midpoint is the center of the interval
   * @returns {string} Relative midpoint decimal interval string (e.g., "1.224:1.235" becomes "1.2295[+-0.0055]")
   */
  relativeMidDecimalInterval() {
    // Calculate the midpoint
    const midpoint = this.#low.add(this.#high).divide(new Rational(2));

    // Calculate offset from midpoint (should be same for both directions in symmetric case)
    const offset = this.#high.subtract(midpoint);

    // Convert to decimal strings
    const midpointStr = midpoint.toDecimal();
    const offsetStr = offset.toDecimal();

    return `${midpointStr}[+-${offsetStr}]`;
  }

  /**
   * Exports this interval as a relative decimal interval notation using the shortest precise decimal
   * Finds the shortest decimal number within the interval (closest to midpoint if tied, lower if still tied)
   * and expresses the interval relative to that decimal using next decimal place convention
   * @returns {string} Relative decimal interval string (e.g., "1.224:1.235" becomes "1.23[+5,-6]")
   */
  relativeDecimalInterval() {
    // Find the shortest precise decimal within the interval
    const shortestDecimal = this.#findShortestPreciseDecimal();

    // Calculate the actual offsets from this decimal to the interval bounds
    const offsetLow = shortestDecimal.subtract(this.#low); // positive if decimal > low
    const offsetHigh = this.#high.subtract(shortestDecimal); // positive if high > decimal

    // Determine the scale factor based on decimal places in the base number
    const decimalStr = shortestDecimal.toDecimal();
    const decimalPlaces = decimalStr.includes(".")
      ? decimalStr.split(".")[1].length
      : 0;

    let scaledOffsetLow, scaledOffsetHigh;

    if (decimalPlaces === 0) {
      // Integer base: new parser applies offsets directly, so export them directly
      scaledOffsetLow = offsetLow;
      scaledOffsetHigh = offsetHigh;
    } else {
      // Decimal base: new parser scales offsets, so export them scaled
      const scaleFactor = new Rational(10).pow(decimalPlaces + 1);
      scaledOffsetLow = offsetLow.multiply(scaleFactor);
      scaledOffsetHigh = offsetHigh.multiply(scaleFactor);
    }

    const offsetLowStr = scaledOffsetLow.toDecimal();
    const offsetHighStr = scaledOffsetHigh.toDecimal();

    // Check if offsets are symmetric (within small tolerance)
    if (
      offsetLow.subtract(offsetHigh).abs().compareTo(new Rational(1, 1000000)) <
      0
    ) {
      // Use symmetric notation for nearly equal offsets
      const avgOffset = scaledOffsetLow
        .add(scaledOffsetHigh)
        .divide(new Rational(2));
      return `${decimalStr}[+-${avgOffset.toDecimal()}]`;
    } else {
      // Use asymmetric notation
      return `${decimalStr}[+${offsetHighStr},-${offsetLowStr}]`;
    }
  }

  /**
   * Helper method to find the shortest precise decimal within the interval
   * @returns {Rational} The shortest precise decimal as a Rational
   * @private
   */
  #findShortestPreciseDecimal() {
    const midpoint = this.#low.add(this.#high).divide(new Rational(2));

    // Try increasing precision levels until we find decimals within the interval
    for (let precision = 0; precision <= 20; precision++) {
      const scale = new Rational(10).pow(precision);

      // Find the range of integers that, when divided by scale, fall within our interval
      const lowScaled = this.#low.multiply(scale);
      const highScaled = this.#high.multiply(scale);

      // Get the ceiling of low and floor of high to find integer bounds
      const minInt = this.#ceilRational(lowScaled);
      const maxInt = this.#floorRational(highScaled);

      if (minInt.compareTo(maxInt) <= 0) {
        // We have at least one integer in the range
        const candidates = [];

        // Collect all integers in the range
        let current = minInt;
        while (current.compareTo(maxInt) <= 0) {
          candidates.push(current.divide(scale));
          current = current.add(new Rational(1));
        }

        if (candidates.length > 0) {
          // Find the candidate closest to midpoint (lower if tied)
          let best = candidates[0];
          let bestDistance = best.subtract(midpoint).abs();

          for (let i = 1; i < candidates.length; i++) {
            const distance = candidates[i].subtract(midpoint).abs();
            const comparison = distance.compareTo(bestDistance);

            if (
              comparison < 0 ||
              (comparison === 0 && candidates[i].compareTo(best) < 0)
            ) {
              best = candidates[i];
              bestDistance = distance;
            }
          }

          return best;
        }
      }
    }

    // Fallback to midpoint if no precise decimal found (shouldn't happen in practice)
    return midpoint;
  }

  /**
   * Helper method to compute ceiling of a rational number
   * @param {Rational} rational - The rational number
   * @returns {Rational} The ceiling as a rational
   * @private
   */
  #ceilRational(rational) {
    if (rational.denominator === 1n) {
      return rational; // Already an integer
    }

    const quotient = rational.numerator / rational.denominator;
    if (rational.numerator >= 0n) {
      return new Rational(quotient + 1n, 1n);
    } else {
      return new Rational(quotient, 1n);
    }
  }

  /**
   * Helper method to compute floor of a rational number
   * @param {Rational} rational - The rational number
   * @returns {Rational} The floor as a rational
   * @private
   */
  #floorRational(rational) {
    if (rational.denominator === 1n) {
      return rational; // Already an integer
    }

    const quotient = rational.numerator / rational.denominator;
    if (rational.numerator >= 0n) {
      return new Rational(quotient, 1n);
    } else {
      return new Rational(quotient - 1n, 1n);
    }
  }

  /**
   * Calculates the mediant of the interval endpoints.
   * The mediant of fractions a/b and c/d is (a+c)/(b+d).
   * This is useful in continued fraction approximations and the Stern-Brocot tree.
   *
   * @returns {Rational} The mediant of the low and high endpoints
   */
  mediant() {
    return new Rational(
      this.#low.numerator + this.#high.numerator,
      this.#low.denominator + this.#high.denominator,
    );
  }

  /**
   * Calculates the arithmetic midpoint of the interval.
   * The midpoint of [a, b] is (a + b) / 2.
   *
   * @returns {Rational} The midpoint of the interval
   */
  midpoint() {
    return this.#low.add(this.#high).divide(new Rational(2));
  }

  /**
   * Finds the rational number in the interval with the smallest denominator
   * that is a power of the given base.
   *
   * @param {number|bigint} base - The base (default: 10)
   * @returns {Rational} The rational with smallest power-of-base denominator in the interval
   * @throws {Error} If base is not a positive integer greater than 1
   */
  shortestDecimal(base = 10) {
    const baseBigInt = BigInt(base);

    if (baseBigInt <= 1n) {
      throw new Error("Base must be greater than 1");
    }

    // Handle point intervals separately
    if (this.#low.equals(this.#high)) {
      // For point intervals, check if the single value can be represented with a power-of-base denominator
      const value = this.#low;

      // Try each power of base to see if we can represent the value exactly
      let k = 0;
      let denominator = 1n;

      // Use a reasonable bound for point intervals
      while (k <= 50) {
        // Check if value * denominator is an integer
        const numeratorCandidate = value.multiply(new Rational(denominator));

        if (numeratorCandidate.denominator === 1n) {
          // We found an exact representation: value = numeratorCandidate.numerator / denominator
          return new Rational(numeratorCandidate.numerator, denominator);
        }

        k++;
        denominator *= baseBigInt;
      }

      // No power-of-base representation found
      return null;
    }

    // Calculate the theoretical bound: ceil(log(1/L)/log(base)) where L is interval length
    const intervalLength = this.#high.subtract(this.#low);

    // L = intervalLength, we need base^k <= 1/L
    // So k <= log(1/L)/log(base) = log(L.denominator/L.numerator)/log(base)
    const lengthAsNumber =
      Number(intervalLength.numerator) / Number(intervalLength.denominator);
    const baseAsNumber = Number(baseBigInt);
    let maxK = Math.ceil(Math.log(1 / lengthAsNumber) / Math.log(baseAsNumber));

    // Add a small safety margin for floating point precision issues
    maxK = Math.max(0, maxK + 2);

    // Start with k=0, so denominator = base^0 = 1
    let k = 0;
    let denominator = 1n;

    while (k <= maxK) {
      // For denominator = base^k, find if there's a numerator p such that
      // low <= p/denominator <= high

      // Calculate the range of valid numerators
      // low <= p/denominator  =>  p >= low * denominator
      // p/denominator <= high  =>  p <= high * denominator

      const minNumerator = this.#ceilRational(
        this.#low.multiply(new Rational(denominator)),
      );
      const maxNumerator = this.#floorRational(
        this.#high.multiply(new Rational(denominator)),
      );

      // Check if there's at least one valid numerator
      if (minNumerator.lessThanOrEqual(maxNumerator)) {
        // Return the first valid rational (using minNumerator)
        return new Rational(minNumerator.numerator, denominator);
      }

      // Move to next power of base
      k++;
      denominator *= baseBigInt;
    }

    // This should never happen mathematically, but provide a fallback
    throw new Error(
      "Failed to find shortest decimal representation (exceeded theoretical bound)",
    );
  }

  /**
   * Generates a uniformly random rational number from the closed interval.
   * The randomness is uniform over all reduced fractions with denominators up to maxDenominator.
   *
   * @param {number|bigint} maxDenominator - Maximum denominator to consider (default: 1000)
   * @returns {Rational} A random rational number from the interval
   * @throws {Error} If maxDenominator is not a positive integer
   */
  randomRational(maxDenominator = 1000) {
    const maxDenom = BigInt(maxDenominator);

    if (maxDenom <= 0n) {
      throw new Error("maxDenominator must be positive");
    }

    // Collect all valid rationals in reduced form within the interval
    const validRationals = [];

    // Check each denominator from 1 to maxDenominator
    for (let denom = 1n; denom <= maxDenom; denom++) {
      // For this denominator, find the range of valid numerators
      const minNum = this.#ceilRational(
        this.#low.multiply(new Rational(denom)),
      );
      const maxNum = this.#floorRational(
        this.#high.multiply(new Rational(denom)),
      );

      // Add all valid rationals with this denominator
      for (let num = minNum.numerator; num <= maxNum.numerator; num++) {
        const candidate = new Rational(num, denom);

        // Only include if it's in reduced form (to avoid duplicates)
        if (candidate.numerator === num && candidate.denominator === denom) {
          validRationals.push(candidate);
        }
      }
    }

    if (validRationals.length === 0) {
      // Fallback to midpoint if no rationals found (shouldn't happen for reasonable maxDenominator)
      return this.midpoint();
    }

    // Select a random rational from the valid ones
    const randomIndex = Math.floor(Math.random() * validRationals.length);
    return validRationals[randomIndex];
  }

  /**
   * Helper method to compute GCD using Euclidean algorithm
   * @param {bigint} a - First number
   * @param {bigint} b - Second number
   * @returns {bigint} The GCD of a and b
   * @private
   */
  #gcd(a, b) {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    while (b !== 0n) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  /**
   * Applies E notation to this rational interval by multiplying both endpoints by 10^exponent.
   * This is equivalent to shifting the decimal point by the specified number of places.
   *
   * @param {number|bigint} exponent - The exponent for the power of 10
   * @returns {RationalInterval} A new RationalInterval representing this interval * 10^exponent
   * @throws {Error} If the exponent is not an integer
   * @example
   * // Basic usage
   * new RationalInterval(1, 2).E(2)        // [100, 200] (interval [1,2] * 10^2)
   * new RationalInterval(1.5, 2.5).E(-1)   // [0.15, 0.25] (interval [1.5,2.5] * 10^-1)
   * new RationalInterval(10, 20).E(-1)     // [1, 2] (interval [10,20] * 10^-1)
   *
   * // Equivalent to scientific notation applied to interval
   * new RationalInterval("1/3", "2/3").E(3) // [1000/3, 2000/3]
   */
  E(exponent) {
    const exp = BigInt(exponent);

    // Create 10^exponent as a rational
    let powerOf10;
    if (exp >= 0n) {
      powerOf10 = new Rational(10n ** exp, 1n);
    } else {
      powerOf10 = new Rational(1n, 10n ** -exp);
    }

    // Apply E notation to both endpoints
    const newLow = this.#low.multiply(powerOf10);
    const newHigh = this.#high.multiply(powerOf10);

    return new RationalInterval(newLow, newHigh);
  }
}

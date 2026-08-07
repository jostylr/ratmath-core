/**
 * Rational.js
 *
 * A class for exact rational number arithmetic using BigInt.
 * Represents a rational number as a fraction with numerator and denominator in lowest terms.
 */


import { BaseSystem } from "./base-system.js";
import { toExactBigInt } from "./bigint.js";

/** Helper function to compute bit length of a BigInt */
const bitLength = function (int) {
  if (int === 0n) return 0;
  return int < 0n ? (-int).toString(2).length : int.toString(2).length;
}

const roundedQuotient = function (numerator, denominator, mode) {
  const quotient = numerator / denominator;
  const remainder = numerator % denominator;
  if (remainder === 0n || mode === "toward-zero") return quotient;
  if (mode === "floor") return numerator < 0n ? quotient - 1n : quotient;
  if (mode === "ceil") return numerator > 0n ? quotient + 1n : quotient;

  const twiceRemainder = (remainder < 0n ? -remainder : remainder) * 2n;
  if (twiceRemainder < denominator) return quotient;
  const direction = numerator < 0n ? -1n : 1n;
  if (twiceRemainder > denominator || mode === "half-up") {
    return quotient + direction;
  }
  return quotient % 2n === 0n ? quotient : quotient + direction;
};


export class Rational {
  #numerator;
  #denominator;

  // Lazy computation cache
  #isNegative;
  #wholePart;
  #remainder;
  #initialSegment;
  #periodDigits;
  #periodLength;
  #isTerminating;
  #factorsOf2;
  #factorsOf5;
  #leadingZerosInPeriod;
  #initialSegmentLeadingZeros;
  #initialSegmentRest;
  #periodDigitsRest;
  #maxPeriodDigitsComputed;

  // Class variables for decimal computation
  static DEFAULT_PERIOD_DIGITS = 30;
  static MAX_PERIOD_DIGITS = 1000;
  static MAX_PERIOD_CHECK = 10000000; // 10^7

  // Precomputed powers of 5 for efficient factor counting
  static POWERS_OF_5 = {
    16: 5n ** 16n, // 152587890625
    8: 5n ** 8n, // 390625
    4: 5n ** 4n, // 625
    2: 5n ** 2n, // 25
    1: 5n, // 5
  };

  static zero = new Rational(0, 1);
  static one = new Rational(1, 1);

  /**
   * Creates a new Rational number.
   *
   * @param {number|string|bigint|Integer|Rational} numerator - The numerator, a string like "3/4", or an exact value to copy
   * @param {number|string|bigint|Integer|undefined} denominator - The denominator (optional if numerator is a string)
   * @throws {Error} If denominator is zero or if the input format is invalid
   */
  constructor(numerator, denominator = 1n) {
    if (numerator instanceof Rational) {
      this.#numerator = numerator.numerator;
      this.#denominator = numerator.denominator;
      this.#isNegative = this.#numerator < 0n;
      return;
    }

    // Handle Integer object inputs
    if (
      numerator &&
      typeof numerator === "object" &&
      numerator.constructor.name === "Integer"
    ) {
      this.#numerator = numerator.value;

      // Check if denominator is also provided and is an Integer or other types
      if (denominator && typeof denominator === "object" && denominator.constructor.name === "Integer") {
        this.#denominator = denominator.value;
      } else if (denominator !== undefined) {
        this.#denominator = toExactBigInt(denominator, "Rational denominator");
      } else {
        this.#denominator = 1n;
      }

      // Check for zero denominator immediately
      if (this.#denominator === 0n) {
        throw new Error("Denominator cannot be zero");
      }

      this.#normalize();
      this.#isNegative = this.#numerator < 0n;
      return;
    }

    // Handle string representation (e.g., "3/4" or "5..2/3")
    if (typeof numerator === "string") {
      // Check for mixed number notation with double dot
      if (numerator.includes("..")) {
        const mixedParts = numerator.trim().split("..");
        if (mixedParts.length !== 2) {
          throw new Error("Invalid mixed number format. Use 'a..b/c'");
        }

        const wholeText = mixedParts[0].trim();
        const isNegative = wholeText.startsWith("-");
        const wholePart = BigInt(wholeText);
        const fractionParts = mixedParts[1].split("/");

        if (fractionParts.length !== 2) {
          throw new Error("Invalid fraction in mixed number. Use 'a..b/c'");
        }

        const fracNumerator = BigInt(fractionParts[0]);
        const fracDenominator = BigInt(fractionParts[1]);

        // Calculate equivalent improper fraction: whole + numerator/denominator
        const absWhole = isNegative ? -wholePart : wholePart;

        // (absWhole * denominator + numerator) with appropriate sign
        this.#numerator = isNegative
          ? -(absWhole * fracDenominator + fracNumerator)
          : wholePart * fracDenominator + fracNumerator;
        this.#denominator = fracDenominator;
      } else {
        // Check if it's a decimal string like "1.23" or contains repeat notation
        if (numerator.includes(".")) {
          // First, expand any repeat notation
          const expandedNumerator = Rational.#parseRepeatedDigits(numerator);

          const decimalParts = expandedNumerator.trim().split(".");
          if (decimalParts.length === 2) {
            const integerPart = decimalParts[0] || "0";
            const fractionalPart = decimalParts[1];

            // Validate parts contain only digits (and optional minus for integer part)
            if (!/^-?\d*$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
              throw new Error("Invalid decimal format");
            }

            // Convert decimal to fraction
            const isNegative = integerPart.startsWith("-");
            const wholePart = BigInt(integerPart);
            const fractionalValue = BigInt(fractionalPart);
            const denomValue = 10n ** BigInt(fractionalPart.length);

            // Combine: wholePart + fractionalPart/denomValue
            this.#numerator =
              wholePart * denomValue +
              (isNegative ? -fractionalValue : fractionalValue);
            this.#denominator = denomValue;
          } else {
            throw new Error("Invalid decimal format - multiple decimal points");
          }
        } else {
          // Standard fraction notation
          const parts = numerator.trim().split("/");

          if (parts.length === 1) {
            // Just a number like "3"
            this.#numerator = BigInt(parts[0]);
            this.#denominator = toExactBigInt(
              denominator,
              "Rational denominator",
            );
          } else if (parts.length === 2) {
            // Fraction like "3/4"
            this.#numerator = BigInt(parts[0]);
            this.#denominator = BigInt(parts[1]);
          } else {
            throw new Error(
              "Invalid rational format. Use 'a/b', 'a', or 'a..b/c'",
            );
          }
        }
      }
    } else {
      // Handle numeric inputs
      this.#numerator = toExactBigInt(numerator, "Rational numerator");
      this.#denominator = toExactBigInt(
        denominator,
        "Rational denominator",
      );
    }

    // Check for zero denominator
    if (this.#denominator === 0n) {
      throw new Error("Denominator cannot be zero");
    }

    // Normalize the representation
    this.#normalize();

    // Set isNegative flag for display purposes
    this.#isNegative = this.#numerator < 0n;
  }

  /**
   * Convert the rational to lowest terms and ensure denominator is positive
   * @private
   */
  #normalize() {
    // Handle sign: ensure denominator is positive
    if (this.#denominator < 0n) {
      this.#numerator = -this.#numerator;
      this.#denominator = -this.#denominator;
    }

    // Special case for zero
    if (this.#numerator === 0n) {
      this.#denominator = 1n;
      return;
    }

    // Find GCD and simplify
    const gcd = this.#gcd(
      this.#numerator < 0n ? -this.#numerator : this.#numerator,
      this.#denominator,
    );
    this.#numerator = this.#numerator / gcd;
    this.#denominator = this.#denominator / gcd;
  }

  /**
   * Calculate the greatest common divisor using Euclidean algorithm
   * @private
   * @param {bigint} a - First non-negative number
   * @param {bigint} b - Second non-negative number
   * @returns {bigint} The GCD of a and b
   */
  #gcd(a, b) {
    while (b !== 0n) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  /**
   * Gets the numerator of the rational number
   * @returns {bigint} The numerator
   */
  get numerator() {
    return this.#numerator;
  }

  /**
   * Gets the denominator of the rational number
   * @returns {bigint} The denominator
   */
  get denominator() {
    return this.#denominator;
  }

  /**
   * Adds another number to this rational with automatic type promotion
   * @param {Integer|Rational|RationalInterval} other - The number to add
   * @returns {Rational|RationalInterval} The sum with appropriate type
   */
  add(other) {
    // Handle Integer type by importing it dynamically to avoid circular imports
    if (other.constructor.name === "Integer") {
      // Convert Integer to Rational and add
      const otherAsRational = new Rational(other.value, 1n);
      return this.add(otherAsRational);
    } else if (other instanceof Rational) {
      const a = this.#numerator;
      const b = this.#denominator;
      const c = other.numerator;
      const d = other.denominator;

      // a/b + c/d = (ad + bc)/bd
      const numerator = a * d + b * c;
      const denominator = b * d;

      return new Rational(numerator, denominator);
    } else if (
      other.low &&
      other.high &&
      typeof other.low.equals === "function"
    ) {
      // This looks like a RationalInterval - promote this rational to interval and add
      // We need to dynamically create the interval to avoid circular imports
      const thisAsInterval = { low: this, high: this };
      // Create a new interval using the same constructor as other
      const IntervalClass = other.constructor;
      const newThisAsInterval = new IntervalClass(this, this);
      return newThisAsInterval.add(other);
    } else {
      throw new Error(`Cannot add ${other.constructor.name} to Rational`);
    }
  }

  /**
   * Subtracts another number from this rational with automatic type promotion
   * @param {Integer|Rational|RationalInterval} other - The number to subtract
   * @returns {Rational|RationalInterval} The difference with appropriate type
   */
  subtract(other) {
    // Handle Integer type by checking constructor name to avoid circular imports
    if (other.constructor.name === "Integer") {
      // Convert Integer to Rational and subtract
      const otherAsRational = new Rational(other.value, 1n);
      return this.subtract(otherAsRational);
    } else if (other instanceof Rational) {
      const a = this.#numerator;
      const b = this.#denominator;
      const c = other.numerator;
      const d = other.denominator;

      // a/b - c/d = (ad - bc)/bd
      const numerator = a * d - b * c;
      const denominator = b * d;

      return new Rational(numerator, denominator);
    } else if (
      other.low &&
      other.high &&
      typeof other.low.equals === "function"
    ) {
      // This looks like a RationalInterval - promote this rational to interval and subtract
      const IntervalClass = other.constructor;
      const newThisAsInterval = new IntervalClass(this, this);
      return newThisAsInterval.subtract(other);
    } else {
      throw new Error(
        `Cannot subtract ${other.constructor.name} from Rational`,
      );
    }
  }

  /**
   * Multiplies this rational by another number with automatic type promotion
   * @param {Integer|Rational|RationalInterval} other - The number to multiply by
   * @returns {Rational|RationalInterval} The product with appropriate type
   */
  multiply(other) {
    // Handle Integer type by checking constructor name to avoid circular imports
    if (other.constructor.name === "Integer") {
      // Convert Integer to Rational and multiply
      const otherAsRational = new Rational(other.value, 1n);
      return this.multiply(otherAsRational);
    } else if (other instanceof Rational) {
      const a = this.#numerator;
      const b = this.#denominator;
      const c = other.numerator;
      const d = other.denominator;

      // (a/b) * (c/d) = (ac)/(bd)
      const numerator = a * c;
      const denominator = b * d;

      return new Rational(numerator, denominator);
    } else if (
      other.low &&
      other.high &&
      typeof other.low.equals === "function"
    ) {
      // This looks like a RationalInterval - promote this rational to interval and multiply
      const IntervalClass = other.constructor;
      const newThisAsInterval = new IntervalClass(this, this);
      return newThisAsInterval.multiply(other);
    } else {
      throw new Error(`Cannot multiply Rational by ${other.constructor.name}`);
    }
  }

  /**
   * Divides this rational by another number with automatic type promotion
   * @param {Integer|Rational|RationalInterval} other - The number to divide by
   * @returns {Rational|RationalInterval} The quotient with appropriate type
   * @throws {Error} If other is zero
   */
  divide(other) {
    // Handle Integer type by checking constructor name to avoid circular imports
    if (other.constructor.name === "Integer") {
      if (other.value === 0n) {
        throw new Error("Division by zero");
      }
      // Convert Integer to Rational and divide
      const otherAsRational = new Rational(other.value, 1n);
      return this.divide(otherAsRational);
    } else if (other instanceof Rational) {
      if (other.numerator === 0n) {
        throw new Error("Division by zero");
      }

      const a = this.#numerator;
      const b = this.#denominator;
      const c = other.numerator;
      const d = other.denominator;

      // (a/b) / (c/d) = (a/b) * (d/c) = (ad)/(bc)
      const numerator = a * d;
      const denominator = b * c;

      return new Rational(numerator, denominator);
    } else if (
      other.low &&
      other.high &&
      typeof other.low.equals === "function"
    ) {
      // This looks like a RationalInterval - promote this rational to interval and divide
      const IntervalClass = other.constructor;
      const newThisAsInterval = new IntervalClass(this, this);
      return newThisAsInterval.divide(other);
    } else {
      throw new Error(`Cannot divide Rational by ${other.constructor.name}`);
    }
  }

  /**
   * Returns the negation of this rational
   * @returns {Rational} The negation as a new Rational
   */
  negate() {
    return new Rational(-this.#numerator, this.#denominator);
  }

  /**
   * Returns the reciprocal of this rational
   * @returns {Rational} The reciprocal as a new Rational
   * @throws {Error} If this rational is zero
   */
  reciprocal() {
    if (this.#numerator === 0n) {
      throw new Error("Cannot take reciprocal of zero");
    }
    return new Rational(this.#denominator, this.#numerator);
  }

  /**
   * Raises this rational to an integer power
   * @param {number|bigint} exponent - The exponent (must be an integer)
   * @returns {Rational} The result as a new Rational
   * @throws {Error} If this rational is zero and exponent is negative, or if 0^0
   */
  pow(exponent) {
    const n = BigInt(exponent);

    // Handle special cases
    if (n === 0n) {
      if (this.#numerator === 0n) {
        throw new Error("Zero cannot be raised to the power of zero");
      }
      return new Rational(1);
    }

    if (this.#numerator === 0n && n < 0n) {
      throw new Error("Zero cannot be raised to a negative power");
    }

    if (n < 0n) {
      // For negative exponents, compute 1/(this^|n|)
      const reciprocal = this.reciprocal();
      return reciprocal.pow(-n);
    }

    // Compute a^n and b^n for a/b
    let resultNum = 1n;
    let resultDen = 1n;
    let num = this.#numerator;
    let den = this.#denominator;

    // Use repeated squaring algorithm (binary exponentiation)
    for (let i = n < 0n ? -n : n; i > 0n; i >>= 1n) {
      if (i & 1n) {
        resultNum *= num;
        resultDen *= den;
      }
      num *= num;
      den *= den;
    }

    return new Rational(resultNum, resultDen);
  }

  /**
   * Checks if this rational equals another
   * @param {Rational} other - The rational to compare with
   * @returns {boolean} True if the rationals are equal
   */
  equals(other) {
    // Since both rationals are in lowest terms with positive denominators,
    // they are equal iff their numerators and denominators are equal
    return (
      this.#numerator === other.numerator &&
      this.#denominator === other.denominator
    );
  }

  /**
   * Compares this rational with another
   * @param {Rational} other - The rational to compare with
   * @returns {number} -1 if this < other, 0 if equal, 1 if this > other
   */
  compareTo(other) {
    // a/b ⋛ c/d  <=>  ad ⋛ bc
    const crossProduct1 = this.#numerator * other.denominator;
    const crossProduct2 = this.#denominator * other.numerator;

    if (crossProduct1 < crossProduct2) return -1;
    if (crossProduct1 > crossProduct2) return 1;
    return 0;
  }

  /**
   * Checks if this rational is less than another
   * @param {Rational} other - The rational to compare with
   * @returns {boolean} True if this rational is less than other
   */
  lessThan(other) {
    return this.compareTo(other) < 0;
  }

  /**
   * Checks if this rational is less than or equal to another
   * @param {Rational} other - The rational to compare with
   * @returns {boolean} True if this rational is less than or equal to other
   */
  lessThanOrEqual(other) {
    return this.compareTo(other) <= 0;
  }

  /**
   * Checks if this rational is greater than another
   * @param {Rational} other - The rational to compare with
   * @returns {boolean} True if this rational is greater than other
   */
  greaterThan(other) {
    return this.compareTo(other) > 0;
  }

  /**
   * Checks if this rational is greater than or equal to another
   * @param {Rational} other - The rational to compare with
   * @returns {boolean} True if this rational is greater than or equal to other
   */
  greaterThanOrEqual(other) {
    return this.compareTo(other) >= 0;
  }

  /**
   * Returns the absolute value of this rational
   * @returns {Rational} The absolute value as a new Rational
   */
  abs() {
    return this.#numerator < 0n
      ? this.negate()
      : new Rational(this.#numerator, this.#denominator);
  }

  floor() {
    return roundedQuotient(this.#numerator, this.#denominator, "floor");
  }

  ceil() {
    return roundedQuotient(this.#numerator, this.#denominator, "ceil");
  }

  trunc() {
    return roundedQuotient(this.#numerator, this.#denominator, "toward-zero");
  }

  round(mode = "half-even") {
    if (!new Set(["half-even", "half-up", "toward-zero", "floor", "ceil"]).has(mode)) {
      throw new TypeError("Unknown rounding mode");
    }
    return roundedQuotient(this.#numerator, this.#denominator, mode);
  }

  roundTo(places, mode = "half-even") {
    if (!Number.isSafeInteger(places)) {
      throw new RangeError("Decimal places must be a safe integer");
    }
    if (!new Set(["half-even", "half-up", "toward-zero", "floor", "ceil"]).has(mode)) {
      throw new TypeError("Unknown rounding mode");
    }
    const scale = 10n ** BigInt(Math.abs(places));
    if (places >= 0) {
      return new Rational(
        roundedQuotient(this.#numerator * scale, this.#denominator, mode),
        scale,
      );
    }
    return new Rational(
      roundedQuotient(this.#numerator, this.#denominator * scale, mode) * scale,
    );
  }

  toJSON() {
    return {
      $ratmath: "Rational",
      numerator: this.#numerator.toString(),
      denominator: this.#denominator.toString(),
    };
  }

  /**
   * Converts this rational to a string in the format "numerator/denominator"
   * or just "numerator" if denominator is 1
   * @returns {string} String representation of this rational
   */
  /**
   * Converts this rational to a string in the format "numerator/denominator"
   * or just "numerator" if denominator is 1. Optionally converts to a specific base.
   * @param {number|BaseSystem} [base] - The base to convert to (default: 10)
   * @returns {string} String representation of this rational
   */
  toString(base) {
    if (base === undefined) {
      if (this.#denominator === 1n) {
        return this.#numerator.toString();
      }
      return `${this.#numerator}/${this.#denominator}`;
    }

    // Handle base conversion
    let baseSystem;
    if (base instanceof BaseSystem) {
      baseSystem = base;
    } else if (typeof base === 'number') {
      baseSystem = BaseSystem.fromBase(base);
    } else {
      return this.toString();
    }

    return this.toRepeatingBase(baseSystem);
  }

  /**
   * Converts this rational to a repeating base representation.
   * e.g., 1/3 in base 10 -> "0.#3"
   * e.g., 1/3 in base 2 -> "0.#01"
   * @param {BaseSystem} baseSystem - The base system to use
   * @returns {string} String representation with specialized repeating notation
   */
  toRepeatingBase(baseSystem) {
    return this.toRepeatingBaseWithPeriod(baseSystem).baseStr;
  }

  /**
   * Converts this rational to a repeating base representation with period metadata.
   * @param {BaseSystem} baseSystem - The base system to use
   * @param {Object} [options] - Configuration options
   * @param {boolean} [options.useRepeatNotation=true] - Whether to use {c~n} notation for identical digits
   * @param {number} [options.limit=1000] - Hard limit on number of digits to compute
   * @returns {Object} { baseStr: string, period: number, limitHit: boolean }
   */
  toRepeatingBaseWithPeriod(baseSystem, options = {}) {
    if (!(baseSystem instanceof BaseSystem)) {
      throw new Error("Argument must be a BaseSystem");
    }

    const { useRepeatNotation = true, limit = 1000 } = options;

    // Handle negative numbers
    if (this.#numerator < 0n) {
      const result = this.negate().toRepeatingBaseWithPeriod(baseSystem, options);
      return {
        baseStr: "-" + result.baseStr,
        period: result.period,
        limitHit: result.limitHit
      };
    }

    const baseBigInt = BigInt(baseSystem.base);
    let num = this.#numerator;
    let den = this.#denominator;

    // Integer part
    const integerPart = num / den;
    let remainder = num % den;

    let result = baseSystem.fromDecimal(integerPart);

    if (remainder === 0n) {
      return { baseStr: result, period: 0, limitHit: false };
    }

    result += ".";

    // Fractional part with cycle detection
    const remainders = new Map();
    let fractionParts = [];
    let cycleStartIndex = -1;
    let limitHit = false;

    while (remainder !== 0n) {
      if (remainders.has(remainder)) {
        cycleStartIndex = remainders.get(remainder);
        break;
      }

      if (fractionParts.length >= limit) {
        limitHit = true;
        break;
      }

      remainders.set(remainder, fractionParts.length);

      remainder *= baseBigInt;
      const digit = remainder / den;
      remainder = remainder % den;

      fractionParts.push(baseSystem.getChar(digit));
    }

    let period = 0;
    if (cycleStartIndex !== -1) {
      // Repeating part found
      const nonRepeating = fractionParts.slice(0, cycleStartIndex).join("");
      const repeating = fractionParts.slice(cycleStartIndex).join("");
      period = fractionParts.length - cycleStartIndex;

      const formattedNonRepeating = useRepeatNotation
        ? Rational.#formatRepeatedDigits(nonRepeating)
        : nonRepeating;
      const formattedRepeating = useRepeatNotation
        ? Rational.#formatRepeatedDigits(repeating)
        : repeating;

      result += formattedNonRepeating + "#" + formattedRepeating;
    } else if (remainder === 0n) {
      // Terminating
      const terminating = fractionParts.join("");
      const formattedTerminating = useRepeatNotation
        ? Rational.#formatRepeatedDigits(terminating)
        : terminating;
      result += formattedTerminating + "#0";
    } else {
      // Hit limit before cycle detection
      const partial = fractionParts.join("");
      const formattedPartial = useRepeatNotation
        ? Rational.#formatRepeatedDigits(partial)
        : partial;
      result += formattedPartial + "...";
      period = -1; // Indicates unknown/too long
    }

    return { baseStr: result, period: period, limitHit: limitHit };
  }

  /**
   * Calculates the period length of this rational in a given base using modular arithmetic.
   * This allows finding the period length even if it's very large, where direct division converts fails.
   * NOTE: This is computationally expensive for large denominators.
   * 
   * @param {BaseSystem} baseSystem - The base system
   * @param {number} [limit=1000000] - Iteration limit to prevent infinite loops (though mathematically guaranteed to end)
   * @returns {number} The period length
   * @throws {Error} If limit is exceeded
   */
  periodModulo(baseSystem, limit = 1000000) {
    if (!(baseSystem instanceof BaseSystem)) {
      throw new Error("Argument must be a BaseSystem");
    }

    let den = this.#denominator;

    // Remove factors of base from denominator to find "non-terminating part"
    const baseBigInt = BigInt(baseSystem.base);

    // Simplify fraction first
    if (den === 1n) return 0;

    // Remove factors of base from denominator (pre-period part)
    // gcd(den, base)
    let common = this.#gcd(den, baseBigInt);
    while (common > 1n) {
      den /= common;
      common = this.#gcd(den, baseBigInt);
    }

    if (den === 1n) return 0; // Terminating

    // Multiplicative order of base modulo den: base^k = 1 (mod den)
    // We need to find smallest k > 0
    let k = 1;
    let power = baseBigInt % den;

    while (power !== 1n && k <= limit) {
      power = (power * baseBigInt) % den;
      k++;
    }

    if (k > limit) {
      throw new Error(`Period calculation exceeded limit of ${limit} iterations. Period is likely > ${limit}.`);
    }

    return k;
  }

  /**
   * Converts this rational to a string in the specified base system.
   * @param {BaseSystem} baseSystem - The base system to use
   * @returns {string} String representation
   */
  toBase(baseSystem) {
    if (!(baseSystem instanceof BaseSystem)) {
      throw new Error("Argument must be a BaseSystem");
    }

    const numStr = baseSystem.fromDecimal(this.#numerator);

    if (this.#denominator === 1n) {
      return numStr;
    }

    const denStr = baseSystem.fromDecimal(this.#denominator);
    return `${numStr}/${denStr}`;
  }

  /**
   * Converts this rational to a mixed number string in the format "a..b/c"
   * where a is the whole part and b/c is the fractional part.
   * If the number is an integer, returns just the integer.
   * If the number is negative, the negative sign is applied to the whole part.
   * @returns {string} Mixed number string representation
   */
  toMixedString() {
    // If denominator is 1 or numerator is 0, just return the integer
    if (this.#denominator === 1n || this.#numerator === 0n) {
      return this.#numerator.toString();
    }

    // Use lazy computation for whole part and remainder
    this.#computeWholePart();

    // If there's no remainder, just return the whole part with sign
    if (this.#remainder === 0n) {
      return this.#isNegative ? `-${this.#wholePart}` : `${this.#wholePart}`;
    }

    // For numbers with whole and fractional parts
    if (this.#wholePart === 0n) {
      // For fractions with no whole part (e.g., -1/2 -> -0..1/2)
      // deciding not to display the 0..
      return this.#isNegative
        ? `-${this.#remainder}/${this.#denominator}`
        : `${this.#remainder}/${this.#denominator}`;
    } else {
      // For mixed numbers (e.g., -2 1/4 -> -2..1/4)
      return this.#isNegative
        ? `-${this.#wholePart}..${this.#remainder}/${this.#denominator}`
        : `${this.#wholePart}..${this.#remainder}/${this.#denominator}`;
    }
  }

  /**
   * Approximates this rational as a JavaScript number
   * @returns {number} Floating-point approximation
   */
  toNumber() {
    return Number(this.#numerator) / Number(this.#denominator);
  }

  /**
   * Converts this rational to its repeating decimal string representation
   * @param {number} limit - Maximum repeating-period digits (default: 30)
   * @param {"trunc"|"null"|"error"} onLimit - Over-limit behavior
   * @returns {string|null} Repeating decimal string (e.g., "1/3" becomes "0.#3")
   */
  toRepeatingDecimal(limit = Rational.DEFAULT_PERIOD_DIGITS, onLimit = "error") {
    const result = this.toRepeatingDecimalWithPeriod({ limit, onLimit });
    return result.decimal;
  }

  /**
   * Converts this rational to a repeating decimal string with period information
   * @param {boolean|object} options - Legacy compact-notation flag or formatting options
   * @returns {object} Object with decimal string, period, and truncation information
   */
  toRepeatingDecimalWithPeriod(options = true, legacyLimit, legacyOnLimit) {
    const normalized = typeof options === "boolean"
      ? {
          useRepeatNotation: options,
          limit: legacyLimit ?? Rational.DEFAULT_PERIOD_DIGITS,
          onLimit: legacyOnLimit ?? "error",
        }
      : {
          useRepeatNotation: options?.useRepeatNotation ?? true,
          limit: options?.limit ?? Rational.DEFAULT_PERIOD_DIGITS,
          onLimit: options?.onLimit ?? "error",
        };
    const { useRepeatNotation, limit, onLimit } = normalized;

    if (!Number.isSafeInteger(limit) || limit < 1) {
      throw new RangeError("Repeating-decimal limit must be a positive safe integer");
    }
    if (!new Set(["trunc", "null", "error"]).has(onLimit)) {
      throw new TypeError('onLimit must be "trunc", "null", or "error"');
    }

    // Handle special cases
    if (this.#numerator === 0n) {
      return { decimal: "0", period: 0, truncated: false };
    }

    // Ensure whole part and decimal metadata are computed
    this.#computeWholePart();
    this.#computeDecimalMetadata(limit);

    let result = (this.#isNegative ? "-" : "") + this.#wholePart.toString();

    if (this.#isTerminating) {
      // Terminating decimal
      if (this.#initialSegment) {
        const formattedInitial = useRepeatNotation
          ? Rational.#formatRepeatedDigits(this.#initialSegment, 7) // threshold n > 6
          : this.#initialSegment;
        result += "." + formattedInitial + "#0";
      } else {
        // For pure integers, don't add #0
      }
      return { decimal: result, period: 0, truncated: false };
    } else {
      const overLimit = this.#periodLength === -1 || this.#periodLength > limit;
      if (overLimit) {
        if (onLimit === "null") {
          return { decimal: null, period: this.#periodLength, truncated: true };
        }
        if (onLimit === "error") {
          const period = this.#periodLength === -1
            ? `more than ${Rational.MAX_PERIOD_CHECK.toLocaleString()}`
            : this.#periodLength.toString();
          throw new RangeError(
            `Repeating decimal period is ${period} digits, exceeding limit ${limit}`,
          );
        }

        const initial = useRepeatNotation
          ? Rational.#formatRepeatedDigits(this.#initialSegment, 7)
          : this.#initialSegment;
        const periodPrefix = this.#periodDigits.slice(0, limit);
        const decimal = `${result}.${initial}#${periodPrefix}...`;
        return { decimal, period: this.#periodLength, truncated: true };
      }

      const periodDigits = this.#periodDigits;

      const formattedInitial = useRepeatNotation
        ? Rational.#formatRepeatedDigits(this.#initialSegment, 7) // threshold n > 6
        : this.#initialSegment;

      const displayPeriod = useRepeatNotation
        ? Rational.#formatRepeatedDigits(periodDigits, 7)
        : periodDigits;

      if (this.#initialSegment) {
        result += "." + formattedInitial + "#" + displayPeriod;
      } else {
        result += ".#" + displayPeriod;
      }

      return {
        decimal: result,
        period: this.#periodLength,
        truncated: false,
      };
    }
  }

  /**
   * Efficiently counts factors of 2 using bit shifting
   * @param {bigint} n - The number to factor
   * @returns {number} Number of factors of 2
   * @private
   */
  static #countFactorsOf2(n) {
    if (n === 0n) return 0;
    let count = 0;
    while ((n & 1n) === 0n) {
      n >>= 1n;
      count++;
    }
    return count;
  }

  /**
   * Efficiently counts factors of 5 using chunking algorithm
   * @param {bigint} n - The number to factor
   * @returns {number} Number of factors of 5
   * @private
   */
  static #countFactorsOf5(n) {
    if (n === 0n) return 0;
    let count = 0;

    // Use precomputed powers for efficient factoring
    const powers = [
      { exp: 16, value: Rational.POWERS_OF_5["16"] },
      { exp: 8, value: Rational.POWERS_OF_5["8"] },
      { exp: 4, value: Rational.POWERS_OF_5["4"] },
      { exp: 2, value: Rational.POWERS_OF_5["2"] },
      { exp: 1, value: Rational.POWERS_OF_5["1"] },
    ];

    for (const { exp, value } of powers) {
      while (n % value === 0n) {
        n /= value;
        count += exp;
      }
    }

    return count;
  }

  /**
   * Computes whole part and remainder (lazy computation)
   * @private
   */
  #computeWholePart() {
    if (this.#wholePart !== undefined) return;

    const absNumerator =
      this.#numerator < 0n ? -this.#numerator : this.#numerator;
    this.#wholePart = absNumerator / this.#denominator;
    this.#remainder = absNumerator % this.#denominator;
  }

  /**
   * Efficiently computes leading zeros in the repeating part
   * @param {bigint} reducedDen - Denominator with factors of 2 and 5 removed
   * @param {number} initialSegmentLength - Length of non-repeating part
   * @returns {number} Number of leading zeros in the repeating part
   * @private
   */
  #computeLeadingZerosInPeriod(reducedDen, initialSegmentLength) {
    // Adjust the numerator by multiplying by 10^k where k is the non-repeating length
    let adjustedNumerator =
      this.#remainder * 10n ** BigInt(initialSegmentLength);

    // Count how many times we multiply by 10 until adjusted numerator >= reduced denominator
    let leadingZeros = 0;
    while (
      adjustedNumerator < reducedDen &&
      leadingZeros < Rational.MAX_PERIOD_CHECK
    ) {
      // Limit to prevent infinite loops
      adjustedNumerator *= 10n;
      leadingZeros++;
    }

    return leadingZeros;
  }

  /**
   * Computes decimal representation metadata with caching and efficient algorithms
   * @param {number} maxPeriodDigits - Maximum number of period digits to compute (default: class DEFAULT_PERIOD_DIGITS)
   * @private
   */
  #computeDecimalMetadata(maxPeriodDigits = Rational.DEFAULT_PERIOD_DIGITS) {
    // Return cached values if already computed with sufficient digits
    if (
      this.#periodLength !== undefined &&
      this.#maxPeriodDigitsComputed !== undefined &&
      this.#maxPeriodDigitsComputed >= maxPeriodDigits
    )
      return;

    // Ensure whole part and remainder are computed
    this.#computeWholePart();

    if (this.#remainder === 0n) {
      // Pure integer - no fractional part
      this.#initialSegment = "";
      this.#periodDigits = "";
      this.#periodLength = 0;
      this.#isTerminating = true;
      this.#factorsOf2 = 0;
      this.#factorsOf5 = 0;
      this.#leadingZerosInPeriod = 0;
      this.#initialSegmentLeadingZeros = 0;
      this.#initialSegmentRest = "";
      this.#periodDigitsRest = "";
      this.#maxPeriodDigitsComputed = maxPeriodDigits;
      return;
    }

    // Use efficient factor counting and store as metadata
    this.#factorsOf2 = Rational.#countFactorsOf2(this.#denominator);
    this.#factorsOf5 = Rational.#countFactorsOf5(this.#denominator);

    const initialSegmentLength = Math.max(this.#factorsOf2, this.#factorsOf5);

    // Remove factors of 2 and 5 to get reduced denominator
    let reducedDen = this.#denominator;
    for (let i = 0; i < this.#factorsOf2; i++) {
      reducedDen /= 2n;
    }
    for (let i = 0; i < this.#factorsOf5; i++) {
      reducedDen /= 5n;
    }

    // If reduced denominator is 1, it's a terminating decimal
    if (reducedDen === 1n) {
      // Compute the initial segment (all digits after decimal point)
      const digits = [];
      let currentRemainder = this.#remainder;
      for (
        let i = 0;
        i < initialSegmentLength && currentRemainder !== 0n;
        i++
      ) {
        currentRemainder *= 10n;
        const digit = currentRemainder / this.#denominator;
        digits.push(digit.toString());
        currentRemainder = currentRemainder % this.#denominator;
      }

      this.#initialSegment = digits.join("");
      this.#periodDigits = "";
      this.#periodLength = 0;
      this.#isTerminating = true;
      this.#leadingZerosInPeriod = 0;

      // Compute breakdown of initial segment
      this.#computeDecimalPartBreakdown();
      this.#maxPeriodDigitsComputed = maxPeriodDigits;
      return;
    }

    // Find period length using multiplicative order of 10 modulo reducedDen
    let periodLength = 1;
    let remainder = 10n % reducedDen;

    while (remainder !== 1n && periodLength < Rational.MAX_PERIOD_CHECK) {
      periodLength++;
      remainder = (remainder * 10n) % reducedDen;
    }

    // Set period length (or -1 if too large)
    this.#periodLength =
      periodLength >= Rational.MAX_PERIOD_CHECK ? -1 : periodLength;
    this.#isTerminating = false;

    // Compute leading zeros in period efficiently
    this.#leadingZerosInPeriod = this.#computeLeadingZerosInPeriod(
      reducedDen,
      initialSegmentLength,
    );

    // Compute initial non-repeating segment
    const initialDigits = [];
    let currentRemainder = this.#remainder;

    for (let i = 0; i < initialSegmentLength && currentRemainder !== 0n; i++) {
      currentRemainder *= 10n;
      const digit = currentRemainder / this.#denominator;
      initialDigits.push(digit.toString());
      currentRemainder = currentRemainder % this.#denominator;
    }

    // Compute period digits using simplified ternary logic
    const periodDigitsToCompute =
      this.#periodLength === -1
        ? maxPeriodDigits
        : this.#periodLength > maxPeriodDigits
          ? maxPeriodDigits
          : this.#periodLength;
    const periodDigits = [];

    if (currentRemainder !== 0n) {
      for (let i = 0; i < periodDigitsToCompute; i++) {
        currentRemainder *= 10n;
        const digit = currentRemainder / this.#denominator;
        periodDigits.push(digit.toString());
        currentRemainder = currentRemainder % this.#denominator;
      }
    }

    this.#initialSegment = initialDigits.join("");
    this.#periodDigits = periodDigits.join("");

    // Compute breakdown of initial segment and period digits
    this.#computeDecimalPartBreakdown();
    this.#maxPeriodDigitsComputed = maxPeriodDigits;
  }

  /**
   * Computes the breakdown of initial segment and period digits into leading zeros and rest
   * @private
   */
  #computeDecimalPartBreakdown() {
    // Break down initial segment
    let leadingZeros = 0;
    const initialSegment = this.#initialSegment || "";

    for (let i = 0; i < initialSegment.length; i++) {
      if (initialSegment[i] === "0") {
        leadingZeros++;
      } else {
        break;
      }
    }

    this.#initialSegmentLeadingZeros = leadingZeros;
    this.#initialSegmentRest = initialSegment.substring(leadingZeros);

    // Break down period digits - compute leading zeros directly from the period digits
    const periodDigits = this.#periodDigits || "";
    let periodLeadingZeros = 0;

    for (let i = 0; i < periodDigits.length; i++) {
      if (periodDigits[i] === "0") {
        periodLeadingZeros++;
      } else {
        break;
      }
    }

    // Override the computed leading zeros with the actual count from period digits
    this.#leadingZerosInPeriod = periodLeadingZeros;
    this.#periodDigitsRest = periodDigits.substring(periodLeadingZeros);
  }

  /**
   * Public method for getting decimal metadata (backwards compatibility)
   * @param {number} maxPeriodDigits - Maximum number of period digits to compute
   * @returns {object} Object containing decimal metadata
   */
  computeDecimalMetadata(maxPeriodDigits = Rational.DEFAULT_PERIOD_DIGITS) {
    if (this.#numerator === 0n) {
      return {
        initialSegment: "",
        periodDigits: "",
        periodLength: 0,
        isTerminating: true,
      };
    }

    this.#computeDecimalMetadata(maxPeriodDigits);

    return {
      wholePart: this.#wholePart,
      initialSegment: this.#initialSegment,
      initialSegmentLeadingZeros: this.#initialSegmentLeadingZeros,
      initialSegmentRest: this.#initialSegmentRest,
      periodDigits: this.#periodDigits,
      periodLength: this.#periodLength,
      leadingZerosInPeriod: this.#leadingZerosInPeriod,
      periodDigitsRest: this.#periodDigitsRest,
      isTerminating: this.#isTerminating,
    };
  }

  /**
   * Formats repeated digits using {digit~count} notation
   * @param {string} digits - The digits to format
   * @param {number} threshold - Minimum number of consecutive zeros to use repeat notation (default: 6)
   * @returns {string} Formatted string with repeat notation where applicable
   * @private
   */
  static #formatRepeatedDigits(digits, threshold = 6) {
    if (!digits || digits.length === 0) return digits;

    let result = "";
    let i = 0;

    while (i < digits.length) {
      let currentChar = digits[i];
      let count = 1;

      // Count consecutive identical digits
      while (i + count < digits.length && digits[i + count] === currentChar) {
        count++;
      }

      // Use repeat notation if count meets threshold
      if (count >= threshold) {
        result += `{${currentChar}~${count}}`;
      } else {
        result += currentChar.repeat(count);
      }

      i += count;
    }

    return result;
  }

  /**
   * Parses repeated digits notation {digit~count} back to regular digits
   * @param {string} formattedDigits - String that may contain repeat notation
   * @returns {string} Expanded string with all digits spelled out
   * @private
   */
  static #parseRepeatedDigits(formattedDigits) {
    if (!formattedDigits || !formattedDigits.includes("{")) {
      return formattedDigits;
    }

    return formattedDigits.replace(
      /\{(.+?)~(\d+)\}/g,
      (match, digits, count) => {
        return digits.repeat(parseInt(count));
      },
    );
  }

  /**
   * Extracts a specific portion of the repeating period.
   * @param {string} initialSegment - The non-repeating part after decimal point
   * @param {number} periodLength - The full period length
   * @param {number} digitsRequested - Number of period digits to return
   * @returns {string} The requested portion of the period (capped at full period length)
   */
  extractPeriodSegment(initialSegment, periodLength, digitsRequested) {
    if (periodLength === 0 || periodLength === -1) {
      return "";
    }

    const digitsToReturn = Math.min(digitsRequested, periodLength);
    const periodDigits = [];

    // Start computation from where initial segment left off
    let currentRemainder = this.#numerator % this.#denominator;
    const isNegative = this.#numerator < 0n;
    if (isNegative) {
      currentRemainder = -currentRemainder;
    }

    // Skip through the initial segment
    for (let i = 0; i < initialSegment.length; i++) {
      currentRemainder *= 10n;
      currentRemainder = currentRemainder % this.#denominator;
    }

    // Compute the requested period digits
    for (let i = 0; i < digitsToReturn; i++) {
      currentRemainder *= 10n;
      const digit = currentRemainder / this.#denominator;
      periodDigits.push(digit.toString());
      currentRemainder = currentRemainder % this.#denominator;
    }

    return periodDigits.join("");
  }

  /**
   * Converts this rational to a standard decimal string representation
   * For terminating decimals, returns the exact decimal. For repeating decimals,
   * returns an approximation with sufficient precision.
   * @returns {string} Decimal string representation
   */
  toDecimal() {
    // Handle special cases
    if (this.#numerator === 0n) {
      return "0";
    }

    const isNegative = this.#numerator < 0n;
    const num = isNegative ? -this.#numerator : this.#numerator;
    const den = this.#denominator;

    // Get integer part
    const integerPart = num / den;
    let remainder = num % den;

    // If no remainder, it's a whole number
    if (remainder === 0n) {
      return (isNegative ? "-" : "") + integerPart.toString();
    }

    // Calculate decimal digits
    const digits = [];
    const maxDigits = 20; // Limit precision for practical output

    for (let i = 0; i < maxDigits && remainder !== 0n; i++) {
      remainder *= 10n;
      const digit = remainder / den;
      digits.push(digit.toString());
      remainder = remainder % den;
    }

    let result = (isNegative ? "-" : "") + integerPart.toString();
    if (digits.length > 0) {
      result += "." + digits.join("");
    }

    return result;
  }

  /**
   * Applies E notation to this rational number by multiplying by 10^exponent.
   * This is equivalent to shifting the decimal point by the specified number of places.
   *
   * @param {number|bigint} exponent - The exponent for the power of 10
   * @returns {Rational} A new Rational representing this * 10^exponent
   * @throws {Error} If the exponent is not an integer
   * @example
   * // Basic usage
   * new Rational(5).E(2)        // 500 (5 * 10^2)
   * new Rational(1, 4).E(-1)    // 0.025 (0.25 * 10^-1)
   * new Rational(123).E(-2)     // 1.23 (123 * 10^-2)
   *
   * // Equivalent to scientific notation
   * new Rational(1, 3).E(3)     // Same as 1/3 * 10^3 = 1000/3
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

    return this.multiply(powerOf10);
  }

  /**
   * Generates period info string for scientific notation
   * @param {boolean} showPeriodInfo - Whether to show period info
   * @returns {string} Period info string or empty string
   * @private
   */
  #generatePeriodInfo(showPeriodInfo) {
    if (!showPeriodInfo || this.#isTerminating) {
      return "";
    }

    const info = [];

    // Add initial segment info if it has leading zeros
    if (this.#initialSegmentLeadingZeros > 0) {
      info.push(`initial: ${this.#initialSegmentLeadingZeros} zeros`);
    }

    // Add period leading zeros info
    if (this.#leadingZerosInPeriod > 0) {
      info.push(`period starts: +${this.#leadingZerosInPeriod} zeros`);
    }

    // Add period length info
    if (this.#periodLength === -1) {
      info.push("period: >10^7");
    } else if (this.#periodLength > 0) {
      info.push(`period: ${this.#periodLength}`);
    }

    return info.length > 0 ? ` {${info.join(", ")}}` : "";
  }

  /**
   * Converts this rational to scientific notation using decimal metadata for efficiency
   * @param {boolean} useRepeatNotation - Whether to use {0~15} notation in mantissa (default: true)
   * @param {number} precision - Number of significant digits in mantissa (default: 10)
   * @param {boolean} showPeriodInfo - Whether to append period info for repeating decimals (default: false)
   * @returns {string} Scientific notation string (e.g., "6.57130E-6" or "6.57130E-6 {period: 42}")
   */
  toScientificNotation(
    useRepeatNotation = true,
    precision = 11,
    showPeriodInfo = false,
  ) {
    if (this.#numerator === 0n) {
      return "0";
    }
    if (!Number.isSafeInteger(precision) || precision < 1) {
      throw new RangeError("Scientific-notation precision must be a positive safe integer");
    }

    this.#computeWholePart();
    this.#computeDecimalMetadata(precision);

    const prefix = this.#isNegative ? "-" : "";
    const format = (digits) => useRepeatNotation
      ? Rational.#formatRepeatedDigits(digits, 7)
      : digits;

    // A period that does not fit is approximate display, never exact # syntax.
    if (!this.#isTerminating &&
        (this.#periodLength === -1 || this.#periodLength > precision)) {
      let numerator = this.#numerator < 0n ? -this.#numerator : this.#numerator;
      let denominator = this.#denominator;
      let exponent = 0;
      while (numerator >= denominator * 10n) {
        denominator *= 10n;
        exponent += 1;
      }
      while (numerator < denominator) {
        numerator *= 10n;
        exponent -= 1;
      }
      const digits = [];
      for (let i = 0; i < precision; i += 1) {
        digits.push((numerator / denominator).toString());
        numerator = (numerator % denominator) * 10n;
      }
      const mantissa = digits[0] +
        (digits.length > 1 ? `.${digits.slice(1).join("")}` : "") + "...";
      const result = `${prefix}${mantissa}E${exponent}`;
      return result + this.#generatePeriodInfo(showPeriodInfo);
    }

    const whole = this.#wholePart.toString();
    const period = this.#periodDigits;
    let firstDigit;
    let exponent;
    let nonRepeatingTail = "";
    let scientificPeriod = period;

    if (this.#wholePart > 0n) {
      firstDigit = whole[0];
      exponent = whole.length - 1;
      const wholeTail = whole.slice(1);
      if (!this.#isTerminating && this.#initialSegment.length === 0) {
        const stream = wholeTail + period.repeat(
          Math.ceil((period.length + wholeTail.length) / period.length) + 1,
        );
        scientificPeriod = stream.slice(0, period.length);
      } else {
        nonRepeatingTail = wholeTail + this.#initialSegment;
      }
    } else if (this.#initialSegmentRest !== "") {
      const index = this.#initialSegmentLeadingZeros;
      firstDigit = this.#initialSegment[index];
      exponent = -(index + 1);
      nonRepeatingTail = this.#initialSegment.slice(index + 1);
    } else {
      const index = period.search(/[1-9]/);
      firstDigit = period[index];
      exponent = -(this.#initialSegment.length + index + 1);
      scientificPeriod = period.slice(index + 1) + period.slice(0, index + 1);
    }

    if (this.#isTerminating) {
      const tail = nonRepeatingTail.replace(/0+$/, "");
      const shown = tail.slice(0, Math.max(0, precision - 1));
      const ellipsis = tail.length > shown.length ? "..." : "";
      return `${prefix}${firstDigit}${shown ? `.${shown}` : ""}${ellipsis}E${exponent}`;
    }

    const initial = format(nonRepeatingTail);
    const repeated = format(scientificPeriod);
    const mantissa = `${firstDigit}.${initial}#${repeated}`;
    const result = `${prefix}${mantissa}E${exponent}`;
    return result + this.#generatePeriodInfo(showPeriodInfo);
  }

  /**
   * Creates a Rational from a number, string, or another Rational
   * @param {number|string|bigint|Rational} value - The value to convert
   * @returns {Rational} A new Rational instance
   */
  static from(value) {
    if (value instanceof Rational) {
      return new Rational(value.numerator, value.denominator);
    }
    return new Rational(value);
  }

  // Class constant for continued fraction limits
  static DEFAULT_CF_LIMIT = 1000;

  /**
   * Creates a Rational from a continued fraction coefficient array
   * @param {Array<bigint|number>} cfArray - Array [integer_part, ...continued_fraction_terms]
   * @returns {Rational} The rational number represented by the continued fraction
   */
  static fromContinuedFraction(cfArray) {
    if (!Array.isArray(cfArray) || cfArray.length === 0) {
      throw new Error("Continued fraction array cannot be empty");
    }

    // Convert to BigInt array
    const cf = cfArray.map(term => {
      if (typeof term === 'number') {
        return toExactBigInt(term, "Continued fraction term");
      } else if (typeof term === 'bigint') {
        return term;
      } else {
        throw new Error(`Invalid continued fraction term: ${term}`);
      }
    });

    // Validate: first term can be any integer, subsequent terms must be positive
    for (let i = 1; i < cf.length; i++) {
      if (cf[i] <= 0n) {
        throw new Error(`Continued fraction terms must be positive: ${cf[i]}`);
      }
    }

    // Handle simple case of just integer part
    if (cf.length === 1) {
      return new Rational(cf[0], 1n);
    }

    // Compute convergents using recurrence relation:
    // p₋₁ = 1, p₀ = a₀, pₙ = aₙ * pₙ₋₁ + pₙ₋₂
    // q₋₁ = 0, q₀ = 1, qₙ = aₙ * qₙ₋₁ + qₙ₋₂

    let p_prev = 1n;  // p₋₁
    let p_curr = cf[0];  // p₀

    let q_prev = 0n;  // q₋₁
    let q_curr = 1n;  // q₀

    const convergents = [new Rational(p_curr, q_curr)];

    for (let i = 1; i < cf.length; i++) {
      const a = cf[i];

      // Compute next convergent
      const p_next = a * p_curr + p_prev;
      const q_next = a * q_curr + q_prev;

      convergents.push(new Rational(p_next, q_next));

      // Update for next iteration
      p_prev = p_curr;
      p_curr = p_next;
      q_prev = q_curr;
      q_curr = q_next;
    }

    // The final convergent is our result
    const result = convergents[convergents.length - 1];

    // Store CF data on the instance
    result.cf = cf.slice(1); // CF coefficients without integer part
    result._convergents = convergents;
    result._convergentsComplete = true;
    result.wholePart = cf[0];

    return result;
  }

  /**
   * Convert this Rational to continued fraction coefficients
   * @param {number} maxTerms - Maximum number of terms to compute (default: class limit)
   * @returns {Array<bigint>} Array [integer_part, ...continued_fraction_terms]
   */
  toContinuedFraction(maxTerms = Rational.DEFAULT_CF_LIMIT) {
    if (this.#denominator === 0n) {
      throw new Error("Cannot convert infinite value to continued fraction");
    }

    if (this.#denominator === 1n) {
      // This is an integer
      return [this.#numerator];
    }

    // Use Euclidean algorithm
    const cf = [];
    let num = this.#numerator;
    let den = this.#denominator;

    // Handle negative numbers by making the first term negative
    const isNeg = num < 0n;
    if (isNeg) {
      num = -num;
    }

    // Extract integer part
    let intPart = num / den;
    if (isNeg) {
      intPart = -intPart;
      // For negative numbers, we need floor division
      if (num % den !== 0n) {
        intPart = intPart - 1n;
        num = den - (num % den);
      } else {
        num = num % den;
      }
    } else {
      num = num % den;
    }

    cf.push(intPart);

    // Continue with Euclidean algorithm
    let termCount = 1;
    while (num !== 0n && termCount < maxTerms) {
      // Swap and divide: den/num = quotient + remainder/num
      const quotient = den / num;
      cf.push(quotient);

      const remainder = den % num;
      den = num;
      num = remainder;

      termCount++;
    }

    // Ensure canonical form: don't end with 1 unless it's the only term
    if (cf.length > 1 && cf[cf.length - 1] === 1n) {
      // Replace last two terms [a, 1] with [a+1]
      const secondLast = cf[cf.length - 2];
      cf[cf.length - 2] = secondLast + 1n;
      cf.pop();
    }

    // Store on instance
    this.cf = cf.slice(1);
    if (!this.wholePart) {
      this.wholePart = cf[0];
    }

    // We don't store convergents here since they're computed lazily

    return cf;
  }

  /**
   * Convert to continued fraction string representation
   * @returns {string} String in format "3.~7~15~1~292"
   */
  toContinuedFractionString() {
    const cf = this.toContinuedFraction();

    if (cf.length === 1) {
      // Integer case
      return `${cf[0]}.~0`;
    }

    const intPart = cf[0];
    const cfTerms = cf.slice(1);

    return `${intPart}.~${cfTerms.join('~')}`;
  }

  /**
   * Parse a continued fraction string and create a Rational
   * @param {string} cfString - String like "3.~7~15~1~292"
   * @returns {Rational} The resulting Rational number
   */
  static fromContinuedFractionString(cfString) {
    // Parse the string directly to avoid circular imports
    const cfMatch = cfString.match(/^(-?\d+)\.~(.*)$/);
    if (!cfMatch) {
      throw new Error("Invalid continued fraction format");
    }

    const [, integerPart, cfTermsStr] = cfMatch;

    // Parse integer part
    const intPart = BigInt(integerPart);

    // Handle special case of integer representation like "5.~0"
    if (cfTermsStr === '0') {
      return new Rational(intPart, 1n);
    }

    // Validate terms string
    if (cfTermsStr === '') {
      throw new Error("Continued fraction must have at least one term after .~");
    }

    if (cfTermsStr.endsWith('~')) {
      throw new Error("Continued fraction cannot end with ~");
    }

    if (cfTermsStr.includes('~~')) {
      throw new Error("Invalid continued fraction format: double tilde");
    }

    // Split terms and validate they are all positive integers
    const terms = cfTermsStr.split('~');
    const cfTerms = [];

    for (const term of terms) {
      if (!/^\d+$/.test(term)) {
        throw new Error(`Invalid continued fraction term: ${term}`);
      }
      const termValue = BigInt(term);
      if (termValue <= 0n) {
        throw new Error(`Continued fraction terms must be positive integers: ${term}`);
      }
      cfTerms.push(termValue);
    }

    const cfArray = [intPart, ...cfTerms];
    return Rational.fromContinuedFraction(cfArray);
  }

  /**
   * Get the convergents of this rational's continued fraction
   * @param {number} maxCount - Maximum number of convergents to return
   * @returns {Array<Rational>} Array of convergent Rational numbers
   */
  convergents(maxCount = Rational.DEFAULT_CF_LIMIT) {
    if (
      !this._convergents ||
      (!this._convergentsComplete && this._convergents.length < maxCount)
    ) {
      // Compute continued fraction and convergents
      const cf = this.toContinuedFraction(maxCount);

      // Compute convergents using same algorithm as fromContinuedFraction
      if (cf.length === 1) {
        this._convergents = [new Rational(cf[0], 1n)];
      } else {
        let p_prev = 1n;  // p₋₁
        let p_curr = cf[0];  // p₀
        let q_prev = 0n;  // q₋₁
        let q_curr = 1n;  // q₀

        const convergents = [new Rational(p_curr, q_curr)];

        for (let i = 1; i < cf.length; i++) {
          const a = cf[i];

          // Compute next convergent
          const p_next = a * p_curr + p_prev;
          const q_next = a * q_curr + q_prev;

          convergents.push(new Rational(p_next, q_next));

          // Update for next iteration
          p_prev = p_curr;
          p_curr = p_next;
          q_prev = q_curr;
          q_curr = q_next;
        }

        this._convergents = convergents;
      }

      const last = this._convergents[this._convergents.length - 1];
      this._convergentsComplete = last.equals(this);
    }

    if (maxCount && this._convergents && this._convergents.length > maxCount) {
      return this._convergents.slice(0, maxCount);
    }

    return this._convergents || [];
  }

  /**
   * Get the nth convergent of this rational's continued fraction
   * @param {number} n - Index of the convergent (0-based)
   * @returns {Rational} The nth convergent
   */
  getConvergent(n) {
    const convergents = this.convergents();
    if (n < 0 || n >= convergents.length) {
      throw new Error(`Convergent index ${n} out of range [0, ${convergents.length - 1}]`);
    }
    return convergents[n];
  }

  /**
   * Compute convergents from a continued fraction array
   * @param {Array<bigint>|string} cfInput - CF array or CF string
   * @param {number} maxCount - Maximum number of convergents
   * @returns {Array<Rational>} Array of convergents
   */
  static convergentsFromCF(cfInput, maxCount = Rational.DEFAULT_CF_LIMIT) {
    let cfArray;
    if (typeof cfInput === 'string') {
      // Parse CF string directly
      const rational = Rational.fromContinuedFractionString(cfInput);
      return rational.convergents(maxCount);
    } else {
      cfArray = cfInput;
    }

    // Create a temporary rational to get convergents
    const rational = Rational.fromContinuedFraction(cfArray);
    return rational.convergents(maxCount);
  }

  /**
   * Compute approximation error between this rational and a target
   * @param {Rational} target - The target rational to compare against
   * @returns {Rational} The absolute difference
   */
  approximationError(target) {
    if (!(target instanceof Rational)) {
      throw new Error("Target must be a Rational");
    }

    return this.subtract(target).abs();
  }

  /**
   * Find the closest rational approximation within a denominator limit.
   * The result may be a continued-fraction semiconvergent.
   * @param {bigint} maxDenominator - Maximum allowed denominator
   * @returns {Rational} Best approximation within the limit
   */
  bestApproximation(maxDenominator) {
    if (typeof maxDenominator !== "bigint" || maxDenominator < 1n) {
      throw new Error("Maximum denominator must be a positive bigint");
    }

    if (this.#denominator <= maxDenominator) {
      return new Rational(this.#numerator, this.#denominator);
    }

    const negative = this.#numerator < 0n;
    let numerator = negative ? -this.#numerator : this.#numerator;
    let denominator = this.#denominator;

    // Consecutive convergent recurrence, matching the limit_denominator
    // construction. When the next convergent is too large, fill the remaining
    // denominator budget with the corresponding semiconvergent.
    let previousNumerator = 0n;
    let previousDenominator = 1n;
    let currentNumerator = 1n;
    let currentDenominator = 0n;

    while (denominator !== 0n) {
      const coefficient = numerator / denominator;
      const nextDenominator =
        previousDenominator + coefficient * currentDenominator;

      if (nextDenominator > maxDenominator) {
        break;
      }

      [previousNumerator, currentNumerator] = [
        currentNumerator,
        previousNumerator + coefficient * currentNumerator,
      ];
      [previousDenominator, currentDenominator] = [
        currentDenominator,
        nextDenominator,
      ];
      [numerator, denominator] = [
        denominator,
        numerator - coefficient * denominator,
      ];
    }

    const multiplier =
      (maxDenominator - previousDenominator) / currentDenominator;
    const semiconvergentNumerator =
      previousNumerator + multiplier * currentNumerator;
    const semiconvergentDenominator =
      previousDenominator + multiplier * currentDenominator;

    // Compare exact absolute errors without introducing floating point.
    const targetNumerator = negative ? -this.#numerator : this.#numerator;
    const semiconvergentError =
      targetNumerator * semiconvergentDenominator -
      semiconvergentNumerator * this.#denominator;
    const convergentError =
      targetNumerator * currentDenominator -
      currentNumerator * this.#denominator;
    const absoluteSemiconvergentError =
      semiconvergentError < 0n ? -semiconvergentError : semiconvergentError;
    const absoluteConvergentError =
      convergentError < 0n ? -convergentError : convergentError;

    const useConvergent =
      absoluteConvergentError * semiconvergentDenominator <=
      absoluteSemiconvergentError * currentDenominator;
    const resultNumerator = useConvergent
      ? currentNumerator
      : semiconvergentNumerator;
    const resultDenominator = useConvergent
      ? currentDenominator
      : semiconvergentDenominator;

    return new Rational(
      negative ? -resultNumerator : resultNumerator,
      resultDenominator,
    );
  }

  /**
   * Find the last continued-fraction convergent within a denominator limit.
   * This is the "best approximation of the second kind", minimizing the
   * denominator-weighted error |q*x - p| among smaller denominators.
   * @param {bigint} maxDenominator - Maximum allowed denominator
   * @returns {Rational} Last convergent within the limit
   */
  bestConvergent(maxDenominator) {
    if (typeof maxDenominator !== "bigint" || maxDenominator < 1n) {
      throw new Error("Maximum denominator must be a positive bigint");
    }

    const negative = this.#numerator < 0n;
    let numerator = negative ? -this.#numerator : this.#numerator;
    let denominator = this.#denominator;
    let previousNumerator = 0n;
    let previousDenominator = 1n;
    let currentNumerator = 1n;
    let currentDenominator = 0n;

    while (denominator !== 0n) {
      const coefficient = numerator / denominator;
      const nextNumerator =
        previousNumerator + coefficient * currentNumerator;
      const nextDenominator =
        previousDenominator + coefficient * currentDenominator;

      if (nextDenominator > maxDenominator) {
        break;
      }

      [previousNumerator, currentNumerator] = [
        currentNumerator,
        nextNumerator,
      ];
      [previousDenominator, currentDenominator] = [
        currentDenominator,
        nextDenominator,
      ];
      [numerator, denominator] = [
        denominator,
        numerator - coefficient * denominator,
      ];
    }

    return new Rational(
      negative ? -currentNumerator : currentNumerator,
      currentDenominator,
    );
  }

  /**
   * Computes the bit length of the rational number
   * @returns {number} Bit length of the rational
   */
  bitLength() {
    return Math.max(bitLength(this.numerator), bitLength(this.denominator));
  }

}

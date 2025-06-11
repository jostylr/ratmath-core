/**
 * Integer.js
 *
 * A class for exact integer arithmetic using BigInt.
 * Represents integers with arbitrary precision.
 * Division returns a Rational if the result is not a whole number.
 */

import { Rational } from "./rational.js";
import { RationalInterval } from "./rational-interval.js";

export class Integer {
  #value;
  static zero = new Integer(0);
  static one = new Integer(1);

  /**
   * Creates a new Integer.
   *
   * @param {number|string|bigint} value - The integer value
   * @throws {Error} If the input is not a valid integer
   */
  constructor(value) {
    if (typeof value === "string") {
      // Handle string input, ensure it's a valid integer
      const trimmed = value.trim();
      if (!/^-?\d+$/.test(trimmed)) {
        throw new Error("Invalid integer format. Must be a whole number");
      }
      this.#value = BigInt(trimmed);
    } else {
      this.#value = BigInt(value);
    }
  }

  /**
   * Gets the value of the integer
   * @returns {bigint} The integer value
   */
  get value() {
    return this.#value;
  }

  /**
   * Adds another number to this integer with automatic type promotion
   * @param {Integer|Rational|RationalInterval} other - The number to add
   * @returns {Integer|Rational|RationalInterval} The sum with appropriate type
   */
  add(other) {
    if (other instanceof Integer) {
      return new Integer(this.#value + other.value);
    } else if (other instanceof Rational) {
      // Promote this integer to rational and add
      const thisAsRational = new Rational(this.#value, 1n);
      return thisAsRational.add(other);
    } else if (other.low && other.high && typeof other.low.equals === 'function') {
      // This looks like a RationalInterval - promote this integer to rational interval and add
      const thisAsRational = new Rational(this.#value, 1n);
      const IntervalClass = other.constructor;
      const thisAsInterval = new IntervalClass(thisAsRational, thisAsRational);
      return thisAsInterval.add(other);
    } else {
      throw new Error(`Cannot add ${other.constructor.name} to Integer`);
    }
  }

  /**
   * Subtracts another number from this integer with automatic type promotion
   * @param {Integer|Rational|RationalInterval} other - The number to subtract
   * @returns {Integer|Rational|RationalInterval} The difference with appropriate type
   */
  subtract(other) {
    if (other instanceof Integer) {
      return new Integer(this.#value - other.value);
    } else if (other instanceof Rational) {
      // Promote this integer to rational and subtract
      const thisAsRational = new Rational(this.#value, 1n);
      return thisAsRational.subtract(other);
    } else if (other.low && other.high && typeof other.low.equals === 'function') {
      // This looks like a RationalInterval - promote this integer to rational interval and subtract
      const thisAsRational = new Rational(this.#value, 1n);
      const IntervalClass = other.constructor;
      const thisAsInterval = new IntervalClass(thisAsRational, thisAsRational);
      return thisAsInterval.subtract(other);
    } else {
      throw new Error(`Cannot subtract ${other.constructor.name} from Integer`);
    }
  }

  /**
   * Multiplies this integer by another number with automatic type promotion
   * @param {Integer|Rational|RationalInterval} other - The number to multiply by
   * @returns {Integer|Rational|RationalInterval} The product with appropriate type
   */
  multiply(other) {
    if (other instanceof Integer) {
      return new Integer(this.#value * other.value);
    } else if (other instanceof Rational) {
      // Promote this integer to rational and multiply
      const thisAsRational = new Rational(this.#value, 1n);
      return thisAsRational.multiply(other);
    } else if (other.low && other.high && typeof other.low.equals === 'function') {
      // This looks like a RationalInterval - promote this integer to rational interval and multiply
      const thisAsRational = new Rational(this.#value, 1n);
      const IntervalClass = other.constructor;
      const thisAsInterval = new IntervalClass(thisAsRational, thisAsRational);
      return thisAsInterval.multiply(other);
    } else {
      throw new Error(`Cannot multiply Integer by ${other.constructor.name}`);
    }
  }

  /**
   * Divides this integer by another number with automatic type promotion
   * @param {Integer|Rational|RationalInterval} other - The number to divide by
   * @returns {Integer|Rational|RationalInterval} The quotient with appropriate type
   * @throws {Error} If other is zero
   */
  divide(other) {
    if (other instanceof Integer) {
      if (other.value === 0n) {
        throw new Error("Division by zero");
      }

      // Check if division is exact
      if (this.#value % other.value === 0n) {
        return new Integer(this.#value / other.value);
      } else {
        // Return a rational number
        return new Rational(this.#value, other.value);
      }
    } else if (other instanceof Rational) {
      // Promote this integer to rational and divide
      const thisAsRational = new Rational(this.#value, 1n);
      return thisAsRational.divide(other);
    } else if (other.low && other.high && typeof other.low.equals === 'function') {
      // This looks like a RationalInterval - promote this integer to rational interval and divide
      const thisAsRational = new Rational(this.#value, 1n);
      const IntervalClass = other.constructor;
      const thisAsInterval = new IntervalClass(thisAsRational, thisAsRational);
      return thisAsInterval.divide(other);
    } else {
      throw new Error(`Cannot divide Integer by ${other.constructor.name}`);
    }
  }

  /**
   * Computes the remainder when dividing this integer by another
   * @param {Integer} other - The integer to divide by
   * @returns {Integer} The remainder as a new Integer
   * @throws {Error} If other is zero
   */
  modulo(other) {
    if (other.value === 0n) {
      throw new Error("Modulo by zero");
    }
    return new Integer(this.#value % other.value);
  }

  /**
   * Returns the negation of this integer
   * @returns {Integer} The negation as a new Integer
   */
  negate() {
    return new Integer(-this.#value);
  }

  /**
   * Raises this integer to an integer power
   * @param {number|bigint|Integer} exponent - The exponent
   * @returns {Integer|Rational} Integer for non-negative exponents, Rational for negative exponents
   * @throws {Error} If this integer is zero and exponent is negative
   */
  pow(exponent) {
    const exp = exponent instanceof Integer ? exponent.value : BigInt(exponent);
    
    if (exp === 0n) {
      if (this.#value === 0n) {
        throw new Error("Zero cannot be raised to the power of zero");
      }
      return new Integer(1);
    }

    if (exp < 0n) {
      if (this.#value === 0n) {
        throw new Error("Zero cannot be raised to a negative power");
      }
      // For negative exponents, compute 1/(this^|exp|) as a Rational
      const positiveExp = -exp;
      const positiveResult = this.pow(positiveExp);
      return new Rational(1, positiveResult.value);
    }

    // Use binary exponentiation for efficiency
    let result = 1n;
    let base = this.#value;
    let n = exp;

    while (n > 0n) {
      if (n & 1n) {
        result *= base;
      }
      base *= base;
      n >>= 1n;
    }

    return new Integer(result);
  }

  /**
   * Checks if this integer equals another
   * @param {Integer} other - The integer to compare with
   * @returns {boolean} True if the integers are equal
   */
  equals(other) {
    return this.#value === other.value;
  }

  /**
   * Compares this integer with another
   * @param {Integer} other - The integer to compare with
   * @returns {number} -1 if this < other, 0 if equal, 1 if this > other
   */
  compareTo(other) {
    if (this.#value < other.value) return -1;
    if (this.#value > other.value) return 1;
    return 0;
  }

  /**
   * Checks if this integer is less than another
   * @param {Integer} other - The integer to compare with
   * @returns {boolean} True if this integer is less than other
   */
  lessThan(other) {
    return this.#value < other.value;
  }

  /**
   * Checks if this integer is less than or equal to another
   * @param {Integer} other - The integer to compare with
   * @returns {boolean} True if this integer is less than or equal to other
   */
  lessThanOrEqual(other) {
    return this.#value <= other.value;
  }

  /**
   * Checks if this integer is greater than another
   * @param {Integer} other - The integer to compare with
   * @returns {boolean} True if this integer is greater than other
   */
  greaterThan(other) {
    return this.#value > other.value;
  }

  /**
   * Checks if this integer is greater than or equal to another
   * @param {Integer} other - The integer to compare with
   * @returns {boolean} True if this integer is greater than or equal to other
   */
  greaterThanOrEqual(other) {
    return this.#value >= other.value;
  }

  /**
   * Returns the absolute value of this integer
   * @returns {Integer} The absolute value as a new Integer
   */
  abs() {
    return this.#value < 0n ? this.negate() : new Integer(this.#value);
  }

  /**
   * Returns the sign of this integer
   * @returns {Integer} -1 for negative, 0 for zero, 1 for positive
   */
  sign() {
    if (this.#value < 0n) return new Integer(-1);
    if (this.#value > 0n) return new Integer(1);
    return new Integer(0);
  }

  /**
   * Checks if this integer is even
   * @returns {boolean} True if the integer is even
   */
  isEven() {
    return this.#value % 2n === 0n;
  }

  /**
   * Checks if this integer is odd
   * @returns {boolean} True if the integer is odd
   */
  isOdd() {
    return this.#value % 2n !== 0n;
  }

  /**
   * Checks if this integer is zero
   * @returns {boolean} True if the integer is zero
   */
  isZero() {
    return this.#value === 0n;
  }

  /**
   * Checks if this integer is positive
   * @returns {boolean} True if the integer is positive
   */
  isPositive() {
    return this.#value > 0n;
  }

  /**
   * Checks if this integer is negative
   * @returns {boolean} True if the integer is negative
   */
  isNegative() {
    return this.#value < 0n;
  }

  /**
   * Computes the greatest common divisor with another integer
   * @param {Integer} other - The other integer
   * @returns {Integer} The GCD as a new Integer
   */
  gcd(other) {
    let a = this.#value < 0n ? -this.#value : this.#value;
    let b = other.value < 0n ? -other.value : other.value;

    while (b !== 0n) {
      const temp = b;
      b = a % b;
      a = temp;
    }

    return new Integer(a);
  }

  /**
   * Computes the least common multiple with another integer
   * @param {Integer} other - The other integer
   * @returns {Integer} The LCM as a new Integer
   */
  lcm(other) {
    if (this.#value === 0n || other.value === 0n) {
      return new Integer(0);
    }

    const gcd = this.gcd(other);
    const product = this.multiply(other).abs();
    return product.divide(gcd);
  }

  /**
   * Converts this integer to a string
   * @returns {string} String representation of this integer
   */
  toString() {
    return this.#value.toString();
  }

  /**
   * Converts this integer to a JavaScript number
   * @returns {number} Floating-point approximation
   */
  toNumber() {
    return Number(this.#value);
  }

  /**
   * Converts this integer to a Rational
   * @returns {Rational} This integer as a Rational with denominator 1
   */
  toRational() {
    return new Rational(this.#value, 1n);
  }

  /**
   * Creates an Integer from a number, string, bigint, or another Integer
   * @param {number|string|bigint|Integer} value - The value to convert
   * @returns {Integer} A new Integer instance
   */
  static from(value) {
    if (value instanceof Integer) {
      return new Integer(value.value);
    }
    return new Integer(value);
  }

  /**
   * Creates an Integer from a Rational
   * @param {Rational} rational - The rational to convert
   * @returns {Integer} A new Integer instance
   * @throws {Error} If the rational is not a whole number
   */
  static fromRational(rational) {
    if (rational.denominator !== 1n) {
      throw new Error("Rational is not a whole number");
    }
    return new Integer(rational.numerator);
  }

  /**
   * Applies E notation to this integer by multiplying by 10^exponent.
   * This is equivalent to shifting the decimal point by the specified number of places.
   * For negative exponents, returns a Rational since the result may not be an integer.
   * 
   * @param {number|bigint} exponent - The exponent for the power of 10
   * @returns {Integer|Rational} A new Integer for non-negative exponents, or Rational for negative exponents
   * @throws {Error} If the exponent is not an integer
   * @example
   * // Basic usage
   * new Integer(5).E(2)        // 500 (Integer: 5 * 10^2)
   * new Integer(123).E(0)      // 123 (Integer: 123 * 10^0)
   * new Integer(45).E(-1)      // 4.5 (Rational: 45 * 10^-1)
   * new Integer(100).E(-2)     // 1 (Rational: 100 * 10^-2)
   * 
   * // Equivalent to scientific notation
   * new Integer(3).E(4)        // 30000 (Integer: 3 * 10^4)
   */
  E(exponent) {
    const exp = BigInt(exponent);
    
    if (exp >= 0n) {
      // Non-negative exponent: result is an integer
      const newValue = this.#value * (10n ** exp);
      return new Integer(newValue);
    } else {
      // Negative exponent: result might not be an integer, return Rational
      const powerOf10 = new Rational(1n, 10n ** (-exp));
      const thisAsRational = new Rational(this.#value, 1n);
      return thisAsRational.multiply(powerOf10);
    }
  }
}
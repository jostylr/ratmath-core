/**
 * Rational.js
 *
 * A class for exact rational number arithmetic using BigInt.
 * Represents a rational number as a fraction with numerator and denominator in lowest terms.
 */

export class Rational {
  #numerator;
  #denominator;
  static zero = new Rational(0, 1);
  static one = new Rational(1, 1);

  /**
   * Creates a new Rational number.
   *
   * @param {number|string|bigint} numerator - The numerator, or a string like "3/4"
   * @param {number|bigint|undefined} denominator - The denominator (optional if numerator is a string)
   * @throws {Error} If denominator is zero or if the input format is invalid
   */
  constructor(numerator, denominator = 1n) {
    // Handle string representation (e.g., "3/4" or "5..2/3")
    if (typeof numerator === "string") {
      // Check for mixed number notation with double dot
      if (numerator.includes("..")) {
        const mixedParts = numerator.trim().split("..");
        if (mixedParts.length !== 2) {
          throw new Error("Invalid mixed number format. Use 'a..b/c'");
        }
        
        const wholePart = BigInt(mixedParts[0]);
        const fractionParts = mixedParts[1].split("/");
        
        if (fractionParts.length !== 2) {
          throw new Error("Invalid fraction in mixed number. Use 'a..b/c'");
        }
        
        const fracNumerator = BigInt(fractionParts[0]);
        const fracDenominator = BigInt(fractionParts[1]);
        
        // Calculate equivalent improper fraction: whole + numerator/denominator
        const isNegative = wholePart < 0n;
        const absWhole = isNegative ? -wholePart : wholePart;
        
        // (absWhole * denominator + numerator) with appropriate sign
        this.#numerator = isNegative 
          ? -(absWhole * fracDenominator + fracNumerator)
          : (wholePart * fracDenominator + fracNumerator);
        this.#denominator = fracDenominator;
      } else {
        // Standard fraction notation
        const parts = numerator.trim().split("/");

        if (parts.length === 1) {
          // Just a number like "3"
          this.#numerator = BigInt(parts[0]);
          this.#denominator = BigInt(denominator);
        } else if (parts.length === 2) {
          // Fraction like "3/4"
          this.#numerator = BigInt(parts[0]);
          this.#denominator = BigInt(parts[1]);
        } else {
          throw new Error("Invalid rational format. Use 'a/b', 'a', or 'a..b/c'");
        }
      }
    } else {
      // Handle numeric inputs
      this.#numerator = BigInt(numerator);
      this.#denominator = BigInt(denominator);
    }

    // Check for zero denominator
    if (this.#denominator === 0n) {
      throw new Error("Denominator cannot be zero");
    }

    // Normalize the representation
    this.#normalize();
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
   * Adds another rational number to this one
   * @param {Rational} other - The rational to add
   * @returns {Rational} The sum as a new Rational
   */
  add(other) {
    const a = this.#numerator;
    const b = this.#denominator;
    const c = other.numerator;
    const d = other.denominator;

    // a/b + c/d = (ad + bc)/bd
    const numerator = a * d + b * c;
    const denominator = b * d;

    return new Rational(numerator, denominator);
  }

  /**
   * Subtracts another rational number from this one
   * @param {Rational} other - The rational to subtract
   * @returns {Rational} The difference as a new Rational
   */
  subtract(other) {
    const a = this.#numerator;
    const b = this.#denominator;
    const c = other.numerator;
    const d = other.denominator;

    // a/b - c/d = (ad - bc)/bd
    const numerator = a * d - b * c;
    const denominator = b * d;

    return new Rational(numerator, denominator);
  }

  /**
   * Multiplies this rational by another
   * @param {Rational} other - The rational to multiply by
   * @returns {Rational} The product as a new Rational
   */
  multiply(other) {
    const a = this.#numerator;
    const b = this.#denominator;
    const c = other.numerator;
    const d = other.denominator;

    // (a/b) * (c/d) = (ac)/(bd)
    const numerator = a * c;
    const denominator = b * d;

    return new Rational(numerator, denominator);
  }

  /**
   * Divides this rational by another
   * @param {Rational} other - The rational to divide by
   * @returns {Rational} The quotient as a new Rational
   * @throws {Error} If other is zero
   */
  divide(other) {
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

  /**
   * Converts this rational to a string in the format "numerator/denominator"
   * or just "numerator" if denominator is 1
   * @returns {string} String representation of this rational
   */
  toString() {
    if (this.#denominator === 1n) {
      return this.#numerator.toString();
    }
    return `${this.#numerator}/${this.#denominator}`;
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
    
    // Handle negative numbers
    const isNegative = this.#numerator < 0n;
    const absNum = isNegative ? -this.#numerator : this.#numerator;
    
    // Calculate whole part and remainder (both positive)
    const wholePart = absNum / this.#denominator;
    const remainder = absNum % this.#denominator;
    
    // If there's no remainder, just return the whole part with sign
    if (remainder === 0n) {
      return isNegative ? `-${wholePart}` : `${wholePart}`;
    }
    
    // For numbers with whole and fractional parts
    if (wholePart === 0n) {
      // For fractions with no whole part (e.g., -1/2 -> -0..1/2)
      return isNegative ? `-0..${remainder}/${this.#denominator}` : `0..${remainder}/${this.#denominator}`;
    } else {
      // For mixed numbers (e.g., -2 1/4 -> -2..1/4)
      return isNegative ? `-${wholePart}..${remainder}/${this.#denominator}` : 
                           `${wholePart}..${remainder}/${this.#denominator}`;
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
}

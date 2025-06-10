/**
 * Fraction.js
 * 
 * A class representing fractions as pairs of BigInt numerator and denominator.
 * Unlike Rational, fractions are not automatically reduced - 1/2 and 2/4 are distinct.
 * This class is useful for applications that need to maintain the exact representation
 * of a fraction rather than its mathematically equivalent reduced form.
 */

import { Rational } from './rational.js';

export class Fraction {
  #numerator;
  #denominator;

  /**
   * Creates a new Fraction.
   * 
   * @param {number|string|bigint} numerator - The numerator, or a string like "3/4"
   * @param {number|bigint|undefined} denominator - The denominator (optional if numerator is a string)
   * @throws {Error} If denominator is zero or if the input format is invalid
   * @example
   * // Create from numerator and denominator
   * const frac1 = new Fraction(1, 2);
   * 
   * // Create from string
   * const frac2 = new Fraction("3/4");
   * 
   * // Create an integer
   * const frac3 = new Fraction(5);
   */
  constructor(numerator, denominator = 1n) {
    // Handle string representation (e.g., "3/4")
    if (typeof numerator === 'string') {
      const parts = numerator.trim().split('/');
      
      if (parts.length === 1) {
        // Just a number like "3"
        this.#numerator = BigInt(parts[0]);
        this.#denominator = BigInt(denominator);
      } else if (parts.length === 2) {
        // Fraction like "3/4"
        this.#numerator = BigInt(parts[0]);
        this.#denominator = BigInt(parts[1]);
      } else {
        throw new Error("Invalid fraction format. Use 'a/b' or 'a'");
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
  }

  /**
   * Gets the numerator of the fraction
   * @returns {bigint} The numerator
   */
  get numerator() {
    return this.#numerator;
  }

  /**
   * Gets the denominator of the fraction
   * @returns {bigint} The denominator
   */
  get denominator() {
    return this.#denominator;
  }

  /**
   * Adds another fraction to this one.
   * Only works if denominators are the same.
   * 
   * @param {Fraction} other - The fraction to add
   * @returns {Fraction} The sum as a new Fraction
   * @throws {Error} If denominators are not equal
   * @example
   * const a = new Fraction(1, 4);
   * const b = new Fraction(2, 4);
   * const sum = a.add(b); // 3/4
   */
  add(other) {
    if (this.#denominator !== other.denominator) {
      throw new Error("Addition only supported for equal denominators");
    }
    
    return new Fraction(this.#numerator + other.numerator, this.#denominator);
  }

  /**
   * Subtracts another fraction from this one.
   * Only works if denominators are the same.
   * 
   * @param {Fraction} other - The fraction to subtract
   * @returns {Fraction} The difference as a new Fraction
   * @throws {Error} If denominators are not equal
   * @example
   * const a = new Fraction(3, 4);
   * const b = new Fraction(1, 4);
   * const diff = a.subtract(b); // 2/4
   */
  subtract(other) {
    if (this.#denominator !== other.denominator) {
      throw new Error("Subtraction only supported for equal denominators");
    }
    
    return new Fraction(this.#numerator - other.numerator, this.#denominator);
  }

  /**
   * Multiplies this fraction by another
   * 
   * @param {Fraction} other - The fraction to multiply by
   * @returns {Fraction} The product as a new Fraction
   * @example
   * const a = new Fraction(1, 2);
   * const b = new Fraction(3, 4);
   * const product = a.multiply(b); // 3/8
   */
  multiply(other) {
    return new Fraction(
      this.#numerator * other.numerator,
      this.#denominator * other.denominator
    );
  }

  /**
   * Divides this fraction by another
   * 
   * @param {Fraction} other - The fraction to divide by
   * @returns {Fraction} The quotient as a new Fraction
   * @throws {Error} If other has a zero numerator
   * @example
   * const a = new Fraction(1, 2);
   * const b = new Fraction(3, 4);
   * const quotient = a.divide(b); // 4/6
   */
  divide(other) {
    if (other.numerator === 0n) {
      throw new Error("Division by zero");
    }
    
    return new Fraction(
      this.#numerator * other.denominator,
      this.#denominator * other.numerator
    );
  }

  /**
   * Raises this fraction to an integer power
   * 
   * @param {number|bigint} exponent - The exponent (must be an integer)
   * @returns {Fraction} The result as a new Fraction
   * @throws {Error} If this fraction is zero and exponent is negative, or if 0^0
   * @example
   * const f = new Fraction(2, 3);
   * const squared = f.pow(2); // 4/9
   * const reciprocal = f.pow(-1); // 3/2
   */
  pow(exponent) {
    const n = BigInt(exponent);
    
    // Handle special cases
    if (n === 0n) {
      if (this.#numerator === 0n) {
        throw new Error("Zero cannot be raised to the power of zero");
      }
      return new Fraction(1, 1);
    }
    
    if (this.#numerator === 0n && n < 0n) {
      throw new Error("Zero cannot be raised to a negative power");
    }
    
    if (n < 0n) {
      // For negative exponents, swap numerator and denominator and compute the absolute value of the power
      return new Fraction(
        this.#denominator ** -n,
        this.#numerator ** -n
      );
    }
    
    return new Fraction(
      this.#numerator ** n,
      this.#denominator ** n
    );
  }

  /**
   * Scales both numerator and denominator by a factor
   * 
   * @param {number|bigint} factor - The scaling factor
   * @returns {Fraction} A new scaled Fraction
   * @example
   * const f = new Fraction(1, 2);
   * const scaled = f.scale(3); // 3/6
   */
  scale(factor) {
    const scaleFactor = BigInt(factor);
    return new Fraction(
      this.#numerator * scaleFactor,
      this.#denominator * scaleFactor
    );
  }

  /**
   * Calculate the greatest common divisor using Euclidean algorithm
   * @private
   * @param {bigint} a - First non-negative number
   * @param {bigint} b - Second non-negative number
   * @returns {bigint} The GCD of a and b
   */
  static #gcd(a, b) {
    // Ensure we're working with non-negative values
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
   * Returns a reduced version of this fraction
   * 
   * @returns {Fraction} A new Fraction in lowest terms
   * @example
   * const f = new Fraction(4, 6);
   * const reduced = f.reduce(); // 2/3
   */
  reduce() {
    // Handle special cases
    if (this.#numerator === 0n) {
      return new Fraction(0, 1);
    }
    
    // Find GCD and reduce
    const gcd = Fraction.#gcd(this.#numerator, this.#denominator);
    
    const reducedNum = this.#numerator / gcd;
    const reducedDen = this.#denominator / gcd;
    
    // Adjust sign if denominator is negative
    if (reducedDen < 0n) {
      return new Fraction(-reducedNum, -reducedDen);
    }
    
    return new Fraction(reducedNum, reducedDen);
  }

  /**
   * Calculates the mediant of two fractions.
   * The mediant of fractions a/b and c/d is (a+c)/(b+d).
   * This operation is useful in continued fraction approximations and the Stern-Brocot tree.
   * 
   * @param {Fraction} a - First fraction
   * @param {Fraction} b - Second fraction
   * @returns {Fraction} The mediant (a.numerator + b.numerator) / (a.denominator + b.denominator)
   * @example
   * const a = new Fraction(1, 2);
   * const b = new Fraction(2, 3);
   * const med = Fraction.mediant(a, b); // 3/5
   */
  static mediant(a, b) {
    return new Fraction(
      a.numerator + b.numerator,
      a.denominator + b.denominator
    );
  }

  /**
   * Converts this Fraction to a Rational.
   * The result will be automatically reduced as per Rational's behavior.
   * 
   * @returns {Rational} Equivalent Rational (automatically reduced)
   * @example
   * const f = new Fraction(4, 6);
   * const r = f.toRational(); // 2/3
   */
  toRational() {
    return new Rational(this.#numerator, this.#denominator);
  }

  /**
   * Creates a Fraction from a Rational
   * 
   * @param {Rational} rational - The rational to convert
   * @returns {Fraction} Equivalent Fraction
   * @example
   * const r = new Rational(2, 3);
   * const f = Fraction.fromRational(r); // 2/3
   */
  static fromRational(rational) {
    return new Fraction(rational.numerator, rational.denominator);
  }

  /**
   * Converts this fraction to a string in the format "numerator/denominator"
   * or just "numerator" if denominator is 1
   * 
   * @returns {string} String representation of this fraction
   * @example
   * new Fraction(3, 4).toString(); // "3/4"
   * new Fraction(5, 1).toString(); // "5"
   */
  toString() {
    if (this.#denominator === 1n) {
      return this.#numerator.toString();
    }
    return `${this.#numerator}/${this.#denominator}`;
  }

  /**
   * Checks if this fraction equals another.
   * Note that this checks for exact equality of numerator and denominator,
   * not mathematical equivalence. For example, 1/2 and 2/4 are not equal.
   * 
   * @param {Fraction} other - The fraction to compare with
   * @returns {boolean} True if the fractions are equal (same numerator and denominator)
   * @example
   * const a = new Fraction(1, 2);
   * const b = new Fraction(1, 2);
   * const c = new Fraction(2, 4);
   * a.equals(b); // true
   * a.equals(c); // false
   */
  equals(other) {
    return this.#numerator === other.numerator && 
           this.#denominator === other.denominator;
  }

  /**
   * Checks if this fraction is less than another.
   * This uses the property that a/b < c/d if and only if ad < bc.
   * 
   * @param {Fraction} other - The fraction to compare with
   * @returns {boolean} True if this fraction is less than the other
   * @example
   * const a = new Fraction(1, 3);
   * const b = new Fraction(1, 2);
   * a.lessThan(b); // true
   */
  lessThan(other) {
    // a/b < c/d if and only if ad < bc
    const leftSide = this.#numerator * other.denominator;
    const rightSide = this.#denominator * other.numerator;
    return leftSide < rightSide;
  }

  /**
   * Checks if this fraction is less than or equal to another.
   * This uses the property that a/b ≤ c/d if and only if ad ≤ bc.
   * 
   * @param {Fraction} other - The fraction to compare with
   * @returns {boolean} True if this fraction is less than or equal to the other
   * @example
   * const a = new Fraction(1, 2);
   * const b = new Fraction(1, 2);
   * a.lessThanOrEqual(b); // true
   */
  lessThanOrEqual(other) {
    // a/b ≤ c/d if and only if ad ≤ bc
    const leftSide = this.#numerator * other.denominator;
    const rightSide = this.#denominator * other.numerator;
    return leftSide <= rightSide;
  }

  /**
   * Checks if this fraction is greater than another.
   * This uses the property that a/b > c/d if and only if ad > bc.
   * 
   * @param {Fraction} other - The fraction to compare with
   * @returns {boolean} True if this fraction is greater than the other
   * @example
   * const a = new Fraction(3, 4);
   * const b = new Fraction(1, 2);
   * a.greaterThan(b); // true
   */
  greaterThan(other) {
    // a/b > c/d if and only if ad > bc
    const leftSide = this.#numerator * other.denominator;
    const rightSide = this.#denominator * other.numerator;
    return leftSide > rightSide;
  }

  /**
   * Checks if this fraction is greater than or equal to another.
   * This uses the property that a/b ≥ c/d if and only if ad ≥ bc.
   * 
   * @param {Fraction} other - The fraction to compare with
   * @returns {boolean} True if this fraction is greater than or equal to the other
   * @example
   * const a = new Fraction(1, 2);
   * const b = new Fraction(1, 2);
   * a.greaterThanOrEqual(b); // true
   */
  greaterThanOrEqual(other) {
    // a/b ≥ c/d if and only if ad ≥ bc
    const leftSide = this.#numerator * other.denominator;
    const rightSide = this.#denominator * other.numerator;
    return leftSide >= rightSide;
  }

  /**
   * Applies E notation to this fraction by multiplying by 10^exponent.
   * This is equivalent to shifting the decimal point by the specified number of places.
   * 
   * @param {number|bigint} exponent - The exponent for the power of 10
   * @returns {Fraction} A new Fraction representing this * 10^exponent
   * @throws {Error} If the exponent is not an integer
   * @example
   * // Basic usage
   * new Fraction(5, 4).E(2)        // 500/4 (5/4 * 10^2)
   * new Fraction(3, 8).E(-1)       // 3/80 (3/8 * 10^-1)
   * new Fraction(123, 100).E(-2)   // 123/10000 (123/100 * 10^-2)
   * 
   * // Equivalent to scientific notation
   * new Fraction(1, 3).E(3)        // 1000/3 (1/3 * 10^3)
   */
  E(exponent) {
    const exp = BigInt(exponent);
    
    // Apply 10^exponent by modifying numerator or denominator
    if (exp >= 0n) {
      // Positive exponent: multiply numerator by 10^exp
      const newNumerator = this.#numerator * (10n ** exp);
      return new Fraction(newNumerator, this.#denominator);
    } else {
      // Negative exponent: multiply denominator by 10^(-exp)
      const newDenominator = this.#denominator * (10n ** (-exp));
      return new Fraction(this.#numerator, newDenominator);
    }
  }
}
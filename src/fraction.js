/**
 * Fraction.js
 * 
 * A class representing fractions as pairs of BigInt numerator and denominator.
 * Unlike Rational, fractions are not automatically reduced - 1/2 and 2/4 are distinct.
 * This class is useful for applications that need to maintain the exact representation
 * of a fraction rather than its mathematically equivalent reduced form.
 */

import { Rational } from './rational.js';
import { toExactBigInt } from './bigint.js';

export class Fraction {
  #numerator;
  #denominator;

  /**
   * Creates a new Fraction.
   * 
   * @param {number|string|bigint} numerator - The numerator, or a string like "3/4"
   * @param {number|string|bigint|undefined} denominator - The denominator (optional if numerator is a string)
   * @param {Object} options - Optional configuration
   * @param {boolean} options.allowInfinite - Allow a nonzero numerator over zero
   * @throws {Error} If the input is 0/0, or has a zero denominator without allowInfinite
   * @example
   * // Create from numerator and denominator
   * const frac1 = new Fraction(1, 2);
   * 
   * // Create from string
   * const frac2 = new Fraction("3/4");
   * 
   * // Create an integer
   * const frac3 = new Fraction(5);
   * 
   * // Create infinite fraction for Stern-Brocot tree
   * const posInf = new Fraction(1, 0, { allowInfinite: true });
   */
  constructor(numerator, denominator = 1n, options = {}) {
    // Handle string representation (e.g., "3/4")
    if (typeof numerator === 'string') {
      const parts = numerator.trim().split('/');
      
      if (parts.length === 1) {
        // Just a number like "3"
        this.#numerator = BigInt(parts[0]);
        this.#denominator = toExactBigInt(denominator, 'Fraction denominator');
      } else if (parts.length === 2) {
        // Fraction like "3/4"
        this.#numerator = BigInt(parts[0]);
        this.#denominator = BigInt(parts[1]);
      } else {
        throw new Error("Invalid fraction format. Use 'a/b' or 'a'");
      }
    } else {
      // Handle numeric inputs
      this.#numerator = toExactBigInt(numerator, 'Fraction numerator');
      this.#denominator = toExactBigInt(denominator, 'Fraction denominator');
    }

    // Zero denominators represent signed infinity only when explicitly
    // enabled. 0/0 is never a valid Fraction.
    if (this.#denominator === 0n) {
      if (this.#numerator === 0n) {
        throw new Error("The indeterminate fraction 0/0 is not allowed");
      }
      if (options.allowInfinite) {
        this._isInfinite = true;
      } else {
        throw new Error(
          "Denominator cannot be zero unless allowInfinite is true",
        );
      }
    } else {
      this._isInfinite = false;
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
   * Checks if this fraction represents infinity
   * @returns {boolean} True if this is a nonzero fraction over zero
   */
  get isInfinite() {
    return this._isInfinite || false;
  }

  /**
   * Constructs a result while preserving nonzero zero-denominator forms.
   * The constructor still rejects an indeterminate 0/0 result.
   * @private
   */
  static #fromComponents(numerator, denominator) {
    return new Fraction(numerator, denominator, {
      allowInfinite: denominator === 0n,
    });
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
    
    return Fraction.#fromComponents(
      this.#numerator + other.numerator,
      this.#denominator,
    );
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
    
    return Fraction.#fromComponents(
      this.#numerator - other.numerator,
      this.#denominator,
    );
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
    return Fraction.#fromComponents(
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
    
    return Fraction.#fromComponents(
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
      return Fraction.#fromComponents(
        this.#denominator ** -n,
        this.#numerator ** -n
      );
    }
    
    return Fraction.#fromComponents(
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
    const scaleFactor = toExactBigInt(factor, "Fraction scale factor");
    return Fraction.#fromComponents(
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
   * Compares the mathematical values of two fractions, including signed
   * infinities and finite fractions with negative denominators.
   * @private
   */
  static #compareValues(left, right) {
    if (left.isInfinite && right.isInfinite) {
      const leftSign = left.numerator < 0n ? -1 : 1;
      const rightSign = right.numerator < 0n ? -1 : 1;
      return leftSign < rightSign ? -1 : leftSign > rightSign ? 1 : 0;
    }

    if (left.isInfinite) {
      return left.numerator < 0n ? -1 : 1;
    }

    if (right.isInfinite) {
      return right.numerator < 0n ? 1 : -1;
    }

    let leftNumerator = left.numerator;
    let leftDenominator = left.denominator;
    let rightNumerator = right.numerator;
    let rightDenominator = right.denominator;

    if (leftDenominator < 0n) {
      leftNumerator = -leftNumerator;
      leftDenominator = -leftDenominator;
    }
    if (rightDenominator < 0n) {
      rightNumerator = -rightNumerator;
      rightDenominator = -rightDenominator;
    }

    const leftProduct = leftNumerator * rightDenominator;
    const rightProduct = rightNumerator * leftDenominator;
    return leftProduct < rightProduct ? -1 : leftProduct > rightProduct ? 1 : 0;
  }

  /**
   * Returns the multiplicative inverse of value modulo modulus.
   * The caller must supply coprime inputs and modulus > 1.
   * @private
   */
  static #modInverse(value, modulus) {
    let oldR = ((value % modulus) + modulus) % modulus;
    let r = modulus;
    let oldS = 1n;
    let s = 0n;

    while (r !== 0n) {
      const quotient = oldR / r;
      [oldR, r] = [r, oldR - quotient * r];
      [oldS, s] = [s, oldS - quotient * s];
    }

    if (oldR !== 1n) {
      throw new Error("A modular inverse does not exist");
    }

    return ((oldS % modulus) + modulus) % modulus;
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
    if (this.isInfinite) {
      return new Fraction(this.#numerator < 0n ? -1n : 1n, 0n, {
        allowInfinite: true,
      });
    }

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
    
    return Fraction.#fromComponents(reducedNum, reducedDen);
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
    return a.mediant(b);
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
    if (this.isInfinite) {
      throw new Error("Cannot convert an infinite Fraction to Rational");
    }
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
    return Fraction.#compareValues(this, other) < 0;
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
    return Fraction.#compareValues(this, other) <= 0;
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
    return Fraction.#compareValues(this, other) > 0;
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
    return Fraction.#compareValues(this, other) >= 0;
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
      return Fraction.#fromComponents(newNumerator, this.#denominator);
    } else {
      // Negative exponent: multiply denominator by 10^(-exp)
      const newDenominator = this.#denominator * (10n ** (-exp));
      return Fraction.#fromComponents(this.#numerator, newDenominator);
    }
  }

  toJSON() {
    return {
      $ratmath: "Fraction",
      numerator: this.#numerator.toString(),
      denominator: this.#denominator.toString(),
    };
  }

  // ===== FAREY SEQUENCE AND MEDIANT OPERATIONS =====

  /**
   * Computes the mediant of this fraction and another fraction.
   * The mediant of a/b and c/d is (a+c)/(b+d).
   * Special handling for infinite fractions in Stern-Brocot tree context.
   * 
   * @param {Fraction} other - The other fraction
   * @returns {Fraction} The mediant fraction
   * @example
   * const a = new Fraction(1, 3);
   * const b = new Fraction(1, 2);
   * const mediant = a.mediant(b); // 2/5
   */
  mediant(other) {
    // Handle infinite fractions for Stern-Brocot tree
    if (this.isInfinite && other.isInfinite) {
      // Special case: mediant of -1/0 and 1/0 is 0/1
      if (this.#numerator === -1n && other.numerator === 1n) {
        return new Fraction(0n, 1n);
      } else if (this.#numerator === 1n && other.numerator === -1n) {
        return new Fraction(0n, 1n);
      }
      throw new Error("Cannot compute mediant of two infinite fractions");
    }
    
    if (this.isInfinite || other.isInfinite) {
      // One is infinite, other is finite - standard mediant calculation
      const newNum = this.#numerator + other.numerator;
      const newDen = this.#denominator + other.denominator;
      
      // Check if result would be 0/0 and handle it
      if (newNum === 0n && newDen === 0n) {
        throw new Error("Mediant would result in 0/0");
      }
      
      return Fraction.#fromComponents(newNum, newDen);
    }
    
    // Both are finite - standard mediant
    const newNum = this.#numerator + other.numerator;
    const newDen = this.#denominator + other.denominator;
    return Fraction.#fromComponents(newNum, newDen);
  }

  /**
   * Finds canonical generalized Farey parents of this fraction.
   * For a reduced fraction, the result is its usual Farey-neighbor pair.
   * For an unreduced fraction with component gcd g, the reduced parents are
   * lifted with balanced denominators so their component mediant is the
   * normalized input representation and their determinant has magnitude g.
   * 
   * This extends the Farey sequence concept beyond [0,1] to all rationals.
   * Reduced integers have one infinite parent. Unreduced integers generally
   * have two finite lifted parents.
   * 
   * A negative input denominator is sign-normalized before constructing the
   * parents, so their mediant has a positive denominator.
   *
   * @returns {{left: Fraction, right: Fraction}} The Farey parent fractions
   * @example
   * const frac = new Fraction(3, 5);
   * const parents = frac.fareyParents();
   * // Returns fractions that are Farey neighbors with 3/5 as their mediant
   */
  fareyParents() {
    if (this.isInfinite) {
      throw new Error("Cannot find Farey parents of infinite fraction");
    }

    // Farey ordering uses positive denominators. Preserve the scale while
    // normalizing the sign, so 6/-10 is treated as -6/10.
    const normalizedNumerator =
      this.#denominator < 0n ? -this.#numerator : this.#numerator;
    const normalizedDenominator =
      this.#denominator < 0n ? -this.#denominator : this.#denominator;
    const scale = Fraction.#gcd(
      normalizedNumerator,
      normalizedDenominator,
    );
    const reducedNumerator = normalizedNumerator / scale;
    const reducedDenominator = normalizedDenominator / scale;

    // The canonical parents of zero are the two Stern-Brocot boundaries.
    // For a scaled zero, use the closest balanced finite lift instead.
    if (reducedNumerator === 0n) {
      if (scale === 1n) {
        return {
          left: new Fraction(-1n, 0n, { allowInfinite: true }),
          right: new Fraction(1n, 0n, { allowInfinite: true }),
        };
      }

      const leftDenominator = scale / 2n;
      return {
        left: new Fraction(-1n, leftDenominator),
        right: new Fraction(1n, scale - leftDenominator),
      };
    }

    let leftNumerator;
    let leftDenominator;
    let rightNumerator;
    let rightDenominator;

    if (reducedDenominator === 1n) {
      if (reducedNumerator > 0n) {
        leftNumerator = reducedNumerator - 1n;
        leftDenominator = 1n;
        rightNumerator = 1n;
        rightDenominator = 0n;
      } else {
        leftNumerator = -1n;
        leftDenominator = 0n;
        rightNumerator = reducedNumerator + 1n;
        rightDenominator = 1n;
      }
    } else {
      leftDenominator = Fraction.#modInverse(
        reducedNumerator,
        reducedDenominator,
      );
      leftNumerator =
        (reducedNumerator * leftDenominator - 1n) /
        reducedDenominator;
      rightNumerator = reducedNumerator - leftNumerator;
      rightDenominator = reducedDenominator - leftDenominator;
    }

    // Adding a copy of the reduced target to either parent preserves its
    // value-side and increases the outer determinant magnitude by one.
    // Choose k so the two resulting denominators are as balanced as possible;
    // this maximizes the smaller denominator and keeps both parents close.
    let leftCopies =
      (scale * reducedDenominator -
        2n * leftDenominator +
        reducedDenominator) /
      (2n * reducedDenominator);
    if (leftCopies < 0n) {
      leftCopies = 0n;
    } else if (leftCopies > scale - 1n) {
      leftCopies = scale - 1n;
    }
    const rightCopies = scale - 1n - leftCopies;

    return {
      left: Fraction.#fromComponents(
        leftNumerator + leftCopies * reducedNumerator,
        leftDenominator + leftCopies * reducedDenominator,
      ),
      right: Fraction.#fromComponents(
        rightNumerator + rightCopies * reducedNumerator,
        rightDenominator + rightCopies * reducedDenominator,
      ),
    };
  }

  /**
   * Given one endpoint and a mediant, computes the other endpoint.
   * Solves the mediant equation: mediant = (endpoint + other) / (endpoint_den + other_den)
   * 
   * @param {Fraction} endpoint - One known endpoint
   * @param {Fraction} mediant - The mediant fraction
   * @returns {Fraction} The other endpoint
   * @example
   * const endpoint = new Fraction(1, 2);
   * const mediant = new Fraction(2, 3);
   * const other = Fraction.mediantPartner(endpoint, mediant); // 1/1
   */
  static mediantPartner(endpoint, mediant) {
    return Fraction.#fromComponents(
      mediant.numerator - endpoint.numerator,
      mediant.denominator - endpoint.denominator,
    );
  }

  /**
   * Verifies that a given fraction is the mediant of two other fractions.
   * 
   * @param {Fraction} left - The left fraction
   * @param {Fraction} mediant - The proposed mediant
   * @param {Fraction} right - The right fraction
   * @returns {boolean} True if mediant = (left + right) / (left_den + right_den)
   * @example
   * const left = new Fraction(1, 3);
   * const right = new Fraction(1, 2);
   * const mediant = new Fraction(2, 5);
   * Fraction.isMediantTriple(left, mediant, right); // true
   */
  static isMediantTriple(left, mediant, right) {
    // Don't allow mediant itself to be infinite
    if (mediant.isInfinite) {
      return false;
    }
    
    try {
      const computedMediant = left.mediant(right);
      return mediant.equals(computedMediant);
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifies that three fractions form a valid Farey triple.
   * For a middle fraction with component gcd g, this checks both the exact
   * mediant condition and the generalized adjacency condition |ad - bc| = g.
   * 
   * @param {Fraction} left - The left fraction  
   * @param {Fraction} mediant - The middle fraction
   * @param {Fraction} right - The right fraction
   * @returns {boolean} True if they form a valid Farey triple
   * @example
   * const left = new Fraction(1, 3);
   * const mediant = new Fraction(2, 5);
   * const right = new Fraction(1, 2);
   * Fraction.isFareyTriple(left, mediant, right); // true
   */
  static isFareyTriple(left, mediant, right) {
    // First check if it's a valid mediant triple
    if (!Fraction.isMediantTriple(left, mediant, right)) {
      return false;
    }

    // The reduced zero root is the sole exceptional pair: its two boundary
    // parents both have denominator zero, so their determinant is zero.
    if (
      mediant.numerator === 0n &&
      mediant.denominator === 1n &&
      left.denominator === 0n &&
      right.denominator === 0n
    ) {
      return (
        left.numerator === -1n &&
        right.numerator === 1n
      ) || (
        left.numerator === 1n &&
        right.numerator === -1n
      );
    }

    const determinant =
      left.numerator * right.denominator -
      left.denominator * right.numerator;
    const magnitude = determinant < 0n ? -determinant : determinant;
    return magnitude === Fraction.#gcd(
      mediant.numerator,
      mediant.denominator,
    );
  }

  // ===== STERN-BROCOT TREE SUPPORT =====

  /**
   * Finds the parent of this fraction in the Stern-Brocot tree.
   * The parent is found by removing the last step in the tree path.
   * 
   * @returns {Fraction} The parent fraction in the Stern-Brocot tree
   * @example
   * const frac = new Fraction(3, 5);
   * const parent = frac.sternBrocotParent(); // Returns the parent in the tree
   */
  sternBrocotParent() {
    if (this.isInfinite) {
      throw new Error("Infinite fractions don't have parents in Stern-Brocot tree");
    }

    // The root 0/1 has no parent
    if (this.numerator === 0n && this.denominator === 1n) {
      return null;
    }

    // Get the path from root to this fraction
    const path = this.sternBrocotPath();
    
    if (path.length === 0) {
      return null; // Root has no parent
    }

    // Remove the last step and reconstruct the parent
    const parentPath = path.slice(0, -1);
    return Fraction.fromSternBrocotPath(parentPath);
  }

  /**
   * Finds the left and right children of this fraction in the Stern-Brocot tree.
   * 
   * @returns {{left: Fraction, right: Fraction}} The left and right child fractions
   * @example
   * const root = new Fraction(1, 1);
   * const children = root.sternBrocotChildren(); // {left: 1/2, right: 2/1}
   */
  sternBrocotChildren() {
    if (this.isInfinite) {
      throw new Error("Infinite fractions don't have children in Stern-Brocot tree");
    }

    // Get current path and append L and R for children
    const currentPath = this.sternBrocotPath();
    
    const leftPath = [...currentPath, 'L'];
    const rightPath = [...currentPath, 'R'];
    
    return {
      left: Fraction.fromSternBrocotPath(leftPath),
      right: Fraction.fromSternBrocotPath(rightPath)
    };
  }

  /**
   * Generates the Stern-Brocot tree path from root (0/1) to this fraction.
   * Returns an array of 'L' and 'R' directions.
   * 
   * @returns {Array<string>} Array of 'L'/'R' directions from root
   * @example
   * const frac = new Fraction(3, 5);
   * const path = frac.sternBrocotPath(); // ['R', 'R', 'L', 'L', 'R'] or similar
   */
  sternBrocotPath() {
    if (this.isInfinite) {
      throw new Error("Infinite fractions don't have tree paths");
    }

    // Ensure we're working with the reduced form
    const reduced = this.reduce();

    // Special case for root 0/1
    if (reduced.numerator === 0n && reduced.denominator === 1n) {
      return [];
    }

    // Start with tree boundaries: -1/0 (left) and 1/0 (right) and root 0/1
    let left = new Fraction(-1, 0, { allowInfinite: true });
    let right = new Fraction(1, 0, { allowInfinite: true });
    let current = new Fraction(0, 1); // Root
    
    const path = [];
    
    // Navigate down the tree until we reach the target fraction
    while (!current.equals(reduced)) {
      if (reduced.lessThan(current)) {
        // Go left: new right boundary becomes current
        path.push('L');
        right = current;
        current = left.mediant(current);
      } else {
        // Go right: new left boundary becomes current  
        path.push('R');
        left = current;
        current = current.mediant(right);
      }
      
      // Safety check to prevent infinite loops (increased limit for very long paths)
      if (path.length > 500) {
        throw new Error("Stern-Brocot path too long - this may indicate a bug in the algorithm");
      }
    }
    
    return path;
  }

  /**
   * Constructs a fraction from a Stern-Brocot tree path.
   * 
   * @param {Array<string>} path - Array of 'L'/'R' directions
   * @returns {Fraction} The fraction at the end of the path
   * @example
   * const frac = Fraction.fromSternBrocotPath(['R', 'R']); // 2/1
   */
  static fromSternBrocotPath(path) {
    // Start at root 0/1 with tree boundaries -1/0 and 1/0
    let left = new Fraction(-1, 0, { allowInfinite: true });
    let right = new Fraction(1, 0, { allowInfinite: true });
    let current = new Fraction(0, 1); // Root
    
    // Follow the path
    for (const direction of path) {
      if (direction === 'L') {
        // Go left: new right boundary becomes current
        right = current;
        current = left.mediant(current);
      } else if (direction === 'R') {
        // Go right: new left boundary becomes current
        left = current;
        current = current.mediant(right);
      } else {
        throw new Error(`Invalid direction in path: ${direction}`);
      }
    }
    
    return current;
  }

  /**
   * Validates that this fraction exists in its canonical position in the Stern-Brocot tree.
   * 
   * @returns {boolean} True if the fraction is in canonical tree position
   */
  isSternBrocotValid() {
    if (this.isInfinite) {
      return this.numerator === 1n || this.numerator === -1n;
    }

    try {
      // Try to generate path and reconstruct - should get back the same fraction
      const path = this.sternBrocotPath();
      const reconstructed = Fraction.fromSternBrocotPath(path);
      return this.equals(reconstructed);
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculates the depth/level of this fraction in the Stern-Brocot tree.
   * 
   * @returns {number} The depth (root is at depth 0)
   */
  sternBrocotDepth() {
    if (this.isInfinite) {
      return Infinity;
    }
    
    if (this.numerator === 0n && this.denominator === 1n) {
      return 0; // Root
    }
    
    return this.sternBrocotPath().length;
  }

  /**
   * Returns array of all ancestors of this fraction up to the root.
   * 
   * @returns {Array<Fraction>} Array of ancestor fractions, ending with root (0/1)
   */
  sternBrocotAncestors() {
    if (this.isInfinite) {
      return [];
    }

    const ancestors = [];
    const path = this.sternBrocotPath();
    
    // Build ancestors by following partial paths from root to immediate parent
    for (let i = 0; i < path.length; i++) {
      const partialPath = path.slice(0, i);
      ancestors.push(Fraction.fromSternBrocotPath(partialPath));
    }
    
    // Reverse so that root (0/1) comes last
    ancestors.reverse();
    
    return ancestors;
  }
}

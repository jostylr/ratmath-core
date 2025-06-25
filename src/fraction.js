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
   * @param {Object} options - Optional configuration
   * @param {boolean} options.allowInfinite - Allow infinite fractions (±1/0) for Stern-Brocot tree
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
      // Allow infinite fractions only for ±1/0 in Stern-Brocot tree context
      if (options.allowInfinite && (this.#numerator === 1n || this.#numerator === -1n)) {
        // Valid infinite fraction for Stern-Brocot tree boundaries
        this._isInfinite = true;
      } else {
        throw new Error("Denominator cannot be zero");
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
   * @returns {boolean} True if this is an infinite fraction (±1/0)
   */
  get isInfinite() {
    return this._isInfinite || false;
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
      throw new Error("Cannot compute mediant of two infinite fractions");
    }
    
    if (this.isInfinite) {
      // this is infinite, other is finite
      // Mediant with positive infinity gives the finite fraction
      if (this.#numerator > 0n) {
        return new Fraction(other.numerator + 1n, other.denominator);
      } else {
        return new Fraction(other.numerator - 1n, other.denominator);
      }
    }
    
    if (other.isInfinite) {
      // other is infinite, this is finite
      if (other.numerator > 0n) {
        return new Fraction(this.#numerator + 1n, this.#denominator);
      } else {
        return new Fraction(this.#numerator - 1n, this.#denominator);
      }
    }
    
    // Both are finite - standard mediant
    const newNum = this.#numerator + other.numerator;
    const newDen = this.#denominator + other.denominator;
    return new Fraction(newNum, newDen);
  }

  /**
   * Finds the Farey parents (neighbors) of this fraction.
   * Returns the unique pair [a/b, c/d] where this fraction is their mediant
   * and |ad - bc| = 1 (Farey adjacency condition).
   * 
   * This extends the Farey sequence concept beyond [0,1] to all rationals.
   * For integers, one parent will be an infinite fraction.
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

    // Handle simple cases
    if (this.#numerator === 0n) {
      // 0/1 has special Farey parents involving infinity
      const left = new Fraction(-1n, 1n);
      const right = new Fraction(1n, 1n);
      return { left, right };
    }
    
    if (this.#numerator === this.#denominator) {
      // 1/1 has parents 0/1 and 1/0 (infinity)
      const left = new Fraction(0n, 1n);
      const right = new Fraction(1n, 0n, { allowInfinite: true });
      return { left, right };
    }

    // Use Stern-Brocot tree approach to find the actual Farey neighbors
    // Navigate the tree until we find this fraction, tracking the boundaries
    let leftBound = new Fraction(0n, 1n);
    let rightBound = new Fraction(1n, 0n, { allowInfinite: true });
    let current = new Fraction(1n, 1n);
    
    // Navigate to find the fraction
    while (!current.equals(this)) {
      if (this.lessThan(current)) {
        // Go left
        rightBound = current;
        current = leftBound.mediant(current);
      } else {
        // Go right  
        leftBound = current;
        current = current.mediant(rightBound);
      }
    }
    
    // At this point, leftBound and rightBound are the Farey parents
    return { left: leftBound, right: rightBound };
  }

  /**
   * Extended Euclidean Algorithm helper
   * @private
   */
  _extendedGcd(a, b) {
    if (b === 0n) {
      return { gcd: a, x: 1n, y: 0n };
    }
    
    const result = this._extendedGcd(b, a % b);
    const x = result.y;
    const y = result.x - (a / b) * result.y;
    
    return { gcd: result.gcd, x, y };
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
    if (endpoint.isInfinite || mediant.isInfinite) {
      throw new Error("Cannot compute mediant partner with infinite fractions");
    }

    // Given: endpoint = p/q, mediant = a/b
    // Need to find: other = r/s such that (p+r)/(q+s) = a/b
    // This gives us: b(p+r) = a(q+s)
    // Expanding: bp + br = aq + as
    // Solving for r/s: br = aq + as - bp = a(q+s) - bp
    //                  r = (aq + as - bp)/b = a(q+s)/b - p
    // Similarly: s can be found from the constraint

    const p = endpoint.numerator;
    const q = endpoint.denominator;
    const a = mediant.numerator;
    const b = mediant.denominator;

    // From mediant equation: (p+r)/(q+s) = a/b
    // Cross multiply: b(p+r) = a(q+s)
    // Expand: bp + br = aq + as
    // Rearrange: br - as = aq - bp
    // We need another constraint. Use the fact that we want integer solutions.
    
    // Let's use a different approach: if mediant = (p+r)/(q+s) = a/b
    // Then: p+r = a*(q+s)/b and q+s must be chosen so this gives integer r
    
    // Try the simplest case where the mediant is the actual mediant
    // This means a*(q+s) = b*(p+r), and we can solve for r,s
    
    // From the mediant property, if we know p/q and want (p+r)/(q+s) = a/b:
    // Cross multiply: b(p+r) = a(q+s)
    // Let's assume s = 1 for simplicity and solve for r:
    // b(p+r) = a(q+1)
    // bp + br = aq + a
    // br = aq + a - bp
    // r = (aq + a - bp)/b = a(q+1)/b - p
    
    // For this to be an integer, we need a(q+1) to be divisible by b
    // Let's try a more systematic approach using continued fractions theory
    
    // Simple case: assume the other endpoint has denominator 1
    const s = 1n;
    const numerator = a * (q + s) - b * p;
    
    if (numerator % b !== 0n) {
      // Try a different approach - use the fact that for Farey sequence,
      // if a/b is mediant of p/q and r/s, then r = a*2 - p, s = b*2 - q
      const r = a * 2n - p;
      const s_calculated = b * 2n - q;
      return new Fraction(r, s_calculated);
    }
    
    const r = numerator / b;
    return new Fraction(r, s);
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
    
    // Handle cases with infinite endpoints
    if (left.isInfinite && right.isInfinite) {
      return false; // Can't have mediant of two infinities
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
   * This checks both the mediant condition and the Farey adjacency condition |ad - bc| = 1.
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

    // Check Farey adjacency between left and right: |ad - bc| = 1
    if (!left.isInfinite && !right.isInfinite) {
      const a = left.numerator;
      const b = left.denominator;
      const c = right.numerator;
      const d = right.denominator;
      
      const determinant = a * d - b * c;
      return determinant === 1n || determinant === -1n;
    }

    // Handle infinite fractions - they are automatically adjacent in Farey sense
    return left.isInfinite || right.isInfinite;
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

    // The root 1/1 has no parent
    if (this.numerator === 1n && this.denominator === 1n) {
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
   * Generates the Stern-Brocot tree path from root (1/1) to this fraction.
   * Returns an array of 'L' and 'R' directions.
   * 
   * @returns {Array<string>} Array of 'L'/'R' directions from root
   * @example
   * const frac = new Fraction(3, 5);
   * const path = frac.sternBrocotPath(); // ['L', 'R', 'L'] or similar
   */
  sternBrocotPath() {
    if (this.isInfinite) {
      throw new Error("Infinite fractions don't have tree paths");
    }

    // Ensure we're working with the reduced form
    const reduced = this.reduce();

    // Start with tree boundaries: 0/1 (left) and 1/0 (right)
    let left = new Fraction(0, 1);
    let right = new Fraction(1, 0, { allowInfinite: true });
    let current = new Fraction(1, 1); // Root
    
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
   * const frac = Fraction.fromSternBrocotPath(['L', 'R']); // Some fraction
   */
  static fromSternBrocotPath(path) {
    // Start at root with tree boundaries
    let left = new Fraction(0, 1);
    let right = new Fraction(1, 0, { allowInfinite: true });
    let current = new Fraction(1, 1); // Root
    
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
    
    if (this.numerator === 1n && this.denominator === 1n) {
      return 0; // Root
    }
    
    return this.sternBrocotPath().length;
  }

  /**
   * Returns array of all ancestors of this fraction up to the root.
   * 
   * @returns {Array<Fraction>} Array of ancestor fractions, ending with root (1/1)
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
    
    // Reverse so that root (1/1) comes last as expected by tests
    ancestors.reverse();
    
    return ancestors;
  }
}
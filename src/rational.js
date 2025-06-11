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
    // Handle Integer object inputs
    if (numerator && typeof numerator === 'object' && numerator.constructor.name === 'Integer') {
      this.#numerator = numerator.value;
      this.#denominator = 1n;
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
        // Check if it's a decimal string like "1.23"
        if (numerator.includes('.')) {
          const decimalParts = numerator.trim().split('.');
          if (decimalParts.length === 2) {
            const integerPart = decimalParts[0] || '0';
            const fractionalPart = decimalParts[1];
            
            // Validate parts contain only digits (and optional minus for integer part)
            if (!/^-?\d*$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
              throw new Error('Invalid decimal format');
            }
            
            // Convert decimal to fraction
            const wholePart = BigInt(integerPart);
            const fractionalValue = BigInt(fractionalPart);
            const denomValue = 10n ** BigInt(fractionalPart.length);
            
            // Combine: wholePart + fractionalPart/denomValue
            this.#numerator = wholePart * denomValue + (wholePart < 0n ? -fractionalValue : fractionalValue);
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
            this.#denominator = BigInt(denominator);
          } else if (parts.length === 2) {
            // Fraction like "3/4"
            this.#numerator = BigInt(parts[0]);
            this.#denominator = BigInt(parts[1]);
          } else {
            throw new Error("Invalid rational format. Use 'a/b', 'a', or 'a..b/c'");
          }
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
   * Adds another number to this rational with automatic type promotion
   * @param {Integer|Rational|RationalInterval} other - The number to add
   * @returns {Rational|RationalInterval} The sum with appropriate type
   */
  add(other) {
    // Handle Integer type by importing it dynamically to avoid circular imports
    if (other.constructor.name === 'Integer') {
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
    } else if (other.low && other.high && typeof other.low.equals === 'function') {
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
    if (other.constructor.name === 'Integer') {
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
    } else if (other.low && other.high && typeof other.low.equals === 'function') {
      // This looks like a RationalInterval - promote this rational to interval and subtract
      const IntervalClass = other.constructor;
      const newThisAsInterval = new IntervalClass(this, this);
      return newThisAsInterval.subtract(other);
    } else {
      throw new Error(`Cannot subtract ${other.constructor.name} from Rational`);
    }
  }

  /**
   * Multiplies this rational by another number with automatic type promotion
   * @param {Integer|Rational|RationalInterval} other - The number to multiply by
   * @returns {Rational|RationalInterval} The product with appropriate type
   */
  multiply(other) {
    // Handle Integer type by checking constructor name to avoid circular imports
    if (other.constructor.name === 'Integer') {
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
    } else if (other.low && other.high && typeof other.low.equals === 'function') {
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
    if (other.constructor.name === 'Integer') {
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
    } else if (other.low && other.high && typeof other.low.equals === 'function') {
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
   * Converts this rational to its repeating decimal string representation
   * @returns {string} Repeating decimal string (e.g., "1/3" becomes "0.#3")
   */
  toRepeatingDecimal() {
    // Handle special cases
    if (this.#numerator === 0n) {
      return '0';
    }

    // Handle negative numbers
    const isNegative = this.#numerator < 0n;
    const num = isNegative ? -this.#numerator : this.#numerator;
    const den = this.#denominator;

    // Get integer part
    const integerPart = num / den;
    let remainder = num % den;

    // If no remainder, it's a terminating decimal
    if (remainder === 0n) {
      return (isNegative ? '-' : '') + integerPart.toString();
    }

    // Perform long division to find the repeating pattern
    const seenRemainders = new Map();
    const digits = [];
    let position = 0;

    while (remainder !== 0n && !seenRemainders.has(remainder.toString())) {
      seenRemainders.set(remainder.toString(), position);
      remainder *= 10n;
      const digit = remainder / den;
      digits.push(digit.toString());
      remainder = remainder % den;
      position++;
    }

    let result = (isNegative ? '-' : '') + integerPart.toString();

    if (remainder === 0n) {
      // Terminating decimal
      if (digits.length > 0) {
        result += '.' + digits.join('') + '#0';
      } else {
        result += '#0';
      }
    } else {
      // Repeating decimal
      const repeatStart = seenRemainders.get(remainder.toString());
      const nonRepeatingPart = digits.slice(0, repeatStart);
      const repeatingPart = digits.slice(repeatStart);

      if (nonRepeatingPart.length > 0) {
        result += '.' + nonRepeatingPart.join('') + '#' + repeatingPart.join('');
      } else {
        result += '.#' + repeatingPart.join('');
      }
    }

    return result;
  }

  /**
   * Converts this rational to a repeating decimal string with period information
   * @returns {object} Object with decimal string and period info: {decimal: string, period: number}
   */
  toRepeatingDecimalWithPeriod() {
    // Handle special cases
    if (this.#numerator === 0n) {
      return { decimal: '0', period: 0 };
    }

    // Handle negative numbers
    const isNegative = this.#numerator < 0n;
    const num = isNegative ? -this.#numerator : this.#numerator;
    const den = this.#denominator;

    // Get integer part
    const integerPart = num / den;
    let remainder = num % den;

    // If no remainder, it's a terminating decimal
    if (remainder === 0n) {
      return { 
        decimal: (isNegative ? '-' : '') + integerPart.toString(),
        period: 0
      };
    }

    // Perform long division to find the repeating pattern
    const seenRemainders = new Map();
    const digits = [];
    let position = 0;

    while (remainder !== 0n && !seenRemainders.has(remainder.toString())) {
      seenRemainders.set(remainder.toString(), position);
      remainder *= 10n;
      const digit = remainder / den;
      digits.push(digit.toString());
      remainder = remainder % den;
      position++;
    }

    let result = (isNegative ? '-' : '') + integerPart.toString();

    if (remainder === 0n) {
      // Terminating decimal
      if (digits.length > 0) {
        result += '.' + digits.join('') + '#0';
      } else {
        result += '#0';
      }
      return { decimal: result, period: 0 };
    } else {
      // Repeating decimal
      const repeatStart = seenRemainders.get(remainder.toString());
      const nonRepeatingPart = digits.slice(0, repeatStart);
      const repeatingPart = digits.slice(repeatStart);

      if (nonRepeatingPart.length > 0) {
        result += '.' + nonRepeatingPart.join('') + '#' + repeatingPart.join('');
      } else {
        result += '.#' + repeatingPart.join('');
      }
      
      return { 
        decimal: result, 
        period: repeatingPart.length 
      };
    }
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
      return '0';
    }

    const isNegative = this.#numerator < 0n;
    const num = isNegative ? -this.#numerator : this.#numerator;
    const den = this.#denominator;

    // Get integer part
    const integerPart = num / den;
    let remainder = num % den;

    // If no remainder, it's a whole number
    if (remainder === 0n) {
      return (isNegative ? '-' : '') + integerPart.toString();
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

    let result = (isNegative ? '-' : '') + integerPart.toString();
    if (digits.length > 0) {
      result += '.' + digits.join('');
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
      powerOf10 = new Rational(1n, 10n ** (-exp));
    }
    
    return this.multiply(powerOf10);
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

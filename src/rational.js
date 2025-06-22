/**
 * Rational.js
 *
 * A class for exact rational number arithmetic using BigInt.
 * Represents a rational number as a fraction with numerator and denominator in lowest terms.
 */

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
  static DEFAULT_PERIOD_DIGITS = 20;
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
   * @param {number|string|bigint} numerator - The numerator, or a string like "3/4"
   * @param {number|bigint|undefined} denominator - The denominator (optional if numerator is a string)
   * @throws {Error} If denominator is zero or if the input format is invalid
   */
  constructor(numerator, denominator = 1n) {
    // Handle Integer object inputs
    if (
      numerator &&
      typeof numerator === "object" &&
      numerator.constructor.name === "Integer"
    ) {
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
            const wholePart = BigInt(integerPart);
            const fractionalValue = BigInt(fractionalPart);
            const denomValue = 10n ** BigInt(fractionalPart.length);

            // Combine: wholePart + fractionalPart/denomValue
            this.#numerator =
              wholePart * denomValue +
              (wholePart < 0n ? -fractionalValue : fractionalValue);
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
            throw new Error(
              "Invalid rational format. Use 'a/b', 'a', or 'a..b/c'",
            );
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
   * @returns {string} Repeating decimal string (e.g., "1/3" becomes "0.#3")
   */
  toRepeatingDecimal() {
    // Use the new efficient method
    const result = this.toRepeatingDecimalWithPeriod();
    return result.decimal;
  }

  /**
   * Converts this rational to a repeating decimal string with period information
   * @param {boolean} useRepeatNotation - Whether to use {0~15} notation for leading zeros (default: false)
   * @returns {object} Object with decimal string and period info: {decimal: string, period: number}
   */
  toRepeatingDecimalWithPeriod(useRepeatNotation = true) {
    // Handle special cases
    if (this.#numerator === 0n) {
      return { decimal: "0", period: 0 };
    }

    // Ensure whole part and decimal metadata are computed
    this.#computeWholePart();
    // When using compact notation, compute more digits to find significant digits
    const maxDigits = useRepeatNotation ? 100 : Rational.DEFAULT_PERIOD_DIGITS;
    this.#computeDecimalMetadata(maxDigits);

    let result = (this.#isNegative ? "-" : "") + this.#wholePart.toString();

    if (this.#isTerminating) {
      // Terminating decimal
      if (this.#initialSegment) {
        const formattedInitial = useRepeatNotation
          ? Rational.#formatRepeatedDigits(this.#initialSegment, 4) // Lower threshold for initial segment
          : this.#initialSegment;
        result += "." + formattedInitial + "#0";
      } else {
        // For pure integers, don't add #0
      }
      return { decimal: result, period: 0 };
    } else {
      // Repeating decimal - use full period if possible for exact roundtrip
      let periodDigits = this.#periodDigits;

      // If period is reasonable size and we only have partial digits, compute full period
      if (
        this.#periodLength > 0 &&
        this.#periodLength <= Rational.MAX_PERIOD_DIGITS &&
        this.#periodDigits.length < this.#periodLength
      ) {
        periodDigits = this.extractPeriodSegment(
          this.#initialSegment,
          this.#periodLength,
          this.#periodLength,
        );
      }

      const formattedInitial = useRepeatNotation
        ? Rational.#formatRepeatedDigits(this.#initialSegment, 4) // Lower threshold for initial segment
        : this.#initialSegment;

      // For repeating decimals, show significant digits even if period is long
      let displayPeriod = periodDigits;
      if (useRepeatNotation && this.#leadingZerosInPeriod < 1000) {
        // Show compact zeros plus first significant digits from period
        const significantDigits = this.#periodDigitsRest;
        if (significantDigits && significantDigits.length > 0) {
          const leadingZerosFormatted =
            this.#leadingZerosInPeriod > 0
              ? `{0~${this.#leadingZerosInPeriod}}`
              : "";
          const maxSignificantDigits = Math.min(significantDigits.length, 20);
          displayPeriod =
            leadingZerosFormatted +
            significantDigits.substring(0, maxSignificantDigits);
        } else {
          displayPeriod = useRepeatNotation
            ? Rational.#formatRepeatedDigits(periodDigits, 6)
            : periodDigits;
        }
      } else {
        displayPeriod = useRepeatNotation
          ? Rational.#formatRepeatedDigits(periodDigits, 6)
          : periodDigits;
      }

      if (this.#initialSegment) {
        result += "." + formattedInitial + "#" + displayPeriod;
      } else {
        result += ".#" + displayPeriod;
      }

      return {
        decimal: result,
        period: this.#periodLength,
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
    // Handle special cases
    if (this.#numerator === 0n) {
      return "0";
    }

    // Ensure decimal metadata is computed with enough period digits
    this.#computeWholePart();
    this.#computeDecimalMetadata(100); // Get more period digits for scientific notation

    const isNegative = this.#isNegative;
    const prefix = isNegative ? "-" : "";

    // Case 1: Number >= 1 (whole part > 0)
    if (this.#wholePart > 0n) {
      const wholeStr = this.#wholePart.toString();
      const firstDigit = wholeStr[0];
      const exponent = wholeStr.length - 1;

      let mantissa = firstDigit;
      if (wholeStr.length > 1 || this.#remainder > 0n) {
        mantissa += ".";

        // Add remaining whole digits
        if (wholeStr.length > 1) {
          mantissa += wholeStr.substring(1);
        }

        // Add fractional part if it exists
        if (this.#remainder > 0n) {
          if (this.#isTerminating) {
            const formattedInitial = useRepeatNotation
              ? Rational.#formatRepeatedDigits(this.#initialSegment, 4)
              : this.#initialSegment;
            mantissa += formattedInitial;
          } else {
            const formattedInitial = useRepeatNotation
              ? Rational.#formatRepeatedDigits(this.#initialSegment, 4)
              : this.#initialSegment;
            mantissa += formattedInitial + "#";

            // For repeating decimals, add some period digits
            let periodDigits = this.#periodDigits;
            if (
              this.#periodLength > 0 &&
              this.#periodLength <= Rational.MAX_PERIOD_DIGITS &&
              periodDigits.length < this.#periodLength
            ) {
              periodDigits = this.extractPeriodSegment(
                this.#initialSegment,
                this.#periodLength,
                Math.min(10, this.#periodLength),
              );
            }
            const formattedPeriod = useRepeatNotation
              ? Rational.#formatRepeatedDigits(periodDigits, 6)
              : periodDigits.substring(
                  0,
                  Math.max(1, precision - mantissa.length + 1),
                ); // Limit mantissa length based on precision
            mantissa += formattedPeriod;
          }
        }
      }

      const result = `${prefix}${mantissa}E+${exponent}`;
      return result + this.#generatePeriodInfo(showPeriodInfo);
    }

    // Case 2: Number < 1 (fractional only)
    if (this.#isTerminating) {
      // Find first non-zero digit in initial segment
      const leadingZeros = this.#initialSegmentLeadingZeros;
      const rest = this.#initialSegmentRest;

      if (rest === "") {
        return prefix + "0";
      }

      const firstDigit = rest[0];
      const exponent = -(leadingZeros + 1);

      let mantissa = firstDigit;
      if (rest.length > 1) {
        const remainingDigits = Math.max(0, precision - 1);
        mantissa += "." + rest.substring(1, remainingDigits + 1);
      }

      return `${prefix}${mantissa}E${exponent}`;
    } else {
      // Repeating decimal < 1
      const firstNonZeroInPeriod = this.#periodDigitsRest;

      if (this.#initialSegmentRest !== "") {
        // First non-zero is in initial segment
        const firstDigit = this.#initialSegmentRest[0];
        const exponent = -(this.#initialSegmentLeadingZeros + 1);

        let mantissa = firstDigit;
        if (this.#initialSegmentRest.length > 1 || this.#periodDigits !== "") {
          mantissa += ".";
          if (this.#initialSegmentRest.length > 1) {
            mantissa += this.#initialSegmentRest.substring(1);
          }

          // Add period notation
          mantissa += "#";
          if (
            this.#leadingZerosInPeriod > 0 &&
            useRepeatNotation &&
            this.#leadingZerosInPeriod >= 6
          ) {
            mantissa += `{0~${this.#leadingZerosInPeriod}}`;
          } else if (this.#leadingZerosInPeriod > 0) {
            mantissa += "0".repeat(Math.min(this.#leadingZerosInPeriod, 10));
          }

          if (firstNonZeroInPeriod !== "") {
            const remainingLength = Math.max(
              1,
              precision - mantissa.length + 1,
            );
            mantissa += firstNonZeroInPeriod.substring(0, remainingLength);
          }
        }

        const result = `${prefix}${mantissa}E${exponent}`;
        return result + this.#generatePeriodInfo(showPeriodInfo);
      } else if (firstNonZeroInPeriod !== "") {
        // First non-zero is in repeating part
        const firstDigit = firstNonZeroInPeriod[0];
        // Total leading zeros = initial segment leading zeros + period leading zeros
        const totalLeadingZeros =
          this.#initialSegmentLeadingZeros + this.#leadingZerosInPeriod;
        const exponent = -(totalLeadingZeros + 1);

        let mantissa = firstDigit;
        if (firstNonZeroInPeriod.length > 1) {
          const remainingDigits = Math.max(0, precision - 1);
          mantissa +=
            "." + firstNonZeroInPeriod.substring(1, remainingDigits + 1);
        }

        const result = `${prefix}${mantissa}E${exponent}`;
        return result + this.#generatePeriodInfo(showPeriodInfo);
      } else {
        return prefix + "0";
      }
    }
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

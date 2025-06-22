/**
 * Parser.js
 *
 * A parser for rational interval arithmetic expressions.
 * Handles expressions with intervals, arithmetic operations, and parentheses.
 * Supports decimal uncertainty notation including range [56,67], relative [+5,-6], and symmetric [+-1] formats.
 */

import { Integer } from "./integer.js";
import { Rational } from "./rational.js";
import { RationalInterval } from "./rational-interval.js";
import { BaseSystem } from "./base-system.js";

/**
 * Parses a decimal with uncertainty notation and returns a RationalInterval
 * Supports formats like:
 * - 1.23[56,67] → 1.2356:1.2367 (range notation)
 * - 1.23[+5,-6] → 1.224:1.235 (relative notation)
 * - 1.3[+-1] → 1.29:1.31 (symmetric notation)
 *
 * @param {string} str - String with uncertainty notation
 * @returns {RationalInterval} The interval representation
 * @throws {Error} If the string format is invalid
 */
function parseDecimalUncertainty(str, allowIntegerRangeNotation = true) {
  const uncertaintyMatch = str.match(/^(-?\d*\.?\d*)\[([^\]]+)\]$/);
  if (!uncertaintyMatch) {
    throw new Error("Invalid uncertainty format");
  }

  const baseStr = uncertaintyMatch[1];
  const uncertaintyStr = uncertaintyMatch[2];

  // Check if this is a range interval right after decimal point
  // Format: 0.[#3,#6] or 1.[1,4] (only when base ends with decimal point and no digits after)
  const afterDecimalMatch = baseStr.match(/^(-?\d+\.)$/);
  if (
    afterDecimalMatch &&
    !uncertaintyStr.startsWith("+-") &&
    !uncertaintyStr.startsWith("-+")
  ) {
    return parseDecimalPointUncertainty(baseStr, uncertaintyStr);
  }

  // Parse the base decimal
  const baseRational = new Rational(baseStr);

  // Determine decimal places in base for proper alignment
  const decimalMatch = baseStr.match(/\.(\d+)$/);
  const baseDecimalPlaces = decimalMatch ? decimalMatch[1].length : 0;

  // Check if it's range notation [num,num], relative notation [+num,-num], or symmetric notation [+-num]
  if (
    uncertaintyStr.includes(",") &&
    !uncertaintyStr.includes("+") &&
    !uncertaintyStr.includes("-")
  ) {
    // Range notation: 1.23[56,67] → 1.2356:1.2367 or 42[15,25] → 4215:4225
    // But only allow for integer bases if allowIntegerRangeNotation is true
    if (baseDecimalPlaces === 0 && !allowIntegerRangeNotation) {
      throw new Error(
        "Range notation on integer bases is not supported in this context",
      );
    }

    const rangeParts = uncertaintyStr.split(",");
    if (rangeParts.length !== 2) {
      throw new Error(
        "Range notation must have exactly two values separated by comma",
      );
    }

    const lowerUncertainty = rangeParts[0].trim();
    const upperUncertainty = rangeParts[1].trim();

    // Validate that both are valid decimal numbers (digits and optional decimal point)
    if (
      !/^\d+(\.\d+)?$/.test(lowerUncertainty) ||
      !/^\d+(\.\d+)?$/.test(upperUncertainty)
    ) {
      throw new Error("Range values must be valid decimal numbers");
    }

    // Create the bounds by appending the uncertainty digits
    const lowerBoundStr = baseStr + lowerUncertainty;
    const upperBoundStr = baseStr + upperUncertainty;

    // For integer bases, validate that range values have the same number of digits
    if (baseDecimalPlaces === 0) {
      // Check if both range values are pure integers (no decimal points)
      const lowerIsInteger = !lowerUncertainty.includes(".");
      const upperIsInteger = !upperUncertainty.includes(".");

      // Extract integer parts from range values (whether they're pure integers or have decimals)
      const lowerIntPart = lowerUncertainty.includes(".")
        ? lowerUncertainty.split(".")[0]
        : lowerUncertainty;
      const upperIntPart = upperUncertainty.includes(".")
        ? upperUncertainty.split(".")[0]
        : upperUncertainty;

      // Check that both integer parts have the same number of digits
      const lowerIntDigits = lowerIntPart.length;
      const upperIntDigits = upperIntPart.length;

      if (lowerIntDigits !== upperIntDigits) {
        throw new Error(
          `Invalid range notation: ${baseStr}[${lowerUncertainty},${upperUncertainty}] - integer parts of range values must have the same number of digits (${lowerIntPart} has ${lowerIntDigits}, ${upperIntPart} has ${upperIntDigits})`,
        );
      }
    }

    const lowerBound = new Rational(lowerBoundStr);
    const upperBound = new Rational(upperBoundStr);

    // Automatically order the bounds (allow either order in input)
    if (lowerBound.greaterThan(upperBound)) {
      return new RationalInterval(upperBound, lowerBound);
    }

    return new RationalInterval(lowerBound, upperBound);
  } else if (
    uncertaintyStr.startsWith("+-") ||
    uncertaintyStr.startsWith("-+")
  ) {
    // Symmetric notation: 1.23[+-5] or 1.23[-+5] or 12[+-0.#3]
    const offsetStr = uncertaintyStr.substring(2);
    if (!offsetStr) {
      throw new Error(
        "Symmetric notation must have a valid number after +- or -+",
      );
    }

    const offset = parseRepeatingDecimalOrRegular(offsetStr);

    // For integer bases, apply offset directly
    // For decimal bases, scale to the next decimal place
    if (baseDecimalPlaces === 0) {
      // Integer base: apply offset directly in ones place
      const upperBound = baseRational.add(offset);
      const lowerBound = baseRational.subtract(offset);
      return new RationalInterval(lowerBound, upperBound);
    } else {
      // Decimal base: scale to next decimal place
      const nextPlaceScale = new Rational(1).divide(
        new Rational(10).pow(baseDecimalPlaces + 1),
      );
      const scaledOffset = offset.multiply(nextPlaceScale);
      const upperBound = baseRational.add(scaledOffset);
      const lowerBound = baseRational.subtract(scaledOffset);
      return new RationalInterval(lowerBound, upperBound);
    }
  } else {
    // Relative notation: 1.23[+5,-6] or 1.23[-6,+5]
    const relativeParts = uncertaintyStr.split(",").map((s) => s.trim());
    if (relativeParts.length !== 2) {
      throw new Error(
        "Relative notation must have exactly two values separated by comma",
      );
    }

    let positiveOffset = null;
    let negativeOffset = null;

    for (const part of relativeParts) {
      if (part.startsWith("+")) {
        if (positiveOffset !== null) {
          throw new Error("Only one positive offset allowed");
        }
        const offsetStr = part.substring(1);
        if (!offsetStr) {
          throw new Error("Offset must be a valid number");
        }
        positiveOffset = parseRepeatingDecimalOrRegular(offsetStr);
      } else if (part.startsWith("-")) {
        if (negativeOffset !== null) {
          throw new Error("Only one negative offset allowed");
        }
        const offsetStr = part.substring(1);
        if (!offsetStr) {
          throw new Error("Offset must be a valid number");
        }
        negativeOffset = parseRepeatingDecimalOrRegular(offsetStr);
      } else {
        throw new Error("Relative notation values must start with + or -");
      }
    }

    if (positiveOffset === null || negativeOffset === null) {
      throw new Error(
        "Relative notation must have exactly one + and one - value",
      );
    }

    // For integer bases, apply offsets directly
    // For decimal bases, scale to the next decimal place
    let upperBound, lowerBound;

    if (baseDecimalPlaces === 0) {
      // Integer base: apply offsets directly in ones place
      upperBound = baseRational.add(positiveOffset);
      lowerBound = baseRational.subtract(negativeOffset);
    } else {
      // Decimal base: scale to next decimal place
      const nextPlaceScale = new Rational(1).divide(
        new Rational(10).pow(baseDecimalPlaces + 1),
      );
      const scaledPositiveOffset = positiveOffset.multiply(nextPlaceScale);
      const scaledNegativeOffset = negativeOffset.multiply(nextPlaceScale);
      upperBound = baseRational.add(scaledPositiveOffset);
      lowerBound = baseRational.subtract(scaledNegativeOffset);
    }

    return new RationalInterval(lowerBound, upperBound);
  }
}

function parseDecimalPointUncertainty(baseStr, uncertaintyStr) {
  // Handle range notation right after decimal point
  // baseStr is like "0." or "-1."

  if (uncertaintyStr.includes(",")) {
    // Range notation: 0.[#3,#6] or 0.[1,4]
    const rangeParts = uncertaintyStr.split(",");
    if (rangeParts.length !== 2) {
      throw new Error(
        "Range notation must have exactly two values separated by comma",
      );
    }

    const lowerStr = rangeParts[0].trim();
    const upperStr = rangeParts[1].trim();

    // Parse each endpoint, handling repeating decimals
    const lowerBound = parseDecimalPointEndpoint(baseStr, lowerStr);
    const upperBound = parseDecimalPointEndpoint(baseStr, upperStr);

    return new RationalInterval(lowerBound, upperBound);
  } else {
    throw new Error("Invalid uncertainty format for decimal point notation");
  }
}

function parseDecimalPointEndpoint(baseStr, endpointStr) {
  // baseStr is like "0." or "-1."
  // endpointStr is like "#3", "1", "4", etc.

  if (endpointStr.startsWith("#")) {
    // Repeating decimal: combine base with repeating part
    const fullStr = baseStr + endpointStr;
    return parseRepeatingDecimal(fullStr);
  } else if (/^\d+$/.test(endpointStr)) {
    // Simple digits: append to base
    const fullStr = baseStr + endpointStr;
    return new Rational(fullStr);
  } else {
    throw new Error(`Invalid endpoint format: ${endpointStr}`);
  }
}

function parseRepeatingDecimalOrRegular(str) {
  // Parse a string that might be a repeating decimal, regular decimal, or E notation
  if (str.includes("#")) {
    // Check if it has E notation after the repeating decimal
    const eIndex = str.indexOf("E");
    if (eIndex !== -1) {
      const repeatingPart = str.substring(0, eIndex);
      const exponentPart = str.substring(eIndex + 1);

      // Validate exponent is an integer
      if (!/^-?\d+$/.test(exponentPart)) {
        throw new Error("E notation exponent must be an integer");
      }

      const baseValue = parseRepeatingDecimal(repeatingPart);
      const exponent = BigInt(exponentPart);

      // Apply E notation: multiply by 10^exponent
      let powerOf10;
      if (exponent >= 0n) {
        powerOf10 = new Rational(10n ** exponent);
      } else {
        powerOf10 = new Rational(1n, 10n ** -exponent);
      }

      return baseValue.multiply(powerOf10);
    } else {
      return parseRepeatingDecimal(str);
    }
  } else if (str.includes("E")) {
    // Handle E notation with regular decimal
    const eIndex = str.indexOf("E");
    const basePart = str.substring(0, eIndex);
    const exponentPart = str.substring(eIndex + 1);

    // Validate base is a valid number format
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(basePart)) {
      throw new Error("Invalid number format before E notation");
    }

    // Validate exponent is an integer
    if (!/^-?\d+$/.test(exponentPart)) {
      throw new Error("E notation exponent must be an integer");
    }

    const baseValue = new Rational(basePart);
    const exponent = BigInt(exponentPart);

    // Apply E notation: multiply by 10^exponent
    let powerOf10;
    if (exponent >= 0n) {
      powerOf10 = new Rational(10n ** exponent);
    } else {
      powerOf10 = new Rational(1n, 10n ** -exponent);
    }

    return baseValue.multiply(powerOf10);
  } else {
    // Validate that str is a valid number format before creating Rational
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(str)) {
      throw new Error(
        "Symmetric notation must have a valid number after +- or -+",
      );
    }
    return new Rational(str);
  }
}

/**
 * Parses a repeating decimal string and returns the exact rational equivalent
 *
 * @param {string} str - String like "0.12#45" or "733.#3" or "1.23#0" or "0.#3:0.5#0"
 * @returns {Rational|RationalInterval} The exact rational representation, or interval for non-repeating decimals
 * @throws {Error} If the string format is invalid
 */
export function parseRepeatingDecimal(str) {
  if (!str || typeof str !== "string") {
    throw new Error("Input must be a non-empty string");
  }

  str = str.trim();

  // Check if this is uncertainty notation (contains brackets)
  if (str.includes("[") && str.includes("]")) {
    return parseDecimalUncertainty(str, false); // Don't allow integer range notation in parseRepeatingDecimal
  }

  // Check if this is an interval notation (contains colon)
  if (str.includes(":")) {
    return parseRepeatingDecimalInterval(str);
  }

  // Handle negative numbers
  const isNegative = str.startsWith("-");
  if (isNegative) {
    str = str.substring(1);
  }

  // Check if this is a non-repeating decimal (no # symbol)
  if (!str.includes("#")) {
    return parseNonRepeatingDecimal(str, isNegative);
  }

  // Split on the # symbol
  const parts = str.split("#");
  if (parts.length !== 2) {
    throw new Error(
      'Invalid repeating decimal format. Use format like "0.12#45"',
    );
  }

  const [nonRepeatingPart, repeatingPart] = parts;

  // Validate repeating part
  if (!/^\d+$/.test(repeatingPart)) {
    throw new Error("Repeating part must contain only digits");
  }

  // Handle special case where repeating part is "0" - this means the decimal terminates
  if (repeatingPart === "0") {
    try {
      // Convert decimal string to rational manually
      const decimalParts = nonRepeatingPart.split(".");
      if (decimalParts.length > 2) {
        throw new Error("Invalid decimal format - multiple decimal points");
      }

      const integerPart = decimalParts[0] || "0";
      const fractionalPart = decimalParts[1] || "";

      if (!/^\d*$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
        throw new Error(
          "Decimal must contain only digits and at most one decimal point",
        );
      }

      let numerator, denominator;
      if (!fractionalPart) {
        // Just an integer
        numerator = BigInt(integerPart);
        denominator = 1n;
      } else {
        // Convert decimal to fraction
        numerator = BigInt(integerPart + fractionalPart);
        denominator = 10n ** BigInt(fractionalPart.length);
      }

      const rational = new Rational(numerator, denominator);
      return isNegative ? rational.negate() : rational;
    } catch (error) {
      throw new Error(`Invalid decimal format: ${error.message}`);
    }
  }

  // Split non-repeating part into integer and fractional parts
  const decimalParts = nonRepeatingPart.split(".");
  if (decimalParts.length > 2) {
    throw new Error("Invalid decimal format - multiple decimal points");
  }

  const integerPart = decimalParts[0] || "0";
  const fractionalPart = decimalParts[1] || "";

  // Validate parts contain only digits
  if (!/^\d*$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
    throw new Error(
      "Non-repeating part must contain only digits and at most one decimal point",
    );
  }

  // Calculate the rational representation
  const n = fractionalPart.length; // number of non-repeating fractional digits
  const m = repeatingPart.length; // number of repeating digits

  // Create the numbers: abc (concatenated) and ab (non-repeating part only)
  const abcStr = integerPart + fractionalPart + repeatingPart;
  const abStr = integerPart + fractionalPart;

  const abc = BigInt(abcStr);
  const ab = BigInt(abStr);

  // Calculate denominator: 10^(n+m) - 10^n = 10^n * (10^m - 1)
  const powerOfTenN = 10n ** BigInt(n);
  const powerOfTenM = 10n ** BigInt(m);
  const denominator = powerOfTenN * (powerOfTenM - 1n);

  // Calculate numerator: abc - ab
  const numerator = abc - ab;

  let result = new Rational(numerator, denominator);
  return isNegative ? result.negate() : result;
}

/**
 * Parses a non-repeating decimal and returns an interval representing the uncertainty
 * For example, "1.23" becomes the interval [1.225, 1.235)
 *
 * @private
 * @param {string} str - Decimal string like "1.23"
 * @param {boolean} isNegative - Whether the number is negative
 * @returns {RationalInterval} The interval representation
 */
function parseNonRepeatingDecimal(str, isNegative) {
  // Validate decimal format
  const decimalParts = str.split(".");
  if (decimalParts.length > 2) {
    throw new Error("Invalid decimal format - multiple decimal points");
  }

  const integerPart = decimalParts[0] || "0";
  const fractionalPart = decimalParts[1] || "";

  if (!/^\d+$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
    throw new Error(
      "Decimal must contain only digits and at most one decimal point",
    );
  }

  // If there's no fractional part, treat as exact integer
  if (!fractionalPart) {
    const rational = new Rational(integerPart);
    return isNegative ? rational.negate() : rational;
  }

  // Create interval [x.yyy5, x.yyy5) where the last digit is treated as ±0.5
  const lastDigitPlace = 10n ** BigInt(fractionalPart.length + 1);
  const baseValue = BigInt(integerPart + fractionalPart);

  let lower, upper;

  if (isNegative) {
    // For negative numbers like -1.5, we want [-1.55, -1.45]
    // So we need to add 5 and subtract 5 from baseValue * 10, then negate
    const lowerNumerator = -(baseValue * 10n + 5n);
    const upperNumerator = -(baseValue * 10n - 5n);

    lower = new Rational(lowerNumerator, lastDigitPlace);
    upper = new Rational(upperNumerator, lastDigitPlace);
  } else {
    // For positive numbers like 0.5, we want [0.45, 0.55]
    // baseValue = 5, lastDigitPlace = 100
    // lower = (5 * 10 - 5) / 100 = 45/100 = 9/20
    // upper = (5 * 10 + 5) / 100 = 55/100 = 11/20
    const lowerNumerator = baseValue * 10n - 5n;
    const upperNumerator = baseValue * 10n + 5n;

    lower = new Rational(lowerNumerator, lastDigitPlace);
    upper = new Rational(upperNumerator, lastDigitPlace);
  }

  return new RationalInterval(lower, upper);
}

/**
 * Parses a repeating decimal interval string like "0.#3:0.5#0"
 *
 * @private
 * @param {string} str - Interval string with colon separator
 * @returns {RationalInterval} The interval representation
 */
function parseRepeatingDecimalInterval(str) {
  const parts = str.split(":");
  if (parts.length !== 2) {
    throw new Error('Invalid interval format. Use format like "0.#3:0.5#0"');
  }

  // Parse each endpoint separately
  const leftEndpoint = parseRepeatingDecimal(parts[0].trim());
  const rightEndpoint = parseRepeatingDecimal(parts[1].trim());

  // If either endpoint is an interval, we need to handle that
  if (
    leftEndpoint instanceof RationalInterval ||
    rightEndpoint instanceof RationalInterval
  ) {
    throw new Error("Nested intervals are not supported");
  }

  // Create interval from the two rational endpoints
  return new RationalInterval(leftEndpoint, rightEndpoint);
}

/**
 * Parses a number string in a specific base system
 * Supports integers, decimals, mixed numbers, intervals, and E notation
 *
 * @param {string} numberStr - The number string to parse (e.g., "101", "10.1", "1..1/2", "A:F", "12E2", "12_^2")
 * @param {BaseSystem} baseSystem - The base system to use for parsing
 * @param {Object} options - Parsing options
 * @returns {Integer|Rational|RationalInterval} The parsed value
 */
function parseBaseNotation(numberStr, baseSystem, options = {}) {
  // Handle negative numbers
  let isNegative = false;
  if (numberStr.startsWith("-")) {
    isNegative = true;
    numberStr = numberStr.substring(1);
  }

  // Check for base-aware E notation or _^ notation first
  let eNotationIndex = -1;
  let eNotationType = null;

  // Check if base contains 'E' character - if so, use _^ notation
  const baseContainsE =
    baseSystem.characters.includes("E") || baseSystem.characters.includes("e");

  if (baseContainsE) {
    // Look for _^ notation
    eNotationIndex = numberStr.indexOf("_^");
    if (eNotationIndex !== -1) {
      eNotationType = "_^";
    }
  } else {
    // Look for E notation (case insensitive)
    const upperStr = numberStr.toUpperCase();
    const eIndex = upperStr.indexOf("E");
    if (eIndex !== -1) {
      eNotationIndex = eIndex;
      eNotationType = "E";
    }
  }

  // If E notation found, split the number
  let baseNumber = numberStr;
  let exponentStr = null;

  if (eNotationIndex !== -1) {
    baseNumber = numberStr.substring(0, eNotationIndex);
    const exponentStart = eNotationIndex + (eNotationType === "_^" ? 2 : 1);
    exponentStr = numberStr.substring(exponentStart);

    // Validate exponent string contains only valid base characters
    if (!baseSystem.isValidString(exponentStr.replace("-", ""))) {
      throw new Error(
        `Invalid exponent "${exponentStr}" for base ${baseSystem.base}`,
      );
    }
  }

  // Normalize case for bases that use letters, but respect the base system's character case
  if (baseSystem.base <= 36 && baseSystem.base > 10) {
    // Check if the base system uses lowercase or uppercase for letters
    const usesLowercase = baseSystem.characters.some(
      (char) => char >= "a" && char <= "z",
    );
    const usesUppercase = baseSystem.characters.some(
      (char) => char >= "A" && char <= "Z",
    );

    if (usesLowercase && !usesUppercase) {
      // Base uses only lowercase letters
      baseNumber = baseNumber.toLowerCase();
      if (exponentStr) {
        exponentStr = exponentStr.toLowerCase();
      }
    } else if (usesUppercase && !usesLowercase) {
      // Base uses only uppercase letters
      baseNumber = baseNumber.toUpperCase();
      if (exponentStr) {
        exponentStr = exponentStr.toUpperCase();
      }
    }
    // If base uses mixed case or no letters, don't normalize
  }

  // Handle E notation if found
  if (eNotationIndex !== -1) {
    // Parse the base number (without exponent)
    const baseValue = parseBaseNotation(baseNumber, baseSystem, options);

    // Parse the exponent in the same base system
    let exponentDecimal;
    if (exponentStr.startsWith("-")) {
      const positiveExponent = baseSystem.toDecimal(exponentStr.substring(1));
      exponentDecimal = -positiveExponent;
    } else {
      exponentDecimal = baseSystem.toDecimal(exponentStr);
    }

    // Apply E notation: multiply by base^exponent
    let powerOfBase;
    const baseBigInt = BigInt(baseSystem.base);

    if (exponentDecimal >= 0n) {
      // Positive exponent: base^n
      powerOfBase = new Rational(baseBigInt ** exponentDecimal);
    } else {
      // Negative exponent: 1/(base^(-n))
      powerOfBase = new Rational(1n, baseBigInt ** -exponentDecimal);
    }

    // Convert baseValue to Rational for multiplication
    let baseRational;
    if (baseValue instanceof Integer) {
      baseRational = baseValue.toRational();
    } else if (baseValue instanceof Rational) {
      baseRational = baseValue;
    } else {
      throw new Error(
        "E notation can only be applied to simple numbers, not intervals",
      );
    }

    let result = baseRational.multiply(powerOfBase);
    if (isNegative) {
      result = result.negate();
    }

    return options.typeAware && result.denominator === 1n
      ? new Integer(result.numerator)
      : result;
  }

  // Check for interval notation first (contains colon)
  if (baseNumber.includes(":")) {
    const parts = baseNumber.split(":");
    if (parts.length !== 2) {
      throw new Error(
        'Base notation intervals must have exactly two endpoints separated by ":"',
      );
    }

    // For intervals, handle the negative sign by applying it to the left endpoint
    const leftStr = isNegative ? "-" + parts[0].trim() : parts[0].trim();
    const leftValue = parseBaseNotation(leftStr, baseSystem, options);
    const rightValue = parseBaseNotation(parts[1].trim(), baseSystem, options);

    // Convert to rationals for interval creation
    let leftRational, rightRational;
    if (leftValue instanceof Integer) {
      leftRational = leftValue.toRational();
    } else if (leftValue instanceof Rational) {
      leftRational = leftValue;
    } else if (
      leftValue instanceof RationalInterval &&
      leftValue.low.equals(leftValue.high)
    ) {
      leftRational = leftValue.low;
    } else {
      throw new Error(
        "Interval endpoints must be single values, not intervals",
      );
    }

    if (rightValue instanceof Integer) {
      rightRational = rightValue.toRational();
    } else if (rightValue instanceof Rational) {
      rightRational = rightValue;
    } else if (
      rightValue instanceof RationalInterval &&
      rightValue.low.equals(rightValue.high)
    ) {
      rightRational = rightValue.low;
    } else {
      throw new Error(
        "Interval endpoints must be single values, not intervals",
      );
    }

    const interval = new RationalInterval(leftRational, rightRational);
    interval._explicitInterval = true;
    return interval;
  }

  // Check for mixed number notation (double dot)
  if (baseNumber.includes("..")) {
    const parts = baseNumber.split("..");
    if (parts.length !== 2) {
      throw new Error(
        'Mixed number notation must have exactly one ".." separator',
      );
    }

    const wholePart = parts[0].trim();
    const fractionPart = parts[1].trim();

    if (!fractionPart.includes("/")) {
      throw new Error('Mixed number fractional part must contain "/"');
    }

    // Parse whole part in the specified base
    const wholeDecimal = baseSystem.toDecimal(wholePart);
    let wholeRational = new Rational(wholeDecimal);
    if (isNegative) {
      wholeRational = wholeRational.negate();
    }

    // Parse fractional part
    const fractionResult = parseBaseNotation(fractionPart, baseSystem, options);
    let fractionRational;

    if (fractionResult instanceof Integer) {
      fractionRational = fractionResult.toRational();
    } else if (fractionResult instanceof Rational) {
      fractionRational = fractionResult;
    } else {
      throw new Error("Mixed number fractional part must be a simple fraction");
    }

    // Combine whole and fractional parts
    // Handle sign: if whole part is negative, subtract the fraction
    if (wholeRational.numerator < 0n) {
      const result = wholeRational.subtract(fractionRational.abs());
      return options.typeAware && result.denominator === 1n
        ? new Integer(result.numerator)
        : result;
    } else {
      const result = wholeRational.add(fractionRational);
      return options.typeAware && result.denominator === 1n
        ? new Integer(result.numerator)
        : result;
    }
  }

  // Check for fraction notation (contains slash)
  if (baseNumber.includes("/")) {
    const parts = baseNumber.split("/");
    if (parts.length !== 2) {
      throw new Error('Fraction notation must have exactly one "/" separator');
    }

    const numeratorStr = parts[0].trim();
    const denominatorStr = parts[1].trim();

    // Parse numerator and denominator in the specified base
    const numeratorDecimal = baseSystem.toDecimal(numeratorStr);
    const denominatorDecimal = baseSystem.toDecimal(denominatorStr);

    if (denominatorDecimal === 0n) {
      throw new Error("Denominator cannot be zero");
    }

    let result = new Rational(numeratorDecimal, denominatorDecimal);
    if (isNegative) {
      result = result.negate();
    }
    result._explicitFraction = true;
    return result;
  }

  // Check for decimal notation (contains single dot)
  if (baseNumber.includes(".")) {
    const parts = baseNumber.split(".");
    if (parts.length !== 2) {
      throw new Error('Decimal notation must have exactly one "." separator');
    }

    const integerPart = parts[0] || "0";
    const fractionalPart = parts[1] || "";

    if (fractionalPart === "") {
      throw new Error("Decimal point must be followed by fractional digits");
    }

    // Validate all characters are valid for this base
    const fullStr = integerPart + fractionalPart;
    if (!baseSystem.isValidString(fullStr)) {
      throw new Error(
        `String "${baseNumber}" contains characters not valid for ${baseSystem.name}`,
      );
    }

    // Convert integer part to decimal
    const integerDecimal = baseSystem.toDecimal(integerPart);

    // Convert fractional part to decimal
    // Each digit in position i contributes digit_value / base^(i+1)
    let fractionalDecimal = 0n;
    const baseBigInt = BigInt(baseSystem.base);

    for (let i = 0; i < fractionalPart.length; i++) {
      const digitChar = fractionalPart[i];
      const digitValue = BigInt(baseSystem.charMap.get(digitChar));

      // Add digit_value / base^(i+1) to fractional part
      // This is implemented as: fractionalDecimal * base + digitValue
      fractionalDecimal = fractionalDecimal * baseBigInt + digitValue;
    }

    // Create the rational: integerPart + fractionalPart / base^fractionalLength
    const denominator = baseBigInt ** BigInt(fractionalPart.length);
    const totalNumerator = integerDecimal * denominator + fractionalDecimal;

    let result = new Rational(totalNumerator, denominator);
    if (isNegative) {
      result = result.negate();
    }
    return options.typeAware && result.denominator === 1n
      ? new Integer(result.numerator)
      : result;
  }

  // Simple integer case
  if (!baseSystem.isValidString(baseNumber)) {
    throw new Error(
      `String "${baseNumber}" contains characters not valid for ${baseSystem.name}`,
    );
  }

  let decimalValue = baseSystem.toDecimal(baseNumber);
  if (isNegative) {
    decimalValue = -decimalValue;
  }

  if (options.typeAware) {
    return new Integer(decimalValue);
  } else {
    return new Rational(decimalValue);
  }
}

export class Parser {
  /**
   * Parses a string representing an interval arithmetic expression
   *
   * @param {string} expression - The expression to parse
   * @param {Object} options - Parsing options
   * @param {boolean} options.typeAware - If true, returns Integer/Rational/RationalInterval based on input
   * @param {BaseSystem} options.inputBase - Base system for parsing input (default: decimal)
   * @returns {Integer|Rational|RationalInterval} The result of evaluating the expression
   * @throws {Error} If the expression syntax is invalid
   */
  static parse(expression, options = {}) {
    if (!expression || expression.trim() === "") {
      throw new Error("Expression cannot be empty");
    }

    // Set default value for typeAware
    options = { typeAware: true, ...options };

    // Handle space-sensitive E notation before removing whitespace
    // Replace " E" with "TE" (temporary marker) to preserve space information
    expression = expression.replace(/ E/g, "TE");

    // Handle space-sensitive division disambiguation before removing whitespace
    // Replace "/ " with "/S" (temporary marker) to preserve space information
    expression = expression.replace(/\/ /g, "/S");

    // Remove all whitespace
    expression = expression.replace(/\s+/g, "");

    // Parse the expression
    const result = Parser.#parseExpression(expression, options);

    if (result.remainingExpr.length > 0) {
      throw new Error(`Unexpected token at end: ${result.remainingExpr}`);
    }

    return result.value;
  }

  /**
   * Parses an expression with addition and subtraction
   * @private
   */
  static #parseExpression(expr, options = {}) {
    let result = Parser.#parseTerm(expr, options);
    let currentExpr = result.remainingExpr;

    while (
      currentExpr.length > 0 &&
      (currentExpr[0] === "+" || currentExpr[0] === "-")
    ) {
      const operator = currentExpr[0];
      currentExpr = currentExpr.substring(1);

      const termResult = Parser.#parseTerm(currentExpr, options);
      currentExpr = termResult.remainingExpr;

      if (operator === "+") {
        result.value = result.value.add(termResult.value);
      } else {
        result.value = result.value.subtract(termResult.value);
      }
    }

    return {
      value: Parser.#promoteType(result.value, options),
      remainingExpr: currentExpr,
    };
  }

  /**
   * Parses a term with multiplication, division, and E notation
   * @private
   */
  static #parseTerm(expr, options = {}) {
    let result = Parser.#parseFactor(expr, options);
    let currentExpr = result.remainingExpr;

    while (
      currentExpr.length > 0 &&
      (currentExpr[0] === "*" ||
        currentExpr[0] === "/" ||
        currentExpr[0] === "E" ||
        currentExpr.startsWith("TE"))
    ) {
      let operator, skipLength;
      if (currentExpr.startsWith("TE")) {
        operator = "E";
        skipLength = 2;
      } else {
        operator = currentExpr[0];
        skipLength = 1;
      }
      currentExpr = currentExpr.substring(skipLength);

      // Handle space marker for division
      if (
        operator === "/" &&
        currentExpr.length > 0 &&
        currentExpr[0] === "S"
      ) {
        currentExpr = currentExpr.substring(1); // Skip the 'S' marker
      }

      const factorResult = Parser.#parseFactor(currentExpr, options);
      currentExpr = factorResult.remainingExpr;

      if (operator === "*") {
        result.value = result.value.multiply(factorResult.value);
      } else if (operator === "/") {
        result.value = result.value.divide(factorResult.value);
      } else if (operator === "E") {
        // E notation: left operand * 10^(right operand)
        // Extract the exponent value based on the type
        let exponentValue;
        if (factorResult.value instanceof Integer) {
          exponentValue = factorResult.value.value;
        } else if (factorResult.value instanceof Rational) {
          if (factorResult.value.denominator !== 1n) {
            throw new Error("E notation exponent must be an integer");
          }
          exponentValue = factorResult.value.numerator;
        } else if (factorResult.value.low && factorResult.value.high) {
          // RationalInterval case
          if (!factorResult.value.low.equals(factorResult.value.high)) {
            throw new Error("E notation exponent must be an integer");
          }
          const exponent = factorResult.value.low;
          if (exponent.denominator !== 1n) {
            throw new Error("E notation exponent must be an integer");
          }
          exponentValue = exponent.numerator;
        } else {
          throw new Error("Invalid E notation exponent type");
        }

        // Apply E notation using the value's E method if available
        if (result.value.E && typeof result.value.E === "function") {
          result.value = result.value.E(exponentValue);
        } else {
          // Fallback for backward compatibility
          const powerOf10 =
            exponentValue >= 0n
              ? new Rational(10n ** exponentValue)
              : new Rational(1n, 10n ** -exponentValue);
          const powerInterval = RationalInterval.point(powerOf10);
          result.value = result.value.multiply(powerInterval);
        }
      }
    }

    return {
      value: Parser.#promoteType(result.value, options),
      remainingExpr: currentExpr,
    };
  }

  /**
   * Parses a factor (interval, number, or parenthesized expression)
   * @private
   */
  static #parseFactor(expr, options = {}) {
    if (expr.length === 0) {
      throw new Error("Unexpected end of expression");
    }

    // Handle parenthesized expressions
    if (expr[0] === "(") {
      const subExprResult = Parser.#parseExpression(expr.substring(1), options);

      if (
        subExprResult.remainingExpr.length === 0 ||
        subExprResult.remainingExpr[0] !== ")"
      ) {
        throw new Error("Missing closing parenthesis");
      }

      const result = {
        value: subExprResult.value,
        remainingExpr: subExprResult.remainingExpr.substring(1),
      };

      // Check for tight E notation after the closing parenthesis (higher precedence than exponentiation)
      if (
        result.remainingExpr.length > 0 &&
        (result.remainingExpr[0] === "E" ||
          result.remainingExpr.startsWith("TE") ||
          result.remainingExpr.startsWith("_^"))
      ) {
        const eResult = Parser.#parseENotation(
          result.value,
          result.remainingExpr,
          options,
        );

        // Check for factorial operators after E notation (higher precedence than exponentiation)
        let factorialResult = eResult;
        if (
          factorialResult.remainingExpr.length > 1 &&
          factorialResult.remainingExpr.substring(0, 2) === "!!"
        ) {
          // Double factorial
          if (factorialResult.value instanceof Integer) {
            factorialResult = {
              value: factorialResult.value.doubleFactorial(),
              remainingExpr: factorialResult.remainingExpr.substring(2),
            };
          } else if (
            factorialResult.value instanceof Rational &&
            factorialResult.value.denominator === 1n
          ) {
            const intValue = new Integer(factorialResult.value.numerator);
            factorialResult = {
              value: intValue.doubleFactorial().toRational(),
              remainingExpr: factorialResult.remainingExpr.substring(2),
            };
          } else if (
            factorialResult.value.low &&
            factorialResult.value.high &&
            factorialResult.value.low.equals(factorialResult.value.high) &&
            factorialResult.value.low.denominator === 1n
          ) {
            // Point interval containing an integer
            const intValue = new Integer(factorialResult.value.low.numerator);
            const factorialValue = intValue.doubleFactorial();
            const IntervalClass = factorialResult.value.constructor;
            factorialResult = {
              value: new IntervalClass(
                factorialValue.toRational(),
                factorialValue.toRational(),
              ),
              remainingExpr: factorialResult.remainingExpr.substring(2),
            };
          } else {
            throw new Error(
              "Double factorial is not defined for negative integers",
            );
          }
        } else if (
          factorialResult.remainingExpr.length > 0 &&
          factorialResult.remainingExpr[0] === "!"
        ) {
          // Single factorial
          if (factorialResult.value instanceof Integer) {
            factorialResult = {
              value: factorialResult.value.factorial(),
              remainingExpr: factorialResult.remainingExpr.substring(1),
            };
          } else if (
            factorialResult.value instanceof Rational &&
            factorialResult.value.denominator === 1n
          ) {
            const intValue = new Integer(factorialResult.value.numerator);
            factorialResult = {
              value: intValue.factorial().toRational(),
              remainingExpr: factorialResult.remainingExpr.substring(1),
            };
          } else if (
            factorialResult.value.low &&
            factorialResult.value.high &&
            factorialResult.value.low.equals(factorialResult.value.high) &&
            factorialResult.value.low.denominator === 1n
          ) {
            // Point interval containing an integer
            const intValue = new Integer(factorialResult.value.low.numerator);
            const factorialValue = intValue.factorial();
            const IntervalClass = factorialResult.value.constructor;
            factorialResult = {
              value: new IntervalClass(
                factorialValue.toRational(),
                factorialValue.toRational(),
              ),
              remainingExpr: factorialResult.remainingExpr.substring(1),
            };
          } else {
            throw new Error("Factorial is not defined for negative integers");
          }
        }

        // Check for exponentiation after factorial
        if (factorialResult.remainingExpr.length > 0) {
          if (factorialResult.remainingExpr[0] === "^") {
            // Standard exponentiation (pow)
            const powerExpr = factorialResult.remainingExpr.substring(1);
            const powerResult = Parser.#parseExponent(powerExpr);

            // Check for 0^0
            const zero = new Rational(0);
            if (factorialResult.value.low && factorialResult.value.high) {
              if (
                factorialResult.value.low.equals(zero) &&
                factorialResult.value.high.equals(zero) &&
                powerResult.value === 0n
              ) {
                throw new Error("Zero cannot be raised to the power of zero");
              }
            } else if (
              factorialResult.value instanceof Integer &&
              factorialResult.value.value === 0n &&
              powerResult.value === 0n
            ) {
              throw new Error("Zero cannot be raised to the power of zero");
            } else if (
              factorialResult.value instanceof Rational &&
              factorialResult.value.numerator === 0n &&
              powerResult.value === 0n
            ) {
              throw new Error("Zero cannot be raised to the power of zero");
            }

            return {
              value: factorialResult.value.pow(powerResult.value),
              remainingExpr: powerResult.remainingExpr,
            };
          } else if (
            factorialResult.remainingExpr.length > 1 &&
            factorialResult.remainingExpr[0] === "*" &&
            factorialResult.remainingExpr[1] === "*"
          ) {
            // Multiplicative exponentiation (mpow)
            const powerExpr = factorialResult.remainingExpr.substring(2);
            const powerResult = Parser.#parseExponent(powerExpr);

            // For multiplicative exponentiation, always use mpow semantics
            let base = factorialResult.value;
            if (!(base instanceof RationalInterval)) {
              // Convert scalar to point interval for mpow
              base = RationalInterval.point(
                base instanceof Integer ? base.toRational() : base,
              );
            }
            const result = base.mpow(powerResult.value);
            result._skipPromotion = true;
            return {
              value: result,
              remainingExpr: powerResult.remainingExpr,
            };
          }
        }

        return factorialResult;
      }

      // Check for factorial operators after the closing parenthesis (higher precedence than exponentiation)
      let factorialResult = result;
      if (
        factorialResult.remainingExpr.length > 1 &&
        factorialResult.remainingExpr.substring(0, 2) === "!!"
      ) {
        // Double factorial
        if (factorialResult.value instanceof Integer) {
          factorialResult = {
            value: factorialResult.value.doubleFactorial(),
            remainingExpr: factorialResult.remainingExpr.substring(2),
          };
        } else if (
          factorialResult.value instanceof Rational &&
          factorialResult.value.denominator === 1n
        ) {
          const intValue = new Integer(factorialResult.value.numerator);
          factorialResult = {
            value: intValue.doubleFactorial().toRational(),
            remainingExpr: factorialResult.remainingExpr.substring(2),
          };
        } else if (
          factorialResult.value.low &&
          factorialResult.value.high &&
          factorialResult.value.low.equals(factorialResult.value.high) &&
          factorialResult.value.low.denominator === 1n
        ) {
          // Point interval containing an integer
          const intValue = new Integer(factorialResult.value.low.numerator);
          const factorialValue = intValue.doubleFactorial();
          const IntervalClass = factorialResult.value.constructor;
          factorialResult = {
            value: new IntervalClass(
              factorialValue.toRational(),
              factorialValue.toRational(),
            ),
            remainingExpr: factorialResult.remainingExpr.substring(2),
          };
        } else {
          throw new Error(
            "Double factorial is not defined for negative integers",
          );
        }
      } else if (
        factorialResult.remainingExpr.length > 0 &&
        factorialResult.remainingExpr[0] === "!"
      ) {
        // Single factorial
        if (factorialResult.value instanceof Integer) {
          factorialResult = {
            value: factorialResult.value.factorial(),
            remainingExpr: factorialResult.remainingExpr.substring(1),
          };
        } else if (
          factorialResult.value instanceof Rational &&
          factorialResult.value.denominator === 1n
        ) {
          const intValue = new Integer(factorialResult.value.numerator);
          factorialResult = {
            value: intValue.factorial().toRational(),
            remainingExpr: factorialResult.remainingExpr.substring(1),
          };
        } else if (
          factorialResult.value.low &&
          factorialResult.value.high &&
          factorialResult.value.low.equals(factorialResult.value.high) &&
          factorialResult.value.low.denominator === 1n
        ) {
          // Point interval containing an integer
          const intValue = new Integer(factorialResult.value.low.numerator);
          const factorialValue = intValue.factorial();
          const IntervalClass = factorialResult.value.constructor;
          factorialResult = {
            value: new IntervalClass(
              factorialValue.toRational(),
              factorialValue.toRational(),
            ),
            remainingExpr: factorialResult.remainingExpr.substring(1),
          };
        } else {
          throw new Error("Factorial is not defined for negative integers");
        }
      }

      // Check for exponentiation after factorial
      if (factorialResult.remainingExpr.length > 0) {
        if (factorialResult.remainingExpr[0] === "^") {
          // Standard exponentiation (pow)
          const powerExpr = factorialResult.remainingExpr.substring(1);
          const powerResult = Parser.#parseExponent(powerExpr);

          // Check for 0^0
          const zero = new Rational(0);
          let isZero = false;

          if (factorialResult.value instanceof RationalInterval) {
            isZero =
              factorialResult.value.low.equals(zero) &&
              factorialResult.value.high.equals(zero);
          } else if (factorialResult.value instanceof Rational) {
            isZero = factorialResult.value.equals(zero);
          } else if (factorialResult.value instanceof Integer) {
            isZero = factorialResult.value.value === 0n;
          }

          if (isZero && powerResult.value === 0n) {
            throw new Error("Zero cannot be raised to the power of zero");
          }

          return {
            value: factorialResult.value.pow(powerResult.value),
            remainingExpr: powerResult.remainingExpr,
          };
        } else if (
          factorialResult.remainingExpr.length > 1 &&
          factorialResult.remainingExpr[0] === "*" &&
          factorialResult.remainingExpr[1] === "*"
        ) {
          // Multiplicative exponentiation (mpow)
          const powerExpr = factorialResult.remainingExpr.substring(2);
          const powerResult = Parser.#parseExponent(powerExpr);

          // For multiplicative exponentiation, always use mpow semantics
          let base = factorialResult.value;
          if (!(base instanceof RationalInterval)) {
            // Convert scalar to point interval for mpow
            base = RationalInterval.point(
              base instanceof Integer ? base.toRational() : base,
            );
          }
          const result = base.mpow(powerResult.value);
          result._skipPromotion = true;
          return {
            value: result,
            remainingExpr: powerResult.remainingExpr,
          };
        }
      }

      return factorialResult;
    }

    // Check for base notation first (like 101[2], FF[16], A[16]:F[16], etc.)
    if (expr.includes("[") && expr.includes("]")) {
      // Look for base notation pattern at the start of expression
      // This handles single values like 101[2], decimals like 10.1[2], fractions like 1/10[2],
      // mixed numbers like 1..1/2[2], and intervals like A[16]:F[16]
      // Use a more restrictive pattern that doesn't capture operators
      const baseMatch = expr.match(/^([-\w./:^]+(?::[-\w./:^]+)?)\[(\d+)\]/);
      if (baseMatch) {
        const [fullMatch, numberStr, baseStr] = baseMatch;
        const baseNum = parseInt(baseStr, 10);

        // Validate base is reasonable
        if (baseNum < 2 || baseNum > 62) {
          throw new Error(
            `Base ${baseNum} is not supported. Base must be between 2 and 62.`,
          );
        }

        try {
          // Create base system for this base
          const baseSystem = BaseSystem.fromBase(baseNum);

          // Parse the number string according to the base notation
          const result = parseBaseNotation(numberStr, baseSystem, options);

          return {
            value: result,
            remainingExpr: expr.substring(fullMatch.length),
          };
        } catch (error) {
          throw new Error(
            `Invalid base notation ${fullMatch}: ${error.message}`,
          );
        }
      }

      // If not base notation, check for uncertainty notation
      const uncertaintyMatch = expr.match(/^(-?\d*\.?\d*)\[([^\]]+)\]/);
      if (uncertaintyMatch) {
        const fullMatch = uncertaintyMatch[0];
        try {
          const result = parseDecimalUncertainty(fullMatch, true); // Allow integer range notation in Parser
          return {
            value: result,
            remainingExpr: expr.substring(fullMatch.length),
          };
        } catch (error) {
          // If it looks like uncertainty notation but is malformed, throw the error
          throw error;
        }
      }
    }

    // Check for negation (but only if it's not part of uncertainty notation)
    if (expr[0] === "-" && !expr.includes("[")) {
      const factorResult = Parser.#parseFactor(expr.substring(1), options);

      // Negate the value - type-aware for new parsing, backward compatible for old
      let negatedValue;
      if (options.typeAware && factorResult.value instanceof Integer) {
        negatedValue = factorResult.value.negate();
      } else if (options.typeAware && factorResult.value instanceof Rational) {
        negatedValue = factorResult.value.negate();
        // Preserve explicitFraction flag when negating
        if (factorResult.value._explicitFraction) {
          negatedValue._explicitFraction = true;
        }
      } else {
        // For backward compatibility and intervals, negate by multiplying by -1
        const negOne = new Rational(-1);
        const negInterval = RationalInterval.point(negOne);
        negatedValue = negInterval.multiply(factorResult.value);
      }

      return {
        value: negatedValue,
        remainingExpr: factorResult.remainingExpr,
      };
    }

    // Try to parse a number (could be Integer, Rational, or RationalInterval)
    const numberResult = Parser.#parseInterval(expr, options);
    // Check for tight E notation after the number (higher precedence than exponentiation)
    if (
      numberResult.remainingExpr.length > 0 &&
      (numberResult.remainingExpr[0] === "E" ||
        numberResult.remainingExpr.startsWith("TE") ||
        numberResult.remainingExpr.startsWith("_^"))
    ) {
      const eResult = Parser.#parseENotation(
        numberResult.value,
        numberResult.remainingExpr,
        options,
      );

      // Check for factorial operators after E notation (higher precedence than exponentiation)
      let factorialResult = eResult;
      if (
        factorialResult.remainingExpr.length > 1 &&
        factorialResult.remainingExpr.substring(0, 2) === "!!"
      ) {
        // Double factorial
        if (factorialResult.value instanceof Integer) {
          factorialResult = {
            value: factorialResult.value.doubleFactorial(),
            remainingExpr: factorialResult.remainingExpr.substring(2),
          };
        } else if (
          factorialResult.value instanceof Rational &&
          factorialResult.value.denominator === 1n
        ) {
          const intValue = new Integer(factorialResult.value.numerator);
          factorialResult = {
            value: intValue.doubleFactorial().toRational(),
            remainingExpr: factorialResult.remainingExpr.substring(2),
          };
        } else if (
          factorialResult.value.low &&
          factorialResult.value.high &&
          factorialResult.value.low.equals(factorialResult.value.high) &&
          factorialResult.value.low.denominator === 1n
        ) {
          // Point interval containing an integer
          const intValue = new Integer(factorialResult.value.low.numerator);
          const factorialValue = intValue.doubleFactorial();
          const IntervalClass = factorialResult.value.constructor;
          factorialResult = {
            value: new IntervalClass(
              factorialValue.toRational(),
              factorialValue.toRational(),
            ),
            remainingExpr: factorialResult.remainingExpr.substring(2),
          };
        } else {
          throw new Error(
            "Double factorial is not defined for negative integers",
          );
        }
      } else if (
        factorialResult.remainingExpr.length > 0 &&
        factorialResult.remainingExpr[0] === "!"
      ) {
        // Single factorial
        if (factorialResult.value instanceof Integer) {
          factorialResult = {
            value: factorialResult.value.factorial(),
            remainingExpr: factorialResult.remainingExpr.substring(1),
          };
        } else if (
          factorialResult.value instanceof Rational &&
          factorialResult.value.denominator === 1n
        ) {
          const intValue = new Integer(factorialResult.value.numerator);
          factorialResult = {
            value: intValue.factorial().toRational(),
            remainingExpr: factorialResult.remainingExpr.substring(1),
          };
        } else if (
          factorialResult.value.low &&
          factorialResult.value.high &&
          factorialResult.value.low.equals(factorialResult.value.high) &&
          factorialResult.value.low.denominator === 1n
        ) {
          // Point interval containing an integer
          const intValue = new Integer(factorialResult.value.low.numerator);
          const factorialValue = intValue.factorial();
          const IntervalClass = factorialResult.value.constructor;
          factorialResult = {
            value: new IntervalClass(
              factorialValue.toRational(),
              factorialValue.toRational(),
            ),
            remainingExpr: factorialResult.remainingExpr.substring(1),
          };
        } else {
          throw new Error("Factorial is not defined for negative integers");
        }
      }

      // Check for exponentiation after factorial
      if (factorialResult.remainingExpr.length > 0) {
        if (factorialResult.remainingExpr[0] === "^") {
          // Standard exponentiation (pow)
          const powerExpr = factorialResult.remainingExpr.substring(1);
          const powerResult = Parser.#parseExponent(powerExpr);

          // Check for 0^0 based on value type
          if (
            factorialResult.value instanceof Integer &&
            factorialResult.value.value === 0n &&
            powerResult.value === 0n
          ) {
            throw new Error("Zero cannot be raised to the power of zero");
          } else if (
            factorialResult.value instanceof Rational &&
            factorialResult.value.numerator === 0n &&
            powerResult.value === 0n
          ) {
            throw new Error("Zero cannot be raised to the power of zero");
          } else if (factorialResult.value.low && factorialResult.value.high) {
            const zero = new Rational(0);
            if (
              factorialResult.value.low.equals(zero) &&
              factorialResult.value.high.equals(zero) &&
              powerResult.value === 0n
            ) {
              throw new Error("Zero cannot be raised to the power of zero");
            }
          }

          const result = factorialResult.value.pow(powerResult.value);
          return {
            value: result,
            remainingExpr: powerResult.remainingExpr,
          };
        } else if (
          factorialResult.remainingExpr.length > 1 &&
          factorialResult.remainingExpr[0] === "*" &&
          factorialResult.remainingExpr[1] === "*"
        ) {
          // Multiplicative exponentiation (mpow)
          const powerExpr = factorialResult.remainingExpr.substring(2);
          const powerResult = Parser.#parseExponent(powerExpr);

          // For multiplicative exponentiation, always use mpow semantics
          let base = factorialResult.value;
          if (!(base instanceof RationalInterval)) {
            // Convert scalar to point interval for mpow
            base = RationalInterval.point(
              base instanceof Integer ? base.toRational() : base,
            );
          }
          const result = base.mpow(powerResult.value);
          // Don't promote multiplicative power results - they should stay as intervals
          result._skipPromotion = true;
          return {
            value: result,
            remainingExpr: powerResult.remainingExpr,
          };
        }
      }

      return factorialResult;
    }

    // Check for factorial operators (higher precedence than exponentiation)
    let factorialResult = numberResult;
    if (
      factorialResult.remainingExpr.length > 1 &&
      factorialResult.remainingExpr.substring(0, 2) === "!!"
    ) {
      // Double factorial
      if (factorialResult.value instanceof Integer) {
        factorialResult = {
          value: factorialResult.value.doubleFactorial(),
          remainingExpr: factorialResult.remainingExpr.substring(2),
        };
      } else if (
        factorialResult.value instanceof Rational &&
        factorialResult.value.denominator === 1n
      ) {
        const intValue = new Integer(factorialResult.value.numerator);
        factorialResult = {
          value: intValue.doubleFactorial().toRational(),
          remainingExpr: factorialResult.remainingExpr.substring(2),
        };
      } else if (
        factorialResult.value.low &&
        factorialResult.value.high &&
        factorialResult.value.low.equals(factorialResult.value.high) &&
        factorialResult.value.low.denominator === 1n
      ) {
        // Point interval containing an integer
        const intValue = new Integer(factorialResult.value.low.numerator);
        const factorialValue = intValue.doubleFactorial();
        const IntervalClass = factorialResult.value.constructor;
        factorialResult = {
          value: new IntervalClass(
            factorialValue.toRational(),
            factorialValue.toRational(),
          ),
          remainingExpr: factorialResult.remainingExpr.substring(2),
        };
      } else {
        throw new Error(
          "Double factorial is not defined for negative integers",
        );
      }
    } else if (
      factorialResult.remainingExpr.length > 0 &&
      factorialResult.remainingExpr[0] === "!"
    ) {
      // Single factorial
      if (factorialResult.value instanceof Integer) {
        factorialResult = {
          value: factorialResult.value.factorial(),
          remainingExpr: factorialResult.remainingExpr.substring(1),
        };
      } else if (
        factorialResult.value instanceof Rational &&
        factorialResult.value.denominator === 1n
      ) {
        const intValue = new Integer(factorialResult.value.numerator);
        factorialResult = {
          value: intValue.factorial().toRational(),
          remainingExpr: factorialResult.remainingExpr.substring(1),
        };
      } else if (
        factorialResult.value.low &&
        factorialResult.value.high &&
        factorialResult.value.low.equals(factorialResult.value.high) &&
        factorialResult.value.low.denominator === 1n
      ) {
        // Point interval containing an integer
        const intValue = new Integer(factorialResult.value.low.numerator);
        const factorialValue = intValue.factorial();
        const IntervalClass = factorialResult.value.constructor;
        factorialResult = {
          value: new IntervalClass(
            factorialValue.toRational(),
            factorialValue.toRational(),
          ),
          remainingExpr: factorialResult.remainingExpr.substring(1),
        };
      } else {
        throw new Error("Factorial is not defined for negative integers");
      }
    }

    // Check for standard exponentiation after factorial
    if (factorialResult.remainingExpr.length > 0) {
      if (factorialResult.remainingExpr[0] === "^") {
        // Standard exponentiation (pow)
        const powerExpr = factorialResult.remainingExpr.substring(1);
        const powerResult = Parser.#parseExponent(powerExpr);

        // Check for 0^0 based on value type
        if (
          factorialResult.value instanceof Integer &&
          factorialResult.value.value === 0n &&
          powerResult.value === 0n
        ) {
          throw new Error("Zero cannot be raised to the power of zero");
        } else if (
          factorialResult.value instanceof Rational &&
          factorialResult.value.numerator === 0n &&
          powerResult.value === 0n
        ) {
          throw new Error("Zero cannot be raised to the power of zero");
        } else if (factorialResult.value.low && factorialResult.value.high) {
          const zero = new Rational(0);
          if (
            factorialResult.value.low.equals(zero) &&
            factorialResult.value.high.equals(zero) &&
            powerResult.value === 0n
          ) {
            throw new Error("Zero cannot be raised to the power of zero");
          }
        }

        const result = factorialResult.value.pow(powerResult.value);
        return {
          value: result,
          remainingExpr: powerResult.remainingExpr,
        };
      } else if (
        factorialResult.remainingExpr.length > 1 &&
        factorialResult.remainingExpr[0] === "*" &&
        factorialResult.remainingExpr[1] === "*"
      ) {
        // Multiplicative exponentiation (mpow)
        const powerExpr = factorialResult.remainingExpr.substring(2);
        const powerResult = Parser.#parseExponent(powerExpr);

        // For multiplicative exponentiation, always use mpow semantics
        let base = factorialResult.value;
        if (!(base instanceof RationalInterval)) {
          // Convert scalar to point interval for mpow
          base = RationalInterval.point(
            base instanceof Integer ? base.toRational() : base,
          );
        }
        const result = base.mpow(powerResult.value);
        result._skipPromotion = true;
        return {
          value: result,
          remainingExpr: powerResult.remainingExpr,
        };
      }
    }

    return factorialResult;
  }

  /**
   * Parses an exponent (must be an integer)
   * @private
   */
  static #parseExponent(expr) {
    let i = 0;
    let isNegative = false;

    // Handle negative exponents
    if (expr.length > 0 && expr[0] === "-") {
      isNegative = true;
      i++;
    }

    // Parse the exponent digits
    let exponentStr = "";
    while (i < expr.length && /\d/.test(expr[i])) {
      exponentStr += expr[i];
      i++;
    }

    if (exponentStr.length === 0) {
      throw new Error("Invalid exponent");
    }

    // Convert to BigInt with proper sign
    const exponent = isNegative ? -BigInt(exponentStr) : BigInt(exponentStr);

    return {
      value: exponent,
      remainingExpr: expr.substring(i),
    };
  }

  /**
   * Promotes a value to the most appropriate type for type-aware parsing
   * @private
   */
  static #promoteType(value, options = {}) {
    if (!options.typeAware) {
      return value;
    }

    // Don't promote if skipPromotion flag is set
    if (value && value._skipPromotion) {
      return value;
    }

    // If it's a RationalInterval point containing a whole number, convert to Integer
    // BUT only if it wasn't explicitly parsed as an interval (has explicitInterval flag)
    if (value instanceof RationalInterval && value.low.equals(value.high)) {
      // Don't promote if this was explicitly parsed as an interval
      if (value._explicitInterval) {
        return value;
      }

      if (value.low.denominator === 1n) {
        return new Integer(value.low.numerator);
      } else {
        return value.low; // Return as Rational
      }
    }

    // If it's a Rational with denominator 1, convert to Integer
    // BUT only if it wasn't explicitly written as a fraction (has explicitFraction flag)
    if (value instanceof Rational && value.denominator === 1n) {
      // Don't promote if this was explicitly written as a fraction
      if (value._explicitFraction) {
        return value;
      }
      return new Integer(value.numerator);
    }

    return value;
  }

  /**
   * Parses E notation and applies it to the given value
   * Uses base 10 for traditional E notation (when not in base-aware mode)
   * @private
   */
  static #parseENotation(value, expr, options = {}) {
    // Check if we should use base-aware E notation
    if (options.inputBase && options.inputBase !== BaseSystem.DECIMAL) {
      return Parser.#parseBaseAwareENotation(value, expr, options);
    }

    // expr should start with 'E' or 'TE'
    let spaceBeforeE = false;
    let startIndex = 1;

    if (expr.startsWith("TE")) {
      spaceBeforeE = true;
      startIndex = 2;
    } else if (expr[0] === "E") {
      spaceBeforeE = false;
      startIndex = 1;
    } else {
      throw new Error("Expected E notation");
    }

    // Parse the exponent after E
    const exponentResult = Parser.#parseExponent(expr.substring(startIndex));
    const exponent = exponentResult.value;

    // Apply E notation using the value's E method if available, or multiply by power of 10
    let result;
    if (value.E && typeof value.E === "function") {
      result = value.E(exponent);
    } else {
      // Create 10^exponent as a rational (always base 10 for standard E notation)
      let powerOf10;
      if (exponent >= 0n) {
        // Positive exponent: 10^n
        powerOf10 = new Rational(10n ** exponent);
      } else {
        // Negative exponent: 1/(10^(-n))
        powerOf10 = new Rational(1n, 10n ** -exponent);
      }

      // Multiply the value by 10^exponent
      result = value.multiply(powerOf10);
    }

    return {
      value: Parser.#promoteType(result, options),
      remainingExpr: exponentResult.remainingExpr,
    };
  }

  /**
   * Parses base-aware E notation (or _^ notation) and applies it to the given value
   * Uses the input base for both mantissa and exponent parsing
   * @private
   */
  static #parseBaseAwareENotation(value, expr, options = {}) {
    const baseSystem = options.inputBase;
    if (!baseSystem) {
      throw new Error("Base-aware E notation requires inputBase option");
    }

    // Determine notation type based on whether base contains E
    const baseContainsE =
      baseSystem.characters.includes("E") ||
      baseSystem.characters.includes("e");

    let notationType;
    let startIndex;

    if (baseContainsE) {
      // Use _^ notation
      if (!expr.startsWith("_^")) {
        throw new Error("Expected _^ notation for bases containing E");
      }
      notationType = "_^";
      startIndex = 2;
    } else {
      // Use E notation
      if (!expr.startsWith("E") && !expr.startsWith("e")) {
        throw new Error("Expected E notation");
      }
      notationType = "E";
      startIndex = 1;
    }

    // Extract exponent string
    let endIndex = startIndex;

    // Handle negative exponent
    if (endIndex < expr.length && expr[endIndex] === "-") {
      endIndex++;
    }

    // Parse exponent digits in the input base
    while (endIndex < expr.length) {
      const char = expr[endIndex];
      if (baseSystem.charMap.has(char)) {
        endIndex++;
      } else {
        break;
      }
    }

    if (
      endIndex === startIndex ||
      (endIndex === startIndex + 1 && expr[startIndex] === "-")
    ) {
      throw new Error(`Missing exponent after ${notationType} notation`);
    }

    const exponentStr = expr.substring(startIndex, endIndex);

    // Validate exponent contains only valid base characters
    const testExponentStr = exponentStr.startsWith("-")
      ? exponentStr.substring(1)
      : exponentStr;
    if (!baseSystem.isValidString(testExponentStr)) {
      throw new Error(
        `Invalid exponent "${exponentStr}" for base ${baseSystem.base}`,
      );
    }

    // Parse exponent in the input base
    let exponentDecimal;
    try {
      exponentDecimal = baseSystem.toDecimal(exponentStr);
    } catch (error) {
      throw new Error(
        `Failed to parse exponent "${exponentStr}": ${error.message}`,
      );
    }

    // Apply base-aware E notation: multiply by inputBase^exponent
    let powerOfBase;
    const baseBigInt = BigInt(baseSystem.base);

    if (exponentDecimal >= 0n) {
      // Positive exponent: base^n
      powerOfBase = new Rational(baseBigInt ** exponentDecimal);
    } else {
      // Negative exponent: 1/(base^(-n))
      powerOfBase = new Rational(1n, baseBigInt ** -exponentDecimal);
    }

    // Convert value to Rational for multiplication
    let valueRational;
    if (value instanceof Integer) {
      valueRational = value.toRational();
    } else if (value instanceof Rational) {
      valueRational = value;
    } else {
      throw new Error(
        `${notationType} notation can only be applied to simple numbers, not intervals`,
      );
    }

    const result = valueRational.multiply(powerOfBase);

    return {
      value: Parser.#promoteType(result, options),
      remainingExpr: expr.substring(endIndex),
    };
  }

  /**
   * Parses an interval of the form "a:b" or a single rational number
   * @private
   */
  static #parseInterval(expr, options = {}) {
    // Check if this is uncertainty notation first
    if (
      expr.includes("[") &&
      expr.includes("]") &&
      /^-?\d*\.?\d*\[/.test(expr)
    ) {
      try {
        const result = parseDecimalUncertainty(expr);
        return {
          value: result,
          remainingExpr: "",
        };
      } catch {
        // Fall through to other parsing methods
      }
    }

    // Check if this is continued fraction notation (contains .~)
    if (expr.includes('.~')) {
      try {
        const cfResult = Parser.#parseContinuedFraction(expr, options);
        return cfResult;
      } catch (error) {
        // Fall through to other parsing methods if CF parsing fails
      }
    }

    // Check if this is a simple decimal (no # and no :)
    if (
      expr.includes(".") &&
      !expr.includes("#") &&
      !expr.includes(":") &&
      !expr.includes("[")
    ) {
      // Find the end of the decimal number
      let endIndex = 0;
      let hasDecimalPoint = false;

      // Handle optional negative sign
      if (expr[endIndex] === "-") {
        endIndex++;
      }

      // Parse digits and decimal point - use input base if provided
      const baseSystem = options.inputBase || BaseSystem.DECIMAL;
      while (endIndex < expr.length) {
        const char = expr[endIndex];
        if (baseSystem.charMap.has(char)) {
          endIndex++;
        } else if (
          char === "." &&
          !hasDecimalPoint &&
          endIndex + 1 < expr.length &&
          expr[endIndex + 1] !== "."
        ) {
          hasDecimalPoint = true;
          endIndex++;
        } else {
          break;
        }
      }

      if (hasDecimalPoint && endIndex > (expr[0] === "-" ? 2 : 1)) {
        const decimalStr = expr.substring(0, endIndex);
        try {
          if (options.inputBase && options.inputBase !== BaseSystem.DECIMAL) {
            // Parse using input base
            const result = parseBaseNotation(
              decimalStr,
              options.inputBase,
              options,
            );
            return {
              value: result,
              remainingExpr: expr.substring(endIndex),
            };
          } else if (options.typeAware) {
            // Parse as exact rational using Rational constructor for type-aware parsing
            const result = new Rational(decimalStr);
            return {
              value: result,
              remainingExpr: expr.substring(endIndex),
            };
          } else {
            // Use parseNonRepeatingDecimal for backward compatibility (uncertainty intervals)
            const isNegative = decimalStr.startsWith("-");
            const absDecimalStr = isNegative
              ? decimalStr.substring(1)
              : decimalStr;
            const result = parseNonRepeatingDecimal(absDecimalStr, isNegative);
            return {
              value: result,
              remainingExpr: expr.substring(endIndex),
            };
          }
        } catch (error) {
          // Fall through to regular parsing if decimal parsing fails
        }
      }
    }

    // Check if this might be a repeating decimal interval first
    // Only try repeating decimal parsing if the string starts with a digit or decimal point
    // and contains both # and : symbols, indicating it's likely a repeating decimal interval
    if (expr.includes("#") && expr.includes(":") && /^-?[\d.]/.test(expr)) {
      // Find the colon position - need to be careful not to confuse with negative signs
      const colonIndex = expr.indexOf(":");
      if (colonIndex > 0) {
        // Check if the part before the colon looks like a repeating decimal (contains # or just digits/decimal)
        const beforeColon = expr.substring(0, colonIndex);
        const afterColonStart = expr.substring(colonIndex + 1);

        // Only try repeating decimal parsing if both parts look like they could be repeating decimals
        // (contain only digits, decimal points, # symbols, and optional minus sign)
        if (
          /^-?[\d.#]+$/.test(beforeColon) &&
          /^-?[\d.#]/.test(afterColonStart)
        ) {
          try {
            // Try to parse as repeating decimal interval
            const possibleInterval = parseRepeatingDecimal(expr);
            if (possibleInterval instanceof RationalInterval) {
              // Find how much of the expression this consumed
              let endIndex = expr.length;
              for (let i = 1; i < expr.length; i++) {
                const testExpr = expr.substring(0, i);
                try {
                  const testResult = parseRepeatingDecimal(testExpr);
                  if (testResult instanceof RationalInterval) {
                    // Check if this is followed by a non-digit character or end
                    if (i === expr.length || !/[\d#.\-]/.test(expr[i])) {
                      endIndex = i;
                      const finalResult = parseRepeatingDecimal(
                        expr.substring(0, endIndex),
                      );
                      if (finalResult instanceof RationalInterval) {
                        return {
                          value: finalResult,
                          remainingExpr: expr.substring(endIndex),
                        };
                      }
                    }
                  }
                } catch {
                  // Continue searching
                }
              }

              // Try parsing the whole expression as interval
              try {
                const result = parseRepeatingDecimal(expr);
                if (result instanceof RationalInterval) {
                  return {
                    value: result,
                    remainingExpr: "",
                  };
                }
              } catch {
                // Fall through to regular parsing
              }
            }
          } catch {
            // Fall through to regular rational parsing
          }
        }
      }
    }

    // Check for input base parsing first if specified
    if (
      options.inputBase &&
      options.inputBase !== BaseSystem.DECIMAL &&
      !expr.includes("[") &&
      !expr.includes("#")
    ) {
      // Try to parse the entire expression with input base first
      try {
        // Find the end of what could be a number in the input base
        let endIndex = 0;
        let hasDecimalPoint = false;
        let hasMixedNumber = false;
        let hasFraction = false;
        let hasColon = false;

        // Handle negative sign
        if (expr[endIndex] === "-") {
          endIndex++;
        }

        // Parse the number pattern
        while (endIndex < expr.length) {
          const char = expr[endIndex];

          if (options.inputBase.charMap.has(char)) {
            endIndex++;
          } else if (
            char === "." &&
            endIndex + 1 < expr.length &&
            expr[endIndex + 1] === "."
          ) {
            // Mixed number notation
            if (hasMixedNumber || hasDecimalPoint || hasFraction || hasColon)
              break;
            hasMixedNumber = true;
            endIndex += 2;
          } else if (char === "." && !hasDecimalPoint && !hasMixedNumber) {
            // Decimal point
            hasDecimalPoint = true;
            endIndex++;
          } else if (char === "/" && !hasFraction) {
            // Fraction
            hasFraction = true;
            endIndex++;
          } else if (
            char === ":" &&
            !hasColon &&
            !hasMixedNumber &&
            !hasDecimalPoint
          ) {
            // Interval notation
            hasColon = true;
            endIndex++;
          } else {
            break;
          }
        }

        // If we found a valid pattern, try parsing with input base
        if (endIndex > (expr[0] === "-" ? 1 : 0)) {
          const numberStr = expr.substring(0, endIndex);

          // Validate that all parts are valid in the input base
          const testStr = numberStr.startsWith("-")
            ? numberStr.substring(1)
            : numberStr;
          const parts = testStr.split(/[\.\/\:]/);
          const isValidInBase = parts.every((part, index) => {
            if (part === "") {
              return (
                testStr.includes(".") &&
                (index === 0 || index === parts.length - 1)
              );
            }
            return part
              .split("")
              .every((char) => options.inputBase.charMap.has(char));
          });

          if (isValidInBase) {
            const result = parseBaseNotation(
              numberStr,
              options.inputBase,
              options,
            );
            return {
              value: result,
              remainingExpr: expr.substring(endIndex),
            };
          }
        }
      } catch (error) {
        // Fall through to regular parsing
      }
    }

    // Parse the first rational number
    const firstResult = Parser.#parseRational(expr, options);

    // Check if there's E notation followed by a colon (like "3E1:4E1")
    let firstValue = firstResult.value;
    let remainingAfterFirst = firstResult.remainingExpr;

    // Look for E notation before checking for colon
    if (remainingAfterFirst.length > 0 && remainingAfterFirst[0] === "E") {
      // Find where the E notation ends by looking for non-digit characters after E
      let eEndIndex = 1; // Start after the 'E'
      if (
        eEndIndex < remainingAfterFirst.length &&
        remainingAfterFirst[eEndIndex] === "-"
      ) {
        eEndIndex++; // Skip negative sign
      }
      while (
        eEndIndex < remainingAfterFirst.length &&
        /\d/.test(remainingAfterFirst[eEndIndex])
      ) {
        eEndIndex++;
      }

      // If there's a colon after the E notation, this is an interval like "3E1:4E1"
      if (
        eEndIndex < remainingAfterFirst.length &&
        remainingAfterFirst[eEndIndex] === ":"
      ) {
        // Apply E notation to the first value
        const eNotationPart = remainingAfterFirst.substring(0, eEndIndex);
        const firstInterval = RationalInterval.point(firstResult.value);
        const eResult = Parser.#parseENotation(
          firstInterval,
          eNotationPart,
          options,
        );

        // Handle type-promoted result - extract the rational value
        if (eResult.value instanceof RationalInterval) {
          firstValue = eResult.value.low;
        } else if (eResult.value instanceof Rational) {
          firstValue = eResult.value;
        } else if (eResult.value instanceof Integer) {
          firstValue = eResult.value.toRational();
        } else {
          firstValue = eResult.value;
        }

        remainingAfterFirst = remainingAfterFirst.substring(eEndIndex);
      }
    }

    // If no colon follows, return the appropriate type based on parsing mode
    if (remainingAfterFirst.length === 0 || remainingAfterFirst[0] !== ":") {
      if (options.typeAware) {
        // Type-aware parsing: return Integer for whole numbers, Rational otherwise
        if (firstValue instanceof Rational && firstValue.denominator === 1n) {
          // Don't promote if this was explicitly written as a fraction
          if (firstValue._explicitFraction) {
            return {
              value: firstValue,
              remainingExpr: remainingAfterFirst,
            };
          }
          // This is a whole number, return as Integer
          return {
            value: new Integer(firstValue.numerator),
            remainingExpr: remainingAfterFirst,
          };
        }
        // Return as the original type (Rational)
        return {
          value: firstValue,
          remainingExpr: remainingAfterFirst,
        };
      } else {
        // Backward compatible parsing: always return point intervals
        const pointValue = RationalInterval.point(firstValue);
        return {
          value: pointValue,
          remainingExpr: remainingAfterFirst,
        };
      }
    }

    // Parse the second rational after the colon
    const secondRationalExpr = remainingAfterFirst.substring(1);
    const secondResult = Parser.#parseRational(secondRationalExpr, options);

    // Check if the second part has tight E notation
    let secondValue = secondResult.value;
    let remainingExpr = secondResult.remainingExpr;

    if (
      remainingExpr.length > 0 &&
      (remainingExpr[0] === "E" || remainingExpr.startsWith("_^"))
    ) {
      // Apply E notation to the second value only (only for tight binding, not spaced)
      const secondInterval = RationalInterval.point(secondResult.value);
      const eResult = Parser.#parseENotation(
        secondInterval,
        remainingExpr,
        options,
      );

      // Handle type-promoted result - extract the rational value
      if (eResult.value instanceof RationalInterval) {
        secondValue = eResult.value.low;
      } else if (eResult.value instanceof Rational) {
        secondValue = eResult.value;
      } else if (eResult.value instanceof Integer) {
        secondValue = eResult.value.toRational();
      } else {
        secondValue = eResult.value;
      }

      remainingExpr = eResult.remainingExpr;
    }

    // Mark this as an explicit interval to prevent type promotion
    const interval = new RationalInterval(firstValue, secondValue);
    interval._explicitInterval = true;

    return {
      value: interval,
      remainingExpr: remainingExpr,
    };
  }

  /**
   * Parses a rational number of the form "a/b", "a", mixed number "a..b/c", or repeating decimal "a.b#c"
   * Supports input base parsing when options.inputBase is provided
   * @private
   */
  static #parseRational(expr, options = {}) {
    if (expr.length === 0) {
      throw new Error("Unexpected end of expression");
    }

    // If inputBase is specified and this doesn't look like explicit base notation,
    // try parsing with the input base first
    if (
      options.inputBase &&
      options.inputBase !== BaseSystem.DECIMAL &&
      !expr.includes("[") &&
      !expr.includes("#")
    ) {
      // Find the end of what could be a number in the input base
      let endIndex = 0;
      let hasDecimalPoint = false;
      let hasMixedNumber = false;
      let hasFraction = false;

      // Handle negative sign
      if (expr[endIndex] === "-") {
        endIndex++;
      }

      // Parse the number pattern
      while (endIndex < expr.length) {
        const char = expr[endIndex];

        // Check if character is valid in base (with case normalization)
        let isValidChar = options.inputBase.charMap.has(char);

        // Handle case normalization for bases with letters
        if (!isValidChar) {
          const baseUsesLowercase = options.inputBase.characters.some(
            (ch) => ch >= "a" && ch <= "z",
          );
          const baseUsesUppercase = options.inputBase.characters.some(
            (ch) => ch >= "A" && ch <= "Z",
          );

          // If base uses only lowercase letters, accept uppercase input
          if (
            baseUsesLowercase &&
            !baseUsesUppercase &&
            char >= "A" &&
            char <= "Z"
          ) {
            isValidChar = options.inputBase.charMap.has(char.toLowerCase());
          }
          // If base uses only uppercase letters, accept lowercase input
          else if (
            baseUsesUppercase &&
            !baseUsesLowercase &&
            char >= "a" &&
            char <= "z"
          ) {
            isValidChar = options.inputBase.charMap.has(char.toUpperCase());
          }
        }

        if (isValidChar) {
          endIndex++;
        } else if (
          char === "." &&
          endIndex + 1 < expr.length &&
          expr[endIndex + 1] === "."
        ) {
          // Mixed number notation
          if (hasMixedNumber || hasDecimalPoint || hasFraction) break;
          hasMixedNumber = true;
          endIndex += 2;
        } else if (char === "." && !hasDecimalPoint && !hasMixedNumber) {
          // Decimal point
          hasDecimalPoint = true;
          endIndex++;
        } else if (char === "/" && !hasFraction) {
          // Fraction
          hasFraction = true;
          endIndex++;
        } else if (
          (char === "E" || char === "e") &&
          !options.inputBase.characters.includes("E") &&
          !options.inputBase.characters.includes("e")
        ) {
          // E notation in decimal (not part of base characters)
          break;
        } else if (
          char === "_" &&
          endIndex + 1 < expr.length &&
          expr[endIndex + 1] === "^"
        ) {
          // _^ notation
          break;
        } else {
          break;
        }
      }

      // If we found a valid number pattern and it looks like a valid base number, try parsing
      if (endIndex > (expr[0] === "-" ? 1 : 0)) {
        const numberStr = expr.substring(0, endIndex);

        // Check if this looks like a valid number in the input base
        const testStr = numberStr.startsWith("-")
          ? numberStr.substring(1)
          : numberStr;

        // Split on decimal point and slash, but handle empty parts correctly
        // For mixed numbers (12..101/211), we need special handling since ".." creates empty parts
        const parts = testStr.split(/[\.\/]/);
        const isValidInBase = parts.every((part, index) => {
          // Allow empty parts for decimal points (e.g., ".5" or "5.")
          // and for mixed numbers (e.g., "12..101" becomes ["12", "", "101"])
          if (part === "") {
            return (
              testStr.includes(".") &&
              (index === 0 ||
                index === parts.length - 1 ||
                testStr.includes(".."))
            );
          }
          // Check if all characters in this part are valid for the base
          // Handle case normalization for bases with letters
          const baseUsesLowercase = options.inputBase.characters.some(
            (char) => char >= "a" && char <= "z",
          );
          const baseUsesUppercase = options.inputBase.characters.some(
            (char) => char >= "A" && char <= "Z",
          );

          return part.split("").every((char) => {
            // Check direct match first
            if (options.inputBase.charMap.has(char)) {
              return true;
            }

            // If base uses only lowercase letters, check uppercase input
            if (
              baseUsesLowercase &&
              !baseUsesUppercase &&
              char >= "A" &&
              char <= "Z"
            ) {
              return options.inputBase.charMap.has(char.toLowerCase());
            }

            // If base uses only uppercase letters, check lowercase input
            if (
              baseUsesUppercase &&
              !baseUsesLowercase &&
              char >= "a" &&
              char <= "z"
            ) {
              return options.inputBase.charMap.has(char.toUpperCase());
            }

            return false;
          });
        });

        if (isValidInBase) {
          try {
            const result = parseBaseNotation(
              numberStr,
              options.inputBase,
              options,
            );
            return {
              value: result,
              remainingExpr: expr.substring(endIndex),
            };
          } catch (error) {
            // If base parsing fails, fall through to decimal parsing
          }
        }
      }
    }

    // Check for repeating decimal notation first
    let hashIndex = expr.indexOf("#");
    if (hashIndex !== -1) {
      // Only try repeating decimal parsing if the part before # looks like a decimal number
      // (contains only digits, decimal point, and optional minus sign)
      const beforeHash = expr.substring(0, hashIndex);
      if (/^-?(\d+\.?\d*|\.\d+)$/.test(beforeHash)) {
        // Find the end of the repeating decimal
        let endIndex = hashIndex + 1;
        while (endIndex < expr.length && /\d/.test(expr[endIndex])) {
          endIndex++;
        }

        const repeatingDecimalStr = expr.substring(0, endIndex);
        try {
          const result = parseRepeatingDecimal(repeatingDecimalStr);

          // If result is an interval, treat it as a point interval for the rational
          if (result instanceof RationalInterval) {
            // For parsing in expressions, use the midpoint of the interval
            const midpoint = result.low
              .add(result.high)
              .divide(new Rational(2));
            return {
              value: midpoint,
              remainingExpr: expr.substring(endIndex),
            };
          } else {
            return {
              value: result,
              remainingExpr: expr.substring(endIndex),
            };
          }
        } catch (error) {
          throw new Error(`Invalid repeating decimal: ${error.message}`);
        }
      }
    }

    // Check for regular decimal notation (contains single decimal point but no # and not mixed number ..)
    let decimalIndex = expr.indexOf(".");
    if (
      decimalIndex !== -1 &&
      decimalIndex + 1 < expr.length &&
      expr[decimalIndex + 1] !== "."
    ) {
      // Find the end of the decimal number
      let endIndex = 0;
      let hasDecimalPoint = false;

      // Handle optional negative sign
      if (expr[endIndex] === "-") {
        endIndex++;
      }

      // Parse digits and decimal point
      while (endIndex < expr.length) {
        if (/\d/.test(expr[endIndex])) {
          endIndex++;
        } else if (
          expr[endIndex] === "." &&
          !hasDecimalPoint &&
          endIndex + 1 < expr.length &&
          expr[endIndex + 1] !== "."
        ) {
          hasDecimalPoint = true;
          endIndex++;
        } else {
          break;
        }
      }

      if (hasDecimalPoint && endIndex > (expr[0] === "-" ? 2 : 1)) {
        const decimalStr = expr.substring(0, endIndex);
        try {
          const result = new Rational(decimalStr);
          return {
            value: result,
            remainingExpr: expr.substring(endIndex),
          };
        } catch (error) {
          // Fall through to regular parsing if decimal parsing fails
        }
      }
    }

    let i = 0;
    let numeratorStr = "";
    let denominatorStr = "";
    let isNegative = false;
    let wholePart = 0n;
    let hasMixedForm = false;

    // Handle negative sign
    if (expr[i] === "-") {
      isNegative = true;
      i++;
    }

    // Parse whole number part or numerator
    while (i < expr.length && /\d/.test(expr[i])) {
      numeratorStr += expr[i];
      i++;
    }

    if (numeratorStr.length === 0) {
      throw new Error("Invalid rational number format");
    }

    // Check for mixed number notation (double dot)
    if (i + 1 < expr.length && expr[i] === "." && expr[i + 1] === ".") {
      hasMixedForm = true;
      wholePart = isNegative ? -BigInt(numeratorStr) : BigInt(numeratorStr);
      isNegative = false; // Sign already applied to whole part
      i += 2; // Skip past the '..'

      // Reset for fraction part
      numeratorStr = "";

      // Parse numerator of fractional part
      while (i < expr.length && /\d/.test(expr[i])) {
        numeratorStr += expr[i];
        i++;
      }

      if (numeratorStr.length === 0) {
        throw new Error(
          'Invalid mixed number format: missing numerator after ".."',
        );
      }
    }

    // Track whether this was explicitly written as a fraction
    let explicitFraction = false;

    // Check for denominator
    if (i < expr.length && expr[i] === "/") {
      explicitFraction = true;
      i++;

      // Check for space marker after '/' - if present, treat as division operation
      if (i < expr.length && expr[i] === "S") {
        // There was whitespace after '/', so this should be division, not a fraction
        if (hasMixedForm) {
          throw new Error("Invalid mixed number format: missing denominator");
        }
        // Return just the numerator as a rational and let division be handled at term level
        const numerator = isNegative
          ? -BigInt(numeratorStr)
          : BigInt(numeratorStr);
        return {
          value: new Rational(numerator, 1n),
          remainingExpr: expr.substring(i - 1), // Include the '/' in remaining (skip the 'S')
        };
      }

      // Check if what follows is a simple numeric denominator or something complex
      if (i < expr.length && expr[i] === "(") {
        // Complex denominator starting with parentheses - don't try to parse here
        // Return what we have so far and let higher-level parsing handle the division
        if (hasMixedForm) {
          throw new Error("Invalid mixed number format: missing denominator");
        }
        // Return just the numerator as a rational and let division be handled at term level
        const numerator = isNegative
          ? -BigInt(numeratorStr)
          : BigInt(numeratorStr);
        return {
          value: new Rational(numerator, 1n),
          remainingExpr: expr.substring(i - 1), // Include the '/' in remaining
        };
      }

      while (i < expr.length && /\d/.test(expr[i])) {
        denominatorStr += expr[i];
        i++;
      }

      if (denominatorStr.length === 0) {
        throw new Error("Invalid rational number format");
      }

      // Check if E follows immediately after fraction (invalid)
      if (i < expr.length && expr[i] === "E") {
        throw new Error(
          "E notation not allowed directly after fraction without parentheses",
        );
      }
    } else {
      // If no denominator specified
      if (hasMixedForm) {
        throw new Error("Invalid mixed number format: missing denominator");
      }
      denominatorStr = "1";
    }

    // Check if E follows immediately after mixed number (invalid)
    if (hasMixedForm && i < expr.length && expr[i] === "E") {
      throw new Error(
        "E notation not allowed directly after mixed number without parentheses",
      );
    }

    // Create the rational number
    let numerator, denominator;

    if (hasMixedForm) {
      // Convert mixed number to improper fraction
      numerator = BigInt(numeratorStr);
      denominator = BigInt(denominatorStr);

      // Calculate: whole + numerator/denominator
      // => (whole * denominator + numerator) / denominator
      const sign = wholePart < 0n ? -1n : 1n;
      numerator =
        sign *
        ((wholePart.valueOf() < 0n ? -wholePart : wholePart) * denominator +
          numerator);
    } else {
      numerator = isNegative ? -BigInt(numeratorStr) : BigInt(numeratorStr);
      denominator = BigInt(denominatorStr);
    }

    // Handle division by zero within the parse step
    if (denominator === 0n) {
      throw new Error("Denominator cannot be zero");
    }

    const rational = new Rational(numerator, denominator);

    // Mark as explicit fraction if it was written with / and denominator is 1
    if (explicitFraction && denominator === 1n) {
      rational._explicitFraction = true;
    }

    return {
      value: rational,
      remainingExpr: expr.substring(i),
    };
  }

  /**
   * Parses continued fraction notation like 3.~7~15~1~292
   * @private
   */
  static #parseContinuedFraction(expr, options = {}) {
    // Match continued fraction pattern: integer.~term1~term2~...
    const cfMatch = expr.match(/^(-?\d+)\.~((?:\d+~?)*\d*)(.*)$/);
    if (!cfMatch) {
      throw new Error("Invalid continued fraction format");
    }

    const [fullMatch, integerPart, cfTermsStr, remaining] = cfMatch;
    
    // Validate format
    if (cfTermsStr === '') {
      throw new Error("Continued fraction must have at least one term after .~");
    }

    // Handle trailing tilde validation
    if (cfTermsStr.endsWith('~')) {
      throw new Error("Continued fraction cannot end with ~");
    }

    // Handle double tildes
    if (cfTermsStr.includes('~~')) {
      throw new Error("Invalid continued fraction format: double tilde");
    }

    // Parse the coefficient array
    const cfArray = Parser.parseContinuedFraction(fullMatch.substring(0, fullMatch.length - remaining.length));
    
    // Convert to Rational using the forthcoming fromContinuedFraction method
    // For now, we'll create a placeholder - this will be implemented when we add the Rational class method
    if (typeof Rational.fromContinuedFraction === 'function') {
      const rational = Rational.fromContinuedFraction(cfArray);
      return {
        value: rational,
        remainingExpr: remaining
      };
    } else {
      throw new Error("Continued fraction support not yet implemented in Rational class");
    }
  }

  /**
   * Parses a continued fraction string into coefficient array
   * This is the stand-alone parsing that generates array of coefficients
   * @param {string} cfString - String like "3.~7~15~1~292"
   * @returns {Array<bigint>} Array [integer_part, ...continued_fraction_terms]
   */
  static parseContinuedFraction(cfString) {
    // Match the pattern
    const cfMatch = cfString.match(/^(-?\d+)\.~(.*)$/);
    if (!cfMatch) {
      throw new Error("Invalid continued fraction format");
    }

    const [, integerPart, cfTermsStr] = cfMatch;
    
    // Parse integer part
    const intPart = BigInt(integerPart);
    
    // Handle special case of integer representation like "5.~0"
    if (cfTermsStr === '0') {
      return [intPart];
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

    // Split terms and validate they are all positive integers (except the integer part)
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

    return [intPart, ...cfTerms];
  }
}

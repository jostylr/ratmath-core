/**
 * Parser.js
 * 
 * A parser for rational interval arithmetic expressions.
 * Handles expressions with intervals, arithmetic operations, and parentheses.
 */

import { Rational } from './rational.js';
import { RationalInterval } from './rational-interval.js';

/**
 * Parses a repeating decimal string and returns the exact rational equivalent
 * 
 * @param {string} str - String like "0.12#45" or "733.#3" or "1.23#0"
 * @returns {Rational|RationalInterval} The exact rational representation, or interval for non-repeating decimals
 * @throws {Error} If the string format is invalid
 */
export function parseRepeatingDecimal(str) {
  if (!str || typeof str !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  str = str.trim();
  
  // Handle negative numbers
  const isNegative = str.startsWith('-');
  if (isNegative) {
    str = str.substring(1);
  }

  // Check if this is a non-repeating decimal (no # symbol)
  if (!str.includes('#')) {
    return parseNonRepeatingDecimal(str, isNegative);
  }

  // Split on the # symbol
  const parts = str.split('#');
  if (parts.length !== 2) {
    throw new Error('Invalid repeating decimal format. Use format like "0.12#45"');
  }

  const [nonRepeatingPart, repeatingPart] = parts;
  
  // Validate repeating part
  if (!/^\d+$/.test(repeatingPart)) {
    throw new Error('Repeating part must contain only digits');
  }

  // Handle special case where repeating part is "0" - this means the decimal terminates
  if (repeatingPart === '0') {
    try {
      // Convert decimal string to rational manually
      const decimalParts = nonRepeatingPart.split('.');
      if (decimalParts.length > 2) {
        throw new Error('Invalid decimal format - multiple decimal points');
      }
      
      const integerPart = decimalParts[0] || '0';
      const fractionalPart = decimalParts[1] || '';
      
      if (!/^\d*$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
        throw new Error('Decimal must contain only digits and at most one decimal point');
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
  const decimalParts = nonRepeatingPart.split('.');
  if (decimalParts.length > 2) {
    throw new Error('Invalid decimal format - multiple decimal points');
  }

  const integerPart = decimalParts[0] || '0';
  const fractionalPart = decimalParts[1] || '';

  // Validate parts contain only digits
  if (!/^\d*$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
    throw new Error('Non-repeating part must contain only digits and at most one decimal point');
  }

  // Calculate the rational representation
  const n = fractionalPart.length; // number of non-repeating fractional digits
  const m = repeatingPart.length;  // number of repeating digits

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
  const decimalParts = str.split('.');
  if (decimalParts.length > 2) {
    throw new Error('Invalid decimal format - multiple decimal points');
  }

  const integerPart = decimalParts[0] || '0';
  const fractionalPart = decimalParts[1] || '';

  if (!/^\d+$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
    throw new Error('Decimal must contain only digits and at most one decimal point');
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

export class Parser {
  /**
   * Parses a string representing an interval arithmetic expression
   * 
   * @param {string} expression - The expression to parse
   * @returns {RationalInterval} The result of evaluating the expression
   * @throws {Error} If the expression syntax is invalid
   */
  static parse(expression) {
    if (!expression || expression.trim() === '') {
      throw new Error('Expression cannot be empty');
    }

    // Remove all whitespace
    expression = expression.replace(/\s+/g, '');
    
    // Parse the expression
    const result = Parser.#parseExpression(expression);
    
    if (result.remainingExpr.length > 0) {
      throw new Error(`Unexpected token at end: ${result.remainingExpr}`);
    }
    
    return result.value;
  }

  /**
   * Parses an expression with addition and subtraction
   * @private
   */
  static #parseExpression(expr) {
    let result = Parser.#parseTerm(expr);
    let currentExpr = result.remainingExpr;
    
    while (currentExpr.length > 0 && (currentExpr[0] === '+' || currentExpr[0] === '-')) {
      const operator = currentExpr[0];
      currentExpr = currentExpr.substring(1);
      
      const termResult = Parser.#parseTerm(currentExpr);
      currentExpr = termResult.remainingExpr;
      
      if (operator === '+') {
        result.value = result.value.add(termResult.value);
      } else {
        result.value = result.value.subtract(termResult.value);
      }
    }
    
    return { value: result.value, remainingExpr: currentExpr };
  }

  /**
   * Parses a term with multiplication and division
   * @private
   */
  static #parseTerm(expr) {
    let result = Parser.#parseFactor(expr);
    let currentExpr = result.remainingExpr;
    
    while (currentExpr.length > 0 && (currentExpr[0] === '*' || currentExpr[0] === '/')) {
      const operator = currentExpr[0];
      currentExpr = currentExpr.substring(1);
      
      const factorResult = Parser.#parseFactor(currentExpr);
      currentExpr = factorResult.remainingExpr;
      
      if (operator === '*') {
        result.value = result.value.multiply(factorResult.value);
      } else {
        // Let the RationalInterval.divide method handle errors
        result.value = result.value.divide(factorResult.value);
      }
    }
    
    return { value: result.value, remainingExpr: currentExpr };
  }

  /**
   * Parses a factor (interval, number, or parenthesized expression)
   * @private
   */
  static #parseFactor(expr) {
    if (expr.length === 0) {
      throw new Error('Unexpected end of expression');
    }
    
    // Handle parenthesized expressions
    if (expr[0] === '(') {
      const subExprResult = Parser.#parseExpression(expr.substring(1));
      
      if (subExprResult.remainingExpr.length === 0 || subExprResult.remainingExpr[0] !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      
      const result = {
        value: subExprResult.value,
        remainingExpr: subExprResult.remainingExpr.substring(1)
      };
      
      // Check for exponentiation after the closing parenthesis
      if (result.remainingExpr.length > 0) {
        if (result.remainingExpr[0] === '^') {
          // Standard exponentiation (pow)
          const powerExpr = result.remainingExpr.substring(1);
          const powerResult = Parser.#parseExponent(powerExpr);
          
          // Check for 0^0
          const zero = new Rational(0);
          if (result.value.low.equals(zero) && result.value.high.equals(zero) && powerResult.value === 0n) {
            throw new Error("Zero cannot be raised to the power of zero");
          }
          
          return {
            value: result.value.pow(powerResult.value),
            remainingExpr: powerResult.remainingExpr
          };
        } else if (result.remainingExpr.length > 1 && 
                  result.remainingExpr[0] === '*' && 
                  result.remainingExpr[1] === '*') {
          // Multiplicative exponentiation (mpow)
          const powerExpr = result.remainingExpr.substring(2);
          const powerResult = Parser.#parseExponent(powerExpr);
          
          return {
            value: result.value.mpow(powerResult.value),
            remainingExpr: powerResult.remainingExpr
          };
        }
      }
      
      return result;
    }
    
    // Check for negation
    if (expr[0] === '-') {
      const factorResult = Parser.#parseFactor(expr.substring(1));
      
      // Create a negative interval by multiplying by -1
      const negOne = new Rational(-1);
      const negInterval = RationalInterval.point(negOne);
      
      return {
        value: negInterval.multiply(factorResult.value),
        remainingExpr: factorResult.remainingExpr
      };
    }
    
    // Try to parse an interval or a single rational number
    const intervalResult = Parser.#parseInterval(expr);
    
    // Check for exponentiation
    if (intervalResult.remainingExpr.length > 0) {
      if (intervalResult.remainingExpr[0] === '^') {
        // Standard exponentiation (pow)
        const powerExpr = intervalResult.remainingExpr.substring(1);
        const powerResult = Parser.#parseExponent(powerExpr);
        
        // Special case for 0^0
        const zero = new Rational(0);
        if (intervalResult.value.low.equals(zero) && intervalResult.value.high.equals(zero) && powerResult.value === 0n) {
          throw new Error("Zero cannot be raised to the power of zero");
        }
        
        // Let the RationalInterval.pow method handle errors
        const result = intervalResult.value.pow(powerResult.value);
        return {
          value: result,
          remainingExpr: powerResult.remainingExpr
        };
      } else if (intervalResult.remainingExpr.length > 1 && 
                 intervalResult.remainingExpr[0] === '*' && 
                 intervalResult.remainingExpr[1] === '*') {
        // Multiplicative exponentiation (mpow)
        const powerExpr = intervalResult.remainingExpr.substring(2);
        const powerResult = Parser.#parseExponent(powerExpr);
        
        // Let the RationalInterval.mpow method handle errors
        const result = intervalResult.value.mpow(powerResult.value);
        return {
          value: result,
          remainingExpr: powerResult.remainingExpr
        };
      }
    }
    
    return intervalResult;
  }

  /**
   * Parses an exponent (must be an integer)
   * @private
   */
  static #parseExponent(expr) {
    let i = 0;
    let isNegative = false;
    
    // Handle negative exponents
    if (expr.length > 0 && expr[0] === '-') {
      isNegative = true;
      i++;
    }
    
    // Parse the exponent digits
    let exponentStr = '';
    while (i < expr.length && /\d/.test(expr[i])) {
      exponentStr += expr[i];
      i++;
    }
    
    if (exponentStr.length === 0) {
      throw new Error('Invalid exponent');
    }
    
    // Convert to BigInt with proper sign
    const exponent = isNegative ? -BigInt(exponentStr) : BigInt(exponentStr);
    
    return {
      value: exponent,
      remainingExpr: expr.substring(i)
    };
  }

  /**
   * Parses an interval of the form "a/b:c/d" or a single rational "a/b"
   * @private
   */
  static #parseInterval(expr) {
    // Parse the first rational number
    const firstResult = Parser.#parseRational(expr);
    
    // If no colon follows, treat it as a point interval
    if (firstResult.remainingExpr.length === 0 || firstResult.remainingExpr[0] !== ':') {
      // Create a point interval
      const pointValue = RationalInterval.point(firstResult.value);
      return {
        value: pointValue,
        remainingExpr: firstResult.remainingExpr
      };
    }
    
    // Parse the second rational after the colon
    const secondResult = Parser.#parseRational(firstResult.remainingExpr.substring(1));
    
    return {
      value: new RationalInterval(firstResult.value, secondResult.value),
      remainingExpr: secondResult.remainingExpr
    };
  }

  /**
   * Parses a rational number of the form "a/b", "a", mixed number "a..b/c", or repeating decimal "a.b#c"
   * @private
   */
  static #parseRational(expr) {
    if (expr.length === 0) {
      throw new Error('Unexpected end of expression');
    }
    
    // Check for repeating decimal notation first
    let hashIndex = expr.indexOf('#');
    if (hashIndex !== -1) {
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
          const midpoint = result.low.add(result.high).divide(new Rational(2));
          return {
            value: midpoint,
            remainingExpr: expr.substring(endIndex)
          };
        } else {
          return {
            value: result,
            remainingExpr: expr.substring(endIndex)
          };
        }
      } catch (error) {
        throw new Error(`Invalid repeating decimal: ${error.message}`);
      }
    }
    
    let i = 0;
    let numeratorStr = '';
    let denominatorStr = '';
    let isNegative = false;
    let wholePart = 0n;
    let hasMixedForm = false;
    
    // Handle negative sign
    if (expr[i] === '-') {
      isNegative = true;
      i++;
    }
    
    // Parse whole number part or numerator
    while (i < expr.length && /\d/.test(expr[i])) {
      numeratorStr += expr[i];
      i++;
    }
    
    if (numeratorStr.length === 0) {
      throw new Error('Invalid rational number format');
    }
    
    // Check for mixed number notation (double dot)
    if (i + 1 < expr.length && expr[i] === '.' && expr[i + 1] === '.') {
      hasMixedForm = true;
      wholePart = isNegative ? -BigInt(numeratorStr) : BigInt(numeratorStr);
      isNegative = false;  // Sign already applied to whole part
      i += 2;  // Skip past the '..'
      
      // Reset for fraction part
      numeratorStr = '';
      
      // Parse numerator of fractional part
      while (i < expr.length && /\d/.test(expr[i])) {
        numeratorStr += expr[i];
        i++;
      }
      
      if (numeratorStr.length === 0) {
        throw new Error('Invalid mixed number format: missing numerator after ".."');
      }
    }
    
    // Check for denominator
    if (i < expr.length && expr[i] === '/') {
      i++;
      while (i < expr.length && /\d/.test(expr[i])) {
        denominatorStr += expr[i];
        i++;
      }
      
      if (denominatorStr.length === 0) {
        throw new Error('Invalid rational number format');
      }
    } else {
      // If no denominator specified
      if (hasMixedForm) {
        throw new Error('Invalid mixed number format: missing denominator');
      }
      denominatorStr = '1';
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
      numerator = (sign * ((wholePart.valueOf() < 0n ? -wholePart : wholePart) * denominator + numerator));
    } else {
      numerator = isNegative ? -BigInt(numeratorStr) : BigInt(numeratorStr);
      denominator = BigInt(denominatorStr);
    }
    
    // Handle division by zero within the parse step
    if (denominator === 0n) {
      throw new Error('Denominator cannot be zero');
    }
    
    return {
      value: new Rational(numerator, denominator),
      remainingExpr: expr.substring(i)
    };
  }
}
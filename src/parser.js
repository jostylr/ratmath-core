/**
 * Parser.js
 * 
 * A parser for rational interval arithmetic expressions.
 * Handles expressions with intervals, arithmetic operations, and parentheses.
 */

import { Rational } from './rational.js';
import { RationalInterval } from './rational-interval.js';

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
   * Parses a rational number of the form "a/b", "a", or mixed number "a..b/c"
   * @private
   */
  static #parseRational(expr) {
    if (expr.length === 0) {
      throw new Error('Unexpected end of expression');
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
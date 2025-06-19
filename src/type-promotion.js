/**
 * TypePromotion.js
 *
 * Utility class for handling type promotions between Integer, Rational, and RationalInterval.
 * Implements the promotion hierarchy: Integer -> Rational -> RationalInterval
 */

import { Integer } from './integer.js';
import { Rational } from './rational.js';
import { RationalInterval } from './rational-interval.js';

export class TypePromotion {
  /**
   * Determines the type level for promotion hierarchy
   * @param {Integer|Rational|RationalInterval} value - The value to check
   * @returns {number} 0 for Integer, 1 for Rational, 2 for RationalInterval
   */
  static getTypeLevel(value) {
    if (value instanceof Integer) return 0;
    if (value instanceof Rational) return 1;
    if (value instanceof RationalInterval) return 2;
    throw new Error(`Unknown type: ${value.constructor.name}`);
  }

  /**
   * Promotes an Integer to a Rational
   * @param {Integer} integer - The Integer to promote
   * @returns {Rational} The promoted Rational
   */
  static integerToRational(integer) {
    return new Rational(integer.value, 1n);
  }

  /**
   * Promotes a Rational to a RationalInterval (point interval)
   * @param {Rational} rational - The Rational to promote
   * @returns {RationalInterval} The promoted RationalInterval
   */
  static rationalToInterval(rational) {
    return new RationalInterval(rational, rational);
  }

  /**
   * Promotes an Integer to a RationalInterval (point interval)
   * @param {Integer} integer - The Integer to promote
   * @returns {RationalInterval} The promoted RationalInterval
   */
  static integerToInterval(integer) {
    const rational = TypePromotion.integerToRational(integer);
    return TypePromotion.rationalToInterval(rational);
  }

  /**
   * Promotes a value to the target type level
   * @param {Integer|Rational|RationalInterval} value - The value to promote
   * @param {number} targetLevel - The target type level (0=Integer, 1=Rational, 2=RationalInterval)
   * @returns {Integer|Rational|RationalInterval} The promoted value
   */
  static promoteToLevel(value, targetLevel) {
    const currentLevel = TypePromotion.getTypeLevel(value);

    if (!Number.isInteger(targetLevel) || targetLevel < 0 || targetLevel > 2) {
      throw new Error(`Invalid target level: ${targetLevel}`);
    }
    
    if (currentLevel === targetLevel) {
      return value;
    }
    
    if (currentLevel > targetLevel) {
      throw new Error(`Cannot demote from level ${currentLevel} to level ${targetLevel}`);
    }

    // Promote step by step
    let promoted = value;
    for (let level = currentLevel; level < targetLevel; level++) {
      if (level === 0) {
        // Integer -> Rational
        promoted = TypePromotion.integerToRational(promoted);
      } else if (level === 1) {
        // Rational -> RationalInterval
        promoted = TypePromotion.rationalToInterval(promoted);
      }
    }
    
    return promoted;
  }

  /**
   * Promotes two values to the same type level (the higher of the two)
   * @param {Integer|Rational|RationalInterval} a - First value
   * @param {Integer|Rational|RationalInterval} b - Second value
   * @returns {Array} Array containing [promotedA, promotedB]
   */
  static promoteToCommonType(a, b) {
    const levelA = TypePromotion.getTypeLevel(a);
    const levelB = TypePromotion.getTypeLevel(b);
    const targetLevel = Math.max(levelA, levelB);
    
    return [
      TypePromotion.promoteToLevel(a, targetLevel),
      TypePromotion.promoteToLevel(b, targetLevel)
    ];
  }

  /**
   * Performs addition with automatic type promotion
   * @param {Integer|Rational|RationalInterval} a - First operand
   * @param {Integer|Rational|RationalInterval} b - Second operand
   * @returns {Integer|Rational|RationalInterval} The result with appropriate type
   */
  static add(a, b) {
    const [promotedA, promotedB] = TypePromotion.promoteToCommonType(a, b);
    return promotedA.add(promotedB);
  }

  /**
   * Performs subtraction with automatic type promotion
   * @param {Integer|Rational|RationalInterval} a - First operand
   * @param {Integer|Rational|RationalInterval} b - Second operand
   * @returns {Integer|Rational|RationalInterval} The result with appropriate type
   */
  static subtract(a, b) {
    const [promotedA, promotedB] = TypePromotion.promoteToCommonType(a, b);
    return promotedA.subtract(promotedB);
  }

  /**
   * Performs multiplication with automatic type promotion
   * @param {Integer|Rational|RationalInterval} a - First operand
   * @param {Integer|Rational|RationalInterval} b - Second operand
   * @returns {Integer|Rational|RationalInterval} The result with appropriate type
   */
  static multiply(a, b) {
    const [promotedA, promotedB] = TypePromotion.promoteToCommonType(a, b);
    return promotedA.multiply(promotedB);
  }

  /**
   * Performs division with automatic type promotion
   * Note: Integer division may return Rational if not exact
   * @param {Integer|Rational|RationalInterval} a - First operand
   * @param {Integer|Rational|RationalInterval} b - Second operand
   * @returns {Integer|Rational|RationalInterval} The result with appropriate type
   */
  static divide(a, b) {
    // Special case: Integer / Integer might return Integer or Rational
    if (a instanceof Integer && b instanceof Integer) {
      return a.divide(b); // Integer.divide handles this logic
    }
    
    const [promotedA, promotedB] = TypePromotion.promoteToCommonType(a, b);
    return promotedA.divide(promotedB);
  }

  /**
   * Performs E notation multiplication with automatic type promotion
   * @param {Integer|Rational|RationalInterval} base - The base value
   * @param {number|bigint} exponent - The exponent for 10^exponent
   * @returns {Integer|Rational|RationalInterval} The result with appropriate type
   */
  static eNotation(base, exponent) {
    // Use the base's E method if available, otherwise promote and use
    if (base.E && typeof base.E === 'function') {
      return base.E(exponent);
    }
    
    // Fallback: convert to rational and apply E notation
    const exp = BigInt(exponent);
    const powerOf10 = exp >= 0n 
      ? new Rational(10n ** exp, 1n)
      : new Rational(1n, 10n ** (-exp));
    
    return TypePromotion.multiply(base, powerOf10);
  }

  /**
   * Performs exponentiation with automatic type promotion
   * @param {Integer|Rational|RationalInterval} base - The base value
   * @param {number|bigint} exponent - The exponent
   * @returns {Integer|Rational|RationalInterval} The result with appropriate type
   */
  static power(base, exponent) {
    // Use the base's pow method
    return base.pow(exponent);
  }

  /**
   * Performs multiplicative exponentiation with automatic type promotion
   * @param {Integer|Rational|RationalInterval} base - The base value
   * @param {number|bigint} exponent - The exponent
   * @returns {Integer|Rational|RationalInterval} The result with appropriate type
   */
  static multiplyPower(base, exponent) {
    // Use the base's mpow method if available, otherwise fallback to pow
    if (base.mpow && typeof base.mpow === 'function') {
      return base.mpow(exponent);
    }
    return base.pow(exponent);
  }

  /**
   * Negates a value while preserving type
   * @param {Integer|Rational|RationalInterval} value - The value to negate
   * @returns {Integer|Rational|RationalInterval} The negated value
   */
  static negate(value) {
    if (value instanceof Integer) {
      return value.negate();
    } else if (value instanceof Rational) {
      return value.negate();
    } else if (value instanceof RationalInterval) {
      // For intervals, negate by multiplying by -1
      const negOne = new Rational(-1n, 1n);
      const negInterval = new RationalInterval(negOne, negOne);
      return negInterval.multiply(value);
    }
    throw new Error(`Cannot negate unknown type: ${value.constructor.name}`);
  }

  /**
   * Determines the appropriate return type for a numeric string
   * @param {string} str - The numeric string to analyze
   * @returns {string} 'integer', 'rational', or 'interval'
   */
  static determineTypeFromString(str) {
    // Check for interval notation
    if (str.includes(':')) {
      return 'interval';
    }
    
    // Check for rational notation
    if (str.includes('/') || str.includes('..') || str.includes('.')) {
      return 'rational';
    }
    
    // Check for uncertainty notation (contains [...])
    if (str.includes('[') && str.includes(']')) {
      return 'interval';
    }
    
    // Default to integer for whole numbers
    return 'integer';
  }
}
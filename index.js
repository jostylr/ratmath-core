/**
 * ratmath - A library for exact rational arithmetic and interval arithmetic
 *
 * This module exports classes for working with exact rational numbers
 * and rational intervals, along with a parser for interval expressions.
 */

import { Rational } from "./src/rational.js";
import { RationalInterval } from "./src/rational-interval.js";
import { Parser, parseRepeatingDecimal } from "./src/parser.js";
import { Fraction } from "./src/fraction.js";
import { FractionInterval } from "./src/fraction-interval.js";
import { Integer } from "./src/integer.js";
import { TypePromotion } from "./src/type-promotion.js";
import { BaseSystem } from "./src/base-system.js";

/**
 * Template string function for parsing rational arithmetic expressions
 * Uses the main parser with type-aware parsing (returns Integer, Rational, or RationalInterval)
 * 
 * @param {TemplateStringsArray} strings - Template string parts
 * @param {...any} values - Interpolated values
 * @returns {Integer|Rational|RationalInterval} Parsed result
 * 
 * @example
 * const n = 3, m = 5;
 * const result = R`${n}/${m}`;  // Parses '3/5' -> Rational(3/5)
 * 
 * @example
 * const a = 2, b = 4;
 * const interval = R`${a}:${b}`;  // Parses '2:4' -> RationalInterval(2, 4)
 * 
 * @example
 * const x = 1, y = 2, z = 3;
 * const calc = R`${x}/${y} + ${z}`;  // Parses '1/2 + 3' -> Rational(7/2)
 */
function R(strings, ...values) {
  let input = '';
  for (let i = 0; i < values.length; i++) {
    input += strings[i] + values[i];
  }
  input += strings[strings.length - 1];
  return Parser.parse(input, { typeAware: true });
}

/**
 * Template string function for parsing into Fraction and FractionInterval types
 * Forces results to use Fraction/FractionInterval classes regardless of input
 * 
 * @param {TemplateStringsArray} strings - Template string parts
 * @param {...any} values - Interpolated values
 * @returns {Fraction|FractionInterval} Parsed result as Fraction types
 * 
 * @example
 * const n = 3, m = 5;
 * const frac = F`${n}/${m}`;  // Parses '3/5' -> Fraction(3, 5)
 * 
 * @example
 * const a = 1, b = 2, c = 3, d = 4;
 * const fracInterval = F`${a}/${b}:${c}/${d}`;  // FractionInterval(1/2, 3/4)
 * 
 * @example
 * const x = 4;
 * const whole = F`${x}`;  // Parses '4' -> Fraction(4, 1)
 */
function F(strings, ...values) {
  let input = '';
  for (let i = 0; i < values.length; i++) {
    input += strings[i] + values[i];
  }
  input += strings[strings.length - 1];

  // Parse with type-aware disabled to get intervals when appropriate
  const result = Parser.parse(input, { typeAware: false });

  // Convert result to Fraction types
  if (result instanceof RationalInterval) {
    // Check if this is a point interval (low equals high)
    if (result.low.equals(result.high)) {
      // Convert point interval to single Fraction
      return Fraction.fromRational(result.low);
    } else {
      // Convert RationalInterval to FractionInterval
      const lowFrac = Fraction.fromRational(result.low);
      const highFrac = Fraction.fromRational(result.high);
      return new FractionInterval(lowFrac, highFrac);
    }
  } else if (result instanceof Rational) {
    // Convert Rational to Fraction
    return Fraction.fromRational(result);
  } else if (result instanceof Integer) {
    // Convert Integer to Fraction
    return new Fraction(result.value, 1n);
  } else {
    // Fallback: convert whatever we got to Fraction
    const rational = result.toRational ? result.toRational() : new Rational(result.toString());
    return Fraction.fromRational(rational);
  }
}

// Export named exports
export {
  Rational,
  RationalInterval,
  Parser,
  parseRepeatingDecimal,
  Fraction,
  FractionInterval,
  Integer,
  TypePromotion,
  BaseSystem,
  R,
  F,
};

// Default export for convenient importing
export default {
  Rational,
  RationalInterval,
  Parser,
  parseRepeatingDecimal,
  Fraction,
  FractionInterval,
  Integer,
  TypePromotion,
  BaseSystem,
  R,
  F,
};

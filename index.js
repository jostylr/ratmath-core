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
};

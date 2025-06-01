/**
 * ratmath - A library for exact rational arithmetic and interval arithmetic
 * 
 * This module exports classes for working with exact rational numbers
 * and rational intervals, along with a parser for interval expressions.
 */

import { Rational } from './rational.js';
import { RationalInterval } from './rational-interval.js';
import { Parser } from './parser.js';
import { Fraction } from './fraction.js';
import { FractionInterval } from './fraction-interval.js';

// Export named exports
export { Rational, RationalInterval, Parser, Fraction, FractionInterval };

// Default export for convenient importing
export default {
  Rational,
  RationalInterval,
  Parser,
  Fraction,
  FractionInterval
};
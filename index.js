/**
 * ratmath - A library for exact rational arithmetic and interval arithmetic
 *
 * This module exports classes for working with exact rational numbers
 * and rational intervals, along with number-only parsing helpers.
 */

import { Rational } from "./src/rational.js";
import { RationalInterval } from "./src/rational-interval.js";
import { RationalIntervalSet } from "./src/rational-interval-set.js";
import { Fraction } from "./src/fraction.js";
import { FractionInterval } from "./src/fraction-interval.js";
import { Integer } from "./src/integer.js";
import { TypePromotion } from "./src/type-promotion.js";
import { BaseSystem } from "./src/base-system.js";
import {
  CertifiedApproximation,
  Relation,
  boundedContinuedFractionApproximation,
  boundedDecimalApproximation,
  certifiedContinuedFractionPrefix,
  certifiedRadixPrefix,
  normalizeCertifiedApproximation,
  possibleRelations,
} from "./src/certified-approximation.js";
import {
  parseContinuedFraction,
  parseCertifiedApproximation,
  parseDecimal,
  parseInterval,
  parseMixedNumber,
  parseNumber,
  parseRational,
  parseRepeatingDecimal,
} from "./src/number-parser.js";
import {
  isBaseSystem,
  isCertifiedApproximation,
  isCoreNumber,
  isFraction,
  isFractionInterval,
  isInteger,
  isRational,
  isRationalInterval,
  isRationalIntervalSet,
  reviveCoreValue,
} from "./src/core-values.js";

// Export named exports
export {
  Rational,
  RationalInterval,
  RationalIntervalSet,
  Fraction,
  FractionInterval,
  Integer,
  TypePromotion,
  BaseSystem,
  CertifiedApproximation,
  Relation,
  boundedContinuedFractionApproximation,
  boundedDecimalApproximation,
  certifiedContinuedFractionPrefix,
  certifiedRadixPrefix,
  normalizeCertifiedApproximation,
  possibleRelations,
  parseContinuedFraction,
  parseCertifiedApproximation,
  parseDecimal,
  parseInterval,
  parseMixedNumber,
  parseNumber,
  parseRational,
  parseRepeatingDecimal,
  isBaseSystem,
  isCertifiedApproximation,
  isCoreNumber,
  isFraction,
  isFractionInterval,
  isInteger,
  isRational,
  isRationalInterval,
  isRationalIntervalSet,
  reviveCoreValue,
};

// Default export for convenient importing
export default {
  Rational,
  RationalInterval,
  RationalIntervalSet,
  Fraction,
  FractionInterval,
  Integer,
  TypePromotion,
  BaseSystem,
  CertifiedApproximation,
  Relation,
  boundedContinuedFractionApproximation,
  boundedDecimalApproximation,
  certifiedContinuedFractionPrefix,
  certifiedRadixPrefix,
  normalizeCertifiedApproximation,
  possibleRelations,
  parseContinuedFraction,
  parseCertifiedApproximation,
  parseDecimal,
  parseInterval,
  parseMixedNumber,
  parseNumber,
  parseRational,
  parseRepeatingDecimal,
  isBaseSystem,
  isCertifiedApproximation,
  isCoreNumber,
  isFraction,
  isFractionInterval,
  isInteger,
  isRational,
  isRationalInterval,
  isRationalIntervalSet,
  reviveCoreValue,
};

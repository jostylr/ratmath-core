/**
 * Number-only parsing for RatMath core.
 *
 * This intentionally does not parse arithmetic expressions. It accepts the
 * exact numeric literal forms shared with RiX and returns RatMath values.
 */

import { Integer } from "./integer.js";
import { Rational } from "./rational.js";
import { RationalInterval } from "./rational-interval.js";
import {
  CertifiedApproximation,
  certifiedContinuedFractionPrefix,
  certifiedRadixPrefix,
} from "./certified-approximation.js";
import {
  DIGITS,
  cleanDigits,
  inputString,
  parseDecimalParts,
  parseRationalParts,
} from "./rational-literal.js";

function parseDecimalValue(input) {
  const [numerator, denominator] = parseDecimalParts(input);
  return new Rational(numerator, denominator);
}

function parseRationalLiteral(input) {
  const [numerator, denominator] = parseRationalParts(input);
  return new Rational(numerator, denominator);
}

function decimalShape(input) {
  const match = input.match(
    new RegExp(`^([+-]?)(?:(${DIGITS})(?:\\.(${DIGITS})?)?|\\.(${DIGITS}))$`),
  );
  if (!match) {
    throw new Error(
      "Decimal interval notation requires an integer or finite decimal base",
    );
  }
  const sign = match[1] === "-" ? "-" : "";
  const integer = match[2] ? cleanDigits(match[2]) : "0";
  const fractional = match[3]
    ? cleanDigits(match[3])
    : match[4]
      ? cleanDigits(match[4])
      : "";
  const hasPoint = input.includes(".");
  return {
    sign,
    integer,
    fractional,
    hasPoint,
    normalized: `${sign}${integer}${hasPoint ? `.${fractional}` : ""}`,
  };
}

function parseOffset(value) {
  const normalized = value.startsWith("#") ? `0.${value}` : value;
  return parseRationalLiteral(normalized);
}

function scaledOffset(value, decimalPlaces, hasPoint) {
  const offset = parseOffset(value);
  if (!hasPoint) return offset;
  return offset.divide(new Rational(10n ** BigInt(decimalPlaces)));
}

function parseUncertainty(input) {
  const match = input.match(/^(.+)\[([^\[\]]+)\]$/);
  if (!match) {
    throw new Error(`Invalid decimal interval notation: ${input}`);
  }

  const shape = decimalShape(match[1]);
  const body = match[2].trim();
  const base = parseDecimalValue(shape.normalized);

  if (body.includes(",")) {
    throw new Error(
      "Decimal interval notation requires ':' between bracketed values",
    );
  }

  if (body.startsWith("+-") || body.startsWith("-+")) {
    const offsetText = body.slice(2).trim();
    if (offsetText.length === 0) {
      throw new Error(
        "Symmetric notation must have a valid number after '+-' or '-+'",
      );
    }
    const offset = scaledOffset(
      offsetText,
      shape.fractional.length,
      shape.hasPoint,
    );
    return new RationalInterval(base.subtract(offset), base.add(offset));
  }

  const parts = body.split(/\s*:\s*/);
  if (
    parts.length > 2 ||
    parts.length === 0 ||
    parts.some((part) => part.length === 0)
  ) {
    throw new Error(
      "Decimal interval brackets require one or two colon-separated values",
    );
  }

  const hasSignedPart = parts.some(
    (part) => part.startsWith("+") || part.startsWith("-"),
  );
  if (hasSignedPart) {
    let positive = null;
    let negative = null;
    for (const part of parts) {
      if (part.startsWith("+") && positive === null) {
        positive = part.slice(1);
      } else if (part.startsWith("-") && negative === null) {
        negative = part.slice(1);
      } else {
        throw new Error(
          "Relative interval notation allows one '+' and one '-' offset",
        );
      }
    }
    const positiveOffset =
      positive === null
        ? Rational.zero
        : scaledOffset(
            positive,
            shape.fractional.length,
            shape.hasPoint,
          );
    const negativeOffset =
      negative === null
        ? Rational.zero
        : scaledOffset(
            negative,
            shape.fractional.length,
            shape.hasPoint,
          );
    return new RationalInterval(
      base.subtract(negativeOffset),
      base.add(positiveOffset),
    );
  }

  if (parts.length !== 2) {
    throw new Error(
      "Compact interval notation requires exactly two endpoints",
    );
  }

  const endpoint = (suffix) => {
    if (shape.hasPoint && shape.fractional.length === 0) {
      if (suffix.startsWith("#")) {
        return parseDecimalValue(
          `${shape.sign}${shape.integer}.${suffix}`,
        );
      }
      const cleanSuffix = cleanDigits(suffix);
      return parseDecimalValue(
        `${shape.sign}${shape.integer}.${cleanSuffix}`,
      );
    }
    const cleanSuffix = cleanDigits(suffix);
    const point = shape.hasPoint ? "." : "";
    return parseDecimalValue(
      `${shape.sign}${shape.integer}${point}${shape.fractional}${cleanSuffix}`,
    );
  };

  return new RationalInterval(endpoint(parts[0]), endpoint(parts[1]));
}

function parseApproximation(input) {
  let value = inputString(input, "certified approximation");

  const derived = value.match(/^(.+?)\?\[=([^:]+):([^:]+)\]$/);
  if (derived) {
    const candidate = parseRationalLiteral(derived[1]);
    let enclosure = new RationalInterval(
      parseRationalLiteral(derived[2]),
      parseRationalLiteral(derived[3]),
    );
    if (!enclosure.containsValue(candidate) && candidate.lessThan(Rational.zero)
        && enclosure.low.greaterThanOrEqual(Rational.zero)) {
      enclosure = enclosure.negate();
    }
    return new CertifiedApproximation(candidate, enclosure, {
      representation: {
        kind: "derived",
        reason: "serialized",
        original: value,
      },
    });
  }

  const explicitCf = value.startsWith("~");
  const cfValue = explicitCf ? value.slice(1) : value;
  const cf = cfValue.match(new RegExp(
    `^([+-]?${DIGITS})\\.~(${DIGITS}(?:~${DIGITS})*)\\?(${DIGITS}(?:~${DIGITS})*)?$`,
  ));
  if (cf) {
    const certified = [
      BigInt(cleanDigits(cf[1], { signed: true })),
      ...cf[2].split("~").map((term) => BigInt(cleanDigits(term))),
    ];
    const provisional = cf[3]
      ? cf[3].split("~").map((term) => BigInt(cleanDigits(term)))
      : [];
    return certifiedContinuedFractionPrefix({
      coefficients: certified,
      provisionalCoefficients: provisional,
      original: value,
    });
  }

  const match = value.match(/^(.+?)\?((?:\d(?:_?\d)*)?)(\[[^\[\]]+\])?$/);
  if (!match) throw new Error(`Invalid certified approximation notation: ${input}`);
  const shape = decimalShape(match[1]);
  const provisional = match[2] ? cleanDigits(match[2]) : "";
  const candidateText = shape.hasPoint
    ? `${shape.normalized}${provisional}`
    : `${shape.normalized}${provisional ? `.${provisional}` : ""}`;
  const explicitEnclosure = match[3]
    ? parseUncertainty(`${candidateText}${match[3]}`)
    : null;
  return certifiedRadixPrefix({
    integerDigits: shape.integer,
    fractionalDigits: shape.fractional,
    provisionalDigits: provisional,
    negative: shape.sign === "-",
    enclosure: explicitEnclosure,
    original: value,
  });
}

/**
 * Parse one exact RatMath number literal.
 *
 * Integers remain Integer values; all other scalar forms become Rational
 * values; interval forms become RationalInterval values.
 */
export function parseNumber(input) {
  const value = inputString(input);

  if (value.includes("?")) {
    return parseApproximation(value);
  }

  if (value.includes("[") || value.includes("]")) {
    return parseUncertainty(value);
  }

  const intervalParts = value.split(":");
  if (intervalParts.length === 2) {
    return new RationalInterval(
      parseRationalLiteral(intervalParts[0]),
      parseRationalLiteral(intervalParts[1]),
    );
  }
  if (intervalParts.length > 2) {
    throw new Error("An interval must contain exactly two endpoints");
  }

  if (new RegExp(`^[+-]?${DIGITS}$`).test(value)) {
    return new Integer(BigInt(cleanDigits(value, { signed: true })));
  }
  return parseRationalLiteral(value);
}

/** Parse a scalar exact number and always return a Rational. */
export function parseRational(input) {
  const value = parseNumber(input);
  if (value instanceof CertifiedApproximation) {
    return value.toRational();
  }
  if (value instanceof RationalInterval) {
    throw new Error("Expected a scalar rational number, received an interval");
  }
  return value instanceof Integer ? value.toRational() : value;
}

/** Parse a finite or repeating base-10 decimal exactly. */
export function parseDecimal(input) {
  const value = inputString(input, "decimal");
  if (value.includes("..") || value.includes("/") || value.includes(".~")) {
    throw new Error("Expected decimal notation");
  }
  return parseDecimalValue(value);
}

/** Parse a finite or repeating base-10 decimal exactly. */
export function parseRepeatingDecimal(input) {
  return parseDecimal(input);
}

/** Parse RiX mixed-fraction notation such as "-2..1/3". */
export function parseMixedNumber(input) {
  const value = inputString(input, "mixed number");
  if (!value.includes("..")) {
    throw new Error("Expected mixed-fraction notation 'whole..numerator/denominator'");
  }
  return parseRationalLiteral(value);
}

/** Parse a continued-fraction coefficient array or RiX ".~" string. */
export function parseContinuedFraction(input) {
  if (Array.isArray(input)) {
    return Rational.fromContinuedFraction(input);
  }
  const value = inputString(input, "continued fraction");
  if (!value.includes(".~")) {
    throw new Error("Expected continued-fraction notation 'a0.~a1~a2'");
  }
  return value.includes("?") ? parseApproximation(value) : parseRationalLiteral(value);
}

/**
 * Parse an interval, or promote a scalar literal to a point interval.
 */
export function parseInterval(input) {
  const value = parseNumber(input);
  if (value instanceof RationalInterval) return value;
  if (value instanceof CertifiedApproximation) return value.enclosure;
  return RationalInterval.point(
    value instanceof Integer ? value.toRational() : value,
  );
}

export { parseApproximation as parseCertifiedApproximation };

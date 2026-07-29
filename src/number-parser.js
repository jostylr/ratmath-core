/**
 * Number-only parsing for RatMath core.
 *
 * This intentionally does not parse arithmetic expressions. It accepts the
 * exact numeric literal forms shared with RiX and returns RatMath values.
 */

import { Integer } from "./integer.js";
import { Rational } from "./rational.js";
import { RationalInterval } from "./rational-interval.js";

const DIGITS = String.raw`\d(?:_?\d)*`;
const MAX_EXPANDED_DIGITS = 100_000;

function inputString(input, label = "number") {
  if (typeof input !== "string") {
    throw new TypeError(`${label} must be a string`);
  }
  const value = input.trim();
  if (value.length === 0) {
    throw new Error(`${label} cannot be empty`);
  }
  return value;
}

function cleanDigits(value, { signed = false } = {}) {
  const pattern = signed
    ? new RegExp(`^[+-]?${DIGITS}$`)
    : new RegExp(`^${DIGITS}$`);
  if (!pattern.test(value)) {
    throw new Error(`Invalid decimal digits: ${value}`);
  }
  return value.replaceAll("_", "");
}

function validateUnderscores(value) {
  for (let index = 0; index < value.length; index++) {
    if (value[index] !== "_") continue;
    if (
      !/\d/.test(value[index - 1] ?? "") ||
      !/\d/.test(value[index + 1] ?? "")
    ) {
      throw new Error("Underscore separators must be between decimal digits");
    }
  }
}

function expandDigitRuns(value) {
  let expandedLength = 0;
  const expanded = value.replace(
    /\{(\d+)~(\d+)\}/g,
    (_match, digits, countText) => {
      const count = Number(countText);
      if (!Number.isSafeInteger(count) || count < 0) {
        throw new Error(`Invalid repeated-digit count: ${countText}`);
      }
      expandedLength += digits.length * count;
      if (expandedLength > MAX_EXPANDED_DIGITS) {
        throw new Error(
          `Expanded decimal exceeds ${MAX_EXPANDED_DIGITS} digits`,
        );
      }
      return digits.repeat(count);
    },
  );

  if (/[{}]/.test(expanded)) {
    throw new Error(`Invalid repeated-digit notation: ${value}`);
  }
  if (expanded.length > MAX_EXPANDED_DIGITS) {
    throw new Error(`Decimal exceeds ${MAX_EXPANDED_DIGITS} digits`);
  }
  return expanded;
}

function parseDecimalValue(input) {
  let value = inputString(input, "decimal");
  validateUnderscores(value);
  let sign = 1n;
  if (value.startsWith("+") || value.startsWith("-")) {
    sign = value[0] === "-" ? -1n : 1n;
    value = value.slice(1);
  }

  const hashParts = value.split("#");
  if (hashParts.length > 2) {
    throw new Error("A repeating decimal can contain only one '#'");
  }

  let prefix = expandDigitRuns(hashParts[0].replaceAll("_", ""));
  const repeating =
    hashParts.length === 2
      ? expandDigitRuns(hashParts[1].replaceAll("_", ""))
      : null;

  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(prefix)) {
    throw new Error(`Invalid decimal format: ${input}`);
  }

  const dot = prefix.indexOf(".");
  const integerDigits = dot === -1 ? prefix : prefix.slice(0, dot) || "0";
  const fractionalDigits = dot === -1 ? "" : prefix.slice(dot + 1);
  const integer = BigInt(integerDigits);
  const fractional =
    fractionalDigits.length === 0 ? 0n : BigInt(fractionalDigits);
  const fractionalScale = 10n ** BigInt(fractionalDigits.length);

  let result = new Rational(
    integer * fractionalScale + fractional,
    fractionalScale,
  );

  if (repeating !== null) {
    if (!/^\d+$/.test(repeating)) {
      throw new Error("The repeating part must contain one or more digits");
    }
    if (!/^0+$/.test(repeating)) {
      const repeatScale = 10n ** BigInt(repeating.length) - 1n;
      result = result.add(
        new Rational(BigInt(repeating), fractionalScale * repeatScale),
      );
    }
  }

  return sign < 0n ? result.negate() : result;
}

function parseRationalLiteral(input) {
  let value = inputString(input, "rational");

  // RiX permits an explicit leading "~" for continued fractions whose first
  // coefficient is negative. Core also accepts the emitted form without it.
  if (value.startsWith("~")) {
    value = value.slice(1);
  }

  const continued = value.match(
    new RegExp(`^([+-]?${DIGITS})\\.~(${DIGITS}(?:~${DIGITS})*)$`),
  );
  if (continued) {
    const first = BigInt(cleanDigits(continued[1], { signed: true }));
    const tail = continued[2]
      .split("~")
      .map((term) => BigInt(cleanDigits(term)));
    if (tail.length === 1 && tail[0] === 0n) {
      return new Rational(first);
    }
    return Rational.fromContinuedFraction([first, ...tail]);
  }

  const mixed = value.match(
    new RegExp(`^([+-]?)(${DIGITS})\\.\\.(${DIGITS})\\/(${DIGITS})$`),
  );
  if (mixed) {
    const sign = mixed[1] === "-" ? -1n : 1n;
    const whole = BigInt(cleanDigits(mixed[2]));
    const numerator = BigInt(cleanDigits(mixed[3]));
    const denominator = BigInt(cleanDigits(mixed[4]));
    if (denominator === 0n) {
      throw new Error("Denominator cannot be zero");
    }
    return new Rational(
      sign * (whole * denominator + numerator),
      denominator,
    );
  }

  const fraction = value.match(
    new RegExp(`^([+-]?${DIGITS})\\/(${DIGITS})$`),
  );
  if (fraction) {
    return new Rational(
      BigInt(cleanDigits(fraction[1], { signed: true })),
      BigInt(cleanDigits(fraction[2])),
    );
  }

  if (value.includes("#") || value.includes(".")) {
    return parseDecimalValue(value);
  }

  if (new RegExp(`^[+-]?${DIGITS}$`).test(value)) {
    return new Rational(BigInt(cleanDigits(value, { signed: true })));
  }

  throw new Error(`Invalid rational number: ${input}`);
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
      "Decimal interval brackets require one or two comma- or colon-separated values",
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
      if (!/^\d+$/.test(cleanSuffix)) {
        throw new Error(`Invalid decimal interval endpoint: ${suffix}`);
      }
      return parseDecimalValue(
        `${shape.sign}${shape.integer}.${cleanSuffix}`,
      );
    }
    const cleanSuffix = cleanDigits(suffix);
    if (!/^\d+$/.test(cleanSuffix)) {
      throw new Error(`Invalid compact interval endpoint: ${suffix}`);
    }
    const point = shape.hasPoint ? "." : "";
    return parseDecimalValue(
      `${shape.sign}${shape.integer}${point}${shape.fractional}${cleanSuffix}`,
    );
  };

  return new RationalInterval(endpoint(parts[0]), endpoint(parts[1]));
}

/**
 * Parse one exact RatMath number literal.
 *
 * Integers remain Integer values; all other scalar forms become Rational
 * values; interval forms become RationalInterval values.
 */
export function parseNumber(input) {
  const value = inputString(input);

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
  return parseRationalLiteral(value);
}

/**
 * Parse an interval, or promote a scalar literal to a point interval.
 */
export function parseInterval(input) {
  const value = parseNumber(input);
  if (value instanceof RationalInterval) return value;
  return RationalInterval.point(
    value instanceof Integer ? value.toRational() : value,
  );
}

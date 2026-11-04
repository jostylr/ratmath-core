/**
 * Exact scalar literal grammar shared by RatMath core.
 *
 * Returns unreduced [numerator, denominator] BigInt pairs so that Rational can
 * parse strings without importing the value classes (and their import cycle).
 */

export const DIGITS = String.raw`\d(?:_?\d)*`;
export const MAX_EXPANDED_DIGITS = 100_000;

export function inputString(input, label = "number") {
  if (typeof input !== "string") {
    throw new TypeError(`${label} must be a string`);
  }
  const value = input.trim();
  if (value.length === 0) {
    throw new Error(`${label} cannot be empty`);
  }
  return value;
}

export function cleanDigits(value, { signed = false } = {}) {
  const pattern = signed
    ? new RegExp(`^[+-]?${DIGITS}$`)
    : new RegExp(`^${DIGITS}$`);
  if (!pattern.test(value)) {
    throw new Error(`Invalid decimal digits: ${value}`);
  }
  return value.replaceAll("_", "");
}

export function validateUnderscores(value) {
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

export function expandDigitRuns(value) {
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

export function parseDecimalParts(input) {
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

  let numerator = integer * fractionalScale + fractional;
  let denominator = fractionalScale;

  if (repeating !== null) {
    if (!/^\d+$/.test(repeating)) {
      throw new Error("The repeating part must contain one or more digits");
    }
    if (!/^0+$/.test(repeating)) {
      const repeatScale = 10n ** BigInt(repeating.length) - 1n;
      numerator = numerator * repeatScale + BigInt(repeating);
      denominator *= repeatScale;
    }
  }

  return [sign * numerator, denominator];
}

export function parseRationalParts(input) {
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
      return [first, 1n];
    }
    return continuedFractionParts([first, ...tail]);
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
    return [sign * (whole * denominator + numerator), denominator];
  }

  if (value.includes("..")) {
    throw new Error("Invalid mixed number format. Use 'a..b/c'");
  }

  const fraction = value.match(
    new RegExp(`^([+-]?${DIGITS})\\/(${DIGITS})$`),
  );
  if (fraction) {
    const denominator = BigInt(cleanDigits(fraction[2]));
    if (denominator === 0n) {
      throw new Error("Denominator cannot be zero");
    }
    return [BigInt(cleanDigits(fraction[1], { signed: true })), denominator];
  }

  if (value.includes("#") || value.includes(".")) {
    return parseDecimalParts(value);
  }

  if (new RegExp(`^[+-]?${DIGITS}$`).test(value)) {
    return [BigInt(cleanDigits(value, { signed: true })), 1n];
  }

  throw new Error(`Invalid rational number: ${input}`);
}

// Positive tail coefficients, evaluated by the convergent recurrence.
function continuedFractionParts(terms) {
  for (const term of terms.slice(1)) {
    if (term <= 0n) {
      throw new Error(`Continued fraction terms must be positive: ${term}`);
    }
  }
  let [pPrev, p, qPrev, q] = [1n, terms[0], 0n, 1n];
  for (const a of terms.slice(1)) {
    [pPrev, p] = [p, a * p + pPrev];
    [qPrev, q] = [q, a * q + qPrev];
  }
  return [p, q];
}

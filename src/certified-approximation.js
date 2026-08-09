import { Integer } from "./integer.js";
import { Rational } from "./rational.js";
import { RationalInterval } from "./rational-interval.js";
import { BaseSystem } from "./base-system.js";

export const Relation = Object.freeze({
  LESS: 0b001,
  EQUAL: 0b010,
  GREATER: 0b100,
});

function asRational(value, label = "value") {
  if (value instanceof Rational) return value;
  if (value instanceof Integer) return value.toRational();
  throw new TypeError(`${label} must be an Integer or Rational`);
}

function exactScalar(value) {
  const rational = asRational(value);
  return rational.denominator === 1n
    ? new Integer(rational.numerator)
    : rational;
}

function pointInterval(value) {
  const rational = asRational(value);
  return new RationalInterval(rational, rational);
}

function freezeRepresentation(value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Approximation representation must be an object");
  }
  const copy = { ...value };
  if (Array.isArray(copy.certifiedPrefix)) {
    copy.certifiedPrefix = Object.freeze([...copy.certifiedPrefix]);
  }
  if (Array.isArray(copy.provisionalSuffix)) {
    copy.provisionalSuffix = Object.freeze([...copy.provisionalSuffix]);
  }
  return Object.freeze(copy);
}

function isPoint(interval) {
  return interval.low.equals(interval.high);
}

function normalize(candidate, enclosure, options = {}) {
  if (isPoint(enclosure) && options.preserveWrapper !== true) {
    return exactScalar(enclosure.low);
  }
  return new CertifiedApproximation(candidate, enclosure, options);
}

function operand(value) {
  if (value instanceof CertifiedApproximation) {
    return { candidate: value.candidate, enclosure: value.enclosure, approximation: true };
  }
  if (value instanceof RationalInterval) {
    return { candidate: null, enclosure: value, intervalCollection: true };
  }
  if (value instanceof Integer || value instanceof Rational) {
    return { candidate: value, enclosure: pointInterval(value), exact: true };
  }
  return null;
}

function derivedOptions(left, right = null) {
  return {
    representation: {
      kind: "derived",
      reason: "derived",
      original: null,
    },
    sourceId: Symbol("ratmath-derived-approximation"),
    dependencies: right ? [left.sourceId, right.sourceId].filter(Boolean) : [left.sourceId].filter(Boolean),
  };
}

function serializeSourceId(sourceId) {
  return typeof sourceId === "string" || typeof sourceId === "number"
    ? sourceId
    : null;
}

function relationEnclosure(value) {
  if (value instanceof CertifiedApproximation) return value.enclosure;
  if (value instanceof RationalInterval) return value;
  if (value instanceof Integer || value instanceof Rational) return pointInterval(value);
  throw new TypeError("Possible relations require Core numeric values");
}

export function possibleRelations(left, right) {
  if (
    left instanceof CertifiedApproximation &&
    right instanceof CertifiedApproximation &&
    left.sameSource(right)
  ) {
    return Relation.EQUAL;
  }
  const a = relationEnclosure(left);
  const b = relationEnclosure(right);
  let result = 0;
  if (a.low.lessThan(b.high)) result |= Relation.LESS;
  if (a.low.lessThanOrEqual(b.high) && b.low.lessThanOrEqual(a.high)) {
    result |= Relation.EQUAL;
  }
  if (a.high.greaterThan(b.low)) result |= Relation.GREATER;
  return result;
}

/**
 * A finite scalar approximation whose authoritative guarantee is an exact
 * RationalInterval. It is intentionally not an interval collection.
 */
export class CertifiedApproximation {
  #candidate;
  #enclosure;
  #representation;
  #sourceId;
  #dependencies;

  constructor(candidate, enclosure, options = {}) {
    const exactCandidate = exactScalar(candidate);
    if (!(enclosure instanceof RationalInterval)) {
      throw new TypeError("Certified approximation enclosure must be a RationalInterval");
    }
    if (!enclosure.containsValue(asRational(exactCandidate))) {
      throw new RangeError("Certified approximation candidate must lie in its enclosure");
    }
    this.#candidate = exactCandidate;
    this.#enclosure = enclosure;
    this.#representation = freezeRepresentation(options.representation);
    this.#sourceId = options.sourceId ?? Symbol("ratmath-certified-approximation");
    this.#dependencies = Object.freeze([...(options.dependencies || [])]);
  }

  get candidate() { return this.#candidate; }
  get enclosure() { return this.#enclosure; }
  get representation() { return this.#representation; }
  get sourceId() { return this.#sourceId; }
  get dependencies() { return this.#dependencies; }
  get low() { return this.#enclosure.low; }
  get high() { return this.#enclosure.high; }
  get isCertifiedApproximation() { return true; }

  sameSource(other) {
    return this === other || (
      other instanceof CertifiedApproximation &&
      this.#sourceId !== null &&
      this.#sourceId !== undefined &&
      this.#sourceId === other.sourceId
    );
  }

  copy() {
    return new CertifiedApproximation(this.#candidate, this.#enclosure, {
      representation: this.#representation,
      sourceId: this.#sourceId,
      dependencies: this.#dependencies,
    });
  }

  #binary(other, operation) {
    const rhs = operand(other);
    if (!rhs) throw new TypeError(`Cannot ${operation} CertifiedApproximation and ${other?.constructor?.name ?? typeof other}`);
    if (rhs.intervalCollection) {
      return this.#enclosure[operation](rhs.enclosure);
    }
    if (rhs.approximation && this.sameSource(other)) {
      if (operation === "subtract") return Integer.zero;
      if (operation === "divide") {
        if (this.#enclosure.containsZero()) {
          throw new Error("Cannot divide an approximation containing zero by itself");
        }
        return Integer.one;
      }
    }
    const candidate = this.#candidate[operation](rhs.candidate);
    const enclosure = this.#enclosure[operation](rhs.enclosure);
    return normalize(candidate, enclosure, derivedOptions(this, rhs.approximation ? other : null));
  }

  add(other) { return this.#binary(other, "add"); }
  subtract(other) { return this.#binary(other, "subtract"); }
  multiply(other) { return this.#binary(other, "multiply"); }
  divide(other) { return this.#binary(other, "divide"); }

  _operateExactLeft(operation, left) {
    const lhs = operand(left);
    if (!lhs?.exact) throw new TypeError("Left operand must be an exact Core scalar");
    if (operation === "add" || operation === "multiply") return this[operation](left);
    const candidate = lhs.candidate[operation](this.#candidate);
    const enclosure = lhs.enclosure[operation](this.#enclosure);
    return normalize(candidate, enclosure, derivedOptions(this));
  }

  negate() {
    const representation = this.#representation?.kind === "radix"
      ? { ...this.#representation, original: this.#representation.original ? `-${this.#representation.original}`.replace(/^--/, "") : null }
      : { kind: "derived", reason: "derived", original: null };
    return normalize(this.#candidate.negate(), this.#enclosure.negate(), {
      representation,
      sourceId: Symbol("ratmath-derived-approximation"),
      dependencies: [this.#sourceId],
    });
  }

  reciprocal() {
    return normalize(asRational(this.#candidate).reciprocal(), this.#enclosure.reciprocate(), derivedOptions(this));
  }

  pow(exponent) {
    return normalize(this.#candidate.pow(exponent), this.#enclosure.pow(exponent), derivedOptions(this));
  }

  E(exponent) {
    return normalize(this.#candidate.E(exponent), this.#enclosure.E(exponent), derivedOptions(this));
  }

  possibleRelationsTo(other) {
    return possibleRelations(this, other);
  }

  toRationalInterval() { return this.#enclosure; }

  toRational() {
    if (!isPoint(this.#enclosure)) {
      throw new Error("Cannot convert a non-point CertifiedApproximation to Rational");
    }
    return this.#enclosure.low;
  }

  toString() {
    if (this.#representation?.original) return this.#representation.original;
    const entirelyNegative = this.#enclosure.high.lessThan(Rational.zero);
    const displayEnclosure = entirelyNegative ? this.#enclosure.negate() : this.#enclosure;
    const displayCandidate = displayEnclosure.shortestDecimal();
    const candidateText = displayCandidate.toRepeatingDecimal().replace(/#0$/, "");
    return `${entirelyNegative ? "-" : ""}${candidateText}?[=${displayEnclosure.low}:${displayEnclosure.high}]`;
  }

  toJSON() {
    return {
      $ratmath: "CertifiedApproximation",
      candidate: this.#candidate,
      enclosure: this.#enclosure,
      representation: this.#representation,
      sourceId: serializeSourceId(this.#sourceId),
    };
  }
}

export function normalizeCertifiedApproximation(candidate, enclosure, options = {}) {
  return normalize(candidate, enclosure, options);
}

function positionalRational(sign, integerDigits, fractionalDigits, baseSystem) {
  const integer = integerDigits.length ? baseSystem.toDecimal(integerDigits) : 0n;
  const fractional = fractionalDigits.length ? baseSystem.toDecimal(fractionalDigits) : 0n;
  const scale = BigInt(baseSystem.base) ** BigInt(fractionalDigits.length);
  return new Rational((sign < 0n ? -1n : 1n) * (integer * scale + fractional), scale);
}

export function certifiedRadixPrefix({
  integerDigits,
  fractionalDigits = "",
  provisionalDigits = "",
  negative = false,
  baseSystem = BaseSystem.DECIMAL,
  enclosure = null,
  original = null,
  reason = "literal",
  requested = null,
  achieved = null,
  roundingMode = null,
  sourceId,
}) {
  if (!(baseSystem instanceof BaseSystem)) throw new TypeError("baseSystem must be a BaseSystem");
  if (!baseSystem.isValidString(integerDigits || "0")) throw new Error("Invalid radix integer digits");
  if (fractionalDigits && !baseSystem.isValidString(fractionalDigits)) throw new Error("Invalid radix fractional digits");
  if (provisionalDigits && !baseSystem.isValidString(provisionalDigits)) throw new Error("Invalid provisional radix digits");

  const sign = negative ? -1n : 1n;
  const prefix = positionalRational(sign, integerDigits || "0", fractionalDigits, baseSystem);
  const candidateFraction = fractionalDigits + provisionalDigits;
  const candidate = positionalRational(sign, integerDigits || "0", candidateFraction, baseSystem);
  const width = new Rational(1n, BigInt(baseSystem.base) ** BigInt(fractionalDigits.length));
  const prefixHull = negative
    ? new RationalInterval(prefix.subtract(width), prefix)
    : new RationalInterval(prefix, prefix.add(width));
  const authoritative = enclosure ?? prefixHull;
  if (!prefixHull.contains(authoritative)) {
    throw new RangeError("Explicit enclosure must lie inside the certified radix prefix cylinder");
  }
  return new CertifiedApproximation(candidate, authoritative, {
    sourceId,
    representation: {
      kind: "radix",
      base: baseSystem.base,
      characters: baseSystem.characters.join(""),
      certifiedPrefix: `${negative ? "-" : ""}${integerDigits || "0"}${fractionalDigits.length || provisionalDigits.length ? `.${fractionalDigits}` : ""}`,
      provisionalSuffix: provisionalDigits,
      original,
      reason,
      requested,
      achieved: achieved ?? { fractionalDigits: fractionalDigits.length },
      roundingMode,
    },
  });
}

export function certifiedContinuedFractionPrefix({
  coefficients,
  provisionalCoefficients = [],
  original = null,
  reason = "literal",
  requested = null,
  achieved = null,
  sourceId,
}) {
  const certified = coefficients.map((value) => BigInt(value));
  const provisional = provisionalCoefficients.map((value) => BigInt(value));
  if (certified.length === 0) throw new Error("Continued-fraction approximation requires a certified coefficient");
  if (certified.slice(1).some((value) => value <= 0n) || provisional.some((value) => value <= 0n)) {
    throw new Error("Continued-fraction tail coefficients must be positive");
  }
  const convergent = Rational.fromContinuedFraction(certified);
  const adjacentCoefficients = [...certified];
  adjacentCoefficients[adjacentCoefficients.length - 1] += 1n;
  const adjacent = Rational.fromContinuedFraction(adjacentCoefficients);
  const candidate = Rational.fromContinuedFraction([...certified, ...provisional]);
  return new CertifiedApproximation(candidate, new RationalInterval(convergent, adjacent), {
    sourceId,
    representation: {
      kind: "continuedFraction",
      certifiedPrefix: certified.map(String),
      provisionalSuffix: provisional.map(String),
      original,
      reason,
      requested,
      achieved: achieved ?? { terms: certified.length },
    },
  });
}

/** Convert an exact scalar to either an exact terminating value or a certified decimal prefix. */
export function boundedDecimalApproximation(value, options = {}) {
  const fractionalDigits = options.fractionalDigits ?? 20;
  if (!Number.isSafeInteger(fractionalDigits) || fractionalDigits < 0) {
    throw new RangeError("fractionalDigits must be a nonnegative safe integer");
  }
  const rational = asRational(value);
  const negative = rational.numerator < 0n;
  const numerator = negative ? -rational.numerator : rational.numerator;
  const integer = numerator / rational.denominator;
  let remainder = numerator % rational.denominator;
  let digits = "";
  for (let index = 0; index < fractionalDigits && remainder !== 0n; index++) {
    remainder *= 10n;
    digits += String(remainder / rational.denominator);
    remainder %= rational.denominator;
  }
  if (remainder === 0n) return exactScalar(rational);
  const original = `${negative ? "-" : ""}${integer}.${digits}?`;
  return certifiedRadixPrefix({
    integerDigits: String(integer),
    fractionalDigits: digits,
    negative,
    original,
    reason: options.reason ?? "truncated",
    requested: { fractionalDigits },
    achieved: { fractionalDigits: digits.length },
  });
}

/** Convert an exact scalar to either its finite CF or a certified CF prefix. */
export function boundedContinuedFractionApproximation(value, options = {}) {
  const maxTerms = options.maxTerms ?? Rational.DEFAULT_CF_LIMIT;
  if (!Number.isSafeInteger(maxTerms) || maxTerms < 1) {
    throw new RangeError("maxTerms must be a positive safe integer");
  }
  const rational = asRational(value);
  const coefficients = rational.toContinuedFraction({ maxTerms });
  const extended = rational.toContinuedFraction({ maxTerms: maxTerms + 1 });
  if (extended.length <= maxTerms) return exactScalar(rational);
  const [first, ...tail] = coefficients;
  const original = tail.length
    ? `${first}.~${tail.join("~")}?`
    : `${first}.~?`;
  return certifiedContinuedFractionPrefix({
    coefficients,
    original,
    reason: options.reason ?? "truncated",
    requested: { maxTerms },
    achieved: { terms: coefficients.length },
  });
}

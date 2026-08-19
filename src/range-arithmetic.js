/**
 * Exact real set images for RationalIntervalSet operands.
 *
 * These operations use independent Cartesian-image semantics. Undefined input
 * tuples contribute no values and are described by the returned domain record.
 */

import { Rational } from "./rational.js";
import { RationalInterval } from "./rational-interval.js";
import { RationalIntervalSet } from "./rational-interval-set.js";

const ZERO = Rational.zero;
const ONE = Rational.one;
const RESULT_SCHEMA = "ratmath.range-operation-result@1";
const CHECKER_ID = "ratmath.core.range-arithmetic@1";

function isScalarInput(value) {
  return value instanceof Rational ||
    value?.constructor?.name === "Integer" ||
    typeof value === "number" || typeof value === "bigint" ||
    typeof value === "string";
}

export function asRationalIntervalSet(value) {
  if (value instanceof RationalIntervalSet) return value;
  if (value instanceof RationalInterval) return RationalIntervalSet.fromInterval(value);
  if (isScalarInput(value)) {
    return RationalIntervalSet.point(value?.constructor?.name === "Integer" ? value.value : value);
  }
  return new RationalIntervalSet(value);
}

function exactInteger(value, label = "Exponent") {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isSafeInteger(value)) return BigInt(value);
  if (typeof value === "string") {
    const rational = new Rational(value);
    if (rational.denominator === 1n) return rational.numerator;
  }
  if (value?.constructor?.name === "Integer") return value.value;
  if (value instanceof Rational && value.denominator === 1n) return value.numerator;
  throw new TypeError(`${label} must be an exact integer`);
}

function negateComponent(component) {
  return {
    low: component.high === null ? null : component.high.negate(),
    high: component.low === null ? null : component.low.negate(),
    lowClosed: component.high === null ? false : component.highClosed,
    highClosed: component.low === null ? false : component.lowClosed,
  };
}

function addComponents(left, right) {
  const low = left.low === null || right.low === null
    ? null
    : left.low.add(right.low);
  const high = left.high === null || right.high === null
    ? null
    : left.high.add(right.high);
  return {
    low,
    high,
    lowClosed: low === null ? false : left.lowClosed && right.lowClosed,
    highClosed: high === null ? false : left.highClosed && right.highClosed,
  };
}

function containsZeroComponent(component) {
  const aboveLow = component.low === null || component.low.lessThan(ZERO) ||
    (component.low.equals(ZERO) && component.lowClosed);
  const belowHigh = component.high === null || component.high.greaterThan(ZERO) ||
    (component.high.equals(ZERO) && component.highClosed);
  return aboveLow && belowHigh;
}

function hasPositiveValue(component) {
  return component.high === null || component.high.greaterThan(ZERO);
}

function nonnegativeProductComponent(left, right) {
  const low = left.low.multiply(right.low);
  const lowClosed = low.equals(ZERO)
    ? containsZeroComponent(left) || containsZeroComponent(right)
    : left.lowClosed && right.lowClosed;

  const unbounded = (left.high === null && hasPositiveValue(right)) ||
    (right.high === null && hasPositiveValue(left));
  if (unbounded) {
    return { low, high: null, lowClosed, highClosed: false };
  }

  // The only bounded result involving an unbounded factor is {0} times it.
  if (left.high === null || right.high === null) {
    return { low: ZERO, high: ZERO, lowClosed: true, highClosed: true };
  }

  const high = left.high.multiply(right.high);
  return {
    low,
    high,
    lowClosed,
    highClosed: high.equals(ZERO) ? true : left.highClosed && right.highClosed,
  };
}

function nonpositiveToNonnegative(component) {
  return negateComponent(component);
}

function splitBySign(set, includeZero) {
  const negative = set.intersection({
    low: null,
    high: ZERO,
    lowClosed: false,
    highClosed: includeZero,
  });
  const positive = set.intersection({
    low: ZERO,
    high: null,
    lowClosed: includeZero,
    highClosed: false,
  });
  return { negative, positive };
}

function withoutZero(set) {
  const { negative, positive } = splitBySign(set, false);
  return negative.union(positive);
}

function multiplySets(left, right) {
  const leftSigns = splitBySign(left, true);
  const rightSigns = splitBySign(right, true);
  const components = [];

  const appendPositiveProducts = (leftSet, rightSet, negate = false) => {
    for (const a of leftSet.components) {
      for (const b of rightSet.components) {
        const product = nonnegativeProductComponent(a, b);
        components.push(negate ? negateComponent(product) : product);
      }
    }
  };

  const leftNegativeMagnitude = new RationalIntervalSet(
    leftSigns.negative.components.map(nonpositiveToNonnegative),
  );
  const rightNegativeMagnitude = new RationalIntervalSet(
    rightSigns.negative.components.map(nonpositiveToNonnegative),
  );

  appendPositiveProducts(leftSigns.positive, rightSigns.positive);
  appendPositiveProducts(leftNegativeMagnitude, rightNegativeMagnitude);
  appendPositiveProducts(leftNegativeMagnitude, rightSigns.positive, true);
  appendPositiveProducts(leftSigns.positive, rightNegativeMagnitude, true);
  return new RationalIntervalSet(components);
}

function reciprocalPositiveComponent(component) {
  const low = component.high === null ? ZERO : component.high.reciprocal();
  const high = component.low.equals(ZERO) ? null : component.low.reciprocal();
  return {
    low,
    high,
    lowClosed: component.high === null ? false : component.highClosed,
    highClosed: high === null ? false : component.lowClosed,
  };
}

function reciprocalNegativeComponent(component) {
  const low = component.high.equals(ZERO) ? null : component.high.reciprocal();
  const high = component.low === null ? ZERO : component.low.reciprocal();
  return {
    low,
    high,
    lowClosed: low === null ? false : component.highClosed,
    highClosed: component.low === null ? false : component.lowClosed,
  };
}

function reciprocalSet(set) {
  const { negative, positive } = splitBySign(set, false);
  return new RationalIntervalSet([
    ...negative.components.map(reciprocalNegativeComponent),
    ...positive.components.map(reciprocalPositiveComponent),
  ]);
}

function positiveIntegerPowerSet(set, exponent) {
  if (exponent <= 0n) throw new RangeError("Positive power helper requires exponent > 0");
  const odd = (exponent & 1n) === 1n;
  const source = odd ? set : absoluteSet(set);
  return new RationalIntervalSet(source.components.map((component) => ({
    low: component.low === null ? null : component.low.pow(exponent),
    high: component.high === null ? null : component.high.pow(exponent),
    lowClosed: component.low === null ? false : component.lowClosed,
    highClosed: component.high === null ? false : component.highClosed,
  })));
}

function absoluteSet(set) {
  const { negative, positive } = splitBySign(set, true);
  return new RationalIntervalSet([
    ...negative.components.map(negateComponent),
    ...positive.components,
  ]);
}

function unaryCoverage(set, definedInput) {
  if (set.isEmpty) return "allDefined";
  if (definedInput.equals(set)) return "allDefined";
  if (definedInput.isEmpty) return "noDefinedInputs";
  return "partiallyDefined";
}

function freezeExclusion(exclusion) {
  return Object.freeze({ ...exclusion });
}

function domainRecord(coverage, options = {}) {
  return Object.freeze({
    coverage,
    ...(options.definedInput ? { definedInput: options.definedInput } : {}),
    exclusions: Object.freeze((options.exclusions || []).map(freezeExclusion)),
  });
}

function operationResult(operation, operands, range, domain, parameters = {}) {
  return Object.freeze({
    schema: RESULT_SCHEMA,
    operation: `rix.core.range.${operation}@1`,
    operands: Object.freeze([...operands]),
    parameters: Object.freeze({ ...parameters }),
    range,
    domain,
    certified: true,
    evidenceLevel: "checkedEvidence",
    evidence: Object.freeze({
      schema: "rix.numerics.range-evidence-node@1",
      rule: `arith.${operation}`,
      checkedBy: CHECKER_ID,
    }),
  });
}

function totalDomain() {
  return domainRecord("allDefined");
}

export function rangeNegate(value) {
  const input = asRationalIntervalSet(value);
  const range = new RationalIntervalSet(input.components.map(negateComponent));
  return operationResult("negate", [input], range, totalDomain());
}

export function rangeAbsoluteValue(value) {
  const input = asRationalIntervalSet(value);
  return operationResult("absoluteValue", [input], absoluteSet(input), totalDomain());
}

export function rangeAdd(leftValue, rightValue) {
  const left = asRationalIntervalSet(leftValue);
  const right = asRationalIntervalSet(rightValue);
  const components = [];
  for (const a of left.components) {
    for (const b of right.components) components.push(addComponents(a, b));
  }
  return operationResult("add", [left, right], new RationalIntervalSet(components), totalDomain());
}

export function rangeSubtract(leftValue, rightValue) {
  const left = asRationalIntervalSet(leftValue);
  const right = asRationalIntervalSet(rightValue);
  const negated = new RationalIntervalSet(right.components.map(negateComponent));
  const components = [];
  for (const a of left.components) {
    for (const b of negated.components) components.push(addComponents(a, b));
  }
  return operationResult("subtract", [left, right], new RationalIntervalSet(components), totalDomain());
}

export function rangeMultiply(leftValue, rightValue) {
  const left = asRationalIntervalSet(leftValue);
  const right = asRationalIntervalSet(rightValue);
  return operationResult("multiply", [left, right], multiplySets(left, right), totalDomain());
}

export function rangeReciprocal(value) {
  const input = asRationalIntervalSet(value);
  const definedInput = withoutZero(input);
  const hasExcludedZero = input.containsValue(ZERO);
  const exclusions = hasExcludedZero
    ? [{ reason: "divisionByZero", operand: 1, excludedSet: RationalIntervalSet.point(ZERO) }]
    : [];
  const domain = domainRecord(unaryCoverage(input, definedInput), {
    definedInput,
    exclusions,
  });
  return operationResult("reciprocal", [input], reciprocalSet(definedInput), domain);
}

export function rangeDivide(leftValue, rightValue) {
  const left = asRationalIntervalSet(leftValue);
  const right = asRationalIntervalSet(rightValue);
  const definedRight = withoutZero(right);
  let coverage = "allDefined";
  if (!left.isEmpty && !right.isEmpty && right.containsValue(ZERO)) {
    coverage = definedRight.isEmpty ? "noDefinedInputs" : "partiallyDefined";
  }
  const exclusions = coverage === "allDefined"
    ? []
    : [{ reason: "divisionByZero", operand: 2, excludedSet: RationalIntervalSet.point(ZERO) }];
  const domain = domainRecord(coverage, { exclusions });
  const range = multiplySets(left, reciprocalSet(definedRight));
  return operationResult("divide", [left, right], range, domain);
}

export function rangeIntegerPower(value, exponentValue, options = {}) {
  const input = asRationalIntervalSet(value);
  const exponent = exactInteger(exponentValue);
  const zeroPowerZero = options.zeroPowerZero ?? "undefined";
  if (zeroPowerZero !== "undefined" && zeroPowerZero !== "one") {
    throw new TypeError("zeroPowerZero must be 'undefined' or 'one'");
  }

  if (exponent > 0n) {
    return operationResult(
      "integerPower",
      [input],
      positiveIntegerPowerSet(input, exponent),
      totalDomain(),
      { exponent, zeroPowerZero },
    );
  }

  if (exponent === 0n && zeroPowerZero === "one") {
    const range = input.isEmpty ? RationalIntervalSet.empty : RationalIntervalSet.point(ONE);
    return operationResult(
      "integerPower",
      [input],
      range,
      totalDomain(),
      { exponent, zeroPowerZero },
    );
  }

  const definedInput = withoutZero(input);
  const hasExcludedZero = input.containsValue(ZERO);
  const exclusions = hasExcludedZero
    ? [{
        reason: exponent === 0n ? "zeroPowerZero" : "zeroToNegativePower",
        operand: 1,
        excludedSet: RationalIntervalSet.point(ZERO),
      }]
    : [];
  const domain = domainRecord(unaryCoverage(input, definedInput), {
    definedInput,
    exclusions,
  });
  let range;
  if (exponent === 0n) {
    range = definedInput.isEmpty ? RationalIntervalSet.empty : RationalIntervalSet.point(ONE);
  } else {
    range = reciprocalSet(positiveIntegerPowerSet(definedInput, -exponent));
  }
  return operationResult(
    "integerPower",
    [input],
    range,
    domain,
    { exponent, zeroPowerZero },
  );
}

function operationName(value) {
  const match = /^rix\.core\.range\.([A-Za-z]+)@1$/.exec(value || "");
  return match?.[1] ?? null;
}

function recompute(operation, operands, parameters) {
  switch (operation) {
    case "negate": return rangeNegate(operands[0]);
    case "absoluteValue": return rangeAbsoluteValue(operands[0]);
    case "add": return rangeAdd(operands[0], operands[1]);
    case "subtract": return rangeSubtract(operands[0], operands[1]);
    case "multiply": return rangeMultiply(operands[0], operands[1]);
    case "reciprocal": return rangeReciprocal(operands[0]);
    case "divide": return rangeDivide(operands[0], operands[1]);
    case "integerPower": return rangeIntegerPower(
      operands[0],
      parameters.exponent,
      { zeroPowerZero: parameters.zeroPowerZero },
    );
    default: return null;
  }
}

function sameExclusions(left, right) {
  if (left.length !== right.length) return false;
  return left.every((entry, index) => {
    const other = right[index];
    return entry.reason === other.reason && entry.operand === other.operand &&
      entry.excludedSet.equals(other.excludedSet);
  });
}

/** Recompute an exact primitive result and compare its mathematical claims. */
export function checkRangeOperationResult(candidate, expected = {}) {
  if (!candidate || candidate.schema !== RESULT_SCHEMA) {
    return Object.freeze({ accepted: false, reason: "unsupportedSchema", checkedBy: CHECKER_ID });
  }
  const operation = expected.operation ?? operationName(candidate.operation);
  const operands = expected.operands ?? candidate.operands;
  const parameters = expected.parameters ?? candidate.parameters ?? {};
  const recomputed = recompute(operation, operands, parameters);
  if (!recomputed) {
    return Object.freeze({ accepted: false, reason: "unsupportedRule", checkedBy: CHECKER_ID });
  }
  const accepted = candidate.range instanceof RationalIntervalSet &&
    candidate.range.equals(recomputed.range) &&
    candidate.domain?.coverage === recomputed.domain.coverage &&
    sameExclusions(candidate.domain?.exclusions || [], recomputed.domain.exclusions);
  return Object.freeze({
    accepted,
    reason: accepted ? null : "claimMismatch",
    checkedBy: CHECKER_ID,
    operation,
    domainCoverage: recomputed.domain.coverage,
  });
}

export const RANGE_OPERATION_RESULT_SCHEMA = RESULT_SCHEMA;
export const RANGE_ARITHMETIC_CHECKER_ID = CHECKER_ID;

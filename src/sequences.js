/**
 * Exact list helpers: range, seq, sum and product over Core values.
 *
 *   range(1, 5)                         // [1, 2, 3, 4, 5] as Integers
 *   range(0, 1, R`1/4`)                 // [0, 1/4, 1/2, 3/4, 1]
 *   seq(0, 6, 2, (k) => R`${k}^3`)      // [0, 8, 64, 216]
 *   sum([R`1/2`, R`1/3`])               // 5/6
 *   sum(1, 10, (i) => R`${i}^2`)        // 385
 *   product(1, 5, (j) => j)             // 120
 *
 * Values may be Core numbers, bigints, safe integers or literal strings, as
 * in the R tag. An empty sum is 0 and an empty product is 1. range and seq
 * return an ExactList, which also has .sum(), .product(), .add(c), ... .
 */
import { Integer } from "./integer.js";
import { Rational } from "./rational.js";
import { coreValue } from "./r-template.js";
import { ExactList } from "./exact-list.js";

const MAX_RANGE_LENGTH = 1_000_000;

const simplify = (value) => (value instanceof Rational && value.denominator === 1n ? new Integer(value.numerator) : value);

/** Inclusive arithmetic progression from start to end, as an ExactList. */
export function range(start, end, step = 1) {
  const first = coreValue(start);
  const last = coreValue(end);
  const stride = coreValue(step);
  const zero = new Integer(0);
  if (stride.equals(zero)) throw new RangeError("range step cannot be zero");
  const ascending = stride.greaterThan(zero);
  const values = new ExactList();
  for (let value = first; ascending ? !value.greaterThan(last) : !value.lessThan(last); value = value.add(stride)) {
    if (values.length >= MAX_RANGE_LENGTH) throw new RangeError(`range would exceed ${MAX_RANGE_LENGTH} values`);
    values.push(simplify(value));
  }
  return values;
}

// (list, fn?) or (start, end, fn?) or (start, end, step, fn?) -> [values, fn]
function terms(args, name) {
  const fn = typeof args.at(-1) === "function" ? args.at(-1) : null;
  const rest = fn ? args.slice(0, -1) : args;
  if (rest.length === 1 && rest[0] != null && typeof rest[0][Symbol.iterator] === "function" && typeof rest[0] !== "string") {
    return [ExactList.from(rest[0]), fn];
  }
  if (rest.length === 2 || rest.length === 3) return [range(...rest), fn];
  throw new TypeError(`${name} takes a list, or start and end (and a step), optionally followed by a function`);
}

/** Apply fn to start..end (inclusive, optional step) or a list; returns an ExactList. */
export function seq(...args) {
  const [values, fn] = terms(args, "seq");
  return fn ? values.map((value, index) => fn(value, index)) : values;
}

function fold(args, name, identity, combine) {
  const [values, fn] = terms(args, name);
  let total = identity;
  values.forEach((value, index) => {
    total = combine(total, coreValue(fn ? fn(value, index) : value));
  });
  return simplify(total);
}

/** Exact sum of a list, or of fn over start..end. */
export function sum(...args) {
  return fold(args, "sum", new Integer(0), (total, value) => total.add(value));
}

/** Exact product of a list, or of fn over start..end. */
export function product(...args) {
  return fold(args, "product", new Integer(1), (total, value) => total.multiply(value));
}

/**
 * ExactList: an Array of Core values with exact list arithmetic.
 *
 *   const xs = range(1, 4);          // ExactList [1, 2, 3, 4]
 *   xs.sum();                        // 10
 *   xs.multiply(R`1/2`).product();   // 3/2
 *   xs.map((x) => x.pow(2)).sum();   // 30 — map/filter/slice keep ExactList
 *   exact([1, "1/3", 2n]).add(1);    // [2, 4/3, 3]
 *
 * It is a real Array subclass: Array.isArray, indexing, spread, for...of,
 * JSON.stringify and every Array method work. Arithmetic methods return a new
 * list and never mutate. structuredClone and postMessage give a plain Array.
 */
import { Integer } from "./integer.js";
import { Rational } from "./rational.js";
import { coreValue } from "./r-template.js";

const simplify = (value) => (value instanceof Rational && value.denominator === 1n ? new Integer(value.numerator) : value);

export class ExactList extends Array {
  // Array methods such as map and filter build ExactLists (via Symbol.species,
  // which defaults to this constructor; Array calls it as new ExactList(length)).

  /** Exact sum of the elements, or of fn applied to each; 0 when empty. */
  sum(fn) {
    let total = new Integer(0);
    this.forEach((value, index) => { total = total.add(coreValue(fn ? fn(value, index) : value)); });
    return simplify(total);
  }

  /** Exact product of the elements, or of fn applied to each; 1 when empty. */
  product(fn) {
    let total = new Integer(1);
    this.forEach((value, index) => { total = total.multiply(coreValue(fn ? fn(value, index) : value)); });
    return simplify(total);
  }

  #elementwise(operation, other) {
    if (Array.isArray(other)) {
      if (other.length !== this.length) {
        throw new RangeError(`${operation} needs lists of the same length (${this.length} and ${other.length})`);
      }
      return this.map((value, index) => simplify(coreValue(value)[operation](coreValue(other[index]))));
    }
    const operand = coreValue(other);
    return this.map((value) => simplify(coreValue(value)[operation](operand)));
  }

  /** Add a constant to every element, or add a same-length list elementwise. */
  add(other) { return this.#elementwise("add", other); }
  /** Subtract a constant from every element, or a same-length list elementwise. */
  subtract(other) { return this.#elementwise("subtract", other); }
  /** Multiply every element by a constant, or a same-length list elementwise. */
  multiply(other) { return this.#elementwise("multiply", other); }
  /** Divide every element by a constant, or a same-length list elementwise. */
  divide(other) { return this.#elementwise("divide", other); }

  /** Raise every element to an Integer power. */
  pow(exponent) {
    const power = coreValue(exponent);
    if (!(power instanceof Integer)) throw new TypeError("pow needs an Integer exponent");
    return this.map((value) => simplify(coreValue(value).pow(power.value)));
  }

  /** Smallest element (scalars only). */
  min() {
    return this.#extreme((candidate, best) => candidate.lessThan(best), "min");
  }

  /** Largest element (scalars only). */
  max() {
    return this.#extreme((candidate, best) => candidate.greaterThan(best), "max");
  }

  #extreme(better, name) {
    if (this.length === 0) throw new RangeError(`${name} of an empty list`);
    let best = coreValue(this[0]);
    for (const value of this.slice(1)) {
      const candidate = coreValue(value);
      if (better(candidate, best)) best = candidate;
    }
    return best;
  }

  toString() {
    return `[${Array.prototype.map.call(this, String).join(", ")}]`;
  }
}

/** Wrap values (any iterable) as an ExactList of Core values. */
export function exact(values) {
  if (values == null || typeof values[Symbol.iterator] !== "function" || typeof values === "string") {
    throw new TypeError("exact needs a list (array or other iterable) of exact values");
  }
  return ExactList.from(values, (value) => coreValue(value));
}

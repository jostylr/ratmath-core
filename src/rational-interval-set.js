/**
 * A normalized finite union of exact rational intervals.
 *
 * `null` is used only at an endpoint: as a low endpoint it means -Infinity,
 * and as a high endpoint it means +Infinity. Infinite endpoints are open.
 * The class deliberately provides set operations rather than scalar numeric
 * promotion; arithmetic images belong to a range provider that can account
 * for domains and singularities.
 */

import { Rational } from "./rational.js";
import { RationalInterval } from "./rational-interval.js";

function asRational(value, name) {
  if (value === null) return null;
  if (value === undefined) {
    throw new TypeError(`${name} endpoint is required; use null for infinity`);
  }
  return value instanceof Rational ? value : new Rational(value);
}

function compareFinite(left, right) {
  if (left.lessThan(right)) return -1;
  if (left.greaterThan(right)) return 1;
  return 0;
}

function compareLow(left, right) {
  if (left === null) return right === null ? 0 : -1;
  if (right === null) return 1;
  return compareFinite(left, right);
}

function compareHigh(left, right) {
  if (left === null) return right === null ? 0 : 1;
  if (right === null) return -1;
  return compareFinite(left, right);
}

function freezeComponent(component) {
  return Object.freeze(component);
}

function normalizeComponent(input) {
  if (input instanceof RationalInterval) {
    return freezeComponent({
      low: input.low,
      high: input.high,
      lowClosed: true,
      highClosed: true,
    });
  }
  if (!input || typeof input !== "object") {
    throw new TypeError("Interval-set components must be interval objects");
  }

  const low = asRational(input.low, "Low");
  const high = asRational(input.high, "High");
  const lowClosed = input.lowClosed ?? low !== null;
  const highClosed = input.highClosed ?? high !== null;
  if (typeof lowClosed !== "boolean" || typeof highClosed !== "boolean") {
    throw new TypeError("Endpoint closure flags must be booleans");
  }
  if (low === null && lowClosed) {
    throw new RangeError("-Infinity cannot be a closed endpoint");
  }
  if (high === null && highClosed) {
    throw new RangeError("+Infinity cannot be a closed endpoint");
  }
  if (low !== null && high !== null) {
    const order = compareFinite(low, high);
    if (order > 0) throw new RangeError("Interval-set low endpoint exceeds high endpoint");
    if (order === 0 && !(lowClosed && highClosed)) return null;
  }
  return freezeComponent({ low, high, lowClosed, highClosed });
}

function componentsJoin(left, right) {
  if (right.low === null) return true;
  if (left.high === null) return true;
  const order = compareFinite(left.high, right.low);
  return order > 0 || (order === 0 && (left.highClosed || right.lowClosed));
}

function mergeComponents(left, right) {
  let high;
  let highClosed;
  const highOrder = compareHigh(left.high, right.high);
  if (highOrder > 0) {
    high = left.high;
    highClosed = left.highClosed;
  } else if (highOrder < 0) {
    high = right.high;
    highClosed = right.highClosed;
  } else {
    high = left.high;
    highClosed = left.high === null ? false : left.highClosed || right.highClosed;
  }

  const sameLow = compareLow(left.low, right.low) === 0;
  return freezeComponent({
    low: left.low,
    high,
    lowClosed: left.low === null
      ? false
      : left.lowClosed || (sameLow && right.lowClosed),
    highClosed,
  });
}

function normalizeComponents(inputs) {
  const sorted = inputs
    .map(normalizeComponent)
    .filter((component) => component !== null)
    .sort((left, right) => {
      const byLow = compareLow(left.low, right.low);
      if (byLow !== 0) return byLow;
      if (left.lowClosed !== right.lowClosed) return left.lowClosed ? -1 : 1;
      return compareHigh(right.high, left.high);
    });

  const result = [];
  for (const component of sorted) {
    const previous = result.at(-1);
    if (!previous || !componentsJoin(previous, component)) {
      result.push(component);
    } else {
      result[result.length - 1] = mergeComponents(previous, component);
    }
  }
  return Object.freeze(result);
}

function componentContainsValue(component, value) {
  const aboveLow = component.low === null || component.low.lessThan(value) ||
    (component.low.equals(value) && component.lowClosed);
  const belowHigh = component.high === null || component.high.greaterThan(value) ||
    (component.high.equals(value) && component.highClosed);
  return aboveLow && belowHigh;
}

function componentContainsComponent(outer, inner) {
  let lowerContained;
  if (outer.low === null) {
    lowerContained = true;
  } else if (inner.low === null) {
    lowerContained = false;
  } else {
    const order = compareFinite(outer.low, inner.low);
    lowerContained = order < 0 ||
      (order === 0 && (outer.lowClosed || !inner.lowClosed));
  }

  let upperContained;
  if (outer.high === null) {
    upperContained = true;
  } else if (inner.high === null) {
    upperContained = false;
  } else {
    const order = compareFinite(outer.high, inner.high);
    upperContained = order > 0 ||
      (order === 0 && (outer.highClosed || !inner.highClosed));
  }
  return lowerContained && upperContained;
}

function intersectionComponent(left, right) {
  let low;
  let lowClosed;
  const lowOrder = compareLow(left.low, right.low);
  if (lowOrder > 0) {
    low = left.low;
    lowClosed = left.lowClosed;
  } else if (lowOrder < 0) {
    low = right.low;
    lowClosed = right.lowClosed;
  } else {
    low = left.low;
    lowClosed = low === null ? false : left.lowClosed && right.lowClosed;
  }

  let high;
  let highClosed;
  const highOrder = compareHigh(left.high, right.high);
  if (highOrder < 0) {
    high = left.high;
    highClosed = left.highClosed;
  } else if (highOrder > 0) {
    high = right.high;
    highClosed = right.highClosed;
  } else {
    high = left.high;
    highClosed = high === null ? false : left.highClosed && right.highClosed;
  }

  if (low !== null && high !== null) {
    const order = compareFinite(low, high);
    if (order > 0 || (order === 0 && !(lowClosed && highClosed))) return null;
  }
  return freezeComponent({ low, high, lowClosed, highClosed });
}

function asIntervalSet(value) {
  if (value instanceof RationalIntervalSet) return value;
  return new RationalIntervalSet(value);
}

function formatEndpoint(value, negative) {
  if (value === null) return negative ? "-inf" : "inf";
  return value.toString();
}

export class RationalIntervalSet {
  #components;

  static empty = Object.freeze(new RationalIntervalSet());
  static allReals = Object.freeze(new RationalIntervalSet({
    low: null,
    high: null,
    lowClosed: false,
    highClosed: false,
  }));

  /**
   * @param {RationalInterval|RationalIntervalSet|object|object[]} components
   */
  constructor(components = []) {
    if (components instanceof RationalIntervalSet) {
      this.#components = components.#components;
      return;
    }
    const inputs = Array.isArray(components) ? components : [components];
    this.#components = normalizeComponents(inputs);
  }

  get components() {
    return this.#components;
  }

  get isEmpty() {
    return this.#components.length === 0;
  }

  get isConnected() {
    return this.#components.length <= 1;
  }

  get isBounded() {
    return this.isEmpty ||
      (this.#components[0].low !== null && this.#components.at(-1).high !== null);
  }

  get componentCount() {
    return this.#components.length;
  }

  containsValue(value) {
    const rational = value instanceof Rational ? value : new Rational(value);
    return this.#components.some((component) =>
      componentContainsValue(component, rational));
  }

  contains(other) {
    const set = asIntervalSet(other);
    return set.#components.every((inner) =>
      this.#components.some((outer) => componentContainsComponent(outer, inner)));
  }

  equals(other) {
    const set = asIntervalSet(other);
    if (this.componentCount !== set.componentCount) return false;
    return this.#components.every((left, index) => {
      const right = set.#components[index];
      return compareLow(left.low, right.low) === 0 &&
        compareHigh(left.high, right.high) === 0 &&
        left.lowClosed === right.lowClosed &&
        left.highClosed === right.highClosed;
    });
  }

  union(other) {
    const set = asIntervalSet(other);
    return new RationalIntervalSet([...this.#components, ...set.#components]);
  }

  intersection(other) {
    const set = asIntervalSet(other);
    const intersections = [];
    let leftIndex = 0;
    let rightIndex = 0;
    while (leftIndex < this.componentCount && rightIndex < set.componentCount) {
      const left = this.#components[leftIndex];
      const right = set.#components[rightIndex];
      const component = intersectionComponent(left, right);
      if (component) intersections.push(component);

      const endOrder = compareHigh(left.high, right.high);
      if (endOrder <= 0) leftIndex += 1;
      if (endOrder >= 0) rightIndex += 1;
    }
    return new RationalIntervalSet(intersections);
  }

  hull() {
    if (this.isEmpty) return RationalIntervalSet.empty;
    const first = this.#components[0];
    const last = this.#components.at(-1);
    return new RationalIntervalSet({
      low: first.low,
      high: last.high,
      lowClosed: first.lowClosed,
      highClosed: last.highClosed,
    });
  }

  /** Return the existing closed bounded interval representation when exact. */
  toRationalInterval() {
    if (this.componentCount !== 1) return null;
    const component = this.#components[0];
    if (component.low === null || component.high === null ||
      !component.lowClosed || !component.highClosed) return null;
    return new RationalInterval(component.low, component.high);
  }

  toString() {
    if (this.isEmpty) return "empty";
    return this.#components.map((component) => {
      const left = component.lowClosed ? "[" : "(";
      const right = component.highClosed ? "]" : ")";
      return `${left}${formatEndpoint(component.low, true)},${formatEndpoint(component.high, false)}${right}`;
    }).join(" U ");
  }

  toJSON() {
    return {
      $ratmath: "RationalIntervalSet",
      components: this.#components.map((component) => ({ ...component })),
    };
  }

  static point(value) {
    const rational = value instanceof Rational ? value : new Rational(value);
    return new RationalIntervalSet({
      low: rational,
      high: rational,
      lowClosed: true,
      highClosed: true,
    });
  }

  static fromInterval(interval) {
    if (!(interval instanceof RationalInterval)) {
      throw new TypeError("Expected a RationalInterval");
    }
    return new RationalIntervalSet(interval);
  }
}

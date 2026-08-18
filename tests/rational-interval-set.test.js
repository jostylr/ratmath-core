import { describe, expect, test } from "bun:test";
import {
  RationalInterval,
  RationalIntervalSet,
  isCoreNumber,
  isRationalIntervalSet,
  reviveCoreValue,
} from "../index.js";

describe("RationalIntervalSet", () => {
  test("normalizes order, overlap, and covered touching endpoints", () => {
    const set = new RationalIntervalSet([
      { low: 2, high: 3, lowClosed: false, highClosed: true },
      new RationalInterval(0, 1),
      { low: 1, high: 2, lowClosed: false, highClosed: true },
    ]);

    expect(set.toString()).toBe("[0,3]");
    expect(set.componentCount).toBe(1);
  });

  test("does not merge across an omitted touching point", () => {
    const set = new RationalIntervalSet([
      { low: 0, high: 1, lowClosed: true, highClosed: false },
      { low: 1, high: 2, lowClosed: false, highClosed: true },
    ]);

    expect(set.toString()).toBe("[0,1) U (1,2]");
    expect(set.containsValue(1)).toBe(false);
    expect(set.isConnected).toBe(false);
  });

  test("represents empty, point, and unbounded sets canonically", () => {
    expect(RationalIntervalSet.empty.toString()).toBe("empty");
    expect(RationalIntervalSet.empty.isBounded).toBe(true);
    expect(RationalIntervalSet.point("2/3").toString()).toBe("[2/3,2/3]");
    expect(RationalIntervalSet.allReals.toString()).toBe("(-inf,inf)");
    expect(RationalIntervalSet.allReals.isBounded).toBe(false);

    const ray = new RationalIntervalSet({
      low: null,
      high: 1,
      lowClosed: false,
      highClosed: true,
    });
    expect(ray.toString()).toBe("(-inf,1]");
    expect(ray.containsValue(-1000)).toBe(true);
    expect(() => new RationalIntervalSet({
      low: null,
      high: 1,
      lowClosed: true,
      highClosed: true,
    })).toThrow("cannot be a closed endpoint");

    const nestedRays = new RationalIntervalSet([
      { low: null, high: -2, lowClosed: false, highClosed: true },
      { low: null, high: -1, lowClosed: false, highClosed: false },
    ]);
    expect(nestedRays.toString()).toBe("(-inf,-1)");
  });

  test("drops empty open points and rejects reversed components", () => {
    expect(new RationalIntervalSet({
      low: 1,
      high: 1,
      lowClosed: false,
      highClosed: true,
    }).isEmpty).toBe(true);
    expect(() => new RationalIntervalSet({ low: 2, high: 1 })).toThrow(
      "exceeds high endpoint",
    );
  });

  test("computes exact union and intersection with endpoint topology", () => {
    const left = new RationalIntervalSet([
      { low: null, high: 0, lowClosed: false, highClosed: false },
      { low: 1, high: 3, lowClosed: true, highClosed: false },
    ]);
    const right = new RationalIntervalSet({
      low: 0,
      high: 2,
      lowClosed: true,
      highClosed: true,
    });

    expect(left.union(right).toString()).toBe("(-inf,3)");
    expect(left.intersection(right).toString()).toBe("[1,2]");
    expect(right.intersection({
      low: 2,
      high: null,
      lowClosed: false,
      highClosed: false,
    }).isEmpty).toBe(true);
  });

  test("checks set containment including open boundaries", () => {
    const outer = new RationalIntervalSet({
      low: 0,
      high: 2,
      lowClosed: false,
      highClosed: true,
    });
    expect(outer.contains({
      low: 0,
      high: 1,
      lowClosed: false,
      highClosed: true,
    })).toBe(true);
    expect(outer.contains(new RationalInterval(0, 1))).toBe(false);
    expect(outer.containsValue(0)).toBe(false);
    expect(outer.containsValue(2)).toBe(true);
  });

  test("forms a topology-preserving hull and converts only closed components", () => {
    const set = new RationalIntervalSet([
      { low: 0, high: 1, lowClosed: false, highClosed: true },
      new RationalInterval(3, 4),
    ]);
    expect(set.hull().toString()).toBe("(0,4]");
    expect(set.hull().toRationalInterval()).toBeNull();

    const closed = RationalIntervalSet.fromInterval(new RationalInterval(1, 2));
    expect(closed.toRationalInterval().toString()).toBe("1:2");
  });

  test("is immutable in its public structure and round-trips tagged JSON", () => {
    const original = new RationalIntervalSet([
      { low: null, high: -1, lowClosed: false, highClosed: true },
      { low: 1, high: null, lowClosed: true, highClosed: false },
    ]);
    expect(Object.isFrozen(original.components)).toBe(true);
    expect(Object.isFrozen(original.components[0])).toBe(true);

    const revived = JSON.parse(JSON.stringify(original), reviveCoreValue);
    expect(isRationalIntervalSet(revived)).toBe(true);
    expect(revived.equals(original)).toBe(true);
    expect(isCoreNumber(revived)).toBe(false);
  });
});

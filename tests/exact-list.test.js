import { describe, expect, test } from "bun:test";
import { ExactList, Integer, R, Rational, exact, range, seq, sum } from "../index.js";

const texts = (values) => [...values].map(String);

describe("ExactList", () => {
  test("range and seq return ExactLists that are real arrays", () => {
    const xs = range(1, 4);
    expect(xs).toBeInstanceOf(ExactList);
    expect(Array.isArray(xs)).toBe(true);
    expect(xs.length).toBe(4);
    expect(String(xs[2])).toBe("3");
    expect(texts([...xs])).toEqual(["1", "2", "3", "4"]);
    expect(seq(1, 3, (k) => R`1/${k}`)).toBeInstanceOf(ExactList);
    expect(seq([1, 2])).toBeInstanceOf(ExactList);
    const seen = [];
    for (const value of xs) seen.push(String(value));
    expect(seen).toEqual(["1", "2", "3", "4"]);
  });

  test("Array methods keep ExactList and work unchanged", () => {
    const xs = range(1, 6);
    expect(xs.map((x) => x.pow(2))).toBeInstanceOf(ExactList);
    expect(xs.filter((x) => x.isEven())).toBeInstanceOf(ExactList);
    expect(xs.slice(1, 3)).toBeInstanceOf(ExactList);
    expect(xs.concat([7])).toBeInstanceOf(ExactList);
    expect(texts(xs.filter((x) => x.isEven()))).toEqual(["2", "4", "6"]);
    expect(String(xs.reduce((a, b) => a.add(b)))).toBe("21");
    expect(xs.map(String)).toEqual(Object.assign(new ExactList(), ["1", "2", "3", "4", "5", "6"]));
    expect(new ExactList(3).length).toBe(3); // species path: new ExactList(length)
  });

  test("sum and product, with and without a function", () => {
    const xs = range(1, 4);
    expect(String(xs.sum())).toBe("10");
    expect(String(xs.product())).toBe("24");
    expect(String(xs.sum((x) => R`1/${x}`))).toBe("25/12");
    expect(String(xs.product((x, i) => i + 1))).toBe("24");
    expect(new ExactList().sum().value).toBe(0n);
    expect(new ExactList().product().value).toBe(1n);
    expect(exact(["1/2", "1/2"]).sum()).toBeInstanceOf(Integer);
    expect(String(sum(range(1, 4)))).toBe("10");
  });

  test("elementwise arithmetic with a constant or a same-length list, never mutating", () => {
    const xs = range(1, 4);
    expect(texts(xs.add(1))).toEqual(["2", "3", "4", "5"]);
    expect(texts(xs.subtract("1/2"))).toEqual(["1/2", "3/2", "5/2", "7/2"]);
    expect(texts(xs.multiply(R`1/2`))).toEqual(["1/2", "1", "3/2", "2"]);
    expect(texts(xs.divide(2n))).toEqual(["1/2", "1", "3/2", "2"]);
    expect(texts(xs.add([1, 1, 1, 1]))).toEqual(["2", "3", "4", "5"]);
    expect(texts(xs.multiply(range(4, 1, -1)))).toEqual(["4", "6", "6", "4"]);
    expect(texts(xs.pow(2))).toEqual(["1", "4", "9", "16"]);
    expect(texts(xs.pow(-1))).toEqual(["1", "1/2", "1/3", "1/4"]);
    expect(xs.multiply(R`1/2`)[1]).toBeInstanceOf(Integer);
    expect(texts(xs)).toEqual(["1", "2", "3", "4"]);
    const interval = exact([1]).add(R`0:1`)[0];
    expect([String(interval.low), String(interval.high)]).toEqual(["1", "2"]);
    expect(() => xs.add([1])).toThrow("same length");
    expect(() => xs.pow(R`1/2`)).toThrow("Integer exponent");
    expect(() => xs.divide(0)).toThrow("Division by zero");
    expect(() => xs.add(0.5)).toThrow("inexact number");
  });

  test("min, max and display", () => {
    const values = exact(["1/2", "-3", "7/3"]);
    expect(String(values.min())).toBe("-3");
    expect(String(values.max())).toBe("7/3");
    expect(String(exact([5]).max())).toBe("5");
    expect(() => new ExactList().min()).toThrow("min of an empty list");
    expect(() => new ExactList().max()).toThrow("max of an empty list");
    expect(String(range(1, 3))).toBe("[1, 2, 3]");
    expect(`${new ExactList()}`).toBe("[]");
  });

  test("exact wraps iterables of exact inputs", () => {
    const values = exact(new Set([1, "1/3", 2n, new Rational(1, 7)]));
    expect(values).toBeInstanceOf(ExactList);
    expect(texts(values)).toEqual(["1", "1/3", "2", "1/7"]);
    expect(ExactList.from([1, 2])).toBeInstanceOf(ExactList);
    expect(ExactList.of(R`1/2`)).toBeInstanceOf(ExactList);
    expect(() => exact("123")).toThrow("exact needs a list");
    expect(() => exact(null)).toThrow("exact needs a list");
    expect(() => exact([0.5])).toThrow("inexact number");
  });

  test("JSON and structured cloning see a plain array", () => {
    expect(JSON.parse(JSON.stringify(range(1, 2)))).toEqual([
      { $ratmath: "Integer", value: "1" },
      { $ratmath: "Integer", value: "2" },
    ]);
    expect(Array.isArray(structuredClone(range(1, 2)))).toBe(true);
  });
});

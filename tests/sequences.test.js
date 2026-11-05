import { describe, expect, test } from "bun:test";
import { Integer, R, Rational, product, range, seq, sum } from "../index.js";

const texts = (values) => values.map(String);

describe("range", () => {
  test("inclusive progressions with Integer, Rational and negative steps", () => {
    expect(texts(range(1, 5))).toEqual(["1", "2", "3", "4", "5"]);
    expect(range(1, 5)[0]).toBeInstanceOf(Integer);
    expect(texts(range(0, 1, R`1/4`))).toEqual(["0", "1/4", "1/2", "3/4", "1"]);
    expect(texts(range(5, 1, -2))).toEqual(["5", "3", "1"]);
    expect(range(3, 1)).toEqual([]);
    expect(texts(range("1/2", 2n))).toEqual(["1/2", "3/2"]);
  });

  test("rejects a zero step and runaway lengths", () => {
    expect(() => range(1, 5, 0)).toThrow("step cannot be zero");
    expect(() => range(1, 10_000_000)).toThrow("would exceed");
  });
});

describe("seq, sum and product", () => {
  test("seq applies a function over a range or a list", () => {
    expect(texts(seq(0, 6, 2, (k) => R`${k}^3`))).toEqual(["0", "8", "64", "216"]);
    expect(texts(seq(1, 3))).toEqual(["1", "2", "3"]);
    expect(seq([R`1/2`, 2], (value, index) => index)).toEqual([0, 1]);
  });

  test("sum and product of lists and of functions over ranges", () => {
    expect(String(sum([R`1/2`, R`1/3`]))).toBe("5/6");
    expect(String(sum(1, 10, (i) => R`${i}^2`))).toBe("385");
    expect(String(sum(1, 4, (i) => R`1/${i}`))).toBe("25/12");
    expect(String(product(1, 5, (j) => j))).toBe("120");
    expect(String(product(1, 3, 1, (j) => R`${j}/2`))).toBe("3/4");
    expect(sum([R`1/2`, R`1/2`])).toBeInstanceOf(Integer);
    expect(String(sum(["1/3", 2n, 1]))).toBe("10/3");
    expect(String(sum(new Set([1, 2])))).toBe("3");
    const interval = sum([R`1:2`, 1]);
    expect([String(interval.low), String(interval.high)]).toEqual(["2", "3"]);
  });

  test("empty sum is 0 and empty product is 1", () => {
    expect(sum([]).value).toBe(0n);
    expect(product([]).value).toBe(1n);
    expect(sum(3, 1, (i) => i).value).toBe(0n);
  });

  test("argument errors", () => {
    expect(() => sum()).toThrow("sum takes a list");
    expect(() => product("123")).toThrow("product takes a list");
    expect(() => sum([0.5])).toThrow("inexact number");
    expect(sum([new Rational(1, 3)]).equals(new Rational(1, 3))).toBe(true);
  });
});

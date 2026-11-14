import { describe, expect, test } from "bun:test";
import { R, Rational } from "../index.js";

const text = (value) => value.toString();

describe("R: an unspaced colon groups with the unspaced text around it", () => {
  test("spaced operators act on whole intervals", () => {
    expect(text(R`1:2 + 3:4`)).toBe("4:6");
    expect(text(R`1:2 + 1:2`)).toBe("2:4");
    expect(text(R`1:2 * 2`)).toBe("2:4");
    expect(text(R`2 * 1:2`)).toBe("2:4");
    expect(text(R`1:2 - 1:2`)).toBe("-1:1");
    expect(text(R`1:2 / 2`)).toBe("1/2:1");
    expect(text(R`-1:1 ^ 2`)).toBe("0:1");
    expect(text(R`1:2 + 3`)).toBe("4:5");
    expect(text(R`2 * 1/2:3/4`)).toBe("1:3/2");
  });

  test("with one colon, unspaced arithmetic stays on the endpoint", () => {
    expect(text(R`1:2*2`)).toBe("1:4");
    expect(text(R`1:2+3`)).toBe("1:5");
    expect(text(R`1+1:2`)).toBe("2:2");
    expect(text(R`1/2:3/4`)).toBe("1/2:3/4");
    const n = 3;
    expect(text(R`1:${n}+1`)).toBe("1:4");
    expect(text(R`${n}-1:${n}+1`)).toBe("2:4");
  });

  test("an unspaced + - * between two colons joins two intervals", () => {
    expect(text(R`1:2+3:4`)).toBe("4:6");
    expect(text(R`1:2-3:4`)).toBe("-3:-1");
    expect(text(R`1:2*3:4`)).toBe("3:8");
    expect(text(R`1:2+3:4+5:6`)).toBe("9:12");
    expect(text(R`1:2+1+3:4`)).toBe("5:7");
    // '/' does not split, so 0:1/2:1 asks whether 1/2 lies in [0, 1]
    expect(R`0:1/2:1`).toBe(true);
    // a sign after an operator is not a split
    expect(text(R`1:2*-3:4`)).toBe("-6:8");
  });

  test("a colon with a space beside it binds loosest", () => {
    expect(text(R`1 : 2 + 3`)).toBe("1:5");
    expect(text(R`1 + 1 : 2 * 3`)).toBe("2:6");
    expect(text(R`1: 5`)).toBe("1:5");
    expect(text(R`1 :5`)).toBe("1:5");
    expect(text(R`1/2 : 3/4`)).toBe("1/2:3/4");
  });

  test("parentheses are single operands and group independently inside", () => {
    expect(text(R`(1:2)*2`)).toBe("2:4");
    expect(text(R`(1 + 1):3 + 1`)).toBe("3:4");
    expect(text(R`(1:2 + 3:4) * 2`)).toBe("8:12");
    expect(text(R`2*(1:2 + 1)`)).toBe("4:6");
    expect(text(R`(1:2)+(3:4)`)).toBe("4:6");
  });

  test("interpolated values take part in runs", () => {
    const a = new Rational(1);
    const b = new Rational(2);
    expect(text(R`${a}:${b} + ${a}:${b}`)).toBe("2:4");
    expect(text(R`${a}:${b} * 2`)).toBe("2:4");
  });

  test("literal forms that contain a colon are unaffected", () => {
    expect(text(R`1.2[3:6] * 2`)).toBe(text(R`(1.2[3:6]) * 2`));
    expect(text(R`1.2[3:6]`)).toBe(text(R`1.23:1.26`));
  });

  test("malformed colon expressions still throw", () => {
    expect(() => R`:2`).toThrow();
    expect(() => R`1:`).toThrow();
    expect(() => R`(1:2`).toThrow();
    expect(() => R`1:2)`).toThrow();
    expect(() => R`1:2 +`).toThrow();
  });
});

describe("R: three or more colon-joined values are a betweenness test", () => {
  test("it gives a JavaScript boolean", () => {
    expect(R`1:2:3`).toBe(true);
    expect(R`3:2:1`).toBe(true);
    expect(R`1:3:2`).toBe(false);
    expect(R`1:1:2`).toBe(true);
    expect(R`1:2:3:4:5`).toBe(true);
    expect(R`1:2:3:2`).toBe(false);
    expect(R`0:1/2:1`).toBe(true);
  });

  test("spaced colons bind loosest, so endpoints and the middle can be sums", () => {
    expect(R`1: 2+3 :6`).toBe(true);
    expect(R`1: 2+3 :4`).toBe(false);
    expect(R`1 : 2 + 3 : 4`).toBe(false);
    const x = new Rational(1, 3);
    expect(R`0:${x}:1`).toBe(true);
    expect(R`0: ${x} * 4 :1`).toBe(false);
    expect(R`(0:1:2)`).toBe(true);
  });

  test("an interval operand counts with both endpoints", () => {
    expect(R`0:(1/4:1/2):1`).toBe(true);
    expect(R`0:(1/2:2):1`).toBe(false);
    expect(R`1:(1/4:1/2):0`).toBe(true);
    expect(R`0:${R`1/4:1/2`}:1`).toBe(true);
  });

  test("a chain cannot be used as a number", () => {
    expect(() => R`(1:2:3) + 1`).toThrow("true or false");
    expect(() => R`1 + (1:2:3)`).toThrow("true or false");
    expect(() => R`(1:2:3) * 2`).toThrow("true or false");
    expect(() => R`2 / (1:2:3)`).toThrow("true or false");
    expect(() => R`-(1:2:3)`).toThrow("true or false");
    expect(() => R`(1:2:3)^2`).toThrow("true or false");
    expect(() => R`(1:2:3)!`).toThrow("true or false");
    expect(() => R`(1:2:3):4`).toThrow("true or false");
    expect(() => R`1:2:${"1.5?"}`).toThrow("exact numbers and intervals");
  });
});

test("R.between is the betweenness chain with a boolean result", () => {
  const x = new Rational(1, 3);
  expect(R.between`0:${x}:1`).toBe(true);
  expect(R.between`0: ${x} * 4 :1`).toBe(false);
  expect(() => R.between`0:1`).toThrow("three or more colon-joined values");
  expect(() => R.between`1 + 1`).toThrow("three or more colon-joined values");
});

import { test, expect } from "bun:test";
import { Rational } from "../index.js";

test("SCI mode basic repeating decimal display", () => {
  const oneThird = new Rational(1n, 3n);
  const scientific = oneThird.toScientificNotation(true, 10, false);

  // Should show 3.#3E-1, not 3E-1
  expect(scientific).toBe("3.#3E-1");
});

test("SCI mode mixed number with repeating decimal", () => {
  const mixedNumber = new Rational(3n * 37n + 3n, 37n); // 3 and 3/37
  const scientific = mixedNumber.toScientificNotation(true, 10, false);

  // Should show proper repeating notation without unnecessary {0~1}
  // 3 + 3/37 = 114/37 ≈ 3.081081081...
  // The repeating part is "081" with period 3
  expect(scientific).toMatch(/^3\.#081E0$/);
});

test("SCI mode {0~n} optimization - should only use when n > 6", () => {
  // Test case where we have exactly 6 zeros - should NOT use {0~6}
  const rationalWith6Zeros = new Rational(1n, 10000000n); // 0.0000001
  const scientific6 = rationalWith6Zeros.toScientificNotation(true, 10, false);
  expect(scientific6).not.toContain("{0~6}");
  expect(scientific6).toBe("1E-7");

  // Test case where we have 7 zeros - SHOULD use {0~7} if threshold allows
  const rationalWith7Zeros = new Rational(1n, 100000000n); // 0.00000001  
  const scientific7 = rationalWith7Zeros.toScientificNotation(true, 10, false);
  // This should be 1E-8, but if there were leading zeros in fractional part, 
  // they should only be compressed with {0~n} if n > 6
  expect(scientific7).toBe("1E-8");
});

test("SCI mode {0~n} optimization - repeating zeros in fractional part", () => {
  // Create a fraction that has many leading zeros in the period
  // Example: 1/37000 which might have repeating pattern with leading zeros
  const rational = new Rational(1n, 37000n);
  const scientific = rational.toScientificNotation(true, 10, false);

  // If the fractional part has {0~1} through {0~6}, these should be expanded
  expect(scientific).not.toContain("{0~1}");
  expect(scientific).not.toContain("{0~2}");
  expect(scientific).not.toContain("{0~3}");
  expect(scientific).not.toContain("{0~4}");
  expect(scientific).not.toContain("{0~5}");
  expect(scientific).not.toContain("{0~6}");

  // Only {0~7} and higher should be allowed
  if (scientific.includes("{0~")) {
    const match = scientific.match(/\{0~(\d+)\}/);
    if (match) {
      const count = parseInt(match[1]);
      expect(count).toBeGreaterThan(6);
    }
  }
});

test("SCI mode proper decimal notation for simple fractions", () => {
  // 1/2 should be 5E-1, not 5.0E-1 or other variants
  const oneHalf = new Rational(1n, 2n);
  expect(oneHalf.toScientificNotation(true, 10, false)).toBe("5E-1");

  // 1/4 should be 2.5E-1
  const oneQuarter = new Rational(1n, 4n);
  expect(oneQuarter.toScientificNotation(true, 10, false)).toBe("2.5E-1");

  // 1/8 should be 1.25E-1
  const oneEighth = new Rational(1n, 8n);
  expect(oneEighth.toScientificNotation(true, 10, false)).toBe("1.25E-1");
});

test("SCI mode repeating decimals with proper # notation", () => {
  // 1/6 = 0.1666... should be 1.#6E-1
  const oneSixth = new Rational(1n, 6n);
  expect(oneSixth.toScientificNotation(true, 10, false)).toBe("1.#6E-1");

  // 1/7 = 0.142857142857... should be 1.#428571E-1
  const oneSeventh = new Rational(1n, 7n);
  const sci7 = oneSeventh.toScientificNotation(true, 10, false);
  expect(sci7).toMatch(/^1\.#\d+E-1$/);
  expect(sci7).toContain("#");

  // 2/3 = 0.666... should be 6.#6E-1
  const twoThirds = new Rational(2n, 3n);
  expect(twoThirds.toScientificNotation(true, 10, false)).toBe("6.#6E-1");
});

test("SCI mode large numbers with repeating decimals", () => {
  // 10/3 = 3.333... should be 3.#3E0
  const tenThirds = new Rational(10n, 3n);
  expect(tenThirds.toScientificNotation(true, 10, false)).toBe("3.#3E0");

  // 100/3 = 33.333... should be 3.#3E1  
  const hundredThirds = new Rational(100n, 3n);
  expect(hundredThirds.toScientificNotation(true, 10, false)).toBe("3.#3E1");

  // 1000/7 should have proper scientific notation with repeating decimal
  const thousandSevenths = new Rational(1000n, 7n);
  const sciResult = thousandSevenths.toScientificNotation(true, 10, false);
  expect(sciResult).toMatch(/^1\.\d+#\d+E2$/);
});

test("SCI mode zero and whole numbers", () => {
  // 0 should be "0"
  const zero = new Rational(0n, 1n);
  expect(zero.toScientificNotation(true, 10, false)).toBe("0");

  // Whole numbers should have proper scientific notation
  const thousand = new Rational(1000n, 1n);
  expect(thousand.toScientificNotation(true, 10, false)).toBe("1E3");

  const million = new Rational(1000000n, 1n);
  expect(million.toScientificNotation(true, 10, false)).toBe("1E6");
});

test("SCI mode precision control", () => {
  const oneThird = new Rational(1n, 3n);

  // With precision 3
  const sci3 = oneThird.toScientificNotation(true, 3, false);
  expect(sci3).toBe("3.#3E-1");

  // With precision 10 (default)
  const sci10 = oneThird.toScientificNotation(true, 10, false);
  expect(sci10).toBe("3.#3E-1");

  // The precision should mainly affect the length of displayed digits
  // but the basic format should remain consistent
});
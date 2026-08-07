import { test, expect } from "bun:test";
import { Rational } from "../src/rational.js";

test("Zero notation optimization - should only use {0~n} when n > 6", () => {
  // Test case: 3..3/37 = 114/37 = 3.081081081...
  const mixed = new Rational("3..3/37");
  
  // Standard decimal should show 3.#081, not 3.#{0~1}81
  const decimal = mixed.toRepeatingDecimal();
  expect(decimal).toBe("3.#081");
  expect(decimal).not.toContain("{0~1}");
  
  // SCI mode should also show correct format  
  const sci = mixed.toScientificNotation(true, 10, false);
  expect(sci).toBe("3.#081E0");
  expect(sci).not.toContain("{0~1}");
});

test("Zero notation optimization - various cases under threshold", () => {
  // Create test cases that would have {0~1} through {0~6}
  // These should all be expanded, not compressed
  
  // Test a fraction that results in period with 1 leading zero
  const rational1 = new Rational(1n, 37n); // 0.027027027...
  const decimal1 = rational1.toRepeatingDecimal();
  expect(decimal1).not.toContain("{0~1}");
  expect(decimal1).not.toContain("{0~2}");
  expect(decimal1).not.toContain("{0~3}");
  expect(decimal1).not.toContain("{0~4}");
  expect(decimal1).not.toContain("{0~5}");
  expect(decimal1).not.toContain("{0~6}");
  
  // Test SCI mode as well
  const sci1 = rational1.toScientificNotation(true, 10, false);
  expect(sci1).not.toContain("{0~1}");
  expect(sci1).not.toContain("{0~2}");
  expect(sci1).not.toContain("{0~3}");
  expect(sci1).not.toContain("{0~4}");
  expect(sci1).not.toContain("{0~5}");
  expect(sci1).not.toContain("{0~6}");
});

test("Zero notation optimization - should use {0~n} when n > 6", () => {
  const rational = new Rational(1, 99999999);
  expect(rational.toRepeatingDecimal()).toBe("0.#{0~7}1");
});

test("SCI mode zero notation consistency", () => {
  // Ensure SCI mode and regular decimal mode have consistent {0~n} behavior
  
  const mixed = new Rational("3..3/37");
  const decimal = mixed.toRepeatingDecimal();
  const sci = mixed.toScientificNotation(true, 10, false);
  
  // Both should avoid {0~1} through {0~6}
  const badPatterns = ["{0~1}", "{0~2}", "{0~3}", "{0~4}", "{0~5}", "{0~6}"];
  
  for (const pattern of badPatterns) {
    expect(decimal).not.toContain(pattern);
    expect(sci).not.toContain(pattern);
  }
  
  // Both should show the same repeating pattern (081 in this case)
  expect(decimal).toContain("#081");
  expect(sci).toContain("#081");
});

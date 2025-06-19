/**
 * Base Input-Output Examples
 *
 * This file demonstrates the new BASE command functionality that allows
 * separate input and output bases in the RatMath calculator.
 */

import { Parser } from "../index.js";
import { BaseSystem } from "../src/base-system.js";
import { VariableManager } from "../src/var.js";

console.log("=== Base Input-Output Examples ===\n");

// ============================================================================
// Basic Input-Output Base Separation
// ============================================================================

console.log("1. Basic Input-Output Base Separation\n");

// Example: Input in binary, output in decimal
const vm1 = new VariableManager();
vm1.setInputBase(BaseSystem.BINARY);

console.log("Input base: Binary, Output base: Decimal");
console.log("Input: 101 (binary)");
const result1 = vm1.processInput("101");
console.log(`Output: ${result1.result.toString()} (decimal)`);
console.log();

// Example: Input in hexadecimal, output in binary
const vm2 = new VariableManager();
vm2.setInputBase(BaseSystem.HEXADECIMAL);

console.log("Input base: Hexadecimal, Output base: Binary");
console.log("Input: FF (hexadecimal)");
const result2 = vm2.processInput("FF");
console.log(`Output: ${result2.result.toString()} (decimal)`);
// To show in binary, we'd convert: BaseSystem.BINARY.fromDecimal(result2.result.value)
console.log(
  `In binary: ${BaseSystem.BINARY.fromDecimal(result2.result.value)}`,
);
console.log();

// ============================================================================
// Arithmetic with Input Base Conversion
// ============================================================================

console.log("2. Arithmetic with Input Base Conversion\n");

const vm3 = new VariableManager();
vm3.setInputBase(BaseSystem.BINARY);

console.log("Input base: Binary");
console.log("Expression: 101 + 11 (binary arithmetic)");
const result3 = vm3.processInput("101 + 11");
console.log(`Result: ${result3.result.toString()} (decimal)`);
console.log("Explanation: 101₂ (5) + 11₂ (3) = 8");
console.log();

// ============================================================================
// Mixed Base Notation
// ============================================================================

console.log("3. Mixed Base Notation\n");

const vm4 = new VariableManager();
vm4.setInputBase(BaseSystem.BINARY);

console.log("Input base: Binary (bare numbers interpreted as binary)");
console.log("Expression: 101[2] + FF[16] + 77[8]");
const result4 = vm4.processInput("101[2] + FF[16] + 77[8]");
console.log(`Result: ${result4.result.toString()} (decimal)`);
console.log("Explanation: 101₂ (5) + FF₁₆ (255) + 77₈ (63) = 323");
console.log();

// ============================================================================
// Variable Assignments with Input Base
// ============================================================================

console.log("4. Variable Assignments with Input Base\n");

const vm5 = new VariableManager();
vm5.setInputBase(BaseSystem.OCTAL);

console.log("Input base: Octal");
console.log("Assignment: x = 777 (octal)");
const assign5 = vm5.processInput("x = 777");
console.log(`Variable x: ${assign5.result.toString()} (decimal)`);

console.log("Using variable: x + 123 (octal)");
const result5 = vm5.processInput("x + 123");
console.log(`Result: ${result5.result.toString()} (decimal)`);
console.log("Explanation: 777₈ (511) + 123₈ (83) = 594");
console.log();

// ============================================================================
// Function Definitions with Input Base
// ============================================================================

console.log("5. Function Definitions with Input Base\n");

const vm6 = new VariableManager();
vm6.setInputBase(BaseSystem.BINARY);

console.log("Input base: Binary");
console.log("Function definition: F[x] = x * 10 (binary)");
const func6 = vm6.processInput("F[x] = x * 10");
console.log("Function defined successfully");

console.log("Function call: F(101) (binary)");
const result6 = vm6.processInput("F(101)");
console.log(`Result: ${result6.result.toString()} (decimal)`);
console.log("Explanation: F(101₂) = 5 * 2 = 10");
console.log();

// ============================================================================
// Multiple Output Bases Example
// ============================================================================

console.log("6. Multiple Output Bases (Simulated)\n");

// Simulate what the calculator does with BASE 2->[10,16,2]
const inputNumber = "1111";
const inputBase = BaseSystem.BINARY;
const outputBases = [
  BaseSystem.DECIMAL,
  BaseSystem.HEXADECIMAL,
  BaseSystem.BINARY,
];

console.log(`Input: ${inputNumber} (base ${inputBase.base})`);
const decimalValue = inputBase.toDecimal(inputNumber);
console.log(`Decimal value: ${decimalValue}`);

console.log("Output in multiple bases:");
outputBases.forEach((base) => {
  if (base.base === 10) {
    console.log(`  Base ${base.base}: ${decimalValue}`);
  } else {
    const converted = base.fromDecimal(decimalValue);
    console.log(`  Base ${base.base}: ${converted}`);
  }
});
console.log();

// ============================================================================
// Custom Base Examples
// ============================================================================

console.log("7. Custom Base Systems\n");

const vm7 = new VariableManager();
const base5 = new BaseSystem("01234", "Base 5");
vm7.setInputBase(base5);

console.log("Input base: Custom Base 5 (characters: 01234)");
console.log("Input: 1234 (base 5)");
const result7 = vm7.processInput("1234");
console.log(`Output: ${result7.result.toString()} (decimal)`);
console.log(
  "Explanation: 1234₅ = 1×5³ + 2×5² + 3×5¹ + 4×5⁰ = 125 + 50 + 15 + 4 = 194",
);
console.log();

// ============================================================================
// Edge Cases and Limitations
// ============================================================================

console.log("8. Edge Cases and Current Limitations\n");

const vm8 = new VariableManager();
vm8.setInputBase(BaseSystem.BINARY);

console.log("Input base: Binary");
console.log("Valid binary number: 1010");
const result8a = vm8.processInput("1010");
console.log(`Result: ${result8a.result.toString()} (decimal = 10)`);

console.log("Invalid binary digits: 123 (contains 2 and 3)");
const result8b = vm8.processInput("123");
console.log(
  `Result: ${result8b.result.toString()} (treated as decimal since invalid in binary)`,
);

console.log("Scientific notation: 1E3 (preserved as-is)");
const result8c = vm8.processInput("1E3");
console.log(`Result: ${result8c.result.toString()} (= 1000)`);
console.log();

// ============================================================================
// Performance and Practical Usage
// ============================================================================

console.log("9. Practical Usage Patterns\n");

// Convert between common programmer bases
console.log("Converting between programmer bases:");
const hexValue = "cafe";
const hexBase = BaseSystem.HEXADECIMAL;
const decimalResult = hexBase.toDecimal(hexValue);

console.log(`Hexadecimal: ${hexValue.toUpperCase()}`);
console.log(`Decimal: ${decimalResult}`);
console.log(`Binary: ${BaseSystem.BINARY.fromDecimal(decimalResult)}`);
console.log(`Octal: ${BaseSystem.OCTAL.fromDecimal(decimalResult)}`);
console.log();

// ============================================================================
// Calculator Command Examples
// ============================================================================

console.log("10. Calculator Command Examples\n");

console.log("These are the commands you can use in calc.js:");
console.log("");
console.log("# Set input base to binary, output base to decimal:");
console.log("BASE 2->10");
console.log("");
console.log("# Set input base to hex, output to multiple bases:");
console.log("BASE 16->[10,2,8]");
console.log("");
console.log("# Check current base configuration:");
console.log("BASE");
console.log("");
console.log("# Enter numbers in the input base:");
console.log("101    # Interpreted as binary if input base is 2");
console.log("FF     # Interpreted as hex if input base is 16");
console.log("");
console.log("# Use explicit base notation to override:");
console.log("101[2] + FF[16]  # Explicit bases always work");
console.log("");
console.log("# Return to standard behavior:");
console.log("BASE 10  # or DEC");
console.log();

console.log("=== Examples Complete ===");

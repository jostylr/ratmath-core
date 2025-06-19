/**
 * Base-Aware Input Parsing Examples
 *
 * Demonstrates the new functionality where input can be parsed in different bases
 * and E notation is base-aware (uses the current base for exponentiation).
 */

import { Parser } from "../src/parser.js";
import { BaseSystem } from "../src/base-system.js";

console.log("=== Base-Aware Input Parsing Examples ===\n");

// Create some base systems for demonstration
const binary = BaseSystem.BINARY;
const base3 = BaseSystem.fromBase(3);
const hex = BaseSystem.HEXADECIMAL;
const base5 = BaseSystem.fromBase(5);

console.log("1. Basic Input Base Parsing");
console.log("---------------------------");

// Parse the same string "12" in different bases
console.log('Parsing "12" in different bases:');
console.log(`  Decimal: ${Parser.parse("12", { inputBase: BaseSystem.DECIMAL }).toString()}`);
console.log(`  Base 3:  ${Parser.parse("12", { inputBase: base3 }).toString()}`); // 12₃ = 5
console.log(`  Base 5:  ${Parser.parse("12", { inputBase: base5 }).toString()}`); // 12₅ = 7
console.log(`  Base 8:  ${Parser.parse("12", { inputBase: BaseSystem.OCTAL }).toString()}`); // 12₈ = 10
console.log(`  Base 16: ${Parser.parse("12", { inputBase: hex }).toString()}`); // 12₁₆ = 18

console.log('\nParsing "101" in different bases:');
console.log(`  Binary:  ${Parser.parse("101", { inputBase: binary }).toString()}`); // 101₂ = 5
console.log(`  Base 3:  ${Parser.parse("101", { inputBase: base3 }).toString()}`); // 101₃ = 10
console.log(`  Base 5:  ${Parser.parse("101", { inputBase: base5 }).toString()}`); // 101₅ = 26
console.log(`  Decimal: ${Parser.parse("101", { inputBase: BaseSystem.DECIMAL }).toString()}`); // 101₁₀ = 101

console.log("\n2. Mixed Numbers in Input Base");
console.log("------------------------------");

// Mixed numbers: 12..101/211 in base 3
console.log('Parsing "12..101/211" in base 3:');
const mixedBase3 = Parser.parse("12..101/211", { inputBase: base3 });
console.log(`  Result: ${mixedBase3.toString()}`);
console.log(`  Explanation: 12₃ = 5, 101₃ = 10, 211₃ = 22`);
console.log(`  So: 5 + 10/22 = 5 + 5/11 = 60/11`);

console.log('\nParsing "1..1/10" in binary:');
const mixedBinary = Parser.parse("1..1/10", { inputBase: binary });
console.log(`  Result: ${mixedBinary.toString()}`);
console.log(`  Explanation: 1₂ = 1, 1₂ = 1, 10₂ = 2`);
console.log(`  So: 1 + 1/2 = 3/2`);

console.log("\n3. Fractions and Decimals in Input Base");
console.log("---------------------------------------");

console.log('Parsing fractions in binary:');
console.log(`  "1/10": ${Parser.parse("1/10", { inputBase: binary }).toString()}`); // 1₂/10₂ = 1/2
console.log(`  "101/11": ${Parser.parse("101/11", { inputBase: binary }).toString()}`); // 101₂/11₂ = 5/3
console.log(`  "111/100": ${Parser.parse("111/100", { inputBase: binary }).toString()}`); // 111₂/100₂ = 7/4

console.log('\nParsing decimals in binary:');
console.log(`  "10.1": ${Parser.parse("10.1", { inputBase: binary }).toString()}`); // 10.1₂ = 2.5
console.log(`  "11.01": ${Parser.parse("11.01", { inputBase: binary }).toString()}`); // 11.01₂ = 3.25
console.log(`  "1.11": ${Parser.parse("1.11", { inputBase: binary }).toString()}`); // 1.11₂ = 1.75

console.log("\n4. Base-Aware E Notation");
console.log("------------------------");

console.log('E notation in base 3 (exponent uses base 3):');
console.log(`  "12E2": ${Parser.parse("12E2", { inputBase: base3 }).toString()}`);
console.log(`  Explanation: 12₃ = 5, 2₃ = 2, so 5 × 3² = 5 × 9 = 45`);

console.log(`  "12E11": ${Parser.parse("12E11", { inputBase: base3 }).toString()}`);
console.log(`  Explanation: 12₃ = 5, 11₃ = 4, so 5 × 3⁴ = 5 × 81 = 405`);

console.log('\nE notation in binary:');
console.log(`  "101E10": ${Parser.parse("101E10", { inputBase: binary }).toString()}`);
console.log(`  Explanation: 101₂ = 5, 10₂ = 2, so 5 × 2² = 5 × 4 = 20`);

console.log(`  "11E11": ${Parser.parse("11E11", { inputBase: binary }).toString()}`);
console.log(`  Explanation: 11₂ = 3, 11₂ = 3, so 3 × 2³ = 3 × 8 = 24`);

console.log('\nNegative exponents in base 3:');
console.log(`  "12E-1": ${Parser.parse("12E-1", { inputBase: base3 }).toString()}`);
console.log(`  Explanation: 12₃ = 5, -1₃ = -1, so 5 × 3⁻¹ = 5 × 1/3 = 5/3`);

console.log("\n5. _^ Notation for Bases Containing E");
console.log("-------------------------------------");

// Create a custom base that contains E
const baseWithE = new BaseSystem("0-9A-E", "Base 15 with E");
console.log('Using _^ notation for base containing E:');
console.log(`  "AE_^2" in base 15: ${Parser.parse("AE_^2", { inputBase: baseWithE }).toString()}`);
console.log(`  Explanation: AE₁₅ = 10×15 + 14 = 164, 2₁₅ = 2, so 164 × 15² = 164 × 225 = 36900`);

console.log('\nCompare with regular E (treated as digit):');
console.log(`  "AE" in base 15: ${Parser.parse("AE", { inputBase: baseWithE }).toString()}`);
console.log(`  Explanation: AE₁₅ = 164 (E is just the digit 14)`);

console.log("\n6. Arithmetic with Input Base");
console.log("-----------------------------");

console.log('Binary arithmetic:');
console.log(`  "101 + 11": ${Parser.parse("101 + 11", { inputBase: binary }).toString()}`);
console.log(`  Explanation: 101₂ + 11₂ = 5 + 3 = 8`);

console.log(`  "1010 - 11": ${Parser.parse("1010 - 11", { inputBase: binary }).toString()}`);
console.log(`  Explanation: 1010₂ - 11₂ = 10 - 3 = 7`);

console.log(`  "11 * 101": ${Parser.parse("11 * 101", { inputBase: binary }).toString()}`);
console.log(`  Explanation: 11₂ × 101₂ = 3 × 5 = 15`);

console.log('\nBase 3 arithmetic:');
console.log(`  "12 + 21": ${Parser.parse("12 + 21", { inputBase: base3 }).toString()}`);
console.log(`  Explanation: 12₃ + 21₃ = 5 + 7 = 12`);

console.log(`  "12E2 + 1": ${Parser.parse("12E2 + 1", { inputBase: base3 }).toString()}`);
console.log(`  Explanation: (12₃ × 3²) + 1₃ = (5 × 9) + 1 = 45 + 1 = 46`);

console.log("\n7. Explicit Base Notation Overrides Input Base");
console.log("----------------------------------------------");

console.log('Using explicit base notation with different input base:');
console.log(`  "12[3]" with binary input base: ${Parser.parse("12[3]", { inputBase: binary }).toString()}`);
console.log(`  Explanation: Explicit [3] overrides binary input base, so 12₃ = 5`);

console.log(`  "FF[16]" with base 3 input base: ${Parser.parse("FF[16]", { inputBase: base3 }).toString()}`);
console.log(`  Explanation: Explicit [16] overrides base 3 input base, so FF₁₆ = 255`);

console.log('\nMixed explicit and input base in same expression:');
console.log(`  "12 + FF[16]" with base 3 input: ${Parser.parse("12 + FF[16]", { inputBase: base3 }).toString()}`);
console.log(`  Explanation: 12₃ + FF₁₆ = 5 + 255 = 260`);

console.log("\n8. Complex Expressions");
console.log("----------------------");

console.log('Complex expression in binary:');
const complexBinary = Parser.parse("(101 + 11) * 10E1", { inputBase: binary });
console.log(`  "(101 + 11) * 10E1": ${complexBinary.toString()}`);
console.log(`  Explanation: (101₂ + 11₂) × (10₂ × 2¹) = (5 + 3) × (2 × 2) = 8 × 4 = 32`);

console.log('\nComplex expression in base 3:');
const complexBase3 = Parser.parse("12..1/2 * 10E1", { inputBase: base3 });
console.log(`  "12..1/2 * 10E1": ${complexBase3.toString()}`);
console.log(`  Explanation: (12₃ + 1₃/2₃) × (10₃ × 3¹) = (5 + 1/2) × (3 × 3) = 5.5 × 9 = 49.5 = 99/2`);

console.log("\n9. Error Cases and Fallbacks");
console.log("----------------------------");

try {
  // This should fallback to decimal since '9' is not valid in binary
  const fallback = Parser.parse("9", { inputBase: binary });
  console.log(`  "9" with binary input base (fallback): ${fallback.toString()}`);
  console.log(`  Explanation: '9' is invalid in binary, so parser falls back to decimal`);
} catch (error) {
  console.log(`  Error: ${error.message}`);
}

try {
  // This should work because [2] forces binary interpretation
  const explicit = Parser.parse("9[10]", { inputBase: binary });
  console.log(`  "9[10]" with binary input base: ${explicit.toString()}`);
  console.log(`  Explanation: Explicit [10] forces decimal interpretation, so 9₁₀ = 9`);
} catch (error) {
  console.log(`  Error: ${error.message}`);
}

console.log("\n=== Summary ===");
console.log("Base-aware input parsing allows you to:");
console.log("• Parse all numbers in a specific base without explicit notation");
console.log("• Use E notation where the base of exponentiation matches the input base");
console.log("• Use _^ notation for bases that contain the letter E");
console.log("• Override input base with explicit base notation [n]");
console.log("• Fall back to decimal parsing when input base parsing fails");
console.log("• Parse complex expressions including mixed numbers, fractions, and decimals");

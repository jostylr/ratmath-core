/**
 * Base-Aware Input Parsing Examples
 *
 * This file demonstrates how RatMath can parse input numbers in different bases
 * automatically when an input base is set, without requiring explicit base notation.
 */

import { Parser } from "../src/parser.js";
import { BaseSystem } from "../src/base-system.js";

console.log("=".repeat(60));
console.log("Base-Aware Input Parsing Examples");
console.log("=".repeat(60));

// Example 1: Basic number parsing in different bases
console.log("\n1. Basic Number Parsing in Different Bases");
console.log("-".repeat(50));

const base3 = BaseSystem.fromBase(3);
const base8 = BaseSystem.fromBase(8);
const base16 = BaseSystem.HEXADECIMAL;

// Parse the same string "12" in different bases
const options3 = { inputBase: base3, typeAware: true };
const options8 = { inputBase: base8, typeAware: true };
const options16 = { inputBase: base16, typeAware: true };

const number12_base3 = Parser.parse("12", options3);
const number12_base8 = Parser.parse("12", options8);
const number12_base16 = Parser.parse("12", options16);

console.log(`"12" in base 3 = ${number12_base3.value} (decimal)`);
console.log(`"12" in base 8 = ${number12_base8.value} (decimal)`);
console.log(`"12" in base 16 = ${number12_base16.value} (decimal)`);

// Example 2: Fraction parsing in different bases
console.log("\n2. Fraction Parsing in Different Bases");
console.log("-".repeat(50));

// Parse "12/21" in base 3: 12₃ = 5₁₀, 21₃ = 7₁₀, so 5/7
const fraction_base3 = Parser.parse("12/21", options3);
console.log(
  `"12/21" in base 3 = ${fraction_base3.toString()} (${fraction_base3.numerator}/${fraction_base3.denominator})`,
);

// Parse "12/24" in base 8: 12₈ = 10₁₀, 24₈ = 20₁₀, so 10/20 = 1/2
const fraction_base8 = Parser.parse("12/24", options8);
console.log(
  `"12/24" in base 8 = ${fraction_base8.toString()} (${fraction_base8.numerator}/${fraction_base8.denominator})`,
);

// Parse "A/F" in base 16: A₁₆ = 10₁₀, F₁₆ = 15₁₀, so 10/15 = 2/3
const fraction_base16 = Parser.parse("A/F", options16);
console.log(
  `"A/F" in base 16 = ${fraction_base16.toString()} (${fraction_base16.numerator}/${fraction_base16.denominator})`,
);

// Example 3: Mixed numbers in different bases
console.log("\n3. Mixed Numbers in Different Bases");
console.log("-".repeat(50));

// Parse "12..1/2" in base 3: 12₃ = 5₁₀, 1/2₃ = 1/2₁₀, so 5 + 1/2 = 11/2
const mixed_base3 = Parser.parse("12..1/2", options3);
console.log(
  `"12..1/2" in base 3 = ${mixed_base3.toString()} (${mixed_base3.numerator}/${mixed_base3.denominator})`,
);

// Parse "12..3/4" in base 8: 12₈ = 10₁₀, 3/4₈ = 3/4₁₀, so 10 + 3/4 = 43/4
const mixed_base8 = Parser.parse("12..3/4", options8);
console.log(
  `"12..3/4" in base 8 = ${mixed_base8.toString()} (${mixed_base8.numerator}/${mixed_base8.denominator})`,
);

// Example 4: Decimal numbers in different bases
console.log("\n4. Decimal Numbers in Different Bases");
console.log("-".repeat(50));

// Parse "12.1" in base 3: 12.1₃ = 5 + 1/3 = 16/3
const decimal_base3 = Parser.parse("12.1", options3);
console.log(
  `"12.1" in base 3 = ${decimal_base3.toString()} (${decimal_base3.numerator}/${decimal_base3.denominator})`,
);

// Parse "12.4" in base 8: 12.4₈ = 10 + 4/8 = 10.5 = 21/2
const decimal_base8 = Parser.parse("12.4", options8);
console.log(
  `"12.4" in base 8 = ${decimal_base8.toString()} (${decimal_base8.numerator}/${decimal_base8.denominator})`,
);

// Parse "A.8" in base 16: A.8₁₆ = 10 + 8/16 = 10.5 = 21/2
const decimal_base16 = Parser.parse("A.8", options16);
console.log(
  `"A.8" in base 16 = ${decimal_base16.toString()} (${decimal_base16.numerator}/${decimal_base16.denominator})`,
);

// Example 5: E notation in different bases
console.log("\n5. Base-Aware E Notation");
console.log("-".repeat(50));

// Parse "12E2" in base 3: 12₃ = 5₁₀, E2₃ means × 3², so 5 × 9 = 45
const enotation_base3 = Parser.parse("12E2", options3);
console.log(`"12E2" in base 3 = ${enotation_base3.value} (5 × 3² = 45)`);

// Parse "12E2" in base 8: 12₈ = 10₁₀, E2₈ means × 8², so 10 × 64 = 640
const enotation_base8 = Parser.parse("12E2", options8);
console.log(`"12E2" in base 8 = ${enotation_base8.value} (10 × 8² = 640)`);

// Parse "A_^2" in base 16: A₁₆ = 10₁₀, _^2 means × 16², so 10 × 256 = 2560
// Note: Use _^ notation because hex contains 'E' as a digit
const enotation_base16 = Parser.parse("A_^2", options16);
console.log(`"A_^2" in base 16 = ${enotation_base16.value} (10 × 16² = 2560)`);

// Example 6: Exponent parsing in input base
console.log("\n6. Exponent Parsing in Input Base");
console.log("-".repeat(50));

// Parse "2E12" in base 3: 2₃ = 2₁₀, E12₃ where 12₃ = 5₁₀, so 2 × 3⁵ = 2 × 243 = 486
const exp_base3 = Parser.parse("2E12", options3);
console.log(`"2E12" in base 3 = ${exp_base3.value} (2 × 3⁵ = 486)`);

// Example 7: _^ notation for bases containing E
console.log("\n7. _^ Notation for Bases Containing E");
console.log("-".repeat(50));

// Create a base that contains E as a digit
const baseWithE = new BaseSystem("0123456789ABCDEF", "Hexadecimal with E");
const optionsWithE = { inputBase: baseWithE, typeAware: true };

// Parse "E" as a regular digit (14 in decimal)
const digitE = Parser.parse("E", optionsWithE);
console.log(`"E" as digit in hex = ${digitE.value}`);

// Parse "AE_^2" using _^ notation: AE₁₆ = 174₁₀, _^2 means × 16², so 174 × 256 = 44544
const caretNotation = Parser.parse("AE_^2", optionsWithE);
console.log(`"AE_^2" in hex = ${caretNotation.value} (174 × 16² = 44544)`);

// Example 8: Intervals in different bases
console.log("\n8. Intervals in Different Bases");
console.log("-".repeat(50));

// Parse "12:21" in base 3: 12₃ = 5₁₀, 21₃ = 7₁₀, so [5, 7]
const interval_base3 = Parser.parse("12:21", options3);
console.log(
  `"12:21" in base 3 = [${interval_base3.low.toString()}, ${interval_base3.high.toString()}]`,
);

// Example 9: Arithmetic expressions with input base
console.log("\n9. Arithmetic Expressions in Input Base");
console.log("-".repeat(50));

// Parse "12 + 21" in base 3: 12₃ + 21₃ = 5₁₀ + 7₁₀ = 12₁₀
const arithmetic_base3 = Parser.parse("12 + 21", options3);
console.log(`"12 + 21" in base 3 = ${arithmetic_base3.value} (5 + 7 = 12)`);

// Parse "12 * 21" in base 3: 12₃ × 21₃ = 5₁₀ × 7₁₀ = 35₁₀
const multiply_base3 = Parser.parse("12 * 21", options3);
console.log(`"12 * 21" in base 3 = ${multiply_base3.value} (5 × 7 = 35)`);

// Example 10: Mixed explicit and implicit base notation
console.log("\n10. Mixed Explicit and Implicit Base Notation");
console.log("-".repeat(50));

// Parse "12 + 5[10]" in base 3: 12 = 12₁₀ (decimal), plus explicit 5₁₀ = 17₁₀
// Note: In expression context, "12" is parsed as decimal, not base 3
const mixed_notation = Parser.parse("12 + 5[10]", options3);
console.log(
  `"12 + 5[10]" with base 3 input = ${mixed_notation.value} (12 + 5 = 17)`,
);

// Example 11: Complex expressions
console.log("\n11. Complex Expressions with Input Base");
console.log("-".repeat(50));

// Parse "(12 + 1) * 2 / 10" in base 3
const complex_base3 = Parser.parse("(12 + 1) * 2 / 10", options3);
console.log(`"(12 + 1) * 2 / 10" in base 3 = ${complex_base3.toString()}`);
console.log(`  Step by step: (5 + 1) * 2 / 3 = 6 * 2 / 3 = 12/3 = 4`);

// Example 12: Error handling
console.log("\n12. Error Handling");
console.log("-".repeat(50));

try {
  // This should fail because '3' is not valid in base 3
  Parser.parse("13", options3);
} catch (error) {
  console.log(`"13" in base 3 → Error: ${error.message}`);
}

try {
  // This should fail because the exponent '3' is not valid in base 3
  Parser.parse("2E3", options3);
} catch (error) {
  console.log(`"2E3" in base 3 → Error: ${error.message}`);
}

// Example 13: Binary examples
console.log("\n13. Binary Input Base Examples");
console.log("-".repeat(50));

const binaryOptions = { inputBase: BaseSystem.BINARY, typeAware: true };

// Binary number
const binary1 = Parser.parse("1010", binaryOptions);
console.log(`"1010" in binary = ${binary1.value} (decimal)`);

// Binary fraction
const binaryFrac = Parser.parse("1010/101", binaryOptions);
console.log(
  `"1010/101" in binary = ${binaryFrac.toString()} (${binaryFrac.numerator}/${binaryFrac.denominator})`,
);

// Binary E notation
const binaryE = Parser.parse("101E10", binaryOptions);
console.log(`"101E10" in binary = ${binaryE.value} (5 × 2² = 20)`);

// Binary decimal
const binaryDec = Parser.parse("101.1", binaryOptions);
console.log(
  `"101.1" in binary = ${binaryDec.toString()} (${binaryDec.numerator}/${binaryDec.denominator})`,
);

console.log("\n" + "=".repeat(60));
console.log("End of Base-Aware Input Parsing Examples");
console.log("=".repeat(60));

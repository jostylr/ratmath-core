/**
 * BaseSystem Examples
 *
 * This file demonstrates the usage of the BaseSystem class for working with
 * different number bases in RatMath.
 */

import { BaseSystem } from "../src/base-system.js";

// ============================================================================
// Basic BaseSystem Creation and Usage
// ============================================================================

console.log("=== Basic BaseSystem Usage ===\n");

// Using predefined base systems
const binary = BaseSystem.BINARY;
const octal = BaseSystem.OCTAL;
const decimal = BaseSystem.DECIMAL;
const hex = BaseSystem.HEXADECIMAL;

console.log("Standard base systems:");
console.log(`Binary: ${binary}`);
console.log(`Octal: ${octal}`);
console.log(`Decimal: ${decimal}`);
console.log(`Hexadecimal: ${hex}`);
console.log();

// Creating custom base systems
const base5 = new BaseSystem("01234", "Base 5");
const base12 = new BaseSystem("0-9ab", "Duodecimal");
const base36 = BaseSystem.BASE36;

console.log("Custom base systems:");
console.log(`Base 5: ${base5}`);
console.log(`Base 12: ${base12}`);
console.log(`Base 36: ${base36}`);
console.log();

// ============================================================================
// Number Conversion Examples
// ============================================================================

console.log("=== Number Conversions ===\n");

// Converting the same number across different bases
const number = 42n;
console.log(`Converting decimal ${number} to different bases:`);
console.log(`Binary: ${binary.fromDecimal(number)}`);
console.log(`Octal: ${octal.fromDecimal(number)}`);
console.log(`Hexadecimal: ${hex.fromDecimal(number)}`);
console.log(`Base 5: ${base5.fromDecimal(number)}`);
console.log(`Base 12: ${base12.fromDecimal(number)}`);
console.log();

// Converting from different bases back to decimal
console.log("Converting from different bases back to decimal:");
console.log(`101010[2] = ${binary.toDecimal("101010")}`);
console.log(`52[8] = ${octal.toDecimal("52")}`);
console.log(`2a[16] = ${hex.toDecimal("2a")}`);
console.log(`132[5] = ${base5.toDecimal("132")}`);
console.log(`36[12] = ${base12.toDecimal("36")}`);
console.log();

// ============================================================================
// Base Conversion Chain
// ============================================================================

console.log("=== Base Conversion Chain ===\n");

// Convert a hexadecimal number through various bases
const hexInput = "ff";
console.log(`Starting with hexadecimal: ${hexInput}`);

const decimalValue = hex.toDecimal(hexInput);
console.log(`Decimal equivalent: ${decimalValue}`);

console.log("Converting to other bases:");
console.log(`Binary: ${binary.fromDecimal(decimalValue)}`);
console.log(`Octal: ${octal.fromDecimal(decimalValue)}`);
console.log(`Base 5: ${base5.fromDecimal(decimalValue)}`);
console.log(`Base 36: ${base36.fromDecimal(decimalValue)}`);
console.log();

// ============================================================================
// Working with Large Numbers
// ============================================================================

console.log("=== Large Number Examples ===\n");

// Factorial example - convert 10! to different bases
const factorial10 = 3628800n;
console.log(`10! = ${factorial10} in decimal`);
console.log(`Binary: ${binary.fromDecimal(factorial10)}`);
console.log(`Hexadecimal: ${hex.fromDecimal(factorial10)}`);
console.log(`Base 36: ${base36.fromDecimal(factorial10)}`);
console.log();

// Powers of 2
const power2_20 = 2n ** 20n; // 2^20 = 1048576
console.log(`2^20 = ${power2_20}`);
console.log(`Binary: ${binary.fromDecimal(power2_20)}`);
console.log(`Hexadecimal: ${hex.fromDecimal(power2_20)}`);
console.log();

// ============================================================================
// Custom Base Systems
// ============================================================================

console.log("=== Custom Base Systems ===\n");

// Create a base system using only vowels
try {
  const vowelBase = new BaseSystem("aeiou", "Vowel Base");
  console.log(`Vowel base system: ${vowelBase}`);

  const testNumber = 42n;
  const vowelRepresentation = vowelBase.fromDecimal(testNumber);
  console.log(`${testNumber} in vowel base: ${vowelRepresentation}`);
  console.log(`Back to decimal: ${vowelBase.toDecimal(vowelRepresentation)}`);
  console.log();
} catch (error) {
  console.log(`Error creating vowel base: ${error.message}`);
}

// Create a base system with mixed ranges
const mixedBase = new BaseSystem("0-4A-F", "Mixed Base 10");
console.log(`Mixed base system: ${mixedBase}`);
console.log(`Characters: ${mixedBase.characters.join(", ")}`);

const testValue = 123n;
const mixedRepresentation = mixedBase.fromDecimal(testValue);
console.log(`${testValue} in mixed base: ${mixedRepresentation}`);
console.log();

// ============================================================================
// Validation Examples
// ============================================================================

console.log("=== Validation Examples ===\n");

// Test string validation
const testStrings = ["123", "ABC", "xyz", "101", "GHI"];

console.log("Testing string validation in hexadecimal:");
testStrings.forEach((str) => {
  const isValid = hex.isValidString(str);
  console.log(`"${str}": ${isValid ? "valid" : "invalid"}`);
});
console.log();

// Show base system properties
console.log("Hexadecimal base system properties:");
console.log(`Base: ${hex.base}`);
console.log(`Min digit: ${hex.getMinDigit()}`);
console.log(`Max digit: ${hex.getMaxDigit()}`);
console.log(`Character count: ${hex.characters.length}`);
console.log();

// ============================================================================
// Error Handling Examples
// ============================================================================

console.log("=== Error Handling Examples ===\n");

// Attempt to create base system with parser conflicts
console.log("Attempting to create base systems with reserved characters:");

const conflictingSequences = ["0-9+", "a-z*", "0123()"];

conflictingSequences.forEach((sequence) => {
  try {
    new BaseSystem(sequence);
    console.log(`"${sequence}": Success`);
  } catch (error) {
    console.log(`"${sequence}": ${error.message}`);
  }
});
console.log();

// Invalid character in conversion
console.log("Testing invalid characters in conversion:");
try {
  binary.toDecimal("1012"); // '2' is invalid in binary
} catch (error) {
  console.log(`Binary conversion error: ${error.message}`);
}

try {
  octal.toDecimal("789"); // '8' and '9' are invalid in octal
} catch (error) {
  console.log(`Octal conversion error: ${error.message}`);
}
console.log();

// ============================================================================
// Comparison and Utility Examples
// ============================================================================

console.log("=== Comparison and Utilities ===\n");

// Create equivalent base systems
const decimal1 = new BaseSystem("0-9");
const decimal2 = BaseSystem.DECIMAL;

console.log(`Are the decimal systems equal? ${decimal1.equals(decimal2)}`);

// Using fromBase factory method
const base16_factory = BaseSystem.fromBase(16);
const base16_preset = BaseSystem.HEXADECIMAL;

console.log(
  `Factory vs preset base 16: ${base16_factory.equals(base16_preset)}`,
);
console.log();

// Test edge cases
console.log("Edge case examples:");

// Minimum base (base 2)
const minBase = new BaseSystem("01");
console.log(`Minimum base: ${minBase}`);

// Convert zero
console.log(`Zero in binary: ${binary.fromDecimal(0n)}`);
console.log(`Zero in hex: ${hex.fromDecimal(0n)}`);

// Negative numbers
console.log(`-42 in binary: ${binary.fromDecimal(-42n)}`);
console.log(`-255 in hex: ${hex.fromDecimal(-255n)}`);
console.log();

// ============================================================================
// Extended Base Systems and Validation
// ============================================================================

console.log("=== Extended Base Systems and Validation ===\n");

// Extended base presets
console.log("Extended base systems:");
console.log(`Base 60: ${BaseSystem.BASE60}`);
console.log(`Roman Numerals: ${BaseSystem.ROMAN}`);
console.log();

// Test Base 60 (sexagesimal)
const base60 = BaseSystem.BASE60;
const testNumber60 = 3600n; // 1 hour in seconds
console.log(`Converting ${testNumber60} (seconds in an hour) to base 60:`);
console.log(`Base 60: ${base60.fromDecimal(testNumber60)}`);
console.log(
  `Back to decimal: ${base60.toDecimal(base60.fromDecimal(testNumber60))}`,
);
console.log();

// Roman numeral examples
console.log("Roman numeral system:");
const roman = BaseSystem.ROMAN;
console.log(`Roman characters: ${roman.characters.join(", ")}`);

// Test small Roman numbers
const romanTests = [1n, 5n, 10n, 50n, 100n, 500n, 1000n];
console.log("Converting numbers to Roman base representation:");
romanTests.forEach((num) => {
  const romanStr = roman.fromDecimal(num);
  console.log(`${num} → ${romanStr}`);
});
console.log();

// Custom pattern examples
console.log("Creating base systems with patterns:");

try {
  const digitsOnly = BaseSystem.createPattern("digits-only", 8);
  console.log(`Digits-only base 8: ${digitsOnly}`);

  const lettersOnly = BaseSystem.createPattern("letters-only", 16);
  console.log(`Letters-only base 16: ${lettersOnly}`);

  const uppercaseOnly = BaseSystem.createPattern("uppercase-only", 10);
  console.log(`Uppercase-only base 10: ${uppercaseOnly}`);
} catch (error) {
  console.log(`Pattern creation error: ${error.message}`);
}
console.log();

// Case sensitivity examples
console.log("Case sensitivity handling:");
const mixedCase = new BaseSystem("aAbBcC", "Mixed Case Base");
console.log(`Original mixed case: ${mixedCase}`);

const caseInsensitive = mixedCase.withCaseSensitivity(false);
console.log(`Case insensitive version: ${caseInsensitive}`);
console.log();

// Validation examples
console.log("Base system validation:");

// Test character ordering validation
try {
  const unorderedBase = new BaseSystem("0359a", "Unordered Base");
  console.log(`Unordered base created: ${unorderedBase}`);
} catch (error) {
  console.log(`Validation error: ${error.message}`);
}

// Test base vs character length validation
try {
  const invalidBase = new BaseSystem("01", "Test Base");
  // This should work fine
  console.log(`Valid base 2: ${invalidBase}`);
} catch (error) {
  console.log(`Validation error: ${error.message}`);
}
console.log();

// ============================================================================
// Practical Applications
// ============================================================================

console.log("=== Practical Applications ===\n");

// Color code conversion (RGB to hex)
const red = 255n;
const green = 128n;
const blue = 64n;

console.log("RGB to Hex conversion:");
console.log(`RGB(${red}, ${green}, ${blue})`);
console.log(`Red: ${hex.fromDecimal(red).padStart(2, "0")}`);
console.log(`Green: ${hex.fromDecimal(green).padStart(2, "0")}`);
console.log(`Blue: ${hex.fromDecimal(blue).padStart(2, "0")}`);

const hexColor =
  hex.fromDecimal(red).padStart(2, "0") +
  hex.fromDecimal(green).padStart(2, "0") +
  hex.fromDecimal(blue).padStart(2, "0");
console.log(`Hex color: #${hexColor}`);
console.log();

// File size representation
const fileSize = 1073741824n; // 1 GB in bytes
console.log(`File size: ${fileSize} bytes`);
console.log(`Binary: ${binary.fromDecimal(fileSize)}`);
console.log(`Hexadecimal: ${hex.fromDecimal(fileSize)}`);

// Show that it's exactly 2^30
const power30 = binary.fromDecimal(fileSize);
console.log(`Binary representation shows it's 2^30: ${power30}`);
console.log();

console.log("=== End of BaseSystem Examples ===");

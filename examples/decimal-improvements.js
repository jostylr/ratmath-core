#!/usr/bin/env bun

/**
 * Decimal Improvements Example
 * 
 * This example demonstrates the new decimal handling improvements in RatMath,
 * including enhanced metadata, repeat notation, and fixed scientific notation.
 */

import { Rational, Integer } from "../index.js";

console.log("🔢 RatMath Decimal Improvements Demo");
console.log("=" .repeat(50));

// Example 1: Enhanced Decimal Metadata
console.log("\n📊 1. Enhanced Decimal Metadata");
console.log("-".repeat(30));

const testRationals = [
  { rational: new Rational(1, 3), description: "Simple repeating: 1/3" },
  { rational: new Rational(1, 12), description: "Leading zeros in initial: 1/12" },
  { rational: new Rational(1, 49), description: "Leading zeros in period: 1/49" },
  { rational: new Rational(1, 300), description: "Multiple leading zeros: 1/300" },
];

for (const { rational, description } of testRationals) {
  console.log(`\n${description}:`);
  const metadata = rational.computeDecimalMetadata();
  
  console.log(`  Fraction: ${rational.toString()}`);
  console.log(`  Repeating decimal: ${rational.toRepeatingDecimal()}`);
  console.log(`  Whole part: ${metadata.wholePart}`);
  console.log(`  Initial segment: "${metadata.initialSegment}"`);
  console.log(`  Initial leading zeros: ${metadata.initialSegmentLeadingZeros}`);
  console.log(`  Initial rest: "${metadata.initialSegmentRest}"`);
  console.log(`  Period length: ${metadata.periodLength}`);
  console.log(`  Period leading zeros: ${metadata.leadingZerosInPeriod}`);
  console.log(`  Period rest: "${metadata.periodDigitsRest}"`);
}

// Example 2: Repeat Notation {0~15}
console.log("\n🔄 2. Repeat Notation for Compact Display");
console.log("-".repeat(40));

const repeatExamples = [
  new Rational(1, 1000000),   // 0.{0~5}1
  new Rational(1, 100000),    // 0.{0~4}1  
  new Rational(25, 1000000),  // 0.{0~4}25
];

for (const r of repeatExamples) {
  console.log(`\n${r.toString()}:`);
  const withoutRepeat = r.toRepeatingDecimalWithPeriod(false);
  const withRepeat = r.toRepeatingDecimalWithPeriod(true);
  console.log(`  Standard:      ${withoutRepeat.decimal}`);
  console.log(`  With repeats:  ${withRepeat.decimal}`);
}

// Example 3: Parsing Repeat Notation  
console.log("\n📝 3. Parsing Repeat Notation");
console.log("-".repeat(30));

const parseExamples = [
  "0.{0~6}1",      // 1/10000000
  "1.{23~3}",      // 1232323/1000000  
  "0.{0~3}25",     // 25/1000000
];

for (const str of parseExamples) {
  try {
    const parsed = new Rational(str);
    console.log(`"${str}" → ${parsed.toString()}`);
    console.log(`  Verification: ${parsed.toRepeatingDecimalWithPeriod(true).decimal}`);
  } catch (error) {
    console.log(`"${str}" → Error: ${error.message}`);
  }
}

// Example 4: Scientific Notation Improvements
console.log("\n🔬 4. Improved Scientific Notation");
console.log("-".repeat(35));

// The problematic case that was showing 0
const factorial10Double = new Integer(10).doubleFactorial();
const factorial49Double = new Integer(49).doubleFactorial();
const verySmallRatio = new Rational(factorial10Double.value, factorial49Double.value);

console.log("Very small number (10!!/49!!):");
console.log(`  Fraction: ${verySmallRatio.toString()}`);
console.log(`  Old behavior: Would show "0" in SCI mode`);
console.log(`  New behavior: ${verySmallRatio.toScientificNotation()}`);

// More scientific notation examples
const sciExamples = [
  { rational: new Rational(1, 1000000), description: "1 in a million" },
  { rational: new Rational(1, 3), description: "One third" },
  { rational: new Rational(12345, 1), description: "Large integer" },
  { rational: new Rational(1, 7), description: "One seventh" },
  { rational: verySmallRatio, description: "Extremely small" },
];

console.log("\nScientific notation examples:");
for (const { rational, description } of sciExamples) {
  console.log(`  ${description}:`);
  console.log(`    Standard: ${rational.toScientificNotation()}`);
  console.log(`    With repeats: ${rational.toScientificNotation(true)}`);
}

// Example 5: MAX_PERIOD_DIGITS Configuration
console.log("\n⚙️  5. Period Computation Control");
console.log("-".repeat(30));

console.log(`MAX_PERIOD_DIGITS setting: ${Rational.MAX_PERIOD_DIGITS}`);
console.log("This controls how many period digits are computed for very long periods.");

const longPeriodExample = new Rational(1, 97); // Prime denominator = long period
const shortMeta = longPeriodExample.computeDecimalMetadata(10);
const longMeta = longPeriodExample.computeDecimalMetadata(100);

console.log(`\n1/97 (long period example):`);
console.log(`  Period length: ${shortMeta.periodLength}`);
console.log(`  With 10 digits: ${shortMeta.periodDigits}`);
console.log(`  With 100 digits: ${longMeta.periodDigits.substring(0, 50)}...`);

// Example 6: Practical Use Cases
console.log("\n💡 6. Practical Applications");
console.log("-".repeat(25));

console.log("These improvements help in several scenarios:");
console.log("• Scientific calculations with very small numbers");
console.log("• Educational tools showing decimal expansion details");
console.log("• Compact representation of numbers with many leading zeros");
console.log("• Exact analysis of repeating decimal patterns");

// Show a before/after comparison
console.log("\nBefore vs After for 10!!/49!!:");
console.log(`  Before: "0" (unhelpful)`);
console.log(`  After:  "${verySmallRatio.toScientificNotation()}" (informative)`);

console.log("\n✨ All decimal improvements demonstrated!");
console.log("=" .repeat(50));
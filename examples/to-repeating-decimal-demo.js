/**
 * Demonstration of the toRepeatingDecimal() method on Rational numbers
 */

import { Rational, parseRepeatingDecimal } from '../src/index.js';

console.log('📊 TO REPEATING DECIMAL DEMO 📊\n');

// ============================================================================
// SECTION 1: Basic Fraction to Repeating Decimal Conversion
// ============================================================================
console.log('1️⃣  BASIC FRACTION TO REPEATING DECIMAL CONVERSION');
console.log('=' .repeat(60));

const basicFractions = [
  [1, 3, 'One third'],
  [2, 3, 'Two thirds'],
  [1, 6, 'One sixth'],
  [5, 6, 'Five sixths'],
  [1, 7, 'One seventh'],
  [2, 7, 'Two sevenths'],
  [1, 9, 'One ninth'],
  [2, 9, 'Two ninths'],
  [1, 11, 'One eleventh'],
  [1, 13, 'One thirteenth']
];

basicFractions.forEach(([num, den, description]) => {
  const rational = new Rational(num, den);
  const decimal = rational.toRepeatingDecimal();
  console.log(`${num}/${den}`.padEnd(8) + ` → ${decimal.padEnd(15)} (${description})`);
});
console.log();

// ============================================================================
// SECTION 2: Terminating Decimals
// ============================================================================
console.log('2️⃣  TERMINATING DECIMALS');
console.log('=' .repeat(60));

const terminatingFractions = [
  [1, 2, 'One half'],
  [1, 4, 'One quarter'],
  [3, 4, 'Three quarters'],
  [1, 5, 'One fifth'],
  [2, 5, 'Two fifths'],
  [1, 8, 'One eighth'],
  [3, 8, 'Three eighths'],
  [5, 8, 'Five eighths'],
  [1, 10, 'One tenth'],
  [1, 16, 'One sixteenth']
];

terminatingFractions.forEach(([num, den, description]) => {
  const rational = new Rational(num, den);
  const decimal = rational.toRepeatingDecimal();
  console.log(`${num}/${den}`.padEnd(8) + ` → ${decimal.padEnd(15)} (${description})`);
});
console.log();

// ============================================================================
// SECTION 3: Mixed Numbers (Improper Fractions)
// ============================================================================
console.log('3️⃣  MIXED NUMBERS (IMPROPER FRACTIONS)');
console.log('=' .repeat(60));

const mixedFractions = [
  [10, 3, 'Ten thirds (3.#3)'],
  [22, 7, 'Twenty-two sevenths (π approximation)'],
  [7, 4, 'Seven quarters'],
  [11, 6, 'Eleven sixths'],
  [25, 9, 'Twenty-five ninths'],
  [100, 7, 'One hundred sevenths']
];

mixedFractions.forEach(([num, den, description]) => {
  const rational = new Rational(num, den);
  const decimal = rational.toRepeatingDecimal();
  console.log(`${num}/${den}`.padEnd(8) + ` → ${decimal.padEnd(20)} (${description})`);
});
console.log();

// ============================================================================
// SECTION 4: Negative Numbers
// ============================================================================
console.log('4️⃣  NEGATIVE NUMBERS');
console.log('=' .repeat(60));

const negativeFractions = [
  [-1, 3, 'Negative one third'],
  [-2, 3, 'Negative two thirds'],
  [-22, 7, 'Negative π approximation'],
  [-1, 2, 'Negative one half'],
  [-7, 9, 'Negative seven ninths']
];

negativeFractions.forEach(([num, den, description]) => {
  const rational = new Rational(num, den);
  const decimal = rational.toRepeatingDecimal();
  console.log(`${num}/${den}`.padEnd(8) + ` → ${decimal.padEnd(15)} (${description})`);
});
console.log();

// ============================================================================
// SECTION 5: Integers and Zero
// ============================================================================
console.log('5️⃣  INTEGERS AND ZERO');
console.log('=' .repeat(60));

const integers = [0, 1, 2, 5, 10, 42, 100, -3, -15];

integers.forEach(num => {
  const rational = new Rational(num);
  const decimal = rational.toRepeatingDecimal();
  console.log(`${num}`.padEnd(8) + ` → ${decimal.padEnd(15)} (integer)`);
});
console.log();

// ============================================================================
// SECTION 6: Perfect Roundtrip Conversion
// ============================================================================
console.log('6️⃣  PERFECT ROUNDTRIP CONVERSION');
console.log('=' .repeat(60));

const roundtripTests = [
  new Rational(1, 3),
  new Rational(1, 7),
  new Rational(22, 7),
  new Rational(1, 11),
  new Rational(1, 13),
  new Rational(355, 113), // Better π approximation
  new Rational(1, 2),
  new Rational(-5, 6),
  new Rational(0),
  new Rational(17)
];

console.log('Original'.padEnd(15) + 'Decimal'.padEnd(20) + 'Roundtrip'.padEnd(15) + 'Match');
console.log('-'.repeat(65));

roundtripTests.forEach(original => {
  const decimal = original.toRepeatingDecimal();
  const roundtrip = parseRepeatingDecimal(decimal);
  const matches = original.equals(roundtrip);
  
  console.log(
    original.toString().padEnd(15) +
    decimal.padEnd(20) +
    roundtrip.toString().padEnd(15) +
    (matches ? '✅' : '❌')
  );
});
console.log();

// ============================================================================
// SECTION 7: Mathematical Constants and Approximations
// ============================================================================
console.log('7️⃣  MATHEMATICAL CONSTANTS AND APPROXIMATIONS');
console.log('=' .repeat(60));

const constants = [
  [22, 7, 'π approximation (Archimedes)'],
  [355, 113, 'π approximation (Milü)'],
  [577, 408, 'sqrt(2) approximation'],
  [1618, 1000, 'φ (golden ratio) approximation'],
  [2718, 1000, 'e approximation'],
  [1, 1, 'Unity'],
  [0, 1, 'Zero']
];

constants.forEach(([num, den, description]) => {
  const rational = new Rational(num, den);
  const decimal = rational.toRepeatingDecimal();
  const approx = rational.toNumber();
  
  console.log(`${description}:`);
  console.log(`  Fraction: ${rational.toString()}`);
  console.log(`  Exact: ${decimal}`);
  console.log(`  Approx: ${approx}`);
  console.log();
});

// ============================================================================
// SECTION 8: Complex Repeating Patterns
// ============================================================================
console.log('8️⃣  COMPLEX REPEATING PATTERNS');
console.log('=' .repeat(60));

// Demonstrate fractions with long repeating periods
const complexFractions = [
  [1, 17, 'Period length 16'],
  [1, 19, 'Period length 18'],
  [1, 23, 'Period length 22'],
  [1, 29, 'Period length 28'],
  [1, 97, 'Period length 96']
];

complexFractions.forEach(([num, den, description]) => {
  const rational = new Rational(num, den);
  const decimal = rational.toRepeatingDecimal();
  
  // Extract repeating part to show its length
  const hashIndex = decimal.indexOf('#');
  const repeatingPart = hashIndex >= 0 ? decimal.substring(hashIndex + 1) : '';
  
  console.log(`1/${den} (${description}):`);
  console.log(`  Decimal: ${decimal}`);
  console.log(`  Repeating part length: ${repeatingPart.length}`);
  console.log();
});

// ============================================================================
// SECTION 9: Performance with Large Numbers
// ============================================================================
console.log('9️⃣  PERFORMANCE WITH LARGE NUMBERS');
console.log('=' .repeat(60));

const largeFractions = [
  [123456789, 999999, 'Large numerator'],
  [1, 999999999, 'Large denominator'],
  [314159265, 100000000, 'π to 8 decimals'],
  [271828182, 100000000, 'e to 8 decimals']
];

largeFractions.forEach(([num, den, description]) => {
  const rational = new Rational(num, den);
  const startTime = performance.now();
  const decimal = rational.toRepeatingDecimal();
  const endTime = performance.now();
  
  console.log(`${description}:`);
  console.log(`  Input: ${num}/${den}`);
  console.log(`  Output: ${decimal.length > 50 ? decimal.substring(0, 47) + '...' : decimal}`);
  console.log(`  Time: ${(endTime - startTime).toFixed(2)}ms`);
  console.log();
});

// ============================================================================
// SECTION 10: Practical Applications
// ============================================================================
console.log('🔟 PRACTICAL APPLICATIONS');
console.log('=' .repeat(60));

console.log('Financial calculations with exact representation:');
const price = new Rational(9999, 100);  // $99.99
const taxRate = new Rational(1, 15);    // 6.666...% = 1/15
const tax = price.multiply(taxRate);
const total = price.add(tax);

console.log(`Price: $${price.toNumber()} = ${price.toRepeatingDecimal()}`);
console.log(`Tax rate: ${taxRate.toNumber() * 100}% = ${taxRate.toRepeatingDecimal()}`);
console.log(`Tax: $${tax.toNumber()} = ${tax.toRepeatingDecimal()}`);
console.log(`Total: $${total.toNumber()} = ${total.toRepeatingDecimal()}`);
console.log();

console.log('Unit conversion examples:');
const conversions = [
  [1, 3, 'feet to yards'],
  [5, 9, 'Celsius to Fahrenheit factor'],
  [1, 12, 'inches to feet'],
  [1, 16, 'ounces to pounds']
];

conversions.forEach(([num, den, description]) => {
  const factor = new Rational(num, den);
  console.log(`${description}: ${factor.toString()} = ${factor.toRepeatingDecimal()}`);
});

console.log('\n✨ Demo complete! The toRepeatingDecimal() method provides exact decimal representations for all rational numbers. ✨');
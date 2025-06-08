/**
 * Demonstration of roundtrip conversion between Rational numbers and repeating decimals
 */

import { Rational, parseRepeatingDecimal } from '../src/index.js';

console.log('🔄 ROUNDTRIP CONVERSION DEMO 🔄\n');

// Test cases: [numerator, denominator, description]
const testCases = [
  [1, 3, 'One third'],
  [2, 3, 'Two thirds'], 
  [1, 6, 'One sixth'],
  [5, 6, 'Five sixths'],
  [1, 7, 'One seventh'],
  [1, 9, 'One ninth'],
  [2, 9, 'Two ninths'],
  [1, 11, 'One eleventh'],
  [22, 7, 'Twenty-two sevenths (π approximation)'],
  [1, 2, 'One half (terminating)'],
  [3, 4, 'Three fourths (terminating)'],
  [1, 8, 'One eighth (terminating)'],
  [7, 4, 'Seven fourths (mixed terminating)'],
  [10, 3, 'Ten thirds (mixed repeating)'],
  [-1, 3, 'Negative one third'],
  [-22, 7, 'Negative twenty-two sevenths'],
  [0, 1, 'Zero'],
  [5, 1, 'Five (integer)'],
  [-7, 1, 'Negative seven (integer)']
];

console.log('Testing Rational → Repeating Decimal → Rational roundtrip:\n');
console.log('Original'.padEnd(20) + 'Repeating Decimal'.padEnd(20) + 'Roundtrip'.padEnd(20) + 'Match'.padEnd(8) + 'Description');
console.log('='.repeat(85));

let allPassed = true;

testCases.forEach(([num, den, description]) => {
  // Create original rational
  const original = new Rational(num, den);
  
  // Convert to repeating decimal
  const repeatingDecimal = original.toRepeatingDecimal();
  
  // Convert back to rational
  const roundtrip = parseRepeatingDecimal(repeatingDecimal);
  
  // Check if they match
  const matches = original.equals(roundtrip);
  if (!matches) allPassed = false;
  
  const status = matches ? '✅' : '❌';
  
  console.log(
    original.toString().padEnd(20) +
    repeatingDecimal.padEnd(20) +
    roundtrip.toString().padEnd(20) +
    status.padEnd(8) +
    description
  );
});

console.log('\n' + '='.repeat(85));
console.log(`Overall result: ${allPassed ? '✅ All tests passed!' : '❌ Some tests failed!'}\n`);

// Demonstrate some interesting mathematical properties
console.log('🧮 MATHEMATICAL PROPERTIES:\n');

// Show that 0.999... = 1
const nineNines = new Rational(1);
const nineNinesDecimal = parseRepeatingDecimal('0.#9');
console.log(`1 = ${nineNines.toRepeatingDecimal()}`);
console.log(`0.#9 = ${nineNinesDecimal.toString()}`);
console.log(`Are they equal? ${nineNines.equals(nineNinesDecimal) ? '✅ Yes' : '❌ No'}\n`);

// Show common fractions and their repeating decimals
console.log('Common fractions as repeating decimals:');
const commonFractions = [
  [1, 3], [1, 6], [1, 7], [1, 9], [1, 11], [1, 13],
  [2, 3], [5, 6], [2, 7], [2, 9], [3, 11], [4, 13]
];

commonFractions.forEach(([n, d]) => {
  const frac = new Rational(n, d);
  const decimal = frac.toRepeatingDecimal();
  console.log(`${n}/${d} = ${decimal}`);
});

console.log('\n🔬 TESTING EDGE CASES:\n');

// Test very large numbers
const large = new Rational(123456789, 999999);
const largeDecimal = large.toRepeatingDecimal();
const largeRoundtrip = parseRepeatingDecimal(largeDecimal);
console.log(`Large fraction: ${large.toString()}`);
console.log(`As decimal: ${largeDecimal}`);
console.log(`Roundtrip matches: ${large.equals(largeRoundtrip) ? '✅' : '❌'}\n`);

// Test complex repeating patterns
const complex = new Rational(1, 13);
const complexDecimal = complex.toRepeatingDecimal();
const complexRoundtrip = parseRepeatingDecimal(complexDecimal);
console.log(`Complex pattern: ${complex.toString()}`);
console.log(`As decimal: ${complexDecimal}`);
console.log(`Roundtrip matches: ${complex.equals(complexRoundtrip) ? '✅' : '❌'}\n`);

// Show decimal approximations vs exact representations
console.log('🎯 PRECISION COMPARISON:\n');
const precisionTests = [
  new Rational(1, 3),
  new Rational(1, 7),
  new Rational(22, 7),
  new Rational(1, 11)
];

precisionTests.forEach(rational => {
  const exact = rational.toRepeatingDecimal();
  const approx = rational.toNumber().toString();
  console.log(`${rational.toString()}:`);
  console.log(`  Exact: ${exact}`);
  console.log(`  Approx: ${approx}`);
  console.log();
});

console.log('✨ Demo complete! The roundtrip conversion preserves exact mathematical precision. ✨');
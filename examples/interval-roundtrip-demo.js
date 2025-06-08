/**
 * Demonstration of roundtrip conversion between RationalInterval and repeating decimal intervals
 * Shows how intervals like [1/3, 1/2] can be converted to "0.#3:0.5#0" and back perfectly
 */

import { Rational, RationalInterval, parseRepeatingDecimal } from '../src/index.js';

console.log('🔄 INTERVAL ROUNDTRIP CONVERSION DEMO 🔄\n');

// ============================================================================
// SECTION 1: Basic Interval to Repeating Decimal Conversion
// ============================================================================
console.log('1️⃣  BASIC INTERVAL TO REPEATING DECIMAL CONVERSION');
console.log('=' .repeat(65));

const basicIntervals = [
  [[1, 3], [1, 2], 'One third to one half'],
  [[1, 4], [3, 4], 'One quarter to three quarters'],
  [[1, 6], [5, 6], 'One sixth to five sixths'],
  [[1, 7], [2, 7], 'One seventh to two sevenths'],
  [[0, 1], [1, 1], 'Zero to one (unit interval)'],
  [[1, 9], [2, 9], 'One ninth to two ninths']
];

basicIntervals.forEach(([[lowNum, lowDen], [highNum, highDen], description]) => {
  const interval = new RationalInterval(new Rational(lowNum, lowDen), new Rational(highNum, highDen));
  const decimalInterval = interval.toRepeatingDecimal();
  
  console.log(`${interval.toString().padEnd(12)} → ${decimalInterval.padEnd(20)} (${description})`);
});
console.log();

// ============================================================================
// SECTION 2: Intervals with Terminating Decimals
// ============================================================================
console.log('2️⃣  INTERVALS WITH TERMINATING DECIMALS');
console.log('=' .repeat(65));

const terminatingIntervals = [
  [[1, 8], [1, 4], 'One eighth to one quarter'],
  [[1, 2], [3, 4], 'One half to three quarters'],
  [[1, 5], [2, 5], 'One fifth to two fifths'],
  [[3, 8], [5, 8], 'Three eighths to five eighths'],
  [[1, 10], [9, 10], 'One tenth to nine tenths']
];

terminatingIntervals.forEach(([[lowNum, lowDen], [highNum, highDen], description]) => {
  const interval = new RationalInterval(new Rational(lowNum, lowDen), new Rational(highNum, highDen));
  const decimalInterval = interval.toRepeatingDecimal();
  
  console.log(`${interval.toString().padEnd(12)} → ${decimalInterval.padEnd(20)} (${description})`);
});
console.log();

// ============================================================================
// SECTION 3: Mixed Repeating and Terminating Intervals
// ============================================================================
console.log('3️⃣  MIXED REPEATING AND TERMINATING INTERVALS');
console.log('=' .repeat(65));

const mixedIntervals = [
  [[1, 8], [1, 3], 'Terminating to repeating'],
  [[1, 3], [1, 2], 'Repeating to terminating'],
  [[1, 7], [3, 4], 'Complex repeating to terminating'],
  [[1, 4], [2, 7], 'Terminating to complex repeating'],
  [[1, 11], [1, 5], 'Long period to terminating']
];

mixedIntervals.forEach(([[lowNum, lowDen], [highNum, highDen], description]) => {
  const interval = new RationalInterval(new Rational(lowNum, lowDen), new Rational(highNum, highDen));
  const decimalInterval = interval.toRepeatingDecimal();
  
  console.log(`${interval.toString().padEnd(15)} → ${decimalInterval.padEnd(25)} (${description})`);
});
console.log();

// ============================================================================
// SECTION 4: Negative and Mixed Sign Intervals
// ============================================================================
console.log('4️⃣  NEGATIVE AND MIXED SIGN INTERVALS');
console.log('=' .repeat(65));

const negativeIntervals = [
  [[-1, 3], [-1, 6], 'Negative one third to negative one sixth'],
  [[-1, 2], [-1, 4], 'Negative one half to negative one quarter'],
  [[-2, 3], [-1, 3], 'Negative two thirds to negative one third'],
  [[-1, 3], [1, 3], 'Negative one third to positive one third'],
  [[-1, 7], [1, 7], 'Negative one seventh to positive one seventh']
];

negativeIntervals.forEach(([[lowNum, lowDen], [highNum, highDen], description]) => {
  const interval = new RationalInterval(new Rational(lowNum, lowDen), new Rational(highNum, highDen));
  const decimalInterval = interval.toRepeatingDecimal();
  
  console.log(`${interval.toString().padEnd(18)} → ${decimalInterval.padEnd(25)} (${description})`);
});
console.log();

// ============================================================================
// SECTION 5: Perfect Roundtrip Conversion Testing
// ============================================================================
console.log('5️⃣  PERFECT ROUNDTRIP CONVERSION TESTING');
console.log('=' .repeat(65));

const roundtripTests = [
  new RationalInterval(new Rational(1, 3), new Rational(1, 2)),
  new RationalInterval(new Rational(1, 7), new Rational(2, 7)),
  new RationalInterval(new Rational(1, 4), new Rational(3, 4)),
  new RationalInterval(new Rational(-1, 3), new Rational(1, 3)),
  new RationalInterval(new Rational(22, 7), new Rational(355, 113)),
  new RationalInterval(new Rational(1, 11), new Rational(1, 13)),
  new RationalInterval(new Rational(0), new Rational(1))
];

console.log('Original'.padEnd(20) + 'Decimal Interval'.padEnd(30) + 'Roundtrip'.padEnd(20) + 'Match');
console.log('-'.repeat(85));

roundtripTests.forEach(original => {
  const decimalInterval = original.toRepeatingDecimal();
  const roundtrip = parseRepeatingDecimal(decimalInterval);
  const matches = original.low.equals(roundtrip.low) && original.high.equals(roundtrip.high);
  
  console.log(
    original.toString().padEnd(20) +
    decimalInterval.padEnd(30) +
    roundtrip.toString().padEnd(20) +
    (matches ? '✅' : '❌')
  );
});
console.log();

// ============================================================================
// SECTION 6: Point Intervals (Degenerate Cases)
// ============================================================================
console.log('6️⃣  POINT INTERVALS (DEGENERATE CASES)');
console.log('=' .repeat(65));

const pointIntervals = [
  [1, 3, 'One third point'],
  [1, 7, 'One seventh point'],
  [22, 7, 'Pi approximation point'],
  [1, 2, 'One half point'],
  [0, 1, 'Zero point']
];

pointIntervals.forEach(([num, den, description]) => {
  const point = new Rational(num, den);
  const interval = new RationalInterval(point, point);
  const decimalInterval = interval.toRepeatingDecimal();
  
  console.log(`${interval.toString().padEnd(20)} → ${decimalInterval.padEnd(25)} (${description})`);
});
console.log();

// ============================================================================
// SECTION 7: Mathematical Properties Verification
// ============================================================================
console.log('7️⃣  MATHEMATICAL PROPERTIES VERIFICATION');
console.log('=' .repeat(65));

// Test that arithmetic operations preserve the decimal representation
const third = new Rational(1, 3);
const sixth = new Rational(1, 6);
const sumInterval = new RationalInterval(third, sixth.add(third)); // [1/3, 1/2]

console.log('Testing arithmetic consistency:');
console.log(`1/3 to (1/6 + 1/3): ${sumInterval.toString()}`);
console.log(`As decimals: ${sumInterval.toRepeatingDecimal()}`);
console.log(`Roundtrip: ${parseRepeatingDecimal(sumInterval.toRepeatingDecimal()).toString()}`);
console.log();

// Test interval operations
const interval1 = new RationalInterval(new Rational(1, 3), new Rational(1, 2));
const interval2 = new RationalInterval(new Rational(1, 6), new Rational(1, 4));
const sum = interval1.add(interval2);

console.log('Testing interval arithmetic:');
console.log(`Interval 1: ${interval1.toString()} = ${interval1.toRepeatingDecimal()}`);
console.log(`Interval 2: ${interval2.toString()} = ${interval2.toRepeatingDecimal()}`);
console.log(`Sum: ${sum.toString()} = ${sum.toRepeatingDecimal()}`);
console.log();

// ============================================================================
// SECTION 8: Complex Mathematical Constants
// ============================================================================
console.log('8️⃣  COMPLEX MATHEMATICAL CONSTANTS');
console.log('=' .repeat(65));

const constants = [
  [[22, 7], [355, 113], 'π approximations (Archimedes to Milü)'],
  [[1, 1], [1618, 1000], 'Unity to golden ratio approximation'],
  [[577, 408], [1414, 1000], 'sqrt(2) approximations'],
  [[2718, 1000], [271828, 100000], 'e approximations']
];

constants.forEach(([[lowNum, lowDen], [highNum, highDen], description]) => {
  const interval = new RationalInterval(new Rational(lowNum, lowDen), new Rational(highNum, highDen));
  const decimalInterval = interval.toRepeatingDecimal();
  
  console.log(`${description}:`);
  console.log(`  Interval: ${interval.toString()}`);
  console.log(`  Decimal:  ${decimalInterval}`);
  console.log(`  Low ≈ ${interval.low.toNumber()}, High ≈ ${interval.high.toNumber()}`);
  console.log();
});

// ============================================================================
// SECTION 9: Performance and Edge Cases
// ============================================================================
console.log('9️⃣  PERFORMANCE AND EDGE CASES');
console.log('=' .repeat(65));

// Test with large denominators
const largeInterval = new RationalInterval(
  new Rational(1, 999999),
  new Rational(1, 1000001)
);

console.log('Large denominator interval:');
console.log(`Interval: ${largeInterval.toString()}`);

const startTime = performance.now();
const largeDecimal = largeInterval.toRepeatingDecimal();
const endTime = performance.now();

console.log(`Decimal: ${largeDecimal.length > 60 ? largeDecimal.substring(0, 57) + '...' : largeDecimal}`);
console.log(`Conversion time: ${(endTime - startTime).toFixed(2)}ms`);
console.log();

// Test roundtrip with the large interval
const largeRoundtrip = parseRepeatingDecimal(largeDecimal);
const largeMatches = largeInterval.low.equals(largeRoundtrip.low) && largeInterval.high.equals(largeRoundtrip.high);
console.log(`Large interval roundtrip: ${largeMatches ? '✅ Perfect match' : '❌ Failed'}`);
console.log();

// ============================================================================
// SECTION 10: Practical Applications
// ============================================================================
console.log('🔟 PRACTICAL APPLICATIONS');
console.log('=' .repeat(65));

console.log('Measurement uncertainty representation:');
const measurement = new RationalInterval(new Rational(299, 100), new Rational(301, 100));
console.log(`Measured value: ${measurement.toString()} = ${measurement.toRepeatingDecimal()}`);
console.log(`This represents a measurement of 3.00 ± 0.01`);
console.log();

console.log('Financial range calculations:');
const priceRange = new RationalInterval(new Rational(9999, 100), new Rational(10001, 100));
console.log(`Price range: ${priceRange.toString()} = ${priceRange.toRepeatingDecimal()}`);
console.log(`This represents $99.99 to $100.01`);
console.log();

console.log('Mathematical approximation bounds:');
const piRange = new RationalInterval(new Rational(22, 7), new Rational(355, 113));
console.log(`π bounds: ${piRange.toString()}`);
console.log(`As decimals: ${piRange.toRepeatingDecimal()}`);
console.log(`Actual π ≈ 3.14159265359...`);
console.log(`Range width: ${piRange.high.subtract(piRange.low).toString()}`);

console.log('\n✨ Demo complete! Interval roundtrip conversion maintains perfect mathematical precision. ✨');
console.log('🎯 Key benefits:');
console.log('  • Exact representation of interval bounds');
console.log('  • Perfect roundtrip conversion');
console.log('  • Human-readable decimal notation');
console.log('  • Seamless integration with rational arithmetic');
/**
 * Examples demonstrating repeating decimal parsing and conversion to exact rationals
 */

import { parseRepeatingDecimal, Rational, Parser } from '../src/index.js';

console.log('=== Repeating Decimal Examples ===\n');

// Basic repeating decimals
console.log('1. Basic Repeating Decimals:');
console.log('0.#3 (0.333...) =', parseRepeatingDecimal('0.#3').toString());
console.log('0.#6 (0.666...) =', parseRepeatingDecimal('0.#6').toString());
console.log('0.12#45 (0.124545...) =', parseRepeatingDecimal('0.12#45').toString());
console.log('733.#3 (733.333...) =', parseRepeatingDecimal('733.#3').toString());
console.log();

// Terminating decimals with #0
console.log('2. Terminating Decimals (using #0):');
console.log('1.23#0 (exactly 1.23) =', parseRepeatingDecimal('1.23#0').toString());
console.log('0.5#0 (exactly 0.5) =', parseRepeatingDecimal('0.5#0').toString());
console.log('42#0 (exactly 42) =', parseRepeatingDecimal('42#0').toString());
console.log();

// Negative repeating decimals
console.log('3. Negative Repeating Decimals:');
console.log('-0.#3 (-0.333...) =', parseRepeatingDecimal('-0.#3').toString());
console.log('-1.23#45 (-1.234545...) =', parseRepeatingDecimal('-1.23#45').toString());
console.log();

// Mathematical verification
console.log('4. Mathematical Verification:');
const oneThird = parseRepeatingDecimal('0.#3');
const twoThirds = parseRepeatingDecimal('0.#6');
const sum = oneThird.add(twoThirds);
console.log('1/3 + 2/3 =', oneThird.toString(), '+', twoThirds.toString(), '=', sum.toString());

const product = oneThird.multiply(new Rational(3));
console.log('(1/3) × 3 =', oneThird.toString(), '× 3 =', product.toString());

const nineNines = parseRepeatingDecimal('0.#9');
console.log('0.#9 (0.999...) =', nineNines.toString(), '= 1?', nineNines.equals(new Rational(1)));
console.log();

// Non-repeating decimals (intervals)
console.log('5. Non-repeating Decimals (Intervals):');
const interval1 = parseRepeatingDecimal('1.23');
console.log('1.23 (uncertain) =', interval1.toString());
console.log('  This represents the interval [1.225, 1.235]');

const interval2 = parseRepeatingDecimal('-0.5');
console.log('-0.5 (uncertain) =', interval2.toString());
console.log('  This represents the interval [-0.55, -0.45]');
console.log();

// Complex patterns
console.log('6. Complex Repeating Patterns:');
const complex1 = parseRepeatingDecimal('0.142857#142857');
console.log('0.142857#142857 =', complex1.toString());
console.log('As decimal:', complex1.toNumber());

const complex2 = parseRepeatingDecimal('3.14159#26535');
console.log('3.14159#26535 =', complex2.toString());
console.log('As decimal:', complex2.toNumber());
console.log();

// Integration with Parser expressions
console.log('7. Integration with Parser Expressions:');
try {
  const expr1 = Parser.parse('0.#3 + 0.#6');
  console.log('Expression: 0.#3 + 0.#6 =', expr1.toString());
  
  const expr2 = Parser.parse('1.23#45 * 2');
  console.log('Expression: 1.23#45 * 2 =', expr2.toString());
  
  const expr3 = Parser.parse('0.#3 : 0.#6');
  console.log('Interval: 0.#3 : 0.#6 =', expr3.toString());
} catch (error) {
  console.log('Parser integration error:', error.message);
}
console.log();

// Common fractions as repeating decimals
console.log('8. Common Fractions as Repeating Decimals:');
const fractions = [
  ['1/3', '0.#3'],
  ['1/6', '0.1#6'],
  ['1/7', '0.#142857'],
  ['2/3', '0.#6'],
  ['5/6', '0.8#3'],
  ['1/9', '0.#1'],
  ['2/9', '0.#2'],
  ['1/11', '0.#09']
];

fractions.forEach(([fraction, repeating]) => {
  try {
    const [num, den] = fraction.split('/');
    const rational = new Rational(num, den);
    const parsed = parseRepeatingDecimal(repeating);
    const matches = rational.equals(parsed);
    console.log(`${fraction} = ${repeating} = ${parsed.toString()} ✓${matches ? '' : ' (mismatch!)'}`);
  } catch (error) {
    console.log(`${fraction} = ${repeating} = Error: ${error.message}`);
  }
});
console.log();

// Edge cases
console.log('9. Edge Cases:');
console.log('Leading zeros: 0.0#1 =', parseRepeatingDecimal('0.0#1').toString());
console.log('No integer part: .#5 (should error)');
try {
  parseRepeatingDecimal('.#5');
} catch (error) {
  console.log('  Error:', error.message);
}

console.log('Multiple decimals: 1.2.3#4 (should error)');
try {
  parseRepeatingDecimal('1.2.3#4');
} catch (error) {
  console.log('  Error:', error.message);
}

console.log('Empty repeating: 1.23# (should error)');
try {
  parseRepeatingDecimal('1.23#');
} catch (error) {
  console.log('  Error:', error.message);
}

console.log('\n=== End of Examples ===');
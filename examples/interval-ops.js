/**
 * Examples demonstrating the new functionality in the RatMath library
 * 
 * This file shows the use of constants, negate, reciprocate, and the two 
 * different power operations (pow vs mpow).
 */

import { Rational, RationalInterval, Parser } from '../index.js';

console.log('=== Static Constants ===');
console.log('Rational.zero:', Rational.zero.toString());
console.log('Rational.one:', Rational.one.toString());
console.log('RationalInterval.zero:', RationalInterval.zero.toString());
console.log('RationalInterval.one:', RationalInterval.one.toString());
console.log('RationalInterval.unitInterval:', RationalInterval.unitInterval.toString());

console.log('\n=== Negation and Reciprocation ===');
const interval = new RationalInterval('2/3', '3/2');
console.log('Original interval:', interval.toString());

const negated = interval.negate();
console.log('Negated:', negated.toString());

const reciprocated = interval.reciprocate();
console.log('Reciprocated:', reciprocated.toString());

console.log('\n=== Different Power Operations ===');
console.log('Original interval:', interval.toString());

// Standard power (^) applies the power to each number in the interval
const powResult = interval.pow(2);
console.log('Standard power (^2):', powResult.toString());

// Multiplicative power (**) applies power by repeated multiplication
const mpowResult = interval.mpow(2);
console.log('Multiplicative power (**2):', mpowResult.toString());

console.log('\n=== Parser with Both Power Operations ===');
console.log('Using ^ operator:', Parser.parse('(2/3:3/2)^2').toString());
console.log('Using ** operator:', Parser.parse('(2/3:3/2)**2').toString());

console.log('\n=== Difference Between Power Operations ===');
// For a narrower interval, the difference might be more noticeable
const narrowInterval = new RationalInterval('1/2', '3/4');
console.log('Interval:', narrowInterval.toString());
console.log('Standard power (^3):', narrowInterval.pow(3).toString());
console.log('Multiplicative power (**3):', narrowInterval.mpow(3).toString());

console.log('\n=== Using Static Constants in Expressions ===');
// Calculate with the unit interval
const unitCalculation = Parser.parse('(0:1)^2 + 1/2');
console.log('(0:1)^2 + 1/2 =', unitCalculation.toString());

// Negative exponents with reciprocate
console.log('\n=== Negative Exponents ===');
const negExp = Parser.parse('(1/2:2)^-1');
console.log('(1/2:2)^-1 =', negExp.toString());
console.log('Same as reciprocal:', new RationalInterval('1/2', '2').reciprocate().toString());

// Error conditions
console.log('\n=== Error Conditions ===');
try {
  const zeroInterval = RationalInterval.zero;
  console.log('Attempting to raise 0 to power 0...');
  zeroInterval.pow(0);
} catch (e) {
  console.log('Error:', e.message);
}

try {
  console.log('Attempting to use ** with exponent 0...');
  Parser.parse('2**0');
} catch (e) {
  console.log('Error:', e.message);
}

try {
  console.log('Attempting to reciprocate an interval containing zero...');
  new RationalInterval('-1', '1').reciprocate();
} catch (e) {
  console.log('Error:', e.message);
}
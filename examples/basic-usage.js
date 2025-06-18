/**
 * Basic usage examples for RatMath library
 * 
 * This file demonstrates the basic usage of the Rational, RationalInterval, and Parser classes.
 * Run with: bun examples/basic-usage.js
 */

import { Rational, RationalInterval, Parser } from '../index.js';

// ---- Rational arithmetic examples ----
console.log('=== Rational Arithmetic ===');

// Creating rational numbers
const a = new Rational(1, 2);           // 1/2
const b = new Rational('3/4');          // 3/4
const c = new Rational(5);              // 5/1
const d = new Rational('-2/3');         // -2/3
const e = new Rational('2..1/2');       // 5/2 (mixed number notation)

console.log('a =', a.toString());       // "1/2"
console.log('b =', b.toString());       // "3/4"
console.log('c =', c.toString());       // "5"
console.log('d =', d.toString());       // "-2/3"
console.log('e =', e.toString());       // "5/2"
console.log('e (mixed) =', e.toMixedString()); // "2..1/2"

// Basic arithmetic
console.log('a + b =', a.add(b).toString());             // "5/4"
console.log('a - b =', a.subtract(b).toString());        // "-1/4"
console.log('a * b =', a.multiply(b).toString());        // "3/8"
console.log('a / b =', a.divide(b).toString());          // "2/3"
console.log('-a =', a.negate().toString());              // "-1/2"
console.log('1/a =', a.reciprocal().toString());         // "2"
console.log('a^3 =', a.pow(3).toString());               // "1/8"
console.log('a^-2 =', a.pow(-2).toString());             // "4"

// Comparison
console.log('a < b?', a.lessThan(b));                    // true
console.log('a = 2/4?', a.equals(new Rational(2, 4)));   // true
console.log('c > d?', c.greaterThan(d));                 // true

// ---- Interval arithmetic examples ----
console.log('\n=== Interval Arithmetic ===');

// Creating intervals
const interval1 = new RationalInterval('1/2', '3/4');    // [1/2, 3/4]
const interval2 = new RationalInterval(1, 2);            // [1, 2]
const interval3 = new RationalInterval(
  new Rational(-1, 3),
  new Rational(1, 2)
);                                                       // [-1/3, 1/2]

console.log('interval1 =', interval1.toString());        // "1/2:3/4"
console.log('interval2 =', interval2.toString());        // "1:2"
console.log('interval3 =', interval3.toString());        // "-1/3:1/2"

// Interval operations
const sum = interval1.add(interval2);
console.log('interval1 + interval2 =', sum.toString());  // "3/2:11/4"

const product = interval1.multiply(interval2);
console.log('interval1 * interval2 =', product.toString()); // "1/2:3/2"

const power = interval1.pow(2);
console.log('interval1^2 =', power.toString());          // "1/4:9/16"

// Interval properties
console.log('interval1 overlaps interval2?', interval1.overlaps(interval2)); // false
console.log('interval2 contains 3/2?', interval2.containsValue('3/2')); // true

// Intersection and union
const i1 = new RationalInterval('1/2', '3/4');
const i2 = new RationalInterval('2/3', '5/6');
const intersection = i1.intersection(i2);
console.log('i1 ∩ i2 =', intersection ? intersection.toString() : 'none'); // "2/3:3/4"

const union = i1.union(i2);
console.log('i1 ∪ i2 =', union ? union.toString() : 'none'); // "1/2:5/6"

// ---- Expression parser examples ----
console.log('\n=== Expression Parsing ===');

// Simple expressions
console.log('"1/2 + 3/4" =', Parser.parse('1/2 + 3/4').toString()); // "5/4:5/4"
console.log('"1/2:3/4 * 2:3" =', Parser.parse('1/2:3/4 * 2:3').toString()); // "1:9/4"
console.log('"2..1/2 + 3..3/4" =', Parser.parse('2..1/2 + 3..3/4').toString()); // "6..1/4"

// Complex expressions
const expr = '(1/2:3/4 + 1/4:1/2)^2 / (2:3 - 1/2:1)';
console.log(`"${expr}" =`, Parser.parse(expr).toString());

// Mixed number interval expressions
const mixedExpr = '(1..1/2:2..3/4) * (2:3)';
console.log(`"${mixedExpr}" =`, Parser.parse(mixedExpr).toString());
console.log(`"${mixedExpr}" (mixed) =`, Parser.parse(mixedExpr).toMixedString());

// Converting between formats
console.log('\n=== Mixed Number Conversion ===');
const rational1 = new Rational(17, 3);  // 5..2/3
const rational2 = new Rational(-9, 4);  // -2..1/4
console.log('17/3 as mixed =', rational1.toMixedString());  // "5..2/3"
console.log('-9/4 as mixed =', rational2.toMixedString());  // "-2..1/4"

const interval = new RationalInterval(rational1, rational2);
console.log('Interval mixed format =', interval.toMixedString());  // "-2..1/4:5..2/3"

// Error handling examples
console.log('\n=== Error Handling ===');

try {
  new Rational(1, 0);
} catch (e) {
  console.log('Error:', e.message); // "Denominator cannot be zero"
}

try {
  new Rational(1).divide(new Rational(0));
} catch (e) {
  console.log('Error:', e.message); // "Division by zero"
}

try {
  Parser.parse('1/2 / (-1:1)');
} catch (e) {
  console.log('Error:', e.message); // "Cannot divide by an interval containing zero"
}

try {
  new Rational(0).pow(0);
} catch (e) {
  console.log('Error:', e.message); // "Zero cannot be raised to the power of zero"
}
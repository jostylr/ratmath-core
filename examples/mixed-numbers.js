/**
 * Mixed numbers example for RatMath library
 * 
 * This file demonstrates the use of mixed number notation and conversion
 * in the Rational and RationalInterval classes.
 * 
 * Run with: bun examples/mixed-numbers.js
 */

import { Rational, RationalInterval, Parser } from '../index.js';

// ---- Creating Rational numbers with mixed number notation ----
console.log('=== Creating Mixed Numbers ===');

// Using mixed number notation "whole..numerator/denominator"
const a = new Rational('5..2/3');         // Equivalent to 5 + 2/3 = 17/3
const b = new Rational('2..1/2');         // Equivalent to 2 + 1/2 = 5/2
const c = new Rational('-3..1/4');        // Equivalent to -3 - 1/4 = -13/4

console.log('a = 5..2/3 =', a.toString());               // "17/3"
console.log('b = 2..1/2 =', b.toString());               // "5/2"
console.log('c = -3..1/4 =', c.toString());              // "-13/4"

// ---- Converting Rational numbers to mixed number format ----
console.log('\n=== Converting to Mixed Numbers ===');

const d = new Rational(11, 4);            // 11/4 = 2 + 3/4
const e = new Rational(-9, 5);            // -9/5 = -1 - 4/5
const f = new Rational(7, 1);             // 7/1 = 7 + 0/1

console.log('11/4 as mixed =', d.toMixedString());       // "2..3/4"
console.log('-9/5 as mixed =', e.toMixedString());       // "-1..4/5"
console.log('7/1 as mixed =', f.toMixedString());        // "7"

// Special cases
const zero = new Rational(0, 1);          // 0
const justFraction = new Rational(3, 4);  // 3/4 (no whole part)
const negFraction = new Rational(-2, 5);  // -2/5 (no whole part)

console.log('0 as mixed =', zero.toMixedString());       // "0"
console.log('3/4 as mixed =', justFraction.toMixedString()); // "0..3/4"
console.log('-2/5 as mixed =', negFraction.toMixedString()); // "-0..2/5"

// ---- Arithmetic with mixed numbers ----
console.log('\n=== Arithmetic with Mixed Numbers ===');

// Addition
const sum = a.add(b);
console.log('5..2/3 + 2..1/2 =', sum.toString());       // "29/6"
console.log('As mixed number =', sum.toMixedString());   // "4..5/6"

// Using Parser for expressions
console.log('\n=== Parser with Mixed Numbers ===');
const expr1 = '3..1/4 + 2..2/3';
console.log(`${expr1} =`, Parser.parse(expr1).toString());       // "35/12"
console.log(`${expr1} as mixed =`, Parser.parse(expr1).toMixedString()); // "5..11/12"

const expr2 = '1..1/2 * 2..1/3';
console.log(`${expr2} =`, Parser.parse(expr2).toString());       // "7/2"
console.log(`${expr2} as mixed =`, Parser.parse(expr2).toMixedString()); // "3..1/2"

const expr3 = '(2..1/2)^2';
console.log(`${expr3} =`, Parser.parse(expr3).toString());       // "25/4"
console.log(`${expr3} as mixed =`, Parser.parse(expr3).toMixedString()); // "6..1/4"

// Negative mixed numbers
const expr4 = '-2..3/4 + 5..1/2';
console.log(`${expr4} =`, Parser.parse(expr4).toString());       // "11/4"
console.log(`${expr4} as mixed =`, Parser.parse(expr4).toMixedString()); // "2..3/4"

// ---- Interval arithmetic with mixed numbers ----
console.log('\n=== Interval Arithmetic with Mixed Numbers ===');

// Create intervals using mixed number notation
const interval1 = new RationalInterval('1..1/2', '2..3/4');  // [3/2, 11/4]
const interval2 = new RationalInterval('0..1/3', '1..2/3');  // [1/3, 5/3]

console.log('interval1 =', interval1.toString());            // "3/2:11/4"
console.log('interval1 (mixed) =', interval1.toMixedString()); // "1..1/2:2..3/4"

console.log('interval2 =', interval2.toString());            // "1/3:5/3"
console.log('interval2 (mixed) =', interval2.toMixedString()); // "0..1/3:1..2/3"

// Interval operations
const sumInterval = interval1.add(interval2);
console.log('interval1 + interval2 =', sumInterval.toString());        // "11/6:29/12"
console.log('interval1 + interval2 (mixed) =', sumInterval.toMixedString());  // "1..5/6:2..5/12"

// Using Parser for interval expressions
console.log('\n=== Parser with Mixed Number Intervals ===');

const intExpr1 = '1..1/2:2..3/4 + 0..1/3:1..2/3';
console.log(`${intExpr1} =`, Parser.parse(intExpr1).toString());     // "11/6:29/12"
console.log(`${intExpr1} (mixed) =`, Parser.parse(intExpr1).toMixedString()); // "1..5/6:2..5/12"

const intExpr2 = '(1..1/4:2) * 2';
console.log(`${intExpr2} =`, Parser.parse(intExpr2).toString());     // "5/2:4"
console.log(`${intExpr2} (mixed) =`, Parser.parse(intExpr2).toMixedString()); // "2..1/2:4"

// Complex expression with mixed numbers
const complexExpr = '(1..1/2:2..3/4)^2 / (0..2/3:1..1/3)';
console.log(`Complex expression result =`, Parser.parse(complexExpr).toString());
console.log(`Complex expression (mixed) =`, Parser.parse(complexExpr).toMixedString());
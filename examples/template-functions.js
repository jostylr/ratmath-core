/**
 * Template Function Examples
 * 
 * This file demonstrates the R and F template string functions
 * for convenient creation of rational numbers and intervals.
 */

import { R, F, Rational, Integer } from '../index.js';

console.log('=== R Template Function Examples ===\n');

// Basic fraction literals
const n = 3, m = 5;
const frac = R`${n}/${m}`;
console.log(`R\`${n}/${m}\` =`, frac.toString(), `(${frac.constructor.name})`);

// Fractions with denominator 1 stay as Rational (explicit intent)
const rational = R`${7}/1`;
console.log(`R\`7/1\` =`, rational.toString(), `(${rational.constructor.name})`);

// Exact division promotes to Integer
const exact = R`${8}/${2}`;
console.log(`R\`8/2\` =`, exact.toString(), `(${exact.constructor.name})`);

// Intervals
const a = 2, b = 4;
const interval = R`${a}:${b}`;
console.log(`R\`${a}:${b}\` =`, interval.toString(), `(${interval.constructor.name})`);

// Complex expressions
const calc = R`${1}/${2} + ${3}/${4}`;
console.log(`R\`1/2 + 3/4\` =`, calc.toString(), `(${calc.constructor.name})`);

// Mixed numbers
const mixed = R`${2}..${1}/${3}`;
console.log(`R\`2..1/3\` =`, mixed.toString(), `(${mixed.constructor.name})`);

// Multiplicative power (always returns intervals)
const mpow = R`${2}**${3}`;
console.log(`R\`2**3\` =`, mpow.toString(), `(${mpow.constructor.name})`);

console.log('\n=== F Template Function Examples ===\n');

// Simple fractions
const ffrac = F`${3}/${5}`;
console.log(`F\`3/5\` =`, ffrac.toString(), `(${ffrac.constructor.name})`);

// Integers become fractions with denominator 1
const whole = F`${7}`;
console.log(`F\`7\` =`, whole.toString(), `(${whole.constructor.name})`);

// Fraction intervals
const fracInterval = F`${1}/${2}:${3}/${4}`;
console.log(`F\`1/2:3/4\` =`, fracInterval.toString(), `(${fracInterval.constructor.name})`);

// Arithmetic results
const sum = F`${1}/${2} + ${1}/${3}`;
console.log(`F\`1/2 + 1/3\` =`, sum.toString(), `(${sum.constructor.name})`);

// Even exact divisions become fractions
const division = F`${8}/${2}`;
console.log(`F\`8/2\` =`, division.toString(), `(${division.constructor.name})`);

console.log('\n=== Real-World Examples ===\n');

// Cooking measurements
const cups = 2, teaspoons = 3;
const totalTeaspoons = R`${cups} * 48 + ${teaspoons}`;
console.log(`Recipe: ${cups} cups + ${teaspoons} tsp = ${totalTeaspoons} total teaspoons`);

// Engineering tolerances
const nominal = 100, tolerance = 5;
const spec = R`${nominal - tolerance}:${nominal + tolerance}`;
console.log(`Engineering spec: ${nominal} ± ${tolerance} = ${spec}`);

// Financial calculations
const profit = 150, revenue = 1000;
const margin = F`${profit}/${revenue}`;
console.log(`Profit margin: ${profit}/${revenue} = ${margin} = ${margin.toRational().toNumber() * 100}%`);

// Compound calculations
const compound = R`(${1}/${2} + ${3}/${4}) * 2`;
console.log(`Compound: (1/2 + 3/4) * 2 = ${compound}`);

// Working with variables from calculations
const base = R`${3}/${4}`;
const multiplier = 8;
const scaled = R`${base.numerator}/${base.denominator} * ${multiplier}`;
console.log(`Scaling: ${base} * ${multiplier} = ${scaled}`);

console.log('\n=== Type Behavior Comparison ===\n');

// n/1 pattern - stays Rational with R
const r1 = R`5/1`;
const f1 = F`5/1`;
console.log(`5/1:     R: ${r1} (${r1.constructor.name})    F: ${f1} (${f1.constructor.name})`);

// Exact division - promotes to Integer with R
const r2 = R`10/2`;
const f2 = F`10/2`;
console.log(`10/2:    R: ${r2} (${r2.constructor.name})    F: ${f2} (${f2.constructor.name})`);

// Non-exact fraction
const r3 = R`7/3`;
const f3 = F`7/3`;
console.log(`7/3:     R: ${r3} (${r3.constructor.name})   F: ${f3} (${f3.constructor.name})`);

// Integer
const r4 = R`42`;
const f4 = F`42`;
console.log(`42:      R: ${r4} (${r4.constructor.name})    F: ${f4} (${f4.constructor.name})`);

// Interval
const r5 = R`2:3`;
const f5 = F`2:3`;
console.log(`2:3:     R: ${r5} (${r5.constructor.name}) F: ${f5} (${f5.constructor.name})`);
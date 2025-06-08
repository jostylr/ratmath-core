/**
 * uncertainty-examples.js
 * 
 * Comprehensive examples demonstrating the new decimal uncertainty parsing functionality
 * in the zed-ratmath library.
 */

import { Parser, RationalInterval, Rational } from '../index.js';

console.log('=== Decimal Uncertainty Parsing Examples ===\n');

// Range notation examples
console.log('1. Range Notation: base[lower_digits:upper_digits]');
console.log('   Example: 1.23[56:67] means 1.2356 to 1.2367');

const range1 = Parser.parse('1.23[56:67]');
console.log(`   1.23[56:67] = ${range1.toString()}`);
console.log(`   Decimal: ${range1.low.toDecimal()} : ${range1.high.toDecimal()}`);

const range2 = Parser.parse('78.3[15:24]');
console.log(`   78.3[15:24] = ${range2.toString()}`);
console.log(`   Decimal: ${range2.low.toDecimal()} : ${range2.high.toDecimal()}`);

const range3 = Parser.parse('42[15:25]');
console.log(`   42[15:25] = ${range3.toString()}`);
console.log(`   Decimal: ${range3.low.toDecimal()} : ${range3.high.toDecimal()}\n`);

// Relative notation examples
console.log('2. Relative Notation: base[+positive_offset,-negative_offset]');
console.log('   Example: 1.23[+5,-6] means 1.23+0.005 to 1.23-0.006');

const rel1 = Parser.parse('1.23[+5,-6]');
console.log(`   1.23[+5,-6] = ${rel1.toString()}`);
console.log(`   Decimal: ${rel1.low.toDecimal()} : ${rel1.high.toDecimal()}`);

const rel2 = Parser.parse('78.3[+15,-0.6]');
console.log(`   78.3[+15,-0.6] = ${rel2.toString()}`);
console.log(`   Decimal: ${rel2.low.toDecimal()} : ${rel2.high.toDecimal()}`);

const rel3 = Parser.parse('1.5[+0.25,-0.15]');
console.log(`   1.5[+0.25,-0.15] = ${rel3.toString()}`);
console.log(`   Decimal: ${rel3.low.toDecimal()} : ${rel3.high.toDecimal()}\n`);

// Order independence
console.log('3. Order Independence in Relative Notation:');
const rel4a = Parser.parse('2.0[+0.1,-0.2]');
const rel4b = Parser.parse('2.0[-0.2,+0.1]');
console.log(`   2.0[+0.1,-0.2] = ${rel4a.toString()}`);
console.log(`   2.0[-0.2,+0.1] = ${rel4b.toString()}`);
console.log(`   Equal? ${rel4a.equals(rel4b)}\n`);

// Negative base numbers
console.log('4. Negative Base Numbers:');
const neg1 = Parser.parse('-1.23[56:67]');
console.log(`   -1.23[56:67] = ${neg1.toString()}`);
console.log(`   Decimal: ${neg1.low.toDecimal()} : ${neg1.high.toDecimal()}`);

const neg2 = Parser.parse('-2.5[+0.1,-0.2]');
console.log(`   -2.5[+0.1,-0.2] = ${neg2.toString()}`);
console.log(`   Decimal: ${neg2.low.toDecimal()} : ${neg2.high.toDecimal()}\n`);

// Symmetric notation examples
console.log('4.1. Symmetric Notation: base[+-offset] or base[-+offset]');
console.log('   Example: 1.3[+-1] means 1.3 ± 0.01');

const sym1 = Parser.parse('1.3[+-1]');
console.log(`   1.3[+-1] = ${sym1.toString()}`);
console.log(`   Decimal: ${sym1.low.toDecimal()} : ${sym1.high.toDecimal()}`);

const sym2 = Parser.parse('2.5[+-0.25]');
console.log(`   2.5[+-0.25] = ${sym2.toString()}`);
console.log(`   Decimal: ${sym2.low.toDecimal()} : ${sym2.high.toDecimal()}`);

const sym3 = Parser.parse('1.3[-+1]');
console.log(`   1.3[-+1] = ${sym3.toString()}`);
console.log(`   Equal to 1.3[+-1]? ${sym1.equals(sym3)}\n`);

// Arithmetic with uncertainty intervals
console.log('5. Arithmetic with Uncertainty Intervals:');
const add1 = Parser.parse('1.23[+0.5,-0.3] + 2.45[+0.2,-0.1]');
console.log(`   1.23[+0.5,-0.3] + 2.45[+0.2,-0.1] = ${add1.toString()}`);
console.log(`   Decimal: ${add1.low.toDecimal()} : ${add1.high.toDecimal()}`);

const mult1 = Parser.parse('2[+0.1,-0.1] * 3[+0.2,-0.2]');
console.log(`   2[+0.1,-0.1] * 3[+0.2,-0.2] = ${mult1.toString()}`);
console.log(`   Decimal: ${mult1.low.toDecimal()} : ${mult1.high.toDecimal()}\n`);

// Export methods
console.log('6. Export Methods:');
const interval = new RationalInterval(new Rational('1.2356'), new Rational('1.2367'));
console.log(`   Original interval: ${interval.toString()}`);
console.log(`   Compacted: ${interval.compactedDecimalInterval()}`);
console.log(`   Relative: ${interval.relativeMidDecimalInterval()}`);

const interval2 = new RationalInterval(new Rational('1.224'), new Rational('1.235'));
console.log(`   Original interval: ${interval2.toString()}`);
console.log(`   Compacted: ${interval2.compactedDecimalInterval()}`);
console.log(`   Relative: ${interval2.relativeMidDecimalInterval()}`);

const interval3 = new RationalInterval(new Rational('78.294'), new Rational('78.45'));
console.log(`   Original interval: ${interval3.toString()}`);
console.log(`   Compacted: ${interval3.compactedDecimalInterval()}`);
console.log(`   Relative: ${interval3.relativeMidDecimalInterval()}\n`);

// Exact decimal intervals
console.log('7. Exact Decimal Intervals (treated as terminating decimals):');
const exact1 = Parser.parse('1.23:1.34');
console.log(`   1.23:1.34 = ${exact1.toString()}`);
console.log(`   As repeating decimal: ${exact1.toRepeatingDecimal()}`);

const exact2 = Parser.parse('1.5:0.#3');
console.log(`   1.5:0.#3 = ${exact2.toString()}`);
console.log(`   Mixed exact and repeating: ${exact2.toRepeatingDecimal()}\n`);

// Complex expressions
console.log('8. Complex Expressions:');
const complex1 = Parser.parse('(1.23[+0.1,-0.1] + 2.45[+0.05,-0.05]) * 0.5');
console.log(`   (1.23[+0.1,-0.1] + 2.45[+0.05,-0.05]) * 0.5 = ${complex1.toString()}`);
console.log(`   Decimal: ${complex1.low.toDecimal()} : ${complex1.high.toDecimal()}`);

const complex2 = Parser.parse('1.23[56:67] / 2[+0.1,-0.1]');
console.log(`   1.23[56:67] / 2[+0.1,-0.1] = ${complex2.toString()}`);
console.log(`   Decimal: ${complex2.low.toDecimal()} : ${complex2.high.toDecimal()}\n`);

console.log('=== All examples completed successfully! ===');
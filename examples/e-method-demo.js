/**
 * E Method Demonstration
 * 
 * This script demonstrates the new E() method available on all number classes
 * in the zed-ratmath library. The E() method applies E notation (scientific notation)
 * to numbers and intervals by multiplying by powers of 10.
 */

import { Rational, RationalInterval, Fraction, FractionInterval, Integer } from '../index.js';

console.log('='.repeat(60));
console.log('E METHOD DEMONSTRATION');
console.log('='.repeat(60));

// Rational E method examples
console.log('\n📊 RATIONAL NUMBERS');
console.log('-'.repeat(30));

const r1 = new Rational(5);
console.log(`${r1.toString()}.E(2) = ${r1.E(2).toString()}`);
console.log(`  (5 * 10^2 = 500)`);

const r2 = new Rational(123);
console.log(`${r2.toString()}.E(-2) = ${r2.E(-2).toString()}`);
console.log(`  (123 * 10^-2 = 1.23)`);

const r3 = new Rational(1, 4);
console.log(`${r3.toString()}.E(-1) = ${r3.E(-1).toString()}`);
console.log(`  (0.25 * 10^-1 = 0.025)`);

const r4 = new Rational(1, 3);
console.log(`${r4.toString()}.E(3) = ${r4.E(3).toString()}`);
console.log(`  (1/3 * 10^3 = 1000/3)`);

// RationalInterval E method examples
console.log('\n📈 RATIONAL INTERVALS');
console.log('-'.repeat(30));

const ri1 = new RationalInterval(1, 2);
console.log(`${ri1.toString()}.E(2) = ${ri1.E(2).toString()}`);
console.log(`  ([1, 2] * 10^2 = [100, 200])`);

const ri2 = new RationalInterval(15, 25);
console.log(`${ri2.toString()}.E(-1) = ${ri2.E(-1).toString()}`);
console.log(`  ([15, 25] * 10^-1 = [1.5, 2.5])`);

const ri3 = new RationalInterval('1/3', '2/3');
console.log(`${ri3.toString()}.E(3) = ${ri3.E(3).toString()}`);
console.log(`  ([1/3, 2/3] * 10^3 = [1000/3, 2000/3])`);

// Fraction E method examples
console.log('\n🔢 FRACTIONS (Unreduced)');
console.log('-'.repeat(30));

const f1 = new Fraction(5, 4);
console.log(`${f1.toString()}.E(2) = ${f1.E(2).toString()}`);
console.log(`  (5/4 * 10^2 = 500/4)`);

const f2 = new Fraction(3, 8);
console.log(`${f2.toString()}.E(-1) = ${f2.E(-1).toString()}`);
console.log(`  (3/8 * 10^-1 = 3/80)`);

// Demonstrate fraction preservation (no reduction)
const f3 = new Fraction(2, 4); // Not reduced
console.log(`${f3.toString()}.E(1) = ${f3.E(1).toString()}`);
console.log(`  (2/4 * 10^1 = 20/4, still unreduced)`);

// FractionInterval E method examples
console.log('\n📊 FRACTION INTERVALS (Unreduced)');
console.log('-'.repeat(30));

const fi1 = new FractionInterval(new Fraction(1, 2), new Fraction(3, 4));
console.log(`${fi1.toString()}.E(2) = ${fi1.E(2).toString()}`);
console.log(`  ([1/2, 3/4] * 10^2 = [100/2, 300/4])`);

const fi2 = new FractionInterval(new Fraction(5, 2), new Fraction(7, 2));
console.log(`${fi2.toString()}.E(-1) = ${fi2.E(-1).toString()}`);
console.log(`  ([5/2, 7/2] * 10^-1 = [5/20, 7/20])`);

// Integer E method examples
console.log('\n🔢 INTEGERS');
console.log('-'.repeat(30));

const i1 = new Integer(5);
const i1Result = i1.E(2);
console.log(`${i1.toString()}.E(2) = ${i1Result.toString()} (${i1Result.constructor.name})`);
console.log(`  (5 * 10^2 = 500, stays Integer)`);

const i2 = new Integer(45);
const i2Result = i2.E(-1);
console.log(`${i2.toString()}.E(-1) = ${i2Result.toString()} (${i2Result.constructor.name})`);
console.log(`  (45 * 10^-1 = 4.5, becomes Rational)`);

const i3 = new Integer(100);
const i3Result = i3.E(-2);
console.log(`${i3.toString()}.E(-2) = ${i3Result.toString()} (${i3Result.constructor.name})`);
console.log(`  (100 * 10^-2 = 1, becomes Rational)`);

// Chaining E method calls
console.log('\n🔗 CHAINING E METHODS');
console.log('-'.repeat(30));

const chain1 = new Rational(2).E(2).E(1);
console.log(`new Rational(2).E(2).E(1) = ${chain1.toString()}`);
console.log(`  (2 → 200 → 2000)`);

const chain2 = new Rational(5000).E(-2).E(-1);
console.log(`new Rational(5000).E(-2).E(-1) = ${chain2.toString()}`);
console.log(`  (5000 → 50 → 5)`);

// Arithmetic with E methods
console.log('\n➕ ARITHMETIC WITH E METHODS');
console.log('-'.repeat(30));

const a = new Rational(3).E(2);  // 300
const b = new Rational(2).E(1);  // 20
const sum = a.add(b);            // 320
console.log(`new Rational(3).E(2) + new Rational(2).E(1) = ${sum.toString()}`);
console.log(`  (300 + 20 = 320)`);

const ia = new RationalInterval(1, 2).E(1);  // [10, 20]
const ib = new RationalInterval(3, 4).E(1);  // [30, 40]
const isum = ia.add(ib);                     // [40, 60]
console.log(`[1,2].E(1) + [3,4].E(1) = ${isum.toString()}`);
console.log(`  ([10, 20] + [30, 40] = [40, 60])`);

// Practical examples
console.log('\n💡 PRACTICAL EXAMPLES');
console.log('-'.repeat(30));

// Converting measurements
const meters = new Rational(5, 2);  // 2.5 meters
const millimeters = meters.E(3);    // Convert to millimeters
console.log(`${meters.toString()} meters = ${millimeters.toString()} millimeters`);
console.log(`  (2.5 * 10^3 = 2500 mm)`);

// Financial calculations
const dollars = new Rational(123, 4);  // $30.75
const cents = dollars.E(2);            // Convert to cents
console.log(`$${dollars.toString()} = ${cents.toString()} cents`);
console.log(`  (30.75 * 10^2 = 3075 cents)`);

// Scientific notation
const planckLength = new Rational(1).E(-35);  // ~1.6 × 10^-35 meters (simplified)
console.log(`Planck length ≈ ${planckLength.toString()} meters`);
console.log(`  (1 * 10^-35 = 1/10^35 meters)`);

// Error handling demonstration
console.log('\n⚠️  ERROR HANDLING');
console.log('-'.repeat(30));

try {
  const rational = new Rational(5);
  rational.E(2.5); // Should fail - non-integer exponent
} catch (error) {
  console.log(`Error with non-integer exponent: ${error.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('COMPARISON WITH PARSER E NOTATION');
console.log('='.repeat(60));

// Import Parser for comparison
import { Parser } from '../index.js';

// Show equivalence with parser
const parserResult = Parser.parse('5E2');
const methodResult = new Rational(5).E(2);
console.log(`Parser.parse('5E2') = ${parserResult.toString()}`);
console.log(`new Rational(5).E(2) = ${methodResult.toString()}`);
console.log(`Equivalent: ${parserResult.low.equals(methodResult) && parserResult.high.equals(methodResult)}`);

const parserInterval = Parser.parse('(1:2)E3');
const methodInterval = new RationalInterval(1, 2).E(3);
console.log(`\nParser.parse('(1:2)E3') = ${parserInterval.toString()}`);
console.log(`new RationalInterval(1, 2).E(3) = ${methodInterval.toString()}`);
console.log(`Equivalent: ${parserInterval.low.equals(methodInterval.low) && parserInterval.high.equals(methodInterval.high)}`);

console.log('\n✅ All E method demonstrations completed!');
console.log('\nThe E() method provides a convenient programmatic way to apply');
console.log('scientific notation scaling to all number types in zed-ratmath.');
#!/usr/bin/env bun

/**
 * Continued Fractions Basic Examples
 * 
 * This file demonstrates the core use of continued fractions in RatMath:
 * - Parsing CF notation
 * - Converting between CF and Rational
 * - Computing convergents
 * - Arithmetic with CF-created rationals
 */

import { Rational } from '../src/rational.js';
import { Parser } from '../src/parser.js';

console.log('=== RatMath Continued Fractions Basic Examples ===\n');

// 1. Basic Continued Fraction Creation
console.log('1. Creating Rationals from Continued Fractions\n');

// Using coefficient array
const piApprox = Rational.fromContinuedFraction([3, 7, 15, 1, 292]);
console.log(`π approximation from [3, 7, 15, 1, 292]:`);
console.log(`  Rational: ${piApprox.toString()}`);
console.log(`  Decimal: ${piApprox.toDecimal().substring(0, 15)}`);
console.log(`  CF coefficients stored: [${piApprox.cf.join(', ')}]`);
console.log(`  Whole part: ${piApprox.wholePart}\n`);

// Using CF string notation
const goldenRatio = Rational.fromContinuedFractionString("1.~1~1~1~1~1");
console.log(`Golden ratio approximation from "1.~1~1~1~1~1":`);
console.log(`  Rational: ${goldenRatio.toString()}`);
console.log(`  Decimal: ${goldenRatio.toDecimal().substring(0, 15)}\n`);

// Simple examples
const oneThird = Rational.fromContinuedFraction([0, 3]);
console.log(`One third [0, 3]: ${oneThird.toString()}`);

const threeHalves = Rational.fromContinuedFraction([1, 2]);
console.log(`Three halves [1, 2]: ${threeHalves.toString()}\n`);

// 2. Parser Integration
console.log('2. Using Parser with CF Notation\n');

const cfExpressions = [
    "3.~7",              // Simple π approximation
    "0.~2~3~4",          // Proper fraction
    "-1.~2~3",           // Negative CF
    "22.~7",             // Integer > 10
    "5.~0"               // Integer representation
];

cfExpressions.forEach(expr => {
    const result = Parser.parse(expr);
    // Handle both Rational and Integer results
    const decimal = result.toDecimal ? result.toDecimal().substring(0, 12) : result.toString();
    console.log(`"${expr}" → ${result.toString()} (${decimal})`);
});
console.log();

// 3. Converting Rationals to Continued Fractions
console.log('3. Converting Rationals to Continued Fractions\n');

const rationals = [
    new Rational(22, 7),      // π approximation
    new Rational(355, 113),   // Better π approximation  
    new Rational(17, 12),     // Random fraction
    new Rational(-8, 3),      // Negative fraction
    new Rational(42, 1)       // Integer
];

rationals.forEach(r => {
    const cf = r.toContinuedFraction();
    const cfString = r.toContinuedFractionString();
    console.log(`${r.toString()} → [${cf.join(', ')}] → "${cfString}"`);
});
console.log();

// 4. Roundtrip Conversion Testing
console.log('4. Roundtrip Conversion Testing\n');

const testCases = [
    new Rational(355, 113),
    new Rational(1234, 567),
    new Rational(-98, 76)
];

testCases.forEach(original => {
    const cf = original.toContinuedFraction();
    const reconstructed = Rational.fromContinuedFraction(cf);
    const equal = original.equals(reconstructed);
    
    console.log(`Original: ${original.toString()}`);
    console.log(`CF: [${cf.join(', ')}]`);
    console.log(`Reconstructed: ${reconstructed.toString()}`);
    console.log(`Equal: ${equal ? '✓' : '✗'}\n`);
});

// 5. Computing Convergents
console.log('5. Computing Convergents\n');

const phi = Rational.fromContinuedFraction([1, 1, 1, 1, 1, 1, 1, 1]);
console.log(`Golden ratio approximation: ${phi.toString()}`);
console.log(`CF: [${phi.toContinuedFraction().join(', ')}]`);
console.log('Convergents:');

const convergents = phi.convergents();
convergents.forEach((conv, i) => {
    const decimal = conv.toDecimal().substring(0, 12);
    console.log(`  C${i}: ${conv.toString()} ≈ ${decimal}`);
});
console.log();

// 6. Approximation Quality
console.log('6. Approximation Quality\n');

// Compare different π approximations
const piExact = new Rational(355, 113);  // Very good π approximation
const approximations = [
    new Rational(3, 1),       // 3
    new Rational(22, 7),      // 22/7
    new Rational(333, 106),   // Next convergent
    piExact                   // 355/113
];

console.log('π approximations (compared to 355/113):');
approximations.forEach((approx, i) => {
    const error = approx.approximationError(piExact);
    const decimal = approx.toDecimal().substring(0, 12);
    console.log(`  ${approx.toString().padEnd(8)} ≈ ${decimal} (error: ${error.toString()})`);
});
console.log();

// 7. Best Approximation within Denominator Limits
console.log('7. Best Approximations within Denominator Limits\n');

const target = new Rational(355, 113);
const limits = [10n, 50n, 100n, 200n];

console.log(`Finding best approximations to ${target.toString()}:`);
limits.forEach(limit => {
    const best = target.bestApproximation(limit);
    const error = best.approximationError(target);
    console.log(`  Max denominator ${limit}: ${best.toString()} (error: ${error.toString()})`);
});
console.log();

// 8. Arithmetic with CF-created Rationals
console.log('8. Arithmetic with CF-created Rationals\n');

const a = Parser.parse("3.~7");        // 22/7
const b = Parser.parse("1.~1~2");      // 8/5
const c = Parser.parse("0.~2");        // 1/2

console.log(`a = ${a.toString()} (from "3.~7")`);
console.log(`b = ${b.toString()} (from "1.~1~2")`);  
console.log(`c = ${c.toString()} (from "0.~2")`);
console.log();

// Basic arithmetic
const sum = a.add(b);
const difference = a.subtract(b);
const product = a.multiply(c);
const quotient = a.divide(c);

console.log('Arithmetic operations:');
console.log(`  a + b = ${sum.toString()} = ${sum.toDecimal().substring(0, 10)}`);
console.log(`  a - b = ${difference.toString()} = ${difference.toDecimal().substring(0, 10)}`);
console.log(`  a × c = ${product.toString()} = ${product.toDecimal().substring(0, 10)}`);
console.log(`  a ÷ c = ${quotient.toString()} = ${quotient.toDecimal().substring(0, 10)}`);
console.log();

// Show the CF representation of results
console.log('CF representations of results:');
console.log(`  ${sum.toString()} → "${sum.toContinuedFractionString()}"`);
console.log(`  ${product.toString()} → "${product.toContinuedFractionString()}"`);
console.log();

// 9. Working with Large Continued Fractions
console.log('9. Working with Large Continued Fractions\n');

// Create a rational with many CF terms
const largeCF = [2, 1, 2, 1, 1, 4, 1, 1, 6, 1, 1, 8, 1, 1, 10];
const e_approx = Rational.fromContinuedFraction(largeCF);

console.log(`e approximation from large CF:`);
console.log(`  CF: [${largeCF.join(', ')}]`);
console.log(`  Rational: ${e_approx.toString()}`);
console.log(`  Decimal: ${e_approx.toDecimal().substring(0, 15)}`);
console.log(`  Convergents count: ${e_approx.convergents().length}`);
console.log();

// 10. Error Handling Examples
console.log('10. Error Handling Examples\n');

const invalidCFs = [
    "3.~~7",        // Double tilde
    "3.~",          // Trailing tilde
    ".~5",          // Missing integer part
    "3.~0~0",       // Zero term
    "3.~-1"         // Negative term
];

console.log('Testing invalid CF formats:');
invalidCFs.forEach(invalid => {
    try {
        Parser.parse(invalid);
        console.log(`  "${invalid}" → Unexpectedly succeeded!`);
    } catch (error) {
        console.log(`  "${invalid}" → Error: ${error.message}`);
    }
});
console.log();

console.log('=== End of Continued Fractions Basic Examples ===');

// Example of integration with template functions (when available)
try {
    // These would work when template functions are integrated
    // const cf1 = R`3.~7~15`;
    // const cf2 = F`22.~7`;
    // console.log('Template function integration would work here');
} catch (e) {
    console.log('Template function integration not yet available');
}
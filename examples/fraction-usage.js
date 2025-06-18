/**
 * Examples showing the usage of the Fraction class
 *
 * The Fraction class represents fractions without automatic reduction, 
 * maintaining the exact numerator/denominator values.
 */

import { Fraction, Rational } from '../index.js';

// =============== BASIC USAGE =================

console.log('BASIC USAGE EXAMPLES');
console.log('-----------------------');

// Creating fractions in various ways
const f1 = new Fraction(1, 2);          // from numerator and denominator
const f2 = new Fraction(2, 4);          // 2/4 (not automatically reduced to 1/2)
const f3 = new Fraction('3/5');         // from string
const f4 = new Fraction(7);             // integer (denominator defaults to 1)

console.log('f1:', f1.toString());      // 1/2
console.log('f2:', f2.toString());      // 2/4
console.log('f3:', f3.toString());      // 3/5
console.log('f4:', f4.toString());      // 7

// Equality vs mathematical equivalence
console.log('\nFraction equality is based on exact representation:');
console.log('f1 equals f2?', f1.equals(f2));  // false - different representation
console.log('Reduced f2 equals f1?', f2.reduce().equals(f1));  // true

// ========== ARITHMETIC OPERATIONS =============

console.log('\nARITHMETIC OPERATIONS');
console.log('----------------------');

// Addition (only works for equal denominators)
console.log('\nAddition (requires equal denominators):');
try {
  console.log('1/2 + 1/2 =', f1.add(f1).toString());  // Works: 2/2
  console.log('1/2 + 2/4 =', f1.add(f2).toString());  // Should throw error
} catch (error) {
  console.log('Error:', error.message);  // Addition only supported for equal denominators
}

// Working with common denominators for addition
console.log('\nScaling to common denominators:');
const commonDenominator = 10;
const g1 = new Fraction(1, 2).scale(commonDenominator / 2);  // 5/10
const g2 = new Fraction(3, 5).scale(commonDenominator / 5);  // 6/10
const g3 = new Fraction(1, 10);                              // 1/10

console.log('g1:', g1.toString());  // 5/10
console.log('g2:', g2.toString());  // 6/10
console.log('g3:', g3.toString());  // 1/10

const sum1 = g1.add(g2);                 // 11/10
const sum2 = sum1.add(g3);               // 12/10
console.log('g1 + g2 =', sum1.toString());
console.log('(g1 + g2) + g3 =', sum2.toString());
console.log('Reduced sum:', sum2.reduce().toString());  // 6/5

// Multiplication and division
console.log('\nMultiplication and division:');
console.log('1/2 * 3/5 =', f1.multiply(f3).toString());  // 3/10
console.log('1/2 / 3/5 =', f1.divide(f3).toString());    // 5/6

// ========== SPECIAL OPERATIONS =============

console.log('\nSPECIAL OPERATIONS');
console.log('------------------');

// Exponentiation
console.log('\nExponentiation:');
console.log('(2/3)^3 =', new Fraction(2, 3).pow(3).toString());  // 8/27
console.log('(2/3)^0 =', new Fraction(2, 3).pow(0).toString());  // 1
console.log('(2/3)^-1 =', new Fraction(2, 3).pow(-1).toString()); // 3/2

// Mediant calculation
console.log('\nMediant (useful in continued fractions):');
const a = new Fraction(1, 2);
const b = new Fraction(2, 3);
console.log(`Mediant of ${a} and ${b} =`, Fraction.mediant(a, b).toString()); // 3/5

// Continued fraction approximation example
console.log('\nApproximating π using continued fraction mediants:');
// Starting with 3 < π < 4
let lower = new Fraction(3, 1);
let upper = new Fraction(4, 1);

console.log(`Iteration 0: [${lower}, ${upper}]`);

// Iterative mediant approximation
for (let i = 1; i <= 5; i++) {
  const mediant = Fraction.mediant(lower, upper);
  // Compare with π (approximated as 3.14159...)
  if (mediant.toRational().toNumber() < 3.14159) {
    lower = mediant;
  } else {
    upper = mediant;
  }
  console.log(`Iteration ${i}: [${lower}, ${upper}] - mediant = ${mediant}`);
}

// ========== CONVERTING TO RATIONAL =============

console.log('\nCONVERTING BETWEEN FRACTION AND RATIONAL');
console.log('---------------------------------------');
const fraction = new Fraction(4, 6);  // 4/6
const rational = fraction.toRational();  // Converts to 2/3 (reduced form)

console.log('Original fraction:', fraction.toString());  // 4/6
console.log('As Rational:', rational.toString());  // 2/3
console.log('Back to Fraction:', Fraction.fromRational(rational).toString());  // 2/3

// Demonstrating the difference in behavior
const r1 = new Rational(4, 6);  // Automatically reduced to 2/3
const f5 = new Fraction(4, 6);  // Stays as 4/6

console.log('\nDifference between Rational and Fraction:');
console.log('new Rational(4, 6) =', r1.toString());  // 2/3
console.log('new Fraction(4, 6) =', f5.toString());  // 4/6
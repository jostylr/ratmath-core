/**
 * Example demonstrating new RationalInterval methods
 * 
 * This example shows how to use the mediant, midpoint, shortestDecimal,
 * and randomRational methods of the RationalInterval class.
 */

import { RationalInterval, Rational } from '../index.js';

console.log('=== RationalInterval New Methods Demo ===\n');

// Create some example intervals
const interval1 = new RationalInterval('1/3', '2/3');
const interval2 = new RationalInterval('0.1', '0.9'); // [1/10, 9/10]
const interval3 = new RationalInterval('1', '2');

console.log('1. Mediant Calculation');
console.log('---------------------');
console.log(`Interval: ${interval1.toString()}`);
console.log(`Mediant: ${interval1.mediant().toString()}`);
console.log(`Note: Mediant of 1/3 and 2/3 is (1+2)/(3+3) = 3/6 = 1/2\n`);

console.log(`Interval: ${interval3.toString()}`);
console.log(`Mediant: ${interval3.mediant().toString()}`);
console.log(`Note: Mediant of 1/1 and 2/1 is (1+2)/(1+1) = 3/2\n`);

console.log('2. Midpoint Calculation');
console.log('----------------------');
console.log(`Interval: ${interval1.toString()}`);
console.log(`Midpoint: ${interval1.midpoint().toString()}`);
console.log(`Note: Midpoint of 1/3 and 2/3 is (1/3 + 2/3)/2 = 1/2\n`);

console.log(`Interval: ${interval2.toString()}`);
console.log(`Midpoint: ${interval2.midpoint().toString()}`);
console.log(`Note: Midpoint of 1/10 and 9/10 is (1/10 + 9/10)/2 = 1/2\n`);

console.log('3. Shortest Decimal Representation');
console.log('----------------------------------');

// Example with base 10 (default)
const decimalInterval = new RationalInterval('0.15', '0.35'); // [3/20, 7/20]
console.log(`Interval: ${decimalInterval.toString()}`);
console.log(`Shortest decimal (base 10): ${decimalInterval.shortestDecimal().toString()}`);
console.log(`Note: Looking for rationals with denominators 1, 10, 100, 1000, ...\n`);

// Example with base 2
const binaryInterval = new RationalInterval('0.2', '0.8'); // [1/5, 4/5]
console.log(`Interval: ${binaryInterval.toString()}`);
console.log(`Shortest "binary decimal" (base 2): ${binaryInterval.shortestDecimal(2).toString()}`);
console.log(`Note: Looking for rationals with denominators 1, 2, 4, 8, 16, ...\n`);

// Example with base 3
const ternaryInterval = new RationalInterval('0.25', '0.75'); // [1/4, 3/4]
console.log(`Interval: ${ternaryInterval.toString()}`);
console.log(`Shortest "ternary decimal" (base 3): ${ternaryInterval.shortestDecimal(3).toString()}`);
console.log(`Note: Looking for rationals with denominators 1, 3, 9, 27, ...\n`);

console.log('4. Random Rational Generation');
console.log('-----------------------------');

const randomInterval = new RationalInterval('0', '1');
console.log(`Interval: ${randomInterval.toString()}`);
console.log('Generating 10 random rationals from [0, 1] with max denominator 20:');

for (let i = 0; i < 10; i++) {
  const random = randomInterval.randomRational(20);
  console.log(`  ${i + 1}: ${random.toString()} = ${random.toNumber().toFixed(4)}`);
}
console.log();

// Example with a smaller interval
const smallInterval = new RationalInterval('1/4', '3/4');
console.log(`Interval: ${smallInterval.toString()}`);
console.log('Generating 5 random rationals from [1/4, 3/4] with max denominator 12:');

for (let i = 0; i < 5; i++) {
  const random = smallInterval.randomRational(12);
  console.log(`  ${i + 1}: ${random.toString()} = ${random.toNumber().toFixed(4)}`);
}
console.log();

console.log('5. Comparing Mediant vs Midpoint');
console.log('--------------------------------');

const comparisonInterval = new RationalInterval('1/7', '2/5');
console.log(`Interval: ${comparisonInterval.toString()}`);
console.log(`Mediant: ${comparisonInterval.mediant().toString()} = ${comparisonInterval.mediant().toNumber().toFixed(6)}`);
console.log(`Midpoint: ${comparisonInterval.midpoint().toString()} = ${comparisonInterval.midpoint().toNumber().toFixed(6)}`);
console.log(`Note: The mediant has simpler denominators but may not be the arithmetic center\n`);

console.log('6. Practical Applications');
console.log('-------------------------');

// Approximating π
const piInterval = new RationalInterval('3.14', '3.15');
console.log('Approximating π using different methods:');
console.log(`π ≈ ${Math.PI.toFixed(6)}`);
console.log(`Interval: ${piInterval.toString()}`);
console.log(`Mediant: ${piInterval.mediant().toString()} = ${piInterval.mediant().toNumber().toFixed(6)}`);
console.log(`Midpoint: ${piInterval.midpoint().toString()} = ${piInterval.midpoint().toNumber().toFixed(6)}`);
console.log(`Shortest decimal: ${piInterval.shortestDecimal().toString()} = ${piInterval.shortestDecimal().toNumber().toFixed(6)}`);

// Monte Carlo-like sampling
console.log('\nMonte Carlo-like sampling from [0, 1]:');
const unitInterval = new RationalInterval('0', '1');
const samples = [];
for (let i = 0; i < 100; i++) {
  samples.push(unitInterval.randomRational(50).toNumber());
}
const average = samples.reduce((a, b) => a + b, 0) / samples.length;
console.log(`Average of 100 random samples: ${average.toFixed(6)} (should be close to 0.5)`);

console.log('\n7. Mathematical Bound Efficiency');
console.log('--------------------------------');

// Demonstrate the mathematical bound optimization
const efficientInterval = new RationalInterval('0.24999', '0.25001');
const intervalLength = efficientInterval.high.subtract(efficientInterval.low);
console.log(`Interval: ${efficientInterval.toString()}`);
console.log(`Length: ${intervalLength.toString()} = ${intervalLength.toNumber().toExponential(3)}`);

// For base 10: theoretical bound is ceil(log(1/L)/log(10))
const L = intervalLength.toNumber();
const theoreticalBound = Math.ceil(Math.log(1/L) / Math.log(10));
console.log(`Theoretical bound for base 10: k ≤ ${theoreticalBound}`);
console.log(`This means we only need to check denominators: 1, 10, 100, ..., 10^${theoreticalBound}`);

const shortestBase10 = efficientInterval.shortestDecimal(10);
console.log(`Shortest decimal (base 10): ${shortestBase10.toString()}`);
console.log(`Denominator is 10^${Math.log10(Number(shortestBase10.denominator))}`);

// Compare with base 2
const theoreticalBound2 = Math.ceil(Math.log(1/L) / Math.log(2));
console.log(`\nTheoretical bound for base 2: k ≤ ${theoreticalBound2}`);
const shortestBase2 = efficientInterval.shortestDecimal(2);
console.log(`Shortest "binary decimal" (base 2): ${shortestBase2.toString()}`);
console.log(`Denominator is 2^${Math.log2(Number(shortestBase2.denominator))}`);

console.log('\n8. Point Interval Behavior');
console.log('--------------------------');

// Demonstrate point interval behavior
console.log('Point intervals return the value if it has a power-of-base representation, or null if not:');

const quarterPoint = new RationalInterval('1/4', '1/4');
console.log(`[1/4, 1/4] base 2: ${quarterPoint.shortestDecimal(2)?.toString() || 'null'} (1/4 = 1/2²)`);

const fifthPoint = new RationalInterval('1/5', '1/5');
console.log(`[1/5, 1/5] base 10: ${fifthPoint.shortestDecimal(10)?.toString() || 'null'} (1/5 = 2/10¹)`);

const seventhPoint = new RationalInterval('3/7', '3/7');
console.log(`[3/7, 3/7] base 10: ${seventhPoint.shortestDecimal(10)?.toString() || 'null'} (3/7 cannot be p/10^k)`);

const thirdPoint = new RationalInterval('1/3', '1/3');
console.log(`[1/3, 1/3] base 2: ${thirdPoint.shortestDecimal(2)?.toString() || 'null'} (1/3 cannot be p/2^k)`);
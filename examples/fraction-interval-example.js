/**
 * Example demonstrating the FractionInterval class
 * 
 * This example shows how to create fraction intervals, apply mediant partitioning,
 * and convert between FractionInterval and RationalInterval.
 */

import { Fraction, FractionInterval, RationalInterval } from '../src/index.js';

// Creating a unit interval from 0 to 1 with fractions
const zero = new Fraction(0, 1);
const one = new Fraction(1, 1);
const unitInterval = new FractionInterval(zero, one);

console.log("Unit Interval:", unitInterval.toString());

// Simple mediant split (default n=1)
console.log("\nSimple Mediant Split:");
const firstSplit = unitInterval.partitionWithMediants();
firstSplit.forEach((interval, i) => {
  console.log(`Interval ${i+1}: ${interval.toString()}`);
});

// This produces:
// [0/1:1/2] and [1/2:1/1]

// Mediant partitioning with depth 2
console.log("\nMediant Partitioning (depth 2):");
const secondSplit = unitInterval.partitionWithMediants(2);
secondSplit.forEach((interval, i) => {
  console.log(`Interval ${i+1}: ${interval.toString()}`);
});

// This produces:
// [0/1:1/3], [1/3:1/2], [1/2:2/3], [2/3:1/1]

// Mediant partitioning with depth 3
console.log("\nMediant Partitioning (depth 3):");
const thirdSplit = unitInterval.partitionWithMediants(3);
thirdSplit.forEach((interval, i) => {
  console.log(`Interval ${i+1}: ${interval.toString()}`);
});

// This produces 8 intervals

// Custom partitioning function
console.log("\nCustom Partitioning:");
const customPartition = unitInterval.partitionWith((a, b) => {
  // Create partitions at 1/4, 1/2, and 3/4
  return [
    new Fraction(1, 4),
    new Fraction(1, 2),
    new Fraction(3, 4)
  ];
});
customPartition.forEach((interval, i) => {
  console.log(`Interval ${i+1}: ${interval.toString()}`);
});

// Convert between FractionInterval and RationalInterval
console.log("\nConversion to RationalInterval:");
const fractionalThirds = new FractionInterval(
  new Fraction(1, 3),
  new Fraction(2, 3)
);
console.log("Fraction Interval:", fractionalThirds.toString());

const rationalThirds = fractionalThirds.toRationalInterval();
console.log("Rational Interval:", rationalThirds.toString());

// Convert back to FractionInterval
console.log("\nConversion from RationalInterval:");
const backToFraction = FractionInterval.fromRationalInterval(rationalThirds);
console.log("Back to Fraction Interval:", backToFraction.toString());

// Working with non-reduced fractions
console.log("\nNon-reduced fractions:");
const nonReduced = new FractionInterval(
  new Fraction(2, 6),  // Equivalent to 1/3
  new Fraction(4, 6)   // Equivalent to 2/3
);
console.log("Non-reduced interval:", nonReduced.toString());

// Converting to RationalInterval reduces the fractions
const reduced = nonReduced.toRationalInterval();
console.log("After conversion to RationalInterval:", reduced.toString());

// Farey sequence approximation example
console.log("\nFarey Sequence Approximation Example:");
const piApprox = new FractionInterval(
  new Fraction(3, 1),
  new Fraction(22, 7)
);
console.log("Pi approximation interval:", piApprox.toString());

// Get better approximations through recursive mediant partitioning
const piRefinements = piApprox.partitionWithMediants(3);
console.log("Refined approximations of π:");
piRefinements.forEach((interval, i) => {
  console.log(`Approximation ${i+1}: ${interval.toString()}`);
});
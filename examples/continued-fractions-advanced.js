#!/usr/bin/env bun

/**
 * Continued Fractions Advanced Examples
 * 
 * This file demonstrates advanced continued fraction features:
 * - Farey sequences and mediant operations
 * - Stern-Brocot tree navigation
 * - Infinite fractions and tree boundaries
 * - Advanced approximation techniques
 */

import { Rational } from '../src/rational.js';
import { Fraction } from '../src/fraction.js';
import { Parser } from '../src/parser.js';

console.log('=== RatMath Continued Fractions Advanced Examples ===\n');

// 1. Farey Sequence and Mediant Operations
console.log('1. Farey Sequence and Mediant Operations\n');

// Basic mediant computation
const frac1 = new Fraction(1, 3);
const frac2 = new Fraction(1, 2);
const mediant = frac1.mediant(frac2);

console.log(`Mediant of ${frac1.toString()} and ${frac2.toString()}: ${mediant.toString()}`);
console.log(`Verification: (${frac1.numerator}+${frac2.numerator})/(${frac1.denominator}+${frac2.denominator}) = ${mediant.toString()}\n`);

// Mediant triple validation
const isValidTriple = Fraction.isMediantTriple(frac1, mediant, frac2);
console.log(`Is {${frac1.toString()}, ${mediant.toString()}, ${frac2.toString()}} a valid mediant triple? ${isValidTriple}`);

// Farey triple validation (checks both mediant and adjacency)
const isFareyTriple = Fraction.isFareyTriple(frac1, mediant, frac2);
console.log(`Is it also a valid Farey triple? ${isFareyTriple}`);

// Demonstrate different fractions with same rational value have different mediant behavior
const reduced = new Fraction(2, 6);  // Same as 1/3 when reduced
const equivalent = new Fraction(1, 3);
const partner = new Fraction(1, 2);

const mediant1 = reduced.mediant(partner);
const mediant2 = equivalent.mediant(partner);

console.log(`\nDifferent representations, different mediants:`);
console.log(`${reduced.toString()} mediant ${partner.toString()} = ${mediant1.toString()}`);
console.log(`${equivalent.toString()} mediant ${partner.toString()} = ${mediant2.toString()}`);
console.log(`Same rational value (${reduced.numerator}/${reduced.denominator} = ${equivalent.numerator}/${equivalent.denominator}), but different mediant results!\n`);

// 2. Finding Farey Parents
console.log('2. Finding Farey Parents\n');

const testFractions = [
    new Fraction(3, 5),
    new Fraction(2, 5),
    new Fraction(5, 8),
    new Fraction(7, 12)
];

testFractions.forEach(frac => {
    try {
        const parents = frac.fareyParents();
        console.log(`Farey parents of ${frac.toString()}:`);
        console.log(`  Left: ${parents.left.toString()} ${parents.left.isInfinite ? '(infinite)' : ''}`);
        console.log(`  Right: ${parents.right.toString()} ${parents.right.isInfinite ? '(infinite)' : ''}`);
        
        // Verify the mediant relationship
        if (!parents.left.isInfinite && !parents.right.isInfinite) {
            const computedMediant = parents.left.mediant(parents.right);
            const matches = computedMediant.equals(frac);
            console.log(`  Verification: ${parents.left.toString()} ⊕ ${parents.right.toString()} = ${computedMediant.toString()} ${matches ? '✓' : '✗'}`);
        }
        console.log();
    } catch (error) {
        console.log(`Error finding parents for ${frac.toString()}: ${error.message}\n`);
    }
});

// 3. Mediant Partner Computation
console.log('3. Mediant Partner Computation\n');

const knownEndpoint = new Fraction(1, 4);
const knownMediant = new Fraction(3, 7);

try {
    const partner = Fraction.mediantPartner(knownEndpoint, knownMediant);
    console.log(`Given endpoint ${knownEndpoint.toString()} and mediant ${knownMediant.toString()}`);
    console.log(`Computed partner: ${partner.toString()}`);
    
    // Verify the relationship
    const verifyMediant = knownEndpoint.mediant(partner);
    console.log(`Verification: ${knownEndpoint.toString()} ⊕ ${partner.toString()} = ${verifyMediant.toString()}`);
    console.log(`Matches expected mediant? ${verifyMediant.equals(knownMediant) ? '✓' : '✗'}\n`);
} catch (error) {
    console.log(`Error computing mediant partner: ${error.message}\n`);
}

// 4. Stern-Brocot Tree Operations
console.log('4. Stern-Brocot Tree Operations\n');

// Tree boundary fractions (infinite)
console.log('Stern-Brocot Tree Boundaries:');
const posInf = new Fraction(1, 0, { allowInfinite: true });
const negInf = new Fraction(-1, 0, { allowInfinite: true });
console.log(`Positive infinity: ${posInf.toString()} (isInfinite: ${posInf.isInfinite})`);
console.log(`Negative infinity: ${negInf.toString()} (isInfinite: ${negInf.isInfinite})\n`);

// Tree path generation and navigation
const treeFractions = [
    new Fraction(1, 1),  // Root
    new Fraction(1, 2),  // Left child of root
    new Fraction(2, 1),  // Right child of root
    new Fraction(3, 5),  // Some deeper fraction
    new Fraction(5, 8),  // Another fraction
];

console.log('Stern-Brocot Tree Paths:');
treeFractions.forEach(frac => {
    try {
        const path = frac.sternBrocotPath();
        const depth = frac.sternBrocotDepth();
        const pathStr = path.length > 0 ? path.join('') : '(root)';
        
        console.log(`${frac.toString()}: path=${pathStr}, depth=${depth}`);
        
        // Verify roundtrip: path → fraction → path
        const reconstructed = Fraction.fromSternBrocotPath(path);
        const matches = reconstructed.equals(frac);
        console.log(`  Roundtrip verification: ${matches ? '✓' : '✗'}`);
        
    } catch (error) {
        console.log(`${frac.toString()}: Error - ${error.message}`);
    }
});
console.log();

// 5. Tree Navigation (Parents and Children)
console.log('5. Tree Navigation (Parents and Children)\n');

const root = new Fraction(1, 1);
console.log(`Starting at root: ${root.toString()}`);

// Get children of root
const rootChildren = root.sternBrocotChildren();
console.log(`Children of root:`);
console.log(`  Left child: ${rootChildren.left.toString()}`);
console.log(`  Right child: ${rootChildren.right.toString()}\n`);

// Navigate deeper in the tree
const leftChild = rootChildren.left;
const leftGrandchildren = leftChild.sternBrocotChildren();
console.log(`Children of ${leftChild.toString()}:`);
console.log(`  Left grandchild: ${leftGrandchildren.left.toString()}`);
console.log(`  Right grandchild: ${leftGrandchildren.right.toString()}\n`);

// Find parents
const testChild = new Fraction(3, 5);
const parent = testChild.sternBrocotParent();
console.log(`Parent of ${testChild.toString()}: ${parent ? parent.toString() : 'null'}`);

if (parent) {
    const parentChildren = parent.sternBrocotChildren();
    const isLeftChild = parentChildren.left.equals(testChild);
    const isRightChild = parentChildren.right.equals(testChild);
    console.log(`Verification: ${testChild.toString()} is ${isLeftChild ? 'left' : isRightChild ? 'right' : 'neither'} child of ${parent.toString()}`);
}
console.log();

// 6. Tree Ancestors
console.log('6. Tree Ancestors\n');

const deepFraction = new Fraction(8, 13);
console.log(`Finding ancestors of ${deepFraction.toString()}:`);

const ancestors = deepFraction.sternBrocotAncestors();
console.log(`Ancestors (from root down):`);
ancestors.forEach((ancestor, i) => {
    console.log(`  Level ${i}: ${ancestor.toString()}`);
});
console.log(`  Level ${ancestors.length}: ${deepFraction.toString()} (self)\n`);

// 7. Tree Validation
console.log('7. Tree Validation\n');

const validFractions = [
    new Fraction(1, 1),
    new Fraction(3, 5),
    new Fraction(5, 8),
    new Fraction(13, 21)
];

const invalidFractions = [
    new Fraction(2, 4),  // Not in lowest terms
    new Fraction(6, 9),  // Not in lowest terms
];

console.log('Valid tree fractions:');
validFractions.forEach(frac => {
    const isValid = frac.isSternBrocotValid();
    console.log(`  ${frac.toString()}: ${isValid ? '✓' : '✗'}`);
});

console.log('\nFractions not in canonical tree position:');
invalidFractions.forEach(frac => {
    const isValid = frac.isSternBrocotValid();
    console.log(`  ${frac.toString()}: ${isValid ? '✓' : '✗'} (expected ✗ - not in lowest terms)`);
});
console.log();

// 8. Integration with Continued Fractions
console.log('8. Integration with Continued Fractions\n');

// Convert between continued fractions and tree positions
const cfExamples = [
    "3.~7",      // 22/7
    "1.~1~2",    // 8/5  
    "0.~3~2",    // 3/7
];

console.log('Continued Fractions in Stern-Brocot Tree:');
cfExamples.forEach(cfStr => {
    try {
        const rational = Parser.parse(cfStr);
        const fraction = new Fraction(rational.numerator, rational.denominator);
        
        console.log(`CF: ${cfStr} = ${fraction.toString()}`);
        
        const path = fraction.sternBrocotPath();
        const depth = fraction.sternBrocotDepth();
        const pathStr = path.length > 0 ? path.join('') : '(root)';
        
        console.log(`  Tree position: path=${pathStr}, depth=${depth}`);
        
        // Show some tree context
        const parent = fraction.sternBrocotParent();
        const children = fraction.sternBrocotChildren();
        
        console.log(`  Parent: ${parent ? parent.toString() : 'none (root)'}`);
        console.log(`  Children: ${children.left.toString()}, ${children.right.toString()}`);
        
        // Show Farey context
        const fareyParents = fraction.fareyParents();
        console.log(`  Farey parents: ${fareyParents.left.toString()} ${fareyParents.left.isInfinite ? '(∞)' : ''}, ${fareyParents.right.toString()} ${fareyParents.right.isInfinite ? '(∞)' : ''}`);
        
    } catch (error) {
        console.log(`  Error processing ${cfStr}: ${error.message}`);
    }
    console.log();
});

// 9. Approximation Quality Using Tree Structure
console.log('9. Approximation Quality Using Tree Structure\n');

// Show how the Stern-Brocot tree provides optimal approximations
const target = Math.PI;
const targetFraction = new Fraction(355, 113); // Good π approximation

console.log(`Approximating π ≈ ${target} using tree structure:`);
console.log(`Target fraction: ${targetFraction.toString()} ≈ ${(355/113).toFixed(8)}\n`);

// Show the tree path to this approximation
const piPath = targetFraction.sternBrocotPath();
console.log(`Tree path to π approximation: ${piPath.join('')}`);

// Show the convergents along the path
console.log('Convergents along the tree path:');
for (let i = 0; i <= piPath.length; i++) {
    const partialPath = piPath.slice(0, i);
    const convergent = Fraction.fromSternBrocotPath(partialPath);
    const decimal = convergent.numerator / convergent.denominator;
    const error = Math.abs(Number(decimal) - target);
    
    console.log(`  ${partialPath.length === 0 ? '(root)' : partialPath.join('')}: ${convergent.toString()} ≈ ${Number(decimal).toFixed(6)} (error: ${error.toFixed(6)})`);
}
console.log();

// 10. Advanced Mediant Sequences
console.log('10. Advanced Mediant Sequences\n');

// Generate a mediant sequence starting from two fractions
let left = new Fraction(0, 1);
let right = new Fraction(1, 1);

console.log('Mediant sequence in [0, 1]:');
console.log(`Start: ${left.toString()} ... ${right.toString()}`);

for (let level = 1; level <= 4; level++) {
    console.log(`Level ${level}:`);
    
    // Generate all fractions at this level using mediants
    const levelFractions = [];
    
    // This is a simplified approach - a full implementation would track all intervals
    const mediant = left.mediant(right);
    levelFractions.push(mediant);
    
    // Show the mediant at this level
    const decimal = Number(mediant.numerator) / Number(mediant.denominator);
    console.log(`  ${mediant.toString()} ≈ ${decimal.toFixed(4)}`);
    
    // For demonstration, continue with left half of interval
    right = mediant;
}
console.log();

console.log('=== End of Continued Fractions Advanced Examples ===');

// 11. Performance and Edge Cases
console.log('\n11. Performance and Edge Cases\n');

// Test with larger fractions
const largeFraction = new Fraction(1597, 987); // Fibonacci ratio approaching golden ratio
console.log(`Large fraction: ${largeFraction.toString()}`);
console.log(`Tree depth: ${largeFraction.sternBrocotDepth()}`);

try {
    const largeParents = largeFraction.fareyParents();
    console.log(`Farey parents computed successfully`);
} catch (error) {
    console.log(`Error with large fraction: ${error.message}`);
}

// Edge case: fractions near boundaries
const nearZero = new Fraction(1, 1000);
const nearOne = new Fraction(999, 1000);

console.log(`\nNear boundaries:`);
console.log(`${nearZero.toString()} depth: ${nearZero.sternBrocotDepth()}`);
console.log(`${nearOne.toString()} depth: ${nearOne.sternBrocotDepth()}`);
console.log();
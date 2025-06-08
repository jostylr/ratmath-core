/**
 * Demonstration of the new relativeDecimalInterval method behavior
 * Shows how it finds the shortest precise decimal within an interval
 * and creates a relative interval representation around that decimal
 */

import { Rational, RationalInterval } from '../index.js';

console.log('🔢 SHORTEST PRECISE DECIMAL INTERVAL DEMO 🔢\n');

// Example 1: Basic case - shortest decimal vs midpoint
console.log('1️⃣  BASIC EXAMPLE: [1.224, 1.235]');
console.log('=' .repeat(50));
const interval1 = new RationalInterval(new Rational("1.224"), new Rational("1.235"));
console.log(`Original interval: ${interval1.toString()}`);
console.log(`Midpoint method:   ${interval1.relativeMidDecimalInterval()}`);
console.log(`Shortest decimal:  ${interval1.relativeDecimalInterval()}`);
console.log(`\nExplanation: The shortest precise decimal in [1.224, 1.235] is 1.23`);
console.log(`(2 decimal places vs 4+ for the midpoint 1.2295)`);
console.log(`Offset notation: [+5,-6] means +5/1000 and -6/1000 (next decimal place)`);
console.log(`Verification: 1.23 + 0.005 = 1.235, 1.23 - 0.006 = 1.224 ✓\n`);

// Example 2: Multiple candidates - closest to midpoint wins
console.log('2️⃣  MULTIPLE CANDIDATES: [1.225, 1.275]');
console.log('=' .repeat(50));
const interval2 = new RationalInterval(new Rational("1.225"), new Rational("1.275"));
console.log(`Original interval: ${interval2.toString()}`);
console.log(`Midpoint method:   ${interval2.relativeMidDecimalInterval()}`);
console.log(`Shortest decimal:  ${interval2.relativeDecimalInterval()}`);
console.log(`\nExplanation: Valid 2-decimal candidates are 1.23, 1.24, 1.25, 1.26, 1.27`);
console.log(`Midpoint is 1.25, so 1.25 is chosen as closest to midpoint`);
console.log(`Offset notation: [+-25] means ±25/1000 = ±0.025 (next decimal place)\n`);

// Example 3: Tie-breaking - lower value wins
console.log('3️⃣  TIE-BREAKING: [1.235, 1.245]');
console.log('=' .repeat(50));
const interval3 = new RationalInterval(new Rational("1.235"), new Rational("1.245"));
console.log(`Original interval: ${interval3.toString()}`);
console.log(`Midpoint method:   ${interval3.relativeMidDecimalInterval()}`);
console.log(`Shortest decimal:  ${interval3.relativeDecimalInterval()}`);
console.log(`\nExplanation: Both 1.24 and 1.24 are equally close to midpoint 1.24`);
console.log(`The lower value 1.24 is chosen for tie-breaking`);
console.log(`Offset notation: [+-5] means ±5/1000 = ±0.005 (next decimal place)\n`);

// Example 4: Asymmetric intervals
console.log('4️⃣  ASYMMETRIC INTERVAL: [77.7, 93.3]');
console.log('=' .repeat(50));
const interval4 = new RationalInterval(new Rational("77.7"), new Rational("93.3"));
console.log(`Original interval: ${interval4.toString()}`);
console.log(`Midpoint method:   ${interval4.relativeMidDecimalInterval()}`);
console.log(`Shortest decimal:  ${interval4.relativeDecimalInterval()}`);
console.log(`\nExplanation: Shortest decimal is found at integer precision (85)`);
console.log(`which requires much less precision than the midpoint 85.5`);
console.log(`Offset notation: [+83,-73] means +83/10 and -73/10 (next decimal place)`);
console.log(`Verification: 85 + 8.3 = 93.3, 85 - 7.3 = 77.7 ✓\n`);

// Example 5: Large offset differences
console.log('5️⃣  OFFSET COMPARISON: [1.22, 1.24]');
console.log('=' .repeat(50));
const interval5 = new RationalInterval(new Rational("1.22"), new Rational("1.24"));
console.log(`Original interval: ${interval5.toString()}`);
console.log(`Midpoint method:   ${interval5.relativeMidDecimalInterval()}`);
console.log(`Shortest decimal:  ${interval5.relativeDecimalInterval()}`);
console.log(`\nExplanation: 1.23 is the shortest decimal, creating symmetric offsets`);
console.log(`Distance to 1.22: 0.01, Distance to 1.24: 0.01, so offset is ±0.01`);
console.log(`Offset notation: [+-10] means ±10/1000 = ±0.01 (next decimal place)`);
console.log(`Verification: 1.23 + 0.01 = 1.24, 1.23 - 0.01 = 1.22 ✓\n`);

console.log('🎯 KEY DIFFERENCES:');
console.log('• Midpoint method: Always uses the exact center, may need many decimal places');
console.log('• Shortest decimal: Finds the simplest decimal representation within the interval');
console.log('• Result: Often more human-readable and practical decimal representations');
console.log('• Offsets: Uses next decimal place convention (divide by 10^(decimal_places+1))');
console.log('• Notation: [+high,-low] for asymmetric, [+-offset] for symmetric intervals');
console.log('• Use case: Better for display purposes and when precision can be traded for simplicity');
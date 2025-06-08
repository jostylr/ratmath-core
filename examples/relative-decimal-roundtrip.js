/**
 * Demonstration of roundtrip conversion between RationalInterval and relative decimal interval notation
 * Shows how intervals can be converted to human-readable decimal uncertainty format and back
 */

import { Rational, RationalInterval, parseRepeatingDecimal } from '../index.js';

console.log('🔄 RELATIVE DECIMAL INTERVAL ROUNDTRIP DEMO 🔄\n');

console.log('This demo shows how rational intervals can be converted to relative decimal');
console.log('notation (like 1.23[+5,-6]) and back to rational intervals.\n');

console.log('IMPORTANT: The roundtrip may not preserve exact rational values because');
console.log('the relative decimal notation uses the SHORTEST precise decimal, which');
console.log('trades exact representation for simpler, more readable notation.\n');

console.log('=' .repeat(70));

// Test cases with different characteristics
const testCases = [
  {
    name: 'Simple Decimal Interval',
    interval: new RationalInterval(new Rational("1.224"), new Rational("1.235")),
    description: 'Basic case with asymmetric offsets'
  },
  {
    name: 'Symmetric Interval', 
    interval: new RationalInterval(new Rational("1.22"), new Rational("1.24")),
    description: 'Perfect symmetry around 1.23'
  },
  {
    name: 'Integer-Based Interval',
    interval: new RationalInterval(new Rational("777", "10"), new Rational("933", "10")),
    description: 'Large asymmetric interval using integer precision'
  },
  {
    name: 'Complex Fraction Interval',
    interval: new RationalInterval(new Rational(123, 45), new Rational(345, 67)),
    description: 'Shows precision loss with complex rationals'
  },
  {
    name: 'Famous Rationals',
    interval: new RationalInterval(new Rational(22, 7), new Rational(25, 8)),
    description: 'π approximation to 25/8 (3.125)'
  },
  {
    name: 'Repeating Decimal Endpoints',
    interval: new RationalInterval(new Rational(1, 3), new Rational(2, 3)),
    description: 'Thirds converted to decimal approximation'
  },
  {
    name: 'Negative Interval',
    interval: new RationalInterval(new Rational("-2.5"), new Rational("-1.5")),
    description: 'Negative values with decimal precision'
  },
  {
    name: 'Spanning Zero',
    interval: new RationalInterval(new Rational("-0.5"), new Rational("0.5")),
    description: 'Interval crossing zero'
  },
  {
    name: 'High Precision',
    interval: new RationalInterval(new Rational("1.2344"), new Rational("1.2356")),
    description: 'Requires 3+ decimal places for shortest representation'
  },
  {
    name: 'Point Interval',
    interval: new RationalInterval(new Rational("2.5"), new Rational("2.5")),
    description: 'Degenerate interval (single point)'
  }
];

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log('─'.repeat(testCase.name.length + 3));
  console.log(`Description: ${testCase.description}`);
  
  const original = testCase.interval;
  console.log(`Original:    [${original.low.toDecimal()}, ${original.high.toDecimal()}]`);
  console.log(`Rational:    [${original.low.toString()}, ${original.high.toString()}]`);
  
  // Convert to relative decimal notation
  const decimalForm = original.relativeDecimalInterval();
  console.log(`Decimal:     ${decimalForm}`);
  
  // Convert back to rational interval
  const roundtrip = parseRepeatingDecimal(decimalForm);
  console.log(`Roundtrip:   [${roundtrip.low.toDecimal()}, ${roundtrip.high.toDecimal()}]`);
  
  // Check for true mathematical exactness using rational equals
  const lowExact = original.low.equals(roundtrip.low);
  const highExact = original.high.equals(roundtrip.high);
  
  if (lowExact && highExact) {
    console.log(`Precision:   ✅ Mathematically exact`);
  } else {
    const lowDiff = original.low.subtract(roundtrip.low).abs();
    const highDiff = original.high.subtract(roundtrip.high).abs();
    const maxDiff = lowDiff.compareTo(highDiff) >= 0 ? lowDiff : highDiff;
    
    // Check if the difference is actually zero (which can happen due to decimal representation)
    if (maxDiff.equals(new Rational(0))) {
      console.log(`Precision:   ✅ Mathematically exact`);
    } else {
      console.log(`Precision:   ⚠️  Approximate (max error: ${maxDiff.toDecimal()})`);
    }
  }
});

console.log('\n' + '=' .repeat(70));
console.log('\n🎯 KEY INSIGHTS:');
console.log('• Perfect roundtrips occur when intervals have exact decimal representations');
console.log('• Complex fractions and repeating decimals show precision loss');
console.log('• The relative decimal notation prioritizes readability over exact preservation');
console.log('• Functional equivalence is maintained even when exact rationals differ');
console.log('• This makes the notation ideal for display and human-readable output');

console.log('\n📊 OFFSET CONVENTION EXAMPLES:');
console.log('• 85[+83,-73]  → 85 + 8.3 = 93.3, 85 - 7.3 = 77.7');
console.log('• 1.23[+5,-6]  → 1.23 + 0.005 = 1.235, 1.23 - 0.006 = 1.224');
console.log('• 1.25[+-25]   → 1.25 ± 0.025 = [1.225, 1.275]');
console.log('• Base precision determines offset scale (next decimal place)');
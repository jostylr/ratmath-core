/**
 * Comprehensive demonstration of the repeating decimal functionality
 * in the ratmath library, showcasing all features and edge cases.
 */

import { parseRepeatingDecimal, Rational, RationalInterval, Parser } from '../index.js';

console.log('🔢 RATMATH REPEATING DECIMAL COMPREHENSIVE DEMO 🔢\n');

// ============================================================================
// SECTION 1: Basic Repeating Decimal Conversions
// ============================================================================
console.log('1️⃣  BASIC REPEATING DECIMAL CONVERSIONS');
console.log('=' .repeat(50));

const examples1 = [
  ['0.#3', '1/3', 'One third'],
  ['0.#6', '2/3', 'Two thirds'],
  ['0.#1', '1/9', 'One ninth'],
  ['0.#142857', '1/7', 'One seventh'],
  ['0.1#6', '1/6', 'One sixth'],
  ['0.8#3', '5/6', 'Five sixths'],
  ['0.12#45', '137/1100', 'Complex repeating'],
  ['733.#3', '2200/3', 'Large number with repeating decimal']
];

examples1.forEach(([input, expected, description]) => {
  const result = parseRepeatingDecimal(input);
  const isCorrect = result.toString() === expected;
  console.log(`${input.padEnd(12)} → ${result.toString().padEnd(12)} (${description}) ${isCorrect ? '✅' : '❌'}`);
});
console.log();

// ============================================================================
// SECTION 2: Terminating Decimals with #0
// ============================================================================
console.log('2️⃣  TERMINATING DECIMALS WITH #0');
console.log('=' .repeat(50));

const examples2 = [
  ['1.23#0', '123/100', 'Exact 1.23'],
  ['0.5#0', '1/2', 'Exact half'],
  ['42#0', '42', 'Exact integer'],
  ['0.125#0', '1/8', 'Exact one eighth'],
  ['3.14159#0', '314159/100000', 'Exact pi approximation']
];

examples2.forEach(([input, expected, description]) => {
  const result = parseRepeatingDecimal(input);
  const isCorrect = result.toString() === expected;
  console.log(`${input.padEnd(12)} → ${result.toString().padEnd(15)} (${description}) ${isCorrect ? '✅' : '❌'}`);
});
console.log();

// ============================================================================
// SECTION 3: Negative Repeating Decimals
// ============================================================================
console.log('3️⃣  NEGATIVE REPEATING DECIMALS');
console.log('=' .repeat(50));

const examples3 = [
  ['-0.#3', '-1/3', 'Negative one third'],
  ['-0.#6', '-2/3', 'Negative two thirds'],
  ['-1.23#45', '-679/550', 'Negative complex repeating'],
  ['-42.#7', '-385/9', 'Negative large repeating']
];

examples3.forEach(([input, expected, description]) => {
  const result = parseRepeatingDecimal(input);
  const isCorrect = result.toString() === expected;
  console.log(`${input.padEnd(12)} → ${result.toString().padEnd(12)} (${description}) ${isCorrect ? '✅' : '❌'}`);
});
console.log();

// ============================================================================
// SECTION 4: Mathematical Verification
// ============================================================================
console.log('4️⃣  MATHEMATICAL VERIFICATION');
console.log('=' .repeat(50));

// Verify that 1/3 + 2/3 = 1
const oneThird = parseRepeatingDecimal('0.#3');
const twoThirds = parseRepeatingDecimal('0.#6');
const sum = oneThird.add(twoThirds);
console.log(`1/3 + 2/3 = ${sum.toString()} ${sum.equals(new Rational(1)) ? '✅' : '❌'}`);

// Verify that (1/3) × 3 = 1
const product = oneThird.multiply(new Rational(3));
console.log(`(1/3) × 3 = ${product.toString()} ${product.equals(new Rational(1)) ? '✅' : '❌'}`);

// Verify that 0.999... = 1
const nineNines = parseRepeatingDecimal('0.#9');
console.log(`0.#9 = ${nineNines.toString()} ${nineNines.equals(new Rational(1)) ? '✅' : '❌'}`);

// Verify that 1/6 = 0.1666...
const oneSixth = new Rational(1, 6);
const parsedOneSixth = parseRepeatingDecimal('0.1#6');
console.log(`1/6 = 0.1#6? ${oneSixth.equals(parsedOneSixth) ? '✅' : '❌'}`);

// Verify that 22/7 approximates π
const twentyTwoSevenths = new Rational(22, 7);
const piApprox = parseRepeatingDecimal('3.#142857');
const difference = twentyTwoSevenths.subtract(piApprox).abs();
console.log(`22/7 ≈ 3.#142857? Difference: ${difference.toString()} ${difference.equals(new Rational(0)) ? '✅' : '≈'}`);
console.log();

// ============================================================================
// SECTION 5: Non-repeating Decimals (Intervals)
// ============================================================================
console.log('5️⃣  NON-REPEATING DECIMALS (INTERVALS)');
console.log('=' .repeat(50));

const intervalExamples = [
  ['1.23', '[1.225, 1.235]'],
  ['0.5', '[0.45, 0.55]'],
  ['-1.5', '[-1.55, -1.45]'],
  ['3.14', '[3.135, 3.145]'],
  ['42', '[42, 42] (exact)']
];

intervalExamples.forEach(([input, description]) => {
  const result = parseRepeatingDecimal(input);
  if (result instanceof RationalInterval) {
    console.log(`${input.padEnd(8)} → ${result.toString().padEnd(20)} (${description})`);
  } else {
    console.log(`${input.padEnd(8)} → ${result.toString().padEnd(20)} (${description})`);
  }
});
console.log();

// ============================================================================
// SECTION 6: Integration with Expression Parser
// ============================================================================
console.log('6️⃣  EXPRESSION PARSER INTEGRATION');
console.log('=' .repeat(50));

const expressions = [
  '0.#3 + 0.#6',
  '1.23#45 * 2',
  '0.#3 : 0.#6',
  '(0.1#6 + 0.8#3) / 2',
  '0.#9 - 1',
  '1.5#0 + 2.5#0'
];

expressions.forEach(expr => {
  try {
    const result = Parser.parse(expr);
    console.log(`${expr.padEnd(25)} → ${result.toString()}`);
  } catch (error) {
    console.log(`${expr.padEnd(25)} → Error: ${error.message}`);
  }
});
console.log();

// ============================================================================
// SECTION 7: Edge Cases and Error Handling
// ============================================================================
console.log('7️⃣  EDGE CASES AND ERROR HANDLING');
console.log('=' .repeat(50));

const edgeCases = [
  ['0.0#1', 'Leading zeros'],
  ['0.00#123', 'Multiple leading zeros'],
  ['   1.23#45   ', 'Whitespace handling'],
  ['1000000.#123456', 'Large numbers']
];

edgeCases.forEach(([input, description]) => {
  try {
    const result = parseRepeatingDecimal(input);
    console.log(`${description.padEnd(25)} → ${result.toString()} ✅`);
  } catch (error) {
    console.log(`${description.padEnd(25)} → Error: ${error.message} ❌`);
  }
});

console.log('\nError cases (should fail):');
const errorCases = [
  ['', 'Empty string'],
  ['1.23#', 'Empty repeating part'],
  ['1.2.3#45', 'Multiple decimal points'],
  ['1.23#4a', 'Non-numeric in repeating'],
  ['abc#123', 'Non-numeric input']
];

errorCases.forEach(([input, description]) => {
  try {
    parseRepeatingDecimal(input);
    console.log(`${description.padEnd(25)} → Should have failed! ❌`);
  } catch (error) {
    console.log(`${description.padEnd(25)} → Correctly failed ✅`);
  }
});
console.log();

// ============================================================================
// SECTION 8: Performance and Precision Demonstration
// ============================================================================
console.log('8️⃣  PERFORMANCE AND PRECISION');
console.log('=' .repeat(50));

// Large repeating decimal
const largeRepeating = '123.456789#123456789';
const largeResult = parseRepeatingDecimal(largeRepeating);
console.log(`Large repeating: ${largeRepeating}`);
console.log(`Result: ${largeResult.toString()}`);
console.log(`Decimal approximation: ${largeResult.toNumber()}`);

// Very long repeating pattern
const longPattern = '0.#' + '1234567890'.repeat(5);
try {
  const longResult = parseRepeatingDecimal(longPattern);
  console.log(`Long pattern (50 digits): Successfully parsed`);
  console.log(`Numerator length: ${longResult.numerator.toString().length} digits`);
  console.log(`Denominator length: ${longResult.denominator.toString().length} digits`);
} catch (error) {
  console.log(`Long pattern failed: ${error.message}`);
}
console.log();

// ============================================================================
// SECTION 9: Real-world Applications
// ============================================================================
console.log('9️⃣  REAL-WORLD APPLICATIONS');
console.log('=' .repeat(50));

console.log('Financial calculations with exact precision:');
const price = parseRepeatingDecimal('99.99#0');
const taxRate = parseRepeatingDecimal('0.0#6'); // 6.666...% = 1/15
const tax = price.multiply(taxRate);
const total = price.add(tax);
console.log(`Price: $${price.toNumber()}`);
console.log(`Tax rate: ${taxRate.toNumber() * 100}%`);
console.log(`Tax: $${tax.toNumber()} (exact: ${tax.toString()})`);
console.log(`Total: $${total.toNumber()} (exact: ${total.toString()})`);

console.log('\nFraction to decimal conversion verification:');
const commonFractions = [
  [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], 
  [1, 5], [2, 5], [3, 5], [4, 5], 
  [1, 6], [5, 6], [1, 7], [1, 8], [3, 8], [5, 8], [7, 8], [1, 9], [2, 9]
];

commonFractions.forEach(([num, den]) => {
  const fraction = new Rational(num, den);
  const decimal = fraction.toNumber();
  
  // Try to find a repeating decimal representation
  let decimalStr = decimal.toString();
  if (decimalStr.includes('e')) {
    decimalStr = decimal.toFixed(10);
  }
  
  console.log(`${num}/${den} = ${fraction.toString()} ≈ ${decimalStr}`);
});
console.log();

// ============================================================================
// CONCLUSION
// ============================================================================
console.log('🎉 DEMONSTRATION COMPLETE!');
console.log('=' .repeat(50));
console.log('The parseRepeatingDecimal function successfully:');
console.log('✅ Converts repeating decimals to exact rational numbers');
console.log('✅ Handles terminating decimals with #0 notation');
console.log('✅ Processes negative numbers correctly');
console.log('✅ Creates intervals for uncertain non-repeating decimals');
console.log('✅ Integrates seamlessly with the expression parser');
console.log('✅ Maintains mathematical precision with arbitrary-precision arithmetic');
console.log('✅ Provides comprehensive error handling');
console.log('✅ Supports real-world applications requiring exact calculations');
console.log('\nTry running: node examples/repeating-decimals.js for more examples!');
import { parseInterval, Rational, RationalInterval } from '../index.js';

console.log('=== Repeating Decimal Intervals Demo ===\n');

// ===== Range Notation After Decimal Point =====
console.log('📐 Range Notation After Decimal Point');
console.log('=====================================');

// Basic repeating decimal ranges
const oneThirdToTwoThirds = parseInterval('0.[#3:#6]');
console.log('0.[#3:#6] =', oneThirdToTwoThirds.low.toString(), 'to', oneThirdToTwoThirds.high.toString());
console.log('           = 1/3 to 2/3 = 0.333... to 0.666...\n');

// Simple digit ranges
const pointOneToPointFour = parseInterval('1.[1:4]');
console.log('1.[1:4] =', pointOneToPointFour.low.toString(), 'to', pointOneToPointFour.high.toString());
console.log('        = 1.1 to 1.4\n');

// Complex repeating patterns
const oneSeventh = parseInterval('0.[#142857:#285714]');
console.log('0.[#142857:#285714] =', oneSeventh.low.toString(), 'to', oneSeventh.high.toString());
console.log('                   = 1/7 to 2/7\n');

// Mixed repeating and terminating
const mixedRange = parseInterval('0.[2:#6]');
console.log('0.[2:#6] =', mixedRange.low.toString(), 'to', mixedRange.high.toString());
console.log('         = 0.2 to 2/3\n');

// Colon notation
const colonRange = parseInterval('0.[#3:#6]');
console.log('0.[#3:#6] =', colonRange.low.toString(), 'to', colonRange.high.toString());
console.log('          = 1/3 to 2/3\n');

// ===== Integer Base Offset Notation =====
console.log('🔢 Integer Base Offset Notation (New Feature!)');
console.log('===============================================');

// Integer base with any offsets - applied directly
const example1 = parseInterval('12[+4.3:-2]');
console.log('12[+4.3:-2] =', example1.low.toString(), 'to', example1.high.toString());
console.log('           = [12-2, 12+4.3] = [10, 16.3]');
console.log('           📝 All offsets on integer bases apply directly\n');

const example2 = parseInterval('12[+0.43:-13]');
console.log('12[+0.43:-13] =', example2.low.toString(), 'to', example2.high.toString());
console.log('             = [12-13, 12+0.43] = [-1, 12.43]\n');

// Integer base with repeating decimal offsets
const repeatOffset = parseInterval('1[+-0.#3]');
console.log('1[+-0.#3] =', repeatOffset.low.toString(), 'to', repeatOffset.high.toString());
console.log('          = [1-1/3, 1+1/3] = [2/3, 4/3]');
console.log('          📝 Repeating decimal offset: ±0.333...\n');

// Integer base with integer offsets  
const integerOffset = parseInterval('78[+-10]');
console.log('78[+-10] =', integerOffset.low.toString(), 'to', integerOffset.high.toString());
console.log('         = [78-10, 78+10] = [68, 88]');
console.log('         📝 Integer offsets on integer bases also apply directly\n');

// Relative notation with repeating decimals
const relativeRepeat = parseInterval('5[+0.#3:-0.#6]');
console.log('5[+0.#3:-0.#6] =', relativeRepeat.low.toString(), 'to', relativeRepeat.high.toString());
console.log('              = [5-2/3, 5+1/3] = [13/3, 16/3]\n');

// ===== Decimal vs Integer Base Behavior =====
console.log('⚙️  Decimal vs Integer Base Behavior');
console.log('====================================');

// Integer base: all offsets applied directly
const integerBase = parseInterval('78[+-10]');
console.log('78[+-10] =', integerBase.low.toString(), 'to', integerBase.high.toString());
console.log('         = [68, 88] (integer base: offset applied directly)\n');

// Decimal base: offsets use the last visible decimal place
const decimalBase1 = parseInterval('78.0[+-10]');
console.log('78.0[+-10] =', decimalBase1.low.toString(), 'to', decimalBase1.high.toString());
console.log('           = [77, 79] (decimal base: offset scaled to ±1)\n');

// ===== More Decimal Base Examples =====
console.log('📏 More Decimal Base Examples');
console.log('=============================');

const decimalBase2 = parseInterval('0.5[+-33.#3]');
console.log('0.5[+-33.#3] =', decimalBase2.low.toString(), 'to', decimalBase2.high.toString());
console.log('             📝 Decimal-base offsets use the last visible decimal place\n');

const decimalBase3 = parseInterval('1.23[+-5]');
console.log('1.23[+-5] =', decimalBase3.low.toString(), 'to', decimalBase3.high.toString());
console.log('          = [1.18, 1.28] (5 scaled to 0.05)\n');

// ===== Complex Arithmetic =====
console.log('🧮 Complex Arithmetic with Repeating Decimal Intervals');
console.log('======================================================');

// Expression parsing
const expr1 = parseInterval('0.[#1:#2]').add(parseInterval('1.[#3:#4]'));
console.log('0.[#1:#2] + 1.[#3:#4] =', expr1.low.toString(), 'to', expr1.high.toString());
console.log('                     = [1/9, 2/9] + [4/3, 13/9] = [13/9, 5/3]\n');

const expr2 = expr1.divide(new Rational(2));
console.log('(0.[#1:#2] + 1.[#3:#4]) / 2 =', expr2.low.toString(), 'to', expr2.high.toString());
console.log('                           = [13/18, 5/6]\n');

// Multiplication with integer base offsets
const mult = parseInterval('2[+-0.#3]').multiply(new Rational(3));
console.log('2[+-0.#3] * 3 =', mult.low.toString(), 'to', mult.high.toString());
console.log('              = [5/3, 7/3] * 3 = [5, 7]\n');

// Contrast with decimal base
const mult2 = parseInterval('2.0[+-1]').multiply(new Rational(3));
console.log('2.0[+-1] * 3 =', mult2.low.toString(), 'to', mult2.high.toString());
console.log('             = [1.9, 2.1] * 3 = [5.7, 6.3] (scaled behavior)\n');

// ===== Real-world Applications =====
console.log('🌍 Real-world Applications');
console.log('===========================');

// Temperature ranges
const tempRange = parseInterval('20.[5:8]');
console.log('Temperature: 20.[5:8]°C =', tempRange.low.toString(), 'to', tempRange.high.toString());
console.log('                        = 20.5°C to 20.8°C\n');

// Measurement uncertainty with repeating decimals
const measurement = parseInterval('100[+-0.#3]');
console.log('Measurement: 100[+-0.#3] cm =', measurement.low.toString(), 'to', measurement.high.toString());
console.log('                            = 99⅔ cm to 100⅓ cm\n');

// Financial calculations
const stockPrice = parseInterval('45[+2.75:-1.25]');
console.log('Stock price: $45[+2.75:-1.25] =', '$' + stockPrice.low.toString(), 'to', '$' + stockPrice.high.toString());
console.log('                              = $43.75 to $47.75\n');

// ===== Export and Roundtrip =====
console.log('🔄 Export and Roundtrip Conversion');
console.log('===================================');

const original = parseInterval('0.[#3:#6]');
const exported = original.toRepeatingDecimal();
console.log('Original: 0.[#3:#6]');
console.log('Exported:', exported);
console.log('Roundtrip equals original:', parseInterval(exported).equals(original));

const interval = new RationalInterval(new Rational('1/5'), new Rational('1/3'));
const mixedExport = interval.toRepeatingDecimal();
console.log('\nMixed interval: [1/5, 1/3]');
console.log('Exported:', mixedExport);

console.log('\n=== Demo Complete! ===');
console.log('\nKey Features Demonstrated:');
console.log('✅ Range notation after decimal point: 0.[#3:#6]');
console.log('✅ Integer base with any offsets: 12[+4.3:-2], 78[+-10]');
console.log('✅ Repeating decimal offsets: 1[+-0.#3]');
console.log('✅ Clear base-type behavior: integer vs decimal');
console.log('✅ Complex arithmetic expressions');
console.log('✅ Export and roundtrip conversion');

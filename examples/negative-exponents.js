import { Integer, Rational } from '../index.js';

console.log('=== Negative Exponents with Integer Class ===\n');

// 1. Basic Negative Exponents
console.log('1. Basic Negative Exponents');
console.log('---------------------------');

const base2 = new Integer(2);
const base3 = new Integer(3);
const base5 = new Integer(5);

console.log(`2^(-1) = ${base2.pow(-1)} = ${base2.pow(-1).toNumber()}`);
console.log(`2^(-2) = ${base2.pow(-2)} = ${base2.pow(-2).toNumber()}`);
console.log(`2^(-3) = ${base2.pow(-3)} = ${base2.pow(-3).toNumber()}`);
console.log();

console.log(`3^(-1) = ${base3.pow(-1)} = ${base3.pow(-1).toNumber()}`);
console.log(`3^(-2) = ${base3.pow(-2)} = ${base3.pow(-2).toNumber()}`);
console.log();

console.log(`5^(-1) = ${base5.pow(-1)} = ${base5.pow(-1).toNumber()}`);
console.log(`5^(-2) = ${base5.pow(-2)} = ${base5.pow(-2).toNumber()}\n`);

// 2. Mathematical Properties
console.log('2. Mathematical Properties');
console.log('-------------------------');

const n = new Integer(4);
const positiveExp = n.pow(2);  // 4^2 = 16
const negativeExp = n.pow(-2); // 4^(-2) = 1/16

console.log(`${n}^2 = ${positiveExp} (${positiveExp.constructor.name})`);
console.log(`${n}^(-2) = ${negativeExp} (${negativeExp.constructor.name})`);

// Verify: n^k * n^(-k) = 1
const product = positiveExp.toRational().multiply(negativeExp);
console.log(`Verification: ${positiveExp} × ${negativeExp} = ${product}`);
console.log(`This equals 1: ${product.equals(new Rational(1))}\n`);

// 3. Large Integer Negative Exponents
console.log('3. Large Integer Negative Exponents');
console.log('-----------------------------------');

const large = new Integer(123);
const largeNegExp = large.pow(-1);
console.log(`${large}^(-1) = ${largeNegExp}`);
console.log(`As decimal: ${largeNegExp.toNumber()}\n`);

// 4. Fractional Results from Negative Exponents
console.log('4. Fractional Results');
console.log('--------------------');

const bases = [new Integer(2), new Integer(3), new Integer(4), new Integer(6), new Integer(10)];
const exponents = [-1, -2, -3];

bases.forEach(base => {
  console.log(`Base ${base}:`);
  exponents.forEach(exp => {
    const result = base.pow(exp);
    console.log(`  ${base}^(${exp}) = ${result} = ${result.toNumber()}`);
  });
  console.log();
});

// 5. Converting to Mixed Numbers
console.log('5. Mixed Number Representation');
console.log('------------------------------');

const examples = [
  { base: 3, exp: -1 },
  { base: 4, exp: -1 },
  { base: 2, exp: -3 },
  { base: 5, exp: -2 }
];

examples.forEach(({ base, exp }) => {
  const baseInt = new Integer(base);
  const result = baseInt.pow(exp);
  console.log(`${base}^(${exp}) = ${result} = ${result.toMixedString()}`);
});
console.log();

// 6. Scientific Calculations
console.log('6. Scientific Calculations');
console.log('--------------------------');

// Calculate 10^(-n) for scientific notation
console.log('Powers of 10 (scientific notation prefixes):');
for (let i = 1; i <= 6; i++) {
  const result = new Integer(10).pow(-i);
  const prefixes = ['deci', 'centi', 'milli', 'micro', 'nano', 'pico'];
  console.log(`10^(-${i}) = ${result} = ${result.toNumber()} (${prefixes[i-1]})`);
}
console.log();

// 7. Compound Interest / Decay Factors
console.log('7. Decay Factors');
console.log('----------------');

// Half-life calculations: (1/2)^n
const half = new Integer(2);
console.log('Half-life decay factors:');
for (let periods = 1; periods <= 5; periods++) {
  const remaining = half.pow(-periods);
  console.log(`After ${periods} half-life(s): (1/2)^${periods} = ${remaining} = ${remaining.toNumber()}`);
}
console.log();

// 8. Unit Conversions
console.log('8. Unit Conversions');
console.log('------------------');

// Converting to smaller units (using negative exponents)
const conversions = [
  { unit: 'meters to millimeters', factor: 1000, exp: -1 },
  { unit: 'kilograms to grams', factor: 1000, exp: -1 },
  { unit: 'hours to minutes', factor: 60, exp: -1 },
  { unit: 'feet to inches', factor: 12, exp: -1 }
];

conversions.forEach(({ unit, factor, exp }) => {
  const conversionFactor = new Integer(factor).pow(exp);
  console.log(`${unit}: multiply by ${factor}^(${exp}) = ${conversionFactor} = ${conversionFactor.toNumber()}`);
});
console.log();

// 9. Reciprocal Relationships
console.log('9. Reciprocal Relationships');
console.log('---------------------------');

const numbers = [2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log('Number\tReciprocal\tDecimal\t\tProduct');
console.log('------\t----------\t-------\t\t-------');

numbers.forEach(num => {
  const integer = new Integer(num);
  const reciprocal = integer.pow(-1);
  const product = integer.toRational().multiply(reciprocal);
  
  console.log(`${num}\t${reciprocal}\t\t${reciprocal.toNumber().toFixed(6)}\t${product}`);
});
console.log();

// 10. Error Cases
console.log('10. Error Cases');
console.log('---------------');

// Zero to negative power
try {
  const zero = new Integer(0);
  const impossible = zero.pow(-1);
} catch (e) {
  console.log(`Error: ${e.message}`);
}

// Zero to power zero
try {
  const zero = new Integer(0);
  const undefined = zero.pow(0);
} catch (e) {
  console.log(`Error: ${e.message}`);
}

console.log('\n=== End of Negative Exponents Demo ===');
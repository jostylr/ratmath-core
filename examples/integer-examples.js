import { Integer, Rational } from '../index.js';

console.log('=== Integer Class Examples ===\n');

// Basic construction
console.log('1. Basic Construction:');
const a = new Integer(42);
const b = new Integer('123456789012345678901234567890'); // Large integer
const c = new Integer(-17);
console.log(`a = ${a}`);
console.log(`b = ${b}`);
console.log(`c = ${c}\n`);

// Arithmetic operations
console.log('2. Arithmetic Operations:');
const x = new Integer(15);
const y = new Integer(4);

console.log(`x = ${x}, y = ${y}`);
console.log(`x + y = ${x.add(y)}`);
console.log(`x - y = ${x.subtract(y)}`);
console.log(`x * y = ${x.multiply(y)}`);

// Division - key feature: returns Integer or Rational
const evenDivision = x.divide(new Integer(3)); // 15/3 = 5 (exact)
const unevenDivision = x.divide(y); // 15/4 (not exact)
console.log(`x / 3 = ${evenDivision} (${evenDivision.constructor.name})`);
console.log(`x / y = ${unevenDivision} (${unevenDivision.constructor.name})`);

console.log(`x % y = ${x.modulo(y)}`);
console.log(`x^3 = ${x.pow(3)}\n`);

// Comparison operations
console.log('3. Comparison Operations:');
const p = new Integer(10);
const q = new Integer(20);
console.log(`p = ${p}, q = ${q}`);
console.log(`p < q: ${p.lessThan(q)}`);
console.log(`p > q: ${p.greaterThan(q)}`);
console.log(`p == p: ${p.equals(p)}`);
console.log(`p.compareTo(q): ${p.compareTo(q)}\n`);

// Utility methods
console.log('4. Utility Methods:');
const n = new Integer(-24);
const m = new Integer(18);
console.log(`n = ${n}, m = ${m}`);
console.log(`|n| = ${n.abs()}`);
console.log(`sign(n) = ${n.sign()}`);
console.log(`n is even: ${n.abs().isEven()}`);
console.log(`n is odd: ${n.abs().isOdd()}`);
console.log(`gcd(|n|, m) = ${n.abs().gcd(m)}`);
console.log(`lcm(|n|, m) = ${n.abs().lcm(m)}\n`);

// Large number arithmetic
console.log('5. Large Number Arithmetic:');
const large1 = new Integer('999999999999999999999999999999');
const large2 = new Integer('111111111111111111111111111111');
console.log(`large1 = ${large1}`);
console.log(`large2 = ${large2}`);
console.log(`large1 + large2 = ${large1.add(large2)}`);
console.log(`large1 * large2 = ${large1.multiply(large2)}\n`);

// Conversion methods
console.log('6. Conversion Methods:');
const int42 = new Integer(42);
console.log(`Integer 42 as string: "${int42.toString()}"`);
console.log(`Integer 42 as number: ${int42.toNumber()}`);
console.log(`Integer 42 as Rational: ${int42.toRational()}\n`);

// Static methods
console.log('7. Static Methods:');
const fromNumber = Integer.from(100);
const fromString = Integer.from('200');
const fromBigInt = Integer.from(300n);
console.log(`Integer.from(100): ${fromNumber}`);
console.log(`Integer.from('200'): ${fromString}`);
console.log(`Integer.from(300n): ${fromBigInt}`);

const wholeRational = new Rational(5, 1);
const intFromRational = Integer.fromRational(wholeRational);
console.log(`Integer.fromRational(5/1): ${intFromRational}\n`);

// Working with Rational results from division
console.log('8. Division Results and Rational Numbers:');
const dividend = new Integer(17);
const divisor = new Integer(5);
const quotient = dividend.divide(divisor);

console.log(`${dividend} ÷ ${divisor} = ${quotient}`);
if (quotient instanceof Rational) {
  console.log(`  As mixed number: ${quotient.toMixedString()}`);
  console.log(`  As decimal: ${quotient.toNumber()}`);
  console.log(`  Numerator: ${quotient.numerator}`);
  console.log(`  Denominator: ${quotient.denominator}`);
}

// Chain operations
console.log('\n9. Chained Operations:');
const start = new Integer(10);
const result = start
  .add(new Integer(5))      // 15
  .multiply(new Integer(2)) // 30
  .subtract(new Integer(6)) // 24
  .divide(new Integer(3));  // 8 (exact division)

console.log(`((10 + 5) * 2 - 6) / 3 = ${result}`);

// Error handling
console.log('\n10. Error Handling:');
try {
  const zero = new Integer(0);
  const error = new Integer(5).divide(zero);
} catch (e) {
  console.log(`Division by zero error: ${e.message}`);
}

// Negative exponents return Rational numbers
const negPow = new Integer(2).pow(-1);
console.log(`2^(-1) = ${negPow} (${negPow.constructor.name})`);

const negPow2 = new Integer(3).pow(-2);
console.log(`3^(-2) = ${negPow2} (${negPow2.constructor.name})`);

try {
  const zeroPow = new Integer(0).pow(-1);
} catch (e) {
  console.log(`Zero negative exponent error: ${e.message}`);
}

try {
  const invalid = new Integer('not-a-number');
} catch (e) {
  console.log(`Invalid format error: ${e.message}`);
}

console.log('\n=== End of Integer Examples ===');
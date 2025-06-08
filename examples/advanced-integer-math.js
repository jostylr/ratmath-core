import { Integer, Rational } from '../index.js';

console.log('=== Advanced Integer Mathematics ===\n');

// 1. Euclidean Algorithm Visualization
console.log('1. Euclidean Algorithm for GCD');
console.log('-------------------------------');

function euclideanGCD(a, b, verbose = true) {
    if (verbose) console.log(`Finding GCD(${a}, ${b}):`);
    
    while (!b.isZero()) {
        const quotient = a.divide(b);
        const remainder = a.modulo(b);
        
        if (verbose) {
            // For display purposes, show integer division
            const intQuotient = new Integer(a.value / b.value);
            console.log(`  ${a} = ${b} × ${intQuotient} + ${remainder}`);
        }
        
        a = b;
        b = remainder;
    }
    
    if (verbose) console.log(`  GCD = ${a}\n`);
    return a;
}

euclideanGCD(new Integer(1071), new Integer(462));
euclideanGCD(new Integer(48), new Integer(18));

// 2. Fibonacci Sequence with Exact Arithmetic
console.log('2. Fibonacci Sequence');
console.log('---------------------');

function fibonacci(n) {
    if (n <= 1) return new Integer(n);
    
    let a = new Integer(0);
    let b = new Integer(1);
    
    for (let i = 2; i <= n; i++) {
        const temp = a.add(b);
        a = b;
        b = temp;
    }
    
    return b;
}

console.log('First 15 Fibonacci numbers:');
for (let i = 0; i < 15; i++) {
    const fib = fibonacci(i);
    console.log(`F(${i}) = ${fib}`);
}

// Golden ratio approximation using consecutive Fibonacci numbers
const f20 = fibonacci(20);
const f19 = fibonacci(19);
const goldenRatio = f20.divide(f19);
console.log(`\nGolden ratio approximation: F(20)/F(19) = ${goldenRatio}`);
console.log(`As decimal: ${goldenRatio.toNumber()}`);
console.log(`Actual golden ratio: ${(1 + Math.sqrt(5)) / 2}\n`);

// 3. Prime Factorization
console.log('3. Prime Factorization');
console.log('----------------------');

function primeFactorization(n) {
    const factors = [];
    let num = new Integer(n.toString());
    let divisor = new Integer(2);
    
    while (divisor.multiply(divisor).lessThanOrEqual(num)) {
        while (num.modulo(divisor).isZero()) {
            factors.push(divisor);
            const quotient = num.divide(divisor);
            num = quotient instanceof Integer ? quotient : Integer.fromRational(quotient);
        }
        divisor = divisor.add(new Integer(1));
    }
    
    if (num.greaterThan(new Integer(1))) {
        factors.push(num);
    }
    
    return factors;
}

const numbers = [60, 84, 100, 144];
numbers.forEach(num => {
    const factors = primeFactorization(new Integer(num));
    console.log(`${num} = ${factors.join(' × ')}`);
});
console.log();

// 4. Modular Arithmetic
console.log('4. Modular Arithmetic');
console.log('---------------------');

function modularExponentiation(base, exponent, modulus) {
    let result = new Integer(1);
    base = base.modulo(modulus);
    
    while (exponent.greaterThan(new Integer(0))) {
        if (exponent.isOdd()) {
            result = result.multiply(base).modulo(modulus);
        }
        exponent = new Integer(exponent.value >> 1n);
        base = base.multiply(base).modulo(modulus);
    }
    
    return result;
}

const base = new Integer(3);
const exp = new Integer(10);
const mod = new Integer(7);
const result = modularExponentiation(base, exp, mod);
console.log(`${base}^${exp} ≡ ${result} (mod ${mod})`);

// Fermat's Little Theorem verification: a^(p-1) ≡ 1 (mod p) for prime p
const p = new Integer(13); // prime
const a = new Integer(5);
const fermatsResult = modularExponentiation(a, p.subtract(new Integer(1)), p);
console.log(`Fermat's Little Theorem: ${a}^(${p}-1) ≡ ${fermatsResult} (mod ${p})\n`);

// 5. Perfect Numbers
console.log('5. Perfect Numbers');
console.log('------------------');

function isPerfect(n) {
    let sum = new Integer(1); // 1 is always a divisor
    const half = new Integer(n.value / 2n);
    
    for (let i = new Integer(2); i.lessThanOrEqual(half); i = i.add(new Integer(1))) {
        if (n.modulo(i).isZero()) {
            sum = sum.add(i);
        }
    }
    
    return sum.equals(n);
}

console.log('Perfect numbers up to 1000:');
for (let i = 2; i <= 1000; i++) {
    const num = new Integer(i);
    if (isPerfect(num)) {
        console.log(`${num} is perfect`);
    }
}
console.log();

// 6. Collatz Conjecture
console.log('6. Collatz Conjecture');
console.log('---------------------');

function collatzSequence(n, maxSteps = 50) {
    const sequence = [n];
    let current = new Integer(n.toString());
    let steps = 0;
    
    while (!current.equals(new Integer(1)) && steps < maxSteps) {
        if (current.isEven()) {
            const quotient = current.divide(new Integer(2));
            current = quotient instanceof Integer ? quotient : Integer.fromRational(quotient);
        } else {
            current = current.multiply(new Integer(3)).add(new Integer(1));
        }
        sequence.push(current);
        steps++;
    }
    
    return { sequence, steps };
}

const testNumbers = [3, 7, 27];
testNumbers.forEach(num => {
    const { sequence, steps } = collatzSequence(new Integer(num));
    console.log(`Collatz(${num}): ${sequence.slice(0, 10).join(' → ')}${sequence.length > 10 ? '...' : ''}`);
    console.log(`  Steps to reach 1: ${steps}\n`);
});

// 7. Pascal's Triangle
console.log('7. Pascal\'s Triangle (Binomial Coefficients)');
console.log('---------------------------------------------');

function binomialCoefficient(n, k) {
    if (k.greaterThan(n)) return new Integer(0);
    if (k.isZero() || k.equals(n)) return new Integer(1);
    
    // Use the identity C(n,k) = C(n,k-1) * (n-k+1) / k
    let result = new Integer(1);
    for (let i = new Integer(0); i.lessThan(k); i = i.add(new Integer(1))) {
        result = result.multiply(n.subtract(i));
        const quotient = result.divide(i.add(new Integer(1)));
        result = quotient instanceof Integer ? quotient : Integer.fromRational(quotient);
    }
    
    return result;
}

console.log('Pascal\'s Triangle (first 8 rows):');
for (let row = 0; row < 8; row++) {
    const rowValues = [];
    for (let col = 0; col <= row; col++) {
        const coeff = binomialCoefficient(new Integer(row), new Integer(col));
        rowValues.push(coeff.toString());
    }
    const padding = ' '.repeat((8 - row) * 2);
    console.log(padding + rowValues.join('   '));
}
console.log();

// 8. Catalan Numbers
console.log('8. Catalan Numbers');
console.log('------------------');

function catalanNumber(n) {
    if (n <= 1) return new Integer(1);
    
    // C_n = (2n)! / ((n+1)! * n!)
    // Or using the recursive formula: C_n = Σ(C_i * C_(n-1-i)) for i=0 to n-1
    const twoN = new Integer(2 * n);
    const nPlusOne = new Integer(n + 1);
    const nInt = new Integer(n);
    
    const numerator = binomialCoefficient(twoN, nInt);
    const quotient = numerator.divide(nPlusOne);
    return quotient instanceof Integer ? quotient : Integer.fromRational(quotient);
}

console.log('First 10 Catalan numbers:');
for (let i = 0; i < 10; i++) {
    const catalan = catalanNumber(i);
    console.log(`C(${i}) = ${catalan}`);
}
console.log();

// 9. Digital Root and Digital Sum
console.log('9. Digital Properties');
console.log('---------------------');

function digitalSum(n) {
    let sum = new Integer(0);
    let num = new Integer(n.toString());
    
    while (num.greaterThan(new Integer(0))) {
        const digit = num.modulo(new Integer(10));
        sum = sum.add(digit);
        // Integer division by 10 (floor division)
        num = new Integer(num.value / 10n);
    }
    
    return sum;
}

function digitalRoot(n) {
    let current = new Integer(n.toString());
    
    while (current.greaterThanOrEqual(new Integer(10))) {
        current = digitalSum(current);
    }
    
    return current;
}

const testNums = [123, 9875, 999999];
testNums.forEach(num => {
    const n = new Integer(num);
    const sum = digitalSum(n);
    const root = digitalRoot(n);
    console.log(`${num}: digital sum = ${sum}, digital root = ${root}`);
});
console.log();

// 10. Harmonic Numbers (as exact rationals)
console.log('10. Harmonic Numbers');
console.log('--------------------');

function harmonicNumber(n) {
    let sum = new Rational(0);
    
    for (let i = 1; i <= n; i++) {
        sum = sum.add(new Rational(1, i));
    }
    
    return sum;
}

console.log('First 10 harmonic numbers:');
for (let i = 1; i <= 10; i++) {
    const harmonic = harmonicNumber(i);
    console.log(`H(${i}) = ${harmonic} ≈ ${harmonic.toNumber().toFixed(6)}`);
}

console.log('\n=== End of Advanced Mathematics ===');
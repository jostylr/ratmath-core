import { Rational } from './rational.js';
import { RationalInterval } from './rational-interval.js';
import { Integer } from './integer.js';

const DEFAULT_PRECISION = -6; // 10^-6

// Continued fraction coefficients for mathematical constants
const LN2_CF = [0, 1, 2, 3, 1, 6, 3, 1, 1, 2, 1, 1, 6, 1, 6, 1, 1, 4, 1, 2, 4, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const PI_CF = [3, 7, 15, 1, 292, 1, 1, 1, 2, 1, 3, 1, 14, 2, 1, 1, 2, 2, 2, 2, 1, 84, 2, 1, 1, 15, 3, 13, 1, 4, 2, 6, 6, 99, 1, 2, 2, 6, 3, 5, 1, 1, 6, 8, 1, 7, 1, 2, 3, 7, 1, 2, 1, 1, 12, 1, 1, 1, 3, 1, 1, 8, 1, 1, 2, 1, 6];
const E_CF = [2, 1, 2, 1, 1, 4, 1, 1, 6, 1, 1, 8, 1, 1, 10, 1, 1, 12, 1, 1, 14, 1, 1, 16, 1, 1, 18, 1, 1, 20, 1, 1, 22, 1, 1, 24, 1, 1, 26, 1, 1, 28, 1, 1, 30, 1, 1, 32, 1, 1, 34, 1, 1, 36, 1, 1, 38, 1, 1, 40];

// Helper function to compute continued fraction approximation
function continuedFractionApproximation(coefficients, terms) {
    if (terms === 0 || coefficients.length === 0) {
        return new Rational(0);
    }
    
    let num = new Integer(1);
    let den = new Integer(0);
    
    for (let i = Math.min(terms, coefficients.length) - 1; i >= 0; i--) {
        [num, den] = [den.add(num.multiply(new Integer(coefficients[i]))), num];
    }
    
    return new Rational(num.value, den.value);
}

// Helper functions for Rational checks
function isZero(rational) {
    return rational.numerator === 0n;
}

function isNegative(rational) {
    return rational.numerator < 0n;
}

function isPositive(rational) {
    return rational.numerator > 0n;
}

// Helper function to get floor of a rational
function floor(rational) {
    if (rational.denominator === 1n) {
        return new Rational(rational.numerator);
    }
    
    // For positive numbers: floor(a/b) = a // b (integer division)
    // For negative numbers: floor(a/b) = (a // b) - 1 if there's a remainder
    const quotient = rational.numerator / rational.denominator;
    const remainder = rational.numerator % rational.denominator;
    
    if (remainder === 0n || rational.numerator >= 0n) {
        return new Rational(quotient);
    } else {
        return new Rational(quotient - 1n);
    }
}

// Helper function to round a rational to nearest integer
function round(rational) {
    if (rational.denominator === 1n) {
        return new Rational(rational.numerator);
    }
    
    // Get the fractional part
    const wholePart = floor(rational);
    const fractionalPart = rational.subtract(wholePart);
    
    // If fractional part >= 0.5, round up; otherwise round down
    const half = new Rational(1, 2);
    if (fractionalPart.compareTo(half) >= 0) {
        return wholePart.add(new Rational(1));
    } else {
        return wholePart;
    }
}

// Helper function to parse precision specification
function parsePrecision(precision) {
    if (precision === undefined) {
        return { epsilon: new Rational(1, 1000000), negative: true }; // 10^-6
    }
    
    if (precision < 0) {
        // Negative means 10^precision
        const denominator = new Integer(10).pow(-precision);
        return { epsilon: new Rational(1, denominator.value), negative: true };
    } else {
        // Positive means 1/precision
        return { epsilon: new Rational(1, precision), negative: false };
    }
}

// Helper function to compute factorial
function factorial(n) {
    let result = new Integer(1);
    for (let i = 2; i <= n; i++) {
        result = result.multiply(i);
    }
    return result;
}

// Helper function to compute power of rational number
function rationalPower(base, exponent) {
    if (exponent === 0) return new Rational(1);
    
    let result = base;
    let n = Math.abs(exponent);
    
    for (let i = 1; i < n; i++) {
        result = result.multiply(base);
    }
    
    if (exponent < 0) {
        result = result.reciprocal();
    }
    
    return result;
}

// Get constant with specified precision
function getConstant(cfCoefficients, precision) {
    const { epsilon } = parsePrecision(precision);
    
    let terms = 2;
    let prev = continuedFractionApproximation(cfCoefficients, terms - 1);
    let curr = continuedFractionApproximation(cfCoefficients, terms);
    
    while (terms < cfCoefficients.length && curr.subtract(prev).abs().compareTo(epsilon) > 0) {
        terms++;
        prev = curr;
        curr = continuedFractionApproximation(cfCoefficients, terms);
    }
    
    // Create interval containing the true value
    const lower = prev.compareTo(curr) < 0 ? prev : curr;
    const upper = prev.compareTo(curr) > 0 ? prev : curr;
    
    return new RationalInterval(lower, upper);
}

// Constants
export const PI = (precision) => getConstant(PI_CF, precision);
export const E = (precision) => getConstant(E_CF, precision);

// EXP function
export function EXP(x, precision) {
    if (x === undefined) {
        // Return E constant
        return E(precision);
    }
    
    const { epsilon } = parsePrecision(precision);
    
    // Handle RationalInterval input
    if (x instanceof RationalInterval) {
        const lower = EXP(x.low, precision);
        const upper = EXP(x.high, precision);
        return new RationalInterval(lower.low, upper.high);
    }
    
    // Convert to Rational if needed
    if (!(x instanceof Rational)) {
        x = new Rational(x);
    }
    
    // Special case for x = 0
    if (isZero(x)) {
        return new RationalInterval(new Rational(1), new Rational(1));
    }
    
    // Decompose x = k*ln(2) + r where r in [0, ln(2))
    const ln2Interval = getConstant(LN2_CF, precision);
    const ln2Approx = ln2Interval.low.add(ln2Interval.high).divide(new Rational(2));
    
    const k = floor(x.divide(ln2Approx));
    const r = x.subtract(k.multiply(ln2Approx));
    
    // Compute e^r using Taylor series
    let sum = new Rational(1);
    let term = new Rational(1);
    let n = 1;
    
    while (term.abs().compareTo(epsilon) > 0) {
        term = term.multiply(r).divide(new Rational(n));
        sum = sum.add(term);
        n++;
    }
    
    // Add error bounds
    const errorBound = term.abs().multiply(new Rational(2));
    const expR = new RationalInterval(
        sum.subtract(errorBound),
        sum.add(errorBound)
    );
    
    // Multiply by 2^k
    if (isZero(k)) {
        return expR;
    }
    
    const twoToK = new Rational(new Integer(2).pow(k.numerator >= 0n ? k.numerator : -k.numerator).value, 1);
    if (isNegative(k)) {
        return expR.divide(twoToK);
    } else {
        return expR.multiply(twoToK);
    }
}

// LN function (natural logarithm)
export function LN(x, precision) {
    const { epsilon } = parsePrecision(precision);
    
    // Handle RationalInterval input
    if (x instanceof RationalInterval) {
        if (isNegative(x.low) || isZero(x.low)) {
            throw new Error("LN: argument must be positive");
        }
        const lower = LN(x.low, precision);
        const upper = LN(x.high, precision);
        return new RationalInterval(lower.low, upper.high);
    }
    
    // Convert to Rational if needed
    if (!(x instanceof Rational)) {
        x = new Rational(x);
    }
    
    if (isNegative(x) || isZero(x)) {
        throw new Error("LN: argument must be positive");
    }
    
    // Special case for x = 1
    if (x.equals(new Rational(1))) {
        return new RationalInterval(new Rational(0), new Rational(0));
    }
    
    // Find k such that x is between 2^k and 2^(k+1)
    let k = 0;
    let xScaled = x;
    
    if (x.compareTo(new Rational(1)) > 0) {
        while (xScaled.compareTo(new Rational(2)) >= 0) {
            xScaled = xScaled.divide(2);
            k++;
        }
    } else {
        while (xScaled.compareTo(new Rational(1)) < 0) {
            xScaled = xScaled.multiply(2);
            k--;
        }
    }
    
    // Now xScaled (m) is in [1, 2)
    // Use Taylor series for ln(1 + y) where y = m - 1
    const y = xScaled.subtract(1);
    
    let sum = new Rational(0);
    let term = y;
    let n = 1;
    
    while (term.abs().compareTo(epsilon) > 0) {
        sum = sum.add(term.divide(new Rational(n)));
        n++;
        term = term.multiply(y).negate();
    }
    
    // Add error bounds
    const errorBound = term.abs().divide(new Rational(n));
    const lnM = new RationalInterval(
        sum.subtract(errorBound),
        sum.add(errorBound)
    );
    
    // Add k * ln(2)
    if (k === 0) {
        return lnM;
    }
    
    const ln2Interval = getConstant(LN2_CF, precision);
    const kLn2 = ln2Interval.multiply(k);
    
    return lnM.add(kLn2);
}

// LOG function (logarithm with arbitrary base)
export function LOG(x, base = 10, precision) {
    // Handle precision in second argument position
    if (typeof base === 'object' || base === undefined) {
        precision = base;
        base = 10;
    }
    
    const lnX = LN(x, precision);
    const lnBase = LN(base, precision);
    
    return lnX.divide(lnBase);
}

// SIN function
export function SIN(x, precision) {
    const { epsilon } = parsePrecision(precision);
    
    // Handle RationalInterval input
    if (x instanceof RationalInterval) {
        // For intervals, we need to find the minimum and maximum
        // This is complex due to periodicity, so we'll use a simple approach
        const samples = 100;
        let min = null, max = null;
        
        for (let i = 0; i <= samples; i++) {
            const t = x.low.add(x.high.subtract(x.low).multiply(i).divide(samples));
            const sinT = SIN(t, precision);
            
            if (min === null || sinT.low.compare(min) < 0) min = sinT.low;
            if (max === null || sinT.high.compare(max) > 0) max = sinT.high;
        }
        
        return new RationalInterval(min, max);
    }
    
    // Convert to Rational if needed
    if (!(x instanceof Rational)) {
        x = new Rational(x);
    }
    
    // Get pi approximation
    const piInterval = PI(precision);
    const piApprox = piInterval.low.add(piInterval.high).divide(new Rational(2));
    const piOver2 = piApprox.divide(new Rational(2));
    
    // Find closest multiple of pi/2
    const k = round(x.divide(piOver2));
    const r = x.subtract(k.multiply(piOver2));
    
    // Determine which function to use based on k mod 4
    const kMod4 = Number(k.numerator % 4n);
    
    let usecos = false;
    let negate = false;
    
    switch (kMod4) {
        case 0: // sin(x)
            break;
        case 1: // cos(x)
            usecos = true;
            break;
        case 2: // -sin(x)
            negate = true;
            break;
        case 3: // -cos(x)
            usecos = true;
            negate = true;
            break;
    }
    
    // Compute using Taylor series
    let sum = new Rational(0);
    let term = r;
    let n = 1;
    
    if (usecos) {
        sum = new Rational(1);
        term = new Rational(1);
        n = 0;
    }
    
    while (term.abs().compareTo(epsilon) > 0) {
        if (usecos) {
            if (n > 0) {
                term = term.multiply(r).multiply(r).negate().divide(new Rational((2*n-1) * (2*n)));
                sum = sum.add(term);
            }
        } else {
            sum = sum.add(term);
            term = term.multiply(r).multiply(r).negate().divide(new Rational((n+1) * (n+2)));
        }
        n++;
    }
    
    if (negate) {
        sum = sum.negate();
    }
    
    // Add error bounds
    const errorBound = term.abs().multiply(new Rational(2));
    return new RationalInterval(
        sum.subtract(errorBound),
        sum.add(errorBound)
    );
}

// COS function
export function COS(x, precision) {
    const { epsilon } = parsePrecision(precision);
    
    // cos(x) = sin(x + pi/2)
    const piInterval = PI(precision);
    const piOver2 = piInterval.divide(new Rational(2));
    
    if (x instanceof RationalInterval) {
        return SIN(x.add(piOver2), precision);
    } else {
        const piOver2Mid = piOver2.low.add(piOver2.high).divide(new Rational(2));
        return SIN(new Rational(x).add(piOver2Mid), precision);
    }
}

// ARCSIN function
export function ARCSIN(x, precision) {
    const { epsilon } = parsePrecision(precision);
    
    // Handle RationalInterval input
    if (x instanceof RationalInterval) {
        if (x.low.compareTo(new Rational(-1)) < 0 || x.high.compareTo(new Rational(1)) > 0) {
            throw new Error("ARCSIN: argument must be in [-1, 1]");
        }
        const lower = ARCSIN(x.low, precision);
        const upper = ARCSIN(x.high, precision);
        return new RationalInterval(lower.low, upper.high);
    }
    
    // Convert to Rational if needed
    if (!(x instanceof Rational)) {
        x = new Rational(x);
    }
    
    if (x.compareTo(new Rational(-1)) < 0 || x.compareTo(new Rational(1)) > 0) {
        throw new Error("ARCSIN: argument must be in [-1, 1]");
    }
    
    // Special cases
    if (isZero(x)) {
        return new RationalInterval(new Rational(0), new Rational(0));
    }
    
    // Use Taylor series: arcsin(x) = x + x^3/6 + 3x^5/40 + ...
    let sum = x;
    let term = x;
    let n = 1;
    
    while (term.abs().compareTo(epsilon) > 0) {
        term = term.multiply(x).multiply(x).multiply(new Rational((2*n-1) * (2*n-1))).divide(new Rational((2*n) * (2*n+1)));
        sum = sum.add(term);
        n++;
    }
    
    // Add error bounds
    const errorBound = term.abs().multiply(new Rational(2));
    return new RationalInterval(
        sum.subtract(errorBound),
        sum.add(errorBound)
    );
}

// ARCCOS function
export function ARCCOS(x, precision) {
    // arccos(x) = pi/2 - arcsin(x)
    const piOver2 = PI(precision).divide(2);
    const arcsinX = ARCSIN(x, precision);
    
    return piOver2.subtract(arcsinX);
}

// Newton's method for rational roots
export function newtonRoot(q, n, precision) {
    const { epsilon } = parsePrecision(precision);
    
    if (!(q instanceof Rational)) {
        q = new Rational(q);
    }
    
    if (n <= 0) {
        throw new Error("Root degree must be positive");
    }
    
    if (n === 1) {
        return new RationalInterval(q, q);
    }
    
    if (isNegative(q) && n % 2 === 0) {
        throw new Error("Even root of negative number");
    }
    
    // Initial approximation: a_0 = ((n-1)*q^(1/n) + 1) / n
    // We'll use a simpler initial guess
    let a = q.add(new Rational(n - 1)).divide(new Rational(n));
    
    let iterations = 0;
    const maxIterations = 100;
    
    while (iterations < maxIterations) {
        // b = q / a^(n-1)
        let aPower = a;
        for (let i = 1; i < n - 1; i++) {
            aPower = aPower.multiply(a);
        }
        const b = q.divide(aPower);
        
        // Check if interval is small enough
        const diff = b.subtract(a).abs();
        if (diff.compareTo(epsilon) <= 0) {
            const lower = a.compareTo(b) < 0 ? a : b;
            const upper = a.compareTo(b) > 0 ? a : b;
            return new RationalInterval(lower, upper);
        }
        
        // Next iteration: a_{m+1} = a_m + (b_m - a_m)/n
        a = a.add(b.subtract(a).divide(new Rational(n)));
        iterations++;
    }
    
    throw new Error("Newton's method did not converge");
}

// Extended power operator for fractional exponents
export function rationalIntervalPower(base, exponent, precision) {
    // Handle special cases
    if (exponent instanceof Rational && exponent.denominator <= 10n) {
        // Use Newton's method for small denominators
        const root = newtonRoot(base, Number(exponent.denominator), precision);
        
        if (exponent.numerator === 1n) {
            return root;
        }
        
        // Raise to numerator power
        let result = root;
        const numeratorNum = Number(exponent.numerator);
        for (let i = 1; i < Math.abs(numeratorNum); i++) {
            result = result.multiply(root);
        }
        
        return result;
    }
    
    // General case: a^b = e^(b * ln(a))
    const lnBase = LN(base, precision);
    const product = lnBase.multiply(exponent);
    
    // We need to handle RationalInterval multiplication properly
    if (product instanceof RationalInterval) {
        return EXP(product, precision);
    } else {
        return EXP(product, precision);
    }
}

// Export precision parser for external use
export { parsePrecision };
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

// Helper function to create a tight rational interval from a decimal approximation
function createTightRationalInterval(value, precision) {
    const { epsilon } = parsePrecision(precision);
    const epsilonDecimal = epsilon.toNumber();
    
    // Create rational bounds with specified precision
    const lowerDecimal = value - epsilonDecimal;
    const upperDecimal = value + epsilonDecimal;
    
    // Convert to rationals with sufficient precision (avoid fraction explosion)
    const precisionScale = Math.min(1000000000, Math.max(1000000, Math.ceil(1 / epsilonDecimal)));
    const lower = new Rational(Math.floor(lowerDecimal * precisionScale), precisionScale);
    const upper = new Rational(Math.ceil(upperDecimal * precisionScale), precisionScale);
    
    return new RationalInterval(lower, upper);
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
    
    // If r is negative due to approximation error, adjust k
    if (isNegative(r)) {
        const kAdjusted = k.subtract(new Rational(1));
        const rAdjusted = x.subtract(kAdjusted.multiply(ln2Approx));
        return EXP(rAdjusted, precision).multiply(new Rational(new Integer(2).pow(kAdjusted.numerator >= 0n ? kAdjusted.numerator : -kAdjusted.numerator).value, 1));
    }
    
    // For better precision, use a hybrid approach
    // Try exact rational computation first, fall back to controlled precision
    let expR;
    
    // First try exact computation with limited iterations
    let sum = new Rational(1);
    let term = new Rational(1);
    let n = 1;
    let converged = false;
    
    // More conservative iteration limit to prevent fraction explosion
    while (term.abs().compareTo(epsilon) > 0 && n < 50) {
        term = term.multiply(r).divide(new Rational(n));
        sum = sum.add(term);
        n++;
        
        // Check for convergence or fraction explosion
        if (sum.denominator > 1000000000n || term.denominator > 1000000000n) {
            break;
        }
        
        if (term.abs().compareTo(epsilon) <= 0) {
            converged = true;
            break;
        }
    }
    
    if (converged && sum.denominator <= 1000000000n) {
        // Use exact result with proper error bounds
        const errorBound = term.abs().multiply(new Rational(2));
        expR = new RationalInterval(
            sum.subtract(errorBound),
            sum.add(errorBound)
        );
    } else {
        // Fall back to high-precision decimal approximation
        const rDecimal = r.toNumber();
        const expRDecimal = Math.exp(rDecimal);
        expR = createTightRationalInterval(expRDecimal, precision);
    }
    
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
            xScaled = xScaled.divide(new Rational(2));
            k++;
        }
    } else {
        while (xScaled.compareTo(new Rational(1)) < 0) {
            xScaled = xScaled.multiply(new Rational(2));
            k--;
        }
    }
    
    // Now xScaled (m) is in [1, 2)
    // Use Taylor series for ln(1 + y) where y = m - 1
    const y = xScaled.subtract(new Rational(1));
    
    // Use hybrid approach for better precision
    let lnM;
    let sum = new Rational(0);
    let term = y;
    let n = 1;
    let converged = false;
    
    // Try exact computation with limited iterations
    while (term.abs().compareTo(epsilon) > 0 && n < 50) {
        sum = sum.add(term.divide(new Rational(n)));
        n++;
        term = term.multiply(y).negate();
        
        // Check for convergence or fraction explosion
        if (sum.denominator > 1000000000n || term.denominator > 1000000000n) {
            break;
        }
        
        if (term.abs().compareTo(epsilon) <= 0) {
            converged = true;
            break;
        }
    }
    
    if (converged && sum.denominator <= 1000000000n) {
        // Use exact result
        const errorBound = term.abs().divide(new Rational(n));
        lnM = new RationalInterval(
            sum.subtract(errorBound),
            sum.add(errorBound)
        );
    } else {
        // Fall back to high-precision decimal approximation
        const xScaledDecimal = xScaled.toNumber();
        const lnMDecimal = Math.log(xScaledDecimal);
        lnM = createTightRationalInterval(lnMDecimal, precision);
    }
    
    // Add k * ln(2)
    if (k === 0) {
        return lnM;
    }
    
    const ln2Interval = getConstant(LN2_CF, precision);
    const kLn2 = ln2Interval.multiply(new Rational(k));
    
    return lnM.add(kLn2);
}

// LOG function (logarithm with arbitrary base)
export function LOG(x, base = 10, precision) {
    // Handle precision in second argument position when only 2 args provided
    // If base is undefined or a precision value (number), treat as precision
    if (base === undefined || (typeof base === 'number' && base < 0)) {
        precision = base;
        base = 10;
    }
    
    const lnX = LN(x, precision);
    const lnBase = LN(new Rational(base), precision);
    
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
            const t = x.low.add(x.high.subtract(x.low).multiply(new Rational(i)).divide(new Rational(samples)));
            const sinT = SIN(t, precision);
            
            if (min === null || sinT.low.compareTo(min) < 0) min = sinT.low;
            if (max === null || sinT.high.compareTo(max) > 0) max = sinT.high;
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
    
    while (term.abs().compareTo(epsilon) > 0 && n < 100) {
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
        
        // Prevent fraction explosion with much higher threshold
        if (sum.denominator > 100000000000n || term.denominator > 100000000000n) {
            break;
        }
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
        // Convert x to Rational if needed
        const xRational = (x instanceof Rational) ? x : new Rational(x);
        return SIN(xRational.add(piOver2Mid), precision);
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
    
    // Use hybrid approach for better precision
    let sum = x;
    let term = x;
    let n = 1;
    let converged = false;
    
    // Try exact computation with limited iterations
    while (term.abs().compareTo(epsilon) > 0 && n < 30) {
        term = term.multiply(x).multiply(x).multiply(new Rational((2*n-1) * (2*n-1))).divide(new Rational((2*n) * (2*n+1)));
        sum = sum.add(term);
        n++;
        
        // Check for convergence or fraction explosion
        if (sum.denominator > 1000000000n || term.denominator > 1000000000n) {
            break;
        }
        
        if (term.abs().compareTo(epsilon) <= 0) {
            converged = true;
            break;
        }
    }
    
    if (converged && sum.denominator <= 1000000000n) {
        // Use exact result
        const errorBound = term.abs().multiply(new Rational(2));
        return new RationalInterval(
            sum.subtract(errorBound),
            sum.add(errorBound)
        );
    } else {
        // Fall back to high-precision decimal approximation
        const xDecimal = x.toNumber();
        const arcsinDecimal = Math.asin(xDecimal);
        return createTightRationalInterval(arcsinDecimal, precision);
    }
}

// ARCCOS function
export function ARCCOS(x, precision) {
    // arccos(x) = pi/2 - arcsin(x)
    const piOver2 = PI(precision).divide(new Rational(2));
    const arcsinX = ARCSIN(x, precision);
    
    return piOver2.subtract(arcsinX);
}

// TAN function
export function TAN(x, precision) {
    const { epsilon } = parsePrecision(precision);
    
    // Handle RationalInterval input
    if (x instanceof RationalInterval) {
        // For intervals, we need to find the minimum and maximum
        // This is complex due to discontinuities, so we'll use a simple approach
        const samples = 100;
        let min = null, max = null;
        
        for (let i = 0; i <= samples; i++) {
            const t = x.low.add(x.high.subtract(x.low).multiply(new Rational(i)).divide(new Rational(samples)));
            try {
                const tanT = TAN(t, precision);
                
                if (min === null || tanT.low.compareTo(min) < 0) min = tanT.low;
                if (max === null || tanT.high.compareTo(max) > 0) max = tanT.high;
            } catch (e) {
                // Skip points where tan is undefined
                continue;
            }
        }
        
        if (min === null || max === null) {
            throw new Error("TAN: interval contains undefined points");
        }
        
        return new RationalInterval(min, max);
    }
    
    // Convert to Rational if needed
    if (!(x instanceof Rational)) {
        x = new Rational(x);
    }
    
    // Check for points where tan is undefined (odd multiples of pi/2)
    const piInterval = PI(precision);
    const piApprox = piInterval.low.add(piInterval.high).divide(new Rational(2));
    const piOver2 = piApprox.divide(new Rational(2));
    
    // Check if x is close to an odd multiple of pi/2
    const quotient = x.divide(piOver2);
    const nearestOddMultiple = round(quotient);
    
    // If the nearest multiple is odd and we're very close to it
    if (Number(nearestOddMultiple.numerator % 2n) === 1) {
        const distance = quotient.subtract(nearestOddMultiple).abs();
        if (distance.compareTo(epsilon) < 0) {
            throw new Error("TAN: undefined at odd multiples of π/2");
        }
    }
    
    // tan(x) = sin(x) / cos(x)
    const sinX = SIN(x, precision);
    const cosX = COS(x, precision);
    
    // Check if cos(x) is too close to zero
    if (cosX.low.abs().compareTo(epsilon) < 0 || cosX.high.abs().compareTo(epsilon) < 0) {
        throw new Error("TAN: undefined (cosine too close to zero)");
    }
    
    return sinX.divide(cosX);
}

// ARCTAN function  
export function ARCTAN(x, precision) {
    const { epsilon } = parsePrecision(precision);
    
    // Handle RationalInterval input
    if (x instanceof RationalInterval) {
        const lower = ARCTAN(x.low, precision);
        const upper = ARCTAN(x.high, precision);
        return new RationalInterval(lower.low, upper.high);
    }
    
    // Convert to Rational if needed
    if (!(x instanceof Rational)) {
        x = new Rational(x);
    }
    
    // Special cases
    if (isZero(x)) {
        return new RationalInterval(new Rational(0), new Rational(0));
    }
    
    // For |x| > 1, use the identity: arctan(x) = π/2 - arctan(1/x) for x > 0
    //                                         = -π/2 - arctan(1/x) for x < 0
    const absX = x.abs();
    if (absX.compareTo(new Rational(1)) > 0) {
        const piOver2 = PI(precision).divide(new Rational(2));
        const piOver2Mid = piOver2.low.add(piOver2.high).divide(new Rational(2));
        
        const arctanRecip = ARCTAN(new Rational(1).divide(absX), precision);
        const result = piOver2Mid.subtract(arctanRecip.low.add(arctanRecip.high).divide(new Rational(2)));
        
        if (isNegative(x)) {
            return new RationalInterval(result.negate(), result.negate());
        } else {
            return new RationalInterval(result, result);
        }
    }
    
    // For |x| <= 1, use Taylor series: arctan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
    let sum = x;
    let term = x;
    let n = 1;
    
    while (term.abs().compareTo(epsilon) > 0 && n < 100) {
        term = term.multiply(x).multiply(x).negate();
        const denominator = new Rational(2*n + 1);
        sum = sum.add(term.divide(denominator));
        n++;
        
        // Prevent fraction explosion with much higher threshold
        if (sum.denominator > 100000000000n || term.denominator > 100000000000n) {
            break;
        }
    }
    
    // Add error bounds
    const errorBound = term.abs().multiply(new Rational(2));
    return new RationalInterval(
        sum.subtract(errorBound),
        sum.add(errorBound)
    );
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
    
    // Better initial approximation using decimal approximation
    const qDecimal = q.toNumber();
    const initialGuess = Math.pow(qDecimal, 1.0 / n);
    
    // Convert back to rational with reasonable precision
    let a = new Rational(Math.round(initialGuess * 1000), 1000);
    
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
        
        // Prevent fraction explosion by checking if denominators are getting too large
        if (a.denominator > 100000000000n || b.denominator > 100000000000n) {
            // Use decimal approximation to create simpler rational bounds
            const aDecimal = a.toNumber();
            const bDecimal = b.toNumber();
            if (!isNaN(aDecimal) && !isNaN(bDecimal)) {
                const lowerDecimal = Math.min(aDecimal, bDecimal);
                const upperDecimal = Math.max(aDecimal, bDecimal);
                
                // For roots, use higher precision approximation
                const precisionScale = 10000000;
                const lowerRational = new Rational(Math.floor(lowerDecimal * precisionScale), precisionScale);
                const upperRational = new Rational(Math.ceil(upperDecimal * precisionScale), precisionScale);
                return new RationalInterval(lowerRational, upperRational);
            }
        }
        
        // Next iteration: a_{m+1} = a_m + (b_m - a_m)/n
        a = a.add(b.subtract(a).divide(new Rational(n)));
        iterations++;
    }
    
    throw new Error("Newton's method did not converge");
}

// Extended power operator for fractional exponents
export function rationalIntervalPower(base, exponent, precision) {
    // Convert exponent to Rational if needed
    if (exponent instanceof Integer) {
        exponent = exponent.toRational();
    } else if (typeof exponent === 'bigint') {
        exponent = new Rational(exponent);
    } else if (typeof exponent === 'number') {
        exponent = new Rational(exponent);
    }
    
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
        
        // Handle negative exponents
        if (numeratorNum < 0) {
            return new RationalInterval(new Rational(1), new Rational(1)).divide(result);
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
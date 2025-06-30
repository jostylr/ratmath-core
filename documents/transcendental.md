# Transcendental Functions in RatMath

RatMath provides approximations of transcendental functions using rational interval arithmetic. All functions return `RationalInterval` objects that are guaranteed to contain the true mathematical value.

## Overview

The transcendental functions use a combination of:
- **Continued fraction approximations** for mathematical constants (π, e)
- **Taylor series expansions** with rigorous error bounds
- **Argument reduction techniques** to improve convergence
- **Newton's method** for rational roots

All functions support optional precision specification using the bracket notation `[n]` where:
- Positive `n`: precision of `1/n` (e.g., `[6]` means precision better than 1/6)
- Negative `n`: precision of `10^n` (e.g., `[-6]` means precision better than 10^-6)

Default precision is `10^-6`.

## Constants

### PI([precision])
Returns a rational interval containing π.

```javascript
import { PI } from './src/ratreal.js';

PI        // π with default precision (10^-6)
PI[6]       // π with precision better than 1/6
PI[-8]      // π with precision better than 10^-8
```

### E([precision])
Returns a rational interval containing Euler's number e.

```javascript
import { E } from './src/ratreal.js';

EXP         // e with default precision
EXP[-10]      // e with precision better than 10^-10
```

## Exponential and Logarithmic Functions

### EXP(x, [precision])
Computes e^x using ln(2) decomposition and Taylor series.

- **Without argument**: Returns the constant e (equivalent to `E()`)
- **Algorithm**: Decomposes x = k*ln(2) + r, then e^x = 2^k * e^r
- **Domain**: All real numbers

```javascript
import { EXP } from './src/ratreal.js';
import { Rational } from './src/rational.js';

EXP()                               // Returns e
EXP(new Rational(0))               // Returns 1
EXP(new Rational(1))               // Returns e
EXP(new Rational(2), -8)           // e^2 with 10^-8 precision
```

### LN(x, [precision])
Computes the natural logarithm using 2^k scaling and Taylor series.

- **Algorithm**: Scales x to [1,2) using powers of 2, then uses ln(1+y) series
- **Domain**: Positive real numbers
- **Error**: Throws for x ≤ 0

```javascript
import { LN } from './src/ratreal.js';
import { Rational } from './src/rational.js';

LN(new Rational(1))                // Returns 0
LN(new Rational(2))                // Returns ln(2)
LN(new Rational(10), -6)           // ln(10) with 10^-6 precision
```

### LOG(x, [base], [precision])
Computes logarithm with arbitrary base using LOG(x,base) = LN(x)/LN(base).

- **Default base**: 10
- **Base can be**: Number or Rational
- **Domain**: x > 0, base > 0, base ≠ 1

```javascript
import { LOG } from './src/ratreal.js';
import { Rational } from './src/rational.js';

LOG(new Rational(10))              // log₁₀(10) = 1
LOG(new Rational(8), 2)            // log₂(8) = 3
LOG(new Rational(100), new Rational(10))  // log₁₀(100) = 2
```

## Trigonometric Functions

### SIN(x, [precision])
Computes sine using argument reduction and Taylor series.

- **Algorithm**: Reduces to nearest π/2 multiple, then uses appropriate series
- **Domain**: All real numbers
- **Range**: [-1, 1]

```javascript
import { SIN } from './src/ratreal.js';
import { Rational, PI } from './src/ratreal.js';

SIN(new Rational(0))               // Returns 0
SIN(PI().divide(new Rational(2)))  // Returns ≈ 1 (sin(π/2))
```

### COS(x, [precision])
Computes cosine using the identity cos(x) = sin(x + π/2).

```javascript
import { COS } from './src/ratreal.js';
import { Rational, PI } from './src/ratreal.js';

COS(new Rational(0))               // Returns 1
COS(PI())                          // Returns ≈ -1 (cos(π))
```

### TAN(x, [precision])
Computes tangent using TAN(x) = SIN(x)/COS(x).

- **Domain**: All real numbers except odd multiples of π/2
- **Error**: Throws at points where tangent is undefined

```javascript
import { TAN } from './src/ratreal.js';
import { Rational, PI } from './src/ratreal.js';

TAN(new Rational(0))               // Returns 0
TAN(PI().divide(new Rational(4)))  // Returns ≈ 1 (tan(π/4))
```

## Inverse Trigonometric Functions

### ARCSIN(x, [precision])
Computes arcsine using Taylor series.

- **Domain**: [-1, 1]
- **Range**: [-π/2, π/2]
- **Error**: Throws for |x| > 1

```javascript
import { ARCSIN } from './src/ratreal.js';
import { Rational } from './src/rational.js';

ARCSIN(new Rational(0))            // Returns 0
ARCSIN(new Rational(1))            // Returns ≈ π/2
ARCSIN(new Rational(1, 2))         // Returns ≈ π/6
```

### ARCCOS(x, [precision])
Computes arccosine using the identity arccos(x) = π/2 - arcsin(x).

- **Domain**: [-1, 1]
- **Range**: [0, π]

```javascript
import { ARCCOS } from './src/ratreal.js';
import { Rational } from './src/rational.js';

ARCCOS(new Rational(1))            // Returns 0
ARCCOS(new Rational(0))            // Returns ≈ π/2
ARCCOS(new Rational(-1))           // Returns ≈ π
```

### ARCTAN(x, [precision])
Computes arctangent using Taylor series and argument reduction.

- **Domain**: All real numbers
- **Range**: (-π/2, π/2)
- **Algorithm**: For |x| > 1, uses identity arctan(x) = π/2 - arctan(1/x)

```javascript
import { ARCTAN } from './src/ratreal.js';
import { Rational } from './src/rational.js';

ARCTAN(new Rational(0))            // Returns 0
ARCTAN(new Rational(1))            // Returns ≈ π/4
ARCTAN(new Rational(100))          // Returns ≈ π/2
```

## Root Functions and Fractional Exponents

### newtonRoot(q, n, [precision])
Computes the nth root of q using Newton's method.

- **Algorithm**: Iterative approximation with convergence checking
- **Domain**: q > 0 for even n, any q for odd n
- **Returns**: RationalInterval containing the nth root

```javascript
import { newtonRoot } from './src/ratreal.js';
import { Rational } from './src/rational.js';

newtonRoot(new Rational(4), 2)     // √4 = 2
newtonRoot(new Rational(8), 3)     // ∛8 = 2
newtonRoot(new Rational(16), 4)    // ⁴√16 = 2
```

### rationalIntervalPower(base, exponent, [precision])
Computes base^exponent for rational exponents.

- **Small denominators** (≤ 10): Uses Newton's method for exact roots
- **General case**: Uses the identity a^b = e^(b*ln(a))
- **Integer exponents**: Uses standard power function

```javascript
import { rationalIntervalPower } from './src/ratreal.js';
import { Rational } from './src/rational.js';

rationalIntervalPower(new Rational(4), new Rational(1, 2))   // √4 = 2
rationalIntervalPower(new Rational(8), new Rational(1, 3))   // ∛8 = 2
rationalIntervalPower(new Rational(2), new Rational(3, 2))   // 2^(3/2) = 2√2
```

## Parser Integration

All transcendental functions are integrated into the RatMath parser with support for:

- **Function calls**: `SIN(0)`, `EXP(1)`, `LOG(100)`
- **Precision specification**: `PI[-8]`, `SIN[-6](0)`, `EXP[12](1)`
- **Constants without parentheses**: `PI`, `EXP` (returns e)
- **Fractional exponents**: `4^(1/2)`, `8**(1/3)`

```javascript
import { Parser } from './src/parser.js';

Parser.parse("PI")                 // π constant
Parser.parse("SIN(PI/2)")          // sin(π/2) ≈ 1
Parser.parse("EXP(LN(2))")         // e^(ln(2)) = 2
Parser.parse("LOG(100)")           // log₁₀(100) = 2
Parser.parse("4^(1/2)")            // √4 = 2
```

## Implementation Notes

### Precision Control
- Functions use Taylor series with term-by-term error estimation
- Automatic prevention of fraction explosion through denominator size limits
- Graceful degradation to decimal approximations when necessary

### Argument Reduction
- **Trigonometric functions**: Reduce modulo π/2 for optimal convergence
- **Exponential**: Decompose using ln(2) multiples
- **Logarithm**: Scale to [1,2) interval using powers of 2

### Error Handling
- Domain violations throw descriptive errors
- Interval arithmetic preserves all mathematical uncertainties
- Results guaranteed to contain true mathematical values

### Performance Considerations
- Continued fractions provide efficient constant approximations
- Taylor series optimized for rapid convergence in reduced ranges
- Newton's method used for exact rational roots when possible

## Mathematical Accuracy

The implementation prioritizes mathematical correctness over computational speed:

- All results are **guaranteed intervals** containing true values
- **Exact arithmetic** using BigInt maintains precision
- **Rigorous error bounds** account for truncation and approximation errors
- **Domain checking** prevents mathematical impossibilities

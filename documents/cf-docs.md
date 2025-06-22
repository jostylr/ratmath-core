# Continued Fractions in RatMath

This document provides comprehensive documentation for continued fraction support in the RatMath library.

## Overview

Continued fractions are a way of representing rational numbers as a sequence of integer terms. Every rational number has a unique finite continued fraction representation (in canonical form), and continued fractions provide excellent rational approximations to real numbers.

The RatMath library implements continued fraction support with the notation `3.~7~15~1~292`, where:
- `3` is the integer part (can be negative)
- The terms after `.~` are the continued fraction coefficients
- All coefficients after the integer part must be positive integers

## Syntax

### Basic Notation
```
integer.~term1~term2~term3~...
```

### Examples
- `3.~7~15~1~292` represents the continued fraction [3; 7, 15, 1, 292]
- `0.~2~3~4` represents [0; 2, 3, 4] = 1/(2 + 1/(3 + 1/4)) = 13/30
- `-2.~1~4~1~5` represents [-2; 1, 2, 2, 5] (negative integer part) Note that this is -49/38. The negative -2 gets added the positive continued fraction parts. This is the convention that is typical and we are going with. This is different than if -1 was chosen and negatives were added from the continued fraction parts.
- `5.~0` represents the integer 5 (verbose form)

### Mathematical Interpretation

A continued fraction [a₀; a₁, a₂, a₃, ...] represents:
```
a₀ + 1/(a₁ + 1/(a₂ + 1/(a₃ + ...)))
```

Where:
- a₀ can be any integer (including negative)
- a₁, a₂, a₃, ... must be positive integers

## API Reference

### Parser Class

#### `Parser.parseContinuedFraction(cfString)`
Parses a continued fraction string into coefficient array.

**Parameters:**
- `cfString` (string): CF string like "3.~7~15~1~292"

**Returns:**
- `Array<bigint>`: Coefficient array [integer_part, ...cf_terms]

**Example:**
```javascript
import { Parser } from './src/parser.js';

const cf = Parser.parseContinuedFraction("3.~7~15~1");
console.log(cf); // [3n, 7n, 15n, 1n]
```

#### `Parser.parse(expression)`
Main parser method that recognizes continued fraction notation in expressions.

**Example:**
```javascript
const result = Parser.parse("3.~7~15");
console.log(result.toString()); // "22/7" (approximation to π)
```

### Rational Class

#### `Rational.fromContinuedFraction(cfArray)`
Creates a Rational from continued fraction coefficients.

**Parameters:**
- `cfArray` (Array<bigint|number>): CF coefficients [integer_part, ...terms]

**Returns:**
- `Rational`: The rational number

**Properties set on result:**
- `cf`: Array of CF terms without integer part
- `convergents`: Array of convergent rationals
- `wholePart`: The integer part

**Example:**
```javascript
import { Rational } from './src/rational.js';

const rational = Rational.fromContinuedFraction([3, 7, 15, 1]);
console.log(rational.toString()); // "103993/33102"
console.log(rational.cf); // [7n, 15n, 1n]
console.log(rational.wholePart); // 3n
```

#### `rational.toContinuedFraction(maxTerms)`
Converts a Rational to continued fraction coefficients.

**Parameters:**
- `maxTerms` (number, optional): Maximum terms (default: 1000)

**Returns:**
- `Array<bigint>`: CF coefficients [integer_part, ...terms]

**Example:**
```javascript
const rational = new Rational(22, 7);
const cf = rational.toContinuedFraction();
console.log(cf); // [3n, 7n]
```

#### `rational.toContinuedFractionString()`
Converts to continued fraction string representation.

**Returns:**
- `string`: CF string in "integer.~term1~term2~..." format

**Example:**
```javascript
const rational = new Rational(22, 7);
const cfString = rational.toContinuedFractionString();
console.log(cfString); // "3.~7"
```

#### `Rational.fromContinuedFractionString(cfString)`
Creates a Rational from a continued fraction string.

**Parameters:**
- `cfString` (string): CF string like "3.~7~15~1"

**Returns:**
- `Rational`: The rational number

**Example:**
```javascript
const rational = Rational.fromContinuedFractionString("3.~7~15");
console.log(rational.toString()); // "333/106"
```

### Convergents Support

#### `rational.convergents(maxCount)`
Returns the convergents of the continued fraction.

**Parameters:**
- `maxCount` (number, optional): Maximum convergents to return

**Returns:**
- `Array<Rational>`: Array of convergent rationals

Convergents are successive rational approximations that get progressively closer to the target value.

**Example:**
```javascript
const pi = new Rational(355, 113); // Good π approximation
const convergents = pi.convergents(5);
convergents.forEach((conv, i) => {
    console.log(`Convergent ${i}: ${conv.toString()}`);
});
// Output:
// Convergent 0: 3/1
// Convergent 1: 22/7
// Convergent 2: 333/106
// Convergent 3: 355/113
```

#### `rational.getConvergent(n)`
Gets the nth convergent.

**Parameters:**
- `n` (number): 0-based index

**Returns:**
- `Rational`: The nth convergent

#### `Rational.convergentsFromCF(cfInput, maxCount)`
Computes convergents from CF array or string.

**Parameters:**
- `cfInput` (Array|string): CF coefficients or CF string
- `maxCount` (number, optional): Maximum convergents

**Returns:**
- `Array<Rational>`: Array of convergents

### Utility Methods

#### `rational.approximationError(target)`
Computes the approximation error between two rationals.

**Parameters:**
- `target` (Rational): Target rational to compare against

**Returns:**
- `Rational`: Absolute difference

**Example:**
```javascript
const pi = new Rational(355, 113);
const approx = new Rational(22, 7);
const error = approx.approximationError(pi);
console.log(error.toString()); // Shows approximation error
```

#### `rational.bestApproximation(maxDenominator)`
Finds the best rational approximation within a denominator limit.

**Parameters:**
- `maxDenominator` (bigint): Maximum allowed denominator

**Returns:**
- `Rational`: Best approximation within the limit

**Example:**
```javascript
const pi = new Rational(355, 113);
const best = pi.bestApproximation(100n);
console.log(best.toString()); // "22/7" (best approximation with denominator ≤ 100)
```

## Mathematical Properties

### Canonical Form
- Continued fractions in RatMath are automatically converted to canonical form
- The last term is never 1 (except for the integer 1 itself)
- This ensures unique representation for each rational number
- For negative numbers, only the integer part is negative. It is always less than or equal to the actual number. For negative numbers, this means adding the positive continued fractions parts to make it a larger number. This is distinct from how decimals are done which is essentially subtracting further decimal additions.

### Convergents
Convergents are computed using the recurrence relation:
```
p₋₁ = 1, p₀ = a₀
q₋₁ = 0, q₀ = 1

pₙ = aₙ × pₙ₋₁ + pₙ₋₂
qₙ = aₙ × qₙ₋₁ + qₙ₋₂
```

Where the nth convergent is pₙ/qₙ.

### Best Approximations
Each convergent is the best rational approximation with its denominator size. Convergents have alternating behavior:
- Even-indexed convergents approach from below
- Odd-indexed convergents approach from above

## Error Handling

The library validates continued fraction input and throws descriptive errors for:

- **Invalid format**: Missing `.~` pattern, invalid characters
- **Empty terms**: CF must have at least one term after `.~`
- **Trailing tildes**: CF cannot end with `~`
- **Double tildes**: Invalid `~~` sequences
- **Non-positive terms**: CF terms after integer part must be positive
- **Invalid coefficients**: Non-integer coefficients

## Performance Considerations

- Default term limit: 1000 terms (`Rational.DEFAULT_CF_LIMIT`)
- Convergents are computed lazily and cached
- BigInt arithmetic ensures exact precision for large coefficients
- Euclidean algorithm implementation is optimized for typical use cases

## Integration with Other Features

### Template Functions
Continued fractions work with template functions:

```javascript
const cf1 = R`3.~7~15`;
const cf2 = F`22.~7`;
```

### Arithmetic Operations
CF-created rationals work seamlessly with all arithmetic operations:

```javascript
const cf1 = Parser.parse("3.~7");
const cf2 = Parser.parse("1.~2");
const sum = cf1.add(cf2);
const product = cf1.multiply(cf2);
```

### Interval Arithmetic
CF rationals can be used in interval arithmetic contexts with automatic type promotion.

## Limitations

As documented in the implementation plan, this library focuses on exact rational arithmetic:

- **No irrational support**: Repeating patterns (which would represent irrational numbers) are not implemented
- **No infinite CF**: Only finite continued fractions for rational numbers
- **No periodic CF**: Quadratic irrationals like √2 are not supported

These limitations are by design to maintain the library's focus on exact rational arithmetic.

## Examples

See `examples/continued-fractions-basic.js` for practical usage examples including:
- Basic CF creation and manipulation
- Convergent computation
- Approximation finding
- Integration with arithmetic operations

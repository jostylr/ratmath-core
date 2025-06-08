# RatMath

A JavaScript library for exact rational arithmetic and interval arithmetic. The library provides classes for working with exact rational numbers using BigInt and closed intervals of rational numbers, along with a parser for interval expressions.

## Features

- **Exact Arithmetic**: All calculations are performed exactly, with no floating-point approximation errors.
- **Integer Arithmetic**: BigInt-based integer class with exact arithmetic. Division returns Integer for exact results or Rational for non-exact results.
- **Rational Numbers**: Represents fractions in lowest terms with arbitrary precision using JavaScript's built-in BigInt.
- **Mixed Number Notation**: Supports both standard fraction notation (a/b) and mixed number notation (a..b/c).
- **Fraction Representation**: Provides a Fraction class that maintains the exact numerator and denominator without automatic reduction.
- **Interval Arithmetic**: Supports operations on closed intervals with exact rational endpoints.
- **Fraction Intervals**: Implements intervals with Fraction endpoints for exact representation without automatic reduction.
- **Mediant Partitioning**: Create interval subdivisions using mediants (useful in continued fractions and number theory).
- **Repeating Decimal Support**: Parse repeating decimals like "0.12#45" and convert them to exact rational representations.
- **Decimal Uncertainty Parsing**: Parse decimal numbers with uncertainty notation like "1.23[56:67]" (range), "1.23[+5,-6]" (relative), or "1.3[+-1]" (symmetric).
- **Expression Parser**: Parse and evaluate string expressions involving rational intervals and arithmetic operations.

## Installation

This library is designed to work in both Node.js/Bun environments and browsers as an ES module.

```bash
# Using npm
npm install ratmath

# Using Bun
bun add ratmath
```

## Usage

### Repeating Decimal Parsing

Convert repeating decimals to exact rational numbers:

```javascript
import { parseRepeatingDecimal } from 'ratmath';

// Basic repeating decimals
const oneThird = parseRepeatingDecimal('0.#3');        // 1/3
const twoThirds = parseRepeatingDecimal('0.#6');       // 2/3
const complex = parseRepeatingDecimal('0.12#45');      // 137/1100

// Terminating decimals (using #0)
const exact = parseRepeatingDecimal('1.23#0');         // 123/100
const half = parseRepeatingDecimal('0.5#0');           // 1/2

// Negative repeating decimals
const negThird = parseRepeatingDecimal('-0.#3');       // -1/3

// Non-repeating decimals become intervals
const uncertain = parseRepeatingDecimal('1.23');       // [1.225, 1.235]
const negUncertain = parseRepeatingDecimal('-0.5');    // [-0.55, -0.45]

// Mathematical verification
const nineNines = parseRepeatingDecimal('0.#9');       // 1 (exactly)
console.log(nineNines.equals(new Rational(1)));        // true

// Common fractions
const oneSeventh = parseRepeatingDecimal('0.#142857'); // 1/7
const oneSixth = parseRepeatingDecimal('0.1#6');       // 1/6

// Convert rationals back to repeating decimals
console.log(oneThird.toRepeatingDecimal());            // "0.#3"
console.log(oneSeventh.toRepeatingDecimal());          // "0.#142857"
```

### Repeating Decimal Intervals

Parse intervals with repeating decimal endpoints and offsets:

```javascript
import { parseRepeatingDecimal, Parser } from 'ratmath';

// Range notation after decimal point: 0.[#3,#6] or 1.[1,4]
const range1 = parseRepeatingDecimal('0.[#3,#6]');     // 1/3 to 2/3
const range2 = parseRepeatingDecimal('1.[1,4]');       // 1.1 to 1.4
const range3 = parseRepeatingDecimal('0.[#142857,#285714]'); // 1/7 to 2/7

// Mixed repeating and terminating decimals
const mixed = parseRepeatingDecimal('0.[2,#6]');       // 0.2 to 2/3

// Integer base with any offsets (applied directly)
const offset1 = parseRepeatingDecimal('12[+4.3,-2]'); // [10, 16.3]
const offset2 = parseRepeatingDecimal('12[+0.43,-13]'); // [-1, 12.43]
const integerOffset = parseRepeatingDecimal('78[+-10]'); // [68, 88]

// Integer base with repeating decimal offsets
const repeatOffset = parseRepeatingDecimal('1[+-0.#3]'); // [2/3, 4/3]
const relativeRepeat = parseRepeatingDecimal('5[+0.#3,-0.#6]'); // [13/3, 16/3]

// Decimal base with any offsets (scaled to next decimal place)
const decimalBase = parseRepeatingDecimal('0.5[+-33.#3]'); // scaled offset
const decimalInt = parseRepeatingDecimal('1.23[+-5]'); // [1.225, 1.235] (5 scaled to 0.005)

// Colon notation also supported
const colonRange = parseRepeatingDecimal('0.[#3:#6]');  // Same as 0.[#3,#6]

// Use in expressions
const expr = Parser.parse('(0.[#1,#2] + 1.[#3,#4]) / 2'); // Complex arithmetic
console.log(expr.low.toString(), 'to', expr.high.toString()); // "13/18 to 5/6"
```

### Decimal Uncertainty Parsing

Parse decimal numbers with uncertainty notation:

```javascript
import { Parser } from 'ratmath';

// Range notation: base[lower_digits:upper_digits]
const range1 = Parser.parse('1.23[56:67]');           // 1.2356 to 1.2367
const range2 = Parser.parse('78.3[15:24]');           // 78.315 to 78.324
const range3 = Parser.parse('42[15:25]');             // 4215 to 4225

// Relative notation: base[+positive_offset,-negative_offset]
const rel1 = Parser.parse('1.23[+5,-6]');             // 1.224 to 1.235
const rel2 = Parser.parse('78.3[+15,-0.6]');          // 78.294 to 78.45
const rel3 = Parser.parse('1.5[+0.25,-0.15]');        // 1.4985 to 1.5025

// Symmetric notation: base[+-offset] (equivalent to base[-+offset])
const sym1 = Parser.parse('1.3[+-1]');                // 1.29 to 1.31
const sym2 = Parser.parse('2.5[+-0.25]');             // 2.4975 to 2.5025
const sym3 = Parser.parse('1.3[-+1]');                // Same as sym1
console.log(sym1.equals(sym3));                       // true

// Order independence in relative notation
const rel4a = Parser.parse('2.0[+0.1,-0.2]');         // 1.998 to 2.001
const rel4b = Parser.parse('2.0[-0.2,+0.1]');         // Same as above
console.log(rel4a.equals(rel4b));                     // true

// Negative base numbers
const neg1 = Parser.parse('-1.23[56:67]');            // -1.2367 to -1.2356
const neg2 = Parser.parse('-2.5[+0.1,-0.2]');         // -2.502 to -2.499

// Export intervals to uncertainty notation
import { RationalInterval, Rational } from 'ratmath';

const interval = new RationalInterval(new Rational('1.2356'), new Rational('1.2367'));
console.log(interval.compactedDecimalInterval());     // "1.23[56:67]"
console.log(interval.relativeMidDecimalInterval());   // "1.23615[+-0.00055]"

// Arithmetic with uncertainty intervals
const sum = Parser.parse('1.23[+0.5,-0.3] + 2.45[+0.2,-0.1]');  // [3.6796, 3.6807]
const product = Parser.parse('2[+-0.1] * 3[-+0.2]');     // [5.32, 6.72] (integer bases)
```

### Basic Rational Arithmetic

Rational numbers are always normalized to lowest terms:

```javascript
import { Rational } from 'ratmath';

// Create rational numbers
const a = new Rational(1, 2);    // 1/2
const b = new Rational('3/4');   // 3/4
const c = new Rational(5);       // 5/1
const d = new Rational('5..2/3'); // 17/3 (mixed number notation)

// Arithmetic operations
const sum = a.add(b);            // 5/4
const product = a.multiply(b);   // 3/8
const quotient = a.divide(b);    // 2/3

// Comparisons
const isLess = a.lessThan(b);    // true
const isEqual = a.equals(new Rational(2, 4)); // true (1/2 = 2/4)

// Powers
const squared = a.pow(2);        // 1/4
const cubed = a.pow(3);          // 1/8
const reciprocal = a.pow(-1);    // 2/1

// Conversion
console.log(sum.toString());     // "5/4"
console.log(sum.toNumber());     // 1.25 (approximate)
console.log(d.toMixedString());  // "5..2/3"
```

### Integer Arithmetic

The Integer class provides exact arithmetic with BigInt precision. Division automatically returns a Rational when the result is not a whole number:

```javascript
import { Integer, Rational } from 'ratmath';

// Create integers
const a = new Integer(15);
const b = new Integer('123456789012345678901234567890'); // Large numbers
const c = new Integer(-7);

// Arithmetic operations
const sum = a.add(c);            // 8
const product = a.multiply(c);   // -105
const power = a.pow(3);          // 3375

// Negative exponents return Rational numbers
const reciprocal = a.pow(-1);    // 1/15 (Rational)
const negSquare = a.pow(-2);     // 1/225 (Rational)

// Division - returns Integer or Rational automatically
const exactDiv = a.divide(new Integer(3));  // 5 (Integer)
const inexactDiv = a.divide(new Integer(4)); // 15/4 (Rational)

console.log(`15 ÷ 3 = ${exactDiv} (${exactDiv.constructor.name})`);
console.log(`15 ÷ 4 = ${inexactDiv} (${inexactDiv.constructor.name})`);

// Utility methods
console.log(c.abs());            // 7
console.log(a.isEven());         // false
console.log(a.gcd(new Integer(10))); // 5

// Conversion
console.log(a.toRational());     // 15/1 (Rational)
console.log(Integer.fromRational(new Rational(42, 1))); // 42 (Integer)
```

### Integer-Rational Integration

The Integer and Rational classes work seamlessly together, with automatic type conversion:

```javascript
import { Integer, Rational } from 'ratmath';

// Start with integers, automatic rational conversion when needed
const shares = new Integer(1000);
const people = new Integer(7);
const perPerson = shares.divide(people);  // Returns Rational(1000, 7)

console.log(`$${shares} ÷ ${people} = $${perPerson} each`);
console.log(`As decimal: $${perPerson.toNumber().toFixed(2)}`);

// Verify exact arithmetic: 7 × (1000/7) = 1000
const verification = perPerson.multiply(people.toRational());
console.log(`Verification: ${people} × ${perPerson} = $${verification}`);

// Mathematical calculations with mixed types
const fibonacci = (n) => {
    let a = new Integer(0), b = new Integer(1);
    for (let i = 2; i <= n; i++) {
        [a, b] = [b, a.add(b)];
    }
    return b;
};

const f20 = fibonacci(20);
const f19 = fibonacci(19);
const goldenRatio = f20.divide(f19);  // Automatic rational result
console.log(`Golden ratio ≈ ${goldenRatio} = ${goldenRatio.toNumber()}`);
```

### Fraction Arithmetic

Use the Fraction class when you need to maintain the exact representation without automatic reduction:

```javascript
import { Fraction } from 'ratmath';

// Create fractions
const a = new Fraction(1, 2);    // 1/2
const b = new Fraction(2, 4);    // 2/4 (not reduced to 1/2)
const c = new Fraction('3/5');   // 3/5

// Check equality (compares exact numerator/denominator values)
console.log(a.equals(b));        // false (1/2 ≠ 2/4)

// Arithmetic (restricted for same denominators)
const sum = a.add(new Fraction(1, 2));    // 2/2
const d = new Fraction(2, 3);
// a.add(d) would throw an error - denominators must match

// Multiplication and division work with any denominators
const product = a.multiply(d);            // 2/6
const quotient = a.divide(d);             // 3/4

// Manually reduce when needed
const reduced = b.reduce();               // 1/2
console.log(reduced.equals(a));           // true

// Scaling
const scaled = a.scale(2);                // 2/4

// Mediant calculation
const mediant = Fraction.mediant(a, d);   // 3/5

// Convert between Fraction and Rational
const rat = a.toRational();               // 1/2 as Rational
const frac = Fraction.fromRational(rat);  // 1/2 as Fraction
```

### Interval Arithmetic
#### Examples

```javascript
import { Rational, RationalInterval } from 'ratmath';

// Create intervals
const interval1 = new RationalInterval('1/2', '3/4');         // [1/2, 3/4]
const interval2 = new RationalInterval(new Rational(1), 2);   // [1, 2]

// Interval operations
const sum = interval1.add(interval2);              // [3/2, 11/4]
const product = interval1.multiply(interval2);     // [1/2, 3/2]

// Check for overlap and containment
const overlaps = interval1.overlaps(interval2);    // false
const contains = interval2.containsValue('3/2');   // true

// Intersection and union
const i1 = new RationalInterval('1/2', '3/4');
const i2 = new RationalInterval('2/3', '5/6');
const intersection = i1.intersection(i2);          // [2/3, 3/4]
const union = i1.union(i2);                        // [1/2, 5/6]

// New methods for extracting special rationals
const interval = new RationalInterval('1/3', '2/3');
const mediant = interval.mediant();                // 3/6 = 1/2
const midpoint = interval.midpoint();              // (1/3 + 2/3)/2 = 1/2

// Find shortest decimal representation
const decimalInterval = new RationalInterval('0.15', '0.35');
const shortest = decimalInterval.shortestDecimal(); // 1/5 (denominator 10^1)
const binary = decimalInterval.shortestDecimal(2);  // 1/4 (denominator 2^2)

// Generate random rationals
const random = interval.randomRational(100);       // Random rational with max denominator 100
```

### Parsing Expressions

```javascript
import { Parser } from 'ratmath';

// Parse and evaluate simple expressions
const result1 = Parser.parse('1/2 + 3/4');   // 5/4

// Mixed number expressions
const result1m = Parser.parse('2..1/2 + 3..3/4');  // 6..1/4

// Interval expressions
const result2 = Parser.parse('1/2:3/4 * 2:3');  // [1, 9/4]

// Mixed number interval expressions
const result2m = Parser.parse('1..1/2:2..3/4 * 2:3');  // [3, 33/4]

// Complex expressions with parentheses
const result3 = Parser.parse('(1/2:3/4 + 1/4) * (3/2 - 1/2:1)');

// Parse expressions with repeating decimals
const repeatResult1 = Parser.parse('0.#3 + 0.#6');    // 1:1 (exact result)
const repeatResult2 = Parser.parse('1.23#45 * 2');    // 679/275:679/275
const intervalResult = Parser.parse('0.#3 : 0.8#3');  // 1/3:5/6

// Exact decimal intervals (treated as terminating decimals)
const exactInterval = Parser.parse('1.23:1.34');      // [123/100, 67/50]
const mixedInterval = Parser.parse('1.5:0.#3');       // [1/3, 3/2]

// Results are RationalInterval objects
console.log(result2.toString());     // "1:9/4"
console.log(result2m.toMixedString()); // "3:8..1/4"
```

## API Documentation

For full API documentation, please refer to the [API documentation](docs/API.md).

### Rational Class

The `Rational` class represents an exact rational number as a fraction with numerator and denominator in lowest terms.

#### Constructor

```javascript
new Rational(numerator, denominator = 1)
```

- `numerator`: Number, string, or BigInt representing the numerator, or a string like "3/4"
- `denominator`: (Optional) Number or BigInt representing the denominator

#### Methods

- **add(other)**: Returns the sum as a new Rational
- **subtract(other)**: Returns the difference as a new Rational
- **multiply(other)**: Returns the product as a new Rational
- **divide(other)**: Returns the quotient as a new Rational
- **negate()**: Returns the negation as a new Rational
- **reciprocal()**: Returns the reciprocal as a new Rational
- **pow(exponent)**: Raises this rational to an integer power
- **equals(other)**: Returns true if this rational equals another
- **compareTo(other)**: Returns -1, 0, or 1 for less than, equal, or greater than
- **lessThan(other)**, **lessThanOrEqual(other)**, **greaterThan(other)**, **greaterThanOrEqual(other)**
- **abs()**: Returns the absolute value as a new Rational
- **toString()**: Returns a string representation ("numerator/denominator")
- **toMixedString()**: Returns a mixed number representation ("whole..numerator/denominator")
- **toNumber()**: Returns a floating-point approximation
- **toRepeatingDecimal()**: Returns a repeating decimal string representation

#### Static Methods

- **from(value)**: Creates a Rational from a number, string, or another Rational

### Integer Class

The `Integer` class represents an exact integer using BigInt for arbitrary precision arithmetic. Division automatically returns an Integer for exact results or a Rational for non-exact results.

#### Constructor

```javascript
new Integer(value)
```

- `value`: Number, string, or BigInt representing the integer value

#### Methods

- **add(other)**: Returns the sum as a new Integer
- **subtract(other)**: Returns the difference as a new Integer
- **multiply(other)**: Returns the product as a new Integer
- **divide(other)**: Returns an Integer if exact division, otherwise a Rational
- **modulo(other)**: Returns the remainder as a new Integer
- **negate()**: Returns the negation as a new Integer
- **pow(exponent)**: Raises this integer to an integer power (returns Rational for negative exponents)
- **equals(other)**: Returns true if this integer equals another
- **compareTo(other)**: Returns -1, 0, or 1 for less than, equal, or greater than
- **lessThan(other)**, **lessThanOrEqual(other)**, **greaterThan(other)**, **greaterThanOrEqual(other)**
- **abs()**: Returns the absolute value as a new Integer
- **sign()**: Returns -1, 0, or 1 for negative, zero, or positive
- **isEven()**, **isOdd()**: Returns true if the integer is even/odd
- **isZero()**, **isPositive()**, **isNegative()**: Returns true if the integer matches the condition
- **gcd(other)**: Returns the greatest common divisor as a new Integer
- **lcm(other)**: Returns the least common multiple as a new Integer
- **toString()**: Returns a string representation
- **toNumber()**: Returns a floating-point approximation
- **toRational()**: Returns this integer as a Rational with denominator 1

#### Static Methods

- **from(value)**: Creates an Integer from a number, string, bigint, or another Integer
- **fromRational(rational)**: Creates an Integer from a Rational that represents a whole number

### parseRepeatingDecimal Function

The `parseRepeatingDecimal` function converts repeating decimal strings to exact rational representations.

```javascript
parseRepeatingDecimal(str)
```

- `str`: String representing a repeating decimal

#### Supported Formats

- **Repeating decimals**: `"0.12#45"` represents 0.12454545... = 137/1100
- **Terminating decimals**: `"1.23#0"` represents exactly 1.23 = 123/100  
- **Pure repeating**: `"0.#3"` represents 0.333... = 1/3
- **Negative decimals**: `"-0.#6"` represents -0.666... = -2/3
- **Non-repeating**: `"1.23"` becomes interval [1.225, 1.235]
- **Uncertainty notation (range)**: `"1.23[56:67]"` represents interval [1.2356, 1.2367]
- **Uncertainty notation (relative)**: `"1.23[+5,-6]"` represents interval [1.224, 1.235]
- **Uncertainty notation (symmetric)**: `"1.3[+-1]"` represents interval [1.29, 1.31]
- **Repeating decimal intervals**: `"0.#3:0.5#0"` represents interval [1/3, 1/2]

#### Return Values

- Returns a `Rational` for repeating decimals with `#` notation
- Returns a `RationalInterval` for non-repeating decimals, uncertainty notation, or interval notation

#### Examples

```javascript
import { parseRepeatingDecimal } from 'ratmath';

// Exact conversions
parseRepeatingDecimal('0.#3');        // 1/3
parseRepeatingDecimal('0.12#45');     // 137/1100
parseRepeatingDecimal('733.#3');      // 2200/3
parseRepeatingDecimal('1.23#0');      // 123/100

// Uncertainty notation
parseRepeatingDecimal('1.23[56:67]'); // RationalInterval [1.2356, 1.2367]
parseRepeatingDecimal('78.3[+15,-0.6]'); // RationalInterval [78.294, 78.45]
parseRepeatingDecimal('1.3[+-1]'); // RationalInterval [1.29, 1.31]

// Interval notation
parseRepeatingDecimal('0.#3:0.5#0');  // RationalInterval [1/3, 1/2]

// Intervals for uncertain decimals
parseRepeatingDecimal('1.23');      // [49/40, 247/200]
parseRepeatingDecimal('-0.5');      // [-11/20, -9/20]
```

#### Converting Rationals to Repeating Decimals

```javascript
import { Rational } from 'ratmath';

// The toRepeatingDecimal() method converts any rational to its exact decimal representation
const oneThird = new Rational(1, 3);
console.log(oneThird.toRepeatingDecimal());     // "0.#3"

const twentyTwoSevenths = new Rational(22, 7);
console.log(twentyTwoSevenths.toRepeatingDecimal()); // "3.#142857"

const half = new Rational(1, 2); 
console.log(half.toRepeatingDecimal());         // "0.5#0" (terminating)

const five = new Rational(5);
console.log(five.toRepeatingDecimal());         // "5" (integer)

// All conversions are exact and preserve mathematical precision
const complex = new Rational(123, 37);
const decimal = complex.toRepeatingDecimal();
const parsed = parseRepeatingDecimal(decimal);
console.log(complex.equals(parsed));            // true
```

## Examples

### Calculation with Exact Fractions

```javascript
import { Rational } from 'ratmath';

// Calculate 1/3 + 1/4 - 1/5 exactly
const a = new Rational(1, 3);
const b = new Rational(1, 4);
const c = new Rational(1, 5);

const result = a.add(b).subtract(c);
console.log(result.toString());  // "47/60"
```

### Repeating Decimal Examples

```javascript
import { parseRepeatingDecimal, Rational } from 'ratmath';

// Convert repeating decimals to exact fractions
const third = parseRepeatingDecimal('0.#3');           // 1/3
const sixth = parseRepeatingDecimal('0.1#6');          // 1/6  
const mixed = parseRepeatingDecimal('1.23#45');        // 679/550

// Verify mathematical properties
console.log(third.multiply(new Rational(3)));          // 1 (exactly)
console.log(parseRepeatingDecimal('0.#9'));            // 1 (0.999... = 1)

// Handle non-repeating decimals as intervals
const uncertain = parseRepeatingDecimal('3.14');       // [3.135, 3.145]
console.log(uncertain.toString());                     // "627/200:629/200"

// Convert back to repeating decimal notation
const half = new Rational(1, 2);
console.log(half.toRepeatingDecimal());                // "0.5#0"

const piApprox = new Rational(22, 7);
console.log(piApprox.toRepeatingDecimal());            // "3.#142857"
```

### Roundtrip Conversion

The library supports perfect roundtrip conversion between rational numbers and repeating decimal strings:

```javascript
import { Rational, parseRepeatingDecimal } from 'ratmath';

// Original rational → repeating decimal → back to rational
const original = new Rational(1, 3);
const decimal = original.toRepeatingDecimal();         // "0.#3"
const roundtrip = parseRepeatingDecimal(decimal);      // 1/3

console.log(original.equals(roundtrip));               // true (exact match)

// Works with all types of numbers
const cases = [
  new Rational(1, 7),    // "0.#142857"
  new Rational(22, 7),   // "3.#142857" 
  new Rational(3, 4),    // "0.75#0"
  new Rational(-1, 3)    // "-0.#3"
];

cases.forEach(rational => {
  const decimal = rational.toRepeatingDecimal();
  const parsed = parseRepeatingDecimal(decimal);
  console.log(`${rational} ↔ ${decimal} ↔ ${parsed} ✓`);
});
```

### Fraction Class

The `Fraction` class represents a fraction without automatic reduction, preserving the exact numerator and denominator.

#### Constructor

```javascript
new Fraction(numerator, denominator = 1)
```

- `numerator`: Number, string, or BigInt representing the numerator, or a string like "3/4"
- `denominator`: (Optional) Number or BigInt representing the denominator

#### Methods

- **add(other)**: Returns the sum as a new Fraction (only works for equal denominators)
- **subtract(other)**: Returns the difference as a new Fraction (only works for equal denominators)
- **multiply(other)**: Returns the product as a new Fraction
- **divide(other)**: Returns the quotient as a new Fraction
- **pow(exponent)**: Raises this fraction to an integer power
- **scale(factor)**: Returns a new fraction with both numerator and denominator multiplied by the factor
- **reduce()**: Returns a new fraction in lowest terms
- **equals(other)**: Returns true if this fraction has identical numerator and denominator to another
- **lessThan(other)**, **lessThanOrEqual(other)**, **greaterThan(other)**, **greaterThanOrEqual(other)**: Compare fractions
- **toRational()**: Converts to a Rational instance
- **toString()**: Returns a string representation ("numerator/denominator")

#### Static Methods

- **mediant(a, b)**: Calculates the mediant (a.num + b.num) / (a.den + b.den) of two fractions
- **fromRational(rational)**: Creates a Fraction from a Rational

### RationalInterval Class

The `RationalInterval` class represents a closed interval [a, b] of rational numbers.

#### Constructor

```javascript
new RationalInterval(a, b)
```

- `a`, `b`: Endpoints of the interval (Rational, string, number, or BigInt)

#### Methods

- **add(other)**: Returns the sum as a new RationalInterval
- **subtract(other)**: Returns the difference as a new RationalInterval
- **multiply(other)**: Returns the product as a new RationalInterval
- **divide(other)**: Returns the quotient as a new RationalInterval
- **pow(exponent)**: Raises this interval to an integer power
- **overlaps(other)**: Returns true if this interval overlaps with another
- **contains(other)**: Returns true if this interval contains another interval
- **containsValue(value)**: Returns true if this interval contains a value
- **equals(other)**: Returns true if this interval equals another
- **intersection(other)**: Returns the intersection as a new RationalInterval, or null if disjoint
- **union(other)**: Returns the union as a new RationalInterval, or null if disjoint and not adjacent
- **mediant()**: Returns the mediant of the interval endpoints (useful in continued fractions)
- **midpoint()**: Returns the arithmetic midpoint of the interval
- **shortestDecimal(base)**: Returns the rational with smallest power-of-base denominator in the interval
- **randomRational(maxDenominator)**: Returns a uniformly random rational from the interval
- **toString()**: Returns a string representation ("low:high")
- **toMixedString()**: Returns a mixed number representation ("whole1..num1/den1:whole2..num2/den2")
- **toRepeatingDecimal()**: Returns a repeating decimal interval string (e.g., "0.#3:0.5#0")
- **compactedDecimalInterval()**: Returns a compacted decimal interval notation (e.g., "1.23[56:67]")
- **relativeMidDecimalInterval()**: Returns a relative midpoint decimal interval notation using symmetric notation (e.g., "1.2295[+-0.0055]")
- **relativeDecimalInterval()**: Deprecated alias for relativeMidDecimalInterval()

#### Static Methods

- **point(value)**: Creates a point interval from a single value
- **fromString(str)**: Creates an interval from a string like "3/4:1/2"

### FractionInterval Class

The `FractionInterval` class represents a closed interval [a, b] of fractions, preserving the exact representation.

#### Constructor

```javascript
new FractionInterval(a, b)
```

- `a`, `b`: Endpoints of the interval (must be Fraction objects)

#### Methods

- **mediantSplit()**: Splits the interval into two parts using the mediant of the endpoints
- **partitionWithMediants(n)**: Recursively partitions the interval using mediants to depth n
- **partitionWith(fn)**: Partitions the interval using a custom function that generates partition points
- **toRationalInterval()**: Converts to a RationalInterval
- **equals(other)**: Returns true if this interval equals another
- **toString()**: Returns a string representation ("low:high")

#### Static Methods

- **fromRationalInterval(interval)**: Creates a FractionInterval from a RationalInterval

### Parser Class

The `Parser` class parses and evaluates string expressions involving rational intervals.

#### Static Methods

- **parse(expression)**: Parses a string expression and returns the result as a RationalInterval

## Examples

### Calculation with Exact Fractions

```javascript
import { Rational } from 'ratmath';

// Calculate 1/3 + 1/4 - 1/5 exactly
const a = new Rational(1, 3);
const b = new Rational(1, 4);
const c = new Rational(1, 5);

const result = a.add(b).subtract(c);
console.log(result.toString());  // "47/60"
```

### Working with Fractions

```javascript
import { Fraction, Rational, FractionInterval } from 'ratmath';

// Demonstrating the difference between Fraction and Rational
const r1 = new Rational(2, 4);
const f1 = new Fraction(2, 4);

console.log(r1.toString());      // "1/2" (automatically reduced)
console.log(f1.toString());      // "2/4" (maintains original representation)

// Finding mediant fractions (useful in continued fraction approximations)
const f2 = new Fraction(1, 2);
const f3 = new Fraction(2, 3);
const mediant = Fraction.mediant(f2, f3);
console.log(mediant.toString()); // "3/5"

// Creating fractions with same denominator for addition
const denominatorBase = 12;
const a = new Fraction(5 * denominatorBase, denominatorBase);  // 5
const b = new Fraction(1, 3).scale(denominatorBase / 3);      // 4/12

const sum = a.add(b);
console.log(sum.toString());     // "64/12"
console.log(sum.reduce().toString()); // "16/3"

// Comparing fractions
console.log(f2.lessThan(f3));    // true
console.log(f3.greaterThan(f2)); // true

// Creating and partitioning a fraction interval
const interval = new FractionInterval(new Fraction(0, 1), new Fraction(1, 1));
const parts = interval.partitionWithMediants(2);

// Outputs the 4 intervals: [0/1:1/3], [1/3:1/2], [1/2:2/3], [2/3:1/1]
parts.forEach(part => console.log(part.toString()));
```

### Interval Calculation

```javascript
import { RationalInterval } from 'ratmath';

// Calculate the range of values for (x+y)^2 where x is in [1,2] and y is in [2,3]
const x = new RationalInterval(1, 2);
const y = new RationalInterval(2, 3);

const sum = x.add(y);            // [3, 5]
const squared = sum.pow(2);      // [9, 25]

console.log(squared.toString()); // "9:25"
```

### Expression Parsing

```javascript
import { Parser } from 'ratmath';

// Evaluate an expression with intervals
const result = Parser.parse('(1/2:3/4 + 1/4:1/2)^2 / 2:3');
console.log(result.toString());  // Will output the exact result as a rational interval
```

## Implementation Notes

### Repeating Decimal Algorithm

The conversion from repeating decimals to fractions uses the standard mathematical approach:

For a repeating decimal like `a.b#c` where:
- `a` is the integer part
- `b` is the non-repeating fractional part (length n)  
- `c` is the repeating part (length m)

The conversion formula is:
```
result = (abc - ab) / (10^(n+m) - 10^n)
```

Where `abc` is the concatenation of a, b, and c, and `ab` is the concatenation of a and b.

### Interval Representation for Non-repeating Decimals

When a decimal like "1.23" is provided without the `#` symbol, it's treated as having uncertainty in the last digit. The function creates an interval representing all possible values:

- "1.23" becomes [1.225, 1.235]
- "0.5" becomes [0.45, 0.55]
- "-1.5" becomes [-1.55, -1.45]

This approach acknowledges that finite decimal representations often have implicit uncertainty.
- Division by interval containing zero: `"Cannot divide by an interval containing zero"`
- Raising zero to power zero: `"Zero cannot be raised to the power of zero"`
- Negative exponents with zero base: `"Zero cannot be raised to a negative power"`
- Invalid repeating decimal format: `"Invalid repeating decimal format. Use format like '0.12#45'"`
- Non-numeric characters in repeating part: `"Repeating part must contain only digits"`

## Error Handling

The library throws clear error messages for various error conditions:

- Division by zero: `"Division by zero"`
- Denominator is zero: `"Denominator cannot be zero"`
- Division by interval containing zero: `"Cannot divide by an interval containing zero"`
- Raising zero to power zero: `"Zero cannot be raised to the power of zero"`
- Negative exponents with zero base: `"Zero cannot be raised to a negative power"`

## License

MIT

## Acknowledgements

OpenAI ChatGPT helped prepare the prompts and the ZED editor with agent coding of Claude did the implementation of the code.

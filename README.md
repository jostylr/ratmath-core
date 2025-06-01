# RatMath

A JavaScript library for exact rational arithmetic and interval arithmetic. The library provides classes for working with exact rational numbers using BigInt and closed intervals of rational numbers, along with a parser for interval expressions.

## Features

- **Exact Arithmetic**: All calculations are performed exactly, with no floating-point approximation errors.
- **Rational Numbers**: Represents fractions in lowest terms with arbitrary precision using JavaScript's built-in BigInt.
- **Mixed Number Notation**: Supports both standard fraction notation (a/b) and mixed number notation (a..b/c).
- **Fraction Representation**: Provides a Fraction class that maintains the exact numerator and denominator without automatic reduction.
- **Interval Arithmetic**: Supports operations on closed intervals with exact rational endpoints.
- **Fraction Intervals**: Implements intervals with Fraction endpoints for exact representation without automatic reduction.
- **Mediant Partitioning**: Create interval subdivisions using mediants (useful in continued fractions and number theory).
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

#### Static Methods

- **from(value)**: Creates a Rational from a number, string, or another Rational

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
- **toString()**: Returns a string representation ("low:high")
- **toMixedString()**: Returns a mixed number representation ("whole1..num1/den1:whole2..num2/den2")

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

## Error Handling

The library throws clear error messages for various error conditions:

- Division by zero: `"Division by zero"`
- Denominator is zero: `"Denominator cannot be zero"`
- Division by interval containing zero: `"Cannot divide by an interval containing zero"`
- Raising zero to power zero: `"Zero cannot be raised to the power of zero"`
- Negative exponents with zero base: `"Zero cannot be raised to a negative power"`

## License

MIT
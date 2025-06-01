# RatMath API Documentation

This document provides comprehensive API documentation for the RatMath library.

## Table of Contents

1. [Rational Class](#rational-class)
2. [Fraction Class](#fraction-class)
3. [RationalInterval Class](#rationalinterval-class)
4. [FractionInterval Class](#fractioninterval-class)
5. [Parser Class](#parser-class)

## Rational Class

The `Rational` class represents an exact rational number as a fraction with numerator and denominator in lowest terms.

### Constructor

#### `new Rational(numerator, denominator = 1)`

Creates a new Rational number.

**Parameters:**
- `numerator` (number|string|bigint): The numerator, or a string like "3/4"
- `denominator` (number|bigint, optional): The denominator (default: 1)

**Throws:**
- Error: If denominator is zero or if the input format is invalid

**Examples:**
```javascript
const r1 = new Rational(3, 4);     // 3/4
const r2 = new Rational('3/4');    // 3/4
const r3 = new Rational(5);        // 5/1
const r4 = new Rational(-1, 2);    // -1/2
const r5 = new Rational('2..1/2'); // 5/2 (mixed number notation)
```

### Properties

#### `numerator`

Gets the numerator of the rational number.

**Returns:** (bigint) The numerator

#### `denominator`

Gets the denominator of the rational number.

**Returns:** (bigint) The denominator

### Methods

#### `add(other)`

Adds another rational number to this one.

**Parameters:**
- `other` (Rational): The rational to add

**Returns:** (Rational) The sum as a new Rational

#### `subtract(other)`

Subtracts another rational number from this one.

**Parameters:**
- `other` (Rational): The rational to subtract

**Returns:** (Rational) The difference as a new Rational

#### `multiply(other)`

Multiplies this rational by another.

**Parameters:**
- `other` (Rational): The rational to multiply by

**Returns:** (Rational) The product as a new Rational

#### `divide(other)`

Divides this rational by another.

**Parameters:**
- `other` (Rational): The rational to divide by

**Returns:** (Rational) The quotient as a new Rational

**Throws:**
- Error: If other is zero

#### `negate()`

Returns the negation of this rational.

**Returns:** (Rational) The negation as a new Rational

#### `reciprocal()`

Returns the reciprocal of this rational.

**Returns:** (Rational) The reciprocal as a new Rational

**Throws:**
- Error: If this rational is zero

#### `pow(exponent)`

Raises this rational to an integer power.

**Parameters:**
- `exponent` (number|bigint): The exponent (must be an integer)

**Returns:** (Rational) The result as a new Rational

**Throws:**
- Error: If this rational is zero and exponent is negative, or if 0^0

#### `equals(other)`

Checks if this fraction equals another.

**Parameters:**
- `other` (Fraction): The fraction to compare with

**Returns:** (boolean) True if the fractions are equal (same numerator and denominator)

#### `lessThan(other)`

Checks if this fraction is less than another.

**Parameters:**
- `other` (Fraction): The fraction to compare with

**Returns:** (boolean) True if this fraction is less than the other

#### `lessThanOrEqual(other)`

Checks if this fraction is less than or equal to another.

**Parameters:**
- `other` (Fraction): The fraction to compare with

**Returns:** (boolean) True if this fraction is less than or equal to the other

#### `greaterThan(other)`

Checks if this fraction is greater than another.

**Parameters:**
- `other` (Fraction): The fraction to compare with

**Returns:** (boolean) True if this fraction is greater than the other

#### `greaterThanOrEqual(other)`

Checks if this fraction is greater than or equal to another.

**Parameters:**
- `other` (Fraction): The fraction to compare with

**Returns:** (boolean) True if this fraction is greater than or equal to the other
**Returns:** (boolean) True if the rationals are equal

#### `compareTo(other)`

Compares this rational with another.

**Parameters:**
- `other` (Rational): The rational to compare with

**Returns:** (number) -1 if this < other, 0 if equal, 1 if this > other

#### `lessThan(other)`

Checks if this rational is less than another.

**Parameters:**
- `other` (Rational): The rational to compare with

**Returns:** (boolean) True if this rational is less than other

#### `lessThanOrEqual(other)`

Checks if this rational is less than or equal to another.

**Parameters:**
- `other` (Rational): The rational to compare with

**Returns:** (boolean) True if this rational is less than or equal to other

#### `greaterThan(other)`

Checks if this rational is greater than another.

**Parameters:**
- `other` (Rational): The rational to compare with

**Returns:** (boolean) True if this rational is greater than other

#### `greaterThanOrEqual(other)`

Checks if this rational is greater than or equal to another.

**Parameters:**
- `other` (Rational): The rational to compare with

**Returns:** (boolean) True if this rational is greater than or equal to other

#### `abs()`

Returns the absolute value of this rational.

**Returns:** (Rational) The absolute value as a new Rational

#### `toString()`

Converts this rational to a string in the format "numerator/denominator" or just "numerator" if denominator is 1.

**Returns:** (string) String representation of this rational

#### `toMixedString()`

Converts this rational to a mixed number string in the format "a..b/c" where a is the whole part and b/c is the fractional part.

**Returns:** (string) Mixed number string representation

#### `toNumber()`

Approximates this rational as a JavaScript number.

**Returns:** (number) Floating-point approximation

### Static Methods

#### `Rational.from(value)`

Creates a Rational from a number, string, or another Rational.

**Parameters:**
- `value` (number|string|bigint|Rational): The value to convert

**Returns:** (Rational) A new Rational instance

### Static Properties

#### `Rational.zero`

A constant representing the rational number 0/1.

**Returns:** (Rational) The zero rational

#### `Rational.one`

A constant representing the rational number 1/1.

**Returns:** (Rational) The one rational

## RationalInterval Class

The `RationalInterval` class represents a closed interval of rational numbers [a, b].

### Constructor

#### `new RationalInterval(a, b)`

Creates a new RationalInterval.

**Parameters:**
- `a` (Rational|string|number|bigint): The first endpoint
- `b` (Rational|string|number|bigint): The second endpoint

**Throws:**
- Error: If the inputs cannot be converted to Rational numbers

**Examples:**
```javascript
const i1 = new RationalInterval('1/2', '3/4');     // [1/2, 3/4]
const i2 = new RationalInterval(1, 2);             // [1, 2]
const i3 = new RationalInterval(
  new Rational(1, 3),
  new Rational(2, 3)
);                                                 // [1/3, 2/3]
const i4 = new RationalInterval('1..1/2', '2..3/4'); // [3/2, 11/4]
```

### Properties

#### `low`

Gets the lower endpoint of the interval.

**Returns:** (Rational) The lower endpoint

#### `high`

Gets the higher endpoint of the interval.

**Returns:** (Rational) The higher endpoint

### Methods

#### `add(other)`

Adds another interval to this one: [a,b] + [c,d] = [a+c, b+d].

**Parameters:**
- `other` (RationalInterval): The interval to add

**Returns:** (RationalInterval) The sum as a new RationalInterval

#### `subtract(other)`

Subtracts another interval from this one: [a,b] - [c,d] = [a-d, b-c].

**Parameters:**
- `other` (RationalInterval): The interval to subtract

**Returns:** (RationalInterval) The difference as a new RationalInterval

#### `multiply(other)`

Multiplies this interval by another.

**Parameters:**
- `other` (RationalInterval): The interval to multiply by

**Returns:** (RationalInterval) The product as a new RationalInterval

#### `divide(other)`

Divides this interval by another.

**Parameters:**
- `other` (RationalInterval): The interval to divide by

**Returns:** (RationalInterval) The quotient as a new RationalInterval

**Throws:**
- Error: If the divisor interval contains zero

#### `pow(exponent)`

Raises this interval to an integer power. This applies the exponent to each element in the interval, which is encapsulated by applying it to the endpoints with appropriate handling for even/odd powers and intervals containing zero.

**Parameters:**
- `exponent` (number|bigint): The exponent (must be an integer)

**Returns:** (RationalInterval) The result as a new RationalInterval

**Throws:**
- Error: If raising to the power would involve division by zero or 0^0

#### `mpow(exponent)`

Raises this interval to an integer power using repeated multiplication. Unlike `pow`, which applies the power to individual elements, this method treats the interval as a whole and performs repeated multiplication (or division for negative exponents).

**Parameters:**
- `exponent` (number|bigint): The exponent (must be an integer, non-zero)

**Returns:** (RationalInterval) The result as a new RationalInterval

**Throws:**
- Error: If exponent is 0, as multiplicative exponentiation requires at least one factor

#### `negate()`

Returns the negation of this interval.

**Returns:** (RationalInterval) The negation as a new RationalInterval

#### `reciprocate()`

Returns the reciprocal of this interval.

**Returns:** (RationalInterval) The reciprocal as a new RationalInterval

**Throws:**
- Error: If this interval contains zero

#### `overlaps(other)`

Checks if this interval overlaps with another.

**Parameters:**
- `other` (RationalInterval): The interval to check against

**Returns:** (boolean) True if the intervals overlap

#### `contains(other)`

Checks if this interval entirely contains another.

**Parameters:**
- `other` (RationalInterval): The interval to check against

**Returns:** (boolean) True if this interval contains the other

#### `containsValue(value)`

Checks if a rational number is contained in this interval.

**Parameters:**
- `value` (Rational|string|number|bigint): The value to check

**Returns:** (boolean) True if the value is in the interval

#### `equals(other)`

Checks if this interval equals another.

**Parameters:**
- `other` (RationalInterval): The interval to compare with

**Returns:** (boolean) True if the intervals are equal

#### `intersection(other)`

Gets the intersection of this interval with another.

**Parameters:**
- `other` (RationalInterval): The interval to intersect with

**Returns:** (RationalInterval|null) The intersection interval, or null if they don't overlap

#### `union(other)`

Gets the union of this interval with another if they overlap or are adjacent.

**Parameters:**
- `other` (RationalInterval): The interval to unite with

**Returns:** (RationalInterval|null) The union interval, or null if they are disjoint

#### `toString()`

Converts this interval to a string in the format "low:high".

**Returns:** (string) String representation of this interval

#### `toMixedString()`

Converts this interval to a string in mixed number format "a..b/c:d..e/f" where endpoints are represented as mixed numbers.

**Returns:** (string) Mixed number string representation of this interval

### Static Methods

#### `RationalInterval.point(value)`

Creates a RationalInterval from a single value (creating a point interval).

**Parameters:**
- `value` (Rational|string|number|bigint): The value

**Returns:** (RationalInterval) A new point interval

#### `RationalInterval.fromString(str)`

Creates a RationalInterval from a string in the format "a:b".

**Parameters:**
- `str` (string): The string representation

**Returns:** (RationalInterval) A new interval

**Throws:**
- Error: If the string format is invalid

### Static Properties

#### `RationalInterval.zero`

A constant representing the interval [0, 0].

**Returns:** (RationalInterval) The zero interval

#### `RationalInterval.one`

A constant representing the interval [1, 1].

**Returns:** (RationalInterval) The one interval
### Static Properties

#### `RationalInterval.unitInterval`

A constant representing the interval [0, 1].

**Returns:** (RationalInterval) The unit interval from 0 to 1

## FractionInterval Class

The `FractionInterval` class represents a closed interval of fractions [a, b], preserving the exact representation of fractions without automatic reduction.

### Constructor

#### `new FractionInterval(a, b)`

Creates a new FractionInterval.

**Parameters:**
- `a` (Fraction): The first endpoint (must be a Fraction)
- `b` (Fraction): The second endpoint (must be a Fraction)

**Throws:**
- Error: If the inputs are not Fraction objects

**Examples:**
```javascript
const a = new Fraction(1, 3);
const b = new Fraction(2, 3);
const interval = new FractionInterval(a, b);  // [1/3, 2/3]
```

### Properties

#### `low`

Gets the lower endpoint of the interval.

**Returns:** (Fraction) The lower endpoint

#### `high`

Gets the higher endpoint of the interval.

**Returns:** (Fraction) The higher endpoint

### Methods

#### `mediantSplit()`

Creates a single mediant partition of the interval.
Splits the interval into two parts using the mediant of the endpoints.

**Returns:** (FractionInterval[]) Array of two subintervals

#### `partitionWithMediants(n = 1)`

Partitions the interval using mediants.
Recursively partitions the interval to a specified depth.
At each level, each existing interval is split into two using its mediant.

**Parameters:**
- `n` (number, optional): Depth of recursive mediant partitioning (must be non-negative, default: 1)

**Returns:** (FractionInterval[]) Array of subintervals after recursive splitting

**Throws:**
- Error: If n is negative

#### `partitionWith(fn)`

Partitions the interval using a custom partitioning function.

**Parameters:**
- `fn` (Function): Function taking two Fractions (endpoints) and returning an array of Fractions

**Returns:** (FractionInterval[]) Array of subintervals

**Throws:**
- Error: If the partition function returns non-Fraction objects or non-array

#### `toRationalInterval()`

Converts this FractionInterval to a RationalInterval.
The endpoints will be automatically reduced as per Rational's behavior.

**Returns:** (RationalInterval) Equivalent RationalInterval

#### `equals(other)`

Checks if this interval equals another.

**Parameters:**
- `other` (FractionInterval): The interval to compare with

**Returns:** (boolean) True if the intervals are equal

#### `toString()`

Converts this interval to a string in the format "low:high".

**Returns:** (string) String representation of this interval

### Static Methods

#### `FractionInterval.fromRationalInterval(interval)`

Creates a FractionInterval from a RationalInterval.

**Parameters:**
- `interval` (RationalInterval): The interval to convert

**Returns:** (FractionInterval) Equivalent FractionInterval

## Parser Class

The `Parser` class parses and evaluates string expressions involving rational intervals.

### Static Methods

#### `Parser.parse(expression)`

Parses a string representing an interval arithmetic expression.

**Parameters:**
- `expression` (string): The expression to parse

**Returns:** (RationalInterval) The result of evaluating the expression

**Throws:**
- Error: If the expression syntax is invalid

**Supported operations:**
- Addition (`+`)
- Subtraction (`-`)
- Multiplication (`*`)
- Division (`/`)
- Standard exponentiation (`^`) - applies power to each element in the interval
- Multiplicative exponentiation (`**`) - applies power by repeated multiplication of intervals
- Parentheses for grouping
- Negation (`-`)
- Interval notation (`a:b`)

**Examples:**
```javascript
// Single rationals
Parser.parse('3/4');              // Point interval [3/4, 3/4]
Parser.parse('2..1/3');           // Point interval [7/3, 7/3] (mixed number)

// Intervals
Parser.parse('1/2:3/4');          // Interval [1/2, 3/4]
Parser.parse('1..1/2:2..3/4');    // Interval [3/2, 11/4] (mixed numbers)

// Arithmetic with rationals
Parser.parse('1/2 + 1/4');        // [3/4, 3/4]
Parser.parse('1/2 - 1/4');        // [1/4, 1/4]
Parser.parse('1/2 * 1/4');        // [1/8, 1/8]
Parser.parse('1/2 / 1/4');        // [2, 2]
Parser.parse('1/2^3');            // [1/8, 1/8]
Parser.parse('2^-1');             // [1/2, 1/2]

// Arithmetic with intervals
Parser.parse('1/2:3/4 + 1/4:1/2');// [3/4, 5/4]
Parser.parse('1/2:3/4 * 2:3');    // [1, 9/4]

// Complex expressions
Parser.parse('(1/2:3/4 + 1/4) * (3/2 - 1/2:1)'); // [3/8, 5/4]

// Multiplicative power
Parser.parse('(1/2:3/4)**2');                  // Different from (1/2:3/4)^2

// Using constants
Parser.parse('0:1');                           // Same as RationalInterval.unitInterval
```
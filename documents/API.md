# RatMath API Documentation

This document provides comprehensive API documentation for the RatMath library.

## Table of Contents

1. [Rational Class](#rational-class)
2. [Integer Class](#integer-class)
3. [Fraction Class](#fraction-class)
4. [RationalInterval Class](#rationalinterval-class)
5. [FractionInterval Class](#fractioninterval-class)
6. [Parser Class](#parser-class)

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

Checks if this rational equals another.

**Parameters:**
- `other` (Rational): The rational to compare with

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

#### `toRepeatingDecimal()`

Converts this rational to its repeating decimal string representation.

**Returns:** (string) Repeating decimal string (e.g., "1/3" becomes "0.#3")

#### `toDecimal()`

Converts this rational to a standard decimal string representation. For terminating decimals, returns the exact decimal. For repeating decimals, returns an approximation with sufficient precision.

**Returns:** (string) Decimal string representation

#### `E(exponent)`

Applies E notation to this rational number by multiplying by 10^exponent. This is equivalent to shifting the decimal point by the specified number of places.

**Parameters:**
- `exponent` (number|bigint): The exponent for the power of 10

**Returns:** (Rational) A new Rational representing this * 10^exponent

**Throws:**
- Error: If the exponent is not an integer

**Examples:**
```javascript
new Rational(5).E(2)        // 500 (5 * 10^2)
new Rational(1, 4).E(-1)    // 0.025 (0.25 * 10^-1)
new Rational(123).E(-2)     // 1.23 (123 * 10^-2)
new Rational(1, 3).E(3)     // Same as 1/3 * 10^3 = 1000/3
```

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

## Integer Class

The `Integer` class represents an exact integer using BigInt for arbitrary precision arithmetic. Division automatically returns an Integer for exact results or a Rational for non-exact results.

### Constructor

#### `new Integer(value)`

Creates a new Integer.

**Parameters:**
- `value` (number|string|bigint): The integer value

**Throws:**
- Error: If the input is not a valid integer

**Examples:**
```javascript
const i1 = new Integer(42);
const i2 = new Integer('123');
const i3 = new Integer(-456n);
```

### Properties

#### `value`

Gets the value of the integer.

**Returns:** (bigint) The integer value

### Methods

#### `E(exponent)`

Applies E notation to this integer by multiplying by 10^exponent. This is equivalent to shifting the decimal point by the specified number of places. For negative exponents, returns a Rational since the result may not be an integer.

**Parameters:**
- `exponent` (number|bigint): The exponent for the power of 10

**Returns:** (Integer|Rational) A new Integer for non-negative exponents, or Rational for negative exponents

**Throws:**
- Error: If the exponent is not an integer

**Examples:**
```javascript
new Integer(5).E(2)        // 500 (Integer: 5 * 10^2)
new Integer(123).E(0)      // 123 (Integer: 123 * 10^0)
new Integer(45).E(-1)      // 4.5 (Rational: 45 * 10^-1)
new Integer(100).E(-2)     // 1 (Rational: 100 * 10^-2)
new Integer(3).E(4)        // 30000 (Integer: 3 * 10^4)
```

#### `add(other)`

Adds another integer to this one.

**Parameters:**
- `other` (Integer): The integer to add

**Returns:** (Integer) The sum as a new Integer

#### `subtract(other)`

Subtracts another integer from this one.

**Parameters:**
- `other` (Integer): The integer to subtract

**Returns:** (Integer) The difference as a new Integer

#### `multiply(other)`

Multiplies this integer by another.

**Parameters:**
- `other` (Integer): The integer to multiply by

**Returns:** (Integer) The product as a new Integer

#### `divide(other)`

Divides this integer by another.

**Parameters:**
- `other` (Integer): The integer to divide by

**Returns:** (Integer|Rational) The quotient as an Integer if exact, otherwise a Rational

**Throws:**
- Error: If other is zero

#### `modulo(other)`

Computes the remainder when dividing this integer by another.

**Parameters:**
- `other` (Integer): The integer to divide by

**Returns:** (Integer) The remainder as a new Integer

**Throws:**
- Error: If other is zero

#### `negate()`

Returns the negation of this integer.

**Returns:** (Integer) The negation as a new Integer

#### `pow(exponent)`

Raises this integer to an integer power.

**Parameters:**
- `exponent` (number|bigint|Integer): The exponent

**Returns:** (Integer|Rational) Integer for non-negative exponents, Rational for negative exponents

**Throws:**
- Error: If this integer is zero and exponent is negative

#### `equals(other)`

Checks if this integer equals another.

**Parameters:**
- `other` (Integer): The integer to compare with

**Returns:** (boolean) True if the integers are equal

#### `compareTo(other)`

Compares this integer with another.

**Parameters:**
- `other` (Integer): The integer to compare with

**Returns:** (number) -1 if this < other, 0 if equal, 1 if this > other

#### `lessThan(other)`

Checks if this integer is less than another.

**Parameters:**
- `other` (Integer): The integer to compare with

**Returns:** (boolean) True if this integer is less than other

#### `lessThanOrEqual(other)`

Checks if this integer is less than or equal to another.

**Parameters:**
- `other` (Integer): The integer to compare with

**Returns:** (boolean) True if this integer is less than or equal to other

#### `greaterThan(other)`

Checks if this integer is greater than another.

**Parameters:**
- `other` (Integer): The integer to compare with

**Returns:** (boolean) True if this integer is greater than other

#### `greaterThanOrEqual(other)`

Checks if this integer is greater than or equal to another.

**Parameters:**
- `other` (Integer): The integer to compare with

**Returns:** (boolean) True if this integer is greater than or equal to other

#### `abs()`

Returns the absolute value of this integer.

**Returns:** (Integer) The absolute value as a new Integer

#### `sign()`

Returns the sign of this integer.

**Returns:** (Integer) -1 for negative, 0 for zero, 1 for positive

#### `isEven()`

Checks if this integer is even.

**Returns:** (boolean) True if the integer is even

#### `isOdd()`

Checks if this integer is odd.

**Returns:** (boolean) True if the integer is odd

#### `isZero()`

Checks if this integer is zero.

**Returns:** (boolean) True if the integer is zero

#### `isPositive()`

Checks if this integer is positive.

**Returns:** (boolean) True if the integer is positive

#### `isNegative()`

Checks if this integer is negative.

**Returns:** (boolean) True if the integer is negative

#### `gcd(other)`

Computes the greatest common divisor with another integer.

**Parameters:**
- `other` (Integer): The other integer

**Returns:** (Integer) The GCD as a new Integer

#### `lcm(other)`

Computes the least common multiple with another integer.

**Parameters:**
- `other` (Integer): The other integer

**Returns:** (Integer) The LCM as a new Integer

#### `factorial()`

Computes the factorial of this integer (n!).

The factorial of a non-negative integer n is the product of all positive integers less than or equal to n. By definition, 0! = 1.

**Returns:** (Integer) The factorial as a new Integer

**Throws:** Error if this integer is negative

**Example:**
```javascript
const a = new Integer(5);
const b = new Integer(0);
console.log(a.factorial());  // 120 (5 × 4 × 3 × 2 × 1)
console.log(b.factorial());  // 1 (by definition)
```

#### `doubleFactorial()`

Computes the double factorial of this integer (n!!).

The double factorial of a positive integer n is the product of all positive integers up to n that have the same parity (odd or even) as n. By definition, 0!! = 1 and 1!! = 1.

**Returns:** (Integer) The double factorial as a new Integer

**Throws:** Error if this integer is negative

**Example:**
```javascript
const a = new Integer(5);
const b = new Integer(6);
console.log(a.doubleFactorial());  // 15 (5 × 3 × 1)
console.log(b.doubleFactorial());  // 48 (6 × 4 × 2)
```

#### `toString()`

Converts this integer to a string.

**Returns:** (string) String representation of this integer

#### `toNumber()`

Converts this integer to a JavaScript number.

**Returns:** (number) Floating-point approximation

#### `toRational()`

Converts this integer to a Rational.

**Returns:** (Rational) This integer as a Rational with denominator 1

### Static Methods

#### `Integer.from(value)`

Creates an Integer from a number, string, bigint, or another Integer.

**Parameters:**
- `value` (number|string|bigint|Integer): The value to convert

**Returns:** (Integer) A new Integer instance

#### `Integer.fromRational(rational)`

Creates an Integer from a Rational if it represents a whole number.

**Parameters:**
- `rational` (Rational): The rational to convert

**Returns:** (Integer) A new Integer instance

**Throws:**
- Error: If the rational is not a whole number

### Static Properties

#### `Integer.zero`

A constant representing the integer 0.

**Returns:** (Integer) The zero integer

#### `Integer.one`

A constant representing the integer 1.

**Returns:** (Integer) The one integer

## Fraction Class

The `Fraction` class represents fractions as pairs of BigInt numerator and denominator. Unlike Rational, fractions are not automatically reduced - 1/2 and 2/4 are distinct.

### Constructor

#### `new Fraction(numerator, denominator = 1)`

Creates a new Fraction.

**Parameters:**
- `numerator` (number|string|bigint): The numerator, or a string like "3/4"
- `denominator` (number|bigint, optional): The denominator (default: 1)

**Throws:**
- Error: If denominator is zero or if the input format is invalid

**Examples:**
```javascript
const f1 = new Fraction(1, 2);     // 1/2
const f2 = new Fraction('3/4');    // 3/4
const f3 = new Fraction(5);        // 5/1
const f4 = new Fraction(2, 4);     // 2/4 (not reduced)
```

### Properties

#### `numerator`

Gets the numerator of the fraction.

**Returns:** (bigint) The numerator

#### `denominator`

Gets the denominator of the fraction.

**Returns:** (bigint) The denominator

### Methods

#### `E(exponent)`

Applies E notation to this fraction by multiplying by 10^exponent. This is equivalent to shifting the decimal point by the specified number of places.

**Parameters:**
- `exponent` (number|bigint): The exponent for the power of 10

**Returns:** (Fraction) A new Fraction representing this * 10^exponent

**Throws:**
- Error: If the exponent is not an integer

**Examples:**
```javascript
new Fraction(5, 4).E(2)        // 500/4 (5/4 * 10^2)
new Fraction(3, 8).E(-1)       // 3/80 (3/8 * 10^-1)
new Fraction(123, 100).E(-2)   // 123/10000 (123/100 * 10^-2)
new Fraction(1, 3).E(3)        // 1000/3 (1/3 * 10^3)
```

#### `add(other)`

Adds another fraction to this one. Only works if denominators are the same.

**Parameters:**
- `other` (Fraction): The fraction to add

**Returns:** (Fraction) The sum as a new Fraction

**Throws:** Error if denominators are not equal

#### `subtract(other)`

Subtracts another fraction from this one. Only works if denominators are the same.

**Parameters:**
- `other` (Fraction): The fraction to subtract

**Returns:** (Fraction) The difference as a new Fraction

**Throws:** Error if denominators are not equal

#### `multiply(other)`

Multiplies this fraction by another.

**Parameters:**
- `other` (Fraction): The fraction to multiply by

**Returns:** (Fraction) The product as a new Fraction

#### `divide(other)`

Divides this fraction by another.

**Parameters:**
- `other` (Fraction): The fraction to divide by

**Returns:** (Fraction) The quotient as a new Fraction

**Throws:** Error if other has a zero numerator

#### `pow(exponent)`

Raises this fraction to an integer power.

**Parameters:**
- `exponent` (number|bigint): The exponent (must be an integer)

**Returns:** (Fraction) The result as a new Fraction

**Throws:** Error if this fraction is zero and exponent is negative, or if 0^0

#### `scale(factor)`

Scales both numerator and denominator by a factor.

**Parameters:**
- `factor` (number|bigint): The scaling factor

**Returns:** (Fraction) A new scaled Fraction

#### `reduce()`

Returns a reduced version of this fraction.

**Returns:** (Fraction) A new Fraction in lowest terms

#### `toRational()`

Converts this Fraction to a Rational. The result will be automatically reduced as per Rational's behavior.

**Returns:** (Rational) Equivalent Rational (automatically reduced)

#### `toString()`

Converts this fraction to a string in the format "numerator/denominator" or just "numerator" if denominator is 1.

**Returns:** (string) String representation of this fraction

#### `equals(other)`

Checks if this fraction equals another. Note that this checks for exact equality of numerator and denominator, not mathematical equivalence.

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

### Static Methods

#### `Fraction.mediant(a, b)`

Calculates the mediant of two fractions. The mediant of fractions a/b and c/d is (a+c)/(b+d).

**Parameters:**
- `a` (Fraction): First fraction
- `b` (Fraction): Second fraction

**Returns:** (Fraction) The mediant (a.numerator + b.numerator) / (a.denominator + b.denominator)

#### `Fraction.fromRational(rational)`

Creates a Fraction from a Rational.

**Parameters:**
- `rational` (Rational): The rational to convert

**Returns:** (Fraction) Equivalent Fraction

## RationalInterval Class

The `RationalInterval` class represents closed intervals of rational numbers. Each interval is represented as [a, b] where a and b are Rational numbers.

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
const i1 = new RationalInterval(1, 2);           // [1, 2]
const i2 = new RationalInterval('1/3', '2/3');   // [1/3, 2/3]
const i3 = new RationalInterval(new Rational(1, 4), new Rational(3, 4));
```

### Properties

#### `low`

Gets the lower endpoint of the interval.

**Returns:** (Rational) The lower endpoint

#### `high`

Gets the higher endpoint of the interval.

**Returns:** (Rational) The higher endpoint

### Methods

#### `E(exponent)`

Applies E notation to this rational interval by multiplying both endpoints by 10^exponent. This is equivalent to shifting the decimal point by the specified number of places.

**Parameters:**
- `exponent` (number|bigint): The exponent for the power of 10

**Returns:** (RationalInterval) A new RationalInterval representing this interval * 10^exponent

**Throws:**
- Error: If the exponent is not an integer

**Examples:**
```javascript
new RationalInterval(1, 2).E(2)        // [100, 200] (interval [1,2] * 10^2)
new RationalInterval(1.5, 2.5).E(-1)   // [0.15, 0.25] (interval [1.5,2.5] * 10^-1)
new RationalInterval(10, 20).E(-1)     // [1, 2] (interval [10,20] * 10^-1)
new RationalInterval("1/3", "2/3").E(3) // [1000/3, 2000/3]
```

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

#### `mediant()`

Calculates the mediant of the interval endpoints. The mediant of fractions a/b and c/d is (a+c)/(b+d). This is useful in continued fraction approximations and the Stern-Brocot tree.

**Returns:** (Rational) The mediant of the low and high endpoints

#### `midpoint()`

Calculates the arithmetic midpoint of the interval. The midpoint of [a, b] is (a + b) / 2.

**Returns:** (Rational) The midpoint of the interval

#### `shortestDecimal(base = 10)`

Finds the rational number in the interval with the smallest denominator that is a power of the given base. The algorithm uses a mathematical bound based on the interval length to efficiently determine when to stop searching: for an interval of length L, it only needs to check denominators up to base^⌈log(1/L)/log(base)⌉.

For point intervals (where low equals high), returns the value if it has a power-of-base denominator, or null if it doesn't.

**Parameters:**
- `base` (number|bigint): The base (default: 10)

**Returns:** (Rational|null) The rational with smallest power-of-base denominator in the interval, or null if none exists

**Throws:**
- Error: If base is not a positive integer greater than 1

#### `randomRational(maxDenominator = 1000)`

Generates a uniformly random rational number from the closed interval. The randomness is uniform over all reduced fractions with denominators up to maxDenominator.

**Parameters:**
- `maxDenominator` (number|bigint): Maximum denominator to consider (default: 1000)

**Returns:** (Rational) A random rational number from the interval

**Throws:**
- Error: If maxDenominator is not a positive integer

#### `toRepeatingDecimal()`

Converts this interval to its repeating decimal string representation.

**Returns:** (string) Repeating decimal interval string (e.g., "1/3:1/2" becomes "0.#3:0.5#0")

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

The `FractionInterval` class represents closed intervals of fractions. Each interval is represented as [a, b] where a and b are Fraction objects. Unlike RationalInterval, this preserves the exact representation of fractions without automatic reduction.

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
const f1 = new Fraction(1, 3);
const f2 = new Fraction(2, 3);
const interval = new FractionInterval(f1, f2); // [1/3, 2/3]
```

### Properties

#### `low`

Gets the lower endpoint of the interval.

**Returns:** (Fraction) The lower endpoint

#### `high`

Gets the higher endpoint of the interval.

**Returns:** (Fraction) The higher endpoint

### Methods

#### `E(exponent)`

Applies E notation to this fraction interval by multiplying both endpoints by 10^exponent. This is equivalent to shifting the decimal point by the specified number of places.

**Parameters:**
- `exponent` (number|bigint): The exponent for the power of 10

**Returns:** (FractionInterval) A new FractionInterval representing this interval * 10^exponent

**Throws:**
- Error: If the exponent is not an integer

**Examples:**
```javascript
new FractionInterval(new Fraction(1, 2), new Fraction(3, 4)).E(2)  // [50, 75] (as fractions: [100/2, 300/4])
new FractionInterval(new Fraction(5, 2), new Fraction(7, 2)).E(-1) // [0.25, 0.35] (as fractions: [5/20, 7/20])
new FractionInterval(new Fraction(1, 3), new Fraction(2, 3)).E(3) // [1000/3, 2000/3]
```

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

#### `Parser.parse(expression, options = {})`

Parses a string representing an interval arithmetic expression.

**Parameters:**
- `expression` (string): The expression to parse
- `options` (Object): Optional parsing options
  - `typeAware` (boolean): When true, returns precise types (Integer, Rational, RationalInterval) instead of always returning RationalInterval

**Returns:** (RationalInterval|Integer|Rational) The result of evaluating the expression. Return type depends on the `typeAware` option and the expression content.

**Throws:**
- Error: If the expression syntax is invalid

**Supported operations:**
- Addition (`+`)
- Subtraction (`-`)
- Multiplication (`*`)
- Division (`/`)
- Standard exponentiation (`^`) - applies power to each element in the interval
- Multiplicative exponentiation (`**`) - applies power by repeated multiplication of intervals
- Factorial (`!`) - computes factorial of positive integers
- Double factorial (`!!`) - computes double factorial of positive integers
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

// Factorial operations (with type-aware parsing)
Parser.parse('5!', { typeAware: true });       // 120 (Integer)
Parser.parse('6!!', { typeAware: true });      // 48 (Integer: 6×4×2)
Parser.parse('5!! + 3!', { typeAware: true }); // 21 (Integer: 15+6)
Parser.parse('(2+3)!', { typeAware: true });   // 120 (Integer: 5!)
Parser.parse('2!^3', { typeAware: true });     // 8 (Integer: 2^3, factorial has higher precedence)

// Factorial with backward compatibility (returns intervals)
Parser.parse('5!');                            // [120, 120]
Parser.parse('6!!');                           // [48, 48]

// Using constants
Parser.parse('0:1');                           // Same as RationalInterval.unitInterval
```
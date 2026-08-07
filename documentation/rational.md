---
title: Rational
---

`Rational` represents an exact ratio of two arbitrary-precision integers. It
always reduces to lowest terms and keeps the denominator positive.

## Construction and constants

```js
import { Rational } from "@ratmath/core";

new Rational(6, -8).toString(); // "-3/4"
new Rational("2..1/3").toString(); // "7/3"
Rational.from(5n).toString();   // "5"

Rational.zero.toString();       // "0"
Rational.one.toString();        // "1"
```

The constructor accepts a numerator plus an optional denominator. A string
constructor accepts integers, fractions, mixed fractions, and finite decimals;
use the [parsing helpers](parsing.md) for repeating decimals, continued
fractions, or intervals. A zero denominator throws.

The read-only `numerator` and `denominator` properties are normalized
`bigint`s.

## Arithmetic and comparison

| Method | Behavior |
|---|---|
| `add(other)` | Exact sum; an interval operand produces `RationalInterval` |
| `subtract(other)` | Exact difference; an interval operand produces `RationalInterval` |
| `multiply(other)` | Exact product; an interval operand produces `RationalInterval` |
| `divide(other)` | Exact quotient; division by zero throws |
| `negate()` | Additive inverse |
| `reciprocal()` | Swaps numerator and denominator; zero throws |
| `pow(exponent)` | Exact integer power, including negative powers |
| `abs()` | Absolute value |
| `equals(other)` | Mathematical equality |
| `compareTo(other)` | `-1`, `0`, or `1` |
| `lessThan`, `lessThanOrEqual` | Ordered comparisons |
| `greaterThan`, `greaterThanOrEqual` | Ordered comparisons |
| `E(exponent)` | Multiply by exact `10^exponent` |
| `bitLength()` | Maximum of numerator and denominator bit lengths |

```js
const x = new Rational(2, 3);

x.add(new Rational(5, 6)).toString(); // "3/2"
x.pow(-2).toString();                 // "9/4"
x.E(3).toString();                    // "2000/3"
x.lessThan(new Rational(3, 4));       // true
```

`0^0`, zero to a negative power, and a non-integer exponent throw.

## Fraction, mixed, and numeric output

| Method | Result |
|---|---|
| `toString(base?)` | Reduced fraction, or an integer when denominator is one |
| `toMixedString()` | RiX mixed form such as `-2..1/4` |
| `toNumber()` | JavaScript `number`; potentially inexact |
| `toDecimal()` | Display decimal with at most 20 fractional digits, including for longer terminating expansions |

```js
const x = new Rational(-9, 4);

x.toString();      // "-9/4"
x.toMixedString(); // "-2..1/4"
x.toNumber();      // -2.25
x.toDecimal();     // "-2.25"
```

## Repeating decimal output

| Method | Result |
|---|---|
| `toRepeatingDecimal()` | Exact base-10 string using `#` repeat notation |
| `toRepeatingDecimalWithPeriod(useRepeatNotation?)` | `{ decimal, period }` |
| `computeDecimalMetadata(maxPeriodDigits?)` | Segments and period metadata used by formatters |
| `extractPeriodSegment(initial, periodLength, digits)` | Repeats/truncates a known period segment to the requested length |
| `toScientificNotation(useRepeatNotation?, precision?, showPeriodInfo?)` | Decimal scientific display |

```js
const x = new Rational(1, 6);

x.toRepeatingDecimal(); // "0.1#6"
x.toRepeatingDecimalWithPeriod();
// { decimal: "0.1#6", period: 1 }

x.computeDecimalMetadata();
// includes initialSegment: "1", periodDigits: "6",
// periodLength: 1, isTerminating: false

new Rational(12345).toScientificNotation(); // "1.2345E4"
```

`Rational.DEFAULT_PERIOD_DIGITS`, `MAX_PERIOD_DIGITS`, and
`MAX_PERIOD_CHECK` are the public limits used by these formatting operations.
For exact interchange, prefer `toString()` or `toRepeatingDecimal()`.

## Arbitrary-base output

| Method | Result |
|---|---|
| `toBase(system)` | Integer or numerator/denominator digits; no radix expansion |
| `toRepeatingBase(system)` | Exact radix expansion with `#` before the repeating block |
| `toRepeatingBaseWithPeriod(system, options?)` | `{ baseStr, period, limitHit }` |
| `periodModulo(system, limit?)` | Multiplicative-order period length, or `0` when terminating; throws if the iteration limit is exceeded |

```js
import { BaseSystem } from "@ratmath/core";

const third = new Rational(1, 3);

third.toBase(BaseSystem.BINARY);          // "1/11"
third.toRepeatingBase(BaseSystem.BINARY); // "0.#01"
third.toRepeatingBaseWithPeriod(BaseSystem.BINARY);
// { baseStr: "0.#01", period: 2, limitHit: false }
```

`toRepeatingBaseWithPeriod` accepts `useRepeatNotation` (default `true`) and
`limit`. If the digit-generation limit is reached, `limitHit` is `true` and the
returned expansion is partial.

## Continued fractions

| Method | Result |
|---|---|
| `toContinuedFraction(maxTerms?)` | Array of `bigint` coefficients |
| `toContinuedFractionString()` | RiX `a0.~a1~...` representation |
| `convergents(maxCount?)` | Successive rational convergents |
| `getConvergent(index)` | Zero-based convergent; throws if out of range |
| `bestApproximation(maxDenominator)` | Closest value whose positive denominator does not exceed the bound |
| `bestConvergent(maxDenominator)` | Last continued-fraction convergent within the bound |
| `approximationError(target)` | Absolute difference from the target |
| `Rational.fromContinuedFraction(coefficients)` | Rational from a finite coefficient array |
| `Rational.fromContinuedFractionString(text)` | Rational from `.~` notation |
| `Rational.convergentsFromCF(input, maxCount?)` | Convergents from an array or string |

```js
const value = new Rational(333, 106);

value.toContinuedFraction();       // [3n, 7n, 15n]
value.toContinuedFractionString(); // "3.~7~15"
value.convergents().map((v) => v.toString());
// ["3", "22/7", "333/106"]

Rational.fromContinuedFraction([3n, 7n, 15n]).toString();
// "333/106"

const pi = new Rational(355, 113);
pi.bestApproximation(100n).toString(); // "311/99"
pi.bestConvergent(100n).toString();    // "22/7"
```

`Rational.DEFAULT_CF_LIMIT` is the default maximum coefficient/convergent
count. Continued fractions here are finite because every `Rational` is exact
and rational.

`bestApproximation` minimizes ordinary absolute error among rational values
whose denominator is at most the positive `bigint` bound. Its result may be a
semiconvergent. `bestConvergent` expresses the related continued-fraction
theorem: convergents are best approximations of the second kind, minimizing
the denominator-weighted error `|q*x - p|` at the relevant denominator
thresholds.

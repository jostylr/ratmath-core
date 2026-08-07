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
| `toString(base?, options?)` | Reduced fraction, or radix expansion when a base is supplied |
| `toMixedString()` | RiX mixed form such as `-2..1/4` |
| `toNumber()` | JavaScript `number`; potentially inexact |
| `toDecimal(maxDigits?)` | Display decimal with a configurable fractional-digit limit |

```js
const x = new Rational(-9, 4);

x.toString();      // "-9/4"
x.toMixedString(); // "-2..1/4"
x.toNumber();      // -2.25
x.toDecimal();     // "-2.25"
```

`Rational.DEFAULT_DECIMAL_DIGITS` is the mutable default for `toDecimal()`
(20 initially). `toDecimal(maxDigits)` overrides it for one call. This method
is display-oriented; use a fraction or complete repeating expansion for exact
interchange.

## Repeating decimal output

| Method | Result |
|---|---|
| `toRepeatingDecimal(limit?, onLimit?)` | Exact base-10 `#` notation, with a default period limit of 30 |
| `toRepeatingDecimalWithPeriod(options?)` | `{ decimal, period, truncated }` |
| `computeDecimalMetadata(maxPeriodDigits?)` | Segments and period metadata used by formatters |
| `extractPeriodSegment(initial, periodLength, digits)` | Repeats/truncates a known period segment to the requested length |
| `toScientificNotation(useRepeatNotation?, precision?, showPeriodInfo?)` | Decimal scientific display |

```js
const x = new Rational(1, 6);

x.toRepeatingDecimal(); // "0.1#6"
x.toRepeatingDecimalWithPeriod();
// { decimal: "0.1#6", period: 1, truncated: false }

x.computeDecimalMetadata();
// includes initialSegment: "1", periodDigits: "6",
// periodLength: 1, isTerminating: false

new Rational(12345).toScientificNotation(); // "1.2345E4"
```

`Rational.DEFAULT_SCIENTIFIC_PRECISION` is the mutable default precision for
scientific display (11 initially); the second method argument overrides it.

`Rational.MAX_PERIOD_DIGITS` is the mutable global default for decimal-period
output and metadata (30 initially). Explicit method arguments override it.
`Rational.MAX_PERIOD_CHECK` limits period-length discovery work and must be a
positive safe integer. Scientific period diagnostics report its current value.
`onLimit` is `"error"` (default), `"null"`, or `"trunc"`. Truncated output
uses `#` to mark where repetition begins and ends in `...` to show that the
period is incomplete; it is informative rather than parseable. Output with
`#` and no ellipsis contains the complete period. For exact interchange, use
`toString()` or choose a `toRepeatingDecimal` limit large enough for the
reported period.

Exact rounding is available through `floor()`, `ceil()`, `trunc()`,
`round(mode?)`, and `roundTo(places, mode?)`. Integer rounding methods return
`bigint`; supported modes are `half-even`, `half-up`, `toward-zero`, `floor`,
and `ceil`.

## Arbitrary-base output

| Method | Result |
|---|---|
| `toBase(system)` | Integer or numerator/denominator digits; no radix expansion |
| `toRepeatingBase(system, options?)` | Radix expansion with `#` before a complete repeating block |
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
returned expansion is partial and ends in `...`. `toRepeatingBase` accepts the
same options but returns only the string. `Rational.DEFAULT_BASE_LIMIT` is the
mutable global default (1,000 initially), and
`Rational.DEFAULT_PERIOD_MODULO_LIMIT` similarly controls `periodModulo`
(1,000,000 initially). Explicit method limits override both defaults.

## Continued fractions

| Method | Result |
|---|---|
| `toContinuedFraction(options?)` | Array of `bigint` coefficients; accepts a numeric term limit or `{ maxTerms, long }` |
| `toContinuedFractionString(options?)` | RiX `a0.~a1~...` representation with the same options |
| `convergents(options?)` | Principal convergents; accepts a numeric count limit or `{ maxCount, long, intermediates }` |
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

const fourThirds = new Rational(4, 3);
fourThirds.toContinuedFraction();               // [1n, 3n]
fourThirds.toContinuedFraction({ long: true }); // [1n, 2n, 1n]
fourThirds.convergents({ long: true }).map((v) => v.toString());
// ["1", "3/2", "4/3"]
fourThirds.convergents({ intermediates: true }).map((v) => v.toString());
// ["1", "2", "3/2", "4/3"]

Rational.fromContinuedFraction([3n, 7n, 15n]).toString();
// "333/106"

const pi = new Rational(355, 113);
pi.bestApproximation(100n).toString(); // "311/99"
pi.bestConvergent(100n).toString();    // "22/7"
```

`Rational.DEFAULT_CF_LIMIT` is the default maximum coefficient/convergent
count. Continued fractions here are finite because every `Rational` is exact
and rational.

If a coefficient array reaches its limit before the rational's expansion is
complete, it is a prefix and represents the corresponding convergent.
`toContinuedFractionString()` makes this condition visible with a trailing
`~...`; that informative form is deliberately rejected by the exact parser.
Increase `maxTerms` until no ellipsis is present for an exact round trip. This
also covers the boundary where long form needs one more term than canonical
form.

The default expansion is canonical: except for an integer-only expansion, its
last coefficient is greater than `1`. The long alternative replaces the final
coefficient `a` with `a - 1, 1`; an integer `[a]` therefore has long form
`[a - 1, 1]`. With `intermediates: true`, `convergents()` includes the
fractions encountered while stepping through each coefficient run, including
the principal endpoints. Combining `long` and `intermediates` applies that
walk to the long expansion.

These choices are derived from the rational's value. A `Rational` does not
retain the coefficients used to construct it. When the convergents of a
specific supplied representation are wanted, use
`Rational.convergentsFromCF(input, maxCount?)`; for example, the explicit
noncanonical input `[1n, 2n, 1n]` produces `1`, `3/2`, and `4/3`.

`bestApproximation` minimizes ordinary absolute error among rational values
whose denominator is at most the positive `bigint` bound. Its result may be a
semiconvergent. `bestConvergent` expresses the related continued-fraction
theorem: convergents are best approximations of the second kind, minimizing
the denominator-weighted error `|q*x - p|` at the relevant denominator
thresholds.

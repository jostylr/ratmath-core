---
title: RationalInterval
---

`RationalInterval` is a closed interval with exact `Rational` endpoints.
Arithmetic returns an interval guaranteed to contain every possible result.

## Construction and orientation

```js
import { RationalInterval } from "@ratmath/core";

const interval = new RationalInterval("3/4", "1/4");

interval.start.toString(); // "3/4"
interval.end.toString();   // "1/4"
interval.isAscending;      // false
interval.low.toString();   // "1/4"
interval.high.toString();  // "3/4"
interval.toString();       // "3/4:1/4"
```

`start` and `end` preserve presentation order. `low` and `high` are sorted and
are used for mathematical operations. `equals` compares the sorted bounds, so
opposite orientations are mathematically equal.

`RationalInterval.zero`, `one`, and `unitInterval` are frozen point/range
constants. `RationalInterval.point(value)` constructs `[value, value]`.
`RationalInterval.fromString(text)` accepts `a:b` and delegates endpoint
conversion to `Rational`; use [`parseInterval`](parsing.md) for all compact RiX
forms.

## Interval arithmetic

| Method | Behavior |
|---|---|
| `add(other)` | `[a,b] + [c,d] = [a+c,b+d]` |
| `subtract(other)` | `[a,b] - [c,d] = [a-d,b-c]` |
| `multiply(other)` | Bounds all four endpoint products |
| `divide(other)` | Bounds all four endpoint quotients; divisor may not contain zero |
| `reciprocate()` | `[1/high,1/low]`; interval may not contain zero |
| `negate()` | `[-high,-low]` |
| `pow(exponent)` | Pointwise image `{x^n | x in interval}` |
| `mpow(exponent)` | Repeated interval multiplication; dependency is not preserved |
| `E(exponent)` | Scales both bounds by exact `10^exponent` |

```js
const a = new RationalInterval(1, 2);
const b = new RationalInterval(3, 4);

a.add(b).toString();      // "4:6"
a.multiply(b).toString(); // "3:8"

new RationalInterval(-2, 3).pow(2).toString();  // "0:9"
new RationalInterval(-2, 3).mpow(2).toString(); // "-6:9"
```

`pow(2)` applies one mathematical function to one uncertain input, so the
minimum is zero. `mpow(2)` treats the two factors as independently chosen from
the interval, so negative products are possible. `mpow(0)` throws; `pow(0)`
returns `[1,1]` only when the interval excludes zero.

## Set operations

| Method | Result |
|---|---|
| `overlaps(other)` | Whether the closed intervals share any point |
| `contains(other)` | Whether this interval contains all of `other` |
| `containsValue(value)` | Whether the value lies between the bounds, inclusively |
| `containsZero()` | Whether zero lies in the interval |
| `equals(other)` | Equality of sorted low/high bounds |
| `intersection(other)` | Shared interval, or `null` |
| `union(other)` | Enclosing interval if they overlap/touch, otherwise `null` |

```js
const a = new RationalInterval(1, 3);
const b = new RationalInterval(3, 5);

a.overlaps(b);                   // true (they share 3)
a.intersection(b).toString();    // "3:3"
a.union(b).toString();           // "1:5"
a.containsValue("5/2");          // true
```

`union` returns one continuous interval only; it does not create a disjoint-set
type.

## Exact display forms

| Method | Result |
|---|---|
| `toString()` | `start:end` using fractions |
| `toMixedString()` | `start:end` using RiX mixed fractions |
| `toRepeatingDecimal(useRepeatNotation?)` | Exact decimal endpoints |
| `compactedDecimalInterval()` | Common-prefix bracket form when possible |
| `relativeMidDecimalInterval()` | Decimal midpoint with signed offsets |
| `relativeDecimalInterval()` | A relative compact form based on an endpoint |

```js
import { parseInterval } from "@ratmath/core";

const range = parseInterval("1.224:1.235");

range.toString();                 // "153/125:247/200"
range.toRepeatingDecimal();       // "1.224#0:1.235#0"
range.relativeDecimalInterval();  // "1.23[+0.5:-0.6]"
range.relativeMidDecimalInterval(); // "1.2295[+-55]"
```

`relativeDecimalInterval()` preserves exact bounds, using rational offsets when
an offset has a repeating decimal expansion. The midpoint and common-prefix
forms target compact human-readable display and may use `toDecimal()`'s limited
output. Fraction and repeating-decimal endpoint output remain the simplest
choices for durable exact serialization.

## Selecting values

| Method | Result |
|---|---|
| `mediant()` | Mediant of the reduced endpoint fractions |
| `midpoint()` | Arithmetic midpoint |
| `shortestDecimal(base?)` | A terminating base-`base` rational within the interval, or `null` |
| `randomRational(maxDenominator?)` | Pseudorandom contained rational with bounded denominator |
| `bitLength()` | Maximum bit length of the two endpoints |

```js
const range = new RationalInterval("1/3", "2/3");

range.mediant().toString();       // "1/2"
range.midpoint().toString();      // "1/2"
range.shortestDecimal().toString(); // "1/2"

const sample = range.randomRational(100);
range.containsValue(sample);      // true
```

`randomRational` uses `Math.random`, so it is neither deterministic nor
cryptographically secure.

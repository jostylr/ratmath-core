---
title: FractionInterval
---

`FractionInterval` is a closed interval whose endpoints are
representation-preserving [`Fraction`](fraction.md) values. It is useful when
mediant subdivision must retain unreduced numerators and denominators.

## Construction

```js
import { Fraction, FractionInterval } from "@ratmath/core";

const interval = new FractionInterval(
  new Fraction(1, 3),
  new Fraction(2, 3),
);

interval.low.toString();  // "1/3"
interval.high.toString(); // "2/3"
interval.toString();      // "1/3:2/3"
```

Both endpoints must be `Fraction` instances. They are sorted mathematically;
unlike `RationalInterval`, input orientation is not retained.

## Mediant partitioning

| Method | Result |
|---|---|
| `mediantSplit()` | Two intervals split at the endpoint mediant |
| `partitionWithMediants(depth?)` | Repeats every split `depth` times; returns `2^depth` intervals |
| `partitionWith(fn)` | Adds callback-provided `Fraction` points, sorts/deduplicates, and returns adjacent intervals |

```js
const pieces = interval.mediantSplit();
pieces.map((piece) => piece.toString());
// ["1/3:3/6", "3/6:2/3"]

interval.partitionWithMediants(2).map((piece) => piece.toString());
// ["1/3:4/9", "4/9:3/6", "3/6:5/9", "5/9:2/3"]

interval.partitionWith((low, high) => [low.mediant(high)]);
// same two-way split
```

A custom partition function must return an array of `Fraction` values inside
the interval. Depth must be nonnegative; depth zero returns `[interval]`.

## Conversion and utility methods

| Method | Result |
|---|---|
| `toRationalInterval()` | Equivalent reduced `RationalInterval` |
| `FractionInterval.fromRationalInterval(interval)` | Uses each rational's reduced components |
| `toString()` | `low:high`, preserving each fraction's representation |
| `equals(other)` | Exact endpoint-representation equality |
| `E(exponent)` | Applies exact decimal scaling to both endpoint fractions |

```js
const scaled = new FractionInterval(
  new Fraction(1, 2),
  new Fraction(3, 4),
).E(2);

scaled.toString(); // "100/2:300/4"
scaled.toRationalInterval().toString(); // "50:75"
```

Conversion through `RationalInterval` reduces endpoint representations, so it
is not a lossless round trip for values such as `2/4`.

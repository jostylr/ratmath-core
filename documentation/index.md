---
title: "@ratmath/core"
subtitle: Exact integers, rationals, fractions, intervals, and certified approximations
---

`@ratmath/core` is a dependency-free ES module for exact arithmetic in
JavaScript. It stores integer components as `BigInt`, performs rational and
closed-interval arithmetic without floating-point rounding, and parses the
number literal formats used by RiX.

```js
import {
  Rational,
  parseDecimal,
  parseInterval,
} from "@ratmath/core";

const oneThird = parseDecimal("0.#3");
oneThird.equals(new Rational(1, 3));          // true

const tolerance = parseInterval("1.23[+-1]");
tolerance.toString();                         // "61/50:31/25"
tolerance.containsValue(new Rational(123, 100)); // true
```

## What is included

| API | Purpose |
|---|---|
| [`Integer`](integer.md) | Arbitrary-precision integer arithmetic |
| [`Rational`](rational.md) | Reduced exact rational arithmetic, repeating expansions, and finite continued fractions |
| [`RationalInterval`](rational-interval.md) | Closed exact intervals with arithmetic and compact display forms |
| [`CertifiedApproximation`](certified-approximation.md) | Finite scalar candidates with authoritative exact enclosures |
| [`Fraction`](fraction.md) | Unreduced fractions and Farey/Stern–Brocot operations |
| [`FractionInterval`](fraction-interval.md) | Intervals that preserve unreduced endpoint representations |
| [`BaseSystem`](base-system.md) | Ordered digit alphabets and integer/rational conversion |
| [`TypePromotion`](type-promotion.md) | Explicit promotion and arithmetic dispatch across core number types |
| [Parsing helpers](parsing.md) | Number-only parsing for decimals, mixed numbers, continued fractions, and intervals |

All classes are immutable in normal use: operations construct new values.
`Rational` normalizes its sign and reduces to lowest terms, while `Fraction`
deliberately preserves the numerator and denominator supplied by the caller.

## What is not included

Core does not parse arithmetic expressions and does not provide transcendental
functions, floating-point real-number approximations, symbolic algebra, DOM or
SVG visualization, units, or document rendering. Those need different
dependencies and accuracy contracts.

## Runtime and package shape

- ECMAScript modules only
- Node.js 22 or newer
- no runtime dependencies
- named exports and a default namespace export
- TypeScript declarations included

The [`Getting started`](getting-started.md) page covers installation and
imports. The [`API index`](api-index.md) is the compact reference for every
public export.

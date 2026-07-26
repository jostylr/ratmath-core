---
title: TypePromotion
---

`TypePromotion` exposes the promotion policy used by core arithmetic:

```text
Integer (level 0) → Rational (level 1) → RationalInterval (level 2)
```

Most callers can use instance methods directly. This class is useful to
evaluators and other dispatch layers that receive heterogeneous core values.

## Inspection and conversion

| Static method | Result |
|---|---|
| `getTypeLevel(value)` | `0`, `1`, or `2`; unknown types throw |
| `integerToRational(integer)` | Denominator-one `Rational` |
| `rationalToInterval(rational)` | Point `RationalInterval` |
| `integerToInterval(integer)` | Point interval through both promotion steps |
| `promoteToLevel(value, level)` | Upward promotion; invalid levels and demotion throw |
| `promoteToCommonType(a,b)` | Pair promoted to the higher input level |

```js
import {
  Integer,
  Rational,
  RationalInterval,
  TypePromotion,
} from "@ratmath/core";

TypePromotion.getTypeLevel(new Rational(1, 2)); // 1

const [a, b] = TypePromotion.promoteToCommonType(
  new Integer(1),
  new RationalInterval(2, 3),
);

a instanceof RationalInterval; // true
b instanceof RationalInterval; // true
```

## Operations

| Static method | Behavior |
|---|---|
| `add(a,b)` | Promote, then add |
| `subtract(a,b)` | Promote, then subtract |
| `multiply(a,b)` | Promote, then multiply |
| `divide(a,b)` | Promote, then divide; preserves smart integer division |
| `eNotation(base,exponent)` | Apply exact multiplication by `10^exponent` |
| `power(base,exponent)` | Call `base.pow(exponent)` |
| `multiplyPower(base,exponent)` | Call `mpow` when available, otherwise `pow` |
| `negate(value)` | Preserve the value's core type while negating |

```js
TypePromotion.add(new Integer(2), new Rational(1, 3)).toString();
// "7/3"

TypePromotion.divide(new Integer(8), new Integer(4)).toString();
// "2"

TypePromotion.divide(new Integer(8), new Integer(3)).toString();
// "8/3"
```

For intervals, `power` and `multiplyPower` intentionally differ; see
[`RationalInterval`](rational-interval.md).

## Syntactic classification

`determineTypeFromString(text)` is a lightweight classifier, not a validator:

```js
TypePromotion.determineTypeFromString("42");       // "integer"
TypePromotion.determineTypeFromString("3/4");      // "rational"
TypePromotion.determineTypeFromString("1:2");      // "interval"
TypePromotion.determineTypeFromString("1.2[+-1]"); // "interval"
```

It reports a likely type from punctuation and may classify malformed text. Use
[`parseNumber`](parsing.md) when validation and value construction are needed.

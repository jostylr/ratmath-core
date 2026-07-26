---
title: Fraction
---

`Fraction` stores a numerator and denominator exactly as supplied. Unlike
`Rational`, it does not reduce automatically. This makes it useful for
representation-sensitive work and mediant/Farey/Stern–Brocot operations.

## Construction and identity

```js
import { Fraction, Rational } from "@ratmath/core";

const half = new Fraction(1, 2);
const twoFourths = new Fraction("2/4");

half.equals(twoFourths);            // false
half.toRational().equals(twoFourths.toRational()); // true
twoFourths.reduce().toString();      // "1/2"
Fraction.fromRational(new Rational(3, 5)).toString(); // "3/5"
```

The read-only properties are `numerator`, `denominator`, and `isInfinite`.
Ordinary construction rejects a zero denominator. The special values `-1/0`
and `1/0` may be constructed with `{ allowInfinite: true }` for
Stern–Brocot boundaries; most arithmetic methods are not intended for them.

For finite ordering operations, use positive denominators or call `reduce()`
first.

## Representation-preserving arithmetic

| Method | Behavior |
|---|---|
| `add(other)` | Adds numerators only; denominators must be exactly equal |
| `subtract(other)` | Subtracts numerators only; denominators must be exactly equal |
| `multiply(other)` | Multiplies numerator and denominator without cancellation |
| `divide(other)` | Multiplies by the reciprocal without cancellation |
| `pow(exponent)` | Integer power without cancellation |
| `scale(factor)` | Multiplies both components by the same factor |
| `reduce()` | Returns a normalized lowest-terms `Fraction` |
| `E(exponent)` | Moves a power of ten into numerator or denominator |

```js
new Fraction(1, 4).add(new Fraction(2, 4)).toString(); // "3/4"
new Fraction(1, 2).multiply(new Fraction(3, 4)).toString(); // "3/8"
new Fraction(1, 2).divide(new Fraction(3, 4)).toString();   // "4/6"
new Fraction(1, 2).scale(3).toString();                     // "3/6"
new Fraction(5, 4).E(2).toString();                         // "500/4"
```

`toString()` preserves the components (omitting `/1`), `toRational()` reduces,
and `equals(other)` tests representation equality. `lessThan`,
`lessThanOrEqual`, `greaterThan`, and `greaterThanOrEqual` compare by cross
multiplication.

## Mediants and Farey relationships

| Method | Result |
|---|---|
| `mediant(other)` | `(a+c)/(b+d)`, with special tree-boundary handling |
| `Fraction.mediant(a,b)` | Static finite-fraction mediant |
| `fareyParents()` | Neighboring bounds whose mediant is this reduced fraction |
| `Fraction.mediantPartner(endpoint, mediant)` | Solves for a compatible other endpoint |
| `Fraction.isMediantTriple(left,middle,right)` | Whether `middle` is exactly the component-wise mediant |
| `Fraction.isFareyTriple(left,middle,right)` | Mediant triple whose outer values are Farey neighbors |

```js
const left = new Fraction(1, 3);
const right = new Fraction(1, 2);
const middle = left.mediant(right);

middle.toString(); // "2/5"
Fraction.isMediantTriple(left, middle, right); // true
Fraction.isFareyTriple(left, middle, right);   // true

const parents = new Fraction(3, 5).fareyParents();
parents.left.toString();  // "1/2"
parents.right.toString(); // "2/3"
```

Tree algorithms expect a reduced finite fraction. Check
`isSternBrocotValid()` before navigating values from untrusted sources.

## Stern–Brocot navigation

This implementation uses the extended tree with root `0/1` and boundary
fractions `-1/0` and `1/0`, so it covers negative and positive rationals.

| Method | Result |
|---|---|
| `sternBrocotParent()` | Parent fraction, or `null` at `0/1` |
| `sternBrocotChildren()` | `{ left, right }` children |
| `sternBrocotPath()` | Array of `"L"` and `"R"` directions from the root |
| `Fraction.fromSternBrocotPath(path)` | Fraction at a direction path |
| `isSternBrocotValid()` | Finite, reduced, positive-denominator tree value |
| `sternBrocotDepth()` | Number of steps from the root |
| `sternBrocotAncestors()` | Fractions from the parent back toward the root |

```js
const value = new Fraction(3, 5);
const path = value.sternBrocotPath();

path; // ["R", "L", "R", "L"]
Fraction.fromSternBrocotPath(path).equals(value); // true
value.sternBrocotDepth();                         // 4
value.sternBrocotParent().toString();             // "2/3"
```

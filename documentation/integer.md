---
title: Integer
---

`Integer` wraps a `BigInt` for immutable arbitrary-precision integer
arithmetic. Mixed arithmetic promotes to `Rational` or `RationalInterval`.

## Construction and values

```js
import { Integer, Rational } from "@ratmath/core";

const a = new Integer("9007199254740993");
const b = Integer.from(12n);

a.value;             // 9007199254740993n
Integer.zero.value;  // 0n
Integer.one.value;   // 1n

Integer.fromRational(new Rational(8, 4)).toString(); // "2"
Integer.fromRational(new Rational(3, 2));            // throws
```

The constructor and `Integer.from(value)` accept `number`, decimal integer
`string`, `bigint`, or `Integer`. A string must contain only an optional `-`
and decimal digits. Number inputs must satisfy `Number.isSafeInteger`; use a
string or `bigint` for larger exact values. `Integer.fromRational(value)`
requires denominator `1`.

## Arithmetic

| Method | Behavior |
|---|---|
| `add(other)` | Sum; promotes for a rational or interval operand |
| `subtract(other)` | Difference; promotes for a rational or interval operand |
| `multiply(other)` | Product; promotes for a rational or interval operand |
| `divide(other)` | `Integer` for exact integer division, otherwise `Rational`; promotes for other core types |
| `modulo(other)` | JavaScript `BigInt` remainder wrapped as `Integer` |
| `negate()` | Additive inverse |
| `pow(exponent)` | `Integer` for nonnegative powers; reciprocal `Rational` for negative powers |
| `E(exponent)` | Multiply by the exact power `10^exponent` |

```js
new Integer(7).add(new Integer(5)).toString();       // "12"
new Integer(7).divide(new Integer(2)).toString();    // "7/2"
new Integer(12).modulo(new Integer(5)).toString();   // "2"
new Integer(2).pow(-3).toString();                   // "1/8"
new Integer(125).E(-2).toString();                   // "5/4"
```

Division or modulo by zero throws. `0^0` and zero to a negative power also
throw.

## Comparison and predicates

| Method | Result |
|---|---|
| `equals(other)` | Exact integer equality |
| `compareTo(other)` | `-1`, `0`, or `1` |
| `lessThan(other)` | Strict less-than |
| `lessThanOrEqual(other)` | Less-than or equal |
| `greaterThan(other)` | Strict greater-than |
| `greaterThanOrEqual(other)` | Greater-than or equal |
| `abs()` | Absolute value |
| `sign()` | An `Integer` equal to `-1`, `0`, or `1` |
| `isEven()` / `isOdd()` | Parity predicates |
| `isZero()` | Value equals zero |
| `isPositive()` / `isNegative()` | Sign predicates excluding zero |

```js
const n = new Integer(-12);

n.abs().toString();                 // "12"
n.sign().toString();                // "-1"
n.isEven();                         // true
n.compareTo(new Integer(-10));      // -1
```

## Number theory

| Method | Result |
|---|---|
| `gcd(other)` | Nonnegative greatest common divisor |
| `lcm(other)` | Nonnegative least common multiple; zero if either input is zero |
| `factorial()` | `n!` for nonnegative `n` |
| `doubleFactorial()` | `n!!` for nonnegative `n`, including `0!! = 1` |
| `bitLength()` | Bits needed for the absolute value; zero has length `0` |

```js
new Integer(84).gcd(new Integer(30)).toString(); // "6"
new Integer(12).lcm(new Integer(18)).toString(); // "36"
new Integer(6).factorial().toString();           // "720"
new Integer(7).doubleFactorial().toString();     // "105"
new Integer(255).bitLength();                    // 8
```

Factorials of negative integers throw.

## Conversion

| Method | Result |
|---|---|
| `toString(base?)` | Decimal by default; native radix `2`–`36`, or a `BaseSystem` |
| `toBase(baseSystem)` | Digits in the supplied `BaseSystem` |
| `toNumber()` | JavaScript `number`; may lose range or precision |
| `toRational()` | Equivalent denominator-one `Rational` |

```js
import { BaseSystem } from "@ratmath/core";

new Integer(255).toString(16);                // "ff"
new Integer(255).toBase(BaseSystem.BINARY);   // "11111111"
new Integer(-42).toRational().toString();     // "-42"
```

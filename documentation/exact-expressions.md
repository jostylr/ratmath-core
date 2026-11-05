---
title: Exact expressions and list helpers
---

`R` is a tagged template that turns a small exact-arithmetic expression into
Core values. `range`, `seq`, `sum` and `product` combine Core values in lists.
They are the basis of the RatCalc calculator (`apps/calc`), where input is
JavaScript with these in scope. *Unreleased; available in the workspace Core
after 0.6.0.*

## `R`

```js
import { R, Rational } from "@ratmath/core";

R`1/3 + 1/6`;               // Rational 1/2
R`1:2 + 3`;                 // RationalInterval 4:5
R`(${new Rational(1, 3)} + 1) ^ 2`;   // Rational 16/9
```

### Literals

Literals are spelled as in RiX, so text moves between RiX, RatCalc and `R`
unchanged.

| Form | Example | Value |
|---|---|---|
| integer, `_` grouping | `1_000` | `1000` |
| fraction, mixed number | `3/4`, `1..2/3` | `3/4`, `5/3` |
| decimal, repeating `#`, digit runs | `.5`, `0.#3`, `0.{3~4}1` | `1/2`, `1/3`, `33331/100000` |
| uncertainty (colon only) | `1.2[3:6]`, `1.5[+-0.01]` | `1.23:1.26`, `1.499:1.501` |
| interval | `2:5` | `2:5` |
| continued fraction | `3.~7~15~1`, `~-1.~2` | `355/113`, `-1/2` |
| radix shift | `1_^3`, `2.5_^-2`, `1/2_^3` | `1000`, `1/40`, `1/2000` |
| base prefix | `0xff.8`, `0b0.#01`, `0o17`, `0z[7]66` | `511/2`, `1/3`, `15`, `48` |
| certified prefix | `1.5?`, `3.~7?` | `CertifiedApproximation` |

- A radix shift belongs to the literal before it: `1/2_^3` is `1/(2_^3)`.
- A leading `-` is negation: `-3.~7` is `-(3.~7)` = `-22/7`. Write `~-3.~7`
  for a negative first coefficient.
- Base prefixes are the ones registered with `BaseSystem.registerPrefix`
  (`b` 2, `o` 8, `x` 16, `d` 12, …); `0z[n]` names any base. Digits are
  case-insensitive when the base's digits are lowercase.
- There is no `E` notation and no comma form `1.2[3,6]`, matching RiX.

### Operators

Loosest to tightest: `+ -`; `:` (interval); `* /`; unary `-` and `+`;
`^` and `**` (right-associative; Integer exponents; `**` is the same power as
`^`, as in RiX — the interval product power is `RationalInterval.mpow`);
postfix `!` and `!!`. Parentheses group. So `1/2:3/4` is `(1/2):(3/4)`,
`1:2 + 3` is `(1:2) + 3` and `-2^2` is `-4`.

### Interpolation

`${value}` inserts a value without turning it into text. Accepted: `Integer`,
`Rational`, `RationalInterval`, certified approximations, `bigint`, safe
integer `number`s, and strings (read with `parseNumber`). Other numbers such
as `0.1` throw a `TypeError`, because they are not exact.

### `R.base(radix)`

Returns a tag that reads unprefixed literals in another base. `radix` is a
number or `bigint` (2–62), an `Integer`, a `BaseSystem`, or a string listing
the digits in order.

```js
R.base(16)`ff.8 / 3`;      // Rational 511/6
R.base(2)`0.#01`;          // Rational 1/3
R.base("01234567")`17`;    // Integer 15
R.base(2)`101 + 0x10`;     // prefixed literals keep their own base: 21
```

### Errors

`R` throws `SyntaxError` for unexpected characters or tokens, unknown base
prefixes and unbalanced parentheses, and `TypeError` for non-integer
exponents, `!`/`!!` of a non-Integer, an interval endpoint that is itself an
interval, and inexact interpolations. Arithmetic errors (division by zero)
come from the Core classes.

## `range(start, end, step = 1)`

An inclusive arithmetic progression. Arguments accept the same inputs as `R`
interpolation. A negative step counts down; a zero step throws `RangeError`, as
does a range longer than 1,000,000 values. Whole results are `Integer`s.

```js
range(1, 5);              // [1, 2, 3, 4, 5]
range(0, 1, R`1/4`);      // [0, 1/4, 1/2, 3/4, 1]
range(5, 1, -2);          // [5, 3, 1]
```

## `seq`, `sum`, `product`

Each takes either a list (any iterable except a string), or `start, end` and
an optional `step` as in `range`, optionally followed by a function
`(value, index) => term`.

```js
seq(0, 6, 2, (k) => R`${k}^3`);   // [0, 8, 64, 216]
sum([R`1/2`, R`1/3`]);            // 5/6
sum(1, 10, (i) => R`${i}^2`);     // 385
sum(1, 4, (i) => R`1/${i}`);      // 25/12
product(1, 5, (j) => j);          // 120
sum([R`1:2`, 1]);                 // 2:3
```

`seq` returns the terms as given. `sum` and `product` convert each term like
`R` interpolation, add or multiply exactly, return whole results as
`Integer`, and return `0` and `1` for empty input.

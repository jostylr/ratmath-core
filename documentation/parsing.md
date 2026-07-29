---
title: Number parsing
---

The parser accepts exact *number literals only*. It does not accept operators,
variables, calls, parentheses, or other RiX expressions. All parsing is base
10; use [`BaseSystem`](base-system.md) for explicit base conversion.

## Entry points

| Function | Accepted input | Result |
|---|---|---|
| `parseNumber(text)` | Any supported scalar or interval form | `Integer`, `Rational`, or `RationalInterval` |
| `parseRational(text)` | Any scalar form | Always `Rational`; rejects intervals |
| `parseDecimal(text)` | Finite or repeating decimal | `Rational` |
| `parseRepeatingDecimal(text)` | Alias of `parseDecimal` | `Rational` |
| `parseMixedNumber(text)` | Mixed-fraction form | `Rational` |
| `parseContinuedFraction(value)` | Coefficient array or `.~` form | `Rational` |
| `parseInterval(text)` | Any interval form, or a scalar | `RationalInterval`; a scalar becomes a point interval |

Every string entry point trims leading and trailing whitespace. Underscores are
allowed only between decimal digits.

## Scalar forms

```js
import {
  parseNumber,
  parseRational,
  parseDecimal,
  parseMixedNumber,
  parseContinuedFraction,
} from "@ratmath/core";

parseNumber("-1_000").toString();          // "-1000"
parseRational("-3/4").toString();          // "-3/4"
parseDecimal(".125").toString();           // "1/8"
parseDecimal("0.1#6").toString();          // "1/6"
parseMixedNumber("-2..1/4").toString();    // "-9/4"
parseContinuedFraction("3.~7~15").toString(); // "333/106"
parseContinuedFraction([3n, 7n, 15n]).toString(); // "333/106"
```

### Repeating decimals

`#` starts the repeating block:

| Literal | Exact value |
|---|---|
| `0.#3` | `1/3` |
| `0.1#6` | `1/6` |
| `12.34#56` | non-repeating `34`, then repeating `56` |
| `1.25#0` | `5/4`; an all-zero repeat is terminating |

Digit-run compression is accepted inside a decimal: `{digits~count}` repeats
the digit string `count` times. For example, `0.{0~8}1` is exactly
`0.000000001`. Expansion is capped at 100,000 digits.

### Mixed fractions

The syntax is `whole..numerator/denominator`. A leading minus applies to the
whole value:

```js
parseMixedNumber("2..1/4").toString();  // "9/4"
parseMixedNumber("-2..1/4").toString(); // "-9/4"
```

### Continued fractions

A finite simple continued fraction `[a0; a1, a2, ...]` is written
`a0.~a1~a2...`. Tail coefficients are unsigned decimal integers. An explicit
leading `~` is accepted for compatibility with RiX negative literal syntax:

```js
parseContinuedFraction("-3.~1~3").toString();  // "-9/4"
parseContinuedFraction("~-3.~1~3").toString(); // "-9/4"
```

## Interval forms

Colon notation supplies two exact scalar endpoints:

```js
import { parseInterval } from "@ratmath/core";

parseInterval("1/3:2/3").toString(); // "1/3:2/3"
parseInterval("3/4").toString();     // "3/4:3/4"
```

Decimal bracket notation provides shorter uncertainty forms:

| Form | Example | Result |
|---|---|---|
| Compact suffixes | `1.23[56:67]` | `1.2356:1.2367` |
| Relative offsets | `1.23[+5:-6]` | `1.17:1.28` |
| Symmetric offset | `1.3[+-1]` | `1.2:1.4` |
| Fractional offset | `1.2[+-0.1]` | `1.19:1.21` |
| Repeating endpoints | `0.[#3:#6]` | `1/3:2/3` |

Unsigned values append digits to the decimal base. Signed offsets use the
base's last visible digit as their unit. If the base has `d` fractional digits,
an offset `x` contributes `x × 10^-d`. Thus `1.23[+5:-6]` means
`1.23 + 5 × 0.01` and `1.23 - 6 × 0.01`. Likewise, `1.2[+-0.1]`
applies `0.1 × 0.1 = 0.01` in each direction. For an integer base, the unit is
`1`.

When a bracket contains two values, colon is the required separator.

The returned interval stores the endpoints in their written order as `start`
and `end`, while `low` and `high` are always mathematically ordered.

## Rejected input

```js
parseNumber("1 + 2");       // throws: expressions are not numbers
parseRational("1:2");       // throws: expected a scalar
parseDecimal("1/2");        // throws: expected decimal notation
parseMixedNumber("9/4");    // throws: mixed notation required
parseInterval("1:2:3");     // throws: too many endpoints
```

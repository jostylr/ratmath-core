# @ratmath/core

Exact integer, rational, fraction, and rational-interval arithmetic for
JavaScript. Values use `BigInt`, have no runtime dependencies, and work in Node
and browser bundles.

RatMath also includes a number-only parser for the exact literal formats used
by RiX. It parses numbers, not arithmetic expressions.

## Install

```sh
npm install @ratmath/core
```

`@ratmath/core` is an ES module and requires Node.js 22 or newer.

## Exact arithmetic

```js
import { Rational, RationalInterval } from "@ratmath/core";

const half = new Rational(1, 2);
const third = new Rational(1, 3);

half.add(third).toString(); // "5/6"

const uncertainty = new RationalInterval("1.2", "1.3");
uncertainty.multiply(new Rational(2)).toString(); // "12/5:13/5"
```

## Parse exact numbers

Use `parseNumber` when the input may be an integer, rational, or interval:

```js
import {
  parseContinuedFraction,
  parseDecimal,
  parseInterval,
  parseMixedNumber,
  parseNumber,
  parseRational,
} from "@ratmath/core";

parseNumber("42");                 // Integer(42)
parseRational("-3/4");             // Rational(-3, 4)
parseDecimal("0.125");             // Rational(1, 8)
parseDecimal("0.#3");              // Rational(1, 3)
parseMixedNumber("-2..1/4");       // Rational(-9, 4)
parseContinuedFraction("3.~7~15"); // Rational(333, 106)
parseInterval("1/3:2/3");          // RationalInterval(1/3, 2/3)
```

The accepted base-10 scalar forms are:

| Form | Example | Meaning |
| --- | --- | --- |
| Integer | `-1_000` | `-1000` |
| Fraction | `-3/4` | `-3/4` |
| Finite decimal | `.125` | `1/8` |
| Repeating decimal | `0.1#6` | `1/6` |
| Mixed fraction | `-2..1/4` | `-9/4` |
| Continued fraction | `3.~7~15` | `[3; 7, 15]` |
| Exact interval | `1/3:2/3` | closed interval `[1/3, 2/3]` |

`#` starts the repeating block. A repeating block of zero marks a terminating
decimal, so `"1.25#0"` and `"1.25"` are both exactly `5/4`.

## Decimal interval notation

Compact, relative, symmetric, and repeating-endpoint intervals are supported:

```js
parseInterval("1.23[56,67]"); // 1.2356:1.2367
parseInterval("1.23[+5,-6]"); // 1.224:1.235
parseInterval("1.3[+-1]");    // 1.29:1.31
parseInterval("0.[#3,#6]");   // 1/3:2/3
```

For a decimal base value, relative offsets use the next decimal place.
Accordingly, `1.23[+5,-6]` means `1.23 + 0.005` and `1.23 - 0.006`.
For an integer base value, offsets are applied directly.

`parseInterval("3/4")` creates the point interval `3/4:3/4`.

## Export formats

```js
const value = parseRational("-9/4");

value.toString();                  // "-9/4"
value.toMixedString();             // "-2..1/4"
value.toRepeatingDecimal();        // "-2.25#0"
value.toContinuedFractionString(); // "-3.~1~3"

const interval = parseInterval("1.23[+5,-6]");

interval.toString();                 // "153/125:247/200"
interval.toMixedString();            // "1..28/125:1..47/200"
interval.toRepeatingDecimal();       // "1.224#0:1.235#0"
interval.relativeDecimalInterval();  // "1.23[+5,-6]"
interval.compactedDecimalInterval(); // a compact range when possible
```

Repeating-decimal and continued-fraction output is exact and can be parsed
again. `toDecimal()` is intended for display and limits non-terminating output
to 20 digits; use `toRepeatingDecimal()` for exact round trips.

## Fractions and bases

`Rational` always reduces to lowest terms. `Fraction` preserves the supplied
numerator and denominator, which is useful for Farey and Stern–Brocot
operations.

`BaseSystem` supplies arbitrary-base conversion and common presets:

```js
import { BaseSystem, Rational } from "@ratmath/core";

new Rational(1, 3).toRepeatingBase(BaseSystem.BINARY); // "0.#01"
new Rational(255).toBase(BaseSystem.HEXADECIMAL);       // "ff"
```

The public API also includes `Integer`, `Fraction`, `FractionInterval`,
`RationalInterval`, `BaseSystem`, and `TypePromotion`. TypeScript declarations
ship with the package.

## Documentation

The complete manual has an overview, a page for every public class, number
parsing details, an API index, and runnable examples:

- [Published documentation](https://jostylr.github.io/ratmath-core/)
- [Documentation source](documentation/)

Build the GitHub Pages site manually with:

```sh
npm run docs:build
```

This requires [Quarto](https://quarto.org/) and writes the rendered site to
`docs/`. Documentation is not rendered or published by CI.

## License

MIT

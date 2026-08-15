# @ratmath/core

Exact integer, rational, fraction, rational-interval, and certified-approximation arithmetic for
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

JavaScript `number` constructor arguments must be safe integers. Use `bigint`
or decimal integer strings when a value is outside that range, so it reaches
RatMath without first losing precision:

```js
new Rational("9007199254740993", "2");
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
parseInterval("1.23[56:67]");    // 1.2356:1.2367
parseInterval("1.23[+5:-6]");    // 1.17:1.28
parseInterval("1.3[+-1]");       // 1.2:1.4
parseInterval("1.2[+-0.1]");     // 1.19:1.21
parseInterval("0.[#3:#6]");      // 1/3:2/3
```

Unsigned bracket values append digits to the base. Signed offsets instead use
the base value's last visible digit as their unit. Thus `1.23[+5:-6]` means
`1.23 + 5 × 0.01` and `1.23 - 6 × 0.01`. Decimal offsets use that same unit:
`1.2[+-0.1]` applies `0.1 × 0.1`, or `0.01`, in each direction. For an
integer base value, the last-visible-digit unit is `1`.

When a bracket contains two values, colon is the required separator.

`parseInterval("3/4")` creates the point interval `3/4:3/4`.

## Certified finite approximations

An embedded `?` separates certified representation data from optional
provisional data. The authoritative guarantee is always an exact rational
enclosure:

```js
const x = parseNumber("23.456?789");

x.candidate.toString(); // "23456789/1000000"
x.enclosure.toString(); // "2932/125:23457/1000"
x.add(new Rational(1, 2)); // another CertifiedApproximation
```

`23.456?` certifies the decimal prefix but does not claim the expansion is
complete. `3.~7~15?1~292` does the same for a continued-fraction prefix.
Bracket uncertainty can narrow a decimal cylinder, as in
`23.456?789[+-12]`, and is validated against the certified prefix.

`CertifiedApproximation` is an uncertain scalar, not an interval collection.
Arithmetic with exact scalars preserves that distinction. Explicitly mixing
one with `RationalInterval` yields interval arithmetic. Core's
`possibleRelations(a, b)` returns a mask composed from `Relation.LESS`,
`Relation.EQUAL`, and `Relation.GREATER`; it never invents a Boolean answer for
overlapping enclosures.

Derived values without an honest radix prefix use the parseable spelling
`candidate?[=low:high]`; the exact bracket endpoints preserve the scalar's
enclosure across string round trips.

A trailing `...` from an ordinary formatter remains display-only truncation.
It does not create an approximate value; parseable approximation values use
`?`. Use `boundedDecimalApproximation(value, { fractionalDigits })` or
`boundedContinuedFractionApproximation(value, { maxTerms })` when reaching a
work limit should deliberately return a certified numeric value.

## Export formats

```js
const value = parseRational("-9/4");

value.toString();                  // "-9/4"
value.toMixedString();             // "-2..1/4"
value.toRepeatingDecimal();        // "-2.25#0"
value.toContinuedFractionString(); // "-3.~1~3"
value.toContinuedFraction({ long: true }); // [-3n, 1n, 2n, 1n]

const interval = parseInterval("1.23[+0.5:-0.6]");

interval.toString();                 // "153/125:247/200"
interval.toMixedString();            // "1..28/125:1..47/200"
interval.toRepeatingDecimal();       // "1.224#0:1.235#0"
interval.relativeDecimalInterval();  // "1.23[+0.5:-0.6]"
interval.compactedDecimalInterval(); // a compact range when possible
```

Repeating-decimal and continued-fraction output without an ellipsis is exact
and can be parsed again. `toRepeatingDecimal()` allows periods up to 30 digits
by default and throws if a longer period would be required. Pass a larger
limit for exact interchange, or choose an explicit over-limit policy:

```js
new Rational(1, 97).toRepeatingDecimal(100);          // exact `#` period
new Rational(1, 97).toRepeatingDecimal(30, "trunc"); // visible `...` suffix
new Rational(1, 97).toRepeatingDecimal(30, "null");  // null
```

Continued fractions are canonical by default. `{ long: true }` selects the
alternative finite expansion ending in `1`; `convergents({ intermediates:
true })` includes every intermediate convergent along each coefficient run.
Coefficient and convergent arrays stop at `Rational.DEFAULT_CF_LIMIT` unless a
larger `maxTerms` or `maxCount` is supplied. An incomplete
`toContinuedFractionString()` ends in `~...`, making the limited prefix visible
and deliberately non-parseable as an exact value.

`Rational.MAX_PERIOD_DIGITS` sets the mutable global default (initially 30) for
repeating-decimal output and decimal metadata; an explicit method limit still
overrides it. The other mutable defaults are `MAX_PERIOD_CHECK` (period-length
discovery), `DEFAULT_DECIMAL_DIGITS` (`toDecimal()`), `DEFAULT_BASE_LIMIT`
(arbitrary-base radix output), `DEFAULT_SCIENTIFIC_PRECISION`,
`DEFAULT_PERIOD_MODULO_LIMIT`, and `DEFAULT_CF_LIMIT`. Formatting and traversal
defaults have explicit per-call overrides; `MAX_PERIOD_CHECK` is a mutable
global guard on period-discovery work.

In truncated output, `#` still marks the start of the repeating section and
the trailing `...` says that only a prefix of its period is shown. Such output
is informative but is not parseable as an exact value. `#` output without an
ellipsis contains the complete period and round-trips exactly. `toDecimal()`
is display-oriented and uses `DEFAULT_DECIMAL_DIGITS` (20 initially), which can
also be overridden with `toDecimal(maxDigits)`.

Intervals can work on a fixed denominator grid without enumerating fractions:

```js
const range = parseInterval("1/3:2/3");
range.denominatorInterval(10).toString();              // "2/5:3/5"
range.randomRational(10, "error", () => 0).toString(); // "2/5"
```

Omitting the grid denominator uses the LCM of the endpoint denominators.
`"mid"`, `"null"`, and `"error"` control what happens when a grid misses the
interval. An injected random source must return values in `[0, 1)` and vary
between calls when rejection sampling needs another candidate.

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

Integer conversion also supports signed radices, balanced digits, and
bijective digits through the optional `BaseSystem` constructor options:

```js
const balanced = new BaseSystem("T01", "Balanced ternary", {
  radix: 3,
  digitOffset: -1,
});

balanced.fromDecimal(-5n); // "T11"
```

These nonstandard systems support integers and exact numerator/denominator
formatting. Repeating fractional expansions require an ordinary positional
system; check `supportsPositionalFractions` before requesting one.

The public API also includes `Integer`, `Fraction`, `FractionInterval`,
`RationalInterval`, `BaseSystem`, and `TypePromotion`. TypeScript declarations
ship with the package. `isInteger`, `isRational`, `isRationalInterval`,
`isCertifiedApproximation`, `isFraction`, `isFractionInterval`, `isBaseSystem`,
and `isCoreNumber` are public type guards. Core values use tagged `toJSON()`
output and can be restored with `JSON.parse(text, reviveCoreValue)`.

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

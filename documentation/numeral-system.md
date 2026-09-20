---
title: NumeralSystem
description: Exact, bounded positional numeral parsing and explanations for four digit families.
---

`NumeralSystem` is available starting with **Core 0.6.0**. The imports below
require `@ratmath/core@^0.6.0` or the matching workspace package. Core 0.5.x
does not export this API.

## Choose the representation API

[`BaseSystem`](base-system.md) remains the existing conversion API used by
`Rational.toBase` and `toRepeatingBase`, including presets and bijective integer
systems. Its nonordinary systems do not support repeating fractional expansion.
`NumeralSystem` supplies a separate versioned descriptor, exact parsing and
bounded repeating expansion across these four families:

| `kind` | Radix | Digit values in token order |
|---|---|---|
| `ordinary` (default) | 2–256 | 0 through radix−1; one Unicode character per token |
| `multiToken` | 2–256 | 0 through radix−1; prefix-free token strings |
| `balanced` | Odd positive radix, 3–255 | −(radix−1)/2 through +(radix−1)/2 |
| `negative` | −2 through −256 | 0 through abs(radix)−1 |

There is no bijective `NumeralSystem` family. Neither API automatically replaces
the other, and a `BaseSystem` instance is not a numeral-system descriptor.

```js
import { NumeralSystem, Rational } from "@ratmath/core";

const decimal = new NumeralSystem({ radix: 10, tokens: [..."0123456789"] });
const words = new NumeralSystem({ kind: "multiToken", radix: 3,
  tokens: ["zero", "one", "two"] });
const balanced = new NumeralSystem({ kind: "balanced", radix: 3,
  tokens: ["T", "0", "1"] });
const negative = new NumeralSystem({ kind: "negative", radix: -2,
  tokens: ["0", "1"] });

words.parse("onezero.two").toString(); // "11/3"
balanced.parse("1T").toString();       // "2"
negative.parse("110.1").toString();    // "3/2"
balanced.format(new Rational(-5)).spelling; // "T11"
```

Descriptors have schema `ratmath.numeral-system@1`, exported as
`NUMERAL_SYSTEM_SCHEMA`. `toJSON()` returns `{schema, kind, radix, tokens}`;
restore with `new NumeralSystem(JSON.parse(JSON.stringify(system)))`. The
constructor validates and freezes the system and a copy of its token array.
Duplicate tokens, prefixes such as `a`/`ab`, punctuation collisions, incompatible
radix/family combinations, and unknown schema versions are rejected. Each token
has at most 32 Unicode characters and may not contain numeral grammar punctuation
or whitespace. `NUMERAL_LIMITS` exports the implementation ceilings.

## Parse exact scalar source

`parse(source)` returns a `Rational`. All components, including shift exponents,
use the selected system's tokens; the following examples use decimal:

| Source | Exact value | Form |
|---|---|---|
| `1_000/2` | 500 | Group separators and rational fraction |
| `-2..1/3` | −7/3 | Signed mixed number |
| `0.1#6` | 1/6 | Finite prefix plus repeating block |
| `3.~7~16` | 355/113 | Continued fraction |
| `12.5_^2` | 1250 | Radix-power shift |

A leading `+`/`-` is accepted even for balanced or negative-base input. `_` must
separate tokens; it cannot lead, trail, or repeat. Mixed fractional components
must be nonnegative with positive denominator. Continued-fraction tails must be
positive. This is scalar numeral parsing, not arithmetic expression evaluation.

Intervals (`1:2`), uncertainty/certified-approximation source (`1?2`), host labels,
and RiX backtick wrappers are not accepted here. Use the public
[number parsers](parsing.md) for the supported ordinary interval/certified grammar,
or a host's explicit numeral syntax adapter. Formatting likewise requires an exact
`Rational`, `Integer`, or `bigint`; JavaScript floating-point `number`, intervals,
and certified-approximation objects are not silently coerced.

## Bound expansion and preserve unfinished evidence

```js
const complete = decimal.format(new Rational(1, 6));
complete.status;   // "complete"
complete.spelling; // "0.1#6"

const partial = decimal.format(new Rational(1, 97), { maxDigits: 3 });
partial.status;   // "budgetExhausted"
partial.spelling; // null
partial.source.equals(new Rational(1, 97)); // true
partial.work;     // 3
```

`maxDigits` defaults to 256 and can be 0–4096. Expansion counts both integer
and fractional digits. A result is complete only when the integer finishes and
the fractional remainder reaches zero or repeats. On exhaustion, `partial` may
contain an unfinished prefix; it is **not an exact spelling** of `source`.
Retain `source`, `remaining`, and `integer.remaining`, and increase the budget
explicitly if needed. Even zero needs a digit of work.

Expansion records use schema `ratmath.numeral-expansion@1`. They include the
system descriptor, integer digits/carries, fractional `prefix` and `repeat`,
`steps`, exact remaining rational, `work`, and status. Each integer carry satisfies
`before = after * radix + digit`; each fractional step satisfies
`after = before * radix - digit`. These explain exact conversion without replacing
its bounded failure status with a rounded answer.

`format(value, {mode: "fraction", maxDigits})` formats numerator and denominator
separately, each with the specified digit budget. The result has `numerator` and
`denominator` records instead of expansion `steps`/`remaining`; its spelling is
null if either integer conversion exhausts its budget. `normalize(source, options)`
is shorthand for parsing and then formatting; it returns the same result record,
not a bare string.

Other limits are 65,536 source code units, 4096 tokens per parsed digit sequence,
16,384 bits per checked exact component, 256 continued-fraction terms, and absolute
shift exponent 4096. Malformed or oversized input throws an error prefixed
`Numeral system:`; work exhaustion during otherwise valid formatting is a result
status. These are algorithmic bounds, not process memory isolation.

## Locale adapters and place values

```js
const locale = { point: ",", group: " ", groupSize: 3 };
decimal.locale("12345.6#7", locale); // "12 345,6#7"
decimal.locale("12 345,6#7", locale, "parse")
  .equals(decimal.parse("12345.6#7")); // true

const explanation = negative.places("110.11");
explanation.places.reduce((sum, row) => sum.add(row.contribution), new Rational(0))
  .equals(explanation.value); // true
```

Locale formatting accepts positional expansions only, not fractions, mixed
numbers, continued fractions, or shifts. Parsing requires canonical grouping;
for example `1 2345,6` is rejected. Separators must be distinct, nonempty, at most
four code units, and disjoint from tokens and reserved punctuation. Group size
is 1–8 tokens, not a count of characters in a multi-token alphabet. Localization
changes spelling only; parsing returns the exact rational again.

`places(source)` returns `{value, places}` for a finite positional spelling.
Each row has `token`, `digit`, `exponent`, exact `weight`, and signed exact
`contribution`. Contributions sum to the parsed value, including negative radices.
For compound or repeating source, it returns the exact value, empty rows and a
diagnostic directing the caller to the normalized expansion.

Lower-level helpers are `tokenize(source, {allowEmpty?})` (digit-value array),
`fromDigits(digits)` (exact `bigint`), `parseInteger(source)` (signed `bigint`),
`integer(bigint, maxDigits?)` (bounded carry record; default 4096 digits), and
`digitText(digits)` (tokens joined into a string). Use validated digit arrays with
`digitText`; `fromDigits` validates digit ranges and size.

---
title: BaseSystem
---

`BaseSystem` defines an ordered single-character digit alphabet. It converts
integers to and from that alphabet and supplies digit systems for rational
formatting.

## Construct a system

```js
import { BaseSystem } from "@ratmath/core";

const custom = new BaseSystem("abc", "ABC digits");

custom.base;       // 3
custom.radix;      // 3
custom.characters; // ["a", "b", "c"]
custom.charMap.get("c"); // 2
custom.name;       // "ABC digits"
```

The first character has value zero, the second value one, and so on. The
constructor accepts a string or an array and requires at least two unique
single Unicode characters. It does **not** expand range syntax such as
`"0-9a-f"`.

`+ - * / ^ ! ( ) [ ] : . # ~` are in `BaseSystem.RESERVED_SYMBOLS` and cannot
be digits because they conflict with RatMath/RiX notation. A host that quotes
the complete digit stream can opt in with `{ allowReserved: true }` and should
check `requiresQuoting`. The `characters` array and `charMap` getters return
copies.

## Signed, balanced, and bijective systems

The optional third constructor argument changes the signed radix or the value
of the first digit. Digit values remain consecutive.

```js
const balanced = new BaseSystem("T01", "Balanced ternary", {
  radix: 3,
  digitOffset: -1,
});
const negabinary = new BaseSystem("01", "Negabinary", { radix: -2 });
const bijective = new BaseSystem("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "Bijective 26", {
  radix: 26,
  digitOffset: 1,
});

balanced.fromDecimal(-5n); // "T11"
negabinary.fromDecimal(-5n); // "1111"
bijective.fromDecimal(27n); // "AA"
```

`base` is the alphabet size, while `radix` is the signed positional radix and
`digitOffset` is the first character's value. `supportsPositionalFractions` is
true only for the ordinary configuration where `radix === base` and the first
digit means zero. Nonstandard systems support exact integer conversion and
numerator/denominator formatting. Repeating fractional expansions, period
calculation, and certified radix-prefix construction reject them because those
algorithms require ordinary nonnegative fractional-place digits. A bijective
system has no representation for zero and throws if asked to format it.

## Conversion and inspection

| Method | Result |
|---|---|
| `getChar(value)` | Digit at an in-range safe integer value; otherwise throws |
| `toDecimal(text)` | Signed digit string converted to `bigint` |
| `fromDecimal(value)` | `bigint` converted to a signed digit string |
| `isValidString(text)` | Whether the optional-minus string contains only digits in the system |
| `getMinDigit()` | Zero digit |
| `getMaxDigit()` | Highest-value digit |
| `toString()` | Human-readable name and alphabet preview |
| `equals(other)` | Equality of the ordered digit alphabets |
| `withCaseSensitivity(flag)` | `this` for `true`; a lowercased/deduplicated system for `false` |

```js
BaseSystem.HEXADECIMAL.toDecimal("ff"); // 255n
BaseSystem.BINARY.fromDecimal(-10n);    // "-1010"
BaseSystem.OCTAL.isValidString("789");  // false
BaseSystem.HEXADECIMAL.getChar(15);     // "f"
```

`toDecimal("-")` throws because a sign alone is not a numeral. Array entries
containing more than one Unicode character and fractional, non-finite, or
unsafe `getChar` indexes also throw.

Case folding preserves signed-radix options when no digits collapse. When
upper- and lowercase digits collapse to the same character, the result becomes
an ordinary positional system whose base is the deduplicated alphabet size.

Roman numerals are exposed as a custom alphabet named `ROMAN`, but conversion
is positional base-7 conversion; it does not implement subtractive Roman
numeral grammar.

## Presets

| Property | Base |
|---|---:|
| `BINARY` | 2 |
| `TERNARY` | 3 |
| `QUATERNARY` | 4 |
| `QUINARY` | 5 |
| `SEPTENARY` | 7 |
| `OCTAL` | 8 |
| `DECIMAL` | 10 |
| `DUODECIMAL` | 12 |
| `HEXADECIMAL` | 16 |
| `VIGESIMAL` | 20 |
| `BASE36` | 36 |
| `BASE60` | 60 |
| `BASE62` | 62 |
| `BASE64` | 64 |
| `ROMAN` | 7 custom digits |

## Factories

`BaseSystem.fromBase(base, name?)` builds the standard
`0-9`, `a-z`, `A-Z` ordering for bases 2 through 62.

```js
BaseSystem.fromBase(16).equals(BaseSystem.HEXADECIMAL); // true
```

`BaseSystem.createPattern(pattern, size, name?)` accepts:

| Pattern | Limit and ordering |
|---|---|
| `"alphanumeric"` | base 2–62 using `fromBase` |
| `"digits-only"` | up to 10, starting with `0` |
| `"letters-only"` | up to 52, `a-z` then `A-Z` |
| `"uppercase-only"` | up to 26, `A-Z` |

Unknown patterns or sizes beyond a pattern's alphabet throw.

## Prefix registry

The registry is metadata for parser integrations; the core number parser does
not itself parse prefixed values.

| Method | Behavior |
|---|---|
| `registerPrefix(prefix, system)` | Register one ASCII letter |
| `unregisterPrefix(prefix)` | Remove its exact entry |
| `hasExactPrefix(prefix)` | Exact-case membership |
| `getSystemForPrefix(prefix)` | Exact match, then mostly case-insensitive lookup |
| `getPrefixForSystem(system)` | First registered prefix for an equal alphabet |

Built-in prefixes are `b` (2), `t` (3), `q` (4), `f` (5), `s` (7), `o` (8),
`d` (12), `x` (16), `v` (20), `u` (36), `m` (60), and `y` (64). Uppercase
`D` is reserved and returns `null`; a missing prefix otherwise returns
`undefined`.

Tagged JSON preserves `radix`, `digitOffset`, and `allowReserved`. Passing
`reviveCoreValue` to `JSON.parse` restores the same conversion behavior.

```js
BaseSystem.getSystemForPrefix("x").equals(BaseSystem.HEXADECIMAL); // true
BaseSystem.getPrefixForSystem(BaseSystem.BINARY);                  // "b"
BaseSystem.getSystemForPrefix("D");                                // null
```

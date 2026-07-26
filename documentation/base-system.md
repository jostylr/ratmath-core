---
title: BaseSystem
---

`BaseSystem` defines an ordered single-character digit alphabet. It converts
integers to and from that alphabet and supplies digit systems for rational
formatting.

## Construct a system

```js
import { BaseSystem } from "@ratmath/core";

const balancedLooking = new BaseSystem("abc", "ABC digits");

balancedLooking.base;       // 3
balancedLooking.characters; // ["a", "b", "c"]
balancedLooking.charMap.get("c"); // 2
balancedLooking.name;       // "ABC digits"
```

The first character has value zero, the second value one, and so on. The
constructor accepts a string or an array and requires at least two unique
characters. It does **not** expand range syntax such as `"0-9a-f"`.

`+ - * / ^ ! ( ) [ ] : . # ~` are in `BaseSystem.RESERVED_SYMBOLS` and cannot
be digits because they conflict with RatMath/RiX notation. The `characters`
array and `charMap` getters return copies.

## Conversion and inspection

| Method | Result |
|---|---|
| `getChar(value)` | Digit at an in-range numeric value |
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

```js
BaseSystem.getSystemForPrefix("x").equals(BaseSystem.HEXADECIMAL); // true
BaseSystem.getPrefixForSystem(BaseSystem.BINARY);                  // "b"
BaseSystem.getSystemForPrefix("D");                                // null
```

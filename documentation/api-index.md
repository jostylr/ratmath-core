---
title: API index
---

The package exports every item below as a named export. Its default export is
an object containing the seven classes and seven parsing functions.

## Classes

| Export | Constructor |
|---|---|
| [`Integer`](integer.md) | `new Integer(value)` |
| [`Rational`](rational.md) | `new Rational(numerator, denominator?)` |
| [`RationalInterval`](rational-interval.md) | `new RationalInterval(a, b)` |
| [`Fraction`](fraction.md) | `new Fraction(numerator, denominator?, options?)` |
| [`FractionInterval`](fraction-interval.md) | `new FractionInterval(a, b)` |
| [`BaseSystem`](base-system.md) | `new BaseSystem(characters, name?)` |
| [`TypePromotion`](type-promotion.md) | Static utility class; do not instantiate |

## Parsing functions

| Export | Signature |
|---|---|
| [`parseNumber`](parsing.md) | `(value: string) => Integer \| Rational \| RationalInterval` |
| [`parseRational`](parsing.md) | `(value: string) => Rational` |
| [`parseDecimal`](parsing.md) | `(value: string) => Rational` |
| [`parseRepeatingDecimal`](parsing.md) | `(value: string) => Rational` |
| [`parseMixedNumber`](parsing.md) | `(value: string) => Rational` |
| [`parseContinuedFraction`](parsing.md) | `(value: string \| readonly (number \| bigint)[]) => Rational` |
| [`parseInterval`](parsing.md) | `(value: string) => RationalInterval` |

## TypeScript types

```ts
type IntegerInput = number | string | bigint | Integer;
type RationalInput = IntegerInput | Rational;
type CoreScalar = Integer | Rational;
type CoreNumber = CoreScalar | RationalInterval;
type SternBrocotDirection = "L" | "R";
```

The formatting result interfaces are:

```ts
interface RepeatingExpansion {
  decimal: string;
  period: number;
}

interface BaseExpansion {
  baseStr: string;
  period: number;
  limitHit: boolean;
}

interface DecimalMetadata {
  wholePart?: bigint;
  initialSegment: string;
  initialSegmentLeadingZeros?: number;
  initialSegmentRest?: string;
  periodDigits: string;
  periodLength: number;
  leadingZerosInPeriod?: number;
  periodDigitsRest?: string;
  isTerminating: boolean;
}
```

## Method checklist

This is a compact inventory; the linked class pages document behavior,
examples, edge cases, and return types.

| Class | Public members |
|---|---|
| `Integer` | `value`; `add`, `subtract`, `multiply`, `divide`, `modulo`, `negate`, `pow`; comparisons; `abs`, `sign`, sign/parity predicates; `gcd`, `lcm`; `toString`, `toBase`, `toNumber`, `toRational`; `E`, `factorial`, `doubleFactorial`, `bitLength`; static `zero`, `one`, `from`, `fromRational` |
| `Rational` | `numerator`, `denominator`; arithmetic, comparison, `abs`; fraction/mixed/decimal/base/scientific formatters; period metadata; continued fractions, convergents, and bounded approximations; `E`, `bitLength`; static construction helpers and formatting limits |
| `RationalInterval` | `start`, `end`, `isAscending`, `low`, `high`; arithmetic, `pow`, `mpow`; containment/set operations; interval formatters; `mediant`, `midpoint`, `shortestDecimal`, `randomRational`, `E`, `bitLength`; static `zero`, `one`, `unitInterval`, `point`, `fromString` |
| `Fraction` | `numerator`, `denominator`, `isInfinite`; unreduced arithmetic, comparisons, `scale`, `reduce`, `E`; mediant/Farey operations; Stern–Brocot navigation; static conversion and relationship helpers |
| `FractionInterval` | `low`, `high`; `mediantSplit`, `partitionWithMediants`, `partitionWith`; conversion, string/equality, `E`; static `fromRationalInterval` |
| `BaseSystem` | `base`, `characters`, `charMap`, `name`; digit conversion/validation; equality/case behavior; presets, factories, and prefix registry |
| `TypePromotion` | Type-level inspection/promotion; arithmetic dispatch; power, E notation, negation; syntactic type classification |

The installed package's `index.d.ts` is the authoritative machine-readable
signature reference.

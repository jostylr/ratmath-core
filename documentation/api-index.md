---
title: API index
---

The package exports every item below as a named export. Its default export also
contains the classes, parsing functions, type guards, and JSON reviver.

## Classes

| Export | Constructor |
|---|---|
| [`Integer`](integer.md) | `new Integer(value)` |
| [`Rational`](rational.md) | `new Rational(numerator, denominator?)` |
| [`RationalInterval`](rational-interval.md) | `new RationalInterval(a, b)` |
| [`CertifiedApproximation`](certified-approximation.md) | `new CertifiedApproximation(candidate, enclosure, options?)` |
| [`Fraction`](fraction.md) | `new Fraction(numerator, denominator?, options?)` |
| [`FractionInterval`](fraction-interval.md) | `new FractionInterval(a, b)` |
| [`BaseSystem`](base-system.md) | `new BaseSystem(characters, name?, options?)` |
| [`TypePromotion`](type-promotion.md) | Static utility class; do not instantiate |

## Parsing functions

| Export | Signature |
|---|---|
| [`parseNumber`](parsing.md) | `(value: string) => CoreNumber` |
| [`parseCertifiedApproximation`](parsing.md) | `(value: string) => CertifiedApproximation` |
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
type CoreNumber = CoreScalar | RationalInterval | CertifiedApproximation;
type SternBrocotDirection = "L" | "R";
```

## Guards and JSON

`isInteger`, `isRational`, `isRationalInterval`, `isCertifiedApproximation`, `isFraction`,
`isFractionInterval`, `isBaseSystem`, and `isCoreNumber` provide public runtime
type checks. Use `reviveCoreValue` as a `JSON.parse` reviver for tagged output
created by the core classes' `toJSON()` methods.

The formatting result interfaces are:

```ts
interface RepeatingExpansion {
  decimal: string | null;
  period: number;
  truncated: boolean;
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
| `RationalInterval` | `start`, `end`, `isAscending`, `low`, `high`; arithmetic, `pow`, `mpow`; containment/set operations; interval formatters; `mediant`, `midpoint`, `shortestDecimal`, `denominatorInterval`, `randomRational`, `E`, `bitLength`; static `zero`, `one`, `unitInterval`, `point`, `fromString` |
| [`CertifiedApproximation`](certified-approximation.md) | `candidate`, authoritative `enclosure`, immutable `representation`, `sourceId`, `dependencies`; scalar enclosure arithmetic; exact/interval conversions; `possibleRelationsTo`; copy, formatting, and JSON |
| `Fraction` | `numerator`, `denominator`, `isInfinite`; unreduced arithmetic, comparisons, `scale`, `reduce`, `E`; mediant/Farey operations; Stern–Brocot navigation; static conversion and relationship helpers |
| `FractionInterval` | `low`, `high`; `mediantSplit`, `partitionWithMediants`, `partitionWith`; conversion, string/equality, `E`; static `fromRationalInterval` |
| `BaseSystem` | `base`, signed `radix`, `digitOffset`, fractional/quoting capability flags, `characters`, `charMap`, `name`; digit conversion/validation; equality/case behavior; presets, factories, and prefix registry |
| `TypePromotion` | Type-level inspection/promotion; arithmetic dispatch; power, E notation, negation; syntactic type classification |

The installed package's `index.d.ts` is the authoritative machine-readable
signature reference.

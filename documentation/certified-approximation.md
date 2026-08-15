---
title: CertifiedApproximation
---

`CertifiedApproximation` represents one uncertain scalar. It stores a finite
candidate for display or downstream estimation and a closed, exact
`RationalInterval` that is the authoritative guarantee.

```js
import { parseNumber } from "@ratmath/core";

const reading = parseNumber("23.456?789");

reading.candidate.toString(); // "23456789/1000000"
reading.enclosure.toString(); // "2932/125:23457/1000"
reading.low.toString();       // "2932/125"
reading.high.toString();      // "23457/1000"
```

The candidate must lie inside the enclosure. Constructor inputs that violate
that invariant throw. `representation`, its standard metadata records, and
`dependencies` are frozen copies, so later caller mutation cannot change the
approximation contract.

## Construction helpers

Literal parsing is usually the shortest route; see [Parsing](parsing.md).
Programmatic APIs are also available:

| Export | Result |
|---|---|
| `certifiedRadixPrefix(options)` | Certified ordinary positional-radix prefix and optional provisional digits |
| `certifiedContinuedFractionPrefix(options)` | Certified continued-fraction coefficient prefix |
| `boundedDecimalApproximation(value, options?)` | Exact terminating scalar or certified decimal prefix at the requested digit bound |
| `boundedContinuedFractionApproximation(value, options?)` | Exact finite scalar or certified coefficient prefix at the requested term bound |
| `normalizeCertifiedApproximation(candidate, enclosure, options?)` | Exact scalar for a point enclosure unless `preserveWrapper` is true; otherwise a wrapper |

`certifiedRadixPrefix` requires a conventional positional `BaseSystem` whose
first digit means zero. Signed, balanced, and bijective systems support integer
conversion but do not define the ordinary fractional cylinders this helper
certifies.

## Arithmetic

`add`, `subtract`, `multiply`, `divide`, `negate`, `reciprocal`, `pow`, and `E`
propagate the exact enclosure. Arithmetic with `Integer`, `Rational`, or another
`CertifiedApproximation` keeps scalar-uncertainty semantics. An explicit
operation with `RationalInterval` returns interval arithmetic instead.

```js
const shifted = reading.add(parseNumber("0.5"));

shifted.candidate.toString(); // "23956789/1000000"
shifted.enclosure.toString(); // "5989/250:23957/1000"
```

Subtracting two wrappers with the same `sourceId` is exactly zero. Dividing a
wrapper by the same source is exactly one unless its enclosure contains zero.
Derived wrappers receive a new source identity and record serializable source
dependencies when available.

## Relations

Overlapping enclosures do not justify a single Boolean comparison. Use
`possibleRelations(left, right)` or `value.possibleRelationsTo(other)`. The
result is a bit mask composed from `Relation.LESS`, `Relation.EQUAL`, and
`Relation.GREATER`.

```js
import { Relation, possibleRelations } from "@ratmath/core";

const mask = possibleRelations(parseNumber("2?"), parseNumber("2.5?"));
const couldBeLess = (mask & Relation.LESS) !== 0;
```

Wrappers copied from the same source compare as `Relation.EQUAL`; this records
identity of the uncertain scalar rather than a claim that its unknown exact
value equals every point in its enclosure.

## Conversion and serialization

| Member | Result |
|---|---|
| `toRationalInterval()` | Authoritative enclosure |
| `toRational()` | Point value, or throws for a non-point enclosure |
| `copy()` | New wrapper preserving source identity and metadata |
| `toString()` | Parseable prefix notation or `candidate?[=low:high]` |
| `toJSON()` | Tagged candidate, enclosure, representation, serializable source ID, and dependencies |

`toString()` preserves both candidate and enclosure across a `parseNumber`
round trip. Tagged JSON additionally preserves representation metadata and all
string or number provenance identifiers:

```js
import { reviveCoreValue } from "@ratmath/core";

const restored = JSON.parse(JSON.stringify(reading), reviveCoreValue);
restored.enclosure.equals(reading.enclosure); // true
```

JavaScript symbols are process-local and cannot be represented in JSON. A
symbol source receives a new local identity after revival, and symbol
dependencies are omitted from serialized output.

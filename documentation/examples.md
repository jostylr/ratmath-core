---
title: Examples
---

These examples use exact values throughout unless they explicitly call
`toNumber()`.

## Add fractions without rounding

```js
import { Rational } from "@ratmath/core";

const recipe = new Rational(2, 3).add(new Rational(3, 4));

recipe.toString();      // "17/12"
recipe.toMixedString(); // "1..5/12"
```

## Convert decimal text exactly

```js
import { parseDecimal } from "@ratmath/core";

const price = parseDecimal("19.99");
const taxRate = parseDecimal("0.0825");
const tax = price.multiply(taxRate);

tax.toString();  // "65967/40000"
tax.toDecimal(); // "1.649175"
```

No binary floating-point value is created while parsing or multiplying.

## Round-trip a repeating decimal

```js
import { parseDecimal } from "@ratmath/core";

const value = parseDecimal("12.34#56");
const encoded = value.toRepeatingDecimal();
const decoded = parseDecimal(encoded);

encoded;               // "12.34#56"
decoded.equals(value); // true
```

## Mixed-number input and output

```js
import { parseMixedNumber } from "@ratmath/core";

const distance = parseMixedNumber("-2..1/4");

distance.toString();      // "-9/4"
distance.toMixedString(); // "-2..1/4"
```

## Continued-fraction convergents

```js
import { Rational } from "@ratmath/core";

const piApproximation = new Rational(355, 113);

piApproximation.toContinuedFraction(); // [3n, 7n, 16n]
piApproximation.convergents().map((value) => value.toString());
// ["3", "22/7", "355/113"]

piApproximation.bestApproximation(100n).toString(); // "311/99"
piApproximation.bestConvergent(100n).toString();    // "22/7"
```

## Parse and calculate with uncertainty

```js
import { parseInterval, parseRational } from "@ratmath/core";

const measured = parseInterval("1.23[+-1]"); // [1.229, 1.231]
const scale = parseRational("3/2");
const result = measured.multiply(scale);

result.toString();           // "3687/2000:3693/2000"
result.toRepeatingDecimal(); // "1.8435#0:1.8465#0"
```

## Pointwise versus independent powers

```js
import { RationalInterval } from "@ratmath/core";

const uncertain = new RationalInterval(-2, 3);

uncertain.pow(2).toString();  // "0:9"
uncertain.mpow(2).toString(); // "-6:9"
```

The first is the image of one uncertain value under `x => x²`; the second
multiplies two independently selected members of the interval.

## Find a simple decimal inside an interval

```js
import { RationalInterval } from "@ratmath/core";

const bounds = new RationalInterval("499/1000", "501/1000");
const simple = bounds.shortestDecimal();

simple.toString();        // "1/2"
bounds.containsValue(simple); // true
```

## Preserve an unreduced representation

```js
import { Fraction } from "@ratmath/core";

const quarters = new Fraction(2, 4);

quarters.toString();             // "2/4"
quarters.scale(3).toString();    // "6/12"
quarters.reduce().toString();    // "1/2"
quarters.toRational().toString(); // "1/2"
```

## Subdivide by mediants

```js
import { Fraction, FractionInterval } from "@ratmath/core";

const interval = new FractionInterval(
  new Fraction(0, 1),
  new Fraction(1, 1),
);

interval.partitionWithMediants(2).map((part) => part.toString());
// ["0:1/3", "1/3:1/2", "1/2:2/3", "2/3:1"]
```

## Follow a Stern–Brocot path

```js
import { Fraction } from "@ratmath/core";

const value = new Fraction(5, 3);
const path = value.sternBrocotPath();
const restored = Fraction.fromSternBrocotPath(path);

path;                  // ["R", "R", "L", "R"]
restored.toString();   // "5/3"
restored.equals(value); // true
```

## Use a custom alphabet

```js
import { BaseSystem, Rational } from "@ratmath/core";

const binaryWords = new BaseSystem(["O", "I"], "Word binary");

binaryWords.fromDecimal(13n); // "IIOI"
binaryWords.toDecimal("IIOI"); // 13n

new Rational(1, 3).toRepeatingBase(binaryWords); // "O.#OI"
```

## Safely cross the JavaScript-number boundary

```js
import { Integer } from "@ratmath/core";

const exact = new Integer("9007199254740993");
const approximate = exact.toNumber();

exact.toString(); // "9007199254740993"
approximate;      // 9007199254740992 (precision lost)
```

Keep exact values as `Integer`/`Rational` until an API specifically requires a
JavaScript `number`.

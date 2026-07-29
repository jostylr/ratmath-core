---
title: Getting started
---

## Install

```sh
npm install @ratmath/core
```

`@ratmath/core` is an ES module and requires Node.js 22 or newer.

## Import

Named imports are recommended:

```js
import {
  Integer,
  Rational,
  RationalInterval,
  Fraction,
  FractionInterval,
  BaseSystem,
  TypePromotion,
  parseNumber,
} from "@ratmath/core";
```

A namespace-style default export is also available:

```js
import RatMath from "@ratmath/core";

const value = new RatMath.Rational(5, 8);
```

## Choose the representation

Use `Integer` when the result should stay integral, `Rational` for exact
fractions, and `RationalInterval` for a closed range:

```js
const count = new Integer("9007199254740993");
const ratio = new Rational(count.value, 7n);
const bounds = new RationalInterval("1/3", "2/3");
```

Use `Fraction` when the *written representation* matters:

```js
const unreduced = new Fraction(2, 4);

unreduced.toString();          // "2/4"
unreduced.reduce().toString(); // "1/2"
```

## Arithmetic and promotion

The methods are named `add`, `subtract`, `multiply`, and `divide`. Mixed
operations promote upward:

```js
const two = new Integer(2);
const third = new Rational(1, 3);

two.add(third).toString(); // "7/3" (Rational)

const range = new RationalInterval(1, 2);
third.multiply(range).toString(); // "1/3:2/3"
```

Integer division stays `Integer` when exact and becomes `Rational` otherwise:

```js
new Integer(8).divide(new Integer(4)).toString(); // "2"
new Integer(8).divide(new Integer(3)).toString(); // "8/3"
```

## Exact input and output

Constructors accept convenient scalar inputs, but the parsing helpers are the
single entry point for all supported RiX number forms:

```js
import { parseNumber, parseRational } from "@ratmath/core";

parseNumber("1_000");        // Integer
parseNumber("-2..1/4");      // Rational
parseNumber("0.[#3:#6]");    // RationalInterval
parseRational("3.~7~15");    // Rational
```

Use exact formats for round trips:

```js
const value = new Rational(1, 7);

value.toString();                  // "1/7"
value.toRepeatingDecimal();        // "0.#142857"
value.toContinuedFractionString(); // "0.~7"
```

`toNumber()` crosses into IEEE-754 floating-point arithmetic and can lose
precision. `Rational.toDecimal()` is display-oriented and truncates long
non-terminating results; use a fraction or repeating expansion for exact
serialization.

## Errors

Invalid syntax, zero denominators, division by zero, reciprocal intervals that
contain zero, and undefined powers such as `0^0` throw `Error`. The API does not
return `NaN` or infinity for these operations.

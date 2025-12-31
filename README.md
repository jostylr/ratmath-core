# RatMath (Core)

A JavaScript library for exact rational arithmetic, interval arithmetic, and high-precision integer math (BigInt).

## Features
- **Rational Arithmetic**: Exact fraction arithmetic (no floating point errors).
- **Interval Arithmetic**: Handle uncertainties with rational intervals.
- **Arbitrary Precision**: Built on BigInt.
- **Continued Fractions**: Conversions and operations.
- **Scientific Functions**: High-precision implementations of sin, cos, exp, ln, etc. (via `ratreal.js`).

## Installation

```bash
npm install @ratmath/core
```

## Related Projects

- **[@ratmath/parser](https://github.com/jostylr/ratmath-parser)**: Expression parser and template literal tags (`R`, `F`).
- **[ratcalc](https://github.com/jostylr/ratcalc)**: Terminal-based calculator (REPL).
- **[ratweb](https://github.com/jostylr/ratmath-web)**: Web-based calculator and documentation.

## Usage

```javascript
import { Rational, RationalInterval, PI } from "@ratmath/core";

const half = new Rational(1, 2);
const third = new Rational(1, 3);
console.log(half.add(third).toString()); // "5/6"
```

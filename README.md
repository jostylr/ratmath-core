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
npm install ratmath
```

## Related Projects

- **[ratmath-parser](../ratmath-parser)**: Expression parser and template literal tags (`R`, `F`).
- **[ratcalc](../ratcalc)**: Terminal-based calculator (REPL).
- **[ratweb](../ratweb)**: Web-based calculator and documentation.

## Usage

```javascript
import { Rational, RationalInterval, PI } from "ratmath";

const half = new Rational(1, 2);
const third = new Rational(1, 3);
console.log(half.add(third).toString()); // "5/6"
```

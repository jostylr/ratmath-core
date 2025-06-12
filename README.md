# RatMath

A JavaScript library for exact rational arithmetic and interval arithmetic. The library provides classes for working with exact rational numbers using BigInt and closed intervals of rational numbers, along with a parser for interval expressions.

## Features

- **Exact Arithmetic**: All calculations are performed exactly, with no floating-point approximation errors.
- **Integer Arithmetic**: BigInt-based integer class with exact arithmetic. Division returns Integer for exact results or Rational for non-exact results.
- **Factorial Operations**: Support for standard factorial (n!) and double factorial (n!!) operations with exact BigInt precision.
- **Rational Numbers**: Represents fractions in lowest terms with arbitrary precision using JavaScript's built-in BigInt.
- **Mixed Number Notation**: Supports both standard fraction notation (a/b) and mixed number notation (a..b/c).
- **Fraction Representation**: Provides a Fraction class that maintains the exact numerator and denominator without automatic reduction.
- **Interval Arithmetic**: Supports operations on closed intervals with exact rational endpoints.
- **Fraction Intervals**: Implements intervals with Fraction endpoints for exact representation without automatic reduction.
- **Mediant Partitioning**: Create interval subdivisions using mediants (useful in continued fractions and number theory).
- **Repeating Decimal Support**: Parse repeating decimals like "0.12#45" and convert them to exact rational representations.
- **Decimal Uncertainty Parsing**: Parse decimal numbers with uncertainty notation like "1.23[56,67]" (range), "1.23[+5,-6]" (relative), or "1.3[+-1]" (symmetric).
- **Expression Parser**: Parse and evaluate string expressions involving rational intervals and arithmetic operations, including factorial operators.

## Web calculator

Try out the [ratmath calcuator](https://calc.ratmath.com) today!

## Installation

This library is designed to work in both Node.js/Bun environments and browsers as an ES module.

```bash
# Using npm
npm install ratmath

# Using Bun
bun add ratmath
```

## How to Use

### Template String Functions

The library provides convenient template string functions for creating rational numbers and fractions:

#### R Template Function

The `R` template function parses expressions using type-aware parsing, returning the most appropriate type (`Integer`, `Rational`, or `RationalInterval`):

```javascript
import { R } from 'ratmath';

// Basic fraction literals
const n = 3, m = 5;
const frac = R`${n}/${m}`;          // Rational(3/5)

// Fractions with denominator 1 stay as Rational
const rational = R`${7}/1`;         // Rational(7) (not Integer)

// Exact division promotes to Integer
const exact = R`${8}/${2}`;         // Integer(4)

// Intervals
const interval = R`${2}:${4}`;      // RationalInterval(2, 4)

// Complex expressions
const calc = R`${1}/${2} + ${3}/${4}`;  // Rational(5/4)

// Mixed numbers
const mixed = R`${2}..${1}/${3}`;   // Rational(7/3)

// Multiplicative power (always returns intervals)
const mpow = R`${2}**${3}`;         // RationalInterval(8, 8)
```

#### F Template Function

The `F` template function forces results into `Fraction` and `FractionInterval` types:

```javascript
import { F } from 'ratmath';

// Simple fractions
const frac = F`${3}/${5}`;          // Fraction(3, 5)

// Integers become fractions with denominator 1
const whole = F`${7}`;              // Fraction(7, 1)

// Fraction intervals
const fracInterval = F`${1}/${2}:${3}/${4}`;  // FractionInterval(1/2, 3/4)

// Arithmetic results
const sum = F`${1}/${2} + ${1}/${3}`;         // Fraction(5, 6)

// Even exact divisions become fractions
const division = F`${8}/${2}`;      // Fraction(4, 1)
```

#### Real-World Examples

```javascript
import { R, F } from 'ratmath';

// Cooking measurements
const cups = 2, teaspoons = 3;
const totalTeaspoons = R`${cups} * 48 + ${teaspoons}`;  // 99 teaspoons

// Engineering tolerances
const nominal = 100, tolerance = 5;
const spec = R`${nominal - tolerance}:${nominal + tolerance}`;  // 95:105

// Financial calculations
const profit = 150, revenue = 1000;
const margin = F`${profit}/${revenue}`;  // Fraction(3, 20) = 15%

// Compound calculations
const result = R`(${1}/${2} + ${3}/${4}) * 2`;  // Rational(5/2)
```

## Usage

### Repeating Decimal Parsing

Convert repeating decimals to exact rational numbers:

```javascript
import { parseRepeatingDecimal } from 'ratmath';

// Basic repeating decimals
const oneThird = parseRepeatingDecimal('0.#3');        // 1/3
const twoThirds = parseRepeatingDecimal('0.#6');       // 2/3
const complex = parseRepeatingDecimal('0.12#45');      // 137/1100

// Terminating decimals (using #0)
const exact = parseRepeatingDecimal('1.23#0');         // 123/100
const half = parseRepeatingDecimal('0.5#0');           // 1/2

// Negative repeating decimals
const negThird = parseRepeatingDecimal('-0.#3');       // -1/3

// Non-repeating decimals become intervals
const uncertain = parseRepeatingDecimal('1.23');       // [1.225, 1.235]
const negUncertain = parseRepeatingDecimal('-0.5');    // [-0.55, -0.45]

// Mathematical verification
const nineNines = parseRepeatingDecimal('0.#9');       // 1 (exactly)
console.log(nineNines.equals(new Rational(1)));        // true

// Common fractions
const oneSeventh = parseRepeatingDecimal('0.#142857'); // 1/7
const oneSixth = parseRepeatingDecimal('0.1#6');       // 1/6

// Convert rationals back to repeating decimals
console.log(oneThird.toRepeatingDecimal());            // "0.#3"
console.log(oneSeventh.toRepeatingDecimal());          // "0.#142857"
```

### Repeating Decimal Intervals

Parse intervals with repeating decimal endpoints and offsets:

```javascript
import { parseRepeatingDecimal, Parser } from 'ratmath';

// Range notation after decimal point: 0.[#3,#6] or 1.[1,4]
const range1 = parseRepeatingDecimal('0.[#3,#6]');     // 1/3 to 2/3
const range2 = parseRepeatingDecimal('1.[1,4]');       // 1.1 to 1.4
const range3 = parseRepeatingDecimal('0.[#142857,#285714]'); // 1/7 to 2/7

// Mixed repeating and terminating decimals
const mixed = parseRepeatingDecimal('0.[2,#6]');       // 0.2 to 2/3

// Integer base with any offsets (applied directly)
const offset1 = parseRepeatingDecimal('12[+4.3,-2]'); // [10, 16.3]
const offset2 = parseRepeatingDecimal('12[+0.43,-13]'); // [-1, 12.43]
const integerOffset = parseRepeatingDecimal('78[+-10]'); // [68, 88]

// Integer base with repeating decimal offsets
const repeatOffset = parseRepeatingDecimal('1[+-0.#3]'); // [2/3, 4/3]
const relativeRepeat = parseRepeatingDecimal('5[+0.#3,-0.#6]'); // [13/3, 16/3]

// Decimal base with any offsets (scaled to next decimal place)
const decimalBase = parseRepeatingDecimal('0.5[+-33.#3]'); // scaled offset
const decimalInt = parseRepeatingDecimal('1.23[+-5]'); // [1.225, 1.235] (5 scaled to 0.005)



// Use in expressions
const expr = Parser.parse('(0.[#1,#2] + 1.[#3,#4]) / 2'); // Complex arithmetic
console.log(expr.low.toString(), 'to', expr.high.toString()); // "13/18 to 5/6"
```

### Decimal Uncertainty Parsing

Parse decimal numbers with uncertainty notation:

```javascript
import { Parser } from 'ratmath';

// Range notation: base[lower_digits,upper_digits] (concatenation)
const range1 = Parser.parse('1.23[56,67]');           // 1.2356 to 1.2367
const range2 = Parser.parse('78.3[15,24]');           // 78.315 to 78.324
const range3 = Parser.parse('42[15,25]');             // 4215 to 4225

// Integer base range notation (concatenates digits)
const basic = Parser.parse('1[2,3]');                 // 12 to 13
const decimal = Parser.parse('1[2.34,9]');            // 12.34 to 19
const ordered = Parser.parse('1[3,2]');               // 12 to 13 (auto-ordered)

// Relative notation: base[+positive_offset,-negative_offset]
const rel1 = Parser.parse('1.23[+5,-6]');             // 1.224 to 1.235
const rel2 = Parser.parse('78.3[+15,-0.6]');          // 78.294 to 78.45
const rel3 = Parser.parse('1.5[+0.25,-0.15]');        // 1.4985 to 1.5025

// Symmetric notation: base[+-offset] (equivalent to base[-+offset])
const sym1 = Parser.parse('1.3[+-1]');                // 1.29 to 1.31
const sym2 = Parser.parse('2.5[+-0.25]');             // 2.4975 to 2.5025
const sym3 = Parser.parse('1.3[-+1]');                // Same as sym1
console.log(sym1.equals(sym3));                       // true

// Order independence in relative notation
const rel4a = Parser.parse('2.0[+0.1,-0.2]');         // 1.998 to 2.001
const rel4b = Parser.parse('2.0[-0.2,+0.1]');         // Same as above
console.log(rel4a.equals(rel4b));                     // true

// Negative base numbers
const neg1 = Parser.parse('-1.23[56,67]');            // -1.2367 to -1.2356
const neg2 = Parser.parse('-2.5[+0.1,-0.2]');         // -2.502 to -2.499

// Export intervals to uncertainty notation
import { RationalInterval, Rational } from 'ratmath';

const interval = new RationalInterval(new Rational('1.2356'), new Rational('1.2367'));
console.log(interval.compactedDecimalInterval());     // "1.23[56,67]"
console.log(interval.relativeMidDecimalInterval());   // "1.23615[+-0.00055]"

// Arithmetic with uncertainty intervals
const sum = Parser.parse('1.23[+0.5,-0.3] + 2.45[+0.2,-0.1]');  // [3.6796, 3.6807]
const product = Parser.parse('2[+-0.1] * 3[-+0.2]');     // [5.32, 6.72] (integer bases)

// Note: Range notation 1[2,3] creates intervals 12:13 via concatenation
// This is different from offset notation 1[+2,-3] which adds/subtracts values

// Concatenation validation prevents problematic ranges:
// Valid:   12[34,42] → 1234:1242 (integer parts: 34,42 both 2 digits)
// Valid:   1[19.2,20] → 119.2:120 (integer parts: 19,20 both 2 digits)
// Valid:   1.2[3,6]  → 1.23:1.26 (decimal base allows any)
// Invalid: 1[9,20] (integer parts: 9=1 digit, 20=2 digits)
// Invalid: 1[9.2,20] (integer parts: 9=1 digit, 20=2 digits)
// Invalid: 1.2[3.4,5.6] (creates double decimal points)
```

### Basic Rational Arithmetic

Rational numbers are always normalized to lowest terms:

```javascript
import { Rational } from 'ratmath';

// Create rational numbers
const a = new Rational(1, 2);    // 1/2
const b = new Rational('3/4');   // 3/4
const c = new Rational(5);       // 5/1
const d = new Rational('5..2/3'); // 17/3 (mixed number notation)

// Arithmetic operations
const sum = a.add(b);            // 5/4
const product = a.multiply(b);   // 3/8
const quotient = a.divide(b);    // 2/3

// Comparisons
const isLess = a.lessThan(b);    // true
const isEqual = a.equals(new Rational(2, 4)); // true (1/2 = 2/4)

// Powers
const squared = a.pow(2);        // 1/4
const cubed = a.pow(3);          // 1/8
const reciprocal = a.pow(-1);    // 2/1

// Conversion
console.log(sum.toString());     // "5/4"
console.log(sum.toNumber());     // 1.25 (approximate)
console.log(d.toMixedString());  // "5..2/3"
```

### Integer Arithmetic

The Integer class provides exact arithmetic with BigInt precision. Division automatically returns a Rational when the result is not a whole number:

```javascript
import { Integer, Rational } from 'ratmath';

// Create integers
const a = new Integer(15);
const b = new Integer('123456789012345678901234567890'); // Large numbers
const c = new Integer(-7);

// Arithmetic operations
const sum = a.add(c);            // 8
const product = a.multiply(c);   // -105
const power = a.pow(3);          // 3375

// Negative exponents return Rational numbers
const reciprocal = a.pow(-1);    // 1/15 (Rational)
const negSquare = a.pow(-2);     // 1/225 (Rational)

// Division - returns Integer or Rational automatically
const exactDiv = a.divide(new Integer(3));  // 5 (Integer)
const inexactDiv = a.divide(new Integer(4)); // 15/4 (Rational)

console.log(`15 ÷ 3 = ${exactDiv} (${exactDiv.constructor.name})`);
console.log(`15 ÷ 4 = ${inexactDiv} (${inexactDiv.constructor.name})`);

// Factorial operations
console.log(a.factorial());      // 1307674368000 (15!)
console.log(new Integer(5).factorial());  // 120 (5!)
console.log(new Integer(0).factorial());  // 1 (0! = 1 by definition)

// Double factorial operations
console.log(new Integer(5).doubleFactorial());  // 15 (5×3×1)
console.log(new Integer(6).doubleFactorial());  // 48 (6×4×2)
console.log(new Integer(7).doubleFactorial());  // 105 (7×5×3×1)

// Utility methods
console.log(c.abs());            // 7
console.log(a.isEven());         // false
console.log(a.gcd(new Integer(10))); // 5

// Conversion
console.log(a.toRational());     // 15/1 (Rational)
console.log(Integer.fromRational(new Rational(42, 1))); // 42 (Integer)
```

### Integer-Rational Integration

The Integer and Rational classes work seamlessly together, with automatic type conversion:

```javascript
import { Integer, Rational } from 'ratmath';

// Start with integers, automatic rational conversion when needed
const shares = new Integer(1000);
const people = new Integer(7);
const perPerson = shares.divide(people);  // Returns Rational(1000, 7)

console.log(`$${shares} ÷ ${people} = $${perPerson} each`);
console.log(`As decimal: $${perPerson.toNumber().toFixed(2)}`);

// Verify exact arithmetic: 7 × (1000/7) = 1000
const verification = perPerson.multiply(people.toRational());
console.log(`Verification: ${people} × ${perPerson} = $${verification}`);

// Mathematical calculations with mixed types
const fibonacci = (n) => {
    let a = new Integer(0), b = new Integer(1);
    for (let i = 2; i <= n; i++) {
        [a, b] = [b, a.add(b)];
    }
    return b;
};

const f20 = fibonacci(20);
const f19 = fibonacci(19);
const goldenRatio = f20.divide(f19);  // Automatic rational result
console.log(`Golden ratio ≈ ${goldenRatio} = ${goldenRatio.toNumber()}`);
```

### Fraction Arithmetic

Use the Fraction class when you need to maintain the exact representation without automatic reduction:

```javascript
import { Fraction } from 'ratmath';

// Create fractions
const a = new Fraction(1, 2);    // 1/2
const b = new Fraction(2, 4);    // 2/4 (not reduced to 1/2)
const c = new Fraction('3/5');   // 3/5

// Check equality (compares exact numerator/denominator values)
console.log(a.equals(b));        // false (1/2 ≠ 2/4)

// Arithmetic (restricted for same denominators)
const sum = a.add(new Fraction(1, 2));    // 2/2
const d = new Fraction(2, 3);
// a.add(d) would throw an error - denominators must match

// Multiplication and division work with any denominators
const product = a.multiply(d);            // 2/6
const quotient = a.divide(d);             // 3/4

// Manually reduce when needed
const reduced = b.reduce();               // 1/2
console.log(reduced.equals(a));           // true

// Scaling
const scaled = a.scale(2);                // 2/4

// Mediant calculation
const mediant = Fraction.mediant(a, d);   // 3/5

// Convert between Fraction and Rational
const rat = a.toRational();               // 1/2 as Rational
const frac = Fraction.fromRational(rat);  // 1/2 as Fraction
```

### Interval Arithmetic
#### Examples

```javascript
import { Rational, RationalInterval } from 'ratmath';

// Create intervals
const interval1 = new RationalInterval('1/2', '3/4');         // [1/2, 3/4]
const interval2 = new RationalInterval(new Rational(1), 2);   // [1, 2]

// Interval operations
const sum = interval1.add(interval2);              // [3/2, 11/4]
const product = interval1.multiply(interval2);     // [1/2, 3/2]

// Check for overlap and containment
const overlaps = interval1.overlaps(interval2);    // false
const contains = interval2.containsValue('3/2');   // true

// Intersection and union
const i1 = new RationalInterval('1/2', '3/4');
const i2 = new RationalInterval('2/3', '5/6');
const intersection = i1.intersection(i2);          // [2/3, 3/4]
const union = i1.union(i2);                        // [1/2, 5/6]

// New methods for extracting special rationals
const interval = new RationalInterval('1/3', '2/3');
const mediant = interval.mediant();                // 3/6 = 1/2
const midpoint = interval.midpoint();              // (1/3 + 2/3)/2 = 1/2

// Find shortest decimal representation
const decimalInterval = new RationalInterval('0.15', '0.35');
const shortest = decimalInterval.shortestDecimal(); // 1/5 (denominator 10^1)
const binary = decimalInterval.shortestDecimal(2);  // 1/4 (denominator 2^2)

// Generate random rationals
const random = interval.randomRational(100);       // Random rational with max denominator 100
```

### Parsing Expressions

```javascript
import { Parser } from 'ratmath';

// Parse and evaluate simple expressions
const result1 = Parser.parse('1/2 + 3/4');   // 5/4

// Mixed number expressions
const result1m = Parser.parse('2..1/2 + 3..3/4');  // 6..1/4

// Interval expressions
const result2 = Parser.parse('1/2:3/4 * 2:3');  // [1, 9/4]

// Mixed number interval expressions
const result2m = Parser.parse('1..1/2:2..3/4 * 2:3');  // [3, 33/4]

// Complex expressions with parentheses
const result3 = Parser.parse('(1/2:3/4 + 1/4) * (3/2 - 1/2:1)');

// Parse expressions with repeating decimals
const repeatResult1 = Parser.parse('0.#3 + 0.#6');    // 1:1 (exact result)
const repeatResult2 = Parser.parse('1.23#45 * 2');    // 679/275:679/275
const intervalResult = Parser.parse('0.#3:0.8#3');  // 1/3:5/6

// Parse expressions with bracket notation (uncertainty/range)
const bracketBasic = Parser.parse('1[2,3]');          // 12:13 (concatenation)
const bracketDecimal = Parser.parse('1[2.34,9]');     // 617/50:19 (12.34:19)
const bracketOrdered = Parser.parse('1[3,2]');        // 12:13 (auto-ordered)

// Validation prevents problematic concatenation ranges
const validConcat = Parser.parse('12[34,42]');        // 1234:1242 (valid: integer parts 34,42 both 2 digits)
const validMixed = Parser.parse('1[19.2,20]');        // 119.2:120 (valid: integer parts 19,20 both 2 digits)
const validDecimal = Parser.parse('1.2[3,6]');        // 1.23:1.26 (valid: decimal base allows any)
// Parser.parse('1[9,20]');                           // Error: integer parts 9=1 digit, 20=2 digits
// Parser.parse('1[9.2,20]');                         // Error: integer parts 9=1 digit, 20=2 digits
// Parser.parse('1.2[3.4,5.6]');                      // Error: double decimal points
const bracketOffset = Parser.parse('1[+-0.5]');       // 1/2:3/2 (offset notation)

// Exact decimal intervals (treated as terminating decimals)
const exactInterval = Parser.parse('1.23:1.34');      // [123/100, 67/50]
const mixedInterval = Parser.parse('1.5:0.#3');       // [1/3, 3/2]

// Factorial operations with type-aware parsing
const fact1 = Parser.parse('5!', { typeAware: true });       // 120 (Integer)
const fact2 = Parser.parse('6!!', { typeAware: true });      // 48 (Integer: 6×4×2)
const fact3 = Parser.parse('3! + 4!', { typeAware: true }); // 30 (Integer: 6+24)
const fact4 = Parser.parse('(2+3)!', { typeAware: true });  // 120 (Integer: 5!)
const fact5 = Parser.parse('2!^3', { typeAware: true });    // 8 (Integer: 2^3, factorial has higher precedence)

// Factorial with backward compatibility (returns intervals)
const factInterval1 = Parser.parse('5!');    // [120, 120]
const factInterval2 = Parser.parse('7!!');   // [105, 105] (7×5×3×1)

// Results are RationalInterval objects
console.log(result2.toString());     // "1:9/4"
console.log(result2m.toMixedString()); // "3:8..1/4"
```

## Terminal Calculator

The ratmath library includes an interactive terminal calculator (`calc.js`) that provides a command-line interface for performing exact rational arithmetic calculations.

### Running the Calculator

```bash
# Using Bun (recommended)
bun calc.js

# Make executable and run directly
chmod +x calc.js
./calc.js
```

### Features

- **Interactive Prompt**: Type mathematical expressions and get immediate results
- **Multiple Output Modes**: Switch between decimal, rational, and combined display
- **All Parser Features**: Supports all the parsing capabilities including intervals, factorials, repeating decimals, and uncertainty notation
- **Error Handling**: Clear error messages for division by zero, invalid syntax, etc.
- **Graceful Exit**: Use `EXIT`, `QUIT`, `BYE`, or Ctrl+C to exit

### Commands

- `HELP` - Display available operations and commands
- `DECI` - Show results as decimals only
- `RAT` - Show results as fractions only
- `BOTH` - Show both decimal and fraction (default)
- `LIMIT <n>` - Set decimal display limit to n digits (default: 20)
- `EXIT`, `QUIT`, `BYE` - Exit the calculator

### Example Session

```
$ bun calc.js
Ratmath Terminal Calculator
Type HELP for help, EXIT to quit

> 1/2 + 3/4
1.25 (5/4)
> 2^3
8
> 5!
120
> 1:2 * 3:4
3:8
> RAT
Output mode set to rational
> 1/3
1/3
> DECI
Output mode set to decimal
> 1/3
0.#3
> 0.#3
0.#3 (1/3)
> 1.5[+-0.1]
1.499:1.501 (1499/1000:1501/1000)
> BYE

Goodbye!
```

### Supported Operations

The calculator supports all the same operations as the Parser class:

- **Basic arithmetic**: `+`, `-`, `*`, `/`
- **Exponentiation**: `^` (standard), `**` (multiplicative/interval)
- **Factorials**: `!` (factorial), `!!` (double factorial)
- **Parentheses**: `(` `)` for grouping
- **Numbers**: Integers, fractions (`3/4`), decimals (`1.25`), mixed numbers (`1..2/3`)
- **Advanced**: Repeating decimals (`0.#3`), uncertainty notation (`1.23[+-0.01]`), intervals (`2:5`), scientific notation (`1E3`)

### Decimal Display

The calculator automatically displays repeating decimals using the `#` notation:

- `1/3` displays as `0.#3` (instead of `0.333333...`)
- `1/7` displays as `0.#142857` (shows the full repeating cycle)
- `22/7` displays as `3.#142857` (π approximation)
- `1/2` displays as `0.5#0` (terminating decimals end with `#0`)

Use the `LIMIT` command to control long decimal displays:

```
> LIMIT 5
Decimal display limit set to 5 digits
> 1/17
0.#0588... (1/17)
> 1/19
0.#0526... (1/19)
```

### Error Handling

The calculator provides user-friendly error messages:

- Division by zero: "Error: Division by zero is undefined"
- Undefined operations: "Error: 0^0 is undefined"
- Invalid factorials: "Error: Factorial is not defined for negative numbers"
- Invalid limits: "Error: LIMIT must be a positive integer"
- Parsing errors: Detailed syntax error messages

## Web Calculator

Ratmath also includes a modern web-based calculator available at [calc.ratmath.com](https://calc.ratmath.com) or locally in the `docs/` folder.

### Features

- **Browser-Based**: No installation required, works in any modern browser
- **Terminal-Style Interface**: Familiar prompt-based interaction with command history
- **All Calculator Features**: Complete parity with the terminal calculator
- **Interactive Help**: Built-in modal help system with full documentation
- **Session Management**: Copy entire calculation sessions to clipboard
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Keyboard Navigation**: Arrow keys for history, Enter to calculate, Escape to close modals

### Building the Web Calculator

The web calculator is built using Bun to bundle the JavaScript:

```bash
# Build the web calculator
bun run build-web

# Serve locally for testing
bun run serve
# Open http://localhost:3000 in your browser
```

### Web Calculator Commands

All terminal calculator commands work in the web version:

- `HELP` - Open help modal (or click Help button)
- `CLEAR` - Clear calculation history (or click Clear button)
- `DECI`, `RAT`, `BOTH` - Set output modes
- `LIMIT <n>` - Set decimal display limit

### Usage Example

```
> 1/2 + 1/3
5/6 (0.8#3)

> 2^10
1024

> 0.#142857 * 7
0.#9 (1)

> [1.4, 1.6] * [2.9, 3.1]
4.06:4.96

> LIMIT 10
Decimal display limit set to 10 digits

> 22/7
3.#142857 (22/7)
```

The web calculator provides the same exact arithmetic capabilities as the library and terminal calculator, with an intuitive interface that's perfect for interactive mathematical exploration.

### E Notation Methods

All number classes (`Rational`, `RationalInterval`, `Fraction`, `FractionInterval`, `Integer`) include an `E()` method for applying scientific notation scaling:

```javascript
import { Rational, RationalInterval, Fraction, Integer } from 'ratmath';

// Rational E notation
const r1 = new Rational(5).E(2);        // 500 (5 * 10^2)
const r2 = new Rational(123).E(-2);     // 1.23 (123 * 10^-2)
const r3 = new Rational(1, 3).E(3);     // 1000/3 (1/3 * 10^3)

// RationalInterval E notation
const i1 = new RationalInterval(1, 2).E(2);     // [100, 200]
const i2 = new RationalInterval(15, 25).E(-1);  // [1.5, 2.5]

// Fraction E notation (preserves unreduced form)
const f1 = new Fraction(5, 4).E(2);     // 500/4 (not reduced)
const f2 = new Fraction(3, 8).E(-1);    // 3/80

// Integer E notation (returns Integer or Rational)
const int1 = new Integer(5).E(2);       // 500 (Integer)
const int2 = new Integer(45).E(-1);     // 4.5 (Rational)

// Chain E method calls
const chained = new Rational(2).E(2).E(1);  // 2000

// Use with arithmetic
const sum = new Rational(3).E(2).add(new Rational(2).E(1));  // 320
```

The `E()` method is equivalent to the E notation in the parser (`5E2`), but provides a programmatic interface for applying scientific notation scaling to existing number objects.

## API Documentation

For full API documentation, please refer to the [API documentation](docs/API.md).

### Rational Class

The `Rational` class represents an exact rational number as a fraction with numerator and denominator in lowest terms.

#### Constructor

```javascript
new Rational(numerator, denominator = 1)
```

- `numerator`: Number, string, or BigInt representing the numerator, or a string like "3/4"
- `denominator`: (Optional) Number or BigInt representing the denominator

#### Methods

- **add(other)**: Returns the sum as a new Rational
- **subtract(other)**: Returns the difference as a new Rational
- **multiply(other)**: Returns the product as a new Rational
- **divide(other)**: Returns the quotient as a new Rational
- **negate()**: Returns the negation as a new Rational
- **reciprocal()**: Returns the reciprocal as a new Rational
- **pow(exponent)**: Raises this rational to an integer power
- **equals(other)**: Returns true if this rational equals another
- **compareTo(other)**: Returns -1, 0, or 1 for less than, equal, or greater than
- **lessThan(other)**, **lessThanOrEqual(other)**, **greaterThan(other)**, **greaterThanOrEqual(other)**
- **abs()**: Returns the absolute value as a new Rational
- **toString()**: Returns a string representation ("numerator/denominator")
- **toMixedString()**: Returns a mixed number representation ("whole..numerator/denominator")
- **toNumber()**: Returns a floating-point approximation
- **toRepeatingDecimal()**: Returns a repeating decimal string representation

#### Static Methods

- **from(value)**: Creates a Rational from a number, string, or another Rational

### Integer Class

The `Integer` class represents an exact integer using BigInt for arbitrary precision arithmetic. Division automatically returns an Integer for exact results or a Rational for non-exact results.

#### Constructor

```javascript
new Integer(value)
```

- `value`: Number, string, or BigInt representing the integer value

#### Methods

- **add(other)**: Returns the sum as a new Integer
- **subtract(other)**: Returns the difference as a new Integer
- **multiply(other)**: Returns the product as a new Integer
- **divide(other)**: Returns an Integer if exact division, otherwise a Rational
- **modulo(other)**: Returns the remainder as a new Integer
- **negate()**: Returns the negation as a new Integer
- **pow(exponent)**: Raises this integer to an integer power (returns Rational for negative exponents)
- **equals(other)**: Returns true if this integer equals another
- **compareTo(other)**: Returns -1, 0, or 1 for less than, equal, or greater than
- **lessThan(other)**, **lessThanOrEqual(other)**, **greaterThan(other)**, **greaterThanOrEqual(other)**
- **abs()**: Returns the absolute value as a new Integer
- **sign()**: Returns -1, 0, or 1 for negative, zero, or positive
- **isEven()**, **isOdd()**: Returns true if the integer is even/odd
- **isZero()**, **isPositive()**, **isNegative()**: Returns true if the integer matches the condition
- **gcd(other)**: Returns the greatest common divisor as a new Integer
- **lcm(other)**: Returns the least common multiple as a new Integer
- **factorial()**: Returns the factorial (n!) as a new Integer
- **doubleFactorial()**: Returns the double factorial (n!!) as a new Integer
- **toString()**: Returns a string representation
- **toNumber()**: Returns a floating-point approximation
- **toRational()**: Returns this integer as a Rational with denominator 1

#### Static Methods

- **from(value)**: Creates an Integer from a number, string, bigint, or another Integer
- **fromRational(rational)**: Creates an Integer from a Rational that represents a whole number

### parseRepeatingDecimal Function

The `parseRepeatingDecimal` function converts repeating decimal strings to exact rational representations.

```javascript
parseRepeatingDecimal(str)
```

- `str`: String representing a repeating decimal

#### Supported Formats

- **Repeating decimals**: `"0.12#45"` represents 0.12454545... = 137/1100
- **Terminating decimals**: `"1.23#0"` represents exactly 1.23 = 123/100
- **Pure repeating**: `"0.#3"` represents 0.333... = 1/3
- **Negative decimals**: `"-0.#6"` represents -0.666... = -2/3
- **Non-repeating**: `"1.23"` becomes interval [1.225, 1.235]
- **Uncertainty notation (range)**: `"1.23[56:67]"` represents interval [1.2356, 1.2367]
- **Uncertainty notation (relative)**: `"1.23[+5,-6]"` represents interval [1.224, 1.235]
- **Uncertainty notation (symmetric)**: `"1.3[+-1]"` represents interval [1.29, 1.31]
- **Repeating decimal intervals**: `"0.#3:0.5#0"` represents interval [1/3, 1/2]

#### Return Values

- Returns a `Rational` for repeating decimals with `#` notation
- Returns a `RationalInterval` for non-repeating decimals, uncertainty notation, or interval notation

#### Examples

```javascript
import { parseRepeatingDecimal } from 'ratmath';

// Exact conversions
parseRepeatingDecimal('0.#3');        // 1/3
parseRepeatingDecimal('0.12#45');     // 137/1100
parseRepeatingDecimal('733.#3');      // 2200/3
parseRepeatingDecimal('1.23#0');      // 123/100

// Uncertainty notation
parseRepeatingDecimal('1.23[56:67]'); // RationalInterval [1.2356, 1.2367]
parseRepeatingDecimal('78.3[+15,-0.6]'); // RationalInterval [78.294, 78.45]
parseRepeatingDecimal('1.3[+-1]'); // RationalInterval [1.29, 1.31]

// Interval notation
parseRepeatingDecimal('0.#3:0.5#0');  // RationalInterval [1/3, 1/2]

// Intervals for uncertain decimals
parseRepeatingDecimal('1.23');      // [49/40, 247/200]
parseRepeatingDecimal('-0.5');      // [-11/20, -9/20]
```

#### Converting Rationals to Repeating Decimals

```javascript
import { Rational } from 'ratmath';

// The toRepeatingDecimal() method converts any rational to its exact decimal representation
const oneThird = new Rational(1, 3);
console.log(oneThird.toRepeatingDecimal());     // "0.#3"

const twentyTwoSevenths = new Rational(22, 7);
console.log(twentyTwoSevenths.toRepeatingDecimal()); // "3.#142857"

const half = new Rational(1, 2);
console.log(half.toRepeatingDecimal());         // "0.5#0" (terminating)

const five = new Rational(5);
console.log(five.toRepeatingDecimal());         // "5" (integer)

// All conversions are exact and preserve mathematical precision
const complex = new Rational(123, 37);
const decimal = complex.toRepeatingDecimal();
const parsed = parseRepeatingDecimal(decimal);
console.log(complex.equals(parsed));            // true
```

## Examples

### Calculation with Exact Fractions

```javascript
import { Rational } from 'ratmath';

// Calculate 1/3 + 1/4 - 1/5 exactly
const a = new Rational(1, 3);
const b = new Rational(1, 4);
const c = new Rational(1, 5);

const result = a.add(b).subtract(c);
console.log(result.toString());  // "47/60"
```

### Repeating Decimal Examples

```javascript
import { parseRepeatingDecimal, Rational } from 'ratmath';

// Convert repeating decimals to exact fractions
const third = parseRepeatingDecimal('0.#3');           // 1/3
const sixth = parseRepeatingDecimal('0.1#6');          // 1/6
const mixed = parseRepeatingDecimal('1.23#45');        // 679/550

// Verify mathematical properties
console.log(third.multiply(new Rational(3)));          // 1 (exactly)
console.log(parseRepeatingDecimal('0.#9'));            // 1 (0.999... = 1)

// Handle non-repeating decimals as intervals
const uncertain = parseRepeatingDecimal('3.14');       // [3.135, 3.145]
console.log(uncertain.toString());                     // "627/200:629/200"

// Convert back to repeating decimal notation
const half = new Rational(1, 2);
console.log(half.toRepeatingDecimal());                // "0.5#0"

const piApprox = new Rational(22, 7);
console.log(piApprox.toRepeatingDecimal());            // "3.#142857"
```

### Roundtrip Conversion

The library supports perfect roundtrip conversion between rational numbers and repeating decimal strings:

```javascript
import { Rational, parseRepeatingDecimal } from 'ratmath';

// Original rational → repeating decimal → back to rational
const original = new Rational(1, 3);
const decimal = original.toRepeatingDecimal();         // "0.#3"
const roundtrip = parseRepeatingDecimal(decimal);      // 1/3

console.log(original.equals(roundtrip));               // true (exact match)

// Works with all types of numbers
const cases = [
  new Rational(1, 7),    // "0.#142857"
  new Rational(22, 7),   // "3.#142857"
  new Rational(3, 4),    // "0.75#0"
  new Rational(-1, 3)    // "-0.#3"
];

cases.forEach(rational => {
  const decimal = rational.toRepeatingDecimal();
  const parsed = parseRepeatingDecimal(decimal);
  console.log(`${rational} ↔ ${decimal} ↔ ${parsed} ✓`);
});
```

### Fraction Class

The `Fraction` class represents a fraction without automatic reduction, preserving the exact numerator and denominator.

#### Constructor

```javascript
new Fraction(numerator, denominator = 1)
```

- `numerator`: Number, string, or BigInt representing the numerator, or a string like "3/4"
- `denominator`: (Optional) Number or BigInt representing the denominator

#### Methods

- **add(other)**: Returns the sum as a new Fraction (only works for equal denominators)
- **subtract(other)**: Returns the difference as a new Fraction (only works for equal denominators)
- **multiply(other)**: Returns the product as a new Fraction
- **divide(other)**: Returns the quotient as a new Fraction
- **pow(exponent)**: Raises this fraction to an integer power
- **scale(factor)**: Returns a new fraction with both numerator and denominator multiplied by the factor
- **reduce()**: Returns a new fraction in lowest terms
- **equals(other)**: Returns true if this fraction has identical numerator and denominator to another
- **lessThan(other)**, **lessThanOrEqual(other)**, **greaterThan(other)**, **greaterThanOrEqual(other)**: Compare fractions
- **toRational()**: Converts to a Rational instance
- **toString()**: Returns a string representation ("numerator/denominator")

#### Static Methods

- **mediant(a, b)**: Calculates the mediant (a.num + b.num) / (a.den + b.den) of two fractions
- **fromRational(rational)**: Creates a Fraction from a Rational

### RationalInterval Class

The `RationalInterval` class represents a closed interval [a, b] of rational numbers.

#### Constructor

```javascript
new RationalInterval(a, b)
```

- `a`, `b`: Endpoints of the interval (Rational, string, number, or BigInt)

#### Methods

- **add(other)**: Returns the sum as a new RationalInterval
- **subtract(other)**: Returns the difference as a new RationalInterval
- **multiply(other)**: Returns the product as a new RationalInterval
- **divide(other)**: Returns the quotient as a new RationalInterval
- **pow(exponent)**: Raises this interval to an integer power
- **overlaps(other)**: Returns true if this interval overlaps with another
- **contains(other)**: Returns true if this interval contains another interval
- **containsValue(value)**: Returns true if this interval contains a value
- **equals(other)**: Returns true if this interval equals another
- **intersection(other)**: Returns the intersection as a new RationalInterval, or null if disjoint
- **union(other)**: Returns the union as a new RationalInterval, or null if disjoint and not adjacent
- **mediant()**: Returns the mediant of the interval endpoints (useful in continued fractions)
- **midpoint()**: Returns the arithmetic midpoint of the interval
- **shortestDecimal(base)**: Returns the rational with smallest power-of-base denominator in the interval
- **randomRational(maxDenominator)**: Returns a uniformly random rational from the interval
- **toString()**: Returns a string representation ("low:high")
- **toMixedString()**: Returns a mixed number representation ("whole1..num1/den1:whole2..num2/den2")
- **toRepeatingDecimal()**: Returns a repeating decimal interval string (e.g., "0.#3:0.5#0")
- **compactedDecimalInterval()**: Returns a compacted decimal interval notation (e.g., "1.23[56:67]")
- **relativeMidDecimalInterval()**: Returns a relative midpoint decimal interval notation using symmetric notation (e.g., "1.2295[+-0.0055]")
- **relativeDecimalInterval()**: Deprecated alias for relativeMidDecimalInterval()

#### Static Methods

- **point(value)**: Creates a point interval from a single value
- **fromString(str)**: Creates an interval from a string like "3/4:1/2"

### FractionInterval Class

The `FractionInterval` class represents a closed interval [a, b] of fractions, preserving the exact representation.

#### Constructor

```javascript
new FractionInterval(a, b)
```

- `a`, `b`: Endpoints of the interval (must be Fraction objects)

#### Methods

- **mediantSplit()**: Splits the interval into two parts using the mediant of the endpoints
- **partitionWithMediants(n)**: Recursively partitions the interval using mediants to depth n
- **partitionWith(fn)**: Partitions the interval using a custom function that generates partition points
- **toRationalInterval()**: Converts to a RationalInterval
- **equals(other)**: Returns true if this interval equals another
- **toString()**: Returns a string representation ("low:high")

#### Static Methods

- **fromRationalInterval(interval)**: Creates a FractionInterval from a RationalInterval

### Parser Class

The `Parser` class parses and evaluates string expressions involving rational intervals.

#### Static Methods

- **parse(expression, options = {})**: Parses a string expression and returns the result as a RationalInterval (or Integer/Rational with `typeAware: true`)
  - **expression** (string): The expression to parse
  - **options** (object): Optional parsing options
    - **typeAware** (boolean): When true, returns precise types (Integer, Rational, RationalInterval) instead of always returning RationalInterval

**Supported operations:**
- Addition (`+`), Subtraction (`-`), Multiplication (`*`), Division (`/`)
- Standard exponentiation (`^`), Multiplicative exponentiation (`**`)
- **Factorial (`!`)**: Computes factorial of positive integers (n!)
- **Double factorial (`!!`)**: Computes double factorial of positive integers (n!!)
- Parentheses for grouping, Negation (`-`), Interval notation (`a:b`)
- Repeating decimals (`0.#3`), Mixed numbers (`2..1/3`), Uncertainty notation (`1.23[+-0.05]`)

## Examples

### Calculation with Exact Fractions

```javascript
import { Rational } from 'ratmath';

// Calculate 1/3 + 1/4 - 1/5 exactly
const a = new Rational(1, 3);
const b = new Rational(1, 4);
const c = new Rational(1, 5);

const result = a.add(b).subtract(c);
console.log(result.toString());  // "47/60"
```

### Working with Fractions

```javascript
import { Fraction, Rational, FractionInterval } from 'ratmath';

// Demonstrating the difference between Fraction and Rational
const r1 = new Rational(2, 4);
const f1 = new Fraction(2, 4);

console.log(r1.toString());      // "1/2" (automatically reduced)
console.log(f1.toString());      // "2/4" (maintains original representation)

// Finding mediant fractions (useful in continued fraction approximations)
const f2 = new Fraction(1, 2);
const f3 = new Fraction(2, 3);
const mediant = Fraction.mediant(f2, f3);
console.log(mediant.toString()); // "3/5"

// Creating fractions with same denominator for addition
const denominatorBase = 12;
const a = new Fraction(5 * denominatorBase, denominatorBase);  // 5
const b = new Fraction(1, 3).scale(denominatorBase / 3);      // 4/12

const sum = a.add(b);
console.log(sum.toString());     // "64/12"
console.log(sum.reduce().toString()); // "16/3"

// Comparing fractions
console.log(f2.lessThan(f3));    // true
console.log(f3.greaterThan(f2)); // true

// Creating and partitioning a fraction interval
const interval = new FractionInterval(new Fraction(0, 1), new Fraction(1, 1));
const parts = interval.partitionWithMediants(2);

// Outputs the 4 intervals: [0/1:1/3], [1/3:1/2], [1/2:2/3], [2/3:1/1]
parts.forEach(part => console.log(part.toString()));
```

### Interval Calculation

```javascript
import { RationalInterval } from 'ratmath';

// Calculate the range of values for (x+y)^2 where x is in [1,2] and y is in [2,3]
const x = new RationalInterval(1, 2);
const y = new RationalInterval(2, 3);

const sum = x.add(y);            // [3, 5]
const squared = sum.pow(2);      // [9, 25]

console.log(squared.toString()); // "9:25"
```

### Expression Parsing

```javascript
import { Parser } from 'ratmath';

// Evaluate an expression with intervals
const result = Parser.parse('(1/2:3/4 + 1/4:1/2)^2 / 2:3');
console.log(result.toString());  // Will output the exact result as a rational interval
```

### Factorial Calculations

```javascript
import { Integer, Parser } from 'ratmath';

// Direct factorial calculations
const n = new Integer(10);
console.log(n.factorial().toString());        // "3628800" (10!)
console.log(n.doubleFactorial().toString());  // "3840" (10!! = 10×8×6×4×2)

// Mathematical properties
console.log(new Integer(5).factorial());      // 120 (5×4×3×2×1)
console.log(new Integer(5).doubleFactorial()); // 15 (5×3×1)
console.log(new Integer(6).doubleFactorial()); // 48 (6×4×2)
console.log(new Integer(0).factorial());      // 1 (0! = 1 by definition)

// Parser with factorial operators (type-aware parsing)
console.log(Parser.parse('5!', { typeAware: true }));         // Integer(120)
console.log(Parser.parse('6!!', { typeAware: true }));        // Integer(48)
console.log(Parser.parse('3! + 4!', { typeAware: true }));    // Integer(30)
console.log(Parser.parse('(2+3)!', { typeAware: true }));     // Integer(120)

// Operator precedence: factorial has higher precedence than exponentiation
console.log(Parser.parse('2!^3', { typeAware: true }));       // Integer(8) = (2!)^3 = 2^3

// Backward compatible parsing (returns intervals)
console.log(Parser.parse('7!!'));             // RationalInterval[105, 105]

// Factorial in mathematical expressions
const combinatorial = (n, k) => {
  const nFact = new Integer(n).factorial();
  const kFact = new Integer(k).factorial();
  const nMinusKFact = new Integer(n - k).factorial();
  return nFact.divide(kFact.multiply(nMinusKFact));
};

console.log(combinatorial(10, 3).toString()); // "120" (C(10,3) = 10!/(3!×7!))
```

## Implementation Notes

### Repeating Decimal Algorithm

The conversion from repeating decimals to fractions uses the standard mathematical approach:

For a repeating decimal like `a.b#c` where:
- `a` is the integer part
- `b` is the non-repeating fractional part (length n)
- `c` is the repeating part (length m)

The conversion formula is:
```
result = (abc - ab) / (10^(n+m) - 10^n)
```

Where `abc` is the concatenation of a, b, and c, and `ab` is the concatenation of a and b.

### Interval Representation for Non-repeating Decimals

When a decimal like "1.23" is provided without the `#` symbol, it's treated as having uncertainty in the last digit. The function creates an interval representing all possible values:

- "1.23" becomes [1.225, 1.235]
- "0.5" becomes [0.45, 0.55]
- "-1.5" becomes [-1.55, -1.45]

This approach acknowledges that finite decimal representations often have implicit uncertainty.

## Error Handling

The library throws clear error messages for various error conditions:

- Division by zero: `"Division by zero"`
- Denominator is zero: `"Denominator cannot be zero"`
- Division by interval containing zero: `"Cannot divide by an interval containing zero"`
- Raising zero to power zero: `"Zero cannot be raised to the power of zero"`
- Negative exponents with zero base: `"Zero cannot be raised to a negative power"`
- Factorial of negative numbers: `"Factorial is not defined for negative integers"`
- Double factorial of negative numbers: `"Double factorial is not defined for negative integers"`
- Factorial of non-integers: Parser will throw appropriate errors when factorial operators are applied to non-integer values
- Invalid repeating decimal format: `"Invalid repeating decimal format. Use format like '0.12#45'"`
- Non-numeric characters in repeating part: `"Repeating part must contain only digits"`

## License

MIT

## Acknowledgements

OpenAI ChatGPT helped prepare the prompts and the ZED editor with agent coding of Claude did the implementation of the code.

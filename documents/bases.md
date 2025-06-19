# Base Systems Documentation

## Overview

The RatMath library supports arbitrary number bases through the `BaseSystem` class, enabling exact rational arithmetic and conversions across different numeral systems while maintaining mathematical precision.

## BaseSystem Class

The `BaseSystem` class manages character sets and base operations for different numeral systems using character sequence notation.

### Constructor

```javascript
new BaseSystem(characterSequence, name)
```

- `characterSequence` (string): Character sequence with range notation
- `name` (string, optional): Human-readable name for the base system

#### Character Sequence Notation

The character sequence supports range notation for convenient base definition:

- `"0-1"` → Binary (characters: 0, 1)
- `"0-9"` → Decimal (characters: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
- `"0-9a-f"` → Hexadecimal (characters: 0-9, a-f)
- `"0-9a-zA-Z"` → Base 62 (characters: 0-9, a-z, A-Z)
- `"01234567"` → Explicit character list for octal

### Standard Base Presets

The following predefined base systems are available as static properties:

```javascript
BaseSystem.BINARY      // Base 2: "0-1"
BaseSystem.OCTAL       // Base 8: "0-7"
BaseSystem.DECIMAL     // Base 10: "0-9"
BaseSystem.HEXADECIMAL // Base 16: "0-9a-f"
BaseSystem.BASE36      // Base 36: "0-9a-z"
BaseSystem.BASE62      // Base 62: "0-9a-zA-Z"

// Extended base presets
BaseSystem.BASE60      // Base 60: "0-9a-zA-X" (Sexagesimal)
BaseSystem.ROMAN       // Base 7: "IVXLCDM" (Roman Numerals)
```

### Properties

- `base` (number): The numeric base value (2, 16, etc.)
- `characters` (string[]): Array of valid characters in order
- `charMap` (Map): Character to numeric value mapping
- `name` (string): Human-readable name of the base system

### Methods

#### `toDecimal(str)`

Converts a string representation in this base to a decimal BigInt.

```javascript
const hex = BaseSystem.HEXADECIMAL;
hex.toDecimal("FF"); // Returns 255n
hex.toDecimal("A0"); // Returns 160n
```

#### `fromDecimal(value)`

Converts a decimal BigInt to string representation in this base.

```javascript
const binary = BaseSystem.BINARY;
binary.fromDecimal(255n); // Returns "11111111"
binary.fromDecimal(42n);  // Returns "101010"
```

#### `isValidString(str)`

Validates that a string contains only valid characters for this base.

```javascript
const octal = BaseSystem.OCTAL;
octal.isValidString("777"); // Returns true
octal.isValidString("888"); // Returns false (8 is not valid in octal)
```

#### `equals(other)`

Checks if this base system is equal to another BaseSystem.

```javascript
const base1 = new BaseSystem("0-9");
const base2 = BaseSystem.DECIMAL;
base1.equals(base2); // Returns true
```

### Static Methods

#### `BaseSystem.fromBase(base, name)`

Creates a BaseSystem from a numeric base using default character sets (supports bases 2-62).

```javascript
const base8 = BaseSystem.fromBase(8);        // Equivalent to BaseSystem.OCTAL
const base16 = BaseSystem.fromBase(16);      // Equivalent to BaseSystem.HEXADECIMAL
const base32 = BaseSystem.fromBase(32);      // Creates base 32 using 0-9a-v
```

#### `BaseSystem.createPattern(pattern, size, name)`

Creates a BaseSystem using common patterns:

```javascript
const digitsOnly = BaseSystem.createPattern("digits-only", 8);
const lettersOnly = BaseSystem.createPattern("letters-only", 16);  
const uppercaseOnly = BaseSystem.createPattern("uppercase-only", 10);
const alphanumeric = BaseSystem.createPattern("alphanumeric", 36);
```

Supported patterns:
- `"alphanumeric"`: 0-9, a-z, A-Z (up to base 62)
- `"digits-only"`: 0-9 only (up to base 10)
- `"letters-only"`: a-z, A-Z (up to base 52)
- `"uppercase-only"`: A-Z only (up to base 26)

#### `withCaseSensitivity(caseSensitive)`

Creates a version of the base system with specified case sensitivity:

```javascript
const mixedCase = new BaseSystem("aAbBcC");
const caseInsensitive = mixedCase.withCaseSensitivity(false);
// Results in base 3 with characters: a, b, c
```

## Usage Examples

### Creating Custom Base Systems

```javascript
// Create a custom base system
const base5 = new BaseSystem("01234", "Base 5");

// Convert numbers
const decimal = base5.toDecimal("1234"); // 194n in decimal
const base5Repr = base5.fromDecimal(100n); // "400" in base 5
```

### Working with Standard and Extended Bases

```javascript
// Binary operations
const binary = BaseSystem.BINARY;
console.log(binary.fromDecimal(42n)); // "101010"
console.log(binary.toDecimal("101010")); // 42n

// Hexadecimal operations
const hex = BaseSystem.HEXADECIMAL;
console.log(hex.fromDecimal(255n)); // "ff"
console.log(hex.toDecimal("ff")); // 255n

// Extended bases
const base60 = BaseSystem.BASE60;
console.log(base60.fromDecimal(3600n)); // "100" (1 hour in base 60)

const roman = BaseSystem.ROMAN;
console.log(roman.fromDecimal(5n)); // "V"
console.log(roman.fromDecimal(10n)); // "X"
```

### Base Conversion

```javascript
// Convert between different bases
const sourceBase = BaseSystem.HEXADECIMAL;
const targetBase = BaseSystem.BINARY;

const hexValue = "A0";
const decimal = sourceBase.toDecimal(hexValue); // 160n
const binary = targetBase.fromDecimal(decimal); // "10100000"

console.log(`${hexValue}[16] = ${binary}[2]`);
```

## Validation and Error Handling

### Character Conflicts

The BaseSystem automatically checks for conflicts with parser symbols and throws descriptive errors:

```javascript
// These will throw errors due to conflicts with parser symbols
try {
  new BaseSystem("0-9+"); // Error: conflicts with '+' operator
} catch (error) {
  console.log(error.message);
}
```

Reserved symbols include: `+`, `-`, `*`, `/`, `^`, `!`, `(`, `)`, `[`, `]`, `:`, `.`, `#`, `~`

Note: `E` and `e` are allowed in base systems to support hexadecimal notation and scientific contexts.

### Input Validation

```javascript
const hex = BaseSystem.HEXADECIMAL;

// Valid inputs
hex.isValidString("ABC"); // true
hex.isValidString("123"); // true

// Invalid inputs
hex.isValidString("XYZ"); // false (X, Y, Z not in hex)
hex.isValidString("");    // false (empty string)
```

## Advanced Features

### Pattern-Based Base Creation
## Calculator Commands

### Enhanced BASE Command

The calculator now supports advanced BASE command syntax for separate input and output bases:

#### Basic Usage
```
BASE                    # Show current base configuration
BASE <n>               # Set both input and output to base n
BASE <sequence>        # Set both input and output to custom base
BIN, HEX, OCT, DEC     # Quick shortcuts for common bases
```

#### **NEW**: Input-Output Base Separation
```
BASE <input>-><output>              # Set input and output bases separately
BASE 3->10                          # Input in base 3, output in base 10
BASE 16->2                          # Input in hex, output in binary
BASE 2->[10,16,8]                   # Input in binary, output in multiple bases
BASE 0-9a-f->0-1                    # Custom input base to binary output
```

#### Examples in Calculator
```
> BASE 2->10
Input base: Base 2 (base 2)
Output base: Base 10 (base 10)

> 101
5

> BASE 16->[10,2,8]
Input base: Base 16 (base 16) 
Output bases: Base 10 (base 10), Base 2 (base 2), Base 8 (base 8)

> FF
255 (11111111[2], 377[8])
```

Use `createPattern()` for common base system patterns:

```javascript
// Create a base system using only letters
const letterBase = BaseSystem.createPattern("letters-only", 20);

// Create a numeric-only base
const numericBase = BaseSystem.createPattern("digits-only", 8);
```

### Case Sensitivity Control

Control case sensitivity in base systems:

```javascript
const original = new BaseSystem("aAbBcC", "Mixed Case");
const lowercase = original.withCaseSensitivity(false);
// Converts to lowercase: "abc"
```

### Enhanced Validation

The BaseSystem includes comprehensive validation:

- Character uniqueness verification
- Base size validation against character set length
- Character ordering consistency checks
- Non-contiguous range warnings
- Case sensitivity conflict detection

## Performance Considerations

- Base conversions use efficient BigInt operations for arbitrary precision
- Very large bases (>1000 characters) will show performance warnings
- Common conversions between powers of 2 are optimized
- Character validation is performed during BaseSystem creation
- Pattern-based creation is optimized for common use cases

## Integration with RatMath

The BaseSystem class integrates with the existing RatMath ecosystem:

- Works with Integer, Rational, and other numeric types
- Maintains exact arithmetic precision
- Supports the library's design principles of mathematical accuracy
- Compatible with parser extensions for base notation

## Parser Integration

The RatMath parser now supports both explicit base notation and base-aware input parsing, allowing you to work with numbers in different bases naturally.

### Base Notation Syntax

Use square brackets to specify the base after a number:

```javascript
Parser.parse("101[2]")     // Binary 101 = 5 in decimal
Parser.parse("FF[16]")     // Hexadecimal FF = 255 in decimal  
Parser.parse("777[8]")     // Octal 777 = 511 in decimal
Parser.parse("132[5]")     // Base 5: 132 = 42 in decimal
```

### Base-Aware Input Parsing

The parser supports an `inputBase` option that interprets all input in a specified base system:

```javascript
// Parse numbers in binary without explicit notation
Parser.parse("101", { inputBase: BaseSystem.BINARY })      // 5 in decimal
Parser.parse("101 + 11", { inputBase: BaseSystem.BINARY }) // 8 in decimal

// Parse mixed numbers in base 3
Parser.parse("12..101/211", { inputBase: BaseSystem.fromBase(3) }) // 60/11

// Parse decimals in binary
Parser.parse("10.1", { inputBase: BaseSystem.BINARY })     // 2.5 in decimal
```

### Supported Formats

#### Basic Numbers
```javascript
Parser.parse("101[2]")     // Binary integer
Parser.parse("-FF[16]")    // Negative hexadecimal
Parser.parse("123[10]")    // Explicit decimal notation
```

#### Decimal Numbers
```javascript
Parser.parse("10.1[2]")    // Binary decimal = 2.5
Parser.parse("A.8[16]")    // Hexadecimal decimal = 10.5
Parser.parse("7.4[8]")     // Octal decimal = 7.5
```

#### Fractions
```javascript
Parser.parse("1/10[2]")    // Binary fraction = 1/2
Parser.parse("F/10[16]")   // Hexadecimal fraction = 15/16
Parser.parse("A/C[16]")    // Hexadecimal fraction = 5/6
```

#### Mixed Numbers
```javascript
Parser.parse("1..1/10[2]")    // Binary mixed number = 1.5
Parser.parse("A..8/10[16]")   // Hexadecimal mixed number = 10.5
```

#### Intervals
```javascript
Parser.parse("101:111[2]")    // Binary interval = 5:7
Parser.parse("A:F[16]")       // Hexadecimal interval = 10:15
Parser.parse("A.8:F.F[16]")   // Decimal interval = 10.5:15.9375
```

### Arithmetic with Base Notation

Base notation integrates seamlessly with arithmetic expressions:

```javascript
Parser.parse("101[2] + 11[2]")        // 5 + 3 = 8
Parser.parse("FF[16] - A[16]")        // 255 - 10 = 245
Parser.parse("777[8] * 2")            // 511 * 2 = 1022
Parser.parse("100[2] / 10[2]")        // 4 / 2 = 2

// Mixed bases in expressions
Parser.parse("FF[16] + 101[2]")       // 255 + 5 = 260
Parser.parse("777[8] - 11111111[2]")  // 511 - 255 = 256

// Complex expressions with parentheses
Parser.parse("(101[2] + 11[2]) * 10[2]")  // (5+3)*2 = 16
```

### Base-Aware E Notation

When using `inputBase`, E notation uses the specified base for exponentiation:

```javascript
const base3 = BaseSystem.fromBase(3);

// E notation in base 3: 12E2 = 12₃ × 3² = 5 × 9 = 45
Parser.parse("12E2", { inputBase: base3 })

// Exponent is also parsed in base 3: 12E11 = 12₃ × 3^(11₃) = 5 × 3⁴ = 405
Parser.parse("12E11", { inputBase: base3 })

// For bases containing 'E', use _^ notation instead
const baseWithE = new BaseSystem("0-9A-E");
Parser.parse("AE_^2", { inputBase: baseWithE })  // AE₁₅ × 15²
```

### Base Validation

The parser automatically validates that digits are appropriate for the specified base:

```javascript
// These will throw errors:
Parser.parse("123[2]")   // Error: '2' and '3' invalid in binary
Parser.parse("XYZ[16]")  // Error: 'X', 'Y', 'Z' not valid in hex
Parser.parse("888[8]")   // Error: '8' invalid in octal

// Input base validation with fallback
Parser.parse("9", { inputBase: BaseSystem.BINARY })  // Falls back to decimal: 9
```

### Case Sensitivity

Base notation is case-insensitive for standard bases. Both uppercase and lowercase letters are accepted and normalized:

```javascript
Parser.parse("FF[16]")   // Same as "ff[16]"
Parser.parse("aB[16]")   // Same as "ab[16]"
```

### Type Promotion

Base notation respects the parser's type-aware mode:

```javascript
// Type-aware mode (default)
Parser.parse("101[2]")         // Returns Integer(5)
Parser.parse("1/10[2]")        // Returns Rational(1/2)
Parser.parse("101:111[2]")     // Returns RationalInterval(5:7)

// Backward-compatible mode
Parser.parse("101[2]", { typeAware: false })  // Returns RationalInterval point
```

## Future Enhancements

Completed features:
- Extended base presets (Base 60, Roman numerals)
- Pattern-based base system creation
- Enhanced validation and case sensitivity control
- Comprehensive character sequence parsing
- Parser integration for base notation syntax
- **NEW**: Input-output base separation (BASE 3->10, BASE 2->[10,16,2])
- **NEW**: Automatic input base conversion for bare numbers
- **NEW**: Multiple simultaneous output base display
- **NEW**: Variable and function support with input base conversion
- **NEW**: Base-aware input parsing with `inputBase` option
- **NEW**: Base-aware E notation (uses input base for exponentiation)
- **NEW**: Alternative _^ notation for bases containing 'E'
- **NEW**: Graceful fallback to decimal when base parsing fails

Planned features include:
- Enhanced fraction base conversion (automatic conversion of fraction components)
- Repeating decimal detection in arbitrary bases
- Web calculator integration with input-output base controls
- Extended Unicode support for international numeral systems
- Base-specific decimal point handling

## Mathematical Background

Different bases can reveal different properties of the same number:

- 1/3 in decimal: 0.333... (repeating)
- 1/3 in base 3: 0.1 (terminating)
- 1/10 in decimal: 0.1 (terminating)
- 1/10 in binary: 0.000110011... (repeating)

The BaseSystem class preserves these mathematical relationships while providing exact conversions between different representations.

## Input-Output Base Separation

The calculator now supports independent input and output bases, allowing you to:

### Enter numbers in one base, see results in another
```
BASE 2->16          # Enter binary, see hexadecimal
101                 # Shows: 5 (5[16])
```

### Use multiple output bases simultaneously
```
BASE 2->[10,16,8]   # Enter binary, see decimal, hex, and octal
1111                # Shows: 15 (f[16], 17[8])
```

### Combine with arithmetic operations
```
BASE 2->10          # Binary input, decimal output
101 + 11            # 5 + 3 = 8
```

### Work with variables and functions
```
BASE 8->10          # Octal input, decimal output  
x = 777             # x = 511 (decimal)
F[n] = n * 10       # Function using octal 10 (= 8 decimal)
F(x)                # 511 * 8 = 4088
```

This feature maintains exact arithmetic precision while providing flexible base interpretation for enhanced usability in educational, programming, and mathematical contexts.

## Base-Aware Input Parsing

The parser supports comprehensive base-aware input parsing through the `inputBase` option, allowing natural mathematical expressions in any base system.

### Usage Examples

```javascript
const base3 = BaseSystem.fromBase(3);
const options = { inputBase: base3, typeAware: true };

// All numbers parsed in base 3
Parser.parse("12", options)           // 5 (12₃ = 5₁₀)
Parser.parse("12 + 21", options)     // 12 (5 + 7 = 12)
Parser.parse("12..101/211", options) // 60/11 (mixed number in base 3)
Parser.parse("12E2", options)        // 45 (12₃ × 3² = 5 × 9 = 45)
```

### E Notation in Different Bases

E notation adapts to the input base system:

```javascript
// Binary E notation
Parser.parse("101E10", { inputBase: BaseSystem.BINARY })  // 20 (5 × 2² = 20)

// Base 3 E notation  
Parser.parse("12E11", { inputBase: BaseSystem.fromBase(3) })  // 405 (5 × 3⁴ = 405)

// Hexadecimal with _^ notation (when E is a valid digit)
const base15 = new BaseSystem("0-9A-E");
Parser.parse("AE_^2", { inputBase: base15 })  // 36900 (164 × 15² = 36900)
```

### Explicit Base Override

Explicit base notation always overrides the input base:

```javascript
// Even with binary input base, explicit notation takes precedence
Parser.parse("12[3] + 101", { inputBase: BaseSystem.BINARY })  // 10 (5 + 5 = 10)
```

### Error Handling and Fallback

The parser gracefully handles invalid input by falling back to decimal:

```javascript
// '9' is invalid in binary, so falls back to decimal parsing
Parser.parse("9", { inputBase: BaseSystem.BINARY })  // 9
```

## Enhanced Base-Aware Input Parsing

### Complete Input Base Support

The parser now provides comprehensive support for parsing all mathematical expressions in the specified input base, including numbers, fractions, mixed numbers, decimals, intervals, and E notation.

#### Automatic Base Conversion

When an `inputBase` is specified, all numbers in the expression are automatically parsed according to that base:

```javascript
const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

// All numbers parsed as base 3
Parser.parse("12", options)           // 5 (12₃ = 5₁₀)
Parser.parse("12/21", options)        // 5/7 (12₃/21₃ = 5₁₀/7₁₀)
Parser.parse("12..101/211", options)  // 60/11 (mixed number: 5 + 10/22 = 60/11)
Parser.parse("12.1", options)         // 16/3 (12.1₃ = 5⅓ = 16/3)
Parser.parse("12:21", options)        // [5, 7] (interval from 5 to 7)
```

#### Base-Aware E Notation

E notation works with the input base for both the mantissa and exponent:

```javascript
const base3Options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

// Standard E notation for non-E containing bases
Parser.parse("12E2", base3Options)    // 45 (5 × 3² = 45)
Parser.parse("2E12", base3Options)    // 486 (2 × 3⁵ = 486, where 12₃ = 5₁₀)

// _^ notation for bases containing 'E' as a digit
const hexBase = new BaseSystem("0-9A-F");
const hexOptions = { inputBase: hexBase, typeAware: true };
Parser.parse("AE_^2", hexOptions)     // 44544 (174 × 16² = 44544)
```

#### Case Normalization

The parser intelligently handles case normalization for bases with letters:

```javascript
const hexOptions = { inputBase: BaseSystem.HEXADECIMAL, typeAware: true };

// Both work due to automatic case normalization
Parser.parse("FF", hexOptions)        // 255 (normalized to "ff")
Parser.parse("ff", hexOptions)        // 255
Parser.parse("A/F", hexOptions)       // 2/3 (normalized to "a/f")
```

#### Mixed Base Expressions

Explicit base notation overrides the input base for specific numbers:

```javascript
const base3Options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

// Mix input base with explicit base notation
Parser.parse("12 + 5[10]", base3Options)  // 17 (12₁₀ + 5₁₀ = 17)
// Note: In expression context, arithmetic operators cause fallback to decimal
```

#### Arithmetic Expressions

Complex arithmetic expressions work naturally with input base parsing:

```javascript
const base3Options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

Parser.parse("12 + 21", base3Options)           // 12 (5 + 7 = 12)
Parser.parse("12 * 21", base3Options)           // 35 (5 × 7 = 35)
Parser.parse("(12 + 1) * 2 / 10", base3Options) // 4 ((5+1)×2÷3 = 12÷3 = 4)
```

### Error Handling

The parser provides robust error handling for invalid base digits:

```javascript
const base3Options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

// Invalid digits throw descriptive errors
Parser.parse("13", base3Options)      // Error: Invalid digit '3' for base 3
Parser.parse("2E3", base3Options)     // Error: Invalid exponent '3' for base 3
```

### Implementation Details

The base-aware parsing system:

1. **Validates input**: Checks that all digits are valid for the specified base
2. **Handles case normalization**: Automatically converts case for letter-based digits
3. **Preserves precedence**: Explicit base notation `[n]` always overrides input base
4. **Maintains precision**: All conversions use exact BigInt arithmetic
5. **Supports all formats**: Works with integers, fractions, mixed numbers, decimals, intervals, and E notation
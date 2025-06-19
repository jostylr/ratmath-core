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

## Future Enhancements

Completed features:
- Extended base presets (Base 60, Roman numerals)
- Pattern-based base system creation
- Enhanced validation and case sensitivity control
- Comprehensive character sequence parsing

Planned features include:
- Parser integration for base notation syntax (e.g., `101[2]`, `FF[16]`)
- Base-aware arithmetic operations
- Repeating decimal detection in arbitrary bases
- Integration with calculator interfaces
- Extended Unicode support for international numeral systems

## Mathematical Background

Different bases can reveal different properties of the same number:

- 1/3 in decimal: 0.333... (repeating)
- 1/3 in base 3: 0.1 (terminating)
- 1/10 in decimal: 0.1 (terminating)
- 1/10 in binary: 0.000110011... (repeating)

The BaseSystem class preserves these mathematical relationships while providing exact conversions between different representations.
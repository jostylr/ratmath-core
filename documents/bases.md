# Base Systems Documentation

## Overview

The RatMath library supports arbitrary number bases through the `BaseSystem` class, enabling exact rational arithmetic and conversions across different numeral systems while maintaining mathematical precision.

## Base Notation

RatMath supports standard and custom base notations for inputting numbers.

### Prefix Notation (Standard)

Standard prefixes can be used to explicitly define the base of a number, overriding the current input base:

- `0x` or `0X` → Hexadecimal (Base 16)
  - Example: `0xFF`, `0x1A`, `0x0.8`
- `0b` or `0B` → Binary (Base 2)
  - Example: `0b101`, `0b1.1`
- `0o` or `0O` → Octal (Base 8)
  - Example: `0o77`, `0o123`

### Custom Prefix Notation

You can register custom prefixes for other bases using `BaseSystem.registerPrefix(char, system)`. Once registered, you can use the notation `0[char]` to specify that base.

Example (if `t` is registered for Base 3):
- `0t12` → Base 3 (1*3 + 2 = 5)

### Deprecated Notation

The bracket notation `Value[Base]` (e.g., `101[2]`) is **deprecated** and no longer supported. Please use the prefix notation or the `BASE` command in the calculator.

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

### Static Methods

#### `BaseSystem.getSystemForPrefix(prefix)`

Returns the `BaseSystem` associated with a single-character prefix, or `undefined` if none is registered.

#### `BaseSystem.registerPrefix(prefix, baseSystem)`

Registers a custom prefix character for a specific base system.
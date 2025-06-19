# Different Bases Implementation TODO

## Overview
Add support for arbitrary number bases in RatMath using character sequence notation (e.g., "0-1" for binary, "0-9a-f" for hexadecimal). This will enable exact rational arithmetic and conversions across different numeral systems while maintaining mathematical precision.

## Core Implementation

### 1. Base System Design

#### BaseSystem Class
- [x] Create `BaseSystem` class to manage character sets and base operations
- [x] Constructor accepting character sequence with range notation
  - `new BaseSystem("0-1")` for binary
  - `new BaseSystem("0-9a-f")` for hexadecimal
  - `new BaseSystem("0-9a-zA-Z")` for base 62
  - `new BaseSystem("01234567")` for explicit character list
- [x] Properties:
  - [x] `base` - numeric base value (2, 16, etc.)
  - [x] `characters` - array of valid characters in order
  - [x] `charMap` - character to value mapping
  - [x] `name` - human-readable name (optional)

#### Character Sequence Parsing
- [x] Parse range notation (e.g., "0-9", "a-z", "A-Z")
- [x] Support Unicode ranges for international character sets
- [x] Handle mixed ranges: "0-9a-fA-F" → "0123456789abcdefABCDEF"
- [x] Validate character sequences:
  - No duplicate characters
  - Consistent ordering within ranges
  - No conflicts with parser symbols (throw descriptive errors)
- [x] Support for non-contiguous character sets

#### Conflict Detection
- [x] Check against existing parser symbols: `+`, `-`, `*`, `/`, `^`, `!`, `(`, `)`, `[`, `]`, `:`, `.`, `#`, `~`
- [x] Validate that base characters don't include parser operators
- [x] Provide clear error messages for conflicts
- [ ] Allow override for advanced users (with warnings)

### 2. Common Base Presets

#### Standard Bases
- [x] Binary (base 2): `BaseSystem.BINARY` → "0-1"
- [x] Octal (base 8): `BaseSystem.OCTAL` → "0-7"
- [x] Decimal (base 10): `BaseSystem.DECIMAL` → "0-9" (default)
- [x] Hexadecimal (base 16): `BaseSystem.HEXADECIMAL` → "0-9a-f"
- [x] Base 36: `BaseSystem.BASE36` → "0-9a-z"
- [x] Base 62: `BaseSystem.BASE62` → "0-9a-zA-Z"

#### Extended Bases
- [x] Base 60 (sexagesimal): `BaseSystem.BASE60` → "0-9a-zA-X"
- [x] Roman numerals support: `BaseSystem.ROMAN` → "IVXLCDM" (special handling)
- [x] Custom factory methods for common patterns

#### Base Validation
- [x] Ensure base ≥ 2 and ≤ character set length
- [x] Validate character uniqueness and ordering
- [x] Handle case sensitivity options (default: case-sensitive)

### 3. Parser Integration

#### Base Notation Syntax
- [x] Bracket notation: `101[2]` for binary, `FF[16]` for hexadecimal
- [x] Support for fractions: `10.1[2]` for binary 2.5, `A.8[16]` for hex 10.5
- [x] Mixed number support: `1..1.1[2]` for binary mixed numbers
- [x] Interval notation: `A[16]:F[16]` for hexadecimal intervals

#### Parser Extensions
- [x] Extend tokenizer to recognize base notation
- [x] Add base parsing to number recognition
- [x] Handle base-specific decimal points and separators
- [x] Validate digits against specified base character set
- [x] Error handling for invalid digits in base context
- [ ] In calc.js, [n] = range defines a base to be used. So [3] = 012 would be the standard trinary. But it could overwrite the default and do [3] = d-f to mean d e and f.  The number of characters should equal n.
- [ ] For [n] where n is between 2 and 62, unless defined elsewhere, it would take the first n characters of 0-9a-zA-Z

#### Base Conversion in Expressions
- [x] Allow mixed bases in single expressions: `FF[16] + 101[2]`
- [x] Automatic conversion to common base for arithmetic
- [x] Preserve base information through calculations when possible
- [ ] Support base conversion functions: `toBase(number, targetBase)`

### 4. Number Class Extensions

#### Integer Class Extensions
- [ ] `toString(base)` method accepting BaseSystem or base number
- [ ] `toBase(baseSystem)` method returning string representation
- [ ] Static `fromBase(string, baseSystem)` constructor
- [ ] Support for parsing large integers in different bases
- [ ] Efficient base conversion algorithms using BigInt

#### Rational Class Extensions
- [ ] `toString(base)` method for rational representation in different bases
- [ ] Handle decimal expansion in different bases
- [ ] Repeating decimal detection in arbitrary bases (e.g., 1/3 in base 3 = 0.1)
- [ ] `toRepeatingBase(base)` method for exact fractional representation
- [ ] Support for mixed numbers in different bases

#### Base-Specific Arithmetic
- [ ] Preserve base context in arithmetic operations when meaningful
- [ ] `add`, `subtract`, `multiply`, `divide` with base-aware output
- [ ] Power operations with base-specific results
- [ ] Modular arithmetic utilities for base conversions

### 5. Conversion Utilities

#### Base Conversion Methods
- [ ] `convertBase(number, fromBase, toBase)` static utility
- [ ] Efficient algorithms for common conversions (binary ↔ hex ↔ decimal)
- [ ] Batch conversion for multiple numbers
- [ ] Support for fractional conversions with precision control

#### Fraction Base Conversion
- [ ] Algorithm for converting rational numbers between bases
- [ ] Handle terminating vs. repeating expansions in different bases
- [ ] Detect when fractions become terminating in target bases
- [ ] Example: 1/5 terminates in base 10 but repeats in base 3

#### Educational Conversion Tools
- [ ] Step-by-step conversion display for learning
- [ ] Show intermediate steps in base conversion algorithms
- [ ] Comparison tables showing same number in multiple bases
- [ ] Highlight patterns and relationships between bases

### 6. Repeating Patterns in Different Bases

#### Pattern Detection
- [ ] Extend repeating decimal algorithm to arbitrary bases
- [ ] Detect cycles in fractional expansions: `1/3[2] = 0.#01[2]`
- [ ] Handle different cycle lengths in different bases
- [ ] Optimize pattern detection for large cycles

#### Base-Specific Notation
- [ ] Extend `#` notation to different bases: `0.#3[8]` for octal
- [ ] Support base-specific repeating pattern syntax
- [ ] Conversion between repeating patterns in different bases
- [ ] Validate repeating patterns against base character sets

### 7. Advanced Features

#### Unicode and International Support
- [ ] Support for non-Latin character bases (Arabic, Chinese numerals, etc.)
- [ ] Unicode range parsing for international character sets
- [ ] Localization support for base names and representations
- [ ] Right-to-left text support for applicable numeral systems

#### Custom Base Operations
- [ ] User-defined base systems with custom characters
- [ ] Base system serialization/deserialization (JSON support)
- [ ] Base system validation and normalization
- [ ] Performance optimization for frequently used custom bases

#### Mathematical Properties
- [ ] Base-specific mathematical properties (e.g., divisibility rules)
- [ ] Prime factorization in different bases
- [ ] GCD/LCM calculations with base-aware display
- [ ] Number theory utilities adapted for different bases

### 8. Testing and Validation

#### Core Functionality Tests
- [ ] Test character sequence parsing and range expansion
- [ ] Validate base conversion accuracy across all supported bases
- [ ] Test round-trip conversions: base A → decimal → base A
- [ ] Edge cases: base 2, very large bases, single-character bases

#### Integration Tests
- [ ] Parser integration with base notation syntax
- [ ] Arithmetic operations across mixed bases
- [ ] Complex expressions with multiple base representations
- [ ] Error handling for invalid base specifications

#### Mathematical Accuracy Tests
- [ ] Verify exact arithmetic preservation in base conversions
- [ ] Test repeating decimal detection in various bases
- [ ] Validate fractional representations across bases
- [ ] Performance testing with large numbers and high bases

#### Conflict Detection Tests
- [ ] Test all parser symbol conflicts
- [ ] Validate error messages for character conflicts
- [ ] Test edge cases in character sequence validation
- [ ] Unicode character conflict detection

### 9. Documentation and Examples

#### API Documentation
- [ ] Complete BaseSystem class documentation
- [ ] Document all new methods on Integer, Rational classes
- [ ] Parser syntax reference for base notation
- [ ] Error handling and troubleshooting guide

#### Educational Content
- [ ] Mathematical background on different numeral systems
- [ ] Explanation of base conversion algorithms
- [ ] Examples of repeating patterns in different bases
- [ ] Historical context for various base systems

#### Code Examples
- [ ] Basic base conversion examples
- [ ] Complex arithmetic with mixed bases
- [ ] Custom base system creation
- [ ] Repeating decimal patterns in different bases
- [ ] Integration with existing RatMath features

#### Example Files
- [ ] `examples/bases-basic.js` - fundamental base operations
- [ ] `examples/base-conversions.js` - conversion demonstrations
- [ ] `examples/custom-bases.js` - user-defined base systems
- [ ] `examples/base-arithmetic.js` - mixed-base calculations
- [ ] `examples/repeating-bases.js` - patterns in different bases

### 10. Calculator Integration

#### Terminal Calculator
- [x] Add base conversion commands: `BIN`, `HEX`, `OCT`, `BASE <n>`
- [x] Display options for showing results in multiple bases
- [x] Input parsing for base notation: `FF[16]`, `101[2]`
- [x] Base-specific help and examples
- [x] **NEW**: Enhanced BASE command with input-output separation
  - [x] `BASE <input>-><output>` syntax (e.g., `BASE 3->10`)
  - [x] Multiple output bases: `BASE 2->[10,16,8]`
  - [x] Automatic input base conversion for bare numbers
  - [x] Variable and function support with input base conversion

#### Web Calculator
- [ ] Base selector interface (dropdown or buttons)
- [ ] Live conversion display showing same number in multiple bases
- [ ] Base notation input support with validation
- [ ] Visual indicators for current base mode
- [ ] Mobile-friendly base selection interface

#### Advanced Calculator Features
- [ ] Base conversion history and comparison
- [ ] Simultaneous multi-base display
- [ ] Base-specific keyboard layouts or input helpers
- [ ] Educational mode showing conversion steps

### 11. Performance Optimization

#### Efficient Algorithms
- [ ] Optimize base conversion for common bases (powers of 2)
- [ ] Cache frequent conversions and base system objects
- [ ] Use efficient BigInt operations for large number conversions
- [ ] Implement fast paths for binary ↔ hexadecimal conversions

#### Memory Management
- [ ] Minimize object creation in base conversions
- [ ] Efficient string building for large base representations
- [ ] Lazy evaluation for expensive base system operations
- [ ] Profile and optimize critical conversion paths

## Implementation Notes

### Mathematical Considerations
- Different bases may reveal different terminating/repeating patterns for the same rational
- Base conversions must preserve exact rational values
- Consider mathematical properties unique to specific bases
- Handle edge cases like base 1 (unary) and very large bases

### Design Principles
- Maintain exact arithmetic - no approximation in base conversions
- Provide clear, educational error messages
- Support both programmatic and interactive use cases
- Ensure backward compatibility with existing RatMath features

### Error Handling
- Clear messages for character conflicts with parser symbols
- Validation of base specifications and character sequences
- Graceful handling of invalid digits in base context
- Performance warnings for very large or complex base systems

## Priority Levels
1. **High**: BaseSystem class, common presets, basic parser integration ✅ **COMPLETED**
2. **Medium**: Number class extensions, conversion utilities, calculator integration ✅ **COMPLETED**
3. **Low**: Advanced features, Unicode support, performance optimization

## Recent Additions (Completed)
- ✅ Enhanced BASE command with input-output base separation
- ✅ Multiple simultaneous output base display  
- ✅ Automatic input base conversion for expressions
- ✅ Variable and function integration with base conversion
- ✅ Comprehensive test suite for input-output functionality
- ✅ Examples and documentation for new features

## Integration with Existing Features
- Base notation should work with intervals: `A[16]:F[16]`
- Support for base notation in uncertainty expressions
- Compatibility with continued fractions and repeating decimals
- Integration with existing template functions (R, F)

## Future Enhancements (Out of Scope)
- Floating-point base representations (IEEE formats)
- Scientific notation in arbitrary bases
- Specialized bases (balanced ternary, bijective bases)
- Advanced number theory applications in specific bases

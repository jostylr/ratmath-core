# Type Promotion System

The ratmath library now includes a comprehensive type promotion system that automatically handles conversions between Integer, Rational, and RationalInterval types during arithmetic operations.

## Type Hierarchy

The type promotion follows this hierarchy:

```
Integer → Rational → RationalInterval
```

When performing arithmetic operations between different types, the result is promoted to the "highest" type in the hierarchy.

## Type-Aware Parsing

The parser now supports type-aware parsing that returns the most appropriate type based on the input:

### Basic Usage

```javascript
import { Parser, Integer, Rational, RationalInterval } from '@ratmath/core';

// Type-aware parsing (new behavior)
Parser.parse('42', { typeAware: true })        // → Integer(42)
Parser.parse('3/4', { typeAware: true })       // → Rational(3/4)
Parser.parse('1.5', { typeAware: true })       // → Rational(3/2)
Parser.parse('1:2', { typeAware: true })       // → RationalInterval[1, 2]

// Backward compatible parsing (default behavior)
Parser.parse('42')                             // → RationalInterval[42, 42]
Parser.parse('3/4')                            // → RationalInterval[3/4, 3/4]
```

### Parsing Rules

- **Integers**: Whole numbers without decimal points or fractions → `Integer`
- **Rationals**: Fractions (a/b), decimals (1.5), mixed numbers (2..1/3) → `Rational`
- **Intervals**: Colon notation (1:2), uncertainty notation (1.5[±0.1]) → `RationalInterval`

## Automatic Type Promotion in Arithmetic

All arithmetic methods on Integer, Rational, and RationalInterval classes now automatically handle type promotion:

### Integer Operations

```javascript
const int5 = new Integer(5);
const rational = new Rational(1, 2);
const interval = new RationalInterval(new Rational(1), new Rational(2));

int5.add(new Integer(3))        // → Integer(8)
int5.add(rational)              // → Rational(11/2)
int5.add(interval)              // → RationalInterval[6, 7]
```

### Rational Operations

```javascript
const rational = new Rational(1, 2);

rational.add(new Integer(5))    // → Rational(11/2)
rational.add(new Rational(1,3)) // → Rational(5/6)
rational.add(interval)          // → RationalInterval[3/2, 5/2]
```

### RationalInterval Operations

```javascript
const interval = new RationalInterval(new Rational(1), new Rational(2));

interval.add(new Integer(5))    // → RationalInterval[6, 7]
interval.add(rational)          // → RationalInterval[3/2, 5/2]
interval.add(interval2)         // → RationalInterval[...] 
```

## Division Behavior

Integer division has special behavior to maintain exactness when possible:

```javascript
new Integer(8).divide(new Integer(2))  // → Integer(4)     (exact)
new Integer(7).divide(new Integer(2))  // → Rational(7/2)  (inexact)
```

## Complex Expressions

Type-aware parsing works with complex expressions, following normal operator precedence:

```javascript
Parser.parse('2 + 3 * 4', { typeAware: true })      // → Integer(14)
Parser.parse('2 + 1/3 * 6', { typeAware: true })    // → Rational(4/1)
Parser.parse('7 / 2', { typeAware: true })          // → Rational(7/2)
Parser.parse('8 / 2', { typeAware: true })          // → Integer(4)
Parser.parse('1 + 2 * (1:2)', { typeAware: true })  // → RationalInterval[3, 5]
```

## E Notation Support

E notation preserves or promotes types as appropriate:

```javascript
Parser.parse('5E2', { typeAware: true })    // → Integer(500)
Parser.parse('5E-1', { typeAware: true })   // → Rational(1/2)
Parser.parse('1.5E3', { typeAware: true })  // → Rational(1500/1)
```

## Type Checking

You can check the resulting type using `instanceof`:

```javascript
const result1 = Parser.parse('5 + 3', { typeAware: true });
const result2 = Parser.parse('5 + 1/2', { typeAware: true });
const result3 = Parser.parse('5 + (1:2)', { typeAware: true });

result1 instanceof Integer          // → true
result2 instanceof Rational         // → true  
result3 instanceof RationalInterval // → true
```

## Backward Compatibility

The default parser behavior remains unchanged to maintain backward compatibility. All existing code will continue to work exactly as before. The type promotion system only activates when using the `{ typeAware: true }` option or when directly using the arithmetic methods on the individual classes.

## Implementation Details

- Type promotion is implemented at the arithmetic method level, not in the parser
- Each class's arithmetic methods detect the type of incoming arguments and promote as needed
- Circular import issues are avoided by using duck typing (checking for specific properties/methods)
- The promotion always goes "upward" in the hierarchy - no demotion occurs
- All type promotions preserve mathematical correctness and exactness where possible

## Benefits

1. **Natural behavior**: Operations work intuitively across different number types
2. **Exactness preservation**: Integer operations stay as integers when possible
3. **Automatic upgrading**: No manual type conversion required
4. **Backward compatibility**: Existing code continues to work unchanged
5. **Type safety**: Clear type hierarchy prevents unexpected behavior
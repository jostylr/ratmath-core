import { Parser, Integer, Rational, RationalInterval } from "./index.js";

// Helper function to format values for display
function formatValue(value) {
  if (value instanceof Integer) {
    return `Integer(${value.value})`;
  } else if (value instanceof Rational) {
    return `Rational(${value.numerator}/${value.denominator})`;
  } else if (value instanceof RationalInterval) {
    return `RationalInterval[${value.low.numerator}/${value.low.denominator}, ${value.high.numerator}/${value.high.denominator}]`;
  }
  return value.toString();
}

console.log("=== Type Promotion System Demo ===\n");

// Demonstrate type-aware parsing
console.log("1. Type-Aware Parsing:");
console.log("   Parser.parse('42', { typeAware: true })        ->", formatValue(Parser.parse('42', { typeAware: true })));
console.log("   Parser.parse('3/4', { typeAware: true })       ->", formatValue(Parser.parse('3/4', { typeAware: true })));
console.log("   Parser.parse('1.5', { typeAware: true })       ->", formatValue(Parser.parse('1.5', { typeAware: true })));
console.log("   Parser.parse('1:2', { typeAware: true })       ->", formatValue(Parser.parse('1:2', { typeAware: true })));
console.log();

// Demonstrate backward compatibility
console.log("2. Backward Compatibility (default behavior):");
console.log("   Parser.parse('42')                             ->", formatValue(Parser.parse('42')));
console.log("   Parser.parse('3/4')                            ->", formatValue(Parser.parse('3/4')));
console.log();

// Demonstrate type promotion in arithmetic
console.log("3. Type Promotion in Arithmetic:");

// Integer + Integer -> Integer
const int1 = new Integer(5);
const int2 = new Integer(3);
console.log("   Integer(5) + Integer(3)                        ->", formatValue(int1.add(int2)));

// Integer + Rational -> Rational
const rational1 = new Rational(1, 2);
console.log("   Integer(5) + Rational(1/2)                     ->", formatValue(int1.add(rational1)));

// Rational + Integer -> Rational  
console.log("   Rational(1/2) + Integer(5)                     ->", formatValue(rational1.add(int1)));

// Integer + RationalInterval -> RationalInterval
const interval1 = new RationalInterval(new Rational(1), new Rational(2));
console.log("   Integer(5) + RationalInterval[1,2]             ->", formatValue(int1.add(interval1)));

// Rational + RationalInterval -> RationalInterval
console.log("   Rational(1/2) + RationalInterval[1,2]          ->", formatValue(rational1.add(interval1)));
console.log();

// Demonstrate arithmetic operations
console.log("4. Arithmetic Operations with Type Promotion:");

// Division that returns Integer vs Rational
const int8 = new Integer(8);
const int2b = new Integer(2);
const int7 = new Integer(7);
console.log("   Integer(8) / Integer(2)   (exact division)     ->", formatValue(int8.divide(int2b)));
console.log("   Integer(7) / Integer(2)   (inexact division)   ->", formatValue(int7.divide(int2b)));

// Multiplication
const rational2 = new Rational(3, 4);
console.log("   Integer(4) * Rational(3/4)                     ->", formatValue(new Integer(4).multiply(rational2)));
console.log();

// Demonstrate parser expressions with type promotion
console.log("5. Complex Expressions with Type-Aware Parsing:");
console.log("   '2 + 3 * 4'                                    ->", formatValue(Parser.parse('2 + 3 * 4', { typeAware: true })));
console.log("   '2 + 1/3 * 6'                                  ->", formatValue(Parser.parse('2 + 1/3 * 6', { typeAware: true })));
console.log("   '7 / 2'                                        ->", formatValue(Parser.parse('7 / 2', { typeAware: true })));
console.log("   '8 / 2'                                        ->", formatValue(Parser.parse('8 / 2', { typeAware: true })));
console.log("   '1 + 2 * (1:2)'                                ->", formatValue(Parser.parse('1 + 2 * (1:2)', { typeAware: true })));
console.log();

// Demonstrate E notation
console.log("6. E Notation with Type Promotion:");
console.log("   '5E2'    (Integer * 10^2)                      ->", formatValue(Parser.parse('5E2', { typeAware: true })));
console.log("   '5E-1'   (Integer * 10^-1)                     ->", formatValue(Parser.parse('5E-1', { typeAware: true })));
console.log("   '1.5E3'  (Rational * 10^3)                     ->", formatValue(Parser.parse('1.5E3', { typeAware: true })));
console.log();

// Demonstrate the type hierarchy
console.log("7. Type Promotion Hierarchy (Integer -> Rational -> RationalInterval):");
console.log("   Starting with Integer(10):");
const base = new Integer(10);
console.log("   -> add Rational(1/2):                          ", formatValue(base.add(new Rational(1, 2))));
console.log("   -> add RationalInterval[1,2]:                  ", formatValue(base.add(new RationalInterval(new Rational(1), new Rational(2)))));
console.log();

console.log("   Starting with Rational(1/2):");
const baseRational = new Rational(1, 2);
console.log("   -> add Integer(10):                            ", formatValue(baseRational.add(new Integer(10))));
console.log("   -> add RationalInterval[1,2]:                  ", formatValue(baseRational.add(new RationalInterval(new Rational(1), new Rational(2)))));
console.log();

// Show type checking
console.log("8. Type Checking:");
const result1 = Parser.parse('5 + 3', { typeAware: true });
const result2 = Parser.parse('5 + 1/2', { typeAware: true });
const result3 = Parser.parse('5 + (1:2)', { typeAware: true });

console.log("   '5 + 3' is Integer:                           ", result1 instanceof Integer, `(value: ${formatValue(result1)})`);
console.log("   '5 + 1/2' is Rational:                        ", result2 instanceof Rational, `(value: ${formatValue(result2)})`);
console.log("   '5 + (1:2)' is RationalInterval:              ", result3 instanceof RationalInterval, `(value: ${formatValue(result3)})`);
console.log();

console.log("=== Demo Complete ===");
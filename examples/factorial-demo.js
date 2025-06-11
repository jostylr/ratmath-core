/**
 * Factorial Demo
 * 
 * Demonstrates the factorial and double factorial functionality in the ratmath library.
 * Shows both direct method calls on Integer instances and parser usage with ! and !! operators.
 */

import { Integer, Parser } from '../index.js';

function formatValue(value) {
  if (value instanceof Integer) {
    return `Integer(${value.value})`;
  }
  return value.toString();
}

console.log("=== Factorial and Double Factorial Demo ===\n");

// 1. Direct method calls on Integer instances
console.log("1. Direct Method Calls:");
console.log("   Integer(5).factorial()                      ->", formatValue(new Integer(5).factorial()));
console.log("   Integer(0).factorial()                      ->", formatValue(new Integer(0).factorial()));
console.log("   Integer(10).factorial()                     ->", formatValue(new Integer(10).factorial()));
console.log();

console.log("   Integer(5).doubleFactorial()                ->", formatValue(new Integer(5).doubleFactorial()));
console.log("   Integer(6).doubleFactorial()                ->", formatValue(new Integer(6).doubleFactorial()));
console.log("   Integer(7).doubleFactorial()                ->", formatValue(new Integer(7).doubleFactorial()));
console.log("   Integer(8).doubleFactorial()                ->", formatValue(new Integer(8).doubleFactorial()));
console.log();

// 2. Parser usage with factorial operators
console.log("2. Parser with Factorial Operators (Type-Aware):");
console.log("   Parser.parse('5!', { typeAware: true })     ->", formatValue(Parser.parse('5!', { typeAware: true })));
console.log("   Parser.parse('0!', { typeAware: true })     ->", formatValue(Parser.parse('0!', { typeAware: true })));
console.log("   Parser.parse('10!', { typeAware: true })    ->", formatValue(Parser.parse('10!', { typeAware: true })));
console.log();

console.log("   Parser.parse('5!!', { typeAware: true })    ->", formatValue(Parser.parse('5!!', { typeAware: true })));
console.log("   Parser.parse('6!!', { typeAware: true })    ->", formatValue(Parser.parse('6!!', { typeAware: true })));
console.log("   Parser.parse('7!!', { typeAware: true })    ->", formatValue(Parser.parse('7!!', { typeAware: true })));
console.log("   Parser.parse('8!!', { typeAware: true })    ->", formatValue(Parser.parse('8!!', { typeAware: true })));
console.log();

// 3. Factorial in expressions
console.log("3. Factorial in Expressions:");
console.log("   Parser.parse('3! + 4!', { typeAware: true }) ->", formatValue(Parser.parse('3! + 4!', { typeAware: true })));
console.log("   Parser.parse('5!! - 3!!', { typeAware: true }) ->", formatValue(Parser.parse('5!! - 3!!', { typeAware: true })));
console.log("   Parser.parse('(2 + 3)!', { typeAware: true }) ->", formatValue(Parser.parse('(2 + 3)!', { typeAware: true })));
console.log();

// 4. Operator precedence demonstrations
console.log("4. Operator Precedence (factorial has higher precedence than exponentiation):");
console.log("   Parser.parse('2!^3', { typeAware: true })   ->", formatValue(Parser.parse('2!^3', { typeAware: true })), "  // (2!)^3 = 2^3 = 8");
console.log("   Parser.parse('3!!^2', { typeAware: true })  ->", formatValue(Parser.parse('3!!^2', { typeAware: true })), " // (3!!)^2 = 3^2 = 9");
console.log();

// 5. Backward compatible parsing (returns intervals)
console.log("5. Backward Compatible Parsing (returns RationalInterval):");
const backwardResult1 = Parser.parse('5!');
const backwardResult2 = Parser.parse('6!!');
console.log("   Parser.parse('5!')                          ->", `RationalInterval[${backwardResult1.low}, ${backwardResult1.high}]`);
console.log("   Parser.parse('6!!')                         ->", `RationalInterval[${backwardResult2.low}, ${backwardResult2.high}]`);
console.log();

// 6. Mathematical explanations
console.log("6. Mathematical Explanations:");
console.log("   Standard factorial: n! = n × (n-1) × (n-2) × ... × 1");
console.log("   Examples:");
console.log("     5! = 5 × 4 × 3 × 2 × 1 = 120");
console.log("     0! = 1 (by definition)");
console.log();
console.log("   Double factorial: n!! = n × (n-2) × (n-4) × ... × (1 or 2)");
console.log("   Examples:");
console.log("     5!! = 5 × 3 × 1 = 15 (odd numbers down to 1)");
console.log("     6!! = 6 × 4 × 2 = 48 (even numbers down to 2)");
console.log();

// 7. Error handling examples
console.log("7. Error Handling:");
try {
  new Integer(-1).factorial();
} catch (error) {
  console.log("   Integer(-1).factorial()                     -> Error:", error.message);
}

try {
  Parser.parse('(-1)!');
} catch (error) {
  console.log("   Parser.parse('(-1)!')                       -> Error:", error.message);
}

try {
  Parser.parse('1/2!');
} catch (error) {
  console.log("   Parser.parse('1/2!')                        -> Error:", error.message);
}

console.log();
console.log("=== End of Factorial Demo ===");

import { Integer, Rational, BaseSystem } from '../index.js';

console.log("=== Basic Base Conversions ===\n");

// 1. Integer Conversion
const n = new Integer(42);
console.log(`42 in Binary:  ${n.toString(2)}`);       // 101010
console.log(`42 in Hex:     ${n.toString(16)}`);      // 2a
console.log(`42 in Base 36: ${n.toString(36)}`);      // 16

// 2. Rational Conversion (Terminating)
const half = new Rational(1, 2);
console.log(`\n1/2 in Binary: ${half.toString(2)}`);  // 0.1
console.log(`1/2 in Base 3: ${half.toString(3)}`);    // 0.111... -> 0.#1 (wait 1/2 in base 3 is 0.111...)

// 3. Rational Conversion (Repeating)
const third = new Rational(1, 3);
console.log(`\n1/3 in Binary: ${third.toString(2)}`); // 0.#01
console.log(`1/3 in Decimal: ${third.toString(10)}`); // 0.#3

// 4. Using BaseSystem constants
console.log(`\n255 in Hex: ${new Integer(255).toBase(BaseSystem.HEXADECIMAL)}`);

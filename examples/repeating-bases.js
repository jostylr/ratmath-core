
import { Rational, BaseSystem } from '../index.js';

console.log("=== Repeating Decimal Expansions in Bases ===\n");

// 1. Terminating vs Repeating
const oneThird = new Rational(1, 3);
// Base 10: 1/3 = 0.333... -> 0.#3
console.log(`1/3 in Base 10: ${oneThird.toString(10)}`);
// Base 3: 1/3 = 0.1
console.log(`1/3 in Base 3:  ${oneThird.toString(3)}`);
// Base 2: 1/3 = 0.010101... -> 0.#01
console.log(`1/3 in Base 2:  ${oneThird.toString(2)}`);

// 2. Mixed Numbers
const mixed = new Rational(7, 3); // 2.333...
console.log(`\n7/3 in Base 10: ${mixed.toString(10)}`); // 2.#3
console.log(`7/3 in Base 2:  ${mixed.toString(2)}`);  // 10.#01

// 3. Complex Pattern
const complex = new Rational(1, 7);
console.log(`\n1/7 in Base 10: ${complex.toString(10)}`); // 0.#142857
console.log(`1/7 in Base 7:  ${complex.toString(7)}`);    // 0.1

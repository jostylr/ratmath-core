
import { Integer, BaseSystem } from '../index.js';

console.log("=== Custom Base Systems ===\n");

// 1. Define a custom base (Base 3 with 'a', 'b', 'c')
const abcBase = new BaseSystem("abc", "ABC Base");
console.log(`Base System: ${abcBase.toString()}`);

// 2. Convert numbers to this base
const n = new Integer(5);
console.log(`5 in ABC Base: ${n.toBase(abcBase)}`);
// 5 in base 3 is 12 -> 1='b', 2='c' -> "bc"

// 3. Convert from this base
const input = "ba"; // b=1, a=0 -> 10 (base 3) -> 3
const val = abcBase.toDecimal(input);
console.log(`"ba" in ABC Base -> Decimal: ${val}`);

// 4. Large Base (Base 62)
const base62 = BaseSystem.BASE62;
const largeNum = new Integer(123456789);
console.log(`\n123,456,789 in Base 62: ${largeNum.toBase(base62)}`);

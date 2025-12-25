
import { describe, test, expect } from "bun:test";
import { Rational, BaseSystem } from "../index.js";

describe("Rational Base Expansion", () => {
    describe("Terminating Expansions", () => {
        test("should handle terminating fractions in base 2", () => {
            const r = new Rational(1, 2);
            expect(r.toRepeatingBase(BaseSystem.BINARY)).toBe("0.1");
            expect(r.toString(2)).toBe("0.1");

            const r2 = new Rational(1, 4);
            expect(r2.toRepeatingBase(BaseSystem.BINARY)).toBe("0.01");
        });

        test("should handle terminating fractions in base 3", () => {
            const r = new Rational(1, 3);
            expect(r.toRepeatingBase(new BaseSystem("012"))).toBe("0.1");
        });

        test("should handle mixed numbers", () => {
            const r = new Rational(3, 2); // 1.5
            expect(r.toRepeatingBase(BaseSystem.BINARY)).toBe("1.1");
        });
    });

    describe("Repeating Expansions", () => {
        test("should handle simple repeating fractions in base 10", () => {
            const r = new Rational(1, 3);
            expect(r.toRepeatingBase(BaseSystem.DECIMAL)).toBe("0.#3");
        });

        test("should handle repeating fractions in base 2", () => {
            // 1/3 in binary: 1/11 -> 0.010101... -> 0.#01
            const r = new Rational(1, 3);
            expect(r.toRepeatingBase(BaseSystem.BINARY)).toBe("0.#01");
        });

        test("should handle mixed repeating fractions", () => {
            // 1/6 in base 10 -> 0.1666... -> 0.1#6
            const r = new Rational(1, 6);
            expect(r.toRepeatingBase(BaseSystem.DECIMAL)).toBe("0.1#6");
        });

        test("should handle 1/7 in base 10", () => {
            const r = new Rational(1, 7);
            expect(r.toRepeatingBase(BaseSystem.DECIMAL)).toBe("0.#142857");
        });
    });

    describe("Custom Bases", () => {
        test("should work with base 16", () => {
            // 1/16 = 0.1 in hex
            const r = new Rational(1, 16);
            expect(r.toRepeatingBase(BaseSystem.HEXADECIMAL)).toBe("0.1");

            // 10.5 -> A.8
            const r2 = new Rational(21, 2);
            expect(r2.toRepeatingBase(BaseSystem.HEXADECIMAL)).toBe("a.8");
        });

        test("should work with custom charsets", () => {
            const base3 = new BaseSystem("abc"); // 0->a, 1->b, 2->c
            // 1/2 in base 3? 
            // 1/2 * 3 = 1 remainder 1
            // 1 * 3 = 1.5 -> 1 rem 1 -> 0.#1 (b)
            // Wait: 1/2 in base 3 is 0.111... -> 0.#1
            // In "abc", 1 is 'b'. So 0.#b? No 0 is 'a'. So a.#b
            const r = new Rational(1, 2);
            // 1 / 2 = 0
            // rem = 1
            // 1*3 = 3. 3/2 = 1 (char 'b'). rem = 1. -> Cycle start at 0.
            // Result: 0.#1 -> a.#b
            expect(r.toRepeatingBase(base3)).toBe("a.#b");
        });
    });

    describe("Integers and Zero", () => {
        test("should return just integer part if no fraction", () => {
            const r = new Rational(5, 1);
            expect(r.toRepeatingBase(BaseSystem.BINARY)).toBe("101");
        });

        test("should handle zero", () => {
            const r = new Rational(0, 1);
            expect(r.toRepeatingBase(BaseSystem.BINARY)).toBe("0");
        });

        test("should handle negative numbers", () => {
            const r = new Rational(-1, 3);
            expect(r.toRepeatingBase(BaseSystem.DECIMAL)).toBe("-0.#3");
        });
    });
});

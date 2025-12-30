
import { describe, expect, it } from 'bun:test';
import { Integer } from '../src/integer.js';
import { Rational } from '../src/rational.js';
import { BaseSystem } from '../src/base-system.js';

describe('Bases Extension', () => {
    describe('Integer.toBase', () => {
        it('converts to binary', () => {
            const i = new Integer(5);
            expect(i.toBase(BaseSystem.BINARY)).toBe('101');
        });

        it('converts to hex', () => {
            const i = new Integer(255);
            // specific casing depends on BaseSystem implementation, usually lowercase for standard hex if I recall correctly
            // Checking BaseSystem.HEXADECIMAL definition in base-system.js: "0-9a-f"
            expect(i.toBase(BaseSystem.HEXADECIMAL)).toBe('ff');
        });

        it('converts negative numbers', () => {
            const i = new Integer(-5);
            expect(i.toBase(BaseSystem.BINARY)).toBe('-101');
        });
    });

    describe('Integer.toString(base)', () => {
        it('converts using numeric base', () => {
            const i = new Integer(10);
            expect(i.toString(2)).toBe('1010');
        });

        it('converts using BaseSystem object', () => {
            const i = new Integer(10);
            expect(i.toString(BaseSystem.BINARY)).toBe('1010');
        });

        it('defaults to decimal', () => {
            const i = new Integer(10);
            expect(i.toString()).toBe('10');
        });
    });

    describe('Rational.toBase', () => {
        it('converts integer rational', () => {
            const r = new Rational(5);
            expect(r.toBase(BaseSystem.BINARY)).toBe('101');
        });

        it('converts fraction rational', () => {
            const r = new Rational(1, 2);
            // Expect numerator/denominator format
            expect(r.toBase(BaseSystem.BINARY)).toBe('1/10');
        });

        it('converts negative fraction rational', () => {
            const r = new Rational(-1, 2);
            expect(r.toBase(BaseSystem.BINARY)).toBe('-1/10');
        });
    });

    describe('Rational.toString(base)', () => {
        it('converts using numeric base', () => {
            const r = new Rational(3, 4); // 0.11 in binary
            expect(r.toString(2)).toBe('0.11#0');
        });

        it('converts using BaseSystem object', () => {
            const r = new Rational(3, 4);
            expect(r.toString(BaseSystem.BINARY)).toBe('0.11#0');
        });
    });
});

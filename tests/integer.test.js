import { describe, expect, it, test } from 'bun:test';
import { Integer } from '../src/integer.js';
import { Rational } from '../src/rational.js';

describe('Integer', () => {
  describe('static constants', () => {
    it('provides a zero constant', () => {
      expect(Integer.zero.value).toBe(0n);
    });

    it('provides a one constant', () => {
      expect(Integer.one.value).toBe(1n);
    });
  });

  describe('constructor', () => {
    it('creates an integer from a number', () => {
      const i = new Integer(42);
      expect(i.value).toBe(42n);
    });

    it('creates an integer from a bigint', () => {
      const i = new Integer(42n);
      expect(i.value).toBe(42n);
    });

    it('creates an integer from a string', () => {
      const i = new Integer('42');
      expect(i.value).toBe(42n);
    });

    it('creates a negative integer', () => {
      const i = new Integer(-42);
      expect(i.value).toBe(-42n);
    });

    it('creates a large integer', () => {
      const large = '123456789012345678901234567890';
      const i = new Integer(large);
      expect(i.value).toBe(BigInt(large));
    });

    it('throws error for invalid string format', () => {
      expect(() => new Integer('42.5')).toThrow('Invalid integer format');
      expect(() => new Integer('abc')).toThrow('Invalid integer format');
      expect(() => new Integer('42/3')).toThrow('Invalid integer format');
    });

    it('handles string with whitespace', () => {
      const i = new Integer('  42  ');
      expect(i.value).toBe(42n);
    });
  });

  describe('arithmetic operations', () => {
    describe('addition', () => {
      it('adds two positive integers', () => {
        const a = new Integer(3);
        const b = new Integer(4);
        const result = a.add(b);
        expect(result.value).toBe(7n);
      });

      it('adds positive and negative integers', () => {
        const a = new Integer(5);
        const b = new Integer(-3);
        const result = a.add(b);
        expect(result.value).toBe(2n);
      });

      it('adds two negative integers', () => {
        const a = new Integer(-3);
        const b = new Integer(-4);
        const result = a.add(b);
        expect(result.value).toBe(-7n);
      });
    });

    describe('subtraction', () => {
      it('subtracts two positive integers', () => {
        const a = new Integer(7);
        const b = new Integer(3);
        const result = a.subtract(b);
        expect(result.value).toBe(4n);
      });

      it('subtracts resulting in negative', () => {
        const a = new Integer(3);
        const b = new Integer(7);
        const result = a.subtract(b);
        expect(result.value).toBe(-4n);
      });
    });

    describe('multiplication', () => {
      it('multiplies two positive integers', () => {
        const a = new Integer(3);
        const b = new Integer(4);
        const result = a.multiply(b);
        expect(result.value).toBe(12n);
      });

      it('multiplies positive and negative integers', () => {
        const a = new Integer(3);
        const b = new Integer(-4);
        const result = a.multiply(b);
        expect(result.value).toBe(-12n);
      });

      it('multiplies by zero', () => {
        const a = new Integer(5);
        const b = new Integer(0);
        const result = a.multiply(b);
        expect(result.value).toBe(0n);
      });
    });

    describe('division', () => {
      it('divides evenly returning an integer', () => {
        const a = new Integer(12);
        const b = new Integer(3);
        const result = a.divide(b);
        expect(result).toBeInstanceOf(Integer);
        expect(result.value).toBe(4n);
      });

      it('divides unevenly returning a rational', () => {
        const a = new Integer(5);
        const b = new Integer(2);
        const result = a.divide(b);
        expect(result).toBeInstanceOf(Rational);
        expect(result.numerator).toBe(5n);
        expect(result.denominator).toBe(2n);
      });

      it('throws error for division by zero', () => {
        const a = new Integer(5);
        const b = new Integer(0);
        expect(() => a.divide(b)).toThrow('Division by zero');
      });

      it('handles negative division', () => {
        const a = new Integer(-12);
        const b = new Integer(3);
        const result = a.divide(b);
        expect(result).toBeInstanceOf(Integer);
        expect(result.value).toBe(-4n);
      });
    });

    describe('modulo', () => {
      it('computes modulo of positive integers', () => {
        const a = new Integer(17);
        const b = new Integer(5);
        const result = a.modulo(b);
        expect(result.value).toBe(2n);
      });

      it('computes modulo with negative dividend', () => {
        const a = new Integer(-17);
        const b = new Integer(5);
        const result = a.modulo(b);
        expect(result.value).toBe(-2n);
      });

      it('throws error for modulo by zero', () => {
        const a = new Integer(5);
        const b = new Integer(0);
        expect(() => a.modulo(b)).toThrow('Modulo by zero');
      });
    });

    describe('negation', () => {
      it('negates a positive integer', () => {
        const a = new Integer(5);
        const result = a.negate();
        expect(result.value).toBe(-5n);
      });

      it('negates a negative integer', () => {
        const a = new Integer(-5);
        const result = a.negate();
        expect(result.value).toBe(5n);
      });

      it('negates zero', () => {
        const a = new Integer(0);
        const result = a.negate();
        expect(result.value).toBe(0n);
      });
    });

    describe('power', () => {
      it('raises to positive power', () => {
        const a = new Integer(2);
        const result = a.pow(3);
        expect(result.value).toBe(8n);
      });

      it('raises to power of zero', () => {
        const a = new Integer(5);
        const result = a.pow(0);
        expect(result.value).toBe(1n);
      });

      it('raises zero to positive power', () => {
        const a = new Integer(0);
        const result = a.pow(5);
        expect(result.value).toBe(0n);
      });

      it('returns rational for negative exponent', () => {
        const a = new Integer(2);
        const result = a.pow(-1);
        expect(result).toBeInstanceOf(Rational);
        expect(result.numerator).toBe(1n);
        expect(result.denominator).toBe(2n);
      });

      it('returns rational for larger negative exponent', () => {
        const a = new Integer(3);
        const result = a.pow(-2);
        expect(result).toBeInstanceOf(Rational);
        expect(result.numerator).toBe(1n);
        expect(result.denominator).toBe(9n);
      });

      it('throws error for zero raised to negative power', () => {
        const a = new Integer(0);
        expect(() => a.pow(-1)).toThrow('Zero cannot be raised to a negative power');
      });

      it('throws error for zero raised to power zero', () => {
        const a = new Integer(0);
        expect(() => a.pow(0)).toThrow('Zero cannot be raised to the power of zero');
      });

      it('handles large exponents', () => {
        const a = new Integer(2);
        const result = a.pow(10);
        expect(result.value).toBe(1024n);
      });
    });
  });

  describe('comparison operations', () => {
    describe('equals', () => {
      it('returns true for equal integers', () => {
        const a = new Integer(5);
        const b = new Integer(5);
        expect(a.equals(b)).toBe(true);
      });

      it('returns false for unequal integers', () => {
        const a = new Integer(5);
        const b = new Integer(3);
        expect(a.equals(b)).toBe(false);
      });
    });

    describe('compareTo', () => {
      it('returns 0 for equal integers', () => {
        const a = new Integer(5);
        const b = new Integer(5);
        expect(a.compareTo(b)).toBe(0);
      });

      it('returns -1 when first is smaller', () => {
        const a = new Integer(3);
        const b = new Integer(5);
        expect(a.compareTo(b)).toBe(-1);
      });

      it('returns 1 when first is larger', () => {
        const a = new Integer(5);
        const b = new Integer(3);
        expect(a.compareTo(b)).toBe(1);
      });
    });

    describe('comparison methods', () => {
      it('lessThan works correctly', () => {
        const a = new Integer(3);
        const b = new Integer(5);
        expect(a.lessThan(b)).toBe(true);
        expect(b.lessThan(a)).toBe(false);
      });

      it('lessThanOrEqual works correctly', () => {
        const a = new Integer(3);
        const b = new Integer(5);
        const c = new Integer(3);
        expect(a.lessThanOrEqual(b)).toBe(true);
        expect(a.lessThanOrEqual(c)).toBe(true);
        expect(b.lessThanOrEqual(a)).toBe(false);
      });

      it('greaterThan works correctly', () => {
        const a = new Integer(5);
        const b = new Integer(3);
        expect(a.greaterThan(b)).toBe(true);
        expect(b.greaterThan(a)).toBe(false);
      });

      it('greaterThanOrEqual works correctly', () => {
        const a = new Integer(5);
        const b = new Integer(3);
        const c = new Integer(5);
        expect(a.greaterThanOrEqual(b)).toBe(true);
        expect(a.greaterThanOrEqual(c)).toBe(true);
        expect(b.greaterThanOrEqual(a)).toBe(false);
      });
    });
  });

  describe('utility methods', () => {
    describe('abs', () => {
      it('returns absolute value of positive integer', () => {
        const a = new Integer(5);
        const result = a.abs();
        expect(result.value).toBe(5n);
      });

      it('returns absolute value of negative integer', () => {
        const a = new Integer(-5);
        const result = a.abs();
        expect(result.value).toBe(5n);
      });

      it('returns absolute value of zero', () => {
        const a = new Integer(0);
        const result = a.abs();
        expect(result.value).toBe(0n);
      });
    });

    describe('sign', () => {
      it('returns 1 for positive integer', () => {
        const a = new Integer(5);
        const result = a.sign();
        expect(result.value).toBe(1n);
      });

      it('returns -1 for negative integer', () => {
        const a = new Integer(-5);
        const result = a.sign();
        expect(result.value).toBe(-1n);
      });

      it('returns 0 for zero', () => {
        const a = new Integer(0);
        const result = a.sign();
        expect(result.value).toBe(0n);
      });
    });

    describe('parity checks', () => {
      it('isEven works correctly', () => {
        expect(new Integer(4).isEven()).toBe(true);
        expect(new Integer(5).isEven()).toBe(false);
        expect(new Integer(0).isEven()).toBe(true);
        expect(new Integer(-4).isEven()).toBe(true);
      });

      it('isOdd works correctly', () => {
        expect(new Integer(4).isOdd()).toBe(false);
        expect(new Integer(5).isOdd()).toBe(true);
        expect(new Integer(0).isOdd()).toBe(false);
        expect(new Integer(-5).isOdd()).toBe(true);
      });
    });

    describe('sign checks', () => {
      it('isZero works correctly', () => {
        expect(new Integer(0).isZero()).toBe(true);
        expect(new Integer(5).isZero()).toBe(false);
        expect(new Integer(-5).isZero()).toBe(false);
      });

      it('isPositive works correctly', () => {
        expect(new Integer(5).isPositive()).toBe(true);
        expect(new Integer(0).isPositive()).toBe(false);
        expect(new Integer(-5).isPositive()).toBe(false);
      });

      it('isNegative works correctly', () => {
        expect(new Integer(-5).isNegative()).toBe(true);
        expect(new Integer(0).isNegative()).toBe(false);
        expect(new Integer(5).isNegative()).toBe(false);
      });
    });

    describe('gcd', () => {
      it('computes gcd of positive integers', () => {
        const a = new Integer(12);
        const b = new Integer(8);
        const result = a.gcd(b);
        expect(result.value).toBe(4n);
      });

      it('computes gcd with negative integers', () => {
        const a = new Integer(-12);
        const b = new Integer(8);
        const result = a.gcd(b);
        expect(result.value).toBe(4n);
      });

      it('computes gcd when one is zero', () => {
        const a = new Integer(12);
        const b = new Integer(0);
        const result = a.gcd(b);
        expect(result.value).toBe(12n);
      });
    });

    describe('lcm', () => {
      it('computes lcm of positive integers', () => {
        const a = new Integer(4);
        const b = new Integer(6);
        const result = a.lcm(b);
        expect(result.value).toBe(12n);
      });

      it('returns zero when one operand is zero', () => {
        const a = new Integer(5);
        const b = new Integer(0);
        const result = a.lcm(b);
        expect(result.value).toBe(0n);
      });
    });
  });

  describe('conversion methods', () => {
    describe('toString', () => {
      it('converts positive integer to string', () => {
        const a = new Integer(42);
        expect(a.toString()).toBe('42');
      });

      it('converts negative integer to string', () => {
        const a = new Integer(-42);
        expect(a.toString()).toBe('-42');
      });

      it('converts zero to string', () => {
        const a = new Integer(0);
        expect(a.toString()).toBe('0');
      });
    });

    describe('toNumber', () => {
      it('converts small integer to number', () => {
        const a = new Integer(42);
        expect(a.toNumber()).toBe(42);
      });

      it('converts negative integer to number', () => {
        const a = new Integer(-42);
        expect(a.toNumber()).toBe(-42);
      });
    });

    describe('toRational', () => {
      it('converts integer to rational', () => {
        const a = new Integer(5);
        const rational = a.toRational();
        expect(rational).toBeInstanceOf(Rational);
        expect(rational.numerator).toBe(5n);
        expect(rational.denominator).toBe(1n);
      });
    });
  });

  describe('static methods', () => {
    describe('from', () => {
      it('creates integer from number', () => {
        const result = Integer.from(42);
        expect(result.value).toBe(42n);
      });

      it('creates integer from string', () => {
        const result = Integer.from('42');
        expect(result.value).toBe(42n);
      });

      it('creates integer from bigint', () => {
        const result = Integer.from(42n);
        expect(result.value).toBe(42n);
      });

      it('creates integer from another integer', () => {
        const original = new Integer(42);
        const result = Integer.from(original);
        expect(result.value).toBe(42n);
        expect(result).not.toBe(original); // Should be a new instance
      });
    });

    describe('fromRational', () => {
      it('creates integer from whole number rational', () => {
        const rational = new Rational(5, 1);
        const result = Integer.fromRational(rational);
        expect(result.value).toBe(5n);
      });

      it('throws error for non-whole rational', () => {
        const rational = new Rational(5, 2);
        expect(() => Integer.fromRational(rational)).toThrow('Rational is not a whole number');
      });
    });
  });
});
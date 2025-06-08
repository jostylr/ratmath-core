import { describe, expect, it, test } from 'bun:test';
import { Integer } from '../src/integer.js';
import { Rational } from '../src/rational.js';

describe('Integer-Rational Integration', () => {
  describe('division returning rationals', () => {
    it('returns rational for non-exact division', () => {
      const a = new Integer(7);
      const b = new Integer(3);
      const result = a.divide(b);
      
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(7n);
      expect(result.denominator).toBe(3n);
    });

    it('can chain integer operations with rational results', () => {
      const a = new Integer(10);
      const b = new Integer(3);
      const c = new Integer(2);
      
      const quotient = a.divide(b); // 10/3 (Rational)
      const sum = quotient.add(new Rational(c)); // 10/3 + 2 = 16/3
      
      expect(sum).toBeInstanceOf(Rational);
      expect(sum.numerator).toBe(16n);
      expect(sum.denominator).toBe(3n);
    });

    it('handles large integer division producing rationals', () => {
      const large1 = new Integer('123456789012345678901234567890');
      const large2 = new Integer('987654321098765432109876543210');
      const result = large1.divide(large2);
      
      expect(result).toBeInstanceOf(Rational);
      // The rational will be reduced, but the original ratio should be preserved
      const originalNumerator = 123456789012345678901234567890n;
      const originalDenominator = 987654321098765432109876543210n;
      
      // Verify the rational represents the same value
      const expectedNumerator = result.numerator;
      const expectedDenominator = result.denominator;
      
      // Cross multiply to check equality: a/b = c/d iff a*d = b*c
      expect(originalNumerator * expectedDenominator).toBe(originalDenominator * expectedNumerator);
    });
  });

  describe('rational to integer conversion', () => {
    it('converts whole number rationals to integers', () => {
      const rational = new Rational(15, 1);
      const integer = Integer.fromRational(rational);
      
      expect(integer).toBeInstanceOf(Integer);
      expect(integer.value).toBe(15n);
    });

    it('throws error for non-whole rationals', () => {
      const rational = new Rational(7, 3);
      expect(() => Integer.fromRational(rational)).toThrow('Rational is not a whole number');
    });

    it('handles negative whole rationals', () => {
      const rational = new Rational(-42, 1);
      const integer = Integer.fromRational(rational);
      
      expect(integer.value).toBe(-42n);
    });

    it('handles zero rational', () => {
      const rational = new Rational(0, 1);
      const integer = Integer.fromRational(rational);
      
      expect(integer.value).toBe(0n);
    });
  });

  describe('integer to rational conversion', () => {
    it('converts integers to rationals with denominator 1', () => {
      const integer = new Integer(42);
      const rational = integer.toRational();
      
      expect(rational).toBeInstanceOf(Rational);
      expect(rational.numerator).toBe(42n);
      expect(rational.denominator).toBe(1n);
    });

    it('preserves negative values', () => {
      const integer = new Integer(-17);
      const rational = integer.toRational();
      
      expect(rational.numerator).toBe(-17n);
      expect(rational.denominator).toBe(1n);
    });

    it('handles large integers', () => {
      const large = new Integer('999999999999999999999999999999');
      const rational = large.toRational();
      
      expect(rational.numerator).toBe(999999999999999999999999999999n);
      expect(rational.denominator).toBe(1n);
    });
  });

  describe('mixed arithmetic operations', () => {
    it('allows arithmetic between integers and rationals', () => {
      const integer = new Integer(5);
      const rational = new Rational(1, 3);
      
      // Convert integer to rational for arithmetic
      const intAsRational = integer.toRational();
      const sum = intAsRational.add(rational);
      
      expect(sum.numerator).toBe(16n);
      expect(sum.denominator).toBe(3n);
    });

    it('handles complex mixed operations', () => {
      const a = new Integer(12);
      const b = new Integer(5);
      
      // 12/5 = 2.4 as rational
      const quotient = a.divide(b);
      expect(quotient).toBeInstanceOf(Rational);
      
      // Add another rational
      const c = new Rational(3, 10); // 0.3
      const sum = quotient.add(c); // 2.4 + 0.3 = 2.7 = 27/10
      
      expect(sum.numerator).toBe(27n);
      expect(sum.denominator).toBe(10n);
    });

    it('preserves exact arithmetic through conversions', () => {
      const integer = new Integer(100);
      const divisor = new Integer(7);
      
      // 100/7 as rational
      const quotient = integer.divide(divisor);
      
      // Multiply by 7 to get back to 100
      const result = quotient.multiply(new Rational(7));
      
      expect(result.numerator).toBe(100n);
      expect(result.denominator).toBe(1n);
      
      // Convert back to integer
      const backToInteger = Integer.fromRational(result);
      expect(backToInteger.value).toBe(100n);
    });
  });

  describe('edge cases and error handling', () => {
    it('handles zero division consistently', () => {
      const integer = new Integer(5);
      const zero = new Integer(0);
      
      expect(() => integer.divide(zero)).toThrow('Division by zero');
    });

    it('handles very large numbers in conversions', () => {
      const veryLarge = '12345678901234567890123456789012345678901234567890';
      const integer = new Integer(veryLarge);
      const rational = integer.toRational();
      const backToInteger = Integer.fromRational(rational);
      
      expect(backToInteger.value).toBe(BigInt(veryLarge));
    });

    it('maintains precision across multiple conversions', () => {
      const original = new Integer(42);
      const asRational = original.toRational();
      const backToInteger = Integer.fromRational(asRational);
      
      expect(backToInteger.equals(original)).toBe(true);
    });
  });

  describe('practical use cases', () => {
    it('calculates exact averages', () => {
      const numbers = [
        new Integer(10),
        new Integer(15),
        new Integer(20),
        new Integer(25)
      ];
      
      // Sum all numbers
      let sum = new Integer(0);
      for (const num of numbers) {
        sum = sum.add(num);
      }
      
      // Divide by count (will be rational if not exact)
      const count = new Integer(numbers.length);
      const average = sum.divide(count); // 70/4 = 17.5
      
      expect(average.numerator).toBe(35n);
      expect(average.denominator).toBe(2n);
    });

    it('handles financial calculations with exact precision', () => {
      // Calculate 1/3 of $100 (should be $33.33...)
      const amount = new Integer(100);
      const parts = new Integer(3);
      
      const oneThird = amount.divide(parts);
      expect(oneThird).toBeInstanceOf(Rational);
      expect(oneThird.numerator).toBe(100n);
      expect(oneThird.denominator).toBe(3n);
      
      // Verify that 3 * (100/3) = 100 exactly
      const reconstructed = oneThird.multiply(new Rational(3));
      expect(reconstructed.numerator).toBe(100n);
      expect(reconstructed.denominator).toBe(1n);
    });

    it('performs exact fraction arithmetic starting from integers', () => {
      // Calculate (a/b + c/d) where a,b,c,d are integers
      const a = new Integer(3);
      const b = new Integer(4);
      const c = new Integer(5);
      const d = new Integer(6);
      
      const fraction1 = a.divide(b); // 3/4
      const fraction2 = c.divide(d); // 5/6
      
      const sum = fraction1.add(fraction2); // 3/4 + 5/6 = 9/12 + 10/12 = 19/12
      
      expect(sum.numerator).toBe(19n);
      expect(sum.denominator).toBe(12n);
    });

    it('computes exact powers and roots relationships', () => {
      const base = new Integer(2);
      const exponent = new Integer(10);
      
      // 2^10 = 1024
      const power = base.pow(exponent.toNumber());
      expect(power.value).toBe(1024n);
      
      // 1024 / 2^5 = 32
      const divisor = new Integer(2).pow(5);
      const quotient = power.divide(divisor);
      
      expect(quotient).toBeInstanceOf(Integer);
      expect(quotient.value).toBe(32n);
    });
  });

  describe('performance and memory efficiency', () => {
    it('handles repeated operations efficiently', () => {
      let result = new Integer(1);
      
      // Perform many operations
      for (let i = 2; i <= 10; i++) {
        const current = new Integer(i);
        const quotient = result.divide(current);
        
        if (quotient instanceof Rational) {
          result = Integer.fromRational(quotient.multiply(current.toRational()));
        } else {
          result = quotient.multiply(current);
        }
      }
      
      expect(result.value).toBe(1n);
    });

    it('maintains exact arithmetic with large intermediate results', () => {
      const large1 = new Integer('999999999999999999999999999999');
      const large2 = new Integer('111111111111111111111111111111');
      
      const product = large1.multiply(large2);
      const quotient = product.divide(large2);
      
      expect(quotient).toBeInstanceOf(Integer);
      expect(quotient.equals(large1)).toBe(true);
    });
  });
});
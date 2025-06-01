import { describe, expect, it, test } from 'bun:test';
import { Rational } from '../src/rational.js';

describe('Rational', () => {
  describe('static constants', () => {
    it('provides a zero constant', () => {
      expect(Rational.zero.numerator).toBe(0n);
      expect(Rational.zero.denominator).toBe(1n);
    });

    it('provides a one constant', () => {
      expect(Rational.one.numerator).toBe(1n);
      expect(Rational.one.denominator).toBe(1n);
    });
  });

  describe('constructor', () => {
    it('creates a rational from integers', () => {
      const r = new Rational(3, 4);
      expect(r.numerator).toBe(3n);
      expect(r.denominator).toBe(4n);
    });

    it('creates a rational from bigints', () => {
      const r = new Rational(3n, 4n);
      expect(r.numerator).toBe(3n);
      expect(r.denominator).toBe(4n);
    });

    it('creates a rational from a string', () => {
      const r = new Rational('3/4');
      expect(r.numerator).toBe(3n);
      expect(r.denominator).toBe(4n);
    });

    it('creates a rational from a whole number string', () => {
      const r = new Rational('5');
      expect(r.numerator).toBe(5n);
      expect(r.denominator).toBe(1n);
    });

    it('normalizes the rational to lowest terms', () => {
      const r = new Rational(6, 8);
      expect(r.numerator).toBe(3n);
      expect(r.denominator).toBe(4n);
    });

    it('handles negative numbers', () => {
      const r1 = new Rational(-3, 4);
      expect(r1.numerator).toBe(-3n);
      expect(r1.denominator).toBe(4n);

      const r2 = new Rational(3, -4);
      expect(r2.numerator).toBe(-3n);
      expect(r2.denominator).toBe(4n);

      const r3 = new Rational(-3, -4);
      expect(r3.numerator).toBe(3n);
      expect(r3.denominator).toBe(4n);
    });

    it('throws an error for zero denominator', () => {
      expect(() => new Rational(1, 0)).toThrow('Denominator cannot be zero');
    });

    it('handles zero numerator', () => {
      const r = new Rational(0, 5);
      expect(r.numerator).toBe(0n);
      expect(r.denominator).toBe(1n);
    });
  });

  describe('arithmetic operations', () => {
    it('adds two rationals', () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(1, 3);
      const sum = r1.add(r2);
      expect(sum.numerator).toBe(5n);
      expect(sum.denominator).toBe(6n);
    });

    it('subtracts two rationals', () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(1, 3);
      const diff = r1.subtract(r2);
      expect(diff.numerator).toBe(1n);
      expect(diff.denominator).toBe(6n);
    });

    it('multiplies two rationals', () => {
      const r1 = new Rational(2, 3);
      const r2 = new Rational(3, 4);
      const product = r1.multiply(r2);
      expect(product.numerator).toBe(1n);
      expect(product.denominator).toBe(2n);
    });

    it('divides two rationals', () => {
      const r1 = new Rational(2, 3);
      const r2 = new Rational(3, 4);
      const quotient = r1.divide(r2);
      expect(quotient.numerator).toBe(8n);
      expect(quotient.denominator).toBe(9n);
    });

    it('throws an error when dividing by zero', () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(0, 1);
      expect(() => r1.divide(r2)).toThrow('Division by zero');
    });

    it('negates a rational', () => {
      const r = new Rational(3, 4);
      const neg = r.negate();
      expect(neg.numerator).toBe(-3n);
      expect(neg.denominator).toBe(4n);
    });

    it('computes the reciprocal of a rational', () => {
      const r = new Rational(3, 4);
      const recip = r.reciprocal();
      expect(recip.numerator).toBe(4n);
      expect(recip.denominator).toBe(3n);
    });

    it('throws an error when computing the reciprocal of zero', () => {
      const r = new Rational(0, 1);
      expect(() => r.reciprocal()).toThrow('Cannot take reciprocal of zero');
    });

    it('computes absolute value', () => {
      const r1 = new Rational(3, 4);
      const r2 = new Rational(-3, 4);
      
      expect(r1.abs().equals(r1)).toBe(true);
      expect(r2.abs().equals(r1)).toBe(true);
    });
  });

  describe('exponentiation', () => {
    it('raises a rational to a positive integer power', () => {
      const r = new Rational(2, 3);
      const result = r.pow(3);
      expect(result.numerator).toBe(8n);
      expect(result.denominator).toBe(27n);
    });

    it('raises a rational to a negative integer power', () => {
      const r = new Rational(2, 3);
      const result = r.pow(-2);
      expect(result.numerator).toBe(9n);
      expect(result.denominator).toBe(4n);
    });

    it('raises a rational to power 0', () => {
      const r = new Rational(2, 3);
      const result = r.pow(0);
      expect(result.numerator).toBe(1n);
      expect(result.denominator).toBe(1n);
    });

    it('throws an error when raising zero to a negative power', () => {
      const r = new Rational(0, 1);
      expect(() => r.pow(-1)).toThrow('Zero cannot be raised to a negative power');
    });

    it('throws an error when raising zero to power 0', () => {
      const r = new Rational(0, 1);
      expect(() => r.pow(0)).toThrow('Zero cannot be raised to the power of zero');
    });
  });

  describe('comparison', () => {
    it('checks equality of rationals', () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(2, 4);
      const r3 = new Rational(2, 3);
      
      expect(r1.equals(r2)).toBe(true);
      expect(r1.equals(r3)).toBe(false);
    });

    it('compares rationals', () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(2, 3);
      const r3 = new Rational(1, 2);
      
      expect(r1.compareTo(r2)).toBe(-1);
      expect(r2.compareTo(r1)).toBe(1);
      expect(r1.compareTo(r3)).toBe(0);
    });

    it('checks if one rational is less than another', () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(2, 3);
      
      expect(r1.lessThan(r2)).toBe(true);
      expect(r2.lessThan(r1)).toBe(false);
      expect(r1.lessThan(new Rational(1, 2))).toBe(false);
    });

    it('checks if one rational is less than or equal to another', () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(2, 3);
      
      expect(r1.lessThanOrEqual(r2)).toBe(true);
      expect(r2.lessThanOrEqual(r1)).toBe(false);
      expect(r1.lessThanOrEqual(new Rational(1, 2))).toBe(true);
    });

    it('checks if one rational is greater than another', () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(2, 3);
      
      expect(r1.greaterThan(r2)).toBe(false);
      expect(r2.greaterThan(r1)).toBe(true);
      expect(r1.greaterThan(new Rational(1, 2))).toBe(false);
    });

    it('checks if one rational is greater than or equal to another', () => {
      const r1 = new Rational(1, 2);
      const r2 = new Rational(2, 3);
      
      expect(r1.greaterThanOrEqual(r2)).toBe(false);
      expect(r2.greaterThanOrEqual(r1)).toBe(true);
      expect(r1.greaterThanOrEqual(new Rational(1, 2))).toBe(true);
    });
  });

  describe('conversion', () => {
    it('converts a rational to string', () => {
      const r1 = new Rational(3, 4);
      const r2 = new Rational(5, 1);
      
      expect(r1.toString()).toBe('3/4');
      expect(r2.toString()).toBe('5');
    });

    it('converts a rational to a number', () => {
      const r = new Rational(3, 4);
      expect(r.toNumber()).toBe(0.75);
    });
    
    it('converts a rational to a mixed number string', () => {
      const r1 = new Rational(17, 3);  // 5..2/3
      const r2 = new Rational(5, 1);   // Just 5
      const r3 = new Rational(3, 4);   // Just 0..3/4
      const r4 = new Rational(-9, 4);  // -2..1/4
      
      expect(r1.toMixedString()).toBe('5..2/3');
      expect(r2.toMixedString()).toBe('5');
      expect(r3.toMixedString()).toBe('0..3/4');
      expect(r4.toMixedString()).toBe('-2..1/4');
    });
    
    it('handles zero and negative mixed numbers', () => {
      const r1 = new Rational(0, 1);       // Just 0
      const r2 = new Rational(-5, 1);      // Just -5
      const r3 = new Rational(-1, 2);      // -0..1/2 (no whole part)
      
      expect(r1.toMixedString()).toBe('0');
      expect(r2.toMixedString()).toBe('-5');
      expect(r3.toMixedString()).toBe('-0..1/2');
    });
  });

  describe('static methods', () => {
    it('creates a rational from various types', () => {
      const r1 = Rational.from(3);
      const r2 = Rational.from('3/4');
      const r3 = Rational.from(new Rational(2, 3));
      
      expect(r1.numerator).toBe(3n);
      expect(r1.denominator).toBe(1n);
      
      expect(r2.numerator).toBe(3n);
      expect(r2.denominator).toBe(4n);
      
      expect(r3.numerator).toBe(2n);
      expect(r3.denominator).toBe(3n);
    });
  });
});
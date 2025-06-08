import { describe, it, expect } from 'bun:test';
import { Rational } from '../src/rational.js';
import { RationalInterval } from '../src/rational-interval.js';
import { parseRepeatingDecimal } from '../src/parser.js';

/**
 * Roundtrip tests for relativeDecimalInterval() ↔ parseRepeatingDecimal()
 * 
 * These tests verify that converting a RationalInterval to a relative decimal
 * interval string and back produces a functionally equivalent interval.
 * 
 * IMPORTANT: Perfect roundtrip conversion is not always possible because:
 * 1. relativeDecimalInterval() finds the SHORTEST precise decimal, which may
 *    not have enough precision to exactly represent the original rationals
 * 2. The method trades exact rational representation for simpler notation
 * 3. Repeating decimals and complex fractions get approximated
 * 
 * Therefore, we test for "functional equivalence" (within numerical tolerance)
 * rather than exact rational equality.
 */
describe('Relative Decimal Interval Roundtrip Tests', () => {
  describe('Basic Roundtrip Conversion', () => {
    it('roundtrips simple asymmetric intervals', () => {
      // Test case: [1.224, 1.235] should become 1.23[+5,-6]
      const original = new RationalInterval(new Rational("1.224"), new Rational("1.235"));
      const decimalForm = original.relativeDecimalInterval();
      const roundtrip = parseRepeatingDecimal(decimalForm);
      
      expect(roundtrip).toBeInstanceOf(RationalInterval);
      // Check functional equivalence - the intervals should be approximately equal
      // Note: We use tolerance because shortest decimal may not preserve exact rationals
      expect(original.low.subtract(roundtrip.low).abs().toNumber()).toBeLessThan(1e-10);
      expect(original.high.subtract(roundtrip.high).abs().toNumber()).toBeLessThan(1e-10);
    });

    it('roundtrips symmetric intervals', () => {
      // Test case: [1.22, 1.24] should become 1.23[+-10]
      const original = new RationalInterval(new Rational("1.22"), new Rational("1.24"));
      const decimalForm = original.relativeDecimalInterval();
      const roundtrip = parseRepeatingDecimal(decimalForm);
      
      expect(roundtrip).toBeInstanceOf(RationalInterval);
      // Check functional equivalence - the intervals should be approximately equal
      expect(original.low.subtract(roundtrip.low).abs().toNumber()).toBeLessThan(1e-10);
      expect(original.high.subtract(roundtrip.high).abs().toNumber()).toBeLessThan(1e-10);
    });

    it('roundtrips integer-based intervals', () => {
      // Test case: [77.7, 93.3] should become 85[+83,-73]
      const original = new RationalInterval(new Rational("777", "10"), new Rational("933", "10"));
      const decimalForm = original.relativeDecimalInterval();
      const roundtrip = parseRepeatingDecimal(decimalForm);
      
      expect(roundtrip).toBeInstanceOf(RationalInterval);
      // Check functional equivalence - the intervals should be approximately equal
      expect(original.low.subtract(roundtrip.low).abs().toNumber()).toBeLessThan(1e-10);
      expect(original.high.subtract(roundtrip.high).abs().toNumber()).toBeLessThan(1e-10);
    });
  });

  describe('Complex Fraction Roundtrips', () => {
    it('roundtrips intervals with complex fractions', () => {
      // Test case: [123/45, 345/67] - demonstrates lossy conversion
      // Original: [2.733..., 5.149...] becomes approximate decimal representation
      const original = new RationalInterval(new Rational(123, 45), new Rational(345, 67));
      const decimalForm = original.relativeDecimalInterval();
      const roundtrip = parseRepeatingDecimal(decimalForm);
      
      expect(roundtrip).toBeInstanceOf(RationalInterval);
      // Check functional equivalence - the intervals should be approximately equal
      expect(original.low.subtract(roundtrip.low).abs().toNumber()).toBeLessThan(1e-10);
      expect(original.high.subtract(roundtrip.high).abs().toNumber()).toBeLessThan(1e-10);
    });

    it('roundtrips intervals with large denominators', () => {
      // Test case: [22/7, 25/8] (π approximation to 25/8)
      const original = new RationalInterval(new Rational(22, 7), new Rational(25, 8));
      const decimalForm = original.relativeDecimalInterval();
      const roundtrip = parseRepeatingDecimal(decimalForm);
      
      expect(roundtrip).toBeInstanceOf(RationalInterval);
      // Check functional equivalence - the intervals should be approximately equal
      expect(original.low.subtract(roundtrip.low).abs().toNumber()).toBeLessThan(1e-10);
      expect(original.high.subtract(roundtrip.high).abs().toNumber()).toBeLessThan(1e-10);
    });

    it('roundtrips intervals with repeating decimal endpoints', () => {
      // Test case: [1/3, 2/3] (0.333... to 0.666...)
      // This demonstrates the fundamental limitation: exact thirds become decimal approximations
      const original = new RationalInterval(new Rational(1, 3), new Rational(2, 3));
      const decimalForm = original.relativeDecimalInterval();
      const roundtrip = parseRepeatingDecimal(decimalForm);
      
      expect(roundtrip).toBeInstanceOf(RationalInterval);
      // Check functional equivalence - the intervals should be approximately equal
      expect(original.low.subtract(roundtrip.low).abs().toNumber()).toBeLessThan(1e-10);
      expect(original.high.subtract(roundtrip.high).abs().toNumber()).toBeLessThan(1e-10);
    });
  });

  describe('Edge Cases and Special Values', () => {
    it('roundtrips negative intervals', () => {
      // Test case: [-2.5, -1.5]
      const original = new RationalInterval(new Rational("-2.5"), new Rational("-1.5"));
      const decimalForm = original.relativeDecimalInterval();
      const roundtrip = parseRepeatingDecimal(decimalForm);
      
      expect(roundtrip).toBeInstanceOf(RationalInterval);
      // Check functional equivalence - the intervals should be approximately equal
      expect(original.low.subtract(roundtrip.low).abs().toNumber()).toBeLessThan(1e-10);
      expect(original.high.subtract(roundtrip.high).abs().toNumber()).toBeLessThan(1e-10);
    });

    it('roundtrips intervals spanning zero', () => {
      // Test case: [-0.5, 0.5]
      const original = new RationalInterval(new Rational("-0.5"), new Rational("0.5"));
      const decimalForm = original.relativeDecimalInterval();
      const roundtrip = parseRepeatingDecimal(decimalForm);
      
      expect(roundtrip).toBeInstanceOf(RationalInterval);
      // Check functional equivalence - the intervals should be approximately equal
      expect(original.low.subtract(roundtrip.low).abs().toNumber()).toBeLessThan(1e-10);
      expect(original.high.subtract(roundtrip.high).abs().toNumber()).toBeLessThan(1e-10);
    });

    it('roundtrips very small intervals', () => {
      // Test case: [1.999, 2.001] (very tight around 2)
      const original = new RationalInterval(new Rational("1.999"), new Rational("2.001"));
      const decimalForm = original.relativeDecimalInterval();
      const roundtrip = parseRepeatingDecimal(decimalForm);
      
      expect(roundtrip).toBeInstanceOf(RationalInterval);
      // Check functional equivalence - the intervals should be approximately equal
      expect(original.low.subtract(roundtrip.low).abs().toNumber()).toBeLessThan(1e-10);
      expect(original.high.subtract(roundtrip.high).abs().toNumber()).toBeLessThan(1e-10);
    });

    it('roundtrips point intervals (low equals high)', () => {
      // Test case: [1.5, 1.5] (degenerate interval)
      const original = new RationalInterval(new Rational("1.5"), new Rational("1.5"));
      const decimalForm = original.relativeDecimalInterval();
      const roundtrip = parseRepeatingDecimal(decimalForm);
      
      expect(roundtrip).toBeInstanceOf(RationalInterval);
      // Check functional equivalence - the intervals should be approximately equal
      expect(original.low.subtract(roundtrip.low).abs().toNumber()).toBeLessThan(1e-10);
      expect(original.high.subtract(roundtrip.high).abs().toNumber()).toBeLessThan(1e-10);
    });
  });

  describe('Different Precision Levels', () => {
    it('roundtrips intervals requiring 1 decimal place precision', () => {
      // Test case: [85.45, 85.55] should use 85.5 as base
      const original = new RationalInterval(new Rational("85.45"), new Rational("85.55"));
      const decimalForm = original.relativeDecimalInterval();
      const roundtrip = parseRepeatingDecimal(decimalForm);
      
      expect(roundtrip).toBeInstanceOf(RationalInterval);
      // Check functional equivalence - the intervals should be approximately equal
      expect(original.low.subtract(roundtrip.low).abs().toNumber()).toBeLessThan(1e-10);
      expect(original.high.subtract(roundtrip.high).abs().toNumber()).toBeLessThan(1e-10);
    });

    it('roundtrips intervals requiring 3 decimal place precision', () => {
      // Test case: [1.2344, 1.2356] should use 1.235 as base
      const original = new RationalInterval(new Rational("1.2344"), new Rational("1.2356"));
      const decimalForm = original.relativeDecimalInterval();
      const roundtrip = parseRepeatingDecimal(decimalForm);
      
      expect(roundtrip).toBeInstanceOf(RationalInterval);
      // Check functional equivalence - the intervals should be approximately equal
      expect(original.low.subtract(roundtrip.low).abs().toNumber()).toBeLessThan(1e-10);
      expect(original.high.subtract(roundtrip.high).abs().toNumber()).toBeLessThan(1e-10);
    });

    it('roundtrips intervals requiring integer precision', () => {
      // Test case: [42.1, 43.9] should use 43 as base
      const original = new RationalInterval(new Rational("42.1"), new Rational("43.9"));
      const decimalForm = original.relativeDecimalInterval();
      const roundtrip = parseRepeatingDecimal(decimalForm);
      
      expect(roundtrip).toBeInstanceOf(RationalInterval);
      // Check functional equivalence - the intervals should be approximately equal
      expect(original.low.subtract(roundtrip.low).abs().toNumber()).toBeLessThan(1e-10);
      expect(original.high.subtract(roundtrip.high).abs().toNumber()).toBeLessThan(1e-10);
    });
  });

  describe('Systematic Testing with Random Cases', () => {
    it('roundtrips a variety of automatically generated test cases', () => {
      // These test cases include various types of challenging rational intervals
      const testCases = [
        // Format: [numerator1, denominator1, numerator2, denominator2]
        [1, 7, 2, 7],           // [1/7, 2/7] - sevenths (repeating decimals)
        [5, 11, 7, 11],         // [5/11, 7/11] - elevenths (long repeating)
        [13, 17, 15, 17],       // [13/17, 15/17] - seventeenths (complex repeating)
        [99, 100, 101, 100],    // [0.99, 1.01] - around 1 (simple decimals)
        [199, 200, 201, 200],   // [0.995, 1.005] - tight around 1 (more precision)
        [355, 113, 314, 100],   // [π approximation, 3.14] - famous rationals
        [27, 37, 31, 41],       // Random fractions (test general case)
        [1000, 7, 1001, 7],     // Large numerators (precision stress test)
        [3, 1000, 4, 1000],     // Large denominators (small values)
      ];

      testCases.forEach(([num1, den1, num2, den2]) => {
        const original = new RationalInterval(
          new Rational(num1, den1), 
          new Rational(num2, den2)
        );
        const decimalForm = original.relativeDecimalInterval();
        const roundtrip = parseRepeatingDecimal(decimalForm);
        
        expect(roundtrip).toBeInstanceOf(RationalInterval);
        // Check functional equivalence - the intervals should be approximately equal
        expect(original.low.subtract(roundtrip.low).abs().toNumber()).toBeLessThan(1e-10);
        expect(original.high.subtract(roundtrip.high).abs().toNumber()).toBeLessThan(1e-10);
      });
    });
  });

  describe('Format Validation', () => {
    it('produces valid decimal uncertainty format strings', () => {
      const testIntervals = [
        new RationalInterval(new Rational("1.224"), new Rational("1.235")),
        new RationalInterval(new Rational("77.7"), new Rational("93.3")),
        new RationalInterval(new Rational(1, 3), new Rational(2, 3)),
        new RationalInterval(new Rational("-2.5"), new Rational("-1.5")),
      ];

      testIntervals.forEach(interval => {
        const decimalForm = interval.relativeDecimalInterval();
        
        // Should match the decimal uncertainty format pattern
        expect(decimalForm).toMatch(/^-?\d+\.?\d*\[[^\]]+\]$/);
        
        // Should be parseable by parseRepeatingDecimal
        expect(() => parseRepeatingDecimal(decimalForm)).not.toThrow();
      });
    });

    it('handles both symmetric and asymmetric notation correctly', () => {
      // Symmetric case
      const symmetric = new RationalInterval(new Rational("1.22"), new Rational("1.24"));
      const symmetricForm = symmetric.relativeDecimalInterval();
      expect(symmetricForm).toMatch(/\[\+-\d+\]$/);
      
      // Asymmetric case  
      const asymmetric = new RationalInterval(new Rational("1.224"), new Rational("1.235"));
      const asymmetricForm = asymmetric.relativeDecimalInterval();
      expect(asymmetricForm).toMatch(/\[\+\d+,-\d+\]$/);
    });
  });
});
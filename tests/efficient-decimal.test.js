import { describe, test, expect } from 'bun:test';
import { Integer, Rational } from '../index.js';

describe('Efficient Decimal Computation', () => {
  test('computeDecimalMetadata for simple fractions', () => {
    const oneThird = new Integer(1).divide(new Integer(3));
    const metadata = oneThird.computeDecimalMetadata();
    
    expect(metadata.isTerminating).toBe(false);
    expect(metadata.periodLength).toBe(1);
    expect(metadata.periodDigits).toBe('3');
    expect(metadata.initialSegment).toBe('');
  });

  test('computeDecimalMetadata for 1/7', () => {
    const oneSeventh = new Integer(1).divide(new Integer(7));
    const metadata = oneSeventh.computeDecimalMetadata();
    
    expect(metadata.isTerminating).toBe(false);
    expect(metadata.periodLength).toBe(6);
    expect(metadata.periodDigits).toBe('142857');
    expect(metadata.initialSegment).toBe('');
  });

  test('computeDecimalMetadata for terminating decimal', () => {
    const oneHalf = new Integer(1).divide(new Integer(2));
    const metadata = oneHalf.computeDecimalMetadata();
    
    expect(metadata.isTerminating).toBe(true);
    expect(metadata.periodLength).toBe(0);
    expect(metadata.periodDigits).toBe('');
    expect(metadata.initialSegment).toBe('5');
  });

  test('computeDecimalMetadata for mixed terminating decimal', () => {
    const oneEighth = new Integer(1).divide(new Integer(8));
    const metadata = oneEighth.computeDecimalMetadata();
    
    expect(metadata.isTerminating).toBe(true);
    expect(metadata.periodLength).toBe(0);
    expect(metadata.periodDigits).toBe('');
    expect(metadata.initialSegment).toBe('125');
  });

  test('toRepeatingDecimal uses new efficient method', () => {
    const oneThird = new Integer(1).divide(new Integer(3));
    const result = oneThird.toRepeatingDecimal();
    expect(result).toBe('0.#3');
  });

  test('toRepeatingDecimalWithPeriod uses new efficient method', () => {
    const oneSeventh = new Integer(1).divide(new Integer(7));
    const result = oneSeventh.toRepeatingDecimalWithPeriod();
    expect(result.decimal).toBe('0.#142857');
    expect(result.period).toBe(6);
  });

  test('handles large period lengths efficiently', () => {
    // Create a fraction that would have a very large period
    const largeNum = new Integer(1);
    const largeDen = new Integer(97); // Prime number will create long period
    const fraction = largeNum.divide(largeDen);
    
    const start = Date.now();
    const metadata = fraction.computeDecimalMetadata();
    const elapsed = Date.now() - start;
    
    // Should complete quickly (under 100ms)
    expect(elapsed).toBeLessThan(100);
    expect(metadata.periodLength).toBeGreaterThan(0);
    expect(metadata.periodLength).toBeLessThan(10000000); // Under our limit
  });

  test('handles period > 10^7 gracefully', () => {
    // Mock a case where period would exceed limit by creating a very large denominator
    // This is a conceptual test - in practice, we'd need a specific fraction
    const veryLargeResult = new Rational(1n, 999999999999999989n); // Large prime
    
    const start = Date.now();
    const metadata = veryLargeResult.computeDecimalMetadata();
    const elapsed = Date.now() - start;
    
    // Should complete quickly even for very large denominators
    expect(elapsed).toBeLessThan(1000);
    
    // Should either compute the period or recognize it's too large
    expect(typeof metadata.periodLength).toBe('number');
  });

  test('100!!/99!! should not hang', () => {
    const start = Date.now();
    const n100 = new Integer(100).doubleFactorial();
    const n99 = new Integer(99).doubleFactorial();
    const result = n100.divide(n99);
    
    // This should complete quickly now
    const metadata = result.computeDecimalMetadata();
    const elapsed = Date.now() - start;
    
    // Should complete in reasonable time (under 5 seconds)
    expect(elapsed).toBeLessThan(5000);
    
    // Period is likely to be very large, so should be -1
    expect(metadata.periodLength).toBe(-1);
  });

  test('extractPeriodSegment works correctly', () => {
    const oneSeventh = new Integer(1).divide(new Integer(7));
    const metadata = oneSeventh.computeDecimalMetadata();
    
    // Extract first 3 digits of period
    const segment = oneSeventh.extractPeriodSegment(metadata.initialSegment, metadata.periodLength, 3);
    expect(segment).toBe('142');
    
    // Extract more digits than period length
    const fullSegment = oneSeventh.extractPeriodSegment(metadata.initialSegment, metadata.periodLength, 10);
    expect(fullSegment).toBe('142857');
  });
});
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

  test('reports a known period longer than the digit prefix', () => {
    const fraction = new Rational(1, 97);
    const metadata = fraction.computeDecimalMetadata();

    expect(metadata.periodLength).toBe(96);
    expect(metadata.periodDigits).toHaveLength(Rational.DEFAULT_PERIOD_DIGITS);
    expect(metadata.periodDigits).toStartWith('010309278350515463917525773195');
  });

  test('handles period > 10^7 gracefully', () => {
    const veryLargeResult = new Rational(1n, 999999999999999989n); // Large prime
    const metadata = veryLargeResult.computeDecimalMetadata();

    expect(metadata.periodLength).toBe(-1);
    expect(metadata.periodDigits).toHaveLength(Rational.DEFAULT_PERIOD_DIGITS);
    expect(veryLargeResult.toRepeatingDecimal(30, 'null')).toBeNull();
  });

  test('100!!/99!! should not hang', () => {
    const n100 = new Integer(100).doubleFactorial();
    const n99 = new Integer(99).doubleFactorial();
    const result = n100.divide(n99);
    const metadata = result.computeDecimalMetadata();

    expect(metadata.periodLength).toBe(-1);
    expect(metadata.periodDigits).toHaveLength(Rational.DEFAULT_PERIOD_DIGITS);
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

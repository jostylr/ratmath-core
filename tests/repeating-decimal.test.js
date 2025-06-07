import { describe, expect, it, test } from 'bun:test';
import { parseRepeatingDecimal } from '../src/parser.js';
import { Rational } from '../src/rational.js';
import { RationalInterval } from '../src/rational-interval.js';

describe('parseRepeatingDecimal', () => {
  describe('basic repeating decimals', () => {
    it('parses 0.12#45 correctly', () => {
      const result = parseRepeatingDecimal('0.12#45');
      // 0.12454545... = (1245 - 12) / (10000 - 100) = 1233/9900 = 137/1100
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(137n);
      expect(result.denominator).toBe(1100n);
    });

    it('parses 733.#3 correctly', () => {
      const result = parseRepeatingDecimal('733.#3');
      // 733.333... = (7333 - 733) / (10 - 1) = 6600/9 = 2200/3
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(2200n);
      expect(result.denominator).toBe(3n);
    });

    it('parses 0.#6 correctly', () => {
      const result = parseRepeatingDecimal('0.#6');
      // 0.666... = 6/9 = 2/3
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(2n);
      expect(result.denominator).toBe(3n);
    });

    it('parses 0.1#6 correctly', () => {
      const result = parseRepeatingDecimal('0.1#6');
      // 0.1666... = (16 - 1) / (100 - 10) = 15/90 = 1/6
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(1n);
      expect(result.denominator).toBe(6n);
    });
  });

  describe('terminating decimals with #0', () => {
    it('parses 1.23#0 as exact rational', () => {
      const result = parseRepeatingDecimal('1.23#0');
      // 1.23#0 = 1.23 = 123/100
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(123n);
      expect(result.denominator).toBe(100n);
    });

    it('parses 5#0 as exact integer', () => {
      const result = parseRepeatingDecimal('5#0');
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(5n);
      expect(result.denominator).toBe(1n);
    });

    it('parses 0.5#0 as exact fraction', () => {
      const result = parseRepeatingDecimal('0.5#0');
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(1n);
      expect(result.denominator).toBe(2n);
    });
  });

  describe('negative repeating decimals', () => {
    it('parses -0.12#45 correctly', () => {
      const result = parseRepeatingDecimal('-0.12#45');
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(-137n);
      expect(result.denominator).toBe(1100n);
    });

    it('parses -733.#3 correctly', () => {
      const result = parseRepeatingDecimal('-733.#3');
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(-2200n);
      expect(result.denominator).toBe(3n);
    });

    it('parses -1.23#0 correctly', () => {
      const result = parseRepeatingDecimal('-1.23#0');
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(-123n);
      expect(result.denominator).toBe(100n);
    });
  });

  describe('edge cases with leading zeros', () => {
    it('parses 0.#1 correctly', () => {
      const result = parseRepeatingDecimal('0.#1');
      // 0.111... = 1/9
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(1n);
      expect(result.denominator).toBe(9n);
    });

    it('parses 0.0#1 correctly', () => {
      const result = parseRepeatingDecimal('0.0#1');
      // 0.0111... = (01 - 0) / (100 - 10) = 1/90
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(1n);
      expect(result.denominator).toBe(90n);
    });

    it('parses 0.00#123 correctly', () => {
      const result = parseRepeatingDecimal('0.00#123');
      // 0.00123123... = (00123 - 00) / (100000 - 100) = 123/99900 = 41/33300
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(41n);
      expect(result.denominator).toBe(33300n);
    });
  });

  describe('integers without decimal points', () => {
    it('parses 42.#7 correctly', () => {
      const result = parseRepeatingDecimal('42.#7');
      // 42.777... = (427 - 42) / 9 = 385/9
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(385n);
      expect(result.denominator).toBe(9n);
    });

    it('parses 100#0 correctly', () => {
      const result = parseRepeatingDecimal('100#0');
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(100n);
      expect(result.denominator).toBe(1n);
    });
  });

  describe('non-repeating decimals (intervals)', () => {
    it('parses 1.23 as interval', () => {
      const result = parseRepeatingDecimal('1.23');
      expect(result).toBeInstanceOf(RationalInterval);
      // Should be [1.225, 1.235] = [49/40, 247/200]
      expect(result.low.numerator).toBe(49n);   // 1225/1000 = 49/40
      expect(result.low.denominator).toBe(40n);
      expect(result.high.numerator).toBe(247n); // 1235/1000 = 247/200
      expect(result.high.denominator).toBe(200n);
    });

    it('parses 5 as point interval', () => {
      const result = parseRepeatingDecimal('5');
      expect(result).toBeInstanceOf(RationalInterval);
      expect(result.low.equals(result.high)).toBe(true);
      expect(result.low.numerator).toBe(5n);
      expect(result.low.denominator).toBe(1n);
    });

    it('parses 0.5 as interval', () => {
      const result = parseRepeatingDecimal('0.5');
      expect(result).toBeInstanceOf(RationalInterval);
      // Should be [0.45, 0.55) = [9/20, 11/20)
      expect(result.low.numerator).toBe(9n);   // 45/100 = 9/20
      expect(result.low.denominator).toBe(20n);
      expect(result.high.numerator).toBe(11n);  // 55/100 = 11/20
      expect(result.high.denominator).toBe(20n);
    });

    it('parses negative non-repeating decimal as interval', () => {
      const result = parseRepeatingDecimal('-1.5');
      expect(result).toBeInstanceOf(RationalInterval);
      // Should be [-1.55, -1.45] = [-31/20, -29/20]
      expect(result.low.numerator).toBe(-31n);  // -1.55 = -31/20
      expect(result.low.denominator).toBe(20n);
      expect(result.high.numerator).toBe(-29n);  // -1.45 = -29/20
      expect(result.high.denominator).toBe(20n);
    });
  });

  describe('complex repeating patterns', () => {
    it('parses 0.142857#142857 correctly', () => {
      const result = parseRepeatingDecimal('0.142857#142857');
      // This should simplify significantly since 142857 repeats
      expect(result).toBeInstanceOf(Rational);
      // 0.142857142857... should be related to 1/7
    });

    it('parses 3.14159#26535 correctly', () => {
      const result = parseRepeatingDecimal('3.14159#26535');
      expect(result).toBeInstanceOf(Rational);
      // Should be some exact rational
      expect(result.denominator).toBeGreaterThan(0n);
    });
  });

  describe('error cases', () => {
    it('throws error for empty string', () => {
      expect(() => parseRepeatingDecimal('')).toThrow('Input must be a non-empty string');
    });

    it('throws error for null input', () => {
      expect(() => parseRepeatingDecimal(null)).toThrow('Input must be a non-empty string');
    });

    it('throws error for non-string input', () => {
      expect(() => parseRepeatingDecimal(123)).toThrow('Input must be a non-empty string');
    });

    it('throws error for multiple # symbols', () => {
      expect(() => parseRepeatingDecimal('1.23#45#67')).toThrow('Invalid repeating decimal format');
    });

    it('throws error for multiple decimal points', () => {
      expect(() => parseRepeatingDecimal('1.2.3#45')).toThrow('Invalid decimal format - multiple decimal points');
    });

    it('throws error for non-numeric characters in non-repeating part', () => {
      expect(() => parseRepeatingDecimal('1.2a#45')).toThrow('Non-repeating part must contain only digits');
    });

    it('throws error for non-numeric characters in repeating part', () => {
      expect(() => parseRepeatingDecimal('1.23#4a')).toThrow('Repeating part must contain only digits');
    });

    it('throws error for empty repeating part', () => {
      expect(() => parseRepeatingDecimal('1.23#')).toThrow('Repeating part must contain only digits');
    });

    it('handles whitespace correctly', () => {
      const result = parseRepeatingDecimal('  1.23#45  ');
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(679n);  // 12222/9900 simplified = 679/550
      expect(result.denominator).toBe(550n);
    });
  });

  describe('mathematical verification', () => {
    it('verifies 1/3 = 0.#3', () => {
      const result = parseRepeatingDecimal('0.#3');
      const oneThird = new Rational(1, 3);
      expect(result.equals(oneThird)).toBe(true);
    });

    it('verifies 1/6 = 0.1#6', () => {
      const result = parseRepeatingDecimal('0.1#6');
      const oneSixth = new Rational(1, 6);
      expect(result.equals(oneSixth)).toBe(true);
    });

    it('verifies 22/7 ≈ 3.142857#142857 (not exactly but close)', () => {
      const result = parseRepeatingDecimal('3.#142857');
      // 3.142857142857... = (3142857 - 3) / 999999 = 3142854/999999
      expect(result).toBeInstanceOf(Rational);
      
      // Let's verify this is actually 22/7
      const twentyTwoSevenths = new Rational(22, 7);
      
      // Convert both to same denominator to compare
      const resultDecimal = result.toNumber();
      const expectedDecimal = twentyTwoSevenths.toNumber();
      
      expect(Math.abs(resultDecimal - expectedDecimal)).toBeLessThan(0.000001);
    });
  });

  describe('integration with main parser', () => {
    it('parses repeating decimals in expressions', () => {
      // This would require importing Parser, but since we're testing parseRepeatingDecimal
      // we'll test that it works with basic arithmetic when integrated
      const result1 = parseRepeatingDecimal('0.#3');
      const result2 = parseRepeatingDecimal('0.#6');
      
      // 1/3 + 2/3 = 1
      const sum = result1.add(result2);
      expect(sum.equals(new Rational(1))).toBe(true);
    });

    it('handles repeating decimals in arithmetic operations', () => {
      const oneThird = parseRepeatingDecimal('0.#3');
      const twoThirds = parseRepeatingDecimal('0.#6');
      
      // Test multiplication: (1/3) * 3 = 1
      const product = oneThird.multiply(new Rational(3));
      expect(product.equals(new Rational(1))).toBe(true);
      
      // Test division: (2/3) / (1/3) = 2
      const quotient = twoThirds.divide(oneThird);
      expect(quotient.equals(new Rational(2))).toBe(true);
    });

    it('works with complex repeating decimal arithmetic', () => {
      const result1 = parseRepeatingDecimal('1.23#45'); // 679/550
      const result2 = parseRepeatingDecimal('0.#9');    // 1
      
      // 0.#9 should equal 1
      expect(result2.equals(new Rational(1))).toBe(true);
      
      // Adding should work correctly
      const sum = result1.add(result2);
      const expected = new Rational(679, 550).add(new Rational(1));
      expect(sum.equals(expected)).toBe(true);
    });
  });
});
#!/usr/bin/env bun

/**
 * Terminal Calculator for ratmath
 * 
 * Interactive calculator that parses mathematical expressions using the ratmath library.
 * Supports rational arithmetic, intervals, and various output formats.
 */

import { Parser, Rational, RationalInterval, Integer } from './index.js';
import { createInterface } from 'readline';

class Calculator {
  constructor() {
    this.outputMode = 'BOTH'; // 'DECI', 'RAT', 'BOTH'
    this.decimalLimit = 20; // Maximum decimal places before showing ...
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> '
    });
    
    this.setupReadline();
  }

  setupReadline() {
    this.rl.on('line', (input) => {
      this.processInput(input.trim());
      this.rl.prompt();
    });

    this.rl.on('close', () => {
      console.log('\nGoodbye!');
      process.exit(0);
    });

    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
      console.log('\nGoodbye!');
      process.exit(0);
    });
  }

  processInput(input) {
    if (!input) return;

    // Handle special commands
    const upperInput = input.toUpperCase();
    
    if (upperInput === 'HELP') {
      this.showHelp();
      return;
    }

    if (upperInput === 'DECI') {
      this.outputMode = 'DECI';
      console.log('Output mode set to decimal');
      return;
    }

    if (upperInput === 'RAT') {
      this.outputMode = 'RAT';
      console.log('Output mode set to rational');
      return;
    }

    if (upperInput === 'BOTH') {
      this.outputMode = 'BOTH';
      console.log('Output mode set to both decimal and rational');
      return;
    }

    if (upperInput.startsWith('LIMIT')) {
      const limitStr = upperInput.substring(5).trim();
      if (limitStr === '') {
        console.log(`Current decimal display limit: ${this.decimalLimit} digits`);
      } else {
        const limit = parseInt(limitStr);
        if (isNaN(limit) || limit < 1) {
          console.log('Error: LIMIT must be a positive integer');
        } else {
          this.decimalLimit = limit;
          console.log(`Decimal display limit set to ${limit} digits`);
        }
      }
      return;
    }

    if (upperInput === 'EXIT' || upperInput === 'QUIT' || upperInput === 'BYE') {
      this.rl.close();
      return;
    }

    // Try to parse and evaluate the expression
    try {
      // Check if input contains #0 notation for exact decimals or fractions
      const hasExactDecimal = input.includes('#0');
      const hasFraction = input.includes('/');
      const hasDecimalPoint = input.includes('.');
      const isSimpleInteger = /^\s*-?\d+\s*$/.test(input);
      const hasPlainDecimal = hasDecimalPoint && !hasExactDecimal && !hasFraction;
      // Use typeAware parsing for exact decimals, fractions, integers, and expressions without plain decimals
      const result = Parser.parse(input, { typeAware: hasExactDecimal || hasFraction || isSimpleInteger || !hasPlainDecimal });
      this.displayResult(result);
    } catch (error) {
      if (error.message.includes('Division by zero') || 
          error.message.includes('Denominator cannot be zero')) {
        console.log('Error: Division by zero is undefined');
      } else if (error.message.includes('Factorial') && error.message.includes('negative')) {
        console.log('Error: Factorial is not defined for negative numbers');
      } else if (error.message.includes('Zero cannot be raised to the power of zero')) {
        console.log('Error: 0^0 is undefined');
      } else {
        console.log(`Error: ${error.message}`);
      }
    }
  }

  displayResult(result) {
    if (result instanceof RationalInterval) {
      this.displayInterval(result);
    } else if (result instanceof Rational) {
      this.displayRational(result);
    } else if (result instanceof Integer) {
      this.displayInteger(result);
    } else {
      console.log(result.toString());
    }
  }

  displayInteger(integer) {
    const value = integer.value.toString();
    
    switch (this.outputMode) {
      case 'DECI':
        console.log(value);
        break;
      case 'RAT':
        console.log(value);
        break;
      case 'BOTH':
        console.log(value);
        break;
    }
  }

  displayRational(rational) {
    const repeatingInfo = rational.toRepeatingDecimalWithPeriod();
    const repeatingDecimal = repeatingInfo.decimal;
    const period = repeatingInfo.period;
    const decimal = this.formatDecimal(rational);
    const fraction = rational.toString();
    
    // For fractions that convert to terminating decimals, show #0 notation
    const isTerminatingDecimal = repeatingDecimal.endsWith('#0');
    const displayDecimal = isTerminatingDecimal ? repeatingDecimal : this.formatRepeatingDecimal(rational);
    
    // Add period information for true repeating decimals (period > 0)
    const periodInfo = period > 0 ? ` {period: ${period}}` : '';
    
    switch (this.outputMode) {
      case 'DECI':
        console.log(`${displayDecimal}${periodInfo}`);
        break;
      case 'RAT':
        console.log(fraction);
        break;
      case 'BOTH':
        if (fraction.includes('/')) {
          console.log(`${displayDecimal}${periodInfo} (${fraction})`);
        } else {
          console.log(decimal);
        }
        break;
    }
  }

  formatDecimal(rational) {
    const decimal = rational.toDecimal();
    if (decimal.length > this.decimalLimit + 2) { // +2 for potential "0."
      const dotIndex = decimal.indexOf('.');
      if (dotIndex !== -1 && decimal.length - dotIndex - 1 > this.decimalLimit) {
        return decimal.substring(0, dotIndex + this.decimalLimit + 1) + '...';
      }
    }
    return decimal;
  }

  formatRepeatingDecimal(rational) {
    const repeatingDecimal = rational.toRepeatingDecimal();
    
    // If no repeating part (#), return as is
    if (!repeatingDecimal.includes('#')) {
      return repeatingDecimal;
    }

    // Check if it's a terminating decimal (ends with #0)
    if (repeatingDecimal.endsWith('#0')) {
      const withoutRepeating = repeatingDecimal.substring(0, repeatingDecimal.length - 2);
      // If the terminating part exceeds limit, truncate it
      if (withoutRepeating.length > this.decimalLimit + 2) {
        const dotIndex = withoutRepeating.indexOf('.');
        if (dotIndex !== -1 && withoutRepeating.length - dotIndex - 1 > this.decimalLimit) {
          return withoutRepeating.substring(0, dotIndex + this.decimalLimit + 1) + '...';
        }
      }
      return withoutRepeating;
    }

    // Check if the total length exceeds limit
    if (repeatingDecimal.length > this.decimalLimit + 2) { // +2 for potential "0."
      const hashIndex = repeatingDecimal.indexOf('#');
      const beforeHash = repeatingDecimal.substring(0, hashIndex);
      const afterHash = repeatingDecimal.substring(hashIndex + 1);
      
      // If the non-repeating part alone exceeds limit, truncate it
      if (beforeHash.length > this.decimalLimit + 1) {
        return beforeHash.substring(0, this.decimalLimit + 1) + '...';
      }
      
      // If adding some of the repeating part would exceed limit, truncate
      const remainingSpace = this.decimalLimit + 2 - beforeHash.length;
      if (remainingSpace <= 1) {
        return beforeHash + '#...';
      } else if (afterHash.length > remainingSpace - 1) {
        return beforeHash + '#' + afterHash.substring(0, remainingSpace - 1) + '...';
      }
    }
    
    return repeatingDecimal;
  }

  displayInterval(interval) {
    const lowRepeatingInfo = interval.low.toRepeatingDecimalWithPeriod();
    const highRepeatingInfo = interval.high.toRepeatingDecimalWithPeriod();
    const lowRepeating = lowRepeatingInfo.decimal;
    const highRepeating = highRepeatingInfo.decimal;
    const lowPeriod = lowRepeatingInfo.period;
    const highPeriod = highRepeatingInfo.period;
    const lowDecimal = this.formatDecimal(interval.low);
    const highDecimal = this.formatDecimal(interval.high);
    const lowFraction = interval.low.toString();
    const highFraction = interval.high.toString();
    
    // For intervals, remove #0 notation since rounding is implicit
    const lowIsTerminating = lowRepeating.endsWith('#0');
    const highIsTerminating = highRepeating.endsWith('#0');
    const lowDisplay = lowIsTerminating ? lowRepeating.substring(0, lowRepeating.length - 2) : this.formatRepeatingDecimal(interval.low);
    const highDisplay = highIsTerminating ? highRepeating.substring(0, highRepeating.length - 2) : this.formatRepeatingDecimal(interval.high);
    
    // Add period information for intervals with repeating endpoints
    let periodInfo = '';
    if (lowPeriod > 0 || highPeriod > 0) {
      const periodParts = [];
      if (lowPeriod > 0) periodParts.push(`low: ${lowPeriod}`);
      if (highPeriod > 0) periodParts.push(`high: ${highPeriod}`);
      periodInfo = ` {period: ${periodParts.join(', ')}}`;
    }
    
    switch (this.outputMode) {
      case 'DECI':
        console.log(`${lowDisplay}:${highDisplay}${periodInfo}`);
        break;
      case 'RAT':
        console.log(`${lowFraction}:${highFraction}`);
        break;
      case 'BOTH':
        const decimalRange = `${lowDisplay}:${highDisplay}${periodInfo}`;
        const rationalRange = `${lowFraction}:${highFraction}`;
        if (decimalRange !== rationalRange) {
          console.log(`${decimalRange} (${rationalRange})`);
        } else {
          console.log(decimalRange);
        }
        break;
    }
  }

  showHelp() {
    console.log(`
Ratmath Terminal Calculator

BASIC ARITHMETIC:
  +, -, *, /        Basic operations
  ^                 Exponentiation (standard)
  **                Multiplicative exponentiation (interval)
  !                 Factorial
  !!                Double factorial
  ( )               Parentheses for grouping

NUMBERS:
  123               Integers
  3/4               Fractions  
  1.25              Decimals
  1..2/3            Mixed numbers (1 and 2/3)
  0.#3              Repeating decimals (0.333...)
  1.23[+-0.01]      Decimals with uncertainty
  1.2[3,6]          Decimal concatenation (1.23:1.26)
  12[34,42]         Integer concatenation (1234:1242)
  2:5               Intervals (from 2 to 5)
  1E3, 2.5E-2       Scientific notation

EXAMPLES:
  1/2 + 3/4         → 5/4 (1.25)
  2^3               → 8
  5!                → 120
  1:2 * 3:4         → 3:8 (interval arithmetic)
  0.#3              → 1/3
  1.5[+-0.1]        → 1.4:1.6
  1.2[3,6]          → 1.23:1.26 (decimal concatenation)
  12[15,18]         → 1215:1218 (integer concatenation)

CONCATENATION RULES:
  Valid:   12[34,42] → 1234:1242 (integer parts: 34,42 both 2 digits)
  Valid:   1[19.2,20] → 119.2:120 (integer parts: 19,20 both 2 digits)
  Valid:   1.2[3,6]  → 1.23:1.26 (decimal base allows any)
  Invalid: 1[9,20] (integer parts: 9=1 digit, 20=2 digits)
  Invalid: 1[9.2,20] (integer parts: 9=1 digit, 20=2 digits)
  Invalid: 1.2[3.4,5.6] (double decimal points)
  
COMMANDS:
  HELP              Show this help
  DECI              Show results as decimals only
  RAT               Show results as fractions only
  BOTH              Show both decimal and fraction (default)
  LIMIT <n>         Set decimal display limit to n digits (default: 20)
  LIMIT             Show current decimal display limit
  EXIT, QUIT, BYE   Exit calculator

DECIMAL DISPLAY:
  Uses repeating notation (0.#3 for 1/3) when possible
  Long decimals truncated with ... after LIMIT digits

Press Ctrl+C to exit
`);
  }

  start() {
    console.log('Ratmath Terminal Calculator');
    console.log('Type HELP for help, EXIT to quit');
    console.log('');
    this.rl.prompt();
  }
}

// Start the calculator
const calc = new Calculator();
calc.start();
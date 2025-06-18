#!/usr/bin/env bun

/**
 * Terminal Calculator for ratmath
 *
 * Interactive calculator that parses mathematical expressions using the ratmath library.
 * Supports rational arithmetic, intervals, and various output formats.
 */

import { Parser, Rational, RationalInterval, Integer } from "./index.js";
import { VariableManager } from "./src/var.js";
import { createInterface } from "readline";

class Calculator {
  constructor() {
    this.outputMode = "BOTH"; // 'DECI', 'RAT', 'BOTH', 'SCI'
    this.decimalLimit = 20; // Maximum decimal places before showing ...
    this.mixedDisplay = true; // Whether to show fractions as mixed numbers by default
    this.variableManager = new VariableManager(); // Variable and function management
    this.shouldInterrupt = false; // Flag for computation interruption
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "> ",
    });

    this.setupReadline();
    this.setupInterruptHandling();
  }

  setupReadline() {
    this.rl.on("line", (input) => {
      this.processInput(input.trim());
      this.rl.prompt();
    });

    this.rl.on("close", () => {
      console.log("\nGoodbye!");
      process.exit(0);
    });
  }

  setupInterruptHandling() {
    // Handle Ctrl+C gracefully
    process.on("SIGINT", () => {
      if (this.shouldInterrupt) {
        // Already interrupting, force exit
        console.log("\nForce exit");
        process.exit(0);
      } else {
        // Set interrupt flag for ongoing computation
        this.shouldInterrupt = true;
        console.log(
          "\nInterrupting computation... (Press Ctrl+C again to force exit)",
        );
      }
    });

    // Set up progress callback for variable manager
    this.variableManager.setProgressCallback(
      (keyword, variable, current, end, accumulator, iterationCount) => {
        if (this.shouldInterrupt) {
          return false; // Stop computation
        }

        // Show progress every 10 iterations
        if (iterationCount % 10 === 0) {
          const progress = accumulator
            ? `, current: ${this.formatResult(accumulator)}`
            : "";
          process.stdout.write(
            `\r${keyword}[${variable}]: ${variable}=${current}${progress}     `,
          );
        }

        return true; // Continue computation
      },
    );
  }

  processInput(input) {
    if (!input) return;

    // Reset interrupt flag for new computation
    this.shouldInterrupt = false;

    // Handle special commands
    const upperInput = input.toUpperCase();

    if (upperInput === "HELP") {
      this.showHelp();
      return;
    }

    if (upperInput === "DECI") {
      this.outputMode = "DECI";
      console.log("Output mode set to decimal");
      return;
    }

    if (upperInput === "RAT") {
      this.outputMode = "RAT";
      console.log("Output mode set to rational");
      return;
    }

    if (upperInput === "BOTH") {
      this.outputMode = "BOTH";
      console.log("Output mode set to both decimal and rational");
      return;
    }

    if (upperInput === "SCI") {
      this.outputMode = "SCI";
      console.log("Output mode set to scientific notation");
      return;
    }

    if (upperInput === "MIX") {
      this.mixedDisplay = !this.mixedDisplay;
      console.log(
        `Mixed number display ${this.mixedDisplay ? "enabled" : "disabled"}`,
      );
      return;
    }

    if (upperInput.startsWith("LIMIT")) {
      const limitStr = upperInput.substring(5).trim();
      if (limitStr === "") {
        console.log(
          `Current decimal display limit: ${this.decimalLimit} digits`,
        );
      } else {
        const limit = parseInt(limitStr);
        if (isNaN(limit) || limit < 1) {
          console.log("Error: LIMIT must be a positive integer");
        } else {
          this.decimalLimit = limit;
          console.log(`Decimal display limit set to ${limit} digits`);
        }
      }
      return;
    }

    if (upperInput === "VARS") {
      this.showVariables();
      return;
    }

    if (
      upperInput === "EXIT" ||
      upperInput === "QUIT" ||
      upperInput === "BYE"
    ) {
      this.rl.close();
      return;
    }

    // Try to process with variable manager first
    const varResult = this.variableManager.processInput(input);

    // Clear any progress line
    process.stdout.write("\r" + " ".repeat(80) + "\r");

    if (varResult.type === "error") {
      console.log(varResult.message);
    } else if (
      varResult.type === "assignment" ||
      varResult.type === "function"
    ) {
      console.log(varResult.message);
    } else {
      // Regular expression evaluation
      try {
        this.displayResult(varResult.result);
      } catch (error) {
        if (
          error.message.includes("Division by zero") ||
          error.message.includes("Denominator cannot be zero")
        ) {
          console.log("Error: Division by zero is undefined");
        } else if (
          error.message.includes("Factorial") &&
          error.message.includes("negative")
        ) {
          console.log("Error: Factorial is not defined for negative numbers");
        } else if (
          error.message.includes("Zero cannot be raised to the power of zero")
        ) {
          console.log("Error: 0^0 is undefined");
        } else {
          console.log(`Error: ${error.message}`);
        }
      }
    }
  }

  displayResult(result) {
    if (result && result.type === "sequence") {
      console.log(this.formatResult(result));
    } else if (result instanceof RationalInterval) {
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
    // Convert Integer to Rational for consistent formatting
    const rational = new Rational(integer.value, 1n);
    this.displayRational(rational);
  }

  displayRational(rational) {
    const repeatingInfo = rational.toRepeatingDecimalWithPeriod();
    const repeatingDecimal = repeatingInfo.decimal;
    const period = repeatingInfo.period;
    const decimal = this.formatDecimal(rational);
    const fraction = this.mixedDisplay
      ? rational.toMixedString()
      : rational.toString();

    // For fractions that convert to terminating decimals, show #0 notation
    const isTerminatingDecimal = repeatingDecimal.endsWith("#0");
    const displayDecimal = isTerminatingDecimal
      ? repeatingDecimal
      : this.formatRepeatingDecimal(rational);

    // Add period information for true repeating decimals (period > 0)
    const periodInfo =
      period === -1
        ? " [period > 10^7]"
        : period > 0
          ? ` {period: ${period}}`
          : "";

    switch (this.outputMode) {
      case "DECI":
        console.log(`${displayDecimal}${periodInfo}`);
        break;
      case "RAT":
        console.log(fraction);
        break;
      case "BOTH":
        if (fraction.includes("/") || fraction.includes("..")) {
          console.log(`${displayDecimal}${periodInfo} (${fraction})`);
        } else {
          console.log(decimal);
        }
        break;
      case "SCI":
        // Workaround: Create fresh rational to ensure we get the latest implementation
        let scientificNotation;
        if (typeof rational.toScientificNotation === "function") {
          const result = rational.toScientificNotation();
          if (result === "0" && rational.numerator !== 0n) {
            // If we get 0 but numerator is not 0, create fresh instance
            const freshRational = new Rational(
              rational.numerator,
              rational.denominator,
            );
            scientificNotation = freshRational.toScientificNotation();
          } else {
            scientificNotation = result;
          }
        } else {
          scientificNotation = this.toScientificNotation(rational);
        }
        console.log(`${scientificNotation} (${fraction})`);
        break;
    }
  }

  formatDecimal(rational) {
    const decimal = rational.toDecimal();
    if (decimal.length > this.decimalLimit + 2) {
      // +2 for potential "0."
      const dotIndex = decimal.indexOf(".");
      if (
        dotIndex !== -1 &&
        decimal.length - dotIndex - 1 > this.decimalLimit
      ) {
        return decimal.substring(0, dotIndex + this.decimalLimit + 1) + "...";
      }
    }
    return decimal;
  }

  formatRepeatingDecimal(rational) {
    const repeatingDecimal = rational.toRepeatingDecimal();

    // If no repeating part (#), return as is
    if (!repeatingDecimal.includes("#")) {
      return repeatingDecimal;
    }

    // Check if it's a terminating decimal (ends with #0)
    if (repeatingDecimal.endsWith("#0")) {
      const withoutRepeating = repeatingDecimal.substring(
        0,
        repeatingDecimal.length - 2,
      );
      // If the terminating part exceeds limit, truncate it
      if (withoutRepeating.length > this.decimalLimit + 2) {
        const dotIndex = withoutRepeating.indexOf(".");
        if (
          dotIndex !== -1 &&
          withoutRepeating.length - dotIndex - 1 > this.decimalLimit
        ) {
          return (
            withoutRepeating.substring(0, dotIndex + this.decimalLimit + 1) +
            "..."
          );
        }
      }
      return withoutRepeating;
    }

    // Check if the total length exceeds limit
    if (repeatingDecimal.length > this.decimalLimit + 2) {
      // +2 for potential "0."
      const hashIndex = repeatingDecimal.indexOf("#");
      const beforeHash = repeatingDecimal.substring(0, hashIndex);
      const afterHash = repeatingDecimal.substring(hashIndex + 1);

      // If the non-repeating part alone exceeds limit, truncate it
      if (beforeHash.length > this.decimalLimit + 1) {
        return beforeHash.substring(0, this.decimalLimit + 1) + "...";
      }

      // If adding some of the repeating part would exceed limit, truncate
      const remainingSpace = this.decimalLimit + 2 - beforeHash.length;
      if (remainingSpace <= 1) {
        return beforeHash + "#...";
      } else if (afterHash.length > remainingSpace - 1) {
        return (
          beforeHash + "#" + afterHash.substring(0, remainingSpace - 1) + "..."
        );
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
    const lowIsTerminating = lowRepeating.endsWith("#0");
    const highIsTerminating = highRepeating.endsWith("#0");
    const lowDisplay = lowIsTerminating
      ? lowRepeating.substring(0, lowRepeating.length - 2)
      : this.formatRepeatingDecimal(interval.low);
    const highDisplay = highIsTerminating
      ? highRepeating.substring(0, highRepeating.length - 2)
      : this.formatRepeatingDecimal(interval.high);

    // Add period information for intervals with repeating endpoints
    let periodInfo = "";
    if (lowPeriod !== 0 || highPeriod !== 0) {
      const periodParts = [];
      if (lowPeriod === -1) periodParts.push("low: > 10^7");
      else if (lowPeriod > 0) periodParts.push(`low: ${lowPeriod}`);
      if (highPeriod === -1) periodParts.push("high: > 10^7");
      else if (highPeriod > 0) periodParts.push(`high: ${highPeriod}`);
      if (periodParts.length > 0) {
        periodInfo = ` {period: ${periodParts.join(", ")}}`;
      }
    }

    switch (this.outputMode) {
      case "DECI":
        console.log(`${lowDisplay}:${highDisplay}${periodInfo}`);
        break;
      case "RAT":
        console.log(`${lowFraction}:${highFraction}`);
        break;
      case "BOTH":
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

VARIABLES & FUNCTIONS:
  x = 5             Assign value to single-letter variable
  P[x,y] = x^2 - y  Define function with parameters
  P(3,4)            Call function with arguments
  SUM[i](i^2,1,10)  Sum expression from i=1 to 10
  PROD[j](j,1,5)    Product expression from j=1 to 5
  SEQ[k](k^3,0,5,2) Sequence expression from k=0 to 5 step 2

COMMANDS:
  HELP              Show this help
  VARS              Show defined variables and functions
  DECI              Show results as decimals only
  RAT               Show results as fractions only
  BOTH              Show both decimal and fraction (default)
  SCI               Show results in scientific notation
  MIX               Toggle mixed number display (default: on)
  LIMIT <n>         Set decimal display limit to n digits (default: 20)
  LIMIT             Show current decimal display limit
  EXIT, QUIT, BYE   Exit calculator

DECIMAL DISPLAY:
  Uses repeating notation (0.#3 for 1/3) when possible
  Long decimals truncated with ... after LIMIT digits

Press Ctrl+C to exit
`);
  }

  showVariables() {
    const variables = this.variableManager.getVariables();
    const functions = this.variableManager.getFunctions();

    if (variables.size === 0 && functions.size === 0) {
      console.log("No variables or functions defined");
      return;
    }

    if (variables.size > 0) {
      console.log("Variables:");
      for (const [name, value] of variables) {
        console.log(`  ${name} = ${this.formatResult(value)}`);
      }
    }

    if (functions.size > 0) {
      if (variables.size > 0) console.log("");
      console.log("Functions:");
      for (const [name, func] of functions) {
        console.log(`  ${name}[${func.params.join(",")}] = ${func.expression}`);
      }
    }
  }

  /**
   * Converts a rational to scientific notation (fallback method)
   * @param {Rational} rational - The rational number to convert
   * @returns {string} Scientific notation string
   */
  toScientificNotation(rational) {
    // Check if it's zero
    if (rational.toString() === "0") {
      return "0";
    }

    // For very small numbers, we need more period digits to find the first non-zero
    const repeatingInfo = rational.toRepeatingDecimalWithPeriod();
    let decimal = repeatingInfo.decimal;
    const isNegative = decimal.startsWith("-");
    const prefix = isNegative ? "-" : "";

    if (isNegative) {
      decimal = decimal.substring(1); // Remove the negative sign
    }

    // Find the first non-zero digit and decimal point
    let firstNonZeroIndex = -1;
    let decimalPointIndex = decimal.indexOf(".");
    let hashIndex = decimal.indexOf("#");

    for (let i = 0; i < decimal.length; i++) {
      const char = decimal[i];
      if (char === "." || char === "#") {
        continue;
      }
      if (char >= "1" && char <= "9") {
        firstNonZeroIndex = i;
        break;
      }
    }

    // If no non-zero found in default representation, try to get decimal metadata
    if (firstNonZeroIndex === -1) {
      // Try using the decimal metadata to find first non-zero digit
      if (rational.computeDecimalMetadata) {
        const metadata = rational.computeDecimalMetadata(100); // Get more digits

        // Check if there's a non-zero in the initial segment rest
        if (
          metadata.initialSegmentRest &&
          metadata.initialSegmentRest.length > 0
        ) {
          const firstDigit = metadata.initialSegmentRest[0];
          const exponent = -(metadata.initialSegmentLeadingZeros + 1);
          return `${prefix}${firstDigit}E${exponent}`;
        }

        // Check if there's a non-zero in the period rest
        if (metadata.periodDigitsRest && metadata.periodDigitsRest.length > 0) {
          const firstDigit = metadata.periodDigitsRest[0];
          const totalLeadingZeros =
            metadata.initialSegmentLeadingZeros + metadata.leadingZerosInPeriod;
          const exponent = -(totalLeadingZeros + 1);
          return `${prefix}${firstDigit}E${exponent}`;
        }
      }

      return prefix + "0";
    }

    // Calculate the exponent: how many places to move decimal to get first digit
    let exponent;
    if (decimalPointIndex === -1 || firstNonZeroIndex < decimalPointIndex) {
      // Number >= 1: count digits after the first non-zero digit
      let digitsAfterFirst = 0;
      const endPos =
        decimalPointIndex === -1 ? decimal.length : decimalPointIndex;
      for (let i = firstNonZeroIndex + 1; i < endPos; i++) {
        if (decimal[i] >= "0" && decimal[i] <= "9") {
          digitsAfterFirst++;
        }
      }
      exponent = digitsAfterFirst;
    } else {
      // Number < 1: count positions after decimal point to first non-zero digit
      let positionsAfterDecimal = 0;
      for (let i = decimalPointIndex + 1; i < firstNonZeroIndex; i++) {
        if (decimal[i] >= "0" && decimal[i] <= "9") {
          positionsAfterDecimal++;
        }
      }
      exponent = -(positionsAfterDecimal + 1);
    }

    // Build the mantissa
    let mantissa = "";
    let afterFirstDigit = false;
    let needDecimalPoint = true;

    for (let i = firstNonZeroIndex; i < decimal.length; i++) {
      const char = decimal[i];

      if (char === ".") {
        continue;
      }

      if (char === "#") {
        if (!afterFirstDigit) {
          // # is the first character (shouldn't happen, but handle it)
          mantissa += "#";
        } else if (needDecimalPoint) {
          // Add decimal point before #
          mantissa += ".#";
          needDecimalPoint = false;
        } else {
          mantissa += "#";
        }
        continue;
      }

      if (char >= "0" && char <= "9") {
        if (!afterFirstDigit) {
          // First significant digit
          mantissa += char;
          afterFirstDigit = true;
        } else if (needDecimalPoint) {
          // Second digit - add decimal point first
          mantissa += "." + char;
          needDecimalPoint = false;
        } else {
          // Subsequent digits
          mantissa += char;
        }
      }
    }

    // Handle case where we need to adjust repeating pattern due to decimal shift
    if (hashIndex !== -1 && repeatingInfo.period > 0) {
      const nonRepeatingLength = hashIndex - decimalPointIndex - 1;

      // Check if the first non-zero digit is in the repeating part
      if (firstNonZeroIndex > hashIndex) {
        // First digit is in the repeating part, need to adjust the cycle
        const positionInCycle =
          (firstNonZeroIndex - hashIndex - 1) % repeatingInfo.period;

        // Get the full repeating cycle
        let fullRepeatingCycle = "";
        for (let i = hashIndex + 1; i < decimal.length; i++) {
          const char = decimal[i];
          if (char >= "0" && char <= "9") {
            fullRepeatingCycle += char;
          }
        }

        // Create the shifted repeating pattern starting from the next position
        let shiftedRepeating = "";
        if (fullRepeatingCycle.length > 0) {
          const periodLength = Math.min(
            repeatingInfo.period,
            fullRepeatingCycle.length,
          );
          const startPos = (positionInCycle + 1) % periodLength;

          // Rebuild the repeating cycle starting from the shifted position
          for (let i = 0; i < Math.min(periodLength, 10); i++) {
            const cycleIndex = (startPos + i) % periodLength;
            shiftedRepeating += fullRepeatingCycle[cycleIndex];
          }
        }

        const firstDigit = decimal[firstNonZeroIndex];
        mantissa = firstDigit + ".#" + shiftedRepeating;
      }
    }

    // Add exponent (always show E even for E0 to maintain exactness)
    const expStr = `E${exponent >= 0 ? "+" : ""}${exponent}`;
    return `${prefix}${mantissa}${expStr}`;
  }

  formatResult(result) {
    if (result && result.type === "sequence") {
      return this.variableManager.formatValue(result);
    } else if (result instanceof RationalInterval) {
      return this.formatInterval(result);
    } else if (result instanceof Rational) {
      return this.formatRational(result);
    } else if (result instanceof Integer) {
      // Convert Integer to Rational for consistent formatting
      const rational = new Rational(result.value, 1n);
      return this.formatRational(rational);
    } else {
      return result.toString();
    }
  }

  formatRational(rational) {
    const fraction = this.mixedDisplay
      ? rational.toMixedString()
      : rational.toString();

    switch (this.outputMode) {
      case "DECI":
        return this.formatRepeatingDecimal(rational);
      case "RAT":
        return fraction;
      case "BOTH":
        if (fraction.includes("/") || fraction.includes("..")) {
          const decimal = this.formatRepeatingDecimal(rational);
          return `${decimal} (${fraction})`;
        } else {
          return this.formatDecimal(rational);
        }
      case "SCI":
        // Workaround: Create fresh rational to ensure we get the latest implementation
        if (typeof rational.toScientificNotation === "function") {
          const result = rational.toScientificNotation();
          if (result === "0" && rational.numerator !== 0n) {
            // If we get 0 but numerator is not 0, create fresh instance
            const freshRational = new Rational(
              rational.numerator,
              rational.denominator,
            );
            return freshRational.toScientificNotation();
          } else {
            return result;
          }
        } else {
          return this.toScientificNotation(rational);
        }
      default:
        return fraction;
    }
  }

  formatInterval(interval) {
    const low = this.formatRational(interval.low);
    const high = this.formatRational(interval.high);
    return `${low}:${high}`;
  }

  start() {
    console.log("Ratmath Terminal Calculator");
    console.log("Type HELP for help, EXIT to quit");
    console.log("");
    this.rl.prompt();
  }
}

// Start the calculator
const calc = new Calculator();
calc.start();

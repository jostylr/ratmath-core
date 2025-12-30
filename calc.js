#!/usr/bin/env bun

/**
 * Terminal Calculator for ratmath
 *
 * Interactive calculator that parses mathematical expressions using the ratmath library.
 * Supports rational arithmetic, intervals, and various output formats.
 */

import { Parser, Rational, RationalInterval, Integer } from "./index.js";
import { BaseSystem } from "./src/base-system.js";
import { VariableManager } from "./src/var.js";
import { createInterface } from "readline";

class Calculator {
  constructor() {
    this.outputMode = "BOTH"; // 'DECI', 'RAT', 'BOTH', 'SCI', 'CF'
    this.decimalLimit = 20; // Maximum decimal places before showing ...
    this.mixedDisplay = true; // Whether to show fractions as mixed numbers by default
    this.sciPrecision = 10; // Scientific notation precision (significant digits)
    this.showPeriodInfo = false; // Whether to show period info in scientific notation
    this.variableManager = new VariableManager(); // Variable and function management
    this.shouldInterrupt = false; // Flag for computation interruption
    this.inputBase = BaseSystem.DECIMAL; // Base system for parsing input
    this.outputBases = [BaseSystem.DECIMAL]; // Array of base systems for displaying output
    this.customBases = new Map(); // Custom base definitions [n] = character_sequence
    this.variableManager.setCustomBases(this.customBases);
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

    // Check for base definition syntax: [n] = range
    const baseDefMatch = input.match(/^\[(\d+)\]\s*=\s*(.+)$/);
    if (baseDefMatch) {
      const baseNum = parseInt(baseDefMatch[1]);
      const range = baseDefMatch[2].trim();

      try {
        if (isNaN(baseNum) || baseNum < 2) {
          throw new Error("Base number must be an integer >= 2");
        }

        // Create validation BaseSystem to check the range
        const newBase = new BaseSystem(range, `Custom Base ${baseNum}`);

        if (newBase.base !== baseNum) {
          throw new Error(`Character sequence length (${newBase.base}) does not match declared base [${baseNum}]`);
        }

        this.customBases.set(baseNum, newBase);
        console.log(`Defined custom base [${baseNum}] with characters "${range}"`);
      } catch (error) {
        console.error(`Error defining base: ${error.message}`);
      }
      return;
    }

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

    if (upperInput === "CF") {
      this.outputMode = "CF";
      console.log("Output mode set to continued fraction");
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

    if (upperInput.startsWith("SCIPREC")) {
      const precStr = upperInput.substring(7).trim();
      if (precStr === "") {
        console.log(
          `Current scientific notation precision: ${this.sciPrecision} digits`,
        );
      } else {
        const precision = parseInt(precStr);
        if (isNaN(precision) || precision < 1) {
          console.log("Error: SCIPREC must be a positive integer");
        } else {
          this.sciPrecision = precision;
          console.log(
            `Scientific notation precision set to ${precision} digits`,
          );
        }
      }
      return;
    }

    if (upperInput === "SCIPERIOD") {
      this.showPeriodInfo = !this.showPeriodInfo;
      console.log(
        `Period info display ${this.showPeriodInfo ? "enabled" : "disabled"}`,
      );
      return;
    }

    // Handle BASE commands (but not BASES)
    if (upperInput.startsWith("BASE") && upperInput !== "BASES") {
      this.handleBaseCommand(upperInput);
      return;
    }

    // Handle BIN, HEX, OCT shortcuts
    if (upperInput === "BIN") {
      this.inputBase = BaseSystem.BINARY;
      this.outputBases = [BaseSystem.BINARY];
      this.variableManager.setInputBase(BaseSystem.BINARY);
      console.log("Base set to binary (base 2)");
      return;
    }

    if (upperInput === "HEX") {
      this.inputBase = BaseSystem.HEXADECIMAL;
      this.outputBases = [BaseSystem.HEXADECIMAL];
      this.variableManager.setInputBase(BaseSystem.HEXADECIMAL);
      console.log("Base set to hexadecimal (base 16)");
      return;
    }

    if (upperInput === "OCT") {
      this.inputBase = BaseSystem.OCTAL;
      this.outputBases = [BaseSystem.OCTAL];
      this.variableManager.setInputBase(BaseSystem.OCTAL);
      console.log("Base set to octal (base 8)");
      return;
    }

    if (upperInput === "DEC") {
      this.inputBase = BaseSystem.DECIMAL;
      this.outputBases = [BaseSystem.DECIMAL];
      this.variableManager.setInputBase(BaseSystem.DECIMAL);
      console.log("Base set to decimal (base 10)");
      return;
    }

    if (upperInput === "VARS") {
      this.showVariables();
      return;
    }

    if (upperInput === "BASES") {
      this.showBases();
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

    // Check for format commands after expressions (exclude standalone BASES command)
    const formatMatch = input.match(
      /^(.*?)\s+(BASE\s+\d+|BASE\s+[a-zA-Z0-9\-]+|BIN|HEX|OCT|DEC|DECI|RAT|BOTH|SCI|CF|MIX)$/i,
    );

    if (formatMatch && formatMatch[2].toUpperCase() !== "BASES") {
      const [, expression, formatCmd] = formatMatch;

      // Process the expression first
      const varResult = this.variableManager.processInput(expression);

      // Clear any progress line
      process.stdout.write("\r" + " ".repeat(80) + "\r");

      if (varResult.type === "error") {
        console.log(varResult.message);
        return;
      }

      // Display result in requested format
      if (varResult.type === "assignment" || varResult.type === "function") {
        console.log(varResult.message);
      } else {
        try {
          this.displayResultInFormat(varResult.result, formatCmd.trim());
        } catch (error) {
          this.handleError(error);
        }
      }
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
        this.handleError(error);
      }
    }
  }

  handleError(error) {
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

  // Legacy support - currentBase getter/setter for backward compatibility
  get currentBase() {
    return this.inputBase;
  }

  set currentBase(base) {
    this.inputBase = base;
    this.outputBases = [base];
    this.variableManager.setInputBase(base);
  }

  handleBaseCommand(command) {
    const parts = command.split(/\s+/);

    if (parts.length === 1) {
      // Just "BASE" - show current base configuration
      if (
        this.outputBases.length === 1 &&
        this.inputBase.equals(this.outputBases[0])
      ) {
        console.log(
          `Current base: ${this.inputBase.name} (base ${this.inputBase.base})`,
        );
      } else {
        console.log(
          `Input base: ${this.inputBase.name} (base ${this.inputBase.base})`,
        );
        console.log(
          `Output base${this.outputBases.length > 1 ? "s" : ""}: ${this.outputBases.map((b) => `${b.name} (base ${b.base})`).join(", ")}`,
        );
      }
      return;
    }

    const baseSpec = parts.slice(1).join(" ");

    // Check for input->output notation: BASE 3->10 or BASE 3->[10,5,3]
    if (baseSpec.includes("->")) {
      this.handleInputOutputBaseCommand(baseSpec);
      return;
    }

    // Legacy behavior: set both input and output to same base
    this.handleLegacyBaseCommand(baseSpec);
  }

  handleInputOutputBaseCommand(baseSpec) {
    const [inputSpec, outputSpec] = baseSpec.split("->", 2);

    if (!inputSpec.trim() || !outputSpec.trim()) {
      console.log(
        "Error: Invalid input->output format. Use BASE 3->10 or BASE 3->[10,5,3]",
      );
      return;
    }

    // Parse input base
    try {
      this.inputBase = this.parseBaseSpec(inputSpec.trim());
      this.variableManager.setInputBase(this.inputBase);
    } catch (error) {
      console.log(`Error parsing input base: ${error.message}`);
      return;
    }

    // Parse output base(s)
    try {
      const trimmedOutput = outputSpec.trim();
      if (trimmedOutput.startsWith("[") && trimmedOutput.endsWith("]")) {
        // Multiple output bases: [10,5,3]
        const baseSpecs = trimmedOutput
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim());
        if (baseSpecs.length === 0) {
          throw new Error("Empty output base list");
        }
        this.outputBases = baseSpecs.map((spec) => this.parseBaseSpec(spec));
      } else {
        // Single output base: 10
        this.outputBases = [this.parseBaseSpec(trimmedOutput)];
      }
    } catch (error) {
      console.log(`Error parsing output base(s): ${error.message}`);
      return;
    }

    // Success message
    const outputBaseNames = this.outputBases
      .map((b) => `${b.name} (base ${b.base})`)
      .join(", ");
    console.log(
      `Input base: ${this.inputBase.name} (base ${this.inputBase.base})`,
    );
    console.log(
      `Output base${this.outputBases.length > 1 ? "s" : ""}: ${outputBaseNames}`,
    );
  }

  handleLegacyBaseCommand(baseSpec) {
    try {
      const base = this.parseBaseSpec(baseSpec);
      this.inputBase = base;
      this.outputBases = [base];
      this.variableManager.setInputBase(base);
      console.log(`Base set to ${base.name} (base ${base.base})`);
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }

  parseBaseSpec(baseSpec) {
    // Check if it's a pure numeric base (no letters or dashes)
    const numericBase = parseInt(baseSpec);
    if (!isNaN(numericBase) && /^\d+$/.test(baseSpec.trim())) {
      if (this.customBases.has(numericBase)) {
        return this.customBases.get(numericBase);
      }

      if (numericBase < 2) {
        throw new Error("Base must be at least 2");
      }
      if (numericBase > 62) {
        throw new Error(
          "Numeric bases must be 62 or less. Use character sequence for larger bases.",
        );
      }
      return BaseSystem.fromBase(numericBase);
    }

    // Check if it's a character sequence (contains dashes or letters)
    if (baseSpec.includes("-") || /[a-zA-Z]/.test(baseSpec)) {
      return new BaseSystem(baseSpec, `Custom Base ${baseSpec}`);
    }

    throw new Error(
      "Invalid base specification. Use a number (2-62) or character sequence with dashes (e.g., '0-9a-f')",
    );
  }

  displayResultInFormat(result, formatCmd) {
    const upperFormat = formatCmd.toUpperCase();

    if (upperFormat === "MIX") {
      const oldMixed = this.mixedDisplay;
      this.mixedDisplay = !this.mixedDisplay;
      this.displayResult(result);
      this.mixedDisplay = oldMixed;
    } else if (upperFormat === "DECI") {
      const oldMode = this.outputMode;
      this.outputMode = "DECI";
      this.displayResult(result);
      this.outputMode = oldMode;
    } else if (upperFormat === "RAT") {
      const oldMode = this.outputMode;
      this.outputMode = "RAT";
      this.displayResult(result);
      this.outputMode = oldMode;
    } else if (upperFormat === "BOTH") {
      const oldMode = this.outputMode;
      this.outputMode = "BOTH";
      this.displayResult(result);
      this.outputMode = oldMode;
    } else if (upperFormat === "SCI") {
      const oldMode = this.outputMode;
      this.outputMode = "SCI";
      this.displayResult(result);
      this.outputMode = oldMode;
    } else if (upperFormat === "CF") {
      const oldMode = this.outputMode;
      this.outputMode = "CF";
      this.displayResult(result);
      this.outputMode = oldMode;
    } else if (upperFormat.startsWith("BASE")) {
      // Handle base format commands
      const baseSpec = upperFormat.substring(4).trim();
      const numericBase = parseInt(baseSpec);

      let targetBase;
      if (!isNaN(numericBase) && numericBase >= 2 && numericBase <= 62) {
        targetBase = BaseSystem.fromBase(numericBase);
      } else if (baseSpec.includes("-")) {
        targetBase = new BaseSystem(baseSpec);
      } else {
        console.log("Error: Invalid base specification for format");
        return;
      }

      this.displayResultInBase(result, targetBase);
    } else if (upperFormat === "BIN") {
      this.displayResultInBase(result, BaseSystem.BINARY);
    } else if (upperFormat === "HEX") {
      this.displayResultInBase(result, BaseSystem.HEXADECIMAL);
    } else if (upperFormat === "OCT") {
      this.displayResultInBase(result, BaseSystem.OCTAL);
    } else if (upperFormat === "DEC") {
      this.displayResultInBase(result, BaseSystem.DECIMAL);
    }
  }

  displayResultInBase(result, baseSystem) {
    if (result instanceof Integer) {
      const baseRepr = baseSystem.fromDecimal(result.value);
      console.log(`${baseRepr}[${baseSystem.base}]`);
    } else if (result instanceof Rational) {
      const baseRepr = result.toString(baseSystem);
      console.log(`${baseRepr}[${baseSystem.base}]`);
    } else {
      console.log("Base conversion not supported for this result type");
    }
  }

  showBases() {
    console.log("\nAvailable base systems:");
    console.log("Standard bases:");
    console.log("  Binary (BIN):       base 2");
    console.log("  Octal (OCT):        base 8");
    console.log("  Decimal (DEC):      base 10");
    console.log("  Hexadecimal (HEX):  base 16");
    console.log("  Base 36:            base 36");
    console.log("  Base 62:            base 62");
    console.log("\nBase commands:");
    console.log("  BASE                - Show current base");
    console.log("  BASE <n>            - Set base to n (2-62)");
    console.log(
      "  BASE <sequence>     - Set custom base using character sequence",
    );
    console.log(
      "  BASE <in>-><out>    - Set input base <in> and output base <out>",
    );
    console.log(
      "  BASE <in>->[<out1>,<out2>,...] - Set input base and multiple output bases",
    );
    console.log("  BIN, HEX, OCT, DEC  - Quick base shortcuts");
    console.log("  BASES               - Show this help");
    console.log("\nBase format commands (after expressions):");
    console.log("  <expr> BASE <n>     - Show result in base n");
    console.log("  <expr> BIN          - Show result in binary");
    console.log("  <expr> HEX          - Show result in hexadecimal");
    console.log("  <expr> OCT          - Show result in octal");
    console.log(
      `\nInput base: ${this.inputBase.name} (base ${this.inputBase.base})`,
    );
    console.log(
      `Output base${this.outputBases.length > 1 ? "s" : ""}: ${this.outputBases.map((b) => `${b.name} (base ${b.base})`).join(", ")}`,
    );
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

    // Show base representations if not all decimal
    let baseRepresentation = "";
    if (this.outputBases.some((base) => base.base !== 10)) {
      const baseReprs = [];
      for (const base of this.outputBases) {
        if (base.base !== 10) {
          try {
            const baseRepr = rational.toString(base);
            baseReprs.push(`${baseRepr}[${base.base}]`);
          } catch (error) {
            // Ignore conversion errors for individual bases
          }
        }
      }
      if (baseReprs.length > 0) {
        baseRepresentation = ` (${baseReprs.join(", ")})`;
      }
    }

    switch (this.outputMode) {
      case "DECI":
        console.log(`${displayDecimal}${periodInfo}${baseRepresentation}`);
        break;
      case "RAT":
        console.log(`${fraction}${baseRepresentation}`);
        break;
      case "BOTH":
        if (fraction.includes("/") || fraction.includes("..")) {
          console.log(
            `${displayDecimal}${periodInfo} (${fraction})${baseRepresentation}`,
          );
        } else {
          console.log(`${decimal}${baseRepresentation}`);
        }
        break;
      case "SCI":
        const scientificNotation = rational.toScientificNotation(
          true,
          this.sciPrecision,
          this.showPeriodInfo,
        );
        console.log(`${scientificNotation} (${fraction})${baseRepresentation}`);
        break;
      case "CF":
        const continuedFraction = rational.toContinuedFractionString();
        console.log(`${continuedFraction} (${fraction})${baseRepresentation}`);
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
RatCalc Terminal

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
  3.~7~15~1         Continued fraction (355/113)

EXAMPLES:
  1/2 + 3/4         → 5/4 (1.25)
  2^3               → 8
  5!                → 120
  1:2 * 3:4         → 3:8 (interval arithmetic)
  0.#3              → 1/3
  1.5[+-1]        → 1.49:1.51
  1.5[+10,-0.1]        → 1.499:1.6
  1.2[3,6]          → 1.23:1.26 (decimal concatenation)
  12[15,18]         → 1215:1218 (integer concatenation)
  3.~7~15~1         → 355/113 (continued fraction)

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
  BASES             Show available base systems
  DECI              Show results as decimals only
  RAT               Show results as fractions only
  BOTH              Show both decimal and fraction (default)
  SCI               Show results in scientific notation
  CF                Show results as continued fractions
  MIX               Toggle mixed number display (default: on)
  LIMIT <n>         Set decimal display limit to n digits (default: 20)
  SCIPREC <n>       Set scientific notation precision to n digits (default: 10)
  SCIPERIOD         Toggle period info display in scientific notation
  LIMIT             Show current decimal display limit
  EXIT, QUIT, BYE   Exit calculator

BASE COMMANDS:
  BASE              Show current base system
  BASE <n>          Set base to n (2-62, e.g. BASE 16 for hex)
  BASE <sequence>   Set custom base (e.g. BASE 0-9a-f)
  BIN, HEX, OCT     Quick shortcuts for binary, hex, octal
  DEC               Return to decimal (base 10)

FORMAT AFTER EXPRESSIONS:
  <expr> BASE <n>   Show result in specified base
  <expr> BIN        Show result in binary
  <expr> HEX        Show result in hexadecimal
  <expr> OCT        Show result in octal
  <expr> DECI       Show result in decimal format
  <expr> RAT        Show result in rational format
  <expr> CF         Show result as continued fraction
  <expr> MIX        Show result with mixed numbers toggled

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
        return rational.toScientificNotation(
          true,
          this.sciPrecision,
          this.showPeriodInfo,
        );
      case "CF":
        return rational.toContinuedFractionString();
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
    console.log("RatCalc Terminal");
    console.log("Type HELP for help, EXIT to quit");
    console.log("");
    this.rl.prompt();
  }
}

// Start the calculator
const calc = new Calculator();
calc.start();

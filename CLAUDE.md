# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Important to note: 1) Do not modify docs/calc.js, docs/stern-brocot.js, or docs/ratmath.js. These are build artifacts; modify the source files and rebuild instead. 2) Changes to the repository by claude should be recorded in a brief fashion in ai-changelog.md A major new change should be under its own heading. Each change should have the model and date/time, a single summary sentence, and then a small paragraph if more details are necessary.

## Project Overview

**RatMath** is a JavaScript library for exact rational arithmetic and interval arithmetic using BigInt for arbitrary precision. It supports both Node.js/Bun environments and browsers as an ES module.

## Essential Commands

### Development & Testing
- `bun test` - Run all tests (preferred runtime)
- `bun test tests/specific-test.js` - Run single test file
- `bun calc.js` - Launch terminal calculator for testing

### Build Commands
- `bun run build-web` - Build web calculator bundle (docs/calc.js)
- `bun run build-stern-brocot` - Build Stern-Brocot tree explorer (docs/stern-brocot.js)
- `bun run build-showcase` - Build showcase page library bundle (docs/ratmath.js)
- `bun run build-all` - Build all web components
- `bun run serve` - Serve web calculator locally on port 3000

### Project Uses Bun as Primary Runtime
Bun is the preferred runtime over Node.js. All development should target Bun first, with Node.js compatibility maintained.

## Core Architecture

### Main Components (src/)
- **Integer.js** - BigInt-based exact integers with factorial support
- **Rational.js** - Exact fractions automatically reduced to lowest terms
- **Fraction.js** - Fractions without automatic reduction
- **RationalInterval.js** - Closed intervals with exact rational endpoints
- **FractionInterval.js** - Intervals preserving unreduced fractions
- **Parser.js** - Expression parser supporting mixed numbers, repeating decimals, uncertainty notation
- **TypePromotion.js** - Automatic type conversion between number types

### Key Design Principles
- **Exact Arithmetic**: All operations maintain mathematical precision using BigInt
- **Type Promotion**: Numbers automatically promote to higher precision types when needed
- **Template Functions**: R`` and F`` template literals for convenient parsing
- **Modular Design**: Each mathematical type is self-contained with its own operations

### Special Notation Support
- Mixed numbers: `"5..2/3"` (5 and 2/3)
- Repeating decimals: `"0.#3"` (exactly 1/3)
- Uncertainty intervals: `"1.23[±0.05]"`
- Factorials: Standard `n!` and double factorial `n!!`

## Testing Strategy

Uses Bun's built-in test framework (Jest-compatible syntax):
- Tests located in `tests/` directory
- `tests/setup.js` provides test configuration
- Comprehensive coverage including edge cases and mathematical precision
- Parser tests verify exact mathematical representations

## Application Interfaces

### Terminal Calculator (`calc.js`)
Interactive REPL supporting all library features. Use for manual testing and development verification.

### Web Calculator (`docs/`)
Mobile-responsive web interface built from source. Recent development focused on mobile keyboard and display improvements.

## Current Development Focus

Based on recent commits and todos/:
- Mobile web calculator UI refinements
- Template function enhancements
- Future features include multiple base support, continued fractions, LaTeX output

## File Structure Understanding

- `index.js` - Main library entry point, exports all classes
- `examples/` - Usage demonstrations for all features
- `documents/` - Comprehensive API documentation and development history
- `docs/` - Web calculator source (GitHub Pages deployment)
- `bunfig.toml` - Bun configuration for testing and builds

## Mathematical Precision Notes

This library prioritizes exact mathematical representation over performance. All arithmetic maintains precision through BigInt operations, making it suitable for applications requiring exact rational arithmetic without floating-point approximation errors.

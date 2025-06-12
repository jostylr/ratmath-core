# Ratmath Web Calculator

This directory contains the web-based calculator for the Ratmath library, designed to be served via GitHub Pages.

## Files

- `index.html` - Landing page with library information and links
- `calc.html` - The interactive web calculator
- `calc.css` - Styles for the web calculator
- `calc.js` - Bundled JavaScript containing the calculator logic and Ratmath library
- `CNAME` - Domain configuration for GitHub Pages

## Features

### Interactive Calculator
- Terminal-style input with command history (↑/↓ arrow keys)
- Real-time calculation of mathematical expressions
- Support for all Ratmath features:
  - Exact rational arithmetic (1/2 + 1/3 = 5/6)
  - Interval arithmetic (1:2 * 3:4 = 3:8)
  - Repeating decimals (0.#3 = 1/3)
  - Mixed numbers (1..2/3)
  - Scientific notation (1E3, 2.5E-2)
  - Uncertainty notation (1.5[+-0.1] = 1.4:1.6)

### Output Modes
- `DECI` - Decimal output only
- `RAT` - Rational/fraction output only  
- `BOTH` - Both formats (default)

### User Interface
- Clean, modern design with gradient background
- Responsive layout for mobile and desktop
- Modal help system with full documentation
- Copy session feature for sharing calculations
- Clear history functionality

### Keyboard Shortcuts
- `Enter` - Execute calculation
- `↑/↓` - Navigate command history
- `Escape` - Close help modal

## Commands

Special commands available in the calculator:

- `HELP` - Show help modal
- `CLEAR` - Clear calculation history
- `DECI` - Set output mode to decimal only
- `RAT` - Set output mode to rational only
- `BOTH` - Set output mode to both (default)
- `LIMIT <n>` - Set decimal display limit
- `LIMIT` - Show current decimal display limit

## Building

The calculator is built using Bun to bundle the JavaScript:

```bash
bun run build-web
```

This creates `calc.js` containing the entire Ratmath library and calculator logic.

## GitHub Pages

This directory is configured to be served via GitHub Pages at `calc.ratmath.com`. The landing page provides information about the Ratmath library and links to both the calculator and the GitHub repository.

## Development

To modify the calculator:

1. Edit `src/web-calc.js` for calculator logic
2. Edit `calc.html` for HTML structure  
3. Edit `calc.css` for styling
4. Run `bun run build-web` to rebuild `calc.js`
5. Test changes locally before committing

The calculator automatically initializes when the DOM loads and provides a full-featured mathematical computing environment in the browser.
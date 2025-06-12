/**
 * Web Calculator for ratmath
 * 
 * Interactive web-based calculator that parses mathematical expressions using the ratmath library.
 * Supports rational arithmetic, intervals, and various output formats.
 */

import { Parser, Rational, RationalInterval, Integer } from '../index.js';

class WebCalculator {
  constructor() {
    this.outputMode = 'BOTH'; // 'DECI', 'RAT', 'BOTH'
    this.decimalLimit = 20; // Maximum decimal places before showing ...
    this.history = []; // Command history for up/down arrows
    this.historyIndex = -1; // Current position in history
    this.outputHistory = []; // All input/output pairs for copying
    
    this.initializeElements();
    this.setupEventListeners();
    this.displayWelcome();
  }

  initializeElements() {
    this.inputElement = document.getElementById('calculatorInput');
    this.outputHistoryElement = document.getElementById('outputHistory');
    this.helpModal = document.getElementById('helpModal');
    this.copyButton = document.getElementById('copyButton');
    this.helpButton = document.getElementById('helpButton');
    this.clearButton = document.getElementById('clearButton');
    this.closeHelp = document.getElementById('closeHelp');
  }

  setupEventListeners() {
    // Input handling
    this.inputElement.addEventListener('keydown', (e) => this.handleKeyDown(e));
    
    // Button handlers
    this.copyButton.addEventListener('click', () => this.copySession());
    this.helpButton.addEventListener('click', () => this.showHelp());
    this.clearButton.addEventListener('click', () => this.clearHistory());
    
    // Modal handlers
    this.closeHelp.addEventListener('click', () => this.hideHelp());
    this.helpModal.addEventListener('click', (e) => {
      if (e.target === this.helpModal) {
        this.hideHelp();
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideHelp();
      }
    });

    // Auto-focus input on page load (but not on mobile to avoid virtual keyboard)
    if (!this.isMobile()) {
      setTimeout(() => this.inputElement.focus(), 100);
    }
    
    // Add mobile-specific input handling
    if (this.isMobile()) {
      this.inputElement.setAttribute('inputmode', 'text');
      this.inputElement.setAttribute('autocomplete', 'off');
      this.inputElement.setAttribute('autocorrect', 'off');
      this.inputElement.setAttribute('autocapitalize', 'off');
      this.inputElement.setAttribute('spellcheck', 'false');
    }
  }

  isMobile() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (window.innerWidth <= 768 && 'ontouchstart' in window);
  }

  handleKeyDown(e) {
    switch (e.key) {
      case 'Enter':
        this.processInput();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.navigateHistory(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.navigateHistory(1);
        break;
    }
  }

  navigateHistory(direction) {
    if (this.history.length === 0) return;
    
    if (direction === -1) { // Up arrow
      if (this.historyIndex === -1) {
        this.historyIndex = this.history.length - 1;
      } else if (this.historyIndex > 0) {
        this.historyIndex--;
      }
    } else { // Down arrow
      if (this.historyIndex === -1) return;
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
      } else {
        this.historyIndex = -1;
        this.inputElement.value = '';
        return;
      }
    }
    
    this.inputElement.value = this.history[this.historyIndex];
    // Move cursor to end
    setTimeout(() => {
      this.inputElement.setSelectionRange(this.inputElement.value.length, this.inputElement.value.length);
    }, 0);
  }

  processInput() {
    const input = this.inputElement.value.trim();
    if (!input) {
      this.inputElement.focus();
      return;
    }

    // Add to history
    if (this.history.length === 0 || this.history[this.history.length - 1] !== input) {
      this.history.push(input);
    }
    this.historyIndex = -1;

    // Display input
    this.addToOutput(input, null, false);

    // Handle special commands
    const upperInput = input.toUpperCase();
    
    if (upperInput === 'HELP') {
      this.showHelp();
      this.inputElement.value = '';
      return;
    }

    if (upperInput === 'CLEAR') {
      this.clearHistory();
      this.inputElement.value = '';
      return;
    }

    if (upperInput === 'DECI') {
      this.outputMode = 'DECI';
      this.addToOutput('', 'Output mode set to decimal', false);
      this.inputElement.value = '';
      return;
    }

    if (upperInput === 'RAT') {
      this.outputMode = 'RAT';
      this.addToOutput('', 'Output mode set to rational', false);
      this.inputElement.value = '';
      return;
    }

    if (upperInput === 'BOTH') {
      this.outputMode = 'BOTH';
      this.addToOutput('', 'Output mode set to both decimal and rational', false);
      this.inputElement.value = '';
      return;
    }

    if (upperInput.startsWith('LIMIT')) {
      const limitStr = upperInput.substring(5).trim();
      if (limitStr === '') {
        this.addToOutput('', `Current decimal display limit: ${this.decimalLimit} digits`, false);
      } else {
        const limit = parseInt(limitStr);
        if (isNaN(limit) || limit < 1) {
          this.addToOutput('', 'Error: LIMIT must be a positive integer', true);
        } else {
          this.decimalLimit = limit;
          this.addToOutput('', `Decimal display limit set to ${limit} digits`, false);
        }
      }
      this.inputElement.value = '';
      return;
    }

    // Try to parse and evaluate the expression
    try {
      const hasExactDecimal = input.includes('#') || input.includes('#0');
      const hasFraction = input.includes('/');
      const hasDecimalPoint = input.includes('.');
      const isSimpleInteger = /^\s*-?\d+\s*$/.test(input);
      const hasPlainDecimal = hasDecimalPoint && !hasExactDecimal && !hasFraction;
      
      const result = Parser.parse(input, { typeAware: hasExactDecimal || hasFraction || isSimpleInteger || !hasPlainDecimal });
      const output = this.formatResult(result);
      this.addToOutput('', output, false);
    } catch (error) {
      let errorMessage;
      if (error.message.includes('Division by zero') || 
          error.message.includes('Denominator cannot be zero')) {
        errorMessage = 'Error: Division by zero is undefined';
      } else if (error.message.includes('Factorial') && error.message.includes('negative')) {
        errorMessage = 'Error: Factorial is not defined for negative numbers';
      } else if (error.message.includes('Zero cannot be raised to the power of zero')) {
        errorMessage = 'Error: 0^0 is undefined';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      this.addToOutput('', errorMessage, true);
    }

    this.inputElement.value = '';
    
    // Ensure input stays focused (except on mobile)
    if (!this.isMobile()) {
      setTimeout(() => this.inputElement.focus(), 50);
    }
  }

  formatResult(result) {
    if (result instanceof RationalInterval) {
      return this.formatInterval(result);
    } else if (result instanceof Rational) {
      return this.formatRational(result);
    } else if (result instanceof Integer) {
      return this.formatInteger(result);
    } else {
      return result.toString();
    }
  }

  formatInteger(integer) {
    return integer.value.toString();
  }

  formatRational(rational) {
    const repeatingInfo = rational.toRepeatingDecimalWithPeriod();
    const repeatingDecimal = repeatingInfo.decimal;
    const period = repeatingInfo.period;
    const decimal = this.formatDecimal(rational);
    const fraction = rational.toString();
    
    const isTerminatingDecimal = repeatingDecimal.endsWith('#0');
    const displayDecimal = isTerminatingDecimal ? repeatingDecimal : this.formatRepeatingDecimal(rational);
    
    const periodInfo = period > 0 ? ` {period: ${period}}` : '';
    
    switch (this.outputMode) {
      case 'DECI':
        return `${displayDecimal}${periodInfo}`;
      case 'RAT':
        return fraction;
      case 'BOTH':
        if (fraction.includes('/')) {
          return `${displayDecimal}${periodInfo} (${fraction})`;
        } else {
          return decimal;
        }
      default:
        return fraction;
    }
  }

  formatDecimal(rational) {
    const decimal = rational.toDecimal();
    if (decimal.length > this.decimalLimit + 2) {
      const dotIndex = decimal.indexOf('.');
      if (dotIndex !== -1 && decimal.length - dotIndex - 1 > this.decimalLimit) {
        return decimal.substring(0, dotIndex + this.decimalLimit + 1) + '...';
      }
    }
    return decimal;
  }

  formatRepeatingDecimal(rational) {
    const repeatingDecimal = rational.toRepeatingDecimal();
    
    if (!repeatingDecimal.includes('#')) {
      return repeatingDecimal;
    }

    if (repeatingDecimal.endsWith('#0')) {
      const withoutRepeating = repeatingDecimal.substring(0, repeatingDecimal.length - 2);
      if (withoutRepeating.length > this.decimalLimit + 2) {
        const dotIndex = withoutRepeating.indexOf('.');
        if (dotIndex !== -1 && withoutRepeating.length - dotIndex - 1 > this.decimalLimit) {
          return withoutRepeating.substring(0, dotIndex + this.decimalLimit + 1) + '...';
        }
      }
      return withoutRepeating;
    }

    if (repeatingDecimal.length > this.decimalLimit + 2) {
      const hashIndex = repeatingDecimal.indexOf('#');
      const beforeHash = repeatingDecimal.substring(0, hashIndex);
      const afterHash = repeatingDecimal.substring(hashIndex + 1);
      
      if (beforeHash.length > this.decimalLimit + 1) {
        return beforeHash.substring(0, this.decimalLimit + 1) + '...';
      }
      
      const remainingSpace = this.decimalLimit + 2 - beforeHash.length;
      if (remainingSpace <= 1) {
        return beforeHash + '#...';
      } else if (afterHash.length > remainingSpace - 1) {
        return beforeHash + '#' + afterHash.substring(0, remainingSpace - 1) + '...';
      }
    }
    
    return repeatingDecimal;
  }

  formatInterval(interval) {
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
    
    const lowIsTerminating = lowRepeating.endsWith('#0');
    const highIsTerminating = highRepeating.endsWith('#0');
    const lowDisplay = lowIsTerminating ? lowRepeating.substring(0, lowRepeating.length - 2) : this.formatRepeatingDecimal(interval.low);
    const highDisplay = highIsTerminating ? highRepeating.substring(0, highRepeating.length - 2) : this.formatRepeatingDecimal(interval.high);
    
    let periodInfo = '';
    if (lowPeriod > 0 || highPeriod > 0) {
      const periodParts = [];
      if (lowPeriod > 0) periodParts.push(`low: ${lowPeriod}`);
      if (highPeriod > 0) periodParts.push(`high: ${highPeriod}`);
      periodInfo = ` {period: ${periodParts.join(', ')}}`;
    }
    
    switch (this.outputMode) {
      case 'DECI':
        return `${lowDisplay}:${highDisplay}${periodInfo}`;
      case 'RAT':
        return `${lowFraction}:${highFraction}`;
      case 'BOTH':
        const decimalRange = `${lowDisplay}:${highDisplay}${periodInfo}`;
        const rationalRange = `${lowFraction}:${highFraction}`;
        if (decimalRange !== rationalRange) {
          return `${decimalRange} (${rationalRange})`;
        } else {
          return decimalRange;
        }
      default:
        return `${lowFraction}:${highFraction}`;
    }
  }

  addToOutput(input, output, isError = false) {
    const entry = document.createElement('div');
    entry.className = 'output-entry';
    
    if (input) {
      const inputLine = document.createElement('div');
      inputLine.className = 'input-line';
      inputLine.innerHTML = `<span class="prompt">></span><span>${this.escapeHtml(input)}</span>`;
      entry.appendChild(inputLine);
    }
    
    if (output) {
      const outputLine = document.createElement('div');
      outputLine.className = isError ? 'error-line' : 'output-line';
      outputLine.textContent = output;
      entry.appendChild(outputLine);
    }
    
    this.outputHistoryElement.appendChild(entry);
    
    // Smooth scroll to bottom
    setTimeout(() => {
      this.outputHistoryElement.scrollTop = this.outputHistoryElement.scrollHeight;
    }, 10);
    
    // Store for copying - capture both input and output properly
    if (input || output) {
      this.outputHistory.push({ input: input || '', output: output || '', isError });
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  displayWelcome() {
    const welcome = document.createElement('div');
    welcome.className = 'output-entry';
    welcome.innerHTML = `
      <div class="output-line" style="color: #059669; font-weight: 600;">
        Welcome to Ratmath Calculator!
      </div>
      <div class="output-line" style="margin-top: 0.5rem;">
        Type mathematical expressions and press Enter to calculate.
      </div>
      <div class="output-line">
        Use the Help button or type HELP for detailed instructions.
      </div>
    `;
    this.outputHistoryElement.appendChild(welcome);
  }

  showHelp() {
    this.helpModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  hideHelp() {
    this.helpModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    // Delay focus to ensure modal is fully hidden (except on mobile)
    if (!this.isMobile()) {
      setTimeout(() => this.inputElement.focus(), 100);
    }
  }

  clearHistory() {
    this.outputHistoryElement.innerHTML = '';
    this.outputHistory = [];
    this.displayWelcome();
    if (!this.isMobile()) {
      setTimeout(() => this.inputElement.focus(), 100);
    }
  }

  async copySession() {
    if (this.outputHistory.length === 0) {
      // Show feedback for empty session
      const originalText = this.copyButton.textContent;
      this.copyButton.textContent = 'Nothing to copy';
      this.copyButton.style.background = 'rgba(251, 146, 60, 0.9)';
      this.copyButton.style.color = 'white';
      
      setTimeout(() => {
        this.copyButton.textContent = originalText;
        this.copyButton.style.background = '';
        this.copyButton.style.color = '';
        if (!this.isMobile()) {
          this.inputElement.focus();
        }
      }, 2000);
      return;
    }

    let text = 'Ratmath Calculator Session\n';
    text += '='.repeat(30) + '\n\n';
    
    for (const entry of this.outputHistory) {
      if (entry.input) {
        text += `> ${entry.input}\n`;
        if (entry.output) {
          text += `${entry.output}\n`;
        }
        text += '\n';
      }
    }
    
    try {
      await navigator.clipboard.writeText(text);
      
      // Show feedback
      const originalText = this.copyButton.textContent;
      this.copyButton.textContent = '✓ Copied!';
      this.copyButton.style.background = 'rgba(34, 197, 94, 0.9)';
      this.copyButton.style.color = 'white';
      
      setTimeout(() => {
        this.copyButton.textContent = originalText;
        this.copyButton.style.background = '';
        this.copyButton.style.color = '';
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      
      // Mobile-friendly fallback: show text in a modal or new window
      if (this.isMobile()) {
        // Create a temporary textarea for mobile copy
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        
        try {
          document.execCommand('copy');
          const originalText = this.copyButton.textContent;
          this.copyButton.textContent = '✓ Copied!';
          this.copyButton.style.background = 'rgba(34, 197, 94, 0.9)';
          this.copyButton.style.color = 'white';
          
          setTimeout(() => {
            this.copyButton.textContent = originalText;
            this.copyButton.style.background = '';
            this.copyButton.style.color = '';
          }, 2000);
        } catch (fallbackError) {
          // Show text in a modal if all else fails
          alert(text);
        }
        
        document.body.removeChild(textarea);
      } else {
        // Desktop fallback: show the text in a new window/tab
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`<pre>${text}</pre>`);
        newWindow.document.title = 'Ratmath Calculator Session';
      }
    }
  }
}

// Initialize calculator when DOM is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    new WebCalculator();
  });
}

export { WebCalculator };
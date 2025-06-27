// Import RatMath library
import { Parser, R, F } from './ratmath.js';

// Store RatMath globally for playground
window.RatMath = { Parser, R, F };

// Helper function to safely evaluate and display results
function safeEvaluate(expression, outputId) {
  const outputElement = document.getElementById(outputId);
  try {
    const result = Parser.parse(expression);
    let output = result.toString();
    
    // Add decimal representation if it's a fraction
    if (result.toDecimal) {
      const decimal = result.toDecimal(10);
      output += ` = ${decimal}`;
    }
    
    // Add type information
    output += ` (${result.constructor.name})`;
    
    outputElement.textContent = output;
    outputElement.style.color = '#28a745';
  } catch (error) {
    outputElement.textContent = `Error: ${error.message}`;
    outputElement.style.color = '#dc3545';
  }
}

// Basic arithmetic example
window.evaluateBasic = function() {
  const expr = document.getElementById('basic-expr').value;
  safeEvaluate(expr, 'basic-output');
};

// Repeating decimal example
window.evaluateRepeating = function() {
  const expr = document.getElementById('repeat-expr').value;
  const outputElement = document.getElementById('repeat-output');
  
  try {
    const result = Parser.parse(expr);
    let output = result.toString();
    
    // Show both fraction and decimal forms
    if (result.toDecimal) {
      const decimal = result.toDecimal(20);
      output += ` = ${decimal}`;
    }
    
    // Show type information
    output += ` (${result.constructor.name})`;
    
    outputElement.textContent = output;
    outputElement.style.color = '#28a745';
  } catch (error) {
    outputElement.textContent = `Error: ${error.message}`;
    outputElement.style.color = '#dc3545';
  }
};

// Interval operations example
window.evaluateInterval = function() {
  const expr = document.getElementById('interval-expr').value;
  const outputElement = document.getElementById('interval-output');
  
  try {
    const result = Parser.parse(expr);
    
    let output = result.toString();
    
    // For intervals, show the width
    if (result.low && result.high) {
      const width = result.high.subtract(result.low);
      output += ` (width: ${width})`;
    }
    
    outputElement.textContent = output;
    outputElement.style.color = '#28a745';
  } catch (error) {
    outputElement.textContent = `Error: ${error.message}`;
    outputElement.style.color = '#dc3545';
  }
};

// Continued fraction example
window.evaluateCF = function() {
  const expr = document.getElementById('cf-expr').value;
  const outputElement = document.getElementById('cf-output');
  
  try {
    const result = Parser.parse(expr);
    let output = result.toString();
    
    // Show decimal approximation
    if (result.toDecimal) {
      const decimal = result.toDecimal(15);
      output += ` ≈ ${decimal}`;
    }
    
    // Show type information
    output += ` (${result.constructor.name})`;
    
    outputElement.textContent = output;
    outputElement.style.color = '#28a745';
  } catch (error) {
    outputElement.textContent = `Error: ${error.message}`;
    outputElement.style.color = '#dc3545';
  }
};

// Playground functionality
window.runPlayground = function() {
  const code = document.getElementById('playground-code').value;
  const outputElement = document.getElementById('playground-output');
  
  // Clear previous output
  outputElement.textContent = '';
  
  // Create a custom console that captures output
  const outputs = [];
  const customConsole = {
    log: (...args) => {
      outputs.push(args.map(arg => String(arg)).join(' '));
    },
    error: (...args) => {
      outputs.push('Error: ' + args.map(arg => String(arg)).join(' '));
    }
  };
  
  try {
    // Create a function with the code and run it with custom console
    const func = new Function('console', 'RatMath', code);
    func(customConsole, window.RatMath);
    
    // Display the output
    outputElement.textContent = outputs.join('\n') || 'Code executed successfully (no output)';
    outputElement.style.color = '#abb2bf';
  } catch (error) {
    outputElement.textContent = `Error: ${error.message}`;
    outputElement.style.color = '#e06c75';
  }
};

window.clearPlayground = function() {
  document.getElementById('playground-output').textContent = '';
};

// Initialize examples on page load
document.addEventListener('DOMContentLoaded', () => {
  // Run initial examples
  evaluateBasic();
  evaluateRepeating();
  evaluateInterval();
  evaluateCF();
  
  // Add Enter key support to all example inputs
  document.getElementById('basic-expr').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') evaluateBasic();
  });
  
  document.getElementById('repeat-expr').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') evaluateRepeating();
  });
  
  document.getElementById('interval-expr').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') evaluateInterval();
  });
  
  document.getElementById('cf-expr').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') evaluateCF();
  });
  
  // Add Ctrl+Enter support for the playground
  document.getElementById('playground-code').addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runPlayground();
    }
  });
  
  // Add smooth scrolling for navigation links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
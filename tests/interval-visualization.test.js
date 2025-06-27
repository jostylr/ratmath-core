/**
 * Tests for IntervalVisualization class
 * Tests SVG generation, interaction, and mathematical accuracy
 */

import { test, expect } from "bun:test";
import { IntervalVisualization, OperationVisualization, MultiStepVisualization } from "../src/IntervalVisualization.js";
import { Parser, Rational, RationalInterval } from "../index.js";

// Mock DOM environment for testing
global.document = {
  createElementNS: (namespace, tagName) => {
    const element = {
      tagName: tagName.toUpperCase(),
      attributes: {},
      children: [],
      style: {},
      dataset: {},
      textContent: '',
      
      setAttribute: function(name, value) {
        this.attributes[name] = value;
      },
      
      getAttribute: function(name) {
        return this.attributes[name];
      },
      
      appendChild: function(child) {
        this.children.push(child);
        child.parentNode = this;
      },
      
      querySelector: function(selector) {
        // Simple mock implementation
        if (selector === 'line') {
          return this.children.find(child => child.tagName === 'LINE');
        }
        if (selector.includes('data-endpoint')) {
          const endpoint = selector.match(/data-endpoint="(\w+)"/)?.[1];
          return this.children.find(child => 
            child.attributes['data-endpoint'] === endpoint
          );
        }
        return null;
      },
      
      addEventListener: function() {},
      cloneNode: function() { 
        return { 
          ...this, 
          outerHTML: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="250"></svg>',
          insertBefore: function() {} 
        }; 
      },
      focus: function() {}, // Add focus method
      closest: function(selector) {
        // Mock implementation for closest
        if (selector === 'g[data-interval-id]') {
          return {
            style: { filter: '' }
          };
        }
        return null;
      }
    };
    return element;
  },
  
  createElement: () => ({
    style: {},
    addEventListener: function() {},
    appendChild: function() {}
  }),
  
  addEventListener: function() {}, // Add global document event listener
  
  body: {
    appendChild: function() {}
  }
};

// Mock container element
function createMockContainer() {
  return {
    appendChild: function(child) {
      this.child = child;
    },
    addEventListener: function(type, handler) {
      this._listeners = this._listeners || {};
      this._listeners[type] = handler;
    },
    dispatchEvent: function(event) {
      if (this._listeners && this._listeners[event.type]) {
        this._listeners[event.type](event);
      }
    },
    clientWidth: 800,
    style: {}
  };
}

test("IntervalVisualization - Basic Construction", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  expect(viz.width).toBe(800);
  expect(viz.height).toBe(250);
  expect(viz.intervals).toEqual([]);
  expect(viz.autoRange).toBe(true);
});

test("IntervalVisualization - Custom Options", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container, {
    width: 900,
    height: 300,
    margin: { top: 80, right: 80, bottom: 80, left: 80 }
  });
  
  expect(viz.width).toBe(900);
  expect(viz.height).toBe(300);
  expect(viz.margin.top).toBe(80);
});

test("IntervalVisualization - Add Single Interval", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  const interval = new RationalInterval(new Rational(1, 2), new Rational(3, 2));
  const intervalId = viz.addInterval(interval, {
    label: "Test Interval",
    color: "#2563eb",
    draggable: true
  });
  
  expect(viz.intervals.length).toBe(1);
  expect(viz.intervals[0].interval).toBe(interval);
  expect(viz.intervals[0].label).toBe("Test Interval");
  expect(viz.intervals[0].color).toBe("#2563eb");
  expect(viz.intervals[0].draggable).toBe(true);
  expect(intervalId).toBeDefined();
});

test("IntervalVisualization - Multiple Intervals with Auto-coloring", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  const interval1 = Parser.parse("1:2");
  const interval2 = Parser.parse("2.5:3.5");
  
  viz.addInterval(interval1, { label: "A" });
  viz.addInterval(interval2, { label: "B" });
  
  expect(viz.intervals.length).toBe(2);
  expect(viz.intervals[0].color).toBe("#93c5fd"); // First color (pale)
  expect(viz.intervals[1].color).toBe("#fca5a5"); // Second color (pale)
});

test("IntervalVisualization - Range Management", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  // Test auto-range with single interval
  const interval = Parser.parse("1:3");
  viz.addInterval(interval);
  viz.updateRange();
  
  // Should have padding around the interval
  expect(viz.range.min.lessThan(new Rational(1))).toBe(true);
  expect(viz.range.max.greaterThan(new Rational(3))).toBe(true);
  
  // Test manual range setting
  viz.setRange(new Rational(0), new Rational(5));
  expect(viz.range.min.equals(new Rational(0))).toBe(true);
  expect(viz.range.max.equals(new Rational(5))).toBe(true);
  expect(viz.autoRange).toBe(false);
});

test("IntervalVisualization - Scale Calculation", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  viz.setRange(new Rational(0), new Rational(10));
  
  // Test scale mapping
  const pos0 = viz.xScale(new Rational(0));
  const pos5 = viz.xScale(new Rational(5));
  const pos10 = viz.xScale(new Rational(10));
  
  expect(pos0).toBe(0);
  expect(pos10).toBe(viz.plotWidth);
  expect(pos5).toBe(viz.plotWidth / 2);
});

test("IntervalVisualization - SVG Export Structure", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  const interval = Parser.parse("1/2:3/2");
  viz.addInterval(interval, { label: "Export Test", draggable: true });
  
  const svgData = viz.exportSVG();
  
  expect(typeof svgData).toBe("string");
  expect(svgData).toContain('<?xml version="1.0"');
  expect(svgData).toContain('<svg');
  expect(svgData).toContain('xmlns="http://www.w3.org/2000/svg"');
});

test("IntervalVisualization - Drag Step Size", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  const originalStepSize = viz.dragStepSize;
  const newStepSize = new Rational(1, 4);
  
  viz.setDragStepSize(newStepSize);
  expect(viz.dragStepSize.equals(newStepSize)).toBe(true);
  
  // Test quantization
  const testValue = new Rational(7, 10); // 0.7
  const quantized = viz.quantizeValue(testValue);
  
  // Should be rounded to nearest 1/4
  const expected = new Rational(3, 4); // 0.75
  expect(quantized.equals(expected)).toBe(true);
});

test("OperationVisualization - Two Operand Operation", () => {
  const container = createMockContainer();
  const viz = new OperationVisualization(container);
  
  const interval1 = Parser.parse("1:2");
  const interval2 = Parser.parse("1.5:2.5");
  const result = interval1.intersection(interval2);
  
  viz.visualizeOperation(interval1, interval2, 'intersection', result);
  
  expect(viz.intervals.length).toBe(3);
  expect(viz.intervals.some(iv => iv.label === "Operand 1")).toBe(true);
  expect(viz.intervals.some(iv => iv.label === "Operand 2")).toBe(true);
  expect(viz.intervals.some(iv => iv.label === "Result (intersection)")).toBe(true);
});

test("MultiStepVisualization - Expression Tree", () => {
  const container = createMockContainer();
  const viz = new MultiStepVisualization(container);
  
  // Create a simple operation tree: (1:2) + (0.5:1.5)
  const operationTree = {
    type: 'operation',
    operation: 'add',
    left: { type: 'value', value: Parser.parse("1:2") },
    right: { type: 'value', value: Parser.parse("0.5:1.5") }
  };
  
  const result = Parser.parse("1.5:3.5");
  
  viz.visualizeExpressionTree(operationTree, result);
  
  expect(viz.stages.length).toBeGreaterThan(0);
  expect(viz.stages[0].type).toBe('operation');
});

test("IntervalVisualization - Mixed Number Intervals", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  // Test mixed number interval parsing and display
  const interval = Parser.parse("2..1/3:3..1/2");
  viz.addInterval(interval, { label: "Mixed Numbers" });
  
  expect(viz.intervals.length).toBe(1);
  expect(viz.intervals[0].interval.low.equals(new Rational(7, 3))).toBe(true);
  expect(viz.intervals[0].interval.high.equals(new Rational(7, 2))).toBe(true);
});

test("IntervalVisualization - Complex Fraction Intervals", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  // Test complex fraction intervals like 1/2:3/4
  const interval = Parser.parse("1/2:3/4");
  viz.addInterval(interval, { label: "Fractions" });
  
  expect(viz.intervals.length).toBe(1);
  expect(viz.intervals[0].interval.low.equals(new Rational(1, 2))).toBe(true);
  expect(viz.intervals[0].interval.high.equals(new Rational(3, 4))).toBe(true);
});

test("IntervalVisualization - Selection System", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  const interval = Parser.parse("1:2");
  const intervalId = viz.addInterval(interval, { draggable: true });
  
  // Mock the rendering to set up selectable elements
  viz.renderIntervals();
  
  // Test selection
  viz.selectElement(intervalId, 'left');
  expect(viz.selectedIntervalId).toBe(intervalId);
  expect(viz.selectedEndpoint).toBe('left');
  
  viz.selectElement(intervalId, 'interval');
  expect(viz.selectedEndpoint).toBe('interval');
});

test("IntervalVisualization - Event Handling", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  let eventFired = false;
  let eventDetail = null;
  
  container.addEventListener('intervalChange', function(event) {
    eventFired = true;
    eventDetail = event.detail;
  });
  
  const interval = Parser.parse("1:2");
  const intervalId = viz.addInterval(interval, { draggable: true });
  
  // Simulate interval change
  viz.dispatchEvent('intervalChange', {
    id: intervalId,
    interval: interval
  });
  
  expect(eventFired).toBe(true);
  expect(eventDetail.id).toBe(intervalId);
});

test("IntervalVisualization - Error Handling", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  // Test with invalid interval (should handle gracefully)
  expect(() => {
    viz.addInterval(null, { label: "Invalid" });
  }).toThrow();
  
  // Test with valid range (min < max) on a fresh viz instance
  const container2 = createMockContainer();
  const viz2 = new IntervalVisualization(container2);
  expect(() => {
    viz2.setRange(new Rational(2), new Rational(5));
  }).not.toThrow();
});

test("IntervalVisualization - Performance with Many Intervals", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  // Add multiple intervals
  for (let i = 0; i < 10; i++) {
    const interval = new RationalInterval(
      new Rational(i), 
      new Rational(i + 1)
    );
    viz.addInterval(interval, { label: `Interval ${i}` });
  }
  
  expect(viz.intervals.length).toBe(10);
  
  // Test that SVG export still works with many intervals
  const svgData = viz.exportSVG();
  expect(svgData.length).toBeGreaterThan(100);
});

test("IntervalVisualization - Accessibility Features", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  const interval = Parser.parse("1:2");
  viz.addInterval(interval, { draggable: true });
  
  // Mock render to set up accessibility
  viz.renderIntervals();
  
  // Check that selectable elements are added
  expect(viz.selectableElements.length).toBeGreaterThan(0);
  
  // Each selectable element should have required properties
  viz.selectableElements.forEach(element => {
    expect(element.intervalId).toBeDefined();
    expect(element.endpointType).toBeDefined();
    expect(element.element).toBeDefined();
  });
});
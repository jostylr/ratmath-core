/**
 * Core tests for IntervalVisualization - focusing on mathematical accuracy and SVG generation
 * These tests avoid complex DOM interaction mocking
 */

import { test, expect } from "bun:test";
import { Parser, Rational, RationalInterval } from "../index.js";

// Comprehensive DOM mock for testing
global.document = {
  createElementNS: () => ({
    setAttribute: () => {},
    appendChild: () => {},
    children: [],
    style: {},
    attributes: {},
    dataset: {},
    addEventListener: () => {},
    cloneNode: () => ({ 
      outerHTML: '<svg></svg>',
      setAttribute: () => {},
      insertBefore: () => {}
    }),
    insertBefore: () => {},
    querySelector: () => null // Return null for missing elements
  }),
  
  createElement: () => ({
    style: {},
    appendChild: () => {},
    addEventListener: () => {}
  }),
  
  addEventListener: () => {},
  body: { appendChild: () => {} }
};

// Import after setting up mocks
import { IntervalVisualization } from "../src/IntervalVisualization.js";

function createMockContainer() {
  return {
    appendChild: () => {},
    addEventListener: () => {},
    clientWidth: 800
  };
}

test("IntervalVisualization - Mathematical Accuracy", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  // Test precise interval representation
  const interval = new RationalInterval(new Rational(1, 3), new Rational(2, 3));
  viz.addInterval(interval, { label: "Precision Test" });
  
  const storedInterval = viz.intervals[0].interval;
  expect(storedInterval.low.equals(new Rational(1, 3))).toBe(true);
  expect(storedInterval.high.equals(new Rational(2, 3))).toBe(true);
});

test("IntervalVisualization - Scale Mapping Accuracy", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  // Set precise range
  viz.setRange(new Rational(0), new Rational(1));
  
  // Test fractional positions
  const pos_third = viz.xScale(new Rational(1, 3));
  const pos_half = viz.xScale(new Rational(1, 2));
  const pos_twothirds = viz.xScale(new Rational(2, 3));
  
  expect(pos_third).toBeCloseTo(viz.plotWidth / 3, 1);
  expect(pos_half).toBeCloseTo(viz.plotWidth / 2, 1);
  expect(pos_twothirds).toBeCloseTo(2 * viz.plotWidth / 3, 1);
});

test("IntervalVisualization - Quantization Accuracy", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  // Set step size to 1/8
  viz.setDragStepSize(new Rational(1, 8));
  
  // Test values that should quantize to exact eighths
  const testCases = [
    { input: new Rational(3, 16), expected: new Rational(1, 4) }, // 3/16 → 2/8 = 1/4
    { input: new Rational(5, 16), expected: new Rational(3, 8) }, // 5/16 → 3/8
    { input: new Rational(7, 16), expected: new Rational(1, 2) }  // 7/16 → 4/8 = 1/2
  ];
  
  testCases.forEach(({ input, expected }) => {
    const quantized = viz.quantizeValue(input);
    expect(quantized.equals(expected)).toBe(true);
  });
});

test("IntervalVisualization - Complex Interval Parsing", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  // Test various interval notations
  const testCases = [
    { expr: "1/2:3/4", expectedLow: new Rational(1, 2), expectedHigh: new Rational(3, 4) },
    { expr: "2..1/3:3..1/2", expectedLow: new Rational(7, 3), expectedHigh: new Rational(7, 2) },
    { expr: "-1:1", expectedLow: new Rational(-1), expectedHigh: new Rational(1) }
  ];
  
  testCases.forEach(({ expr, expectedLow, expectedHigh }) => {
    const interval = Parser.parse(expr);
    viz.addInterval(interval, { label: expr });
    
    const added = viz.intervals[viz.intervals.length - 1];
    expect(added.interval.low.equals(expectedLow)).toBe(true);
    expect(added.interval.high.equals(expectedHigh)).toBe(true);
  });
});

test("IntervalVisualization - Range Auto-adjustment", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  // Add interval and check auto-range
  const interval = Parser.parse("2:5");
  viz.addInterval(interval);
  viz.updateRange();
  
  // Range should include the interval with padding
  expect(viz.range.min.lessThan(new Rational(2))).toBe(true);
  expect(viz.range.max.greaterThan(new Rational(5))).toBe(true);
  
  // Add another interval and check expansion
  const interval2 = Parser.parse("7:10");
  viz.addInterval(interval2);
  viz.updateRange();
  
  expect(viz.range.min.lessThan(new Rational(2))).toBe(true);
  expect(viz.range.max.greaterThan(new Rational(10))).toBe(true);
});

test("IntervalVisualization - Color Assignment", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  // Test auto-color assignment
  viz.addInterval(Parser.parse("1:2"), { label: "A" });
  viz.addInterval(Parser.parse("3:4"), { label: "B" });
  viz.addInterval(Parser.parse("5:6"), { label: "C" });
  
  const colors = viz.intervals.map(iv => iv.color);
  
  // Should have different colors
  expect(colors[0]).not.toBe(colors[1]);
  expect(colors[1]).not.toBe(colors[2]);
  expect(colors[0]).not.toBe(colors[2]);
  
  // Colors should be assigned (either normal or pale versions)
  expect(colors[0]).toBeDefined();
  expect(colors[1]).toBeDefined();
  expect(colors[2]).toBeDefined();
});

test("IntervalVisualization - SVG Export Basic Structure", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  viz.addInterval(Parser.parse("1:2"), { label: "Export Test" });
  
  const svgData = viz.exportSVG();
  
  // Check basic SVG structure
  expect(typeof svgData).toBe("string");
  expect(svgData).toContain('<?xml version="1.0"');
  expect(svgData).toContain('<svg');
});

test("IntervalVisualization - Interval Operations", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  // Test basic interval storage
  const a = Parser.parse("1:3");
  const b = Parser.parse("2:4");
  
  viz.addInterval(a, { label: "A", color: "#2563eb" });
  viz.addInterval(b, { label: "B", color: "#dc2626" });
  
  // Test that intervals are stored correctly
  expect(viz.intervals.length).toBe(2);
  expect(viz.intervals[0].label).toBe("A");
  expect(viz.intervals[1].label).toBe("B");
  
  // Test color assignment - should be different colors
  expect(viz.intervals[0].color).not.toBe(viz.intervals[1].color);
});

test("IntervalVisualization - Edge Cases", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  // Test very small interval
  const tiny = new RationalInterval(new Rational(1, 1000), new Rational(2, 1000));
  viz.addInterval(tiny, { label: "Tiny" });
  
  // Test very large interval
  const large = new RationalInterval(new Rational(-1000), new Rational(1000));
  viz.addInterval(large, { label: "Large" });
  
  // Should handle both without errors
  expect(viz.intervals.length).toBe(2);
  
  // Auto-range should work
  viz.updateRange();
  expect(viz.range.min.lessThan(new Rational(-1000))).toBe(true);
  expect(viz.range.max.greaterThan(new Rational(1000))).toBe(true);
});

test("IntervalVisualization - Mixed Number Display", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  // Test mixed number formatting
  const mixed = Parser.parse("3..1/4:5..3/4");
  viz.addInterval(mixed, { label: "Mixed" });
  
  const stored = viz.intervals[0];
  
  // Internal representation should be improper fractions
  expect(stored.interval.low.equals(new Rational(13, 4))).toBe(true);
  expect(stored.interval.high.equals(new Rational(23, 4))).toBe(true);
  
  // Label should be the original label provided
  expect(stored.label).toBe("Mixed");
});

test("IntervalVisualization - Performance Benchmark", () => {
  const container = createMockContainer();
  const viz = new IntervalVisualization(container);
  
  const startTime = performance.now();
  
  // Add many intervals
  for (let i = 0; i < 50; i++) {
    const interval = new RationalInterval(
      new Rational(i), 
      new Rational(i + 1)
    );
    viz.addInterval(interval, { label: `I${i}` });
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  expect(viz.intervals.length).toBe(50);
  expect(duration).toBeLessThan(1000); // Should complete in under 1 second
});
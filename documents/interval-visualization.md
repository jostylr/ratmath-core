# IntervalVisualization Class Documentation

## Overview

The `IntervalVisualization` class provides SVG-based interactive visualization of rational intervals on number lines. It supports drag-and-drop manipulation, keyboard navigation, endpoint-specific selection, and mathematical operations visualization.

## Installation

```javascript
import { IntervalVisualization } from './src/IntervalVisualization.js';
```

## Constructor

```javascript
new IntervalVisualization(container, options = {})
```

### Parameters

- **container** (`HTMLElement`): DOM element to contain the SVG visualization
- **options** (`Object`): Configuration options
  - `width` (`number`): Width in pixels (default: 800)
  - `height` (`number`): Height in pixels (default: 250)
  - `margin` (`Object`): Margins object with top, right, bottom, left properties (default: 60px each)

### Example

```javascript
const container = document.getElementById('visualization');
const viz = new IntervalVisualization(container, {
  width: 900,
  height: 300,
  margin: { top: 60, right: 80, bottom: 80, left: 80 }
});
```

## Core Methods

### Adding Intervals

#### `addInterval(interval, options = {})`

Adds a rational interval to the visualization.

**Parameters:**
- `interval` (`RationalInterval`): The interval to visualize
- `options` (`Object`):
  - `label` (`string`): Display label for the interval
  - `color` (`string`): Hex color code (default: auto-assigned)
  - `draggable` (`boolean`): Whether the interval can be moved (default: false)
  - `isResult` (`boolean`): Whether this is a result interval (affects positioning)

**Example:**
```javascript
import { Parser } from './index.js';

const interval = Parser.parse('1/2:3/2');
viz.addInterval(interval, {
  label: 'Input A',
  color: '#2563eb',
  draggable: true
});
```

### Range Control

#### `setRange(min, max)`

Sets a fixed range for the number line.

**Parameters:**
- `min` (`Rational`): Minimum value for the range
- `max` (`Rational`): Maximum value for the range

#### `enableAutoRange()`

Enables automatic range adjustment to fit all intervals.

#### `setDragStepSize(stepSize)`

Sets the quantization step size for dragging operations.

**Parameters:**
- `stepSize` (`Rational`): Step size for quantized movement

**Example:**
```javascript
viz.setDragStepSize(new Rational(1, 10)); // Steps of 0.1
```

## Interactive Features

### Selection System

The visualization supports three types of selectable elements:

1. **Left Endpoint**: Individual control of the interval's lower bound
2. **Whole Interval**: Move the entire interval while preserving width
3. **Right Endpoint**: Individual control of the interval's upper bound

### Navigation

#### Mouse Interaction
- **Click**: Select endpoints or intervals
- **Drag**: Move selected elements
- **Hover**: Show tooltips with interval details

#### Keyboard Navigation
- **Tab/Shift+Tab**: Navigate between selectable elements
- **Arrow Left/Right**: Move selected elements by step size
- **Arrow Up/Down**: Adjust step size (in modal context)

### Tab Order

Selection follows this order:
1. First interval's left endpoint
2. First interval (whole)
3. First interval's right endpoint
4. Second interval's left endpoint
5. ... and so on

### Initial Selection

When the visualization loads, the first draggable interval's left endpoint is automatically selected.

## Visual Styling

### Interval Representation
- **Line**: Thick colored line representing the interval span
- **Endpoints**: Filled circles at interval boundaries
- **Labels**: Text labels showing interval notation
- **Colors**: Auto-assigned from palette or manually specified

### Selection Feedback
- **Endpoints**: Ring effect with enhanced stroke width
- **Intervals**: Drop shadow highlighting
- **Focus**: Standard browser focus indicators for accessibility

### Positioning
- **Input intervals**: Positioned above the number line
- **Result intervals**: Positioned below the number line
- **Stacking**: Multiple intervals stack vertically with appropriate spacing

## Events

The visualization dispatches custom events:

### `intervalChange`

Fired when an interval is modified through interaction.

**Event Detail:**
```javascript
{
  id: 'interval-id',
  interval: RationalInterval
}
```

**Example:**
```javascript
container.addEventListener('intervalChange', (e) => {
  console.log(`Interval ${e.detail.id} changed to:`, e.detail.interval.toString());
});
```

## Export Functionality

### `exportSVG()`

Returns a standalone SVG string with embedded styles.

**Returns:** `string` - Complete SVG markup

**Example:**
```javascript
const svgData = viz.exportSVG();
const blob = new Blob([svgData], { type: 'image/svg+xml' });
const url = URL.createObjectURL(blob);
// Use for download or display
```

## Advanced Usage

### Multi-Step Operations

For complex mathematical operations, use `MultiStepVisualization`:

```javascript
import { MultiStepVisualization } from './src/IntervalVisualization.js';

const multiViz = new MultiStepVisualization(container);
multiViz.visualizeExpressionTree(operationTree, result);
```

### Custom Styling

The visualization uses CSS classes that can be customized:

```css
.interval-label {
  font-family: monospace;
  font-size: 12px;
  font-weight: bold;
}
```

## Integration with RatMath

### Parser Integration

```javascript
import { Parser } from './index.js';

// Parse interval expressions
const interval1 = Parser.parse('1/3:2/3');
const interval2 = Parser.parse('0.5:1.5');

// Add to visualization
viz.addInterval(interval1, { label: 'Thirds', draggable: true });
viz.addInterval(interval2, { label: 'Halves', draggable: true });
```

### Operation Results

```javascript
// Perform interval arithmetic
const result = interval1.add(interval2);

// Visualize the operation
viz.addInterval(interval1, { label: 'A', color: '#2563eb' });
viz.addInterval(interval2, { label: 'B', color: '#dc2626' });
viz.addInterval(result, { label: 'A + B', color: '#059669', isResult: true });
```

## Error Handling

The class handles various error conditions gracefully:

- **Invalid intervals**: Displays error message
- **Out-of-range values**: Auto-adjusts range or clips to bounds
- **Malformed input**: Provides meaningful error feedback

## Performance Considerations

- **SVG Rendering**: Optimized for up to ~20 intervals
- **Drag Optimization**: Uses requestAnimationFrame for smooth updates
- **Memory Management**: Automatic cleanup of event listeners

## Browser Compatibility

- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **SVG Requirements**: Requires SVG support
- **Touch Support**: Full touch/mobile device support
- **Accessibility**: Screen reader and keyboard navigation support

## Examples

### Basic Interval Display

```javascript
const viz = new IntervalVisualization(document.getElementById('container'));
const interval = new RationalInterval(new Rational(1, 2), new Rational(3, 2));
viz.addInterval(interval, { label: '1/2:3/2', draggable: true });
```

### Mathematical Operation Visualization

```javascript
const a = Parser.parse('1:2');
const b = Parser.parse('1.5:2.5');
const result = a.intersect(b);

viz.addInterval(a, { label: 'A', color: '#2563eb', draggable: true });
viz.addInterval(b, { label: 'B', color: '#dc2626', draggable: true });
viz.addInterval(result, { label: 'A ∩ B', color: '#059669', isResult: true });
```

### Custom Range and Step Size

```javascript
viz.setRange(new Rational(-2), new Rational(5));
viz.setDragStepSize(new Rational(1, 4)); // Quarter steps
viz.addInterval(Parser.parse('0:1'), { draggable: true });
```

## API Reference Summary

| Method | Purpose | Parameters |
|--------|---------|------------|
| `addInterval()` | Add interval to visualization | interval, options |
| `setRange()` | Set fixed number line range | min, max |
| `enableAutoRange()` | Enable automatic range fitting | none |
| `setDragStepSize()` | Set drag quantization | stepSize |
| `exportSVG()` | Export as SVG string | none |
| `destroy()` | Clean up resources | none |

## See Also

- [RationalInterval Class Documentation](./rational-interval.md)
- [Parser Documentation](./parser.md)
- [Web Calculator Integration Guide](./web-calculator.md)
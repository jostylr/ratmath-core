/**
 * Interval Visualization Library for RatMath
 * 
 * Provides SVG-based visualization of rational intervals on number lines
 * with support for operations, interactive manipulation, and educational tools.
 */

import { Rational, RationalInterval } from "../index.js";

export class IntervalVisualization {
  constructor(container, options = {}) {
    this.container = container;
    this.width = options.width || 800;
    this.height = options.height || 250; // Increased height to prevent cutoff
    this.margin = options.margin || { top: 60, right: 60, bottom: 80, left: 60 }; // Increased margins for better spacing
    this.plotWidth = this.width - this.margin.left - this.margin.right;
    this.plotHeight = this.height - this.margin.top - this.margin.bottom;
    
    // Visualization state
    this.intervals = [];
    this.range = { min: new Rational(-10), max: new Rational(10) };
    this.autoRange = true;
    this.dragStepSize = new Rational(1, 10); // Default step size: 0.1
    this.selectedIntervalId = null; // Track selected interval for keyboard navigation
    this.selectedEndpoint = null; // Track selected endpoint: 'left', 'right', or 'interval'
    this.selectableElements = []; // Track all selectable elements in tab order
    this.recentlyDragged = false; // Track if we just finished dragging to prevent unwanted clicks
    
    // Style configuration
    this.colors = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed'];
    this.colorIndex = 0;
    
    this.initializeSVG();
  }
  
  initializeSVG() {
    // Create SVG element
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", this.width);
    this.svg.setAttribute("height", this.height);
    this.svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
    this.svg.style.border = "1px solid #e5e7eb";
    this.svg.style.borderRadius = "8px";
    this.svg.style.background = "white";
    this.svg.style.minWidth = `${this.width}px`; // Ensure minimum width for scrolling
    this.svg.style.display = "block"; // Prevent inline spacing issues
    
    // Create main group for plot area
    this.plotGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.plotGroup.setAttribute("transform", `translate(${this.margin.left}, ${this.margin.top})`);
    this.svg.appendChild(this.plotGroup);
    
    // Create axis group
    this.axisGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.plotGroup.appendChild(this.axisGroup);
    
    // Create intervals group
    this.intervalsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.plotGroup.appendChild(this.intervalsGroup);
    
    // Create tooltip
    this.tooltip = document.createElement("div");
    this.tooltip.style.position = "absolute";
    this.tooltip.style.background = "rgba(0, 0, 0, 0.8)";
    this.tooltip.style.color = "white";
    this.tooltip.style.padding = "8px 12px";
    this.tooltip.style.borderRadius = "4px";
    this.tooltip.style.fontSize = "12px";
    this.tooltip.style.pointerEvents = "none";
    this.tooltip.style.opacity = "0";
    this.tooltip.style.transition = "opacity 0.2s";
    this.tooltip.style.zIndex = "1000";
    document.body.appendChild(this.tooltip);
    
    // Append to container
    this.container.appendChild(this.svg);
    
    this.renderAxis();
  }
  
  xScale(value) {
    // Convert rational to position on x-axis
    const range = this.range.max.subtract(this.range.min);
    const position = value.subtract(this.range.min);
    return (position.toDecimal() / range.toDecimal()) * this.plotWidth;
  }
  
  updateRange() {
    if (!this.autoRange || this.intervals.length === 0) return;
    
    let min = null;
    let max = null;
    
    for (const intervalData of this.intervals) {
      const interval = intervalData.interval;
      if (min === null || interval.low.lessThan(min)) {
        min = interval.low;
      }
      if (max === null || interval.high.greaterThan(max)) {
        max = interval.high;
      }
    }
    
    if (min !== null && max !== null) {
      // Add smaller padding for tighter display
      const range = max.subtract(min);
      const padding = range.multiply(new Rational(1, 20)); // 5% padding instead of 10%
      // Ensure minimum padding of 0.5 units
      const minPadding = new Rational(1, 2);
      const actualPadding = padding.lessThan(minPadding) ? minPadding : padding;
      this.range.min = min.subtract(actualPadding);
      this.range.max = max.add(actualPadding);
    }
  }
  
  renderAxis() {
    // Clear existing axis
    this.axisGroup.innerHTML = "";
    
    // Main axis line
    const axisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    axisLine.setAttribute("x1", 0);
    axisLine.setAttribute("y1", this.plotHeight / 2);
    axisLine.setAttribute("x2", this.plotWidth);
    axisLine.setAttribute("y2", this.plotHeight / 2);
    axisLine.setAttribute("stroke", "#374151");
    axisLine.setAttribute("stroke-width", "2");
    this.axisGroup.appendChild(axisLine);
    
    // Generate tick marks and labels
    this.generateTicks();
  }
  
  generateTicks() {
    const range = this.range.max.subtract(this.range.min);
    const rangeDecimal = parseFloat(range.toDecimal());
    
    // Determine appropriate tick spacing
    let tickSpacing;
    if (rangeDecimal <= 2) {
      tickSpacing = new Rational(1, 4);
    } else if (rangeDecimal <= 10) {
      tickSpacing = new Rational(1);
    } else if (rangeDecimal <= 50) {
      tickSpacing = new Rational(5);
    } else {
      tickSpacing = new Rational(10);
    }
    
    // Find first tick position - manually implement ceiling for rational numbers
    const minDivided = this.range.min.divide(tickSpacing);
    const firstTickMultiplier = new Rational(Math.ceil(parseFloat(minDivided.toDecimal())));
    const firstTick = firstTickMultiplier.multiply(tickSpacing);
    
    // Generate ticks
    let currentTick = firstTick;
    while (currentTick.lessThanOrEqual(this.range.max)) {
      const x = this.xScale(currentTick);
      
      // Major tick mark
      const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
      tick.setAttribute("x1", x);
      tick.setAttribute("y1", this.plotHeight / 2 - 8);
      tick.setAttribute("x2", x);
      tick.setAttribute("y2", this.plotHeight / 2 + 8);
      tick.setAttribute("stroke", "#374151");
      tick.setAttribute("stroke-width", "1");
      this.axisGroup.appendChild(tick);
      
      // Tick label
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", x);
      label.setAttribute("y", this.plotHeight / 2 + 25);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "12");
      label.setAttribute("font-family", "monospace");
      label.setAttribute("fill", "#374151");
      
      // Format label based on the value
      const labelText = this.formatTickLabel(currentTick);
      label.textContent = labelText;
      this.axisGroup.appendChild(label);
      
      currentTick = currentTick.add(tickSpacing);
    }
  }
  
  formatTickLabel(rational) {
    // Show simple decimals for common fractions, otherwise show fraction
    const decimal = rational.toDecimal();
    if (decimal.length <= 4 && !decimal.includes("...")) {
      return decimal;
    } else {
      return rational.toString();
    }
  }
  
  addInterval(interval, options = {}) {
    let color = options.color || this.colors[this.colorIndex % this.colors.length];
    
    // Make non-draggable operands pale if they're not results
    if (!options.draggable && !options.isResult) {
      color = this.makePaleColor(color);
    }
    
    const intervalData = {
      interval: interval,
      color: color,
      label: options.label || `Interval ${this.intervals.length + 1}`,
      id: options.id || `interval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      draggable: options.draggable !== false,
      isResult: options.isResult || false // New flag to indicate if this is a result
    };
    
    this.intervals.push(intervalData);
    this.colorIndex++;
    
    this.updateRange();
    this.renderAxis();
    this.renderIntervals();
    
    return intervalData.id;
  }
  
  removeInterval(id) {
    this.intervals = this.intervals.filter(interval => interval.id !== id);
    this.updateRange();
    this.renderAxis();
    this.renderIntervals();
  }
  
  clearIntervals() {
    this.intervals = [];
    this.colorIndex = 0;
    this.updateRange();
    this.renderAxis();
    this.renderIntervals();
  }
  
  renderIntervals() {
    // Store current selection before clearing
    const wasSelected = this.selectedIntervalId;
    const wasSelectedEndpoint = this.selectedEndpoint;
    
    // Clear existing intervals and selectable elements
    this.intervalsGroup.innerHTML = "";
    this.selectableElements = [];
    
    // Render each interval
    this.intervals.forEach((intervalData, index) => {
      this.renderInterval(intervalData, index);
    });
    
    // Set initial selection to first input's left endpoint if no previous selection
    if (!wasSelected && this.selectableElements.length > 0) {
      // Find the first draggable interval's left endpoint
      const firstInputElement = this.selectableElements.find(sel => 
        sel.endpointType === 'left' && 
        this.intervals.find(iv => iv.id === sel.intervalId)?.draggable
      );
      
      if (firstInputElement) {
        setTimeout(() => {
          this.selectElement(firstInputElement.intervalId, firstInputElement.endpointType);
        }, 0);
      }
    } else if (wasSelected && wasSelectedEndpoint) {
      // Restore previous selection
      setTimeout(() => {
        this.selectElement(wasSelected, wasSelectedEndpoint);
      }, 0);
    }
  }
  
  renderInterval(intervalData, index) {
    const { interval, color, label, id, draggable, isResult } = intervalData;
    
    // Position operands above the axis line, results below
    const operandIndex = this.intervals.filter((iv, i) => i < index && !iv.isResult).length;
    const resultIndex = this.intervals.filter((iv, i) => i < index && iv.isResult).length;
    
    const y = isResult 
      ? this.plotHeight / 2 + 45 + (resultIndex * 30) // Results below axis (further from tick marks)
      : this.plotHeight / 2 - 15 - (operandIndex * 30); // Operands above axis (more spacing)
    
    // Create group for this interval
    const intervalGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    intervalGroup.setAttribute("data-interval-id", id);
    
    const x1 = this.xScale(interval.low);
    const x2 = this.xScale(interval.high);
    
    // Interval line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "4");
    line.setAttribute("stroke-linecap", "round");
    if (draggable) {
      line.style.cursor = "move";
    }
    intervalGroup.appendChild(line);
    
    // Left endpoint (closed)
    const leftPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    leftPoint.setAttribute("cx", x1);
    leftPoint.setAttribute("cy", y);
    leftPoint.setAttribute("r", "6");
    leftPoint.setAttribute("fill", color);
    leftPoint.setAttribute("stroke", "white");
    leftPoint.setAttribute("stroke-width", "2");
    if (draggable) {
      leftPoint.style.cursor = "ew-resize";
      leftPoint.setAttribute("data-endpoint", "low");
    }
    intervalGroup.appendChild(leftPoint);
    
    // Right endpoint (closed)
    const rightPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    rightPoint.setAttribute("cx", x2);
    rightPoint.setAttribute("cy", y);
    rightPoint.setAttribute("r", "6");
    rightPoint.setAttribute("fill", color);
    rightPoint.setAttribute("stroke", "white");
    rightPoint.setAttribute("stroke-width", "2");
    if (draggable) {
      rightPoint.style.cursor = "ew-resize";
      rightPoint.setAttribute("data-endpoint", "high");
    }
    intervalGroup.appendChild(rightPoint);
    
    // Label
    const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    labelText.setAttribute("x", (x1 + x2) / 2);
    // Put text above operands, below results
    labelText.setAttribute("y", isResult ? y + 25 : y - 15);
    labelText.setAttribute("text-anchor", "middle");
    labelText.setAttribute("font-size", "12");
    labelText.setAttribute("font-family", "monospace");
    labelText.setAttribute("fill", color);
    labelText.setAttribute("font-weight", "bold");
    labelText.setAttribute("class", "interval-label");
    labelText.textContent = label;
    intervalGroup.appendChild(labelText);
    
    // Add tooltip handlers
    this.addTooltipHandlers(intervalGroup, intervalData);
    
    // Add combined drag and selection handlers if draggable
    if (draggable) {
      this.addInteractionHandlers(intervalGroup, intervalData);
    }
    
    this.intervalsGroup.appendChild(intervalGroup);
  }
  
  updateIntervalLabel(intervalData) {
    // Update the label to show current interval values
    const labelElement = this.svg.querySelector(`g[data-interval-id="${intervalData.id}"] .interval-label`);
    if (labelElement) {
      // Extract the original label part before the bracket
      const originalLabel = intervalData.label.split(' [')[0];
      labelElement.textContent = `${originalLabel} [${intervalData.interval.low.toString()}:${intervalData.interval.high.toString()}]`;
    }
  }
  
  addTooltipHandlers(element, intervalData) {
    const showTooltip = (e) => {
      const { interval, label } = intervalData;
      const content = `${label}<br/>Range: [${interval.low.toString()}, ${interval.high.toString()}]<br/>Width: ${interval.high.subtract(interval.low).toString()}`;
      this.tooltip.innerHTML = content;
      this.tooltip.style.opacity = "1";
      this.tooltip.style.left = (e.pageX + 10) + "px";
      this.tooltip.style.top = (e.pageY - 10) + "px";
    };
    
    const hideTooltip = () => {
      this.tooltip.style.opacity = "0";
    };
    
    element.addEventListener("mouseenter", showTooltip);
    element.addEventListener("mouseleave", hideTooltip);
    element.addEventListener("mousemove", showTooltip);
  }
  
  addInteractionHandlers(intervalGroup, intervalData) {
    // Get the individual elements
    const line = intervalGroup.querySelector('line');
    const leftPoint = intervalGroup.querySelector('[data-endpoint="low"]');
    const rightPoint = intervalGroup.querySelector('[data-endpoint="high"]');
    
    // Set up drag and click functionality
    this.setupElementInteraction(leftPoint, intervalData, 'left');
    this.setupElementInteraction(line, intervalData, 'interval');
    this.setupElementInteraction(rightPoint, intervalData, 'right');
  }
  
  setupElementInteraction(element, intervalData, endpointType) {
    if (!element) return;
    
    // Set up tabindex and data attributes for selection
    element.setAttribute("tabindex", "0");
    element.style.outline = "none";
    element.dataset.intervalId = intervalData.id;
    element.dataset.endpointType = endpointType;
    
    // Add to selectable elements list
    this.selectableElements.push({
      element: element,
      intervalId: intervalData.id,
      endpointType: endpointType
    });
    
    // Drag state for this element
    let isDragging = false;
    let dragStartX = 0;
    let dragStartMouseX = 0;
    let hasDragged = false;
    let initialLow = null;
    let initialHigh = null;
    
    // Mouse down - start potential drag or click
    element.addEventListener("mousedown", (e) => {
      isDragging = true;
      dragStartMouseX = e.clientX;
      hasDragged = false;
      e.preventDefault();
      
      // Hide tooltip when starting to drag
      this.tooltip.style.opacity = "0";
      
      // Store initial interval values for smooth dragging
      if (endpointType === 'interval') {
        initialLow = intervalData.interval.low;
        initialHigh = intervalData.interval.high;
      } else if (endpointType === 'left') {
        const rect = this.svg.getBoundingClientRect();
        dragStartX = this.xScale(intervalData.interval.low) + this.margin.left + rect.left;
      } else if (endpointType === 'right') {
        const rect = this.svg.getBoundingClientRect();
        dragStartX = this.xScale(intervalData.interval.high) + this.margin.left + rect.left;
      }
      
      // Also select the element immediately on mousedown
      this.selectElement(intervalData.id, endpointType);
    });
    
    // Mouse move - drag if we're in drag mode
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      // Keep tooltip hidden during drag
      this.tooltip.style.opacity = "0";
      
      // If we moved more than a few pixels, it's a drag
      const dragDistance = Math.abs(e.clientX - dragStartMouseX);
      if (dragDistance > 3) {
        hasDragged = true;
        if (endpointType === 'interval') {
          this.performIntervalDrag(e, intervalData, dragStartMouseX, initialLow, initialHigh);
        } else {
          this.performEndpointDrag(e, intervalData, endpointType);
        }
      }
    };
    
    // Mouse up - end drag or handle click
    const handleMouseUp = (e) => {
      if (isDragging) {
        isDragging = false;
        
        // If we actually dragged, update the range to keep the interval visible
        if (hasDragged) {
          this.adjustRangeAfterDrag(intervalData);
        }
        
        initialLow = null;
        initialHigh = null;
        
        // If we didn't drag much, treat as a click (selection already happened on mousedown)
        if (!hasDragged) {
          // Click behavior is already handled by the mousedown selection
        }
      }
    };
    
    // Focus event for keyboard navigation
    element.addEventListener("focus", () => {
      this.selectElement(intervalData.id, endpointType);
    });
    
    // Keyboard navigation
    element.addEventListener("keydown", (e) => {
      if (this.selectedIntervalId === intervalData.id && this.selectedEndpoint === endpointType) {
        this.handleEndpointKeydown(e, intervalData.id, endpointType);
      }
    });
    
    // Attach global mouse handlers
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }
  
  performIntervalDrag(e, intervalData, dragStartMouseX, initialLow, initialHigh) {
    // Calculate total drag distance from initial mouse position
    const totalDragDistance = e.clientX - dragStartMouseX;
    const range = this.range.max.subtract(this.range.min);
    
    // Convert pixel distance to rational value using integer arithmetic to avoid precision issues
    // dragValue = (totalDragDistance / this.plotWidth) * range
    const dragValueNumerator = totalDragDistance;
    const dragValueDenominator = this.plotWidth;
    const pixelRatio = new Rational(dragValueNumerator, dragValueDenominator);
    const dragValue = range.multiply(pixelRatio);
    
    const quantizedDragValue = this.quantizeValue(dragValue);
    
    // Apply drag offset to initial interval values for smooth movement
    const newLow = initialLow.add(quantizedDragValue);
    const newHigh = initialHigh.add(quantizedDragValue);
    intervalData.interval = new RationalInterval(newLow, newHigh);
    
    // Update the visualization (but don't auto-adjust range for single intervals)
    this.updateIntervalAfterChange(intervalData, this.intervals.length === 1);
  }
  
  adjustRangeAfterDrag(intervalData) {
    const interval = intervalData.interval;
    const currentRange = this.range.max.subtract(this.range.min);
    
    // Check if the interval is still well-positioned within the current range
    const leftPosition = this.xScale(interval.low);
    const rightPosition = this.xScale(interval.high);
    const margin = this.plotWidth * 0.1; // 10% margin on each side
    
    // If the interval is mostly off-screen or too close to edges, reposition the range
    if (leftPosition < margin || rightPosition > this.plotWidth - margin || 
        leftPosition < 0 || rightPosition > this.plotWidth) {
      
      // For single intervals, center the interval in the view
      if (this.intervals.length === 1) {
        const intervalCenter = interval.low.add(interval.high).divide(new Rational(2));
        const halfRange = currentRange.divide(new Rational(2));
        
        this.range.min = intervalCenter.subtract(halfRange);
        this.range.max = intervalCenter.add(halfRange);
      } else {
        // For multiple intervals, use the existing updateRange logic
        this.updateRange();
      }
      
      // Re-render the axis and intervals with the new range
      this.renderAxis();
      this.renderIntervals();
    }
  }
  
  performEndpointDrag(e, intervalData, endpointType) {
    // Drag individual endpoint
    const rect = this.svg.getBoundingClientRect();
    const x = e.clientX - rect.left - this.margin.left;
    
    // Convert x position to rational value
    const newRange = this.range.max.subtract(this.range.min);
    const positionRatio = Math.max(0, Math.min(1, x / this.plotWidth));
    const position = new Rational(positionRatio.toString());
    const rawValue = this.range.min.add(newRange.multiply(position));
    const newValue = this.quantizeValue(rawValue);
    
    // Update the appropriate endpoint
    if (endpointType === 'left') {
      // Don't let left endpoint go past right endpoint
      if (newValue.lessThanOrEqual(intervalData.interval.high)) {
        intervalData.interval = new RationalInterval(newValue, intervalData.interval.high);
      }
    } else if (endpointType === 'right') {
      // Don't let right endpoint go past left endpoint
      if (newValue.greaterThanOrEqual(intervalData.interval.low)) {
        intervalData.interval = new RationalInterval(intervalData.interval.low, newValue);
      }
    }
    
    // Update the visualization (but don't auto-adjust range for single intervals)
    this.updateIntervalAfterChange(intervalData, this.intervals.length === 1);
  }
  
  
  selectElement(intervalId, endpointType) {
    // Clear previous selection
    this.clearSelection();
    
    // Set new selection
    this.selectedIntervalId = intervalId;
    this.selectedEndpoint = endpointType;
    
    // Find and highlight the selected element
    const element = this.findSelectableElement(intervalId, endpointType);
    if (element) {
      // Apply selection styling based on endpoint type
      if (endpointType === 'left' || endpointType === 'right') {
        // Highlight endpoint with a ring
        element.style.filter = "drop-shadow(0 0 8px rgba(37, 99, 235, 0.9))";
        element.style.strokeWidth = "3";
      } else {
        // Highlight whole interval
        const intervalGroup = element.closest('g[data-interval-id]');
        if (intervalGroup) {
          intervalGroup.style.filter = "drop-shadow(0 0 5px rgba(37, 99, 235, 0.7))";
        }
      }
      element.focus();
    }
  }
  
  clearSelection() {
    if (this.selectedIntervalId && this.selectedEndpoint) {
      const element = this.findSelectableElement(this.selectedIntervalId, this.selectedEndpoint);
      if (element) {
        // Remove selection styling
        if (this.selectedEndpoint === 'left' || this.selectedEndpoint === 'right') {
          element.style.filter = "none";
          element.style.strokeWidth = "2"; // Reset to default
        } else {
          const intervalGroup = element.closest('g[data-interval-id]');
          if (intervalGroup) {
            intervalGroup.style.filter = "none";
          }
        }
      }
    }
  }
  
  findSelectableElement(intervalId, endpointType) {
    return this.selectableElements.find(sel => 
      sel.intervalId === intervalId && sel.endpointType === endpointType
    )?.element;
  }
  
  handleEndpointKeydown(e, intervalId, endpointType) {
    const intervalData = this.intervals.find(iv => iv.id === intervalId);
    if (!intervalData || !intervalData.draggable) return;
    
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      e.stopPropagation();
      
      const stepSize = this.dragStepSize;
      const direction = e.key === "ArrowLeft" ? -1 : 1;
      const stepValue = stepSize.multiply(new Rational(direction));
      
      if (endpointType === 'left') {
        // Move left endpoint only
        const newLow = intervalData.interval.low.add(stepValue);
        // Ensure left endpoint doesn't go past right endpoint
        if (newLow.lessThanOrEqual(intervalData.interval.high)) {
          intervalData.interval = new RationalInterval(newLow, intervalData.interval.high);
          this.updateIntervalAfterChange(intervalData);
        }
      } else if (endpointType === 'right') {
        // Move right endpoint only
        const newHigh = intervalData.interval.high.add(stepValue);
        // Ensure right endpoint doesn't go past left endpoint
        if (newHigh.greaterThanOrEqual(intervalData.interval.low)) {
          intervalData.interval = new RationalInterval(intervalData.interval.low, newHigh);
          this.updateIntervalAfterChange(intervalData);
        }
      } else if (endpointType === 'interval') {
        // Move whole interval
        const newLow = intervalData.interval.low.add(stepValue);
        const newHigh = intervalData.interval.high.add(stepValue);
        intervalData.interval = new RationalInterval(newLow, newHigh);
        this.updateIntervalAfterChange(intervalData);
      }
    } else if (e.key === "Tab") {
      // Handle tab navigation between endpoints
      this.handleTabNavigation(e, intervalId, endpointType);
    }
  }
  
  handleTabNavigation(e, intervalId, endpointType) {
    // Find current position in selectable elements
    const currentIndex = this.selectableElements.findIndex(sel => 
      sel.intervalId === intervalId && sel.endpointType === endpointType
    );
    
    if (currentIndex === -1) return;
    
    let targetIndex;
    if (e.shiftKey) {
      // Shift+Tab: go to previous selectable element
      targetIndex = currentIndex > 0 ? currentIndex - 1 : this.selectableElements.length - 1;
    } else {
      // Tab: go to next selectable element
      targetIndex = currentIndex < this.selectableElements.length - 1 ? currentIndex + 1 : 0;
    }
    
    const targetElement = this.selectableElements[targetIndex];
    if (targetElement) {
      e.preventDefault();
      this.selectElement(targetElement.intervalId, targetElement.endpointType);
    }
  }
  
  
  makePaleColor(color) {
    // Convert standard colors to pale versions
    const colorMap = {
      '#2563eb': '#93c5fd', // blue to pale blue
      '#dc2626': '#fca5a5', // red to pale red  
      '#059669': '#86efac', // green to pale green
      '#d97706': '#fcd34d', // orange to pale orange
      '#7c3aed': '#c4b5fd'  // purple to pale purple
    };
    
    return colorMap[color] || color;
  }
  
  formatRationalAsMixed(rational) {
    // Convert rational to mixed number format
    if (rational.toMixed) {
      try {
        return rational.toMixed();
      } catch (e) {
        // Fallback if toMixed fails
        return rational.toString();
      }
    } else {
      // Manual mixed number implementation
      try {
        const numeratorStr = rational.toString();
        if (numeratorStr.includes('/')) {
          const [num, den] = numeratorStr.split('/');
          const numerator = BigInt(num);
          const denominator = BigInt(den);
          
          if (denominator === 1n) {
            return numerator.toString();
          }
          
          const wholePart = numerator / denominator;
          const remainder = numerator % denominator;
          
          if (wholePart === 0n) {
            return `${remainder}/${denominator}`;
          } else if (remainder === 0n) {
            return wholePart.toString();
          } else {
            const absRemainder = remainder < 0n ? -remainder : remainder;
            return `${wholePart}..${absRemainder}/${denominator}`;
          }
        } else {
          return numeratorStr; // Already an integer
        }
      } catch (e) {
        return rational.toString(); // Final fallback
      }
    }
  }
  
  quantizeValue(value) {
    // Round value to nearest step size to avoid enormous fractions
    const divided = value.divide(this.dragStepSize);
    const rounded = new Rational(Math.round(parseFloat(divided.toDecimal())));
    return rounded.multiply(this.dragStepSize);
  }
  
  setDragStepSize(stepSize) {
    this.dragStepSize = stepSize;
  }
  
  handleIntervalKeydown(e, intervalData) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      // Move interval left by step size
      const stepSize = this.dragStepSize;
      const newLow = intervalData.interval.low.subtract(stepSize);
      const newHigh = intervalData.interval.high.subtract(stepSize);
      intervalData.interval = new RationalInterval(newLow, newHigh);
      
      this.updateIntervalAfterChange(intervalData);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      // Move interval right by step size
      const stepSize = this.dragStepSize;
      const newLow = intervalData.interval.low.add(stepSize);
      const newHigh = intervalData.interval.high.add(stepSize);
      intervalData.interval = new RationalInterval(newLow, newHigh);
      
      this.updateIntervalAfterChange(intervalData);
    }
  }
  
  updateIntervalAfterChange(intervalData, skipRangeUpdate = false) {
    // Update the label in the data before rendering with mixed numbers
    const originalLabel = intervalData.label.split(' [')[0];
    intervalData.label = `${originalLabel} [${this.formatRationalAsMixed(intervalData.interval.low)}:${this.formatRationalAsMixed(intervalData.interval.high)}]`;
    
    // Store selection state before update
    const wasSelected = this.selectedIntervalId === intervalData.id;
    const wasSelectedEndpoint = this.selectedEndpoint;
    
    // Update the range to include all intervals (unless skipped for single intervals)
    if (!skipRangeUpdate) {
      this.updateRange();
    }
    this.renderAxis();
    
    // Instead of full re-render, just update this specific interval's position and label
    const intervalElement = this.svg.querySelector(`g[data-interval-id="${intervalData.id}"]`);
    if (intervalElement) {
      // Remove old selectable elements for this interval
      this.selectableElements = this.selectableElements.filter(sel => sel.intervalId !== intervalData.id);
      
      // Remove and re-add this specific interval
      intervalElement.remove();
      const index = this.intervals.findIndex(iv => iv.id === intervalData.id);
      this.renderInterval(intervalData, index);
      
      // Restore endpoint-specific selection if it was selected
      if (wasSelected && wasSelectedEndpoint) {
        // Use requestAnimationFrame to ensure DOM is fully updated
        requestAnimationFrame(() => {
          this.selectElement(intervalData.id, wasSelectedEndpoint);
        });
      }
    } else {
      // Fallback to full re-render if element not found
      this.renderIntervals();
    }
    
    // Trigger change event
    this.dispatchEvent('intervalChange', {
      id: intervalData.id,
      interval: intervalData.interval
    });
  }
  
  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    this.container.dispatchEvent(event);
  }
  
  setRange(min, max) {
    this.range.min = min;
    this.range.max = max;
    this.autoRange = false;
    this.renderAxis();
    this.renderIntervals();
  }
  
  enableAutoRange() {
    this.autoRange = true;
    this.updateRange();
    this.renderAxis();
    this.renderIntervals();
  }
  
  exportSVG() {
    // Create a standalone SVG with embedded styles
    const svgClone = this.svg.cloneNode(true);
    
    // Set proper SVG namespace and attributes  
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    svgClone.setAttribute('version', '1.1');
    
    // Calculate proper bounds including all content (especially operator circles)
    // The operator circles extend to margin.left - 30, so we need to account for that
    const leftExtent = 0; // Already starts at 0
    const rightExtent = this.width;
    const topExtent = 0; 
    const bottomExtent = this.height;
    
    // Add extra padding for safety
    const padding = 60;
    const exportWidth = rightExtent - leftExtent + (padding * 2);
    const exportHeight = bottomExtent - topExtent + (padding * 2);
    
    svgClone.setAttribute('width', exportWidth);
    svgClone.setAttribute('height', exportHeight);
    svgClone.setAttribute('viewBox', `${leftExtent - padding} ${topExtent - padding} ${exportWidth} ${exportHeight}`);
    
    // Add embedded styles
    const styleElement = document.createElementNS("http://www.w3.org/2000/svg", "style");
    styleElement.textContent = `
      <![CDATA[
      text { 
        font-family: "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
        font-size: 12px;
        fill: #374151;
      }
      line { 
        stroke-linecap: round; 
      }
      circle {
        stroke-width: 2;
      }
      .tooltip { 
        display: none; 
      }
      ]]>
    `;
    svgClone.insertBefore(styleElement, svgClone.firstChild);
    
    // Add XML declaration
    const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
    return xmlDeclaration + '\n' + svgClone.outerHTML;
  }
  
  destroy() {
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
  }
}

export class OperationVisualization extends IntervalVisualization {
  constructor(container, options = {}) {
    super(container, { ...options, height: options.height || 400 });
    this.operationHistory = [];
  }
  
  visualizeOperation(operand1, operand2, operation, result) {
    this.clearIntervals();
    
    // Add operands
    const id1 = this.addInterval(operand1, { 
      label: "Operand 1", 
      color: this.colors[0],
      draggable: true 
    });
    
    const id2 = this.addInterval(operand2, { 
      label: "Operand 2", 
      color: this.colors[1],
      draggable: true 
    });
    
    // Add result
    const resultId = this.addInterval(result, { 
      label: `Result (${operation})`, 
      color: this.colors[2],
      draggable: false 
    });
    
    // Store operation for recalculation when operands change
    this.currentOperation = {
      operand1: operand1,
      operand2: operand2,
      operation: operation,
      result: result,
      ids: { operand1: id1, operand2: id2, result: resultId }
    };
    
    // Listen for interval changes to recalculate
    this.container.addEventListener('intervalChange', (e) => {
      this.handleOperandChange(e.detail);
    });
    
    return {
      operand1Id: id1,
      operand2Id: id2,
      resultId: resultId
    };
  }
  
  handleOperandChange(detail) {
    if (!this.currentOperation) return;
    
    const { ids, operation } = this.currentOperation;
    
    // Update the operand that changed
    if (detail.id === ids.operand1) {
      this.currentOperation.operand1 = detail.interval;
    } else if (detail.id === ids.operand2) {
      this.currentOperation.operand2 = detail.interval;
    }
    
    // Recalculate result
    const newResult = this.calculateOperation(
      this.currentOperation.operand1,
      this.currentOperation.operand2,
      operation
    );
    
    // Update result interval
    const resultIntervalData = this.intervals.find(i => i.id === ids.result);
    if (resultIntervalData) {
      resultIntervalData.interval = newResult;
      this.currentOperation.result = newResult;
      this.renderIntervals();
    }
    
    // Trigger result change event
    this.dispatchEvent('operationResult', {
      operation: operation,
      operand1: this.currentOperation.operand1,
      operand2: this.currentOperation.operand2,
      result: newResult
    });
  }
  
  calculateOperation(interval1, interval2, operation) {
    switch (operation) {
      case 'add':
        return interval1.add(interval2);
      case 'subtract':
        return interval1.subtract(interval2);
      case 'multiply':
        return interval1.multiply(interval2);
      case 'divide':
        return interval1.divide(interval2);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
}

export class MultiStepVisualization {
  constructor(container, options = {}) {
    this.container = container;
    this.width = options.width || 900;
    this.stages = [];
    this.inputIntervals = new Map(); // Track input intervals for updates
    
    // Create main container
    this.mainDiv = document.createElement('div');
    this.mainDiv.style.width = '100%';
    this.mainDiv.style.height = '100%';
    this.mainDiv.style.overflowY = 'auto';
    this.mainDiv.style.overflowX = 'auto'; // Enable horizontal scrolling too
    
    // No controls div needed
    
    // Create stages container
    this.stagesDiv = document.createElement('div');
    this.mainDiv.appendChild(this.stagesDiv);
    
    this.container.appendChild(this.mainDiv);
  }
  
  visualizeExpressionTree(tree, finalResult) {
    // Clear previous stages
    this.stages.forEach(stage => stage.visualization && stage.visualization.destroy());
    this.stages = [];
    this.inputIntervals.clear();
    this.stagesDiv.innerHTML = '';
    
    // Evaluate the tree and create stages
    this.evaluateTree(tree, 0);
    
    // No final result stage needed - results are shown in operation boxes
    
    // Render all stages
    this.stages.forEach((stage, index) => {
      const stageDiv = document.createElement('div');
      stageDiv.style.marginBottom = '20px';
      stageDiv.style.padding = '15px';
      stageDiv.style.background = '#f9fafb';
      stageDiv.style.borderRadius = '8px';
      
      // Add stage label
      const label = document.createElement('div');
      label.style.marginBottom = '10px';
      label.style.fontWeight = 'bold';
      label.style.color = '#374151';
      label.textContent = stage.isFinal ? `Final Result` : `Step ${index + 1}: ${stage.expression}`;
      stageDiv.appendChild(label);
      
      // Add visualization container
      const vizContainer = document.createElement('div');
      stageDiv.appendChild(vizContainer);
      
      this.stagesDiv.appendChild(stageDiv);
      
      // Create visualization - use full container width, force calculation
      setTimeout(() => {
        const containerWidth = vizContainer.offsetWidth || vizContainer.clientWidth || 800;
        const viz = new IntervalVisualization(vizContainer, {
          width: Math.max(containerWidth - 40, 800), // Subtract padding, minimum 800px
          height: 220 // Increased to prevent label cutoff
        });
        
        stage.visualization = viz;
        
        // Add intervals based on stage type
        if (stage.type === 'operation') {
        // Add operands with mixed number formatting
        const id1 = viz.addInterval(stage.leftValue, {
          label: `${stage.leftLabel} [${viz.formatRationalAsMixed(stage.leftValue.low)}:${viz.formatRationalAsMixed(stage.leftValue.high)}]`,
          color: '#2563eb',
          draggable: stage.leftDraggable
        });
        
        const id2 = viz.addInterval(stage.rightValue, {
          label: `${stage.rightLabel} [${viz.formatRationalAsMixed(stage.rightValue.low)}:${viz.formatRationalAsMixed(stage.rightValue.high)}]`,
          color: '#dc2626',
          draggable: stage.rightDraggable
        });
        
        // Add result below operands with mixed number formatting
        const resultId = viz.addInterval(stage.result, {
          label: `= ${viz.formatRationalAsMixed(stage.result.low)}:${viz.formatRationalAsMixed(stage.result.high)}`,
          color: '#7c3aed',
          draggable: false,
          isResult: true // Mark as result to position below axis
        });
        
          // Add operator label as SVG text element to the left of the number line
          const operatorBg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          operatorBg.setAttribute("cx", viz.margin.left - 30); // Position to the left of the axis
          operatorBg.setAttribute("cy", viz.plotHeight / 2 + viz.margin.top);
          operatorBg.setAttribute("r", "18");
          operatorBg.setAttribute("fill", "white");
          operatorBg.setAttribute("stroke", "#374151");
          operatorBg.setAttribute("stroke-width", "2");
          viz.svg.appendChild(operatorBg);
          
          const operatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
          operatorText.setAttribute("x", viz.margin.left - 30); // Same x position as background
          operatorText.setAttribute("y", viz.plotHeight / 2 + viz.margin.top + 6);
          operatorText.setAttribute("text-anchor", "middle");
          operatorText.setAttribute("font-size", "20");
          operatorText.setAttribute("font-family", "monospace");
          operatorText.setAttribute("font-weight", "bold");
          operatorText.setAttribute("fill", "#374151");
          operatorText.textContent = stage.operator;
          viz.svg.appendChild(operatorText);
          
          // Set up live updates for draggable inputs
          if (stage.leftDraggable || stage.rightDraggable) {
            vizContainer.addEventListener('intervalChange', (e) => {
              this.handleIntervalChange(e.detail, stage, viz, index);
            });
          }
          
          // Store references for updates
          stage.leftId = id1;
          stage.rightId = id2;
          stage.resultId = resultId;
        } else {
          // Single interval display (shouldn't happen with new structure)
          viz.addInterval(stage.value, {
            label: stage.expression,
            color: '#2563eb',
            draggable: false
          });
        }
      }, 0); // End setTimeout
    }); // End forEach
  }
  
  evaluateTree(node, depth) {
    if (!node) return null;
    
    if (node.type === 'value') {
      // Leaf node - just store the input reference
      if (node.isInput) {
        this.inputIntervals.set(node.expression, {
          value: node.value,
          nodes: []
        });
      }
      return { value: node.value, stageIndex: -1, isInput: node.isInput, expression: node.expression };
    } else if (node.type === 'operation') {
      // Evaluate children first
      let leftResult, rightResult;
      
      if (node.left.type === 'value') {
        leftResult = {
          value: node.left.value,
          stageIndex: -1,
          isInput: node.left.isInput,
          expression: node.left.expression
        };
        if (node.left.isInput) {
          this.inputIntervals.set(node.left.expression, {
            value: node.left.value,
            nodes: []
          });
        }
      } else {
        leftResult = this.evaluateTree(node.left, depth + 1);
      }
      
      if (node.right.type === 'value') {
        rightResult = {
          value: node.right.value,
          stageIndex: -1,
          isInput: node.right.isInput,
          expression: node.right.expression
        };
        if (node.right.isInput) {
          this.inputIntervals.set(node.right.expression, {
            value: node.right.value,
            nodes: []
          });
        }
      } else {
        rightResult = this.evaluateTree(node.right, depth + 1);
      }
      
      // Calculate result
      let result;
      switch (node.operation) {
        case 'add':
          result = leftResult.value.add(rightResult.value);
          break;
        case 'subtract':
          result = leftResult.value.subtract(rightResult.value);
          break;
        case 'multiply':
          result = leftResult.value.multiply(rightResult.value);
          break;
        case 'divide':
          result = leftResult.value.divide(rightResult.value);
          break;
      }
      
      // Create stage for this operation
      const currentStageIndex = this.stages.length;
      const stage = {
        type: 'operation',
        expression: `${this.getNodeExpression(node.left)} ${node.operator} ${this.getNodeExpression(node.right)}`,
        operator: node.operator,
        leftValue: leftResult.value,
        rightValue: rightResult.value,
        leftLabel: this.getNodeExpression(node.left),
        rightLabel: this.getNodeExpression(node.right),
        leftDraggable: leftResult.isInput,
        rightDraggable: rightResult.isInput,
        result: result,
        depth: depth,
        node: node,
        // Track dependencies
        leftDependsOnStage: leftResult.stageIndex,
        rightDependsOnStage: rightResult.stageIndex,
        leftIsInput: leftResult.isInput,
        rightIsInput: rightResult.isInput
      };
      
      this.stages.push(stage);
      
      return { value: result, stageIndex: currentStageIndex, isInput: false, expression: stage.expression };
    }
  }
  
  getNodeExpression(node) {
    if (node.type === 'value') {
      return node.expression;
    } else {
      // For operation nodes, create a simple expression string
      return `(${this.getNodeExpression(node.left)} ${node.operator} ${this.getNodeExpression(node.right)})`;
    }
  }
  
  handleIntervalChange(detail, changedStage, viz, stageIndex) {
    // Update the changed interval in the stage
    if (detail.id === changedStage.leftId) {
      changedStage.leftValue = detail.interval;
    } else if (detail.id === changedStage.rightId) {
      changedStage.rightValue = detail.interval;
    }
    
    // Recalculate this stage's result
    changedStage.result = this.calculateStageResult(changedStage);
    
    // Update the result interval in the visualization
    const resultInterval = viz.intervals.find(i => i.id === changedStage.resultId);
    if (resultInterval) {
      resultInterval.interval = changedStage.result;
      resultInterval.label = `= ${viz.formatRationalAsMixed(changedStage.result.low)}:${viz.formatRationalAsMixed(changedStage.result.high)}`;
      viz.updateRange(); // Update range to include new result
      viz.renderAxis();
      viz.renderIntervals();
    }
    
    // Update all subsequent stages that depend on this one
    this.updateDependentStages(stageIndex);
  }
  
  calculateStageResult(stage) {
    switch (stage.operator) {
      case '+':
        return stage.leftValue.add(stage.rightValue);
      case '-':
        return stage.leftValue.subtract(stage.rightValue);
      case '*':
        return stage.leftValue.multiply(stage.rightValue);
      case '/':
        return stage.leftValue.divide(stage.rightValue);
      default:
        return stage.result;
    }
  }
  
  updateDependentStages(fromIndex) {
    // Build a map of current stage results
    const stageResults = new Map();
    for (let i = 0; i < this.stages.length; i++) {
      if (this.stages[i].type === 'operation') {
        stageResults.set(i, this.stages[i].result);
      }
    }
    
    // Propagate changes through dependent stages
    for (let i = fromIndex + 1; i < this.stages.length; i++) {
      const stage = this.stages[i];
      if (stage.type === 'operation') {
        let updated = false;
        
        // Update left operand if it depends on a previous stage
        if (stage.leftDependsOnStage !== undefined && stage.leftDependsOnStage >= 0) {
          const dependentResult = stageResults.get(stage.leftDependsOnStage);
          if (dependentResult && !stage.leftValue.equals || 
              (stage.leftValue.equals && !stage.leftValue.equals(dependentResult))) {
            stage.leftValue = dependentResult;
            updated = true;
            
            // Update visualization
            if (stage.visualization) {
              const leftInterval = stage.visualization.intervals.find(iv => iv.id === stage.leftId);
              if (leftInterval) {
                leftInterval.interval = dependentResult;
                leftInterval.label = `${stage.leftLabel} [${stage.visualization.formatRationalAsMixed(dependentResult.low)}:${stage.visualization.formatRationalAsMixed(dependentResult.high)}]`;
              }
            }
          }
        }
        
        // Update right operand if it depends on a previous stage
        if (stage.rightDependsOnStage !== undefined && stage.rightDependsOnStage >= 0) {
          const dependentResult = stageResults.get(stage.rightDependsOnStage);
          if (dependentResult && !stage.rightValue.equals || 
              (stage.rightValue.equals && !stage.rightValue.equals(dependentResult))) {
            stage.rightValue = dependentResult;
            updated = true;
            
            // Update visualization
            if (stage.visualization) {
              const rightInterval = stage.visualization.intervals.find(iv => iv.id === stage.rightId);
              if (rightInterval) {
                rightInterval.interval = dependentResult;
                rightInterval.label = `${stage.rightLabel} [${stage.visualization.formatRationalAsMixed(dependentResult.low)}:${stage.visualization.formatRationalAsMixed(dependentResult.high)}]`;
              }
            }
          }
        }
        
        // Recalculate this stage's result
        const newResult = this.calculateStageResult(stage);
        stage.result = newResult;
        stageResults.set(i, newResult);
        
        // Update the result visualization
        if (stage.visualization) {
          const resultInterval = stage.visualization.intervals.find(iv => iv.id === stage.resultId);
          if (resultInterval) {
            resultInterval.interval = newResult;
            resultInterval.label = `= ${stage.visualization.formatRationalAsMixed(newResult.low)}:${stage.visualization.formatRationalAsMixed(newResult.high)}`;
          }
          
          // Re-render the visualization with updated range
          stage.visualization.updateRange();
          stage.visualization.renderAxis();
          stage.visualization.renderIntervals();
        }
      }
    }
  }
  
  
  fitAllWindows() {
    this.stages.forEach(stage => {
      if (stage.visualization) {
        stage.visualization.enableAutoRange();
      }
    });
  }
  
  exportSVG() {
    // Export all stages combined with proper bounds
    const stageHeight = 240; // Increased to match individual visualization height
    const totalHeight = this.stages.length * stageHeight;
    const totalWidth = this.width + 120; // Extra width for proper bounds
    
    let combinedSVG = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${totalWidth}" height="${totalHeight}" viewBox="-60 -30 ${totalWidth} ${totalHeight}">
<style>
<![CDATA[
text { 
  font-family: "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
  font-size: 12px;
  fill: #374151;
}
line { 
  stroke-linecap: round; 
}
circle {
  stroke-width: 2;
}
]]>
</style>`;

    this.stages.forEach((stage, index) => {
      if (stage.visualization) {
        const stageSVG = stage.visualization.exportSVG();
        // Extract content from individual SVG (remove XML declaration and wrapper)
        const contentMatch = stageSVG.match(/<svg[^>]*>(.*)<\/svg>/s);
        if (contentMatch) {
          combinedSVG += `<g transform="translate(0, ${index * stageHeight})">${contentMatch[1]}</g>`;
        }
      }
    });

    combinedSVG += '</svg>';
    return combinedSVG;
  }
  
  exportHTML() {
    let html = `<!DOCTYPE html>
<html>
<head>
    <title>Interval Calculation Steps</title>
    <style>
        body { font-family: monospace; margin: 20px; }
        .stage { margin-bottom: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; }
        .stage-title { font-weight: bold; font-size: 1.2em; margin-bottom: 15px; color: #374151; }
        .stage-content { border: 1px solid #e5e7eb; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>Interval Calculation Visualization</h1>`;

    this.stages.forEach((stage, index) => {
      if (stage.visualization) {
        const stageTitle = stage.isFinal ? 'Final Result' : `Step ${index + 1}: ${stage.expression}`;
        const stageSVG = stage.visualization.exportSVG();
        
        html += `
    <div class="stage">
        <div class="stage-title">${stageTitle}</div>
        <div class="stage-content">${stageSVG}</div>
    </div>`;
      }
    });

    html += `
</body>
</html>`;
    return html;
  }

  destroy() {
    this.stages.forEach(stage => {
      if (stage.visualization) {
        stage.visualization.destroy();
      }
    });
    this.stages = [];
  }
}
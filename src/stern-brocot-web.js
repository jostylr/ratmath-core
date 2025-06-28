/**
 * Stern-Brocot Tree Interactive Visualization
 *
 * Interactive web-based visualization of the Stern-Brocot tree showing
 * relationships between rational numbers in the infinite binary tree structure.
 */

import { Fraction, Parser } from "../index.js";

class SternBrocotTreeVisualizer {
  constructor() {
    this.currentFraction = new Fraction(0, 1); // Start at root 0/1
    this.displayMode = "fraction";
    this.cfNotationMode = "ratmath"; // Default to RatMath notation
    this.svg = document.getElementById("treeSvg");
    this.svgWidth = 800;
    this.svgHeight = 600;
    this.scrollOffset = { x: 0, y: 0 }; // For scrolling support
    this.treeContainer = null; // SVG group for tree content

    this.initializeElements();
    this.setupEventListeners();
    this.setupTooltips();
    this.loadFromURL(); // Check for URL hash
    this.updateDisplay();
    this.renderTree();
  }

  initializeElements() {
    // Get all DOM elements
    this.elements = {
      currentFraction: document.getElementById("currentFraction"),
      currentDepth: document.getElementById("currentDepth"),
      currentPath: document.getElementById("currentPath"),
      currentBoundaries: document.getElementById("currentBoundaries"),
      decimalValue: document.getElementById("decimalValue"),
      parentBtn: document.getElementById("parentBtn"),
      leftChildBtn: document.getElementById("leftChildBtn"),
      rightChildBtn: document.getElementById("rightChildBtn"),
      resetBtn: document.getElementById("resetBtn"),
      jumpInput: document.getElementById("jumpInput"),
      jumpBtn: document.getElementById("jumpBtn"),
      breadcrumbPath: document.getElementById("breadcrumbPath"),
      mediantCalculation: document.getElementById("mediantCalculation"),
      continuedFraction: document.getElementById("continuedFraction"),
      convergentsModal: document.getElementById("convergentsModal"),
      fareyModal: document.getElementById("fareyModal"),
      allConvergents: document.getElementById("allConvergents"),
      fareySequenceContent: document.getElementById("fareySequenceContent"),
      closeConvergents: document.getElementById("closeConvergents"),
      closeFarey: document.getElementById("closeFarey"),
      helpBtn: document.getElementById("helpBtn"),
      helpModal: document.getElementById("helpModal"),
      helpContent: document.getElementById("helpContent"),
      closeHelp: document.getElementById("closeHelp"),
      fractionTooltip: document.getElementById("fractionTooltip"),
      expressionInput: document.getElementById("expressionInput"),
      expressionResult: document.getElementById("expressionResult"),
      notationToggle: document.getElementById("notationToggle"),
      sqrt2Btn: document.getElementById("sqrt2Btn"),
      eBtn: document.getElementById("eBtn"),
      piBtn: document.getElementById("piBtn"),
      phiBtn: document.getElementById("phiBtn"),
      // Boundary display elements
      leftBoundaryBox: document.getElementById("leftBoundaryBox"),
      currentNodeBox: document.getElementById("currentNodeBox"),
      rightBoundaryBox: document.getElementById("rightBoundaryBox"),
      leftBoundaryDisplay: document.getElementById("leftBoundaryDisplay"),
      currentNodeDisplay: document.getElementById("currentNodeDisplay"),
      rightBoundaryDisplay: document.getElementById("rightBoundaryDisplay"),
    };
  }

  setupEventListeners() {
    // Navigation buttons
    this.elements.parentBtn.addEventListener("click", () =>
      this.navigateToParent(),
    );
    this.elements.leftChildBtn.addEventListener("click", () =>
      this.navigateToLeftChild(),
    );
    this.elements.rightChildBtn.addEventListener("click", () =>
      this.navigateToRightChild(),
    );
    this.elements.resetBtn.addEventListener("click", () => this.reset());

    // Jump to fraction
    this.elements.jumpBtn.addEventListener("click", () =>
      this.jumpToFraction(),
    );
    this.elements.jumpInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.jumpToFraction();
    });

    // Help button
    this.elements.helpBtn.addEventListener("click", () => this.showHelpModal());

    // Notation toggle button
    this.elements.notationToggle.addEventListener("click", () => this.toggleNotation());

    // Mathematical constant buttons
    this.elements.sqrt2Btn.addEventListener("click", () => this.jumpToConstant("sqrt2"));
    this.elements.eBtn.addEventListener("click", () => this.jumpToConstant("e"));
    this.elements.piBtn.addEventListener("click", () => this.jumpToConstant("pi"));
    this.elements.phiBtn.addEventListener("click", () => this.jumpToConstant("phi"));

    // Boundary display click handlers
    this.elements.leftBoundaryBox.addEventListener("click", () => this.handleBoundaryClick('left'));
    this.elements.currentNodeBox.addEventListener("click", () => this.handleBoundaryClick('current'));
    this.elements.rightBoundaryBox.addEventListener("click", () => this.handleBoundaryClick('right'));

    // Expression calculator
    this.elements.expressionInput.addEventListener("input", () =>
      this.updateExpressionResult(),
    );
    this.elements.expressionInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.updateExpressionResult();
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));

    // SVG click handling
    this.svg.addEventListener("click", (e) => this.handleSvgClick(e));

    // Add scrolling support
    this.svg.addEventListener("wheel", (e) => this.handleScroll(e), {
      passive: false,
    });
    this.svg.addEventListener("touchstart", (e) => this.handleTouchStart(e), {
      passive: false,
    });
    this.svg.addEventListener("touchmove", (e) => this.handleTouchMove(e), {
      passive: false,
    });
    this.svg.addEventListener("touchend", (e) => this.handleTouchEnd(e), {
      passive: false,
    });

    // Modal event listeners
    this.elements.closeConvergents.addEventListener("click", () =>
      this.closeModal("convergents"),
    );
    this.elements.closeFarey.addEventListener("click", () =>
      this.closeModal("farey"),
    );
    this.elements.closeHelp.addEventListener("click", () =>
      this.closeModal("help"),
    );

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === this.elements.convergentsModal)
        this.closeModal("convergents");
      if (e.target === this.elements.fareyModal) this.closeModal("farey");
      if (e.target === this.elements.helpModal) this.closeModal("help");
    });

    // Close modals with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal("convergents");
        this.closeModal("farey");
        this.closeModal("help");
      }
    });

    // Handle browser back/forward
    window.addEventListener("popstate", (e) => {
      this.loadFromURL(false); // Don't push to history
    });
  }

  setupTooltips() {
    // Setup tooltip functionality for hover and long-press
    this.svg.addEventListener(
      "mouseenter",
      this.handleTooltipShow.bind(this),
      true,
    );
    this.svg.addEventListener(
      "mouseleave",
      this.handleTooltipHide.bind(this),
      true,
    );
    this.svg.addEventListener(
      "mousemove",
      this.handleTooltipMove.bind(this),
      true,
    );

    this.longPressTimer = null;
    this.touchStartPos = null;
    this.tooltipTouchTarget = null;
  }

  handleTooltipShow(e) {
    const node = e.target.closest(".tree-node");
    if (node && node.dataset.fraction) {
      const fraction = node.dataset.fraction;
      this.elements.fractionTooltip.textContent = fraction;
      this.elements.fractionTooltip.style.display = "block";
      this.updateTooltipPosition(e);
    }
  }

  handleTooltipHide(e) {
    if (!e.relatedTarget || !e.relatedTarget.closest(".tree-node")) {
      this.elements.fractionTooltip.style.display = "none";
    }
  }

  handleTooltipMove(e) {
    if (this.elements.fractionTooltip.style.display === "block") {
      this.updateTooltipPosition(e);
    }
  }

  updateTooltipPosition(e) {
    const tooltip = this.elements.fractionTooltip;
    const x = e.clientX + 10;
    const y = e.clientY - 30;

    // Keep tooltip on screen
    const rect = tooltip.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 10;
    const maxY = window.innerHeight - rect.height - 10;

    tooltip.style.left = Math.min(x, maxX) + "px";
    tooltip.style.top = Math.max(y, 10) + "px";
  }

  formatFraction(fraction, mode = null, use2D = true) {
    const displayMode = mode || this.displayMode;

    if (fraction.isInfinite) {
      // Show as 1/0 or -1/0 for infinite fractions
      if (use2D) {
        return `<div class="fraction-2d">
            <div class="numerator">${fraction.numerator > 0 ? "1" : "-1"}</div>
            <div class="fraction-bar"></div>
            <div class="denominator">0</div>
        </div>`;
      } else {
        return fraction.numerator > 0 ? "1/0" : "-1/0";
      }
    }

    //if use2D is false then check if length is too long then switch it

    // Handle horizontal fraction format explicitly
    if (!use2D && displayMode === "fraction") {
      let ret = fraction.toString();
      if (ret.length < 17) {
        return ret;
      } else {
        use2D = true;
      }
    }

    // Use 2D format for specific cases
    if (use2D && displayMode === "fraction") {
      return this.format2DFraction(fraction);
    }

    switch (displayMode) {
      case "decimal":
        try {
          const rational = fraction.toRational();
          return rational.toDecimal();
        } catch {
          // Fallback to manual division
          return (
            Number(fraction.numerator) / Number(fraction.denominator)
          ).toFixed(6);
        }
      case "mixed":
        try {
          const rational = fraction.toRational();
          return rational.toMixedString();
        } catch {
          return fraction.toString();
        }
      case "cf":
        try {
          const rational = fraction.toRational();
          const cf = rational.toContinuedFraction();
          if (cf.length === 1) return cf[0].toString();
          return cf[0] + ".~" + cf.slice(1).join("~");
        } catch {
          return fraction.toString();
        }
      default:
        return fraction.toString();
    }
  }

  format2DFraction(fraction) {
    if (fraction.isInfinite) {
      return fraction.numerator > 0 ? "+∞" : "-∞";
    }

    // For HTML display in left panels
    return `<div class="fraction-2d">
            <div class="numerator">${fraction.numerator}</div>
            <div class="fraction-bar"></div>
            <div class="denominator">${fraction.denominator}</div>
        </div>`;
  }

  createSVG2DFraction(fraction, x, y, fontSize) {
    if (fraction.isInfinite) {
      // Display as 1/0 or -1/0 instead of infinity symbol
      const elements = [];
      const lineHeight = fontSize < 16 ? fontSize * 0.6 : fontSize * 0.5;
      
      // Numerator (1 or -1)
      const numerator = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      numerator.setAttribute("x", x);
      numerator.setAttribute("y", y - lineHeight);
      numerator.setAttribute("font-size", fontSize);
      numerator.setAttribute("text-anchor", "middle");
      numerator.setAttribute("dominant-baseline", "central");
      numerator.setAttribute("fill", "black");
      numerator.setAttribute("font-weight", "bold");
      numerator.textContent = fraction.numerator > 0 ? "1" : "-1";
      elements.push(numerator);
      
      // Fraction bar
      const maxWidth = fontSize * 0.8;
      const bar = document.createElementNS("http://www.w3.org/2000/svg", "line");
      bar.setAttribute("x1", x - maxWidth / 2);
      bar.setAttribute("y1", y);
      bar.setAttribute("x2", x + maxWidth / 2);
      bar.setAttribute("y2", y);
      bar.setAttribute("stroke", "black");
      bar.setAttribute("stroke-width", "2");
      elements.push(bar);
      
      // Denominator (0)
      const denominator = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      denominator.setAttribute("x", x);
      denominator.setAttribute("y", y + lineHeight);
      denominator.setAttribute("font-size", fontSize);
      denominator.setAttribute("text-anchor", "middle");
      denominator.setAttribute("dominant-baseline", "central");
      denominator.setAttribute("fill", "black");
      denominator.setAttribute("font-weight", "bold");
      denominator.textContent = "0";
      elements.push(denominator);
      
      return elements;
    }

    const elements = [];
    // Adjust spacing based on font size - more spacing for smaller fonts
    const lineHeight = fontSize < 16 ? fontSize * 0.6 : fontSize * 0.5;

    // Numerator
    const numerator = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    numerator.setAttribute("x", x);
    numerator.setAttribute("y", y - lineHeight);
    numerator.setAttribute("font-size", fontSize);
    numerator.setAttribute("text-anchor", "middle");
    numerator.setAttribute("dominant-baseline", "central");
    numerator.setAttribute("fill", "black");
    numerator.setAttribute("font-weight", "bold");
    numerator.textContent = fraction.numerator.toString();
    elements.push(numerator);

    // Fraction bar
    const maxWidth =
      Math.max(
        fraction.numerator.toString().length,
        fraction.denominator.toString().length,
      ) *
      fontSize *
      0.7; // Slightly wider for better proportion

    const bar = document.createElementNS("http://www.w3.org/2000/svg", "line");
    bar.setAttribute("x1", x - maxWidth / 2);
    bar.setAttribute("y1", y);
    bar.setAttribute("x2", x + maxWidth / 2);
    bar.setAttribute("y2", y);
    bar.setAttribute("stroke", "black");
    bar.setAttribute("stroke-width", "2"); // Slightly thicker
    elements.push(bar);

    // Denominator
    const denominator = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    denominator.setAttribute("x", x);
    denominator.setAttribute("y", y + lineHeight);
    denominator.setAttribute("font-size", fontSize);
    denominator.setAttribute("text-anchor", "middle");
    denominator.setAttribute("dominant-baseline", "central");
    denominator.setAttribute("fill", "black");
    denominator.setAttribute("font-weight", "bold");
    denominator.textContent = fraction.denominator.toString();
    elements.push(denominator);

    return elements;
  }

  updateDisplay() {
    // Update current fraction display with 2D format
    this.elements.currentFraction.innerHTML = this.formatFraction(
      this.currentFraction,
      "fraction",
      true,
    );

    // Update depth
    const depth = this.currentFraction.sternBrocotDepth();
    this.elements.currentDepth.textContent =
      depth === Infinity ? "∞" : depth.toString();

    // Update boundary display
    this.updateBoundaryDisplay();

    // Update decimal value with repeating decimal format
    try {
      const rational = this.currentFraction.toRational();
      const decimalInfo = rational.toRepeatingDecimalWithPeriod(true);
      const decimalDisplay =
        decimalInfo.period > 0
          ? `${decimalInfo.decimal} (p:${decimalInfo.period})`
          : decimalInfo.decimal;
      this.elements.decimalValue.textContent = decimalDisplay;
    } catch (e) {
      this.elements.decimalValue.textContent = (
        Number(this.currentFraction.numerator) /
        Number(this.currentFraction.denominator)
      ).toFixed(6);
    }

    // Update path with simple LRLRLR display and intelligent wrapping
    const path = this.currentFraction.sternBrocotPath();
    if (path.length === 0) {
      this.elements.currentPath.textContent = "Root";
    } else {
      const pathString = path.join("");
      this.elements.currentPath.innerHTML = this.wrapPath(pathString);
    }

    // Update boundaries with better layout
    const parents = this.currentFraction.fareyParents();
    const leftBoundary = this.formatFraction(parents.left, "fraction", true);
    const rightBoundary = this.formatFraction(parents.right, "fraction", true);
    const currentBoundary = this.formatFraction(
      this.currentFraction,
      "fraction",
      true,
    );
    this.elements.currentBoundaries.innerHTML = `
            <div class="boundaries-line">
                <span class="left-boundary">${leftBoundary}</span>
                <span class="right-boundary">${rightBoundary}</span>
            </div>
            <div class="current-boundary">${currentBoundary}</div>
        `;

    // Update navigation button states
    const hasParent = this.currentFraction.sternBrocotParent() !== null;
    this.elements.parentBtn.disabled = !hasParent;

    // Update breadcrumbs
    this.updateBreadcrumbs();

    // Update mediant calculation
    this.updateMediantCalculation();

    // Update continued fraction
    this.updateContinuedFraction();

    // Update expression result
    this.updateExpressionResult();
  }

  updateBreadcrumbs() {
    const ancestors = this.currentFraction.sternBrocotAncestors();
    const path = this.currentFraction.sternBrocotPath();

    let breadcrumbHtml = "";

    // Add root with click navigation
    const rootFraction = new Fraction(0, 1);
    const rootDisplay = this.formatFraction(rootFraction, "fraction", false);
    breadcrumbHtml += `<span class="breadcrumb clickable-breadcrumb" onclick="sternBrocotApp.navigateToFraction('0', '1')" title="Click to navigate to root">${rootDisplay} (Root)</span>`;

    // Add each step in the path with appropriate formatting and click navigation
    for (let i = 0; i < path.length; i++) {
      const partialPath = path.slice(0, i + 1);
      const fraction = Fraction.fromSternBrocotPath(partialPath);
      const direction = path[i]; // Use R/L directly
      const directionClass =
        direction === "L" ? "left-direction" : "right-direction";
      const fractionDisplay = this.formatFraction(fraction, "fraction", false);
      const isLast = i === path.length - 1;
      const breadcrumbClass = isLast
        ? "breadcrumb current"
        : "breadcrumb clickable-breadcrumb";
      const clickHandler = isLast
        ? ""
        : `onclick="sternBrocotApp.navigateToFraction('${fraction.numerator}', '${fraction.denominator}')"`;
      const title = isLast
        ? ""
        : `title="Click to navigate to ${fraction.toString()}"`;

      breadcrumbHtml += ` → <span class="${breadcrumbClass} ${directionClass}" ${clickHandler} ${title}>${fractionDisplay} (${direction})</span>`;
    }

    this.elements.breadcrumbPath.innerHTML = breadcrumbHtml;
  }

  updateMediantCalculation() {
    const parents = this.currentFraction.fareyParents();
    const left = parents.left;
    const right = parents.right;

    // Always show mediant calculation, even with infinite boundaries
    const mediant = left.mediant(right);
    const leftStr = this.formatFraction(left, "fraction", true);
    const rightStr = this.formatFraction(right, "fraction", true);
    const mediantStr = this.formatFraction(mediant, "fraction", true);
    const currentStr = this.formatFraction(
      this.currentFraction,
      "fraction",
      true,
    );

    // Format numerator and denominator display properly for infinite fractions
    const leftNum = left.isInfinite ? (left.numerator > 0 ? "1" : "-1") : left.numerator.toString();
    const leftDen = left.isInfinite ? "0" : left.denominator.toString();
    const rightNum = right.isInfinite ? (right.numerator > 0 ? "1" : "-1") : right.numerator.toString();
    const rightDen = right.isInfinite ? "0" : right.denominator.toString();

    const numeratorSum = left.numerator + right.numerator;
    const denominatorSum = left.denominator + right.denominator;

    this.elements.mediantCalculation.innerHTML = `
            <strong>Mediant calculation:</strong><br>
            ${leftStr} ⊕ ${rightStr} =
            <div class="fraction-2d" style="display: inline-block; margin: 0 0.5rem;">
                <div class="numerator">${leftNum}+${rightNum}</div>
                <div class="fraction-bar"></div>
                <div class="denominator">${leftDen}+${rightDen}</div>
            </div>
            =
            <div class="fraction-2d" style="display: inline-block; margin: 0 0.5rem;">
                <div class="numerator">${numeratorSum}</div>
                <div class="fraction-bar"></div>
                <div class="denominator">${denominatorSum}</div>
            </div>
        `;
  }

  updateContinuedFraction() {
    try {
      const rational = this.currentFraction.toRational();
      const cf = rational.toContinuedFraction();

      let cfDisplay, notationLabel;
      if (this.cfNotationMode === "standard") {
        cfDisplay = `[${cf[0]}`;
        if (cf.length > 1) {
          cfDisplay += `; ${cf.slice(1).join(", ")}`;
        }
        cfDisplay += "]";
        notationLabel = "Standard notation";
      } else {
        // RatMath notation
        cfDisplay = cf[0].toString();
        if (cf.length > 1) {
          cfDisplay += ".~" + cf.slice(1).join("~");
        } else {
          cfDisplay += ".~0";
        }
        cfDisplay = this.wrapContinuedFraction(cfDisplay);
        notationLabel = "RatMath notation";
      }

      // Get convergents with enhanced display
      const allConvergents = rational.convergents();
      const displayConvergents = allConvergents.slice(0, 6);
      const remainingCount = allConvergents.length - displayConvergents.length;

      let convergentsDisplay = displayConvergents
        .map((c) =>
          this.formatFraction(Fraction.fromRational(c), "fraction", true),
        )
        .join(", ");

      if (remainingCount > 0) {
        convergentsDisplay += ` <span class="more-link" onclick="sternBrocotApp.showConvergentsModal()">...(+${remainingCount})</span>`;
      }

      this.elements.continuedFraction.innerHTML = `
                <strong>${notationLabel}:</strong> ${cfDisplay}<br>
                <strong><span class="more-link" onclick="sternBrocotApp.showConvergentsModal()" style="text-decoration: none; color: inherit; cursor: pointer;" title="Click to view all convergents">Convergents:</span></strong> <span class="more-link" onclick="sternBrocotApp.showConvergentsModal()" style="cursor: pointer;">${convergentsDisplay}</span>
            `;
    } catch (error) {
      this.elements.continuedFraction.textContent =
        "Error calculating continued fraction";
    }
  }

  navigateToParent() {
    const parent = this.currentFraction.sternBrocotParent();
    if (parent) {
      this.animateToNewFraction(parent);
    }
  }

  navigateToLeftChild() {
    const children = this.currentFraction.sternBrocotChildren();
    this.animateToNewFraction(children.left);
  }

  navigateToRightChild() {
    const children = this.currentFraction.sternBrocotChildren();
    this.animateToNewFraction(children.right);
  }

  reset() {
    this.animateToNewFraction(new Fraction(0, 1));
  }

  toggleNotation() {
    this.cfNotationMode = this.cfNotationMode === "ratmath" ? "standard" : "ratmath";
    this.elements.notationToggle.textContent = this.cfNotationMode === "ratmath" ? "Show Standard" : "Show RatMath";
    this.updateContinuedFraction();
  }

  // Mathematical constants with their continued fraction expansions
  // Each constant has configurable denominator limits for easy modification
  getConstantDefinitions() {
    return {
      sqrt2: {
        name: "√2",
        // √2 = [1; 2, 2, 2, 2, ...] (infinite repeating 2s)
        cfCoeffs: [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        maxDenominator: 1000
      },
      e: {
        name: "e",
        // e = [2; 1, 2, 1, 1, 4, 1, 1, 6, 1, 1, 8, 1, 1, 10, ...]
        cfCoeffs: [2, 1, 2, 1, 1, 4, 1, 1, 6, 1, 1, 8, 1, 1, 10, 1, 1, 12],
        maxDenominator: 1500
      },
      pi: {
        name: "π",
        // π = [3; 7, 15, 1, 292, 1, 1, 1, 2, 1, 3, 1, ...] (irregular pattern)
        cfCoeffs: [3, 7, 15, 1, 292, 1, 1, 1, 2, 1, 3, 1, 14, 2, 1, 1, 2, 2],
        maxDenominator: 2000
      },
      phi: {
        name: "φ (golden ratio)",
        // φ = [1; 1, 1, 1, 1, 1, 1, 1, 1, 1, ...] (infinite repeating 1s)
        // This gives the famous Fibonacci convergents: 1/1, 2/1, 3/2, 5/3, 8/5, 13/8, 21/13, ...
        cfCoeffs: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        maxDenominator: 1200
      }
    };
  }

  jumpToConstant(constantName) {
    const constants = this.getConstantDefinitions();
    const constant = constants[constantName];
    
    if (!constant) {
      console.error(`Unknown constant: ${constantName}`);
      return;
    }

    try {
      // Build continued fraction convergents until we exceed the denominator limit
      let convergents = [];
      let p_minus2 = 1n, p_minus1 = BigInt(constant.cfCoeffs[0]);
      let q_minus2 = 0n, q_minus1 = 1n;
      
      convergents.push(new Fraction(p_minus1, q_minus1));
      
      for (let i = 1; i < constant.cfCoeffs.length; i++) {
        const a = BigInt(constant.cfCoeffs[i]);
        const p = a * p_minus1 + p_minus2;
        const q = a * q_minus1 + q_minus2;
        
        const convergent = new Fraction(p, q);
        convergents.push(convergent);
        
        // Check if this convergent exceeds our denominator limit
        if (Number(q) > constant.maxDenominator) {
          // Use the previous convergent (the last one under the limit)
          const targetFraction = convergents[convergents.length - 2] || convergents[convergents.length - 1];
          this.animateToNewFraction(targetFraction);
          return;
        }
        
        // Update for next iteration
        p_minus2 = p_minus1;
        p_minus1 = p;
        q_minus2 = q_minus1;
        q_minus1 = q;
      }
      
      // If we've processed all coefficients without exceeding the limit, use the last convergent
      const targetFraction = convergents[convergents.length - 1];
      this.animateToNewFraction(targetFraction);
      
    } catch (error) {
      console.error(`Error jumping to ${constant.name}:`, error);
      alert(`Error calculating approximation for ${constant.name}: ${error.message}`);
    }
  }

  animateToNewFraction(newFraction) {
    // Store the old tree for potential animation
    const oldCenter = { x: this.svgWidth / 2, y: this.svgHeight / 2 };

    // Update the fraction
    this.currentFraction = newFraction;

    // Update URL and history
    this.updateURL();

    // Reset scroll offset to center on new fraction
    this.scrollOffset = { x: 0, y: 0 };

    // Update display and re-render tree
    this.updateDisplay();
    this.renderTree();

    // Add a subtle fade-in effect to new nodes
    if (this.treeContainer) {
      this.treeContainer.style.opacity = "0.7";
      setTimeout(() => {
        if (this.treeContainer) {
          this.treeContainer.style.opacity = "1";
        }
      }, 100);
    }
  }

  jumpToFraction() {
    const input = this.elements.jumpInput.value.trim();
    if (!input) return;

    try {
      // Check if input contains /0 - if so, go to root
      if (input.includes("/0")) {
        this.elements.jumpInput.value = "";
        this.reset();
        return;
      }

      // Parse the input using the RatMath parser
      const result = Parser.parse(input);
      let fraction;

      if (result.toRational) {
        fraction = Fraction.fromRational(result.toRational());
      } else if (
        result.numerator !== undefined &&
        result.denominator !== undefined
      ) {
        fraction = new Fraction(result.numerator, result.denominator);
      } else {
        throw new Error("Invalid input");
      }

      // Ensure the fraction is in lowest terms
      fraction = fraction.reduce();

      this.elements.jumpInput.value = "";
      this.animateToNewFraction(fraction);
    } catch (error) {
      alert(`Invalid input: ${error.message}`);
    }
  }

  handleKeyPress(e) {
    // Don't interfere with arrow keys when user is typing in input fields
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' || 
      activeElement.contentEditable === 'true'
    );

    switch (e.key) {
      case "ArrowUp":
        if (!isInputFocused) {
          e.preventDefault();
          this.navigateToParent();
        }
        break;
      case "ArrowLeft":
        if (!isInputFocused) {
          e.preventDefault();
          this.navigateToLeftChild();
        }
        break;
      case "ArrowRight":
        if (!isInputFocused) {
          e.preventDefault();
          this.navigateToRightChild();
        }
        break;
      case "Home":
        if (!isInputFocused) {
          e.preventDefault();
          this.reset();
        }
        break;
      case "Escape":
        this.elements.jumpInput.blur();
        this.elements.expressionInput.blur();
        break;
    }
  }

  handleSvgClick(e) {
    const target = e.target.closest(".tree-node");
    if (target && target.dataset.fraction) {
      const [num, den] = target.dataset.fraction.split("/").map(BigInt);
      const newFraction = new Fraction(num, den);
      this.animateToNewFraction(newFraction);
    }
  }

  handleScroll(e) {
    e.preventDefault();
    const scrollSpeed = 20;

    const oldOffset = { ...this.scrollOffset };

    if (e.shiftKey) {
      // Horizontal scrolling with Shift+wheel
      this.scrollOffset.x -= e.deltaY * scrollSpeed * 0.1;
    } else {
      // Vertical scrolling
      this.scrollOffset.y -= e.deltaY * scrollSpeed * 0.1;
    }

    // Apply bounds checking
    this.applyScrollBounds();

    this.updateTreeTransform();
  }

  applyScrollBounds() {
    if (!this.treeContainer) return;

    // Calculate tree bounds
    const bounds = this.calculateTreeBounds();
    if (!bounds) return;

    const svgRect = this.svg.getBoundingClientRect();
    const svgWidth = svgRect.width;
    const svgHeight = svgRect.height;

    // Calculate maximum scroll limits
    const maxScrollLeft = Math.min(0, svgWidth - bounds.right - 50); // 50px padding
    const maxScrollRight = Math.max(0, -bounds.left + 50); // 50px padding
    const maxScrollUp = Math.min(0, svgHeight - bounds.bottom - 50); // 50px padding
    const maxScrollDown = Math.max(0, -bounds.top + 50); // 50px padding

    // Apply bounds
    this.scrollOffset.x = Math.max(
      maxScrollLeft,
      Math.min(maxScrollRight, this.scrollOffset.x),
    );
    this.scrollOffset.y = Math.max(
      maxScrollUp,
      Math.min(maxScrollDown, this.scrollOffset.y),
    );
  }

  calculateTreeBounds() {
    if (!this.treeContainer) return null;

    const nodes = this.treeContainer.querySelectorAll(".tree-node");
    if (nodes.length === 0) return null;

    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    nodes.forEach((node) => {
      const rect = node.querySelector("rect");
      if (rect) {
        const x = parseFloat(rect.getAttribute("x"));
        const y = parseFloat(rect.getAttribute("y"));
        const width = parseFloat(rect.getAttribute("width"));
        const height = parseFloat(rect.getAttribute("height"));

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x + width);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y + height);
      }
    });

    return {
      left: minX,
      right: maxX,
      top: minY,
      bottom: maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  handleTouchStart(e) {
    if (e.touches.length === 1) {
      this.lastTouchPosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };

      // Handle long press for tooltips
      const node = e.target.closest(".tree-node");
      if (node && node.dataset.fraction) {
        this.tooltipTouchTarget = node;
        this.touchStartPos = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        this.longPressTimer = setTimeout(() => {
          const fraction = node.dataset.fraction;
          this.elements.fractionTooltip.textContent = fraction;
          this.elements.fractionTooltip.style.display = "block";
          this.elements.fractionTooltip.style.left =
            this.touchStartPos.x + 10 + "px";
          this.elements.fractionTooltip.style.top =
            this.touchStartPos.y - 30 + "px";
        }, 500); // 500ms long press
      }
    }
  }

  handleTouchMove(e) {
    e.preventDefault();

    // Cancel long press on move
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    if (e.touches.length === 1 && this.lastTouchPosition) {
      const deltaX = e.touches[0].clientX - this.lastTouchPosition.x;
      const deltaY = e.touches[0].clientY - this.lastTouchPosition.y;

      this.scrollOffset.x += deltaX * 0.5;
      this.scrollOffset.y += deltaY * 0.5;

      // Apply bounds checking
      this.applyScrollBounds();

      this.lastTouchPosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };

      this.updateTreeTransform();
    }
  }

  handleTouchEnd(e) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // Hide tooltip after a delay if it was shown
    if (this.elements.fractionTooltip.style.display === "block") {
      setTimeout(() => {
        this.elements.fractionTooltip.style.display = "none";
      }, 2000);
    }
  }

  updateTreeTransform() {
    if (this.treeContainer) {
      this.treeContainer.setAttribute(
        "transform",
        `translate(${this.scrollOffset.x}, ${this.scrollOffset.y})`,
      );
    }
  }

  renderTree() {
    // Clear existing content
    this.svg.innerHTML = "";

    // Create container group for all tree content
    this.treeContainer = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    this.treeContainer.setAttribute("class", "tree-container");
    this.svg.appendChild(this.treeContainer);

    // Get tree structure centered around current fraction
    const treeData = this.getTreeStructure();

    // Render edges first (so they appear behind nodes)
    this.renderEdges(treeData);

    // Render nodes
    this.renderNodes(treeData);

    // Update transform to current scroll position
    this.updateTreeTransform();
  }

  getTreeStructure() {
    const maxDescendantDepth = 2; // Show only 2 levels below current
    const nodes = new Map();
    const center = { x: this.svgWidth / 2, y: this.svgHeight / 2 };

    // Add current fraction as center node
    nodes.set(this.currentFraction.toString(), {
      fraction: this.currentFraction,
      x: center.x,
      y: center.y,
      type: "current",
      size: 45, // Increased from 30
    });

    // Add sibling of current node at parent level for better orientation
    const currentParent = this.currentFraction.sternBrocotParent();
    if (currentParent) {
      try {
        const currentSiblings = currentParent.sternBrocotChildren();
        const siblingSpacing = 140;

        // Determine which sibling the current node is, and show the other
        let currentSibling = null;
        if (currentSiblings.left.equals(this.currentFraction)) {
          currentSibling = currentSiblings.right;
        } else if (currentSiblings.right.equals(this.currentFraction)) {
          currentSibling = currentSiblings.left;
        }

        if (currentSibling) {
          const siblingKey = currentSibling.toString();
          if (!nodes.has(siblingKey)) {
            // Position sibling relative to current node
            const isLeftSibling = currentSiblings.right.equals(
              this.currentFraction,
            );
            nodes.set(siblingKey, {
              fraction: currentSibling,
              x: center.x + (isLeftSibling ? -siblingSpacing : siblingSpacing),
              y: center.y,
              type: "current-sibling",
              size: 35,
            });
          }
        }
      } catch (e) {
        // Skip if there's an error finding siblings
      }
    }

    // Add all ancestors (unlimited depth)
    let current = this.currentFraction;
    let y = center.y;
    const verticalSpacing = 90; // Increased spacing
    let ancestorLevel = 0;

    while (true) {
      const parent = current.sternBrocotParent();
      if (!parent) break;

      ancestorLevel++;
      y -= verticalSpacing;
      const parentSize =
        ancestorLevel === 1 ? 40 : Math.max(30, 40 - ancestorLevel * 2);

      // Position parent/ancestor based on value relative to current
      let parentX = center.x;
      try {
        const currentRational = this.currentFraction.toRational();
        const parentRational = parent.toRational();
        const comparison = parentRational.compareTo(currentRational);

        if (ancestorLevel <= 3) {
          // First few levels: gradual shift based on value
          const shift = Math.min(50, 20 * ancestorLevel);
          if (comparison < 0) {
            parentX = center.x - shift; // Parent is less, shift left
          } else if (comparison > 0) {
            parentX = center.x + shift; // Parent is greater, shift right
          }
        } else {
          // Higher levels: standard left/right positions
          const standardShift = 80;
          if (comparison < 0) {
            parentX = center.x - standardShift; // Left position
          } else if (comparison > 0) {
            parentX = center.x + standardShift; // Right position
          }
        }
      } catch (e) {
        // Fallback to center if comparison fails
      }

      // Add the parent
      nodes.set(parent.toString(), {
        fraction: parent,
        x: parentX,
        y: y,
        type: ancestorLevel === 1 ? "parent" : "ancestor",
        size: parentSize,
      });

      // Add siblings of the parent (if parent has a parent)
      const grandparent = parent.sternBrocotParent();
      if (grandparent) {
        try {
          const parentSiblings = grandparent.sternBrocotChildren();
          const siblingSpacing = 150;

          // Left sibling
          if (!parentSiblings.left.equals(parent)) {
            const siblingKey = parentSiblings.left.toString();
            if (!nodes.has(siblingKey)) {
              nodes.set(siblingKey, {
                fraction: parentSiblings.left,
                x: parentX - siblingSpacing,
                y: y,
                type: "sibling",
                size: Math.max(25, parentSize - 5),
              });
            }
          }

          // Right sibling
          if (!parentSiblings.right.equals(parent)) {
            const siblingKey = parentSiblings.right.toString();
            if (!nodes.has(siblingKey)) {
              nodes.set(siblingKey, {
                fraction: parentSiblings.right,
                x: parentX + siblingSpacing,
                y: y,
                type: "sibling",
                size: Math.max(25, parentSize - 5),
              });
            }
          }
        } catch (e) {
          // Skip siblings if there's an error
        }
      }

      current = parent;
    }

    // Add children and descendants with better positioning
    current = this.currentFraction;
    y = center.y;
    const childOffset = 120; // Balanced offset for good spacing without pushing grandchildren too far

    for (let depth = 1; depth <= maxDescendantDepth; depth++) {
      y += verticalSpacing;
      const levelNodes = this.getNodesAtDepth(current, depth);
      const nodeSize = depth === 1 ? 40 : Math.max(25, 40 - depth * 5); // Increased sizes

      levelNodes.forEach((node, index) => {
        const key = node.toString();
        if (!nodes.has(key)) {
          // Find the parent of this node to position relative to parent center
          const nodeParent = node.sternBrocotParent();
          let nodeX = center.x; // Default to center

          if (depth === 1) {
            // For immediate children of current node, use center offset
            const children = this.currentFraction.sternBrocotChildren();
            if (node.equals(children.left)) {
              nodeX = center.x - childOffset;
            } else if (node.equals(children.right)) {
              nodeX = center.x + childOffset;
            }
          } else if (depth === 2) {
            // For grandchildren, use a systematic spread to avoid overlaps
            const currentChildren = this.currentFraction.sternBrocotChildren();
            const leftChild = currentChildren.left;
            const rightChild = currentChildren.right;

            // Determine which grandchild this is
            const leftGrandchildren = leftChild.sternBrocotChildren();
            const rightGrandchildren = rightChild.sternBrocotChildren();

            const grandchildSpacing = 75; // Tighter spacing to keep nodes more centered

            if (node.equals(leftGrandchildren.left)) {
              // Far left grandchild
              nodeX = center.x - grandchildSpacing * 3;
            } else if (node.equals(leftGrandchildren.right)) {
              // Left-center grandchild
              nodeX = center.x - grandchildSpacing;
            } else if (node.equals(rightGrandchildren.left)) {
              // Right-center grandchild
              nodeX = center.x + grandchildSpacing;
            } else if (node.equals(rightGrandchildren.right)) {
              // Far right grandchild
              nodeX = center.x + grandchildSpacing * 3;
            }
          } else if (nodeParent && nodes.has(nodeParent.toString())) {
            // For deeper levels, position relative to parent
            const parentNode = nodes.get(nodeParent.toString());
            const parentChildren = nodeParent.sternBrocotChildren();

            // Position children relative to parent center with offset
            if (node.equals(parentChildren.left)) {
              nodeX = parentNode.x - childOffset;
            } else if (node.equals(parentChildren.right)) {
              nodeX = parentNode.x + childOffset;
            }
          }

          // Determine node type
          let nodeType = depth === 1 ? "child" : "descendant";
          if (depth === 1) {
            const children = this.currentFraction.sternBrocotChildren();
            if (node.equals(children.left)) {
              nodeType = "left-child";
            } else if (node.equals(children.right)) {
              nodeType = "right-child";
            }
          }

          nodes.set(key, {
            fraction: node,
            x: nodeX,
            y: y,
            type: nodeType,
            size: nodeSize,
          });
        }
      });

      // Add siblings for current level nodes (only for immediate children)
      if (depth === 1) {
        levelNodes.forEach((node, index) => {
          try {
            const nodeParent = node.sternBrocotParent();
            if (nodeParent && !nodeParent.equals(this.currentFraction)) {
              const siblings = nodeParent.sternBrocotChildren();
              const nodeData = nodes.get(node.toString());
              const nodeX = nodeData ? nodeData.x : center.x;
              const siblingOffset = 120; // Increased sibling spacing to prevent overlaps

              // Add sibling that's not already in the main line
              [siblings.left, siblings.right].forEach((sibling, sibIndex) => {
                const sibKey = sibling.toString();
                if (
                  !nodes.has(sibKey) &&
                  !levelNodes.some((n) => n.equals(sibling))
                ) {
                  nodes.set(sibKey, {
                    fraction: sibling,
                    x:
                      nodeX + (sibIndex === 0 ? -siblingOffset : siblingOffset),
                    y: y,
                    type: "sibling",
                    size: nodeSize - 5,
                  });
                }
              });
            }
          } catch (e) {
            // Skip siblings if there's an error
          }
        });
      }
    }

    return Array.from(nodes.values());
  }

  getNodesAtDepth(root, targetDepth) {
    if (targetDepth === 0) return [root];
    if (targetDepth === 1) {
      const children = root.sternBrocotChildren();
      return [children.left, children.right];
    }

    // For depth > 1, only get children of immediate children to avoid sharing bug
    if (targetDepth === 2) {
      const immediateChildren = root.sternBrocotChildren();
      const currentLevel = [];

      // Get children of left child
      try {
        const leftGrandchildren = immediateChildren.left.sternBrocotChildren();
        currentLevel.push(leftGrandchildren.left, leftGrandchildren.right);
      } catch {
        // Skip if can't get children
      }

      // Get children of right child
      try {
        const rightGrandchildren =
          immediateChildren.right.sternBrocotChildren();
        currentLevel.push(rightGrandchildren.left, rightGrandchildren.right);
      } catch {
        // Skip if can't get children
      }

      return currentLevel;
    }

    // For deeper levels, recursively build but ensure no sharing
    const previousLevel = this.getNodesAtDepth(root, targetDepth - 1);
    const currentLevel = [];
    const seen = new Set();

    for (const node of previousLevel) {
      try {
        const children = node.sternBrocotChildren();
        // Only add children we haven't seen before
        if (!seen.has(children.left.toString())) {
          currentLevel.push(children.left);
          seen.add(children.left.toString());
        }
        if (!seen.has(children.right.toString())) {
          currentLevel.push(children.right);
          seen.add(children.right.toString());
        }
      } catch {
        // Skip nodes that can't have children
      }
    }

    return currentLevel;
  }

  renderNodes(treeData) {
    const center = { x: this.svgWidth / 2, y: this.svgHeight / 2 };

    treeData.forEach((nodeData) => {
      const { fraction, x, y, type, size } = nodeData;

      // Create node group
      const nodeGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g",
      );
      nodeGroup.classList.add("tree-node", type);
      nodeGroup.dataset.fraction = fraction.toString();

      // Calculate rectangle dimensions based on text content
      // Increased minimum font size for better mobile readability
      const fontSize = Math.max(16, Math.min(24, size / 2.0));
      const lineHeight = fontSize < 16 ? fontSize * 0.6 : fontSize * 0.5;

      // Estimate text dimensions
      const numStr = fraction.numerator.toString();
      const denStr = fraction.denominator.toString();
      const maxWidth = Math.max(numStr.length, denStr.length) * fontSize * 0.7;
      const textHeight = lineHeight * 2; // Space for numerator and denominator

      // Rectangle dimensions with increased padding
      const rectWidth = Math.max(maxWidth + 24, 50); // Increased padding and minimum width
      const rectHeight = textHeight + 18; // Increased padding above and below

      // Position rectangle to expand away from center
      let rectX = x - rectWidth / 2;
      let rectY = y - rectHeight / 2;

      // Expand away from center
      if (x < center.x) {
        rectX = x - rectWidth; // Expand left
      } else if (x > center.x) {
        rectX = x; // Expand right
      }

      if (y < center.y) {
        rectY = y - rectHeight; // Expand up
      } else if (y > center.y) {
        rectY = y; // Expand down
      }

      // Create rounded rectangle
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      rect.setAttribute("x", rectX);
      rect.setAttribute("y", rectY);
      rect.setAttribute("width", rectWidth);
      rect.setAttribute("height", rectHeight);
      rect.setAttribute("rx", 8); // Rounded corners
      rect.setAttribute("ry", 8);

      // Use 2D fraction display for nodes, adjusted for rectangle center
      const textCenterX = rectX + rectWidth / 2;
      const textCenterY = rectY + rectHeight / 2;
      const fractionElements = this.createSVG2DFraction(
        fraction,
        textCenterX,
        textCenterY,
        fontSize,
      );

      nodeGroup.appendChild(rect);
      fractionElements.forEach((element) => {
        // Add text overflow handling
        element.setAttribute("text-overflow", "ellipsis");
        nodeGroup.appendChild(element);
      });

      this.treeContainer.appendChild(nodeGroup);
    });
  }

  renderEdges(treeData) {
    const center = { x: this.svgWidth / 2, y: this.svgHeight / 2 };
    const nodeMap = new Map();

    // Calculate rectangle positions for each node first
    treeData.forEach((node) => {
      const { fraction, x, y, size } = node;
      const fontSize = Math.max(14, Math.min(20, size / 2.2));
      const lineHeight = fontSize < 16 ? fontSize * 0.6 : fontSize * 0.5;

      const numStr = fraction.numerator.toString();
      const denStr = fraction.denominator.toString();
      const maxWidth = Math.max(numStr.length, denStr.length) * fontSize * 0.7;
      const textHeight = lineHeight * 2;

      const rectWidth = Math.max(maxWidth + 24, 50);
      const rectHeight = textHeight + 18;

      // Calculate rectangle position (same logic as renderNodes)
      let rectX = x - rectWidth / 2;
      let rectY = y - rectHeight / 2;

      if (x < center.x) {
        rectX = x - rectWidth;
      } else if (x > center.x) {
        rectX = x;
      }

      if (y < center.y) {
        rectY = y - rectHeight;
      } else if (y > center.y) {
        rectY = y;
      }

      // Store rectangle info with node
      node.rectX = rectX;
      node.rectY = rectY;
      node.rectWidth = rectWidth;
      node.rectHeight = rectHeight;
      nodeMap.set(fraction.toString(), node);
    });

    treeData.forEach((nodeData) => {
      const { fraction } = nodeData;

      // Draw edge to parent
      const parent = fraction.sternBrocotParent();
      if (parent && nodeMap.has(parent.toString())) {
        const parentNode = nodeMap.get(parent.toString());

        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line",
        );
        line.classList.add("tree-edge");

        if (nodeData.type === "current" || parentNode.type === "current") {
          line.classList.add("current");
        }

        // Line starts from bottom center of parent rectangle
        const parentBottomCenterX = parentNode.rectX + parentNode.rectWidth / 2;
        const parentBottomCenterY = parentNode.rectY + parentNode.rectHeight;

        // Line ends at top center of child rectangle
        const childTopCenterX = nodeData.rectX + nodeData.rectWidth / 2;
        const childTopCenterY = nodeData.rectY;

        line.setAttribute("x1", parentBottomCenterX);
        line.setAttribute("y1", parentBottomCenterY);
        line.setAttribute("x2", childTopCenterX);
        line.setAttribute("y2", childTopCenterY);

        this.treeContainer.appendChild(line);
      }
    });
  }

  showConvergentsModal() {
    try {
      const rational = this.currentFraction.toRational();
      const allConvergents = rational.convergents();
      const currentFractionStr = this.formatFraction(
        this.currentFraction,
        "fraction",
      );
      const targetValue =
        Number(this.currentFraction.numerator) /
        Number(this.currentFraction.denominator);

      let modalContent = `
                <table class="convergents-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Convergent</th>
                            <th>Decimal</th>
                            <th>Distance</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

      allConvergents.forEach((convergent, index) => {
        const convergentFraction = Fraction.fromRational(convergent);
        const convergentStr = this.formatFraction(
          convergentFraction,
          "fraction",
        );
        const isCurrent = convergentStr === currentFractionStr;

        // Use repeating decimal with period info
        const convergentRational = convergentFraction.toRational();
        const decimalInfo =
          convergentRational.toRepeatingDecimalWithPeriod(true);
        const decimalDisplay =
          decimalInfo.period > 0
            ? `${decimalInfo.decimal} (p:${decimalInfo.period})`
            : decimalInfo.decimal;

        // Calculate exact fractional distance
        const targetRational = this.currentFraction.toRational();
        const exactDistance = targetRational.subtract(convergentRational).abs();

        // Convert exact distance to scientific notation using the library
        let distanceScientific;
        try {
          distanceScientific = exactDistance.toScientificNotation(3);
        } catch (e) {
          // Fallback to JavaScript conversion if library method fails
          const distanceDecimal =
            Number(exactDistance.numerator) / Number(exactDistance.denominator);
          distanceScientific = distanceDecimal.toExponential(3);
        }

        modalContent += `
                    <tr class="${isCurrent ? "current-row" : ""}">
                        <td>${index + 1}</td>
                        <td class="fraction-cell">${convergentStr}</td>
                        <td class="decimal-cell">${decimalDisplay}</td>
                        <td class="distance-cell">
                            <div style="font-size: 0.8rem;">
                                <div>${distanceScientific}</div>
                                <div style="color: #6C757D;">${exactDistance.toString()}</div>
                            </div>
                        </td>
                        <td class="action-cell">
                            <button class="nav-convergent" onclick="sternBrocotApp.navigateToConvergent('${convergentFraction.numerator}', '${convergentFraction.denominator}')">
                                Go
                            </button>
                        </td>
                    </tr>
                `;
      });

      modalContent += `
                    </tbody>
                </table>
            `;

      this.elements.allConvergents.innerHTML = modalContent;
      this.elements.convergentsModal.style.display = "block";
    } catch (error) {
      console.error("Error showing convergents modal:", error);
    }
  }

  showFareyModal() {
    try {
      const reducedFraction = this.currentFraction.reduce();
      const fareyLevel = Math.min(Number(reducedFraction.denominator), 10);
      const fareySequence = this.generateFareySequence(fareyLevel);
      const currentFractionStr = this.formatFraction(
        this.currentFraction,
        "fraction",
      );

      let modalContent = `<h3>Farey Sequence F<sub>${fareyLevel}</sub></h3>`;
      modalContent += '<div class="farey-grid">';

      fareySequence.forEach((fraction) => {
        const fractionStr = this.formatFraction(fraction, "fraction");
        const isCurrent = fractionStr === currentFractionStr;

        modalContent += `<span class="farey-item ${isCurrent ? "current" : ""}">
                    ${fractionStr}
                </span>`;
      });

      modalContent += "</div>";

      if (fareyLevel === 10 && Number(reducedFraction.denominator) > 10) {
        modalContent += `<p><em>Note: Showing F<sub>10</sub> only. The fraction ${currentFractionStr} first appears in F<sub>${reducedFraction.denominator}</sub>.</em></p>`;
      }

      this.elements.fareySequenceContent.innerHTML = modalContent;
      this.elements.fareyModal.style.display = "block";
    } catch (error) {
      console.error("Error showing Farey modal:", error);
    }
  }

  generateFareySequence(n) {
    const fractions = [];

    // Generate all fractions a/b where 0 ≤ a ≤ b ≤ n and gcd(a,b) = 1
    for (let b = 1; b <= n; b++) {
      for (let a = 0; a <= b; a++) {
        try {
          const fraction = new Fraction(BigInt(a), BigInt(b));
          const reduced = fraction.reduce();

          // Check if this reduced fraction is already in the list
          const fractionStr = reduced.toString();
          if (!fractions.some((f) => f.toString() === fractionStr)) {
            fractions.push(reduced);
          }
        } catch (e) {
          // Skip invalid fractions
        }
      }
    }

    // Sort fractions by their decimal value
    fractions.sort((a, b) => {
      const aVal = Number(a.numerator) / Number(a.denominator);
      const bVal = Number(b.numerator) / Number(b.denominator);
      return aVal - bVal;
    });

    return fractions;
  }

  wrapPath(pathString) {
    if (pathString.length <= 20) return pathString;

    let wrapped = "";
    for (let i = 0; i < pathString.length; i += 20) {
      if (i > 0) wrapped += "<br>";
      wrapped += pathString.slice(i, i + 20);
    }
    return wrapped;
  }

  wrapContinuedFraction(cfString) {
    if (!cfString.includes("~")) return cfString;

    const parts = cfString.split("~");
    let wrapped = parts[0]; // Start with the integer part

    for (let i = 1; i < parts.length; i++) {
      const nextPart = "~" + parts[i];
      const currentLine = wrapped.split("<br>").pop();

      // Add line break if current line would become too long (25 characters)
      if (currentLine.length + nextPart.length > 25) {
        wrapped += "<br>" + nextPart;
      } else {
        wrapped += nextPart;
      }
    }

    return wrapped;
  }

  loadFromURL(pushToHistory = true) {
    const hash = window.location.hash.slice(1); // Remove #
    if (hash && hash.includes("_")) {
      try {
        const [numerator, denominator] = hash.split("_").map((s) => BigInt(s));
        if (numerator > 0 && denominator > 0) {
          const fraction = new Fraction(numerator, denominator);
          this.currentFraction = fraction;
          this.updateDisplay();
          this.renderTree();
          return;
        }
      } catch (e) {
        console.warn("Invalid URL hash:", hash);
      }
    }

    // Fallback to root if URL is invalid or empty
    if (pushToHistory && !hash) {
      this.updateURL();
    }
  }

  updateURL() {
    const hash = `#${this.currentFraction.numerator}_${this.currentFraction.denominator}`;
    if (window.location.hash !== hash) {
      history.pushState(null, "", hash);
    }
  }

  navigateToConvergent(numeratorStr, denominatorStr) {
    try {
      const numerator = BigInt(numeratorStr);
      const denominator = BigInt(denominatorStr);
      const fraction = new Fraction(numerator, denominator);
      this.animateToNewFraction(fraction);
      this.closeModal("convergents");
    } catch (error) {
      console.error("Error navigating to convergent:", error);
    }
  }

  navigateToFraction(numeratorStr, denominatorStr) {
    try {
      const numerator = BigInt(numeratorStr);
      const denominator = BigInt(denominatorStr);
      const fraction = new Fraction(numerator, denominator);
      this.animateToNewFraction(fraction);
    } catch (error) {
      console.error("Error navigating to fraction:", error);
    }
  }

  updateExpressionResult() {
    const expression = this.elements.expressionInput.value.trim();

    if (!expression) {
      this.elements.expressionResult.textContent = "Enter an expression above";
      return;
    }

    try {
      // Replace 'x' with the current fraction value
      const currentValueStr = this.currentFraction.toString();
      const substitutedExpression = expression.replace(
        /\bx\b/g,
        `(${currentValueStr})`,
      );

      // Parse and evaluate the expression
      const result = Parser.parse(substitutedExpression);

      // Convert result to a displayable format
      let resultText, rational;
      if (result.toRational) {
        rational = result.toRational();
      } else {
        rational = result;
      }
      const fraction = Fraction.fromRational(rational);

      // Display in mixed fraction format for better readability
      try {
        resultText = rational.toMixedString();
      } catch {
        resultText = this.formatFraction(fraction, "fraction", false);
      }

      this.elements.expressionResult.innerHTML = resultText;
    } catch (error) {
      this.elements.expressionResult.textContent = `Error: ${error.message}`;
    }
  }

  updateBoundaryDisplay() {
    const parents = this.currentFraction.fareyParents();
    
    // Update left boundary
    this.elements.leftBoundaryDisplay.innerHTML = this.formatFraction(
      parents.left,
      "fraction",
      true
    );
    
    // Update current node
    this.elements.currentNodeDisplay.innerHTML = this.formatFraction(
      this.currentFraction,
      "fraction",
      true
    );
    
    // Update right boundary
    this.elements.rightBoundaryDisplay.innerHTML = this.formatFraction(
      parents.right,
      "fraction",
      true
    );
  }

  handleBoundaryClick(boundary) {
    if (boundary === 'left' || boundary === 'right') {
      const parents = this.currentFraction.fareyParents();
      const targetFraction = boundary === 'left' ? parents.left : parents.right;
      
      // If clicking on an infinite fraction (1/0 or -1/0), go to root
      if (targetFraction.isInfinite) {
        this.reset();
      } else {
        this.animateToNewFraction(targetFraction);
      }
    } else if (boundary === 'current') {
      // Clicking current node does nothing special, maybe center the view
      this.scrollOffset = { x: 0, y: 0 };
      this.updateTreeTransform();
    }
  }

  showHelpModal() {
    this.elements.helpContent.innerHTML = `
      <h3>What is the Stern-Brocot Tree?</h3>
      <p>The Stern-Brocot tree is a beautiful mathematical structure that organizes all rational numbers (fractions) in a binary tree format. Every rational number appears exactly once in the tree, and it's built using a simple but elegant process called the <strong>mediant operation</strong>.</p>

      <h3>How is the Tree Constructed?</h3>
      <p>The tree starts with boundaries -1/0 and 1/0 (representing negative and positive infinity), and the root is their mediant: (-1+1)/(0+0) = 0/1. Each subsequent fraction is the mediant of its boundaries in the tree.</p>

      <p><strong>Mediant Formula:</strong> For fractions a/b and c/d, their mediant is (a+c)/(b+d)</p>

      <h3>Path Interpretation - Sign and Whole Number</h3>
      <p>The path from the root 0/1 to any fraction has a special meaning:</p>
      <ul>
        <li><strong>First direction (L or R):</strong> Determines the sign of the number
          <ul>
            <li>L (Left) - Negative numbers</li>
            <li>R (Right) - Positive numbers</li>
          </ul>
        </li>
        <li><strong>Count before direction change:</strong> The number of consecutive L's or R's before the first direction change gives the whole number part
          <ul>
            <li>Example: RRR... means at least 3 for the whole number part</li>
            <li>Example: LL... means at least -2 for the whole number part</li>
          </ul>
        </li>
      </ul>

      <h3>Examples and Observations</h3>

      <h4>Example 1: Finding 1/1</h4>
      <p>Path from root 0/1: RR</p>
      <ul>
        <li><strong>Step 1:</strong> Start at 0/1 (boundaries: -1/0 and 1/0)</li>
        <li><strong>Step 2:</strong> Go right to 1/1 = mediant(0/1, 1/0)</li>
      </ul>
      <p><strong>Observation:</strong> The path "RR" tells us: R (positive) and RR (whole number part is 1)</p>

      <h4>Example 2: Finding -1/1</h4>
      <p>Path from root 0/1: LL</p>
      <ul>
        <li><strong>Step 1:</strong> Start at 0/1 (boundaries: -1/0 and 1/0)</li>
        <li><strong>Step 2:</strong> Go left to -1/1 = mediant(-1/0, 0/1)</li>
      </ul>
      <p><strong>Observation:</strong> The path "LL" tells us: L (negative) and LL (absolute whole number part is 1)</p>

      <h4>Example 3: Finding 3/5</h4>
      <p>Path from root 0/1: RRLLLR</p>
      <ul>
        <li>First R: positive number</li>
        <li>RR: whole number part is at least 0</li>
        <li>The full path navigates to 3/5 through mediants</li>
      </ul>
      
      <h4>Example 4: Golden Ratio φ ≈ 1.618</h4>
      <p>The golden ratio φ = (1+√5)/2 has the continued fraction [1; 1, 1, 1, 1, ...]. Starting from 0/1, its path begins with RR (giving 1/1), then continues with alternating L and R.</p>
      <p><strong>Try it:</strong> Click the φ button to explore the golden ratio approximations.</p>

      <h3>Connection to Continued Fractions</h3>
      <p>The Stern-Brocot tree and continued fractions are intimately connected:</p>
      <ul>
        <li><strong>Tree Path ↔ Continued Fraction:</strong> The left/right moves in the tree directly correspond to the coefficients in the continued fraction expansion</li>
        <li><strong>Convergents:</strong> Following the path partway gives you the convergents (best rational approximations) of the target fraction</li>
        <li><strong>Best Approximations:</strong> Every convergent in the tree represents the best possible rational approximation with denominators up to that point</li>
      </ul>

      <h3>Expression Calculator</h3>
      <p>The expression calculator allows you to evaluate mathematical expressions using the current node value as 'x'. This is particularly useful for finding roots and exploring mathematical relationships.</p>

      <h4>Example: Finding √2</h4>
      <p>To approximate √2 using the Stern-Brocot tree:</p>
      <ol>
        <li><strong>Enter expression:</strong> Type "x^2" in the expression calculator</li>
        <li><strong>Navigate the tree:</strong> Compare the result to 2</li>
        <li><strong>Binary search:</strong>
          <ul>
            <li>If the result is > 2, go left (fraction too large)</li>
            <li>If result is < 2, go right (fraction too small)</li>
            <li>Stop when the result is close enough to 2 for your liking.</li>
          </ul>
        </li>
        <li><strong>Example path:</strong> Starting from 1/1, you might navigate R→R→L→L→R→... getting closer to √2 ≈ 1.414</li>
        <li><strong>Convergents:</strong> Each step gives you the best rational approximation with that denominator</li>
      </ol>
      <p><strong>Try it:</strong> Start at 1/1, enter "x^2", and follow the guidance to discover the continued fraction [1; 2, 2, 2, 2, ...] for √2!</p>

      <h3>Navigation Tips</h3>
      <ul>
        <li><strong>Arrow Keys:</strong> ↑ parent, ← left child, → right child</li>
        <li><strong>Click:</strong> Click any node to navigate there directly</li>
        <li><strong>Mobile:</strong> Long-press a node to see its value clearly</li>
        <li><strong>Hover:</strong> Hover over nodes to see their exact values</li>
        <li><strong>Jump:</strong> Enter any fraction in the jump box to navigate directly</li>
        <li><strong>Mathematical Constants:</strong> Click √2, e, π, or φ buttons to jump to their rational approximations</li>
        <li><strong>Breadcrumbs:</strong> Click any fraction in the path to jump back to it</li>
        <li><strong>Expression Calculator:</strong> Use mathematical expressions with 'x' to explore roots and relationships</li>
      </ul>

      <h3>Mathematical Properties</h3>
      <ul>
        <li><strong>Completeness:</strong> Every positive rational number appears exactly once</li>
        <li><strong>Ordering:</strong> Left children are smaller, right children are larger</li>
        <li><strong>Reduced Form:</strong> All fractions automatically appear in lowest terms</li>
        <li><strong>Farey Connection:</strong> Each level relates to Farey sequences of increasing denominators</li>
        <li><strong>Binary Search:</strong> Finding any fraction is like a binary search through all rationals</li>
      </ul>

      <p><em>This visualization demonstrates one of the most elegant structures in mathematics, connecting number theory, geometry, and continued fractions in a beautifully unified way.</em></p>
    `;
    this.elements.helpModal.style.display = "block";
  }

  closeModal(type) {
    if (type === "convergents") {
      this.elements.convergentsModal.style.display = "none";
    } else if (type === "farey") {
      this.elements.fareyModal.style.display = "none";
    } else if (type === "help") {
      this.elements.helpModal.style.display = "none";
    }
  }
}

// Global variable for onclick handlers
let sternBrocotApp;

// Initialize the visualizer when the page loads
document.addEventListener("DOMContentLoaded", () => {
  sternBrocotApp = new SternBrocotTreeVisualizer();
});

/**
 * Stern-Brocot Tree Interactive Visualization
 *
 * Interactive web-based visualization of the Stern-Brocot tree showing
 * relationships between rational numbers in the infinite binary tree structure.
 */

import { Fraction, Parser } from "../index.js";

class SternBrocotTreeVisualizer {
    constructor() {
        this.currentFraction = new Fraction(1, 1); // Start at root
        this.displayMode = 'fraction';
        this.svg = document.getElementById('treeSvg');
        this.svgWidth = 800;
        this.svgHeight = 600;
        this.scrollOffset = { x: 0, y: 0 }; // For scrolling support
        this.treeContainer = null; // SVG group for tree content
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadFromURL(); // Check for URL hash
        this.updateDisplay();
        this.renderTree();
    }

    initializeElements() {
        // Get all DOM elements
        this.elements = {
            currentFraction: document.getElementById('currentFraction'),
            currentDepth: document.getElementById('currentDepth'),
            currentPath: document.getElementById('currentPath'),
            currentBoundaries: document.getElementById('currentBoundaries'),
            decimalValue: document.getElementById('decimalValue'),
            parentBtn: document.getElementById('parentBtn'),
            leftChildBtn: document.getElementById('leftChildBtn'),
            rightChildBtn: document.getElementById('rightChildBtn'),
            resetBtn: document.getElementById('resetBtn'),
            jumpInput: document.getElementById('jumpInput'),
            jumpBtn: document.getElementById('jumpBtn'),
            breadcrumbPath: document.getElementById('breadcrumbPath'),
            mediantCalculation: document.getElementById('mediantCalculation'),
            continuedFraction: document.getElementById('continuedFraction'),
            convergentsModal: document.getElementById('convergentsModal'),
            fareyModal: document.getElementById('fareyModal'),
            allConvergents: document.getElementById('allConvergents'),
            fareySequenceContent: document.getElementById('fareySequenceContent'),
            closeConvergents: document.getElementById('closeConvergents'),
            closeFarey: document.getElementById('closeFarey')
        };
    }

    setupEventListeners() {

        // Navigation buttons
        this.elements.parentBtn.addEventListener('click', () => this.navigateToParent());
        this.elements.leftChildBtn.addEventListener('click', () => this.navigateToLeftChild());
        this.elements.rightChildBtn.addEventListener('click', () => this.navigateToRightChild());
        this.elements.resetBtn.addEventListener('click', () => this.reset());

        // Jump to fraction
        this.elements.jumpBtn.addEventListener('click', () => this.jumpToFraction());
        this.elements.jumpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.jumpToFraction();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // SVG click handling
        this.svg.addEventListener('click', (e) => this.handleSvgClick(e));

        // Add scrolling support
        this.svg.addEventListener('wheel', (e) => this.handleScroll(e), { passive: false });
        this.svg.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.svg.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });

        // Modal event listeners
        this.elements.closeConvergents.addEventListener('click', () => this.closeModal('convergents'));
        this.elements.closeFarey.addEventListener('click', () => this.closeModal('farey'));
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.convergentsModal) this.closeModal('convergents');
            if (e.target === this.elements.fareyModal) this.closeModal('farey');
        });

        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal('convergents');
                this.closeModal('farey');
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            this.loadFromURL(false); // Don't push to history
        });
    }

    formatFraction(fraction, mode = null, use2D = false) {
        const displayMode = mode || this.displayMode;
        
        if (fraction.isInfinite) {
            return fraction.numerator > 0 ? '+∞' : '-∞';
        }

        // Use 2D format for specific cases
        if (use2D && displayMode === 'fraction') {
            return this.format2DFraction(fraction);
        }

        switch (displayMode) {
            case 'decimal':
                try {
                    const rational = fraction.toRational();
                    return rational.toDecimal();
                } catch {
                    // Fallback to manual division
                    return (Number(fraction.numerator) / Number(fraction.denominator)).toFixed(6);
                }
            case 'mixed':
                try {
                    const rational = fraction.toRational();
                    return rational.toMixedString();
                } catch {
                    return fraction.toString();
                }
            case 'cf':
                try {
                    const rational = fraction.toRational();
                    const cf = rational.toContinuedFraction();
                    if (cf.length === 1) return cf[0].toString();
                    return cf[0] + '.~' + cf.slice(1).join('~');
                } catch {
                    return fraction.toString();
                }
            default:
                return fraction.toString();
        }
    }

    format2DFraction(fraction) {
        if (fraction.isInfinite) {
            return fraction.numerator > 0 ? '+∞' : '-∞';
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
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            text.setAttribute('font-size', fontSize);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'central');
            text.setAttribute('fill', 'black');
            text.setAttribute('font-weight', 'bold');
            text.textContent = fraction.numerator > 0 ? '+∞' : '-∞';
            return [text];
        }

        const elements = [];
        // Adjust spacing based on font size - more spacing for smaller fonts
        const lineHeight = fontSize < 16 ? fontSize * 0.6 : fontSize * 0.5;
        
        // Numerator
        const numerator = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        numerator.setAttribute('x', x);
        numerator.setAttribute('y', y - lineHeight);
        numerator.setAttribute('font-size', fontSize);
        numerator.setAttribute('text-anchor', 'middle');
        numerator.setAttribute('dominant-baseline', 'central');
        numerator.setAttribute('fill', 'black');
        numerator.setAttribute('font-weight', 'bold');
        numerator.textContent = fraction.numerator.toString();
        elements.push(numerator);
        
        // Fraction bar
        const maxWidth = Math.max(
            fraction.numerator.toString().length,
            fraction.denominator.toString().length
        ) * fontSize * 0.7; // Slightly wider for better proportion
        
        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        bar.setAttribute('x1', x - maxWidth/2);
        bar.setAttribute('y1', y);
        bar.setAttribute('x2', x + maxWidth/2);
        bar.setAttribute('y2', y);
        bar.setAttribute('stroke', 'black');
        bar.setAttribute('stroke-width', '2'); // Slightly thicker
        elements.push(bar);
        
        // Denominator
        const denominator = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        denominator.setAttribute('x', x);
        denominator.setAttribute('y', y + lineHeight);
        denominator.setAttribute('font-size', fontSize);
        denominator.setAttribute('text-anchor', 'middle');
        denominator.setAttribute('dominant-baseline', 'central');
        denominator.setAttribute('fill', 'black');
        denominator.setAttribute('font-weight', 'bold');
        denominator.textContent = fraction.denominator.toString();
        elements.push(denominator);
        
        return elements;
    }

    updateDisplay() {
        // Update current fraction display with 2D format
        this.elements.currentFraction.innerHTML = this.formatFraction(this.currentFraction, 'fraction', true);

        // Update depth
        const depth = this.currentFraction.sternBrocotDepth();
        this.elements.currentDepth.textContent = depth === Infinity ? '∞' : depth.toString();

        // Update decimal value
        try {
            const rational = this.currentFraction.toRational();
            this.elements.decimalValue.textContent = rational.toDecimal();
        } catch (e) {
            this.elements.decimalValue.textContent = (Number(this.currentFraction.numerator) / Number(this.currentFraction.denominator)).toFixed(6);
        }

        // Update path with intelligent wrapping or 2D fractions for long paths
        const path = this.currentFraction.sternBrocotPath();
        if (path.length === 0) {
            this.elements.currentPath.textContent = 'Root';
        } else {
            const pathString = path.join('');
            if (pathString.length > 40) {
                // Use 2D fraction display for very long paths
                let pathDisplay = '<strong>Path fractions:</strong><br>';
                for (let i = 1; i <= Math.min(path.length, 8); i += 2) {
                    const partialPath = path.slice(0, i);
                    const pathFraction = Fraction.fromSternBrocotPath(partialPath);
                    pathDisplay += this.formatFraction(pathFraction, 'fraction', true);
                    if (i < Math.min(path.length, 8)) pathDisplay += ' → ';
                }
                if (path.length > 8) {
                    pathDisplay += ` → ... → ${this.formatFraction(this.currentFraction, 'fraction', true)}`;
                }
                pathDisplay += `<br><small style="color: #6C757D;">Path length: ${path.length} steps</small>`;
                this.elements.currentPath.innerHTML = pathDisplay;
            } else {
                this.elements.currentPath.innerHTML = this.wrapPath(pathString);
            }
        }

        // Update boundaries with better layout
        const parents = this.currentFraction.fareyParents();
        const leftBoundary = this.formatFraction(parents.left, 'fraction', true);
        const rightBoundary = this.formatFraction(parents.right, 'fraction', true);
        const currentBoundary = this.formatFraction(this.currentFraction, 'fraction', true);
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
    }

    updateBreadcrumbs() {
        const ancestors = this.currentFraction.sternBrocotAncestors();
        const path = this.currentFraction.sternBrocotPath();
        
        let breadcrumbHtml = '';
        
        // Add root
        breadcrumbHtml += '<span class="breadcrumb">1/1 (Root)</span>';
        
        // Add each step in the path
        for (let i = 0; i < path.length; i++) {
            const partialPath = path.slice(0, i + 1);
            const fraction = Fraction.fromSternBrocotPath(partialPath);
            const direction = path[i]; // Use R/L directly
            const directionClass = direction === 'L' ? 'left-direction' : 'right-direction';
            breadcrumbHtml += ` → <span class="breadcrumb ${directionClass}">${this.formatFraction(fraction, 'fraction')} (${direction})</span>`;
        }
        
        // Mark current as current
        if (path.length > 0) {
            breadcrumbHtml = breadcrumbHtml.replace(/class="breadcrumb">([^<]+) \([^)]+\)<\/span>$/, 
                'class="breadcrumb current">$1</span>');
        }
        
        this.elements.breadcrumbPath.innerHTML = breadcrumbHtml;
    }

    updateMediantCalculation() {
        const parents = this.currentFraction.fareyParents();
        const left = parents.left;
        const right = parents.right;
        
        if (left.isInfinite || right.isInfinite) {
            this.elements.mediantCalculation.textContent = 
                'Mediant calculation not applicable for infinite boundaries';
            return;
        }

        const mediant = left.mediant(right);
        const leftStr = this.formatFraction(left, 'fraction', true);
        const rightStr = this.formatFraction(right, 'fraction', true);
        const mediantStr = this.formatFraction(mediant, 'fraction', true);
        const currentStr = this.formatFraction(this.currentFraction, 'fraction', true);
        
        const numeratorSum = left.numerator + right.numerator;
        const denominatorSum = left.denominator + right.denominator;
        
        this.elements.mediantCalculation.innerHTML = `
            <strong>Mediant calculation:</strong><br>
            ${leftStr} ⊕ ${rightStr} = 
            <div class="fraction-2d" style="display: inline-block; margin: 0 0.5rem;">
                <div class="numerator">${left.numerator}+${right.numerator}</div>
                <div class="fraction-bar"></div>
                <div class="denominator">${left.denominator}+${right.denominator}</div>
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
            
            let cfDisplay = `[${cf[0]}`;
            if (cf.length > 1) {
                cfDisplay += `; ${cf.slice(1).join(', ')}`;
            }
            cfDisplay += ']';
            
            // Also show the ~notation
            let tildaDisplay = cf[0].toString();
            if (cf.length > 1) {
                tildaDisplay += '.~' + cf.slice(1).join('~');
            } else {
                tildaDisplay += '.~0';
            }
            
            // Get convergents with enhanced display
            const allConvergents = rational.convergents();
            const displayConvergents = allConvergents.slice(0, 6);
            const remainingCount = allConvergents.length - displayConvergents.length;
            
            let convergentsDisplay = displayConvergents
                .map(c => this.formatFraction(Fraction.fromRational(c), 'fraction', true))
                .join(', ');
            
            if (remainingCount > 0) {
                convergentsDisplay += ` <span class="more-link" onclick="sternBrocotApp.showConvergentsModal()">...(+${remainingCount})</span>`;
            }
            
            this.elements.continuedFraction.innerHTML = `
                <strong>Standard notation:</strong> ${cfDisplay}<br>
                <strong>RatMath notation:</strong> ${this.wrapContinuedFraction(tildaDisplay)}<br>
                <strong><span class="more-link" onclick="sternBrocotApp.showConvergentsModal()" style="text-decoration: none; color: inherit; cursor: pointer;" title="Click to view all convergents">Convergents:</span></strong> <span class="more-link" onclick="sternBrocotApp.showConvergentsModal()" style="cursor: pointer;">${convergentsDisplay}</span>
            `;
        } catch (error) {
            this.elements.continuedFraction.textContent = 'Error calculating continued fraction';
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
        this.animateToNewFraction(new Fraction(1, 1));
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
            this.treeContainer.style.opacity = '0.7';
            setTimeout(() => {
                if (this.treeContainer) {
                    this.treeContainer.style.opacity = '1';
                }
            }, 100);
        }
    }

    jumpToFraction() {
        const input = this.elements.jumpInput.value.trim();
        if (!input) return;

        try {
            // Parse the input using the RatMath parser
            const result = Parser.parse(input);
            let fraction;

            if (result.toRational) {
                fraction = Fraction.fromRational(result.toRational());
            } else if (result.numerator !== undefined && result.denominator !== undefined) {
                fraction = new Fraction(result.numerator, result.denominator);
            } else {
                throw new Error('Invalid input');
            }

            // Ensure the fraction is in lowest terms
            fraction = fraction.reduce();
            
            // Check if it's a valid positive fraction
            if (fraction.numerator <= 0 || fraction.denominator <= 0) {
                throw new Error('Only positive fractions are supported');
            }

            this.elements.jumpInput.value = '';
            this.animateToNewFraction(fraction);
        } catch (error) {
            alert(`Invalid input: ${error.message}`);
        }
    }

    handleKeyPress(e) {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.navigateToParent();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.navigateToLeftChild();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.navigateToRightChild();
                break;
            case 'Home':
                e.preventDefault();
                this.reset();
                break;
            case 'Escape':
                this.elements.jumpInput.blur();
                break;
        }
    }

    handleSvgClick(e) {
        const target = e.target.closest('.tree-node');
        if (target && target.dataset.fraction) {
            const [num, den] = target.dataset.fraction.split('/').map(BigInt);
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
        this.scrollOffset.x = Math.max(maxScrollLeft, Math.min(maxScrollRight, this.scrollOffset.x));
        this.scrollOffset.y = Math.max(maxScrollUp, Math.min(maxScrollDown, this.scrollOffset.y));
    }

    calculateTreeBounds() {
        if (!this.treeContainer) return null;
        
        const nodes = this.treeContainer.querySelectorAll('.tree-node');
        if (nodes.length === 0) return null;
        
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        nodes.forEach(node => {
            const circle = node.querySelector('circle');
            if (circle) {
                const x = parseFloat(circle.getAttribute('cx'));
                const y = parseFloat(circle.getAttribute('cy'));
                const r = parseFloat(circle.getAttribute('r'));
                
                minX = Math.min(minX, x - r);
                maxX = Math.max(maxX, x + r);
                minY = Math.min(minY, y - r);
                maxY = Math.max(maxY, y + r);
            }
        });
        
        return {
            left: minX,
            right: maxX,
            top: minY,
            bottom: maxY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    handleTouchStart(e) {
        if (e.touches.length === 1) {
            this.lastTouchPosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1 && this.lastTouchPosition) {
            const deltaX = e.touches[0].clientX - this.lastTouchPosition.x;
            const deltaY = e.touches[0].clientY - this.lastTouchPosition.y;
            
            this.scrollOffset.x += deltaX * 0.5;
            this.scrollOffset.y += deltaY * 0.5;
            
            // Apply bounds checking
            this.applyScrollBounds();
            
            this.lastTouchPosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            
            this.updateTreeTransform();
        }
    }

    updateTreeTransform() {
        if (this.treeContainer) {
            this.treeContainer.setAttribute('transform', 
                `translate(${this.scrollOffset.x}, ${this.scrollOffset.y})`);
        }
    }

    renderTree() {
        // Clear existing content
        this.svg.innerHTML = '';

        // Create container group for all tree content
        this.treeContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.treeContainer.setAttribute('class', 'tree-container');
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
            type: 'current',
            size: 45 // Increased from 30
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
                        const isLeftSibling = currentSiblings.right.equals(this.currentFraction);
                        nodes.set(siblingKey, {
                            fraction: currentSibling,
                            x: center.x + (isLeftSibling ? -siblingSpacing : siblingSpacing),
                            y: center.y,
                            type: 'current-sibling',
                            size: 35
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
            const parentSize = ancestorLevel === 1 ? 40 : Math.max(30, 40 - ancestorLevel * 2);
            
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
                type: ancestorLevel === 1 ? 'parent' : 'ancestor',
                size: parentSize
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
                                type: 'sibling',
                                size: Math.max(25, parentSize - 5)
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
                                type: 'sibling',
                                size: Math.max(25, parentSize - 5)
                            });
                        }
                    }
                } catch (e) {
                    // Skip siblings if there's an error
                }
            }
            
            current = parent;
        }

        // Add children and descendants with siblings
        current = this.currentFraction;
        y = center.y;
        const horizontalSpacing = 140; // Increased spacing
        
        for (let depth = 1; depth <= maxDescendantDepth; depth++) {
            y += verticalSpacing;
            const levelNodes = this.getNodesAtDepth(current, depth);
            const nodeSize = depth === 1 ? 40 : Math.max(25, 40 - depth * 5); // Increased sizes
            
            // Calculate positions for main line nodes
            const totalWidth = (levelNodes.length - 1) * horizontalSpacing;
            const startX = center.x - totalWidth / 2;
            
            levelNodes.forEach((node, index) => {
                const key = node.toString();
                if (!nodes.has(key)) {
                    // Determine direction based on parent relationship
                    let nodeType = depth === 1 ? 'child' : 'descendant';
                    if (depth === 1) {
                        // For immediate children, determine if they're left or right
                        const children = this.currentFraction.sternBrocotChildren();
                        if (node.equals(children.left)) {
                            nodeType = 'left-child';
                        } else if (node.equals(children.right)) {
                            nodeType = 'right-child';
                        }
                    }
                    
                    nodes.set(key, {
                        fraction: node,
                        x: startX + index * horizontalSpacing,
                        y: y,
                        type: nodeType,
                        size: nodeSize
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
                            const nodeX = startX + index * horizontalSpacing;
                            const siblingOffset = 80;
                            
                            // Add sibling that's not already in the main line
                            [siblings.left, siblings.right].forEach((sibling, sibIndex) => {
                                const sibKey = sibling.toString();
                                if (!nodes.has(sibKey) && !levelNodes.some(n => n.equals(sibling))) {
                                    nodes.set(sibKey, {
                                        fraction: sibling,
                                        x: nodeX + (sibIndex === 0 ? -siblingOffset : siblingOffset),
                                        y: y,
                                        type: 'sibling',
                                        size: nodeSize - 5
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
        
        // Recursively get nodes at target depth
        const previousLevel = this.getNodesAtDepth(root, targetDepth - 1);
        const currentLevel = [];
        
        for (const node of previousLevel) {
            try {
                const children = node.sternBrocotChildren();
                currentLevel.push(children.left, children.right);
            } catch {
                // Skip nodes that can't have children
            }
        }
        
        return currentLevel;
    }

    renderNodes(treeData) {
        const center = { x: this.svgWidth / 2, y: this.svgHeight / 2 };
        
        treeData.forEach(nodeData => {
            const { fraction, x, y, type, size } = nodeData;
            
            // Create node group
            const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            nodeGroup.classList.add('tree-node', type);
            nodeGroup.dataset.fraction = fraction.toString();
            
            // Calculate rectangle dimensions based on text content
            const fontSize = Math.max(14, Math.min(20, size / 2.2));
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
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', rectX);
            rect.setAttribute('y', rectY);
            rect.setAttribute('width', rectWidth);
            rect.setAttribute('height', rectHeight);
            rect.setAttribute('rx', 8); // Rounded corners
            rect.setAttribute('ry', 8);
            
            // Use 2D fraction display for nodes, adjusted for rectangle center
            const textCenterX = rectX + rectWidth / 2;
            const textCenterY = rectY + rectHeight / 2;
            const fractionElements = this.createSVG2DFraction(fraction, textCenterX, textCenterY, fontSize);
            
            nodeGroup.appendChild(rect);
            fractionElements.forEach(element => {
                // Add text overflow handling
                element.setAttribute('text-overflow', 'ellipsis');
                nodeGroup.appendChild(element);
            });
            
            this.treeContainer.appendChild(nodeGroup);
        });
    }

    renderEdges(treeData) {
        const center = { x: this.svgWidth / 2, y: this.svgHeight / 2 };
        const nodeMap = new Map();
        
        // Calculate rectangle positions for each node first
        treeData.forEach(node => {
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

        treeData.forEach(nodeData => {
            const { fraction } = nodeData;
            
            // Draw edge to parent
            const parent = fraction.sternBrocotParent();
            if (parent && nodeMap.has(parent.toString())) {
                const parentNode = nodeMap.get(parent.toString());
                
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.classList.add('tree-edge');
                
                if (nodeData.type === 'current' || parentNode.type === 'current') {
                    line.classList.add('current');
                }
                
                // Line starts from bottom center of parent rectangle
                const parentBottomCenterX = parentNode.rectX + parentNode.rectWidth / 2;
                const parentBottomCenterY = parentNode.rectY + parentNode.rectHeight;
                
                // Line ends at top center of child rectangle
                const childTopCenterX = nodeData.rectX + nodeData.rectWidth / 2;
                const childTopCenterY = nodeData.rectY;
                
                line.setAttribute('x1', parentBottomCenterX);
                line.setAttribute('y1', parentBottomCenterY);
                line.setAttribute('x2', childTopCenterX);
                line.setAttribute('y2', childTopCenterY);
                
                this.treeContainer.appendChild(line);
            }
        });
    }

    showConvergentsModal() {
        try {
            const rational = this.currentFraction.toRational();
            const allConvergents = rational.convergents();
            const currentFractionStr = this.formatFraction(this.currentFraction, 'fraction');
            const targetValue = Number(this.currentFraction.numerator) / Number(this.currentFraction.denominator);
            
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
                const convergentStr = this.formatFraction(convergentFraction, 'fraction');
                const isCurrent = convergentStr === currentFractionStr;
                
                // Use repeating decimal with period info
                const convergentRational = convergentFraction.toRational();
                const decimalInfo = convergentRational.toRepeatingDecimalWithPeriod(true);
                const decimalDisplay = decimalInfo.period > 0 ? 
                    `${decimalInfo.decimal} (p:${decimalInfo.period})` : 
                    decimalInfo.decimal;
                
                // Calculate exact fractional distance
                const targetRational = this.currentFraction.toRational();
                const exactDistance = targetRational.subtract(convergentRational).abs();
                const distanceScientific = Math.abs(targetValue - Number(convergentFraction.numerator) / Number(convergentFraction.denominator)).toExponential(3);
                
                modalContent += `
                    <tr class="${isCurrent ? 'current-row' : ''}">
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
            this.elements.convergentsModal.style.display = 'block';
        } catch (error) {
            console.error('Error showing convergents modal:', error);
        }
    }

    showFareyModal() {
        try {
            const reducedFraction = this.currentFraction.reduce();
            const fareyLevel = Math.min(Number(reducedFraction.denominator), 10);
            const fareySequence = this.generateFareySequence(fareyLevel);
            const currentFractionStr = this.formatFraction(this.currentFraction, 'fraction');
            
            let modalContent = `<h3>Farey Sequence F<sub>${fareyLevel}</sub></h3>`;
            modalContent += '<div class="farey-grid">';
            
            fareySequence.forEach(fraction => {
                const fractionStr = this.formatFraction(fraction, 'fraction');
                const isCurrent = fractionStr === currentFractionStr;
                
                modalContent += `<span class="farey-item ${isCurrent ? 'current' : ''}">
                    ${fractionStr}
                </span>`;
            });
            
            modalContent += '</div>';
            
            if (fareyLevel === 10 && Number(reducedFraction.denominator) > 10) {
                modalContent += `<p><em>Note: Showing F<sub>10</sub> only. The fraction ${currentFractionStr} first appears in F<sub>${reducedFraction.denominator}</sub>.</em></p>`;
            }
            
            this.elements.fareySequenceContent.innerHTML = modalContent;
            this.elements.fareyModal.style.display = 'block';
        } catch (error) {
            console.error('Error showing Farey modal:', error);
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
                    if (!fractions.some(f => f.toString() === fractionStr)) {
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
        
        let wrapped = '';
        for (let i = 0; i < pathString.length; i += 20) {
            if (i > 0) wrapped += '<br>';
            wrapped += pathString.slice(i, i + 20);
        }
        return wrapped;
    }

    wrapContinuedFraction(cfString) {
        if (!cfString.includes('~')) return cfString;
        
        const parts = cfString.split('~');
        let wrapped = parts[0]; // Start with the integer part
        
        for (let i = 1; i < parts.length; i++) {
            const nextPart = '~' + parts[i];
            const currentLine = wrapped.split('<br>').pop();
            
            // Add line break if current line would become too long (25 characters)
            if (currentLine.length + nextPart.length > 25) {
                wrapped += '<br>' + nextPart;
            } else {
                wrapped += nextPart;
            }
        }
        
        return wrapped;
    }

    loadFromURL(pushToHistory = true) {
        const hash = window.location.hash.slice(1); // Remove #
        if (hash && hash.includes('_')) {
            try {
                const [numerator, denominator] = hash.split('_').map(s => BigInt(s));
                if (numerator > 0 && denominator > 0) {
                    const fraction = new Fraction(numerator, denominator);
                    this.currentFraction = fraction;
                    this.updateDisplay();
                    this.renderTree();
                    return;
                }
            } catch (e) {
                console.warn('Invalid URL hash:', hash);
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
            history.pushState(null, '', hash);
        }
    }

    navigateToConvergent(numeratorStr, denominatorStr) {
        try {
            const numerator = BigInt(numeratorStr);
            const denominator = BigInt(denominatorStr);
            const fraction = new Fraction(numerator, denominator);
            this.animateToNewFraction(fraction);
            this.closeModal('convergents');
        } catch (error) {
            console.error('Error navigating to convergent:', error);
        }
    }

    closeModal(type) {
        if (type === 'convergents') {
            this.elements.convergentsModal.style.display = 'none';
        } else if (type === 'farey') {
            this.elements.fareyModal.style.display = 'none';
        }
    }
}

// Global variable for onclick handlers
let sternBrocotApp;

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    sternBrocotApp = new SternBrocotTreeVisualizer();
});
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
        
        this.initializeElements();
        this.setupEventListeners();
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
            displayMode: document.getElementById('displayMode'),
            parentBtn: document.getElementById('parentBtn'),
            leftChildBtn: document.getElementById('leftChildBtn'),
            rightChildBtn: document.getElementById('rightChildBtn'),
            resetBtn: document.getElementById('resetBtn'),
            jumpInput: document.getElementById('jumpInput'),
            jumpBtn: document.getElementById('jumpBtn'),
            breadcrumbPath: document.getElementById('breadcrumbPath'),
            mediantCalculation: document.getElementById('mediantCalculation'),
            continuedFraction: document.getElementById('continuedFraction'),
            fareyInfo: document.getElementById('fareyInfo')
        };
    }

    setupEventListeners() {
        // Display mode change
        this.elements.displayMode.addEventListener('change', (e) => {
            this.displayMode = e.target.value;
            this.updateDisplay();
            this.renderTree();
        });

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
    }

    formatFraction(fraction, mode = null) {
        const displayMode = mode || this.displayMode;
        
        if (fraction.isInfinite) {
            return fraction.numerator > 0 ? '+∞' : '-∞';
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

    updateDisplay() {
        // Update current fraction display
        this.elements.currentFraction.textContent = this.formatFraction(this.currentFraction);

        // Update depth
        const depth = this.currentFraction.sternBrocotDepth();
        this.elements.currentDepth.textContent = depth === Infinity ? '∞' : depth.toString();

        // Update path
        const path = this.currentFraction.sternBrocotPath();
        this.elements.currentPath.textContent = path.length === 0 ? 'Root' : path.join('');

        // Update boundaries
        const parents = this.currentFraction.fareyParents();
        const leftBoundary = this.formatFraction(parents.left, 'fraction');
        const rightBoundary = this.formatFraction(parents.right, 'fraction');
        this.elements.currentBoundaries.textContent = 
            `${leftBoundary} ← ${this.formatFraction(this.currentFraction, 'fraction')} → ${rightBoundary}`;

        // Update navigation button states
        const hasParent = this.currentFraction.sternBrocotParent() !== null;
        this.elements.parentBtn.disabled = !hasParent;

        // Update breadcrumbs
        this.updateBreadcrumbs();

        // Update mediant calculation
        this.updateMediantCalculation();

        // Update continued fraction
        this.updateContinuedFraction();

        // Update Farey info
        this.updateFareyInfo();
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
            const direction = path[i] === 'L' ? 'Left' : 'Right';
            breadcrumbHtml += ` → <span class="breadcrumb">${this.formatFraction(fraction, 'fraction')} (${direction})</span>`;
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
        const leftStr = this.formatFraction(left, 'fraction');
        const rightStr = this.formatFraction(right, 'fraction');
        const mediantStr = this.formatFraction(mediant, 'fraction');
        
        this.elements.mediantCalculation.innerHTML = `
            <strong>Mediant calculation:</strong><br>
            ${leftStr} ⊕ ${rightStr} = (${left.numerator}+${right.numerator})/(${left.denominator}+${right.denominator}) = ${mediantStr}<br>
            <br>
            <strong>Verification:</strong><br>
            ${mediantStr} = ${this.formatFraction(this.currentFraction, 'fraction')} ✓
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
            
            this.elements.continuedFraction.innerHTML = `
                <strong>Standard notation:</strong> ${cfDisplay}<br>
                <strong>RatMath notation:</strong> ${tildaDisplay}<br>
                <strong>Convergents:</strong> ${rational.convergents(5).map(c => this.formatFraction(Fraction.fromRational(c), 'fraction')).join(', ')}...
            `;
        } catch (error) {
            this.elements.continuedFraction.textContent = 'Error calculating continued fraction';
        }
    }

    updateFareyInfo() {
        try {
            const depth = this.currentFraction.sternBrocotDepth();
            const rational = this.currentFraction.toRational();
            const bestApprox = rational.bestApproximation(100);
            
            // Calculate Farey sequence level where this fraction first appears
            // This is the denominator of the reduced fraction
            const reducedFraction = this.currentFraction.reduce();
            const fareyLevel = Number(reducedFraction.denominator);
            
            // Check if fraction is in canonical form by comparing with reduced version
            const isReduced = this.currentFraction.numerator === reducedFraction.numerator && 
                             this.currentFraction.denominator === reducedFraction.denominator;
            
            // Get decimal representation using Rational class
            const decimalValue = rational.toDecimal();
            
            this.elements.fareyInfo.innerHTML = `
                <strong>First appears in:</strong> Farey sequence F<sub>${fareyLevel}</sub><br>
                <strong>Tree depth:</strong> ${depth === Infinity ? '∞' : depth}<br>
                <strong>Best approximation (denom ≤ 100):</strong> ${this.formatFraction(Fraction.fromRational(bestApprox), 'fraction')}<br>
                <strong>Is reduced:</strong> ${isReduced ? 'Yes' : 'No'}<br>
                <strong>Decimal value:</strong> ${decimalValue}
            `;
        } catch (error) {
            console.error('Farey info error:', error);
            // Fallback with basic information
            try {
                const depth = this.currentFraction.sternBrocotDepth();
                const rational = this.currentFraction.toRational();
                const decimalValue = rational.toDecimal();
                
                this.elements.fareyInfo.innerHTML = `
                    <strong>Tree depth:</strong> ${depth === Infinity ? '∞' : depth}<br>
                    <strong>Decimal value:</strong> ${decimalValue}<br>
                    <strong>Fraction:</strong> ${this.currentFraction.toString()}<br>
                    <em>Some advanced features unavailable</em>
                `;
            } catch (fallbackError) {
                this.elements.fareyInfo.innerHTML = `
                    <strong>Fraction:</strong> ${this.currentFraction.toString()}<br>
                    <em>Error calculating Farey information</em>
                `;
            }
        }
    }

    navigateToParent() {
        const parent = this.currentFraction.sternBrocotParent();
        if (parent) {
            this.currentFraction = parent;
            this.updateDisplay();
            this.renderTree();
        }
    }

    navigateToLeftChild() {
        const children = this.currentFraction.sternBrocotChildren();
        this.currentFraction = children.left;
        this.updateDisplay();
        this.renderTree();
    }

    navigateToRightChild() {
        const children = this.currentFraction.sternBrocotChildren();
        this.currentFraction = children.right;
        this.updateDisplay();
        this.renderTree();
    }

    reset() {
        this.currentFraction = new Fraction(1, 1);
        this.updateDisplay();
        this.renderTree();
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

            this.currentFraction = fraction;
            this.elements.jumpInput.value = '';
            this.updateDisplay();
            this.renderTree();
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
            this.currentFraction = new Fraction(num, den);
            this.updateDisplay();
            this.renderTree();
        }
    }

    renderTree() {
        // Clear existing content
        this.svg.innerHTML = '';

        // Get tree structure centered around current fraction
        const treeData = this.getTreeStructure();
        
        // Render edges first (so they appear behind nodes)
        this.renderEdges(treeData);
        
        // Render nodes
        this.renderNodes(treeData);
    }

    getTreeStructure() {
        const maxDepth = 4; // Show 4 levels of the tree
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

        // Add parent and ancestors with their siblings
        let current = this.currentFraction;
        let y = center.y;
        const verticalSpacing = 90; // Increased spacing
        
        for (let i = 0; i < maxDepth; i++) {
            const parent = current.sternBrocotParent();
            if (!parent) break;
            
            y -= verticalSpacing;
            const parentSize = i === 0 ? 40 : 35; // Increased sizes
            
            // Add the parent
            nodes.set(parent.toString(), {
                fraction: parent,
                x: center.x,
                y: y,
                type: i === 0 ? 'parent' : 'ancestor',
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
                                x: center.x - siblingSpacing,
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
                                x: center.x + siblingSpacing,
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
        
        for (let depth = 1; depth <= maxDepth; depth++) {
            y += verticalSpacing;
            const levelNodes = this.getNodesAtDepth(current, depth);
            const nodeSize = depth === 1 ? 40 : Math.max(25, 40 - depth * 5); // Increased sizes
            
            // Calculate positions for main line nodes
            const totalWidth = (levelNodes.length - 1) * horizontalSpacing;
            const startX = center.x - totalWidth / 2;
            
            levelNodes.forEach((node, index) => {
                const key = node.toString();
                if (!nodes.has(key)) {
                    nodes.set(key, {
                        fraction: node,
                        x: startX + index * horizontalSpacing,
                        y: y,
                        type: depth === 1 ? 'child' : 'descendant',
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
        treeData.forEach(nodeData => {
            const { fraction, x, y, type, size } = nodeData;
            
            // Create node group
            const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            nodeGroup.classList.add('tree-node', type);
            nodeGroup.dataset.fraction = fraction.toString();
            
            // Create circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', size);
            
            // Create text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            text.textContent = this.formatFraction(fraction);
            
            // Adjust font size based on node size
            const fontSize = Math.max(10, Math.min(16, size / 2.5));
            text.setAttribute('font-size', fontSize);
            
            nodeGroup.appendChild(circle);
            nodeGroup.appendChild(text);
            this.svg.appendChild(nodeGroup);
        });
    }

    renderEdges(treeData) {
        const nodeMap = new Map();
        treeData.forEach(node => {
            nodeMap.set(node.fraction.toString(), node);
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
                
                line.setAttribute('x1', parentNode.x);
                line.setAttribute('y1', parentNode.y + parentNode.size);
                line.setAttribute('x2', nodeData.x);
                line.setAttribute('y2', nodeData.y - nodeData.size);
                
                this.svg.appendChild(line);
            }
        });
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SternBrocotTreeVisualizer();
});
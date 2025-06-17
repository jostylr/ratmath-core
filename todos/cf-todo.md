# Continued Fractions Implementation TODO

## Overview
Add continued fraction support to RatMath library using the syntax `3.~7~15~1~292` for representing rational numbers as continued fractions with repeating patterns using `#`.

## Core Implementation

### 1. Parser Extension
- [ ] Extend parser to recognize `.~` pattern in expressions
- [ ] Add tokenization for `~` separator in continued fraction context
- [ ] Support repeating patterns with `#` (e.g., `1.~#6` for [1; 6, 6, 6, ...])
- [ ] Support pure fractions without integer part (e.g., `.~2~3~4`)
- [ ] Add validation for continued fraction format
- [ ] Handle edge cases (single integers, simple fractions)

### 2. ContinuedFraction Class
- [ ] Create new `ContinuedFraction` class to represent continued fractions
- [ ] Constructor accepting array of coefficients and optional repeating pattern
- [ ] Properties:
  - [ ] `integerPart` - the integer part (a₀)
  - [ ] `coefficients` - array of continued fraction coefficients
  - [ ] `repeatingStart` - index where repetition begins (null if non-repeating)
- [ ] Input validation (coefficients must be positive integers except a₀)

### 3. Conversion Methods

#### From Continued Fraction to Rational
- [ ] `toRational()` method on ContinuedFraction class
- [ ] Algorithm to compute convergents using recurrence relation:
  - p₋₁ = 1, p₀ = a₀, pₙ = aₙ * pₙ₋₁ + pₙ₋₂
  - q₋₁ = 0, q₀ = 1, qₙ = aₙ * qₙ₋₁ + qₙ₋₂
- [ ] Handle repeating patterns (expand to sufficient precision)
- [ ] Handle infinite/periodic continued fractions appropriately

#### From Rational to Continued Fraction
- [ ] `toContinuedFraction()` method on Rational class
- [ ] Euclidean algorithm implementation for extracting coefficients
- [ ] Optional parameters:
  - [ ] `maxTerms` - limit number of terms for display
  - [ ] `detectRepeating` - attempt to detect repeating patterns
- [ ] Return ContinuedFraction object

### 4. String Representation
- [ ] `toString()` method on ContinuedFraction class using `3.~7~15~1~292` format
- [ ] `fromString()` static method to parse continued fraction strings
- [ ] Handle repeating patterns in string output (`#` notation)
- [ ] Proper formatting for edge cases (integers, simple fractions)

## Advanced Features

### 5. Convergents Support
- [ ] `convergents()` static method on ContinuedFraction class
- [ ] Accept continued fraction string and number of convergents desired
- [ ] Return array of Rational objects representing successive approximations
- [ ] Efficient computation using recurrence relations
- [ ] Optional: include convergent information (numerator/denominator sequences)

### 6. Utility Methods
- [ ] `getConvergent(n)` - get nth convergent as Rational
- [ ] `approximationError(target)` - compute error of convergents vs target value
- [ ] `bestApproximation(maxDenominator)` - find best rational approximation within denominator limit
- [ ] `isPeriodicQuadratic()` - detect if represents quadratic irrationals (for validation)

### 7. Farey Sequence and Mediant Inverse Operations
- [ ] `fareyParents()` method on Rational class
  - Find unique Farey neighbors [a/b, c/d] where rational is their mediant
  - Use Stern-Brocot tree structure and Extended Euclidean algorithm
  - Return `{left: Rational, right: Rational}` representing parent interval
  - Validate that |ad - bc| = 1 (Farey adjacency condition)
- [ ] `fareyPartner(endpoint, mediant)` static method on Rational class
  - Given one endpoint and the mediant, compute the other endpoint
  - Solve mediant equation: mediant = (a+c)/(b+d)
  - Validate Farey neighbor relationship
  - Return the missing endpoint as Rational
- [ ] `isFareyTriple(left, mediant, right)` static method on Rational class
  - Verify that mediant is actually the mediant of left and right
  - Check that left and right are true Farey neighbors (|ad - bc| = 1)
  - Return boolean validation result
- [ ] Integration with existing mediant operations
  - Connect to existing `mediant()` method in Fraction class
  - Ensure consistency with FractionInterval mediant operations
  - Add validation to existing mediant calculations

### 8. Stern-Brocot Tree Support in Fraction Class
- [ ] Extend Fraction class to allow infinite fractions for tree boundaries
  - Allow `new Fraction(1, 0)` to represent positive infinity (right boundary)
  - Allow `new Fraction(-1, 0)` to represent negative infinity (left boundary) 
  - These are essential for Stern-Brocot tree root: mediants of 0/1 and 1/0
  - Update validation to permit zero denominators only for ±1/0 cases
  - Ensure arithmetic operations handle infinite fractions appropriately
- [ ] Stern-Brocot tree navigation methods on Fraction class
  - `sternBrocotParent()` - find parent node in the tree
  - `sternBrocotChildren()` - find left and right child nodes
  - `sternBrocotPath()` - return path from root as array of 'L'/'R' directions
  - `fromSternBrocotPath(path)` - construct fraction from L/R path string
- [ ] Tree validation and utilities
  - `isSternBrocotValid()` - verify fraction exists in canonical tree position
  - `sternBrocotDepth()` - calculate depth/level in the tree
  - `sternBrocotAncestors()` - return array of all ancestors up to root

### 9. Integration with Existing Classes
- [ ] Update Parser to handle continued fraction expressions in arithmetic
- [ ] Add continued fraction support to template functions (R, F)
- [ ] Ensure continued fractions work in interval arithmetic contexts
- [ ] Add continued fraction examples to existing test suites

## Documentation and Examples

### 10. Documentation Updates
- [ ] Add continued fraction section to README.md
- [ ] Document syntax: `3.~7~15~1~292` and repeating patterns
- [ ] Add API documentation for new classes and methods
- [ ] Include mathematical background on continued fractions
- [ ] Document convergents and their properties
- [ ] Add Farey sequence and mediant inverse documentation
- [ ] Include mathematical background on Stern-Brocot tree
- [ ] Document fareyParents(), fareyPartner(), and isFareyTriple() methods
- [ ] Document Stern-Brocot tree infinite fractions (±1/0) and navigation methods
- [ ] Add mathematical background on tree structure and properties

### 11. Examples and Tests
- [ ] Create comprehensive test suite for continued fraction parsing
- [ ] Test roundtrip conversion: Rational → CF → Rational
- [ ] Test convergents computation with known examples (π, e, φ)
- [ ] Add examples to examples/ directory:
  - [ ] `continued-fractions-basic.js`
  - [ ] `convergents-demo.js`
  - [ ] `cf-approximations.js`
  - [ ] `farey-sequences.js`
  - [ ] `mediant-inverse.js`
  - [ ] `stern-brocot-tree.js`
- [ ] Test repeating patterns and edge cases
- [ ] Performance tests for large continued fractions
- [ ] Test Farey parent finding with known examples
- [ ] Test fareyPartner() with various endpoint combinations
- [ ] Validate isFareyTriple() with both valid and invalid triples
- [ ] Test edge cases: 0/1, 1/1, negative rationals
- [ ] Test Stern-Brocot tree navigation with infinite boundary fractions
- [ ] Test tree path generation and reconstruction
- [ ] Validate tree properties: parent-child relationships, depth calculations

### 12. Calculator Integration
- [ ] Update terminal calculator to display continued fraction option
- [ ] Add CF command to show continued fraction representation
- [ ] Update web calculator to support continued fraction input/output
- [ ] Add continued fraction examples to help documentation

### 13. Stern-Brocot Tree Interactive Demonstration
- [ ] Create separate web page for Stern-Brocot tree navigation
  - Located at `docs/stern-brocot.html` with supporting CSS/JS
  - Interactive tree visualization starting from any reduced fraction
  - Navigation controls: Up/Down arrows (to parent/child) + Left/Right arrows (sibling selection)
- [ ] Tree visualization features
  - [ ] Display current fraction prominently with decimal approximation
  - [ ] Show current tree path from root as L/R sequence
  - [ ] Display left and right boundary fractions for current position
  - [ ] Show tree depth/level information
  - [ ] Highlight parent and children relationships
- [ ] Navigation interface
  - [ ] Up arrow: navigate to parent fraction
  - [ ] Down arrow: show children options, then Left/Right to select
  - [ ] Left/Right arrows: move between sibling fractions at same level
  - [ ] Input field: jump directly to any fraction and find its tree position
  - [ ] Reset button: return to root (1/1)
- [ ] Educational features
  - [ ] Show mediant calculations: display how current fraction = mediant(left, right)
  - [ ] Breadcrumb trail showing full path from root
  - [ ] Fraction reduction verification (ensure input fractions are in lowest terms)
  - [ ] Connection to continued fraction representation
  - [ ] Display Farey sequence level where fraction first appears
- [ ] Technical implementation
  - [ ] Use Fraction class with ±1/0 boundary support
  - [ ] Implement tree traversal algorithms
  - [ ] Responsive design for mobile devices
  - [ ] Keyboard shortcuts for navigation
  - [ ] URL state management (shareable tree positions)

## Implementation Notes

### Mathematical Considerations
- Continued fractions for rationals are always finite
- Convergents provide best rational approximations
- Even convergents approach from below, odd from above
- Last convergent of finite CF equals the original rational exactly

### Performance Considerations
- Use BigInt arithmetic for large coefficients
- Implement efficient convergent computation
- Consider caching for frequently computed convergents
- Handle very long continued fractions gracefully

### Error Handling
- Validate continued fraction coefficients (positive integers except a₀)
- Handle division by zero in convergent computation
- Provide clear error messages for invalid CF syntax
- Graceful degradation for infinite/periodic patterns

## Future Enhancements (Out of Scope)
- Quadratic irrational support (√2, φ, etc.) - belongs in separate library
- Infinite continued fractions for transcendental numbers
- Specialized algorithms for specific mathematical constants
- Advanced number theory applications

## Priority
1. **High**: Parser extension, basic CF class, conversion methods
2. **Medium**: String representation, convergents, integration
3. **Low**: Advanced utilities, performance optimization, extended documentation
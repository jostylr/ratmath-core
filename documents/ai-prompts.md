# AI Prompts for RatMath Project

=== 2025-05-18:10:30

I want to build a JavaScript library for exact rational arithmetic using BigInt, and extend it to exact arithmetic between rational intervals. The goal is to have well-tested, documented, idiomatic modern JavaScript, organized as an importable ES module (ideally with separate files for core logic, tests, and documentation).

I want to run it locally with the JavaScript runtime Bun, but ultimately it will be for the browser.

Please implement the following:
	1.	Rational Number Class
	•	Implement a Rational class representing exact rational numbers using BigInt for numerator and denominator.
	•	Support construction from integers, strings like "3/4", or two BigInt values.
	•	Provide arithmetic operations: addition, subtraction, multiplication, division, negation, reciprocal, equality, comparison, and integer exponentiation.
	•	Support conversion to string (canonical lowest terms).
	2.	Rational Interval Class
	•	Implement a RationalInterval class that represents a closed interval between two Rational values: [a, b].
	•	Support construction from two Rational values or two strings like "3/4" and "1/2".
	•	Support arithmetic between intervals: interval addition, subtraction, multiplication, division, and integer exponentiation, all producing new intervals with endpoints exactly computed according to interval arithmetic rules. The underlying principle should be that the interval contains all combinations from the two intervals under the operation. This generally is dealt with by considering the endpoints. For example, in multipying a:b and c:d, check ac, ad, bc, bd and the new interval would be min(ac, ad, bc, bd):max(ac, ad, bc, bd). Positive exponents should be thought of as repeated multiplication, not applying the exponent to the individual elements. For negative exponents, this is reciprocation of the interval followed by repeated multiplication per the positive exponent rule. 
	•	Support checking for overlap, containment, and equality.
	•	For division or negative exponents, if the interval contains 0, throw an error (see error handling below).
	3.	Parser
	•	Implement a parser that can take string expressions for intervals and interval arithmetic, such as "3/4:1/2 + 10/8:21/3", and parse them into RationalInterval objects and arithmetic expressions on them.
	•	The convention for an interval should be "3/4:1/2", representing the closed interval from 3/4 to 1/2. It should be considered the same as "1/2:3/4". When presenting a computed interval, the least element should be first (e.g., "1/2:3/4").
	•	The parser should handle addition, subtraction, multiplication, division, parentheses, and integral exponentiation. Whitespace should be ignored.
	4.	Tests
	•	Provide a set of unit tests compatible with Bun (bun test, Jest style) to verify all class methods, interval arithmetic, parsing, and error conditions.
	5.	Documentation
	•	Write clear documentation, including a README and in-code doc comments, describing all classes, methods, input/output conventions, and usage examples.
	•	Put all AI prompts in an ai-prompt.md file, prepending each new prompt and response, using "=== date:time stamp" to delineate new prompt/response segments.
	6.	Errors
	•	If attempting to create a fraction with a denominator of 0, throw an Error (e.g., throw new Error("Denominator cannot be zero")).
	•	If attempting to divide by a rational number whose value is 0, throw an Error (e.g., throw new Error("Division by zero")).
	•	On attempting to divide by an interval containing 0, throw a clear, descriptive error: throw new Error("Cannot divide by an interval containing zero").
	•	Raising 0 to the 0th power should throw an error, as should negative exponents whose base is 0 or is an interval containing 0. An interval with no 0 in it that is raised to the 0th power should return the interval 1:1.
	•	All error messages should be consistent, human-readable, and tested in unit tests.

Output the code, tests, and documentation in clearly separated sections/files, with clear file headers, as would be appropriate for a GitHub project.

=== 2025-05-19:14:45

I added a different exponential power interpretation using actual repeated multiplication of intervals to rational-interval.js; I called it mpow. Can you modify the parser so that the symbol ** does this kind of exponentiation (so mpow is called for ** and pow is called for ^).  Add tests and documentation both for the modifications I made and the parser modification. I also added zero, one constants for both rational and rational interval as well as a unitInterval constant. Document and test those as well. Finally, I added reciprocate and negate; document and test those as well added the proper jsdoc documentation before their methods. Remember to update the ai-prompt with this prompt as well.

=== 2025-05-20:15:30

Next I want to implent a fractional interval class. This prompt will just create the file fraction-interval.js to provide the class FractionInterval. It should do the following: 
	• Represents a closed interval from one Fraction to another.
	• Construction:
	• Accepts two Fraction endpoints.
	• Mediant Partition:
	• Method partitionWithMediants(n) that recursively partitions the interval with n mediants, returning an array of intervals or fractions as appropriate.
	• General Partition:
	• Method partitionWith(fn) where fn is a callback (a, b) => [Fraction, ...], and returns intervals formed by sorting the endpoints and applying the callback for partition points.
	• Conversion methods to and from RationalInterval.

It should be imported into index.js and exported from there.

After implementation, we updated the `FractionInterval` implementation to use proper fraction comparison methods rather than converting to Number. We added comparison methods to the `Fraction` class (lessThan, lessThanOrEqual, greaterThan, greaterThanOrEqual) that use the algebraic formula a/b < c/d if and only if ad < bc, which works correctly with BigInt values.

We also refined the mediant partitioning implementation to:
1. Make `n` optional with a default value of 1
2. Implement true recursive subdivision where each existing interval is split using its mediant at each level
3. Create a helper method `mediantSplit()` for clarity

Finally, we created comprehensive tests for the new `FractionInterval` class and the comparison methods added to `Fraction`, and updated documentation to include these new features.

=== 2025-05-20 09:45

I would like to extend the parser and output to support mixed numbers, such as 5..2/3 being the equivalent to 17/3. The notation for the separator is a double decimal point. Can you modify the parser to handle that and add toMixedString methods that will output them in the mixed notation style?

In this session, we implemented mixed number functionality in the ratmath library. The implementation involved:

1. Extending the parser to recognize the format "a..b/c" for mixed numbers (where "a" is the whole part and "b/c" is the fractional part)
2. Adding `toMixedString()` methods to both the `Rational` and `RationalInterval` classes
3. Modifying the `Rational` constructor to handle mixed number input directly
4. Creating comprehensive tests for all new functionality
5. Adding dedicated example code demonstrating mixed number operations
6. Updating documentation in README.md and API.md

Mixed numbers are now fully supported throughout the library, allowing users to:
- Input mixed numbers using the double-dot notation (e.g., "5..2/3")
- Convert between improper fractions and mixed numbers
- Perform arithmetic with mixed numbers
- Display results in mixed number format

This implementation maintains the exact arithmetic principle of the library while providing a more human-readable representation for fractions greater than 1, especially useful for educational applications or contexts where mixed numbers are the conventional format.
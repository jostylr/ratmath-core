This library should support E notation. Not all number setups fit with E. One can always use parentheses to handle it. Only the capital E is recognized; lowercase e is not considered to be E notation. Outside of the particular Number setups, E should be a binary operator that takes in a number on the left and multiplies it by 10^right. This can be done by having parentheses or by having a space. So 1.3:2.4 E2 will produce 130:240 while 1.3:2.4E2 becomes 1.3:240

Rules
	1.	Standard Decimals:
	•	Parse [decimal]E[integer] as decimal × 10^integer.
	•	Examples:
	•	1.23E4 is basically 12300, but 1.23 as a single decimal gets interpreted as an interval 1.225:1.235 and so E4 transforms that into 1225:1235
	•	5E-3 → 0.005 does work as integers are treated as exact. 5.0E-3 would become 4.5:5.5 and then the E applies to 0.0045:0.0055
	2.	Decimals with Intervals or Uncertainty:
	•	E-notation is not allowed inside the center value of the interval (e.g., 1.23E4[2,3] is not valid).
	•	E-notation is allowed in:
	•	The interval offsets:
	•	Example: 1.23[+2E2,-3E3]
	•	Offsets are multiplied: +200, -3000 which then becomes because the placement is in the thousandths, adding .2 and subtracting 3. So -2.23:1.43
	•	The outside of the interval:
	•	Example: 1.23[2,3]E5. This first becomes 1.232:1.233 and then apply the E to go to 123,200 and 123,300
	3.	Intervals (Decimals):
	•	E-notation in intervals for decimals applies tightly to it.
	•	Example: 1.23:2.34E3 → 1.23:2340  To apply E3 to both, parentheses are required: (1.23:2.34)E3
	4.	Rational Numbers (Fractions):
	•	E-notation is NOT allowed directly after a fraction (e.g., 5/4E2 is invalid).
	•	To use E-notation with fractions, require explicit parentheses:
	•	(5/4)E2 → (5/4) × 100 = 125/4 = 31.25
	•	5/(4E2) → 5 / 400 = 0.0125
	•	Same rule for mixed numbers (e.g., 1..1/4E3 is invalid, (1..1/4)E3 is valid).

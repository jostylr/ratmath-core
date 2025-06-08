import { Integer, Rational } from '../index.js';

console.log('=== Integer-Rational Integration Demo ===\n');

// 1. Basic Division Examples
console.log('1. Division: Integer → Integer or Rational');
console.log('--------------------------------------------');

const a = new Integer(15);
const b = new Integer(3);
const c = new Integer(4);

const exactDiv = a.divide(b);    // 15 ÷ 3 = 5 (exact)
const inexactDiv = a.divide(c);  // 15 ÷ 4 = 15/4 (rational)

console.log(`${a} ÷ ${b} = ${exactDiv} (${exactDiv.constructor.name})`);
console.log(`${a} ÷ ${c} = ${inexactDiv} (${inexactDiv.constructor.name})`);
console.log(`As decimal: ${inexactDiv.toNumber()}`);
console.log(`As mixed number: ${inexactDiv.toMixedString()}\n`);

// 2. Financial Calculations
console.log('2. Financial Calculations (Exact Precision)');
console.log('-------------------------------------------');

// Split $1000 among 7 people
const totalAmount = new Integer(1000);
const people = new Integer(7);
const sharePerPerson = totalAmount.divide(people);

console.log(`$${totalAmount} split among ${people} people:`);
console.log(`Each person gets: $${sharePerPerson} = $${sharePerPerson.toNumber().toFixed(6)}`);

// Verify: 7 shares should equal the original amount
const verification = sharePerPerson.multiply(new Rational(7));
console.log(`Verification: ${people} × ${sharePerPerson} = $${verification}\n`);

// 3. Recipe Scaling
console.log('3. Recipe Scaling');
console.log('-----------------');

// Original recipe serves 4, scale to serve 6
const originalServings = new Integer(4);
const desiredServings = new Integer(6);
const scalingFactor = desiredServings.divide(originalServings); // 6/4 = 3/2

// Original ingredients (in cups)
const ingredients = [
    { name: 'flour', amount: new Integer(2) },
    { name: 'sugar', amount: new Integer(1) },
    { name: 'milk', amount: new Rational(3, 4) }
];

console.log(`Scaling recipe from ${originalServings} to ${desiredServings} servings:`);
console.log(`Scaling factor: ${scalingFactor}`);
console.log('\nIngredients:');

ingredients.forEach(ingredient => {
    // Convert ingredient amount to rational if it's an integer
    const ingredientRational = ingredient.amount instanceof Integer ? 
        ingredient.amount.toRational() : ingredient.amount;
    const scaledAmount = ingredientRational.multiply(scalingFactor);
    console.log(`  ${ingredient.name}: ${ingredient.amount} → ${scaledAmount} (${scaledAmount.toMixedString()}) cups`);
});
console.log();

// 4. Geometric Calculations
console.log('4. Geometric Calculations');
console.log('-------------------------');

// Calculate area of rectangles with integer dimensions
const rectangles = [
    { width: new Integer(5), height: new Integer(3) },
    { width: new Integer(7), height: new Integer(2) },
    { width: new Integer(4), height: new Integer(6) }
];

let totalArea = new Integer(0);
console.log('Rectangle areas:');

rectangles.forEach((rect, i) => {
    const area = rect.width.multiply(rect.height);
    totalArea = totalArea.add(area);
    console.log(`  Rectangle ${i + 1}: ${rect.width} × ${rect.height} = ${area} square units`);
});

// Calculate average area
const numRectangles = new Integer(rectangles.length);
const averageArea = totalArea.divide(numRectangles);

console.log(`Total area: ${totalArea} square units`);
console.log(`Average area: ${averageArea} square units`);
console.log(`Average as decimal: ${averageArea.toNumber()} square units\n`);

// 5. Number Theory Examples
console.log('5. Number Theory');
console.log('----------------');

const num1 = new Integer(48);
const num2 = new Integer(18);

console.log(`Working with ${num1} and ${num2}:`);
console.log(`GCD(${num1}, ${num2}) = ${num1.gcd(num2)}`);
console.log(`LCM(${num1}, ${num2}) = ${num1.lcm(num2)}`);

// Fraction in lowest terms
const fraction = num1.divide(num2);
console.log(`${num1}/${num2} = ${fraction} (reduced to lowest terms)\n`);

// 6. Continued Fraction Approximation
console.log('6. Continued Fraction Approximation');
console.log('----------------------------------');

// Approximate π using the simple continued fraction [3; 7, 15, 1, 292, ...]
// We'll compute the first few convergents
function continuedFractionApproximation() {
    const cfTerms = [new Integer(3), new Integer(7), new Integer(15), new Integer(1)];
    
    // Start with the first term
    let approximation = cfTerms[0].toRational();
    console.log(`π ≈ ${approximation} = ${approximation.toNumber()}`);
    
    // Add each subsequent term
    for (let i = 1; i < cfTerms.length; i++) {
        // For continued fractions: a₀ + 1/(a₁ + 1/(a₂ + ...))
        // We build from the bottom up
        let partial = cfTerms[i].toRational();
        
        // Add terms from right to left
        for (let j = i - 1; j >= 0; j--) {
            partial = cfTerms[j].toRational().add(partial.reciprocal());
        }
        
        console.log(`π ≈ ${partial} = ${partial.toNumber()}`);
    }
}

continuedFractionApproximation();
console.log();

// 7. Unit Conversion
console.log('7. Unit Conversion');
console.log('------------------');

// Convert measurements with exact fractions
const inches = new Integer(37);
const inchesToFeet = inches.divide(new Integer(12)); // 37/12 feet

console.log(`${inches} inches = ${inchesToFeet} feet`);
console.log(`                = ${inchesToFeet.toMixedString()} feet`);
console.log(`                = ${inchesToFeet.toNumber()} feet\n`);

// 8. Probability Calculations
console.log('8. Probability Calculations');
console.log('---------------------------');

// Rolling two dice: probability of getting sum = 7
// There are 6 ways to get 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1)
// Total outcomes = 6 × 6 = 36

const favorableOutcomes = new Integer(6);
const totalOutcomes = new Integer(36);
const probability = favorableOutcomes.divide(totalOutcomes);

console.log(`Probability of rolling sum = 7 with two dice:`);
console.log(`${favorableOutcomes}/${totalOutcomes} = ${probability} = ${probability.toNumber()}\n`);

// 9. Large Number Arithmetic
console.log('9. Large Number Arithmetic');
console.log('--------------------------');

const large1 = new Integer('123456789012345678901234567890');
const large2 = new Integer('987654321098765432109876543210');

console.log(`Large number 1: ${large1}`);
console.log(`Large number 2: ${large2}`);

const sum = large1.add(large2);
const product = large1.multiply(large2);
const quotient = large1.divide(large2);

console.log(`Sum: ${sum}`);
console.log(`Product: ${product.toString().substring(0, 50)}...`);
console.log(`Quotient: ${quotient}`);
console.log(`Quotient as decimal: ${quotient.toNumber()}\n`);

// 10. Roundtrip Conversions
console.log('10. Roundtrip Conversions');
console.log('-------------------------');

const originalInt = new Integer(42);
console.log(`Original integer: ${originalInt}`);

// Integer → Rational → Integer
const asRational = originalInt.toRational();
console.log(`As rational: ${asRational}`);

const backToInt = Integer.fromRational(asRational);
console.log(`Back to integer: ${backToInt}`);
console.log(`Conversion preserved value: ${originalInt.equals(backToInt)}\n`);

// 11. Complex Calculation Chain
console.log('11. Complex Calculation Chain');
console.log('-----------------------------');

// Calculate: ((10 + 3) × 2 - 1) ÷ 5
const step1 = new Integer(10).add(new Integer(3));           // 13
const step2 = step1.multiply(new Integer(2));                // 26
const step3 = step2.subtract(new Integer(1));                // 25
const result = step3.divide(new Integer(5));                 // 5 (exact)

console.log(`((10 + 3) × 2 - 1) ÷ 5 = ${result} (${result.constructor.name})`);

// Modify to create a rational result
const step3b = step2.subtract(new Integer(2));               // 24
const resultRational = step3b.divide(new Integer(5));        // 24/5

console.log(`((10 + 3) × 2 - 2) ÷ 5 = ${resultRational} (${resultRational.constructor.name})`);
console.log(`As mixed number: ${resultRational.toMixedString()}`);
console.log(`As decimal: ${resultRational.toNumber()}\n`);

console.log('=== End of Demo ===');
import { test, expect } from "bun:test";
import { Rational } from "../src/rational.js";
import { RationalInterval } from "../src/rational-interval.js";
import { PI, E, SIN, COS, ARCSIN, ARCCOS, EXP, LN, LOG, newtonRoot, rationalIntervalPower } from "../src/ratreal.js";
import { Parser } from "../src/parser.js";

// Test constants
test("PI constant", () => {
  const pi = PI();
  expect(pi).toBeInstanceOf(RationalInterval);
  // Check that it's approximately 3.14159...
  expect(pi.low.toNumber()).toBeCloseTo(3.14159, 4);
  expect(pi.high.toNumber()).toBeCloseTo(3.14159, 4);
});

test("PI with precision", () => {
  const pi6 = PI(6); // 1/6 precision
  const piNeg6 = PI(-6); // 10^-6 precision
  
  expect(pi6).toBeInstanceOf(RationalInterval);
  expect(piNeg6).toBeInstanceOf(RationalInterval);
  
  // Higher precision should have smaller interval
  const width6 = pi6.high.subtract(pi6.low);
  const widthNeg6 = piNeg6.high.subtract(piNeg6.low);
  expect(widthNeg6.compareTo(width6) < 0).toBe(true);
});

test("E constant", () => {
  const e = E();
  expect(e).toBeInstanceOf(RationalInterval);
  // Check that it's approximately 2.71828...
  expect(e.low.toNumber()).toBeCloseTo(2.71828, 4);
  expect(e.high.toNumber()).toBeCloseTo(2.71828, 4);
});

// Test exponential function
test("EXP function", () => {
  // EXP(0) should be 1
  const exp0 = EXP(new Rational(0));
  expect(exp0).toBeInstanceOf(RationalInterval);
  expect(exp0.low.toNumber()).toBeCloseTo(1, 6);
  expect(exp0.high.toNumber()).toBeCloseTo(1, 6);
  
  // EXP(1) should be approximately e
  const exp1 = EXP(new Rational(1));
  expect(exp1.low.toNumber()).toBeCloseTo(2.71828, 4);
  expect(exp1.high.toNumber()).toBeCloseTo(2.71828, 4);
  
  // EXP(2) should be approximately e^2
  const exp2 = EXP(new Rational(2));
  expect(exp2.low.toNumber()).toBeCloseTo(7.38906, 4);
  expect(exp2.high.toNumber()).toBeCloseTo(7.38906, 4);
});

test("EXP with intervals", () => {
  const interval = new RationalInterval(new Rational(0), new Rational(1));
  const result = EXP(interval);
  expect(result).toBeInstanceOf(RationalInterval);
  expect(result.low.toNumber()).toBeCloseTo(1, 5);
  expect(result.high.toNumber()).toBeCloseTo(2.71828, 4);
});

// Test logarithm functions
test("LN function", () => {
  // LN(1) should be 0
  const ln1 = LN(new Rational(1));
  expect(ln1).toBeInstanceOf(RationalInterval);
  expect(ln1.low.toNumber()).toBeCloseTo(0, 6);
  expect(ln1.high.toNumber()).toBeCloseTo(0, 6);
  
  // LN(e) should be approximately 1
  const e = E();
  const eMid = e.low.add(e.high).divide(new Rational(2));
  const lnE = LN(eMid);
  expect(lnE.low.toNumber()).toBeCloseTo(1, 3);
  expect(lnE.high.toNumber()).toBeCloseTo(1, 3);
  
  // Test with negative input (should throw)
  expect(() => LN(new Rational(-1))).toThrow();
});

test("LOG function", () => {
  // LOG(10) should be 1 (base 10)
  const log10 = LOG(new Rational(10));
  expect(log10).toBeInstanceOf(RationalInterval);
  expect(log10.low.toNumber()).toBeCloseTo(1, 5);
  expect(log10.high.toNumber()).toBeCloseTo(1, 5);
  
  // LOG(8, 2) should be 3
  const log8base2 = LOG(new Rational(8), new Rational(2));
  expect(log8base2.low.toNumber()).toBeCloseTo(3, 4);
  expect(log8base2.high.toNumber()).toBeCloseTo(3, 4);
});

// Test trigonometric functions
test("SIN function", () => {
  // SIN(0) should be 0
  const sin0 = SIN(new Rational(0));
  expect(sin0).toBeInstanceOf(RationalInterval);
  expect(sin0.low.toNumber()).toBeCloseTo(0, 6);
  expect(sin0.high.toNumber()).toBeCloseTo(0, 6);
  
  // SIN(π/2) should be approximately 1
  const piOver2 = PI().divide(new Rational(2));
  const piOver2Mid = piOver2.low.add(piOver2.high).divide(new Rational(2));
  const sinPiOver2 = SIN(piOver2Mid);
  expect(sinPiOver2.low.toNumber()).toBeCloseTo(1, 3);
  expect(sinPiOver2.high.toNumber()).toBeCloseTo(1, 3);
});

test("COS function", () => {
  // COS(0) should be 1
  const cos0 = COS(new Rational(0));
  expect(cos0).toBeInstanceOf(RationalInterval);
  expect(cos0.low.toNumber()).toBeCloseTo(1, 5);
  expect(cos0.high.toNumber()).toBeCloseTo(1, 5);
  
  // COS(π) should be approximately -1
  const pi = PI();
  const piMid = pi.low.add(pi.high).divide(new Rational(2));
  const cosPi = COS(piMid);
  expect(cosPi.low.toNumber()).toBeCloseTo(-1, 3);
  expect(cosPi.high.toNumber()).toBeCloseTo(-1, 3);
});

test("ARCSIN function", () => {
  // ARCSIN(0) should be 0
  const arcsin0 = ARCSIN(new Rational(0));
  expect(arcsin0).toBeInstanceOf(RationalInterval);
  expect(arcsin0.low.toNumber()).toBeCloseTo(0, 6);
  expect(arcsin0.high.toNumber()).toBeCloseTo(0, 6);
  
  // ARCSIN(1) should be approximately π/2
  const arcsin1 = ARCSIN(new Rational(1));
  const piOver2 = PI().divide(new Rational(2));
  const piOver2Mid = piOver2.low.add(piOver2.high).divide(new Rational(2));
  expect(arcsin1.low.toNumber()).toBeCloseTo(piOver2Mid.toNumber(), 1);
  expect(arcsin1.high.toNumber()).toBeCloseTo(piOver2Mid.toNumber(), 1);
  
  // Test domain error
  expect(() => ARCSIN(new Rational(2))).toThrow();
  expect(() => ARCSIN(new Rational(-2))).toThrow();
});

test("ARCCOS function", () => {
  // ARCCOS(1) should be 0
  const arccos1 = ARCCOS(new Rational(1));
  expect(arccos1).toBeInstanceOf(RationalInterval);
  expect(arccos1.low.toNumber()).toBeCloseTo(0, 1);
  expect(arccos1.high.toNumber()).toBeCloseTo(0, 1);
  
  // ARCCOS(0) should be approximately π/2
  const arccos0 = ARCCOS(new Rational(0));
  const piOver2 = PI().divide(new Rational(2));
  const piOver2Mid = piOver2.low.add(piOver2.high).divide(new Rational(2));
  expect(arccos0.low.toNumber()).toBeCloseTo(piOver2Mid.toNumber(), 1);
  expect(arccos0.high.toNumber()).toBeCloseTo(piOver2Mid.toNumber(), 1);
});

// Test Newton's method for roots
test("Newton's method for square root", () => {
  const sqrt4 = newtonRoot(new Rational(4), 2);
  expect(sqrt4).toBeInstanceOf(RationalInterval);
  expect(sqrt4.low.toNumber()).toBeCloseTo(2, 5);
  expect(sqrt4.high.toNumber()).toBeCloseTo(2, 5);
  
  const sqrt2 = newtonRoot(new Rational(2), 2);
  expect(sqrt2.low.toNumber()).toBeCloseTo(1.41421, 4);
  expect(sqrt2.high.toNumber()).toBeCloseTo(1.41421, 4);
});

test("Newton's method for cube root", () => {
  const cbrt8 = newtonRoot(new Rational(8), 3);
  expect(cbrt8).toBeInstanceOf(RationalInterval);
  expect(cbrt8.low.toNumber()).toBeCloseTo(2, 0);
  expect(cbrt8.high.toNumber()).toBeCloseTo(2, 0);
  
  const cbrt27 = newtonRoot(new Rational(27), 3);
  expect(cbrt27.low.toNumber()).toBeCloseTo(3, 0);
  expect(cbrt27.high.toNumber()).toBeCloseTo(3, 0);
});

// Test fractional exponentiation
test("Rational interval power", () => {
  // 4^(1/2) should be 2
  const sqrt4 = rationalIntervalPower(new Rational(4), new Rational(1, 2));
  expect(sqrt4).toBeInstanceOf(RationalInterval);
  expect(sqrt4.low.toNumber()).toBeCloseTo(2, 4);
  expect(sqrt4.high.toNumber()).toBeCloseTo(2, 4);
  
  // 8^(1/3) should be 2
  const cbrt8 = rationalIntervalPower(new Rational(8), new Rational(1, 3));
  expect(cbrt8.low.toNumber()).toBeCloseTo(2, 0);
  expect(cbrt8.high.toNumber()).toBeCloseTo(2, 0);
  
  // 2^3 should be 8
  const twoToThree = rationalIntervalPower(new Rational(2), new Rational(3));
  expect(twoToThree.low.toNumber()).toBeCloseTo(8, 4);
  expect(twoToThree.high.toNumber()).toBeCloseTo(8, 4);
});

// Test Parser integration
test("Parser integration - constants", () => {
  const piResult = Parser.parse("PI");
  expect(piResult).toBeInstanceOf(RationalInterval);
  expect(piResult.low.toNumber()).toBeCloseTo(3.14159, 4);
  
  const eResult = Parser.parse("EXP");
  expect(eResult).toBeInstanceOf(RationalInterval);
  expect(eResult.low.toNumber()).toBeCloseTo(2.71828, 4);
});

test("Parser integration - functions", () => {
  const sinResult = Parser.parse("SIN(0)");
  expect(sinResult).toBeInstanceOf(RationalInterval);
  expect(sinResult.low.toNumber()).toBeCloseTo(0, 6);
  
  const expResult = Parser.parse("EXP(1)");
  expect(expResult).toBeInstanceOf(RationalInterval);
  expect(expResult.low.toNumber()).toBeCloseTo(2.71828, 4);
  
  const lnResult = Parser.parse("LN(1)");
  expect(lnResult).toBeInstanceOf(RationalInterval);
  expect(lnResult.low.toNumber()).toBeCloseTo(0, 6);
});

test("Parser integration - precision specifications", () => {
  const piPrecise = Parser.parse("PI[-8]");
  expect(piPrecise).toBeInstanceOf(RationalInterval);
  
  const expPrecise = Parser.parse("EXP[-8](1)");
  expect(expPrecise).toBeInstanceOf(RationalInterval);
  expect(expPrecise.low.toNumber()).toBeCloseTo(2.71828, 5);
  
  const sinPrecise = Parser.parse("SIN[-8](0)");
  expect(sinPrecise).toBeInstanceOf(RationalInterval);
  expect(sinPrecise.low.toNumber()).toBeCloseTo(0, 7);
});

test("Parser integration - fractional exponents", () => {
  // Test 4^(1/2) = 2
  const sqrt4 = Parser.parse("4^(1/2)");
  expect(sqrt4).toBeInstanceOf(RationalInterval);
  expect(sqrt4.low.toNumber()).toBeCloseTo(2, 4);
  
  // Test 8**(1/3) = 2 (using Newton's method)
  const cbrt8 = Parser.parse("8**(1/3)");
  expect(cbrt8).toBeInstanceOf(RationalInterval);
  expect(cbrt8.low.toNumber()).toBeCloseTo(2, 0);
});

test("Complex expressions", () => {
  // Test EXP(LN(2)) ≈ 2
  const expLn2 = Parser.parse("EXP(LN(2))");
  expect(expLn2).toBeInstanceOf(RationalInterval);
  expect(expLn2.low.toNumber()).toBeCloseTo(2, 3);
  expect(expLn2.high.toNumber()).toBeCloseTo(2, 3);
  
  // Test SIN(PI/2) ≈ 1
  const sinPiOver2 = Parser.parse("SIN(PI/2)");
  expect(sinPiOver2).toBeInstanceOf(RationalInterval);
  expect(sinPiOver2.low.toNumber()).toBeCloseTo(1, 2);
  expect(sinPiOver2.high.toNumber()).toBeCloseTo(1, 2);
  
  // Test LOG(EXP(2)) ≈ 2/LN(10)
  const logExp2 = Parser.parse("LOG(EXP(2))");
  expect(logExp2).toBeInstanceOf(RationalInterval);
  expect(logExp2.low.toNumber()).toBeCloseTo(0.86859, 3);
  expect(logExp2.high.toNumber()).toBeCloseTo(0.86859, 3);
});

test("Error cases", () => {
  // Domain errors
  expect(() => Parser.parse("LN(-1)")).toThrow();
  expect(() => Parser.parse("ARCSIN(2)")).toThrow();
  expect(() => Parser.parse("ARCCOS(-2)")).toThrow();
  
  // Syntax errors
  expect(() => Parser.parse("SIN")).toThrow();
  expect(() => Parser.parse("LN")).toThrow();
  expect(() => Parser.parse("LOG")).toThrow();
});
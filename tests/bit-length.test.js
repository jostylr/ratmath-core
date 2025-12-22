/* Test Integer.bitLength() and Rational.bitLength() and RationalInterval.bitLength()  methods */
import { Integer } from "../src/integer.js";
import { Rational } from "../src/rational.js"
import { RationalInterval } from "../src/rational-interval.js" ;

describe("Integer.bitLength()", () => {
  test("bit length of positive integers", () => {
    expect(new Integer(0).bitLength()).toBe(0);
    expect(new Integer(1).bitLength()).toBe(1);
    expect(new Integer(2).bitLength()).toBe(2);
    expect(new Integer(3).bitLength()).toBe(2);
    expect(new Integer(4).bitLength()).toBe(3);
    expect(new Integer(15).bitLength()).toBe(4);
    expect(new Integer(16).bitLength()).toBe(5);
    expect(new Integer(255).bitLength()).toBe(8);
    expect(new Integer(256).bitLength()).toBe(9);
  } );
  test("bit length of negative integers", () => { 
    expect(new Integer(-1).bitLength()).toBe(1);    
    expect(new Integer(-2).bitLength()).toBe(2);    
    expect(new Integer(-3).bitLength()).toBe(2);    
    expect(new Integer(-4).bitLength()).toBe(3);    
    expect(new Integer(-15).bitLength()).toBe(4);    
    expect(new Integer(-16).bitLength()).toBe(5);    
    expect(new Integer(-255).bitLength()).toBe(8);    
    expect(new Integer(-256).bitLength()).toBe(9);    
  } );
} );

describe("Rational.bitLength()", () => {
  test("bit length of various rationals", () => {
    expect(new Rational(new Integer(1), new Integer(1)).bitLength()).toBe(1);
    expect(new Rational(new Integer(2), new Integer(1)).bitLength()).toBe(2);
    expect(new Rational(new Integer(1), new Integer(2)).bitLength()).toBe(2);
    expect(new Rational(new Integer(3), new Integer(4)).bitLength()).toBe(3);
    expect(new Rational(new Integer(15), new Integer(16)).bitLength()).toBe(5);
    expect(new Rational(new Integer(255), new Integer(256)).bitLength()).toBe(9);
    expect(new Rational(new Integer(-5), new Integer(8)).bitLength()).toBe(4);
  } );
} );

describe("RationalInterval.bitLength()", () => {
  test("bit length of various rational intervals", () => {
    expect(new RationalInterval(
      new Rational(new Integer(1), new Integer(2)),
      new Rational(new Integer(3), new Integer(4))
    ).bitLength()).toBe(3);

    expect(new RationalInterval(
      new Rational(new Integer(-5), new Integer(8)),
      new Rational(new Integer(7), new Integer(8))
    ).bitLength()).toBe(4);
  }
  );
} );


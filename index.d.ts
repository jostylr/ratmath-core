/**
 * Integer class for exact integer arithmetic using BigInt.
 * Represents integers with arbitrary precision.
 */
export class Integer {
    static zero: Integer;
    static one: Integer;

    constructor(value: number | string | bigint | Integer);

    get value(): bigint;

    add(other: Integer | Rational | RationalInterval): Integer | Rational | RationalInterval;
    subtract(other: Integer | Rational | RationalInterval): Integer | Rational | RationalInterval;
    multiply(other: Integer | Rational | RationalInterval): Integer | Rational | RationalInterval;
    divide(other: Integer | Rational | RationalInterval): Integer | Rational | RationalInterval;
    modulo(other: Integer): Integer;
    negate(): Integer;
    pow(exponent: number | bigint | Integer): Integer | Rational;
    equals(other: Integer): boolean;
    compareTo(other: Integer): number;
    lessThan(other: Integer): boolean;
    lessThanOrEqual(other: Integer): boolean;
    greaterThan(other: Integer): boolean;
    greaterThanOrEqual(other: Integer): boolean;
    abs(): Integer;
    sign(): Integer;
    isEven(): boolean;
    isOdd(): boolean;
    isZero(): boolean;
    isPositive(): boolean;
    isNegative(): boolean;
    gcd(other: Integer): Integer;
    lcm(other: Integer): Integer;
    toString(): string;
    toNumber(): number;
    toRational(): Rational;
    E(exponent: number | bigint): Integer | Rational;
    factorial(): Integer;
    doubleFactorial(): Integer;
    bitLength(): number;

    static from(value: number | string | bigint | Integer): Integer;
    static fromRational(rational: Rational): Integer;
}

/**
 * Rational class for exact rational number arithmetic using BigInt.
 * Represents a rational number as a fraction with numerator and denominator in lowest terms.
 */
export class Rational {
    static zero: Rational;
    static one: Rational;

    constructor(numerator: number | string | bigint | Integer, denominator?: number | bigint | Integer);

    get numerator(): bigint;
    get denominator(): bigint;

    add(other: Integer | Rational | RationalInterval): Rational | RationalInterval;
    subtract(other: Integer | Rational | RationalInterval): Rational | RationalInterval;
    multiply(other: Integer | Rational | RationalInterval): Rational | RationalInterval;
    divide(other: Integer | Rational | RationalInterval): Rational | RationalInterval;
    negate(): Rational;
    reciprocal(): Rational;
    pow(exponent: number | bigint): Rational;
    equals(other: Rational): boolean;
    compareTo(other: Rational): number;
    lessThan(other: Rational): boolean;
    lessThanOrEqual(other: Rational): boolean;
    greaterThan(other: Rational): boolean;
    greaterThanOrEqual(other: Rational): boolean;
    abs(): Rational;
    toString(): string;
    toMixedString(): string;
    toNumber(): number;
    toRepeatingDecimal(): string;
    toRepeatingDecimalWithPeriod(useRepeatNotation?: boolean): { decimal: string; period: number };
    bitLength(): number;
}

/**
 * RationalInterval class representing closed intervals of rational numbers.
 * Each interval is represented as [a, b] where a and b are Rational numbers.
 */
export class RationalInterval {
    static zero: RationalInterval;
    static one: RationalInterval;
    static unitInterval: RationalInterval;

    constructor(a: Rational | string | number | bigint, b: Rational | string | number | bigint);

    get low(): Rational;
    get high(): Rational;

    add(other: Integer | Rational | RationalInterval): RationalInterval;
    subtract(other: Integer | Rational | RationalInterval): RationalInterval;
    multiply(other: Integer | Rational | RationalInterval): RationalInterval;
    divide(other: Integer | Rational | RationalInterval): RationalInterval;
    reciprocate(): RationalInterval;
    negate(): RationalInterval;
    pow(exponent: number | bigint): RationalInterval;
    mpow(exponent: number | bigint | string): RationalInterval;
    overlaps(other: RationalInterval): boolean;
    contains(other: RationalInterval): boolean;
    containsValue(value: Rational | string | number | bigint): boolean;
    containsZero(): boolean;
    equals(other: RationalInterval): boolean;
    intersection(other: RationalInterval): RationalInterval | null;
    union(other: RationalInterval): RationalInterval | null;
    toString(): string;
    toMixedString(): string;
    toRepeatingDecimal(useRepeatNotation?: boolean): string;
    compactedDecimalInterval(): string;
    relativeMidDecimalInterval(): string;
    relativeDecimalInterval(): string;

    static point(value: Rational | string | number | bigint): RationalInterval;
    static fromString(str: string): RationalInterval;
}

/**
 * Fraction class representing fractions as pairs of BigInt numerator and denominator.
 * Unlike Rational, fractions are not automatically reduced.
 */
export class Fraction {
    constructor(numerator: number | string | bigint, denominator?: number | bigint, options?: { allowInfinite?: boolean });

    get numerator(): bigint;
    get denominator(): bigint;
    get isInfinite(): boolean;

    add(other: Fraction): Fraction;
    subtract(other: Fraction): Fraction;
    multiply(other: Fraction): Fraction;
    divide(other: Fraction): Fraction;
    pow(exponent: number | bigint): Fraction;
    scale(factor: number | bigint): Fraction;
    reduce(): Fraction;
    mediant(other: Fraction): Fraction;
    toRational(): Rational;
    toString(): string;
    equals(other: Fraction): boolean;
    lessThan(other: Fraction): boolean;
    lessThanOrEqual(other: Fraction): boolean;
    greaterThan(other: Fraction): boolean;
    greaterThanOrEqual(other: Fraction): boolean;
    E(exponent: number | bigint): Fraction;
    fareyParents(): { left: Fraction; right: Fraction };
    sternBrocotParent(): Fraction | null;
    sternBrocotChildren(): { left: Fraction; right: Fraction };
    sternBrocotPath(): string[];

    static mediant(a: Fraction, b: Fraction): Fraction;
    static fromRational(rational: Rational): Fraction;
    static mediantPartner(endpoint: Fraction, mediant: Fraction): Fraction;
    static isMediantTriple(left: Fraction, mediant: Fraction, right: Fraction): boolean;
    static isFareyTriple(left: Fraction, mediant: Fraction, right: Fraction): boolean;
}

/**
 * FractionInterval class representing closed intervals of fractions.
 * Preserves the exact representation of fractions without automatic reduction.
 */
export class FractionInterval {
    constructor(a: Fraction, b: Fraction);

    get low(): Fraction;
    get high(): Fraction;

    mediantSplit(): FractionInterval[];
    partitionWithMediants(n?: number): FractionInterval[];
    partitionWith(fn: (a: Fraction, b: Fraction) => Fraction[]): FractionInterval[];
    toRationalInterval(): RationalInterval;
    toString(): string;
    equals(other: FractionInterval): boolean;
    E(exponent: number | bigint): FractionInterval;

    static fromRationalInterval(interval: RationalInterval): FractionInterval;
}

/**
 * Parser class for parsing rational interval arithmetic expressions.
 */
export class Parser {
    static parse(expression: string, options?: { typeAware?: boolean }): Integer | Rational | RationalInterval;
    static parseContinuedFraction(cfString: string): bigint[];
}

/**
 * Utility class for handling type promotions.
 */
export class TypePromotion {
    static getTypeLevel(value: any): number;
    static integerToRational(integer: Integer): Rational;
    static rationalToInterval(rational: Rational): RationalInterval;
    static integerToInterval(integer: Integer): RationalInterval;
    static promoteToLevel(value: any, targetLevel: number): any;
    static promoteToCommonType(a: any, b: any): any[];
    static add(a: any, b: any): any;
    static subtract(a: any, b: any): any;
    static multiply(a: any, b: any): any;
    static divide(a: any, b: any): any;
    static eNotation(base: any, exponent: any): any;
    static power(base: any, exponent: any): any;
    static multiplyPower(base: any, exponent: any): any;
    static negate(value: any): any;
    static determineTypeFromString(str: string): string;
}

/**
 * Parses a repeating decimal string and returns the exact rational equivalent.
 */
export function parseRepeatingDecimal(str: string): Rational | RationalInterval;

/**
 * Template string tag for parsing rational arithmetic expressions.
 */
export function R(strings: TemplateStringsArray, ...values: any[]): Integer | Rational | RationalInterval;

/**
 * Template string tag for parsing into Fraction and FractionInterval types.
 */
export function F(strings: TemplateStringsArray, ...values: any[]): Fraction | FractionInterval;

declare const _default: {
    Integer: typeof Integer;
    Rational: typeof Rational;
    RationalInterval: typeof RationalInterval;
    Fraction: typeof Fraction;
    FractionInterval: typeof FractionInterval;
    Parser: typeof Parser;
    TypePromotion: typeof TypePromotion;
    parseRepeatingDecimal: typeof parseRepeatingDecimal;
    R: typeof R;
    F: typeof F;
};

export default _default;

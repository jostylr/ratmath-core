export type IntegerInput = number | string | bigint | Integer;
export type RationalInput = IntegerInput | Rational;
export type CoreScalar = Integer | Rational;
export type CoreNumber = CoreScalar | RationalInterval;
export type SternBrocotDirection = "L" | "R";

export interface DecimalMetadata {
  wholePart?: bigint;
  initialSegment: string;
  initialSegmentLeadingZeros?: number;
  initialSegmentRest?: string;
  periodDigits: string;
  periodLength: number;
  leadingZerosInPeriod?: number;
  periodDigitsRest?: string;
  isTerminating: boolean;
}

export interface RepeatingExpansion {
  decimal: string;
  period: number;
}

export interface BaseExpansion {
  baseStr: string;
  period: number;
  limitHit: boolean;
}

export class Integer {
  static zero: Integer;
  static one: Integer;

  constructor(value: IntegerInput);
  readonly value: bigint;

  add(other: CoreNumber): CoreNumber;
  subtract(other: CoreNumber): CoreNumber;
  multiply(other: CoreNumber): CoreNumber;
  divide(other: CoreNumber): CoreNumber;
  modulo(other: Integer): Integer;
  negate(): Integer;
  pow(exponent: number | bigint | Integer): Integer | Rational;
  equals(other: Integer): boolean;
  compareTo(other: Integer): -1 | 0 | 1;
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
  toString(base?: number | BaseSystem): string;
  toBase(baseSystem: BaseSystem): string;
  toNumber(): number;
  toRational(): Rational;
  E(exponent: number | bigint): Integer | Rational;
  factorial(): Integer;
  doubleFactorial(): Integer;
  bitLength(): number;

  static from(value: IntegerInput): Integer;
  static fromRational(rational: Rational): Integer;
}

export class Rational {
  static zero: Rational;
  static one: Rational;
  static DEFAULT_PERIOD_DIGITS: number;
  static MAX_PERIOD_DIGITS: number;
  static MAX_PERIOD_CHECK: number;
  static DEFAULT_CF_LIMIT: number;

  constructor(
    numerator: number | string | bigint | Integer | Rational,
    denominator?: number | string | bigint | Integer,
  );

  readonly numerator: bigint;
  readonly denominator: bigint;

  add(other: CoreNumber): Rational | RationalInterval;
  subtract(other: CoreNumber): Rational | RationalInterval;
  multiply(other: CoreNumber): Rational | RationalInterval;
  divide(other: CoreNumber): Rational | RationalInterval;
  negate(): Rational;
  reciprocal(): Rational;
  pow(exponent: number | bigint): Rational;
  equals(other: Rational): boolean;
  compareTo(other: Rational): -1 | 0 | 1;
  lessThan(other: Rational): boolean;
  lessThanOrEqual(other: Rational): boolean;
  greaterThan(other: Rational): boolean;
  greaterThanOrEqual(other: Rational): boolean;
  abs(): Rational;
  toString(base?: number | BaseSystem): string;
  toRepeatingBase(baseSystem: BaseSystem): string;
  toRepeatingBaseWithPeriod(
    baseSystem: BaseSystem,
    options?: { useRepeatNotation?: boolean; limit?: number },
  ): BaseExpansion;
  periodModulo(baseSystem: BaseSystem, limit?: number): number;
  toBase(baseSystem: BaseSystem): string;
  toMixedString(): string;
  toNumber(): number;
  toRepeatingDecimal(): string;
  toRepeatingDecimalWithPeriod(
    useRepeatNotation?: boolean,
  ): RepeatingExpansion;
  computeDecimalMetadata(maxPeriodDigits?: number): DecimalMetadata;
  extractPeriodSegment(
    initialSegment: string,
    periodLength: number,
    digitsRequested: number,
  ): string;
  toDecimal(): string;
  E(exponent: number | bigint): Rational;
  toScientificNotation(
    useRepeatNotation?: boolean,
    precision?: number,
    showPeriodInfo?: boolean,
  ): string;
  toContinuedFraction(maxTerms?: number): bigint[];
  toContinuedFractionString(): string;
  convergents(maxCount?: number): Rational[];
  getConvergent(index: number): Rational;
  approximationError(target: Rational): Rational;
  bestApproximation(maxDenominator: bigint): Rational;
  bestConvergent(maxDenominator: bigint): Rational;
  bitLength(): number;

  static from(value: number | string | bigint | Rational): Rational;
  static fromContinuedFraction(
    coefficients: ReadonlyArray<number | bigint>,
  ): Rational;
  static fromContinuedFractionString(value: string): Rational;
  static convergentsFromCF(
    input: ReadonlyArray<bigint> | string,
    maxCount?: number,
  ): Rational[];
}

export class RationalInterval {
  static zero: RationalInterval;
  static one: RationalInterval;
  static unitInterval: RationalInterval;

  constructor(a: RationalInput, b: RationalInput);

  readonly start: Rational;
  readonly end: Rational;
  readonly isAscending: boolean;
  readonly low: Rational;
  readonly high: Rational;

  add(other: CoreNumber): RationalInterval;
  subtract(other: CoreNumber): RationalInterval;
  multiply(other: CoreNumber): RationalInterval;
  divide(other: CoreNumber): RationalInterval;
  reciprocate(): RationalInterval;
  negate(): RationalInterval;
  pow(exponent: number | bigint): RationalInterval;
  mpow(exponent: number | bigint | string): RationalInterval;
  overlaps(other: RationalInterval): boolean;
  contains(other: RationalInterval): boolean;
  containsValue(value: RationalInput): boolean;
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
  mediant(): Rational;
  midpoint(): Rational;
  shortestDecimal(base?: number | bigint): Rational | null;
  randomRational(maxDenominator?: number): Rational;
  E(exponent: number | bigint): RationalInterval;
  bitLength(): number;

  static point(value: RationalInput): RationalInterval;
  static fromString(value: string): RationalInterval;
}

export class Fraction {
  constructor(
    numerator: number | string | bigint,
    denominator?: number | string | bigint,
    options?: { allowInfinite?: boolean },
  );

  readonly numerator: bigint;
  readonly denominator: bigint;
  readonly isInfinite: boolean;

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
  sternBrocotPath(): SternBrocotDirection[];
  isSternBrocotValid(): boolean;
  sternBrocotDepth(): number;
  sternBrocotAncestors(): Fraction[];

  static mediant(a: Fraction, b: Fraction): Fraction;
  static fromRational(rational: Rational): Fraction;
  static mediantPartner(endpoint: Fraction, mediant: Fraction): Fraction;
  static isMediantTriple(
    left: Fraction,
    mediant: Fraction,
    right: Fraction,
  ): boolean;
  static isFareyTriple(
    left: Fraction,
    mediant: Fraction,
    right: Fraction,
  ): boolean;
  static fromSternBrocotPath(
    path: ReadonlyArray<SternBrocotDirection>,
  ): Fraction;
}

export class FractionInterval {
  constructor(a: Fraction, b: Fraction);
  readonly low: Fraction;
  readonly high: Fraction;

  mediantSplit(): FractionInterval[];
  partitionWithMediants(depth?: number): FractionInterval[];
  partitionWith(
    fn: (low: Fraction, high: Fraction) => Fraction[],
  ): FractionInterval[];
  toRationalInterval(): RationalInterval;
  toString(): string;
  equals(other: FractionInterval): boolean;
  E(exponent: number | bigint): FractionInterval;

  static fromRationalInterval(interval: RationalInterval): FractionInterval;
}

export class BaseSystem {
  static RESERVED_SYMBOLS: Set<string>;
  static BINARY: BaseSystem;
  static TERNARY: BaseSystem;
  static QUATERNARY: BaseSystem;
  static QUINARY: BaseSystem;
  static SEPTENARY: BaseSystem;
  static OCTAL: BaseSystem;
  static DECIMAL: BaseSystem;
  static DUODECIMAL: BaseSystem;
  static HEXADECIMAL: BaseSystem;
  static VIGESIMAL: BaseSystem;
  static BASE36: BaseSystem;
  static BASE60: BaseSystem;
  static BASE62: BaseSystem;
  static BASE64: BaseSystem;
  static ROMAN: BaseSystem;

  constructor(characters: string | string[], name?: string);
  readonly base: number;
  readonly characters: string[];
  readonly charMap: Map<string, number>;
  readonly name: string;

  getChar(value: number | bigint): string;
  toDecimal(value: string): bigint;
  fromDecimal(value: bigint): string;
  isValidString(value: string): boolean;
  getMaxDigit(): string;
  getMinDigit(): string;
  toString(): string;
  equals(other: BaseSystem): boolean;
  withCaseSensitivity(caseSensitive: boolean): BaseSystem;

  static fromBase(base: number, name?: string): BaseSystem;
  static createPattern(
    pattern:
      | "alphanumeric"
      | "digits-only"
      | "letters-only"
      | "uppercase-only"
      | string,
    size: number,
    name?: string,
  ): BaseSystem;
  static registerPrefix(prefix: string, baseSystem: BaseSystem): void;
  static unregisterPrefix(prefix: string): void;
  static hasExactPrefix(prefix: string): boolean;
  static getSystemForPrefix(prefix: string): BaseSystem | null | undefined;
  static getPrefixForSystem(baseSystem: BaseSystem): string | undefined;
}

export class TypePromotion {
  static getTypeLevel(value: CoreNumber): 0 | 1 | 2;
  static integerToRational(integer: Integer): Rational;
  static rationalToInterval(rational: Rational): RationalInterval;
  static integerToInterval(integer: Integer): RationalInterval;
  static promoteToLevel(value: CoreNumber, targetLevel: number): CoreNumber;
  static promoteToCommonType(
    a: CoreNumber,
    b: CoreNumber,
  ): [CoreNumber, CoreNumber];
  static add(a: CoreNumber, b: CoreNumber): CoreNumber;
  static subtract(a: CoreNumber, b: CoreNumber): CoreNumber;
  static multiply(a: CoreNumber, b: CoreNumber): CoreNumber;
  static divide(a: CoreNumber, b: CoreNumber): CoreNumber;
  static eNotation(
    base: CoreNumber,
    exponent: number | bigint,
  ): CoreNumber;
  static power(base: CoreNumber, exponent: number | bigint): CoreNumber;
  static multiplyPower(
    base: CoreNumber,
    exponent: number | bigint,
  ): CoreNumber;
  static negate(value: CoreNumber): CoreNumber;
  static determineTypeFromString(
    value: string,
  ): "integer" | "rational" | "interval";
}

/** Parse a number-only RiX-compatible exact literal. */
export function parseNumber(value: string): CoreNumber;

/** Parse a scalar exact literal and always return Rational. */
export function parseRational(value: string): Rational;

/** Parse a finite or repeating base-10 decimal exactly. */
export function parseDecimal(value: string): Rational;

/** Parse a finite or repeating base-10 decimal exactly. */
export function parseRepeatingDecimal(value: string): Rational;

/** Parse RiX mixed-fraction notation such as "-2..1/4". */
export function parseMixedNumber(value: string): Rational;

/** Parse continued-fraction coefficients or RiX ".~" notation. */
export function parseContinuedFraction(
  value: string | ReadonlyArray<number | bigint>,
): Rational;

/** Parse an interval, promoting scalar input to a point interval. */
export function parseInterval(value: string): RationalInterval;

declare const core: {
  Integer: typeof Integer;
  Rational: typeof Rational;
  RationalInterval: typeof RationalInterval;
  Fraction: typeof Fraction;
  FractionInterval: typeof FractionInterval;
  TypePromotion: typeof TypePromotion;
  BaseSystem: typeof BaseSystem;
  parseNumber: typeof parseNumber;
  parseRational: typeof parseRational;
  parseDecimal: typeof parseDecimal;
  parseRepeatingDecimal: typeof parseRepeatingDecimal;
  parseMixedNumber: typeof parseMixedNumber;
  parseContinuedFraction: typeof parseContinuedFraction;
  parseInterval: typeof parseInterval;
};

export default core;

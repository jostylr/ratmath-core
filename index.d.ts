export type IntegerInput = number | string | bigint | Integer;
export type RationalInput = IntegerInput | Rational;
export type CoreScalar = Integer | Rational;
export type CoreNumber = CoreScalar | RationalInterval | CertifiedApproximation;
export type RelationMask = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ApproximationReason =
  | "literal"
  | "truncated"
  | "rounded"
  | "derived"
  | "serialized"
  | "budgetExhausted";
export type SternBrocotDirection = "L" | "R";
export type LimitBehavior = "trunc" | "null" | "error";
export type EmptyGridBehavior = "mid" | "null" | "error";
export type RoundingMode =
  | "half-even"
  | "half-up"
  | "toward-zero"
  | "floor"
  | "ceil";

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
  decimal: string | null;
  period: number;
  truncated: boolean;
}

export interface BaseExpansion {
  baseStr: string;
  period: number;
  limitHit: boolean;
}

export interface BaseExpansionOptions {
  useRepeatNotation?: boolean;
  limit?: number;
}

export interface ContinuedFractionOptions {
  maxTerms?: number;
  long?: boolean;
}

export interface ApproximationPresentationHint {
  base: number;
  characters: string;
  certifiedFractionalDigits: number;
  provisionalDigits: number;
}

export interface ApproximationRepresentation {
  kind: "radix" | "continuedFraction" | "derived";
  reason?: ApproximationReason;
  original?: string | null;
  base?: number;
  characters?: string;
  certifiedPrefix?: string | ReadonlyArray<string>;
  provisionalSuffix?: string | ReadonlyArray<string>;
  requested?: Readonly<Record<string, unknown>>;
  achieved?: Readonly<Record<string, unknown>>;
  roundingMode?: RoundingMode;
  presentationHint?: Readonly<ApproximationPresentationHint>;
}

export interface CertifiedApproximationOptions {
  representation?: ApproximationRepresentation | null;
  sourceId?: string | number | symbol;
  dependencies?: ReadonlyArray<string | number | symbol>;
  preserveWrapper?: boolean;
}

export const Relation: Readonly<{
  LESS: 1;
  EQUAL: 2;
  GREATER: 4;
}>;

export class CertifiedApproximation {
  constructor(
    candidate: CoreScalar,
    enclosure: RationalInterval,
    options?: CertifiedApproximationOptions,
  );
  readonly candidate: CoreScalar;
  readonly enclosure: RationalInterval;
  readonly representation: Readonly<ApproximationRepresentation> | null;
  readonly sourceId: string | number | symbol;
  readonly dependencies: ReadonlyArray<string | number | symbol>;
  readonly low: Rational;
  readonly high: Rational;
  readonly isCertifiedApproximation: true;
  sameSource(other: unknown): boolean;
  copy(): CertifiedApproximation;
  add(other: CoreNumber): CoreNumber;
  subtract(other: CoreNumber): CoreNumber;
  multiply(other: CoreNumber): CoreNumber;
  divide(other: CoreNumber): CoreNumber;
  negate(): CoreNumber;
  reciprocal(): CoreNumber;
  pow(exponent: number | bigint): CoreNumber;
  E(exponent: number | bigint): CoreNumber;
  possibleRelationsTo(other: CoreNumber): RelationMask;
  toRationalInterval(): RationalInterval;
  toRational(): Rational;
  toString(): string;
  toJSON(): {
    $ratmath: "CertifiedApproximation";
    candidate: CoreScalar;
    enclosure: RationalInterval;
    representation: Readonly<ApproximationRepresentation> | null;
    sourceId: string | number | null;
    dependencies: ReadonlyArray<string | number>;
  };
}

export function normalizeCertifiedApproximation(
  candidate: CoreScalar,
  enclosure: RationalInterval,
  options?: CertifiedApproximationOptions,
): CoreScalar | CertifiedApproximation;

export function certifiedRadixPrefix(options: {
  integerDigits: string;
  fractionalDigits?: string;
  provisionalDigits?: string;
  negative?: boolean;
  baseSystem?: BaseSystem;
  enclosure?: RationalInterval | null;
  original?: string | null;
  reason?: ApproximationReason;
  requested?: Readonly<Record<string, unknown>> | null;
  achieved?: Readonly<Record<string, unknown>> | null;
  roundingMode?: RoundingMode | null;
  sourceId?: string | number | symbol;
}): CertifiedApproximation;

export function certifiedContinuedFractionPrefix(options: {
  coefficients: ReadonlyArray<number | bigint>;
  provisionalCoefficients?: ReadonlyArray<number | bigint>;
  original?: string | null;
  reason?: ApproximationReason;
  requested?: Readonly<Record<string, unknown>> | null;
  achieved?: Readonly<Record<string, unknown>> | null;
  sourceId?: string | number | symbol;
}): CertifiedApproximation;

export function boundedDecimalApproximation(
  value: CoreScalar,
  options?: { fractionalDigits?: number; reason?: ApproximationReason },
): CoreScalar | CertifiedApproximation;

export function boundedContinuedFractionApproximation(
  value: CoreScalar,
  options?: { maxTerms?: number; reason?: ApproximationReason },
): CoreScalar | CertifiedApproximation;

export function possibleRelations(
  left: CoreNumber,
  right: CoreNumber,
): RelationMask;

export interface ConvergentOptions {
  maxCount?: number;
  long?: boolean;
  intermediates?: boolean;
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
  possibleRelationsTo(other: CoreNumber): RelationMask;
  factorial(): Integer;
  doubleFactorial(): Integer;
  bitLength(): number;
  toJSON(): { $ratmath: "Integer"; value: string };

  static from(value: IntegerInput): Integer;
  static fromRational(rational: Rational): Integer;
}

export class Rational {
  static zero: Rational;
  static one: Rational;
  static MAX_PERIOD_DIGITS: number;
  static MAX_PERIOD_CHECK: number;
  static DEFAULT_DECIMAL_DIGITS: number;
  static DEFAULT_SCIENTIFIC_PRECISION: number;
  static DEFAULT_BASE_LIMIT: number;
  static DEFAULT_PERIOD_MODULO_LIMIT: number;
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
  floor(): bigint;
  ceil(): bigint;
  trunc(): bigint;
  round(mode?: RoundingMode): bigint;
  roundTo(places: number, mode?: RoundingMode): Rational;
  toString(base?: number | BaseSystem, options?: BaseExpansionOptions): string;
  toRepeatingBase(
    baseSystem: BaseSystem,
    options?: BaseExpansionOptions,
  ): string;
  toRepeatingBaseWithPeriod(
    baseSystem: BaseSystem,
    options?: BaseExpansionOptions,
  ): BaseExpansion;
  periodModulo(baseSystem: BaseSystem, limit?: number): number;
  toBase(baseSystem: BaseSystem): string;
  toMixedString(): string;
  toNumber(): number;
  toRepeatingDecimal(limit?: number, onLimit?: LimitBehavior): string | null;
  toRepeatingDecimalWithPeriod(
    options?: boolean | {
      useRepeatNotation?: boolean;
      limit?: number;
      onLimit?: LimitBehavior;
    },
    legacyLimit?: number,
    legacyOnLimit?: LimitBehavior,
  ): RepeatingExpansion;
  computeDecimalMetadata(maxPeriodDigits?: number): DecimalMetadata;
  extractPeriodSegment(
    initialSegment: string,
    periodLength: number,
    digitsRequested: number,
  ): string;
  toDecimal(maxDigits?: number): string;
  E(exponent: number | bigint): Rational;
  possibleRelationsTo(other: CoreNumber): RelationMask;
  toScientificNotation(
    useRepeatNotation?: boolean,
    precision?: number,
    showPeriodInfo?: boolean,
  ): string;
  toContinuedFraction(options?: number | ContinuedFractionOptions): bigint[];
  toContinuedFractionString(
    options?: number | ContinuedFractionOptions,
  ): string;
  convergents(options?: number | ConvergentOptions): Rational[];
  getConvergent(index: number): Rational;
  approximationError(target: Rational): Rational;
  bestApproximation(maxDenominator: bigint): Rational;
  bestConvergent(maxDenominator: bigint): Rational;
  bitLength(): number;
  toJSON(): {
    $ratmath: "Rational";
    numerator: string;
    denominator: string;
  };

  static from(value: number | string | bigint | Integer | Rational): Rational;
  static fromContinuedFraction(
    coefficients: ReadonlyArray<number | bigint>,
  ): Rational;
  static fromContinuedFractionString(value: string): Rational;
  static convergentsFromCF(
    input: ReadonlyArray<number | bigint> | string,
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
  toRepeatingDecimal(options?: boolean | {
    useRepeatNotation?: boolean;
    limit?: number;
    onLimit?: LimitBehavior;
  }): string | null;
  compactedDecimalInterval(): string;
  relativeMidDecimalInterval(): string;
  relativeDecimalInterval(): string;
  mediant(): Rational;
  midpoint(): Rational;
  shortestDecimal(base?: number | bigint): Rational | null;
  denominatorInterval(
    denominator?: number | bigint,
    onEmpty?: EmptyGridBehavior,
  ): RationalInterval | null;
  randomRational(
    denominator?: number | bigint,
    onEmpty?: EmptyGridBehavior,
    random?: () => number,
  ): Rational | null;
  E(exponent: number | bigint): RationalInterval;
  possibleRelationsTo(other: CoreNumber): RelationMask;
  bitLength(): number;
  toJSON(): {
    $ratmath: "RationalInterval";
    start: Rational;
    end: Rational;
  };

  static point(value: RationalInput): RationalInterval;
  static fromString(value: string): RationalInterval;
}

export class Fraction {
  static DEFAULT_STERN_BROCOT_PATH_LIMIT: number;

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
  toJSON(): {
    $ratmath: "Fraction";
    numerator: string;
    denominator: string;
  };
  fareyParents(): { left: Fraction; right: Fraction };
  sternBrocotParent(): Fraction | null;
  sternBrocotChildren(): { left: Fraction; right: Fraction };
  sternBrocotPath(maxLength?: number): SternBrocotDirection[];
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
  toJSON(): {
    $ratmath: "FractionInterval";
    low: Fraction;
    high: Fraction;
  };

  static fromRationalInterval(interval: RationalInterval): FractionInterval;
}

export interface BaseSystemOptions {
  radix?: number;
  digitOffset?: number;
  allowReserved?: boolean;
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

  constructor(
    characters: string | string[],
    name?: string,
    options?: BaseSystemOptions,
  );
  readonly base: number;
  readonly radix: number;
  readonly digitOffset: number;
  readonly supportsPositionalFractions: boolean;
  readonly requiresQuoting: boolean;
  readonly allowsReservedDigits: boolean;
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
  toJSON(): {
    $ratmath: "BaseSystem";
    characters: string[];
    name: string;
    radix: number;
    digitOffset: number;
    allowReserved: boolean;
  };

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
  private constructor();
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
  ): "integer" | "rational" | "interval" | "approximation";
}

/** Parse a number-only RiX-compatible literal. */
export function parseNumber(value: string): CoreNumber;

/** Parse a certified decimal or continued-fraction approximation. */
export function parseCertifiedApproximation(
  value: string,
): CertifiedApproximation;

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
): Rational | CertifiedApproximation;

/** Parse an interval, promoting scalar input to a point interval. */
export function parseInterval(value: string): RationalInterval;

export function isInteger(value: unknown): value is Integer;
export function isRational(value: unknown): value is Rational;
export function isRationalInterval(value: unknown): value is RationalInterval;
export function isCertifiedApproximation(
  value: unknown,
): value is CertifiedApproximation;
export function isFraction(value: unknown): value is Fraction;
export function isFractionInterval(value: unknown): value is FractionInterval;
export function isBaseSystem(value: unknown): value is BaseSystem;
export function isCoreNumber(value: unknown): value is CoreNumber;
export function reviveCoreValue(key: string, value: unknown): unknown;

declare const core: {
  Integer: typeof Integer;
  Rational: typeof Rational;
  RationalInterval: typeof RationalInterval;
  Fraction: typeof Fraction;
  FractionInterval: typeof FractionInterval;
  TypePromotion: typeof TypePromotion;
  BaseSystem: typeof BaseSystem;
  CertifiedApproximation: typeof CertifiedApproximation;
  Relation: typeof Relation;
  boundedDecimalApproximation: typeof boundedDecimalApproximation;
  boundedContinuedFractionApproximation: typeof boundedContinuedFractionApproximation;
  certifiedRadixPrefix: typeof certifiedRadixPrefix;
  certifiedContinuedFractionPrefix: typeof certifiedContinuedFractionPrefix;
  normalizeCertifiedApproximation: typeof normalizeCertifiedApproximation;
  possibleRelations: typeof possibleRelations;
  parseNumber: typeof parseNumber;
  parseCertifiedApproximation: typeof parseCertifiedApproximation;
  parseRational: typeof parseRational;
  parseDecimal: typeof parseDecimal;
  parseRepeatingDecimal: typeof parseRepeatingDecimal;
  parseMixedNumber: typeof parseMixedNumber;
  parseContinuedFraction: typeof parseContinuedFraction;
  parseInterval: typeof parseInterval;
  isInteger: typeof isInteger;
  isRational: typeof isRational;
  isRationalInterval: typeof isRationalInterval;
  isCertifiedApproximation: typeof isCertifiedApproximation;
  isFraction: typeof isFraction;
  isFractionInterval: typeof isFractionInterval;
  isBaseSystem: typeof isBaseSystem;
  isCoreNumber: typeof isCoreNumber;
  reviveCoreValue: typeof reviveCoreValue;
};

export default core;

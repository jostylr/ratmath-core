// src/rational.js
class Rational {
  #numerator;
  #denominator;
  static zero = new Rational(0, 1);
  static one = new Rational(1, 1);
  constructor(numerator, denominator = 1n) {
    if (
      numerator &&
      typeof numerator === "object" &&
      numerator.constructor.name === "Integer"
    ) {
      this.#numerator = numerator.value;
      this.#denominator = 1n;
      return;
    }
    if (typeof numerator === "string") {
      if (numerator.includes("..")) {
        const mixedParts = numerator.trim().split("..");
        if (mixedParts.length !== 2) {
          throw new Error("Invalid mixed number format. Use 'a..b/c'");
        }
        const wholePart = BigInt(mixedParts[0]);
        const fractionParts = mixedParts[1].split("/");
        if (fractionParts.length !== 2) {
          throw new Error("Invalid fraction in mixed number. Use 'a..b/c'");
        }
        const fracNumerator = BigInt(fractionParts[0]);
        const fracDenominator = BigInt(fractionParts[1]);
        const isNegative = wholePart < 0n;
        const absWhole = isNegative ? -wholePart : wholePart;
        this.#numerator = isNegative
          ? -(absWhole * fracDenominator + fracNumerator)
          : wholePart * fracDenominator + fracNumerator;
        this.#denominator = fracDenominator;
      } else {
        if (numerator.includes(".")) {
          const decimalParts = numerator.trim().split(".");
          if (decimalParts.length === 2) {
            const integerPart = decimalParts[0] || "0";
            const fractionalPart = decimalParts[1];
            if (!/^-?\d*$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
              throw new Error("Invalid decimal format");
            }
            const wholePart = BigInt(integerPart);
            const fractionalValue = BigInt(fractionalPart);
            const denomValue = 10n ** BigInt(fractionalPart.length);
            this.#numerator =
              wholePart * denomValue +
              (wholePart < 0n ? -fractionalValue : fractionalValue);
            this.#denominator = denomValue;
          } else {
            throw new Error("Invalid decimal format - multiple decimal points");
          }
        } else {
          const parts = numerator.trim().split("/");
          if (parts.length === 1) {
            this.#numerator = BigInt(parts[0]);
            this.#denominator = BigInt(denominator);
          } else if (parts.length === 2) {
            this.#numerator = BigInt(parts[0]);
            this.#denominator = BigInt(parts[1]);
          } else {
            throw new Error(
              "Invalid rational format. Use 'a/b', 'a', or 'a..b/c'",
            );
          }
        }
      }
    } else {
      this.#numerator = BigInt(numerator);
      this.#denominator = BigInt(denominator);
    }
    if (this.#denominator === 0n) {
      throw new Error("Denominator cannot be zero");
    }
    this.#normalize();
  }
  #normalize() {
    if (this.#denominator < 0n) {
      this.#numerator = -this.#numerator;
      this.#denominator = -this.#denominator;
    }
    if (this.#numerator === 0n) {
      this.#denominator = 1n;
      return;
    }
    const gcd = this.#gcd(
      this.#numerator < 0n ? -this.#numerator : this.#numerator,
      this.#denominator,
    );
    this.#numerator = this.#numerator / gcd;
    this.#denominator = this.#denominator / gcd;
  }
  #gcd(a, b) {
    while (b !== 0n) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }
  get numerator() {
    return this.#numerator;
  }
  get denominator() {
    return this.#denominator;
  }
  add(other) {
    if (other.constructor.name === "Integer") {
      const otherAsRational = new Rational(other.value, 1n);
      return this.add(otherAsRational);
    } else if (other instanceof Rational) {
      const a = this.#numerator;
      const b = this.#denominator;
      const c = other.numerator;
      const d = other.denominator;
      const numerator = a * d + b * c;
      const denominator = b * d;
      return new Rational(numerator, denominator);
    } else if (
      other.low &&
      other.high &&
      typeof other.low.equals === "function"
    ) {
      const thisAsInterval = { low: this, high: this };
      const IntervalClass = other.constructor;
      const newThisAsInterval = new IntervalClass(this, this);
      return newThisAsInterval.add(other);
    } else {
      throw new Error(`Cannot add ${other.constructor.name} to Rational`);
    }
  }
  subtract(other) {
    if (other.constructor.name === "Integer") {
      const otherAsRational = new Rational(other.value, 1n);
      return this.subtract(otherAsRational);
    } else if (other instanceof Rational) {
      const a = this.#numerator;
      const b = this.#denominator;
      const c = other.numerator;
      const d = other.denominator;
      const numerator = a * d - b * c;
      const denominator = b * d;
      return new Rational(numerator, denominator);
    } else if (
      other.low &&
      other.high &&
      typeof other.low.equals === "function"
    ) {
      const IntervalClass = other.constructor;
      const newThisAsInterval = new IntervalClass(this, this);
      return newThisAsInterval.subtract(other);
    } else {
      throw new Error(
        `Cannot subtract ${other.constructor.name} from Rational`,
      );
    }
  }
  multiply(other) {
    if (other.constructor.name === "Integer") {
      const otherAsRational = new Rational(other.value, 1n);
      return this.multiply(otherAsRational);
    } else if (other instanceof Rational) {
      const a = this.#numerator;
      const b = this.#denominator;
      const c = other.numerator;
      const d = other.denominator;
      const numerator = a * c;
      const denominator = b * d;
      return new Rational(numerator, denominator);
    } else if (
      other.low &&
      other.high &&
      typeof other.low.equals === "function"
    ) {
      const IntervalClass = other.constructor;
      const newThisAsInterval = new IntervalClass(this, this);
      return newThisAsInterval.multiply(other);
    } else {
      throw new Error(`Cannot multiply Rational by ${other.constructor.name}`);
    }
  }
  divide(other) {
    if (other.constructor.name === "Integer") {
      if (other.value === 0n) {
        throw new Error("Division by zero");
      }
      const otherAsRational = new Rational(other.value, 1n);
      return this.divide(otherAsRational);
    } else if (other instanceof Rational) {
      if (other.numerator === 0n) {
        throw new Error("Division by zero");
      }
      const a = this.#numerator;
      const b = this.#denominator;
      const c = other.numerator;
      const d = other.denominator;
      const numerator = a * d;
      const denominator = b * c;
      return new Rational(numerator, denominator);
    } else if (
      other.low &&
      other.high &&
      typeof other.low.equals === "function"
    ) {
      const IntervalClass = other.constructor;
      const newThisAsInterval = new IntervalClass(this, this);
      return newThisAsInterval.divide(other);
    } else {
      throw new Error(`Cannot divide Rational by ${other.constructor.name}`);
    }
  }
  negate() {
    return new Rational(-this.#numerator, this.#denominator);
  }
  reciprocal() {
    if (this.#numerator === 0n) {
      throw new Error("Cannot take reciprocal of zero");
    }
    return new Rational(this.#denominator, this.#numerator);
  }
  pow(exponent) {
    const n = BigInt(exponent);
    if (n === 0n) {
      if (this.#numerator === 0n) {
        throw new Error("Zero cannot be raised to the power of zero");
      }
      return new Rational(1);
    }
    if (this.#numerator === 0n && n < 0n) {
      throw new Error("Zero cannot be raised to a negative power");
    }
    if (n < 0n) {
      const reciprocal = this.reciprocal();
      return reciprocal.pow(-n);
    }
    let resultNum = 1n;
    let resultDen = 1n;
    let num = this.#numerator;
    let den = this.#denominator;
    for (let i = n < 0n ? -n : n; i > 0n; i >>= 1n) {
      if (i & 1n) {
        resultNum *= num;
        resultDen *= den;
      }
      num *= num;
      den *= den;
    }
    return new Rational(resultNum, resultDen);
  }
  equals(other) {
    return (
      this.#numerator === other.numerator &&
      this.#denominator === other.denominator
    );
  }
  compareTo(other) {
    const crossProduct1 = this.#numerator * other.denominator;
    const crossProduct2 = this.#denominator * other.numerator;
    if (crossProduct1 < crossProduct2) return -1;
    if (crossProduct1 > crossProduct2) return 1;
    return 0;
  }
  lessThan(other) {
    return this.compareTo(other) < 0;
  }
  lessThanOrEqual(other) {
    return this.compareTo(other) <= 0;
  }
  greaterThan(other) {
    return this.compareTo(other) > 0;
  }
  greaterThanOrEqual(other) {
    return this.compareTo(other) >= 0;
  }
  abs() {
    return this.#numerator < 0n
      ? this.negate()
      : new Rational(this.#numerator, this.#denominator);
  }
  toString() {
    if (this.#denominator === 1n) {
      return this.#numerator.toString();
    }
    return `${this.#numerator}/${this.#denominator}`;
  }
  toMixedString() {
    if (this.#denominator === 1n || this.#numerator === 0n) {
      return this.#numerator.toString();
    }
    const isNegative = this.#numerator < 0n;
    const absNum = isNegative ? -this.#numerator : this.#numerator;
    const wholePart = absNum / this.#denominator;
    const remainder = absNum % this.#denominator;
    if (remainder === 0n) {
      return isNegative ? `-${wholePart}` : `${wholePart}`;
    }
    if (wholePart === 0n) {
      return isNegative
        ? `-0..${remainder}/${this.#denominator}`
        : `0..${remainder}/${this.#denominator}`;
    } else {
      return isNegative
        ? `-${wholePart}..${remainder}/${this.#denominator}`
        : `${wholePart}..${remainder}/${this.#denominator}`;
    }
  }
  toNumber() {
    return Number(this.#numerator) / Number(this.#denominator);
  }
  toRepeatingDecimal() {
    if (this.#numerator === 0n) {
      return "0";
    }
    const isNegative = this.#numerator < 0n;
    const num = isNegative ? -this.#numerator : this.#numerator;
    const den = this.#denominator;
    const integerPart = num / den;
    let remainder = num % den;
    if (remainder === 0n) {
      return (isNegative ? "-" : "") + integerPart.toString();
    }
    const seenRemainders = new Map();
    const digits = [];
    let position = 0;
    while (remainder !== 0n && !seenRemainders.has(remainder.toString())) {
      seenRemainders.set(remainder.toString(), position);
      remainder *= 10n;
      const digit = remainder / den;
      digits.push(digit.toString());
      remainder = remainder % den;
      position++;
    }
    let result = (isNegative ? "-" : "") + integerPart.toString();
    if (remainder === 0n) {
      if (digits.length > 0) {
        result += "." + digits.join("") + "#0";
      } else {
        result += "#0";
      }
    } else {
      const repeatStart = seenRemainders.get(remainder.toString());
      const nonRepeatingPart = digits.slice(0, repeatStart);
      const repeatingPart = digits.slice(repeatStart);
      if (nonRepeatingPart.length > 0) {
        result +=
          "." + nonRepeatingPart.join("") + "#" + repeatingPart.join("");
      } else {
        result += ".#" + repeatingPart.join("");
      }
    }
    return result;
  }
  toRepeatingDecimalWithPeriod() {
    if (this.#numerator === 0n) {
      return { decimal: "0", period: 0 };
    }
    const isNegative = this.#numerator < 0n;
    const num = isNegative ? -this.#numerator : this.#numerator;
    const den = this.#denominator;
    const integerPart = num / den;
    let remainder = num % den;
    if (remainder === 0n) {
      return {
        decimal: (isNegative ? "-" : "") + integerPart.toString(),
        period: 0,
      };
    }
    const seenRemainders = new Map();
    const digits = [];
    let position = 0;
    while (remainder !== 0n && !seenRemainders.has(remainder.toString())) {
      seenRemainders.set(remainder.toString(), position);
      remainder *= 10n;
      const digit = remainder / den;
      digits.push(digit.toString());
      remainder = remainder % den;
      position++;
    }
    let result = (isNegative ? "-" : "") + integerPart.toString();
    if (remainder === 0n) {
      if (digits.length > 0) {
        result += "." + digits.join("") + "#0";
      } else {
        result += "#0";
      }
      return { decimal: result, period: 0 };
    } else {
      const repeatStart = seenRemainders.get(remainder.toString());
      const nonRepeatingPart = digits.slice(0, repeatStart);
      const repeatingPart = digits.slice(repeatStart);
      if (nonRepeatingPart.length > 0) {
        result +=
          "." + nonRepeatingPart.join("") + "#" + repeatingPart.join("");
      } else {
        result += ".#" + repeatingPart.join("");
      }
      return {
        decimal: result,
        period: repeatingPart.length,
      };
    }
  }
  toDecimal() {
    if (this.#numerator === 0n) {
      return "0";
    }
    const isNegative = this.#numerator < 0n;
    const num = isNegative ? -this.#numerator : this.#numerator;
    const den = this.#denominator;
    const integerPart = num / den;
    let remainder = num % den;
    if (remainder === 0n) {
      return (isNegative ? "-" : "") + integerPart.toString();
    }
    const digits = [];
    const maxDigits = 20;
    for (let i = 0; i < maxDigits && remainder !== 0n; i++) {
      remainder *= 10n;
      const digit = remainder / den;
      digits.push(digit.toString());
      remainder = remainder % den;
    }
    let result = (isNegative ? "-" : "") + integerPart.toString();
    if (digits.length > 0) {
      result += "." + digits.join("");
    }
    return result;
  }
  E(exponent) {
    const exp = BigInt(exponent);
    let powerOf10;
    if (exp >= 0n) {
      powerOf10 = new Rational(10n ** exp, 1n);
    } else {
      powerOf10 = new Rational(1n, 10n ** -exp);
    }
    return this.multiply(powerOf10);
  }
  static from(value) {
    if (value instanceof Rational) {
      return new Rational(value.numerator, value.denominator);
    }
    return new Rational(value);
  }
}

// src/rational-interval.js
class RationalInterval {
  #low;
  #high;
  static zero = Object.freeze(
    new RationalInterval(Rational.zero, Rational.zero),
  );
  static one = Object.freeze(new RationalInterval(Rational.one, Rational.one));
  static unitInterval = Object.freeze(
    new RationalInterval(Rational.zero, Rational.one),
  );
  constructor(a, b) {
    const aRational = a instanceof Rational ? a : new Rational(a);
    const bRational = b instanceof Rational ? b : new Rational(b);
    if (aRational.lessThanOrEqual(bRational)) {
      this.#low = aRational;
      this.#high = bRational;
    } else {
      this.#low = bRational;
      this.#high = aRational;
    }
  }
  get low() {
    return this.#low;
  }
  get high() {
    return this.#high;
  }
  add(other) {
    if (other.value !== undefined && typeof other.value === "bigint") {
      const otherAsRational = new Rational(other.value, 1n);
      const otherAsInterval = new RationalInterval(
        otherAsRational,
        otherAsRational,
      );
      return this.add(otherAsInterval);
    } else if (
      other.numerator !== undefined &&
      other.denominator !== undefined
    ) {
      const otherAsInterval = new RationalInterval(other, other);
      return this.add(otherAsInterval);
    } else if (other.low && other.high) {
      const newLow = this.#low.add(other.low);
      const newHigh = this.#high.add(other.high);
      return new RationalInterval(newLow, newHigh);
    } else {
      throw new Error(
        `Cannot add ${other.constructor.name} to RationalInterval`,
      );
    }
  }
  subtract(other) {
    if (other.value !== undefined && typeof other.value === "bigint") {
      const otherAsRational = new Rational(other.value, 1n);
      const otherAsInterval = new RationalInterval(
        otherAsRational,
        otherAsRational,
      );
      return this.subtract(otherAsInterval);
    } else if (
      other.numerator !== undefined &&
      other.denominator !== undefined
    ) {
      const otherAsInterval = new RationalInterval(other, other);
      return this.subtract(otherAsInterval);
    } else if (other.low && other.high) {
      const newLow = this.#low.subtract(other.high);
      const newHigh = this.#high.subtract(other.low);
      return new RationalInterval(newLow, newHigh);
    } else {
      throw new Error(
        `Cannot subtract ${other.constructor.name} from RationalInterval`,
      );
    }
  }
  multiply(other) {
    if (other.value !== undefined && typeof other.value === "bigint") {
      const otherAsRational = new Rational(other.value, 1n);
      const otherAsInterval = new RationalInterval(
        otherAsRational,
        otherAsRational,
      );
      return this.multiply(otherAsInterval);
    } else if (
      other.numerator !== undefined &&
      other.denominator !== undefined
    ) {
      const otherAsInterval = new RationalInterval(other, other);
      return this.multiply(otherAsInterval);
    } else if (other.low && other.high) {
      const products = [
        this.#low.multiply(other.low),
        this.#low.multiply(other.high),
        this.#high.multiply(other.low),
        this.#high.multiply(other.high),
      ];
      let min = products[0];
      let max = products[0];
      for (let i = 1; i < products.length; i++) {
        if (products[i].lessThan(min)) min = products[i];
        if (products[i].greaterThan(max)) max = products[i];
      }
      return new RationalInterval(min, max);
    } else {
      throw new Error(
        `Cannot multiply RationalInterval by ${other.constructor.name}`,
      );
    }
  }
  divide(other) {
    if (other.value !== undefined && typeof other.value === "bigint") {
      if (other.value === 0n) {
        throw new Error("Division by zero");
      }
      const otherAsRational = new Rational(other.value, 1n);
      const otherAsInterval = new RationalInterval(
        otherAsRational,
        otherAsRational,
      );
      return this.divide(otherAsInterval);
    } else if (
      other.numerator !== undefined &&
      other.denominator !== undefined
    ) {
      if (other.numerator === 0n) {
        throw new Error("Division by zero");
      }
      const otherAsInterval = new RationalInterval(other, other);
      return this.divide(otherAsInterval);
    } else if (other.low && other.high) {
      const zero = Rational.zero;
      if (other.low.equals(zero) && other.high.equals(zero)) {
        throw new Error("Division by zero");
      }
      if (other.containsZero()) {
        throw new Error("Cannot divide by an interval containing zero");
      }
      const quotients = [
        this.#low.divide(other.low),
        this.#low.divide(other.high),
        this.#high.divide(other.low),
        this.#high.divide(other.high),
      ];
      let min = quotients[0];
      let max = quotients[0];
      for (let i = 1; i < quotients.length; i++) {
        if (quotients[i].lessThan(min)) min = quotients[i];
        if (quotients[i].greaterThan(max)) max = quotients[i];
      }
      return new RationalInterval(min, max);
    } else {
      throw new Error(
        `Cannot divide RationalInterval by ${other.constructor.name}`,
      );
    }
  }
  reciprocate() {
    if (this.containsZero()) {
      throw new Error("Cannot reciprocate an interval containing zero");
    }
    return new RationalInterval(
      this.#high.reciprocal(),
      this.#low.reciprocal(),
    );
  }
  negate() {
    return new RationalInterval(this.#high.negate(), this.#low.negate());
  }
  pow(exponent) {
    const n = BigInt(exponent);
    const zero = Rational.zero;
    if (n === 0n) {
      if (this.#low.equals(zero) && this.#high.equals(zero)) {
        throw new Error("Zero cannot be raised to the power of zero");
      }
      if (this.containsZero()) {
        throw new Error(
          "Cannot raise an interval containing zero to the power of zero",
        );
      }
      return new RationalInterval(Rational.one, Rational.one);
    }
    if (n < 0n) {
      if (this.containsZero()) {
        throw new Error(
          "Cannot raise an interval containing zero to a negative power",
        );
      }
      const positivePower = this.pow(-n);
      const reciprocal = new RationalInterval(
        positivePower.high.reciprocal(),
        positivePower.low.reciprocal(),
      );
      return reciprocal;
    }
    if (n === 1n) {
      return new RationalInterval(this.#low, this.#high);
    }
    if (n % 2n === 0n) {
      let minVal;
      let maxVal;
      if (
        this.#low.lessThanOrEqual(zero) &&
        this.#high.greaterThanOrEqual(zero)
      ) {
        minVal = new Rational(0);
        const lowPow = this.#low.abs().pow(n);
        const highPow = this.#high.abs().pow(n);
        maxVal = lowPow.greaterThan(highPow) ? lowPow : highPow;
      } else if (this.#high.lessThan(zero)) {
        minVal = this.#high.pow(n);
        maxVal = this.#low.pow(n);
      } else {
        minVal = this.#low.pow(n);
        maxVal = this.#high.pow(n);
      }
      return new RationalInterval(minVal, maxVal);
    } else {
      return new RationalInterval(this.#low.pow(n), this.#high.pow(n));
    }
  }
  mpow(exponent) {
    const n = BigInt(exponent);
    const zero = Rational.zero;
    if (n === 0n) {
      throw new Error(
        "Multiplicative exponentiation requires at least one factor",
      );
    }
    if (n < 0n) {
      const recipInterval = this.reciprocate();
      return recipInterval.mpow(-n);
    }
    if (n === 1n) {
      return new RationalInterval(this.#low, this.#high);
    }
    if (n === 1n) {
      return new RationalInterval(this.#low, this.#high);
    }
    let result = new RationalInterval(this.#low, this.#high);
    for (let i = 1n; i < n; i++) {
      result = result.multiply(this);
    }
    return result;
  }
  overlaps(other) {
    return !(this.#high.lessThan(other.low) || other.high.lessThan(this.#low));
  }
  contains(other) {
    return (
      this.#low.lessThanOrEqual(other.low) &&
      this.#high.greaterThanOrEqual(other.high)
    );
  }
  containsValue(value) {
    const r = value instanceof Rational ? value : new Rational(value);
    return this.#low.lessThanOrEqual(r) && this.#high.greaterThanOrEqual(r);
  }
  containsZero() {
    const zero = Rational.zero;
    return (
      this.#low.lessThanOrEqual(zero) && this.#high.greaterThanOrEqual(zero)
    );
  }
  equals(other) {
    return this.#low.equals(other.low) && this.#high.equals(other.high);
  }
  intersection(other) {
    if (!this.overlaps(other)) {
      return null;
    }
    const newLow = this.#low.greaterThan(other.low) ? this.#low : other.low;
    const newHigh = this.#high.lessThan(other.high) ? this.#high : other.high;
    return new RationalInterval(newLow, newHigh);
  }
  union(other) {
    const oneLow = new Rational(1);
    const adjacentRight = this.#high.add(oneLow).equals(other.low);
    const adjacentLeft = other.high.add(oneLow).equals(this.#low);
    if (!this.overlaps(other) && !adjacentRight && !adjacentLeft) {
      return null;
    }
    const newLow = this.#low.lessThan(other.low) ? this.#low : other.low;
    const newHigh = this.#high.greaterThan(other.high)
      ? this.#high
      : other.high;
    return new RationalInterval(newLow, newHigh);
  }
  toString() {
    return `${this.#low.toString()}:${this.#high.toString()}`;
  }
  toMixedString() {
    return `${this.#low.toMixedString()}:${this.#high.toMixedString()}`;
  }
  static point(value) {
    let r;
    if (value instanceof Rational) {
      r = value;
    } else if (typeof value === "number") {
      r = new Rational(String(value));
    } else if (typeof value === "string" || typeof value === "bigint") {
      r = new Rational(value);
    } else {
      r = new Rational(0);
    }
    return new RationalInterval(r, r);
  }
  static fromString(str) {
    const parts = str.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid interval format. Use 'a:b'");
    }
    return new RationalInterval(parts[0], parts[1]);
  }
  toRepeatingDecimal() {
    const lowDecimal = this.#low.toRepeatingDecimal();
    const highDecimal = this.#high.toRepeatingDecimal();
    return `${lowDecimal}:${highDecimal}`;
  }
  compactedDecimalInterval() {
    const lowStr = this.#low.toDecimal();
    const highStr = this.#high.toDecimal();
    let commonPrefix = "";
    const minLength = Math.min(lowStr.length, highStr.length);
    for (let i = 0; i < minLength; i++) {
      if (lowStr[i] === highStr[i]) {
        commonPrefix += lowStr[i];
      } else {
        break;
      }
    }
    if (
      commonPrefix.length <= 1 ||
      (commonPrefix.startsWith("-") && commonPrefix.length <= 2)
    ) {
      return `${lowStr}:${highStr}`;
    }
    const lowSuffix = lowStr.substring(commonPrefix.length);
    const highSuffix = highStr.substring(commonPrefix.length);
    if (!lowSuffix || !highSuffix || lowSuffix.length !== highSuffix.length) {
      return `${lowStr}:${highStr}`;
    }
    if (!/^\d+$/.test(lowSuffix) || !/^\d+$/.test(highSuffix)) {
      return `${lowStr}:${highStr}`;
    }
    return `${commonPrefix}[${lowSuffix},${highSuffix}]`;
  }
  relativeMidDecimalInterval() {
    const midpoint = this.#low.add(this.#high).divide(new Rational(2));
    const offset = this.#high.subtract(midpoint);
    const midpointStr = midpoint.toDecimal();
    const offsetStr = offset.toDecimal();
    return `${midpointStr}[+-${offsetStr}]`;
  }
  relativeDecimalInterval() {
    const shortestDecimal = this.#findShortestPreciseDecimal();
    const offsetLow = shortestDecimal.subtract(this.#low);
    const offsetHigh = this.#high.subtract(shortestDecimal);
    const decimalStr = shortestDecimal.toDecimal();
    const decimalPlaces = decimalStr.includes(".")
      ? decimalStr.split(".")[1].length
      : 0;
    let scaledOffsetLow, scaledOffsetHigh;
    if (decimalPlaces === 0) {
      scaledOffsetLow = offsetLow;
      scaledOffsetHigh = offsetHigh;
    } else {
      const scaleFactor = new Rational(10).pow(decimalPlaces + 1);
      scaledOffsetLow = offsetLow.multiply(scaleFactor);
      scaledOffsetHigh = offsetHigh.multiply(scaleFactor);
    }
    const offsetLowStr = scaledOffsetLow.toDecimal();
    const offsetHighStr = scaledOffsetHigh.toDecimal();
    if (
      offsetLow.subtract(offsetHigh).abs().compareTo(new Rational(1, 1e6)) < 0
    ) {
      const avgOffset = scaledOffsetLow
        .add(scaledOffsetHigh)
        .divide(new Rational(2));
      return `${decimalStr}[+-${avgOffset.toDecimal()}]`;
    } else {
      return `${decimalStr}[+${offsetHighStr},-${offsetLowStr}]`;
    }
  }
  #findShortestPreciseDecimal() {
    const midpoint = this.#low.add(this.#high).divide(new Rational(2));
    for (let precision = 0; precision <= 20; precision++) {
      const scale = new Rational(10).pow(precision);
      const lowScaled = this.#low.multiply(scale);
      const highScaled = this.#high.multiply(scale);
      const minInt = this.#ceilRational(lowScaled);
      const maxInt = this.#floorRational(highScaled);
      if (minInt.compareTo(maxInt) <= 0) {
        const candidates = [];
        let current = minInt;
        while (current.compareTo(maxInt) <= 0) {
          candidates.push(current.divide(scale));
          current = current.add(new Rational(1));
        }
        if (candidates.length > 0) {
          let best = candidates[0];
          let bestDistance = best.subtract(midpoint).abs();
          for (let i = 1; i < candidates.length; i++) {
            const distance = candidates[i].subtract(midpoint).abs();
            const comparison = distance.compareTo(bestDistance);
            if (
              comparison < 0 ||
              (comparison === 0 && candidates[i].compareTo(best) < 0)
            ) {
              best = candidates[i];
              bestDistance = distance;
            }
          }
          return best;
        }
      }
    }
    return midpoint;
  }
  #ceilRational(rational) {
    if (rational.denominator === 1n) {
      return rational;
    }
    const quotient = rational.numerator / rational.denominator;
    if (rational.numerator >= 0n) {
      return new Rational(quotient + 1n, 1n);
    } else {
      return new Rational(quotient, 1n);
    }
  }
  #floorRational(rational) {
    if (rational.denominator === 1n) {
      return rational;
    }
    const quotient = rational.numerator / rational.denominator;
    if (rational.numerator >= 0n) {
      return new Rational(quotient, 1n);
    } else {
      return new Rational(quotient - 1n, 1n);
    }
  }
  mediant() {
    return new Rational(
      this.#low.numerator + this.#high.numerator,
      this.#low.denominator + this.#high.denominator,
    );
  }
  midpoint() {
    return this.#low.add(this.#high).divide(new Rational(2));
  }
  shortestDecimal(base = 10) {
    const baseBigInt = BigInt(base);
    if (baseBigInt <= 1n) {
      throw new Error("Base must be greater than 1");
    }
    if (this.#low.equals(this.#high)) {
      const value = this.#low;
      let k2 = 0;
      let denominator2 = 1n;
      while (k2 <= 50) {
        const numeratorCandidate = value.multiply(new Rational(denominator2));
        if (numeratorCandidate.denominator === 1n) {
          return new Rational(numeratorCandidate.numerator, denominator2);
        }
        k2++;
        denominator2 *= baseBigInt;
      }
      return null;
    }
    const intervalLength = this.#high.subtract(this.#low);
    const lengthAsNumber =
      Number(intervalLength.numerator) / Number(intervalLength.denominator);
    const baseAsNumber = Number(baseBigInt);
    let maxK = Math.ceil(Math.log(1 / lengthAsNumber) / Math.log(baseAsNumber));
    maxK = Math.max(0, maxK + 2);
    let k = 0;
    let denominator = 1n;
    while (k <= maxK) {
      const minNumerator = this.#ceilRational(
        this.#low.multiply(new Rational(denominator)),
      );
      const maxNumerator = this.#floorRational(
        this.#high.multiply(new Rational(denominator)),
      );
      if (minNumerator.lessThanOrEqual(maxNumerator)) {
        return new Rational(minNumerator.numerator, denominator);
      }
      k++;
      denominator *= baseBigInt;
    }
    throw new Error(
      "Failed to find shortest decimal representation (exceeded theoretical bound)",
    );
  }
  randomRational(maxDenominator = 1000) {
    const maxDenom = BigInt(maxDenominator);
    if (maxDenom <= 0n) {
      throw new Error("maxDenominator must be positive");
    }
    const validRationals = [];
    for (let denom = 1n; denom <= maxDenom; denom++) {
      const minNum = this.#ceilRational(
        this.#low.multiply(new Rational(denom)),
      );
      const maxNum = this.#floorRational(
        this.#high.multiply(new Rational(denom)),
      );
      for (let num = minNum.numerator; num <= maxNum.numerator; num++) {
        const candidate = new Rational(num, denom);
        if (candidate.numerator === num && candidate.denominator === denom) {
          validRationals.push(candidate);
        }
      }
    }
    if (validRationals.length === 0) {
      return this.midpoint();
    }
    const randomIndex = Math.floor(Math.random() * validRationals.length);
    return validRationals[randomIndex];
  }
  #gcd(a, b) {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    while (b !== 0n) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }
  E(exponent) {
    const exp = BigInt(exponent);
    let powerOf10;
    if (exp >= 0n) {
      powerOf10 = new Rational(10n ** exp, 1n);
    } else {
      powerOf10 = new Rational(1n, 10n ** -exp);
    }
    const newLow = this.#low.multiply(powerOf10);
    const newHigh = this.#high.multiply(powerOf10);
    return new RationalInterval(newLow, newHigh);
  }
}

// src/integer.js
class Integer {
  #value;
  static zero = new Integer(0);
  static one = new Integer(1);
  constructor(value) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!/^-?\d+$/.test(trimmed)) {
        throw new Error("Invalid integer format. Must be a whole number");
      }
      this.#value = BigInt(trimmed);
    } else {
      this.#value = BigInt(value);
    }
  }
  get value() {
    return this.#value;
  }
  add(other) {
    if (other instanceof Integer) {
      return new Integer(this.#value + other.value);
    } else if (other instanceof Rational) {
      const thisAsRational = new Rational(this.#value, 1n);
      return thisAsRational.add(other);
    } else if (
      other.low &&
      other.high &&
      typeof other.low.equals === "function"
    ) {
      const thisAsRational = new Rational(this.#value, 1n);
      const IntervalClass = other.constructor;
      const thisAsInterval = new IntervalClass(thisAsRational, thisAsRational);
      return thisAsInterval.add(other);
    } else {
      throw new Error(`Cannot add ${other.constructor.name} to Integer`);
    }
  }
  subtract(other) {
    if (other instanceof Integer) {
      return new Integer(this.#value - other.value);
    } else if (other instanceof Rational) {
      const thisAsRational = new Rational(this.#value, 1n);
      return thisAsRational.subtract(other);
    } else if (
      other.low &&
      other.high &&
      typeof other.low.equals === "function"
    ) {
      const thisAsRational = new Rational(this.#value, 1n);
      const IntervalClass = other.constructor;
      const thisAsInterval = new IntervalClass(thisAsRational, thisAsRational);
      return thisAsInterval.subtract(other);
    } else {
      throw new Error(`Cannot subtract ${other.constructor.name} from Integer`);
    }
  }
  multiply(other) {
    if (other instanceof Integer) {
      return new Integer(this.#value * other.value);
    } else if (other instanceof Rational) {
      const thisAsRational = new Rational(this.#value, 1n);
      return thisAsRational.multiply(other);
    } else if (
      other.low &&
      other.high &&
      typeof other.low.equals === "function"
    ) {
      const thisAsRational = new Rational(this.#value, 1n);
      const IntervalClass = other.constructor;
      const thisAsInterval = new IntervalClass(thisAsRational, thisAsRational);
      return thisAsInterval.multiply(other);
    } else {
      throw new Error(`Cannot multiply Integer by ${other.constructor.name}`);
    }
  }
  divide(other) {
    if (other instanceof Integer) {
      if (other.value === 0n) {
        throw new Error("Division by zero");
      }
      if (this.#value % other.value === 0n) {
        return new Integer(this.#value / other.value);
      } else {
        return new Rational(this.#value, other.value);
      }
    } else if (other instanceof Rational) {
      const thisAsRational = new Rational(this.#value, 1n);
      return thisAsRational.divide(other);
    } else if (
      other.low &&
      other.high &&
      typeof other.low.equals === "function"
    ) {
      const thisAsRational = new Rational(this.#value, 1n);
      const IntervalClass = other.constructor;
      const thisAsInterval = new IntervalClass(thisAsRational, thisAsRational);
      return thisAsInterval.divide(other);
    } else {
      throw new Error(`Cannot divide Integer by ${other.constructor.name}`);
    }
  }
  modulo(other) {
    if (other.value === 0n) {
      throw new Error("Modulo by zero");
    }
    return new Integer(this.#value % other.value);
  }
  negate() {
    return new Integer(-this.#value);
  }
  pow(exponent) {
    const exp = exponent instanceof Integer ? exponent.value : BigInt(exponent);
    if (exp === 0n) {
      if (this.#value === 0n) {
        throw new Error("Zero cannot be raised to the power of zero");
      }
      return new Integer(1);
    }
    if (exp < 0n) {
      if (this.#value === 0n) {
        throw new Error("Zero cannot be raised to a negative power");
      }
      const positiveExp = -exp;
      const positiveResult = this.pow(positiveExp);
      return new Rational(1, positiveResult.value);
    }
    let result = 1n;
    let base = this.#value;
    let n = exp;
    while (n > 0n) {
      if (n & 1n) {
        result *= base;
      }
      base *= base;
      n >>= 1n;
    }
    return new Integer(result);
  }
  equals(other) {
    return this.#value === other.value;
  }
  compareTo(other) {
    if (this.#value < other.value) return -1;
    if (this.#value > other.value) return 1;
    return 0;
  }
  lessThan(other) {
    return this.#value < other.value;
  }
  lessThanOrEqual(other) {
    return this.#value <= other.value;
  }
  greaterThan(other) {
    return this.#value > other.value;
  }
  greaterThanOrEqual(other) {
    return this.#value >= other.value;
  }
  abs() {
    return this.#value < 0n ? this.negate() : new Integer(this.#value);
  }
  sign() {
    if (this.#value < 0n) return new Integer(-1);
    if (this.#value > 0n) return new Integer(1);
    return new Integer(0);
  }
  isEven() {
    return this.#value % 2n === 0n;
  }
  isOdd() {
    return this.#value % 2n !== 0n;
  }
  isZero() {
    return this.#value === 0n;
  }
  isPositive() {
    return this.#value > 0n;
  }
  isNegative() {
    return this.#value < 0n;
  }
  gcd(other) {
    let a = this.#value < 0n ? -this.#value : this.#value;
    let b = other.value < 0n ? -other.value : other.value;
    while (b !== 0n) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return new Integer(a);
  }
  lcm(other) {
    if (this.#value === 0n || other.value === 0n) {
      return new Integer(0);
    }
    const gcd = this.gcd(other);
    const product = this.multiply(other).abs();
    return product.divide(gcd);
  }
  toString() {
    return this.#value.toString();
  }
  toNumber() {
    return Number(this.#value);
  }
  toRational() {
    return new Rational(this.#value, 1n);
  }
  static from(value) {
    if (value instanceof Integer) {
      return new Integer(value.value);
    }
    return new Integer(value);
  }
  static fromRational(rational) {
    if (rational.denominator !== 1n) {
      throw new Error("Rational is not a whole number");
    }
    return new Integer(rational.numerator);
  }
  E(exponent) {
    const exp = BigInt(exponent);
    if (exp >= 0n) {
      const newValue = this.#value * 10n ** exp;
      return new Integer(newValue);
    } else {
      const powerOf10 = new Rational(1n, 10n ** -exp);
      const thisAsRational = new Rational(this.#value, 1n);
      return thisAsRational.multiply(powerOf10);
    }
  }
  factorial() {
    if (this.#value < 0n) {
      throw new Error("Factorial is not defined for negative integers");
    }
    if (this.#value === 0n || this.#value === 1n) {
      return new Integer(1);
    }
    let result = 1n;
    for (let i = 2n; i <= this.#value; i++) {
      result *= i;
    }
    return new Integer(result);
  }
  doubleFactorial() {
    if (this.#value < 0n) {
      throw new Error("Double factorial is not defined for negative integers");
    }
    if (this.#value === 0n || this.#value === 1n) {
      return new Integer(1);
    }
    let result = 1n;
    for (let i = this.#value; i > 0n; i -= 2n) {
      result *= i;
    }
    return new Integer(result);
  }
}

// src/parser.js
function parseDecimalUncertainty(str, allowIntegerRangeNotation = true) {
  const uncertaintyMatch = str.match(/^(-?\d*\.?\d*)\[([^\]]+)\]$/);
  if (!uncertaintyMatch) {
    throw new Error("Invalid uncertainty format");
  }
  const baseStr = uncertaintyMatch[1];
  const uncertaintyStr = uncertaintyMatch[2];
  const afterDecimalMatch = baseStr.match(/^(-?\d+\.)$/);
  if (
    afterDecimalMatch &&
    !uncertaintyStr.startsWith("+-") &&
    !uncertaintyStr.startsWith("-+")
  ) {
    return parseDecimalPointUncertainty(baseStr, uncertaintyStr);
  }
  const baseRational = new Rational(baseStr);
  const decimalMatch = baseStr.match(/\.(\d+)$/);
  const baseDecimalPlaces = decimalMatch ? decimalMatch[1].length : 0;
  if (
    uncertaintyStr.includes(",") &&
    !uncertaintyStr.includes("+") &&
    !uncertaintyStr.includes("-")
  ) {
    if (baseDecimalPlaces === 0 && !allowIntegerRangeNotation) {
      throw new Error(
        "Range notation on integer bases is not supported in this context",
      );
    }
    const rangeParts = uncertaintyStr.split(",");
    if (rangeParts.length !== 2) {
      throw new Error(
        "Range notation must have exactly two values separated by comma",
      );
    }
    const lowerUncertainty = rangeParts[0].trim();
    const upperUncertainty = rangeParts[1].trim();
    if (
      !/^\d+(\.\d+)?$/.test(lowerUncertainty) ||
      !/^\d+(\.\d+)?$/.test(upperUncertainty)
    ) {
      throw new Error("Range values must be valid decimal numbers");
    }
    const lowerBoundStr = baseStr + lowerUncertainty;
    const upperBoundStr = baseStr + upperUncertainty;
    if (baseDecimalPlaces === 0) {
      const lowerIsInteger = !lowerUncertainty.includes(".");
      const upperIsInteger = !upperUncertainty.includes(".");
      const lowerIntPart = lowerUncertainty.includes(".")
        ? lowerUncertainty.split(".")[0]
        : lowerUncertainty;
      const upperIntPart = upperUncertainty.includes(".")
        ? upperUncertainty.split(".")[0]
        : upperUncertainty;
      const lowerIntDigits = lowerIntPart.length;
      const upperIntDigits = upperIntPart.length;
      if (lowerIntDigits !== upperIntDigits) {
        throw new Error(
          `Invalid range notation: ${baseStr}[${lowerUncertainty},${upperUncertainty}] - integer parts of range values must have the same number of digits (${lowerIntPart} has ${lowerIntDigits}, ${upperIntPart} has ${upperIntDigits})`,
        );
      }
    }
    const lowerBound = new Rational(lowerBoundStr);
    const upperBound = new Rational(upperBoundStr);
    if (lowerBound.greaterThan(upperBound)) {
      return new RationalInterval(upperBound, lowerBound);
    }
    return new RationalInterval(lowerBound, upperBound);
  } else if (
    uncertaintyStr.startsWith("+-") ||
    uncertaintyStr.startsWith("-+")
  ) {
    const offsetStr = uncertaintyStr.substring(2);
    if (!offsetStr) {
      throw new Error(
        "Symmetric notation must have a valid number after +- or -+",
      );
    }
    const offset = parseRepeatingDecimalOrRegular(offsetStr);
    if (baseDecimalPlaces === 0) {
      const upperBound = baseRational.add(offset);
      const lowerBound = baseRational.subtract(offset);
      return new RationalInterval(lowerBound, upperBound);
    } else {
      const nextPlaceScale = new Rational(1).divide(
        new Rational(10).pow(baseDecimalPlaces + 1),
      );
      const scaledOffset = offset.multiply(nextPlaceScale);
      const upperBound = baseRational.add(scaledOffset);
      const lowerBound = baseRational.subtract(scaledOffset);
      return new RationalInterval(lowerBound, upperBound);
    }
  } else {
    const relativeParts = uncertaintyStr.split(",").map((s) => s.trim());
    if (relativeParts.length !== 2) {
      throw new Error(
        "Relative notation must have exactly two values separated by comma",
      );
    }
    let positiveOffset = null;
    let negativeOffset = null;
    for (const part of relativeParts) {
      if (part.startsWith("+")) {
        if (positiveOffset !== null) {
          throw new Error("Only one positive offset allowed");
        }
        const offsetStr = part.substring(1);
        if (!offsetStr) {
          throw new Error("Offset must be a valid number");
        }
        positiveOffset = parseRepeatingDecimalOrRegular(offsetStr);
      } else if (part.startsWith("-")) {
        if (negativeOffset !== null) {
          throw new Error("Only one negative offset allowed");
        }
        const offsetStr = part.substring(1);
        if (!offsetStr) {
          throw new Error("Offset must be a valid number");
        }
        negativeOffset = parseRepeatingDecimalOrRegular(offsetStr);
      } else {
        throw new Error("Relative notation values must start with + or -");
      }
    }
    if (positiveOffset === null || negativeOffset === null) {
      throw new Error(
        "Relative notation must have exactly one + and one - value",
      );
    }
    let upperBound, lowerBound;
    if (baseDecimalPlaces === 0) {
      upperBound = baseRational.add(positiveOffset);
      lowerBound = baseRational.subtract(negativeOffset);
    } else {
      const nextPlaceScale = new Rational(1).divide(
        new Rational(10).pow(baseDecimalPlaces + 1),
      );
      const scaledPositiveOffset = positiveOffset.multiply(nextPlaceScale);
      const scaledNegativeOffset = negativeOffset.multiply(nextPlaceScale);
      upperBound = baseRational.add(scaledPositiveOffset);
      lowerBound = baseRational.subtract(scaledNegativeOffset);
    }
    return new RationalInterval(lowerBound, upperBound);
  }
}
function parseDecimalPointUncertainty(baseStr, uncertaintyStr) {
  if (uncertaintyStr.includes(",")) {
    const rangeParts = uncertaintyStr.split(",");
    if (rangeParts.length !== 2) {
      throw new Error(
        "Range notation must have exactly two values separated by comma",
      );
    }
    const lowerStr = rangeParts[0].trim();
    const upperStr = rangeParts[1].trim();
    const lowerBound = parseDecimalPointEndpoint(baseStr, lowerStr);
    const upperBound = parseDecimalPointEndpoint(baseStr, upperStr);
    return new RationalInterval(lowerBound, upperBound);
  } else {
    throw new Error("Invalid uncertainty format for decimal point notation");
  }
}
function parseDecimalPointEndpoint(baseStr, endpointStr) {
  if (endpointStr.startsWith("#")) {
    const fullStr = baseStr + endpointStr;
    return parseRepeatingDecimal(fullStr);
  } else if (/^\d+$/.test(endpointStr)) {
    const fullStr = baseStr + endpointStr;
    return new Rational(fullStr);
  } else {
    throw new Error(`Invalid endpoint format: ${endpointStr}`);
  }
}
function parseRepeatingDecimalOrRegular(str) {
  if (str.includes("#")) {
    const eIndex = str.indexOf("E");
    if (eIndex !== -1) {
      const repeatingPart = str.substring(0, eIndex);
      const exponentPart = str.substring(eIndex + 1);
      if (!/^-?\d+$/.test(exponentPart)) {
        throw new Error("E notation exponent must be an integer");
      }
      const baseValue = parseRepeatingDecimal(repeatingPart);
      const exponent = BigInt(exponentPart);
      let powerOf10;
      if (exponent >= 0n) {
        powerOf10 = new Rational(10n ** exponent);
      } else {
        powerOf10 = new Rational(1n, 10n ** -exponent);
      }
      return baseValue.multiply(powerOf10);
    } else {
      return parseRepeatingDecimal(str);
    }
  } else if (str.includes("E")) {
    const eIndex = str.indexOf("E");
    const basePart = str.substring(0, eIndex);
    const exponentPart = str.substring(eIndex + 1);
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(basePart)) {
      throw new Error("Invalid number format before E notation");
    }
    if (!/^-?\d+$/.test(exponentPart)) {
      throw new Error("E notation exponent must be an integer");
    }
    const baseValue = new Rational(basePart);
    const exponent = BigInt(exponentPart);
    let powerOf10;
    if (exponent >= 0n) {
      powerOf10 = new Rational(10n ** exponent);
    } else {
      powerOf10 = new Rational(1n, 10n ** -exponent);
    }
    return baseValue.multiply(powerOf10);
  } else {
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(str)) {
      throw new Error(
        "Symmetric notation must have a valid number after +- or -+",
      );
    }
    return new Rational(str);
  }
}
function parseRepeatingDecimal(str) {
  if (!str || typeof str !== "string") {
    throw new Error("Input must be a non-empty string");
  }
  str = str.trim();
  if (str.includes("[") && str.includes("]")) {
    return parseDecimalUncertainty(str, false);
  }
  if (str.includes(":")) {
    return parseRepeatingDecimalInterval(str);
  }
  const isNegative = str.startsWith("-");
  if (isNegative) {
    str = str.substring(1);
  }
  if (!str.includes("#")) {
    return parseNonRepeatingDecimal(str, isNegative);
  }
  const parts = str.split("#");
  if (parts.length !== 2) {
    throw new Error(
      'Invalid repeating decimal format. Use format like "0.12#45"',
    );
  }
  const [nonRepeatingPart, repeatingPart] = parts;
  if (!/^\d+$/.test(repeatingPart)) {
    throw new Error("Repeating part must contain only digits");
  }
  if (repeatingPart === "0") {
    try {
      const decimalParts2 = nonRepeatingPart.split(".");
      if (decimalParts2.length > 2) {
        throw new Error("Invalid decimal format - multiple decimal points");
      }
      const integerPart2 = decimalParts2[0] || "0";
      const fractionalPart2 = decimalParts2[1] || "";
      if (!/^\d*$/.test(integerPart2) || !/^\d*$/.test(fractionalPart2)) {
        throw new Error(
          "Decimal must contain only digits and at most one decimal point",
        );
      }
      let numerator2, denominator2;
      if (!fractionalPart2) {
        numerator2 = BigInt(integerPart2);
        denominator2 = 1n;
      } else {
        numerator2 = BigInt(integerPart2 + fractionalPart2);
        denominator2 = 10n ** BigInt(fractionalPart2.length);
      }
      const rational = new Rational(numerator2, denominator2);
      return isNegative ? rational.negate() : rational;
    } catch (error) {
      throw new Error(`Invalid decimal format: ${error.message}`);
    }
  }
  const decimalParts = nonRepeatingPart.split(".");
  if (decimalParts.length > 2) {
    throw new Error("Invalid decimal format - multiple decimal points");
  }
  const integerPart = decimalParts[0] || "0";
  const fractionalPart = decimalParts[1] || "";
  if (!/^\d*$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
    throw new Error(
      "Non-repeating part must contain only digits and at most one decimal point",
    );
  }
  const n = fractionalPart.length;
  const m = repeatingPart.length;
  const abcStr = integerPart + fractionalPart + repeatingPart;
  const abStr = integerPart + fractionalPart;
  const abc = BigInt(abcStr);
  const ab = BigInt(abStr);
  const powerOfTenN = 10n ** BigInt(n);
  const powerOfTenM = 10n ** BigInt(m);
  const denominator = powerOfTenN * (powerOfTenM - 1n);
  const numerator = abc - ab;
  let result = new Rational(numerator, denominator);
  return isNegative ? result.negate() : result;
}
function parseNonRepeatingDecimal(str, isNegative) {
  const decimalParts = str.split(".");
  if (decimalParts.length > 2) {
    throw new Error("Invalid decimal format - multiple decimal points");
  }
  const integerPart = decimalParts[0] || "0";
  const fractionalPart = decimalParts[1] || "";
  if (!/^\d+$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
    throw new Error(
      "Decimal must contain only digits and at most one decimal point",
    );
  }
  if (!fractionalPart) {
    const rational = new Rational(integerPart);
    return isNegative ? rational.negate() : rational;
  }
  const lastDigitPlace = 10n ** BigInt(fractionalPart.length + 1);
  const baseValue = BigInt(integerPart + fractionalPart);
  let lower, upper;
  if (isNegative) {
    const lowerNumerator = -(baseValue * 10n + 5n);
    const upperNumerator = -(baseValue * 10n - 5n);
    lower = new Rational(lowerNumerator, lastDigitPlace);
    upper = new Rational(upperNumerator, lastDigitPlace);
  } else {
    const lowerNumerator = baseValue * 10n - 5n;
    const upperNumerator = baseValue * 10n + 5n;
    lower = new Rational(lowerNumerator, lastDigitPlace);
    upper = new Rational(upperNumerator, lastDigitPlace);
  }
  return new RationalInterval(lower, upper);
}
function parseRepeatingDecimalInterval(str) {
  const parts = str.split(":");
  if (parts.length !== 2) {
    throw new Error('Invalid interval format. Use format like "0.#3:0.5#0"');
  }
  const leftEndpoint = parseRepeatingDecimal(parts[0].trim());
  const rightEndpoint = parseRepeatingDecimal(parts[1].trim());
  if (
    leftEndpoint instanceof RationalInterval ||
    rightEndpoint instanceof RationalInterval
  ) {
    throw new Error("Nested intervals are not supported");
  }
  return new RationalInterval(leftEndpoint, rightEndpoint);
}

class Parser {
  static parse(expression, options = {}) {
    if (!expression || expression.trim() === "") {
      throw new Error("Expression cannot be empty");
    }
    options = { typeAware: true, ...options };
    expression = expression.replace(/ E/g, "TE");
    expression = expression.replace(/\/ /g, "/S");
    expression = expression.replace(/\s+/g, "");
    const result = Parser.#parseExpression(expression, options);
    if (result.remainingExpr.length > 0) {
      throw new Error(`Unexpected token at end: ${result.remainingExpr}`);
    }
    return result.value;
  }
  static #parseExpression(expr, options = {}) {
    let result = Parser.#parseTerm(expr, options);
    let currentExpr = result.remainingExpr;
    while (
      currentExpr.length > 0 &&
      (currentExpr[0] === "+" || currentExpr[0] === "-")
    ) {
      const operator = currentExpr[0];
      currentExpr = currentExpr.substring(1);
      const termResult = Parser.#parseTerm(currentExpr, options);
      currentExpr = termResult.remainingExpr;
      if (operator === "+") {
        result.value = result.value.add(termResult.value);
      } else {
        result.value = result.value.subtract(termResult.value);
      }
    }
    return {
      value: Parser.#promoteType(result.value, options),
      remainingExpr: currentExpr,
    };
  }
  static #parseTerm(expr, options = {}) {
    let result = Parser.#parseFactor(expr, options);
    let currentExpr = result.remainingExpr;
    while (
      currentExpr.length > 0 &&
      (currentExpr[0] === "*" ||
        currentExpr[0] === "/" ||
        currentExpr[0] === "E" ||
        currentExpr.startsWith("TE"))
    ) {
      let operator, skipLength;
      if (currentExpr.startsWith("TE")) {
        operator = "E";
        skipLength = 2;
      } else {
        operator = currentExpr[0];
        skipLength = 1;
      }
      currentExpr = currentExpr.substring(skipLength);
      if (
        operator === "/" &&
        currentExpr.length > 0 &&
        currentExpr[0] === "S"
      ) {
        currentExpr = currentExpr.substring(1);
      }
      const factorResult = Parser.#parseFactor(currentExpr, options);
      currentExpr = factorResult.remainingExpr;
      if (operator === "*") {
        result.value = result.value.multiply(factorResult.value);
      } else if (operator === "/") {
        result.value = result.value.divide(factorResult.value);
      } else if (operator === "E") {
        let exponentValue;
        if (factorResult.value instanceof Integer) {
          exponentValue = factorResult.value.value;
        } else if (factorResult.value instanceof Rational) {
          if (factorResult.value.denominator !== 1n) {
            throw new Error("E notation exponent must be an integer");
          }
          exponentValue = factorResult.value.numerator;
        } else if (factorResult.value.low && factorResult.value.high) {
          if (!factorResult.value.low.equals(factorResult.value.high)) {
            throw new Error("E notation exponent must be an integer");
          }
          const exponent = factorResult.value.low;
          if (exponent.denominator !== 1n) {
            throw new Error("E notation exponent must be an integer");
          }
          exponentValue = exponent.numerator;
        } else {
          throw new Error("Invalid E notation exponent type");
        }
        if (result.value.E && typeof result.value.E === "function") {
          result.value = result.value.E(exponentValue);
        } else {
          const powerOf10 =
            exponentValue >= 0n
              ? new Rational(10n ** exponentValue)
              : new Rational(1n, 10n ** -exponentValue);
          const powerInterval = RationalInterval.point(powerOf10);
          result.value = result.value.multiply(powerInterval);
        }
      }
    }
    return {
      value: Parser.#promoteType(result.value, options),
      remainingExpr: currentExpr,
    };
  }
  static #parseFactor(expr, options = {}) {
    if (expr.length === 0) {
      throw new Error("Unexpected end of expression");
    }
    if (expr[0] === "(") {
      const subExprResult = Parser.#parseExpression(expr.substring(1), options);
      if (
        subExprResult.remainingExpr.length === 0 ||
        subExprResult.remainingExpr[0] !== ")"
      ) {
        throw new Error("Missing closing parenthesis");
      }
      const result = {
        value: subExprResult.value,
        remainingExpr: subExprResult.remainingExpr.substring(1),
      };
      if (
        result.remainingExpr.length > 0 &&
        (result.remainingExpr[0] === "E" ||
          result.remainingExpr.startsWith("TE"))
      ) {
        const eResult = Parser.#parseENotation(
          result.value,
          result.remainingExpr,
          options,
        );
        let factorialResult3 = eResult;
        if (
          factorialResult3.remainingExpr.length > 1 &&
          factorialResult3.remainingExpr.substring(0, 2) === "!!"
        ) {
          if (factorialResult3.value instanceof Integer) {
            factorialResult3 = {
              value: factorialResult3.value.doubleFactorial(),
              remainingExpr: factorialResult3.remainingExpr.substring(2),
            };
          } else if (
            factorialResult3.value instanceof Rational &&
            factorialResult3.value.denominator === 1n
          ) {
            const intValue = new Integer(factorialResult3.value.numerator);
            factorialResult3 = {
              value: intValue.doubleFactorial().toRational(),
              remainingExpr: factorialResult3.remainingExpr.substring(2),
            };
          } else if (
            factorialResult3.value.low &&
            factorialResult3.value.high &&
            factorialResult3.value.low.equals(factorialResult3.value.high) &&
            factorialResult3.value.low.denominator === 1n
          ) {
            const intValue = new Integer(factorialResult3.value.low.numerator);
            const factorialValue = intValue.doubleFactorial();
            const IntervalClass = factorialResult3.value.constructor;
            factorialResult3 = {
              value: new IntervalClass(
                factorialValue.toRational(),
                factorialValue.toRational(),
              ),
              remainingExpr: factorialResult3.remainingExpr.substring(2),
            };
          } else {
            throw new Error(
              "Double factorial is not defined for negative integers",
            );
          }
        } else if (
          factorialResult3.remainingExpr.length > 0 &&
          factorialResult3.remainingExpr[0] === "!"
        ) {
          if (factorialResult3.value instanceof Integer) {
            factorialResult3 = {
              value: factorialResult3.value.factorial(),
              remainingExpr: factorialResult3.remainingExpr.substring(1),
            };
          } else if (
            factorialResult3.value instanceof Rational &&
            factorialResult3.value.denominator === 1n
          ) {
            const intValue = new Integer(factorialResult3.value.numerator);
            factorialResult3 = {
              value: intValue.factorial().toRational(),
              remainingExpr: factorialResult3.remainingExpr.substring(1),
            };
          } else if (
            factorialResult3.value.low &&
            factorialResult3.value.high &&
            factorialResult3.value.low.equals(factorialResult3.value.high) &&
            factorialResult3.value.low.denominator === 1n
          ) {
            const intValue = new Integer(factorialResult3.value.low.numerator);
            const factorialValue = intValue.factorial();
            const IntervalClass = factorialResult3.value.constructor;
            factorialResult3 = {
              value: new IntervalClass(
                factorialValue.toRational(),
                factorialValue.toRational(),
              ),
              remainingExpr: factorialResult3.remainingExpr.substring(1),
            };
          } else {
            throw new Error("Factorial is not defined for negative integers");
          }
        }
        if (factorialResult3.remainingExpr.length > 0) {
          if (factorialResult3.remainingExpr[0] === "^") {
            const powerExpr = factorialResult3.remainingExpr.substring(1);
            const powerResult = Parser.#parseExponent(powerExpr);
            const zero = new Rational(0);
            if (factorialResult3.value.low && factorialResult3.value.high) {
              if (
                factorialResult3.value.low.equals(zero) &&
                factorialResult3.value.high.equals(zero) &&
                powerResult.value === 0n
              ) {
                throw new Error("Zero cannot be raised to the power of zero");
              }
            } else if (
              factorialResult3.value instanceof Integer &&
              factorialResult3.value.value === 0n &&
              powerResult.value === 0n
            ) {
              throw new Error("Zero cannot be raised to the power of zero");
            } else if (
              factorialResult3.value instanceof Rational &&
              factorialResult3.value.numerator === 0n &&
              powerResult.value === 0n
            ) {
              throw new Error("Zero cannot be raised to the power of zero");
            }
            return {
              value: factorialResult3.value.pow(powerResult.value),
              remainingExpr: powerResult.remainingExpr,
            };
          } else if (
            factorialResult3.remainingExpr.length > 1 &&
            factorialResult3.remainingExpr[0] === "*" &&
            factorialResult3.remainingExpr[1] === "*"
          ) {
            const powerExpr = factorialResult3.remainingExpr.substring(2);
            const powerResult = Parser.#parseExponent(powerExpr);
            let base = factorialResult3.value;
            if (!(base instanceof RationalInterval)) {
              base = RationalInterval.point(
                base instanceof Integer ? base.toRational() : base,
              );
            }
            const result2 = base.mpow(powerResult.value);
            result2._skipPromotion = true;
            return {
              value: result2,
              remainingExpr: powerResult.remainingExpr,
            };
          }
        }
        return factorialResult3;
      }
      let factorialResult2 = result;
      if (
        factorialResult2.remainingExpr.length > 1 &&
        factorialResult2.remainingExpr.substring(0, 2) === "!!"
      ) {
        if (factorialResult2.value instanceof Integer) {
          factorialResult2 = {
            value: factorialResult2.value.doubleFactorial(),
            remainingExpr: factorialResult2.remainingExpr.substring(2),
          };
        } else if (
          factorialResult2.value instanceof Rational &&
          factorialResult2.value.denominator === 1n
        ) {
          const intValue = new Integer(factorialResult2.value.numerator);
          factorialResult2 = {
            value: intValue.doubleFactorial().toRational(),
            remainingExpr: factorialResult2.remainingExpr.substring(2),
          };
        } else if (
          factorialResult2.value.low &&
          factorialResult2.value.high &&
          factorialResult2.value.low.equals(factorialResult2.value.high) &&
          factorialResult2.value.low.denominator === 1n
        ) {
          const intValue = new Integer(factorialResult2.value.low.numerator);
          const factorialValue = intValue.doubleFactorial();
          const IntervalClass = factorialResult2.value.constructor;
          factorialResult2 = {
            value: new IntervalClass(
              factorialValue.toRational(),
              factorialValue.toRational(),
            ),
            remainingExpr: factorialResult2.remainingExpr.substring(2),
          };
        } else {
          throw new Error(
            "Double factorial is not defined for negative integers",
          );
        }
      } else if (
        factorialResult2.remainingExpr.length > 0 &&
        factorialResult2.remainingExpr[0] === "!"
      ) {
        if (factorialResult2.value instanceof Integer) {
          factorialResult2 = {
            value: factorialResult2.value.factorial(),
            remainingExpr: factorialResult2.remainingExpr.substring(1),
          };
        } else if (
          factorialResult2.value instanceof Rational &&
          factorialResult2.value.denominator === 1n
        ) {
          const intValue = new Integer(factorialResult2.value.numerator);
          factorialResult2 = {
            value: intValue.factorial().toRational(),
            remainingExpr: factorialResult2.remainingExpr.substring(1),
          };
        } else if (
          factorialResult2.value.low &&
          factorialResult2.value.high &&
          factorialResult2.value.low.equals(factorialResult2.value.high) &&
          factorialResult2.value.low.denominator === 1n
        ) {
          const intValue = new Integer(factorialResult2.value.low.numerator);
          const factorialValue = intValue.factorial();
          const IntervalClass = factorialResult2.value.constructor;
          factorialResult2 = {
            value: new IntervalClass(
              factorialValue.toRational(),
              factorialValue.toRational(),
            ),
            remainingExpr: factorialResult2.remainingExpr.substring(1),
          };
        } else {
          throw new Error("Factorial is not defined for negative integers");
        }
      }
      if (factorialResult2.remainingExpr.length > 0) {
        if (factorialResult2.remainingExpr[0] === "^") {
          const powerExpr = factorialResult2.remainingExpr.substring(1);
          const powerResult = Parser.#parseExponent(powerExpr);
          const zero = new Rational(0);
          let isZero = false;
          if (factorialResult2.value instanceof RationalInterval) {
            isZero =
              factorialResult2.value.low.equals(zero) &&
              factorialResult2.value.high.equals(zero);
          } else if (factorialResult2.value instanceof Rational) {
            isZero = factorialResult2.value.equals(zero);
          } else if (factorialResult2.value instanceof Integer) {
            isZero = factorialResult2.value.value === 0n;
          }
          if (isZero && powerResult.value === 0n) {
            throw new Error("Zero cannot be raised to the power of zero");
          }
          return {
            value: factorialResult2.value.pow(powerResult.value),
            remainingExpr: powerResult.remainingExpr,
          };
        } else if (
          factorialResult2.remainingExpr.length > 1 &&
          factorialResult2.remainingExpr[0] === "*" &&
          factorialResult2.remainingExpr[1] === "*"
        ) {
          const powerExpr = factorialResult2.remainingExpr.substring(2);
          const powerResult = Parser.#parseExponent(powerExpr);
          let base = factorialResult2.value;
          if (!(base instanceof RationalInterval)) {
            base = RationalInterval.point(
              base instanceof Integer ? base.toRational() : base,
            );
          }
          const result2 = base.mpow(powerResult.value);
          result2._skipPromotion = true;
          return {
            value: result2,
            remainingExpr: powerResult.remainingExpr,
          };
        }
      }
      return factorialResult2;
    }
    if (expr.includes("[") && expr.includes("]")) {
      const uncertaintyMatch = expr.match(/^(-?\d*\.?\d*)\[([^\]]+)\]/);
      if (uncertaintyMatch) {
        const fullMatch = uncertaintyMatch[0];
        try {
          const result = parseDecimalUncertainty(fullMatch, true);
          return {
            value: result,
            remainingExpr: expr.substring(fullMatch.length),
          };
        } catch (error) {
          throw error;
        }
      }
    }
    if (expr[0] === "-" && !expr.includes("[")) {
      const factorResult = Parser.#parseFactor(expr.substring(1), options);
      let negatedValue;
      if (options.typeAware && factorResult.value instanceof Integer) {
        negatedValue = factorResult.value.negate();
      } else if (options.typeAware && factorResult.value instanceof Rational) {
        negatedValue = factorResult.value.negate();
        if (factorResult.value._explicitFraction) {
          negatedValue._explicitFraction = true;
        }
      } else {
        const negOne = new Rational(-1);
        const negInterval = RationalInterval.point(negOne);
        negatedValue = negInterval.multiply(factorResult.value);
      }
      return {
        value: negatedValue,
        remainingExpr: factorResult.remainingExpr,
      };
    }
    const numberResult = Parser.#parseInterval(expr, options);
    if (
      numberResult.remainingExpr.length > 0 &&
      (numberResult.remainingExpr[0] === "E" ||
        numberResult.remainingExpr.startsWith("TE"))
    ) {
      const eResult = Parser.#parseENotation(
        numberResult.value,
        numberResult.remainingExpr,
        options,
      );
      let factorialResult2 = eResult;
      if (
        factorialResult2.remainingExpr.length > 1 &&
        factorialResult2.remainingExpr.substring(0, 2) === "!!"
      ) {
        if (factorialResult2.value instanceof Integer) {
          factorialResult2 = {
            value: factorialResult2.value.doubleFactorial(),
            remainingExpr: factorialResult2.remainingExpr.substring(2),
          };
        } else if (
          factorialResult2.value instanceof Rational &&
          factorialResult2.value.denominator === 1n
        ) {
          const intValue = new Integer(factorialResult2.value.numerator);
          factorialResult2 = {
            value: intValue.doubleFactorial().toRational(),
            remainingExpr: factorialResult2.remainingExpr.substring(2),
          };
        } else if (
          factorialResult2.value.low &&
          factorialResult2.value.high &&
          factorialResult2.value.low.equals(factorialResult2.value.high) &&
          factorialResult2.value.low.denominator === 1n
        ) {
          const intValue = new Integer(factorialResult2.value.low.numerator);
          const factorialValue = intValue.doubleFactorial();
          const IntervalClass = factorialResult2.value.constructor;
          factorialResult2 = {
            value: new IntervalClass(
              factorialValue.toRational(),
              factorialValue.toRational(),
            ),
            remainingExpr: factorialResult2.remainingExpr.substring(2),
          };
        } else {
          throw new Error(
            "Double factorial is not defined for negative integers",
          );
        }
      } else if (
        factorialResult2.remainingExpr.length > 0 &&
        factorialResult2.remainingExpr[0] === "!"
      ) {
        if (factorialResult2.value instanceof Integer) {
          factorialResult2 = {
            value: factorialResult2.value.factorial(),
            remainingExpr: factorialResult2.remainingExpr.substring(1),
          };
        } else if (
          factorialResult2.value instanceof Rational &&
          factorialResult2.value.denominator === 1n
        ) {
          const intValue = new Integer(factorialResult2.value.numerator);
          factorialResult2 = {
            value: intValue.factorial().toRational(),
            remainingExpr: factorialResult2.remainingExpr.substring(1),
          };
        } else if (
          factorialResult2.value.low &&
          factorialResult2.value.high &&
          factorialResult2.value.low.equals(factorialResult2.value.high) &&
          factorialResult2.value.low.denominator === 1n
        ) {
          const intValue = new Integer(factorialResult2.value.low.numerator);
          const factorialValue = intValue.factorial();
          const IntervalClass = factorialResult2.value.constructor;
          factorialResult2 = {
            value: new IntervalClass(
              factorialValue.toRational(),
              factorialValue.toRational(),
            ),
            remainingExpr: factorialResult2.remainingExpr.substring(1),
          };
        } else {
          throw new Error("Factorial is not defined for negative integers");
        }
      }
      if (factorialResult2.remainingExpr.length > 0) {
        if (factorialResult2.remainingExpr[0] === "^") {
          const powerExpr = factorialResult2.remainingExpr.substring(1);
          const powerResult = Parser.#parseExponent(powerExpr);
          if (
            factorialResult2.value instanceof Integer &&
            factorialResult2.value.value === 0n &&
            powerResult.value === 0n
          ) {
            throw new Error("Zero cannot be raised to the power of zero");
          } else if (
            factorialResult2.value instanceof Rational &&
            factorialResult2.value.numerator === 0n &&
            powerResult.value === 0n
          ) {
            throw new Error("Zero cannot be raised to the power of zero");
          } else if (
            factorialResult2.value.low &&
            factorialResult2.value.high
          ) {
            const zero = new Rational(0);
            if (
              factorialResult2.value.low.equals(zero) &&
              factorialResult2.value.high.equals(zero) &&
              powerResult.value === 0n
            ) {
              throw new Error("Zero cannot be raised to the power of zero");
            }
          }
          const result = factorialResult2.value.pow(powerResult.value);
          return {
            value: result,
            remainingExpr: powerResult.remainingExpr,
          };
        } else if (
          factorialResult2.remainingExpr.length > 1 &&
          factorialResult2.remainingExpr[0] === "*" &&
          factorialResult2.remainingExpr[1] === "*"
        ) {
          const powerExpr = factorialResult2.remainingExpr.substring(2);
          const powerResult = Parser.#parseExponent(powerExpr);
          let base = factorialResult2.value;
          if (!(base instanceof RationalInterval)) {
            base = RationalInterval.point(
              base instanceof Integer ? base.toRational() : base,
            );
          }
          const result = base.mpow(powerResult.value);
          result._skipPromotion = true;
          return {
            value: result,
            remainingExpr: powerResult.remainingExpr,
          };
        }
      }
      return factorialResult2;
    }
    let factorialResult = numberResult;
    if (
      factorialResult.remainingExpr.length > 1 &&
      factorialResult.remainingExpr.substring(0, 2) === "!!"
    ) {
      if (factorialResult.value instanceof Integer) {
        factorialResult = {
          value: factorialResult.value.doubleFactorial(),
          remainingExpr: factorialResult.remainingExpr.substring(2),
        };
      } else if (
        factorialResult.value instanceof Rational &&
        factorialResult.value.denominator === 1n
      ) {
        const intValue = new Integer(factorialResult.value.numerator);
        factorialResult = {
          value: intValue.doubleFactorial().toRational(),
          remainingExpr: factorialResult.remainingExpr.substring(2),
        };
      } else if (
        factorialResult.value.low &&
        factorialResult.value.high &&
        factorialResult.value.low.equals(factorialResult.value.high) &&
        factorialResult.value.low.denominator === 1n
      ) {
        const intValue = new Integer(factorialResult.value.low.numerator);
        const factorialValue = intValue.doubleFactorial();
        const IntervalClass = factorialResult.value.constructor;
        factorialResult = {
          value: new IntervalClass(
            factorialValue.toRational(),
            factorialValue.toRational(),
          ),
          remainingExpr: factorialResult.remainingExpr.substring(2),
        };
      } else {
        throw new Error(
          "Double factorial is not defined for negative integers",
        );
      }
    } else if (
      factorialResult.remainingExpr.length > 0 &&
      factorialResult.remainingExpr[0] === "!"
    ) {
      if (factorialResult.value instanceof Integer) {
        factorialResult = {
          value: factorialResult.value.factorial(),
          remainingExpr: factorialResult.remainingExpr.substring(1),
        };
      } else if (
        factorialResult.value instanceof Rational &&
        factorialResult.value.denominator === 1n
      ) {
        const intValue = new Integer(factorialResult.value.numerator);
        factorialResult = {
          value: intValue.factorial().toRational(),
          remainingExpr: factorialResult.remainingExpr.substring(1),
        };
      } else if (
        factorialResult.value.low &&
        factorialResult.value.high &&
        factorialResult.value.low.equals(factorialResult.value.high) &&
        factorialResult.value.low.denominator === 1n
      ) {
        const intValue = new Integer(factorialResult.value.low.numerator);
        const factorialValue = intValue.factorial();
        const IntervalClass = factorialResult.value.constructor;
        factorialResult = {
          value: new IntervalClass(
            factorialValue.toRational(),
            factorialValue.toRational(),
          ),
          remainingExpr: factorialResult.remainingExpr.substring(1),
        };
      } else {
        throw new Error("Factorial is not defined for negative integers");
      }
    }
    if (factorialResult.remainingExpr.length > 0) {
      if (factorialResult.remainingExpr[0] === "^") {
        const powerExpr = factorialResult.remainingExpr.substring(1);
        const powerResult = Parser.#parseExponent(powerExpr);
        if (
          factorialResult.value instanceof Integer &&
          factorialResult.value.value === 0n &&
          powerResult.value === 0n
        ) {
          throw new Error("Zero cannot be raised to the power of zero");
        } else if (
          factorialResult.value instanceof Rational &&
          factorialResult.value.numerator === 0n &&
          powerResult.value === 0n
        ) {
          throw new Error("Zero cannot be raised to the power of zero");
        } else if (factorialResult.value.low && factorialResult.value.high) {
          const zero = new Rational(0);
          if (
            factorialResult.value.low.equals(zero) &&
            factorialResult.value.high.equals(zero) &&
            powerResult.value === 0n
          ) {
            throw new Error("Zero cannot be raised to the power of zero");
          }
        }
        const result = factorialResult.value.pow(powerResult.value);
        return {
          value: result,
          remainingExpr: powerResult.remainingExpr,
        };
      } else if (
        factorialResult.remainingExpr.length > 1 &&
        factorialResult.remainingExpr[0] === "*" &&
        factorialResult.remainingExpr[1] === "*"
      ) {
        const powerExpr = factorialResult.remainingExpr.substring(2);
        const powerResult = Parser.#parseExponent(powerExpr);
        let base = factorialResult.value;
        if (!(base instanceof RationalInterval)) {
          base = RationalInterval.point(
            base instanceof Integer ? base.toRational() : base,
          );
        }
        const result = base.mpow(powerResult.value);
        result._skipPromotion = true;
        return {
          value: result,
          remainingExpr: powerResult.remainingExpr,
        };
      }
    }
    return factorialResult;
  }
  static #parseExponent(expr) {
    let i = 0;
    let isNegative = false;
    if (expr.length > 0 && expr[0] === "-") {
      isNegative = true;
      i++;
    }
    let exponentStr = "";
    while (i < expr.length && /\d/.test(expr[i])) {
      exponentStr += expr[i];
      i++;
    }
    if (exponentStr.length === 0) {
      throw new Error("Invalid exponent");
    }
    const exponent = isNegative ? -BigInt(exponentStr) : BigInt(exponentStr);
    return {
      value: exponent,
      remainingExpr: expr.substring(i),
    };
  }
  static #promoteType(value, options = {}) {
    if (!options.typeAware) {
      return value;
    }
    if (value && value._skipPromotion) {
      return value;
    }
    if (value instanceof RationalInterval && value.low.equals(value.high)) {
      if (value._explicitInterval) {
        return value;
      }
      if (value.low.denominator === 1n) {
        return new Integer(value.low.numerator);
      } else {
        return value.low;
      }
    }
    if (value instanceof Rational && value.denominator === 1n) {
      if (value._explicitFraction) {
        return value;
      }
      return new Integer(value.numerator);
    }
    return value;
  }
  static #parseENotation(value, expr, options = {}) {
    let spaceBeforeE = false;
    let startIndex = 1;
    if (expr.startsWith("TE")) {
      spaceBeforeE = true;
      startIndex = 2;
    } else if (expr[0] === "E") {
      spaceBeforeE = false;
      startIndex = 1;
    } else {
      throw new Error("Expected E notation");
    }
    const exponentResult = Parser.#parseExponent(expr.substring(startIndex));
    const exponent = exponentResult.value;
    let result;
    if (value.E && typeof value.E === "function") {
      result = value.E(exponent);
    } else {
      let powerOf10;
      if (exponent >= 0n) {
        powerOf10 = new Rational(10n ** exponent);
      } else {
        powerOf10 = new Rational(1n, 10n ** -exponent);
      }
      result = value.multiply(powerOf10);
    }
    return {
      value: Parser.#promoteType(result, options),
      remainingExpr: exponentResult.remainingExpr,
    };
  }
  static #parseInterval(expr, options = {}) {
    if (
      expr.includes("[") &&
      expr.includes("]") &&
      /^-?\d*\.?\d*\[/.test(expr)
    ) {
      try {
        const result = parseDecimalUncertainty(expr);
        return {
          value: result,
          remainingExpr: "",
        };
      } catch {}
    }
    if (
      expr.includes(".") &&
      !expr.includes("#") &&
      !expr.includes(":") &&
      !expr.includes("[")
    ) {
      let endIndex = 0;
      let hasDecimalPoint = false;
      if (expr[endIndex] === "-") {
        endIndex++;
      }
      while (endIndex < expr.length) {
        if (/\d/.test(expr[endIndex])) {
          endIndex++;
        } else if (
          expr[endIndex] === "." &&
          !hasDecimalPoint &&
          endIndex + 1 < expr.length &&
          expr[endIndex + 1] !== "."
        ) {
          hasDecimalPoint = true;
          endIndex++;
        } else {
          break;
        }
      }
      if (hasDecimalPoint && endIndex > (expr[0] === "-" ? 2 : 1)) {
        const decimalStr = expr.substring(0, endIndex);
        try {
          if (options.typeAware) {
            const result = new Rational(decimalStr);
            return {
              value: result,
              remainingExpr: expr.substring(endIndex),
            };
          } else {
            const isNegative = decimalStr.startsWith("-");
            const absDecimalStr = isNegative
              ? decimalStr.substring(1)
              : decimalStr;
            const result = parseNonRepeatingDecimal(absDecimalStr, isNegative);
            return {
              value: result,
              remainingExpr: expr.substring(endIndex),
            };
          }
        } catch (error) {}
      }
    }
    if (expr.includes("#") && expr.includes(":") && /^-?[\d.]/.test(expr)) {
      const colonIndex = expr.indexOf(":");
      if (colonIndex > 0) {
        const beforeColon = expr.substring(0, colonIndex);
        const afterColonStart = expr.substring(colonIndex + 1);
        if (
          /^-?[\d.#]+$/.test(beforeColon) &&
          /^-?[\d.#]/.test(afterColonStart)
        ) {
          try {
            const possibleInterval = parseRepeatingDecimal(expr);
            if (possibleInterval instanceof RationalInterval) {
              let endIndex = expr.length;
              for (let i = 1; i < expr.length; i++) {
                const testExpr = expr.substring(0, i);
                try {
                  const testResult = parseRepeatingDecimal(testExpr);
                  if (testResult instanceof RationalInterval) {
                    if (i === expr.length || !/[\d#.\-]/.test(expr[i])) {
                      endIndex = i;
                      const finalResult = parseRepeatingDecimal(
                        expr.substring(0, endIndex),
                      );
                      if (finalResult instanceof RationalInterval) {
                        return {
                          value: finalResult,
                          remainingExpr: expr.substring(endIndex),
                        };
                      }
                    }
                  }
                } catch {}
              }
              try {
                const result = parseRepeatingDecimal(expr);
                if (result instanceof RationalInterval) {
                  return {
                    value: result,
                    remainingExpr: "",
                  };
                }
              } catch {}
            }
          } catch {}
        }
      }
    }
    const firstResult = Parser.#parseRational(expr);
    let firstValue = firstResult.value;
    let remainingAfterFirst = firstResult.remainingExpr;
    if (remainingAfterFirst.length > 0 && remainingAfterFirst[0] === "E") {
      let eEndIndex = 1;
      if (
        eEndIndex < remainingAfterFirst.length &&
        remainingAfterFirst[eEndIndex] === "-"
      ) {
        eEndIndex++;
      }
      while (
        eEndIndex < remainingAfterFirst.length &&
        /\d/.test(remainingAfterFirst[eEndIndex])
      ) {
        eEndIndex++;
      }
      if (
        eEndIndex < remainingAfterFirst.length &&
        remainingAfterFirst[eEndIndex] === ":"
      ) {
        const eNotationPart = remainingAfterFirst.substring(0, eEndIndex);
        const firstInterval = RationalInterval.point(firstResult.value);
        const eResult = Parser.#parseENotation(
          firstInterval,
          eNotationPart,
          options,
        );
        if (eResult.value instanceof RationalInterval) {
          firstValue = eResult.value.low;
        } else if (eResult.value instanceof Rational) {
          firstValue = eResult.value;
        } else if (eResult.value instanceof Integer) {
          firstValue = eResult.value.toRational();
        } else {
          firstValue = eResult.value;
        }
        remainingAfterFirst = remainingAfterFirst.substring(eEndIndex);
      }
    }
    if (remainingAfterFirst.length === 0 || remainingAfterFirst[0] !== ":") {
      if (options.typeAware) {
        if (firstValue instanceof Rational && firstValue.denominator === 1n) {
          if (firstValue._explicitFraction) {
            return {
              value: firstValue,
              remainingExpr: remainingAfterFirst,
            };
          }
          return {
            value: new Integer(firstValue.numerator),
            remainingExpr: remainingAfterFirst,
          };
        }
        return {
          value: firstValue,
          remainingExpr: remainingAfterFirst,
        };
      } else {
        const pointValue = RationalInterval.point(firstValue);
        return {
          value: pointValue,
          remainingExpr: remainingAfterFirst,
        };
      }
    }
    const secondRationalExpr = remainingAfterFirst.substring(1);
    const secondResult = Parser.#parseRational(secondRationalExpr);
    let secondValue = secondResult.value;
    let remainingExpr = secondResult.remainingExpr;
    if (remainingExpr.length > 0 && remainingExpr[0] === "E") {
      const secondInterval = RationalInterval.point(secondResult.value);
      const eResult = Parser.#parseENotation(
        secondInterval,
        remainingExpr,
        options,
      );
      if (eResult.value instanceof RationalInterval) {
        secondValue = eResult.value.low;
      } else if (eResult.value instanceof Rational) {
        secondValue = eResult.value;
      } else if (eResult.value instanceof Integer) {
        secondValue = eResult.value.toRational();
      } else {
        secondValue = eResult.value;
      }
      remainingExpr = eResult.remainingExpr;
    }
    const interval = new RationalInterval(firstValue, secondValue);
    interval._explicitInterval = true;
    return {
      value: interval,
      remainingExpr,
    };
  }
  static #parseRational(expr) {
    if (expr.length === 0) {
      throw new Error("Unexpected end of expression");
    }
    let hashIndex = expr.indexOf("#");
    if (hashIndex !== -1) {
      const beforeHash = expr.substring(0, hashIndex);
      if (/^-?(\d+\.?\d*|\.\d+)$/.test(beforeHash)) {
        let endIndex = hashIndex + 1;
        while (endIndex < expr.length && /\d/.test(expr[endIndex])) {
          endIndex++;
        }
        const repeatingDecimalStr = expr.substring(0, endIndex);
        try {
          const result = parseRepeatingDecimal(repeatingDecimalStr);
          if (result instanceof RationalInterval) {
            const midpoint = result.low
              .add(result.high)
              .divide(new Rational(2));
            return {
              value: midpoint,
              remainingExpr: expr.substring(endIndex),
            };
          } else {
            return {
              value: result,
              remainingExpr: expr.substring(endIndex),
            };
          }
        } catch (error) {
          throw new Error(`Invalid repeating decimal: ${error.message}`);
        }
      }
    }
    let decimalIndex = expr.indexOf(".");
    if (
      decimalIndex !== -1 &&
      decimalIndex + 1 < expr.length &&
      expr[decimalIndex + 1] !== "."
    ) {
      let endIndex = 0;
      let hasDecimalPoint = false;
      if (expr[endIndex] === "-") {
        endIndex++;
      }
      while (endIndex < expr.length) {
        if (/\d/.test(expr[endIndex])) {
          endIndex++;
        } else if (
          expr[endIndex] === "." &&
          !hasDecimalPoint &&
          endIndex + 1 < expr.length &&
          expr[endIndex + 1] !== "."
        ) {
          hasDecimalPoint = true;
          endIndex++;
        } else {
          break;
        }
      }
      if (hasDecimalPoint && endIndex > (expr[0] === "-" ? 2 : 1)) {
        const decimalStr = expr.substring(0, endIndex);
        try {
          const result = new Rational(decimalStr);
          return {
            value: result,
            remainingExpr: expr.substring(endIndex),
          };
        } catch (error) {}
      }
    }
    let i = 0;
    let numeratorStr = "";
    let denominatorStr = "";
    let isNegative = false;
    let wholePart = 0n;
    let hasMixedForm = false;
    if (expr[i] === "-") {
      isNegative = true;
      i++;
    }
    while (i < expr.length && /\d/.test(expr[i])) {
      numeratorStr += expr[i];
      i++;
    }
    if (numeratorStr.length === 0) {
      throw new Error("Invalid rational number format");
    }
    if (i + 1 < expr.length && expr[i] === "." && expr[i + 1] === ".") {
      hasMixedForm = true;
      wholePart = isNegative ? -BigInt(numeratorStr) : BigInt(numeratorStr);
      isNegative = false;
      i += 2;
      numeratorStr = "";
      while (i < expr.length && /\d/.test(expr[i])) {
        numeratorStr += expr[i];
        i++;
      }
      if (numeratorStr.length === 0) {
        throw new Error(
          'Invalid mixed number format: missing numerator after ".."',
        );
      }
    }
    let explicitFraction = false;
    if (i < expr.length && expr[i] === "/") {
      explicitFraction = true;
      i++;
      if (i < expr.length && expr[i] === "S") {
        if (hasMixedForm) {
          throw new Error("Invalid mixed number format: missing denominator");
        }
        const numerator2 = isNegative
          ? -BigInt(numeratorStr)
          : BigInt(numeratorStr);
        return {
          value: new Rational(numerator2, 1n),
          remainingExpr: expr.substring(i - 1),
        };
      }
      if (i < expr.length && expr[i] === "(") {
        if (hasMixedForm) {
          throw new Error("Invalid mixed number format: missing denominator");
        }
        const numerator2 = isNegative
          ? -BigInt(numeratorStr)
          : BigInt(numeratorStr);
        return {
          value: new Rational(numerator2, 1n),
          remainingExpr: expr.substring(i - 1),
        };
      }
      while (i < expr.length && /\d/.test(expr[i])) {
        denominatorStr += expr[i];
        i++;
      }
      if (denominatorStr.length === 0) {
        throw new Error("Invalid rational number format");
      }
      if (i < expr.length && expr[i] === "E") {
        throw new Error(
          "E notation not allowed directly after fraction without parentheses",
        );
      }
    } else {
      if (hasMixedForm) {
        throw new Error("Invalid mixed number format: missing denominator");
      }
      denominatorStr = "1";
    }
    if (hasMixedForm && i < expr.length && expr[i] === "E") {
      throw new Error(
        "E notation not allowed directly after mixed number without parentheses",
      );
    }
    let numerator, denominator;
    if (hasMixedForm) {
      numerator = BigInt(numeratorStr);
      denominator = BigInt(denominatorStr);
      const sign = wholePart < 0n ? -1n : 1n;
      numerator =
        sign *
        ((wholePart.valueOf() < 0n ? -wholePart : wholePart) * denominator +
          numerator);
    } else {
      numerator = isNegative ? -BigInt(numeratorStr) : BigInt(numeratorStr);
      denominator = BigInt(denominatorStr);
    }
    if (denominator === 0n) {
      throw new Error("Denominator cannot be zero");
    }
    const rational = new Rational(numerator, denominator);
    if (explicitFraction && denominator === 1n) {
      rational._explicitFraction = true;
    }
    return {
      value: rational,
      remainingExpr: expr.substring(i),
    };
  }
}

// src/fraction.js
class Fraction {
  #numerator;
  #denominator;
  constructor(numerator, denominator = 1n) {
    if (typeof numerator === "string") {
      const parts = numerator.trim().split("/");
      if (parts.length === 1) {
        this.#numerator = BigInt(parts[0]);
        this.#denominator = BigInt(denominator);
      } else if (parts.length === 2) {
        this.#numerator = BigInt(parts[0]);
        this.#denominator = BigInt(parts[1]);
      } else {
        throw new Error("Invalid fraction format. Use 'a/b' or 'a'");
      }
    } else {
      this.#numerator = BigInt(numerator);
      this.#denominator = BigInt(denominator);
    }
    if (this.#denominator === 0n) {
      throw new Error("Denominator cannot be zero");
    }
  }
  get numerator() {
    return this.#numerator;
  }
  get denominator() {
    return this.#denominator;
  }
  add(other) {
    if (this.#denominator !== other.denominator) {
      throw new Error("Addition only supported for equal denominators");
    }
    return new Fraction(this.#numerator + other.numerator, this.#denominator);
  }
  subtract(other) {
    if (this.#denominator !== other.denominator) {
      throw new Error("Subtraction only supported for equal denominators");
    }
    return new Fraction(this.#numerator - other.numerator, this.#denominator);
  }
  multiply(other) {
    return new Fraction(
      this.#numerator * other.numerator,
      this.#denominator * other.denominator,
    );
  }
  divide(other) {
    if (other.numerator === 0n) {
      throw new Error("Division by zero");
    }
    return new Fraction(
      this.#numerator * other.denominator,
      this.#denominator * other.numerator,
    );
  }
  pow(exponent) {
    const n = BigInt(exponent);
    if (n === 0n) {
      if (this.#numerator === 0n) {
        throw new Error("Zero cannot be raised to the power of zero");
      }
      return new Fraction(1, 1);
    }
    if (this.#numerator === 0n && n < 0n) {
      throw new Error("Zero cannot be raised to a negative power");
    }
    if (n < 0n) {
      return new Fraction(this.#denominator ** -n, this.#numerator ** -n);
    }
    return new Fraction(this.#numerator ** n, this.#denominator ** n);
  }
  scale(factor) {
    const scaleFactor = BigInt(factor);
    return new Fraction(
      this.#numerator * scaleFactor,
      this.#denominator * scaleFactor,
    );
  }
  static #gcd(a, b) {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    while (b !== 0n) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }
  reduce() {
    if (this.#numerator === 0n) {
      return new Fraction(0, 1);
    }
    const gcd = Fraction.#gcd(this.#numerator, this.#denominator);
    const reducedNum = this.#numerator / gcd;
    const reducedDen = this.#denominator / gcd;
    if (reducedDen < 0n) {
      return new Fraction(-reducedNum, -reducedDen);
    }
    return new Fraction(reducedNum, reducedDen);
  }
  static mediant(a, b) {
    return new Fraction(
      a.numerator + b.numerator,
      a.denominator + b.denominator,
    );
  }
  toRational() {
    return new Rational(this.#numerator, this.#denominator);
  }
  static fromRational(rational) {
    return new Fraction(rational.numerator, rational.denominator);
  }
  toString() {
    if (this.#denominator === 1n) {
      return this.#numerator.toString();
    }
    return `${this.#numerator}/${this.#denominator}`;
  }
  equals(other) {
    return (
      this.#numerator === other.numerator &&
      this.#denominator === other.denominator
    );
  }
  lessThan(other) {
    const leftSide = this.#numerator * other.denominator;
    const rightSide = this.#denominator * other.numerator;
    return leftSide < rightSide;
  }
  lessThanOrEqual(other) {
    const leftSide = this.#numerator * other.denominator;
    const rightSide = this.#denominator * other.numerator;
    return leftSide <= rightSide;
  }
  greaterThan(other) {
    const leftSide = this.#numerator * other.denominator;
    const rightSide = this.#denominator * other.numerator;
    return leftSide > rightSide;
  }
  greaterThanOrEqual(other) {
    const leftSide = this.#numerator * other.denominator;
    const rightSide = this.#denominator * other.numerator;
    return leftSide >= rightSide;
  }
  E(exponent) {
    const exp = BigInt(exponent);
    if (exp >= 0n) {
      const newNumerator = this.#numerator * 10n ** exp;
      return new Fraction(newNumerator, this.#denominator);
    } else {
      const newDenominator = this.#denominator * 10n ** -exp;
      return new Fraction(this.#numerator, newDenominator);
    }
  }
}

// src/fraction-interval.js
class FractionInterval {
  #low;
  #high;
  constructor(a, b) {
    if (!(a instanceof Fraction) || !(b instanceof Fraction)) {
      throw new Error("FractionInterval endpoints must be Fraction objects");
    }
    if (a.lessThanOrEqual(b)) {
      this.#low = a;
      this.#high = b;
    } else {
      this.#low = b;
      this.#high = a;
    }
  }
  get low() {
    return this.#low;
  }
  get high() {
    return this.#high;
  }
  mediantSplit() {
    const mediant = Fraction.mediant(this.#low, this.#high);
    return [
      new FractionInterval(this.#low, mediant),
      new FractionInterval(mediant, this.#high),
    ];
  }
  partitionWithMediants(n = 1) {
    if (n < 0) {
      throw new Error("Depth of mediant partitioning must be non-negative");
    }
    if (n === 0) {
      return [this];
    }
    let intervals = [this];
    for (let level = 0; level < n; level++) {
      const newIntervals = [];
      for (const interval of intervals) {
        const splitIntervals = interval.mediantSplit();
        newIntervals.push(...splitIntervals);
      }
      intervals = newIntervals;
    }
    return intervals;
  }
  partitionWith(fn) {
    const partitionPoints = fn(this.#low, this.#high);
    if (!Array.isArray(partitionPoints)) {
      throw new Error("Partition function must return an array of Fractions");
    }
    for (const point of partitionPoints) {
      if (!(point instanceof Fraction)) {
        throw new Error("Partition function must return Fraction objects");
      }
    }
    const allPoints = [this.#low, ...partitionPoints, this.#high];
    allPoints.sort((a, b) => {
      if (a.equals(b)) return 0;
      if (a.lessThan(b)) return -1;
      return 1;
    });
    if (
      !allPoints[0].equals(this.#low) ||
      !allPoints[allPoints.length - 1].equals(this.#high)
    ) {
      throw new Error("Partition points should be within the interval");
    }
    const uniquePoints = [];
    for (let i = 0; i < allPoints.length; i++) {
      if (i === 0 || !allPoints[i].equals(allPoints[i - 1])) {
        uniquePoints.push(allPoints[i]);
      }
    }
    const intervals = [];
    for (let i = 0; i < uniquePoints.length - 1; i++) {
      intervals.push(
        new FractionInterval(uniquePoints[i], uniquePoints[i + 1]),
      );
    }
    return intervals;
  }
  toRationalInterval() {
    return new RationalInterval(
      this.#low.toRational(),
      this.#high.toRational(),
    );
  }
  static fromRationalInterval(interval) {
    return new FractionInterval(
      Fraction.fromRational(interval.low),
      Fraction.fromRational(interval.high),
    );
  }
  toString() {
    return `${this.#low.toString()}:${this.#high.toString()}`;
  }
  equals(other) {
    return this.#low.equals(other.low) && this.#high.equals(other.high);
  }
  E(exponent) {
    const newLow = this.#low.E(exponent);
    const newHigh = this.#high.E(exponent);
    return new FractionInterval(newLow, newHigh);
  }
}

// src/web-calc.js
class WebCalculator {
  constructor() {
    this.outputMode = "BOTH";
    this.decimalLimit = 20;
    this.history = [];
    this.historyIndex = -1;
    this.outputHistory = [];
    this.currentEntry = null;
    this.mobileInput = "";
    this.initializeElements();
    this.setupEventListeners();
    if (!this.isMobile()) {
      this.displayWelcome();
    } else {
      // Initialize mobile display after DOM is ready
      setTimeout(() => {
        this.updateMobileDisplay();
      }, 100);
    }
  }
  initializeElements() {
    this.inputElement = document.getElementById("calculatorInput");
    this.outputHistoryElement = document.getElementById("outputHistory");
    this.helpModal = document.getElementById("helpModal");
    this.copyButton = document.getElementById("copyButton");
    this.helpButton = document.getElementById("helpButton");
    this.clearButton = document.getElementById("clearButton");
    this.closeHelp = document.getElementById("closeHelp");

    // Mobile keypad elements
    this.mobileKeypad = document.getElementById("mobileKeypad");
    this.keypadGrid = document.getElementById("keypadGrid");
    this.commandPanel = document.getElementById("commandPanel");
    this.closeCommandPanel = document.getElementById("closeCommandPanel");

    // Add debug info
    this.addDebugInfo();
  }
  setupEventListeners() {
    this.inputElement.addEventListener("keydown", (e) => this.handleKeyDown(e));
    this.copyButton.addEventListener("click", () => this.copySession());
    this.helpButton.addEventListener("click", () => this.showHelp());
    this.clearButton.addEventListener("click", () => this.clearHistory());
    this.closeHelp.addEventListener("click", () => this.hideHelp());
    this.helpModal.addEventListener("click", (e) => {
      if (e.target === this.helpModal) {
        this.hideHelp();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideHelp();
        if (this.isMobile()) {
          this.hideCommandPanel();
        }
      }
    });

    // Add resize listener for debug
    window.addEventListener("resize", () => {
      this.updateDebugInfo();
      if (this.isMobile() && !this.mobileKeypad.classList.contains("show")) {
        this.setupMobileKeypad();
      }
    });
    if (!this.isMobile()) {
      setTimeout(() => this.inputElement.focus(), 100);
    }
    if (this.isMobile()) {
      this.inputElement.setAttribute("inputmode", "none");
      this.inputElement.setAttribute("autocomplete", "off");
      this.inputElement.setAttribute("autocorrect", "off");
      this.inputElement.setAttribute("autocapitalize", "off");
      this.inputElement.setAttribute("spellcheck", "false");
      this.setupMobileKeypad();
    }
  }
  isMobile() {
    // For easier debugging, using screen width only
    const isMobile = window.innerWidth <= 768;
    this.updateDebugInfo();
    return isMobile;
  }
  handleKeyDown(e) {
    switch (e.key) {
      case "Enter":
        this.processInput();
        break;
      case "ArrowUp":
        e.preventDefault();
        this.navigateHistory(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        this.navigateHistory(1);
        break;
    }
  }
  navigateHistory(direction) {
    if (this.history.length === 0) return;
    if (direction === -1) {
      if (this.historyIndex === -1) {
        this.historyIndex = this.history.length - 1;
      } else if (this.historyIndex > 0) {
        this.historyIndex--;
      }
    } else {
      if (this.historyIndex === -1) return;
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
      } else {
        this.historyIndex = -1;
        this.inputElement.value = "";
        return;
      }
    }
    this.inputElement.value = this.history[this.historyIndex];
    setTimeout(() => {
      this.inputElement.setSelectionRange(
        this.inputElement.value.length,
        this.inputElement.value.length,
      );
    }, 0);
  }
  processInput() {
    // On mobile, use the mobileInput instead of input element
    if (this.isMobile()) {
      const mobileInputValue = this.mobileInput.trim();
      if (!mobileInputValue) return;
      this.processExpression(mobileInputValue);
      this.mobileInput = "";
      this.updateMobileDisplay();
      // Ensure scroll after processing
      requestAnimationFrame(() => {
        this.scrollToBottom();
      });
      return;
    }

    // Desktop behavior
    const input = this.inputElement.value.trim();
    if (!input) {
      this.inputElement.focus();
      return;
    }
    this.processExpression(input);
  }

  processExpression(input) {
    if (
      this.history.length === 0 ||
      this.history[this.history.length - 1] !== input
    ) {
      this.history.push(input);
    }
    this.historyIndex = -1;
    this.currentEntry = { input, output: "", isError: false };

    // On mobile, clear the input display before adding to output
    if (this.isMobile()) {
      this.mobileInput = "";
      this.updateMobileDisplay();
      requestAnimationFrame(() => {
        this.scrollToBottom();
      });
    }

    this.addToOutput(input, null, false);
    const upperInput = input.toUpperCase();
    if (upperInput === "HELP") {
      this.showHelp();
      this.inputElement.value = "";
      this.currentEntry = null;
      return;
    }
    if (upperInput === "CLEAR") {
      this.clearHistory();
      this.inputElement.value = "";
      this.currentEntry = null;
      return;
    }
    if (upperInput === "DECI") {
      this.outputMode = "DECI";
      const output = "Output mode set to decimal";
      this.addToOutput("", output, false);
      this.finishEntry(output);
      this.inputElement.value = "";
      return;
    }
    if (upperInput === "RAT") {
      this.outputMode = "RAT";
      const output = "Output mode set to rational";
      this.addToOutput("", output, false);
      this.finishEntry(output);
      this.inputElement.value = "";
      return;
    }
    if (upperInput === "BOTH") {
      this.outputMode = "BOTH";
      const output = "Output mode set to both decimal and rational";
      this.addToOutput("", output, false);
      this.finishEntry(output);
      this.inputElement.value = "";
      return;
    }
    if (upperInput.startsWith("LIMIT")) {
      const limitStr = upperInput.substring(5).trim();
      let output;
      if (limitStr === "") {
        output = `Current decimal display limit: ${this.decimalLimit} digits`;
        this.addToOutput("", output, false);
      } else {
        const limit = parseInt(limitStr);
        if (isNaN(limit) || limit < 1) {
          output = "Error: LIMIT must be a positive integer";
          this.addToOutput("", output, true);
          this.currentEntry.isError = true;
        } else {
          this.decimalLimit = limit;
          output = `Decimal display limit set to ${limit} digits`;
          this.addToOutput("", output, false);
        }
      }
      this.finishEntry(output);
      this.inputElement.value = "";
      return;
    }
    try {
      const hasExactDecimal = input.includes("#") || input.includes("#0");
      const hasFraction = input.includes("/");
      const hasDecimalPoint = input.includes(".");
      const isSimpleInteger = /^\s*-?\d+\s*$/.test(input);
      const hasPlainDecimal =
        hasDecimalPoint && !hasExactDecimal && !hasFraction;
      const result = Parser.parse(input, {
        typeAware:
          hasExactDecimal || hasFraction || isSimpleInteger || !hasPlainDecimal,
      });
      const output = this.formatResult(result);
      this.addToOutput("", output, false);
      this.finishEntry(output);
    } catch (error) {
      let errorMessage;
      if (
        error.message.includes("Division by zero") ||
        error.message.includes("Denominator cannot be zero")
      ) {
        errorMessage = "Error: Division by zero is undefined";
      } else if (
        error.message.includes("Factorial") &&
        error.message.includes("negative")
      ) {
        errorMessage = "Error: Factorial is not defined for negative numbers";
      } else if (
        error.message.includes("Zero cannot be raised to the power of zero")
      ) {
        errorMessage = "Error: 0^0 is undefined";
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      this.addToOutput("", errorMessage, true);
      this.currentEntry.isError = true;
      this.finishEntry(errorMessage);
    }
    this.inputElement.value = "";
    if (!this.isMobile()) {
      setTimeout(() => this.inputElement.focus(), 50);
    }
  }

  reloadExpression(expression) {
    if (this.isMobile()) {
      this.mobileInput = expression;
      this.updateMobileDisplay();
      // Don't execute, just populate the input
    } else {
      this.inputElement.value = expression;
      this.inputElement.focus();
      this.inputElement.setSelectionRange(expression.length, expression.length);
    }
  }

  injectValue(value) {
    if (this.isMobile()) {
      this.mobileInput = (this.mobileInput || "") + value;
      this.updateMobileDisplay();
    } else {
      this.insertAtCursor(value);
    }
  }

  extractValue(outputText) {
    // Extract numeric value or expression from output
    // Handle different formats: "5/4 (1.25)", "1.25", "5/4", etc.
    const match = outputText.match(/^([^(]+?)(?:\s*\(|$)/);
    if (match) {
      return match[1].trim();
    }
    return outputText.trim();
  }

  updateMobileDisplay() {
    if (this.isMobile()) {
      // Show current input in a temporary div at bottom of output
      let tempDiv = document.getElementById("mobileInputDisplay");

      // Always show the prompt when on mobile
      if (!tempDiv) {
        tempDiv = document.createElement("div");
        tempDiv.id = "mobileInputDisplay";
        tempDiv.style.cssText = `
          padding: 10px 15px;
          background: #e8f4f8;
          border-top: 2px solid #2563eb;
          position: fixed;
          bottom: auto;
          top: 50vh;
          left: 0;
          right: 0;
          font-weight: 600;
          color: #2563eb;
          z-index: 150;
          transform: translateY(-100%);
          font-family: inherit;
          font-size: 1rem;
        `;
        document.body.appendChild(tempDiv);
      }

      // Update the content
      tempDiv.innerHTML = `<span style="color: #059669; font-weight: bold;">></span> ${this.escapeHtml(this.mobileInput || "")}`;

      // Ensure visibility when keypad is visible
      if (document.body.classList.contains("keypad-visible")) {
        tempDiv.style.display = "block";
        // Always scroll to bottom when updating mobile display
        requestAnimationFrame(() => {
          this.scrollToBottom();
        });
      } else {
        tempDiv.style.display = "none";
      }
    }
  }

  finishEntry(output) {
    if (this.currentEntry) {
      this.currentEntry.output = output;
      this.outputHistory.push(this.currentEntry);
      this.currentEntry = null;
    }
  }
  formatResult(result) {
    if (result instanceof RationalInterval) {
      return this.formatInterval(result);
    } else if (result instanceof Rational) {
      return this.formatRational(result);
    } else if (result instanceof Integer) {
      return this.formatInteger(result);
    } else {
      return result.toString();
    }
  }
  formatInteger(integer) {
    return integer.value.toString();
  }
  formatRational(rational) {
    const repeatingInfo = rational.toRepeatingDecimalWithPeriod();
    const repeatingDecimal = repeatingInfo.decimal;
    const period = repeatingInfo.period;
    const decimal = this.formatDecimal(rational);
    const fraction = rational.toString();
    const isTerminatingDecimal = repeatingDecimal.endsWith("#0");
    const displayDecimal = isTerminatingDecimal
      ? repeatingDecimal
      : this.formatRepeatingDecimal(rational);
    const periodInfo = period > 0 ? ` {period: ${period}}` : "";
    switch (this.outputMode) {
      case "DECI":
        return `${displayDecimal}${periodInfo}`;
      case "RAT":
        return fraction;
      case "BOTH":
        if (fraction.includes("/")) {
          return `${displayDecimal}${periodInfo} (${fraction})`;
        } else {
          return decimal;
        }
      default:
        return fraction;
    }
  }
  formatDecimal(rational) {
    const decimal = rational.toDecimal();
    if (decimal.length > this.decimalLimit + 2) {
      const dotIndex = decimal.indexOf(".");
      if (
        dotIndex !== -1 &&
        decimal.length - dotIndex - 1 > this.decimalLimit
      ) {
        return decimal.substring(0, dotIndex + this.decimalLimit + 1) + "...";
      }
    }
    return decimal;
  }
  formatRepeatingDecimal(rational) {
    const repeatingDecimal = rational.toRepeatingDecimal();
    if (!repeatingDecimal.includes("#")) {
      return repeatingDecimal;
    }
    if (repeatingDecimal.endsWith("#0")) {
      const withoutRepeating = repeatingDecimal.substring(
        0,
        repeatingDecimal.length - 2,
      );
      if (withoutRepeating.length > this.decimalLimit + 2) {
        const dotIndex = withoutRepeating.indexOf(".");
        if (
          dotIndex !== -1 &&
          withoutRepeating.length - dotIndex - 1 > this.decimalLimit
        ) {
          return (
            withoutRepeating.substring(0, dotIndex + this.decimalLimit + 1) +
            "..."
          );
        }
      }
      return withoutRepeating;
    }
    if (repeatingDecimal.length > this.decimalLimit + 2) {
      const hashIndex = repeatingDecimal.indexOf("#");
      const beforeHash = repeatingDecimal.substring(0, hashIndex);
      const afterHash = repeatingDecimal.substring(hashIndex + 1);
      if (beforeHash.length > this.decimalLimit + 1) {
        return beforeHash.substring(0, this.decimalLimit + 1) + "...";
      }
      const remainingSpace = this.decimalLimit + 2 - beforeHash.length;
      if (remainingSpace <= 1) {
        return beforeHash + "#...";
      } else if (afterHash.length > remainingSpace - 1) {
        return (
          beforeHash + "#" + afterHash.substring(0, remainingSpace - 1) + "..."
        );
      }
    }
    return repeatingDecimal;
  }
  formatInterval(interval) {
    const lowRepeatingInfo = interval.low.toRepeatingDecimalWithPeriod();
    const highRepeatingInfo = interval.high.toRepeatingDecimalWithPeriod();
    const lowRepeating = lowRepeatingInfo.decimal;
    const highRepeating = highRepeatingInfo.decimal;
    const lowPeriod = lowRepeatingInfo.period;
    const highPeriod = highRepeatingInfo.period;
    const lowDecimal = this.formatDecimal(interval.low);
    const highDecimal = this.formatDecimal(interval.high);
    const lowFraction = interval.low.toString();
    const highFraction = interval.high.toString();
    const lowIsTerminating = lowRepeating.endsWith("#0");
    const highIsTerminating = highRepeating.endsWith("#0");
    const lowDisplay = lowIsTerminating
      ? lowRepeating.substring(0, lowRepeating.length - 2)
      : this.formatRepeatingDecimal(interval.low);
    const highDisplay = highIsTerminating
      ? highRepeating.substring(0, highRepeating.length - 2)
      : this.formatRepeatingDecimal(interval.high);
    let periodInfo = "";
    if (lowPeriod > 0 || highPeriod > 0) {
      const periodParts = [];
      if (lowPeriod > 0) periodParts.push(`low: ${lowPeriod}`);
      if (highPeriod > 0) periodParts.push(`high: ${highPeriod}`);
      periodInfo = ` {period: ${periodParts.join(", ")}}`;
    }
    switch (this.outputMode) {
      case "DECI":
        return `${lowDisplay}:${highDisplay}${periodInfo}`;
      case "RAT":
        return `${lowFraction}:${highFraction}`;
      case "BOTH":
        const decimalRange = `${lowDisplay}:${highDisplay}${periodInfo}`;
        const rationalRange = `${lowFraction}:${highFraction}`;
        if (decimalRange !== rationalRange) {
          return `${decimalRange} (${rationalRange})`;
        } else {
          return decimalRange;
        }
      default:
        return `${lowFraction}:${highFraction}`;
    }
  }
  addToOutput(input, output, isError = false) {
    const entry = document.createElement("div");
    entry.className = "output-entry";
    if (input) {
      const inputLine = document.createElement("div");
      inputLine.className = "input-line";
      inputLine.innerHTML = `<span class="prompt">></span><span>${this.escapeHtml(input)}</span><span class="reload-icon" title="Reload expression">↻</span>`;

      // Add click handler for reload
      inputLine.addEventListener("click", (e) => {
        if (
          e.target.classList.contains("reload-icon") ||
          e.currentTarget === inputLine
        ) {
          e.stopPropagation();
          this.reloadExpression(input);
        }
      });

      entry.appendChild(inputLine);
    }
    if (output) {
      const outputLine = document.createElement("div");
      outputLine.className = isError ? "error-line" : "output-line";

      if (!isError) {
        outputLine.innerHTML = `${this.escapeHtml(output)}<span class="inject-icon" title="Inject value">→</span>`;

        // Add click handler for inject
        outputLine.addEventListener("click", (e) => {
          if (
            e.target.classList.contains("inject-icon") ||
            e.currentTarget === outputLine
          ) {
            e.stopPropagation();
            const value = this.extractValue(output);
            this.injectValue(value);
          }
        });
      } else {
        outputLine.textContent = output;
      }

      entry.appendChild(outputLine);
    }
    this.outputHistoryElement.appendChild(entry);
    // Use requestAnimationFrame to ensure DOM updates are complete
    requestAnimationFrame(() => {
      this.scrollToBottom();
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      this.outputHistoryElement.scrollTop =
        this.outputHistoryElement.scrollHeight;

      // For mobile, ensure scroll happens when keyboard is shown
      if (
        this.isMobile() &&
        document.body.classList.contains("keypad-visible")
      ) {
        // Double-check scroll after keyboard animation
        setTimeout(() => {
          this.outputHistoryElement.scrollTop =
            this.outputHistoryElement.scrollHeight;
        }, 300);
      }
    }, 10);
  }
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  displayWelcome() {
    if (!this.isMobile()) {
      const welcome = document.createElement("div");
      welcome.className = "output-entry";
      welcome.innerHTML = `
        <div class="output-line" style="color: #059669; font-weight: 600;">
          Welcome to Ratmath Calculator!
        </div>
        <div class="output-line" style="margin-top: 0.5rem;">
          Type mathematical expressions and press Enter to calculate.
        </div>
        <div class="output-line">
          Use the Help button or type HELP for detailed instructions.
        </div>
      `;
      this.outputHistoryElement.appendChild(welcome);
    }
  }
  showHelp() {
    this.helpModal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
  hideHelp() {
    this.helpModal.style.display = "none";
    document.body.style.overflow = "auto";
    if (!this.isMobile()) {
      setTimeout(() => this.inputElement.focus(), 100);
    }
  }
  clearHistory() {
    this.outputHistoryElement.innerHTML = "";
    this.outputHistory = [];
    this.currentEntry = null;
    if (!this.isMobile()) {
      this.displayWelcome();
      setTimeout(() => this.inputElement.focus(), 100);
    }
  }
  async copySession() {
    if (this.outputHistory.length === 0) {
      const originalText = this.copyButton.textContent;
      this.copyButton.textContent = "Nothing to copy";
      this.copyButton.style.background = "rgba(251, 146, 60, 0.9)";
      this.copyButton.style.color = "white";
      setTimeout(() => {
        this.copyButton.textContent = originalText;
        this.copyButton.style.background = "";
        this.copyButton.style.color = "";
        if (!this.isMobile()) {
          this.inputElement.focus();
        }
      }, 2000);
      return;
    }
    let text = `Ratmath Calculator Session
`;
    text +=
      "=".repeat(30) +
      `

`;
    for (const entry of this.outputHistory) {
      if (entry.input) {
        text += `> ${entry.input}
`;
        if (entry.output) {
          text += `${entry.output}
`;
        }
        text += `
`;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      const originalText = this.copyButton.textContent;
      this.copyButton.textContent = "✓ Copied!";
      this.copyButton.style.background = "rgba(34, 197, 94, 0.9)";
      this.copyButton.style.color = "white";
      setTimeout(() => {
        this.copyButton.textContent = originalText;
        this.copyButton.style.background = "";
        this.copyButton.style.color = "";
      }, 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      if (this.isMobile()) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        try {
          document.execCommand("copy");
          const originalText = this.copyButton.textContent;
          this.copyButton.textContent = "✓ Copied!";
          this.copyButton.style.background = "rgba(34, 197, 94, 0.9)";
          this.copyButton.style.color = "white";
          setTimeout(() => {
            this.copyButton.textContent = originalText;
            this.copyButton.style.background = "";
            this.copyButton.style.color = "";
          }, 2000);
        } catch (fallbackError) {
          alert(text);
        }
        document.body.removeChild(textarea);
      } else {
        const newWindow = window.open("", "_blank");
        newWindow.document.write(`<pre>${text}</pre>`);
        newWindow.document.title = "Ratmath Calculator Session";
      }
    }
  }
  setupMobileKeypad() {
    // Check if already setup to prevent duplicate listeners
    if (this.mobileKeypadSetup) {
      // Just show the keypad and update display
      this.mobileKeypad.classList.add("show");
      document.body.classList.add("keypad-visible");
      this.updateMobileDisplay();
      this.scrollToBottom();
      return;
    }
    this.mobileKeypadSetup = true;

    // Show keypad by default on mobile
    this.mobileKeypad.classList.add("show");
    document.body.classList.add("keypad-visible");
    this.updateDebugInfo();

    // Show the input prompt immediately
    setTimeout(() => {
      this.updateMobileDisplay();
      this.scrollToBottom();
    }, 50);

    // Setup keypad buttons
    const keypadButtons = document.querySelectorAll(".keypad-btn[data-key]");
    keypadButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const key = button.getAttribute("data-key");
        this.insertAtCursor(key);
        // Don't focus input on mobile to prevent native keyboard
      });
    });

    // Setup action buttons
    const actionButtons = document.querySelectorAll(".keypad-btn[data-action]");
    actionButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const action = button.getAttribute("data-action");
        if (action === "backspace") {
          this.handleBackspace();
        } else if (action === "clear") {
          if (this.isMobile()) {
            this.mobileInput = "";
            this.updateMobileDisplay();
          } else {
            this.inputElement.value = "";
            this.inputElement.focus();
          }
        } else if (action === "enter") {
          this.processInput();
        } else if (action === "help") {
          this.showHelp();
        } else if (action === "command") {
          this.showCommandPanel();
        }
      });
    });

    // Setup command panel
    this.closeCommandPanel.addEventListener("click", () => {
      this.hideCommandPanel();
    });

    // Setup command buttons
    const cmdButtons = document.querySelectorAll(".command-btn");
    cmdButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const cmd = button.getAttribute("data-command");
        if (this.isMobile()) {
          this.mobileInput = cmd;
          this.hideCommandPanel();
          if (cmd !== "LIMIT ") {
            this.processExpression(cmd);
            this.mobileInput = "";
          } else {
            this.updateMobileDisplay();
          }
        } else {
          this.inputElement.value = cmd;
          this.hideCommandPanel();
          if (cmd !== "LIMIT ") {
            this.processInput();
          } else {
            this.inputElement.focus();
            this.inputElement.setSelectionRange(6, 6);
          }
        }
      });
    });

    // Prevent keyboard from showing on input focus when keypad is active
    this.inputElement.addEventListener("focus", (e) => {
      if (this.isMobile() && this.mobileKeypad.classList.contains("show")) {
        // Prevent native keyboard by blurring immediately
        e.preventDefault();
        this.inputElement.blur();
      }
    });

    // Handle click on input to show cursor position
    this.inputElement.addEventListener("click", (e) => {
      if (this.isMobile() && this.inputElement.readOnly) {
        // Allow cursor positioning even when readonly
        const rect = this.inputElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const charWidth = 8; // Approximate character width
        const position = Math.round(x / charWidth);
        const maxPosition = this.inputElement.value.length;
        const newPosition = Math.min(Math.max(0, position), maxPosition);
        this.inputElement.setSelectionRange(newPosition, newPosition);
      }
    });
  }

  showCommandPanel() {
    this.commandPanel.classList.add("show");
  }

  hideCommandPanel() {
    this.commandPanel.classList.remove("show");
  }

  insertAtCursor(text) {
    if (this.isMobile()) {
      this.mobileInput = (this.mobileInput || "") + text;
      this.updateMobileDisplay();
    } else {
      const input = this.inputElement;
      const startPos = input.selectionStart || 0;
      const endPos = input.selectionEnd || 0;
      const currentValue = input.value;

      input.value =
        currentValue.substring(0, startPos) +
        text +
        currentValue.substring(endPos);

      // Set cursor position after the inserted text
      const newPos = startPos + text.length;
      input.setSelectionRange(newPos, newPos);
      input.focus();
    }
    this.updateDebugInfo();
  }

  addDebugInfo() {
    if (window.location.hash === "#debug") {
      const debugDiv = document.createElement("div");
      debugDiv.id = "debugInfo";
      debugDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        font-size: 12px;
        font-family: monospace;
        z-index: 9999;
        border-radius: 4px;
        max-width: 200px;
      `;
      document.body.appendChild(debugDiv);
      this.debugDiv = debugDiv;
      this.updateDebugInfo();
    }
  }

  updateDebugInfo() {
    if (this.debugDiv) {
      const info = [
        `Width: ${window.innerWidth}px`,
        `Height: ${window.innerHeight}px`,
        `Mobile: ${window.innerWidth <= 768 ? "YES" : "NO"}`,
        `Keypad: ${this.mobileKeypad && this.mobileKeypad.classList.contains("show") ? "SHOWN" : "HIDDEN"}`,
        `Body Class: ${document.body.classList.contains("keypad-visible") ? "keypad-visible" : "none"}`,
        `Touch: ${"ontouchstart" in window ? "YES" : "NO"}`,
      ];
      this.debugDiv.innerHTML = info.join("<br>");
    }
  }

  handleBackspace() {
    if (this.isMobile()) {
      if (this.mobileInput.length > 0) {
        this.mobileInput = this.mobileInput.slice(0, -1);
        this.updateMobileDisplay();
      }
    } else {
      const input = this.inputElement;
      const startPos = input.selectionStart || 0;
      const endPos = input.selectionEnd || 0;
      const currentValue = input.value;

      if (startPos !== endPos) {
        // Delete selected text
        input.value =
          currentValue.substring(0, startPos) + currentValue.substring(endPos);
        input.setSelectionRange(startPos, startPos);
      } else if (startPos > 0) {
        // Delete character before cursor
        input.value =
          currentValue.substring(0, startPos - 1) +
          currentValue.substring(startPos);
        input.setSelectionRange(startPos - 1, startPos - 1);
      }
      input.focus();
    }
  }

  showCommandPanel() {
    this.commandPanel.classList.add("show");
  }

  hideCommandPanel() {
    this.commandPanel.classList.remove("show");
  }
}
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    new WebCalculator();
  });
}
export { WebCalculator };

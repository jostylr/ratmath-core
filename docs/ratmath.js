// src/base-system.js
class BaseSystem {
  #base;
  #characters;
  #charMap;
  #name;
  static RESERVED_SYMBOLS = new Set([
    "+",
    "-",
    "*",
    "/",
    "^",
    "!",
    "(",
    ")",
    "[",
    "]",
    ":",
    ".",
    "#",
    "~"
  ]);
  constructor(characterSequence, name) {
    this.#characters = this.#parseCharacterSequence(characterSequence);
    this.#base = this.#characters.length;
    this.#charMap = this.#createCharacterMap();
    this.#name = name || `Base ${this.#base}`;
    this.#validateBase();
    this.#checkForConflicts();
  }
  get base() {
    return this.#base;
  }
  get characters() {
    return [...this.#characters];
  }
  get charMap() {
    return new Map(this.#charMap);
  }
  getChar(value) {
    const i = Number(value);
    if (i < 0 || i >= this.#characters.length) {
      throw new Error(`Value ${value} is out of range for base ${this.#base}`);
    }
    return this.#characters[i];
  }
  get name() {
    return this.#name;
  }
  #parseCharacterSequence(sequence) {
    if (typeof sequence !== "string" || sequence.length === 0) {
      throw new Error("Character sequence must be a non-empty string");
    }
    const characters = [];
    let i = 0;
    while (i < sequence.length) {
      if (i + 2 < sequence.length && sequence[i + 1] === "-") {
        const startChar = sequence[i];
        const endChar = sequence[i + 2];
        const startCode = startChar.charCodeAt(0);
        const endCode = endChar.charCodeAt(0);
        if (startCode > endCode) {
          throw new Error(`Invalid range: '${startChar}-${endChar}'. Start character must come before end character.`);
        }
        for (let code = startCode;code <= endCode; code++) {
          characters.push(String.fromCharCode(code));
        }
        i += 3;
      } else {
        characters.push(sequence[i]);
        i++;
      }
    }
    const uniqueChars = new Set(characters);
    if (uniqueChars.size !== characters.length) {
      throw new Error("Character sequence contains duplicate characters");
    }
    if (characters.length < 2) {
      throw new Error("Base system must have at least 2 characters");
    }
    return characters;
  }
  #createCharacterMap() {
    const map = new Map;
    for (let i = 0;i < this.#characters.length; i++) {
      map.set(this.#characters[i], i);
    }
    return map;
  }
  #validateBase() {
    if (this.#base < 2) {
      throw new Error("Base must be at least 2");
    }
    if (this.#base !== this.#characters.length) {
      throw new Error(`Base ${this.#base} does not match character set length ${this.#characters.length}`);
    }
    const uniqueChars = new Set(this.#characters);
    if (uniqueChars.size !== this.#characters.length) {
      throw new Error("Character set contains duplicate characters");
    }
    this.#validateCharacterOrdering();
    if (this.#base > 1000) {
      console.warn(`Very large base system (${this.#base}). This may impact performance.`);
    }
  }
  #validateCharacterOrdering() {
    if (this.#name === "Roman Numerals" || this.#characters.length < 10) {
      return;
    }
    const ranges = [
      { start: "0", end: "9", name: "digits" },
      { start: "a", end: "z", name: "lowercase letters" },
      { start: "A", end: "Z", name: "uppercase letters" }
    ];
    for (const range of ranges) {
      const startCode = range.start.charCodeAt(0);
      const endCode = range.end.charCodeAt(0);
      let rangeChars = [];
      for (let i = 0;i < this.#characters.length; i++) {
        const char = this.#characters[i];
        const code = char.charCodeAt(0);
        if (code >= startCode && code <= endCode) {
          rangeChars.push(char);
        }
      }
      if (rangeChars.length >= 5 && rangeChars.length > (endCode - startCode) / 3) {
        for (let i = 1;i < rangeChars.length; i++) {
          const prevCode = rangeChars[i - 1].charCodeAt(0);
          const currCode = rangeChars[i].charCodeAt(0);
          if (currCode !== prevCode + 1) {
            console.warn(`Non-contiguous ${range.name} range detected in base system`);
            break;
          }
        }
      }
    }
  }
  #checkForConflicts() {
    const conflicts = [];
    for (const char of this.#characters) {
      if (BaseSystem.RESERVED_SYMBOLS.has(char)) {
        conflicts.push(char);
      }
    }
    if (conflicts.length > 0) {
      throw new Error(`Base system characters conflict with parser symbols: ${conflicts.join(", ")}. ` + `Reserved symbols are: ${Array.from(BaseSystem.RESERVED_SYMBOLS).join(", ")}`);
    }
  }
  toDecimal(str) {
    if (typeof str !== "string" || str.length === 0) {
      throw new Error("Input must be a non-empty string");
    }
    let negative = false;
    if (str.startsWith("-")) {
      negative = true;
      str = str.slice(1);
    }
    let result = 0n;
    const baseBigInt = BigInt(this.#base);
    for (let i = 0;i < str.length; i++) {
      const char = str[i];
      if (!this.#charMap.has(char)) {
        throw new Error(`Invalid character '${char}' for ${this.#name} (base ${this.#base})`);
      }
      const digitValue = BigInt(this.#charMap.get(char));
      result = result * baseBigInt + digitValue;
    }
    return negative ? -result : result;
  }
  fromDecimal(value) {
    if (typeof value !== "bigint") {
      throw new Error("Value must be a BigInt");
    }
    if (value === 0n) {
      return this.#characters[0];
    }
    let negative = false;
    if (value < 0n) {
      negative = true;
      value = -value;
    }
    const baseBigInt = BigInt(this.#base);
    const digits = [];
    while (value > 0n) {
      const remainder = Number(value % baseBigInt);
      digits.unshift(this.#characters[remainder]);
      value = value / baseBigInt;
    }
    const result = digits.join("");
    return negative ? "-" + result : result;
  }
  isValidString(str) {
    if (typeof str !== "string") {
      return false;
    }
    if (str.startsWith("-")) {
      str = str.slice(1);
    }
    if (str.length === 0) {
      return false;
    }
    for (const char of str) {
      if (!this.#charMap.has(char)) {
        return false;
      }
    }
    return true;
  }
  getMaxDigit() {
    return this.#characters[this.#characters.length - 1];
  }
  getMinDigit() {
    return this.#characters[0];
  }
  toString() {
    const charPreview = this.#characters.length <= 20 ? this.#characters.join("") : this.#characters.slice(0, 10).join("") + "..." + this.#characters.slice(-10).join("");
    return `${this.#name} (${charPreview})`;
  }
  equals(other) {
    if (!(other instanceof BaseSystem)) {
      return false;
    }
    if (this.#base !== other.#base) {
      return false;
    }
    for (let i = 0;i < this.#characters.length; i++) {
      if (this.#characters[i] !== other.#characters[i]) {
        return false;
      }
    }
    return true;
  }
  static fromBase(base, name) {
    if (!Number.isInteger(base) || base < 2) {
      throw new Error("Base must be an integer >= 2");
    }
    let sequence;
    if (base <= 10) {
      sequence = `0-${base - 1}`;
    } else if (base <= 36) {
      const lastLetter = String.fromCharCode(97 + base - 11);
      sequence = `0-9a-${lastLetter}`;
    } else if (base <= 62) {
      const lastLetter = String.fromCharCode(65 + base - 37);
      sequence = `0-9a-zA-${lastLetter}`;
    } else {
      throw new Error("BaseSystem.fromBase() only supports bases up to 62. Use constructor with custom character sequence for larger bases.");
    }
    return new BaseSystem(sequence, name || `Base ${base}`);
  }
  static createPattern(pattern, size, name) {
    switch (pattern.toLowerCase()) {
      case "alphanumeric":
        if (size <= 36) {
          return BaseSystem.fromBase(size, name);
        } else if (size <= 62) {
          return BaseSystem.fromBase(size, name);
        } else {
          throw new Error(`Alphanumeric pattern only supports up to base 62, got ${size}`);
        }
      case "digits-only":
        if (size > 10) {
          throw new Error(`Digits-only pattern only supports up to base 10, got ${size}`);
        }
        return new BaseSystem(`0-${size - 1}`, name || `Base ${size} (digits only)`);
      case "letters-only":
        if (size <= 26) {
          const lastLetter2 = String.fromCharCode(97 + size - 1);
          return new BaseSystem(`a-${lastLetter2}`, name || `Base ${size} (lowercase letters)`);
        } else if (size <= 52) {
          const lastLetter2 = String.fromCharCode(65 + size - 27);
          return new BaseSystem(`a-zA-${lastLetter2}`, name || `Base ${size} (mixed case letters)`);
        } else {
          throw new Error(`Letters-only pattern only supports up to base 52, got ${size}`);
        }
      case "uppercase-only":
        if (size > 26) {
          throw new Error(`Uppercase-only pattern only supports up to base 26, got ${size}`);
        }
        const lastLetter = String.fromCharCode(65 + size - 1);
        return new BaseSystem(`A-${lastLetter}`, name || `Base ${size} (uppercase letters)`);
      default:
        throw new Error(`Unknown pattern: ${pattern}. Supported patterns: alphanumeric, digits-only, letters-only, uppercase-only`);
    }
  }
  withCaseSensitivity(caseSensitive) {
    if (caseSensitive === true) {
      return this;
    }
    if (caseSensitive === false) {
      const lowerChars = this.#characters.map((char) => char.toLowerCase());
      const uniqueLowerChars = [...new Set(lowerChars)];
      if (uniqueLowerChars.length !== lowerChars.length) {
        console.warn("Case-insensitive conversion resulted in duplicate characters");
      }
      return new BaseSystem(uniqueLowerChars.join(""), `${this.#name} (case-insensitive)`);
    }
    throw new Error("caseSensitive must be a boolean value");
  }
}
BaseSystem.BINARY = new BaseSystem("0-1", "Binary");
BaseSystem.OCTAL = new BaseSystem("0-7", "Octal");
BaseSystem.DECIMAL = new BaseSystem("0-9", "Decimal");
BaseSystem.HEXADECIMAL = new BaseSystem("0-9a-f", "Hexadecimal");
BaseSystem.BASE36 = new BaseSystem("0-9a-z", "Base 36");
BaseSystem.BASE62 = new BaseSystem("0-9a-zA-Z", "Base 62");
BaseSystem.BASE60 = new BaseSystem("0-9a-zA-X", "Base 60 (Sexagesimal)");
BaseSystem.ROMAN = new BaseSystem("IVXLCDM", "Roman Numerals");

// src/rational.js
var bitLength = function(int) {
  if (int === 0n)
    return 0;
  return int < 0n ? (-int).toString(2).length : int.toString(2).length;
};

class Rational {
  #numerator;
  #denominator;
  #isNegative;
  #wholePart;
  #remainder;
  #initialSegment;
  #periodDigits;
  #periodLength;
  #isTerminating;
  #factorsOf2;
  #factorsOf5;
  #leadingZerosInPeriod;
  #initialSegmentLeadingZeros;
  #initialSegmentRest;
  #periodDigitsRest;
  #maxPeriodDigitsComputed;
  static DEFAULT_PERIOD_DIGITS = 20;
  static MAX_PERIOD_DIGITS = 1000;
  static MAX_PERIOD_CHECK = 1e7;
  static POWERS_OF_5 = {
    16: 5n ** 16n,
    8: 5n ** 8n,
    4: 5n ** 4n,
    2: 5n ** 2n,
    1: 5n
  };
  static zero = new Rational(0, 1);
  static one = new Rational(1, 1);
  constructor(numerator, denominator = 1n) {
    if (numerator && typeof numerator === "object" && numerator.constructor.name === "Integer") {
      this.#numerator = numerator.value;
      if (denominator && typeof denominator === "object" && denominator.constructor.name === "Integer") {
        this.#denominator = denominator.value;
      } else if (denominator !== undefined) {
        this.#denominator = BigInt(denominator);
      } else {
        this.#denominator = 1n;
      }
      if (this.#denominator === 0n) {
        throw new Error("Denominator cannot be zero");
      }
      this.#normalize();
      this.#isNegative = this.#numerator < 0n;
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
        this.#numerator = isNegative ? -(absWhole * fracDenominator + fracNumerator) : wholePart * fracDenominator + fracNumerator;
        this.#denominator = fracDenominator;
      } else {
        if (numerator.includes(".")) {
          const expandedNumerator = Rational.#parseRepeatedDigits(numerator);
          const decimalParts = expandedNumerator.trim().split(".");
          if (decimalParts.length === 2) {
            const integerPart = decimalParts[0] || "0";
            const fractionalPart = decimalParts[1];
            if (!/^-?\d*$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
              throw new Error("Invalid decimal format");
            }
            const wholePart = BigInt(integerPart);
            const fractionalValue = BigInt(fractionalPart);
            const denomValue = 10n ** BigInt(fractionalPart.length);
            this.#numerator = wholePart * denomValue + (wholePart < 0n ? -fractionalValue : fractionalValue);
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
            throw new Error("Invalid rational format. Use 'a/b', 'a', or 'a..b/c'");
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
    this.#isNegative = this.#numerator < 0n;
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
    const gcd = this.#gcd(this.#numerator < 0n ? -this.#numerator : this.#numerator, this.#denominator);
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
    } else if (other.low && other.high && typeof other.low.equals === "function") {
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
    } else if (other.low && other.high && typeof other.low.equals === "function") {
      const IntervalClass = other.constructor;
      const newThisAsInterval = new IntervalClass(this, this);
      return newThisAsInterval.subtract(other);
    } else {
      throw new Error(`Cannot subtract ${other.constructor.name} from Rational`);
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
    } else if (other.low && other.high && typeof other.low.equals === "function") {
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
    } else if (other.low && other.high && typeof other.low.equals === "function") {
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
    for (let i = n < 0n ? -n : n;i > 0n; i >>= 1n) {
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
    return this.#numerator === other.numerator && this.#denominator === other.denominator;
  }
  compareTo(other) {
    const crossProduct1 = this.#numerator * other.denominator;
    const crossProduct2 = this.#denominator * other.numerator;
    if (crossProduct1 < crossProduct2)
      return -1;
    if (crossProduct1 > crossProduct2)
      return 1;
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
    return this.#numerator < 0n ? this.negate() : new Rational(this.#numerator, this.#denominator);
  }
  toString(base) {
    if (base === undefined) {
      if (this.#denominator === 1n) {
        return this.#numerator.toString();
      }
      return `${this.#numerator}/${this.#denominator}`;
    }
    let baseSystem;
    if (base instanceof BaseSystem) {
      baseSystem = base;
    } else if (typeof base === "number") {
      baseSystem = BaseSystem.fromBase(base);
    } else {
      return this.toString();
    }
    return this.toRepeatingBase(baseSystem);
  }
  toRepeatingBase(baseSystem) {
    if (!(baseSystem instanceof BaseSystem)) {
      throw new Error("Argument must be a BaseSystem");
    }
    if (this.#numerator < 0n) {
      return "-" + this.negate().toRepeatingBase(baseSystem);
    }
    const base = BigInt(baseSystem.base);
    let num = this.#numerator;
    let den = this.#denominator;
    const integerPart = num / den;
    let remainder = num % den;
    let result = baseSystem.fromDecimal(integerPart);
    if (remainder === 0n) {
      return result;
    }
    result += ".";
    const remainders = new Map;
    let fractionParts = [];
    let cycleStartIndex = -1;
    while (remainder !== 0n) {
      if (remainders.has(remainder)) {
        cycleStartIndex = remainders.get(remainder);
        break;
      }
      remainders.set(remainder, fractionParts.length);
      remainder *= base;
      const digit = remainder / den;
      remainder = remainder % den;
      fractionParts.push(baseSystem.getChar(digit));
    }
    if (cycleStartIndex !== -1) {
      const nonRepeating = fractionParts.slice(0, cycleStartIndex).join("");
      const repeating = fractionParts.slice(cycleStartIndex).join("");
      result += nonRepeating + "#" + repeating;
    } else {
      result += fractionParts.join("");
    }
    return result;
  }
  toBase(baseSystem) {
    if (!(baseSystem instanceof BaseSystem)) {
      throw new Error("Argument must be a BaseSystem");
    }
    const numStr = baseSystem.fromDecimal(this.#numerator);
    if (this.#denominator === 1n) {
      return numStr;
    }
    const denStr = baseSystem.fromDecimal(this.#denominator);
    return `${numStr}/${denStr}`;
  }
  toMixedString() {
    if (this.#denominator === 1n || this.#numerator === 0n) {
      return this.#numerator.toString();
    }
    this.#computeWholePart();
    if (this.#remainder === 0n) {
      return this.#isNegative ? `-${this.#wholePart}` : `${this.#wholePart}`;
    }
    if (this.#wholePart === 0n) {
      return this.#isNegative ? `-${this.#remainder}/${this.#denominator}` : `${this.#remainder}/${this.#denominator}`;
    } else {
      return this.#isNegative ? `-${this.#wholePart}..${this.#remainder}/${this.#denominator}` : `${this.#wholePart}..${this.#remainder}/${this.#denominator}`;
    }
  }
  toNumber() {
    return Number(this.#numerator) / Number(this.#denominator);
  }
  toRepeatingDecimal() {
    const result = this.toRepeatingDecimalWithPeriod();
    return result.decimal;
  }
  toRepeatingDecimalWithPeriod(useRepeatNotation = true) {
    if (this.#numerator === 0n) {
      return { decimal: "0", period: 0 };
    }
    this.#computeWholePart();
    const maxDigits = useRepeatNotation ? 100 : Rational.DEFAULT_PERIOD_DIGITS;
    this.#computeDecimalMetadata(maxDigits);
    let result = (this.#isNegative ? "-" : "") + this.#wholePart.toString();
    if (this.#isTerminating) {
      if (this.#initialSegment) {
        const formattedInitial = useRepeatNotation ? Rational.#formatRepeatedDigits(this.#initialSegment, 7) : this.#initialSegment;
        result += "." + formattedInitial + "#0";
      } else {}
      return { decimal: result, period: 0 };
    } else {
      let periodDigits = this.#periodDigits;
      if (this.#periodLength > 0 && this.#periodLength <= Rational.MAX_PERIOD_DIGITS && this.#periodDigits.length < this.#periodLength) {
        periodDigits = this.extractPeriodSegment(this.#initialSegment, this.#periodLength, this.#periodLength);
      }
      const formattedInitial = useRepeatNotation ? Rational.#formatRepeatedDigits(this.#initialSegment, 7) : this.#initialSegment;
      let displayPeriod = periodDigits;
      if (useRepeatNotation && this.#leadingZerosInPeriod < 1000) {
        const significantDigits = this.#periodDigitsRest;
        if (significantDigits && significantDigits.length > 0) {
          const leadingZerosFormatted = this.#leadingZerosInPeriod > 6 ? `{0~${this.#leadingZerosInPeriod}}` : this.#leadingZerosInPeriod > 0 ? "0".repeat(this.#leadingZerosInPeriod) : "";
          const maxSignificantDigits = Math.min(significantDigits.length, 20);
          displayPeriod = leadingZerosFormatted + significantDigits.substring(0, maxSignificantDigits);
        } else {
          displayPeriod = useRepeatNotation ? Rational.#formatRepeatedDigits(periodDigits, 7) : periodDigits;
        }
      } else {
        displayPeriod = useRepeatNotation ? Rational.#formatRepeatedDigits(periodDigits, 7) : periodDigits;
      }
      if (this.#initialSegment) {
        result += "." + formattedInitial + "#" + displayPeriod;
      } else {
        result += ".#" + displayPeriod;
      }
      return {
        decimal: result,
        period: this.#periodLength
      };
    }
  }
  static #countFactorsOf2(n) {
    if (n === 0n)
      return 0;
    let count = 0;
    while ((n & 1n) === 0n) {
      n >>= 1n;
      count++;
    }
    return count;
  }
  static #countFactorsOf5(n) {
    if (n === 0n)
      return 0;
    let count = 0;
    const powers = [
      { exp: 16, value: Rational.POWERS_OF_5["16"] },
      { exp: 8, value: Rational.POWERS_OF_5["8"] },
      { exp: 4, value: Rational.POWERS_OF_5["4"] },
      { exp: 2, value: Rational.POWERS_OF_5["2"] },
      { exp: 1, value: Rational.POWERS_OF_5["1"] }
    ];
    for (const { exp, value } of powers) {
      while (n % value === 0n) {
        n /= value;
        count += exp;
      }
    }
    return count;
  }
  bitLength() {
    const numLen = bitLength(this.#numerator);
    const denLen = bitLength(this.#denominator);
    return Math.max(numLen, denLen);
  }
  #computeWholePart() {
    if (this.#wholePart !== undefined)
      return;
    const absNumerator = this.#numerator < 0n ? -this.#numerator : this.#numerator;
    this.#wholePart = absNumerator / this.#denominator;
    this.#remainder = absNumerator % this.#denominator;
  }
  #computeLeadingZerosInPeriod(reducedDen, initialSegmentLength) {
    let adjustedNumerator = this.#remainder * 10n ** BigInt(initialSegmentLength);
    let leadingZeros = 0;
    while (adjustedNumerator < reducedDen && leadingZeros < Rational.MAX_PERIOD_CHECK) {
      adjustedNumerator *= 10n;
      leadingZeros++;
    }
    return leadingZeros;
  }
  #computeDecimalMetadata(maxPeriodDigits = Rational.DEFAULT_PERIOD_DIGITS) {
    if (this.#periodLength !== undefined && this.#maxPeriodDigitsComputed !== undefined && this.#maxPeriodDigitsComputed >= maxPeriodDigits)
      return;
    this.#computeWholePart();
    if (this.#remainder === 0n) {
      this.#initialSegment = "";
      this.#periodDigits = "";
      this.#periodLength = 0;
      this.#isTerminating = true;
      this.#factorsOf2 = 0;
      this.#factorsOf5 = 0;
      this.#leadingZerosInPeriod = 0;
      this.#initialSegmentLeadingZeros = 0;
      this.#initialSegmentRest = "";
      this.#periodDigitsRest = "";
      this.#maxPeriodDigitsComputed = maxPeriodDigits;
      return;
    }
    this.#factorsOf2 = Rational.#countFactorsOf2(this.#denominator);
    this.#factorsOf5 = Rational.#countFactorsOf5(this.#denominator);
    const initialSegmentLength = Math.max(this.#factorsOf2, this.#factorsOf5);
    let reducedDen = this.#denominator;
    for (let i = 0;i < this.#factorsOf2; i++) {
      reducedDen /= 2n;
    }
    for (let i = 0;i < this.#factorsOf5; i++) {
      reducedDen /= 5n;
    }
    if (reducedDen === 1n) {
      const digits = [];
      let currentRemainder2 = this.#remainder;
      for (let i = 0;i < initialSegmentLength && currentRemainder2 !== 0n; i++) {
        currentRemainder2 *= 10n;
        const digit = currentRemainder2 / this.#denominator;
        digits.push(digit.toString());
        currentRemainder2 = currentRemainder2 % this.#denominator;
      }
      this.#initialSegment = digits.join("");
      this.#periodDigits = "";
      this.#periodLength = 0;
      this.#isTerminating = true;
      this.#leadingZerosInPeriod = 0;
      this.#computeDecimalPartBreakdown();
      this.#maxPeriodDigitsComputed = maxPeriodDigits;
      return;
    }
    let periodLength = 1;
    let remainder = 10n % reducedDen;
    while (remainder !== 1n && periodLength < Rational.MAX_PERIOD_CHECK) {
      periodLength++;
      remainder = remainder * 10n % reducedDen;
    }
    this.#periodLength = periodLength >= Rational.MAX_PERIOD_CHECK ? -1 : periodLength;
    this.#isTerminating = false;
    this.#leadingZerosInPeriod = this.#computeLeadingZerosInPeriod(reducedDen, initialSegmentLength);
    const initialDigits = [];
    let currentRemainder = this.#remainder;
    for (let i = 0;i < initialSegmentLength && currentRemainder !== 0n; i++) {
      currentRemainder *= 10n;
      const digit = currentRemainder / this.#denominator;
      initialDigits.push(digit.toString());
      currentRemainder = currentRemainder % this.#denominator;
    }
    const periodDigitsToCompute = this.#periodLength === -1 ? maxPeriodDigits : this.#periodLength > maxPeriodDigits ? maxPeriodDigits : this.#periodLength;
    const periodDigits = [];
    if (currentRemainder !== 0n) {
      for (let i = 0;i < periodDigitsToCompute; i++) {
        currentRemainder *= 10n;
        const digit = currentRemainder / this.#denominator;
        periodDigits.push(digit.toString());
        currentRemainder = currentRemainder % this.#denominator;
      }
    }
    this.#initialSegment = initialDigits.join("");
    this.#periodDigits = periodDigits.join("");
    this.#computeDecimalPartBreakdown();
    this.#maxPeriodDigitsComputed = maxPeriodDigits;
  }
  #computeDecimalPartBreakdown() {
    let leadingZeros = 0;
    const initialSegment = this.#initialSegment || "";
    for (let i = 0;i < initialSegment.length; i++) {
      if (initialSegment[i] === "0") {
        leadingZeros++;
      } else {
        break;
      }
    }
    this.#initialSegmentLeadingZeros = leadingZeros;
    this.#initialSegmentRest = initialSegment.substring(leadingZeros);
    const periodDigits = this.#periodDigits || "";
    let periodLeadingZeros = 0;
    for (let i = 0;i < periodDigits.length; i++) {
      if (periodDigits[i] === "0") {
        periodLeadingZeros++;
      } else {
        break;
      }
    }
    this.#leadingZerosInPeriod = periodLeadingZeros;
    this.#periodDigitsRest = periodDigits.substring(periodLeadingZeros);
  }
  computeDecimalMetadata(maxPeriodDigits = Rational.DEFAULT_PERIOD_DIGITS) {
    if (this.#numerator === 0n) {
      return {
        initialSegment: "",
        periodDigits: "",
        periodLength: 0,
        isTerminating: true
      };
    }
    this.#computeDecimalMetadata(maxPeriodDigits);
    return {
      wholePart: this.#wholePart,
      initialSegment: this.#initialSegment,
      initialSegmentLeadingZeros: this.#initialSegmentLeadingZeros,
      initialSegmentRest: this.#initialSegmentRest,
      periodDigits: this.#periodDigits,
      periodLength: this.#periodLength,
      leadingZerosInPeriod: this.#leadingZerosInPeriod,
      periodDigitsRest: this.#periodDigitsRest,
      isTerminating: this.#isTerminating
    };
  }
  static #formatRepeatedDigits(digits, threshold = 6) {
    if (!digits || digits.length === 0)
      return digits;
    let result = "";
    let i = 0;
    while (i < digits.length) {
      let currentChar = digits[i];
      let count = 1;
      while (i + count < digits.length && digits[i + count] === currentChar) {
        count++;
      }
      if (count >= threshold) {
        result += `{${currentChar}~${count}}`;
      } else {
        result += currentChar.repeat(count);
      }
      i += count;
    }
    return result;
  }
  static #parseRepeatedDigits(formattedDigits) {
    if (!formattedDigits || !formattedDigits.includes("{")) {
      return formattedDigits;
    }
    return formattedDigits.replace(/\{(.+?)~(\d+)\}/g, (match, digits, count) => {
      return digits.repeat(parseInt(count));
    });
  }
  extractPeriodSegment(initialSegment, periodLength, digitsRequested) {
    if (periodLength === 0 || periodLength === -1) {
      return "";
    }
    const digitsToReturn = Math.min(digitsRequested, periodLength);
    const periodDigits = [];
    let currentRemainder = this.#numerator % this.#denominator;
    const isNegative = this.#numerator < 0n;
    if (isNegative) {
      currentRemainder = -currentRemainder;
    }
    for (let i = 0;i < initialSegment.length; i++) {
      currentRemainder *= 10n;
      currentRemainder = currentRemainder % this.#denominator;
    }
    for (let i = 0;i < digitsToReturn; i++) {
      currentRemainder *= 10n;
      const digit = currentRemainder / this.#denominator;
      periodDigits.push(digit.toString());
      currentRemainder = currentRemainder % this.#denominator;
    }
    return periodDigits.join("");
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
    for (let i = 0;i < maxDigits && remainder !== 0n; i++) {
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
  #generatePeriodInfo(showPeriodInfo) {
    if (!showPeriodInfo || this.#isTerminating) {
      return "";
    }
    const info = [];
    if (this.#initialSegmentLeadingZeros > 0) {
      info.push(`initial: ${this.#initialSegmentLeadingZeros} zeros`);
    }
    if (this.#leadingZerosInPeriod > 0) {
      info.push(`period starts: +${this.#leadingZerosInPeriod} zeros`);
    }
    if (this.#periodLength === -1) {
      info.push("period: >10^7");
    } else if (this.#periodLength > 0) {
      info.push(`period: ${this.#periodLength}`);
    }
    return info.length > 0 ? ` {${info.join(", ")}}` : "";
  }
  toScientificNotation(useRepeatNotation = true, precision = 11, showPeriodInfo = false) {
    if (this.#numerator === 0n) {
      return "0";
    }
    this.#computeWholePart();
    this.#computeDecimalMetadata(100);
    const isNegative = this.#isNegative;
    const prefix = isNegative ? "-" : "";
    if (this.#wholePart > 0n) {
      const wholeStr = this.#wholePart.toString();
      const firstDigit = wholeStr[0];
      const exponent = wholeStr.length - 1;
      let mantissa = firstDigit;
      const hasMoreWholeDigits = wholeStr.length > 1;
      const hasFractionalPart = this.#remainder > 0n;
      if (hasFractionalPart || hasMoreWholeDigits) {
        if (hasFractionalPart && !this.#isTerminating) {
          mantissa += ".";
          const remainingWholeDigits = hasMoreWholeDigits ? wholeStr.substring(1) : "";
          const formattedInitial = useRepeatNotation ? Rational.#formatRepeatedDigits(this.#initialSegment, 7) : this.#initialSegment;
          let periodDigits = this.#periodDigits;
          if (this.#periodLength > 0 && this.#periodLength <= Rational.MAX_PERIOD_DIGITS && periodDigits.length < this.#periodLength) {
            periodDigits = this.extractPeriodSegment(this.#initialSegment, this.#periodLength, Math.min(10, this.#periodLength));
          }
          if (remainingWholeDigits && periodDigits && remainingWholeDigits === periodDigits.substring(0, remainingWholeDigits.length)) {
            mantissa += "#" + periodDigits;
          } else {
            if (hasMoreWholeDigits) {
              mantissa += remainingWholeDigits;
            }
            mantissa += formattedInitial + "#";
            const formattedPeriod = useRepeatNotation ? Rational.#formatRepeatedDigits(periodDigits, 7) : periodDigits.substring(0, Math.max(1, precision - mantissa.length + 1));
            mantissa += formattedPeriod;
          }
        } else {
          if (hasMoreWholeDigits || hasFractionalPart) {
            mantissa += ".";
            if (hasMoreWholeDigits) {
              const remainingDigits = wholeStr.substring(1);
              if (!hasFractionalPart) {
                const trimmedDigits = remainingDigits.replace(/0+$/, "");
                if (trimmedDigits === "") {
                  mantissa = mantissa.slice(0, -1);
                } else {
                  mantissa += trimmedDigits;
                }
              } else {
                mantissa += remainingDigits;
              }
            }
            if (hasFractionalPart) {
              const formattedInitial = useRepeatNotation ? Rational.#formatRepeatedDigits(this.#initialSegment, 7) : this.#initialSegment;
              const trimmedInitial = formattedInitial.replace(/0+$/, "");
              if (trimmedInitial) {
                mantissa += trimmedInitial;
              } else if (!hasMoreWholeDigits) {
                mantissa = mantissa.slice(0, -1);
              }
            }
          }
        }
      } else if (!hasFractionalPart && !hasMoreWholeDigits) {}
      const result = `${prefix}${mantissa}E${exponent}`;
      return result + this.#generatePeriodInfo(showPeriodInfo);
    }
    if (this.#isTerminating) {
      const leadingZeros = this.#initialSegmentLeadingZeros;
      const rest = this.#initialSegmentRest;
      if (rest === "") {
        return prefix + "0";
      }
      const firstDigit = rest[0];
      const exponent = -(leadingZeros + 1);
      let mantissa = firstDigit;
      if (rest.length > 1) {
        const remainingDigits = Math.max(0, precision - 1);
        mantissa += "." + rest.substring(1, remainingDigits + 1);
      }
      return `${prefix}${mantissa}E${exponent}`;
    } else {
      const firstNonZeroInPeriod = this.#periodDigitsRest;
      if (this.#initialSegmentRest !== "") {
        const firstDigit = this.#initialSegmentRest[0];
        const exponent = -(this.#initialSegmentLeadingZeros + 1);
        let mantissa = firstDigit;
        if (this.#initialSegmentRest.length > 1 || this.#periodDigits !== "") {
          mantissa += ".";
          if (this.#initialSegmentRest.length > 1) {
            mantissa += this.#initialSegmentRest.substring(1);
          }
          mantissa += "#";
          if (this.#leadingZerosInPeriod > 0 && useRepeatNotation && this.#leadingZerosInPeriod > 6) {
            mantissa += `{0~${this.#leadingZerosInPeriod}}`;
          } else if (this.#leadingZerosInPeriod > 0) {
            mantissa += "0".repeat(Math.min(this.#leadingZerosInPeriod, 10));
          }
          if (firstNonZeroInPeriod !== "") {
            const remainingLength = Math.max(1, precision - mantissa.length + 1);
            mantissa += firstNonZeroInPeriod.substring(0, remainingLength);
          }
        }
        const result = `${prefix}${mantissa}E${exponent}`;
        return result + this.#generatePeriodInfo(showPeriodInfo);
      } else if (firstNonZeroInPeriod !== "") {
        const firstDigit = firstNonZeroInPeriod[0];
        const totalLeadingZeros = this.#initialSegmentLeadingZeros + this.#leadingZerosInPeriod;
        const exponent = -(totalLeadingZeros + 1);
        let mantissa = firstDigit;
        if (firstNonZeroInPeriod.length > 1) {
          mantissa += ".#";
          const remainingDigits = Math.max(0, precision - 3);
          mantissa += firstNonZeroInPeriod.substring(1, remainingDigits + 1);
        } else {
          mantissa += ".#" + firstDigit;
        }
        const result = `${prefix}${mantissa}E${exponent}`;
        return result + this.#generatePeriodInfo(showPeriodInfo);
      } else {
        return prefix + "0";
      }
    }
  }
  static from(value) {
    if (value instanceof Rational) {
      return new Rational(value.numerator, value.denominator);
    }
    return new Rational(value);
  }
  static DEFAULT_CF_LIMIT = 1000;
  static fromContinuedFraction(cfArray) {
    if (!Array.isArray(cfArray) || cfArray.length === 0) {
      throw new Error("Continued fraction array cannot be empty");
    }
    const cf = cfArray.map((term) => {
      if (typeof term === "number") {
        return BigInt(term);
      } else if (typeof term === "bigint") {
        return term;
      } else {
        throw new Error(`Invalid continued fraction term: ${term}`);
      }
    });
    for (let i = 1;i < cf.length; i++) {
      if (cf[i] <= 0n) {
        throw new Error(`Continued fraction terms must be positive: ${cf[i]}`);
      }
    }
    if (cf.length === 1) {
      return new Rational(cf[0], 1n);
    }
    let p_prev = 1n;
    let p_curr = cf[0];
    let q_prev = 0n;
    let q_curr = 1n;
    const convergents = [new Rational(p_curr, q_curr)];
    for (let i = 1;i < cf.length; i++) {
      const a = cf[i];
      const p_next = a * p_curr + p_prev;
      const q_next = a * q_curr + q_prev;
      convergents.push(new Rational(p_next, q_next));
      p_prev = p_curr;
      p_curr = p_next;
      q_prev = q_curr;
      q_curr = q_next;
    }
    const result = convergents[convergents.length - 1];
    result.cf = cf.slice(1);
    result._convergents = convergents;
    result.wholePart = cf[0];
    return result;
  }
  toContinuedFraction(maxTerms = Rational.DEFAULT_CF_LIMIT) {
    if (this.#denominator === 0n) {
      throw new Error("Cannot convert infinite value to continued fraction");
    }
    if (this.#denominator === 1n) {
      return [this.#numerator];
    }
    const cf = [];
    let num = this.#numerator;
    let den = this.#denominator;
    const isNeg = num < 0n;
    if (isNeg) {
      num = -num;
    }
    let intPart = num / den;
    if (isNeg) {
      intPart = -intPart;
      if (num % den !== 0n) {
        intPart = intPart - 1n;
        num = den - num % den;
      } else {
        num = num % den;
      }
    } else {
      num = num % den;
    }
    cf.push(intPart);
    let termCount = 1;
    while (num !== 0n && termCount < maxTerms) {
      const quotient = den / num;
      cf.push(quotient);
      const remainder = den % num;
      den = num;
      num = remainder;
      termCount++;
    }
    if (cf.length > 1 && cf[cf.length - 1] === 1n) {
      const secondLast = cf[cf.length - 2];
      cf[cf.length - 2] = secondLast + 1n;
      cf.pop();
    }
    this.cf = cf.slice(1);
    if (!this.wholePart) {
      this.wholePart = cf[0];
    }
    return cf;
  }
  toContinuedFractionString() {
    const cf = this.toContinuedFraction();
    if (cf.length === 1) {
      return `${cf[0]}.~0`;
    }
    const intPart = cf[0];
    const cfTerms = cf.slice(1);
    return `${intPart}.~${cfTerms.join("~")}`;
  }
  static fromContinuedFractionString(cfString) {
    const cfMatch = cfString.match(/^(-?\d+)\.~(.*)$/);
    if (!cfMatch) {
      throw new Error("Invalid continued fraction format");
    }
    const [, integerPart, cfTermsStr] = cfMatch;
    const intPart = BigInt(integerPart);
    if (cfTermsStr === "0") {
      return new Rational(intPart, 1n);
    }
    if (cfTermsStr === "") {
      throw new Error("Continued fraction must have at least one term after .~");
    }
    if (cfTermsStr.endsWith("~")) {
      throw new Error("Continued fraction cannot end with ~");
    }
    if (cfTermsStr.includes("~~")) {
      throw new Error("Invalid continued fraction format: double tilde");
    }
    const terms = cfTermsStr.split("~");
    const cfTerms = [];
    for (const term of terms) {
      if (!/^\d+$/.test(term)) {
        throw new Error(`Invalid continued fraction term: ${term}`);
      }
      const termValue = BigInt(term);
      if (termValue <= 0n) {
        throw new Error(`Continued fraction terms must be positive integers: ${term}`);
      }
      cfTerms.push(termValue);
    }
    const cfArray = [intPart, ...cfTerms];
    return Rational.fromContinuedFraction(cfArray);
  }
  convergents(maxCount = Rational.DEFAULT_CF_LIMIT) {
    if (!this._convergents) {
      const cf = this.toContinuedFraction(maxCount);
      if (cf.length === 1) {
        this._convergents = [new Rational(cf[0], 1n)];
      } else {
        let p_prev = 1n;
        let p_curr = cf[0];
        let q_prev = 0n;
        let q_curr = 1n;
        const convergents = [new Rational(p_curr, q_curr)];
        for (let i = 1;i < cf.length; i++) {
          const a = cf[i];
          const p_next = a * p_curr + p_prev;
          const q_next = a * q_curr + q_prev;
          convergents.push(new Rational(p_next, q_next));
          p_prev = p_curr;
          p_curr = p_next;
          q_prev = q_curr;
          q_curr = q_next;
        }
        this._convergents = convergents;
      }
    }
    if (maxCount && this._convergents && this._convergents.length > maxCount) {
      return this._convergents.slice(0, maxCount);
    }
    return this._convergents || [];
  }
  getConvergent(n) {
    const convergents = this.convergents();
    if (n < 0 || n >= convergents.length) {
      throw new Error(`Convergent index ${n} out of range [0, ${convergents.length - 1}]`);
    }
    return convergents[n];
  }
  static convergentsFromCF(cfInput, maxCount = Rational.DEFAULT_CF_LIMIT) {
    let cfArray;
    if (typeof cfInput === "string") {
      const rational2 = Rational.fromContinuedFractionString(cfInput);
      return rational2.convergents(maxCount);
    } else {
      cfArray = cfInput;
    }
    const rational = Rational.fromContinuedFraction(cfArray);
    return rational.convergents(maxCount);
  }
  approximationError(target) {
    if (!(target instanceof Rational)) {
      throw new Error("Target must be a Rational");
    }
    const diff = this.subtract(target);
    return diff.isNegative ? diff.negate() : diff;
  }
  bestApproximation(maxDenominator) {
    const cf = this.toContinuedFraction();
    let bestApprox = new Rational(cf[0], 1n);
    const convergents = this.convergents();
    for (const convergent of convergents) {
      if (convergent.denominator <= maxDenominator) {
        bestApprox = convergent;
      } else {
        break;
      }
    }
    return bestApprox;
  }
  bitLength() {
    return Math.max(bitLength(this.numerator), bitLength(this.denominator));
  }
}

// src/rational-interval.js
class RationalInterval {
  #low;
  #high;
  static zero = Object.freeze(new RationalInterval(Rational.zero, Rational.zero));
  static one = Object.freeze(new RationalInterval(Rational.one, Rational.one));
  static unitInterval = Object.freeze(new RationalInterval(Rational.zero, Rational.one));
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
      const otherAsInterval = new RationalInterval(otherAsRational, otherAsRational);
      return this.add(otherAsInterval);
    } else if (other.numerator !== undefined && other.denominator !== undefined) {
      const otherAsInterval = new RationalInterval(other, other);
      return this.add(otherAsInterval);
    } else if (other.low && other.high) {
      const newLow = this.#low.add(other.low);
      const newHigh = this.#high.add(other.high);
      return new RationalInterval(newLow, newHigh);
    } else {
      throw new Error(`Cannot add ${other.constructor.name} to RationalInterval`);
    }
  }
  subtract(other) {
    if (other.value !== undefined && typeof other.value === "bigint") {
      const otherAsRational = new Rational(other.value, 1n);
      const otherAsInterval = new RationalInterval(otherAsRational, otherAsRational);
      return this.subtract(otherAsInterval);
    } else if (other.numerator !== undefined && other.denominator !== undefined) {
      const otherAsInterval = new RationalInterval(other, other);
      return this.subtract(otherAsInterval);
    } else if (other.low && other.high) {
      const newLow = this.#low.subtract(other.high);
      const newHigh = this.#high.subtract(other.low);
      return new RationalInterval(newLow, newHigh);
    } else {
      throw new Error(`Cannot subtract ${other.constructor.name} from RationalInterval`);
    }
  }
  multiply(other) {
    if (other.value !== undefined && typeof other.value === "bigint") {
      const otherAsRational = new Rational(other.value, 1n);
      const otherAsInterval = new RationalInterval(otherAsRational, otherAsRational);
      return this.multiply(otherAsInterval);
    } else if (other.numerator !== undefined && other.denominator !== undefined) {
      const otherAsInterval = new RationalInterval(other, other);
      return this.multiply(otherAsInterval);
    } else if (other.low && other.high) {
      const products = [
        this.#low.multiply(other.low),
        this.#low.multiply(other.high),
        this.#high.multiply(other.low),
        this.#high.multiply(other.high)
      ];
      let min = products[0];
      let max = products[0];
      for (let i = 1;i < products.length; i++) {
        if (products[i].lessThan(min))
          min = products[i];
        if (products[i].greaterThan(max))
          max = products[i];
      }
      return new RationalInterval(min, max);
    } else {
      throw new Error(`Cannot multiply RationalInterval by ${other.constructor.name}`);
    }
  }
  divide(other) {
    if (other.value !== undefined && typeof other.value === "bigint") {
      if (other.value === 0n) {
        throw new Error("Division by zero");
      }
      const otherAsRational = new Rational(other.value, 1n);
      const otherAsInterval = new RationalInterval(otherAsRational, otherAsRational);
      return this.divide(otherAsInterval);
    } else if (other.numerator !== undefined && other.denominator !== undefined) {
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
        this.#high.divide(other.high)
      ];
      let min = quotients[0];
      let max = quotients[0];
      for (let i = 1;i < quotients.length; i++) {
        if (quotients[i].lessThan(min))
          min = quotients[i];
        if (quotients[i].greaterThan(max))
          max = quotients[i];
      }
      return new RationalInterval(min, max);
    } else {
      throw new Error(`Cannot divide RationalInterval by ${other.constructor.name}`);
    }
  }
  reciprocate() {
    if (this.containsZero()) {
      throw new Error("Cannot reciprocate an interval containing zero");
    }
    return new RationalInterval(this.#high.reciprocal(), this.#low.reciprocal());
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
        throw new Error("Cannot raise an interval containing zero to the power of zero");
      }
      return new RationalInterval(Rational.one, Rational.one);
    }
    if (n < 0n) {
      if (this.containsZero()) {
        throw new Error("Cannot raise an interval containing zero to a negative power");
      }
      const positivePower = this.pow(-n);
      const reciprocal = new RationalInterval(positivePower.high.reciprocal(), positivePower.low.reciprocal());
      return reciprocal;
    }
    if (n === 1n) {
      return new RationalInterval(this.#low, this.#high);
    }
    if (n % 2n === 0n) {
      let minVal;
      let maxVal;
      if (this.#low.lessThanOrEqual(zero) && this.#high.greaterThanOrEqual(zero)) {
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
    let n;
    if (typeof exponent === "bigint") {
      n = exponent;
    } else if (typeof exponent === "number") {
      n = BigInt(exponent);
    } else if (typeof exponent === "string") {
      n = BigInt(exponent);
    } else {
      n = BigInt(exponent);
    }
    const zero = Rational.zero;
    if (n === 0n) {
      throw new Error("Multiplicative exponentiation requires at least one factor");
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
    for (let i = 1n;i < n; i++) {
      result = result.multiply(this);
    }
    return result;
  }
  overlaps(other) {
    return !(this.#high.lessThan(other.low) || other.high.lessThan(this.#low));
  }
  contains(other) {
    return this.#low.lessThanOrEqual(other.low) && this.#high.greaterThanOrEqual(other.high);
  }
  containsValue(value) {
    const r = value instanceof Rational ? value : new Rational(value);
    return this.#low.lessThanOrEqual(r) && this.#high.greaterThanOrEqual(r);
  }
  containsZero() {
    const zero = Rational.zero;
    return this.#low.lessThanOrEqual(zero) && this.#high.greaterThanOrEqual(zero);
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
    const adjacentRight = this.#high.equals(other.low);
    const adjacentLeft = other.high.equals(this.#low);
    if (!this.overlaps(other) && !adjacentRight && !adjacentLeft) {
      return null;
    }
    const newLow = this.#low.lessThan(other.low) ? this.#low : other.low;
    const newHigh = this.#high.greaterThan(other.high) ? this.#high : other.high;
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
  toRepeatingDecimal(useRepeatNotation = true) {
    const lowDecimal = this.#low.toRepeatingDecimalWithPeriod(useRepeatNotation).decimal;
    const highDecimal = this.#high.toRepeatingDecimalWithPeriod(useRepeatNotation).decimal;
    return `${lowDecimal}:${highDecimal}`;
  }
  compactedDecimalInterval() {
    const lowStr = this.#low.toDecimal();
    const highStr = this.#high.toDecimal();
    let commonPrefix = "";
    const minLength = Math.min(lowStr.length, highStr.length);
    for (let i = 0;i < minLength; i++) {
      if (lowStr[i] === highStr[i]) {
        commonPrefix += lowStr[i];
      } else {
        break;
      }
    }
    if (commonPrefix.length <= 1 || commonPrefix.startsWith("-") && commonPrefix.length <= 2) {
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
    const decimalPlaces = decimalStr.includes(".") ? decimalStr.split(".")[1].length : 0;
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
    if (offsetLow.subtract(offsetHigh).abs().compareTo(new Rational(1, 1e6)) < 0) {
      const avgOffset = scaledOffsetLow.add(scaledOffsetHigh).divide(new Rational(2));
      return `${decimalStr}[+-${avgOffset.toDecimal()}]`;
    } else {
      return `${decimalStr}[+${offsetHighStr},-${offsetLowStr}]`;
    }
  }
  #findShortestPreciseDecimal() {
    const midpoint = this.#low.add(this.#high).divide(new Rational(2));
    for (let precision = 0;precision <= 20; precision++) {
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
          for (let i = 1;i < candidates.length; i++) {
            const distance = candidates[i].subtract(midpoint).abs();
            const comparison = distance.compareTo(bestDistance);
            if (comparison < 0 || comparison === 0 && candidates[i].compareTo(best) < 0) {
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
  bitLength() {
    return Math.max(this.#low.bitLength(), this.#high.bitLength());
  }
  mediant() {
    return new Rational(this.#low.numerator + this.#high.numerator, this.#low.denominator + this.#high.denominator);
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
    const lengthAsNumber = Number(intervalLength.numerator) / Number(intervalLength.denominator);
    const baseAsNumber = Number(baseBigInt);
    let maxK = Math.ceil(Math.log(1 / lengthAsNumber) / Math.log(baseAsNumber));
    maxK = Math.max(0, maxK + 2);
    let k = 0;
    let denominator = 1n;
    while (k <= maxK) {
      const minNumerator = this.#ceilRational(this.#low.multiply(new Rational(denominator)));
      const maxNumerator = this.#floorRational(this.#high.multiply(new Rational(denominator)));
      if (minNumerator.lessThanOrEqual(maxNumerator)) {
        return new Rational(minNumerator.numerator, denominator);
      }
      k++;
      denominator *= baseBigInt;
    }
    throw new Error("Failed to find shortest decimal representation (exceeded theoretical bound)");
  }
  randomRational(maxDenominator = 1000) {
    const maxDenom = BigInt(maxDenominator);
    if (maxDenom <= 0n) {
      throw new Error("maxDenominator must be positive");
    }
    const validRationals = [];
    for (let denom = 1n;denom <= maxDenom; denom++) {
      const minNum = this.#ceilRational(this.#low.multiply(new Rational(denom)));
      const maxNum = this.#floorRational(this.#high.multiply(new Rational(denom)));
      for (let num = minNum.numerator;num <= maxNum.numerator; num++) {
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
  bitLength() {
    const lowBits = this.#low.bitLength();
    const highBits = this.#high.bitLength();
    return Math.max(lowBits, highBits);
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
    } else if (other.low && other.high && typeof other.low.equals === "function") {
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
    } else if (other.low && other.high && typeof other.low.equals === "function") {
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
    } else if (other.low && other.high && typeof other.low.equals === "function") {
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
    } else if (other.low && other.high && typeof other.low.equals === "function") {
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
    if (this.#value < other.value)
      return -1;
    if (this.#value > other.value)
      return 1;
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
    if (this.#value < 0n)
      return new Integer(-1);
    if (this.#value > 0n)
      return new Integer(1);
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
  toString(base) {
    if (base === undefined) {
      return this.#value.toString();
    }
    if (base instanceof BaseSystem) {
      return base.fromDecimal(this.#value);
    }
    if (typeof base === "number") {
      if (base === 10) {
        return this.#value.toString();
      }
      return BaseSystem.fromBase(base).fromDecimal(this.#value);
    }
    return this.#value.toString();
  }
  toBase(baseSystem) {
    if (!(baseSystem instanceof BaseSystem)) {
      throw new Error("Argument must be a BaseSystem");
    }
    return baseSystem.fromDecimal(this.#value);
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
    for (let i = 2n;i <= this.#value; i++) {
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
    for (let i = this.#value;i > 0n; i -= 2n) {
      result *= i;
    }
    return new Integer(result);
  }
  bitLength() {
    if (this.#value === 0n)
      return 0;
    return this.#value < 0n ? (-this.#value).toString(2).length : this.#value.toString(2).length;
  }
}

// src/ratreal.js
var LN2_CF = [0, 1, 2, 3, 1, 6, 3, 1, 1, 2, 1, 1, 6, 1, 6, 1, 1, 4, 1, 2, 4, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
var PI_CF = [3, 7, 15, 1, 292, 1, 1, 1, 2, 1, 3, 1, 14, 2, 1, 1, 2, 2, 2, 2, 1, 84, 2, 1, 1, 15, 3, 13, 1, 4, 2, 6, 6, 99, 1, 2, 2, 6, 3, 5, 1, 1, 6, 8, 1, 7, 1, 2, 3, 7, 1, 2, 1, 1, 12, 1, 1, 1, 3, 1, 1, 8, 1, 1, 2, 1, 6];
var E_CF = [2, 1, 2, 1, 1, 4, 1, 1, 6, 1, 1, 8, 1, 1, 10, 1, 1, 12, 1, 1, 14, 1, 1, 16, 1, 1, 18, 1, 1, 20, 1, 1, 22, 1, 1, 24, 1, 1, 26, 1, 1, 28, 1, 1, 30, 1, 1, 32, 1, 1, 34, 1, 1, 36, 1, 1, 38, 1, 1, 40];
function continuedFractionApproximation(coefficients, terms) {
  if (terms === 0 || coefficients.length === 0) {
    return new Rational(0);
  }
  let num = new Integer(1);
  let den = new Integer(0);
  for (let i = Math.min(terms, coefficients.length) - 1;i >= 0; i--) {
    [num, den] = [den.add(num.multiply(new Integer(coefficients[i]))), num];
  }
  return new Rational(num.value, den.value);
}
function isZero(rational) {
  return rational.numerator === 0n;
}
function isNegative(rational) {
  return rational.numerator < 0n;
}
function floor(rational) {
  if (rational.denominator === 1n) {
    return new Rational(rational.numerator);
  }
  const quotient = rational.numerator / rational.denominator;
  const remainder = rational.numerator % rational.denominator;
  if (remainder === 0n || rational.numerator >= 0n) {
    return new Rational(quotient);
  } else {
    return new Rational(quotient - 1n);
  }
}
function round(rational) {
  if (rational.denominator === 1n) {
    return new Rational(rational.numerator);
  }
  const wholePart = floor(rational);
  const fractionalPart = rational.subtract(wholePart);
  const half = new Rational(1, 2);
  if (fractionalPart.compareTo(half) >= 0) {
    return wholePart.add(new Rational(1));
  } else {
    return wholePart;
  }
}
function parsePrecision(precision) {
  if (precision === undefined) {
    return { epsilon: new Rational(1, 1e6), negative: true };
  }
  if (precision < 0) {
    const denominator = new Integer(10).pow(-precision);
    return { epsilon: new Rational(1, denominator.value), negative: true };
  } else {
    return { epsilon: new Rational(1, precision), negative: false };
  }
}
function createTightRationalInterval(value, precision) {
  const { epsilon } = parsePrecision(precision);
  const epsilonDecimal = epsilon.toNumber();
  const lowerDecimal = value - epsilonDecimal;
  const upperDecimal = value + epsilonDecimal;
  const precisionScale = Math.min(1e9, Math.max(1e6, Math.ceil(1 / epsilonDecimal)));
  const lower = new Rational(Math.floor(lowerDecimal * precisionScale), precisionScale);
  const upper = new Rational(Math.ceil(upperDecimal * precisionScale), precisionScale);
  return new RationalInterval(lower, upper);
}
function getConstant(cfCoefficients, precision) {
  const { epsilon } = parsePrecision(precision);
  let terms = 2;
  let prev = continuedFractionApproximation(cfCoefficients, terms - 1);
  let curr = continuedFractionApproximation(cfCoefficients, terms);
  while (terms < cfCoefficients.length && curr.subtract(prev).abs().compareTo(epsilon) > 0) {
    terms++;
    prev = curr;
    curr = continuedFractionApproximation(cfCoefficients, terms);
  }
  const lower = prev.compareTo(curr) < 0 ? prev : curr;
  const upper = prev.compareTo(curr) > 0 ? prev : curr;
  return new RationalInterval(lower, upper);
}
var PI = (precision) => getConstant(PI_CF, precision);
var E = (precision) => getConstant(E_CF, precision);
function EXP(x, precision) {
  if (x === undefined) {
    return E(precision);
  }
  const { epsilon } = parsePrecision(precision);
  if (x instanceof RationalInterval) {
    const lower = EXP(x.low, precision);
    const upper = EXP(x.high, precision);
    return new RationalInterval(lower.low, upper.high);
  }
  if (!(x instanceof Rational)) {
    x = new Rational(x);
  }
  if (isZero(x)) {
    return new RationalInterval(new Rational(1), new Rational(1));
  }
  const ln2Interval = getConstant(LN2_CF, precision);
  const ln2Approx = ln2Interval.low.add(ln2Interval.high).divide(new Rational(2));
  const k = floor(x.divide(ln2Approx));
  const r = x.subtract(k.multiply(ln2Approx));
  if (isNegative(r)) {
    const kAdjusted = k.subtract(new Rational(1));
    const rAdjusted = x.subtract(kAdjusted.multiply(ln2Approx));
    return EXP(rAdjusted, precision).multiply(new Rational(new Integer(2).pow(kAdjusted.numerator >= 0n ? kAdjusted.numerator : -kAdjusted.numerator).value, 1));
  }
  let expR;
  let sum = new Rational(1);
  let term = new Rational(1);
  let n = 1;
  let converged = false;
  while (term.abs().compareTo(epsilon) > 0 && n < 50) {
    term = term.multiply(r).divide(new Rational(n));
    sum = sum.add(term);
    n++;
    if (sum.denominator > 1000000000n || term.denominator > 1000000000n) {
      break;
    }
    if (term.abs().compareTo(epsilon) <= 0) {
      converged = true;
      break;
    }
  }
  if (converged && sum.denominator <= 1000000000n) {
    const errorBound = term.abs().multiply(new Rational(2));
    expR = new RationalInterval(sum.subtract(errorBound), sum.add(errorBound));
  } else {
    const rDecimal = r.toNumber();
    const expRDecimal = Math.exp(rDecimal);
    expR = createTightRationalInterval(expRDecimal, precision);
  }
  if (isZero(k)) {
    return expR;
  }
  const twoToK = new Rational(new Integer(2).pow(k.numerator >= 0n ? k.numerator : -k.numerator).value, 1);
  if (isNegative(k)) {
    return expR.divide(twoToK);
  } else {
    return expR.multiply(twoToK);
  }
}
function LN(x, precision) {
  const { epsilon } = parsePrecision(precision);
  if (x instanceof RationalInterval) {
    if (isNegative(x.low) || isZero(x.low)) {
      throw new Error("LN: argument must be positive");
    }
    const lower = LN(x.low, precision);
    const upper = LN(x.high, precision);
    return new RationalInterval(lower.low, upper.high);
  }
  if (!(x instanceof Rational)) {
    x = new Rational(x);
  }
  if (isNegative(x) || isZero(x)) {
    throw new Error("LN: argument must be positive");
  }
  if (x.equals(new Rational(1))) {
    return new RationalInterval(new Rational(0), new Rational(0));
  }
  let k = 0;
  let xScaled = x;
  if (x.compareTo(new Rational(1)) > 0) {
    while (xScaled.compareTo(new Rational(2)) >= 0) {
      xScaled = xScaled.divide(new Rational(2));
      k++;
    }
  } else {
    while (xScaled.compareTo(new Rational(1)) < 0) {
      xScaled = xScaled.multiply(new Rational(2));
      k--;
    }
  }
  const y = xScaled.subtract(new Rational(1));
  let lnM;
  let sum = new Rational(0);
  let term = y;
  let n = 1;
  let converged = false;
  while (term.abs().compareTo(epsilon) > 0 && n < 50) {
    sum = sum.add(term.divide(new Rational(n)));
    n++;
    term = term.multiply(y).negate();
    if (sum.denominator > 1000000000n || term.denominator > 1000000000n) {
      break;
    }
    if (term.abs().compareTo(epsilon) <= 0) {
      converged = true;
      break;
    }
  }
  if (converged && sum.denominator <= 1000000000n) {
    const errorBound = term.abs().divide(new Rational(n));
    lnM = new RationalInterval(sum.subtract(errorBound), sum.add(errorBound));
  } else {
    const xScaledDecimal = xScaled.toNumber();
    const lnMDecimal = Math.log(xScaledDecimal);
    lnM = createTightRationalInterval(lnMDecimal, precision);
  }
  if (k === 0) {
    return lnM;
  }
  const ln2Interval = getConstant(LN2_CF, precision);
  const kLn2 = ln2Interval.multiply(new Rational(k));
  return lnM.add(kLn2);
}
function LOG(x, base = 10, precision) {
  if (base === undefined || typeof base === "number" && base < 0) {
    precision = base;
    base = 10;
  }
  const lnX = LN(x, precision);
  const lnBase = LN(new Rational(base), precision);
  return lnX.divide(lnBase);
}
function SIN(x, precision) {
  const { epsilon } = parsePrecision(precision);
  if (x instanceof RationalInterval) {
    const samples = 100;
    let min = null, max = null;
    for (let i = 0;i <= samples; i++) {
      const t = x.low.add(x.high.subtract(x.low).multiply(new Rational(i)).divide(new Rational(samples)));
      const sinT = SIN(t, precision);
      if (min === null || sinT.low.compareTo(min) < 0)
        min = sinT.low;
      if (max === null || sinT.high.compareTo(max) > 0)
        max = sinT.high;
    }
    return new RationalInterval(min, max);
  }
  if (!(x instanceof Rational)) {
    x = new Rational(x);
  }
  const piInterval = PI(precision);
  const piApprox = piInterval.low.add(piInterval.high).divide(new Rational(2));
  const piOver2 = piApprox.divide(new Rational(2));
  const k = round(x.divide(piOver2));
  const r = x.subtract(k.multiply(piOver2));
  const kMod4 = Number(k.numerator % 4n);
  let usecos = false;
  let negate = false;
  switch (kMod4) {
    case 0:
      break;
    case 1:
      usecos = true;
      break;
    case 2:
      negate = true;
      break;
    case 3:
      usecos = true;
      negate = true;
      break;
  }
  let sum = new Rational(0);
  let term = r;
  let n = 1;
  if (usecos) {
    sum = new Rational(1);
    term = new Rational(1);
    n = 0;
  }
  while (term.abs().compareTo(epsilon) > 0 && n < 100) {
    if (usecos) {
      if (n > 0) {
        term = term.multiply(r).multiply(r).negate().divide(new Rational((2 * n - 1) * (2 * n)));
        sum = sum.add(term);
      }
    } else {
      sum = sum.add(term);
      term = term.multiply(r).multiply(r).negate().divide(new Rational((n + 1) * (n + 2)));
    }
    n++;
    if (sum.denominator > 100000000000n || term.denominator > 100000000000n) {
      break;
    }
  }
  if (negate) {
    sum = sum.negate();
  }
  const errorBound = term.abs().multiply(new Rational(2));
  return new RationalInterval(sum.subtract(errorBound), sum.add(errorBound));
}
function COS(x, precision) {
  const { epsilon } = parsePrecision(precision);
  const piInterval = PI(precision);
  const piOver2 = piInterval.divide(new Rational(2));
  if (x instanceof RationalInterval) {
    return SIN(x.add(piOver2), precision);
  } else {
    const piOver2Mid = piOver2.low.add(piOver2.high).divide(new Rational(2));
    const xRational = x instanceof Rational ? x : new Rational(x);
    return SIN(xRational.add(piOver2Mid), precision);
  }
}
function ARCSIN(x, precision) {
  const { epsilon } = parsePrecision(precision);
  if (x instanceof RationalInterval) {
    if (x.low.compareTo(new Rational(-1)) < 0 || x.high.compareTo(new Rational(1)) > 0) {
      throw new Error("ARCSIN: argument must be in [-1, 1]");
    }
    const lower = ARCSIN(x.low, precision);
    const upper = ARCSIN(x.high, precision);
    return new RationalInterval(lower.low, upper.high);
  }
  if (!(x instanceof Rational)) {
    x = new Rational(x);
  }
  if (x.compareTo(new Rational(-1)) < 0 || x.compareTo(new Rational(1)) > 0) {
    throw new Error("ARCSIN: argument must be in [-1, 1]");
  }
  if (isZero(x)) {
    return new RationalInterval(new Rational(0), new Rational(0));
  }
  let sum = x;
  let term = x;
  let n = 1;
  let converged = false;
  while (term.abs().compareTo(epsilon) > 0 && n < 30) {
    term = term.multiply(x).multiply(x).multiply(new Rational((2 * n - 1) * (2 * n - 1))).divide(new Rational(2 * n * (2 * n + 1)));
    sum = sum.add(term);
    n++;
    if (sum.denominator > 1000000000n || term.denominator > 1000000000n) {
      break;
    }
    if (term.abs().compareTo(epsilon) <= 0) {
      converged = true;
      break;
    }
  }
  if (converged && sum.denominator <= 1000000000n) {
    const errorBound = term.abs().multiply(new Rational(2));
    return new RationalInterval(sum.subtract(errorBound), sum.add(errorBound));
  } else {
    const xDecimal = x.toNumber();
    const arcsinDecimal = Math.asin(xDecimal);
    return createTightRationalInterval(arcsinDecimal, precision);
  }
}
function ARCCOS(x, precision) {
  const piOver2 = PI(precision).divide(new Rational(2));
  const arcsinX = ARCSIN(x, precision);
  return piOver2.subtract(arcsinX);
}
function TAN(x, precision) {
  const { epsilon } = parsePrecision(precision);
  if (x instanceof RationalInterval) {
    const samples = 100;
    let min = null, max = null;
    for (let i = 0;i <= samples; i++) {
      const t = x.low.add(x.high.subtract(x.low).multiply(new Rational(i)).divide(new Rational(samples)));
      try {
        const tanT = TAN(t, precision);
        if (min === null || tanT.low.compareTo(min) < 0)
          min = tanT.low;
        if (max === null || tanT.high.compareTo(max) > 0)
          max = tanT.high;
      } catch (e) {
        continue;
      }
    }
    if (min === null || max === null) {
      throw new Error("TAN: interval contains undefined points");
    }
    return new RationalInterval(min, max);
  }
  if (!(x instanceof Rational)) {
    x = new Rational(x);
  }
  const piInterval = PI(precision);
  const piApprox = piInterval.low.add(piInterval.high).divide(new Rational(2));
  const piOver2 = piApprox.divide(new Rational(2));
  const quotient = x.divide(piOver2);
  const nearestOddMultiple = round(quotient);
  if (Number(nearestOddMultiple.numerator % 2n) === 1) {
    const distance = quotient.subtract(nearestOddMultiple).abs();
    if (distance.compareTo(epsilon) < 0) {
      throw new Error("TAN: undefined at odd multiples of π/2");
    }
  }
  const sinX = SIN(x, precision);
  const cosX = COS(x, precision);
  if (cosX.low.abs().compareTo(epsilon) < 0 || cosX.high.abs().compareTo(epsilon) < 0) {
    throw new Error("TAN: undefined (cosine too close to zero)");
  }
  return sinX.divide(cosX);
}
function ARCTAN(x, precision) {
  const { epsilon } = parsePrecision(precision);
  if (x instanceof RationalInterval) {
    const lower = ARCTAN(x.low, precision);
    const upper = ARCTAN(x.high, precision);
    return new RationalInterval(lower.low, upper.high);
  }
  if (!(x instanceof Rational)) {
    x = new Rational(x);
  }
  if (isZero(x)) {
    return new RationalInterval(new Rational(0), new Rational(0));
  }
  const absX = x.abs();
  if (absX.compareTo(new Rational(1)) > 0) {
    const piOver2 = PI(precision).divide(new Rational(2));
    const piOver2Mid = piOver2.low.add(piOver2.high).divide(new Rational(2));
    const arctanRecip = ARCTAN(new Rational(1).divide(absX), precision);
    const result = piOver2Mid.subtract(arctanRecip.low.add(arctanRecip.high).divide(new Rational(2)));
    if (isNegative(x)) {
      return new RationalInterval(result.negate(), result.negate());
    } else {
      return new RationalInterval(result, result);
    }
  }
  let sum = x;
  let term = x;
  let n = 1;
  while (term.abs().compareTo(epsilon) > 0 && n < 100) {
    term = term.multiply(x).multiply(x).negate();
    const denominator = new Rational(2 * n + 1);
    sum = sum.add(term.divide(denominator));
    n++;
    if (sum.denominator > 100000000000n || term.denominator > 100000000000n) {
      break;
    }
  }
  const errorBound = term.abs().multiply(new Rational(2));
  return new RationalInterval(sum.subtract(errorBound), sum.add(errorBound));
}
function newtonRoot(q, n, precision) {
  const { epsilon } = parsePrecision(precision);
  if (!(q instanceof Rational)) {
    q = new Rational(q);
  }
  if (n <= 0) {
    throw new Error("Root degree must be positive");
  }
  if (n === 1) {
    return new RationalInterval(q, q);
  }
  if (isNegative(q) && n % 2 === 0) {
    throw new Error("Even root of negative number");
  }
  const qDecimal = q.toNumber();
  const initialGuess = Math.pow(qDecimal, 1 / n);
  let a = new Rational(Math.round(initialGuess * 1000), 1000);
  let iterations = 0;
  const maxIterations = 100;
  while (iterations < maxIterations) {
    let aPower = a;
    for (let i = 1;i < n - 1; i++) {
      aPower = aPower.multiply(a);
    }
    const b = q.divide(aPower);
    const diff = b.subtract(a).abs();
    if (diff.compareTo(epsilon) <= 0) {
      const lower = a.compareTo(b) < 0 ? a : b;
      const upper = a.compareTo(b) > 0 ? a : b;
      return new RationalInterval(lower, upper);
    }
    if (a.denominator > 100000000000n || b.denominator > 100000000000n) {
      const aDecimal = a.toNumber();
      const bDecimal = b.toNumber();
      if (!isNaN(aDecimal) && !isNaN(bDecimal)) {
        const lowerDecimal = Math.min(aDecimal, bDecimal);
        const upperDecimal = Math.max(aDecimal, bDecimal);
        const precisionScale = 1e7;
        const lowerRational = new Rational(Math.floor(lowerDecimal * precisionScale), precisionScale);
        const upperRational = new Rational(Math.ceil(upperDecimal * precisionScale), precisionScale);
        return new RationalInterval(lowerRational, upperRational);
      }
    }
    a = a.add(b.subtract(a).divide(new Rational(n)));
    iterations++;
  }
  throw new Error("Newton's method did not converge");
}
function rationalIntervalPower(base, exponent, precision) {
  if (exponent instanceof Integer) {
    exponent = exponent.toRational();
  } else if (typeof exponent === "bigint") {
    exponent = new Rational(exponent);
  } else if (typeof exponent === "number") {
    exponent = new Rational(exponent);
  }
  if (exponent instanceof Rational && exponent.denominator <= 10n) {
    const root = newtonRoot(base, Number(exponent.denominator), precision);
    if (exponent.numerator === 1n) {
      return root;
    }
    let result = root;
    const numeratorNum = Number(exponent.numerator);
    for (let i = 1;i < Math.abs(numeratorNum); i++) {
      result = result.multiply(root);
    }
    if (numeratorNum < 0) {
      return new RationalInterval(new Rational(1), new Rational(1)).divide(result);
    }
    return result;
  }
  const lnBase = LN(base, precision);
  const product = lnBase.multiply(exponent);
  if (product instanceof RationalInterval) {
    return EXP(product, precision);
  } else {
    return EXP(product, precision);
  }
}

// src/parser.js
var DEFAULT_PRECISION = -6;
function parseDecimalUncertainty(str, allowIntegerRangeNotation = true) {
  const uncertaintyMatch = str.match(/^(-?\d*\.?\d*)\[([^\]]+)\]$/);
  if (!uncertaintyMatch) {
    throw new Error("Invalid uncertainty format");
  }
  const baseStr = uncertaintyMatch[1];
  const uncertaintyStr = uncertaintyMatch[2];
  const afterDecimalMatch = baseStr.match(/^(-?\d+\.)$/);
  if (afterDecimalMatch && !uncertaintyStr.startsWith("+-") && !uncertaintyStr.startsWith("-+")) {
    return parseDecimalPointUncertainty(baseStr, uncertaintyStr);
  }
  const baseRational = new Rational(baseStr);
  const decimalMatch = baseStr.match(/\.(\d+)$/);
  const baseDecimalPlaces = decimalMatch ? decimalMatch[1].length : 0;
  if (uncertaintyStr.includes(",") && !uncertaintyStr.includes("+") && !uncertaintyStr.includes("-")) {
    if (baseDecimalPlaces === 0 && !allowIntegerRangeNotation) {
      throw new Error("Range notation on integer bases is not supported in this context");
    }
    const rangeParts = uncertaintyStr.split(",");
    if (rangeParts.length !== 2) {
      throw new Error("Range notation must have exactly two values separated by comma");
    }
    const lowerUncertainty = rangeParts[0].trim();
    const upperUncertainty = rangeParts[1].trim();
    if (!/^\d+(\.\d+)?$/.test(lowerUncertainty) || !/^\d+(\.\d+)?$/.test(upperUncertainty)) {
      throw new Error("Range values must be valid decimal numbers");
    }
    const lowerBoundStr = baseStr + lowerUncertainty;
    const upperBoundStr = baseStr + upperUncertainty;
    if (baseDecimalPlaces === 0) {
      const lowerIsInteger = !lowerUncertainty.includes(".");
      const upperIsInteger = !upperUncertainty.includes(".");
      const lowerIntPart = lowerUncertainty.includes(".") ? lowerUncertainty.split(".")[0] : lowerUncertainty;
      const upperIntPart = upperUncertainty.includes(".") ? upperUncertainty.split(".")[0] : upperUncertainty;
      const lowerIntDigits = lowerIntPart.length;
      const upperIntDigits = upperIntPart.length;
      if (lowerIntDigits !== upperIntDigits) {
        throw new Error(`Invalid range notation: ${baseStr}[${lowerUncertainty},${upperUncertainty}] - integer parts of range values must have the same number of digits (${lowerIntPart} has ${lowerIntDigits}, ${upperIntPart} has ${upperIntDigits})`);
      }
    }
    const lowerBound = new Rational(lowerBoundStr);
    const upperBound = new Rational(upperBoundStr);
    if (lowerBound.greaterThan(upperBound)) {
      return new RationalInterval(upperBound, lowerBound);
    }
    return new RationalInterval(lowerBound, upperBound);
  } else if (uncertaintyStr.startsWith("+-") || uncertaintyStr.startsWith("-+")) {
    const offsetStr = uncertaintyStr.substring(2);
    if (!offsetStr) {
      throw new Error("Symmetric notation must have a valid number after +- or -+");
    }
    const offset = parseRepeatingDecimalOrRegular(offsetStr);
    if (baseDecimalPlaces === 0) {
      const upperBound = baseRational.add(offset);
      const lowerBound = baseRational.subtract(offset);
      return new RationalInterval(lowerBound, upperBound);
    } else {
      const nextPlaceScale = new Rational(1).divide(new Rational(10).pow(baseDecimalPlaces + 1));
      const scaledOffset = offset.multiply(nextPlaceScale);
      const upperBound = baseRational.add(scaledOffset);
      const lowerBound = baseRational.subtract(scaledOffset);
      return new RationalInterval(lowerBound, upperBound);
    }
  } else {
    const relativeParts = uncertaintyStr.split(",").map((s) => s.trim());
    if (relativeParts.length !== 2) {
      throw new Error("Relative notation must have exactly two values separated by comma");
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
      throw new Error("Relative notation must have exactly one + and one - value");
    }
    let upperBound, lowerBound;
    if (baseDecimalPlaces === 0) {
      upperBound = baseRational.add(positiveOffset);
      lowerBound = baseRational.subtract(negativeOffset);
    } else {
      const nextPlaceScale = new Rational(1).divide(new Rational(10).pow(baseDecimalPlaces + 1));
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
      throw new Error("Range notation must have exactly two values separated by comma");
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
      throw new Error("Symmetric notation must have a valid number after +- or -+");
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
  const isNegative2 = str.startsWith("-");
  if (isNegative2) {
    str = str.substring(1);
  }
  if (!str.includes("#")) {
    return parseNonRepeatingDecimal(str, isNegative2);
  }
  const parts = str.split("#");
  if (parts.length !== 2) {
    throw new Error('Invalid repeating decimal format. Use format like "0.12#45"');
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
        throw new Error("Decimal must contain only digits and at most one decimal point");
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
      return isNegative2 ? rational.negate() : rational;
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
    throw new Error("Non-repeating part must contain only digits and at most one decimal point");
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
  return isNegative2 ? result.negate() : result;
}
function parseNonRepeatingDecimal(str, isNegative2) {
  const decimalParts = str.split(".");
  if (decimalParts.length > 2) {
    throw new Error("Invalid decimal format - multiple decimal points");
  }
  const integerPart = decimalParts[0] || "0";
  const fractionalPart = decimalParts[1] || "";
  if (!/^\d+$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
    throw new Error("Decimal must contain only digits and at most one decimal point");
  }
  if (!fractionalPart) {
    const rational = new Rational(integerPart);
    return isNegative2 ? rational.negate() : rational;
  }
  const lastDigitPlace = 10n ** BigInt(fractionalPart.length + 1);
  const baseValue = BigInt(integerPart + fractionalPart);
  let lower, upper;
  if (isNegative2) {
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
  if (leftEndpoint instanceof RationalInterval || rightEndpoint instanceof RationalInterval) {
    throw new Error("Nested intervals are not supported");
  }
  return new RationalInterval(leftEndpoint, rightEndpoint);
}
function parseBaseNotation(numberStr, baseSystem, options = {}) {
  let isNegative2 = false;
  if (numberStr.startsWith("-")) {
    isNegative2 = true;
    numberStr = numberStr.substring(1);
  }
  let eNotationIndex = -1;
  let eNotationType = null;
  const baseContainsE = baseSystem.characters.includes("E") || baseSystem.characters.includes("e");
  if (baseContainsE) {
    eNotationIndex = numberStr.indexOf("_^");
    if (eNotationIndex !== -1) {
      eNotationType = "_^";
    }
  } else {
    const upperStr = numberStr.toUpperCase();
    const eIndex = upperStr.indexOf("E");
    if (eIndex !== -1) {
      eNotationIndex = eIndex;
      eNotationType = "E";
    }
  }
  let baseNumber = numberStr;
  let exponentStr = null;
  if (eNotationIndex !== -1) {
    baseNumber = numberStr.substring(0, eNotationIndex);
    const exponentStart = eNotationIndex + (eNotationType === "_^" ? 2 : 1);
    exponentStr = numberStr.substring(exponentStart);
    if (!baseSystem.isValidString(exponentStr.replace("-", ""))) {
      throw new Error(`Invalid exponent "${exponentStr}" for base ${baseSystem.base}`);
    }
  }
  if (baseSystem.base <= 36 && baseSystem.base > 10) {
    const usesLowercase = baseSystem.characters.some((char) => char >= "a" && char <= "z");
    const usesUppercase = baseSystem.characters.some((char) => char >= "A" && char <= "Z");
    if (usesLowercase && !usesUppercase) {
      baseNumber = baseNumber.toLowerCase();
      if (exponentStr) {
        exponentStr = exponentStr.toLowerCase();
      }
    } else if (usesUppercase && !usesLowercase) {
      baseNumber = baseNumber.toUpperCase();
      if (exponentStr) {
        exponentStr = exponentStr.toUpperCase();
      }
    }
  }
  if (eNotationIndex !== -1) {
    const baseValue = parseBaseNotation(baseNumber, baseSystem, options);
    let exponentDecimal;
    if (exponentStr.startsWith("-")) {
      const positiveExponent = baseSystem.toDecimal(exponentStr.substring(1));
      exponentDecimal = -positiveExponent;
    } else {
      exponentDecimal = baseSystem.toDecimal(exponentStr);
    }
    let powerOfBase;
    const baseBigInt = BigInt(baseSystem.base);
    if (exponentDecimal >= 0n) {
      powerOfBase = new Rational(baseBigInt ** exponentDecimal);
    } else {
      powerOfBase = new Rational(1n, baseBigInt ** -exponentDecimal);
    }
    let baseRational;
    if (baseValue instanceof Integer) {
      baseRational = baseValue.toRational();
    } else if (baseValue instanceof Rational) {
      baseRational = baseValue;
    } else {
      throw new Error("E notation can only be applied to simple numbers, not intervals");
    }
    let result = baseRational.multiply(powerOfBase);
    if (isNegative2) {
      result = result.negate();
    }
    return options.typeAware && result.denominator === 1n ? new Integer(result.numerator) : result;
  }
  if (baseNumber.includes(":")) {
    const parts = baseNumber.split(":");
    if (parts.length !== 2) {
      throw new Error('Base notation intervals must have exactly two endpoints separated by ":"');
    }
    const leftStr = isNegative2 ? "-" + parts[0].trim() : parts[0].trim();
    const leftValue = parseBaseNotation(leftStr, baseSystem, options);
    const rightValue = parseBaseNotation(parts[1].trim(), baseSystem, options);
    let leftRational, rightRational;
    if (leftValue instanceof Integer) {
      leftRational = leftValue.toRational();
    } else if (leftValue instanceof Rational) {
      leftRational = leftValue;
    } else if (leftValue instanceof RationalInterval && leftValue.low.equals(leftValue.high)) {
      leftRational = leftValue.low;
    } else {
      throw new Error("Interval endpoints must be single values, not intervals");
    }
    if (rightValue instanceof Integer) {
      rightRational = rightValue.toRational();
    } else if (rightValue instanceof Rational) {
      rightRational = rightValue;
    } else if (rightValue instanceof RationalInterval && rightValue.low.equals(rightValue.high)) {
      rightRational = rightValue.low;
    } else {
      throw new Error("Interval endpoints must be single values, not intervals");
    }
    const interval = new RationalInterval(leftRational, rightRational);
    interval._explicitInterval = true;
    return interval;
  }
  if (baseNumber.includes("..")) {
    const parts = baseNumber.split("..");
    if (parts.length !== 2) {
      throw new Error('Mixed number notation must have exactly one ".." separator');
    }
    const wholePart = parts[0].trim();
    const fractionPart = parts[1].trim();
    if (!fractionPart.includes("/")) {
      throw new Error('Mixed number fractional part must contain "/"');
    }
    const wholeDecimal = baseSystem.toDecimal(wholePart);
    let wholeRational = new Rational(wholeDecimal);
    if (isNegative2) {
      wholeRational = wholeRational.negate();
    }
    const fractionResult = parseBaseNotation(fractionPart, baseSystem, options);
    let fractionRational;
    if (fractionResult instanceof Integer) {
      fractionRational = fractionResult.toRational();
    } else if (fractionResult instanceof Rational) {
      fractionRational = fractionResult;
    } else {
      throw new Error("Mixed number fractional part must be a simple fraction");
    }
    if (wholeRational.numerator < 0n) {
      const result = wholeRational.subtract(fractionRational.abs());
      return options.typeAware && result.denominator === 1n ? new Integer(result.numerator) : result;
    } else {
      const result = wholeRational.add(fractionRational);
      return options.typeAware && result.denominator === 1n ? new Integer(result.numerator) : result;
    }
  }
  if (baseNumber.includes("/")) {
    const parts = baseNumber.split("/");
    if (parts.length !== 2) {
      throw new Error('Fraction notation must have exactly one "/" separator');
    }
    const numeratorStr = parts[0].trim();
    const denominatorStr = parts[1].trim();
    const numeratorDecimal = baseSystem.toDecimal(numeratorStr);
    const denominatorDecimal = baseSystem.toDecimal(denominatorStr);
    if (denominatorDecimal === 0n) {
      throw new Error("Denominator cannot be zero");
    }
    let result = new Rational(numeratorDecimal, denominatorDecimal);
    if (isNegative2) {
      result = result.negate();
    }
    result._explicitFraction = true;
    return result;
  }
  if (baseNumber.includes(".")) {
    const parts = baseNumber.split(".");
    if (parts.length !== 2) {
      throw new Error('Decimal notation must have exactly one "." separator');
    }
    const integerPart = parts[0] || "0";
    const fractionalPart = parts[1] || "";
    if (fractionalPart === "") {
      throw new Error("Decimal point must be followed by fractional digits");
    }
    const fullStr = integerPart + fractionalPart;
    if (!baseSystem.isValidString(fullStr)) {
      throw new Error(`String "${baseNumber}" contains characters not valid for ${baseSystem.name}`);
    }
    const integerDecimal = baseSystem.toDecimal(integerPart);
    let fractionalDecimal = 0n;
    const baseBigInt = BigInt(baseSystem.base);
    for (let i = 0;i < fractionalPart.length; i++) {
      const digitChar = fractionalPart[i];
      const digitValue = BigInt(baseSystem.charMap.get(digitChar));
      fractionalDecimal = fractionalDecimal * baseBigInt + digitValue;
    }
    const denominator = baseBigInt ** BigInt(fractionalPart.length);
    const totalNumerator = integerDecimal * denominator + fractionalDecimal;
    let result = new Rational(totalNumerator, denominator);
    if (isNegative2) {
      result = result.negate();
    }
    return options.typeAware && result.denominator === 1n ? new Integer(result.numerator) : result;
  }
  if (!baseSystem.isValidString(baseNumber)) {
    throw new Error(`String "${baseNumber}" contains characters not valid for ${baseSystem.name}`);
  }
  let decimalValue = baseSystem.toDecimal(baseNumber);
  if (isNegative2) {
    decimalValue = -decimalValue;
  }
  if (options.typeAware) {
    return new Integer(decimalValue);
  } else {
    return new Rational(decimalValue);
  }
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
    while (currentExpr.length > 0 && (currentExpr[0] === "+" || currentExpr[0] === "-")) {
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
      remainingExpr: currentExpr
    };
  }
  static #parseTerm(expr, options = {}) {
    let result = Parser.#parseFactor(expr, options);
    let currentExpr = result.remainingExpr;
    while (currentExpr.length > 0 && (currentExpr[0] === "*" || currentExpr[0] === "/" || currentExpr[0] === "E" || currentExpr.startsWith("TE"))) {
      let operator, skipLength;
      if (currentExpr.startsWith("TE")) {
        operator = "E";
        skipLength = 2;
      } else {
        operator = currentExpr[0];
        skipLength = 1;
      }
      currentExpr = currentExpr.substring(skipLength);
      if (operator === "/" && currentExpr.length > 0 && currentExpr[0] === "S") {
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
          const powerOf10 = exponentValue >= 0n ? new Rational(10n ** exponentValue) : new Rational(1n, 10n ** -exponentValue);
          const powerInterval = RationalInterval.point(powerOf10);
          result.value = result.value.multiply(powerInterval);
        }
      }
    }
    return {
      value: Parser.#promoteType(result.value, options),
      remainingExpr: currentExpr
    };
  }
  static #parseFactor(expr, options = {}) {
    if (expr.length === 0) {
      throw new Error("Unexpected end of expression");
    }
    if (expr[0] === "(") {
      const subExprResult = Parser.#parseExpression(expr.substring(1), options);
      if (subExprResult.remainingExpr.length === 0 || subExprResult.remainingExpr[0] !== ")") {
        throw new Error("Missing closing parenthesis");
      }
      const result = {
        value: subExprResult.value,
        remainingExpr: subExprResult.remainingExpr.substring(1)
      };
      if (result.remainingExpr.length > 0 && (result.remainingExpr[0] === "E" || result.remainingExpr.startsWith("TE") || result.remainingExpr.startsWith("_^"))) {
        const eResult = Parser.#parseENotation(result.value, result.remainingExpr, options);
        let factorialResult3 = eResult;
        if (factorialResult3.remainingExpr.length > 1 && factorialResult3.remainingExpr.substring(0, 2) === "!!") {
          if (factorialResult3.value instanceof Integer) {
            factorialResult3 = {
              value: factorialResult3.value.doubleFactorial(),
              remainingExpr: factorialResult3.remainingExpr.substring(2)
            };
          } else if (factorialResult3.value instanceof Rational && factorialResult3.value.denominator === 1n) {
            const intValue = new Integer(factorialResult3.value.numerator);
            factorialResult3 = {
              value: intValue.doubleFactorial().toRational(),
              remainingExpr: factorialResult3.remainingExpr.substring(2)
            };
          } else if (factorialResult3.value.low && factorialResult3.value.high && factorialResult3.value.low.equals(factorialResult3.value.high) && factorialResult3.value.low.denominator === 1n) {
            const intValue = new Integer(factorialResult3.value.low.numerator);
            const factorialValue = intValue.doubleFactorial();
            const IntervalClass = factorialResult3.value.constructor;
            factorialResult3 = {
              value: new IntervalClass(factorialValue.toRational(), factorialValue.toRational()),
              remainingExpr: factorialResult3.remainingExpr.substring(2)
            };
          } else {
            throw new Error("Double factorial is not defined for negative integers");
          }
        } else if (factorialResult3.remainingExpr.length > 0 && factorialResult3.remainingExpr[0] === "!") {
          if (factorialResult3.value instanceof Integer) {
            factorialResult3 = {
              value: factorialResult3.value.factorial(),
              remainingExpr: factorialResult3.remainingExpr.substring(1)
            };
          } else if (factorialResult3.value instanceof Rational && factorialResult3.value.denominator === 1n) {
            const intValue = new Integer(factorialResult3.value.numerator);
            factorialResult3 = {
              value: intValue.factorial().toRational(),
              remainingExpr: factorialResult3.remainingExpr.substring(1)
            };
          } else if (factorialResult3.value.low && factorialResult3.value.high && factorialResult3.value.low.equals(factorialResult3.value.high) && factorialResult3.value.low.denominator === 1n) {
            const intValue = new Integer(factorialResult3.value.low.numerator);
            const factorialValue = intValue.factorial();
            const IntervalClass = factorialResult3.value.constructor;
            factorialResult3 = {
              value: new IntervalClass(factorialValue.toRational(), factorialValue.toRational()),
              remainingExpr: factorialResult3.remainingExpr.substring(1)
            };
          } else {
            throw new Error("Factorial is not defined for negative integers");
          }
        }
        if (factorialResult3.remainingExpr.length > 0) {
          if (factorialResult3.remainingExpr[0] === "^") {
            const powerExpr = factorialResult3.remainingExpr.substring(1);
            let powerResult;
            let isIntegerExponent = false;
            try {
              powerResult = Parser.#parseExponent(powerExpr);
              isIntegerExponent = true;
            } catch (e) {
              powerResult = Parser.#parseExponentExpression(powerExpr, options);
              isIntegerExponent = false;
            }
            const zero = new Rational(0);
            const isZeroBase = factorialResult3.value.low && factorialResult3.value.high ? factorialResult3.value.low.equals(zero) && factorialResult3.value.high.equals(zero) : factorialResult3.value instanceof Integer && factorialResult3.value.value === 0n || factorialResult3.value instanceof Rational && factorialResult3.value.numerator === 0n;
            const isZeroExponent = isIntegerExponent ? powerResult.value === 0n : powerResult.value instanceof Rational && powerResult.value.numerator === 0n || powerResult.value instanceof Integer && powerResult.value.value === 0n;
            if (isZeroBase && isZeroExponent) {
              throw new Error("Zero cannot be raised to the power of zero");
            }
            let result2;
            if (isIntegerExponent) {
              result2 = factorialResult3.value.pow(powerResult.value);
            } else {
              const precision = options.precision || DEFAULT_PRECISION;
              result2 = rationalIntervalPower(factorialResult3.value, powerResult.value, precision);
            }
            return {
              value: result2,
              remainingExpr: powerResult.remainingExpr
            };
          } else if (factorialResult3.remainingExpr.length > 1 && factorialResult3.remainingExpr[0] === "*" && factorialResult3.remainingExpr[1] === "*") {
            const powerExpr = factorialResult3.remainingExpr.substring(2);
            let powerResult;
            let isIntegerExponent = false;
            try {
              powerResult = Parser.#parseExponent(powerExpr);
              isIntegerExponent = true;
            } catch (e) {
              powerResult = Parser.#parseExponentExpression(powerExpr, options);
              isIntegerExponent = false;
            }
            const isZeroExponent = isIntegerExponent && powerResult.value === 0n || !isIntegerExponent && powerResult.value instanceof Integer && powerResult.value.value === 0n || !isIntegerExponent && powerResult.value instanceof Rational && powerResult.value.numerator === 0n;
            if (isZeroExponent) {
              throw new Error("Multiplicative exponentiation requires at least one factor");
            }
            let result2;
            if (!isIntegerExponent && powerResult.value instanceof Rational && Number(powerResult.value.denominator) <= 10 && Number(powerResult.value.denominator) > 1) {
              const precision = options.precision || DEFAULT_PRECISION;
              const rootDegree = Number(powerResult.value.denominator);
              const rootInterval = newtonRoot(factorialResult3.value, rootDegree, precision);
              if (!powerResult.value.numerator === 1n) {
                const numeratorPower = Number(powerResult.value.numerator);
                result2 = rootInterval;
                for (let i = 1;i < Math.abs(numeratorPower); i++) {
                  result2 = result2.multiply(rootInterval);
                }
                if (numeratorPower < 0) {
                  result2 = new RationalInterval(new Rational(1).divide(result2.upper), new Rational(1).divide(result2.lower));
                }
              } else {
                result2 = rootInterval;
              }
            } else if (isIntegerExponent) {
              let base = factorialResult3.value;
              if (!(base instanceof RationalInterval)) {
                base = RationalInterval.point(base instanceof Integer ? base.toRational() : base);
              }
              result2 = base.mpow(powerResult.value);
            } else {
              const precision = options.precision || DEFAULT_PRECISION;
              result2 = rationalIntervalPower(factorialResult3.value, powerResult.value, precision);
            }
            if (result2._skipPromotion === undefined) {
              result2._skipPromotion = true;
            }
            return {
              value: result2,
              remainingExpr: powerResult.remainingExpr
            };
          }
        }
        return factorialResult3;
      }
      let factorialResult2 = result;
      if (factorialResult2.remainingExpr.length > 1 && factorialResult2.remainingExpr.substring(0, 2) === "!!") {
        if (factorialResult2.value instanceof Integer) {
          factorialResult2 = {
            value: factorialResult2.value.doubleFactorial(),
            remainingExpr: factorialResult2.remainingExpr.substring(2)
          };
        } else if (factorialResult2.value instanceof Rational && factorialResult2.value.denominator === 1n) {
          const intValue = new Integer(factorialResult2.value.numerator);
          factorialResult2 = {
            value: intValue.doubleFactorial().toRational(),
            remainingExpr: factorialResult2.remainingExpr.substring(2)
          };
        } else if (factorialResult2.value.low && factorialResult2.value.high && factorialResult2.value.low.equals(factorialResult2.value.high) && factorialResult2.value.low.denominator === 1n) {
          const intValue = new Integer(factorialResult2.value.low.numerator);
          const factorialValue = intValue.doubleFactorial();
          const IntervalClass = factorialResult2.value.constructor;
          factorialResult2 = {
            value: new IntervalClass(factorialValue.toRational(), factorialValue.toRational()),
            remainingExpr: factorialResult2.remainingExpr.substring(2)
          };
        } else {
          throw new Error("Double factorial is not defined for negative integers");
        }
      } else if (factorialResult2.remainingExpr.length > 0 && factorialResult2.remainingExpr[0] === "!") {
        if (factorialResult2.value instanceof Integer) {
          factorialResult2 = {
            value: factorialResult2.value.factorial(),
            remainingExpr: factorialResult2.remainingExpr.substring(1)
          };
        } else if (factorialResult2.value instanceof Rational && factorialResult2.value.denominator === 1n) {
          const intValue = new Integer(factorialResult2.value.numerator);
          factorialResult2 = {
            value: intValue.factorial().toRational(),
            remainingExpr: factorialResult2.remainingExpr.substring(1)
          };
        } else if (factorialResult2.value.low && factorialResult2.value.high && factorialResult2.value.low.equals(factorialResult2.value.high) && factorialResult2.value.low.denominator === 1n) {
          const intValue = new Integer(factorialResult2.value.low.numerator);
          const factorialValue = intValue.factorial();
          const IntervalClass = factorialResult2.value.constructor;
          factorialResult2 = {
            value: new IntervalClass(factorialValue.toRational(), factorialValue.toRational()),
            remainingExpr: factorialResult2.remainingExpr.substring(1)
          };
        } else {
          throw new Error("Factorial is not defined for negative integers");
        }
      }
      if (factorialResult2.remainingExpr.length > 0) {
        if (factorialResult2.remainingExpr[0] === "^") {
          const powerExpr = factorialResult2.remainingExpr.substring(1);
          let powerResult;
          let isIntegerExponent = false;
          try {
            powerResult = Parser.#parseExponent(powerExpr);
            isIntegerExponent = true;
          } catch (e) {
            powerResult = Parser.#parseExponentExpression(powerExpr, options);
            isIntegerExponent = false;
          }
          const zero = new Rational(0);
          let isZero2 = false;
          if (factorialResult2.value instanceof RationalInterval) {
            isZero2 = factorialResult2.value.low.equals(zero) && factorialResult2.value.high.equals(zero);
          } else if (factorialResult2.value instanceof Rational) {
            isZero2 = factorialResult2.value.equals(zero);
          } else if (factorialResult2.value instanceof Integer) {
            isZero2 = factorialResult2.value.value === 0n;
          }
          const isZeroExponent = isIntegerExponent ? powerResult.value === 0n : powerResult.value instanceof Rational && powerResult.value.numerator === 0n || powerResult.value instanceof Integer && powerResult.value.value === 0n;
          if (isZero2 && isZeroExponent) {
            throw new Error("Zero cannot be raised to the power of zero");
          }
          let result2;
          if (isIntegerExponent) {
            result2 = factorialResult2.value.pow(powerResult.value);
          } else {
            const precision = options.precision || DEFAULT_PRECISION;
            result2 = rationalIntervalPower(factorialResult2.value, powerResult.value, precision);
          }
          return {
            value: result2,
            remainingExpr: powerResult.remainingExpr
          };
        } else if (factorialResult2.remainingExpr.length > 1 && factorialResult2.remainingExpr[0] === "*" && factorialResult2.remainingExpr[1] === "*") {
          const powerExpr = factorialResult2.remainingExpr.substring(2);
          let powerResult;
          let isIntegerExponent = false;
          try {
            powerResult = Parser.#parseExponent(powerExpr);
            isIntegerExponent = true;
          } catch (e) {
            powerResult = Parser.#parseExponentExpression(powerExpr, options);
            isIntegerExponent = false;
          }
          const isZeroExponent = isIntegerExponent && powerResult.value === 0n || !isIntegerExponent && powerResult.value instanceof Integer && powerResult.value.value === 0n || !isIntegerExponent && powerResult.value instanceof Rational && powerResult.value.numerator === 0n;
          if (isZeroExponent) {
            throw new Error("Multiplicative exponentiation requires at least one factor");
          }
          let result2;
          if (!isIntegerExponent && powerResult.value instanceof Rational && Number(powerResult.value.denominator) <= 10 && Number(powerResult.value.denominator) > 1) {
            const precision = options.precision || DEFAULT_PRECISION;
            const rootDegree = Number(powerResult.value.denominator);
            const rootInterval = newtonRoot(factorialResult2.value, rootDegree, precision);
            if (!powerResult.value.numerator === 1n) {
              const numeratorPower = Number(powerResult.value.numerator);
              result2 = rootInterval;
              for (let i = 1;i < Math.abs(numeratorPower); i++) {
                result2 = result2.multiply(rootInterval);
              }
              if (numeratorPower < 0) {
                result2 = new RationalInterval(new Rational(1).divide(result2.upper), new Rational(1).divide(result2.lower));
              }
            } else {
              result2 = rootInterval;
            }
          } else if (isIntegerExponent) {
            let base = factorialResult2.value;
            if (!(base instanceof RationalInterval)) {
              base = RationalInterval.point(base instanceof Integer ? base.toRational() : base);
            }
            result2 = base.mpow(powerResult.value);
          } else {
            const precision = options.precision || DEFAULT_PRECISION;
            result2 = rationalIntervalPower(factorialResult2.value, powerResult.value, precision);
          }
          if (result2._skipPromotion === undefined) {
            result2._skipPromotion = true;
          }
          return {
            value: result2,
            remainingExpr: powerResult.remainingExpr
          };
        }
      }
      return factorialResult2;
    }
    if (/^[A-Z]/.test(expr)) {
      if (expr.startsWith("PI")) {
        let precision = undefined;
        let remainingExpr = expr.substring(2);
        if (remainingExpr.startsWith("[")) {
          const precisionMatch = remainingExpr.match(/^\[(-?\d+)\]/);
          if (precisionMatch) {
            precision = parseInt(precisionMatch[1], 10);
            remainingExpr = remainingExpr.substring(precisionMatch[0].length);
          }
        }
        const result = PI(precision);
        result._explicitInterval = true;
        return {
          value: result,
          remainingExpr
        };
      }
      if (expr.startsWith("EXP")) {
        let remainingExpr = expr.substring(3);
        let precision = undefined;
        if (remainingExpr.startsWith("[")) {
          const precisionMatch = remainingExpr.match(/^\[(-?\d+)\]/);
          if (precisionMatch) {
            precision = parseInt(precisionMatch[1], 10);
            remainingExpr = remainingExpr.substring(precisionMatch[0].length);
          }
        }
        if (remainingExpr.startsWith("(")) {
          const argResult = Parser.#parseExpression(remainingExpr.substring(1), options);
          if (argResult.remainingExpr.length === 0 || argResult.remainingExpr[0] !== ")") {
            throw new Error("Missing closing parenthesis for EXP function");
          }
          const result = EXP(argResult.value, precision);
          result._explicitInterval = true;
          return {
            value: result,
            remainingExpr: argResult.remainingExpr.substring(1)
          };
        } else {
          const result = E(precision);
          result._explicitInterval = true;
          return {
            value: result,
            remainingExpr
          };
        }
      }
      if (expr.startsWith("LN")) {
        let remainingExpr = expr.substring(2);
        let precision = undefined;
        if (remainingExpr.startsWith("[")) {
          const precisionMatch = remainingExpr.match(/^\[(-?\d+)\]/);
          if (precisionMatch) {
            precision = parseInt(precisionMatch[1], 10);
            remainingExpr = remainingExpr.substring(precisionMatch[0].length);
          }
        }
        if (!remainingExpr.startsWith("(")) {
          throw new Error("LN requires parentheses");
        }
        const argResult = Parser.#parseExpression(remainingExpr.substring(1), options);
        if (argResult.remainingExpr.length === 0 || argResult.remainingExpr[0] !== ")") {
          throw new Error("Missing closing parenthesis for LN function");
        }
        const result = LN(argResult.value, precision);
        result._explicitInterval = true;
        return {
          value: result,
          remainingExpr: argResult.remainingExpr.substring(1)
        };
      }
      if (expr.startsWith("LOG")) {
        let remainingExpr = expr.substring(3);
        let precision = undefined;
        if (remainingExpr.startsWith("[")) {
          const precisionMatch = remainingExpr.match(/^\[(-?\d+)\]/);
          if (precisionMatch) {
            precision = parseInt(precisionMatch[1], 10);
            remainingExpr = remainingExpr.substring(precisionMatch[0].length);
          }
        }
        if (!remainingExpr.startsWith("(")) {
          throw new Error("LOG requires parentheses");
        }
        const arg1Result = Parser.#parseExpression(remainingExpr.substring(1), options);
        let base = 10;
        let finalRemainingExpr = arg1Result.remainingExpr;
        if (arg1Result.remainingExpr.startsWith(",")) {
          const arg2Result = Parser.#parseExpression(arg1Result.remainingExpr.substring(1), options);
          base = arg2Result.value;
          finalRemainingExpr = arg2Result.remainingExpr;
        }
        if (finalRemainingExpr.length === 0 || finalRemainingExpr[0] !== ")") {
          throw new Error("Missing closing parenthesis for LOG function");
        }
        const result = LOG(arg1Result.value, base, precision);
        result._explicitInterval = true;
        return {
          value: result,
          remainingExpr: finalRemainingExpr.substring(1)
        };
      }
      if (expr.startsWith("SIN")) {
        let remainingExpr = expr.substring(3);
        let precision = undefined;
        if (remainingExpr.startsWith("[")) {
          const precisionMatch = remainingExpr.match(/^\[(-?\d+)\]/);
          if (precisionMatch) {
            precision = parseInt(precisionMatch[1], 10);
            remainingExpr = remainingExpr.substring(precisionMatch[0].length);
          }
        }
        if (!remainingExpr.startsWith("(")) {
          throw new Error("SIN requires parentheses");
        }
        const argResult = Parser.#parseExpression(remainingExpr.substring(1), options);
        if (argResult.remainingExpr.length === 0 || argResult.remainingExpr[0] !== ")") {
          throw new Error("Missing closing parenthesis for SIN function");
        }
        const result = SIN(argResult.value, precision);
        result._explicitInterval = true;
        return {
          value: result,
          remainingExpr: argResult.remainingExpr.substring(1)
        };
      }
      if (expr.startsWith("COS")) {
        let remainingExpr = expr.substring(3);
        let precision = undefined;
        if (remainingExpr.startsWith("[")) {
          const precisionMatch = remainingExpr.match(/^\[(-?\d+)\]/);
          if (precisionMatch) {
            precision = parseInt(precisionMatch[1], 10);
            remainingExpr = remainingExpr.substring(precisionMatch[0].length);
          }
        }
        if (!remainingExpr.startsWith("(")) {
          throw new Error("COS requires parentheses");
        }
        const argResult = Parser.#parseExpression(remainingExpr.substring(1), options);
        if (argResult.remainingExpr.length === 0 || argResult.remainingExpr[0] !== ")") {
          throw new Error("Missing closing parenthesis for COS function");
        }
        const result = COS(argResult.value, precision);
        result._explicitInterval = true;
        return {
          value: result,
          remainingExpr: argResult.remainingExpr.substring(1)
        };
      }
      if (expr.startsWith("ARCSIN")) {
        let remainingExpr = expr.substring(6);
        let precision = undefined;
        if (remainingExpr.startsWith("[")) {
          const precisionMatch = remainingExpr.match(/^\[(-?\d+)\]/);
          if (precisionMatch) {
            precision = parseInt(precisionMatch[1], 10);
            remainingExpr = remainingExpr.substring(precisionMatch[0].length);
          }
        }
        if (!remainingExpr.startsWith("(")) {
          throw new Error("ARCSIN requires parentheses");
        }
        const argResult = Parser.#parseExpression(remainingExpr.substring(1), options);
        if (argResult.remainingExpr.length === 0 || argResult.remainingExpr[0] !== ")") {
          throw new Error("Missing closing parenthesis for ARCSIN function");
        }
        const result = ARCSIN(argResult.value, precision);
        result._explicitInterval = true;
        return {
          value: result,
          remainingExpr: argResult.remainingExpr.substring(1)
        };
      }
      if (expr.startsWith("ARCCOS")) {
        let remainingExpr = expr.substring(6);
        let precision = undefined;
        if (remainingExpr.startsWith("[")) {
          const precisionMatch = remainingExpr.match(/^\[(-?\d+)\]/);
          if (precisionMatch) {
            precision = parseInt(precisionMatch[1], 10);
            remainingExpr = remainingExpr.substring(precisionMatch[0].length);
          }
        }
        if (!remainingExpr.startsWith("(")) {
          throw new Error("ARCCOS requires parentheses");
        }
        const argResult = Parser.#parseExpression(remainingExpr.substring(1), options);
        if (argResult.remainingExpr.length === 0 || argResult.remainingExpr[0] !== ")") {
          throw new Error("Missing closing parenthesis for ARCCOS function");
        }
        const result = ARCCOS(argResult.value, precision);
        result._explicitInterval = true;
        return {
          value: result,
          remainingExpr: argResult.remainingExpr.substring(1)
        };
      }
      if (expr.startsWith("TAN")) {
        let remainingExpr = expr.substring(3);
        let precision = undefined;
        if (remainingExpr.startsWith("[")) {
          const precisionMatch = remainingExpr.match(/^\[(-?\d+)\]/);
          if (precisionMatch) {
            precision = parseInt(precisionMatch[1], 10);
            remainingExpr = remainingExpr.substring(precisionMatch[0].length);
          }
        }
        if (!remainingExpr.startsWith("(")) {
          throw new Error("TAN requires parentheses");
        }
        const argResult = Parser.#parseExpression(remainingExpr.substring(1), options);
        if (argResult.remainingExpr.length === 0 || argResult.remainingExpr[0] !== ")") {
          throw new Error("Missing closing parenthesis for TAN function");
        }
        const result = TAN(argResult.value, precision);
        result._explicitInterval = true;
        return {
          value: result,
          remainingExpr: argResult.remainingExpr.substring(1)
        };
      }
      if (expr.startsWith("ARCTAN")) {
        let remainingExpr = expr.substring(6);
        let precision = undefined;
        if (remainingExpr.startsWith("[")) {
          const precisionMatch = remainingExpr.match(/^\[(-?\d+)\]/);
          if (precisionMatch) {
            precision = parseInt(precisionMatch[1], 10);
            remainingExpr = remainingExpr.substring(precisionMatch[0].length);
          }
        }
        if (!remainingExpr.startsWith("(")) {
          throw new Error("ARCTAN requires parentheses");
        }
        const argResult = Parser.#parseExpression(remainingExpr.substring(1), options);
        if (argResult.remainingExpr.length === 0 || argResult.remainingExpr[0] !== ")") {
          throw new Error("Missing closing parenthesis for ARCTAN function");
        }
        const result = ARCTAN(argResult.value, precision);
        result._explicitInterval = true;
        return {
          value: result,
          remainingExpr: argResult.remainingExpr.substring(1)
        };
      }
    }
    if (expr.includes("[") && expr.includes("]")) {
      const baseMatch = expr.match(/^([-\w./:^]+(?::[-\w./:^]+)?)\[(\d+)\]/);
      if (baseMatch) {
        const [fullMatch, numberStr, baseStr] = baseMatch;
        const baseNum = parseInt(baseStr, 10);
        if (baseNum < 2 || baseNum > 62) {
          throw new Error(`Base ${baseNum} is not supported. Base must be between 2 and 62.`);
        }
        try {
          let baseSystem;
          if (options.customBases && options.customBases.has(baseNum)) {
            baseSystem = options.customBases.get(baseNum);
          } else {
            baseSystem = BaseSystem.fromBase(baseNum);
          }
          const result = parseBaseNotation(numberStr, baseSystem, options);
          return {
            value: result,
            remainingExpr: expr.substring(fullMatch.length)
          };
        } catch (error) {
          throw new Error(`Invalid base notation ${fullMatch}: ${error.message}`);
        }
      }
      const uncertaintyMatch = expr.match(/^(-?\d*\.?\d*)\[([^\]]+)\]/);
      if (uncertaintyMatch) {
        const fullMatch = uncertaintyMatch[0];
        try {
          const result = parseDecimalUncertainty(fullMatch, true);
          return {
            value: result,
            remainingExpr: expr.substring(fullMatch.length)
          };
        } catch (error) {
          throw error;
        }
      }
    }
    if (expr[0] === "-" && !expr.includes("[") && !expr.includes(":")) {
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
        remainingExpr: factorResult.remainingExpr
      };
    }
    const numberResult = Parser.#parseInterval(expr, options);
    if (numberResult.remainingExpr.length > 0 && (numberResult.remainingExpr[0] === "E" || numberResult.remainingExpr.startsWith("TE") || numberResult.remainingExpr.startsWith("_^"))) {
      const eResult = Parser.#parseENotation(numberResult.value, numberResult.remainingExpr, options);
      let factorialResult2 = eResult;
      if (factorialResult2.remainingExpr.length > 1 && factorialResult2.remainingExpr.substring(0, 2) === "!!") {
        if (factorialResult2.value instanceof Integer) {
          factorialResult2 = {
            value: factorialResult2.value.doubleFactorial(),
            remainingExpr: factorialResult2.remainingExpr.substring(2)
          };
        } else if (factorialResult2.value instanceof Rational && factorialResult2.value.denominator === 1n) {
          const intValue = new Integer(factorialResult2.value.numerator);
          factorialResult2 = {
            value: intValue.doubleFactorial().toRational(),
            remainingExpr: factorialResult2.remainingExpr.substring(2)
          };
        } else if (factorialResult2.value.low && factorialResult2.value.high && factorialResult2.value.low.equals(factorialResult2.value.high) && factorialResult2.value.low.denominator === 1n) {
          const intValue = new Integer(factorialResult2.value.low.numerator);
          const factorialValue = intValue.doubleFactorial();
          const IntervalClass = factorialResult2.value.constructor;
          factorialResult2 = {
            value: new IntervalClass(factorialValue.toRational(), factorialValue.toRational()),
            remainingExpr: factorialResult2.remainingExpr.substring(2)
          };
        } else {
          throw new Error("Double factorial is not defined for negative integers");
        }
      } else if (factorialResult2.remainingExpr.length > 0 && factorialResult2.remainingExpr[0] === "!") {
        if (factorialResult2.value instanceof Integer) {
          factorialResult2 = {
            value: factorialResult2.value.factorial(),
            remainingExpr: factorialResult2.remainingExpr.substring(1)
          };
        } else if (factorialResult2.value instanceof Rational && factorialResult2.value.denominator === 1n) {
          const intValue = new Integer(factorialResult2.value.numerator);
          factorialResult2 = {
            value: intValue.factorial().toRational(),
            remainingExpr: factorialResult2.remainingExpr.substring(1)
          };
        } else if (factorialResult2.value.low && factorialResult2.value.high && factorialResult2.value.low.equals(factorialResult2.value.high) && factorialResult2.value.low.denominator === 1n) {
          const intValue = new Integer(factorialResult2.value.low.numerator);
          const factorialValue = intValue.factorial();
          const IntervalClass = factorialResult2.value.constructor;
          factorialResult2 = {
            value: new IntervalClass(factorialValue.toRational(), factorialValue.toRational()),
            remainingExpr: factorialResult2.remainingExpr.substring(1)
          };
        } else {
          throw new Error("Factorial is not defined for negative integers");
        }
      }
      if (factorialResult2.remainingExpr.length > 0) {
        if (factorialResult2.remainingExpr[0] === "^") {
          const powerExpr = factorialResult2.remainingExpr.substring(1);
          let powerResult;
          let isIntegerExponent = false;
          try {
            powerResult = Parser.#parseExponent(powerExpr);
            isIntegerExponent = true;
          } catch (e) {
            powerResult = Parser.#parseExponentExpression(powerExpr, options);
            isIntegerExponent = false;
          }
          const isZeroBase = factorialResult2.value instanceof Integer && factorialResult2.value.value === 0n || factorialResult2.value instanceof Rational && factorialResult2.value.numerator === 0n || factorialResult2.value.low && factorialResult2.value.high && factorialResult2.value.low.equals(new Rational(0)) && factorialResult2.value.high.equals(new Rational(0));
          const isZeroExponent = isIntegerExponent ? powerResult.value === 0n : powerResult.value instanceof Rational && powerResult.value.numerator === 0n || powerResult.value instanceof Integer && powerResult.value.value === 0n;
          if (isZeroBase && isZeroExponent) {
            throw new Error("Zero cannot be raised to the power of zero");
          }
          let result;
          if (isIntegerExponent) {
            result = factorialResult2.value.pow(powerResult.value);
          } else {
            const precision = options.precision || DEFAULT_PRECISION;
            result = rationalIntervalPower(factorialResult2.value, powerResult.value, precision);
          }
          return {
            value: result,
            remainingExpr: powerResult.remainingExpr
          };
        } else if (factorialResult2.remainingExpr.length > 1 && factorialResult2.remainingExpr[0] === "*" && factorialResult2.remainingExpr[1] === "*") {
          const powerExpr = factorialResult2.remainingExpr.substring(2);
          const powerResult = Parser.#parseExponent(powerExpr);
          const isZeroExponent = powerResult.value === 0n;
          if (isZeroExponent) {
            throw new Error("Multiplicative exponentiation requires at least one factor");
          }
          let base = factorialResult2.value;
          if (!(base instanceof RationalInterval)) {
            base = RationalInterval.point(base instanceof Integer ? base.toRational() : base);
          }
          const result = base.mpow(powerResult.value);
          result._skipPromotion = true;
          return {
            value: result,
            remainingExpr: powerResult.remainingExpr
          };
        }
      }
      return factorialResult2;
    }
    let factorialResult = numberResult;
    if (factorialResult.remainingExpr.length > 1 && factorialResult.remainingExpr.substring(0, 2) === "!!") {
      if (factorialResult.value instanceof Integer) {
        factorialResult = {
          value: factorialResult.value.doubleFactorial(),
          remainingExpr: factorialResult.remainingExpr.substring(2)
        };
      } else if (factorialResult.value instanceof Rational && factorialResult.value.denominator === 1n) {
        const intValue = new Integer(factorialResult.value.numerator);
        factorialResult = {
          value: intValue.doubleFactorial().toRational(),
          remainingExpr: factorialResult.remainingExpr.substring(2)
        };
      } else if (factorialResult.value.low && factorialResult.value.high && factorialResult.value.low.equals(factorialResult.value.high) && factorialResult.value.low.denominator === 1n) {
        const intValue = new Integer(factorialResult.value.low.numerator);
        const factorialValue = intValue.doubleFactorial();
        const IntervalClass = factorialResult.value.constructor;
        factorialResult = {
          value: new IntervalClass(factorialValue.toRational(), factorialValue.toRational()),
          remainingExpr: factorialResult.remainingExpr.substring(2)
        };
      } else {
        throw new Error("Double factorial is not defined for negative integers");
      }
    } else if (factorialResult.remainingExpr.length > 0 && factorialResult.remainingExpr[0] === "!") {
      if (factorialResult.value instanceof Integer) {
        factorialResult = {
          value: factorialResult.value.factorial(),
          remainingExpr: factorialResult.remainingExpr.substring(1)
        };
      } else if (factorialResult.value instanceof Rational && factorialResult.value.denominator === 1n) {
        const intValue = new Integer(factorialResult.value.numerator);
        factorialResult = {
          value: intValue.factorial().toRational(),
          remainingExpr: factorialResult.remainingExpr.substring(1)
        };
      } else if (factorialResult.value.low && factorialResult.value.high && factorialResult.value.low.equals(factorialResult.value.high) && factorialResult.value.low.denominator === 1n) {
        const intValue = new Integer(factorialResult.value.low.numerator);
        const factorialValue = intValue.factorial();
        const IntervalClass = factorialResult.value.constructor;
        factorialResult = {
          value: new IntervalClass(factorialValue.toRational(), factorialValue.toRational()),
          remainingExpr: factorialResult.remainingExpr.substring(1)
        };
      } else {
        throw new Error("Factorial is not defined for negative integers");
      }
    }
    if (factorialResult.remainingExpr.length > 0) {
      if (factorialResult.remainingExpr[0] === "^") {
        const powerExpr = factorialResult.remainingExpr.substring(1);
        let powerResult;
        let isIntegerExponent = false;
        if (powerExpr.startsWith("(")) {
          powerResult = Parser.#parseExpression(powerExpr.substring(1), options);
          if (powerResult.remainingExpr.length === 0 || powerResult.remainingExpr[0] !== ")") {
            throw new Error("Missing closing parenthesis in exponent");
          }
          powerResult.remainingExpr = powerResult.remainingExpr.substring(1);
          isIntegerExponent = false;
        } else {
          try {
            powerResult = Parser.#parseExponent(powerExpr);
            isIntegerExponent = true;
          } catch (e) {
            powerResult = Parser.#parseExponentExpression(powerExpr, options);
            isIntegerExponent = false;
          }
        }
        const isZeroBase = factorialResult.value instanceof Integer && factorialResult.value.value === 0n || factorialResult.value instanceof Rational && factorialResult.value.numerator === 0n || factorialResult.value.low && factorialResult.value.high && factorialResult.value.low.equals(new Rational(0)) && factorialResult.value.high.equals(new Rational(0));
        const isZeroExponent = isIntegerExponent ? powerResult.value === 0n : powerResult.value instanceof Rational && powerResult.value.numerator === 0n || powerResult.value instanceof Integer && powerResult.value.value === 0n;
        if (isZeroBase && isZeroExponent) {
          throw new Error("Zero cannot be raised to the power of zero");
        }
        let result;
        if (isIntegerExponent) {
          result = factorialResult.value.pow(powerResult.value);
        } else {
          const precision = options.precision || DEFAULT_PRECISION;
          result = rationalIntervalPower(factorialResult.value, powerResult.value, precision);
          result._skipPromotion = true;
        }
        return {
          value: result,
          remainingExpr: powerResult.remainingExpr
        };
      } else if (factorialResult.remainingExpr.length > 1 && factorialResult.remainingExpr[0] === "*" && factorialResult.remainingExpr[1] === "*") {
        const powerExpr = factorialResult.remainingExpr.substring(2);
        let powerResult;
        if (powerExpr.startsWith("(")) {
          powerResult = Parser.#parseExpression(powerExpr.substring(1), options);
          if (powerResult.remainingExpr.length === 0 || powerResult.remainingExpr[0] !== ")") {
            throw new Error("Missing closing parenthesis in exponent");
          }
          powerResult.remainingExpr = powerResult.remainingExpr.substring(1);
        } else {
          try {
            powerResult = Parser.#parseExponent(powerExpr);
          } catch (e) {
            powerResult = Parser.#parseExpression(powerExpr, options);
          }
        }
        let base = factorialResult.value;
        const isIntegerExponent = powerResult.value instanceof Integer || powerResult.value instanceof Rational && powerResult.value.denominator === 1n;
        const isZeroExponent = powerResult.value instanceof Integer && powerResult.value.value === 0n || powerResult.value instanceof Rational && powerResult.value.numerator === 0n;
        if (isZeroExponent) {
          throw new Error("Multiplicative exponentiation requires at least one factor");
        }
        let result;
        if (isIntegerExponent) {
          if (!(base instanceof RationalInterval)) {
            base = RationalInterval.point(base instanceof Integer ? base.toRational() : base);
          }
          const exponentBigInt = powerResult.value instanceof Integer ? powerResult.value.value : powerResult.value.numerator;
          result = base.mpow(exponentBigInt);
        } else {
          const precision = options.precision || DEFAULT_PRECISION;
          result = rationalIntervalPower(base, powerResult.value, precision);
        }
        result._skipPromotion = true;
        return {
          value: result,
          remainingExpr: powerResult.remainingExpr
        };
      }
    }
    return factorialResult;
  }
  static #parseExponent(expr) {
    let i = 0;
    let isNegative2 = false;
    if (expr.length > 0 && expr[0] === "-") {
      isNegative2 = true;
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
    const exponent = isNegative2 ? -BigInt(exponentStr) : BigInt(exponentStr);
    if (exponent === 0n) {
      throw new Error("Multiplicative exponentiation requires at least one factor");
    }
    return {
      value: exponent,
      remainingExpr: expr.substring(i)
    };
  }
  static #parseExponentExpression(expr, options) {
    return Parser.#parseFactor(expr, options);
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
    if (options.inputBase && options.inputBase !== BaseSystem.DECIMAL) {
      return Parser.#parseBaseAwareENotation(value, expr, options);
    }
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
      remainingExpr: exponentResult.remainingExpr
    };
  }
  static #parseBaseAwareENotation(value, expr, options = {}) {
    const baseSystem = options.inputBase;
    if (!baseSystem) {
      throw new Error("Base-aware E notation requires inputBase option");
    }
    const baseContainsE = baseSystem.characters.includes("E") || baseSystem.characters.includes("e");
    let notationType;
    let startIndex;
    if (baseContainsE) {
      if (!expr.startsWith("_^")) {
        throw new Error("Expected _^ notation for bases containing E");
      }
      notationType = "_^";
      startIndex = 2;
    } else {
      if (!expr.startsWith("E") && !expr.startsWith("e")) {
        throw new Error("Expected E notation");
      }
      notationType = "E";
      startIndex = 1;
    }
    let endIndex = startIndex;
    if (endIndex < expr.length && expr[endIndex] === "-") {
      endIndex++;
    }
    while (endIndex < expr.length) {
      const char = expr[endIndex];
      if (baseSystem.charMap.has(char)) {
        endIndex++;
      } else {
        break;
      }
    }
    if (endIndex === startIndex || endIndex === startIndex + 1 && expr[startIndex] === "-") {
      throw new Error(`Missing exponent after ${notationType} notation`);
    }
    const exponentStr = expr.substring(startIndex, endIndex);
    const testExponentStr = exponentStr.startsWith("-") ? exponentStr.substring(1) : exponentStr;
    if (!baseSystem.isValidString(testExponentStr)) {
      throw new Error(`Invalid exponent "${exponentStr}" for base ${baseSystem.base}`);
    }
    let exponentDecimal;
    try {
      exponentDecimal = baseSystem.toDecimal(exponentStr);
    } catch (error) {
      throw new Error(`Failed to parse exponent "${exponentStr}": ${error.message}`);
    }
    let powerOfBase;
    const baseBigInt = BigInt(baseSystem.base);
    if (exponentDecimal >= 0n) {
      powerOfBase = new Rational(baseBigInt ** exponentDecimal);
    } else {
      powerOfBase = new Rational(1n, baseBigInt ** -exponentDecimal);
    }
    let valueRational;
    if (value instanceof Integer) {
      valueRational = value.toRational();
    } else if (value instanceof Rational) {
      valueRational = value;
    } else {
      throw new Error(`${notationType} notation can only be applied to simple numbers, not intervals`);
    }
    const result = valueRational.multiply(powerOfBase);
    return {
      value: Parser.#promoteType(result, options),
      remainingExpr: expr.substring(endIndex)
    };
  }
  static #parseInterval(expr, options = {}) {
    if (expr.includes("[") && expr.includes("]") && /^-?\d*\.?\d*\[/.test(expr)) {
      try {
        const result = parseDecimalUncertainty(expr);
        return {
          value: result,
          remainingExpr: ""
        };
      } catch {}
    }
    if (expr.includes(".~")) {
      if (expr.includes(":")) {
        const colonIndex = expr.indexOf(":");
        const leftPart = expr.substring(0, colonIndex);
        const rightPart = expr.substring(colonIndex + 1);
        if (leftPart.includes(".~") || rightPart.includes(".~")) {
          try {
            let leftResult;
            if (leftPart.includes(".~")) {
              leftResult = Parser.#parseContinuedFraction(leftPart, options);
            } else {
              leftResult = Parser.#parseInterval(leftPart, options);
            }
            let rightResult;
            if (rightPart.includes(".~")) {
              rightResult = Parser.#parseContinuedFraction(rightPart, options);
            } else {
              rightResult = Parser.#parseInterval(rightPart, options);
            }
            let leftRational, rightRational;
            if (leftResult.value instanceof Integer) {
              leftRational = leftResult.value.toRational();
            } else if (leftResult.value instanceof Rational) {
              leftRational = leftResult.value;
            } else {
              throw new Error("Left side must evaluate to a rational");
            }
            if (rightResult.value instanceof Integer) {
              rightRational = rightResult.value.toRational();
            } else if (rightResult.value instanceof Rational) {
              rightRational = rightResult.value;
            } else if (rightResult.value instanceof RationalInterval && rightResult.value.isPoint()) {
              rightRational = rightResult.value.low;
            } else {
              throw new Error("Right side must evaluate to a rational");
            }
            const interval2 = new RationalInterval(leftRational, rightRational);
            return {
              value: interval2,
              remainingExpr: rightResult.remainingExpr
            };
          } catch (error) {}
        }
      }
      try {
        const cfResult = Parser.#parseContinuedFraction(expr, options);
        return cfResult;
      } catch (error) {}
    }
    if (expr.includes(".") && !expr.includes("#") && !expr.includes(":") && !expr.includes("[")) {
      let endIndex = 0;
      let hasDecimalPoint = false;
      if (expr[endIndex] === "-") {
        endIndex++;
      }
      const baseSystem = options.inputBase || BaseSystem.DECIMAL;
      while (endIndex < expr.length) {
        const char = expr[endIndex];
        if (baseSystem.charMap.has(char)) {
          endIndex++;
        } else if (char === "." && !hasDecimalPoint && endIndex + 1 < expr.length && expr[endIndex + 1] !== ".") {
          hasDecimalPoint = true;
          endIndex++;
        } else {
          break;
        }
      }
      if (hasDecimalPoint && endIndex > (expr[0] === "-" ? 2 : 1)) {
        const decimalStr = expr.substring(0, endIndex);
        try {
          if (options.inputBase && options.inputBase !== BaseSystem.DECIMAL) {
            const result = parseBaseNotation(decimalStr, options.inputBase, options);
            return {
              value: result,
              remainingExpr: expr.substring(endIndex)
            };
          } else if (options.typeAware) {
            const result = new Rational(decimalStr);
            return {
              value: result,
              remainingExpr: expr.substring(endIndex)
            };
          } else {
            const isNegative2 = decimalStr.startsWith("-");
            const absDecimalStr = isNegative2 ? decimalStr.substring(1) : decimalStr;
            const result = parseNonRepeatingDecimal(absDecimalStr, isNegative2);
            return {
              value: result,
              remainingExpr: expr.substring(endIndex)
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
        if (/^-?[\d.#]+$/.test(beforeColon) && /^-?[\d.#]/.test(afterColonStart) && (beforeColon.includes("#") || afterColonStart.includes("#"))) {
          try {
            const possibleInterval = parseRepeatingDecimal(expr);
            if (possibleInterval instanceof RationalInterval) {
              let endIndex = expr.length;
              for (let i = 1;i < expr.length; i++) {
                const testExpr = expr.substring(0, i);
                try {
                  const testResult = parseRepeatingDecimal(testExpr);
                  if (testResult instanceof RationalInterval) {
                    if (i === expr.length || !/[\d#.\-]/.test(expr[i])) {
                      endIndex = i;
                      const finalResult = parseRepeatingDecimal(expr.substring(0, endIndex));
                      if (finalResult instanceof RationalInterval) {
                        return {
                          value: finalResult,
                          remainingExpr: expr.substring(endIndex)
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
                    remainingExpr: ""
                  };
                }
              } catch {}
            }
          } catch {}
        }
      }
    }
    if (options.inputBase && options.inputBase !== BaseSystem.DECIMAL && !expr.includes("[") && !expr.includes("#")) {
      try {
        let endIndex = 0;
        let hasDecimalPoint = false;
        let hasMixedNumber = false;
        let hasFraction = false;
        let hasColon = false;
        if (expr[endIndex] === "-") {
          endIndex++;
        }
        while (endIndex < expr.length) {
          const char = expr[endIndex];
          if (options.inputBase.charMap.has(char)) {
            endIndex++;
          } else if (char === "." && endIndex + 1 < expr.length && expr[endIndex + 1] === ".") {
            if (hasMixedNumber || hasDecimalPoint || hasFraction || hasColon)
              break;
            hasMixedNumber = true;
            endIndex += 2;
          } else if (char === "." && !hasDecimalPoint && !hasMixedNumber) {
            hasDecimalPoint = true;
            endIndex++;
          } else if (char === "/" && !hasFraction) {
            hasFraction = true;
            endIndex++;
          } else if (char === ":" && !hasColon && !hasMixedNumber && !hasDecimalPoint) {
            hasColon = true;
            endIndex++;
          } else {
            break;
          }
        }
        if (endIndex > (expr[0] === "-" ? 1 : 0)) {
          const numberStr = expr.substring(0, endIndex);
          const testStr = numberStr.startsWith("-") ? numberStr.substring(1) : numberStr;
          const parts = testStr.split(/[\.\/\:]/);
          const isValidInBase = parts.every((part, index) => {
            if (part === "") {
              return testStr.includes(".") && (index === 0 || index === parts.length - 1);
            }
            return part.split("").every((char) => options.inputBase.charMap.has(char));
          });
          if (isValidInBase) {
            const result = parseBaseNotation(numberStr, options.inputBase, options);
            return {
              value: result,
              remainingExpr: expr.substring(endIndex)
            };
          }
        }
      } catch (error) {}
    }
    const firstResult = Parser.#parseRational(expr, options);
    let firstValue = firstResult.value;
    let remainingAfterFirst = firstResult.remainingExpr;
    if (remainingAfterFirst.length > 0 && remainingAfterFirst[0] === "E") {
      let eEndIndex = 1;
      if (eEndIndex < remainingAfterFirst.length && remainingAfterFirst[eEndIndex] === "-") {
        eEndIndex++;
      }
      while (eEndIndex < remainingAfterFirst.length && /\d/.test(remainingAfterFirst[eEndIndex])) {
        eEndIndex++;
      }
      if (eEndIndex < remainingAfterFirst.length && remainingAfterFirst[eEndIndex] === ":") {
        const eNotationPart = remainingAfterFirst.substring(0, eEndIndex);
        const firstInterval = RationalInterval.point(firstResult.value);
        const eResult = Parser.#parseENotation(firstInterval, eNotationPart, options);
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
              remainingExpr: remainingAfterFirst
            };
          }
          return {
            value: new Integer(firstValue.numerator),
            remainingExpr: remainingAfterFirst
          };
        }
        return {
          value: firstValue,
          remainingExpr: remainingAfterFirst
        };
      } else {
        const pointValue = RationalInterval.point(firstValue);
        return {
          value: pointValue,
          remainingExpr: remainingAfterFirst
        };
      }
    }
    const secondRationalExpr = remainingAfterFirst.substring(1);
    const secondResult = Parser.#parseRational(secondRationalExpr, options);
    let secondValue = secondResult.value;
    let remainingExpr = secondResult.remainingExpr;
    if (remainingExpr.length > 0 && (remainingExpr[0] === "E" || remainingExpr.startsWith("_^"))) {
      const secondInterval = RationalInterval.point(secondResult.value);
      const eResult = Parser.#parseENotation(secondInterval, remainingExpr, options);
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
      remainingExpr
    };
  }
  static #parseRational(expr, options = {}) {
    if (expr.length === 0) {
      throw new Error("Unexpected end of expression");
    }
    if (options.inputBase && options.inputBase !== BaseSystem.DECIMAL && !expr.includes("[") && !expr.includes("#")) {
      let endIndex = 0;
      let hasDecimalPoint = false;
      let hasMixedNumber = false;
      let hasFraction = false;
      if (expr[endIndex] === "-") {
        endIndex++;
      }
      while (endIndex < expr.length) {
        const char = expr[endIndex];
        let isValidChar = options.inputBase.charMap.has(char);
        if (!isValidChar) {
          const baseUsesLowercase = options.inputBase.characters.some((ch) => ch >= "a" && ch <= "z");
          const baseUsesUppercase = options.inputBase.characters.some((ch) => ch >= "A" && ch <= "Z");
          if (baseUsesLowercase && !baseUsesUppercase && char >= "A" && char <= "Z") {
            isValidChar = options.inputBase.charMap.has(char.toLowerCase());
          } else if (baseUsesUppercase && !baseUsesLowercase && char >= "a" && char <= "z") {
            isValidChar = options.inputBase.charMap.has(char.toUpperCase());
          }
        }
        if (isValidChar) {
          endIndex++;
        } else if (char === "." && endIndex + 1 < expr.length && expr[endIndex + 1] === ".") {
          if (hasMixedNumber || hasDecimalPoint || hasFraction)
            break;
          hasMixedNumber = true;
          endIndex += 2;
        } else if (char === "." && !hasDecimalPoint && !hasMixedNumber) {
          hasDecimalPoint = true;
          endIndex++;
        } else if (char === "/" && !hasFraction) {
          hasFraction = true;
          endIndex++;
        } else if ((char === "E" || char === "e") && !options.inputBase.characters.includes("E") && !options.inputBase.characters.includes("e")) {
          break;
        } else if (char === "_" && endIndex + 1 < expr.length && expr[endIndex + 1] === "^") {
          break;
        } else {
          break;
        }
      }
      if (endIndex > (expr[0] === "-" ? 1 : 0)) {
        const numberStr = expr.substring(0, endIndex);
        const testStr = numberStr.startsWith("-") ? numberStr.substring(1) : numberStr;
        const parts = testStr.split(/[\.\/]/);
        const isValidInBase = parts.every((part, index) => {
          if (part === "") {
            return testStr.includes(".") && (index === 0 || index === parts.length - 1 || testStr.includes(".."));
          }
          const baseUsesLowercase = options.inputBase.characters.some((char) => char >= "a" && char <= "z");
          const baseUsesUppercase = options.inputBase.characters.some((char) => char >= "A" && char <= "Z");
          return part.split("").every((char) => {
            if (options.inputBase.charMap.has(char)) {
              return true;
            }
            if (baseUsesLowercase && !baseUsesUppercase && char >= "A" && char <= "Z") {
              return options.inputBase.charMap.has(char.toLowerCase());
            }
            if (baseUsesUppercase && !baseUsesLowercase && char >= "a" && char <= "z") {
              return options.inputBase.charMap.has(char.toUpperCase());
            }
            return false;
          });
        });
        if (isValidInBase) {
          try {
            const result = parseBaseNotation(numberStr, options.inputBase, options);
            return {
              value: result,
              remainingExpr: expr.substring(endIndex)
            };
          } catch (error) {}
        }
      }
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
            const midpoint = result.low.add(result.high).divide(new Rational(2));
            return {
              value: midpoint,
              remainingExpr: expr.substring(endIndex)
            };
          } else {
            return {
              value: result,
              remainingExpr: expr.substring(endIndex)
            };
          }
        } catch (error) {
          throw new Error(`Invalid repeating decimal: ${error.message}`);
        }
      }
    }
    let decimalIndex = expr.indexOf(".");
    if (decimalIndex !== -1 && decimalIndex + 1 < expr.length && expr[decimalIndex + 1] !== ".") {
      let endIndex = 0;
      let hasDecimalPoint = false;
      if (expr[endIndex] === "-") {
        endIndex++;
      }
      while (endIndex < expr.length) {
        if (/\d/.test(expr[endIndex])) {
          endIndex++;
        } else if (expr[endIndex] === "." && !hasDecimalPoint && endIndex + 1 < expr.length && expr[endIndex + 1] !== ".") {
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
            remainingExpr: expr.substring(endIndex)
          };
        } catch (error) {}
      }
    }
    let i = 0;
    let numeratorStr = "";
    let denominatorStr = "";
    let isNegative2 = false;
    let wholePart = 0n;
    let hasMixedForm = false;
    if (expr[i] === "-") {
      isNegative2 = true;
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
      wholePart = isNegative2 ? -BigInt(numeratorStr) : BigInt(numeratorStr);
      isNegative2 = false;
      i += 2;
      numeratorStr = "";
      while (i < expr.length && /\d/.test(expr[i])) {
        numeratorStr += expr[i];
        i++;
      }
      if (numeratorStr.length === 0) {
        throw new Error('Invalid mixed number format: missing numerator after ".."');
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
        const numerator2 = isNegative2 ? -BigInt(numeratorStr) : BigInt(numeratorStr);
        return {
          value: new Rational(numerator2, 1n),
          remainingExpr: expr.substring(i - 1)
        };
      }
      if (i < expr.length && expr[i] === "(") {
        if (hasMixedForm) {
          throw new Error("Invalid mixed number format: missing denominator");
        }
        const numerator2 = isNegative2 ? -BigInt(numeratorStr) : BigInt(numeratorStr);
        return {
          value: new Rational(numerator2, 1n),
          remainingExpr: expr.substring(i - 1)
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
        throw new Error("E notation not allowed directly after fraction without parentheses");
      }
    } else {
      if (hasMixedForm) {
        throw new Error("Invalid mixed number format: missing denominator");
      }
      denominatorStr = "1";
    }
    if (hasMixedForm && i < expr.length && expr[i] === "E") {
      throw new Error("E notation not allowed directly after mixed number without parentheses");
    }
    let numerator, denominator;
    if (hasMixedForm) {
      numerator = BigInt(numeratorStr);
      denominator = BigInt(denominatorStr);
      const sign = wholePart < 0n ? -1n : 1n;
      numerator = sign * ((wholePart.valueOf() < 0n ? -wholePart : wholePart) * denominator + numerator);
    } else {
      numerator = isNegative2 ? -BigInt(numeratorStr) : BigInt(numeratorStr);
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
      remainingExpr: expr.substring(i)
    };
  }
  static #parseContinuedFraction(expr, options = {}) {
    const cfMatch = expr.match(/^(-?\d+)\.~((?:\d+~?)*\d*)(.*)$/);
    if (!cfMatch) {
      throw new Error("Invalid continued fraction format");
    }
    const [fullMatch, integerPart, cfTermsStr, remaining] = cfMatch;
    if (cfTermsStr === "") {
      throw new Error("Continued fraction must have at least one term after .~");
    }
    if (cfTermsStr.endsWith("~")) {
      throw new Error("Continued fraction cannot end with ~");
    }
    if (cfTermsStr.includes("~~")) {
      throw new Error("Invalid continued fraction format: double tilde");
    }
    const cfArray = Parser.parseContinuedFraction(fullMatch.substring(0, fullMatch.length - remaining.length));
    if (typeof Rational.fromContinuedFraction === "function") {
      const rational = Rational.fromContinuedFraction(cfArray);
      return {
        value: rational,
        remainingExpr: remaining
      };
    } else {
      throw new Error("Continued fraction support not yet implemented in Rational class");
    }
  }
  static parseContinuedFraction(cfString) {
    const cfMatch = cfString.match(/^(-?\d+)\.~(.*)$/);
    if (!cfMatch) {
      throw new Error("Invalid continued fraction format");
    }
    const [, integerPart, cfTermsStr] = cfMatch;
    const intPart = BigInt(integerPart);
    if (cfTermsStr === "0") {
      return [intPart];
    }
    if (cfTermsStr === "") {
      throw new Error("Continued fraction must have at least one term after .~");
    }
    if (cfTermsStr.endsWith("~")) {
      throw new Error("Continued fraction cannot end with ~");
    }
    if (cfTermsStr.includes("~~")) {
      throw new Error("Invalid continued fraction format: double tilde");
    }
    const terms = cfTermsStr.split("~");
    const cfTerms = [];
    for (const term of terms) {
      if (!/^\d+$/.test(term)) {
        throw new Error(`Invalid continued fraction term: ${term}`);
      }
      const termValue = BigInt(term);
      if (termValue <= 0n) {
        throw new Error(`Continued fraction terms must be positive integers: ${term}`);
      }
      cfTerms.push(termValue);
    }
    return [intPart, ...cfTerms];
  }
}

// src/fraction.js
class Fraction {
  #numerator;
  #denominator;
  constructor(numerator, denominator = 1n, options = {}) {
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
      if (options.allowInfinite && (this.#numerator === 1n || this.#numerator === -1n)) {
        this._isInfinite = true;
      } else {
        throw new Error("Denominator cannot be zero");
      }
    } else {
      this._isInfinite = false;
    }
  }
  get numerator() {
    return this.#numerator;
  }
  get denominator() {
    return this.#denominator;
  }
  get isInfinite() {
    return this._isInfinite || false;
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
    return new Fraction(this.#numerator * other.numerator, this.#denominator * other.denominator);
  }
  divide(other) {
    if (other.numerator === 0n) {
      throw new Error("Division by zero");
    }
    return new Fraction(this.#numerator * other.denominator, this.#denominator * other.numerator);
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
    return new Fraction(this.#numerator * scaleFactor, this.#denominator * scaleFactor);
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
    return new Fraction(a.numerator + b.numerator, a.denominator + b.denominator);
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
    return this.#numerator === other.numerator && this.#denominator === other.denominator;
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
  mediant(other) {
    if (this.isInfinite && other.isInfinite) {
      if (this.#numerator === -1n && other.numerator === 1n) {
        return new Fraction(0n, 1n);
      } else if (this.#numerator === 1n && other.numerator === -1n) {
        return new Fraction(0n, 1n);
      }
      throw new Error("Cannot compute mediant of two infinite fractions");
    }
    if (this.isInfinite || other.isInfinite) {
      const newNum2 = this.#numerator + other.numerator;
      const newDen2 = this.#denominator + other.denominator;
      if (newNum2 === 0n && newDen2 === 0n) {
        throw new Error("Mediant would result in 0/0");
      }
      return new Fraction(newNum2, newDen2);
    }
    const newNum = this.#numerator + other.numerator;
    const newDen = this.#denominator + other.denominator;
    return new Fraction(newNum, newDen);
  }
  fareyParents() {
    if (this.isInfinite) {
      throw new Error("Cannot find Farey parents of infinite fraction");
    }
    if (this.#numerator === 0n && this.#denominator === 1n) {
      const left = new Fraction(-1n, 0n, { allowInfinite: true });
      const right = new Fraction(1n, 0n, { allowInfinite: true });
      return { left, right };
    }
    let leftBound = new Fraction(-1n, 0n, { allowInfinite: true });
    let rightBound = new Fraction(1n, 0n, { allowInfinite: true });
    let current = new Fraction(0n, 1n);
    while (!current.equals(this)) {
      if (this.lessThan(current)) {
        rightBound = current;
        current = leftBound.mediant(current);
      } else {
        leftBound = current;
        current = current.mediant(rightBound);
      }
    }
    return { left: leftBound, right: rightBound };
  }
  _extendedGcd(a, b) {
    if (b === 0n) {
      return { gcd: a, x: 1n, y: 0n };
    }
    const result = this._extendedGcd(b, a % b);
    const x = result.y;
    const y = result.x - a / b * result.y;
    return { gcd: result.gcd, x, y };
  }
  static mediantPartner(endpoint, mediant) {
    if (endpoint.isInfinite || mediant.isInfinite) {
      throw new Error("Cannot compute mediant partner with infinite fractions");
    }
    const p = endpoint.numerator;
    const q = endpoint.denominator;
    const a = mediant.numerator;
    const b = mediant.denominator;
    const s = 1n;
    const numerator = a * (q + s) - b * p;
    if (numerator % b !== 0n) {
      const r2 = a * 2n - p;
      const s_calculated = b * 2n - q;
      return new Fraction(r2, s_calculated);
    }
    const r = numerator / b;
    return new Fraction(r, s);
  }
  static isMediantTriple(left, mediant, right) {
    if (mediant.isInfinite) {
      return false;
    }
    if (left.isInfinite && right.isInfinite) {
      return false;
    }
    try {
      const computedMediant = left.mediant(right);
      return mediant.equals(computedMediant);
    } catch (error) {
      return false;
    }
  }
  static isFareyTriple(left, mediant, right) {
    if (!Fraction.isMediantTriple(left, mediant, right)) {
      return false;
    }
    if (!left.isInfinite && !right.isInfinite) {
      const a = left.numerator;
      const b = left.denominator;
      const c = right.numerator;
      const d = right.denominator;
      const determinant = a * d - b * c;
      return determinant === 1n || determinant === -1n;
    }
    return left.isInfinite || right.isInfinite;
  }
  sternBrocotParent() {
    if (this.isInfinite) {
      throw new Error("Infinite fractions don't have parents in Stern-Brocot tree");
    }
    if (this.numerator === 0n && this.denominator === 1n) {
      return null;
    }
    const path = this.sternBrocotPath();
    if (path.length === 0) {
      return null;
    }
    const parentPath = path.slice(0, -1);
    return Fraction.fromSternBrocotPath(parentPath);
  }
  sternBrocotChildren() {
    if (this.isInfinite) {
      throw new Error("Infinite fractions don't have children in Stern-Brocot tree");
    }
    const currentPath = this.sternBrocotPath();
    const leftPath = [...currentPath, "L"];
    const rightPath = [...currentPath, "R"];
    return {
      left: Fraction.fromSternBrocotPath(leftPath),
      right: Fraction.fromSternBrocotPath(rightPath)
    };
  }
  sternBrocotPath() {
    if (this.isInfinite) {
      throw new Error("Infinite fractions don't have tree paths");
    }
    const reduced = this.reduce();
    if (reduced.numerator === 0n && reduced.denominator === 1n) {
      return [];
    }
    let left = new Fraction(-1, 0, { allowInfinite: true });
    let right = new Fraction(1, 0, { allowInfinite: true });
    let current = new Fraction(0, 1);
    const path = [];
    while (!current.equals(reduced)) {
      if (reduced.lessThan(current)) {
        path.push("L");
        right = current;
        current = left.mediant(current);
      } else {
        path.push("R");
        left = current;
        current = current.mediant(right);
      }
      if (path.length > 500) {
        throw new Error("Stern-Brocot path too long - this may indicate a bug in the algorithm");
      }
    }
    return path;
  }
  static fromSternBrocotPath(path) {
    let left = new Fraction(-1, 0, { allowInfinite: true });
    let right = new Fraction(1, 0, { allowInfinite: true });
    let current = new Fraction(0, 1);
    for (const direction of path) {
      if (direction === "L") {
        right = current;
        current = left.mediant(current);
      } else if (direction === "R") {
        left = current;
        current = current.mediant(right);
      } else {
        throw new Error(`Invalid direction in path: ${direction}`);
      }
    }
    return current;
  }
  isSternBrocotValid() {
    if (this.isInfinite) {
      return this.numerator === 1n || this.numerator === -1n;
    }
    try {
      const path = this.sternBrocotPath();
      const reconstructed = Fraction.fromSternBrocotPath(path);
      return this.equals(reconstructed);
    } catch (error) {
      return false;
    }
  }
  sternBrocotDepth() {
    if (this.isInfinite) {
      return Infinity;
    }
    if (this.numerator === 0n && this.denominator === 1n) {
      return 0;
    }
    return this.sternBrocotPath().length;
  }
  sternBrocotAncestors() {
    if (this.isInfinite) {
      return [];
    }
    const ancestors = [];
    const path = this.sternBrocotPath();
    for (let i = 0;i < path.length; i++) {
      const partialPath = path.slice(0, i);
      ancestors.push(Fraction.fromSternBrocotPath(partialPath));
    }
    ancestors.reverse();
    return ancestors;
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
      new FractionInterval(mediant, this.#high)
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
    for (let level = 0;level < n; level++) {
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
      if (a.equals(b))
        return 0;
      if (a.lessThan(b))
        return -1;
      return 1;
    });
    if (!allPoints[0].equals(this.#low) || !allPoints[allPoints.length - 1].equals(this.#high)) {
      throw new Error("Partition points should be within the interval");
    }
    const uniquePoints = [];
    for (let i = 0;i < allPoints.length; i++) {
      if (i === 0 || !allPoints[i].equals(allPoints[i - 1])) {
        uniquePoints.push(allPoints[i]);
      }
    }
    const intervals = [];
    for (let i = 0;i < uniquePoints.length - 1; i++) {
      intervals.push(new FractionInterval(uniquePoints[i], uniquePoints[i + 1]));
    }
    return intervals;
  }
  toRationalInterval() {
    return new RationalInterval(this.#low.toRational(), this.#high.toRational());
  }
  static fromRationalInterval(interval) {
    return new FractionInterval(Fraction.fromRational(interval.low), Fraction.fromRational(interval.high));
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

// src/type-promotion.js
class TypePromotion {
  static getTypeLevel(value) {
    if (value instanceof Integer)
      return 0;
    if (value instanceof Rational)
      return 1;
    if (value instanceof RationalInterval)
      return 2;
    throw new Error(`Unknown type: ${value.constructor.name}`);
  }
  static integerToRational(integer) {
    return new Rational(integer.value, 1n);
  }
  static rationalToInterval(rational) {
    return new RationalInterval(rational, rational);
  }
  static integerToInterval(integer) {
    const rational = TypePromotion.integerToRational(integer);
    return TypePromotion.rationalToInterval(rational);
  }
  static promoteToLevel(value, targetLevel) {
    const currentLevel = TypePromotion.getTypeLevel(value);
    if (!Number.isInteger(targetLevel) || targetLevel < 0 || targetLevel > 2) {
      throw new Error(`Invalid target level: ${targetLevel}`);
    }
    if (currentLevel === targetLevel) {
      return value;
    }
    if (currentLevel > targetLevel) {
      throw new Error(`Cannot demote from level ${currentLevel} to level ${targetLevel}`);
    }
    let promoted = value;
    for (let level = currentLevel;level < targetLevel; level++) {
      if (level === 0) {
        promoted = TypePromotion.integerToRational(promoted);
      } else if (level === 1) {
        promoted = TypePromotion.rationalToInterval(promoted);
      }
    }
    return promoted;
  }
  static promoteToCommonType(a, b) {
    const levelA = TypePromotion.getTypeLevel(a);
    const levelB = TypePromotion.getTypeLevel(b);
    const targetLevel = Math.max(levelA, levelB);
    return [
      TypePromotion.promoteToLevel(a, targetLevel),
      TypePromotion.promoteToLevel(b, targetLevel)
    ];
  }
  static add(a, b) {
    const [promotedA, promotedB] = TypePromotion.promoteToCommonType(a, b);
    return promotedA.add(promotedB);
  }
  static subtract(a, b) {
    const [promotedA, promotedB] = TypePromotion.promoteToCommonType(a, b);
    return promotedA.subtract(promotedB);
  }
  static multiply(a, b) {
    const [promotedA, promotedB] = TypePromotion.promoteToCommonType(a, b);
    return promotedA.multiply(promotedB);
  }
  static divide(a, b) {
    if (a instanceof Integer && b instanceof Integer) {
      return a.divide(b);
    }
    const [promotedA, promotedB] = TypePromotion.promoteToCommonType(a, b);
    return promotedA.divide(promotedB);
  }
  static eNotation(base, exponent) {
    if (base.E && typeof base.E === "function") {
      return base.E(exponent);
    }
    const exp = BigInt(exponent);
    const powerOf10 = exp >= 0n ? new Rational(10n ** exp, 1n) : new Rational(1n, 10n ** -exp);
    return TypePromotion.multiply(base, powerOf10);
  }
  static power(base, exponent) {
    return base.pow(exponent);
  }
  static multiplyPower(base, exponent) {
    if (base.mpow && typeof base.mpow === "function") {
      return base.mpow(exponent);
    }
    return base.pow(exponent);
  }
  static negate(value) {
    if (value instanceof Integer) {
      return value.negate();
    } else if (value instanceof Rational) {
      return value.negate();
    } else if (value instanceof RationalInterval) {
      const negOne = new Rational(-1n, 1n);
      const negInterval = new RationalInterval(negOne, negOne);
      return negInterval.multiply(value);
    }
    throw new Error(`Cannot negate unknown type: ${value.constructor.name}`);
  }
  static determineTypeFromString(str) {
    if (str.includes(":")) {
      return "interval";
    }
    if (str.includes("/") || str.includes("..") || str.includes(".")) {
      return "rational";
    }
    if (str.includes("[") && str.includes("]")) {
      return "interval";
    }
    return "integer";
  }
}

// index.js
function R(strings, ...values) {
  let input = "";
  for (let i = 0;i < values.length; i++) {
    input += strings[i] + values[i];
  }
  input += strings[strings.length - 1];
  return Parser.parse(input, { typeAware: true });
}
function F(strings, ...values) {
  let input = "";
  for (let i = 0;i < values.length; i++) {
    input += strings[i] + values[i];
  }
  input += strings[strings.length - 1];
  const result = Parser.parse(input, { typeAware: false });
  if (result instanceof RationalInterval) {
    if (result.low.equals(result.high)) {
      return Fraction.fromRational(result.low);
    } else {
      const lowFrac = Fraction.fromRational(result.low);
      const highFrac = Fraction.fromRational(result.high);
      return new FractionInterval(lowFrac, highFrac);
    }
  } else if (result instanceof Rational) {
    return Fraction.fromRational(result);
  } else if (result instanceof Integer) {
    return new Fraction(result.value, 1n);
  } else {
    const rational = result.toRational ? result.toRational() : new Rational(result.toString());
    return Fraction.fromRational(rational);
  }
}
var ratmath_default = {
  Rational,
  RationalInterval,
  Parser,
  parseRepeatingDecimal,
  Fraction,
  FractionInterval,
  Integer,
  TypePromotion,
  BaseSystem,
  R,
  F
};
export {
  parseRepeatingDecimal,
  ratmath_default as default,
  TypePromotion,
  RationalInterval,
  Rational,
  R,
  Parser,
  Integer,
  FractionInterval,
  Fraction,
  F,
  BaseSystem
};

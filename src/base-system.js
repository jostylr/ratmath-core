/**
 * BaseSystem.js
 *
 * A class for managing different number base systems with character sequence notation.
 * Supports arbitrary bases using character ranges (e.g., "0-1" for binary, "0-9a-f" for hex).
 * Enables exact rational arithmetic and conversions across different numeral systems.
 */

export class BaseSystem {
  #base;
  #characters;
  #charMap;
  #name;

  // Prefix registry
  static #prefixMap = new Map();

  // Parser symbols that cannot be used in base character sets
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
    "~",
  ]);

  /**
   * Creates a new BaseSystem.
   *
   * @param {string|string[]} characters - Character sequence string or array of characters.
   *                                     NOTE: Does NOT support range notation (e.g., "0-9").
   *                                     Use BaseParser from @ratmath/parser for range parsing.
   * @param {string} [name] - Optional human-readable name for the base system
   * @throws {Error} If the character sequence is invalid or contains conflicts
   */
  constructor(characters, name) {
    if (typeof characters === "string") {
      this.#characters = characters.split("");
    } else if (Array.isArray(characters)) {
      this.#characters = [...characters];
    } else {
      throw new Error("Characters must be a string or array of strings");
    }

    if (this.#characters.length < 2) {
      throw new Error("Base system must have at least 2 characters");
    }

    this.#base = this.#characters.length;
    this.#charMap = this.#createCharacterMap();
    this.#name = name || `Base ${this.#base}`;

    this.#validateBase();
    this.#checkForConflicts();
  }


  /**
   * Gets the numeric base value
   * @returns {number} The base value (2, 16, etc.)
   */
  get base() {
    return this.#base;
  }

  /**
   * Gets the array of valid characters in order
   * @returns {string[]} Array of characters
   */
  get characters() {
    return [...this.#characters]; // Return copy to prevent mutation
  }

  /**
   * Gets the character to value mapping
   * @returns {Map<string, number>} Character to numeric value mapping
   */
  get charMap() {
    return new Map(this.#charMap); // Return copy to prevent mutation
  }

  /**
   * Gets the character for a specific value
   * @param {number|bigint} value - The numeric value
   * @returns {string} The character representing the value
   * @throws {Error} If the value is out of range
   */
  getChar(value) {
    const i = Number(value);
    if (i < 0 || i >= this.#characters.length) {
      throw new Error(`Value ${value} is out of range for base ${this.#base}`);
    }
    return this.#characters[i];
  }

  /**
   * Gets the human-readable name of the base system
   * @returns {string} The name
   */
  get name() {
    return this.#name;
  }



  /**
   * Creates a mapping from characters to their numeric values
   * @returns {Map<string, number>} Character to value mapping
   */
  #createCharacterMap() {
    const map = new Map();
    for (let i = 0; i < this.#characters.length; i++) {
      map.set(this.#characters[i], i);
    }
    return map;
  }

  /**
   * Validates the base system
   * @throws {Error} If the base is invalid
   */
  #validateBase() {
    if (this.#base < 2) {
      throw new Error("Base must be at least 2");
    }

    if (this.#base !== this.#characters.length) {
      throw new Error(
        `Base ${this.#base} does not match character set length ${this.#characters.length}`,
      );
    }

    // Validate character uniqueness (already done in parsing, but double-check)
    const uniqueChars = new Set(this.#characters);
    if (uniqueChars.size !== this.#characters.length) {
      throw new Error("Character set contains duplicate characters");
    }

    // Validate ordering consistency within ranges
    this.#validateCharacterOrdering();

    if (this.#base > 1000) {
      console.warn(
        `Very large base system (${this.#base}). This may impact performance.`,
      );
    }
  }

  /**
   * Validates character ordering consistency within ranges
   * @throws {Error} If ordering is inconsistent
   */
  #validateCharacterOrdering() {
    // Skip validation for special base systems that intentionally use non-contiguous characters
    if (this.#name === "Roman Numerals" || this.#characters.length < 10) {
      return;
    }

    // Check for consistent ordering in common ranges
    const ranges = [
      { start: "0", end: "9", name: "digits" },
      { start: "a", end: "z", name: "lowercase letters" },
      { start: "A", end: "Z", name: "uppercase letters" },
    ];

    for (const range of ranges) {
      const startCode = range.start.charCodeAt(0);
      const endCode = range.end.charCodeAt(0);

      let rangeChars = [];

      // Collect all characters in this range
      for (let i = 0; i < this.#characters.length; i++) {
        const char = this.#characters[i];
        const code = char.charCodeAt(0);

        if (code >= startCode && code <= endCode) {
          rangeChars.push(char);
        }
      }

      // Only validate if we have enough characters and they form a substantial part of the range
      // This prevents warnings for intentionally short, truncated, or sparse ranges
      if (rangeChars.length >= 5 && rangeChars.length > (endCode - startCode) / 3) {
        // Check for gaps in the sequence
        for (let i = 1; i < rangeChars.length; i++) {
          const prevCode = rangeChars[i - 1].charCodeAt(0);
          const currCode = rangeChars[i].charCodeAt(0);

          if (currCode !== prevCode + 1) {
            console.warn(
              `Non-contiguous ${range.name} range detected in base system`
            );
            break;
          }
        }
      }
    }
  }

  /**
   * Checks for conflicts with parser symbols
   * @throws {Error} If conflicts are found
   */
  #checkForConflicts() {
    const conflicts = [];

    for (const char of this.#characters) {
      if (BaseSystem.RESERVED_SYMBOLS.has(char)) {
        conflicts.push(char);
      }
    }

    if (conflicts.length > 0) {
      throw new Error(
        `Base system characters conflict with parser symbols: ${conflicts.join(", ")}. ` +
        `Reserved symbols are: ${Array.from(BaseSystem.RESERVED_SYMBOLS).join(", ")}`,
      );
    }
  }

  /**
   * Converts a string representation in this base to a decimal BigInt
   * @param {string} str - String representation in this base
   * @returns {bigint} Decimal value as BigInt
   * @throws {Error} If string contains invalid characters for this base
   */
  toDecimal(str) {
    if (typeof str !== "string" || str.length === 0) {
      throw new Error("Input must be a non-empty string");
    }

    // Handle negative numbers
    let negative = false;
    if (str.startsWith("-")) {
      negative = true;
      str = str.slice(1);
    }

    let result = 0n;
    const baseBigInt = BigInt(this.#base);

    for (let i = 0; i < str.length; i++) {
      const char = str[i];

      if (!this.#charMap.has(char)) {
        throw new Error(
          `Invalid character '${char}' for ${this.#name} (base ${this.#base})`,
        );
      }

      const digitValue = BigInt(this.#charMap.get(char));
      result = result * baseBigInt + digitValue;
    }

    return negative ? -result : result;
  }

  /**
   * Converts a decimal BigInt to string representation in this base
   * @param {bigint} value - Decimal value as BigInt
   * @returns {string} String representation in this base
   */
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

  /**
   * Validates that a string contains only valid characters for this base
   * @param {string} str - String to validate
   * @returns {boolean} True if all characters are valid
   */
  isValidString(str) {
    if (typeof str !== "string") {
      return false;
    }

    // Handle negative sign
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

  /**
   * Returns the highest digit value in this base system
   * @returns {string} The character representing the highest digit
   */
  getMaxDigit() {
    return this.#characters[this.#characters.length - 1];
  }

  /**
   * Returns the lowest digit value in this base system
   * @returns {string} The character representing the lowest digit (usually zero)
   */
  getMinDigit() {
    return this.#characters[0];
  }

  /**
   * Creates a string representation of the base system
   * @returns {string} Human-readable description
   */
  toString() {
    const charPreview =
      this.#characters.length <= 20
        ? this.#characters.join("")
        : this.#characters.slice(0, 10).join("") +
        "..." +
        this.#characters.slice(-10).join("");

    return `${this.#name} (${charPreview})`;
  }

  /**
   * Checks if this base system is equal to another
   * @param {BaseSystem} other - Another BaseSystem to compare
   * @returns {boolean} True if the base systems are equivalent
   */
  equals(other) {
    if (!(other instanceof BaseSystem)) {
      return false;
    }

    if (this.#base !== other.#base) {
      return false;
    }

    for (let i = 0; i < this.#characters.length; i++) {
      if (this.#characters[i] !== other.#characters[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Creates a BaseSystem from a base number using default character sets
   * @param {number} base - The numeric base (2-62)
   * @param {string} [name] - Optional name for the base system
   * @returns {BaseSystem} New BaseSystem instance
   * @throws {Error} If base is not supported or out of range
   */
  static fromBase(base, name) {
    if (!Number.isInteger(base) || base < 2) {
      throw new Error("Base must be an integer >= 2");
    }

    const characters = [];
    if (base <= 62) {
      // 0-9
      for (let i = 0; i < Math.min(base, 10); i++) {
        characters.push(String.fromCharCode(48 + i)); // '0' is 48
      }

      // a-z
      if (base > 10) {
        for (let i = 0; i < Math.min(base - 10, 26); i++) {
          characters.push(String.fromCharCode(97 + i)); // 'a' is 97
        }
      }

      // A-Z
      if (base > 36) {
        for (let i = 0; i < base - 36; i++) {
          characters.push(String.fromCharCode(65 + i)); // 'A' is 65
        }
      }
    } else {
      throw new Error(
        "BaseSystem.fromBase() only supports bases up to 62. Use constructor with custom character sequence for larger bases.",
      );
    }

    return new BaseSystem(characters, name || `Base ${base}`);
  }

  /**
   * Creates common base system patterns
   * @param {string} pattern - Pattern name ('alphanumeric', 'digits-only', 'letters-only', etc.)
   * @param {number} size - Size of the base system
   * @param {string} [name] - Optional name
   * @returns {BaseSystem} New BaseSystem instance
   */
  static createPattern(pattern, size, name) {
    const characters = [];

    switch (pattern.toLowerCase()) {
      case "alphanumeric":
        if (size > 62) {
          throw new Error(`Alphanumeric pattern only supports up to base 62, got ${size}`);
        }
        return BaseSystem.fromBase(size, name);

      case "digits-only":
        if (size > 10) {
          throw new Error(`Digits-only pattern only supports up to base 10, got ${size}`);
        }
        for (let i = 0; i < size; i++) characters.push(String.fromCharCode(48 + i));
        return new BaseSystem(characters, name || `Base ${size} (digits only)`);

      case "letters-only":
        if (size > 52) {
          throw new Error(`Letters-only pattern only supports up to base 52, got ${size}`);
        }
        // a-z
        for (let i = 0; i < Math.min(size, 26); i++) {
          characters.push(String.fromCharCode(97 + i));
        }
        // A-Z
        if (size > 26) {
          for (let i = 0; i < size - 26; i++) {
            characters.push(String.fromCharCode(65 + i));
          }
        }
        return new BaseSystem(
          characters,
          name || (size <= 26 ? `Base ${size} (lowercase letters)` : `Base ${size} (mixed case letters)`)
        );

      case "uppercase-only":
        if (size > 26) {
          throw new Error(`Uppercase-only pattern only supports up to base 26, got ${size}`);
        }
        for (let i = 0; i < size; i++) {
          characters.push(String.fromCharCode(65 + i));
        }
        return new BaseSystem(characters, name || `Base ${size} (uppercase letters)`);

      default:
        throw new Error(
          `Unknown pattern: ${pattern}. Supported patterns: alphanumeric, digits-only, letters-only, uppercase-only`,
        );
    }
  }

  /**
   * Registers a prefix for a base system (case-insensitive lookup, case-sensitive storage)
   * @param {string} prefix - The single-character prefix (e.g., 'x', 'b')
   * @param {BaseSystem} baseSystem - The base system to associate
   */
  static registerPrefix(prefix, baseSystem) {
    if (typeof prefix !== "string" || prefix.length !== 1) {
      throw new Error("Prefix must be a single character");
    }
    if (!(baseSystem instanceof BaseSystem)) {
      throw new Error("Must provide a valid BaseSystem");
    }
    if (!/^[a-zA-Z]$/.test(prefix)) {
      throw new Error("Prefix must be a letter");
    }

    BaseSystem.#prefixMap.set(prefix, baseSystem);
  }

  /**
   * Unregisters a prefix
   * @param {string} prefix - The prefix to remove
   */
  static unregisterPrefix(prefix) {
    BaseSystem.#prefixMap.delete(prefix);
  }

  static getSystemForPrefix(prefix) {
    // Try exact match first
    if (BaseSystem.#prefixMap.has(prefix)) {
      return BaseSystem.#prefixMap.get(prefix);
    }
    // Try case-insensitive fallback if not found
    for (const [p, system] of BaseSystem.#prefixMap.entries()) {
      if (p.toLowerCase() === prefix.toLowerCase()) {
        return system;
      }
    }
    return undefined;
  }

  /**
   * Finds the first registered prefix for a base system
   * @param {BaseSystem} baseSystem - The base system to find a prefix for
   * @returns {string|undefined} The prefix or undefined
   */
  static getPrefixForSystem(baseSystem) {
    for (const [prefix, system] of BaseSystem.#prefixMap.entries()) {
      if (system.equals(baseSystem)) {
        return prefix;
      }
    }
    return undefined;
  }

  /**
   * Validates case sensitivity settings
   * @param {boolean} caseSensitive - Whether the base system should be case sensitive
   * @returns {BaseSystem} New BaseSystem with case sensitivity applied
   */
  withCaseSensitivity(caseSensitive) {
    if (caseSensitive === true) {
      // Already case sensitive by default
      return this;
    }

    if (caseSensitive === false) {
      // Convert to lowercase only
      const lowerChars = this.#characters.map((char) => char.toLowerCase());
      const uniqueLowerChars = [...new Set(lowerChars)];

      if (uniqueLowerChars.length !== lowerChars.length) {
        console.warn(
          "Case-insensitive conversion resulted in duplicate characters",
        );
      }

      return new BaseSystem(
        uniqueLowerChars.join(""),
        `${this.#name} (case-insensitive)`,
      );
    }

    throw new Error("caseSensitive must be a boolean value");
  }
}

// Standard base presets - defined after class to avoid circular reference
BaseSystem.BINARY = new BaseSystem(["0", "1"], "Binary");
BaseSystem.OCTAL = new BaseSystem(["0", "1", "2", "3", "4", "5", "6", "7"], "Octal");
BaseSystem.DECIMAL = new BaseSystem(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], "Decimal");
BaseSystem.HEXADECIMAL = new BaseSystem(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"], "Hexadecimal");
BaseSystem.BASE36 = new BaseSystem("0123456789abcdefghijklmnopqrstuvwxyz".split(""), "Base 36");
BaseSystem.BASE62 = new BaseSystem("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), "Base 62");

// Extended base presets
BaseSystem.BASE60 = new BaseSystem("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX".split(""), "Base 60 (Sexagesimal)");

// Roman numerals - special case with custom validation
BaseSystem.ROMAN = new BaseSystem(["I", "V", "X", "L", "C", "D", "M"], "Roman Numerals");

// Default Prefix Registrations
BaseSystem.registerPrefix("x", BaseSystem.HEXADECIMAL);
BaseSystem.registerPrefix("b", BaseSystem.BINARY);
BaseSystem.registerPrefix("o", BaseSystem.OCTAL);
BaseSystem.registerPrefix("d", BaseSystem.DECIMAL);

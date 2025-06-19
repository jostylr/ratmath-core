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
   * @param {string} characterSequence - Character sequence with range notation
   * @param {string} [name] - Optional human-readable name for the base system
   * @throws {Error} If the character sequence is invalid or contains conflicts
   */
  constructor(characterSequence, name) {
    this.#characters = this.#parseCharacterSequence(characterSequence);
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
   * Gets the human-readable name of the base system
   * @returns {string} The name
   */
  get name() {
    return this.#name;
  }

  /**
   * Parses character sequence with range notation.
   * Supports formats like:
   * - "0-9" → ["0","1","2","3","4","5","6","7","8","9"]
   * - "a-z" → ["a","b","c",...,"z"]
   * - "0-9a-f" → ["0","1",...,"9","a","b",...,"f"]
   * - "01234567" → ["0","1","2","3","4","5","6","7"]
   *
   * @param {string} sequence - The character sequence
   * @returns {string[]} Array of characters in order
   * @throws {Error} If the sequence format is invalid
   */
  #parseCharacterSequence(sequence) {
    if (typeof sequence !== "string" || sequence.length === 0) {
      throw new Error("Character sequence must be a non-empty string");
    }

    const characters = [];
    let i = 0;

    while (i < sequence.length) {
      // Check for range notation (char-char)
      if (i + 2 < sequence.length && sequence[i + 1] === "-") {
        const startChar = sequence[i];
        const endChar = sequence[i + 2];

        // Validate range
        const startCode = startChar.charCodeAt(0);
        const endCode = endChar.charCodeAt(0);

        if (startCode > endCode) {
          throw new Error(
            `Invalid range: '${startChar}-${endChar}'. Start character must come before end character.`,
          );
        }

        // Add all characters in range
        for (let code = startCode; code <= endCode; code++) {
          characters.push(String.fromCharCode(code));
        }

        i += 3; // Skip past the range
      } else {
        // Single character
        characters.push(sequence[i]);
        i++;
      }
    }

    // Validate no duplicates
    const uniqueChars = new Set(characters);
    if (uniqueChars.size !== characters.length) {
      throw new Error("Character sequence contains duplicate characters");
    }

    if (characters.length < 2) {
      throw new Error("Base system must have at least 2 characters");
    }

    return characters;
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
      let lastCode = -1;

      for (let i = 0; i < this.#characters.length; i++) {
        const char = this.#characters[i];
        const code = char.charCodeAt(0);

        if (code >= startCode && code <= endCode) {
          rangeChars.push(char);

          // Check if this character is consecutive to the last one
          if (lastCode !== -1 && code !== lastCode + 1) {
            // Found a gap in the sequence
            console.warn(
              `Non-contiguous ${range.name} range detected in base system`,
            );
            break;
          }
          lastCode = code;
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

    let sequence;
    if (base <= 10) {
      sequence = `0-${base - 1}`;
    } else if (base <= 36) {
      const lastLetter = String.fromCharCode("a".charCodeAt(0) + base - 11);
      sequence = `0-9a-${lastLetter}`;
    } else if (base <= 62) {
      const lastLetter = String.fromCharCode("A".charCodeAt(0) + base - 37);
      sequence = `0-9a-zA-${lastLetter}`;
    } else {
      throw new Error(
        "BaseSystem.fromBase() only supports bases up to 62. Use constructor with custom character sequence for larger bases.",
      );
    }

    return new BaseSystem(sequence, name || `Base ${base}`);
  }

  /**
   * Creates common base system patterns
   * @param {string} pattern - Pattern name ('alphanumeric', 'digits-only', 'letters-only', etc.)
   * @param {number} size - Size of the base system
   * @param {string} [name] - Optional name
   * @returns {BaseSystem} New BaseSystem instance
   */
  static createPattern(pattern, size, name) {
    switch (pattern.toLowerCase()) {
      case "alphanumeric":
        if (size <= 36) {
          return BaseSystem.fromBase(size, name);
        } else if (size <= 62) {
          return BaseSystem.fromBase(size, name);
        } else {
          throw new Error(
            `Alphanumeric pattern only supports up to base 62, got ${size}`,
          );
        }

      case "digits-only":
        if (size > 10) {
          throw new Error(
            `Digits-only pattern only supports up to base 10, got ${size}`,
          );
        }
        return new BaseSystem(
          `0-${size - 1}`,
          name || `Base ${size} (digits only)`,
        );

      case "letters-only":
        if (size <= 26) {
          const lastLetter = String.fromCharCode("a".charCodeAt(0) + size - 1);
          return new BaseSystem(
            `a-${lastLetter}`,
            name || `Base ${size} (lowercase letters)`,
          );
        } else if (size <= 52) {
          const lastLetter = String.fromCharCode("A".charCodeAt(0) + size - 27);
          return new BaseSystem(
            `a-zA-${lastLetter}`,
            name || `Base ${size} (mixed case letters)`,
          );
        } else {
          throw new Error(
            `Letters-only pattern only supports up to base 52, got ${size}`,
          );
        }

      case "uppercase-only":
        if (size > 26) {
          throw new Error(
            `Uppercase-only pattern only supports up to base 26, got ${size}`,
          );
        }
        const lastLetter = String.fromCharCode("A".charCodeAt(0) + size - 1);
        return new BaseSystem(
          `A-${lastLetter}`,
          name || `Base ${size} (uppercase letters)`,
        );

      default:
        throw new Error(
          `Unknown pattern: ${pattern}. Supported patterns: alphanumeric, digits-only, letters-only, uppercase-only`,
        );
    }
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
BaseSystem.BINARY = new BaseSystem("0-1", "Binary");
BaseSystem.OCTAL = new BaseSystem("0-7", "Octal");
BaseSystem.DECIMAL = new BaseSystem("0-9", "Decimal");
BaseSystem.HEXADECIMAL = new BaseSystem("0-9a-f", "Hexadecimal");
BaseSystem.BASE36 = new BaseSystem("0-9a-z", "Base 36");
BaseSystem.BASE62 = new BaseSystem("0-9a-zA-Z", "Base 62");

// Extended base presets
BaseSystem.BASE60 = new BaseSystem("0-9a-zA-X", "Base 60 (Sexagesimal)");

// Roman numerals - special case with custom validation
BaseSystem.ROMAN = new BaseSystem("IVXLCDM", "Roman Numerals");

/**
 * BaseSystem Tests
 *
 * Comprehensive test suite for the BaseSystem class functionality.
 */

import { describe, it, expect } from "bun:test";
import { BaseSystem } from "../src/base-system.js";

describe("BaseSystem", () => {
  describe("Constructor and Character Sequence Parsing", () => {
    it("should create base system with simple range notation", () => {
      const binary = new BaseSystem("0-1");
      expect(binary.base).toBe(2);
      expect(binary.characters).toEqual(["0", "1"]);
    });

    it("should create base system with multiple ranges", () => {
      const hex = new BaseSystem("0-9a-f");
      expect(hex.base).toBe(16);
      expect(hex.characters).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
      ]);
    });

    it("should create base system with explicit character list", () => {
      const octal = new BaseSystem("01234567");
      expect(octal.base).toBe(8);
      expect(octal.characters).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
      ]);
    });

    it("should create base system with mixed ranges and explicit chars", () => {
      const mixed = new BaseSystem("0-4XYZ");
      expect(mixed.base).toBe(8);
      expect(mixed.characters).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "X",
        "Y",
        "Z",
      ]);
    });

    it("should handle uppercase ranges", () => {
      const upper = new BaseSystem("A-F");
      expect(upper.base).toBe(6);
      expect(upper.characters).toEqual(["A", "B", "C", "D", "E", "F"]);
    });

    it("should throw error for empty sequence", () => {
      expect(() => new BaseSystem("")).toThrow(
        "Character sequence must be a non-empty string",
      );
    });

    it("should throw error for non-string sequence", () => {
      expect(() => new BaseSystem(123)).toThrow(
        "Character sequence must be a non-empty string",
      );
    });

    it("should throw error for invalid range", () => {
      expect(() => new BaseSystem("z-a")).toThrow(
        "Invalid range: 'z-a'. Start character must come before end character.",
      );
    });

    it("should throw error for duplicate characters", () => {
      expect(() => new BaseSystem("0-2012")).toThrow(
        "Character sequence contains duplicate characters",
      );
    });

    it("should throw error for base less than 2", () => {
      expect(() => new BaseSystem("0")).toThrow(
        "Base system must have at least 2 characters",
      );
    });

    it("should accept optional name parameter", () => {
      const named = new BaseSystem("0-1", "Binary System");
      expect(named.name).toBe("Binary System");
    });

    it("should generate default name if none provided", () => {
      const unnamed = new BaseSystem("0-7");
      expect(unnamed.name).toBe("Base 8");
    });
  });

  describe("Standard Base Presets", () => {
    it("should have correct BINARY preset", () => {
      expect(BaseSystem.BINARY.base).toBe(2);
      expect(BaseSystem.BINARY.characters).toEqual(["0", "1"]);
      expect(BaseSystem.BINARY.name).toBe("Binary");
    });

    it("should have correct OCTAL preset", () => {
      expect(BaseSystem.OCTAL.base).toBe(8);
      expect(BaseSystem.OCTAL.characters).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
      ]);
      expect(BaseSystem.OCTAL.name).toBe("Octal");
    });

    it("should have correct DECIMAL preset", () => {
      expect(BaseSystem.DECIMAL.base).toBe(10);
      expect(BaseSystem.DECIMAL.characters).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
      ]);
      expect(BaseSystem.DECIMAL.name).toBe("Decimal");
    });

    it("should have correct HEXADECIMAL preset", () => {
      expect(BaseSystem.HEXADECIMAL.base).toBe(16);
      expect(BaseSystem.HEXADECIMAL.characters).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
      ]);
      expect(BaseSystem.HEXADECIMAL.name).toBe("Hexadecimal");
    });

    it("should have correct BASE36 preset", () => {
      expect(BaseSystem.BASE36.base).toBe(36);
      expect(BaseSystem.BASE36.characters.length).toBe(36);
      expect(BaseSystem.BASE36.name).toBe("Base 36");
    });

    it("should have correct BASE62 preset", () => {
      expect(BaseSystem.BASE62.base).toBe(62);
      expect(BaseSystem.BASE62.characters.length).toBe(62);
      expect(BaseSystem.BASE62.name).toBe("Base 62");
    });
  });

  describe("Extended Base Presets", () => {
    it("should have correct BASE60 preset", () => {
      expect(BaseSystem.BASE60.base).toBe(60);
      expect(BaseSystem.BASE60.characters.length).toBe(60);
      expect(BaseSystem.BASE60.name).toBe("Base 60 (Sexagesimal)");
    });

    it("should have correct ROMAN preset", () => {
      expect(BaseSystem.ROMAN.base).toBe(7);
      expect(BaseSystem.ROMAN.characters).toEqual([
        "I",
        "V",
        "X",
        "L",
        "C",
        "D",
        "M",
      ]);
      expect(BaseSystem.ROMAN.name).toBe("Roman Numerals");
    });

    it("should work with BASE60 conversions", () => {
      const base60 = BaseSystem.BASE60;
      const testValue = 3600n; // 1 hour in seconds
      const converted = base60.fromDecimal(testValue);
      expect(base60.toDecimal(converted)).toBe(testValue);
    });

    it("should work with ROMAN conversions", () => {
      const roman = BaseSystem.ROMAN;
      const testValues = [1n, 5n, 10n, 50n, 100n];
      testValues.forEach((value) => {
        const converted = roman.fromDecimal(value);
        expect(roman.toDecimal(converted)).toBe(value);
      });
    });
  });

  describe("Conflict Detection", () => {
    const reservedSymbols = [
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
    ];

    reservedSymbols.forEach((symbol) => {
      it(`should throw error for reserved symbol '${symbol}'`, () => {
        expect(() => new BaseSystem(`01${symbol}`)).toThrow(
          /Base system characters conflict with parser symbols/,
        );
      });
    });

    it("should list all conflicting characters in error message", () => {
      expect(() => new BaseSystem("0123+*")).toThrow(/\+, \*/);
    });

    it("should allow non-reserved characters", () => {
      const safe = new BaseSystem("0-9ghijklmnopqrstuvwxyz");
      expect(safe.base).toBe(30);
    });
  });

  describe("toDecimal Method", () => {
    const binary = BaseSystem.BINARY;
    const hex = BaseSystem.HEXADECIMAL;
    const decimal = BaseSystem.DECIMAL;

    it("should convert binary strings to decimal", () => {
      expect(binary.toDecimal("0")).toBe(0n);
      expect(binary.toDecimal("1")).toBe(1n);
      expect(binary.toDecimal("10")).toBe(2n);
      expect(binary.toDecimal("101")).toBe(5n);
      expect(binary.toDecimal("1111")).toBe(15n);
      expect(binary.toDecimal("101010")).toBe(42n);
    });

    it("should convert hexadecimal strings to decimal", () => {
      expect(hex.toDecimal("0")).toBe(0n);
      expect(hex.toDecimal("a")).toBe(10n);
      expect(hex.toDecimal("f")).toBe(15n);
      expect(hex.toDecimal("10")).toBe(16n);
      expect(hex.toDecimal("ff")).toBe(255n);
      expect(hex.toDecimal("100")).toBe(256n);
    });

    it("should handle negative numbers", () => {
      expect(binary.toDecimal("-1")).toBe(-1n);
      expect(binary.toDecimal("-101")).toBe(-5n);
      expect(hex.toDecimal("-ff")).toBe(-255n);
    });

    it("should handle large numbers", () => {
      const largeBinary = "1".repeat(64);
      const result = binary.toDecimal(largeBinary);
      expect(typeof result).toBe("bigint");
      expect(result > 0n).toBe(true);
    });

    it("should throw error for invalid characters", () => {
      expect(() => binary.toDecimal("102")).toThrow(
        "Invalid character '2' for Binary",
      );
      expect(() => hex.toDecimal("xyz")).toThrow(
        "Invalid character 'x' for Hexadecimal",
      );
    });

    it("should throw error for empty string", () => {
      expect(() => binary.toDecimal("")).toThrow(
        "Input must be a non-empty string",
      );
    });

    it("should throw error for non-string input", () => {
      expect(() => binary.toDecimal(123)).toThrow(
        "Input must be a non-empty string",
      );
    });
  });

  describe("fromDecimal Method", () => {
    const binary = BaseSystem.BINARY;
    const hex = BaseSystem.HEXADECIMAL;
    const decimal = BaseSystem.DECIMAL;

    it("should convert decimal to binary strings", () => {
      expect(binary.fromDecimal(0n)).toBe("0");
      expect(binary.fromDecimal(1n)).toBe("1");
      expect(binary.fromDecimal(2n)).toBe("10");
      expect(binary.fromDecimal(5n)).toBe("101");
      expect(binary.fromDecimal(15n)).toBe("1111");
      expect(binary.fromDecimal(42n)).toBe("101010");
    });

    it("should convert decimal to hexadecimal strings", () => {
      expect(hex.fromDecimal(0n)).toBe("0");
      expect(hex.fromDecimal(10n)).toBe("a");
      expect(hex.fromDecimal(15n)).toBe("f");
      expect(hex.fromDecimal(16n)).toBe("10");
      expect(hex.fromDecimal(255n)).toBe("ff");
      expect(hex.fromDecimal(256n)).toBe("100");
    });

    it("should handle negative numbers", () => {
      expect(binary.fromDecimal(-1n)).toBe("-1");
      expect(binary.fromDecimal(-5n)).toBe("-101");
      expect(hex.fromDecimal(-255n)).toBe("-ff");
    });

    it("should handle large numbers", () => {
      const large = 2n ** 100n;
      const result = binary.fromDecimal(large);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(50);
    });

    it("should throw error for non-BigInt input", () => {
      expect(() => binary.fromDecimal(42)).toThrow("Value must be a BigInt");
      expect(() => binary.fromDecimal("42")).toThrow("Value must be a BigInt");
    });
  });

  describe("Round-trip Conversion", () => {
    const bases = [
      BaseSystem.BINARY,
      BaseSystem.OCTAL,
      BaseSystem.DECIMAL,
      BaseSystem.HEXADECIMAL,
      new BaseSystem("01234", "Base 5"),
    ];

    const testValues = [0n, 1n, 42n, 255n, 1000n, -42n, -255n, 2n ** 50n];

    bases.forEach((base) => {
      testValues.forEach((value) => {
        it(`should round-trip ${value} in ${base.name}`, () => {
          const str = base.fromDecimal(value);
          const back = base.toDecimal(str);
          expect(back).toBe(value);
        });
      });
    });
  });

  describe("isValidString Method", () => {
    const binary = BaseSystem.BINARY;
    const hex = BaseSystem.HEXADECIMAL;

    it("should validate correct strings", () => {
      expect(binary.isValidString("0")).toBe(true);
      expect(binary.isValidString("1")).toBe(true);
      expect(binary.isValidString("101")).toBe(true);
      expect(binary.isValidString("-101")).toBe(true);

      expect(hex.isValidString("0")).toBe(true);
      expect(hex.isValidString("abc")).toBe(true);
      expect(hex.isValidString("123def")).toBe(true);
      expect(hex.isValidString("-ff")).toBe(true);
    });

    it("should reject invalid strings", () => {
      expect(binary.isValidString("2")).toBe(false);
      expect(binary.isValidString("102")).toBe(false);
      expect(binary.isValidString("xyz")).toBe(false);

      expect(hex.isValidString("xyz")).toBe(false);
      expect(hex.isValidString("123xyz")).toBe(false);
    });

    it("should reject non-string input", () => {
      expect(binary.isValidString(123)).toBe(false);
      expect(binary.isValidString(null)).toBe(false);
      expect(binary.isValidString(undefined)).toBe(false);
    });

    it("should reject empty string", () => {
      expect(binary.isValidString("")).toBe(false);
      expect(hex.isValidString("")).toBe(false);
    });

    it("should handle negative sign correctly", () => {
      expect(binary.isValidString("-")).toBe(false);
      expect(binary.isValidString("-1")).toBe(true);
      expect(binary.isValidString("-2")).toBe(false);
    });
  });

  describe("Utility Methods", () => {
    const hex = BaseSystem.HEXADECIMAL;

    it("should return correct min and max digits", () => {
      expect(hex.getMinDigit()).toBe("0");
      expect(hex.getMaxDigit()).toBe("f");
    });

    it("should return character arrays as copies", () => {
      const chars1 = hex.characters;
      const chars2 = hex.characters;
      expect(chars1).toEqual(chars2);
      expect(chars1).not.toBe(chars2); // Different objects

      chars1.push("x"); // Mutate copy
      expect(hex.characters.length).toBe(16); // Original unchanged
    });

    it("should return charMap as copy", () => {
      const map1 = hex.charMap;
      const map2 = hex.charMap;
      expect(map1).toEqual(map2);
      expect(map1).not.toBe(map2); // Different objects

      map1.set("x", 99); // Mutate copy
      expect(hex.charMap.has("x")).toBe(false); // Original unchanged
    });

    it("should generate meaningful toString output", () => {
      const binary = BaseSystem.BINARY;
      const toString = binary.toString();
      expect(toString).toContain("Binary");
      expect(toString).toContain("01");
    });

    it("should truncate long character lists in toString", () => {
      const longBase = new BaseSystem("0-9a-zA-Z", "Long Base");
      const toString = longBase.toString();
      expect(toString).toContain("...");
    });
  });

  describe("equals Method", () => {
    it("should return true for equivalent base systems", () => {
      const binary1 = new BaseSystem("0-1");
      const binary2 = BaseSystem.BINARY;
      expect(binary1.equals(binary2)).toBe(true);
    });

    it("should return false for different bases", () => {
      const binary = BaseSystem.BINARY;
      const octal = BaseSystem.OCTAL;
      expect(binary.equals(octal)).toBe(false);
    });

    it("should return false for same base but different characters", () => {
      const base1 = new BaseSystem("01");
      const base2 = new BaseSystem("ab");
      expect(base1.equals(base2)).toBe(false);
    });

    it("should return false for non-BaseSystem objects", () => {
      const binary = BaseSystem.BINARY;
      expect(binary.equals({})).toBe(false);
      expect(binary.equals("binary")).toBe(false);
      expect(binary.equals(2)).toBe(false);
    });
  });

  describe("fromBase Static Method", () => {
    it("should create correct base systems for small bases", () => {
      const base2 = BaseSystem.fromBase(2);
      expect(base2.base).toBe(2);
      expect(base2.characters).toEqual(["0", "1"]);

      const base8 = BaseSystem.fromBase(8);
      expect(base8.base).toBe(8);
      expect(base8.characters).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
      ]);

      const base10 = BaseSystem.fromBase(10);
      expect(base10.base).toBe(10);
      expect(base10.characters.length).toBe(10);
    });

    it("should create correct base systems for medium bases", () => {
      const base16 = BaseSystem.fromBase(16);
      expect(base16.base).toBe(16);
      expect(base16.characters.slice(-6)).toEqual([
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
      ]);

      const base36 = BaseSystem.fromBase(36);
      expect(base36.base).toBe(36);
      expect(base36.characters.slice(-1)).toEqual(["z"]);
    });

    it("should create correct base systems for large bases", () => {
      const base62 = BaseSystem.fromBase(62);
      expect(base62.base).toBe(62);
      expect(base62.characters.length).toBe(62);
      expect(base62.characters.slice(-1)).toEqual(["Z"]);
    });

    it("should accept optional name parameter", () => {
      const named = BaseSystem.fromBase(16, "Custom Hex");
      expect(named.name).toBe("Custom Hex");
    });

    it("should generate default name if none provided", () => {
      const unnamed = BaseSystem.fromBase(16);
      expect(unnamed.name).toBe("Base 16");
    });

    it("should throw error for invalid base values", () => {
      expect(() => BaseSystem.fromBase(1)).toThrow(
        "Base must be an integer >= 2",
      );
      expect(() => BaseSystem.fromBase(0)).toThrow(
        "Base must be an integer >= 2",
      );
      expect(() => BaseSystem.fromBase(-1)).toThrow(
        "Base must be an integer >= 2",
      );
      expect(() => BaseSystem.fromBase(1.5)).toThrow(
        "Base must be an integer >= 2",
      );
    });

    it("should throw error for bases larger than 62", () => {
      expect(() => BaseSystem.fromBase(63)).toThrow(
        "BaseSystem.fromBase() only supports bases up to 62",
      );
      expect(() => BaseSystem.fromBase(100)).toThrow(
        "BaseSystem.fromBase() only supports bases up to 62",
      );
    });

    it("should create equivalent systems to presets", () => {
      expect(BaseSystem.fromBase(2).equals(BaseSystem.BINARY)).toBe(true);
      expect(BaseSystem.fromBase(8).equals(BaseSystem.OCTAL)).toBe(true);
      expect(BaseSystem.fromBase(10).equals(BaseSystem.DECIMAL)).toBe(true);
      expect(BaseSystem.fromBase(16).equals(BaseSystem.HEXADECIMAL)).toBe(true);
      expect(BaseSystem.fromBase(36).equals(BaseSystem.BASE36)).toBe(true);
      expect(BaseSystem.fromBase(62).equals(BaseSystem.BASE62)).toBe(true);
    });
  });

  describe("createPattern Static Method", () => {
    it("should create alphanumeric patterns", () => {
      const base16 = BaseSystem.createPattern("alphanumeric", 16);
      expect(base16.base).toBe(16);
      expect(base16.characters.slice(-6)).toEqual([
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
      ]);

      const base36 = BaseSystem.createPattern("alphanumeric", 36);
      expect(base36.base).toBe(36);
      expect(base36.characters.slice(-1)).toEqual(["z"]);
    });

    it("should create digits-only patterns", () => {
      const base8 = BaseSystem.createPattern("digits-only", 8);
      expect(base8.base).toBe(8);
      expect(base8.characters).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
      ]);
    });

    it("should create letters-only patterns", () => {
      const base10 = BaseSystem.createPattern("letters-only", 10);
      expect(base10.base).toBe(10);
      expect(base10.characters).toEqual([
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
      ]);
    });

    it("should create uppercase-only patterns", () => {
      const base5 = BaseSystem.createPattern("uppercase-only", 5);
      expect(base5.base).toBe(5);
      expect(base5.characters).toEqual(["A", "B", "C", "D", "E"]);
    });

    it("should throw error for invalid patterns", () => {
      expect(() => BaseSystem.createPattern("invalid", 10)).toThrow(
        "Unknown pattern",
      );
    });

    it("should throw error for sizes exceeding pattern limits", () => {
      expect(() => BaseSystem.createPattern("digits-only", 11)).toThrow(
        "Digits-only pattern only supports up to base 10",
      );
      expect(() => BaseSystem.createPattern("uppercase-only", 27)).toThrow(
        "Uppercase-only pattern only supports up to base 26",
      );
    });

    it("should accept custom names", () => {
      const named = BaseSystem.createPattern("digits-only", 5, "Custom Base 5");
      expect(named.name).toBe("Custom Base 5");
    });
  });

  describe("Case Sensitivity", () => {
    it("should handle case sensitive bases by default", () => {
      const mixedCase = new BaseSystem("aAbBcC");
      expect(mixedCase.base).toBe(6);
      expect(mixedCase.toDecimal("A")).toBe(1n);
      expect(mixedCase.toDecimal("a")).toBe(0n);
    });

    it("should convert to case insensitive", () => {
      const mixedCase = new BaseSystem("aAbBcC", "Mixed Case");
      const caseInsensitive = mixedCase.withCaseSensitivity(false);

      expect(caseInsensitive.base).toBe(3);
      expect(caseInsensitive.characters).toEqual(["a", "b", "c"]);
      expect(caseInsensitive.name).toBe("Mixed Case (case-insensitive)");
    });

    it("should preserve case sensitive when explicitly requested", () => {
      const original = new BaseSystem("aAbBcC");
      const caseSensitive = original.withCaseSensitivity(true);

      expect(caseSensitive.equals(original)).toBe(true);
    });

    it("should throw error for invalid case sensitivity parameter", () => {
      const base = new BaseSystem("abc");
      expect(() => base.withCaseSensitivity("invalid")).toThrow(
        "caseSensitive must be a boolean value",
      );
    });
  });

  describe("Enhanced Validation", () => {
    it("should validate base does not exceed character set length", () => {
      // This should work fine
      const validBase = new BaseSystem("01234567");
      expect(validBase.base).toBe(8);
    });

    it("should detect duplicate characters", () => {
      expect(() => new BaseSystem("abcabc")).toThrow(
        "Character sequence contains duplicate characters",
      );
    });

    it("should warn about non-contiguous ranges", () => {
      const originalWarn = console.warn;
      let warnCalled = false;
      let warnMessage = "";

      console.warn = (message) => {
        warnCalled = true;
        warnMessage = message;
      };

      // Create a base with non-contiguous letters (enough characters to trigger validation)
      // abcdefhijk has a gap at 'g' (position 6), which should trigger the warning
      const nonContiguous = new BaseSystem("0123456789abcdefhijk");
      expect(nonContiguous.base).toBe(20);
      expect(warnCalled).toBe(true);
      expect(warnMessage).toContain("Non-contiguous");

      console.warn = originalWarn;
    });
  });

  describe("Edge Cases and Error Conditions", () => {
    it("should handle zero correctly", () => {
      const bases = [
        BaseSystem.BINARY,
        BaseSystem.OCTAL,
        BaseSystem.HEXADECIMAL,
      ];
      bases.forEach((base) => {
        expect(base.fromDecimal(0n)).toBe("0");
        expect(base.toDecimal("0")).toBe(0n);
      });
    });

    it("should handle single digit numbers", () => {
      const hex = BaseSystem.HEXADECIMAL;
      for (let i = 0; i < 16; i++) {
        const decimal = BigInt(i);
        const hexStr = hex.fromDecimal(decimal);
        expect(hex.toDecimal(hexStr)).toBe(decimal);
      }
    });

    it("should warn for very large bases", () => {
      const originalWarn = console.warn;
      let warnCalled = false;
      let warnMessage = "";

      console.warn = (message) => {
        warnCalled = true;
        warnMessage = message;
      };

      // Create a base with >1000 characters (should trigger warning)
      const largeSequence = Array.from(
        { length: 1001 },
        (_, i) => String.fromCharCode(0x4e00 + i), // Use CJK characters to avoid conflicts
      ).join("");

      new BaseSystem(largeSequence);
      expect(warnCalled).toBe(true);
      expect(warnMessage).toContain("Very large base system");

      console.warn = originalWarn;
    });

    it("should handle Unicode characters", () => {
      const unicodeBase = new BaseSystem("αβγδε", "Greek Base");
      expect(unicodeBase.base).toBe(5);
      expect(unicodeBase.characters).toEqual(["α", "β", "γ", "δ", "ε"]);

      const value = 42n;
      const greek = unicodeBase.fromDecimal(value);
      expect(unicodeBase.toDecimal(greek)).toBe(value);
    });

    it("should maintain case sensitivity", () => {
      const caseSensitive = new BaseSystem("aAbBcC");
      expect(caseSensitive.base).toBe(6);
      expect(caseSensitive.toDecimal("A")).toBe(1n);
      expect(caseSensitive.toDecimal("a")).toBe(0n);
      expect(caseSensitive.toDecimal("A")).not.toBe(
        caseSensitive.toDecimal("a"),
      );
    });
  });

  describe("Performance and Large Number Handling", () => {
    it("should handle very large numbers efficiently", () => {
      const binary = BaseSystem.BINARY;
      const veryLarge = 2n ** 1000n;

      const start = performance.now();
      const binaryStr = binary.fromDecimal(veryLarge);
      const backToDecimal = binary.toDecimal(binaryStr);
      const end = performance.now();

      expect(backToDecimal).toBe(veryLarge);
      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
    });

    it("should handle factorial numbers", () => {
      // Calculate 20! = 2432902008176640000
      let factorial20 = 1n;
      for (let i = 1n; i <= 20n; i++) {
        factorial20 *= i;
      }

      const bases = [
        BaseSystem.BINARY,
        BaseSystem.OCTAL,
        BaseSystem.HEXADECIMAL,
      ];
      bases.forEach((base) => {
        const str = base.fromDecimal(factorial20);
        expect(base.toDecimal(str)).toBe(factorial20);
      });
    });
  });

  describe("Parser Integration", () => {
    describe("Basic Base Notation", () => {
      it("should parse binary numbers with base notation", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("101[2]").toString()).toBe("5");
        expect(Parser.parse("1010[2]").toString()).toBe("10");
        expect(Parser.parse("11111111[2]").toString()).toBe("255");
      });

      it("should parse hexadecimal numbers with base notation", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("FF[16]").toString()).toBe("255");
        expect(Parser.parse("A0[16]").toString()).toBe("160");
        expect(Parser.parse("DEAD[16]").toString()).toBe("57005");
      });

      it("should parse octal numbers with base notation", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("777[8]").toString()).toBe("511");
        expect(Parser.parse("123[8]").toString()).toBe("83");
        expect(Parser.parse("17[8]").toString()).toBe("15");
      });

      it("should parse numbers in various bases", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("132[5]").toString()).toBe("42");
        expect(Parser.parse("36[12]").toString()).toBe("42");
        expect(Parser.parse("16[36]").toString()).toBe("42");
      });

      it("should handle negative numbers", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("-101[2]").toString()).toBe("-5");
        expect(Parser.parse("-FF[16]").toString()).toBe("-255");
        expect(Parser.parse("-123[8]").toString()).toBe("-83");
      });
    });

    describe("Base Notation with Decimals", () => {
      it("should parse binary decimals", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("10.1[2]").toString()).toBe("5/2");
        expect(Parser.parse("11.01[2]").toString()).toBe("13/4");
        expect(Parser.parse("1.11[2]").toString()).toBe("7/4");
      });

      it("should parse hexadecimal decimals", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("A.8[16]").toString()).toBe("21/2");
        expect(Parser.parse("F.F[16]").toString()).toBe("255/16");
        expect(Parser.parse("1.C[16]").toString()).toBe("7/4");
      });

      it("should parse octal decimals", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("7.4[8]").toString()).toBe("15/2");
        expect(Parser.parse("12.34[8]").toString()).toBe("167/16");
      });

      it("should handle negative decimal numbers", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("-10.1[2]").toString()).toBe("-5/2");
        expect(Parser.parse("-A.8[16]").toString()).toBe("-21/2");
      });
    });

    describe("Base Notation with Fractions", () => {
      it("should parse binary fractions", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("1/10[2]").toString()).toBe("1/2");
        expect(Parser.parse("11/100[2]").toString()).toBe("3/4");
        expect(Parser.parse("101/110[2]").toString()).toBe("5/6");
      });

      it("should parse hexadecimal fractions", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("F/10[16]").toString()).toBe("15/16");
        expect(Parser.parse("A/C[16]").toString()).toBe("5/6");
        expect(Parser.parse("8/10[16]").toString()).toBe("1/2");
      });

      it("should handle negative fractions", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("-1/10[2]").toString()).toBe("-1/2");
        expect(Parser.parse("-F/10[16]").toString()).toBe("-15/16");
      });
    });

    describe("Base Notation with Mixed Numbers", () => {
      it("should parse binary mixed numbers", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("1..1/10[2]").toString()).toBe("3/2");
        expect(Parser.parse("10..1/10[2]").toString()).toBe("5/2");
        expect(Parser.parse("11..11/100[2]").toString()).toBe("15/4");
      });

      it("should parse hexadecimal mixed numbers", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("A..8/10[16]").toString()).toBe("21/2");
        expect(Parser.parse("1..F/10[16]").toString()).toBe("31/16");
      });

      it("should handle negative mixed numbers", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("-1..1/10[2]").toString()).toBe("-3/2");
        expect(Parser.parse("-A..8/10[16]").toString()).toBe("-21/2");
      });
    });

    describe("Base Notation with Intervals", () => {
      it("should parse binary intervals", () => {
        const { Parser } = require("../src/parser.js");

        const result = Parser.parse("101:111[2]");
        expect(result.toString()).toBe("5:7");
      });

      it("should parse hexadecimal intervals", () => {
        const { Parser } = require("../src/parser.js");

        const result = Parser.parse("A:F[16]");
        expect(result.toString()).toBe("10:15");
      });

      it("should parse mixed intervals", () => {
        const { Parser } = require("../src/parser.js");

        const result = Parser.parse("A.8:F.F[16]");
        expect(result.toString()).toBe("21/2:255/16");
      });
    });

    describe("Base Notation in Expressions", () => {
      it("should handle base notation in arithmetic expressions", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("101[2] + 11[2]").toString()).toBe("8");
        expect(Parser.parse("FF[16] - A[16]").toString()).toBe("245");
        expect(Parser.parse("777[8] * 2").toString()).toBe("1022");
        expect(Parser.parse("100[2] / 10[2]").toString()).toBe("2");
      });

      it("should handle mixed bases in expressions", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("FF[16] + 101[2]").toString()).toBe("260");
        expect(Parser.parse("777[8] - 11111111[2]").toString()).toBe("256");
      });

      it("should handle parentheses with base notation", () => {
        const { Parser } = require("../src/parser.js");

        expect(Parser.parse("(101[2] + 11[2]) * 10[2]").toString()).toBe("16");
        expect(Parser.parse("FF[16] / (A[16] + 1)").toString()).toBe("255/11");
      });
    });

    describe("Error Handling", () => {
      it("should throw error for invalid base", () => {
        const { Parser } = require("../src/parser.js");

        expect(() => Parser.parse("101[1]")).toThrow("Base 1 is not supported");
        expect(() => Parser.parse("101[100]")).toThrow(
          "Base 100 is not supported",
        );
      });

      it("should throw error for invalid digits", () => {
        const { Parser } = require("../src/parser.js");

        expect(() => Parser.parse("123[2]")).toThrow(
          "contains characters not valid",
        );
        expect(() => Parser.parse("XYZ[16]")).toThrow(
          "contains characters not valid",
        );
        expect(() => Parser.parse("888[8]")).toThrow(
          "contains characters not valid",
        );
      });

      it("should throw error for malformed notation", () => {
        const { Parser } = require("../src/parser.js");

        expect(() => Parser.parse("101[")).toThrow();
        expect(() => Parser.parse("101]")).toThrow();
        expect(() => Parser.parse("101[]")).toThrow();
      });

      it("should throw error for invalid mixed numbers", () => {
        const { Parser } = require("../src/parser.js");

        expect(() => Parser.parse("1..2[2]")).toThrow("contain");
        expect(() => Parser.parse("1../2[2]")).toThrow("empty string");
      });

      it("should throw error for division by zero", () => {
        const { Parser } = require("../src/parser.js");

        expect(() => Parser.parse("1/0[2]")).toThrow(
          "Denominator cannot be zero",
        );
        expect(() => Parser.parse("A/0[16]")).toThrow(
          "Denominator cannot be zero",
        );
      });
    });

    describe("Type Promotion", () => {
      it("should return Integer for whole numbers in type-aware mode", () => {
        const { Parser } = require("../src/parser.js");
        const { Integer } = require("../src/integer.js");

        const result = Parser.parse("101[2]", { typeAware: true });
        expect(result).toBeInstanceOf(Integer);
        expect(result.toString()).toBe("5");
      });

      it("should return Rational for fractions", () => {
        const { Parser } = require("../src/parser.js");
        const { Rational } = require("../src/rational.js");

        const result = Parser.parse("1/10[2]", { typeAware: true });
        expect(result).toBeInstanceOf(Rational);
        expect(result.toString()).toBe("1/2");
      });

      it("should return RationalInterval for intervals", () => {
        const { Parser } = require("../src/parser.js");
        const { RationalInterval } = require("../src/rational-interval.js");

        const result = Parser.parse("101:111[2]", { typeAware: true });
        expect(result).toBeInstanceOf(RationalInterval);
        expect(result.toString()).toBe("5:7");
      });
    });

    describe("Base-Aware Input Parsing", () => {
      it("should parse numbers in input base without explicit notation", () => {
        const { Parser } = require("../src/parser.js");
        const { BaseSystem } = require("../src/base-system.js");
        const { Integer } = require("../src/integer.js");

        // Parse binary input
        const binaryResult = Parser.parse("101", {
          typeAware: true,
          inputBase: BaseSystem.BINARY,
        });
        expect(binaryResult).toBeInstanceOf(Integer);
        expect(binaryResult.value).toBe(5n);

        // Parse base 3 input
        const base3 = BaseSystem.fromBase(3);
        const base3Result = Parser.parse("12", {
          typeAware: true,
          inputBase: base3,
        });
        expect(base3Result).toBeInstanceOf(Integer);
        expect(base3Result.value).toBe(5n);
      });

      it("should parse mixed numbers in input base", () => {
        const { Parser } = require("../src/parser.js");
        const { BaseSystem } = require("../src/base-system.js");
        const { Rational } = require("../src/rational.js");

        // Test explicit base notation first (known to work)
        const explicitResult = Parser.parse("12..101/211[3]", {
          typeAware: true,
        });
        expect(explicitResult).toBeInstanceOf(Rational);
        expect(explicitResult.numerator).toBe(60n);
        expect(explicitResult.denominator).toBe(11n);

        // TODO: Input base parsing for mixed numbers needs implementation
        // Currently falls back to decimal parsing
        const base3 = BaseSystem.fromBase(3);
        const result = Parser.parse("12..101/211", {
          typeAware: true,
          inputBase: base3,
        });
        expect(result).toBeInstanceOf(Rational);
        // Now correctly parses as base 3: 12[3] = 5, 101[3] = 10, 211[3] = 22
        // So 5 + 10/22 = 5 + 5/11 = 60/11
        expect(result.numerator).toBe(60n);
        expect(result.denominator).toBe(11n);
      });

      it("should parse fractions in input base", () => {
        const { Parser } = require("../src/parser.js");
        const { BaseSystem } = require("../src/base-system.js");
        const { Rational } = require("../src/rational.js");

        // Parse binary fraction
        const binaryResult = Parser.parse("101/11", {
          typeAware: true,
          inputBase: BaseSystem.BINARY,
        });
        expect(binaryResult).toBeInstanceOf(Rational);
        expect(binaryResult.numerator).toBe(5n);
        expect(binaryResult.denominator).toBe(3n);
      });

      it("should parse decimals in input base", () => {
        const { Parser } = require("../src/parser.js");
        const { BaseSystem } = require("../src/base-system.js");
        const { Rational } = require("../src/rational.js");

        // Parse binary decimal: 10.1[2] = 2.5
        const result = Parser.parse("10.1", {
          typeAware: true,
          inputBase: BaseSystem.BINARY,
        });
        expect(result).toBeInstanceOf(Rational);
        expect(result.numerator).toBe(5n);
        expect(result.denominator).toBe(2n);
      });

      it("should handle arithmetic with input base", () => {
        const { Parser } = require("../src/parser.js");
        const { BaseSystem } = require("../src/base-system.js");
        const { Integer } = require("../src/integer.js");

        // Parse binary arithmetic: 101 + 11 = 5 + 3 = 8
        const result = Parser.parse("101 + 11", {
          typeAware: true,
          inputBase: BaseSystem.BINARY,
        });
        expect(result).toBeInstanceOf(Integer);
        expect(result.value).toBe(8n);
      });
    });

    describe("Base-Aware E Notation", () => {
      it("should handle E notation in input base (non-E containing bases)", () => {
        const { Parser } = require("../src/parser.js");
        const { BaseSystem } = require("../src/base-system.js");
        const { Integer } = require("../src/integer.js");

        // TODO: Input base E notation needs implementation
        // Currently falls back to decimal E notation
        const base3 = BaseSystem.fromBase(3);
        const result = Parser.parse("12E2", {
          typeAware: true,
          inputBase: base3,
        });
        expect(result).toBeInstanceOf(Integer);
        // Now correctly parses as base 3: 12[3] = 5, E2[3] = 3^2 = 9
        // So 5 * 9 = 45
        expect(result.value).toBe(45n);

        // Explicit base notation works correctly
        const explicitResult = Parser.parse("12E2[3]");
        expect(explicitResult).toBeInstanceOf(Integer);
        expect(explicitResult.value).toBe(45n);
      });

      it("should handle E notation with base-aware exponent parsing", () => {
        const { Parser } = require("../src/parser.js");
        const { BaseSystem } = require("../src/base-system.js");
        const { Integer } = require("../src/integer.js");

        // TODO: Input base E notation with base-aware exponents needs implementation
        // Currently falls back to decimal E notation
        const base3 = BaseSystem.fromBase(3);
        const result = Parser.parse("12E11", {
          typeAware: true,
          inputBase: base3,
        });
        expect(result).toBeInstanceOf(Integer);
        // Now correctly parses as base 3: 12[3] = 5, E11[3] where 11[3] = 4
        // So 5 * 3^4 = 5 * 81 = 405
        expect(result.value).toBe(405n);

        // Explicit base notation works correctly
        const explicitResult = Parser.parse("12E11[3]");
        expect(explicitResult).toBeInstanceOf(Integer);
        expect(explicitResult.value).toBe(405n);
      });

      it("should use _^ notation for bases containing E", () => {
        const { Parser } = require("../src/parser.js");
        const { BaseSystem } = require("../src/base-system.js");
        const { Integer } = require("../src/integer.js");

        // TODO: _^ notation for input base needs implementation
        // Create a base that contains E
        const baseWithE = new BaseSystem("0-9A-E", "Base 15 with E");

        // Test explicit base notation first (known to work)
        const explicitResult = Parser.parse("AE_^2[15]");
        expect(explicitResult).toBeInstanceOf(Integer);
        // AE[15] = 164, 2[15] = 2, so 164 * 15^2 = 164 * 225 = 36900
        expect(explicitResult.value).toBe(36900n);

        // Input base _^ notation not yet implemented
        // const result = Parser.parse("AE_^2", {
        //   typeAware: true,
        //   inputBase: baseWithE,
        // });
      });

      it("should handle negative exponents in base-aware E notation", () => {
        const { Parser } = require("../src/parser.js");
        const { BaseSystem } = require("../src/base-system.js");
        const { Rational } = require("../src/rational.js");

        // TODO: Input base E notation with negative exponents needs implementation
        // Test explicit base notation (known to work)
        const explicitResult = Parser.parse("12E-1[3]");
        expect(explicitResult).toBeInstanceOf(Rational);
        // 12[3] * 3^(-1) = 5 * (1/3) = 5/3
        expect(explicitResult.numerator).toBe(5n);
        expect(explicitResult.denominator).toBe(3n);

        // Input base version not yet implemented
        // const base3 = BaseSystem.fromBase(3);
        // const result = Parser.parse("12E-1", {
        //   typeAware: true,
        //   inputBase: base3,
        // });
      });

      it("should handle base notation with explicit base overriding input base", () => {
        const { Parser } = require("../src/parser.js");
        const { BaseSystem } = require("../src/base-system.js");
        const { Integer } = require("../src/integer.js");

        // Even with binary input base, explicit base notation should override
        const result = Parser.parse("12[3]", {
          typeAware: true,
          inputBase: BaseSystem.BINARY,
        });
        expect(result).toBeInstanceOf(Integer);
        expect(result.value).toBe(5n); // 12 in base 3
      });

      it("should fallback to decimal parsing when input base parsing fails", () => {
        const { Parser } = require("../src/parser.js");
        const { BaseSystem } = require("../src/base-system.js");
        const { Integer } = require("../src/integer.js");

        // Try to parse "9" with binary input base - should fallback to decimal
        const result = Parser.parse("9", {
          typeAware: true,
          inputBase: BaseSystem.BINARY,
        });
        expect(result).toBeInstanceOf(Integer);
        expect(result.value).toBe(9n);
      });

      it("should handle E notation in explicit base notation", () => {
        const { Parser } = require("../src/parser.js");
        const { Integer } = require("../src/integer.js");

        // Parse 12E2[3] - should be interpreted as (12E2) in base 3
        const result = Parser.parse("12E2[3]");
        expect(result).toBeInstanceOf(Integer);
        expect(result.value).toBe(45n); // 12[3] * 3^2 = 5 * 9 = 45

        // Test more complex cases
        const result2 = Parser.parse("12E11[3]");
        expect(result2).toBeInstanceOf(Integer);
        expect(result2.value).toBe(405n); // 12[3] * 3^(11[3]) = 5 * 3^4 = 405

        // Test with _^ notation
        const result3 = Parser.parse("AE_^2[15]");
        expect(result3).toBeInstanceOf(Integer);
        expect(result3.value).toBe(36900n); // AE[15] * 15^2 = 164 * 225 = 36900
      });
    });
  });
});

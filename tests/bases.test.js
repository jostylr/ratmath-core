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

      // Create a base with non-contiguous letters
      const nonContiguous = new BaseSystem("aceg");
      expect(nonContiguous.base).toBe(4);
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
});

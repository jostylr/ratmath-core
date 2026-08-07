import { describe, expect, it } from "bun:test";
import { BaseSystem } from "../index.js";

describe("BaseSystem public API", () => {
  it("constructs named Unicode systems and returns defensive copies", () => {
    const binary = new BaseSystem(["⚪", "⚫"], "Dots");
    expect(binary.base).toBe(2);
    expect(binary.name).toBe("Dots");
    expect(binary.getChar(0)).toBe("⚪");
    expect(binary.getChar(1n)).toBe("⚫");

    const characters = binary.characters;
    characters[0] = "x";
    expect(binary.characters).toEqual(["⚪", "⚫"]);

    const charMap = binary.charMap;
    charMap.set("x", 2);
    expect(binary.charMap.has("x")).toBe(false);
  });

  it("rejects malformed and conflicting character sets", () => {
    expect(() => new BaseSystem(10)).toThrow("string or array");
    expect(() => new BaseSystem("0")).toThrow("at least 2");
    expect(() => new BaseSystem("001")).toThrow("duplicate");
    expect(() => new BaseSystem(["0", "ten"])).toThrow("single Unicode");
    expect(() => new BaseSystem(["0", "+"])).toThrow("parser symbols");
  });

  it("validates digit indexes", () => {
    expect(BaseSystem.HEXADECIMAL.getChar(15)).toBe("f");
    expect(() => BaseSystem.BINARY.getChar(-1)).toThrow("in-range integer");
    expect(() => BaseSystem.BINARY.getChar(2)).toThrow("in-range integer");
    expect(() => BaseSystem.BINARY.getChar(1.5)).toThrow("in-range integer");
  });

  it("converts positive, negative, zero, and Unicode values", () => {
    expect(BaseSystem.BINARY.toDecimal("101101")).toBe(45n);
    expect(BaseSystem.HEXADECIMAL.toDecimal("-ff")).toBe(-255n);
    expect(BaseSystem.BINARY.fromDecimal(0n)).toBe("0");
    expect(BaseSystem.BINARY.fromDecimal(45n)).toBe("101101");
    expect(BaseSystem.HEXADECIMAL.fromDecimal(-255n)).toBe("-ff");

    const dots = new BaseSystem("⚪⚫");
    expect(dots.toDecimal("⚫⚪⚫")).toBe(5n);
    expect(dots.fromDecimal(5n)).toBe("⚫⚪⚫");
  });

  it("rejects invalid conversion inputs", () => {
    expect(() => BaseSystem.BINARY.toDecimal(10)).toThrow("non-empty string");
    expect(() => BaseSystem.BINARY.toDecimal("")).toThrow("non-empty string");
    expect(() => BaseSystem.BINARY.toDecimal("-")).toThrow("minus sign");
    expect(() => BaseSystem.BINARY.toDecimal("102")).toThrow(
      "Invalid character",
    );
    expect(() => BaseSystem.BINARY.fromDecimal(2)).toThrow("BigInt");
  });

  it("validates numeral strings and exposes digit bounds", () => {
    expect(BaseSystem.BINARY.isValidString("-101")).toBe(true);
    expect(BaseSystem.BINARY.isValidString("102")).toBe(false);
    expect(BaseSystem.BINARY.isValidString("-")).toBe(false);
    expect(BaseSystem.BINARY.isValidString(101)).toBe(false);
    expect(BaseSystem.HEXADECIMAL.getMinDigit()).toBe("0");
    expect(BaseSystem.HEXADECIMAL.getMaxDigit()).toBe("f");
  });

  it("describes and compares systems by their digit sequence", () => {
    const namedBinary = new BaseSystem("01", "Named binary");
    expect(namedBinary.toString()).toBe("Named binary (01)");
    expect(namedBinary.equals(BaseSystem.BINARY)).toBe(true);
    expect(namedBinary.equals(BaseSystem.TERNARY)).toBe(false);
    expect(namedBinary.equals(new BaseSystem("ab"))).toBe(false);
    expect(namedBinary.equals("01")).toBe(false);
    expect(BaseSystem.fromBase(21).toString()).toContain("...");
  });

  it("creates every supported standard pattern", () => {
    expect(BaseSystem.fromBase(2).equals(BaseSystem.BINARY)).toBe(true);
    expect(BaseSystem.fromBase(62).characters.at(-1)).toBe("Z");
    expect(BaseSystem.createPattern("alphanumeric", 16).base).toBe(16);
    expect(BaseSystem.createPattern("digits-only", 8).characters).toEqual([
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
    ]);
    expect(BaseSystem.createPattern("letters-only", 30).characters.at(-1)).toBe(
      "D",
    );
    expect(BaseSystem.createPattern("uppercase-only", 4).characters).toEqual([
      "A",
      "B",
      "C",
      "D",
    ]);
  });

  it("rejects unsupported bases and pattern sizes", () => {
    expect(() => BaseSystem.fromBase(1)).toThrow("integer >= 2");
    expect(() => BaseSystem.fromBase(2.5)).toThrow("integer >= 2");
    expect(() => BaseSystem.fromBase(63)).toThrow("up to 62");
    expect(() => BaseSystem.createPattern("alphanumeric", 63)).toThrow(
      "up to base 62",
    );
    expect(() => BaseSystem.createPattern("digits-only", 11)).toThrow(
      "up to base 10",
    );
    expect(() => BaseSystem.createPattern("letters-only", 53)).toThrow(
      "up to base 52",
    );
    expect(() => BaseSystem.createPattern("uppercase-only", 27)).toThrow(
      "up to base 26",
    );
    expect(() => BaseSystem.createPattern("unknown", 4)).toThrow(
      "Unknown pattern",
    );
  });

  it("registers, resolves, and removes custom prefixes", () => {
    const system = new BaseSystem("ab", "Prefix test");
    try {
      BaseSystem.registerPrefix("z", system);
      expect(BaseSystem.hasExactPrefix("z")).toBe(true);
      expect(BaseSystem.hasExactPrefix("Z")).toBe(false);
      expect(BaseSystem.getSystemForPrefix("z")).toBe(system);
      expect(BaseSystem.getSystemForPrefix("Z")).toBe(system);
      expect(BaseSystem.getPrefixForSystem(new BaseSystem("ab"))).toBe("z");
      expect(BaseSystem.getSystemForPrefix("D")).toBe(null);
      expect(BaseSystem.getSystemForPrefix("?")).toBeUndefined();
    } finally {
      BaseSystem.unregisterPrefix("z");
    }
    expect(BaseSystem.hasExactPrefix("z")).toBe(false);
    expect(BaseSystem.getPrefixForSystem(system)).toBeUndefined();
  });

  it("validates prefix registration", () => {
    expect(() => BaseSystem.registerPrefix("too-long", BaseSystem.BINARY)).toThrow(
      "single character",
    );
    expect(() => BaseSystem.registerPrefix("1", BaseSystem.BINARY)).toThrow(
      "letter",
    );
    expect(() => BaseSystem.registerPrefix("z", {})).toThrow(
      "valid BaseSystem",
    );
  });

  it("applies case-sensitivity settings", () => {
    const system = new BaseSystem("AB", "Upper");
    expect(system.withCaseSensitivity(true)).toBe(system);

    const insensitive = system.withCaseSensitivity(false);
    expect(insensitive.characters).toEqual(["a", "b"]);
    expect(insensitive.name).toContain("case-insensitive");
    expect(() => system.withCaseSensitivity("false")).toThrow("boolean");
  });
});

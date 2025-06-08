import { describe, expect, it, test } from "bun:test";
import { Parser, parseRepeatingDecimal, Rational, RationalInterval } from "../index.js";

describe("Repeating Decimal Intervals", () => {
  describe("range notation after decimal point", () => {
    it("parses 0.[#3,#6] as interval from 1/3 to 2/3", () => {
      const result = parseRepeatingDecimal("0.[#3,#6]");
      
      expect(result.low.equals(new Rational("1/3"))).toBe(true);
      expect(result.high.equals(new Rational("2/3"))).toBe(true);
    });

    it("parses 0.[1,4] as interval from 0.1 to 0.4", () => {
      const result = parseRepeatingDecimal("0.[1,4]");
      
      expect(result.low.equals(new Rational("1/10"))).toBe(true);
      expect(result.high.equals(new Rational("2/5"))).toBe(true);
    });

    it("parses 1.[#3,#6] as interval from 1.333... to 1.666...", () => {
      const result = parseRepeatingDecimal("1.[#3,#6]");
      
      expect(result.low.equals(new Rational("4/3"))).toBe(true);
      expect(result.high.equals(new Rational("5/3"))).toBe(true);
    });

    it("parses negative bases like -2.[#1,#5]", () => {
      const result = parseRepeatingDecimal("-2.[#1,#5]");
      
      expect(result.low.equals(new Rational("-23/9"))).toBe(true);
      expect(result.high.equals(new Rational("-19/9"))).toBe(true);
    });

    it("handles mixed repeating and non-repeating endpoints", () => {
      const result = parseRepeatingDecimal("0.[2,#6]");
      
      expect(result.low.equals(new Rational("1/5"))).toBe(true);
      expect(result.high.equals(new Rational("2/3"))).toBe(true);
    });

    it("parses colon notation 0.[#3:#6]", () => {
      const result = parseRepeatingDecimal("0.[#3:#6]");
      
      expect(result.low.equals(new Rational("1/3"))).toBe(true);
      expect(result.high.equals(new Rational("2/3"))).toBe(true);
    });

    it("handles complex repeating patterns", () => {
      const result = parseRepeatingDecimal("0.[#142857,#285714]");
      
      // 1/7 and 2/7
      expect(result.low.equals(new Rational("1/7"))).toBe(true);
      expect(result.high.equals(new Rational("2/7"))).toBe(true);
    });
  });

  describe("offset notation with repeating decimals", () => {
    it("parses integer base with decimal offset 12[+4.3,-2]", () => {
      const result = parseRepeatingDecimal("12[+4.3,-2]");
      
      // Integer base: offsets applied directly in ones place
      // 12 + 4.3 = 16.3, 12 - 2 = 10
      expect(result.low.equals(new Rational("10"))).toBe(true);
      expect(result.high.equals(new Rational("163/10"))).toBe(true); // 16.3
    });

    it("parses integer base with small decimal offset 12[+0.43,-13]", () => {
      const result = parseRepeatingDecimal("12[+0.43,-13]");
      
      // 12 + 0.43 = 12.43, 12 - 13 = -1
      expect(result.low.equals(new Rational("-1"))).toBe(true);
      expect(result.high.equals(new Rational("1243/100"))).toBe(true); // 12.43
    });

    it("parses 1[+-0.#3] for integer base with repeating decimal offset", () => {
      const result = parseRepeatingDecimal("1[+-0.#3]");
      
      const base = new Rational("1");
      const offset = new Rational("1/3"); // 0.333...
      
      // Integer base: apply offset directly
      expect(result.low.equals(base.subtract(offset))).toBe(true);
      expect(result.high.equals(base.add(offset))).toBe(true);
    });

    it("parses integer base with integer offset 78[+-10]", () => {
      const result = parseRepeatingDecimal("78[+-10]");
      
      // Integer base: apply offset directly (new consistent behavior)
      // 78 + 10 = 88, 78 - 10 = 68
      expect(result.low.equals(new Rational("68"))).toBe(true);
      expect(result.high.equals(new Rational("88"))).toBe(true);
    });

    it("parses decimal base with scaled offset 0.5[+-33.#3]", () => {
      const result = parseRepeatingDecimal("0.5[+-33.#3]");
      
      const base = new Rational("1/2");
      const offset = new Rational("100/3"); // 33.333...
      // For decimal base, offset is scaled to next decimal place: 33.333.../100
      const scaledOffset = offset.divide(new Rational("100"));
      
      expect(result.low.equals(base.subtract(scaledOffset))).toBe(true);
      expect(result.high.equals(base.add(scaledOffset))).toBe(true);
    });

    it("handles relative notation with repeating decimals for integer base", () => {
      const result = parseRepeatingDecimal("5[+0.#3,-0.#6]");
      
      const base = new Rational("5");
      const positiveOffset = new Rational("1/3"); // 0.333...
      const negativeOffset = new Rational("2/3"); // 0.666...
      
      // Integer base: apply offsets directly
      expect(result.low.equals(base.subtract(negativeOffset))).toBe(true);
      expect(result.high.equals(base.add(positiveOffset))).toBe(true);
    });

    it("handles -+ symmetric notation", () => {
      const result1 = parseRepeatingDecimal("10[-+2.5]");
      const result2 = parseRepeatingDecimal("10[+-2.5]");
      
      expect(result1.equals(result2)).toBe(true);
    });
  });

  describe("integration with Parser", () => {
    it("parses repeating decimal intervals in expressions", () => {
      const result = Parser.parse("0.[#3,#6]");
      
      expect(result.low.equals(new Rational("1/3"))).toBe(true);
      expect(result.high.equals(new Rational("2/3"))).toBe(true);
    });

    it("performs arithmetic with repeating decimal intervals", () => {
      const result = Parser.parse("0.[#1,#2] + 1.[#3,#4]");
      
      // [1/9, 2/9] + [4/3, 13/9] = [13/9, 5/3]
      expect(result.low.equals(new Rational("13/9"))).toBe(true);
      expect(result.high.equals(new Rational("5/3"))).toBe(true);
    });

    it("handles multiplication with repeating decimal offsets", () => {
      const result = Parser.parse("2[+-0.#3] * 3");
      
      // Integer base: [2 - 1/3, 2 + 1/3] * 3 = [5, 7]
      expect(result.low.equals(new Rational("5"))).toBe(true);
      expect(result.high.equals(new Rational("7"))).toBe(true);
    });

    it("parses complex expressions with multiple repeating decimal intervals", () => {
      const result = Parser.parse("(0.[#1,#2] + 1.[#3,#4]) / 2");
      
      // [1/9, 2/9] + [4/3, 13/9] = [13/9, 5/3]
      // Then divide by 2: [13/18, 5/6]
      expect(result.low.equals(new Rational("13/18"))).toBe(true);
      expect(result.high.equals(new Rational("5/6"))).toBe(true);
    });
  });

  describe("error handling", () => {
    it("throws error for brackets not after decimal point", () => {
      expect(() => parseRepeatingDecimal("1[2,3]")).toThrow();
    });

    it("throws error for invalid endpoint format", () => {
      expect(() => parseRepeatingDecimal("0.[#3,abc]")).toThrow("Invalid endpoint format: abc");
      expect(() => parseRepeatingDecimal("0.[1.5,2]")).toThrow("Invalid endpoint format: 1.5");
    });

    it("throws error for missing comma in range notation", () => {
      expect(() => parseRepeatingDecimal("0.[#3#6]")).toThrow("Invalid uncertainty format for decimal point notation");
    });

    it("throws error for invalid offset format", () => {
      expect(() => parseRepeatingDecimal("0.[+-abc]")).toThrow();
      expect(() => parseRepeatingDecimal("0.[+#3]")).toThrow("Invalid uncertainty format for decimal point notation");
    });

    it("throws error for empty endpoints", () => {
      expect(() => parseRepeatingDecimal("0.[,#3]")).toThrow("Invalid endpoint format: ");
      expect(() => parseRepeatingDecimal("0.[#3,]")).toThrow("Invalid endpoint format: ");
    });

    it("throws error for malformed repeating decimals in endpoints", () => {
      expect(() => parseRepeatingDecimal("0.[##3,#6]")).toThrow();
      expect(() => parseRepeatingDecimal("0.[#,#6]")).toThrow();
    });
  });

  describe("mathematical verification", () => {
    it("verifies 0.[#3,#6] covers interval from 1/3 to 2/3", () => {
      const result = parseRepeatingDecimal("0.[#3,#6]");
      
      expect(result.low.equals(new Rational("1/3"))).toBe(true);
      expect(result.high.equals(new Rational("2/3"))).toBe(true);
    });

    it("verifies offset notation produces correct intervals", () => {
      const result = parseRepeatingDecimal("1[+-0.#3]");
      
      // Integer base: [1 - 1/3, 1 + 1/3] = [2/3, 4/3]
      expect(result.low.equals(new Rational("2/3"))).toBe(true);
      expect(result.high.equals(new Rational("4/3"))).toBe(true);
    });

    it("verifies integer base relative offsets work correctly", () => {
      const result = parseRepeatingDecimal("10[+2.5,-1.5]");
      
      // Integer base: [10 - 1.5, 10 + 2.5] = [8.5, 12.5]
      expect(result.low.equals(new Rational("17/2"))).toBe(true); // 8.5
      expect(result.high.equals(new Rational("25/2"))).toBe(true); // 12.5
    });

    it("verifies integer base with integer offsets work correctly", () => {
      const result = parseRepeatingDecimal("78[+-10]");
      
      // Integer base: [78 - 10, 78 + 10] = [68, 88]
      expect(result.low.equals(new Rational("68"))).toBe(true);
      expect(result.high.equals(new Rational("88"))).toBe(true);
    });

    it("verifies interval arithmetic preserves exactness", () => {
      const interval1 = parseRepeatingDecimal("0.[#3,#6]"); // [1/3, 2/3]
      const interval2 = parseRepeatingDecimal("0.[#6,#9]"); // [2/3, 1]
      
      const sum = interval1.add(interval2); // [1, 5/3]
      
      expect(sum.low.equals(new Rational("1"))).toBe(true);
      expect(sum.high.equals(new Rational("5/3"))).toBe(true);
    });

    it("verifies nested operations maintain precision", () => {
      const base = parseRepeatingDecimal("0.[#1,#2]"); // [1/9, 2/9]
      const scaled = base.multiply(RationalInterval.point(new Rational("9")));
      
      expect(scaled.low.equals(new Rational("1"))).toBe(true);
      expect(scaled.high.equals(new Rational("2"))).toBe(true);
    });
  });

  describe("roundtrip conversion and export", () => {
    it("exports range intervals with repeating decimals", () => {
      const interval = new RationalInterval(new Rational("1/3"), new Rational("2/3"));
      const exported = interval.toRepeatingDecimal();
      
      expect(exported).toBe("0.#3:0.#6");
    });

    it("exports intervals with mixed repeating and terminating decimals", () => {
      const interval = new RationalInterval(new Rational("1/5"), new Rational("1/3"));
      const exported = interval.toRepeatingDecimal();
      
      expect(exported).toBe("0.2#0:0.#3");
    });

    it("performs roundtrip conversion accurately", () => {
      const original = "0.[#3,#6]";
      const parsed = parseRepeatingDecimal(original);
      const exported = parsed.toRepeatingDecimal();
      const reparsed = parseRepeatingDecimal(exported);
      
      expect(parsed.equals(reparsed)).toBe(true);
    });

    it("handles roundtrip with offset notation", () => {
      const original = parseRepeatingDecimal("1[+-0.#3]");
      const exported = original.relativeMidDecimalInterval();
      
      // Should export as decimal approximation since exact repeating decimal export is complex
      expect(exported).toMatch(/1\[\+-0\.\d+\]/);
    });
  });

  describe("edge cases and boundary conditions", () => {
    it("handles point intervals with repeating decimals", () => {
      const result = parseRepeatingDecimal("0.[#3,#3]");
      
      expect(result.low.equals(result.high)).toBe(true);
      expect(result.low.equals(new Rational("1/3"))).toBe(true);
    });

    it("handles very small repeating decimal offsets", () => {
      const result = parseRepeatingDecimal("100[+-0.#001]");
      
      const base = new Rational("100");
      const offset = new Rational("1/999"); // 0.001001001...
      
      // Integer base: apply offset directly
      expect(result.low.equals(base.subtract(offset))).toBe(true);
      expect(result.high.equals(base.add(offset))).toBe(true);
    });

    it("handles large numbers with repeating decimal intervals", () => {
      const result = parseRepeatingDecimal("1000.[#142857,#285714]");
      
      expect(result.low.equals(new Rational("7001/7"))).toBe(true);
      expect(result.high.equals(new Rational("7002/7"))).toBe(true);
    });

    it("handles zero-based intervals", () => {
      const result = parseRepeatingDecimal("0.[0,#3]");
      
      expect(result.low.equals(new Rational("0"))).toBe(true);
      expect(result.high.equals(new Rational("1/3"))).toBe(true);
    });

    it("handles intervals crossing integer boundaries", () => {
      const result = parseRepeatingDecimal("0.[#9,0]");
      
      expect(result.low.equals(new Rational("0"))).toBe(true);
      expect(result.high.equals(new Rational("1"))).toBe(true);
    });
  });
});
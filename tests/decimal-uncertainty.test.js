import { describe, expect, it, test } from "bun:test";
import { Parser, Rational, RationalInterval } from "../index.js";

describe("Decimal Uncertainty Parsing", () => {
  describe("range notation", () => {
    it("parses basic range notation 1.23[56:67]", () => {
      const result = Parser.parse("1.23[56:67]");
      
      expect(result.low.equals(new Rational("1.2356"))).toBe(true);
      expect(result.high.equals(new Rational("1.2367"))).toBe(true);
    });

    it("parses range notation with different digit counts", () => {
      const result = Parser.parse("78.3[15:24]");
      
      expect(result.low.equals(new Rational("78.315"))).toBe(true);
      expect(result.high.equals(new Rational("78.324"))).toBe(true);
    });

    it("handles negative base numbers", () => {
      const result = Parser.parse("-1.23[56:67]");
      
      expect(result.low.equals(new Rational("-1.2367"))).toBe(true);
      expect(result.high.equals(new Rational("-1.2356"))).toBe(true);
    });

    it("handles integer base numbers", () => {
      const result = Parser.parse("42[15:25]");
      
      expect(result.low.equals(new Rational("4215"))).toBe(true);
      expect(result.high.equals(new Rational("4225"))).toBe(true);
    });
  });

  describe("relative notation", () => {
    it("parses basic relative notation 1.23[+5,-6]", () => {
      const result = Parser.parse("1.23[+5,-6]");
      
      // 1.23 + 0.005 = 1.235, 1.23 - 0.006 = 1.224
      expect(result.low.equals(new Rational("1.224"))).toBe(true);
      expect(result.high.equals(new Rational("1.235"))).toBe(true);
    });

    it("handles order independence of + and -", () => {
      const result1 = Parser.parse("1.23[+0.5,-0.6]");
      const result2 = Parser.parse("1.23[-0.6,+0.5]");
      
      expect(result1.low.equals(result2.low)).toBe(true);
      expect(result1.high.equals(result2.high)).toBe(true);
    });

    it("parses example 78.3[+15, -0.6]", () => {
      const result = Parser.parse("78.3[+15, -0.6]");
      
      // 78.3 + 0.15 = 78.45, 78.3 - 0.006 = 78.294
      expect(result.low.equals(new Rational("78.294"))).toBe(true);
      expect(result.high.equals(new Rational("78.45"))).toBe(true);
    });

    it("handles decimal offsets", () => {
      const result = Parser.parse("1.5[+0.25,-0.15]");
      
      // 1.5 + 0.0025 = 1.5025, 1.5 - 0.0015 = 1.4985
      expect(result.low.equals(new Rational("1.4985"))).toBe(true);
      expect(result.high.equals(new Rational("1.5025"))).toBe(true);
    });

    it("demonstrates equivalent integer vs decimal offset notation", () => {
      const result1 = Parser.parse("1.5[+25,-15]");
      const result2 = Parser.parse("1.5[+0.25,-0.15]");
      
      // 1.5[+25,-15] gives 1.5 ± 0.25/0.15 = 1.35:1.75
      expect(result1.low.equals(new Rational("1.35"))).toBe(true);
      expect(result1.high.equals(new Rational("1.75"))).toBe(true);
      
      // 1.5[+0.25,-0.15] gives 1.5 ± 0.0025/0.0015 = 1.4985:1.5025
      expect(result2.low.equals(new Rational("1.4985"))).toBe(true);
      expect(result2.high.equals(new Rational("1.5025"))).toBe(true);
      
      // They should be different results
      expect(result1.equals(result2)).toBe(false);
    });

    it("handles negative base with relative notation", () => {
      const result = Parser.parse("-2.5[+0.1,-0.2]");
      
      // -2.5 + 0.001 = -2.499, -2.5 - 0.002 = -2.502
      expect(result.low.equals(new Rational("-2.502"))).toBe(true);
      expect(result.high.equals(new Rational("-2.499"))).toBe(true);
    });

    it("parses symmetric notation with +-", () => {
      const result = Parser.parse("1.3[+-1]");
      
      // 1.3 ± 0.01 = 1.29:1.31
      expect(result.low.equals(new Rational("1.29"))).toBe(true);
      expect(result.high.equals(new Rational("1.31"))).toBe(true);
    });

    it("parses symmetric notation with -+", () => {
      const result = Parser.parse("1.3[-+1]");
      
      // 1.3 ± 0.01 = 1.29:1.31  
      expect(result.low.equals(new Rational("1.29"))).toBe(true);
      expect(result.high.equals(new Rational("1.31"))).toBe(true);
    });

    it("treats +- and -+ as equivalent", () => {
      const result1 = Parser.parse("1.3[+-1]");
      const result2 = Parser.parse("1.3[-+1]");
      
      expect(result1.equals(result2)).toBe(true);
    });

    it("handles decimal offsets in symmetric notation", () => {
      const result = Parser.parse("2.5[+-0.25]");
      
      // 2.5 ± 0.0025 = 2.4975:2.5025
      expect(result.low.equals(new Rational("2.4975"))).toBe(true);
      expect(result.high.equals(new Rational("2.5025"))).toBe(true);
    });

    it("handles symmetric notation with different base precisions", () => {
      const result1 = Parser.parse("1.23[+-5]");
      const result2 = Parser.parse("78[+-10]");
      
      // 1.23 ± 0.005 = 1.225:1.235
      expect(result1.low.equals(new Rational("1.225"))).toBe(true);
      expect(result1.high.equals(new Rational("1.235"))).toBe(true);
      
      // 78 ± 1 = 77:79
      expect(result2.low.equals(new Rational("77"))).toBe(true);
      expect(result2.high.equals(new Rational("79"))).toBe(true);
    });
  });

  describe("error handling", () => {
    it("throws error for missing brackets", () => {
      expect(() => Parser.parse("1.23")).not.toThrow();
      expect(() => Parser.parse("1.23[56:67")).toThrow();
    });

    it("throws error for invalid range format", () => {
      expect(() => Parser.parse("1.23[56]")).toThrow();
      expect(() => Parser.parse("1.23[56:67:89]")).toThrow();
    });

    it("throws error for invalid relative format", () => {
      expect(() => Parser.parse("1.23[+5]")).toThrow();
      expect(() => Parser.parse("1.23[+5,+6]")).toThrow();
      expect(() => Parser.parse("1.23[-5,-6]")).toThrow();
      expect(() => Parser.parse("1.23[5,6]")).toThrow();
    });

    it("throws error for non-numeric range values", () => {
      expect(() => Parser.parse("1.23[5a:67]")).toThrow();
      expect(() => Parser.parse("1.23[56:6.7]")).toThrow();
    });

    it("throws error for invalid offset values", () => {
      expect(() => Parser.parse("1.23[+5a,-6]")).toThrow();
      expect(() => Parser.parse("1.23[+,-6]")).toThrow("Offset must be a valid number");
    });

    it("throws error for invalid symmetric notation", () => {
      expect(() => Parser.parse("1.23[+-]")).toThrow("Symmetric notation must have a valid number after +- or -+");
      expect(() => Parser.parse("1.23[-+a]")).toThrow("Symmetric notation must have a valid number after +- or -+");
      expect(() => Parser.parse("1.23[+-5.a]")).toThrow("Symmetric notation must have a valid number after +- or -+");
    });
  });

  describe("arithmetic with uncertainty intervals", () => {
    it("performs addition with uncertainty intervals", () => {
      const result = Parser.parse("1.23[+0.5,-0.3] + 2.45[+0.2,-0.1]");
      
      // [1.2297, 1.2305] + [2.4499, 2.4502] = [3.6796, 3.6807]
      expect(result.low.equals(new Rational("3.6796"))).toBe(true);
      expect(result.high.equals(new Rational("3.6807"))).toBe(true);
    });

    it("performs multiplication with uncertainty intervals", () => {
      const result = Parser.parse("2[+0.1,-0.1] * 3[+0.2,-0.2]");
      
      // [1.99, 2.01] * [2.98, 3.02] = [5.9302, 6.0702]
      expect(result.low.equals(new Rational("5.9302"))).toBe(true);
      expect(result.high.equals(new Rational("6.0702"))).toBe(true);
    });
  });
});

describe("RationalInterval Export Methods", () => {
  describe("compactedDecimalInterval", () => {
    it("converts simple intervals to compacted notation", () => {
      const interval = new RationalInterval(new Rational("1.2356"), new Rational("1.2367"));
      expect(interval.compactedDecimalInterval()).toBe("1.23[56:67]");
    });

    it("handles intervals with no common prefix", () => {
      const interval = new RationalInterval(new Rational("1.5"), new Rational("2.7"));
      expect(interval.compactedDecimalInterval()).toBe("1.5:2.7");
    });

    it("handles intervals with different decimal lengths", () => {
      const interval = new RationalInterval(new Rational("1.23"), new Rational("1.2456"));
      expect(interval.compactedDecimalInterval()).toBe("1.23:1.2456");
    });

    it("handles negative intervals", () => {
      const interval = new RationalInterval(new Rational("-1.2367"), new Rational("-1.2356"));
      expect(interval.compactedDecimalInterval()).toBe("-1.23[67:56]");
    });
  });

  describe("relativeMidDecimalInterval", () => {
    it("converts intervals to symmetric notation", () => {
      const interval = new RationalInterval(new Rational("1.224"), new Rational("1.235"));
      const result = interval.relativeMidDecimalInterval();
      
      // Midpoint: 1.2295, offset: ±0.0055
      expect(result).toMatch(/1\.2295\[\+-0\.0055\]/);
    });

    it("handles asymmetric intervals", () => {
      const interval = new RationalInterval(new Rational("77.7"), new Rational("93.3"));
      const result = interval.relativeMidDecimalInterval();
      
      // Midpoint: 85.5, offset: ±7.8
      expect(result).toMatch(/85\.5\[\+-7\.8\]/);
    });

    it("handles small intervals", () => {
      const interval = new RationalInterval(new Rational("1.35"), new Rational("1.75"));
      const result = interval.relativeMidDecimalInterval();
      
      // Midpoint: 1.55, offset: ±0.2
      expect(result).toMatch(/1\.55\[\+-0\.2\]/);
    });
  });

  describe("relativeDecimalInterval", () => {
    it("uses shortest precise decimal within interval", () => {
      const interval = new RationalInterval(new Rational("1.224"), new Rational("1.235"));
      const result = interval.relativeDecimalInterval();
      
      // Should find 1.23 as the shortest precise decimal in [1.224, 1.235]
      // and create relative interval around it using next decimal place convention
      expect(result).toMatch(/1\.23\[\+5,-6\]/);
    });

    it("handles intervals where shortest decimal is closer to one bound", () => {
      const interval = new RationalInterval(new Rational("1.22"), new Rational("1.24"));
      const result = interval.relativeDecimalInterval();
      
      // Should find 1.23 as the shortest precise decimal in [1.22, 1.24]
      expect(result).toMatch(/1\.23\[\+-10\]/);
    });

    it("finds shortest decimal closest to midpoint when multiple options exist", () => {
      const interval = new RationalInterval(new Rational("1.225"), new Rational("1.275"));
      const result = interval.relativeDecimalInterval();
      
      // Both 1.23, 1.24, 1.25, 1.26, 1.27 are valid 2-decimal places
      // Midpoint is 1.25, so 1.25 should be chosen
      expect(result).toMatch(/1\.25\[\+-25\]/);
    });
  });
});

describe("Exact Decimal Intervals", () => {
  it("treats 1.23:1.34 as exact decimals", () => {
    const result1 = Parser.parse("1.23:1.34");
    const result2 = Parser.parse("1.23#0:1.34#0");
    
    expect(result1.low.equals(result2.low)).toBe(true);
    expect(result1.high.equals(result2.high)).toBe(true);
  });

  it("handles mixed exact and repeating decimals", () => {
    const result = Parser.parse("1.5:0.#3");
    
    expect(result.low.equals(new Rational("1/3"))).toBe(true);
    expect(result.high.equals(new Rational("3/2"))).toBe(true);
  });

  it("exports exact intervals with repeating decimal notation", () => {
    const interval = new RationalInterval(new Rational("1.23"), new Rational("1.34"));
    const result = interval.toRepeatingDecimal();
    
    expect(result).toBe("1.23#0:1.34#0");
  });
});
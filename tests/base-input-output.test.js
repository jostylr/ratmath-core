import { describe, it, expect } from "bun:test";
import { BaseSystem } from "../src/base-system.js";
import { VariableManager } from "../src/var.js";

describe("Base Input-Output Functionality", () => {
  describe("VariableManager Input Base Preprocessing", () => {
    it("should convert simple integers from input base to decimal", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const result = vm.processInput("101");
      expect(result.type).toBe("expression");
      expect(result.result.toString()).toBe("5"); // 101 binary = 5 decimal
    });

    it("should convert negative integers from input base to decimal", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const result = vm.processInput("-101");
      expect(result.type).toBe("expression");
      expect(result.result.toString()).toBe("-5"); // -101 binary = -5 decimal
    });

    it("should convert hexadecimal input to decimal", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.HEXADECIMAL);

      const result = vm.processInput("FF");
      expect(result.type).toBe("expression");
      expect(result.result.toString()).toBe("255"); // FF hex = 255 decimal
    });

    it("should convert octal input to decimal", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.OCTAL);

      const result = vm.processInput("777");
      expect(result.type).toBe("expression");
      expect(result.result.toString()).toBe("511"); // 777 octal = 511 decimal
    });

    it("should handle arithmetic with input base conversion", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const result = vm.processInput("101 + 11");
      expect(result.type).toBe("expression");
      expect(result.result.toString()).toBe("8"); // 101 binary (5) + 11 binary (3) = 8
    });

    it("should preserve explicit base notation", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      // Note: Mixed preprocessing and explicit base notation has parser limitations
      // For now, test with explicit base notation only
      const result = vm.processInput("101[2] + FF[16]");
      expect(result.type).toBe("expression");
      expect(result.result.toString()).toBe("260"); // 101 binary (5) + FF hex (255) = 260
    });

    it("should not convert numbers when input base is decimal", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.DECIMAL);

      const result = vm.processInput("101");
      expect(result.type).toBe("expression");
      expect(result.result.toString()).toBe("101"); // 101 decimal = 101
    });

    it("should handle mixed expressions with input base", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const result = vm.processInput("(101 + 11) * 10");
      expect(result.type).toBe("expression");
      expect(result.result.toString()).toBe("16"); // (5 + 3) * 2 = 16
    });

    it("should handle variable assignments with input base", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const assignResult = vm.processInput("x = 101");
      expect(assignResult.type).toBe("assignment");
      expect(assignResult.result.toString()).toBe("5"); // 101 binary = 5 decimal

      const varResult = vm.processInput("x");
      expect(varResult.type).toBe("expression");
      expect(varResult.result.toString()).toBe("5");
    });

    it("should handle function definitions with input base", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const funcResult = vm.processInput("F[x] = x + 11");
      expect(funcResult.type).toBe("function");

      const callResult = vm.processInput("F(101)");
      expect(callResult.type).toBe("expression");
      expect(callResult.result.toString()).toBe("8"); // F(5) = 5 + 3 = 8
    });

    it("should skip conversion for decimals in non-decimal bases", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      // For now, decimal numbers are not converted from input base
      const result = vm.processInput("1.5");
      expect(result.type).toBe("expression");
      expect(result.result.toString()).toBe("3/2"); // 1.5 treated as decimal
    });

    it("should handle invalid digits gracefully", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      // 123 contains invalid digits for binary, should be left as-is
      const result = vm.processInput("123");
      expect(result.type).toBe("expression");
      expect(result.result.toString()).toBe("123"); // Left as decimal since invalid in binary
    });

    it("should handle custom base systems", () => {
      const vm = new VariableManager();
      const base5 = new BaseSystem("01234", "Base 5");
      vm.setInputBase(base5);

      const result = vm.processInput("1234");
      expect(result.type).toBe("expression");
      expect(result.result.toString()).toBe("194"); // 1234 base 5 = 194 decimal
    });
  });

  describe("Input Base Preprocessing Edge Cases", () => {
    it("should handle fractions in input base", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const result = vm.processInput("101/11");
      expect(result.type).toBe("expression");
      // Now fractions ARE converted automatically: 101[2]=5, 11[2]=3
      expect(result.result.toString()).toBe("5/3");
    });

    it("should handle parentheses with input base", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const result = vm.processInput("(101)");
      expect(result.type).toBe("expression");
      expect(result.result.toString()).toBe("5"); // 101 binary = 5 decimal
    });

    it("should handle zero in input base", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const result = vm.processInput("0");
      expect(result.type).toBe("expression");
      expect(result.result.toString()).toBe("0"); // 0 in any base = 0
    });

    it("should handle large numbers in input base", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const result = vm.processInput("11111111");
      expect(result.type).toBe("expression");
      expect(result.result.toString()).toBe("255"); // 11111111 binary = 255 decimal
    });

    it("should preserve scientific notation", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      // Scientific notation should not be converted
      const result = vm.processInput("1E3");
      expect(result.type).toBe("expression");
      expect(result.result.toString()).toBe("1000"); // 1E3 = 1000
    });

    it("should handle mixed base expressions correctly", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      // Use explicit base notation to avoid parser conflicts
      const result = vm.processInput("101[2] + A[16] + 77[8]");
      expect(result.type).toBe("expression");
      // 101 binary (5) + A hex (10) + 77 octal (63) = 78
      expect(result.result.toString()).toBe("78");
    });
  });

  describe("Preprocessing Number Pattern Matching", () => {
    it("should identify and convert simple integers", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const preprocessed = vm.preprocessExpression("101");
      expect(preprocessed).toBe("5"); // 101 binary = 5 decimal
    });

    it("should not convert numbers with explicit base notation", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const preprocessed = vm.preprocessExpression("101[2]");
      expect(preprocessed).toBe("101[2]"); // Should be left unchanged
    });

    it("should handle multiple numbers in expression", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const preprocessed = vm.preprocessExpression("101 + 11 - 1");
      expect(preprocessed).toBe("5 + 3 - 1"); // All numbers converted
    });

    it("should preserve operators and parentheses", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const preprocessed = vm.preprocessExpression("(101 * 11) / 10");
      expect(preprocessed).toBe("(5 * 3) / 2"); // Numbers converted, structure preserved
    });

    it("should handle negative numbers", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const preprocessed = vm.preprocessExpression("-101 + 11");
      expect(preprocessed).toBe("-5 + 3"); // Negative numbers handled
    });

    it("should leave invalid base digits unchanged", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const preprocessed = vm.preprocessExpression("123 + 101");
      expect(preprocessed).toBe("123 + 5"); // 123 invalid in binary, 101 converted
    });

    it("should handle mixed valid and invalid digits", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.OCTAL);

      const preprocessed = vm.preprocessExpression("123 + 789");
      expect(preprocessed).toBe("83 + 789"); // 123 octal = 83, 789 invalid in octal
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle empty expression", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const preprocessed = vm.preprocessExpression("");
      expect(preprocessed).toBe(""); // Empty expression unchanged
    });

    it("should handle expression with no numbers", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.BINARY);

      const preprocessed = vm.preprocessExpression("x + y");
      expect(preprocessed).toBe("x + y"); // No numbers to convert
    });

    it("should handle base conversion errors gracefully", () => {
      const vm = new VariableManager();
      // Create a mock base system that might throw errors
      const mockBase = {
        base: 3,
        characters: ["0", "1", "2"],
        isValidString: () => true,
        toDecimal: () => {
          throw new Error("Conversion error");
        },
      };
      vm.setInputBase(mockBase);

      const preprocessed = vm.preprocessExpression("123");
      expect(preprocessed).toBe("123"); // Should return original on error
    });

    it("should handle null input base", () => {
      const vm = new VariableManager();
      vm.setInputBase(null);

      const preprocessed = vm.preprocessExpression("123");
      expect(preprocessed).toBe("123"); // No conversion when no input base
    });

    it("should handle decimal input base efficiently", () => {
      const vm = new VariableManager();
      vm.setInputBase(BaseSystem.DECIMAL);

      const preprocessed = vm.preprocessExpression("123");
      expect(preprocessed).toBe("123"); // No conversion needed for decimal
    });
  });
});

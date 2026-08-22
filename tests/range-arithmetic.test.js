import { describe, expect, test } from "bun:test";
import {
  Integer,
  RANGE_OPERATION_RESULT_SCHEMA,
  Rational,
  RationalIntervalSet,
  checkRangeOperationResult,
  rangeAbsoluteValue,
  rangeAdd,
  rangeDivide,
  rangeIntegerPower,
  rangeMultiply,
  rangeNegate,
  rangeReciprocal,
  rangeSubtract,
} from "../index.js";

const set = (components) => new RationalIntervalSet(components);

describe("exact RationalIntervalSet arithmetic images", () => {
  test("negation, absolute value, addition, and subtraction preserve topology", () => {
    const input = set([
      { low: null, high: -2, lowClosed: false, highClosed: true },
      { low: 1, high: 3, lowClosed: false, highClosed: true },
    ]);
    expect(rangeNegate(input).range.toString()).toBe("[-3,-1) U [2,inf)");
    expect(rangeAbsoluteValue(input).range.toString()).toBe("(1,inf)");

    const sum = rangeAdd(
      { low: 0, high: 1, lowClosed: false, highClosed: true },
      { low: 2, high: 3, lowClosed: true, highClosed: false },
    );
    expect(sum.range.toString()).toBe("(2,4)");
    expect(sum.domain.coverage).toBe("allDefined");

    expect(rangeSubtract(new RationalIntervalSet({ low: 1, high: 2 }), 3)
      .range.toString()).toBe("[-2,-1]");
  });

  test("multiplication handles signs, open zero, and unbounded zero products", () => {
    expect(rangeMultiply(
      { low: -2, high: -1 },
      { low: 3, high: 4 },
    ).range.toString()).toBe("[-8,-3]");

    expect(rangeMultiply(
      { low: -1, high: 0, lowClosed: false, highClosed: false },
      { low: 0, high: 2, lowClosed: false, highClosed: true },
    ).range.toString()).toBe("(-2,0)");

    expect(rangeMultiply(
      { low: null, high: -2, lowClosed: false, highClosed: true },
      RationalIntervalSet.point(0),
    ).range.toString()).toBe("[0,0]");

    expect(rangeMultiply(
      { low: 0, high: null, lowClosed: false, highClosed: false },
      { low: 0, high: null, lowClosed: false, highClosed: false },
    ).range.toString()).toBe("(0,inf)");
  });

  test("reciprocal removes only zero and produces exact disconnected rays", () => {
    const crossing = rangeReciprocal(new RationalIntervalSet({ low: -1, high: 1 }));
    expect(crossing.range.toString()).toBe("(-inf,-1] U [1,inf)");
    expect(crossing.domain.coverage).toBe("partiallyDefined");
    expect(crossing.domain.definedInput.toString()).toBe("[-1,0) U (0,1]");
    expect(crossing.domain.exclusions[0].reason).toBe("divisionByZero");

    expect(rangeReciprocal({ low: 0, high: 1 }).range.toString()).toBe("[1,inf)");
    const zero = rangeReciprocal(RationalIntervalSet.point(0));
    expect(zero.range.isEmpty).toBe(true);
    expect(zero.domain.coverage).toBe("noDefinedInputs");

    const punctured = rangeReciprocal({
      low: -1,
      high: 0,
      lowClosed: false,
      highClosed: false,
    });
    expect(punctured.range.toString()).toBe("(-inf,-1)");
  });

  test("division reports denominator exclusions without discarding defined pairs", () => {
    const zeroAcross = rangeDivide(RationalIntervalSet.point(0), { low: -1, high: 1 });
    expect(zeroAcross.range.toString()).toBe("[0,0]");
    expect(zeroAcross.domain.coverage).toBe("partiallyDefined");

    const nowhere = rangeDivide(RationalIntervalSet.point(0), RationalIntervalSet.point(0));
    expect(nowhere.range.isEmpty).toBe(true);
    expect(nowhere.domain.coverage).toBe("noDefinedInputs");

    const emptyRequest = rangeDivide(RationalIntervalSet.empty, RationalIntervalSet.point(0));
    expect(emptyRequest.range.isEmpty).toBe(true);
    expect(emptyRequest.domain.coverage).toBe("allDefined");
  });

  test("integer powers implement exact correlated images and scoped 0^0 convention", () => {
    expect(rangeIntegerPower({ low: -2, high: 3 }, 2).range.toString()).toBe("[0,9]");
    expect(rangeIntegerPower({
      low: -2,
      high: 0,
      lowClosed: false,
      highClosed: false,
    }, 2).range.toString()).toBe("(0,4)");
    expect(rangeIntegerPower({ low: null, high: -1 }, 3).range.toString())
      .toBe("(-inf,-1]");

    const mixedZero = rangeIntegerPower({ low: 0, high: 2 }, 0);
    expect(mixedZero.range.toString()).toBe("[1,1]");
    expect(mixedZero.domain.coverage).toBe("partiallyDefined");
    expect(mixedZero.domain.exclusions[0].reason).toBe("zeroPowerZero");

    const defaultZero = rangeIntegerPower(RationalIntervalSet.point(0), 0);
    expect(defaultZero.range.isEmpty).toBe(true);
    expect(defaultZero.domain.coverage).toBe("noDefinedInputs");

    const conventionalZero = rangeIntegerPower(
      RationalIntervalSet.point(0),
      0,
      { zeroPowerZero: "one" },
    );
    expect(conventionalZero.range.toString()).toBe("[1,1]");
    expect(conventionalZero.domain.coverage).toBe("allDefined");

    expect(rangeIntegerPower({ low: -1, high: 1 }, -1).range.toString())
      .toBe("(-inf,-1] U [1,inf)");
  });

  test("integer powers validate every exact exponent form and policy option", () => {
    expect(rangeIntegerPower(2, "3").range.toString()).toBe("[8,8]");
    expect(rangeIntegerPower(2, new Integer(3)).range.toString()).toBe("[8,8]");
    expect(rangeIntegerPower(2, new Rational(3)).range.toString()).toBe("[8,8]");

    expect(() => rangeIntegerPower(2, new Rational(1, 2))).toThrow(
      "Exponent must be an exact integer",
    );
    expect(() => rangeIntegerPower(2, 3, { zeroPowerZero: "reject" })).toThrow(
      "zeroPowerZero must be 'undefined' or 'one'",
    );
  });

  test("the exact checker accepts generated records and rejects changed claims", () => {
    const result = rangeDivide({ low: 1, high: 2 }, { low: -1, high: 1 });
    expect(checkRangeOperationResult(result)).toMatchObject({
      accepted: true,
      domainCoverage: "partiallyDefined",
    });

    const changed = { ...result, range: RationalIntervalSet.point(0) };
    expect(checkRangeOperationResult(changed)).toMatchObject({
      accepted: false,
      reason: "claimMismatch",
    });
  });

  test("the exact checker recomputes every primitive and rejects unknown records", () => {
    const records = [
      rangeNegate({ low: -1, high: 2 }),
      rangeAbsoluteValue({ low: -1, high: 2 }),
      rangeAdd({ low: -1, high: 2 }, 3),
      rangeSubtract({ low: -1, high: 2 }, 3),
      rangeMultiply({ low: -1, high: 2 }, 3),
      rangeReciprocal({ low: -1, high: 2 }),
      rangeDivide({ low: -1, high: 2 }, 3),
      rangeIntegerPower({ low: -1, high: 2 }, 2),
    ];

    for (const record of records) {
      expect(checkRangeOperationResult(record).accepted).toBe(true);
    }

    expect(checkRangeOperationResult(null)).toMatchObject({
      accepted: false,
      reason: "unsupportedSchema",
    });
    expect(checkRangeOperationResult({
      schema: RANGE_OPERATION_RESULT_SCHEMA,
      operation: "rix.core.range.unknown@1",
      operands: [],
      parameters: {},
    })).toMatchObject({
      accepted: false,
      reason: "unsupportedRule",
    });
  });

  test("sampled defined scalar outputs are contained in binary images", () => {
    const left = set([
      { low: -2, high: -1 },
      { low: 1, high: 2 },
    ]);
    const right = set({ low: -1, high: 1 });
    const product = rangeMultiply(left, right).range;
    const quotient = rangeDivide(left, right).range;
    for (const x of [-2, -1, 1, 2]) {
      for (const y of [-1, 0, 1]) {
        expect(product.containsValue(x * y)).toBe(true);
        if (y !== 0) expect(quotient.containsValue(x / y)).toBe(true);
      }
    }
  });
});

import { describe, expect, it } from "bun:test";
import { Fraction } from "../index.js";

describe("Fraction Stern-Brocot navigation", () => {
  it("computes paths in the signed tree", () => {
    expect(new Fraction(0, 1).sternBrocotPath()).toEqual([]);
    expect(new Fraction(1, 1).sternBrocotPath()).toEqual(["R"]);
    expect(new Fraction(-1, 1).sternBrocotPath()).toEqual(["L"]);
    expect(new Fraction(3, 5).sternBrocotPath()).toEqual([
      "R",
      "L",
      "R",
      "L",
    ]);
    expect(new Fraction(5, 3).sternBrocotPath()).toEqual([
      "R",
      "R",
      "L",
      "R",
    ]);
  });

  it("round-trips paths and rejects invalid directions", () => {
    const original = new Fraction(13, 8);
    const restored = Fraction.fromSternBrocotPath(
      original.sternBrocotPath(),
    );
    expect(restored.equals(original)).toBe(true);
    expect(Fraction.fromSternBrocotPath([]).equals(new Fraction(0, 1))).toBe(
      true,
    );
    expect(() => Fraction.fromSternBrocotPath(["R", "X"])).toThrow(
      "Invalid direction",
    );
  });

  it("finds parents and handles the root", () => {
    expect(new Fraction(0, 1).sternBrocotParent()).toBe(null);
    expect(new Fraction(3, 5).sternBrocotParent().equals(new Fraction(2, 3))).toBe(
      true,
    );
    expect(new Fraction(-3, 5).sternBrocotParent().equals(new Fraction(-2, 3))).toBe(
      true,
    );
  });

  it("finds left and right children", () => {
    const rootChildren = new Fraction(0, 1).sternBrocotChildren();
    expect(rootChildren.left.equals(new Fraction(-1, 1))).toBe(true);
    expect(rootChildren.right.equals(new Fraction(1, 1))).toBe(true);

    const children = new Fraction(3, 5).sternBrocotChildren();
    expect(children.left.equals(new Fraction(4, 7))).toBe(true);
    expect(children.right.equals(new Fraction(5, 8))).toBe(true);
  });

  it("validates canonical finite and infinite positions", () => {
    expect(new Fraction(3, 5).isSternBrocotValid()).toBe(true);
    expect(new Fraction(6, 10).isSternBrocotValid()).toBe(false);
    expect(new Fraction(1, 0, { allowInfinite: true }).isSternBrocotValid()).toBe(
      true,
    );
    expect(new Fraction(-1, 0, { allowInfinite: true }).isSternBrocotValid()).toBe(
      true,
    );
    expect(new Fraction(2, 0, { allowInfinite: true }).isSternBrocotValid()).toBe(
      false,
    );
  });

  it("reports depth and ancestors", () => {
    expect(new Fraction(0, 1).sternBrocotDepth()).toBe(0);
    expect(new Fraction(3, 5).sternBrocotDepth()).toBe(4);
    expect(
      new Fraction(3, 5).sternBrocotAncestors().map((value) => value.toString()),
    ).toEqual(["2/3", "1/2", "1", "0"]);

    const infinity = new Fraction(1, 0, { allowInfinite: true });
    expect(infinity.sternBrocotDepth()).toBe(Infinity);
    expect(infinity.sternBrocotAncestors()).toEqual([]);
  });

  it("rejects tree navigation from infinite boundaries", () => {
    const infinity = new Fraction(1, 0, { allowInfinite: true });
    expect(() => infinity.sternBrocotParent()).toThrow("don't have parents");
    expect(() => infinity.sternBrocotChildren()).toThrow("don't have children");
    expect(() => infinity.sternBrocotPath()).toThrow("don't have tree paths");
  });

  it("guards against impractically long paths", () => {
    expect(() => new Fraction(1, 502).sternBrocotPath()).toThrow(
      "path too long",
    );
    expect(new Fraction(1, 502).sternBrocotPath(502)).toHaveLength(502);
    expect(() => new Fraction(1, 2).sternBrocotPath(-1)).toThrow(
      "nonnegative safe integer",
    );
  });
});

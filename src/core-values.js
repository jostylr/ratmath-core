import { BaseSystem } from "./base-system.js";
import { Fraction } from "./fraction.js";
import { FractionInterval } from "./fraction-interval.js";
import { Integer } from "./integer.js";
import { Rational } from "./rational.js";
import { RationalInterval } from "./rational-interval.js";
import { CertifiedApproximation } from "./certified-approximation.js";

export const isInteger = (value) => value instanceof Integer;
export const isRational = (value) => value instanceof Rational;
export const isRationalInterval = (value) => value instanceof RationalInterval;
export const isCertifiedApproximation = (value) => value instanceof CertifiedApproximation;
export const isFraction = (value) => value instanceof Fraction;
export const isFractionInterval = (value) => value instanceof FractionInterval;
export const isBaseSystem = (value) => value instanceof BaseSystem;
export const isCoreNumber = (value) =>
  isInteger(value) || isRational(value) || isRationalInterval(value) ||
  isCertifiedApproximation(value);

/** JSON.parse reviver for values produced by the core classes' toJSON methods. */
export function reviveCoreValue(_key, value) {
  if (!value || typeof value !== "object" || typeof value.$ratmath !== "string") {
    return value;
  }
  switch (value.$ratmath) {
    case "Integer":
      return new Integer(value.value);
    case "Rational":
      return new Rational(value.numerator, value.denominator);
    case "RationalInterval":
      return new RationalInterval(value.start, value.end);
    case "CertifiedApproximation":
      return new CertifiedApproximation(value.candidate, value.enclosure, {
        representation: value.representation,
        sourceId: value.sourceId ?? undefined,
        dependencies: value.dependencies ?? [],
      });
    case "Fraction":
      return new Fraction(value.numerator, value.denominator, {
        allowInfinite: value.denominator === "0",
      });
    case "FractionInterval":
      return new FractionInterval(value.low, value.high);
    case "BaseSystem":
      return new BaseSystem(value.characters, value.name, {
        radix: value.radix,
        digitOffset: value.digitOffset,
        allowReserved: value.allowReserved,
      });
    default:
      return value;
  }
}

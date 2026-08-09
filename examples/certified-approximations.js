import {
  Rational,
  Relation,
  boundedContinuedFractionApproximation,
  boundedDecimalApproximation,
  parseNumber,
  possibleRelations,
} from "../index.js";

const reading = parseNumber("23.456?789");
console.log(reading.toString());
console.log(reading.candidate.toString());
console.log(reading.enclosure.toString());
console.log(reading.add(new Rational(1, 2)).toString());

const threshold = parseNumber("23.4565");
console.log(possibleRelations(reading, threshold) === (Relation.LESS | Relation.GREATER | Relation.EQUAL));

console.log(boundedDecimalApproximation(new Rational(1, 7), { fractionalDigits: 5 }).toString());
console.log(boundedContinuedFractionApproximation(new Rational(103993, 33102), { maxTerms: 3 }).toString());

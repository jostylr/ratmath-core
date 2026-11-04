/**
 * R`...` — a tagged template that parses a small exact-arithmetic expression
 * into RatMath Core values.
 *
 *   R`1:2 + 3`              // RationalInterval 4:5
 *   R`(1/3 + ${x}) ^ 2`     // interpolations stay Core values (never stringified)
 *   R`1.23[56:67] * 2`      // any Core numeric literal (parseNumber grammar)
 *
 * Grammar, loosest to tightest:  + -   then  :  (interval)   then  * /
 * then unary -, then ^ (right-associative, Integer exponent), then postfix !.
 * So `1/2:3/4` is (1/2):(3/4) and `1:2 + 3` is (1:2) + 3, as in RiX.
 * This is deliberately not RiX: no names, functions or collections.
 * Interpolations may be Core values (including certified approximations),
 * bigints, safe integers or literal strings; inexact JS numbers are rejected.
 */
import { Integer } from "./integer.js";
import { Rational } from "./rational.js";
import { RationalInterval } from "./rational-interval.js";
import { parseNumber } from "./number-parser.js";

// A numeric literal is one Core literal token: digits with _ grouping, mixed
// numbers, decimals with # repeats and {d~n} runs, [..] uncertainty, ? prefixes.
const LITERAL = /^(?:\d[\d_]*\.\.\d[\d_]*\/\d[\d_]*|(?:\d[\d_]*)?\.?[\d_]*(?:\{\d+~\d+\}[\d_]*)*(?:#[\d_]*(?:\{\d+~\d+\}[\d_]*)*)?(?:\[[^\]]*\])?(?:\?[\d~]*)?)/;

function tokenize(strings, values) {
  const tokens = [];
  strings.forEach((text, part) => {
    let index = 0;
    while (index < text.length) {
      const rest = text.slice(index);
      const space = rest.match(/^\s+/);
      if (space) { index += space[0].length; continue; }
      if (/^[\d.]/.test(rest)) {
        const literal = rest.match(LITERAL)[0];
        if (!literal || literal === ".") throw new SyntaxError(`R: unexpected '${rest[0]}'`);
        tokens.push({ kind: "value", value: parseNumber(literal), text: literal });
        index += literal.length;
        continue;
      }
      if ("+-*/^:()!".includes(rest[0])) { tokens.push({ kind: "op", value: rest[0] }); index += 1; continue; }
      throw new SyntaxError(`R: unexpected '${rest[0]}' in \`${strings.join("${…}")}\``);
    }
    if (part < values.length) tokens.push({ kind: "value", value: coreValue(values[part]), text: `\${${part}}` });
  });
  return tokens;
}

function coreValue(value) {
  if (value instanceof Integer || value instanceof Rational || value instanceof RationalInterval) return value;
  if (value?.isCertifiedApproximation === true) return value;
  if (typeof value === "bigint") return new Integer(value);
  if (typeof value === "number" && Number.isSafeInteger(value)) return new Integer(value);
  if (typeof value === "string") return parseNumber(value);
  throw new TypeError(`R: cannot use ${typeof value === "number" ? `inexact number ${value}` : typeof value} as an exact value; pass a Core value, bigint, safe integer or literal string`);
}

const toRationalish = (value) => (value instanceof Integer ? value.toRational() : value);

function interval(left, right) {
  const [low, high] = [toRationalish(left), toRationalish(right)];
  if (!(low instanceof Rational) || !(high instanceof Rational)) throw new TypeError("R: ':' joins two scalar endpoints");
  return new RationalInterval(low, high);
}

function power(base, exponent) {
  if (!(exponent instanceof Integer)) throw new TypeError("R: '^' needs an Integer exponent (exact powers only)");
  return base.pow(exponent.value);
}

export function R(strings, ...values) {
  const tokens = tokenize(strings, values);
  let position = 0;
  const peek = () => tokens[position];
  const takeOp = (ops) => (peek()?.kind === "op" && ops.includes(peek().value) ? tokens[position++].value : null);

  function primary() {
    const token = tokens[position++];
    if (!token) throw new SyntaxError("R: expression ended early");
    if (token.kind === "value") return token.value;
    if (token.value === "(") {
      const value = sum();
      if (takeOp(")") === null) throw new SyntaxError("R: missing ')'");
      return value;
    }
    throw new SyntaxError(`R: unexpected '${token.value}'`);
  }
  function postfix() {
    let value = primary();
    while (takeOp("!") !== null) {
      if (!(value instanceof Integer)) throw new TypeError("R: '!' needs an Integer");
      value = value.factorial();
    }
    return value;
  }
  function exponent() {
    const base = postfix();
    return takeOp("^") !== null ? power(base, unary()) : base;
  }
  function unary() {
    return takeOp("-") !== null ? unary().negate() : (takeOp("+"), exponent());
  }
  function product() {
    let value = unary();
    for (let op; (op = takeOp("*/")) !== null;) value = op === "*" ? value.multiply(unary()) : value.divide(unary());
    return value;
  }
  function range() {
    const value = product();
    return takeOp(":") !== null ? interval(value, product()) : value;
  }
  function sum() {
    let value = range();
    for (let op; (op = takeOp("+-")) !== null;) value = op === "+" ? value.add(range()) : value.subtract(range());
    return value;
  }

  const result = sum();
  if (position < tokens.length) throw new SyntaxError(`R: unexpected '${peek().value ?? peek().text}'`);
  return result;
}

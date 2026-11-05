/**
 * R`...` — a tagged template that parses a small exact-arithmetic expression
 * into RatMath Core values.
 *
 *   R`1:2 + 3`              // RationalInterval 4:5
 *   R`(1/3 + ${x}) ^ 2`     // interpolations stay Core values (never stringified)
 *   R`1.23[56:67] * 2`      // any Core numeric literal (parseNumber grammar)
 *
 * Grammar, loosest to tightest:  + -   then  :  (interval)   then  * /
 * then unary -, then ^ and ** (right-associative, Integer exponent; ** is the
 * same power as ^, as in RiX today), then postfix ! and !!.
 * So `1/2:3/4` is (1/2):(3/4) and `1:2 + 3` is (1:2) + 3, as in RiX.
 *
 * Literals follow RiX spelling: 3/4, 1..2/3, 0.#3, 1.2[3:6], 1.5[+-0.01],
 * 1_000, 1.5?, continued fractions 3.~7~15~1 and ~-1.~2, radix shifts
 * 1_^3 and 2.5_^-2 (RiX has no E notation), and base prefixes 0xff.8, 0b101,
 * 0o17, 0z[7]66 (Core's registered prefixes). R.base(16)`ff.8 / 3` reads
 * unprefixed literals in another base.
 * This is deliberately not RiX: no names, functions or collections.
 * Interpolations may be Core values (including certified approximations),
 * bigints, safe integers or literal strings; inexact JS numbers are rejected.
 */
import { Integer } from "./integer.js";
import { Rational } from "./rational.js";
import { RationalInterval } from "./rational-interval.js";
import { parseNumber } from "./number-parser.js";
import { BaseSystem } from "./base-system.js";

// A numeric literal is one Core literal token: digits with _ grouping, mixed
// numbers, decimals with # repeats and {d~n} runs, [..] uncertainty, ? prefixes.
const LITERAL = /^(?:\d(?:_?\d)*\.\.\d(?:_?\d)*\/\d(?:_?\d)*|(?:\d(?:_?\d)*)?\.?(?:\d(?:_?\d)*)?(?:\{\d+~\d+\}(?:\d(?:_?\d)*)?)*(?:#(?:\d(?:_?\d)*)?(?:\{\d+~\d+\}(?:\d(?:_?\d)*)?)*)?(?:\[[^\]]*\])?(?:\?[\d~]*)?)/;
// Continued fractions: 3.~7~15~1, a leading ~ for a negative first term
// (~-1.~2), optional ? tail. A plain leading - is negation, as in RiX: -3.~7 is -(3.~7).
const CONTINUED_FRACTION = /^(?:~-?)?\d(?:_?\d)*\.~\d(?:_?\d)*(?:~\d(?:_?\d)*)*(?:\?[\d~]*)?/;
// Base-prefixed numbers: 0xff, 0b101.1, 0b0.#01, 0z[7]66.
const PREFIXED = /^0(?:z\[(\d+)\]|([a-zA-Z]))([0-9a-zA-Z]+(?:\.[0-9a-zA-Z]*)?(?:#[0-9a-zA-Z]+)?|\.[0-9a-zA-Z]+(?:#[0-9a-zA-Z]+)?)/;
// Digits of a literal read in a chosen base (R.base(16)`ff.8`).
const BASE_DIGITS = /^[0-9a-zA-Z]+(?:\.[0-9a-zA-Z]*)?(?:#[0-9a-zA-Z]+)?|^\.[0-9a-zA-Z]+(?:#[0-9a-zA-Z]+)?/;
// RiX radix shift after a literal: 1_^3 is 1000, 2.5_^-2 is 1/40.
const RADIX_SHIFT = /^_\^(-?\d+)/;
const OPERATORS = ["**", "!!", "+", "-", "*", "/", "^", ":", "(", ")", "!"];

/** Read digits such as "ff.8" or "0.#01" in a base system, exactly. */
function readInBase(system, text) {
  const digits = (part) => {
    if (!part) return 0n;
    try {
      return system.toDecimal(part);
    } catch (error) {
      if (part === part.toLowerCase()) throw error;
      return system.toDecimal(part.toLowerCase());
    }
  };
  const [body, repeat = ""] = text.split("#");
  const [whole, fraction = ""] = body.split(".");
  const radix = BigInt(system.base);
  const fractionScale = radix ** BigInt(fraction.length);
  let value = new Rational(digits(whole) * fractionScale + digits(fraction), fractionScale);
  if (repeat) {
    const repeatScale = radix ** BigInt(repeat.length) - 1n;
    value = value.add(new Rational(digits(repeat), fractionScale * repeatScale));
  }
  return value.denominator === 1n ? new Integer(value.numerator) : value;
}

function prefixedSystem(match) {
  if (match[1]) return BaseSystem.fromBase(Number(match[1]));
  const system = BaseSystem.getSystemForPrefix(match[2]);
  if (!system) throw new SyntaxError(`R: unknown base prefix '0${match[2]}'`);
  return system;
}

function shift(value, exponent) {
  const power = new Rational(10).pow(BigInt(exponent));
  const shifted = value.multiply(power);
  return shifted instanceof Rational && shifted.denominator === 1n ? new Integer(shifted.numerator) : shifted;
}

function readLiteral(rest, base) {
  const cf = rest.match(CONTINUED_FRACTION);
  if (cf) return { text: cf[0], value: parseNumber(cf[0]) };
  const prefixed = rest.match(PREFIXED);
  if (prefixed) return { text: prefixed[0], value: readInBase(prefixedSystem(prefixed), prefixed[3]) };
  if (base) {
    const digits = rest.match(BASE_DIGITS)?.[0];
    if (digits && digits !== ".") return { text: digits, value: readInBase(base, digits) };
    return null;
  }
  if (!/^[\d.]/.test(rest)) return null;
  const literal = rest.match(LITERAL)[0];
  if (!literal || literal === ".") throw new SyntaxError(`R: unexpected '${rest[0]}'`);
  return { text: literal, value: parseNumber(literal) };
}

function tokenize(strings, values, base) {
  const tokens = [];
  strings.forEach((text, part) => {
    let index = 0;
    while (index < text.length) {
      const rest = text.slice(index);
      const space = rest.match(/^\s+/);
      if (space) { index += space[0].length; continue; }
      const literal = readLiteral(rest, base);
      if (literal) {
        index += literal.text.length;
        const radixShift = text.slice(index).match(RADIX_SHIFT);
        if (radixShift) index += radixShift[0].length;
        tokens.push({ kind: "value", value: radixShift ? shift(literal.value, radixShift[1]) : literal.value, text: literal.text });
        continue;
      }
      const op = OPERATORS.find((candidate) => rest.startsWith(candidate));
      if (op) { tokens.push({ kind: "op", value: op }); index += op.length; continue; }
      throw new SyntaxError(`R: unexpected '${rest[0]}' in \`${strings.join("${…}")}\``);
    }
    if (part < values.length) tokens.push({ kind: "value", value: coreValue(values[part]), text: `\${${part}}` });
  });
  return tokens;
}

export function coreValue(value) {
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

// RiX currently evaluates ** like ^; the interval product power is .mpow(n).
function power(base, exponent, op = "^") {
  if (!(exponent instanceof Integer)) throw new TypeError(`R: '${op}' needs an Integer exponent (exact powers only)`);
  return base.pow(exponent.value);
}

function evaluate(strings, values, base) {
  const tokens = tokenize(strings, values, base);
  let position = 0;
  const peek = () => tokens[position];
  const takeOp = (ops) => {
    const list = Array.isArray(ops) ? ops : [ops];
    return peek()?.kind === "op" && list.includes(peek().value) ? tokens[position++].value : null;
  };

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
    for (let op; (op = takeOp(["!!", "!"])) !== null;) {
      if (!(value instanceof Integer)) throw new TypeError(`R: '${op}' needs an Integer`);
      value = op === "!!" ? value.doubleFactorial() : value.factorial();
    }
    return value;
  }
  function exponent() {
    const base = postfix();
    const op = takeOp(["^", "**"]);
    return op !== null ? power(base, unary(), op) : base;
  }
  function unary() {
    return takeOp("-") !== null ? unary().negate() : (takeOp("+"), exponent());
  }
  function product() {
    let value = unary();
    for (let op; (op = takeOp(["*", "/"])) !== null;) value = op === "*" ? value.multiply(unary()) : value.divide(unary());
    return value;
  }
  function range() {
    const value = product();
    return takeOp(":") !== null ? interval(value, product()) : value;
  }
  function sum() {
    let value = range();
    for (let op; (op = takeOp(["+", "-"])) !== null;) value = op === "+" ? value.add(range()) : value.subtract(range());
    return value;
  }

  const result = sum();
  if (position < tokens.length) throw new SyntaxError(`R: unexpected '${peek().value ?? peek().text}'`);
  // A whole Rational result is an Integer, as in RiX.
  return result instanceof Rational && result.denominator === 1n ? new Integer(result.numerator) : result;
}

export function R(strings, ...values) {
  return evaluate(strings, values, null);
}

/**
 * A tag that reads unprefixed literals in another base: R.base(16)`ff.8 / 3`.
 * The base is a radix (2–62), a BaseSystem, or a string listing the digits in
 * order, such as "01234567". Prefixed literals (0b101) keep their own base.
 */
R.base = function base(radix) {
  let system;
  if (radix instanceof BaseSystem) system = radix;
  else if (typeof radix === "string") system = new BaseSystem(radix);
  else if (typeof radix === "number" || typeof radix === "bigint" || radix instanceof Integer) {
    system = BaseSystem.fromBase(Number(radix instanceof Integer ? radix.value : radix));
  } else {
    throw new TypeError("R.base needs a radix, a BaseSystem or a string of digits such as \"01234567\"");
  }
  return (strings, ...values) => evaluate(strings, values, system);
};

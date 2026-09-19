import { Rational } from './rational.js';
import { Integer } from './integer.js';

export const NUMERAL_SYSTEM_SCHEMA = 'ratmath.numeral-system@1';
export const NUMERAL_LIMITS = Object.freeze({ tokens: 256, tokenLength: 32, sourceLength: 65536, digits: 4096, bits: 16384 });
const reserved = /[\s+\-*/^!()[\]:.#~_`?\\]/u;
const fail = message => { throw new Error(`Numeral system: ${message}`); };
const abs = value => value < 0n ? -value : value;
function boundedInteger(value) {
  if (typeof value !== 'bigint' || abs(value).toString(2).length > NUMERAL_LIMITS.bits) fail('exact component exceeds 16384 bits');
  return value;
}
function exact(value) {
  const result = value instanceof Rational ? value : value instanceof Integer ? new Rational(value.value) : typeof value === 'bigint' ? new Rational(value) : null;
  if (!result) fail('requires an exact Rational or Integer');
  boundedInteger(result.numerator); boundedInteger(result.denominator); return result;
}
function floor(value) { let q = value.numerator / value.denominator; if (value.numerator < 0n && value.numerator % value.denominator) q--; return q; }
function digitLimit(value = 256) { if (!Number.isSafeInteger(value) || value < 0 || value > NUMERAL_LIMITS.digits) fail('maxDigits must be 0..4096'); return value; }
const rational = value => new Rational(value);
const key = value => `${value.numerator}/${value.denominator}`;

/** Finite, prefix-free positional alphabets. Parser labels belong to the host. */
export class NumeralSystem {
  constructor({ schema = NUMERAL_SYSTEM_SCHEMA, kind = 'ordinary', radix, tokens } = {}) {
    if (schema !== NUMERAL_SYSTEM_SCHEMA) fail('unsupported schema');
    if (!['ordinary', 'multiToken', 'balanced', 'negative'].includes(kind)) fail('unsupported family');
    if (!Number.isSafeInteger(radix) || Math.abs(radix) < 2 || Math.abs(radix) > NUMERAL_LIMITS.tokens) fail('absolute radix must be 2..256');
    if ((kind === 'negative') !== (radix < 0)) fail('negative family requires negative radix; other families require positive radix');
    if (kind === 'balanced' && radix % 2 === 0) fail('balanced systems require an odd radix');
    if (!Array.isArray(tokens) || tokens.length !== Math.abs(radix)) fail('requires exactly one token for each digit value');
    for (const token of tokens) {
      if (typeof token !== 'string' || !token.length || [...token].length > NUMERAL_LIMITS.tokenLength || reserved.test(token)) fail('tokens must be nonempty, bounded and disjoint from numeral punctuation');
      if (kind === 'ordinary' && [...token].length !== 1) fail('ordinary systems require one Unicode character per token');
    }
    for (let i = 0; i < tokens.length; i++) for (let j = i + 1; j < tokens.length; j++) {
      if (tokens[i].startsWith(tokens[j]) || tokens[j].startsWith(tokens[i])) fail('tokens must be unique and prefix-free');
    }
    this.schema = schema; this.kind = kind; this.radix = radix;
    this.offset = kind === 'balanced' ? -(radix - 1) / 2 : 0;
    this.tokens = Object.freeze([...tokens]); Object.freeze(this);
  }
  toJSON() { return { schema: this.schema, kind: this.kind, radix: this.radix, tokens: [...this.tokens] }; }
  tokenize(source, { allowEmpty = false } = {}) {
    if (typeof source !== 'string' || source.length > NUMERAL_LIMITS.sourceLength) fail('source length budget exceeded');
    const result = [];
    for (let offset = 0; offset < source.length;) {
      if (source[offset] === '_') {
        if (!result.length || offset + 1 === source.length || source[offset + 1] === '_') fail('group separators must lie between tokens');
        offset++; continue;
      }
      const index = this.tokens.findIndex(token => source.startsWith(token, offset));
      if (index < 0) fail(`invalid token at position ${offset + 1}`);
      result.push(index + this.offset); offset += this.tokens[index].length;
      if (result.length > NUMERAL_LIMITS.digits) fail('digit work budget exceeded');
    }
    if (!result.length && !allowEmpty) fail('requires at least one digit');
    return result;
  }
  fromDigits(digits) {
    if (!Array.isArray(digits) || digits.length > NUMERAL_LIMITS.digits || digits.some(digit => !Number.isInteger(digit) || digit < this.offset || digit >= this.offset + this.tokens.length)) fail('invalid or oversized digit array');
    let result = 0n;
    for (const digit of digits) result = boundedInteger(result * BigInt(this.radix) + BigInt(digit));
    return result;
  }
  parseInteger(source) {
    let sign = 1n;
    if (/^[+-]/.test(source)) { if (source[0] === '-') sign = -1n; source = source.slice(1); }
    return sign * this.fromDigits(this.tokenize(source));
  }
  parse(source) {
    if (typeof source !== 'string' || source.length > NUMERAL_LIMITS.sourceLength) fail('source length budget exceeded');
    source = source.trim(); if (!source) fail('empty numeral');
    const shifts = source.split('_^'); if (shifts.length > 2 || shifts.length === 2 && !shifts[1]) fail('invalid radix shift');
    source = shifts[0]; let result;
    if (source.includes('.~')) {
      const parts = source.replace(/^~/, '').replace('.~', '~').split('~');
      if (parts.length < 2 || parts.length > 256) fail('continued-fraction term budget exceeded');
      const terms = parts.map(term => this.parseInteger(term));
      if (terms.slice(1).some(term => term <= 0n)) fail('continued-fraction tails must be positive');
      result = rational(terms.pop());
      while (terms.length) result = exact(rational(terms.pop()).add(rational(1n).divide(result)));
    } else if (source.includes('..')) {
      const parts = source.split('..'); if (parts.length !== 2 || parts[1].split('/').length !== 2) fail('mixed numeral requires whole..numerator/denominator');
      const whole = this.parseInteger(parts[0]), [n, d] = parts[1].split('/').map(text => this.parseInteger(text));
      if (n < 0n || d <= 0n) fail('mixed fractional components must be nonnegative with positive denominator');
      result = rational(whole).add(new Rational(whole < 0n || parts[0].startsWith('-') ? -n : n, d));
    } else if (source.includes('/')) {
      const parts = source.split('/'); if (parts.length !== 2) fail('fraction requires one slash');
      result = new Rational(this.parseInteger(parts[0]), this.parseInteger(parts[1]));
    } else {
      let sign = 1n;
      if (/^[+-]/.test(source)) { if (source[0] === '-') sign = -1n; source = source.slice(1); }
      const sections = source.split('#'); if (sections.length > 2 || sections.length === 2 && !sections[1]) fail('repeat requires one nonempty block');
      const point = sections[0].split('.'); if (point.every(text => !text)) fail('requires at least one digit'); if (point.length > 2) fail('multiple radix points');
      const whole = this.fromDigits(this.tokenize(point[0], { allowEmpty: point.length === 2 }));
      const prefix = this.tokenize(point[1] || '', { allowEmpty: true });
      const base = BigInt(this.radix), power = boundedInteger(base ** BigInt(prefix.length));
      result = rational(whole).add(new Rational(this.fromDigits(prefix), power));
      if (sections.length === 2) {
        const repeated = this.tokenize(sections[1]);
        const denominator = boundedInteger(power * (base ** BigInt(repeated.length) - 1n));
        result = result.add(new Rational(this.fromDigits(repeated), denominator));
      }
      if (sign < 0n) result = result.negate();
    }
    if (shifts.length === 2) {
      const exponent = this.parseInteger(shifts[1]); if (abs(exponent) > 4096n) fail('radix shift budget exceeded');
      const power = boundedInteger(BigInt(this.radix) ** abs(exponent));
      result = exponent < 0n ? result.divide(rational(power)) : result.multiply(rational(power));
    }
    return exact(result);
  }
  integer(value, maxDigits = NUMERAL_LIMITS.digits) {
    boundedInteger(value); digitLimit(maxDigits);
    const negative = this.kind !== 'balanced' && this.radix > 0 && value < 0n;
    let remaining = negative ? -value : value; const digits = [], carries = [];
    const modulus = BigInt(Math.abs(this.radix)), base = BigInt(this.radix);
    do {
      if (digits.length >= maxDigits) return { status: 'budgetExhausted', digits: digits.reverse(), carries, remaining, negative, spelling: null };
      const residue = ((remaining % modulus) + modulus) % modulus;
      const digit = Number(((residue - BigInt(this.offset) + modulus) % modulus)) + this.offset;
      const next = (remaining - BigInt(digit)) / base;
      carries.push({ before: remaining, digit, radix: this.radix, after: next }); digits.push(digit); remaining = next;
    } while (remaining !== 0n);
    digits.reverse(); return { status: 'complete', digits, carries, remaining, negative, spelling: `${negative ? '-' : ''}${this.digitText(digits)}` };
  }
  digitText(digits) { return digits.map(digit => this.tokens[digit - this.offset]).join(''); }
  format(value, { maxDigits = 256, mode = 'expansion' } = {}) {
    const source = exact(value); digitLimit(maxDigits);
    if (!['expansion', 'fraction'].includes(mode)) fail('format mode must be expansion or fraction');
    if (mode === 'fraction') {
      const numerator = this.integer(source.numerator, maxDigits), denominator = this.integer(source.denominator, maxDigits);
      return { schema: 'ratmath.numeral-expansion@1', system: this.toJSON(), source, mode, status: numerator.spelling && denominator.spelling ? 'complete' : 'budgetExhausted', spelling: numerator.spelling && denominator.spelling ? `${numerator.spelling}/${denominator.spelling}` : null, numerator, denominator };
    }
    const negative = this.radix > 0 && this.offset === 0 && source.numerator < 0n;
    const working = negative ? source.negate() : source;
    const lower = this.offset < 0 ? new Rational(-1, 2) : this.radix < 0 ? new Rational(this.radix, 1 - this.radix) : rational(0n);
    const whole = floor(working.subtract(lower)), integer = this.integer(whole, maxDigits);
    let remainder = working.subtract(rational(whole)), repeatStart = null; const fractional = [], seen = new Map(), steps = [];
    if (integer.status === 'complete') while (remainder.numerator !== 0n) {
      const id = key(remainder); if (seen.has(id)) { repeatStart = seen.get(id); break; }
      if (integer.digits.length + fractional.length >= maxDigits) break;
      seen.set(id, fractional.length);
      const scaled = remainder.multiply(rational(BigInt(this.radix)));
      let digit = Number(floor(scaled.subtract(lower)));
      // The negative-base invariant includes both endpoints; clamp its boundary representation.
      digit = Math.max(this.offset, Math.min(this.offset + this.tokens.length - 1, digit));
      const next = exact(scaled.subtract(rational(BigInt(digit))));
      steps.push({ before: remainder, scaled, digit, after: next }); fractional.push(digit); remainder = next;
    }
    const complete = integer.status === 'complete' && (remainder.numerator === 0n || repeatStart !== null);
    const prefix = repeatStart === null ? fractional : fractional.slice(0, repeatStart), repeat = repeatStart === null ? [] : fractional.slice(repeatStart);
    const partial = integer.spelling === null ? null : `${negative ? '-' : ''}${integer.spelling}${fractional.length || repeat.length ? '.' + this.digitText(prefix) : ''}${repeat.length ? '#' + this.digitText(repeat) : ''}`;
    const spelling = complete ? partial : null;
    return { schema: 'ratmath.numeral-expansion@1', system: this.toJSON(), source, mode, status: complete ? 'complete' : 'budgetExhausted', spelling, partial, negative, integer, prefix, repeat, steps, remaining: remainder, maxDigits, work: integer.digits.length + fractional.length };
  }
  locale(source, { point = '.', group = ',', groupSize = 3 } = {}, direction = 'format') {
    if (typeof point !== 'string' || typeof group !== 'string' || !point.length || !group.length || point.length > 4 || group.length > 4 || point.startsWith(group) || group.startsWith(point)) fail('locale separators must be distinct, bounded and nonempty');
    if (!Number.isInteger(groupSize) || groupSize < 1 || groupSize > 8) fail('locale groupSize must be 1..8');
    for (const separator of [point, group]) {
      if (/[+\-*/^!()[\]:#~`?\\]/u.test(separator) || this.tokens.some(token => token.includes(separator) || separator.includes(token))) fail('locale separator collides with numeral tokens or grammar');
    }
    if (typeof source !== 'string' || source.length > NUMERAL_LIMITS.sourceLength) fail('source length budget exceeded');
    if (!['format', 'parse'].includes(direction)) fail('locale direction must be format or parse');
    const encode = canonical => {
      if (/[\/~]|\.\.|_\^/.test(canonical)) fail('locale adapters support positional expansions only');
      this.parse(canonical);
      const sign = /^[+-]/.test(canonical) ? canonical[0] : '';
      const body = sign ? canonical.slice(1) : canonical;
      const pieces = body.split('.');
      // A repeat without a point is valid grammar; normalize it to a point first.
      if (pieces.length === 1 && body.includes('#')) return encode(sign + body.replace('#', '.#'));
      const values = this.tokenize(pieces[0]);
      const groups = []; for (let stop = values.length; stop > 0; stop -= groupSize) groups.unshift(this.digitText(values.slice(Math.max(0, stop - groupSize), stop)));
      return sign + groups.join(group) + (pieces.length === 2 ? point + pieces[1] : '');
    };
    if (direction === 'format') return encode(source);
    // Consume complete tokens/separators so a separator embedded in another
    // codeword cannot corrupt a reversible locale spelling.
    let canonical = '';
    for (let offset = 0; offset < source.length;) {
      if (source.startsWith(point, offset)) { canonical += '.'; offset += point.length; }
      else if (source.startsWith(group, offset)) offset += group.length;
      else {
        const token = this.tokens.find(token => source.startsWith(token, offset));
        canonical += token ?? source[offset]; offset += token?.length ?? 1;
      }
    }
    if (encode(canonical) !== source) fail('noncanonical locale grouping');
    return this.parse(canonical);
  }
  normalize(source, options) { return this.format(this.parse(source), options); }
  places(source) {
    source = source.trim();
    const value = this.parse(source);
    if (/[#/~]|\.\.|_\^/.test(source)) return { value, places: [], diagnostic: 'Compound numeral: inspect its exact value and normalized expansion.' };
    let sign = 1n; if (/^[+-]/.test(source)) { if (source[0] === '-') sign = -1n; source = source.slice(1); }
    const [a,b=''] = source.split('.'), whole=this.tokenize(a,{allowEmpty: true}), fraction=this.tokenize(b,{allowEmpty:true});
    const digits=[...whole,...fraction];
    return { value, places: digits.map((digit,index)=>{const exponent=whole.length-index-1,power=BigInt(this.radix)**BigInt(Math.abs(exponent));const weight=exponent<0?new Rational(1n,power):rational(power);return {token:this.tokens[digit-this.offset],digit,exponent,weight,contribution:weight.multiply(rational(sign*BigInt(digit)))};}) };
  }
}

# Changelog

## 0.3.0 — 2026-08-06

### Breaking changes

- Decimal interval brackets use `:` exclusively between two values. Comma
  forms such as `1.23[56,67]` and `1.23[+5,-6]` are no longer accepted.
- Signed decimal-interval offsets now use the base value's last visible digit
  as their unit. For example, `1.23[+5:-6]` means `1.17:1.28`.
- Constructors reject unsafe JavaScript integer values. Use a decimal string or
  `bigint` when a value is outside `Number`'s safe-integer range.

### Fixes

- Keep shortest-decimal searches in exact `BigInt` arithmetic and support
  terminating point values beyond 50 digits.
- Avoid enumerating every integer in wide intervals when selecting a compact
  relative-decimal base.
- Preserve exact asymmetric, repeating, and long terminating offsets in
  relative interval output.
- Recompute continued-fraction convergents when a later call requests more
  terms, instead of retaining a truncated first result.
- Accept `bigint` denominator bounds in the published `randomRational()`
  TypeScript signature.
- Improve validation for fractions, bases, Farey operations, and interval
  notation.

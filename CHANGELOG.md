# Changelog

## 0.3.0 — 2026-08-07

### Breaking changes

- Decimal interval brackets use `:` exclusively between two values. Comma
  forms such as `1.23[56,67]` and `1.23[+5,-6]` are no longer accepted.
- Signed decimal-interval offsets now use the base value's last visible digit
  as their unit. For example, `1.23[+5:-6]` means `1.17:1.28`.
- Constructors reject unsafe JavaScript integer values. Use a decimal string or
  `bigint` when a value is outside `Number`'s safe-integer range.
- `randomRational()` now samples a fixed-denominator grid instead of all
  reduced fractions up to a maximum denominator.

### Added

- Add `denominatorInterval()`, endpoint-denominator LCM defaults, empty-grid
  policies, and injectable randomness for rational interval sampling.
- Add exact rational rounding helpers, tagged JSON revival, and public type
  guards.
- Add canonical/long finite continued-fraction output and optional intermediate
  convergents along coefficient runs.

### Fixes

- Keep shortest-decimal searches in exact `BigInt` arithmetic and support
  terminating point values beyond 50 digits.
- Avoid enumerating every integer in wide intervals when selecting a compact
  relative-decimal base.
- Preserve exact asymmetric, repeating, and long terminating offsets in
  relative interval output.
- Recompute continued-fraction convergents when a later call requests more
  terms, instead of retaining a truncated first result.
- Derive continued fractions from rational values without retaining constructor
  provenance, preserve nonterminal `1` coefficients in limited prefixes, and
  allow `getConvergent()` to access indices beyond the default count limit.
- Recompute decimal metadata when the configurable period-discovery limit
  changes.
- Make repeating-decimal serialization exact by default, with a 30-digit
  configurable global period limit and explicit `"trunc"`, `"null"`, or
  `"error"` behavior.
- Correct scientific notation so incomplete periods are visibly marked with
  `...`, exact repeating mantissas preserve non-periodic integer-tail digits,
  and bounded repeating-decimal output retains `#` to locate the period.
- Report the exact count of leading zeros in a period even when the stored
  period prefix is shorter than that zero run.
- Fix negative zero-whole-part strings such as `-0.5`, `-.5`, and
  `-0..1/2`.
- Reject signs on mixed-number numerator and denominator components.
- Improve validation for fractions, bases, Farey operations, and interval
  notation.
- Make all retained examples executable and enforce line/function coverage
  thresholds in CI.

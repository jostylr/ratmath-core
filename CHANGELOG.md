# Changelog

## Unreleased

### Added

- Add immutable `RationalIntervalSet` values for normalized finite unions with
  exact rational open/closed endpoints, structural infinities, exact set
  operations, tagged JSON revival, a public type guard, and TypeScript types.

## 0.4.0 — 2026-08-15

### Added

- Add `CertifiedApproximation`, decimal/base and continued-fraction `?`
  parsing, exact enclosure propagation, possible-relation masks, JSON revival,
  bounded approximation helpers, and TypeScript declarations.
- Add signed-radix, balanced-digit, bijective-digit, and explicitly quoted
  digit-alphabet support to `BaseSystem`, with capability flags that distinguish
  integer conversion from ordinary fractional-place formatting.

### Changed

- Keep formatter ellipses display-only; certified uncertainty is represented
  by an explicit approximation value with an authoritative exact enclosure.
- Require the publication gate to meet the configured coverage thresholds and
  pin the development-only Bun declarations for reproducible installs.

### Fixes

- Preserve certified candidates and serializable dependency provenance across
  string and tagged-JSON round trips, and freeze public representation metadata.
- Reject unsafe JavaScript-number continued-fraction coefficients in certified
  approximation constructors.
- Preserve signed-radix `BaseSystem` options through tagged JSON revival, and
  keep case folding valid when upper- and lowercase digits collapse.
- Reject nonstandard digit systems in fractional expansion, period, and
  certified radix-prefix algorithms instead of producing invalid digits.
- Align TypeScript declarations and the manual with all public `BaseSystem` and
  certified-approximation fields and options.

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
- Reject unsafe JavaScript-number exponents across exact power and `E`
  operations instead of converting an already-rounded value to `bigint`.
- Mark incomplete continued-fraction strings with `~...`, including the long
  form boundary, so a limited prefix cannot masquerade as an exact value.
- Expose mutable, per-call-overridable defaults for ordinary decimal digits,
  scientific precision, arbitrary-base digits, modular-period work,
  continued-fraction work, and Stern–Brocot path traversal.
- Keep the frozen powers-of-five optimization private, validate boolean
  formatting flags, report the active period-discovery limit, and stop
  non-varying injected random sources from looping indefinitely.
- Make all retained examples executable and enforce line/function coverage
  thresholds in CI.

/**
 * Convert a numeric API input to BigInt without silently accepting an
 * already-rounded JavaScript number.
 *
 * @param {number|string|bigint} value
 * @param {string} label
 * @returns {bigint}
 */
export function toExactBigInt(value, label = "Value") {
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      throw new RangeError(
        `${label} must be a safe integer; use a string or bigint for exact values`,
      );
    }
    return BigInt(value);
  }

  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "string" && /^[+-]?\d+$/.test(value.trim())) {
    return BigInt(value.trim());
  }

  throw new TypeError(`${label} must be an integer number, string, or bigint`);
}

/**
 * Arithmetic on canonical rational pairs (gcd(n, d) = 1, d > 0) that returns
 * canonical pairs without a final full reduction (Knuth/Henrici forms).
 *
 * Internal to Core: callers must pass canonical pairs. Not exported publicly.
 */

function gcd(a, b) {
  if (a < 0n) a = -a;
  if (b < 0n) b = -b;
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

export function reducedSum(a, b, c, d) {
  if (d === 1n) return [a + c * b, b];
  if (b === 1n) return [a * d + c, d];
  if (b === d) {
    const n = a + c;
    const g = gcd(n, b);
    return n === 0n ? [0n, 1n] : [n / g, b / g];
  }
  const g = gcd(b, d);
  if (g === 1n) return [a * d + c * b, b * d];
  const bb = b / g;
  const n = a * (d / g) + c * bb;
  const h = gcd(n, g);
  return n === 0n ? [0n, 1n] : [n / h, bb * (d / h)];
}

export function reducedProduct(a, b, c, d) {
  if (a === 0n || c === 0n) return [0n, 1n];
  const g = gcd(a, d);
  const h = gcd(c, b);
  return [(a / g) * (c / h), (b / h) * (d / g)];
}

// Caller rejects c = 0.
export function reducedQuotient(a, b, c, d) {
  if (a === 0n) return [0n, 1n];
  const g = gcd(a, c);
  const h = gcd(b, d);
  const n = (a / g) * (d / h);
  const den = (b / h) * (c / g);
  return den < 0n ? [-n, -den] : [n, den];
}

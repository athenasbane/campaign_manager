/** Build matrix in FULL precision (no rounding). A→B = base[B] / base[A] */
function buildMatrixExact(base) {
  const codes = Object.keys(base);
  const matrix = {};
  for (const from of codes) {
    matrix[from] = {};
    for (const to of codes) {
      matrix[from][to] = from === to ? 1 : base[to] / base[from];
    }
  }
  return matrix;
}

/** Create a rounded copy (for JSON/display only). */
function roundMatrix(matrix, decimals = 4) {
  const codes = Object.keys(matrix);
  const round = (n) => Number(n.toFixed(decimals));
  const out = {};
  for (const from of codes) {
    out[from] = {};
    for (const to of codes) {
      out[from][to] = round(matrix[from][to]);
    }
  }
  return out;
}

/**
 * Arbitrage check in log-space on the EXACT (unrounded) matrix.
 * Sums of logs around any 3-cycle should be ~0; allow tiny floating error.
 */
function hasArbitrage(matrix, tol = 1e-10) {
  const codes = Object.keys(matrix);
  // Precompute logs
  const log = {};
  for (const a of codes) {
    for (const b of codes) {
      log[`${a}:${b}`] = Math.log(matrix[a][b]);
    }
  }
  for (const a of codes) {
    for (const b of codes) {
      if (b === a) continue;
      for (const c of codes) {
        if (c === a || c === b) continue;
        const loop = log[`${a}:${b}`] + log[`${b}:${c}`] + log[`${c}:${a}`];
        if (loop > tol) return true; // profit
      }
    }
  }
  return false;
}

// ---- Example usage (edit these values as you like; they are relative to GLD) ----
const baseValues = {
  GLD: 1.0,
  CIR: 1.871,
  FRT: 3,
  PRA: 6.35,
  KRA: 2.15,
  SHA: 9.3211,
  FRE: 11.13,
  MAM: 100.75,
  MON: 1.45,
  VIL: 6.0557,
};

// 1) Build exact (unrounded) matrix
const exact = buildMatrixExact(baseValues);

// 2) Produce pretty JSON (rounded) for storage/UI
const rounded = roundMatrix(exact, 4);
console.log(JSON.stringify(rounded, null, 2));

// 3) Arbitrage check on exact math
console.log("Arbitrage (exact)?", hasArbitrage(exact) ? "YES" : "NO");

// Optional exports (works in both CJS & ESM)
try {
  module.exports = { buildMatrixExact, roundMatrix, hasArbitrage };
} catch (_) {}

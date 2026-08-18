// Geometry for the "electric lightning" crackle border — ported from the same
// algorithm used in OtpView.swift/OtpScreen.kt and SpinWheelView.swift/SpinScreen.kt.
// See M-Chaja_Web_App_Port_Spec.md §4. Keep in sync if the native algorithm changes.

/** Deterministic hash noise in [-1, 1], matching the native `hashNoise` helpers. */
export function hashNoise(i: number, seed: number): number {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/**
 * Walks the perimeter of a rounded rect in arc-length steps, offsetting each
 * sample point along its outward normal by deterministic hash noise, so the
 * shape reads as a jittery, electrified outline rather than a clean geometric
 * border. Returns an SVG path `d` string for a closed polygon.
 */
export function jaggedRoundedRectPath(
  width: number,
  height: number,
  cornerRadius: number,
  segments: number,
  seed: number,
  jitter: number,
): string {
  const r = Math.min(cornerRadius, Math.min(width, height) / 2);
  const straightW = width - 2 * r;
  const straightH = height - 2 * r;
  const arcLen = (Math.PI / 2) * r;
  const total = 2 * straightW + 2 * straightH + 4 * arcLen;

  function pointAndNormal(distance: number): [number, number, number, number] {
    let d = distance % total;
    if (d < 0) d += total;

    if (d < straightW) {
      return [r + d, 0, 0, -1];
    }
    d -= straightW;
    if (d < arcLen) {
      const theta = -(Math.PI / 2) + d / r;
      return [width - r + r * Math.cos(theta), r + r * Math.sin(theta), Math.cos(theta), Math.sin(theta)];
    }
    d -= arcLen;
    if (d < straightH) {
      return [width, r + d, 1, 0];
    }
    d -= straightH;
    if (d < arcLen) {
      const theta = 0 + d / r;
      return [width - r + r * Math.cos(theta), height - r + r * Math.sin(theta), Math.cos(theta), Math.sin(theta)];
    }
    d -= arcLen;
    if (d < straightW) {
      return [width - r - d, height, 0, 1];
    }
    d -= straightW;
    if (d < arcLen) {
      const theta = Math.PI / 2 + d / r;
      return [r + r * Math.cos(theta), height - r + r * Math.sin(theta), Math.cos(theta), Math.sin(theta)];
    }
    d -= arcLen;
    if (d < straightH) {
      return [0, height - r - d, -1, 0];
    }
    d -= straightH;
    const theta = Math.PI + d / r;
    return [r + r * Math.cos(theta), r + r * Math.sin(theta), Math.cos(theta), Math.sin(theta)];
  }

  const points: string[] = [];
  for (let i = 0; i <= segments; i++) {
    const d = (total * i) / segments;
    const [px, py, nx, ny] = pointAndNormal(d);
    const j = hashNoise(i, seed) * jitter;
    const x = px + nx * j;
    const y = py + ny * j;
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  points.push("Z");
  return points.join(" ");
}

/** Short jittery connector line between OTP digit boxes — ported from
 * `jaggedLinePath` in OtpView.swift/OtpScreen.kt. Returns an SVG path `d`. */
export function jaggedLinePath(width: number, midY: number, seed: number, jitter: number, segments = 5): string {
  const points: string[] = [];
  for (let i = 0; i <= segments; i++) {
    const x = (width * i) / segments;
    const j = hashNoise(i + 500, seed) * jitter;
    const y = midY + j;
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(" ");
}

/**
 * Samples points evenly around a circle, offsetting each radially by
 * deterministic hash noise — ported from `jaggedCirclePath` in
 * SpinWheelView.swift/SpinScreen.kt (the wheel-rim variant of the same
 * crackle effect). Returns an SVG path `d` for a closed loop.
 */
export function jaggedCirclePath(diameter: number, segments: number, seed: number, jitter: number): string {
  const cx = diameter / 2;
  const cy = diameter / 2;
  const radius = diameter / 2 - 4;
  const points: string[] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * 2 * Math.PI;
    const r = radius + hashNoise(i, seed) * jitter;
    const x = cx + Math.cos(theta) * r;
    const y = cy + Math.sin(theta) * r;
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  points.push("Z");
  return points.join(" ");
}

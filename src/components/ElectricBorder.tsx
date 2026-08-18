import { useEffect, useState } from "react";
import { jaggedRoundedRectPath } from "../lib/electricBorder";

const TICK_MS = 80;

interface ElectricBorderProps {
  width: number;
  height: number;
  cornerRadius: number;
  color: string;
  /** Offsets the noise pattern so multiple borders on screen at once don't
   *  crackle in perfect unison. */
  seedBase?: number;
  segments?: number;
  jitter?: number;
}

/**
 * The crackling, hand-drawn-lightning border — see
 * M-Chaja_Web_App_Port_Spec.md §4. Redrawn every ~80ms with small per-point
 * jitter (a discrete flicker, not a smooth animation), layered with a soft
 * outer glow and a bright core stroke.
 */
export function ElectricBorder({
  width,
  height,
  cornerRadius,
  color,
  seedBase = 0,
  segments = 22,
  jitter = 2.2,
}: ElectricBorderProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const path = jaggedRoundedRectPath(width, height, cornerRadius, segments, seedBase + tick, jitter);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <path d={path} fill="none" stroke={color} strokeWidth={7} opacity={0.4} style={{ filter: "blur(4px)" }} />
      <path d={path} fill="none" stroke={color} strokeWidth={3} opacity={0.85} style={{ filter: "blur(1px)" }} />
      <path d={path} fill="none" stroke="#ffffff" strokeWidth={1} opacity={0.9} />
    </svg>
  );
}

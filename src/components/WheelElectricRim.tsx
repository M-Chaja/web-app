import { useEffect, useState } from "react";
import { jaggedCirclePath } from "../lib/electricBorder";

const TICK_MS = 80;

interface WheelElectricRimProps {
  diameter: number;
  color: string;
}

/**
 * Crackling, hand-drawn-lightning ring around the Spin & Win wheel rim —
 * ported from `WheelElectricRim` in SpinWheelView.swift/SpinScreen.kt, the
 * circular counterpart to ElectricBorder.tsx's rounded-rect version.
 */
export function WheelElectricRim({ diameter, color }: WheelElectricRimProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const path = jaggedCirclePath(diameter, 56, tick, 3);

  return (
    <svg width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`} className="pointer-events-none absolute" aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth={14} opacity={0.4} style={{ filter: "blur(8px)" }} />
      <path d={path} fill="none" stroke={color} strokeWidth={7} opacity={0.85} style={{ filter: "blur(3px)" }} />
      <path d={path} fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.85} />
    </svg>
  );
}

import { useEffect, useState } from "react";
import { jaggedLinePath } from "../lib/electricBorder";

const TICK_MS = 80;
const WIDTH = 14;
const HEIGHT = 16;

interface ElectricConnectorProps {
  color: string;
  seedBase?: number;
}

/** Short crackling connector shown between OTP digit boxes once the code is complete. */
export function ElectricConnector({ color, seedBase = 0 }: ElectricConnectorProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const path = jaggedLinePath(WIDTH, HEIGHT / 2, seedBase + tick, 3);

  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="pointer-events-none" aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth={5} opacity={0.5} style={{ filter: "blur(5px)" }} />
      <path d={path} fill="none" stroke={color} strokeWidth={2} opacity={0.85} />
    </svg>
  );
}

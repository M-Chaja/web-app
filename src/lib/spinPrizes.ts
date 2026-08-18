// Ported from spinPrizes in SpinWheelView.swift / SpinScreen.kt — exact
// points/weights, do not rebalance without updating all three platforms.

export interface SpinPrize {
  /** undefined represents the "Try Again" segment (no points awarded). */
  points?: number;
  weight: number;
}

export const SPIN_PRIZES: SpinPrize[] = [
  { points: 50, weight: 26 },
  { points: 100, weight: 22 },
  { points: 500, weight: 16 },
  { points: 1000, weight: 14 },
  { points: 2000, weight: 8 },
  { points: 5000, weight: 3 },
  { points: 10000, weight: 1 },
  { points: undefined, weight: 10 }, // "Try Again"
];

export function weightedRandomPrizeIndex(): number {
  const total = SPIN_PRIZES.reduce((sum, prize) => sum + prize.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < SPIN_PRIZES.length; i++) {
    if (r < SPIN_PRIZES[i].weight) return i;
    r -= SPIN_PRIZES[i].weight;
  }
  return SPIN_PRIZES.length - 1;
}

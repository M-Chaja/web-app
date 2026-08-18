// Ported from Billing.swift / Billing.kt — exact values, do not change without
// updating all three platforms together.

export const HOURLY_RATE_TZS = 1000;
export const MINIMUM_DEPOSIT_TZS = 5000;
export const LONG_RENTAL_WARNING_HOURS = 5;

export function chargeForDuration(durationMs: number): number {
  const hours = Math.max(1, Math.ceil(durationMs / 3_600_000));
  return hours * HOURLY_RATE_TZS;
}

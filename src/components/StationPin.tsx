interface StationPinProps {
  available: boolean;
  isActive?: boolean;
  dimmed?: boolean;
}

/** Ported from `StationPin` in HomeView.swift / HomeScreen.kt — red bolt pin,
 *  grey + dimmed while rental gating is active (spec §7 rule 1). */
export function StationPin({ available, isActive = false, dimmed = false }: StationPinProps) {
  const size = isActive ? 44 : 36;
  return (
    <div
      className="flex items-center justify-center rounded-full transition-all duration-200"
      style={{
        width: size,
        height: size,
        backgroundColor: available && !dimmed ? "var(--color-brand-red)" : "var(--color-text-secondary)",
        border: isActive ? "3px solid #ffffff" : "none",
        opacity: dimmed ? 0.55 : 1,
        boxShadow: `0 2px ${isActive ? 6 : 4}px rgba(0,0,0,0.25)`,
      }}
    >
      <svg width={isActive ? 18 : 16} height={isActive ? 18 : 16} viewBox="0 0 24 24" fill={dimmed ? "#ffffff" : "var(--color-brand-yellow)"} aria-hidden="true">
        <path d="M13 2 3 14h6l-1 8 11-13h-6l1-7Z" />
      </svg>
    </div>
  );
}

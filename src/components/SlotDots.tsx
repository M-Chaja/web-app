interface SlotDotsProps {
  available: number;
  total: number;
}

/** Ported from `SlotDots` in StationDetailView.swift / StationDetailScreen.kt. */
export function SlotDots({ available, total }: SlotDotsProps) {
  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: i < available ? "var(--color-brand-yellow)" : "var(--color-border)" }}
        />
      ))}
    </div>
  );
}

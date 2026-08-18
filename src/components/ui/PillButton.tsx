// Ported from PillButton (shared SwiftUI/Compose component) — full-width
// rounded-pill CTA with a disabled state and an inline loading spinner.
interface PillButtonProps {
  label: string;
  onClick: () => void;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  disabled?: boolean;
  loading?: boolean;
}

export function PillButton({
  label,
  onClick,
  backgroundColor = "var(--color-brand-red)",
  textColor = "#ffffff",
  fontSize = 18,
  disabled = false,
  loading = false,
}: PillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="flex w-full items-center justify-center gap-2 rounded-full py-4 font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      style={{ backgroundColor, color: textColor, fontSize }}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {label}
    </button>
  );
}

interface BackButtonProps {
  onClick: () => void;
  tint?: string;
}

export function BackButton({ onClick, tint = "currentColor" }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tint} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

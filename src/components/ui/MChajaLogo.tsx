interface MChajaLogoProps {
  height?: number;
  variant?: "white" | "brand";
}

const LOGO_ASPECT_RATIO = 8191.99 / 1613.05;

/** Real wordmark asset (see LOGOS/M-Chaja Logo*.svg) — used across auth screens. */
export function MChajaLogo({ height = 40, variant = "brand" }: MChajaLogoProps) {
  const src = variant === "white" ? "/mchaja-logo-white.svg" : "/mchaja-logo.svg";
  return <img src={src} alt="M-Chaja" height={height} width={height * LOGO_ASPECT_RATIO} style={{ height, width: "auto" }} />;
}

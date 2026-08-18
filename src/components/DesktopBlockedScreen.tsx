import { MChajaLogo } from "./ui/MChajaLogo";

/**
 * Shown to desktop/tablet visitors instead of the app — see
 * M-Chaja_Web_App_Port_Spec.md §11. No router, no mock-data init happens
 * above this component when it's the one rendering.
 */
export function DesktopBlockedScreen() {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 bg-brand-red px-8 text-center">
      <MChajaLogo variant="white" height={44} />
      <p className="max-w-xs text-lg font-semibold text-white">M-Chaja is designed for mobile.</p>
      <p className="max-w-sm text-sm text-white/85">
        Open this link on your phone to sign up, top up your wallet, and rent a power bank.
      </p>
      <div className="mt-4 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white/70">
        app.m-chaja.com
      </div>
    </div>
  );
}

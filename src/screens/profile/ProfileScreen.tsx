import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../../components/ui/BackButton";
import { AppSession, useDarkMode, useSessionUser } from "../../lib/session";
import { useT } from "../../lib/i18n";

/**
 * Ported from ProfileView.swift. Notifications/location/biometric toggles
 * are omitted deliberately — they're native OS-permission concepts (spec §9:
 * biometric is native-only, skip for web) with no honest mocked web
 * equivalent, so a non-functional toggle would mislead rather than help.
 */
export function ProfileScreen() {
  const t = useT();
  const navigate = useNavigate();
  const user = useSessionUser();
  const isDarkMode = useDarkMode();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  function handleLogout() {
    AppSession.logout();
    navigate("/signup", { replace: true });
  }

  return (
    <div className="flex h-full min-h-dvh flex-col gap-3.5 bg-background px-5 pb-10 pt-5">
      <div className="relative flex items-center justify-center">
        <div className="absolute left-0">
          <BackButton onClick={() => navigate(-1)} />
        </div>
        <p className="text-lg font-bold text-text-primary">{t("profile.title")}</p>
      </div>

      <button
        type="button"
        onClick={() => navigate("/profile/edit")}
        className="flex items-center gap-3.5 rounded-2xl p-4 text-left"
        style={{ backgroundColor: "var(--color-brand-red)" }}
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-xl font-bold" style={{ color: "rgba(237,32,36,0.4)" }}>
          {user?.name?.[0] ?? "?"}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[18px] font-bold text-white">{user?.name ?? "M-Chaja User"}</span>
          <span className="truncate text-sm font-medium" style={{ color: "var(--color-brand-yellow)" }}>
            @{user?.handle ?? "user"}
          </span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-yellow)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="ml-auto shrink-0" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      <div className="flex flex-col overflow-hidden rounded-2xl" style={{ backgroundColor: "var(--color-brand-red)" }}>
        <ToggleRow icon={<MoonIcon />} label={t("profile.darkMode")} isOn={isDarkMode} onToggle={(v) => AppSession.darkModeEnabled.set(v)} />
        <RowDivider />
        <NavRow icon={<GlobeIcon />} label={t("profile.language")} onClick={() => navigate("/profile/language")} />
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl" style={{ backgroundColor: "var(--color-brand-red)" }}>
        <NavRow icon={<QuestionIcon />} label={t("profile.faq")} onClick={() => navigate("/profile/faq")} />
        <RowDivider />
        <NavRow icon={<InfoIcon />} label={t("profile.termsOfService")} onClick={() => navigate("/profile/terms")} />
        <RowDivider />
        <NavRow icon={<ShieldIcon />} label={t("profile.privacyPolicy")} onClick={() => navigate("/profile/privacy")} />
        <RowDivider />
        <NavRow icon={<QuestionIcon />} label={t("profile.support")} onClick={() => navigate("/profile/support")} />
      </div>

      <button
        type="button"
        onClick={() => setShowLogoutConfirm(true)}
        className="flex items-center justify-center gap-2.5 rounded-2xl py-4 font-semibold text-white"
        style={{ backgroundColor: "var(--color-brand-red)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-yellow)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
        {t("profile.logout")}
      </button>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-10" onClick={() => setShowLogoutConfirm(false)}>
          <div className="flex flex-col gap-3 rounded-2xl bg-card p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-lg font-bold text-text-primary">Are you sure you want to log out?</p>
            <button type="button" onClick={handleLogout} className="mt-1 rounded-full py-3 font-bold text-white" style={{ backgroundColor: "var(--color-brand-red)" }}>
              {t("profile.logout")}
            </button>
            <button type="button" onClick={() => setShowLogoutConfirm(false)} className="rounded-full py-3 font-semibold text-text-secondary">
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RowDivider() {
  return <div className="h-px bg-white/15" />;
}

function NavRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3 px-4 py-3.5 text-left">
      <span className="shrink-0" style={{ color: "var(--color-brand-yellow)" }}>
        {icon}
      </span>
      <span className="flex-1 font-semibold text-white">{label}</span>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-yellow)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}

function ToggleRow({ icon, label, isOn, onToggle }: { icon: React.ReactNode; label: string; isOn: boolean; onToggle: (value: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="shrink-0" style={{ color: "var(--color-brand-yellow)" }}>
        {icon}
      </span>
      <span className="flex-1 font-semibold text-white">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        onClick={() => onToggle(!isOn)}
        className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
        style={{ backgroundColor: isOn ? "var(--color-brand-yellow)" : "rgba(255,255,255,0.25)" }}
      >
        <span
          className="absolute top-1 h-5 w-5 rounded-full bg-white transition-all"
          style={{ left: isOn ? "26px" : "4px" }}
        />
      </button>
    </div>
  );
}

const ICON = { width: 18, height: 18, viewBox: "0 0 24 24", "aria-hidden": true as const };

function MoonIcon() {
  return (
    <svg {...ICON} fill="currentColor">
      <path d="M20.7 14.9A8.5 8.5 0 1 1 9.1 3.3a7 7 0 0 0 11.6 11.6Z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg {...ICON} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg {...ICON} fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm.75 15.5h-1.5V16h1.5v1.5Zm1.55-6.03c-.42.44-.7.76-.7 1.53h-1.5v-.4c0-.75.28-1.16.7-1.6l.63-.65c.28-.28.44-.6.44-1.05 0-.9-.73-1.5-1.62-1.5-.87 0-1.6.55-1.6 1.5H8.6c0-1.75 1.42-2.9 3.15-2.9 1.75 0 3.15 1.13 3.15 2.85 0 .78-.34 1.32-.9 1.9Z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg {...ICON} fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg {...ICON} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 4 6v6c0 5 3.4 7.7 8 9 4.6-1.3 8-4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

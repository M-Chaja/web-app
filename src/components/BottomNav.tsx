import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useT } from "../lib/i18n";

interface Tab {
  to: string;
  labelKey: string;
  icon: (props: { active: boolean }) => ReactNode;
}

const ICON_PROPS = { width: 22, height: 22, viewBox: "0 0 24 24", "aria-hidden": true as const };

const TABS: Tab[] = [
  {
    to: "/home",
    labelKey: "nav.home",
    icon: ({ active }) => (
      <svg {...ICON_PROPS} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
        <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z" />
      </svg>
    ),
  },
  {
    to: "/wallet",
    labelKey: "nav.wallet",
    icon: ({ active }) => (
      <svg {...ICON_PROPS} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18" stroke={active ? "var(--color-card)" : "currentColor"} />
        <circle cx="16.5" cy="14.5" r="1.1" fill={active ? "var(--color-card)" : "currentColor"} stroke="none" />
      </svg>
    ),
  },
  {
    to: "/activity",
    labelKey: "nav.activity",
    icon: ({ active }) => (
      <svg {...ICON_PROPS} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" stroke={active ? "var(--color-card)" : "currentColor"} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/points",
    labelKey: "nav.points",
    icon: ({ active }) => (
      <svg {...ICON_PROPS} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
        <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />
      </svg>
    ),
  },
];

/** Persistent tab bar — matches native `MainTabView`'s `TabView` (RootView.swift):
 *  a single shell around Home/Wallet/Activity/Points, not something each
 *  screen renders itself. See MainTabLayout.tsx for how it's mounted. */
export function BottomNav() {
  const t = useT();
  return (
    <nav className="flex shrink-0 items-stretch border-t border-border bg-card px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold"
          style={({ isActive }) => ({ color: isActive ? "var(--color-brand-red)" : "var(--color-text-secondary)" })}
        >
          {({ isActive }) => (
            <>
              {tab.icon({ active: isActive })}
              {t(tab.labelKey)}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

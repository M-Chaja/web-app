import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapLayer } from "../components/map/MapLayer";
import { StationCard } from "../components/StationCard";
import { MChajaLogo } from "../components/ui/MChajaLogo";
import { useActiveRental, useStations } from "../lib/mockApi";
import { useSessionUser } from "../lib/session";
import { useT } from "../lib/i18n";
import type { Station } from "../lib/models";

type SheetState = "peek" | "expanded";

const SWIPE_THRESHOLD_PX = 50;
const SWIPE_UP_THRESHOLD_PX = 60;

/**
 * Ported from HomeView.swift / HomeScreen.kt (spec §5, §10 step 4). The map
 * is always visible underneath — there's no Map/List toggle, matching
 * native. The floating card area is a horizontally swipeable carousel (one
 * station per page, sliding the same way OnboardingScreen's slides do) that
 * doubles as native's "peek" sheet state; swiping up on it jumps straight to
 * the full-screen station list ("expanded"), skipping native's third
 * "collapsed" state — this port only needs the two.
 */
export function HomeScreen() {
  const t = useT();
  const navigate = useNavigate();
  const user = useSessionUser();
  const stations = useStations();
  const activeRental = useActiveRental();
  const hasActiveRental = activeRental !== undefined;

  const [sheetState, setSheetState] = useState<SheetState>("peek");
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const activeStation: Station | undefined = stations[activeIndex];

  const filteredStations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return stations;
    return stations.filter((s) => s.name.toLowerCase().includes(query) || s.address.toLowerCase().includes(query));
  }, [stations, searchQuery]);

  function goScan() {
    if (hasActiveRental) return;
    navigate("/scan");
  }

  function goStation(station: Station) {
    navigate(`/station/${station.id}`);
  }

  function selectStation(station: Station) {
    const index = stations.findIndex((s) => s.id === station.id);
    if (index >= 0) setActiveIndex(index);
  }

  function handlePeekTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handlePeekTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY < -SWIPE_UP_THRESHOLD_PX) setSheetState("expanded");
      return;
    }
    if (Math.abs(deltaX) > SWIPE_THRESHOLD_PX) {
      if (deltaX < 0) setActiveIndex((i) => Math.min(i + 1, stations.length - 1));
      else setActiveIndex((i) => Math.max(i - 1, 0));
    }
  }

  function handleSheetHeaderTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleSheetHeaderTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (deltaY > SWIPE_UP_THRESHOLD_PX && Math.abs(deltaY) > Math.abs(deltaX)) {
      setSheetState("peek");
    }
  }

  return (
    <div className="relative flex h-full min-h-dvh flex-col overflow-hidden bg-background">
      <div className="absolute inset-0">
        <MapLayer
          stations={stations}
          activeStationId={activeStation?.id ?? null}
          dimmed={hasActiveRental}
          onSelect={selectStation}
        />
      </div>

      <div className="relative z-10 flex items-center justify-between px-5 pt-14">
        <button
          type="button"
          aria-label="Profile"
          onClick={() => navigate("/profile")}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md"
          style={{ backgroundColor: "var(--color-brand-red)" }}
        >
          {user?.name?.[0] ?? "?"}
        </button>

        <div className="flex items-center rounded-full px-4 py-2.5 shadow-md" style={{ backgroundColor: "var(--color-brand-red)" }}>
          <MChajaLogo variant="white" height={16} />
        </div>

        <button
          type="button"
          aria-label={t("station.scanQRCode")}
          onClick={goScan}
          disabled={hasActiveRental}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: "var(--color-brand-red)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" />
          </svg>
        </button>
      </div>

      {/* Peek: horizontally swipeable station carousel floating over the map —
          same translateX-slide technique as OnboardingScreen. Swipe up to expand. */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 px-5 pb-8 pt-4 transition-all duration-300 ease-out"
        style={{
          opacity: sheetState === "peek" ? 1 : 0,
          transform: sheetState === "peek" ? "translateY(0)" : "translateY(24px)",
          pointerEvents: sheetState === "peek" ? "auto" : "none",
        }}
        onTouchStart={handlePeekTouchStart}
        onTouchEnd={handlePeekTouchEnd}
      >
        <div className="overflow-hidden">
          <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
            {stations.map((station) => (
              <div key={station.id} className="w-full shrink-0">
                <StationCard station={station} onScan={goScan} onTap={() => goStation(station)} compact isDisabledForActiveRental={hasActiveRental} />
              </div>
            ))}
          </div>
        </div>
        {stations.length > 1 && (
          <div className="flex justify-center gap-1.5 pt-3">
            {stations.map((station, i) => (
              <span
                key={station.id}
                className="h-1.5 rounded-full transition-all"
                style={{ width: i === activeIndex ? 16 : 6, backgroundColor: i === activeIndex ? "var(--color-brand-red)" : "rgba(255,255,255,0.7)" }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Expanded: full station list sheet, slides up from the bottom, covering the map. */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-3xl bg-card shadow-[0_-4px_24px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out"
        style={{ top: 112, transform: sheetState === "expanded" ? "translateY(0)" : "translateY(100%)" }}
      >
        <div
          className="flex flex-col items-center gap-2 px-5 pb-3 pt-2.5"
          onTouchStart={handleSheetHeaderTouchStart}
          onTouchEnd={handleSheetHeaderTouchEnd}
        >
          <span className="h-1.5 w-10 rounded-full bg-border" />
          <p className="pt-1 text-xs font-semibold text-text-secondary">{t("home.nearbyStations")}</p>
          <div className="flex w-full items-center gap-2 rounded-xl bg-background px-3.5 py-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth={2} aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("home.searchPlaceholder")}
              className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
            />
          </div>
        </div>

        {filteredStations.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-8 text-center text-text-secondary">{t("home.noListingsMatch")}</div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 pb-10">
            <div className="flex flex-col gap-4">
              {filteredStations.map((station) => (
                <StationCard key={station.id} station={station} onScan={goScan} onTap={() => goStation(station)} isDisabledForActiveRental={hasActiveRental} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

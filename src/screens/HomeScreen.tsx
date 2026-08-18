import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapLayer } from "../components/map/MapLayer";
import { StationCard } from "../components/StationCard";
import { MChajaLogo } from "../components/ui/MChajaLogo";
import { useActiveRental, useStations } from "../lib/mockApi";
import { useSessionUser } from "../lib/session";
import { useT } from "../lib/i18n";
import type { Station } from "../lib/models";

type ViewMode = "map" | "list";

/**
 * Ported from HomeView.swift / HomeScreen.kt (spec §5, §10 step 4). Native
 * uses a draggable bottom sheet with collapsed/peek/expanded states; the
 * `home.mapView`/`home.listView` string keys already in the dictionary
 * suggest a simpler toggle is a reasonable web adaptation of the same
 * map+list duality, so that's what this uses instead of porting the
 * gesture-driven sheet mechanics literally.
 */
export function HomeScreen() {
  const t = useT();
  const navigate = useNavigate();
  const user = useSessionUser();
  const stations = useStations();
  const activeRental = useActiveRental();
  const hasActiveRental = activeRental !== undefined;

  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [activeStationId, setActiveStationId] = useState<string | null>(stations[0]?.id ?? null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const activeStation = stations.find((s) => s.id === activeStationId);

  return (
    <div className="relative flex h-full flex-col bg-background">
      {viewMode === "map" && (
        <div className="absolute inset-0">
          <MapLayer
            stations={stations}
            activeStationId={activeStationId}
            dimmed={hasActiveRental}
            onSelect={(station) => setActiveStationId(station.id)}
          />
        </div>
      )}

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

      <div className="relative z-10 flex justify-center pt-4">
        <div className="flex rounded-full bg-card p-1 shadow-md">
          {(["map", "list"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className="rounded-full px-5 py-2 text-sm font-semibold transition-colors"
              style={{
                backgroundColor: viewMode === mode ? "var(--color-brand-red)" : "transparent",
                color: viewMode === mode ? "#ffffff" : "var(--color-text-secondary)",
              }}
            >
              {mode === "map" ? t("home.mapView") : t("home.listView")}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "map" ? (
        activeStation && (
          <div className="relative z-10 mt-auto px-5 pb-8 pt-4">
            <StationCard station={activeStation} onScan={goScan} onTap={() => goStation(activeStation)} compact isDisabledForActiveRental={hasActiveRental} />
          </div>
        )
      ) : (
        <div className="relative z-10 flex flex-1 flex-col overflow-hidden bg-card">
          <div className="flex flex-col items-center gap-2 px-5 pb-3 pt-4">
            <p className="text-xs font-semibold text-text-secondary">{t("home.nearbyStations")}</p>
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
      )}
    </div>
  );
}

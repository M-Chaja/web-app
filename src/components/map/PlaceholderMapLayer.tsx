import type { Station } from "../../lib/models";
import { projectToPercent, stationBounds } from "../../lib/mapProjection";
import { StationPin } from "../StationPin";

interface PlaceholderMapLayerProps {
  stations: Station[];
  activeStationId: string | null;
  dimmed: boolean;
  onSelect: (station: Station) => void;
}

/**
 * Map view used when `VITE_GOOGLE_MAPS_API_KEY` isn't configured (see
 * GoogleMapLayer.tsx and spec §3) — a muted plane with stations placed by a
 * simple lat/lng→percent projection (lib/mapProjection.ts) rather than a real
 * street map. Fully interactive so the rest of the rental loop is buildable
 * and testable without a live Maps key; swap in GoogleMapLayer automatically
 * once one is set.
 */
export function PlaceholderMapLayer({ stations, activeStationId, dimmed, onSelect }: PlaceholderMapLayerProps) {
  const bounds = stationBounds(stations);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "repeating-linear-gradient(0deg, var(--color-subtle) 0, var(--color-subtle) 1px, var(--color-background) 1px, var(--color-background) 48px), repeating-linear-gradient(90deg, var(--color-subtle) 0, var(--color-subtle) 1px, var(--color-background) 1px, var(--color-background) 48px)",
      }}
      aria-hidden={false}
      role="img"
      aria-label="Map of nearby M-Chaja stations"
    >
      {stations.map((station) => {
        const { left, top } = projectToPercent(station.latitude, station.longitude, bounds);
        return (
          <button
            key={station.id}
            type="button"
            onClick={() => onSelect(station)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${left}%`, top: `${top}%` }}
            aria-label={station.name}
          >
            <StationPin available={station.availableCount > 0} isActive={station.id === activeStationId} dimmed={dimmed} />
          </button>
        );
      })}
    </div>
  );
}

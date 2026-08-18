import { APIProvider, AdvancedMarker, Map } from "@vis.gl/react-google-maps";
import type { Station } from "../../lib/models";
import { StationPin } from "../StationPin";

interface GoogleMapLayerProps {
  apiKey: string;
  stations: Station[];
  activeStationId: string | null;
  dimmed: boolean;
  onSelect: (station: Station) => void;
}

/**
 * Real map, used once `VITE_GOOGLE_MAPS_API_KEY` is configured (see spec §3 —
 * matches Android's Google Maps usage). Only imported/mounted when a key is
 * present; see MapLayer.tsx for the lazy-load + fallback wiring.
 */
export function GoogleMapLayer({ apiKey, stations, activeStationId, dimmed, onSelect }: GoogleMapLayerProps) {
  const active = stations.find((s) => s.id === activeStationId) ?? stations[0];
  const center = active ? { lat: active.latitude, lng: active.longitude } : { lat: -6.7924, lng: 39.2083 };

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        mapId="mchaja-home-map"
        defaultCenter={center}
        defaultZoom={13}
        disableDefaultUI
        gestureHandling="greedy"
        className="absolute inset-0"
      >
        {stations.map((station) => (
          <AdvancedMarker
            key={station.id}
            position={{ lat: station.latitude, lng: station.longitude }}
            onClick={() => onSelect(station)}
          >
            <StationPin available={station.availableCount > 0} isActive={station.id === activeStationId} dimmed={dimmed} />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}

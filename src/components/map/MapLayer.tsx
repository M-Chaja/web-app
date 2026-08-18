import { lazy, Suspense, useEffect, useState } from "react";
import type { Station } from "../../lib/models";
import { hasGoogleMapsAuthFailed, onGoogleMapsAuthFailure } from "../../lib/googleMapsAuthFailure";
import { MapErrorBoundary } from "./MapErrorBoundary";
import { PlaceholderMapLayer } from "./PlaceholderMapLayer";

const GoogleMapLayer = lazy(() => import("./GoogleMapLayer").then((m) => ({ default: m.GoogleMapLayer })));

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface MapLayerProps {
  stations: Station[];
  activeStationId: string | null;
  dimmed: boolean;
  onSelect: (station: Station) => void;
}

/**
 * Picks the real Google Maps layer when `VITE_GOOGLE_MAPS_API_KEY` is set,
 * otherwise the placeholder — see spec §3. The Google Maps bundle is
 * code-split via `lazy()` so it's never fetched at all in the common
 * (no-key) dev/mock case.
 */
export function MapLayer(props: MapLayerProps) {
  const [authFailed, setAuthFailed] = useState(hasGoogleMapsAuthFailed);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;
    return onGoogleMapsAuthFailure(() => setAuthFailed(true));
  }, []);

  if (!GOOGLE_MAPS_API_KEY || authFailed) {
    return <PlaceholderMapLayer {...props} />;
  }
  return (
    <MapErrorBoundary fallback={<PlaceholderMapLayer {...props} />}>
      <Suspense fallback={<PlaceholderMapLayer {...props} />}>
        <GoogleMapLayer apiKey={GOOGLE_MAPS_API_KEY} {...props} />
      </Suspense>
    </MapErrorBoundary>
  );
}

import type { Station } from "./models";

export interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

const DAR_ES_SALAAM_CENTER = { latitude: -6.7924, longitude: 39.2083 };
const FALLBACK_SPAN = 0.1;
/** Matches the native `stationClusterRegion` padding factor so the placeholder
 *  map frames stations with the same breathing room as the real MapKit view. */
const PADDING_FACTOR = 1.8;

export function stationBounds(stations: Station[]): Bounds {
  if (stations.length === 0) {
    return {
      minLat: DAR_ES_SALAAM_CENTER.latitude - FALLBACK_SPAN,
      maxLat: DAR_ES_SALAAM_CENTER.latitude + FALLBACK_SPAN,
      minLng: DAR_ES_SALAAM_CENTER.longitude - FALLBACK_SPAN,
      maxLng: DAR_ES_SALAAM_CENTER.longitude + FALLBACK_SPAN,
    };
  }
  const lats = stations.map((s) => s.latitude);
  const lngs = stations.map((s) => s.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latPad = Math.max((maxLat - minLat) * (PADDING_FACTOR - 1), FALLBACK_SPAN / 2);
  const lngPad = Math.max((maxLng - minLng) * (PADDING_FACTOR - 1), FALLBACK_SPAN / 2);
  return { minLat: minLat - latPad, maxLat: maxLat + latPad, minLng: minLng - lngPad, maxLng: maxLng + lngPad };
}

/** Projects a coordinate to a {left, top} percentage pair within `bounds`, for
 *  absolute positioning inside a placeholder map container. Latitude is
 *  inverted since screen `top` grows downward while latitude grows northward. */
export function projectToPercent(latitude: number, longitude: number, bounds: Bounds): { left: number; top: number } {
  const latSpan = bounds.maxLat - bounds.minLat || 1;
  const lngSpan = bounds.maxLng - bounds.minLng || 1;
  const left = ((longitude - bounds.minLng) / lngSpan) * 100;
  const top = ((bounds.maxLat - latitude) / latSpan) * 100;
  return { left, top };
}

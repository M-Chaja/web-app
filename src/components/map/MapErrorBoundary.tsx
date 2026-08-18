import { Component, type ReactNode } from "react";
import { markGoogleMapsBroken } from "../../lib/googleMapsAuthFailure";

interface MapErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface MapErrorBoundaryState {
  hasError: boolean;
}

/**
 * The Google Maps JS API can fail at runtime for reasons outside app code —
 * an API key without the right referrer allowlisted, a missing/unconfigured
 * Map ID for Advanced Markers, a network hiccup — and `AdvancedMarker`
 * throws when that happens, which would otherwise blank the whole Home
 * screen (no default error boundary exists above it). Degrade to the
 * placeholder map instead of crashing, and latch the failure at module
 * scope via `markGoogleMapsBroken()` so remounting the map (e.g. navigating
 * away and back) never attempts — and re-fails — the real map again; see
 * googleMapsAuthFailure.ts for why that matters.
 */
export class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  state: MapErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MapErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(): void {
    markGoogleMapsBroken();
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

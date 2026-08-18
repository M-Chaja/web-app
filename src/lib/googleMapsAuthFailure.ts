// Tracks whether the Google Maps JS integration is broken for the lifetime
// of this page load, from two sources:
//
// 1. `window.gm_authFailure` — the global callback the Maps JS API itself
//    calls on an auth failure (bad key, referrer not allowlisted, billing
//    disabled). Registering it at module scope guarantees it exists before
//    the Maps script (loaded by APIProvider's own effect) can possibly call
//    it. In practice this doesn't fire for every failure mode we've hit in
//    this environment's SDK version — see (2).
// 2. `markGoogleMapsBroken()` — called by MapErrorBoundary when it catches a
//    render-time error from the map tree (e.g. `<AdvancedMarker>` throwing
//    because of a missing/misconfigured Map ID). This is a reliable signal
//    even when (1) doesn't fire.
//
// Either source latches `hasFailed` at module scope, not just per-mount
// React state — remounting the map (e.g. Home -> away -> Home) does NOT
// naturally retrigger (1), since the already-loaded `google.maps` script
// isn't reloaded, and doesn't naturally retrigger (2) either. Without this
// module-level latch, every remount would blindly retry the real map,
// re-hitting the same failure — and, worse, an error thrown by the map
// tree's own cleanup effect *during* an unmount triggered by navigating
// away is NOT catchable by any React error boundary (a known React
// limitation: boundaries only catch render/lifecycle errors in mounted
// descendants), which crashes the whole app to a blank page. Latching after
// the first failure means the real map never mounts again this page load,
// so that race can't recur.
type Listener = () => void;

const listeners = new Set<Listener>();
let hasFailed = false;

if (typeof window !== "undefined") {
  window.gm_authFailure = () => markGoogleMapsBroken();
}

export function markGoogleMapsBroken(): void {
  if (hasFailed) return;
  hasFailed = true;
  listeners.forEach((listener) => listener());
}

export function hasGoogleMapsAuthFailed(): boolean {
  return hasFailed;
}

export function onGoogleMapsAuthFailure(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

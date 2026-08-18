import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { HOURLY_RATE_TZS } from "../lib/billing";
import { MockApi, useActiveRental, useStations } from "../lib/mockApi";
import { useT } from "../lib/i18n";

/**
 * Ported from QRScannerView.swift / QRScannerScreen.kt — see spec §3/§5. Real
 * camera QR decoding via getUserMedia + ZXing (native uses AVFoundation /
 * ML Kit); the "tap a station to simulate" list is always shown alongside
 * the camera, not just as an error fallback, matching native exactly.
 */
export function ScanScreen() {
  const t = useT();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const stations = useStations();
  const activeRental = useActiveRental();

  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraUnavailable, setCameraUnavailable] = useState(false);
  const hasHandledRef = useRef(false);

  useEffect(() => {
    if (activeRental) {
      navigate(`/rental/active/${activeRental.id}`, { replace: true });
    }
  }, [activeRental, navigate]);

  useEffect(() => {
    if (activeRental) return;
    const reader = new BrowserQRCodeReader();
    let controls: IScannerControls | undefined;
    let cancelled = false;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result) => {
        if (result && !cancelled) handleScannedCode(result.getText());
      })
      .then((c) => {
        if (cancelled) c.stop();
        else controls = c;
      })
      .catch(() => setCameraUnavailable(true));

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [activeRental]);

  function handleScannedCode(stationId: string) {
    if (hasHandledRef.current) return;
    if (!MockApi.station(stationId)) {
      setError(t("scan.unrecognizedCode"));
      return;
    }
    if (MockApi.walletBalanceTzs.get() < HOURLY_RATE_TZS) {
      setError(t("scan.balanceTooLow"));
      return;
    }
    hasHandledRef.current = true;
    setError(null);
    setIsStarting(true);
    MockApi.startRental(stationId).then((rental) => {
      navigate(`/rental/active/${rental.id}`, { replace: true });
    });
  }

  if (activeRental) return null;

  return (
    <div className="relative flex h-full min-h-dvh flex-col items-center bg-black">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline />
      {cameraUnavailable && <div className="absolute inset-0 bg-black" />}

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-8">
        <div className="h-60 w-60 rounded-2xl" style={{ border: "3px solid var(--color-brand-yellow)" }} />

        {isStarting ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-black/60 px-4 py-4">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
            <p className="text-white">{t("scan.unlockingCabinet")}</p>
          </div>
        ) : (
          <p className="text-center text-white">{t("scan.pointCamera")}</p>
        )}

        {error && <p className="rounded-xl bg-black/60 px-4 py-4 text-center" style={{ color: "#ff8a80" }}>{error}</p>}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-3 px-6 pb-4">
        <p className="text-xs text-white/60">{t("scan.noCameraSimulate")}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {stations
            .filter((s) => s.availableCount > 0)
            .map((station) => (
              <button
                key={station.id}
                type="button"
                onClick={() => handleScannedCode(station.id)}
                className="rounded-lg bg-white/15 px-2.5 py-2 text-xs font-semibold text-white"
              >
                {station.name}
              </button>
            ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="relative z-10 mb-6 rounded-[10px] bg-white/15 px-6 py-3 text-base font-semibold text-white"
      >
        {t("common.close")}
      </button>
    </div>
  );
}

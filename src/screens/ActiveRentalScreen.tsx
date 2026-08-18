import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BackButton } from "../components/ui/BackButton";
import { SlotDots } from "../components/SlotDots";
import { chargeForDuration, LONG_RENTAL_WARNING_HOURS } from "../lib/billing";
import { formatDuration } from "../lib/format";
import { MockApi, useActiveRental, useStations } from "../lib/mockApi";
import { useT } from "../lib/i18n";

const TICK_MS = 1000;

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Ported from ActiveRentalView.swift / ActiveRentalScreen.kt — see spec §5/§6. */
export function ActiveRentalScreen() {
  const t = useT();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  useStations();
  const activeRental = useActiveRental();
  const [now, setNow] = useState(() => new Date());
  const [isEnding, setIsEnding] = useState(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(tick);
  }, []);

  if (activeRental === undefined || activeRental.id !== id) {
    return <Navigate to="/home" replace />;
  }

  const rental = activeRental;
  const station = MockApi.station(rental.stationId);
  const elapsedMs = now.getTime() - new Date(rental.startedAt).getTime();
  const accruedChargeTzs = chargeForDuration(elapsedMs);
  const showWarning = elapsedMs / 3_600_000 >= LONG_RENTAL_WARNING_HOURS;

  async function handleEndRental() {
    setIsEnding(true);
    await MockApi.endRental(rental.id, accruedChargeTzs);
    setIsEnding(false);
    navigate("/home", { replace: true });
  }

  return (
    <div className="flex h-full min-h-dvh flex-col bg-background px-6 pb-10 pt-14">
      <div className="pb-3">
        <BackButton onClick={() => navigate(-1)} />
      </div>

      <h1 className="text-[26px] font-bold text-text-primary">{rental.stationName}</h1>

      {station && (
        <>
          <p className="pt-1 text-text-secondary">
            {station.distanceLabel ? `${station.address} · ${station.distanceLabel}` : station.address}
          </p>
          <div className="flex items-center gap-2 pt-2">
            <SlotDots available={station.availableCount} total={station.totalSlots} />
            <span
              className="ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-bold"
              style={{
                color: station.availableCount > 0 ? "var(--color-brand-yellow)" : "var(--color-brand-red)",
                backgroundColor: station.availableCount > 0 ? "rgba(251,185,33,0.12)" : "rgba(237,32,36,0.12)",
              }}
            >
              {station.availableCount > 0 ? t("station.openNow") : t("station.full")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-[13px] text-text-secondary">
            <span>{t("station.slotsSummary", { available: String(station.availableCount), total: String(station.totalSlots) })}</span>
            <span>·</span>
            <span className="font-semibold text-text-primary">{t("station.pricePerHour")}</span>
          </div>
        </>
      )}

      <div className="mt-5 flex flex-col items-center gap-2 rounded-2xl py-6" style={{ backgroundColor: "var(--color-brand-red)" }}>
        <p className="text-white">{t("rental.duration")}</p>
        <p className="font-mono text-4xl font-bold tabular-nums" style={{ color: "var(--color-brand-yellow)" }}>
          {formatDuration(elapsedMs)}
        </p>
      </div>

      <div className="flex justify-between pt-5 font-semibold text-text-primary">
        <span>{t("rental.accruedCharge")}</span>
        <span>TZS {accruedChargeTzs.toLocaleString()}</span>
      </div>

      {rental.batteryPercent !== undefined && (
        <div className="flex justify-between pt-2 text-text-primary">
          <span>{t("rental.batteryLevel")}</span>
          <span>{rental.batteryPercent}%</span>
        </div>
      )}

      {showWarning && (
        <p
          className="mt-4 rounded-2xl px-3.5 py-3.5"
          style={{ color: "var(--color-brand-red)", backgroundColor: "rgba(237,32,36,0.08)", border: "1px solid var(--color-brand-red)" }}
        >
          {t("rental.unreturnedWarningHours", { hours: String(LONG_RENTAL_WARNING_HOURS) })}
        </p>
      )}

      {station && (
        <>
          <hr className="my-4 border-border" />
          <section className="pt-2">
            <h2 className="pb-2 text-[17px] font-semibold text-text-primary">{t("station.operatingMode")}</h2>
            <div className="flex justify-between text-text-primary">
              <span>{t("station.everyday")}</span>
              <span>{station.operatingHours}</span>
            </div>
          </section>
          <section className="pt-6">
            <h2 className="pb-2 text-[17px] font-semibold text-text-primary">{t("station.support")}</h2>
            <a href={telHref(station.supportPhone)} className="text-base text-text-primary underline">
              {station.supportPhone}
            </a>
          </section>
        </>
      )}

      {showEndConfirmation ? (
        <div className="mt-7 flex flex-col gap-2 rounded-2xl bg-card p-4 shadow-md">
          <p className="pb-1 text-center font-semibold text-text-primary">{t("rental.endConfirmTitle")}</p>
          <button
            type="button"
            onClick={handleEndRental}
            disabled={isEnding}
            className="rounded-full py-3.5 font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: "var(--color-brand-red)" }}
          >
            {isEnding ? "…" : t("rental.endRental")}
          </button>
          <button type="button" onClick={() => setShowEndConfirmation(false)} className="rounded-full py-3.5 font-semibold text-text-secondary">
            {t("common.cancel")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowEndConfirmation(true)}
          className="mt-7 rounded-full py-4 text-[17px] font-bold"
          style={{ backgroundColor: "var(--color-brand-red)", color: "var(--color-brand-yellow)" }}
        >
          {t("rental.returnedIt")}
        </button>
      )}
    </div>
  );
}

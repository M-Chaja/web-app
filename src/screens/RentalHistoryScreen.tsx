import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chargeForDuration } from "../lib/billing";
import { formatDuration } from "../lib/format";
import { useActiveRental, useRentals, useStations } from "../lib/mockApi";
import type { Rental, Station } from "../lib/models";
import { useT } from "../lib/i18n";
import { stationPhotoSrc } from "../lib/stationImages";

const TICK_MS = 1000;

function completedDuration(rental: Rental): string {
  if (!rental.endedAt) return "";
  const ms = new Date(rental.endedAt).getTime() - new Date(rental.startedAt).getTime();
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/**
 * Ported from RentalHistoryView.swift / RentalHistoryScreen.kt — see spec
 * §5/§7 rule 2: only the list scrolls, the page title stays fixed.
 */
export function RentalHistoryScreen() {
  const t = useT();
  const navigate = useNavigate();
  const rentals = useRentals();
  const stations = useStations();
  const activeRental = useActiveRental();

  const history = useMemo(
    () =>
      rentals
        .filter((r) => r.status === "completed")
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()),
    [rentals],
  );

  function stationFor(rental: Rental): Station | undefined {
    return stations.find((s) => s.id === rental.stationId);
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <h1 className="px-5 pb-2 pt-8 text-[28px] font-bold text-text-primary">{t("rental.historyTitle")}</h1>

      <div className="flex-1 overflow-y-auto px-5 pb-10 pt-4">
        <div className="flex flex-col gap-4">
          {activeRental && <ActiveRentalCard rental={activeRental} station={stationFor(activeRental)} onClick={() => navigate(`/rental/active/${activeRental.id}`)} />}

          {history.length === 0 ? (
            <p className="text-text-secondary">{t("rental.noPastRentals")}</p>
          ) : (
            <div className="flex flex-col gap-3.5">
              {history.map((rental) => (
                <RentalHistoryCard key={rental.id} rental={rental} station={stationFor(rental)} onClick={() => navigate(`/station/${rental.stationId}`)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActiveRentalCard({ rental, station, onClick }: { rental: Rental; station: Station | undefined; onClick: () => void }) {
  const t = useT();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const elapsedMs = now.getTime() - new Date(rental.startedAt).getTime();

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[76px] items-center overflow-hidden rounded-2xl bg-card text-left shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
    >
      {station && (
        <img src={stationPhotoSrc(station.locationImageName)} alt="" className="h-full w-[76px] shrink-0 object-cover" />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-3">
        <p className="text-[10px] font-bold" style={{ color: "var(--color-brand-red)" }}>
          {t("rental.inProgressBadge")}
        </p>
        <p className="truncate text-xs font-bold text-text-primary">{rental.stationName}</p>
        {station?.address && <p className="truncate text-[9px] text-text-secondary">{station.address}</p>}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5 pr-3.5">
        <p className="text-[10px] font-semibold text-text-primary">{t("rental.countdown")}</p>
        <p className="font-mono text-sm font-bold" style={{ color: "var(--color-brand-red)" }}>
          {formatDuration(elapsedMs)}
        </p>
        <p className="text-[8px] text-text-secondary">
          {t("rental.totalCharge")}: TZS {chargeForDuration(elapsedMs).toLocaleString()}
        </p>
      </div>
    </button>
  );
}

function RentalHistoryCard({ rental, station, onClick }: { rental: Rental; station: Station | undefined; onClick: () => void }) {
  const t = useT();
  const cabinetLabel = station
    ? `${station.cabinetType === "big" ? t("station.cabinetBig") : t("station.cabinetSmall")} · ${station.totalSlots} ${t("station.slots")}`
    : t("station.cabinet");

  return (
    <button type="button" onClick={onClick} className="flex flex-col overflow-hidden rounded-[20px] bg-card text-left shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      {station && <img src={stationPhotoSrc(station.locationImageName)} alt={station.name} className="h-[130px] w-full object-cover" />}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="truncate text-[17px] font-bold text-text-primary">{rental.stationName}</p>
            {station?.address && <p className="truncate text-xs text-text-secondary">{station.address}</p>}
          </div>
          <p className="shrink-0 text-base font-bold" style={{ color: "var(--color-brand-red)" }}>
            TZS {(rental.totalChargedTzs ?? 0).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <DetailChip label={cabinetLabel} />
          <DetailChip label={rental.endedAt ? completedDuration(rental) : t("rental.inProgress")} />
          {rental.batteryPercent !== undefined && <DetailChip label={`${rental.batteryPercent}%`} />}
        </div>

        <p className="text-xs text-text-secondary">
          {new Date(rental.startedAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}{" "}
          {new Date(rental.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </button>
  );
}

function DetailChip({ label }: { label: string }) {
  return <span className="text-xs font-medium text-text-secondary">{label}</span>;
}

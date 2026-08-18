import type { Station } from "../lib/models";
import { useT } from "../lib/i18n";
import { cabinetPhotoSrc, stationPhotoSrc } from "../lib/stationImages";
import { PillButton } from "./ui/PillButton";

interface StationCardProps {
  station: Station;
  onScan: () => void;
  onTap?: () => void;
  compact?: boolean;
  /** True while the user has a rental in progress — see spec §7 rule 1. */
  isDisabledForActiveRental?: boolean;
}

/**
 * Ported from StationCard.swift / StationCard.kt: a cabinet-type photo
 * beside the details, and — matching native's `showPhoto` (on for
 * full/list cards, off for the compact map bottom-sheet card) — a full-width
 * location photo below.
 */
export function StationCard({ station, onScan, onTap, compact = false, isDisabledForActiveRental = false }: StationCardProps) {
  const t = useT();
  const isOpen = station.availableCount > 0;
  const isScanDisabled = station.availableCount === 0 || isDisabledForActiveRental;
  const photoSrc = stationPhotoSrc(station.locationImageName);

  return (
    <div
      onClick={onTap}
      className="flex flex-col gap-3.5 rounded-[20px] bg-card p-5 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-opacity"
      style={{ opacity: isDisabledForActiveRental ? 0.5 : 1, cursor: onTap ? "pointer" : "default" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className={`truncate font-bold text-text-primary ${compact ? "text-lg" : "text-[22px]"}`}>{station.name}</h3>
          <p className={`text-text-secondary ${compact ? "text-xs" : "text-sm"}`}>{station.address}</p>
          <p className={`pt-0.5 font-semibold text-text-primary ${compact ? "text-[13px]" : "text-[15px]"}`}>
            {t("station.powerBanksAvailable", { total: String(station.totalSlots), available: String(station.availableCount) })}
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
            <span
              className={`rounded-full px-2.5 py-1 font-bold ${compact ? "text-[11px]" : "text-xs"}`}
              style={{
                color: isOpen ? "var(--color-brand-yellow)" : "var(--color-brand-red)",
                backgroundColor: isOpen ? "rgba(251,185,33,0.12)" : "rgba(237,32,36,0.12)",
              }}
            >
              {isOpen ? t("station.open") : t("station.full")}
            </span>
            {station.distanceLabel && <span className="text-text-secondary text-xs">{station.distanceLabel}</span>}
            <span className="text-xs font-semibold text-text-primary">{t("station.pricePerHour")}</span>
          </div>
        </div>

        <img
          src={cabinetPhotoSrc(station.cabinetType)}
          alt={station.cabinetType === "small" ? t("station.cabinetSmall") : t("station.cabinetBig")}
          className="shrink-0 object-contain"
          style={{ width: compact ? 84 : 95, height: compact ? 84 : 95 }}
        />
      </div>

      {!compact && photoSrc && (
        <img src={photoSrc} alt={station.name} className="h-40 w-full rounded-2xl object-cover" />
      )}

      <div onClick={(e) => e.stopPropagation()}>
        <PillButton label={t("station.scanToRent")} disabled={isScanDisabled} onClick={onScan} />
      </div>
    </div>
  );
}

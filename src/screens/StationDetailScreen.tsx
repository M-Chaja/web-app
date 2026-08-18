import { useNavigate, useParams } from "react-router-dom";
import { BackButton } from "../components/ui/BackButton";
import { PillButton } from "../components/ui/PillButton";
import { SlotDots } from "../components/SlotDots";
import { MockApi, useActiveRental, useStations } from "../lib/mockApi";
import { useT } from "../lib/i18n";
import { stationPhotoSrc } from "../lib/stationImages";

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function directionsHref(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

/** Ported from StationDetailView.swift / StationDetailScreen.kt — see spec §5. */
export function StationDetailScreen() {
  const t = useT();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  useStations();
  const station = id ? MockApi.station(id) : undefined;
  const hasActiveRental = useActiveRental() !== undefined;

  if (!station) {
    return (
      <div className="flex h-full min-h-dvh flex-col bg-background px-6 pt-14">
        <BackButton onClick={() => navigate(-1)} />
        <p className="pt-6 text-text-secondary">{t("station.notFound")}</p>
      </div>
    );
  }

  const isOpen = station.availableCount > 0;
  const isScanDisabled = station.availableCount === 0 || hasActiveRental;

  return (
    <div className="flex h-full min-h-dvh flex-col bg-background px-6 pb-10 pt-14">
      <div className="pb-3">
        <BackButton onClick={() => navigate(-1)} />
      </div>

      <h1 className="text-[26px] font-bold text-text-primary">{station.name}</h1>
      <p className="pt-1 text-text-secondary">
        {station.distanceLabel ? `${station.address} · ${station.distanceLabel}` : station.address}
      </p>

      <div className="flex items-center gap-2 pt-2">
        <SlotDots available={station.availableCount} total={station.totalSlots} />
        <span
          className="ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-bold"
          style={{
            color: isOpen ? "var(--color-brand-yellow)" : "var(--color-brand-red)",
            backgroundColor: isOpen ? "rgba(251,185,33,0.12)" : "rgba(237,32,36,0.12)",
          }}
        >
          {isOpen ? t("station.openNow") : t("station.full")}
        </span>
      </div>

      <div className="flex items-center gap-1.5 pt-1 text-[13px] text-text-secondary">
        <span>{t("station.slotsSummary", { available: String(station.availableCount), total: String(station.totalSlots) })}</span>
        <span>·</span>
        <span className="font-semibold text-text-primary">{t("station.pricePerHour")}</span>
      </div>

      {stationPhotoSrc(station.locationImageName) && (
        <img
          src={stationPhotoSrc(station.locationImageName)}
          alt={station.name}
          className="mt-5 h-[200px] w-full rounded-2xl object-cover"
        />
      )}

      <section className="pt-6">
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

      <div className="flex gap-3 pt-8">
        <a
          href={directionsHref(station.latitude, station.longitude)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center rounded-full py-4 text-lg font-bold text-white"
          style={{ backgroundColor: "var(--color-brand-yellow)" }}
        >
          {t("station.setRoute")}
        </a>
        <div className="flex-1">
          <PillButton label={t("station.scanQRCode")} disabled={isScanDisabled} onClick={() => navigate("/scan")} />
        </div>
      </div>
    </div>
  );
}

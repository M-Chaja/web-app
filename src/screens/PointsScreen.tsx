import { useNavigate } from "react-router-dom";
import { useChajaPoints, useSessionUser } from "../lib/session";
import { useT } from "../lib/i18n";

/** Ported from ChajaPointsView.swift / PointsScreen.kt — see spec §5/§10 step 6. */
export function PointsScreen() {
  const t = useT();
  const navigate = useNavigate();
  const user = useSessionUser();
  const points = useChajaPoints();

  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? "points.greetingMorning" : hour < 17 ? "points.greetingAfternoon" : "points.greetingEvening";

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="px-5 pb-4 pt-8">
        <div className="flex flex-col gap-3.5 rounded-3xl p-[22px]" style={{ backgroundColor: "var(--color-brand-red)" }}>
          <div className="flex items-start gap-3.5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-bold" style={{ color: "rgba(237,32,36,0.4)" }}>
              {user?.name?.[0] ?? "?"}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1">
              <p className="text-xl font-bold text-white">{t(greetingKey)}</p>
              <p className="text-base font-bold text-white">@{user?.handle ?? "mchaja_user"}</p>
            </div>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="var(--color-brand-yellow)" className="shrink-0" aria-hidden="true">
              <path d="M13 2 3 14h6l-1 8 11-13h-6l1-7Z" />
            </svg>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-semibold text-white">{t("points.youHave")}</span>
            <span className="text-[34px] font-black leading-none" style={{ color: "var(--color-brand-yellow)" }}>
              {points.toLocaleString()}
            </span>
            <span className="text-base font-semibold text-white">{t("points.chajaPointsLabel")}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10">
        <div className="flex flex-col gap-4">
          <PromoCard
            title={t("points.earnPointsTitle")}
            subtitle={t("points.earnPointsSubtitle")}
            buttonLabel={t("points.chajaPointsButton")}
            buttonTextColor="var(--color-text-primary)"
            image="/points/earn-banner.png"
          />

          <PromoCard
            title={t("points.spinWinTitle")}
            subtitle={t("points.spinWinSubtitle")}
            buttonLabel={t("points.playWinButton")}
            buttonTextColor="#6b0f05"
            image="/points/spin-banner.png"
            onClick={() => navigate("/points/spin")}
          />

          <PromoCard
            title={t("points.watchVideosTitle")}
            subtitle={t("points.watchVideosSubtitle")}
            buttonLabel={t("points.watchEarnButton")}
            buttonTextColor="#8c2900"
            image="/points/watch-banner.png"
            onClick={() => navigate("/points/watch")}
          />
        </div>
      </div>
    </div>
  );
}

interface PromoCardProps {
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonTextColor: string;
  image: string;
  onClick?: () => void;
}

function PromoCard({ title, subtitle, buttonLabel, buttonTextColor, image, onClick }: PromoCardProps) {
  return (
    <button type="button" onClick={onClick} className="relative flex h-[190px] w-full overflow-hidden rounded-3xl text-left">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.55), rgba(0,0,0,0.15) 60%, transparent)" }} />
      <div className="relative flex flex-1 flex-col justify-end p-5">
        <p className="text-[25px] font-black text-white">{title}</p>
        <p className="max-w-[190px] pt-1 text-[13px] font-medium text-white/90">{subtitle}</p>
        <span
          className="mt-1.5 self-start rounded-full px-5 py-2.5 text-sm font-bold"
          style={{ backgroundColor: "var(--color-brand-yellow)", color: buttonTextColor }}
        >
          {buttonLabel}
        </span>
      </div>
    </button>
  );
}

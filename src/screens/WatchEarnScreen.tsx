import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/ui/BackButton";
import { AppSession } from "../lib/session";
import { useT } from "../lib/i18n";

const POINTS_PER_VIDEO = 500;
const PLACEHOLDER_VIDEO_SECONDS = 4;

/**
 * Ported from WatchVideosView.swift / WatchVideosScreen.kt — see spec §5/§9.
 * Native drives this with a real Google Mobile Ads rewarded video; per spec
 * §9 that's explicitly not portable to web without its own ad-SDK account
 * setup, so this plays a placeholder video (the splash asset) for a few
 * seconds and then awards the reward, standing in for the ad experience.
 */
export function WatchEarnScreen() {
  const t = useT();
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());
  const [showHelp, setShowHelp] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(PLACEHOLDER_VIDEO_SECONDS);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isWatching) return;
    if (secondsLeft <= 0) {
      setIsWatching(false);
      AppSession.recordVideoWatch();
      AppSession.addPoints(POINTS_PER_VIDEO);
      setShowReward(true);
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [isWatching, secondsLeft]);

  const videosRemaining = AppSession.videosRemaining(now);
  const isRateLimited = videosRemaining <= 0;
  const canWatch = !isRateLimited && !isWatching;
  const nextVideoAt = AppSession.nextVideoAvailableAt(now);
  const secondsUntilNext = nextVideoAt ? Math.max(0, Math.ceil((nextVideoAt.getTime() - now.getTime()) / 1000)) : 0;
  const countdownText = `${String(Math.floor(secondsUntilNext / 60)).padStart(2, "0")}:${String(secondsUntilNext % 60).padStart(2, "0")}`;

  function watchVideo() {
    if (!canWatch) return;
    setSecondsLeft(PLACEHOLDER_VIDEO_SECONDS);
    setIsWatching(true);
  }

  return (
    <div className="flex h-full min-h-dvh flex-col bg-background">
      <div className="relative flex items-center justify-center px-5 pt-8">
        <p className="text-lg font-bold text-text-primary">{t("points.watchVideosTitle")}</p>
        <div className="absolute left-5">
          <BackButton onClick={() => navigate(-1)} />
        </div>
        <button type="button" onClick={() => setShowHelp(true)} className="absolute right-5 text-text-secondary" aria-label="Help">
          <HelpIcon />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-[26px] font-black text-text-primary">{t("points.watchScreenTitle")}</p>
          <p className="max-w-xs text-sm font-medium text-text-secondary">{t("points.watchSubtitle")}</p>
        </div>

        <button
          type="button"
          onClick={watchVideo}
          disabled={!canWatch}
          className="relative flex items-center justify-center overflow-hidden rounded-[28px] bg-black disabled:opacity-70"
          style={{ width: 300, height: 300 }}
        >
          <video src="/splash.mp4" muted playsInline loop autoPlay className="h-full w-full object-cover opacity-60" />
          <div className="absolute flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-brand-red)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5-11-6.5Z" />
              </svg>
            </div>
            <p className="rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white">
              {t("points.pointsPerVideo", { amount: String(POINTS_PER_VIDEO) })}
            </p>
          </div>
        </button>

        <div className="w-full pt-2">
          {!isRateLimited ? (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={watchVideo}
                disabled={!canWatch}
                className="w-full rounded-full py-4 text-[17px] font-bold text-white disabled:opacity-70"
                style={{ backgroundColor: "var(--color-brand-red)" }}
              >
                {t("points.watchVideoButton")}
              </button>
              <p className="text-[13px] font-medium text-text-secondary">{t("points.videosLeft", { count: String(videosRemaining) })}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-full rounded-full py-3.5 text-center font-mono text-[22px] font-black text-white" style={{ backgroundColor: "var(--color-text-secondary)" }}>
                {countdownText}
              </div>
              <p className="text-[13px] font-medium text-text-secondary">{t("points.nextVideoIn", { time: countdownText })}</p>
            </div>
          )}
        </div>
      </div>

      {isWatching && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black">
          <video src="/splash.mp4" muted playsInline autoPlay className="absolute inset-0 h-full w-full object-cover" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-black/60 font-mono text-lg font-bold text-white">
            {secondsLeft}
          </div>
        </div>
      )}

      {showReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-10" onClick={() => setShowReward(false)}>
          <div className="flex flex-col items-center gap-3.5 rounded-[28px] bg-card p-7 text-center" onClick={(e) => e.stopPropagation()}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="var(--color-brand-yellow)" aria-hidden="true">
              <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.2 21 12 17.5 5.8 21 7 14.14l-5-4.87 7.1-1.01L12 2Z" />
            </svg>
            <p className="text-[22px] font-black text-text-primary">{t("points.youWonTitle")}</p>
            <p className="text-[15px] font-medium text-text-secondary">{t("points.youEarnedPoints", { amount: String(POINTS_PER_VIDEO) })}</p>
            <button
              type="button"
              onClick={() => setShowReward(false)}
              className="mt-1 w-full rounded-full py-3.5 text-base font-bold text-white"
              style={{ backgroundColor: "var(--color-brand-red)" }}
            >
              {t("points.awesome")}
            </button>
          </div>
        </div>
      )}

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-10" onClick={() => setShowHelp(false)}>
          <div className="flex flex-col gap-3 rounded-2xl bg-card p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-lg font-bold text-text-primary">{t("points.watchVideosTitle")}</p>
            <p className="text-sm text-text-secondary">{t("points.watchHelpMessage")}</p>
            <button type="button" onClick={() => setShowHelp(false)} className="mt-1 rounded-full py-2.5 font-bold text-white" style={{ backgroundColor: "var(--color-brand-red)" }}>
              {t("common.ok")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HelpIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm.75 15.5h-1.5V16h1.5v1.5Zm1.55-6.03c-.42.44-.7.76-.7 1.53h-1.5v-.4c0-.75.28-1.16.7-1.6l.63-.65c.28-.28.44-.6.44-1.05 0-.9-.73-1.5-1.62-1.5-.87 0-1.6.55-1.6 1.5H8.6c0-1.75 1.42-2.9 3.15-2.9 1.75 0 3.15 1.13 3.15 2.85 0 .78-.34 1.32-.9 1.9Z" />
    </svg>
  );
}

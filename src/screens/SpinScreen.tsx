import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/ui/BackButton";
import { BottomNav } from "../components/BottomNav";
import { WheelElectricRim } from "../components/WheelElectricRim";
import { AppSession } from "../lib/session";
import { SPIN_PRIZES, weightedRandomPrizeIndex } from "../lib/spinPrizes";
import { useT } from "../lib/i18n";

const WHEEL_SIZE = 300;
const RING_SIZE = WHEEL_SIZE + 12;
const HUB_SIZE = 60;
const SPIN_DURATION_MS = 4000;
const ELECTRIC_PULSE_MS = 550;
const SEGMENT_ANGLE = 360 / SPIN_PRIZES.length;

const SEGMENT_STYLE = [
  { bg: "var(--color-brand-red)", text: "#ffffff" },
  { bg: "#2a2a2a", text: "#ffffff" },
  { bg: "var(--color-brand-yellow)", text: "#1a1a1a" },
  { bg: "var(--color-brand-red)", text: "#ffffff" },
  { bg: "#2a2a2a", text: "#ffffff" },
  { bg: "var(--color-brand-yellow)", text: "#1a1a1a" },
  { bg: "var(--color-brand-red)", text: "#ffffff" },
  { bg: "#6b6b6b", text: "#ffffff" },
];

const wheelGradient = `conic-gradient(${SPIN_PRIZES.map((_, i) => `${SEGMENT_STYLE[i].bg} ${i * SEGMENT_ANGLE}deg ${(i + 1) * SEGMENT_ANGLE}deg`).join(", ")})`;

function labelPosition(center: number) {
  const rad = ((center - 90) * Math.PI) / 180;
  const r = (WHEEL_SIZE / 2) * 0.62;
  return { x: WHEEL_SIZE / 2 + r * Math.cos(rad), y: WHEEL_SIZE / 2 + r * Math.sin(rad) };
}

/** Ported from SpinWheelView.swift / SpinScreen.kt — see spec §4/§5/§7 rule 3. */
export function SpinScreen() {
  const t = useT();
  const navigate = useNavigate();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [showHelp, setShowHelp] = useState(false);
  const [electricPulse, setElectricPulse] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const spinsRemaining = AppSession.spinsRemaining(now);
  const canSpin = spinsRemaining > 0 && !isSpinning;
  const nextSpinAt = AppSession.nextSpinAvailableAt(now);
  const secondsUntilNext = nextSpinAt ? Math.max(0, Math.ceil((nextSpinAt.getTime() - now.getTime()) / 1000)) : 0;
  const countdownText = `${String(Math.floor(secondsUntilNext / 60)).padStart(2, "0")}:${String(secondsUntilNext % 60).padStart(2, "0")}`;

  function spin() {
    if (!canSpin) return;
    setIsSpinning(true);
    setResultIndex(null);

    const index = weightedRandomPrizeIndex();
    const centerAngle = (index + 0.5) * SEGMENT_ANGLE;
    const targetMod = (360 - centerAngle) % 360;
    const currentMod = rotation % 360;
    let delta = (targetMod - currentMod) % 360;
    if (delta < 0) delta += 360;
    const newRotation = rotation + delta + 6 * 360;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const points = SPIN_PRIZES[index].points;
      if (points !== undefined) {
        // "Try Again" spins don't consume the hourly allowance — only a spin
        // that actually wins points counts against the limit (spec §7 rule 3).
        AppSession.recordSpin();
        AppSession.addPoints(points);
        setElectricPulse(true);
        setTimeout(() => {
          setElectricPulse(false);
          setResultIndex(index);
        }, ELECTRIC_PULSE_MS);
      } else {
        setResultIndex(index);
      }
    }, SPIN_DURATION_MS);
  }

  return (
    <div className="flex h-full min-h-dvh flex-col bg-background">
      <div className="relative flex items-center justify-center px-5 pt-8">
        <p className="text-lg font-bold text-text-primary">{t("points.spinWinTitle")}</p>
        <div className="absolute left-5">
          <BackButton onClick={() => navigate(-1)} />
        </div>
        <button type="button" onClick={() => setShowHelp(true)} className="absolute right-5 text-text-secondary" aria-label="Help">
          <HelpIcon />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-[26px] font-black text-text-primary">{t("points.spinTheWheel")}</p>
          <p className="text-sm font-medium text-text-secondary">{t("points.spinSubtitle")}</p>
        </div>

        <div className="relative flex items-center justify-center" style={{ width: WHEEL_SIZE + 44, height: WHEEL_SIZE + 44 }}>
          <div className="absolute rounded-full" style={{ width: WHEEL_SIZE + 44, height: WHEEL_SIZE + 44, backgroundColor: "#2a2a2a" }} />

          <GlowingDots />

          <div
            className="absolute rounded-full"
            style={{ width: RING_SIZE, height: RING_SIZE, border: "4px solid rgba(251,185,33,0.5)" }}
          />
          <WheelElectricRim diameter={RING_SIZE} color="var(--color-brand-yellow)" />

          <div
            className="absolute overflow-hidden rounded-full"
            style={{
              width: WHEEL_SIZE,
              height: WHEEL_SIZE,
              background: wheelGradient,
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)` : "none",
            }}
          >
            {SPIN_PRIZES.map((prize, i) => {
              const start = i * SEGMENT_ANGLE;
              const center = start + SEGMENT_ANGLE / 2;
              const { x, y } = labelPosition(center);
              const onScreenAngle = ((rotation + center) % 360 + 360) % 360;
              const textRotation = onScreenAngle > 90 && onScreenAngle < 270 ? center + 180 : center;
              return (
                <div key={i} className="absolute" style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}>
                  <span
                    className="block whitespace-nowrap font-black"
                    style={{
                      fontSize: prize.points === undefined ? 13 : 17,
                      color: SEGMENT_STYLE[i].text,
                      transform: `rotate(${textRotation}deg)`,
                    }}
                  >
                    {prize.points !== undefined ? prize.points.toLocaleString() : t("points.tryAgainPrize")}
                  </span>
                </div>
              );
            })}
          </div>

          {isSpinning && <SpinPulses />}

          {electricPulse && (
            <div
              className="absolute rounded-full border-[6px] blur-[2px]"
              style={
                {
                  borderColor: "var(--color-brand-yellow)",
                  animation: `wheel-electric-pulse ${ELECTRIC_PULSE_MS}ms ease-out forwards`,
                  "--wheel-pulse-max": `${RING_SIZE}px`,
                } as CSSProperties
              }
            />
          )}

          <div
            className="absolute flex items-center justify-center rounded-full"
            style={{
              width: HUB_SIZE,
              height: HUB_SIZE,
              backgroundColor: "var(--color-brand-yellow)",
              border: "3px solid #ffffff",
              boxShadow: `0 0 ${isSpinning || electricPulse ? 16 : 4}px var(--color-brand-yellow), 0 2px 4px rgba(0,0,0,0.25)`,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
              <path d="M13 2 3 14h6l-1 8 11-13h-6l1-7Z" />
            </svg>
          </div>

          <div className="absolute flex flex-col items-center" style={{ top: -6 }}>
            <div className="h-4 w-4 rounded-full bg-white" style={{ border: "2px solid var(--color-brand-red)" }} />
            <div
              style={{
                marginTop: -6,
                width: 0,
                height: 0,
                borderLeft: "13px solid transparent",
                borderRight: "13px solid transparent",
                borderTop: "22px solid var(--color-brand-red)",
              }}
            />
          </div>
        </div>

        <div className="w-full pt-2">
          {canSpin || isSpinning ? (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={spin}
                disabled={isSpinning}
                className="w-full rounded-full py-4 text-[17px] font-bold text-white disabled:opacity-70"
                style={{ backgroundColor: "var(--color-brand-red)" }}
              >
                {isSpinning ? t("points.spinning") : t("points.clickToSpin")}
              </button>
              <p className="text-[13px] font-medium text-text-secondary">{t("points.spinsLeft", { count: String(spinsRemaining) })}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-full rounded-full py-3.5 text-center font-mono text-[22px] font-black text-white" style={{ backgroundColor: "var(--color-text-secondary)" }}>
                {countdownText}
              </div>
              <p className="text-[13px] font-medium text-text-secondary">{t("points.nextSpinIn", { time: countdownText })}</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />

      {resultIndex !== null && (
        <ResultModal
          points={SPIN_PRIZES[resultIndex].points}
          onDismiss={() => setResultIndex(null)}
        />
      )}

      {showHelp && (
        <HelpModal title={t("points.spinScreenTitle")} message={t("points.spinHelpMessage")} onDismiss={() => setShowHelp(false)} />
      )}
    </div>
  );
}

function GlowingDots() {
  const dots = Array.from({ length: 24 });
  return (
    <div className="absolute" style={{ width: 1, height: 1 }}>
      {dots.map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 6,
            height: 6,
            backgroundColor: i % 2 === 0 ? "var(--color-brand-yellow)" : "var(--color-brand-red)",
            boxShadow: `0 0 8px ${i % 2 === 0 ? "var(--color-brand-yellow)" : "var(--color-brand-red)"}`,
            transform: `rotate(${i * 15}deg) translateY(${-(WHEEL_SIZE + 30) / 2}px)`,
            animation: `wheel-twinkle 2.5s ease-in-out infinite`,
            animationDelay: `${i * 0.28}s`,
          }}
        />
      ))}
    </div>
  );
}

function SpinPulses() {
  const rings = [0, 1, 2];
  return (
    <>
      {rings.map((i) => (
        <div
          key={i}
          className="absolute rounded-full border-[4px] blur-[1.5px]"
          style={
            {
              borderColor: "var(--color-brand-yellow)",
              animation: "wheel-spin-pulse 1.43s linear infinite",
              animationDelay: `${i * 0.476}s`,
              "--wheel-pulse-max": `${RING_SIZE}px`,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}

function ResultModal({ points, onDismiss }: { points: number | undefined; onDismiss: () => void }) {
  const t = useT();
  const isWin = points !== undefined;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-10" onClick={onDismiss}>
      <div className="flex flex-col items-center gap-3.5 rounded-[28px] bg-card p-7 text-center" onClick={(e) => e.stopPropagation()}>
        {isWin ? (
          <svg width="56" height="56" viewBox="0 0 24 24" fill="var(--color-brand-yellow)" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="var(--color-brand-yellow)" />
            <path d="M13 6 7 13h4l-1 6 7-9h-4l1-4Z" fill="#ffffff" />
          </svg>
        ) : (
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth={1.5} aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12a4 4 0 0 1 6.9-2.8M16 12a4 4 0 0 1-6.9 2.8" strokeLinecap="round" />
          </svg>
        )}
        <p className="text-[22px] font-black text-text-primary">{isWin ? t("points.youWonTitle") : t("points.tryAgainTitle")}</p>
        <p className="text-[15px] font-medium text-text-secondary">
          {isWin ? t("points.youWonPoints", { amount: points.toLocaleString() }) : t("points.tryAgainMessage")}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-1 w-full rounded-full py-3.5 text-base font-bold text-white"
          style={{ backgroundColor: "var(--color-brand-red)" }}
        >
          {t("points.awesome")}
        </button>
      </div>
    </div>
  );
}

function HelpModal({ title, message, onDismiss }: { title: string; message: string; onDismiss: () => void }) {
  const t = useT();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-10" onClick={onDismiss}>
      <div className="flex flex-col gap-3 rounded-2xl bg-card p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <p className="text-lg font-bold text-text-primary">{title}</p>
        <p className="text-sm text-text-secondary">{message}</p>
        <button type="button" onClick={onDismiss} className="mt-1 rounded-full py-2.5 font-bold text-white" style={{ backgroundColor: "var(--color-brand-red)" }}>
          {t("common.ok")}
        </button>
      </div>
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

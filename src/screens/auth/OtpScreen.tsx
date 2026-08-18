import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BackButton } from "../../components/ui/BackButton";
import { MChajaLogo } from "../../components/ui/MChajaLogo";
import { PillButton } from "../../components/ui/PillButton";
import { ElectricBorder } from "../../components/ElectricBorder";
import { ElectricConnector } from "../../components/ElectricConnector";
import { hashNoise } from "../../lib/electricBorder";
import { MockApi, MockApiInvalidCodeError } from "../../lib/mockApi";
import type { User } from "../../lib/models";
import { useT } from "../../lib/i18n";

const DIGIT_COUNT = 4;
const MAX_RESEND_ATTEMPTS = 3;
const RESEND_COOLDOWN_S = 30;
const BOX_WIDTH_MAX = 60;
const BOX_WIDTH_MIN = 52;
const BOX_GAP = 14;
const BOX_HORIZONTAL_RESERVED_PX = 48; // screen's px-6 padding, both sides
const BOX_ASPECT_RATIO = 64 / 60;

/** Shrinks the OTP boxes just enough to fit the narrowest phones (~320px)
 *  without overflowing — same pattern as SpinScreen's responsive wheel. */
function useResponsiveBoxWidth(): number {
  const [boxWidth, setBoxWidth] = useState(BOX_WIDTH_MAX);

  useEffect(() => {
    function measure() {
      const available = window.innerWidth - BOX_HORIZONTAL_RESERVED_PX - BOX_GAP * (DIGIT_COUNT - 1);
      const fitted = Math.floor(available / DIGIT_COUNT);
      setBoxWidth(Math.max(BOX_WIDTH_MIN, Math.min(BOX_WIDTH_MAX, fitted)));
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  return boxWidth;
}

interface OtpScreenProps {
  phone: string;
  onVerified: (user: User) => void;
  onBack: () => void;
}

/** Ported from OtpView.swift / OtpScreen.kt — see spec §4/§5. */
export function OtpScreen({ phone, onVerified, onBack }: OtpScreenProps) {
  const t = useT();
  const boxWidth = useResponsiveBoxWidth();
  const boxHeight = Math.round(boxWidth * BOX_ASPECT_RATIO);
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [sparkIndex, setSparkIndex] = useState<number | null>(null);
  const [pulse, setPulse] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  function handleCodeChange(raw: string) {
    const filtered = raw.replace(/\D/g, "").slice(0, DIGIT_COUNT);
    if (filtered.length > code.length) {
      const newDigitIndex = filtered.length - 1;
      setSparkIndex(newDigitIndex);
      setTimeout(() => setSparkIndex((i) => (i === newDigitIndex ? null : i)), 350);
    }
    setCode(filtered);
    if (filtered.length === DIGIT_COUNT) {
      inputRef.current?.blur();
      setPulse(true);
      setTimeout(() => setPulse(false), 550);
    }
  }

  async function handleVerify() {
    inputRef.current?.blur();
    setError(null);
    setIsVerifying(true);
    try {
      const user = await MockApi.verifyOtp(phone, code);
      setIsVerifying(false);
      setIsSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onVerified(user);
    } catch (err) {
      setError(err instanceof MockApiInvalidCodeError ? err.message : "Something went wrong. Try again.");
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resendAttempts >= MAX_RESEND_ATTEMPTS) return;
    await MockApi.requestOtp(phone);
    setResendAttempts((n) => n + 1);
    setCooldown(RESEND_COOLDOWN_S);
  }

  return (
    <div className="flex h-full min-h-dvh flex-col bg-brand-red">
      <div className="px-6 pt-4">
        <BackButton tint="#ffffff" onClick={onBack} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="mb-8">
          <MChajaLogo height={56} variant="white" />
        </div>

        <h1 className="text-[28px] font-bold transition-colors duration-300" style={{ color: isSuccess ? "var(--color-brand-yellow)" : "#ffffff" }}>
          {isSuccess ? t("auth.otpVerifiedTitle") : t("auth.otpTitle")}
        </h1>
        <p className="pb-2 text-base text-white">
          {isSuccess ? t("auth.otpVerifiedSubtitle") : t("auth.otpSubtitle", { phone })}
        </p>

        <div className="relative py-1" style={{ width: boxWidth * DIGIT_COUNT + BOX_GAP * (DIGIT_COUNT - 1), height: boxHeight }}>
          <div
            className="flex items-center justify-center transition-all duration-500"
            style={{ opacity: isSuccess ? 0 : 1, transform: isSuccess ? "scale(0.8)" : "scale(1)" }}
            onClick={() => inputRef.current?.focus()}
          >
            <input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              className="absolute h-px w-px opacity-0"
              aria-label={t("auth.otpTitle")}
            />
            <div className="flex items-center">
              {Array.from({ length: DIGIT_COUNT }).map((_, i) => (
                <div key={i} className="flex items-center">
                  <OtpDigitBox
                    digit={i < code.length ? code[i] : undefined}
                    isActive={i === code.length && isInputFocused}
                    showSpark={sparkIndex === i}
                    pulse={pulse}
                    seedBase={i * 97}
                    boxWidth={boxWidth}
                    boxHeight={boxHeight}
                  />
                  {i < DIGIT_COUNT - 1 && (
                    <div style={{ width: BOX_GAP, height: 16 }}>
                      {code.length === DIGIT_COUNT && <ElectricConnector color="var(--color-brand-yellow)" seedBase={i * 53} />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {isSuccess && (
            <div className="absolute inset-0 flex items-center justify-center">
              <OtpSuccessBadge />
            </div>
          )}
        </div>

        {error && <p className="text-white">{error}</p>}

        {!isSuccess ? (
          <>
            <div className="w-full pt-2">
              <PillButton
                label={t("auth.verify")}
                backgroundColor="var(--color-brand-yellow)"
                textColor="#ffffff"
                fontSize={20}
                disabled={code.length !== DIGIT_COUNT}
                loading={isVerifying}
                onClick={handleVerify}
              />
            </div>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resendAttempts >= MAX_RESEND_ATTEMPTS}
              className="pt-2 font-semibold text-white disabled:opacity-40"
            >
              {cooldown > 0 ? t("auth.resendIn", { seconds: String(cooldown) }) : t("auth.resend")}
            </button>
          </>
        ) : (
          <div className="flex items-center gap-1.5 pt-2 font-semibold" style={{ color: "var(--color-brand-yellow)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.4-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4Z" />
            </svg>
            {t("auth.verifiedAndSecure")}
          </div>
        )}
      </div>

      <p className="px-10 pb-4 text-center text-xs font-semibold text-white/70">
        By verifying you agree to the{" "}
        <Link to="/profile/terms" className="underline">
          Terms, Conditions
        </Link>{" "}
        &amp;{" "}
        <Link to="/profile/privacy" className="underline">
          Privacy Policy
        </Link>{" "}
        of M-Chaja™.
      </p>
    </div>
  );
}

interface OtpDigitBoxProps {
  digit: string | undefined;
  isActive: boolean;
  showSpark: boolean;
  pulse: boolean;
  seedBase: number;
  boxWidth: number;
  boxHeight: number;
}

function OtpDigitBox({ digit, isActive, showSpark, pulse, seedBase, boxWidth, boxHeight }: OtpDigitBoxProps) {
  const isFilled = digit !== undefined;
  return (
    <div
      className="relative flex items-center justify-center rounded-2xl transition-transform duration-150"
      style={{
        width: boxWidth,
        height: boxHeight,
        backgroundColor: "rgba(255,255,255,0.06)",
        border: `1px solid ${isFilled ? "rgba(251,185,33,0.4)" : `rgba(255,255,255,${isActive ? 0.9 : 0.35})`}`,
        transform: isFilled && pulse ? "scale(1.06)" : "scale(1)",
        boxShadow: isFilled ? `0 0 ${14 + (pulse ? 10 : 0)}px rgba(251,185,33,${0.5 + (pulse ? 0.3 : 0)})` : "none",
      }}
    >
      {isFilled && <ElectricBorder width={boxWidth} height={boxHeight} cornerRadius={16} color="var(--color-brand-yellow)" seedBase={seedBase} />}
      {digit !== undefined && <span className="text-2xl font-semibold text-white">{digit}</span>}
      {showSpark && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="#ffffff"
          className="absolute -top-8 animate-[spark_0.15s_ease-in-out]"
          style={{ filter: "drop-shadow(0 0 6px var(--color-brand-yellow))" }}
          aria-hidden="true"
        >
          <path d="M13 2 3 14h6l-1 8 11-13h-6l1-7Z" />
        </svg>
      )}
    </div>
  );
}

function OtpSuccessBadge() {
  const [checkIn, setCheckIn] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setCheckIn(true), 150);
    setShowParticles(true);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      className="relative flex items-center justify-center rounded-[20px]"
      style={{ width: 84, height: 84, backgroundColor: "rgba(255,255,255,0.06)", boxShadow: "0 0 22px rgba(251,185,33,0.7)" }}
    >
      <ElectricBorder width={84} height={84} cornerRadius={20} color="var(--color-brand-yellow)" seedBase={211} />
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-500 ease-out"
        style={{ opacity: checkIn ? 1 : 0, transform: checkIn ? "scale(1)" : "scale(0.4)" }}
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
      {showParticles && <OtpParticleBurst color="var(--color-brand-yellow)" />}
    </div>
  );
}

function OtpParticleBurst({ color }: { color: string }) {
  const particleCount = 8;
  return (
    <>
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = i * (360 / particleCount) + hashNoise(i, 7) * 20;
        return <OtpParticle key={i} color={color} angle={angle} delay={i * 0.02} />;
      })}
    </>
  );
}

function OtpParticle({ color, angle, delay }: { color: string; angle: number; delay: number }) {
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const start = setTimeout(() => setProgress(1), delay * 1000);
    const fade = setTimeout(() => setOpacity(0), (delay + 0.25) * 1000);
    return () => {
      clearTimeout(start);
      clearTimeout(fade);
    };
  }, [delay]);

  const distance = 50;
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians) * distance * progress;
  const y = Math.sin(radians) * distance * progress;

  return (
    <div
      className="absolute rounded-full transition-all ease-out"
      style={{
        width: 2,
        height: 10,
        backgroundColor: "#ffffff",
        boxShadow: `0 0 5px ${color}`,
        transform: `translate(${x}px, ${y}px) rotate(${angle + 90}deg)`,
        opacity,
        transitionDuration: "550ms, 300ms",
        transitionProperty: "transform, opacity",
      }}
    />
  );
}

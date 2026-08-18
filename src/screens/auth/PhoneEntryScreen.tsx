import { useState } from "react";
import { BackButton } from "../../components/ui/BackButton";
import { MChajaLogo } from "../../components/ui/MChajaLogo";
import { PillButton } from "../../components/ui/PillButton";
import { MockApi } from "../../lib/mockApi";
import { useT } from "../../lib/i18n";

const COUNTRY_CODE = "+255";

interface PhoneEntryScreenProps {
  onContinue: (fullNumber: string) => void;
  onBack: () => void;
}

/** Ported from PhoneEntryView.swift / PhoneEntryScreen.kt — see spec §5. */
export function PhoneEntryScreen({ onContinue, onBack }: PhoneEntryScreenProps) {
  const t = useT();
  const [localNumber, setLocalNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = localNumber.length === 9 && (localNumber[0] === "6" || localNumber[0] === "7");

  function handleChange(raw: string) {
    setLocalNumber(raw.replace(/\D/g, "").slice(0, 9));
  }

  async function handleContinue() {
    if (!isValid) {
      setError("Enter a valid Tanzanian phone number.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    const fullNumber = `${COUNTRY_CODE}${localNumber}`;
    await MockApi.requestOtp(fullNumber);
    setIsSubmitting(false);
    onContinue(fullNumber);
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

        <h1 className="text-[28px] font-bold text-white">{t("auth.phoneTitle")}</h1>
        <p className="pb-2 text-base text-white">{t("auth.phoneSubtitle")}</p>

        <div className="flex w-full items-center gap-2 rounded-2xl border border-white px-3.5 py-3">
          <span className="font-semibold text-white">{COUNTRY_CODE}</span>
          <input
            type="tel"
            inputMode="numeric"
            value={localNumber}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={t("auth.phonePlaceholder")}
            className="w-full bg-transparent text-white placeholder-white/70 outline-none"
          />
        </div>

        {error && <p className="text-white">{error}</p>}

        <div className="w-full pt-2">
          <PillButton
            label={t("auth.continue")}
            backgroundColor="var(--color-brand-yellow)"
            textColor="#ffffff"
            fontSize={20}
            disabled={!isValid}
            loading={isSubmitting}
            onClick={handleContinue}
          />
        </div>
      </div>

      <div className="px-6 pb-4 text-center text-xs font-semibold text-white/70">
        <p>©2026 M-Chaja™. All Rights &amp; Trademark Reserved</p>
        <p>A Product of BANG Digital</p>
      </div>
    </div>
  );
}

import { useState, type ReactNode } from "react";
import { PillButton } from "../components/ui/PillButton";
import { useT } from "../lib/i18n";

interface Slide {
  titleKey: string;
  bodyKey: string;
  icon: ReactNode;
}

const iconProps = { width: 88, height: 88, viewBox: "0 0 24 24", fill: "none", stroke: "var(--color-brand-red)", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const slides: Slide[] = [
  {
    titleKey: "onboarding.title1",
    bodyKey: "onboarding.body1",
    icon: (
      <svg {...iconProps} aria-hidden="true">
        <path d="M12 22s7-7.58 7-12.5A7 7 0 0 0 5 9.5C5 14.42 12 22 12 22Z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </svg>
    ),
  },
  {
    titleKey: "onboarding.title2",
    bodyKey: "onboarding.body2",
    icon: (
      <svg {...iconProps} aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" />
      </svg>
    ),
  },
  {
    titleKey: "onboarding.title3",
    bodyKey: "onboarding.body3",
    icon: (
      <svg {...iconProps} aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
      </svg>
    ),
  },
];

interface OnboardingScreenProps {
  onFinished: () => void;
}

export function OnboardingScreen({ onFinished }: OnboardingScreenProps) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const isLast = index === slides.length - 1;

  return (
    <div className="flex h-full min-h-dvh flex-col bg-background">
      <div className="flex justify-end px-2 pt-2">
        {!isLast && (
          <button type="button" onClick={onFinished} className="p-4 text-text-secondary">
            {t("onboarding.skip")}
          </button>
        )}
        {isLast && <div className="p-4 opacity-0">{t("onboarding.skip")}</div>}
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.titleKey} className="flex h-full w-full shrink-0 flex-col items-center justify-center gap-6 px-8 text-center">
              {slide.icon}
              <h1 className="text-[26px] font-bold text-text-primary">{t(slide.titleKey)}</h1>
              <p className="text-base text-text-secondary">{t(slide.bodyKey)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 pb-6">
        {slides.map((slide, i) => (
          <span
            key={slide.titleKey}
            className="h-2 rounded-full transition-all"
            style={{ width: i === index ? 20 : 8, backgroundColor: i === index ? "var(--color-brand-red)" : "var(--color-border)" }}
          />
        ))}
      </div>

      <div className="px-6 pb-6">
        <PillButton
          label={isLast ? t("onboarding.getStarted") : t("onboarding.next")}
          onClick={() => (isLast ? onFinished() : setIndex((i) => i + 1))}
        />
      </div>
    </div>
  );
}

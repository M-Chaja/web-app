import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../../components/ui/BackButton";
import { useT } from "../../lib/i18n";

const FAQ_COUNT = 10;

/** Ported from FAQView.swift — one-question-expanded-at-a-time accordion. */
export function FAQScreen() {
  const t = useT();
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="flex h-full min-h-dvh flex-col bg-background px-5 pb-10 pt-5">
      <div className="relative flex items-center justify-center pb-4">
        <div className="absolute left-0">
          <BackButton onClick={() => navigate(-1)} />
        </div>
        <p className="text-lg font-bold text-text-primary">{t("faq.title")}</p>
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: FAQ_COUNT }, (_, i) => i + 1).map((n) => {
          const isExpanded = expandedIndex === n;
          return (
            <div key={n} className="overflow-hidden rounded-2xl">
              <button
                type="button"
                onClick={() => setExpandedIndex(isExpanded ? null : n)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
                style={{ backgroundColor: "var(--color-brand-red)" }}
              >
                <span className="text-[15px] font-bold text-white">
                  {n}. {t(`faq.q${n}`)}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-brand-yellow)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 transition-transform"
                  style={{ transform: isExpanded ? "rotate(90deg)" : "none" }}
                  aria-hidden="true"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
              {isExpanded && <p className="bg-subtle p-4 text-sm text-text-primary">{t(`faq.a${n}`)}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

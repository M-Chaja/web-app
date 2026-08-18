import { useNavigate } from "react-router-dom";
import { BackButton } from "../../components/ui/BackButton";
import { LANGUAGES, languageStore, useLanguage } from "../../lib/i18n";

/** Ported from ChooseLanguageView.swift — 16-language picker. */
export function LanguageScreen() {
  const navigate = useNavigate();
  const activeLanguage = useLanguage();

  return (
    <div className="flex h-full min-h-dvh flex-col bg-background px-5 pb-10 pt-5">
      <div className="relative flex items-center justify-center pb-3">
        <div className="absolute left-0">
          <BackButton onClick={() => navigate(-1)} />
        </div>
        <p className="text-lg font-bold text-text-primary">Choose Language</p>
      </div>

      <div className="flex flex-col">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => {
              languageStore.set(lang.code);
              navigate(-1);
            }}
            className="flex items-center gap-3 border-b border-border py-4 text-left last:border-b-0"
          >
            <span className="text-2xl">{lang.flagEmoji}</span>
            <span className="flex-1 text-[17px] text-text-primary">{lang.displayName}</span>
            {activeLanguage === lang.code && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-red)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

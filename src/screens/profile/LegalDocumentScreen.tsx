import { useNavigate } from "react-router-dom";
import { BackButton } from "../../components/ui/BackButton";
import { LEGAL_EFFECTIVE_DATE, type LegalBlock } from "../../lib/legalContent";
import { useT } from "../../lib/i18n";

interface LegalDocumentScreenProps {
  title: string;
  blocks: LegalBlock[];
}

/**
 * Shared renderer for Terms of Service and Privacy Policy — ported from
 * LegalDocumentView.swift. Terms and Privacy are distinct documents (see
 * legalContent.ts); each route passes its own block list. Fixed header
 * (back + title + effective date) above a scrolling block list, matching
 * the shape (if not the letter) of spec §7 rule 2.
 */
export function LegalDocumentScreen({ title, blocks }: LegalDocumentScreenProps) {
  const t = useT();
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-dvh flex-col bg-background">
      <div className="relative flex flex-col items-center gap-0.5 bg-card px-5 pb-4 pt-5 shadow-sm">
        <div className="absolute left-5 top-5">
          <BackButton onClick={() => navigate(-1)} />
        </div>
        <p className="text-lg font-bold text-text-primary">{title}</p>
        <p className="text-xs font-semibold text-text-secondary">{t("legal.effectiveDate", { date: LEGAL_EFFECTIVE_DATE })}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-14 pt-4">
        <div className="flex flex-col gap-3">
          {blocks.map((block, i) => (
            <LegalBlockView key={i} block={block} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LegalBlockView({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case "heading":
      return <p className="pt-2 text-[17px] font-bold text-text-primary">{block.text}</p>;
    case "subheading":
      return <p className="text-[15px] font-semibold text-text-primary">{block.text}</p>;
    case "body":
      return <p className="text-sm text-text-primary">{block.text}</p>;
    case "bullet":
      return (
        <div className="flex items-start gap-2 text-sm text-text-primary">
          <span>•</span>
          <span>{block.text}</span>
        </div>
      );
    case "divider":
      return <hr className="my-1 border-border" />;
  }
}

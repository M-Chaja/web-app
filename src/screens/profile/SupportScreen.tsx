import { useNavigate } from "react-router-dom";
import { BackButton } from "../../components/ui/BackButton";
import { MChajaContact } from "../../lib/contact";
import { useT } from "../../lib/i18n";

/** Ported from SupportView.swift — real contact details, see lib/contact.ts. */
export function SupportScreen() {
  const t = useT();
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-dvh flex-col gap-5 bg-background px-6 pb-10 pt-5">
      <div className="relative flex items-center justify-center">
        <div className="absolute left-0">
          <BackButton onClick={() => navigate(-1)} />
        </div>
        <p className="text-lg font-bold text-text-primary">{t("support.title")}</p>
      </div>

      <p className="text-text-secondary">{t("support.description")}</p>

      <div className="overflow-hidden rounded-2xl" style={{ backgroundColor: "var(--color-brand-red)" }}>
        <ContactRow icon={<PhoneIcon />} title={t("support.callUs")} subtitle={MChajaContact.phoneDisplay} href={MChajaContact.telUrl} />
        <RowDivider />
        <ContactRow icon={<WhatsAppIcon />} title={t("support.chatWhatsApp")} subtitle={MChajaContact.phoneDisplay} href={MChajaContact.whatsAppUrl} />
        <RowDivider />
        <ContactRow icon={<EmailIcon />} title={t("support.emailUs")} subtitle={MChajaContact.email} href={MChajaContact.mailUrl} />
      </div>

      <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-bold text-text-secondary">{t("support.visitUs")}</p>
        <div className="flex flex-col text-[15px] text-text-primary">
          <span className="font-bold">{MChajaContact.companyName}</span>
          <span>{MChajaContact.addressLine1}</span>
          <span>{MChajaContact.addressLine2}</span>
        </div>
        <a
          href={MChajaContact.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-full py-3.5 text-[15px] font-semibold text-white"
          style={{ backgroundColor: "var(--color-brand-red)" }}
        >
          {t("support.getDirections")}
        </a>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold text-text-secondary">{t("support.followUs")}</p>
        <div className="flex gap-3.5">
          <SocialBadge href={MChajaContact.instagramUrl} icon={<InstagramIcon />} label="Instagram" />
          <SocialBadge href={MChajaContact.xUrl} icon={<XIcon />} label="X" />
          <SocialBadge href={MChajaContact.facebookUrl} icon={<FacebookIcon />} label="Facebook" />
          <SocialBadge href={MChajaContact.linkedInUrl} icon={<LinkedInIcon />} label="LinkedIn" />
        </div>
      </div>
    </div>
  );
}

function RowDivider() {
  return <div className="h-px bg-white/15" />;
}

function ContactRow({ icon, title, subtitle, href }: { icon: React.ReactNode; title: string; subtitle: string; href: string }) {
  return (
    <a href={href} className="flex items-center gap-3 p-4">
      <span className="shrink-0" style={{ color: "var(--color-brand-yellow)" }}>
        {icon}
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="font-semibold text-white">{title}</span>
        <span className="text-[13px] text-white/80">{subtitle}</span>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-yellow)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="ml-auto shrink-0" aria-hidden="true">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </a>
  );
}

function SocialBadge({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full"
      style={{ backgroundColor: "var(--color-brand-red)", color: "var(--color-brand-yellow)" }}
    >
      {icon}
    </a>
  );
}

const ICON = { width: 18, height: 18, viewBox: "0 0 24 24", "aria-hidden": true as const };

function PhoneIcon() {
  return (
    <svg {...ICON} fill="currentColor">
      <path d="M6.6 10.8c1.4 2.7 3.9 5.2 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 8 8 0 0 0 2.6.42 1 1 0 0 1 1 1V19.6a1 1 0 0 1-1 1A15.6 15.6 0 0 1 3.4 5.6a1 1 0 0 1 1-1H7.6a1 1 0 0 1 1 1 8 8 0 0 0 .42 2.6 1 1 0 0 1-.24 1L6.6 10.8Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg {...ICON} fill="currentColor">
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Zm4.9 12.7c-.2.6-1.2 1.1-1.7 1.2-.5.1-1 .1-3.3-.9-2.6-1.1-4.3-3.8-4.5-4-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.6.7 1.9.8 2 .1.2.1.4 0 .6-.5.9-.9.9-.5 1.6.9 1.4 1.7 2 3 2.6.2.1.4.1.5-.1.2-.2.7-.8.9-1.1.2-.2.4-.2.6-.1.2.1 1.5.7 1.8.9.3.1.5.2.5.3.1.2.1.7-.1 1.3Z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg {...ICON} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg {...ICON} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg {...ICON} fill="currentColor">
      <path d="M4 4l16 16M20 4 4 20" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" fill="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg {...ICON} fill="currentColor">
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.3 1.4-1.3h1.5V5.4c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.1H8.4v2.8h2.4V21h2.7Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg {...ICON} fill="currentColor">
      <path d="M6.9 8.6H4V20h2.9V8.6ZM5.5 4a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4ZM20 13.6c0-3-1.6-4.4-3.8-4.4-1.7 0-2.5 1-2.9 1.6V8.6H10.4c0 .8 0 11.4 0 11.4h2.9v-6.4c0-.3 0-.7.1-1 .3-.7.9-1.4 2-1.4 1.4 0 2 1.1 2 2.6V20H20v-6.4Z" />
    </svg>
  );
}

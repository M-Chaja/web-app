// Ported from MChajaContact.swift — single source of truth for M-Chaja's real
// contact details, used anywhere the app shows a support phone/email/address.
const phoneE164 = "+255758215514";
const whatsAppDigits = "255758215514";
const fullAddress = "M-Chaja, Amani 42, Central Business District, Dar es Salaam, Tanzania";

export const MChajaContact = {
  companyName: "M-Chaja",
  addressLine1: "Amani 42, Central Business District",
  addressLine2: "Dar es Salaam, Tanzania",
  phoneDisplay: "+255 758 215 514",
  email: "support@m-chaja.com",
  instagramUrl: "https://instagram.com/unachaji",
  xUrl: "https://x.com/unachaji",
  facebookUrl: "https://facebook.com/unachaji",
  linkedInUrl: "https://linkedin.com/company/m-chaja/",
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`,
  whatsAppUrl: `https://wa.me/${whatsAppDigits}`,
  telUrl: `tel:${phoneE164}`,
  mailUrl: "mailto:support@m-chaja.com",
};

// Ported from Strings.swift / LocalizationManager.swift — see
// M-Chaja_Web_App_Port_Spec.md §8. English is fully ported below (verbatim,
// same keys/values). The other 15 languages (sw, yo, fr, ar, de, zh, hi, es,
// ru, tr, pt, it, pl, ur, ja) are lower-priority per the spec's build order
// (§10 step 7, "do last") and are NOT yet ported — `t()` falls back to
// English for any key missing in the active language, exactly like the
// native `LocalizationManager.t()`, so the app is fully functional in
// English today and gains languages incrementally without code changes
// beyond filling in each dictionary from the corresponding `Strings.swift`
// block.
import { PersistentStore, useStore } from "./store";

export type AppLanguage =
  | "en"
  | "sw"
  | "yo"
  | "fr"
  | "ar"
  | "de"
  | "zh"
  | "hi"
  | "es"
  | "ru"
  | "tr"
  | "pt"
  | "it"
  | "pl"
  | "ur"
  | "ja";

export const LANGUAGES: { code: AppLanguage; displayName: string; flagEmoji: string }[] = [
  { code: "en", displayName: "English", flagEmoji: "🇬🇧" },
  { code: "sw", displayName: "Swahili", flagEmoji: "🇹🇿" },
  { code: "yo", displayName: "Yoruba", flagEmoji: "🇳🇬" },
  { code: "fr", displayName: "French", flagEmoji: "🇫🇷" },
  { code: "ar", displayName: "Arabic", flagEmoji: "🇸🇦" },
  { code: "de", displayName: "German", flagEmoji: "🇩🇪" },
  { code: "zh", displayName: "Mandarin", flagEmoji: "🇨🇳" },
  { code: "hi", displayName: "Hindi", flagEmoji: "🇮🇳" },
  { code: "es", displayName: "Spanish", flagEmoji: "🇪🇸" },
  { code: "ru", displayName: "Russian", flagEmoji: "🇷🇺" },
  { code: "tr", displayName: "Turkish", flagEmoji: "🇹🇷" },
  { code: "pt", displayName: "Portuguese", flagEmoji: "🇵🇹" },
  { code: "it", displayName: "Italian", flagEmoji: "🇮🇹" },
  { code: "pl", displayName: "Polish", flagEmoji: "🇵🇱" },
  { code: "ur", displayName: "Urdu", flagEmoji: "🇵🇰" },
  { code: "ja", displayName: "Japanese", flagEmoji: "🇯🇵" },
];

/** Arabic and Urdu are RTL — the app root sets `dir` from this. */
export const RTL_LANGUAGES: ReadonlySet<AppLanguage> = new Set(["ar", "ur"]);

const en: Record<string, string> = {
  "onboarding.title1": "Find a station",
  "onboarding.body1": "See every M-Chaja power bank station on the map, with live availability.",
  "onboarding.title2": "Scan and go",
  "onboarding.body2": "Scan the QR code on the cabinet to unlock a power bank instantly.",
  "onboarding.title3": "Return anywhere",
  "onboarding.body3": "Return your power bank to any M-Chaja station when you're done.",
  "onboarding.getStarted": "Get started",
  "onboarding.next": "Next",
  "onboarding.skip": "Skip",

  "auth.phoneTitle": "Enter your phone number",
  "auth.phoneSubtitle": "We'll send you a one-time code to verify",
  "auth.phonePlaceholder": "e.g. 712 345 678",
  "auth.continue": "Continue",
  "auth.otpTitle": "Enter the code",
  "auth.otpSubtitle": "We sent a 4-digit code to {{phone}}",
  "auth.verify": "Verify",
  "auth.resend": "Resend code",
  "auth.resendIn": "Resend in {{seconds}}s",
  "auth.otpVerifiedTitle": "Verified Successfully",
  "auth.otpVerifiedSubtitle": "Your phone number has been verified",
  "auth.verifiedAndSecure": "Verified and secure",

  "home.title": "Stations",
  "home.mapView": "Map",
  "home.listView": "List",
  "home.nearestFirst": "Nearest first",
  "home.available": "{{count}} available",
  "home.unavailable": "None available",
  "home.nearbyStations": "Nearby stations",
  "home.noListingsMatch": "No listings match your search.",
  "home.searchPlaceholder": "Search available listings",

  "station.getDirections": "Get directions",
  "station.scanToRent": "Scan to rent",
  "station.powerBanksAvailable": "{{total}} Powerbanks · {{available}} Available",
  "station.open": "Open",
  "station.full": "Full",
  "station.openNow": "Open now",
  "station.slotsSummary": "{{total}} Powerbanks · {{available}} Available",
  "station.operatingMode": "Operating mode",
  "station.everyday": "Everyday",
  "station.support": "Support",
  "station.setRoute": "Set a route",
  "station.scanQRCode": "Scan QR Code",
  "station.notFound": "Station not found.",
  "station.cabinet": "Cabinet",
  "station.cabinetBig": "Big cabinet",
  "station.cabinetSmall": "Small cabinet",
  "station.slots": "slots",
  "station.pricePerHour": "TZS 1,000/hr",

  "wallet.title": "Wallet",
  "wallet.balance": "Balance",
  "wallet.topUp": "Top up",
  "wallet.withdraw": "Withdraw",
  "wallet.history": "Transaction history",
  "wallet.minimumDepositNotice": "A minimum top-up of TZS {{amount}} is required before you can rent a power bank.",
  "wallet.availableBalance": "Available balance",
  "wallet.transactions": "Transactions",
  "wallet.viewAll": "View all",
  "wallet.noTransactionsToday": "No transactions today.",
  "wallet.today": "Today",
  "wallet.yesterday": "Yesterday",
  "wallet.noTransactionsYet": "No transactions yet.",

  "rental.activeTitle": "Active rental",
  "rental.duration": "Duration",
  "rental.accruedCharge": "Accrued charge",
  "rental.cancel": "Cancel",
  "rental.help": "Help",
  "rental.unreturnedWarning": "This power bank hasn't been returned yet. Charges are still accruing.",
  "rental.batteryLevel": "Battery level",
  "rental.unreturnedWarningHours":
    "This power bank hasn't been returned in over {{hours}} hours. Charges keep accruing hourly until it's returned.",
  "rental.returnedIt": "I've returned it",
  "rental.endConfirmTitle": "End this rental as if the cabinet confirmed return?",
  "rental.endRental": "End rental",
  "rental.historyTitle": "Rental history",
  "rental.inProgressTapToView": "Rental in progress at {{station}} — tap to view",
  "rental.noPastRentals": "No past rentals yet.",
  "rental.inProgress": "In progress",
  "rental.inProgressBadge": "Rental In Progress",
  "rental.countdown": "Countdown",
  "rental.totalCharge": "Total Charge",

  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.ok": "OK",

  "scan.unlockingCabinet": "Unlocking cabinet…",
  "scan.pointCamera": "Point your camera at the cabinet's QR code",
  "scan.noCameraSimulate": "No camera? Tap a station to simulate its QR code",
  "scan.unrecognizedCode": "That QR code isn't a recognized M-Chaja cabinet.",
  "scan.balanceTooLow": "Your wallet balance is too low to start a rental. Top up first.",

  "support.title": "Help & Support",
  "support.description": "Having trouble with a rental, a faulty power bank, or a payment? Reach us directly.",
  "support.chatWhatsApp": "Chat on WhatsApp",
  "support.call": "Call {{phone}}",
  "support.callUs": "Call Us",
  "support.emailUs": "Email Us",
  "support.visitUs": "Visit Us",
  "support.getDirections": "Get Directions",
  "support.followUs": "Follow Us",

  "points.greetingMorning": "Good Morning",
  "points.greetingAfternoon": "Good Afternoon",
  "points.greetingEvening": "Good Evening",
  "points.youHave": "You have",
  "points.chajaPointsLabel": "Chaja Points",
  "points.earnPointsTitle": "Earn Points",
  "points.earnPointsSubtitle": "Watch daily videos and win Chaja Points",
  "points.chajaPointsButton": "Chaja Points",
  "points.spinWinTitle": "Spin & Win",
  "points.spinWinSubtitle": "Play and stand a chance to win Prizes",
  "points.playWinButton": "Play & Win",
  "points.watchVideosTitle": "Watch Videos",
  "points.watchVideosSubtitle": "Watch daily videos and win Chaja Points",
  "points.watchEarnButton": "Watch & Earn",
  "points.spinScreenTitle": "Spin",
  "points.spinTheWheel": "SPIN THE WHEEL",
  "points.spinSubtitle": "Spin to win Chaja Points!",
  "points.clickToSpin": "Click to Spin",
  "points.spinning": "Spinning…",
  "points.spinsLeft": "{{count}} spins left this hour",
  "points.nextSpinIn": "Next spin in {{time}}",
  "points.youWonTitle": "You Won!",
  "points.youWonPoints": "You won {{amount}} Chaja Points!",
  "points.tryAgainTitle": "So Close!",
  "points.tryAgainMessage": "Try again on your next spin.",
  "points.spinHelpMessage": "Spin the wheel up to 5 times every hour to win Chaja Points. Come back after the cooldown for more spins!",
  "points.awesome": "Awesome!",
  "points.tryAgainPrize": "Try Again",
  "points.watchScreenTitle": "Watch & Earn",
  "points.watchSubtitle": "Watch an Advert and earn Chaja Points",
  "points.watchVideoButton": "Watch Video",
  "points.videosLeft": "{{count}} videos left this hour",
  "points.nextVideoIn": "Next video in {{time}}",
  "points.pointsPerVideo": "{{amount}} points per video",
  "points.youEarnedPoints": "You earned {{amount}} Chaja Points!",
  "points.watchHelpMessage": "Watch up to 10 short videos every hour to earn 500 Chaja Points each. Come back after the cooldown for more videos!",
  "points.adUnavailableTitle": "Ad Unavailable",
  "points.adUnavailableMessage": "No ad is available right now. Please try again in a moment.",

  "profile.title": "Profile",
  "profile.language": "Language",
  "profile.biometricLogin": "Biometric login",
  "profile.logout": "Log out",
  "profile.support": "Help & Support",
  "profile.terms": "Terms & Privacy",
  "profile.notifications": "Notifications",
  "profile.allowLocations": "Allow Locations",
  "profile.darkMode": "Dark mode",
  "profile.biometricLock": "Biometric Lock",
  "profile.faq": "FAQ",
  "profile.termsOfService": "Terms of Service",
  "profile.privacyPolicy": "Privacy Policy",

  "nav.home": "Home",
  "nav.wallet": "Wallet",
  "nav.activity": "Activity",
  "nav.points": "Points",

  "legal.effectiveDate": "Effective Date: {{date}}",

  "faq.title": "FAQs",
  "faq.q1": "What is M-Chaja?",
  "faq.a1":
    "M-Chaja is a portable power bank rental service that lets you rent a fully charged power bank from any M-Chaja station and return it to any participating station when you're done.",
  "faq.q2": "How do I rent a power bank?",
  "faq.a2":
    "Simply: download the M-Chaja app, sign up or log in, find a nearby M-Chaja station, scan the station's QR code, complete payment (if required) and collect your power bank.",
  "faq.q3": "Which devices can I charge?",
  "faq.a3":
    "M-Chaja power banks support most smartphones, tablets, and USB-powered devices. They include built-in charging cables for popular connectors such as USB-C, Lightning, and Micro USB.",
  "faq.q4": "Where can I return power bank?",
  "faq.a4": "You can return your rented power bank to any available M-Chaja station, not just the station where you rented it.",
  "faq.q5": "How much does it cost?",
  "faq.a5":
    "Rental charges depend on the pricing plan displayed in the M-Chaja app before you start your rental. Any applicable deposits or late fees will also be shown clearly.",
  "faq.q6": "What if I return power bank late?",
  "faq.a6":
    "If you exceed the rental period, additional charges may apply according to M-Chaja's pricing policy. You can always check your active rental details in the app.",
  "faq.q7": "Power bank isn't charging my device?",
  "faq.a7":
    "First, ensure the charging cable is properly connected and your device is compatible. If the issue persists, return the power bank to the nearest station and contact M-Chaja Customer Support through the app.",
  "faq.q8": "What if I lose the power bank?",
  "faq.a8":
    "Please contact M-Chaja Customer Support immediately. Lost or damaged power banks may incur a replacement or damage fee in accordance with our Terms of Service.",
  "faq.q9": "Is my payment info secure?",
  "faq.a9": "Yes. M-Chaja uses secure payment technologies to protect your transactions and personal information.",
  "faq.q10": "How can I contact Support?",
  "faq.a10":
    "You can reach us directly through the Help & Support section in the M-Chaja app or via our official customer support channels listed on our website and social media pages.",
};

// TODO: port the remaining 15 language dictionaries verbatim from
// Strings.swift (see spec §8) — each is the same key set as `en` above.
const dictionaries: Partial<Record<AppLanguage, Record<string, string>>> = { en };

export const languageStore = new PersistentStore<AppLanguage>("app_language", "en");

export function translate(key: string, args?: Record<string, string>): string {
  const lang = languageStore.get();
  const table = dictionaries[lang] ?? {};
  let value = table[key] ?? en[key] ?? key;
  if (args) {
    for (const [argKey, argValue] of Object.entries(args)) {
      value = value.replaceAll(`{{${argKey}}}`, argValue);
    }
  }
  return value;
}

export function useLanguage(): AppLanguage {
  return useStore(languageStore);
}

/** `t()` — reactive to the active language (subscribes via `useLanguage`, so
 *  any component using it re-renders when the language changes). */
export function useT(): (key: string, args?: Record<string, string>) => string {
  useLanguage();
  return translate;
}

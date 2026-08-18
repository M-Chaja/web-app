# M-Chaja Web App — Port Specification

**Purpose of this document:** a self-contained brief for Claude Code to build a new
**web app** at **`app.m-chaja.com`** that ports the existing native iOS/Android M-Chaja
apps to the browser, in full feature and visual parity. This is a **new codebase** — do
not try to run this inside the existing iOS/Android projects.

Read this whole document before writing code. It tells you *what* to build, *where* to
find the exact reference behavior in the native source, and *what decisions have already
been made* so you don't need to re-derive them.

---

## 1. What you're building

An installable web app, **gated to mobile browsers only** (see §11 — read that section
early, it affects the app shell) that lets a customer: sign up/log in by phone + OTP,
find and rent a power bank from a nearby M-Chaja station, track an active rental, manage
their wallet, view rental history, and earn Chaja Points via a daily spin wheel and
rewarded ad videos — matching the native apps' features, visual design, and signature
"electric lightning" interaction language. Full feature parity with the native apps is
the goal (all 21 screens in §5), not a reduced/lightweight subset.

**Deployment target — two separate subdomains (decided, do not revisit):**

```
app.m-chaja.com          -> this customer web app (its own, independent deployment)
admin.m-chaja.com/       -> admin dashboard
admin.m-chaja.com/api/*  -> NestJS backend API
```

This app is a **fully standalone deployment**, not sharing a host/process with the
backend or admin dashboard (those two live together at `admin.m-chaja.com`, per
`M-Chaja_Admin_Backend_Build_Spec.md` — that document originally claimed
`app.m-chaja.com` for the backend+admin; it has since been corrected to
`admin.m-chaja.com` to make room for this customer app at `app.m-chaja.com`, so re-read
that spec's Hosting & Deployment section if it looks stale). Recommend **Vercel** for
this app (zero-config for a Vite or Next.js static/SPA build, trivial custom-domain
setup for `app.m-chaja.com`) — confirm with the user if a different host is preferred,
but nothing about this app's architecture requires colocating with the backend's Render
service anymore.

Because this is now independent, this app is free to call the backend as a normal
cross-origin API at `https://admin.m-chaja.com/api/*` once real endpoints exist (CORS
needs to be configured on the backend to allow `app.m-chaja.com` as an origin) — while
still mocked (§2), it makes no network calls to that host at all.

Do not re-litigate this domain split without updating both this document and
`M-Chaja_Admin_Backend_Build_Spec.md` together — they were made consistent with each
other deliberately; don't let them drift.

---

## 2. Current state of the source apps — read this before porting anything

The iOS and Android apps live in this same repo root:
- iOS: `m-chaja ios/MChaja/` (SwiftUI)
- Android: `m-chaja android/app/src/main/java/com/bang/mchaja/` (Jetpack Compose)

**Full session history and every non-obvious decision made while building them is
documented in [`M-Chaja_App_Progress_Status.md`](./M-Chaja_App_Progress_Status.md) —
read that file too.** It explains things the code alone won't (why a bug happened, why a
color changed, why an effect is implemented the way it is).

**Critical fact carried over from the native apps: there is no live backend yet.** Both
apps run entirely against local mock data layers (`MockAPI.swift` / `MockApi.kt`) with
artificial network delays. **Build the web app the same way** — a mocked data layer
first, matching the same shapes and behavior described below, so the web app reaches
full UI/UX parity before anyone wires it to the real NestJS backend. Do not invent a
different mock strategy; port the existing one (see §6).

---

## 3. Recommended tech stack

- **Framework: Vite + React + TypeScript + React Router**, deployed as its own app
  (Vercel or similar — see §1, no longer constrained to sharing a process with the
  backend). Rationale: this app is entirely client-driven — authenticated, app-like,
  no content/SEO need — so Next.js's SSR/App Router machinery buys nothing here that a
  plain SPA with client-side routing (`/station/:id` etc.) doesn't already give you more
  simply. If you have a strong reason to prefer Next.js once building starts (e.g. team
  familiarity), that's a reasonable substitution — it's not load-bearing for anything
  else in this spec — just don't let it reintroduce a dependency on sharing a host
  process with the backend.
- **Styling:** Tailwind CSS, with design tokens (colors, spacing) matching §7 exactly —
  do not eyeball colors from screenshots, use the hex values given.
- **State:** React Context + hooks for session/mock-API state (mirrors the native apps'
  simple `ObservableObject`/mutable-state-holder pattern — no need for Redux/Zustand at
  this scale).
- **Maps:** Google Maps JavaScript API (`@vis.gl/react-google-maps` or
  `@react-google-maps/api`) — matches Android's Google Maps usage, and a Google Maps key
  already exists for this project (see Build Spec) so reuse it rather than introducing
  Mapbox.
- **QR scanning:** `getUserMedia` + a browser QR-decode library (e.g. `jsQR` or
  `@zxing/browser` — ZXing matches what Android already uses via ML Kit, keeping the
  detection behavior conceptually aligned).
- **Video:** native HTML `<video>` element for the splash sting and any rewarded-ad
  placeholder — no library needed.
- **i18n:** `next-intl` or a lightweight custom dictionary loader — port the *exact* 16
  language dictionaries described in §8, do not re-translate from scratch.
- **PWA:** add a manifest + service worker (installable, works offline for static shell)
  once core functionality is done — not a day-one requirement, but design the app shell
  so it's easy to add later (avoid hard blockers like SSR-only data fetching on every
  route).

If you disagree with any of the above based on constraints you discover during setup,
that's fine — but these are the defaults to start from, chosen for consistency with the
rest of the M-Chaja codebase, not arbitrarily.

---

## 4. Design system — colors, type, and platform parity rules

Port colors **exactly** (hex, not approximated):

| Token | Light | Dark |
|---|---|---|
| Brand red | `#ED2024` | (same, no dark variant) |
| Brand yellow | `#FBB921` | (same) |
| Success green | `#2EA55F` | (same) |
| Text primary | `#1A1A1A` | `#F5F5F5` |
| Text secondary | `#6B6B6B` | `#A0A0A0` |
| Background | `#F7F7F7` | `#121212` |
| Card background | `#FFFFFF` | `#1E1E1E` |
| Subtle background | `#F0F0F0` | `#2A2A2A` |
| Border | `#E5E5E5` | `#2C2C2C` |

Dark mode is a **user-toggled setting** stored in session state (see §6), not just a
`prefers-color-scheme` media query — build a real light/dark toggle in Profile settings
that the whole app reacts to, same as both native apps.

**Both native apps are built in strict platform parity** — every feature/screen looks and
behaves identically on iOS and Android. Treat the web app as a third parity target: when
in doubt about a detail, check both `MChaja/Screens/X` and `ui/screens/x/X.kt` for the
same screen; if they agree, that's the spec.

### Signature interaction: the "electric lightning" effect

Several screens use a distinctive **crackling, hand-drawn-lightning border** effect —
this is a brand signature, not incidental decoration, and should be ported faithfully:

- **How it works** (identical technique on both native platforms): sample points evenly
  around a shape's perimeter (rounded-rect or circle), offset each point outward/inward
  by a small deterministic hash-noise value, redraw on a fast tick (~80ms), layer 2–3
  stroke passes (wide/blurred outer glow, mid glow, bright core) to fake a glow without
  relying on actual blur filters.
- **Where it appears:**
  - OTP entry screen: each filled digit box gets this border; small lightning connectors
    bridge boxes once all 4 are filled; on success, the boxes merge into one badge with
    the same border in brand yellow, a spring-in checkmark, and a radial particle burst.
    Reference: `Screens/Auth/OtpView.swift`, `ui/screens/auth/OtpScreen.kt`.
  - Spin & Win wheel: the wheel's outer rim uses this border continuously; while spinning,
    repeating rings pulse outward from the center hub to the rim (electricity radiating
    from the center). Reference: `Screens/Points/SpinWheelView.swift`,
    `ui/screens/points/SpinScreen.kt`.
- **Web implementation approach:** an SVG `<path>` (or Canvas 2D) redrawn via
  `requestAnimationFrame` throttled to ~80ms steps, using the same jittered-perimeter
  algorithm (a seeded pseudo-random hash function of `(pointIndex, tick)`, not
  `Math.random()`, so it's reproducible/testable) — do not substitute a generic CSS glow
  or box-shadow animation, it reads as visually different and loses the "crackle."

### Splash

On native, cold launch plays the **M-Chaja Logo Sting** video full-bleed with sound,
immediately after an unavoidable OS-level blank-color frame (a native-only constraint —
on web there's no equivalent blank frame, so just play the video on load). Source video
lives at `m-chaja ios/MChaja/Resources/MChajaLogoSting.mp4` and
`m-chaja android/app/src/main/res/raw/mchaja_logo_sting.mp4` — reuse this asset. Muted
autoplay is the web-safe default (browsers block unmuted autoplay); consider a
tap-to-unmute affordance or just accept muted-on-load for web, since forcing sound isn't
reliably possible without a user gesture in any browser.

---

## 5. Full screen / route inventory

Every screen below exists on both native apps (file paths given for both). Port all of
them — this is the complete app, not a subset.

| Web route (suggested) | Screen | iOS reference | Android reference |
|---|---|---|---|
| `/onboarding` | 3-slide intro carousel | `Screens/Onboarding/OnboardingView.swift` | `ui/screens/onboarding/OnboardingScreen.kt` |
| `/signup` | Phone number entry | `Screens/Auth/PhoneEntryView.swift` | `ui/screens/auth/PhoneEntryScreen.kt` |
| `/signup/otp` | 4-digit OTP + lightning effect | `Screens/Auth/OtpView.swift` | `ui/screens/auth/OtpScreen.kt` |
| `/lock` | Biometric/PIN re-entry lock screen (web: session-timeout re-auth, no biometric — see §9) | `Screens/Auth/LockScreenView.swift` | `ui/screens/auth/LockScreen.kt` |
| `/` or `/home` | Map + station list (floating cards / expandable search sheet) | `Screens/Home/HomeView.swift` | `ui/screens/home/HomeScreen.kt` |
| `/station/[id]` | Station detail (hours, support, directions, scan-to-rent) | `Screens/Home/StationDetailView.swift` | `ui/screens/home/StationDetailScreen.kt` |
| `/scan` | QR scanner (camera) to start a rental | `Screens/Rental/QRScannerView.swift`, `QRCameraView.swift` | `ui/screens/rental/QRScannerScreen.kt` |
| `/rental/active/[id]` | Active rental tracker (live elapsed time + accruing charge) | `Screens/Rental/ActiveRentalView.swift` | `ui/screens/rental/ActiveRentalScreen.kt` |
| `/activity` | Rental history (fixed header + scrolling list — see §6) | `Screens/Rental/RentalHistoryView.swift` | `ui/screens/rental/RentalHistoryScreen.kt` |
| `/wallet` | Wallet balance, top-up/withdraw, today's transactions (fixed header + scrolling list) | `Screens/Wallet/WalletView.swift` | `ui/screens/wallet/WalletScreen.kt` |
| `/wallet/history` | Full transaction history | `Screens/Wallet/TransactionHistoryView.swift` | `ui/screens/wallet/TransactionHistoryScreen.kt` |
| `/points` | Chaja Points hub (spin + watch entry points, balance) | `Screens/Points/ChajaPointsView.swift` | `ui/screens/points/PointsScreen.kt` |
| `/points/spin` | Spin & Win wheel | `Screens/Points/SpinWheelView.swift` | `ui/screens/points/SpinScreen.kt` |
| `/points/watch` | Watch & Earn rewarded video | `Screens/Points/WatchVideosView.swift` | `ui/screens/points/WatchVideosScreen.kt` |
| `/profile` | Profile menu (settings, language, biometric toggle, logout) | `Screens/Profile/ProfileView.swift` | `ui/screens/profile/ProfileScreen.kt` |
| `/profile/edit` | Edit profile (name, photo, NIDA number, etc.) | `Screens/Profile/ProfileEditView.swift` | `ui/screens/profile/ProfileEditScreen.kt` |
| `/profile/language` | Language picker (16 languages) | `Screens/Profile/ChooseLanguageView.swift` | `ui/screens/profile/ChooseLanguageScreen.kt` |
| `/profile/faq` | FAQ | `Screens/Profile/FAQView.swift` | `ui/screens/profile/FAQScreen.kt` |
| `/profile/support` | Support / contact | `Screens/Profile/SupportView.swift` | `ui/screens/profile/SupportScreen.kt` |
| `/profile/terms` | Terms of Service | `Screens/Profile/TermsView.swift` | `ui/screens/profile/TermsScreen.kt` |
| `/profile/privacy` | Privacy Policy | `Screens/Profile/PrivacyPolicyView.swift` | `ui/screens/profile/PrivacyPolicyScreen.kt` |

Splash video plays before `/onboarding` on first load (or before `/home` if the mock
session is already "logged in" — see §6 for how session persistence is mocked).

---

## 6. Mock data layer — port this exactly, don't redesign it

Both native apps share one mock data source of truth conceptually
(`MockAPI.swift` / `MockApi.kt` — same shapes, same behavior, ported 1:1 between
platforms already). Port it a third time to TypeScript, preserving:

- **Artificial latency** on every "network" call (`await sleep(600–1200ms)` style),
  so loading states are visible and testable — don't make mock calls instant.
- **In-memory mutation** of a small seed dataset (a handful of stations in Dar es
  Salaam, a wallet balance, a transaction list, a rental history) — no real database,
  no `fetch` calls to anything external.
- **Session state**, persisted to `localStorage` (the web equivalent of
  `UserDefaults`/`SharedPreferences` the native apps use), including:
  - `user: User | null`, `hasCompletedOnboarding: boolean`, `darkModeEnabled: boolean`
  - `chajaPoints: number`
  - Spin rate limit: 5 spins/hour, tracked via a window-start timestamp +
    count-in-window (see `spinsUsedInWindow`/`spinWindowStart` in `AppSession.swift`) —
    **"Try Again" wheel results don't count against the limit**, only spins that award
    points do (a deliberate rule added this session — see progress doc §4).
  - Watch-video rate limit: 10 videos/hour, same window-tracking pattern.
  - `activeRental: Rental | null` — derived (first rental with `status === "active"`),
    not a separate stored field.

### Data models (TypeScript, derived from the native models)

```ts
type CabinetType = "small" | "big";

interface Station {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  availableCount: number;
  totalSlots: number;
  distanceLabel?: string;
  photos: string[];
  operatingHours: string;
  supportPhone: string;
  cabinetType: CabinetType;
  locationImageName: string;
}

interface User {
  id: string;
  phoneNumber: string;
  name: string;
  fullName: string;
  handle: string;
  email: string;
  nidaNumber: string;
  driversLicense: string;
  photoDataUrl?: string;
}

type WalletTransactionType = "top_up" | "rental_charge" | "withdrawal";

interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  amountTzs: number; // negative for charges/withdrawals, positive for top-ups
  createdAt: string; // ISO date
  description: string;
}

type RentalStatus = "active" | "completed";

interface Rental {
  id: string;
  stationId: string;
  stationName: string;
  status: RentalStatus;
  startedAt: string; // ISO date
  endedAt?: string;
  totalChargedTzs?: number;
  batteryPercent?: number;
}
```

### Billing rule (port exactly)

```ts
const HOURLY_RATE_TZS = 1000;
const MINIMUM_DEPOSIT_TZS = 5000;

function chargeForDuration(durationMs: number): number {
  const hours = Math.max(1, Math.ceil(durationMs / 3_600_000));
  return hours * HOURLY_RATE_TZS;
}
```

A user needs at least `MINIMUM_DEPOSIT_TZS` (5,000 TZS) wallet balance before they're
allowed to start a rental — both native apps show a "minimum top-up required" notice on
the wallet card when balance is below this; port that notice.

### Spin wheel prize table (port exactly, including weights)

| Points | Weight |
|---|---|
| 50 | 26 |
| 100 | 22 |
| 500 | 16 |
| 1,000 | 14 |
| 2,000 | 8 |
| 5,000 | 3 |
| 10,000 | 1 |
| "Try Again" (no points) | 10 |

Weighted random selection: pick a random float in `[0, totalWeight)`, walk the table
subtracting each weight until it goes negative — see `weightedRandomIndex()` in either
`SpinWheelView.swift` or `SpinScreen.kt` for the exact algorithm.

---

## 7. Rules discovered/fixed this session — carry these into the web port

These aren't obvious from a first read of the native code; they were bugs found and
fixed during development. Build the web version correctly the first time:

1. **Rental gating**: while `activeRental` is non-null, the user must not be able to
   start a second rental from anywhere in the app. This means: all station cards on
   `/home` render at 50% opacity with their "Scan to rent" button disabled, all map pins
   turn grey instead of red, the top-bar scan icon is disabled, and the station detail
   page's scan button is disabled. Enforce this at every single scan entry point, not
   just one.
2. **Wallet & Rental History scroll behavior**: on both screens, only the *list* content
   scrolls — the page title (and, on Wallet, the balance card + "Transactions" section
   header) stays fixed/pinned above the scrollable list. Do not put the whole page in one
   scroll container.
3. **Spin wheel "Try Again" doesn't consume a spin** — only a spin that lands on a points
   prize counts against the 5-per-hour allowance.
4. **OTP success state uses brand yellow, not green** — even though the original design
   reference used green for a "verified" checkmark state, this app's success state is
   yellow, to stay consistent with the app's red/yellow-only palette (no green appears
   anywhere else in the UI except the wallet's `success` token for positive transaction
   amounts — that one stays green).
5. **Logout must return the user to `/signup` with no way back** into authenticated
   screens (no back-button/history-state leak to Profile or Home). On web, this means
   clearing session state and using `router.replace()` (not `push()`) to `/signup`, and
   ideally clearing/replacing browser history so the back button doesn't reveal stale
   authenticated content.

---

## 8. Localization

Both apps support **16 languages**: English (`en`), Swahili (`sw`), Yoruba (`yo`),
French (`fr`), Arabic (`ar`), German (`de`), Chinese (`zh`), Hindi (`hi`), Spanish (`es`),
Russian (`ru`), Turkish (`tr`), Portuguese (`pt`), Italian (`it`), Polish (`pl`),
Urdu (`ur`), Japanese (`ja`).

Every UI string is a flat `"key.path": "value"` dictionary per language (see
`Localization/Strings.swift` — a `[String: String]` dictionary per language, with
`{{placeholder}}` interpolation, e.g. `"wallet.minimumDepositNotice": "A minimum top-up
of TZS {{amount}} is required before..."`). **Port all 16 dictionaries verbatim** —
these are already professionally-shaped translation strings, not placeholders; do not
regenerate or re-translate them. Arabic and Urdu are RTL languages — make sure the web
layout actually mirrors for RTL (native apps get this for free from the OS; on web you
need `dir="rtl"` on the root element and layout that respects logical properties, not
just flipped text).

---

## 9. What's native-only — don't port literally, find a web equivalent (or skip)

- **Biometric login (Face ID / fingerprint)**: no direct web equivalent at the same
  trust level. Either skip entirely for web (session stays unlocked while the tab is
  open, matching a "remember me" pattern) or use WebAuthn/passkeys as a stretch goal —
  don't try to fake a Face ID prompt in the browser.
  - Note: `LockScreenView.swift`/`LockScreen.kt` model a native lock screen while the app
    is minimized. On web this is a session-timeout re-auth (e.g. after N minutes idle) —
    build this if desired, low priority for v1.
- **Google Mobile Ads SDK rewarded video (Watch & Earn)**: this is a real, live ad SDK
  integration on native (see progress doc §3), not a mock. There is no direct web
  equivalent that plays the same way — Google AdSense/Ad Manager rewarded web formats
  exist but are a **separate integration decision**, not a drop-in port. For the initial
  web build, mock this screen the same way the native "Watch to Win" *thumbnail card*
  looks (reuse the same "Watch & Earn" asset), but have the "watch" action either show a
  placeholder video or be disabled with a "coming soon" state — do not wire a real ad SDK
  without explicit direction, since it requires its own AdSense/Ad Manager account setup
  the same way AdMob did for native.
- **Native camera QR scanning**: has a direct web equivalent (`getUserMedia` + a JS
  decoder, see §3) — this one *does* port, just via different underlying APIs.
- **Push notifications** (APNs/FCM on native): use Web Push if/when notifications are
  needed — not a day-one requirement per the native apps' current feature set (neither
  app has push wired up yet either, based on the codebase).

---

## 10. Suggested build order

1. **Project setup**: Next.js + TypeScript + Tailwind, design tokens from §4, base layout
   shell (mobile-first, works up to desktop width — this is a phone-shaped app that
   should still look intentional on a wide browser window, not just stretched).
2. **Mock data layer**: port `MockAPI`/`MockApi` + `AppSession` to TypeScript per §6,
   with a `localStorage`-backed session hook. Get this right first — every screen depends
   on it.
3. **Auth flow**: onboarding → phone entry → OTP (with the lightning effect, §4) →
   home. This is the first true end-to-end path and validates the mock session layer.
4. **Home + map + station detail + QR scan + active rental**: the core rental loop.
5. **Wallet + rental history**: including the fixed-header/scrolling-list behavior
   (§7.2) and rental-gating (§7.1).
6. **Points hub + Spin wheel (with lightning effect) + Watch & Earn**: the
   points/engagement loop.
7. **Profile + settings + language switcher + legal pages**: lower priority, do last.
8. **Splash video, dark mode polish, RTL verification, responsive pass, PWA manifest.**

At each phase, cross-check both the iOS and Android reference files for that screen (not
just one) — where they agree, that's the spec to follow exactly.

---

## 11. Mobile-only device gating (decided — implement this before/alongside §10 step 1)

`app.m-chaja.com` **only runs the app on mobile browsers.** Desktop and tablet visitors
must not see or be able to use the app UI at all — signup, deposit, and starting a
rental are mobile-only actions by design (this mirrors the native apps' own reason for
existing: OTP/SMS verification and QR-camera-scanning a physical cabinet are
phone-native concerns).

**On desktop/tablet, show a static "use your phone" screen instead of the app** — no
router, no app shell, no mock-data initialization. Concretely:

- Detect mobile at the top of `App.tsx` (or a wrapper one level above the router) using
  a **viewport-width check** (e.g. `window.innerWidth <= 768`) combined with a
  **user-agent check** (`/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)`) — use
  both, not just one: width alone false-positives on a narrowed desktop browser window,
  user-agent alone false-positives on a desktop-mode toggle. Re-check on `resize` (a
  user rotating a tablet or resizing shouldn't require a reload to re-evaluate).
- When not mobile: render a simple branded screen (M-Chaja logo, brand red background,
  a short message — "M-Chaja is designed for mobile. Open this link on your phone to
  sign up, top up your wallet, and rent a power bank.") and **stop there** — don't mount
  the router, don't touch `MockApi`/`AppSession`, don't run the splash video.
- When mobile: proceed with the normal app (splash → onboarding → router) exactly as
  the rest of this document describes.
- This is a **hard gate for the whole app**, not a per-screen concern — implement it
  once, at the root, not scattered across individual routes.

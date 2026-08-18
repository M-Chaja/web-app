# M-Chaja Web

The customer-facing M-Chaja web app — deployed at `app.m-chaja.com`. A port of the
native iOS/Android apps (see `M-Chaja_Web_App_Port_Spec.md` for the full spec), gated
to mobile browsers only. Vite + React + TypeScript + React Router + Tailwind CSS v4,
against a mocked API layer (`src/lib/mockApi.ts`) until the real backend at
`admin.m-chaja.com/api/*` is live.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in VITE_GOOGLE_MAPS_API_KEY
npm run dev
```

The app only renders past the splash/onboarding on a real mobile browser or viewport +
user-agent — see `src/hooks/useIsMobile.ts` and `src/components/DesktopBlockedScreen.tsx`.
Desktop shows a static "use your phone" screen instead of the app.

## Build

```bash
npm run build      # tsc -b && vite build, output in dist/
npm run preview    # serve the production build locally
```

## Deployment (Vercel)

This app is a fully standalone deployment — it does not share a host or process with
the admin dashboard / backend at `admin.m-chaja.com`.

1. Push this repo to GitHub, import it in the Vercel dashboard (framework preset: Vite).
2. Set the `VITE_GOOGLE_MAPS_API_KEY` environment variable in the Vercel project
   settings (see `.env.example`) — do not commit the real key.
3. Attach the `app.m-chaja.com` custom domain in the Vercel project's Domains settings,
   then point its DNS at Vercel per Vercel's instructions.
4. In Google Cloud Console, add `app.m-chaja.com/*` (and any Vercel preview domains you
   want maps to work on) to the Maps JS API key's HTTP referrer allowlist — without
   this the map silently falls back to a static placeholder (see
   `src/components/map/PlaceholderMapLayer.tsx` / `MapErrorBoundary.tsx`).

`vercel.json` already handles the SPA rewrite (`/* -> /index.html`) this app needs
since routing is client-side (React Router) — without it, deep links like
`/wallet` would 404 on refresh.

Once the real backend exists, requests to `https://admin.m-chaja.com/api/*` will need
CORS configured there to allow `app.m-chaja.com` as an origin.

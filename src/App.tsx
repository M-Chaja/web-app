import { useEffect, useState, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { DesktopBlockedScreen } from "./components/DesktopBlockedScreen";
import { MainTabLayout } from "./components/MainTabLayout";
import { useIsMobile } from "./hooks/useIsMobile";
import { SplashScreen } from "./screens/SplashScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { PhoneEntryScreen } from "./screens/auth/PhoneEntryScreen";
import { OtpScreen } from "./screens/auth/OtpScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { StationDetailScreen } from "./screens/StationDetailScreen";
import { ScanScreen } from "./screens/ScanScreen";
import { ActiveRentalScreen } from "./screens/ActiveRentalScreen";
import { WalletScreen } from "./screens/WalletScreen";
import { TransactionHistoryScreen } from "./screens/TransactionHistoryScreen";
import { RentalHistoryScreen } from "./screens/RentalHistoryScreen";
import { PointsScreen } from "./screens/PointsScreen";
import { SpinScreen } from "./screens/SpinScreen";
import { WatchEarnScreen } from "./screens/WatchEarnScreen";
import { ProfileScreen } from "./screens/profile/ProfileScreen";
import { ProfileEditScreen } from "./screens/profile/ProfileEditScreen";
import { LanguageScreen } from "./screens/profile/LanguageScreen";
import { FAQScreen } from "./screens/profile/FAQScreen";
import { SupportScreen } from "./screens/profile/SupportScreen";
import { LegalDocumentScreen } from "./screens/profile/LegalDocumentScreen";
import { AppSession, useHasCompletedOnboarding, useIsLoggedIn, useDarkMode } from "./lib/session";
import { RTL_LANGUAGES, useLanguage, useT } from "./lib/i18n";
import { privacyBlocksEn, termsBlocksEn } from "./lib/legalContent";

/** Shared guard for every screen past the auth flow — redirects to /signup
 *  instead of repeating the isLoggedIn check per route. */
function RequireAuth({ children }: { children: ReactNode }) {
  const isLoggedIn = useIsLoggedIn();
  if (!isLoggedIn) return <Navigate to="/signup" replace />;
  return children;
}

/** Launching the app always lands on the home map, whether or not the user is
 *  logged in — login only happens when an action actually requires it (see
 *  RequireAuth below and the "Scan to Rent" flow's returnTo state). */
function RootRedirect() {
  const hasCompletedOnboarding = useHasCompletedOnboarding();
  if (!hasCompletedOnboarding) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/home" replace />;
}

function OnboardingRoute() {
  const navigate = useNavigate();
  return (
    <OnboardingScreen
      onFinished={() => {
        AppSession.hasCompletedOnboarding.set(true);
        navigate("/home", { replace: true });
      }}
    />
  );
}

function PhoneEntryRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
  return (
    <PhoneEntryScreen
      onContinue={(fullNumber) => navigate("/signup/otp", { state: { phone: fullNumber, returnTo } })}
      onBack={() => navigate(-1)}
    />
  );
}

function OtpRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { phone?: string; returnTo?: string } | null;
  const phone = state?.phone;
  const returnTo = state?.returnTo;

  if (!phone) return <Navigate to="/signup" replace />;

  return (
    <OtpScreen
      phone={phone}
      onBack={() => navigate(-1)}
      onVerified={(user) => {
        AppSession.login(user);
        navigate(returnTo ?? "/home", { replace: true });
      }}
    />
  );
}


function TermsRoute() {
  const t = useT();
  return <LegalDocumentScreen title={t("profile.termsOfService")} blocks={termsBlocksEn} />;
}

function PrivacyRoute() {
  const t = useT();
  return <LegalDocumentScreen title={t("profile.privacyPolicy")} blocks={privacyBlocksEn} />;
}

/** Applies the user-toggled dark-mode class and RTL direction to <html> — see
 *  spec §4 (dark mode is a session setting, not a `prefers-color-scheme` media
 *  query) and §8 (Arabic/Urdu are RTL). */
function ThemeEffects() {
  const isDarkMode = useDarkMode();
  const language = useLanguage();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.dir = RTL_LANGUAGES.has(language) ? "rtl" : "ltr";
  }, [language]);

  return null;
}

function MobileApp() {
  const [isSplashDone, setIsSplashDone] = useState(false);

  if (!isSplashDone) {
    return <SplashScreen onFinished={() => setIsSplashDone(true)} />;
  }

  return (
    <BrowserRouter>
      <ThemeEffects />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/onboarding" element={<OnboardingRoute />} />
        <Route path="/signup" element={<PhoneEntryRoute />} />
        <Route path="/signup/otp" element={<OtpRoute />} />
        {/* Home is public — see RootRedirect above. The other three tabs
            carry personal financial/points data, so they stay gated
            individually while still sharing the tab layout with Home. */}
        <Route element={<MainTabLayout />}>
          <Route path="/home" element={<HomeScreen />} />
          <Route
            path="/wallet"
            element={
              <RequireAuth>
                <WalletScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/activity"
            element={
              <RequireAuth>
                <RentalHistoryScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/points"
            element={
              <RequireAuth>
                <PointsScreen />
              </RequireAuth>
            }
          />
        </Route>
        <Route
          path="/wallet/history"
          element={
            <RequireAuth>
              <TransactionHistoryScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/points/spin"
          element={
            <RequireAuth>
              <SpinScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/points/watch"
          element={
            <RequireAuth>
              <WatchEarnScreen />
            </RequireAuth>
          }
        />
        {/* Public: the cabinet's physical QR code encodes this URL directly,
            so scanning it with the phone's camera (outside the app) must
            load the station's details before the user is ever logged in. */}
        <Route path="/station/:id" element={<StationDetailScreen />} />
        <Route
          path="/scan"
          element={
            <RequireAuth>
              <ScanScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/rental/active/:id"
          element={
            <RequireAuth>
              <ActiveRentalScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfileScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <RequireAuth>
              <ProfileEditScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/profile/language"
          element={
            <RequireAuth>
              <LanguageScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/profile/faq"
          element={
            <RequireAuth>
              <FAQScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/profile/support"
          element={
            <RequireAuth>
              <SupportScreen />
            </RequireAuth>
          }
        />
        {/* Public (no RequireAuth): the OTP screen links here before the
            user is logged in ("agree to the Terms & Privacy Policy"), and
            legal pages are conventionally accessible without an account
            anyway. */}
        <Route path="/profile/terms" element={<TermsRoute />} />
        <Route path="/profile/privacy" element={<PrivacyRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Mobile-only device gating (spec §11): desktop/tablet never mounts the
 * router or touches MockApi/AppSession — it only ever sees the static
 * blocked screen below.
 */
function App() {
  const isMobile = useIsMobile();

  return <div className="app-shell">{isMobile ? <MobileApp /> : <DesktopBlockedScreen />}</div>;
}

export default App;

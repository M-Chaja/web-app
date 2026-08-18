// Ported 1:1 from AppSession.swift / AppSession.kt — same field names, same
// rate-limit-window math, same localStorage keys renamed 1:1 from the native
// UserDefaults/SharedPreferences keys. See M-Chaja_Web_App_Port_Spec.md §6.
import { PersistentStore, Store, useStore } from "./store";
import type { User } from "./models";

const MAX_SPINS_PER_WINDOW = 5;
const SPIN_WINDOW_DURATION_MS = 3_600_000;
const MAX_VIDEOS_PER_WINDOW = 10;
const VIDEO_WINDOW_DURATION_MS = 3_600_000;

function jsonStore<T>(key: string, initial: T): PersistentStore<T> {
  return new PersistentStore<T>(key, initial);
}

class AppSessionImpl {
  user = jsonStore<User | null>("current_user", null);
  biometricEnabled = jsonStore<boolean>("biometric_enabled", false);
  /** Whether the current session has passed biometric auth. Irrelevant when
   *  biometricEnabled is false. Not persisted — a fresh tab/session should
   *  re-prompt, matching typical banking-app "app lock" behavior. */
  isUnlocked = new Store<boolean>(!this.biometricEnabled.get());
  hasCompletedOnboarding = jsonStore<boolean>("has_completed_onboarding", false);
  darkModeEnabled = jsonStore<boolean>("dark_mode_enabled", false);
  chajaPoints = jsonStore<number>("chaja_points", 0);

  private spinsUsedInWindow = jsonStore<number>("spins_used_in_window", 0);
  private spinWindowStart = jsonStore<string | null>("spin_window_start", null);

  private videosWatchedInWindow = jsonStore<number>("videos_watched_in_window", 0);
  private videoWindowStart = jsonStore<string | null>("video_window_start", null);

  /** Spins available in the current rolling hour window; resets to the full
   *  allowance once an hour has passed since the window's first spin. */
  spinsRemaining(now: Date = new Date()): number {
    const start = this.spinWindowStart.get();
    if (!start || now.getTime() - new Date(start).getTime() >= SPIN_WINDOW_DURATION_MS) {
      return MAX_SPINS_PER_WINDOW;
    }
    return Math.max(0, MAX_SPINS_PER_WINDOW - this.spinsUsedInWindow.get());
  }

  /** When the next spin unlocks, if the hourly allowance is currently exhausted. */
  nextSpinAvailableAt(now: Date = new Date()): Date | undefined {
    const start = this.spinWindowStart.get();
    if (this.spinsRemaining(now) !== 0 || !start) return undefined;
    return new Date(new Date(start).getTime() + SPIN_WINDOW_DURATION_MS);
  }

  /** Videos available in the current rolling hour window; resets to the full
   *  allowance once an hour has passed since the window's first video. */
  videosRemaining(now: Date = new Date()): number {
    const start = this.videoWindowStart.get();
    if (!start || now.getTime() - new Date(start).getTime() >= VIDEO_WINDOW_DURATION_MS) {
      return MAX_VIDEOS_PER_WINDOW;
    }
    return Math.max(0, MAX_VIDEOS_PER_WINDOW - this.videosWatchedInWindow.get());
  }

  /** When the next video unlocks, if the hourly allowance is currently exhausted. */
  nextVideoAvailableAt(now: Date = new Date()): Date | undefined {
    const start = this.videoWindowStart.get();
    if (this.videosRemaining(now) !== 0 || !start) return undefined;
    return new Date(new Date(start).getTime() + VIDEO_WINDOW_DURATION_MS);
  }

  lock(): void {
    if (!this.biometricEnabled.get()) return;
    this.isUnlocked.set(false);
  }

  addPoints(amount: number): void {
    this.chajaPoints.set((prev) => prev + amount);
  }

  /** Consumes one spin from the current hour window, starting a fresh window
   *  if none is active or the previous one has expired. */
  recordSpin(): void {
    const now = new Date();
    const start = this.spinWindowStart.get();
    if (start && now.getTime() - new Date(start).getTime() < SPIN_WINDOW_DURATION_MS) {
      this.spinsUsedInWindow.set((prev) => prev + 1);
    } else {
      this.spinWindowStart.set(now.toISOString());
      this.spinsUsedInWindow.set(1);
    }
  }

  /** Consumes one video watch from the current hour window, starting a fresh
   *  window if none is active or the previous one has expired. */
  recordVideoWatch(): void {
    const now = new Date();
    const start = this.videoWindowStart.get();
    if (start && now.getTime() - new Date(start).getTime() < VIDEO_WINDOW_DURATION_MS) {
      this.videosWatchedInWindow.set((prev) => prev + 1);
    } else {
      this.videoWindowStart.set(now.toISOString());
      this.videosWatchedInWindow.set(1);
    }
  }

  get isLoggedIn(): boolean {
    return this.user.get() !== null;
  }

  login(user: User): void {
    this.user.set(user);
  }

  logout(): void {
    this.user.set(null);
  }
}

/** Singleton, matching `AppSession.shared` — import and use directly from
 *  anywhere, or via the `useSession*` hooks below inside components. */
export const AppSession = new AppSessionImpl();

export function useSessionUser(): User | null {
  return useStore(AppSession.user);
}

export function useIsLoggedIn(): boolean {
  return useSessionUser() !== null;
}

export function useHasCompletedOnboarding(): boolean {
  return useStore(AppSession.hasCompletedOnboarding);
}

export function useDarkMode(): boolean {
  return useStore(AppSession.darkModeEnabled);
}

export function useChajaPoints(): number {
  return useStore(AppSession.chajaPoints);
}

export function useBiometricEnabled(): boolean {
  return useStore(AppSession.biometricEnabled);
}

export function useIsUnlocked(): boolean {
  return useStore(AppSession.isUnlocked);
}

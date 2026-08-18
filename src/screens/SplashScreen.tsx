import { useEffect, useRef, useState } from "react";

// The sting itself is ~6s. This is a safety net for a genuinely stuck/broken
// video (network failure, codec issue), not the expected exit path — normal
// playback always finishes via onEnded first. It used to be 4000ms, shorter
// than the video itself, which on real devices (slower decode, cellular
// fetch of the 4.5MB file before playback can start) cut the sting off
// partway through every time instead of ever letting it finish naturally.
const FALLBACK_TIMEOUT_MS = 15000;

interface SplashScreenProps {
  onFinished: () => void;
}

/**
 * Plays the M-Chaja logo sting once on cold load — see spec §4/§5. Browsers
 * block unmuted autoplay, so this starts muted with a tap-to-unmute
 * affordance (closest web equivalent to the native apps' sound-on splash).
 * A fallback timer advances past the splash if the video fails to load or
 * play, so a broken video never strands the user on this screen.
 */
export function SplashScreen({ onFinished }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const fallback = setTimeout(onFinished, FALLBACK_TIMEOUT_MS);
    return () => clearTimeout(fallback);
  }, [onFinished]);

  useEffect(() => {
    // Belt-and-suspenders: the `autoPlay` attribute alone is occasionally
    // ignored by mobile browsers (backgrounded-tab restore, some WebView
    // embeddings, low-power mode), so also request playback explicitly once
    // the element exists. A rejected promise here just means autoplay was
    // blocked outright — the muted state / tap-for-sound affordance already
    // covers that, so the failure is intentionally swallowed.
    videoRef.current?.play().catch(() => {});
  }, []);

  function handleUnmute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setIsMuted(false);
  }

  return (
    <div className="relative flex h-full min-h-dvh w-full items-center justify-center bg-brand-red">
      <video
        ref={videoRef}
        src="/splash.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={onFinished}
        onError={onFinished}
        className="h-full w-full object-cover"
      />
      {isMuted && (
        <button
          type="button"
          onClick={handleUnmute}
          className="absolute bottom-8 right-8 flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-sm font-medium text-white backdrop-blur"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3 10v4h4l5 5V5L7 10H3z" />
          </svg>
          Tap for sound
        </button>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";

const MOBILE_MAX_WIDTH = 768;
const MOBILE_USER_AGENT = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i;

/**
 * Mobile-only gating (M-Chaja_Web_App_Port_Spec.md §11): both a viewport-width
 * check AND a user-agent check, combined — width alone false-positives on a
 * narrowed desktop window, user-agent alone false-positives on a desktop-mode
 * toggle. Re-evaluates on resize/orientation change so rotating a tablet or
 * resizing a window doesn't require a reload.
 */
function evaluateIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  const narrowViewport = window.innerWidth <= MOBILE_MAX_WIDTH;
  const mobileUserAgent = MOBILE_USER_AGENT.test(window.navigator.userAgent);
  return narrowViewport && mobileUserAgent;
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(evaluateIsMobile);

  useEffect(() => {
    const handleResize = () => setIsMobile(evaluateIsMobile());
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return isMobile;
}

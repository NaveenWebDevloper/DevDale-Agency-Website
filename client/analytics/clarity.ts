import Clarity from "@microsoft/clarity";

const projectId = import.meta.env.VITE_CLARITY_ID;

/**
 * isClarityReady — checks that Clarity has actually been loaded and
 * window.clarity is a callable function. Ad blockers (uBlock, Brave, etc.)
 * block the Clarity script with ERR_BLOCKED_BY_CLIENT, leaving window.clarity
 * undefined. Without this guard every Clarity.event() call throws a TypeError
 * that propagates up and crashes the React render tree → blank white screen.
 */
const isClarityReady = (): boolean =>
  typeof window !== "undefined" && typeof window.clarity === "function";

/**
 * initializeClarity — Deferred Clarity Init
 *
 * PERF FIX: Clarity's session recorder caused 128ms of forced reflow when
 * initialized at app startup. We now defer it to requestIdleCallback so it
 * runs during browser idle time, well after first paint and interaction.
 */
export const initializeClarity = () => {
  if (!projectId || projectId === "YOUR_CLARITY_PROJECT_ID") {
    if (import.meta.env.DEV) {
      console.warn("Clarity Project ID missing");
    }
    return;
  }

  const init = () => {
    try {
      Clarity.init(projectId);
      // Only call consentV2 if Clarity was successfully initialised
      if (isClarityReady()) {
        Clarity.consentV2();
      }
    } catch (err) {
      // Clarity blocked or unavailable — fail silently so the app still renders
      if (import.meta.env.DEV) {
        console.warn("Clarity init failed (likely blocked by ad-blocker):", err);
      }
    }
  };

  // Defer to idle time — runs after all critical work is done
  if ("requestIdleCallback" in window) {
    requestIdleCallback(init, { timeout: 5000 });
  } else {
    // Safari fallback: delay by 2s
    setTimeout(init, 2000);
  }
};

export const trackClarityEvent = (eventName: string) => {
  if (!projectId || projectId === "YOUR_CLARITY_PROJECT_ID") {
    return;
  }

  // Guard: skip silently if Clarity was blocked or not yet initialised
  if (!isClarityReady()) return;

  try {
    Clarity.event(eventName);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("Clarity.event() failed:", err);
    }
  }
};


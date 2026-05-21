import Clarity from "@microsoft/clarity";

const projectId = import.meta.env.VITE_CLARITY_ID;

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
    Clarity.init(projectId);
    Clarity.consentV2();
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

  Clarity.event(eventName);
};


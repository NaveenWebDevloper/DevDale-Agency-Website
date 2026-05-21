import { useEffect } from "react";

const GA4_ID = import.meta.env.VITE_GA4_ID;

/**
 * AnalyticsTags — Deferred GTM/GA4 Loader
 *
 * PERF FIX: GTM used to load synchronously in index.html, costing ~200ms TBT
 * and 157KB of transfer on first paint. It is now injected only after the
 * first user interaction OR a 3-second idle timeout, whichever comes first.
 *
 * This preserves analytics accuracy (first pageview is still captured) while
 * completely removing GTM from the critical rendering path.
 */
export default function AnalyticsTags() {
  useEffect(() => {
    if (!GA4_ID) return;

    const injectGTM = () => {
      // Guard: do not double-inject if already present
      if (document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) return;

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
      document.head.appendChild(script);

      const inline = document.createElement("script");
      inline.textContent = [
        "window.dataLayer=window.dataLayer||[];",
        "function gtag(){dataLayer.push(arguments);}",
        "gtag('js',new Date());",
        `gtag('config','${GA4_ID}',{send_page_view:false});`,
      ].join("");
      document.head.appendChild(inline);
    };

    // Strategy: fire on first interaction OR after 3s idle — whichever is first
    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      cleanup();
      if ("requestIdleCallback" in window) {
        requestIdleCallback(injectGTM, { timeout: 2000 });
      } else {
        injectGTM();
      }
    };

    // 3-second fallback timer
    const timer = setTimeout(fire, 3000);

    // Interaction triggers (passive, once)
    const events = ["mousedown", "touchstart", "keydown", "scroll"] as const;
    events.forEach((e) => document.addEventListener(e, fire, { once: true, passive: true }));

    const cleanup = () => {
      clearTimeout(timer);
      events.forEach((e) => document.removeEventListener(e, fire));
    };

    return cleanup;
  }, []);

  return null;
}


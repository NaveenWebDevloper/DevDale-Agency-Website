"use client";

import { useEffect, useRef } from "react";

/**
 * SmoothScroll — Lenis + GSAP Unified Ticker
 *
 * PERF FIX: Dynamically loaded to remove GSAP, ScrollTrigger, and Lenis from the critical render path.
 * Syncs virtual scroll with GSAP's requestAnimationFrame ticker.
 */
export const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    let active = true;
    let lenisInst: any = null;
    let tickerCallback: any = null;
    let gsapModule: any = null;

    Promise.all([
      import("lenis"),
      import("gsap"),
      import("gsap/ScrollTrigger")
    ]).then(([LenisM, gsapM, ScrollTriggerM]) => {
      if (!active) return;

      const LenisClass = LenisM.default || LenisM;
      const gsap = gsapM.gsap;
      const ScrollTrigger = ScrollTriggerM.ScrollTrigger;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new LenisClass({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });

      lenisInst = lenis;
      lenisRef.current = lenis;
      if (typeof window !== "undefined") {
        (window as any).lenis = lenis;
      }

      // Sync ScrollTrigger with Lenis virtual scroll position
      lenis.on("scroll", ScrollTrigger.update);

      // Drive Lenis from GSAP's ticker — one unified rAF loop
      tickerCallback = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);

      // Prevent GSAP from skipping frames after tab switch
      gsap.ticker.lagSmoothing(0);
      gsapModule = gsap;
    });

    return () => {
      active = false;
      if (gsapModule && tickerCallback) {
        gsapModule.ticker.remove(tickerCallback);
      }
      if (typeof window !== "undefined") {
        (window as any).lenis = null;
      }
      if (lenisInst) {
        lenisInst.destroy();
      }
    };
  }, []);

  return <>{children}</>;
};



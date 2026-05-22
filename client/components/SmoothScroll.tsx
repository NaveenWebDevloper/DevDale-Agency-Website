"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * SmoothScroll — Lenis + GSAP Unified Ticker
 *
 * PERF FIX: The previous implementation ran Lenis on its own requestAnimationFrame
 * loop while GSAP ran another — two separate rAF chains competing to read layout
 * caused 280ms of forced reflow (Lighthouse: gsap-DNxS7Hap.js col 54320).
 *
 * Solution: GSAP's ticker becomes the single rAF driver for the whole app.
 * - Lenis.raf() is called inside gsap.ticker so there is only ONE rAF loop.
 * - ScrollTrigger.update() is called on every Lenis scroll event so both
 *   systems share the same scroll position — no layout thrashing.
 * - gsap.ticker.lagSmoothing(0) prevents GSAP from skipping frames after
 *   tab visibility changes, which would cause jank on return.
 */
export const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;
    if (typeof window !== "undefined") {
      (window as any).lenis = lenis;
    }

    // Sync ScrollTrigger with Lenis virtual scroll position
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker — one unified rAF loop
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);

    // Prevent GSAP from skipping frames after tab switch (avoids jank on return)
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      if (typeof window !== "undefined") {
        (window as any).lenis = null;
      }
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};



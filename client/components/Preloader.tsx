import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";

interface PreloaderProps {
  onComplete: () => void;
}

const words = ["Innovation", "Architecture", "Precision", "DevDale"];

export default function Preloader({ onComplete }: PreloaderProps) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [exit, setExit] = useState(false);
  const alreadyLoaded = sessionStorage.getItem("devdale_preloader_done") === "true";

  useEffect(() => {
    if (alreadyLoaded) {
      onComplete();
      return;
    }

    // Word cycling logic — 250ms per word (was 600ms) for faster LCP reveal
    if (index < words.length - 1) {
      const timer = setTimeout(() => setIndex(index + 1), 250);
      return () => clearTimeout(timer);
    }

    // Progress counter — 10ms per step × 100 steps = 1s (was 20ms × 100 = 2s)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setExit(true);
            setTimeout(() => {
              sessionStorage.setItem("devdale_preloader_done", "true");
              onComplete();
            }, 800); // Exit animation: 800ms (was 1200ms)
          }, 300); // Hold at 100%: 300ms (was 500ms)
          return 100;
        }
        return prev + 1;
      });
    }, 10); // 10ms per step — aligns with rAF cadence

    return () => clearInterval(interval);
  }, [index, alreadyLoaded, onComplete]);

  if (alreadyLoaded) return null;

  return (
    <AnimatePresence mode="wait">
      {!exit && (
        <m.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-[#080808] flex items-center justify-center overflow-hidden"
          role="status"
          aria-label="Loading TheDevDale"
        >
          {/* Noise overlay for texture */}
          <div className="absolute inset-0 noise opacity-20 pointer-events-none" />

          {/* Staggered Column Background for Exit */}
          <div className="absolute inset-0 flex">
            {[...Array(5)].map((_, i) => (
              <m.div
                key={i}
                initial={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{
                  duration: 1,
                  ease: [0.76, 0, 0.24, 1],
                  delay: i * 0.1,
                }}
                className="flex-1 bg-[#080808] origin-top border-x border-white/[0.02]"
              />
            ))}
          </div>

          {/* Central Content */}
          <div className="relative z-10 flex flex-col items-center min-h-[200px]">
            {/* Animated Word Sequence */}
            <div className="h-20 min-h-[80px] flex items-center justify-center overflow-hidden mb-8">
              <AnimatePresence mode="wait">
                <m.span
                  key={words[index]}
                  initial={{ y: 80, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -80, opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
                  className="text-white text-4xl md:text-7xl font-black uppercase tracking-tighter italic"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {words[index]}
                </m.span>
              </AnimatePresence>
            </div>

            {/* Architectural Grid Lines */}
            <div className="relative w-[300px] md:w-[500px]">
              <m.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, ease: "circOut" }}
                className="h-[1px] w-full bg-white/10"
              />

              {/* Active Progress Bar */}
              <m.div
                className="absolute top-0 left-0 h-[1px] bg-white origin-left"
                style={{ width: `${progress}%` }}
              />

              {/* Percentage Counter */}
              <div className="flex justify-between mt-4">
                 <span className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">Loading Experience</span>
                 <m.span
                    className="text-white font-mono text-sm tabular-nums"
                    aria-label={`${progress} percent loaded`}
                 >
                   {progress}%
                 </m.span>
              </div>
            </div>
          </div>

          {/* Subtle Ambient Glow */}
          <m.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/5 blur-[100px] rounded-full pointer-events-none"
          />
        </m.div>
      )}
    </AnimatePresence>
  );
}



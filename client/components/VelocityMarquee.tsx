import { motion, useScroll, useTransform, useMotionValue, useSpring, useVelocity, useAnimationFrame } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export interface MarqueeItem {
  text: string;
  accent?: boolean;
}

interface VelocityMarqueeRowProps {
  items: MarqueeItem[];
  speed?: number;
  reverse?: boolean;
  accentColor?: string;
  baseColor?: string;
  separatorColor?: string;
  mouseX: any;
  mouseY: any;
}

function VelocityMarqueeRow({
  items,
  speed = 60,
  reverse = false,
  accentColor = "#fff",
  baseColor = "rgba(255,255,255,0.25)",
  separatorColor = "rgba(255,255,255,0.1)",
  mouseX,
}: VelocityMarqueeRowProps) {
  const innerRef = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });

  const skewX = useTransform(
    smoothVelocity,
    [-3000, 0, 3000],
    [reverse ? "15deg" : "-15deg", "0deg", reverse ? "-15deg" : "15deg"]
  );

  const letterSpacing = useTransform(smoothVelocity, [-3000, 0, 3000], ["0.1em", "0em", "0.1em"]);
  const springSpacing = useSpring(letterSpacing as any, { damping: 50, stiffness: 400 });

  useAnimationFrame((_, delta) => {
    const contentW = innerRef.current?.offsetWidth || 0;
    if (!contentW) return;
    const boost = Math.min(Math.abs(smoothVelocity.get()) * 0.05, 150);
    const direction = reverse ? 1 : -1;
    let next = x.get() + direction * (speed + boost) * (delta / 1000);
    if (next < -contentW) next = 0;
    if (next > 0) next = -contentW;
    x.set(next);
  });

  const Row = ({ isFirst }: { isFirst?: boolean }) => (
    <span
      ref={isFirst ? innerRef : undefined}
      className="flex items-center whitespace-nowrap py-2"
    >
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center">
          {item.accent ? (
            <motion.span
              className="font-black italic px-4 md:px-8 cursor-default transition-all duration-300"
              style={{ color: accentColor, letterSpacing: springSpacing }}
              whileHover={{ scale: 1.1, skewX: reverse ? -10 : 10 }}
            >
              {item.text}
            </motion.span>
          ) : (
            <motion.span 
              className="font-black px-4 md:px-8" 
              style={{ color: baseColor, letterSpacing: springSpacing }}
            >
              {item.text}
            </motion.span>
          )}
          <span style={{ color: separatorColor }} className="mx-2 font-thin select-none text-2xl">✦</span>
        </span>
      ))}
    </span>
  );

  return (
    <motion.div className="flex overflow-hidden transform-gpu" style={{ skewX }}>
      <motion.div className="flex" style={{ x }}>
        <Row isFirst />
        <Row />
        <Row />
      </motion.div>
    </motion.div>
  );
}

/* ── Public API ─────────────────────────────────────────────────────── */
interface VelocityMarqueeBannerProps {
  row1: MarqueeItem[];
  row2: MarqueeItem[];
  row1Speed?: number;
  row2Speed?: number;
  theme?: "dark" | "light";
  className?: string;
}

export function VelocityMarqueeBanner({
  row1,
  row2,
  row1Speed = 55,
  row2Speed = 65,
  theme = "dark",
  className = "",
}: VelocityMarqueeBannerProps) {
  const isDark = theme === "dark";
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const accentColor = isDark ? "#ffffff" : "#000000";
  const baseColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";
  const sepColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const dividerColor = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
  const bgClass = isDark ? "bg-black" : "bg-white";
  const fadeStart = isDark ? "#000" : "#fff";

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative ${bgClass} py-8 md:py-12 overflow-hidden select-none group/marquee ${className}`}
    >
      {/* Magnetic Cursor Glow Effect */}
      <motion.div
        className="absolute pointer-events-none z-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-0 group-hover/marquee:opacity-20 transition-opacity duration-500"
        style={{
          x: useSpring(useTransform(mouseX, (v) => v - 200), { stiffness: 150, damping: 25 }),
          y: useSpring(useTransform(mouseY, (v) => v - 200), { stiffness: 150, damping: 25 }),
          background: isDark ? "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)" : "radial-gradient(circle, rgba(0,0,0,0.2) 0%, transparent 70%)"
        }}
      />

      {/* Edge fade masks */}
      <div
        className="absolute inset-y-0 left-0 w-24 md:w-48 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to right, ${fadeStart}, transparent)` }}
      />
      <div
        className="absolute inset-y-0 right-0 w-24 md:w-48 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to left, ${fadeStart}, transparent)` }}
      />

      <div className="relative z-20 space-y-6 md:space-y-8 py-2">
        <div className="text-xl md:text-3xl uppercase tracking-tighter">
          <VelocityMarqueeRow
            items={row1}
            speed={row1Speed}
            accentColor={accentColor}
            baseColor={baseColor}
            separatorColor={sepColor}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        </div>

        <div className="flex justify-center">
          <div style={{ height: 1, width: "80%", backgroundColor: dividerColor }} />
        </div>

        <div className="text-xl md:text-3xl uppercase tracking-tighter">
          <VelocityMarqueeRow
            items={row2}
            speed={row2Speed}
            reverse
            accentColor={accentColor}
            baseColor={baseColor}
            separatorColor={sepColor}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        </div>
      </div>
    </div>
  );
}

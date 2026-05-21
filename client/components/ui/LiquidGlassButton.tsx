import React, { useState, useRef, useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { cn } from "../../lib/utils";

interface LiquidGlassButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isDark?: boolean;
}

export function LiquidGlassButton({ children, className, onClick, isDark = false }: LiquidGlassButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Mouse tracking for light-blob
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for smooth movement
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  const rectRef = useRef<DOMRect | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    if (!rectRef.current) {
      rectRef.current = buttonRef.current.getBoundingClientRect();
    }
    const rect = rectRef.current;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        rectRef.current = null;
        setIsHovered(false);
      }}
      onClick={onClick}
      whileTap={{ scale: 0.96, rotate: 0.5 }}
      whileHover={{ y: -2 }}
      className={cn(
        "relative group flex items-center justify-center gap-3 px-8 py-4 rounded-full font-black tracking-widest uppercase transition-all duration-500 overflow-hidden",
        "backdrop-blur-xl border shadow-lg",
        isDark
          ? "bg-white/10 border-white/20 text-white shadow-white/5 hover:bg-white/15"
          : "bg-black/5 border-black/10 text-black shadow-black/5 hover:bg-black/8",
        className
      )}
    >
      {/* ── Liquid Blob Background ── */}
      <motion.div
        className={cn(
          "absolute pointer-events-none rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          isDark ? "bg-white/20 w-32 h-32" : "bg-black/[0.12] w-32 h-32"
        )}
        style={{
          x: springX,
          y: springY,
          left: "-64px",
          top: "-64px",
        }}
      />

      {/* ── Glass Shine ── */}
      <div className={cn(
        "absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-tr from-transparent via-current to-transparent transition-transform duration-1000 group-hover:translate-x-full",
        "-translate-x-full"
      )} />

      {/* ── Content ── */}
      <div className="relative z-10 flex items-center gap-2 transform transition-transform duration-300 group-hover:scale-105">
        {children}
      </div>

      {/* ── Magnetic Border Highlight ── */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full border-2 opacity-0 group-hover:opacity-40 transition-opacity duration-300",
          isDark ? "border-white" : "border-black"
        )}
        animate={{
          scale: isHovered ? [1, 1.05, 1] : 1,
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut",
        }}
      />
    </motion.button>
  );
}

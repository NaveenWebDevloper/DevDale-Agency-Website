"use client";

import { motion, Variants } from "framer-motion";

interface TechIconProps {
  type: "code" | "cloud" | "strategy" | "growth" | "speed" | "security" | "innovation" | "scale" | "payments";
  className?: string;
  color?: boolean;
}

const colorMap = {
  code: "stroke-indigo-500",
  cloud: "stroke-blue-400",
  strategy: "stroke-amber-500",
  growth: "stroke-emerald-500",
  speed: "stroke-yellow-400",
  security: "stroke-rose-500",
  innovation: "stroke-cyan-400",
  scale: "stroke-fuchsia-500",
  payments: "stroke-violet-500",
};

const glowMap = {
  code: "drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]",
  cloud: "drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]",
  strategy: "drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]",
  growth: "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]",
  speed: "drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]",
  security: "drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]",
  innovation: "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]",
  scale: "drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]",
  payments: "drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]",
};

export const TechIcon = ({ type, className, color = false }: TechIconProps) => {
  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
      const delay = 0.2 + i * 0.1;
      return {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: { delay, type: "spring" as any, duration: 0.8, bounce: 0 },
          opacity: { delay, duration: 0.01 },
        },
      };
    },
  };

  const currentStroke = color ? colorMap[type] : "stroke-current";
  const currentGlow = color ? glowMap[type] : "";
  const combinedClassName = `${className || ""} ${currentStroke} ${currentGlow}`;

  const icons = {
    code: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={combinedClassName}>
        <motion.path d="M16 18l6-6-6-6" variants={draw} custom={1} />
        <motion.path d="M8 6l-6 6 6 6" variants={draw} custom={2} />
      </svg>
    ),
    cloud: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={combinedClassName}>
        <motion.path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.1-4-4.4a7 7 0 10-13.5 1.9c-2.3.4-4 2.3-4 4.5C.5 17 2.5 19 5 19h12.5z" variants={draw} custom={1} />
      </svg>
    ),
    strategy: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={combinedClassName}>
        <motion.circle cx="12" cy="12" r="10" variants={draw} custom={1} />
        <motion.path d="M12 8l-4 8h8l-4-8z" variants={draw} custom={2} />
      </svg>
    ),
    growth: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={combinedClassName}>
        <motion.path d="M22 12h-4l-3 9L9 3l-3 9H2" variants={draw} custom={1} />
      </svg>
    ),
    speed: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={combinedClassName}>
        <motion.path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" variants={draw} custom={1} />
      </svg>
    ),
    security: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={combinedClassName}>
        <motion.rect x="3" y="11" width="18" height="11" rx="2" ry="2" variants={draw} custom={1} />
        <motion.path d="M7 11V7a5 5 0 0110 0v4" variants={draw} custom={2} />
      </svg>
    ),
    innovation: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={combinedClassName}>
        <motion.path d="M9 21h6" variants={draw} custom={1} />
        <motion.path d="M9 17h6" variants={draw} custom={2} />
        <motion.path d="M12 2v2" variants={draw} custom={3} />
        <motion.path d="M12 17V7a5 5 0 015 5c0 1.5-.7 2.8-1.8 3.5l-.2.1a1 1 0 00-.5.9v.5" variants={draw} custom={4} />
        <motion.path d="M7 12a5 5 0 015-5" variants={draw} custom={5} />
      </svg>
    ),
    scale: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={combinedClassName}>
        <motion.path d="M3 3v18h18" variants={draw} custom={1} />
        <motion.path d="M18 9l-5 5-2-2-5 5" variants={draw} custom={2} />
      </svg>
    ),
    payments: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={combinedClassName}>
        <motion.rect x="1" y="4" width="22" height="16" rx="2" variants={draw} custom={1} />
        <motion.path d="M1 10h22" variants={draw} custom={2} />
        <motion.path d="M7 15h.01" variants={draw} custom={3} />
        <motion.path d="M11 15h2" variants={draw} custom={4} />
      </svg>
    ),
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {icons[type]}
    </motion.div>
  );
};


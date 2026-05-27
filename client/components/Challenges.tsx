"use client";

import { motion, Variants } from "framer-motion";
import { useState } from "react";
import { TechIcon } from "./TechIcon";

interface Challenge {
  id: number;
  problem: string;
  solution: string;
  type: "speed" | "scale" | "code" | "innovation" | "growth" | "security";
  color: string;
}

const challenges: Challenge[] = [
  {
    id: 1,
    problem: "Slow, Outdated Websites",
    solution: "We build lightning-fast, modern architectures that load in milliseconds and maximize conversion.",
    type: "speed",
    color: "group-hover:bg-yellow-950",
  },
  {
    id: 2,
    problem: "High Expansion Costs",
    solution: "Our cloud-native approach reduces operational overhead and infrastructure costs by up to 40%.",
    type: "scale",
    color: "group-hover:bg-fuchsia-950",
  },
  {
    id: 3,
    problem: "Technical Debt",
    solution: "Clean, scalable architecture designed for longevity—eliminating the need for costly rewrites.",
    type: "code",
    color: "group-hover:bg-indigo-950",
  },
  {
    id: 4,
    problem: "Complex User Journeys",
    solution: "Intuitive design systems that simplify interactions and delight users at every touchpoint.",
    type: "innovation",
    color: "group-hover:bg-cyan-950",
  },
  {
    id: 5,
    problem: "Limited Visibility",
    solution: "Data-driven strategies and advanced SEO to ensure your brand stands out in a crowded market.",
    type: "growth",
    color: "group-hover:bg-emerald-950",
  },
  {
    id: 6,
    problem: "Security Vulnerabilities",
    solution: "Enterprise-grade protection integrated from Day 1 to safeguard your data and user trust.",
    type: "security",
    color: "group-hover:bg-rose-950",
  },
];

interface ChallengesProps {
  isLoaded: boolean;
}

export default function Challenges({ isLoaded }: ChallengesProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as any,
      },
    },
  };

  return (
    <section className="relative w-full py-32 bg-white grid-pattern">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <div className="mb-24 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-indigo-50 text-indigo-500 rounded-full"
          >
            Challenges
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-8xl font-bold tracking-tighter mb-8"
          >
            Overcoming <span className="text-gray-400">Barriers</span> <br />
            to your growth.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl text-gray-500 font-medium leading-relaxed"
          >
            We identify the bottlenecks and engineer the solutions that propel your business forward.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          viewport={{ once: true, margin: "0px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              variants={itemVariants}
              onMouseEnter={() => setHoveredId(challenge.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="relative aspect-[4/5] group cursor-pointer perspective"
            >
              <motion.div
                className={`w-full h-full bg-white rounded-[2.5rem] p-10 flex flex-col justify-between transition-all duration-700 border border-black/[0.03] relative overflow-hidden group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] group-hover:-translate-y-4`}
                style={{ willChange: "transform" }}
                animate={{
                  rotateX: hoveredId === challenge.id ? 2 : 0,
                  rotateY: hoveredId === challenge.id ? -2 : 0,
                }}
              >
                {/* Visual Depth Elements */}
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="text-[12rem] font-black leading-none tracking-tighter tabular-nums select-none">
                    0{index + 1}
                  </span>
                </div>

                {/* Tech Icon Overlay (Refined) */}
                <div className="absolute -bottom-10 -right-10 w-48 h-48 opacity-[0.03] group-hover:opacity-20 transition-all duration-1000 blur-xl group-hover:blur-3xl group-hover:scale-150">
                  <TechIcon type={challenge.type} color={true} className="w-full h-full" />
                </div>

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center text-black mb-8 group-hover:bg-white group-hover:shadow-lg transition-all duration-500">
                    <TechIcon type={challenge.type} color={true} className="w-7 h-7" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-30 group-hover:opacity-60 transition-opacity">
                      Barrier 0{index + 1}
                    </span>
                    <h3 className="text-3xl font-bold tracking-tighter leading-[1.1]">
                      {challenge.problem.split(' ').map((word, i) => (
                        <span key={i} className="block">{word}</span>
                      ))}
                    </h3>
                  </div>
                </div>

                <div className="relative z-10 h-32 flex flex-col justify-end">
                  {/* Default Footer */}
                  <motion.div
                    className="flex items-center justify-between"
                    animate={{
                      opacity: hoveredId === challenge.id ? 0 : 1,
                      y: hoveredId === challenge.id ? 20 : 0
                    }}
                  >
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-black/20" />
                      <div className="w-1 h-1 rounded-full bg-black/20" />
                      <div className="w-8 h-1 rounded-full bg-black/10" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest uppercase opacity-60">Reveal Solution</span>
                  </motion.div>

                  {/* Solution Reveal */}
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{
                      y: hoveredId === challenge.id ? 0 : 40,
                      opacity: hoveredId === challenge.id ? 1 : 0
                    }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-x-0 bottom-0 bg-black p-8 -m-8 rounded-b-[2.5rem] text-white"
                  >
                    <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4 text-white/40">Our Engineering</h4>
                    <p className="text-lg font-medium leading-tight tracking-tight">
                      {challenge.solution}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

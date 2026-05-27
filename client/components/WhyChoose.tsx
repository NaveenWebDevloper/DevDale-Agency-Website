"use client";

import { motion, Variants, useMotionValue, useSpring, useTransform } from "framer-motion";
import { TechIcon } from "./TechIcon";
import { useState, useRef } from "react";
import BorderGlow from "./BorderGlow";
import GlitchText from "./GlitchText";

interface Advantage {
  title: string;
  description: string;
  type: "speed" | "innovation" | "security" | "scale" | "payments" | "strategy";
  tag: string;
  index: string;
}

const advantages: Advantage[] = [
  {
    index: "01",
    tag: "Efficiency",
    title: "Lightning Speed",
    description: "Projects delivered on time, every time. Our agile process keeps momentum and ensures rapid market entry.",
    type: "speed",
  },
  {
    index: "02",
    tag: "Tailored",
    title: "Pure Innovation",
    description: "We don't copy templates. Every solution is custom-built with cutting-edge tech tailored for your market.",
    type: "innovation",
  },
  {
    index: "03",
    tag: "Integrity",
    title: "Rock-Solid Security",
    description: "Security is non-negotiable. We implement enterprise-grade protection for your users from day one.",
    type: "security",
  },
  {
    index: "04",
    tag: "Future-Proof",
    title: "Infinite Scalability",
    description: "Architectures designed to grow. Scale from 100 to 100M users seamlessly with our cloud-native solutions.",
    type: "scale",
  },
  {
    index: "05",
    tag: "Global Commerce",
    title: "Payment Systems",
    description: "Secure, global checkout experiences. We integrate complex payment gateways with multi-currency support.",
    type: "payments",
  },
  {
    index: "06",
    tag: "Data-Driven",
    title: "Strategic Analytics",
    description: "Turn data into revenue. We implement advanced tracking and real-time reporting to optimize your growth.",
    type: "strategy",
  },
];

function TiltCard({ item }: { item: Advantage }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rectRef = useRef<DOMRect | null>(null);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rectRef.current) {
      rectRef.current = e.currentTarget.getBoundingClientRect();
    }
    const rect = rectRef.current;
    if (!rect) return;
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    rectRef.current = null;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
        willChange: "transform"
      }}
      className="relative min-h-[500px] md:min-h-[600px] w-full rounded-[2.5rem] bg-white border border-black/[0.05] p-10 md:p-16 overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-700 flex flex-col"
    >
      {/* Editorial Number - Scaled for larger layout */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
         <span className="text-[10rem] md:text-[18rem] font-black leading-none tracking-tighter tabular-nums select-none">
            {item.index}
         </span>
      </div>

      <div 
        style={{ transform: "translateZ(60px)" }}
        className="relative z-10 flex-grow flex flex-col justify-between"
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-12 md:mb-16">
            <div className={`w-16 h-16 rounded-[2rem] bg-black/5 flex items-center justify-center text-black transition-all duration-500 group-hover:bg-black group-hover:text-white group-hover:shadow-2xl`}>
              <TechIcon type={item.type} color={true} className="w-8 h-8" />
            </div>
            <div className="flex flex-col items-end gap-2">
               <span className="text-[10px] font-bold tracking-[0.5em] uppercase opacity-40">{item.tag}</span>
               <div className="w-12 h-[1px] bg-black/10" />
            </div>
          </div>

          <h3 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[0.9] group-hover:translate-x-3 transition-transform duration-500">
            {item.title}
          </h3>
          <p className="text-xl md:text-2xl text-gray-400 font-medium leading-tight tracking-tight max-w-xl group-hover:text-black transition-colors duration-500 delay-100">
            {item.description}
          </p>
        </div>

        <div className="mt-12 flex items-center gap-6 text-[10px] font-black tracking-[0.4em] uppercase opacity-30 group-hover:opacity-100 transition-all duration-500">
          <span className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Protocol Verified
          </span>
          <div className="h-px flex-grow bg-black/10 group-hover:bg-black/20" />
          <span className="group-hover:translate-x-2 transition-transform">→</span>
        </div>
      </div>

      {/* Crosshair accents */}
      <div className="absolute top-6 left-6 w-3 h-3 border-t border-l border-black/10" />
      <div className="absolute bottom-6 right-6 w-3 h-3 border-b border-r border-black/10" />
    </motion.div>
  );
}

interface WhyChooseProps {
  isLoaded?: boolean;
}

export default function WhyChoose({ isLoaded = true }: WhyChooseProps) {
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
    hidden: { opacity: 0, y: 20 },
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
    <section 
      id="approach" 
      className="relative w-full py-48 bg-white overflow-hidden scroll-mt-32"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        {/* Modern Section Header */}
        <div className="text-center mb-32 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-black/[0.08] bg-[#F5F5F7] mb-10 shadow-sm"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-black">The DevDale Protocol</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-[8rem] font-bold tracking-tighter leading-[0.9] mb-10"
          >
            Why <span className="text-gray-400">partner</span> <br /> with us.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isLoaded ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-2xl text-gray-500 font-medium leading-relaxed"
          >
            Engineering excellence through systematic research, rapid execution, and architectural precision.
          </motion.p>
        </div>

        {/* Advantage Grid - Clean 3-Column Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {advantages.map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover="hover"
              className="w-full h-full flex"
            >
              <BorderGlow
                edgeSensitivity={20}
                glowColor="250 80 80"
                backgroundColor="#FBFBFB"
                hoverBackgroundColor="#FFFFFF"
                borderColor="rgba(0, 0, 0, 0.03)"
                borderRadius={48}
                glowRadius={60}
                glowIntensity={0.8}
                colors={['#8b5cf6', '#ec4899', '#3b82f6']}
                className="relative aspect-square md:aspect-auto md:min-h-[450px] w-full p-12 group cursor-pointer"
              >
                {/* Detail Header */}
                <div className="flex items-start justify-between mb-12">
                   <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center text-black border border-black/[0.03] group-hover:scale-110 transition-transform duration-500">
                     <TechIcon type={item.type} color={true} className="w-8 h-8" />
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black tracking-[0.4em] uppercase opacity-30 group-hover:opacity-100 transition-opacity">Advantage 0{idx + 1}</span>
                      <div className="mt-2 w-8 h-[1px] bg-black/10 transition-all duration-700 group-hover:w-full group-hover:bg-black/20" />
                   </div>
                </div>

                {/* Title & Description */}
                <div className="flex flex-col flex-grow">
                  <h3 className="text-3xl font-bold tracking-tighter mb-6 group-hover:translate-x-2 transition-transform duration-500">
                    <GlitchText speed={1.2} enableShadows={true} enableOnHover={true}>
                      {item.title}
                    </GlitchText>
                  </h3>
                  <motion.p
                    variants={{
                      hover: {
                        y: -8,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 10,
                        }
                      }
                    }}
                    className="text-lg text-gray-400 font-medium leading-snug tracking-tight group-hover:text-black transition-colors duration-500"
                  >
                    {item.description}
                  </motion.p>
                </div>

                {/* Metric Indicator - Clean Professional Addition */}
                <div className="mt-auto pt-10 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black tracking-[0.2em] uppercase opacity-20">Performance Metric</span>
                      <span className="text-xl font-black tracking-tighter text-black/40 group-hover:text-black transition-colors">
                         {idx === 0 ? '100% Reliable' : idx === 1 ? 'Pure AI-Core' : idx === 2 ? 'L6 Security' : idx === 3 ? 'Auto-Scaling' : idx === 4 ? 'PCI-Level 1' : 'Real-time'}
                      </span>
                   </div>
                   <div className="w-10 h-10 rounded-full border border-black/[0.03] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-4 group-hover:translate-x-0">
                      <span className="text-sm">→</span>
                   </div>
                </div>
              </BorderGlow>
            </motion.div>
          ))}
        </motion.div>

        {/* Global Statistics Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-40 pt-20 border-t border-black/[0.05] grid grid-cols-1 md:grid-cols-3 gap-16"
        >
           <div className="flex flex-col gap-2">
              <span className="text-6xl font-black tracking-tighter">99.9%</span>
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-30">Uptime Reliability</span>
           </div>
           <div className="flex flex-col gap-2">
              <span className="text-6xl font-black tracking-tighter">120+</span>
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-30">Engineered Solutions</span>
           </div>
           <div className="flex flex-col gap-2">
              <span className="text-6xl font-black tracking-tighter">24/7</span>
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-30">Global Intelligence</span>
           </div>
        </motion.div>
      </div>
    </section>
  );
}






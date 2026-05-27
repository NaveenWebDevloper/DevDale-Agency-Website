"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { TechIcon } from "./TechIcon";

interface Service {
  title: string;
  description: string;
  type: "code" | "cloud" | "strategy" | "growth" | "speed" | "security" | "innovation" | "scale";
  tags: string[];
  badge: string;
  badgeColor: string;
  cover: string;
  video: string;
  filterClass: string;
}

const services: Service[] = [
  {
    title: "Web Development",
    description: "High-performance websites that convert visitors into customers through engineering excellence.",
    type: "code",
    tags: ["React", "Next.js", "Vite"],
    badge: "Development",
    badgeColor: "bg-[#FDF2F2] text-[#EF4444]", // Matching the reference badge color
    cover: "/webdevvideoimage.webp",
    video: "/webdevvideo.mp4",
    filterClass: "", // Native colors
  },
  {
    title: "Cloud Infrastructure",
    description: "Native and cross-platform apps that users love, built on rock-solid cloud architecture.",
    type: "cloud",
    tags: ["AWS", "Google Cloud", "Azure"],
    badge: "Architecture",
    badgeColor: "bg-[#EFF6FF] text-[#3B82F6]",
    cover: "/challenge_technical_expertise.webp",
    video: "/webdevvideo.mp4",
    filterClass: "hue-rotate-[200deg] brightness-[1.1] saturate-[1.2]", // Cool high-tech blue tint
  },
  {
    title: "AI Applications",
    description: "Smart, AI-powered solutions that automate tasks and scale your business operations intelligently.",
    type: "innovation",
    tags: ["OpenAI", "ML", "Python"],
    badge: "Innovation",
    badgeColor: "bg-[#F5F3FF] text-[#8B5CF6]",
    cover: "/3rdvideoimage.webp",
    video: "/3rdvideo.mp4",
    filterClass: "",
  },
  {
    title: "Performance Optimization",
    description: "Lightning fast digital experiences that keep your users engaged and improve conversion rates.",
    type: "speed",
    tags: ["Core Web Vitals", "Wasm", "Edge"],
    badge: "Performance",
    badgeColor: "bg-[#FFFBEB] text-[#D97706]",
    cover: "/4thvideoimage.webp",
    video: "/4thvideo.mp4",
    filterClass: "",
  },
  {
    title: "Enterprise Security",
    description: "Secure, decentralized and centralized solutions built for the future of digital safety.",
    type: "security",
    tags: ["OAuth", "Encryption", "SOC2"],
    badge: "Security",
    badgeColor: "bg-[#ECFDF5] text-[#10B981]",
    cover: "/5thvideoimage.webp",
    video: "/5thvideo.m4v",
    filterClass: "",
  },
  {
    title: "Growth Strategy",
    description: "Beautiful interfaces and data-driven strategies that delight users and drive engagement.",
    type: "growth",
    tags: ["SEO", "Analytics", "CRM"],
    badge: "Strategy",
    badgeColor: "bg-[#FDF2F8] text-[#DB2777]",
    cover: "/challenge_branding.webp",
    video: "/webdevvideo.mp4",
    filterClass: "hue-rotate-[310deg] brightness-[1.1] saturate-[1.3]", // Vibrant marketing fuchsia/pink tint
  },
];

function ServiceCard({ service, index, variants }: { service: Service; index: number; variants: Variants }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay block on mobile:", err);
      });
    } else if (!isMobile && videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch((err) => {
          console.warn("Playback block on hover:", err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isMobile, isHovered]);

  const handleMouseEnter = () => {
    if (isMobile) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setIsHovered(false);
  };

  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -12 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group bg-white border border-black/[0.04] rounded-[2.5rem] p-6 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] flex flex-col justify-between transition-all duration-500 ease-out relative overflow-hidden h-full"
    >
      {/* Decorative subtle ambient card glow */}
      <div className={`absolute -top-10 -left-10 w-40 h-40 bg-gray-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

      <div className="relative z-10 w-full flex flex-col">
        {/* Visual Box exactly modeled after the reference mockup */}
        <div className="aspect-[4/3] w-full bg-[#F3F4F6] rounded-[2rem] overflow-hidden relative mb-6 flex items-center justify-center">
          {/* Cover image (fades out slightly on hover) */}
          <img loading="lazy"
            src={service.cover}
            alt={service.title}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
              isMobile
                ? "opacity-0 scale-105"
                : isHovered
                ? "scale-105 opacity-90"
                : "scale-100 opacity-100"
            }`}
          />

          {/* HTML5 video that plays smoothly on hover */}
          <video
            ref={videoRef}
            src={service.video}
            muted
            loop
            playsInline
            autoPlay={isMobile}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none ${
              isMobile || isHovered ? "opacity-100" : "opacity-0"
            } ${service.filterClass}`}
          />
        </div>

        {/* Pill Badge matching reference exactly */}
        <span className={`inline-block self-start px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full mb-3 ${service.badgeColor}`}>
          {service.badge}
        </span>

        {/* Service Title */}
        <h3 className="text-2xl font-bold tracking-tight text-[#18181b] mb-2 leading-snug group-hover:text-black transition-colors font-display">
          {service.title}
        </h3>

        {/* Service Description */}
        <p className="text-[#52525b] text-sm leading-relaxed mb-6 font-normal group-hover:text-[#27272a] transition-colors">
          {service.description}
        </p>
      </div>

      {/* Tags at the bottom of the card, kept perfectly intact */}
      <div className="relative z-10 flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-black/[0.03]">
        {service.tags.map((tag, i) => (
          <span
            key={i}
            className="px-3.5 py-1.5 bg-gray-50 text-[9px] font-bold tracking-widest uppercase text-gray-400 border border-gray-100 rounded-full group-hover:bg-white group-hover:border-black/10 group-hover:text-black transition-all duration-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function Solutions() {
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
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as any,
      },
    },
  };

  return (
    <section id="services" className="relative w-full py-32 bg-[#F9F9FB] overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-50/20 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        {/* Section Header */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="h-px w-12 bg-indigo-500" />
            <span className="text-sm font-bold tracking-widest uppercase text-indigo-500">Expertise</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 text-balance"
          >
            Digital <span className="text-gray-400">Solutions</span> <br />
            Built for the <span className="text-indigo-600">Future</span>.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-2xl text-gray-500 max-w-2xl font-medium leading-relaxed"
          >
            From bespoke websites to complex AI orchestrations, we deliver engineering excellence at every touchpoint.
          </motion.p>
        </div>

        {/* Services Grid with redesigned cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, idx) => (
            <ServiceCard
              key={idx}
              service={service}
              index={idx}
              variants={itemVariants}
            />
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-32 p-12 md:p-20 bg-black rounded-[3rem] text-center text-white relative overflow-hidden group border border-white/5"
        >
          <div className="absolute inset-0 noise opacity-20 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

          <h3 className="text-4xl md:text-6xl font-bold mb-10 relative z-10 tracking-tighter">
            Ready to <span className="text-indigo-400">elevate</span> your project?
          </h3>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="relative z-10 px-12 py-5 bg-white text-black rounded-full text-lg font-bold tracking-tight hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all shadow-xl"
          >
            Start a Conversation
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}


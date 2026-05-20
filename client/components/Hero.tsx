import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CurvedLoop from "./CurvedLoop";
import { Typewriter } from "./ui/Typewriter";

const Hero = ({ isLoaded }: { isLoaded?: boolean }) => {
  const navigate = useNavigate();

  const headlineText = "Building Digital Experiences That Drive Real Growth";
  const words = headlineText.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  const subheadlineVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 1.2,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  const handleCTAClick = () => {
    navigate("/contact");
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
      {/* 1. High-Density Industrial Grid Pattern - Optimized with contain-paint */}
      <div
        className="absolute inset-0 z-0 pointer-events-none [contain:paint]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />
      {/* 4-Way Smooth Reveal Gradients - Performance Optimized */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden transform-gpu [contain:paint]">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white via-transparent to-white opacity-90" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white via-white/40 to-transparent" />
      </div>

      {/* 2. Delicate Noise Overlay - Forced GPU layer */}
      <div className="absolute inset-0 noise opacity-[0.03] pointer-events-none z-[1] transform-gpu" />

      <div className="container relative z-20 flex flex-col items-center text-center">
        {/* 3. Editorial Headline with Integrated Logos */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          className="relative mb-12 w-full max-w-6xl mx-auto flex flex-col items-center gap-y-4"
        >
          {/* Line 1: Building Digital Experiences That */}
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-3">
            {words.slice(0, 4).map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariants}
                className="text-3xl sm:text-5xl lg:text-6xl xl:text-[5.5rem] font-black tracking-[-0.01em] flex items-center h-fit text-black"
              >
                <div className="inline-flex items-center text-balance">
                  {word === "Experiences" ? (
                    <span>
                      {word.split("").map((char, index) => (
                        <span key={index} className="relative inline-block">
                          {(char === "x" || char === "X") ? (
                            <motion.span
                              animate={{
                                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                rotateY: [0, 10, -10, 0],
                                y: [0, -5, 0],
                              }}
                              transition={{ 
                                backgroundPosition: { duration: 6, repeat: Infinity, ease: "linear" },
                                rotateY: { duration: 6, repeat: Infinity, ease: "linear" },
                                y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                              }}
                              className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 bg-[length:200%_auto] cursor-default inline-block px-[5px] will-change-transform perspective-[1000px]"
                              style={{
                                WebkitBackgroundClip: "text",
                                backfaceVisibility: "hidden",
                                transformStyle: "preserve-3d"
                              }}
                            >
                              {char}
                            </motion.span>
                          ) : (
                            char
                          )}
                        </span>
                      ))}
                    </span>
                  ) : (
                    word
                  )}

                  {/* The Logo Group Interjection */}
                  {word === "Building" && (
                    <div className="inline-flex items-center gap-4 mx-6 md:mx-8">
                      {/* Figma Logo SVG */}
                      <span className="inline-flex items-center justify-center p-1">
                        <svg width="40" height="60" viewBox="0 0 38 57" fill="none" className="h-[0.52em] w-auto overflow-visible transition-transform duration-500 hover:scale-110">
                          <path d="M0 9.5C0 6.98044 1.00089 4.56408 2.78249 2.78249C4.56408 1.00089 6.98044 0 9.5 0H19V19H9.5C6.98044 19 4.56408 17.9991 2.78249 16.2175C1.00089 14.4359 0 12.0196 0 9.5Z" fill="#F24E1E" />
                          <path d="M19 0H28.5C31.0196 0 33.4359 1.00089 35.2175 2.78249C36.9991 4.56408 38 6.98044 38 9.5C38 12.0196 36.9991 14.4359 35.2175 16.2175C33.4359 17.9991 31.0196 19 28.5 19H19V0Z" fill="#FF7262" />
                          <path d="M0 28.5C0 25.9804 1.00089 23.5641 2.78249 21.7825C4.56408 20.0009 6.98044 19 9.5 19H19V38H9.5C6.98044 38 4.56408 36.9991 2.78249 35.2115C1.00089 33.4359 0 31.0196 0 28.5Z" fill="#A259FF" />
                          <path d="M19 28.5C19 25.9834 20.0009 23.57 21.7825 21.7885C23.5641 20.0069 25.9804 19.006 28.5 19.006C31.0196 19.006 33.4359 20.0069 35.2175 21.7885C36.9991 23.57 38 25.9834 38 28.5C38 31.0166 36.9991 33.43 35.2175 35.2115C33.4359 36.9931 31.0196 37.994 28.5 37.994C25.9804 37.994 23.5641 36.9931 21.7825 35.2115C20.0009 33.43 19 31.0166 19 28.5Z" fill="#1ABCFE" />
                          <path d="M0 47.5C0 44.9834 1.00089 42.57 2.78249 40.7885C4.56408 39.0069 6.98044 38.006 9.5 38.006H19V47.5C19 50.0166 17.9991 52.43 16.2175 54.2115C14.4359 55.9931 12.0196 56.994 9.5 56.994C6.98044 56.994 4.56408 55.9931 2.78249 54.2115C1.00089 52.43 0 50.0166 0 47.5Z" fill="#0ACF83" />
                        </svg>
                      </span>

                      {/* Claude Official Logo Image */}
                      <span className="inline-flex items-center justify-center">
                        <motion.img
                          src="/claude-icon-logo.png"
                          alt="Claude Logo"
                          className="h-[0.58em] w-auto transition-transform duration-500 hover:scale-110 object-contain"
                        />
                      </span>
                    </div>
                  )}
                </div>
              </motion.span>
            ))}
          </div>

          {/* Line 2: That Drive Real Growth */}
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-3">
            {words.slice(4).map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariants}
                className={`text-3xl sm:text-5xl lg:text-6xl xl:text-[5.5rem] font-black tracking-[-0.01em] flex items-center h-fit ${word === "Growth" ? "text-gray-200" : "text-black"
                  }`}
              >
                {word}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* 4. Subheadline with Looping Typewriter Effect */}
        <div className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 font-medium leading-relaxed mb-10 min-h-[3.5em] text-center">
          {isLoaded && (
            <Typewriter 
              delay={0.8}
              speed={0.03}
              allSequences={[
                [
                  { text: "Developing " },
                  { text: "high-performance digital products", className: "text-black font-semibold" },
                  { text: " to scale your business faster." }
                ],
                [
                  { text: "From bespoke platforms to " },
                  { text: "advanced AI solutions", className: "text-black font-semibold" },
                  { text: ", we deliver engineering excellence." }
                ],
                [
                  { text: "Crafting " },
                  { text: "lightning fast experiences", className: "text-black font-semibold" },
                  { text: " and data-driven growth strategies." }
                ]
              ]}
            />
          )}
        </div>

        {/* 6. CTA Buttons with Correct Spacing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="flex flex-col sm:flex-row items-center gap-6 z-30"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCTAClick}
            className="group px-10 py-4 bg-black text-white rounded-full text-base font-bold transition-all shadow-xl hover:shadow-2xl hover:bg-zinc-800 flex items-center gap-3"
          >
            Start Building
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/pricing")}
            className="flex items-center gap-3 px-10 py-4 bg-white text-black border border-gray-100 rounded-full text-base font-bold hover:bg-gray-50 transition-all shadow-lg"
          >
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Request for Pricing
          </motion.button>
        </motion.div>
      </div>

      {/* 7. Scrolling Text (Marquee) at Bottom */}
      <div className="absolute bottom-0 left-0 w-full z-10 pointer-events-none">
        <CurvedLoop
          marqueeText="STRATEGY • DESIGN • DEVELOPMENT • AI INTEGRATION • SCALE • PERFORMANCE • "
          speed={1.5}
          className="text-gray-100/50 text-5xl font-black uppercase tracking-tighter"
        />
      </div>

      {/* 8. Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="text-[10px] uppercase tracking-[0.4em] text-gray-300 font-bold">Discover</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-gray-200 to-transparent" />
      </motion.div>
    </section>
  );
};

export default Hero;

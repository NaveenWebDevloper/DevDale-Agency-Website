"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { TechIcon } from "./TechIcon";
import { cn } from "../lib/utils";
import { Quote, MoveRight, MoveLeft, Sparkles, Zap } from "lucide-react";
import ScrollFloat from "./ui/ScrollFloat";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  project: string;
  quote: string;
  type: "code" | "growth" | "strategy" | "innovation";
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Aditya Singh",
    role: "CEO, Patents Planet",
    project: "Legal Tech Revolution",
    quote: "DevDale's precision in technical drafting is unmatched. They delivered USPTO-compliant illustrations that scaled our filing success globally.",
    type: "code",
  },
  {
    id: 2,
    name: "Karan Verma",
    role: "Strategy, CropPlan",
    project: "Agri-Tech Ecosystem",
    quote: "The demand-based planning system they architected has revolutionized our supply chain. Engineering excellence meets real-world impact.",
    type: "growth",
  },
  {
    id: 3,
    name: "Alex Johnson",
    role: "Founder, TechStartup Co",
    project: "Market Disruption",
    quote: "A rapid-cycle deployment team that truly understands business logic. Our platform launch was flawless and ahead of schedule.",
    type: "strategy",
  },
  {
    id: 4,
    name: "Sarah Chen",
    role: "CEO, Growth Labs",
    project: "Scalability Engine",
    quote: "They don't just write code; they architect digital ecosystems. Their attention to detail in UI/UX and performance is world-class.",
    type: "innovation",
  },
];

export default function ClientFeedback() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const next = () => setActiveIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="relative py-48 bg-black flex flex-col justify-center">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
         <div className="absolute inset-0 bg-black opacity-80" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 relative z-10 w-full">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
            
            {/* Left Column: Avatars & Navigation */}
            <div className="lg:col-span-4 space-y-12 order-2 lg:order-1">
               <div className="relative h-[320px] w-full flex items-center justify-center lg:justify-start">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      initial={{ opacity: 0, scale: 0.8, rotateY: -30, x: -30 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotateY: 30, x: 30 }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      className="relative z-20"
                    >
                       <div className="w-56 h-72 rounded-[2.5rem] bg-zinc-900 border border-white/10 p-1 flex flex-col overflow-hidden relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                          <div className="flex-1 bg-zinc-800 rounded-[2.3rem] flex items-center justify-center text-7xl font-black text-white/5 lowercase">
                             {testimonials[activeIndex].name.charAt(0)}
                          </div>
                          <div className="p-6 bg-zinc-900/90 backdrop-blur-xl border-t border-white/5 space-y-1">
                             <h4 className="text-lg font-black tracking-tighter text-white uppercase">{testimonials[activeIndex].name}</h4>
                             <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">{testimonials[activeIndex].role}</p>
                          </div>
                       </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Floating Deco Elements */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-white/5 rounded-full animate-[spin_25s_linear_infinite] opacity-10 pointer-events-none" />
               </div>

               <div className="flex items-center gap-6">
                  <button 
                    onClick={prev}
                    aria-label="Previous testimonial"
                    className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group active:scale-95"
                  >
                    <MoveLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <div className="flex gap-2">
                     {testimonials.map((_, i) => (
                       <div 
                         key={i} 
                         className={cn(
                           "h-1 transition-all duration-500 rounded-full",
                           i === activeIndex ? "w-10 bg-indigo-500" : "w-3 bg-white/10"
                         )} 
                       />
                     ))}
                  </div>
                  <button 
                    onClick={next}
                    aria-label="Next testimonial"
                    className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group active:scale-95"
                  >
                    <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>

            {/* Right Column: Narrative Content */}
            <div className="lg:col-span-8 space-y-10 order-1 lg:order-2">
               <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 text-indigo-400"
                  >
                     <Sparkles className="w-3.5 h-3.5 fill-current" />
                     <span className="text-[9px] font-black uppercase tracking-[0.5em]">Verified Success Archive</span>
                  </motion.div>
                  
                  <div className="relative min-h-[350px] flex flex-col justify-center">
                     <AnimatePresence mode="wait">
                        <motion.div
                          key={activeIndex}
                          initial={{ opacity: 0, y: 30, filter: "blur(15px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: -30, filter: "blur(15px)" }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className="space-y-10"
                        >
                           <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="inline-flex items-center gap-4 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 relative overflow-hidden group/project"
                           >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/project:translate-x-full transition-transform duration-1000" />
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                              <h3 className="text-[9px] font-black uppercase tracking-[0.5em] text-indigo-300 flex items-center gap-2">
                                 Project: 
                                 <motion.span className="flex">
                                    {testimonials[activeIndex].project.split("").map((char, i) => (
                                      <motion.span
                                        key={`${activeIndex}-${i}`}
                                        initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                        transition={{ 
                                          duration: 0.4, 
                                          delay: 0.2 + i * 0.03,
                                          ease: [0.22, 1, 0.36, 1]
                                        }}
                                      >
                                        {char === " " ? "\u00A0" : char}
                                      </motion.span>
                                    ))}
                                 </motion.span>
                              </h3>
                           </motion.div>
                           
                           <div className="overflow-hidden">
                              <Quote className="inline-block w-8 h-8 mb-4 text-indigo-500 opacity-50" />
                              <ScrollFloat
                                key={activeIndex}
                                animationDuration={1.2}
                                ease="back.inOut(2)"
                                scrollStart="center bottom"
                                stagger={0.03}
                                containerClassName="!m-0 !overflow-visible"
                                textClassName="!text-xl md:!text-3xl xl:!text-5xl font-black text-white italic tracking-tighter leading-[1.15] uppercase text-left"
                              >
                                {testimonials[activeIndex].quote}
                              </ScrollFloat>
                           </div>

                           <div className="flex items-center gap-10 pt-10 border-t border-white/10">
                              <div className="flex items-center gap-4">
                                 <TechIcon type={testimonials[activeIndex].type} className="w-10 h-10 grayscale brightness-200" />
                                 <div className="h-6 w-px bg-white/10" />
                                 <div className="space-y-1">
                                    <div className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Tactical Suite</div>
                                    <div className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">Enterprise Deployment</div>
                                 </div>
                              </div>
                              <div className="hidden sm:flex items-center gap-3 opacity-20">
                                 <Zap className="w-2.5 h-2.5 text-white" />
                                 <span className="text-[7.5px] font-black uppercase tracking-[0.4em] text-white">Ref_ID_0{testimonials[activeIndex].id}</span>
                              </div>
                           </div>
                        </motion.div>
                     </AnimatePresence>
                  </div>
               </div>
            </div>

         </div>
      </div>


    </section>
  );
}










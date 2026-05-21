"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { FluidBackground } from "./ui/FluidBackground";

interface PricingOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PricingOfferModal({ isOpen, onClose, onConfirm }: PricingOfferModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
        >
          {/* ── Backdrop ── */}
          <motion.div
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(24px)" }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />

          <FluidBackground />

          {/* ── Modal Content ── */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-5xl bg-white/5 border border-white/10 rounded-[2.5rem] overflow-y-auto md:overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:h-auto md:max-h-[800px]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            
            {/* Left Side: Visual/Promotion */}
            <div className="relative w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-between bg-black overflow-hidden border-b md:border-b-0 md:border-r border-white/10 shrink-0">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,#ffffff_0%,transparent_70%)]" />
              </div>

              <div className="relative z-10">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] md:text-xs font-black tracking-widest uppercase mb-4 md:mb-8"
                >
                  <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  Limited Time Launch Offer
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-4 md:mb-6"
                >
                  Unlocking <br /> 
                  <span className="text-shine-gray">50% Savings.</span>
                </motion.h2>
                <motion.p
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.4 }}
                  className="text-white/40 text-sm md:text-lg max-w-sm leading-relaxed"
                >
                  Celebrate our agency launch with exceptional pricing on all digital products and mobile apps.
                </motion.p>
              </div>

              <div className="relative z-10 mt-8 md:mt-12 grid grid-cols-2 gap-3 md:gap-4">
                <div className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/10 text-center md:text-left">
                  <p className="text-[8px] md:text-[10px] font-black tracking-widest uppercase text-white/30 mb-1">Web Dev</p>
                  <p className="text-lg md:text-xl font-bold text-white tracking-tight">₹4,499</p>
                </div>
                <div className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/10 text-center md:text-left">
                  <p className="text-[8px] md:text-[10px] font-black tracking-widest uppercase text-white/30 mb-1">Mobile Apps</p>
                  <p className="text-lg md:text-xl font-bold text-white tracking-tight">₹9,999</p>
                </div>
              </div>
            </div>

            {/* Right Side: Tiers Recap/CTA */}
            <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-zinc-900">
              <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-white/30 mb-4 md:mb-8">What You Get</h3>
              
              <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
                {[
                  { icon: Zap, title: "Rapid Delivery", desc: "MVP launch within 14-21 days." },
                  { icon: ShieldCheck, title: "Premium QA", desc: "Rigorous testing & bug-free delivery." },
                  { icon: Sparkles, title: "Modern Stack", desc: "React, Next.js, and native apps." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="flex gap-4 group"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-white/10 transition-colors">
                      <item.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm md:text-base">{item.title}</h4>
                      <p className="text-[11px] md:text-sm text-white/30">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="group w-full py-4 md:py-6 bg-white text-black rounded-2xl md:rounded-3xl font-black tracking-widest uppercase flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_25px_50px_rgba(255,255,255,0.15)] transition-all duration-300 text-xs md:text-sm"
              >
                Explore All Plans
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <p className="text-center mt-4 md:mt-6 text-[8px] md:text-[10px] font-medium text-white/20 uppercase tracking-widest">
                Offer valid for the first 10 projects this month.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

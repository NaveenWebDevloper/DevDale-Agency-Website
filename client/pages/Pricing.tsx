import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { MoveRight, Check, Zap, Sparkles, Phone, Mail, MapPin, ExternalLink, Globe, Smartphone, Shield, Layers } from "lucide-react";
import { SmoothScroll } from "../components/SmoothScroll";
import { LiquidGlassButton } from "../components/ui/LiquidGlassButton";
import { cn } from "../lib/utils";

import { PricingOfferModal } from "../components/PricingOfferModal";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


// ─── Data ───────────────────────────────────────────────────────────────────

// ─── Custom Animated Icons ──────────────────────────────────────────────────

const AnimatedIcon = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    whileHover={{ scale: 1.1, y: -2 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    className="relative flex items-center justify-center transform-gpu"
  >
    {children}
  </motion.div>
);

const webPlans = [
  {
    id: "starter",
    tier: "01",
    name: "Launchpad",
    tagline: "For early-stage startups & MVPs",
    price: 4499,
    originalPrice: 8999,
    period: "project",
    icon: (
      <AnimatedIcon>
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-current stroke-2">
          <path d="M4.5 9L12 3L19.5 9V21H4.5V9Z" />
          <path d="M9 21V12H15V21" />
        </svg>
      </AnimatedIcon>
    ),
    features: [
      "Custom Landing Architecture",
      "Mobile-First Fluid Layouts",
      "Up to 5 Core Interface Modules",
      "Headless CMS Protocol",
      "Post-Launch Support Cycle",
    ],
    cta: "Initiate Launchpad",
    link: "#contact",
  },
  {
    id: "growth",
    tier: "02",
    name: "Growth",
    tagline: "For scaling companies",
    price: 5999,
    originalPrice: 11999,
    period: "project",
    badge: "Most Popular",
    icon: (
      <AnimatedIcon>
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-current stroke-2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="M22 4L12 14.01l-3-3" />
        </svg>
      </AnimatedIcon>
    ),
    features: [
      "Full Product Architecture",
      "Advanced Motion Engineering",
      "Up to 15 Specialized Modules",
      "Enterprise CMS Integration",
      "API & Transactional Logic",
    ],
    cta: "Scale with Growth",
    link: "#contact",
  },
  {
    id: "enterprise",
    tier: "03",
    name: "Enterprise",
    tagline: "Fully custom systems",
    price: null,
    period: null,
    icon: (
      <AnimatedIcon>
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-current stroke-2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </AnimatedIcon>
    ),
    features: [
      "Global Infrastructure Setup",
      "Dedicated Engineering Squad",
      "Custom Design Ecosystem",
      "Unlimited Interface Modules",
      "Strategic Solution Architecture",
    ],
    cta: "Establish Oracle",
    link: "#contact",
  },
];

const mobilePlans = [
  {
    id: "app-starter",
    tier: "M1",
    name: "iOS App",
    tagline: "High-performance Apple ecosystems",
    price: 9999,
    originalPrice: 19999,
    period: "project",
    accent: "bg-white text-black",
    icon: (
      <AnimatedIcon>
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-current stroke-2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <path d="M12 18h.01" />
        </svg>
      </AnimatedIcon>
    ),
    features: [
      "Native Swift / SwiftUI Core",
      "Human Interface Principle Sync",
      "Optimized Apple Hardware API",
      "iCloud Ecosystem Protocol",
      "App Store Deployment Audit",
    ],
    cta: "Initiate iOS",
  },
  {
    id: "app-pro",
    tier: "M2",
    name: "Android App",
    tagline: "Global reach, native power",
    price: 14999,
    originalPrice: 29999,
    period: "project",
    badge: "Most Popular",
    accent: "bg-black text-white",
    icon: (
      <AnimatedIcon>
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-current stroke-2">
          <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 2 12 10 10 0 0 1 12 2z" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      </AnimatedIcon>
    ),
    features: [
      "Native Kotlin / Jetpack Core",
      "Material Design 3 Architecture",
      "Global Device Compatibility",
      "Google Ecosystem Integration",
      "Play Store Certification Audit",
    ],
    cta: "Initiate Android",
  },
  {
    id: "app-elite",
    tier: "M3",
    name: "Cross-Platform",
    tagline: "One codebase, total dominance",
    price: 19999,
    originalPrice: 39999,
    period: "project",
    accent: "bg-white text-black",
    icon: (
      <AnimatedIcon>
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-current stroke-2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </AnimatedIcon>
    ),
    features: [
      "React Native / Flutter Stack",
      "Universal Logic Integration",
      "Native-Bridge Performance",
      "Unified Multi-Store Sync",
      "Scalable Enterprise Core",
    ],
    cta: "Initiate Universal",
    link: "#contact",
  },
];

// ─── Sub-Components ─────────────────────────────────────────────────────────

function ArchitecturalBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-gray-50/30" />
  );
}

function SectionHeader({ title, subtitle, highlight }: { title: string; subtitle: string; highlight: string }) {
  return (
    <div className="mb-20 text-center">
      <motion.span 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-[9px] font-black uppercase tracking-[0.5em] text-black/20 mb-4 block"
      >
        {subtitle}
      </motion.span>
      
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-3xl md:text-5xl font-black tracking-tighter leading-none uppercase"
      >
        {title} <span className="text-gray-200">{highlight}.</span>
      </motion.h2>
    </div>
  );
}

function GridOverlay() {
  return (
    <div className="absolute inset-0 rounded-[3rem] pointer-events-none overflow-hidden opacity-[0.5] z-0">
      <div className="absolute inset-0" style={{ 
        backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)", 
        backgroundSize: "32px 32px" 
      }} />
    </div>
  );
}

function TracingBorder() {
  return (
    <div className="absolute inset-0 rounded-[3rem] pointer-events-none overflow-hidden z-0 border border-white/5 shadow-[inset_0_0_40px_rgba(255,255,255,0.02)]" />
  );
}

function PlanCard({ plan }: { plan: any }) {
  const navigate = useNavigate();
  const isDark = plan.accent?.includes('bg-black') || plan.tier === '02';
  const isPopular = plan.badge !== undefined;
  const containerRef = useRef<HTMLDivElement>(null);

  




  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "group relative flex flex-col rounded-[2.5rem] md:rounded-[3.5rem] p-7 md:p-12 gap-6 md:gap-8 transition-all duration-500 w-full will-change-transform transform-gpu overflow-hidden",
        isDark ? "bg-[#080808] text-white shadow-2xl z-10" : "bg-white text-black border border-black/5 hover:border-black/20 shadow-xl",
        isPopular && "ring-1 ring-emerald-500/20"
      )}
    >
      {!isDark && <GridOverlay />}
      {isDark && <TracingBorder />}
      
      {/* Popular Highlight Particle Effect */}
      {isPopular && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />

      )}



      {plan.badge && (
        <div className="absolute top-8 right-8 z-[2]">
          <motion.span 
            animate={{ opacity: 1, scale: 1 }}

            className={cn(
              "px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border",
              isDark ? "bg-emerald-500 text-black border-emerald-400" : "bg-black text-white border-black"
            )}
          >
            <Zap className="w-3 h-3 fill-current" />
            {plan.badge}
          </motion.span>
        </div>
      )}

      <div className="flex justify-between items-start relative z-[2]">
        <div className="flex flex-col gap-5">
          <motion.div 
            whileHover={{ rotate: [0, -15, 15, 0], scale: 1.15, y: -5 }}
            className={cn("w-14 h-14 rounded-[1.25rem] flex items-center justify-center border transition-shadow shadow-sm", isDark ? "bg-white/10 border-white/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]" : "bg-black/5 border-black/10")}
          >
            {plan.icon}
          </motion.div>
          <div>
            <div className="text-[10px] font-black tracking-[0.5em] uppercase opacity-30 mb-1 italic">STRAT_SUITE_{plan.tier}</div>
            <h3 className="text-2xl md:text-4xl font-black tracking-tighter mb-1 leading-none uppercase">{plan.name}</h3>
          </div>
        </div>
        <div className={cn("text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg border", isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/5")}>
          Tier {plan.tier}
        </div>
      </div>

      <div className="py-6 border-y border-current/10 flex flex-col gap-3 relative z-[2]">
        {plan.price ? (
          <div className="flex flex-col">
            <div className="flex items-center gap-4 mb-1">
               <span className="text-red-500 line-through text-xs font-bold decoration-1 opacity-60">₹{plan.originalPrice.toLocaleString()}</span>
                <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-md border border-emerald-500/20">
                  Save 50%
                </div>
            </div>
            <div className="flex items-baseline gap-2">
               <span className={cn("text-3xl md:text-4xl font-black tracking-tighter transition-all", isPopular ? "text-emerald-500" : "text-current")}>
                 ₹{plan.price.toLocaleString()}
               </span>
               <span className="text-xs font-black uppercase opacity-20">/ {plan.period}</span>
            </div>
          </div>
        ) : (
          <span className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">Call Unit</span>
        )}
      </div>

      <ul className="flex flex-col gap-4 flex-1 relative z-[2]">
        {plan.features.map((f: string, i: number) => (
          <li 
            key={i} 
            className="flex items-start gap-4 text-[11px] md:text-xs font-bold leading-tight group/item hover:translate-x-1 transition-transform duration-300"
          >
            <div className={cn("w-2 h-2 rounded-full shrink-0 mt-0.5 transition-all outline outline-offset-2 outline-transparent group-hover/item:outline-current/20", isDark ? "bg-white/40 group-hover/item:bg-white" : "bg-black/20 group-hover/item:bg-black font-black")} />
            <span className="opacity-50 group-hover:opacity-100 transition-opacity uppercase tracking-tight">{f}</span>
          </li>
        ))}
      </ul>

      <div className="relative z-[2] mt-2">
        <div 
          onClick={() => navigate('/contact')}
          className="block w-full cursor-pointer"
        >
          <LiquidGlassButton isDark={isDark} className={cn("w-full py-6 rounded-[1.75rem] transition-all", isPopular && "shadow-[0_20px_40px_rgba(16,185,129,0.2)]")}>
            <span className="flex items-center justify-center gap-4 text-[11px] font-black tracking-[0.5em] uppercase">
              {plan.cta}
              <MoveRight className={cn("w-5 h-5 group-hover:translate-x-2 transition-transform", isPopular && "text-emerald-400")} />
            </span>
          </LiquidGlassButton>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function Pricing() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const timer = setTimeout(() => setIsModalOpen(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SmoothScroll>
      <div className="min-h-screen w-full bg-white relative font-sans selection:bg-black selection:text-white overflow-x-hidden">
        <ArchitecturalBackground />
        <Navbar isLoaded={isLoaded} />

        <main className="relative z-10">
          {/* Hero Section */}
          <section className="pt-28 md:pt-48 pb-16 md:pb-32 px-6 text-center max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={isLoaded ? { opacity: 1 } : {}}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >

              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-8 md:mb-12 uppercase"
              >
                Product <br /> 
                <span className="text-gray-200">Values.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="max-w-xl mx-auto text-xl md:text-2xl font-medium text-black/40 leading-relaxed mb-16 italic"
              >
                “Architecting the next generation of digital excellence with precision and strategic depth.”
              </motion.p>
              
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 md:gap-8">
                <a href="#web">
                   <LiquidGlassButton className="px-8 md:px-12 py-5 md:py-6 w-full sm:w-auto">
                      <span className="text-xs font-black uppercase tracking-[0.5em]">Web Products</span>
                   </LiquidGlassButton>
                </a>
                <a href="#mobile" className="w-full sm:w-auto">
                   <div className="group w-full px-8 md:px-12 py-5 md:py-6 border border-black/10 rounded-full text-xs font-black uppercase tracking-[0.5em] hover:bg-black hover:text-white transition-all cursor-pointer flex items-center justify-center gap-4">
                      Mobile Apps
                      <MoveRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                   </div>
                </a>
              </div>
            </motion.div>
          </section>

          {/* Web Pricing Section */}
          <section id="web" className="px-4 md:px-6 py-20 md:py-40">
            <div className="max-w-7xl mx-auto">
              <SectionHeader 
                subtitle="ID_SUITE_WS_01"
                title="Web"
                highlight="Architecture"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
                {webPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            </div>
          </section>

          {/* Mobile Pricing Section */}
          <section id="mobile" className="px-4 md:px-6 py-20 md:py-40 bg-gray-50/40">
            <div className="max-w-7xl mx-auto">
              <SectionHeader 
                subtitle="ID_SUITE_MS_02"
                title="Mobile"
                highlight="Engineering"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
                {mobilePlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            </div>
          </section>

          <section className="px-6 py-20 md:py-40 text-center">
             <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto"
             >
                <h2 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter uppercase mb-6 md:mb-10">Beyond the standard?</h2>
                <p className="text-base md:text-xl lg:text-2xl text-black/30 font-medium mb-8 md:mb-12">For specialized R&D or end-to-end product labs, let's establish a direct channel.</p>
                <div
                  onClick={() => navigate('/contact')}
                  className="cursor-pointer inline-block"
                >
                   <LiquidGlassButton className="px-10 md:px-16 py-6 md:py-8 w-full sm:w-auto">
                      <span className="text-xs md:text-sm font-black tracking-[0.4em] md:tracking-[0.6em]">Establish Contact</span>
                   </LiquidGlassButton>
                </div>
             </motion.div>
          </section>
        </main>

        <Footer />
        
        <PricingOfferModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onConfirm={() => setIsModalOpen(false)} 
        />
      </div>
    </SmoothScroll>
  );
}

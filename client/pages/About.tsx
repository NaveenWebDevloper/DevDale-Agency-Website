import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useInView,
  AnimatePresence,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import Lenis from "lenis";
import { lazy, Suspense } from "react";
const CurvedLoop = lazy(() => import("../components/CurvedLoop"));
import PageSkeletonLoader from "../components/PageSkeletonLoader";

/* ══════════════════════════════════════════════
   LENIS SMOOTH SCROLL HOOK
══════════════════════════════════════════════ */
function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
}

/* ══════════════════════════════════════════════
   ANIMATED SVG ICONS
══════════════════════════════════════════════ */
function ZapIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
      <motion.path
        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
        stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: active ? 1 : 0.4, opacity: active ? 1 : 0.7 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </svg>
  );
}

function ShieldIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
      <motion.path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: active ? 1 : 0.5 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
      <motion.path
        d="M9 12l2 2 4-4"
        stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      />
    </svg>
  );
}

function GlobeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
      <motion.circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={1.8}
        initial={{ pathLength: 0 }} animate={{ pathLength: active ? 1 : 0.5 }}
        transition={{ duration: 0.6 }}
      />
      <motion.path d="M2 12h20" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round"
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
      />
      <motion.path
        d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
        stroke="currentColor" strokeWidth={1.4} strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: active ? 1 : 0.4 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      />
    </svg>
  );
}

function UsersIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
      <motion.circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth={1.8}
        animate={{ scale: active ? [1, 1.1, 1] : 1 }} transition={{ duration: 0.4, repeat: active ? 0 : 0 }}
      />
      <motion.path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: active ? 1 : 0.4 }}
        transition={{ duration: 0.5, delay: active ? 0.1 : 0 }}
      />
      <motion.path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
        initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0.4 }}
        transition={{ duration: 0.3 }}
      />
    </svg>
  );
}

function CodeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
      <motion.path d="M16 18l6-6-6-6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        animate={{ x: active ? 2 : 0 }} transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      />
      <motion.path d="M8 6l-6 6 6 6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        animate={{ x: active ? -2 : 0 }} transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      />
    </svg>
  );
}

function LayersIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
      <motion.path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        animate={{ y: active ? -2 : 0 }} transition={{ duration: 0.35, type: "spring", stiffness: 300 }}
      />
      <motion.path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        animate={{ y: active ? 2 : 0 }} transition={{ duration: 0.35, delay: 0.08, type: "spring", stiffness: 300 }}
      />
      <motion.path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        initial={{ opacity: 0.4 }} animate={{ opacity: active ? 1 : 0.4 }}
        transition={{ duration: 0.3 }}
      />
    </svg>
  );
}

const ICONS = [ZapIcon, ShieldIcon, GlobeIcon, UsersIcon, CodeIcon, LayersIcon];

/* ══════════════════════════════════════════════
   SCROLL TEXT REVEAL — word clip-path
══════════════════════════════════════════════ */
function RevealText({ children, className = "", delay = 0 }: { children: string; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-15% 0px" });
  const words = children.split(" ");

  return (
    <div ref={ref} className={`flex flex-wrap gap-x-[0.3em] ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            className="inline-block"
            initial={{ y: "105%", opacity: 0 }}
            animate={isInView ? { y: "0%", opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: delay + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  );
}

function RevealLine({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        initial={{ y: "105%", opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   DATA
══════════════════════════════════════════════ */
const stats = [
  { value: "Day 1", label: "Full Ownership From" },
  { value: "Zero", label: "Compromises Tolerated" },
  { value: "∞", label: "Ambition Accepted" },
  { value: "100%", label: "Craft, Every Time" },
];

const values = [
  { Icon: ZapIcon,    title: "Speed Without Compromise",  body: "We move fast — but never at the cost of craft. Every pixel, every interaction earns its place.",                                     color: "#FBBF24", bg: "rgba(251,191,36,0.12)",  glow: "0 0 24px rgba(251,191,36,0.45)" },
  { Icon: ShieldIcon, title: "Precision Engineering",      body: "From USPTO-compliant patent drawings to production-grade systems, we operate at the highest technical standard.",             color: "#22D3EE", bg: "rgba(34,211,238,0.12)",  glow: "0 0 24px rgba(34,211,238,0.45)" },
  { Icon: GlobeIcon,  title: "Global Perspective",         body: "Our work spans continents. We understand that modern products need to work for the world, not just one market.",              color: "#A78BFA", bg: "rgba(167,139,250,0.12)", glow: "0 0 24px rgba(167,139,250,0.5)" },
  { Icon: UsersIcon,  title: "Partnership Over Service",   body: "We embed ourselves into your mission. Your success metrics become our success metrics — no exceptions.",                   color: "#FB7185", bg: "rgba(251,113,133,0.12)", glow: "0 0 24px rgba(251,113,133,0.45)" },
  { Icon: CodeIcon,   title: "Code as a Craft",            body: "Systems architected to scale, refactored to last. We write code that future engineers will thank us for.",                   color: "#4ADE80", bg: "rgba(74,222,128,0.12)",  glow: "0 0 24px rgba(74,222,128,0.45)" },
  { Icon: LayersIcon, title: "Design as Strategy",         body: "Every decision rooted in user psychology, conversion logic, and brand authority.",                                            color: "#FB923C", bg: "rgba(251,146,60,0.12)",  glow: "0 0 24px rgba(251,146,60,0.45)" },
];

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
export default function About() {
  const [loaded, setLoaded] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    const skeletonTimer = setTimeout(() => setShowSkeleton(false), 600);
    const loadTimer = setTimeout(() => setLoaded(true), 700);

    return () => {
      clearTimeout(skeletonTimer);
      clearTimeout(loadTimer);
    };
  }, []);

  useLenis();

  if (showSkeleton) {
    return <PageSkeletonLoader type="about" />;
  }

  return (
    <div className="bg-white min-h-screen max-w-[100vw] overflow-x-hidden">
      <Navbar isLoaded={loaded} />
      <HeroSection />
      <ManifestoSection />
      <StatsSection />
      <ValuesSection />
      <ClosingCTA />
      <Footer />
    </div>
  );
}

/* ══════════════════════════════════════════════
   HERO
══════════════════════════════════════════════ */
function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(700px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.05) 0%, transparent 65%)`;

  const words = ["We", "Build", "What", "Others", "Can't."];


  return (
    <motion.section
      ref={ref}
      onMouseMove={(e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); }}
      className="relative flex flex-col lg:flex-row items-center justify-center lg:items-center bg-black overflow-hidden pt-28 md:pt-32 pb-16 md:pb-0 min-h-[100svh]"
    >
      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <motion.div className="absolute inset-0 pointer-events-none z-10" style={{ background: spotlight }} />

      <div className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full py-8 lg:py-0">

        {/* Left — text */}
        <motion.div style={{ y: textY, opacity }} className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/[0.15] bg-white/[0.06] backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.04)]"
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8], boxShadow: ["0 0 0px #34d399", "0 0 8px #34d399", "0 0 0px #34d399"] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            />
            <span className="text-[9px] font-black uppercase tracking-[0.45em] text-white/60">Accepting Founding Clients</span>
            <span className="text-white/20 font-light">·</span>
            <span className="text-[9px] font-black uppercase tracking-[0.35em] text-emerald-400/80">Limited Spots Available</span>
          </motion.div>

          <h1 className="text-[13vw] md:text-[7.5vw] font-black tracking-tighter leading-[0.85] uppercase text-white">
            {words.map((word, i) => (
              <span key={i} className="overflow-hidden inline-block mr-[1.5vw]">
                <motion.span
                  className="inline-block"
                  initial={{ y: "115%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="text-white/35 text-base md:text-lg font-medium max-w-md leading-relaxed"
          >
            Not just another agency. We obsess over every detail so your product doesn't just launch — it becomes the benchmark others measure themselves against.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="flex flex-col items-start gap-2 pt-6"
          >
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/15">Scroll to explore</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}>
              <ChevronDown className="w-4 h-4 text-white/15" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right — Trio Team Cluster */}
        <motion.div
          style={{ y: imgY, opacity }}
          className="relative flex justify-center lg:justify-end mt-12 lg:mt-0"
        >
          <div className="relative w-[280px] sm:w-[320px] md:w-[480px] h-[400px] sm:h-[480px] md:h-[650px]">

            {/* Status Indicator — floats at top */}
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 z-40 bg-black border border-white/10 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: [0, -6, 0] }}
              transition={{ opacity: { duration: 0.8, delay: 1.2 }, y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 } }}
            >
              <motion.span
                className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              />
              <div>
                <div className="text-[7px] font-black uppercase tracking-widest text-white/30">Agency Status</div>
                <div className="text-[11px] font-black tracking-tight whitespace-nowrap">Collaborating Globally</div>
              </div>
            </motion.div>

            {/* Member 1 — Backend — middle left */}
            <FounderCard
              src="/NaveenImage.jpg"
              name="Naveen"
              role="Founder & Backend Engineer"
              className="absolute top-10 left-0 w-[160px] md:w-[220px] z-30"
              rotate={-5}
              delay={0.7}
              floatDelay={0}
            />

            {/* Member 2 — Frontend — top right */}
            <FounderCard
              src="/srikanthImage.jpeg"
              name="Srikanth"
              role="Co-Founder & Frontend"
              className="absolute top-24 right-0 w-[160px] md:w-[220px] z-20"
              rotate={4}
              delay={0.9}
              floatDelay={1}
            />

            {/* Member 3 — Designer — bottom center */}
            <FounderCard
              src="/karthikImage.png"
              name="Karthik"
              role="Co-Founder & Lead Designer"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[160px] md:w-[220px] z-30"
              rotate={-2}
              delay={1.1}
              floatDelay={2}
            />

            {/* Connecting visual noise */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              <svg className="w-full h-full opacity-10" viewBox="0 0 400 600">
                <motion.path
                  d="M100 150 Q 200 300 300 150"
                  stroke="white"
                  fill="none"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 1.5 }}
                />
                <motion.path
                  d="M300 200 Q 200 400 200 550"
                  stroke="white"
                  fill="none"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 1.8 }}
                />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ── Founder Card ─────────────────────────────────────────────── */
function FounderCard({
  src, name, role, className = "", rotate = 0, delay = 0, floatDelay = 0,
}: { src: string; name: string; role: string; className?: string; rotate?: number; delay?: number; floatDelay?: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useTransform(useSpring(my, { stiffness: 100, damping: 15 }), [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotY = useTransform(useSpring(mx, { stiffness: 100, damping: 15 }), [-0.5, 0.5], ["-6deg", "6deg"]);

  return (
    <motion.div
      ref={cardRef}
      className={`${className} aspect-[3/4] cursor-pointer`}
      initial={{ opacity: 0, scale: 0.88, rotate }}
      animate={{ opacity: 1, scale: 1, rotate }}
      transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={(e) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;
        mx.set((e.clientX - rect.left) / rect.width - 0.5);
        my.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d", perspective: "800px" }}
    >
      {/* Ghost frame behind */}
      <div className="absolute -inset-2 border border-white/[0.06] rounded-[1.5rem]" style={{ rotate: `${-rotate * 0.5}deg` }} />

      {/* Image */}
      <div className="relative w-full h-full rounded-[1.25rem] overflow-hidden border border-white/10 shadow-2xl">
        <img src={src} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {/* Name badge inside image at bottom */}
        <motion.div
          className="absolute bottom-3 left-3 right-3"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3.5 + floatDelay * 0.3, ease: "easeInOut", delay: floatDelay }}
          style={{ translateZ: "20px" } as any}
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2">
            <div className="text-[8px] font-black uppercase tracking-widest text-white/40">{role}</div>
            <div className="text-xs font-black text-white tracking-tight">{name}</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}


/* ══════════════════════════════════════════════
   MANIFESTO
══════════════════════════════════════════════ */
function ManifestoSection() {
  const lines = [
    "Your idea deserves better.",
    "Better than generic. Better than good.",
    "We build what inspires envy.",
    "Products your users can't stop talking about.",
    "That's the only standard we know.",
  ];

  return (
    <section className="relative py-20 md:py-40 bg-white overflow-hidden border-t border-black/5">

      <Suspense fallback={null}>
        <CurvedLoop
          marqueeText="Engineering Excellence ✦ Built Different ✦ Code is Craft ✦ Founding Clients Open ✦ Zero Compromises ✦ Launch Ready ✦"
          speed={1.6}
          curveAmount={200}
          direction="left"
          interactive
          className="curved-text-black"
          wrapperClassName=""
        />
      </Suspense>


      <div className="max-w-[1400px] mx-auto px-6 md:px-20 pt-8 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-20 items-start">

          {/* Manifesto lines */}
          <div className="lg:col-span-7 space-y-3">
            {lines.map((line, i) => (
              <ManifestoLine key={i} text={line} delay={i * 0.12} />
            ))}
          </div>

          {/* Story copy */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-5 space-y-8 lg:pt-16 lg:sticky lg:top-32"
          >
            <div className="flex items-center gap-3">
              <motion.span
                className="h-px bg-black"
                initial={{ width: 0 }}
                whileInView={{ width: 32 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              />
              <span className="text-[8px] font-black uppercase tracking-[0.5em] text-black/30">Our Story</span>
            </div>

            <RevealText
              className="text-2xl md:text-3xl font-black tracking-tighter text-black/70 leading-tight"
              delay={0.2}
            >
              Built to prove that a new agency can outshine everyone on day one.
            </RevealText>

            <RevealLine delay={0.4} className="text-base text-black/40 leading-relaxed">
              DevDale isn't here to be another vendor in your inbox. We're here because the market is saturated with agencies that over-promise and underdeliver — and founders deserve better. We're the team that stays up debugging so you don't have to.
            </RevealLine>

            <RevealLine delay={0.55} className="text-base text-black/40 leading-relaxed">
              We're accepting our founding clients right now — the select few who get our undivided attention, our best work, and a partnership that scales with their ambition. Is that you?
            </RevealLine>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Link to="/contact" className="inline-flex items-center gap-3 group mt-2">
                <span className="text-sm font-black uppercase tracking-widest border-b border-black pb-0.5">Start a Conversation</span>
                <motion.span
                  className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0"
                  whileHover={{ scale: 1.2, rotate: -15 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ManifestoLine({ text, delay }: { text: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden border-b border-black/[0.06] py-3 cursor-default group"
    >
      {/* Fill bar */}
      <motion.div
        className="absolute inset-0 bg-black origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.p
        className="relative z-10 text-2xl sm:text-4xl md:text-6xl font-black tracking-tighter leading-none"
        initial={{ x: -40, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : {}}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        style={{ color: hovered ? "#fff" : "rgba(0,0,0,0.08)", transition: "color 0.3s" }}
      >
        {text}
      </motion.p>
      {/* Arrow on hover */}
      <motion.span
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -10 }}
        transition={{ duration: 0.3 }}
      >
        <ArrowUpRight className="w-6 h-6 text-white" />
      </motion.span>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   STATS
══════════════════════════════════════════════ */
function StatsSection() {
  return (
    <section className="bg-black py-28 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              className="bg-black p-6 md:p-14 cursor-default"
            >
              <motion.div
                className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter text-white leading-none mb-3"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.06 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-[8px] font-black uppercase tracking-[0.45em] text-white/20">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   VALUES — Animated icons + fill cards
══════════════════════════════════════════════ */
function ValuesSection() {
  return (
    <section className="py-40 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-20">
        <div className="mb-20">
          <RevealLine delay={0} className="flex items-center gap-4 mb-6">
            <span className="w-8 h-px bg-black/20" />
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-black/30">What We Stand For</span>
          </RevealLine>
          <RevealText className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase" delay={0.1}>
            Our Values.
          </RevealText>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/[0.06]">
          {values.map((v, i) => (
            <ValueCard key={v.title} value={v} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ValueCard({ value, index }: { value: any; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative bg-white p-8 md:p-10 cursor-default overflow-hidden min-h-[280px] flex flex-col justify-between"
    >
      {/* Sweep fill from bottom */}
      <motion.div
        className="absolute inset-0 bg-zinc-950"
        initial={{ y: "100%" }}
        animate={{ y: hovered ? "0%" : "100%" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="relative z-10 space-y-5">
        {/* Animated icon box — colored */}
        <motion.div
          className="w-13 h-13 rounded-2xl flex items-center justify-center"
          style={{ width: 52, height: 52 }}
          animate={{
            backgroundColor: hovered ? value.bg : value.bg,
            boxShadow: hovered ? value.glow : "none",
            rotate: hovered ? [0, -6, 6, 0] : 0,
            scale: hovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.45, rotate: { duration: 0.5 } }}
        >
          {/* Colored border ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl border"
            animate={{ borderColor: hovered ? value.color + "60" : value.color + "25" }}
            transition={{ duration: 0.35 }}
            style={{ width: 52, height: 52, borderRadius: 16 }}
          />
          <div style={{ color: value.color }}>
            <value.Icon active={hovered} />
          </div>
        </motion.div>

        <motion.h3
          className="text-lg font-black tracking-tighter uppercase"
          animate={{ color: hovered ? "#fff" : "#000" }}
          transition={{ duration: 0.3 }}
        >
          {value.title}
        </motion.h3>

        <motion.p
          className="text-sm leading-relaxed"
          animate={{ color: hovered ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)" }}
          transition={{ duration: 0.3 }}
        >
          {value.body}
        </motion.p>
      </div>

      {/* Bottom index + color accent */}
      <div className="relative z-10 mt-6 flex items-center justify-between">
        <motion.div
          className="text-[8px] font-black uppercase tracking-widest"
          animate={{ color: hovered ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </motion.div>
        {/* Colored dot accent */}
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: value.color }}
          animate={{ opacity: hovered ? 1 : 0.4, scale: hovered ? 1.4 : 1 }}
          transition={{ duration: 0.35 }}
        />
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   CLOSING CTA
══════════════════════════════════════════════ */
function ClosingCTA() {
  const [btnHovered, setBtnHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.88, 1, 0.88]);

  return (
    <section ref={ref} className="py-48 bg-black overflow-hidden">
      <motion.div style={{ scale }} className="max-w-5xl mx-auto px-6 md:px-20 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-10"
        >
          <RevealLine delay={0} className="text-[8px] font-black uppercase tracking-[0.6em] text-white/20">
            Your Vision. Our Execution. Zero Compromises.
          </RevealLine>

          <div className="space-y-0">
            <RevealText className="text-6xl md:text-[8vw] font-black tracking-tighter leading-[0.85] uppercase text-white" delay={0.1}>
              Founding spots are
            </RevealText>
            <RevealText className="text-6xl md:text-[8vw] font-black tracking-tighter leading-[0.85] uppercase text-white/15" delay={0.2}>
              filling fast.
            </RevealText>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="pt-6"
          >
            <Link to="/contact">
              <motion.button
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
                whileTap={{ scale: 0.95 }}
                className="relative inline-flex items-center gap-4 px-10 py-5 rounded-full bg-white text-black text-sm font-black uppercase tracking-widest overflow-hidden"
              >
                <motion.span
                  className="absolute inset-0 bg-black"
                  initial={{ x: "-101%" }}
                  animate={{ x: btnHovered ? "0%" : "-101%" }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.span className="relative z-10" animate={{ color: btnHovered ? "#fff" : "#000" }} transition={{ duration: 0.3, delay: 0.15 }}>
                  Start a Project
                </motion.span>
                <motion.span
                  className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center"
                  animate={{ backgroundColor: btnHovered ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.07)", rotate: btnHovered ? 0 : -45 }}
                  transition={{ duration: 0.35 }}
                >
                  <ArrowUpRight className="w-4 h-4" style={{ color: btnHovered ? "#fff" : "#000" }} />
                </motion.span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

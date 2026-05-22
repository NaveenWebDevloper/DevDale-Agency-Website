import { useEffect, useState, useRef, forwardRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowUpRight } from "lucide-react";

interface NavbarProps {
  isLoaded: boolean;
}

const navItems = [
  { label: "Work",     path: "/#work",     anchor: "work" },
  { label: "About",    path: "/about",     anchor: null   },
  { label: "Services", path: "/#services", anchor: "services" },
  { label: "Approach", path: "/#approach", anchor: "approach" },
  { label: "Contact",  path: "/contact",   anchor: null       },
];

/* ── Magnetic button helper ──────────────────────────────────────── */
const MagneticBtn = forwardRef<
  HTMLButtonElement,
  { children: React.ReactNode; onClick: () => void; className?: string; "aria-label"?: string }
>(function MagneticBtn({ children, onClick, className, "aria-label": ariaLabel }, forwardedRef) {
  const innerRef = useRef<HTMLButtonElement>(null);
  const ref = (forwardedRef as React.RefObject<HTMLButtonElement>) ?? innerRef;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });
  const rectRef = useRef<DOMRect | null>(null);

  const handleMove = (e: React.MouseEvent) => {
    if (!rectRef.current && ref.current) {
      rectRef.current = ref.current.getBoundingClientRect();
    }
    const rect = rectRef.current;
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };
  const reset = () => {
    rectRef.current = null;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </motion.button>
  );
});


/* ── Dropdown nav item ───────────────────────────────────────────── */
function DropNavItem({ item, index, onClose }: { item: typeof navItems[0]; index: number; onClose: () => void }) {
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    onClose();
    if (item.anchor && (window.location.pathname === "/" || item.path === "#contact")) {
      e.preventDefault();
      document.getElementById(item.anchor)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.32, delay: index * 0.055, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={item.path}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex items-center justify-between px-5 py-3.5 group overflow-hidden"
      >
        {/* Slide-in background */}
        <motion.div
          className="absolute inset-0 bg-black"
          initial={{ x: "-100%" }}
          animate={{ x: hovered ? "0%" : "-100%" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />

        <div className="relative z-10 flex items-center gap-4">
          <span
            className="text-[9px] font-black tabular-nums transition-colors duration-300"
            style={{ color: hovered ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.18)" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className="text-base font-black tracking-tighter uppercase transition-colors duration-300"
            style={{ color: hovered ? "#fff" : "#000" }}
          >
            {item.label}
          </span>
        </div>

        <motion.div
          className="relative z-10"
          animate={{ rotate: hovered ? -45 : 0, opacity: hovered ? 1 : 0.2 }}
          transition={{ duration: 0.25 }}
        >
          <ArrowUpRight
            className="w-4 h-4 transition-colors duration-300"
            style={{ color: hovered ? "#fff" : "#000" }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* ── Main Navbar ─────────────────────────────────────────────────── */
export default function Navbar({ isLoaded }: NavbarProps) {
  const [scrolled, setScrolled]   = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close on outside click — but NOT when tapping the hamburger itself */
  const dropRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const outsideDrop    = dropRef.current    && !dropRef.current.contains(target);
      const outsideTrigger = triggerRef.current && !triggerRef.current.contains(target);
      if (outsideDrop && outsideTrigger) setIsMenuOpen(false);
    };
    if (isMenuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMenuOpen]);

  const handleCTAClick = () => {
    setIsMenuOpen(false);
    navigate("/contact");
  };

  return (
    <>
      <motion.nav
        className="fixed w-full top-0 z-[100] transition-all duration-700 pointer-events-none"
        initial={{ y: -100, opacity: 0 }}
        animate={isLoaded ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-8 pt-4 pointer-events-none">
          {/* Desktop Navbar layout (md and up) */}
          <div className="hidden md:flex items-center justify-between w-full h-16 relative">
            
            {/* Logo at Left End */}
            <div className="flex items-center pointer-events-auto">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="font-bold text-xl tracking-tighter group flex items-center gap-1 z-10"
              >
                <img src="/devdale_logo.svg" alt="TheDevDale Logo" className="w-12 h-12 object-contain" />
                <span>TheDevDale</span>
                <div className="w-1 h-1 rounded-full bg-black group-hover:scale-150 transition-transform duration-500" />
              </Link>
            </div>

            {/* Centered Navbar Capsule */}
            <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
              <div
                className={`flex items-center justify-center h-14 md:h-16 px-6 rounded-full border transition-all duration-500 ${
                  scrolled
                    ? "bg-white/80 backdrop-blur-xl border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                    : "bg-white/20 backdrop-blur-md border-black/5"
                }`}
              >
                <div className="flex items-center gap-1 lg:gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={(e) => {
                        if (item.anchor && (window.location.pathname === "/" || item.path === "#contact")) {
                          e.preventDefault();
                          document.getElementById(item.anchor)?.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="px-3 lg:px-4 py-2 text-[9px] lg:text-[10px] font-bold tracking-[0.15em] lg:tracking-[0.2em] uppercase opacity-40 hover:opacity-100 hover:bg-black/5 rounded-full transition-all duration-300 hover:-translate-y-0.5"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop CTA Button at Right End */}
            <div className="flex items-center pointer-events-auto">
              <Button 
                onClick={handleCTAClick}
                className="px-6 h-10 bg-black text-white rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
              >
                Start Building
              </Button>
            </div>

          </div>

          {/* Mobile Navbar layout (below md) */}
          <div className="flex md:hidden items-center justify-between w-full pointer-events-auto">
            <div
              className={`flex items-center justify-between h-14 px-4 rounded-full border transition-all duration-500 w-full overflow-hidden ${
                scrolled || isMenuOpen
                  ? "bg-white/80 backdrop-blur-xl border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                  : "bg-white/20 backdrop-blur-md border-black/5"
              }`}
            >
              {/* Logo */}
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="font-bold text-lg tracking-tighter group flex items-center gap-1 z-10"
              >
                <img src="/devdale_logo.svg" alt="TheDevDale Logo" className="w-10 h-10 object-contain" />
                <span>TheDevDale</span>
                <div className="w-1 h-1 rounded-full bg-black group-hover:scale-150 transition-transform duration-500" />
              </Link>

              {/* Mobile toggle — magnetic */}
              <MagneticBtn
                ref={triggerRef}
                onClick={() => setIsMenuOpen((v) => !v)}
                className="relative z-[110] w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none rounded-full bg-black/5"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                <motion.span
                  className="block w-5 h-0.5 bg-black origin-center"
                  animate={isMenuOpen ? { rotate: 45, y: 3 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.span
                  className="block w-5 h-0.5 bg-black origin-center"
                  animate={isMenuOpen ? { rotate: -45, y: -3 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              </MagneticBtn>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ── Dropdown card (mobile only) ─────────────────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={dropRef}
            key="mobile-menu"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top right" }}
            className="fixed top-[76px] right-4 z-[99] w-[260px] md:hidden pointer-events-auto
                       bg-white/90 backdrop-blur-2xl rounded-3xl border border-black/[0.06]
                       shadow-[0_24px_64px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)]
                       overflow-hidden"
          >
            {/* Top accent bar */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />

            {/* Nav items */}
            <div className="py-2">
              {navItems.map((item, i) => (
                <DropNavItem
                  key={item.label}
                  item={item}
                  index={i}
                  onClose={() => setIsMenuOpen(false)}
                />
              ))}
            </div>

            {/* Divider */}
            <div className="mx-5 h-px bg-black/[0.06]" />

            {/* CTA at bottom */}
            <motion.div
              className="p-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={handleCTAClick}
                className="flex items-center justify-between w-full px-5 py-3.5 bg-black text-white rounded-2xl group"
              >
                <span className="text-xs font-black uppercase tracking-widest">Start Building</span>
                <motion.div
                  whileHover={{ rotate: -45, scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

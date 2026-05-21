import { motion, Variants, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { projects } from "../lib/projects";
import { TechIcon } from "./TechIcon";
import { ArrowUpRight } from "lucide-react";

interface PortfolioProps {
  isLoaded?: boolean;
}

export default function Portfolio({ isLoaded = true }: PortfolioProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section id="work" className="relative w-full py-32 bg-white overflow-hidden scroll-mt-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isLoaded ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-balance">
              Selected <span className="text-gray-400">Works</span>.
            </h2>
          </motion.div>

          <Link
            to="/projects"
            className="group flex items-center gap-4 text-xl font-bold tracking-tight pb-2 border-b border-black/10 hover:border-black transition-all cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isLoaded ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex items-center gap-4"
            >
              View All Projects
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </motion.div>
          </Link>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              whileInView="visible"
              viewport={{ once: true, margin: "0px", amount: 0.1 }}
              className={idx % 2 !== 0 ? "md:translate-y-24" : ""}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: any }) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  // Mouse-tracking tilt
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 120, damping: 18 });
  const springY = useSpring(rawY, { stiffness: 120, damping: 18 });
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-4deg", "4deg"]);
  const rotateX = useTransform(springY, [-0.5, 0.5], ["4deg", "-4deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    if (!rectRef.current) {
      rectRef.current = cardRef.current.getBoundingClientRect();
    }
    const rect = rectRef.current;
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    rectRef.current = null;
    rawX.set(0);
    rawY.set(0);
    setHovered(false);
  };

  return (
    <Link to={`/work/${project.id}`}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          perspective: "1200px",
        }}
        className="relative flex flex-col rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-white border border-black/[0.05] h-[550px] md:h-[750px] cursor-pointer"
        animate={{
          boxShadow: hovered
            ? "0 32px 80px -12px rgba(0,0,0,0.18), 0 0 0 1.5px rgba(0,0,0,0.05)"
            : "0 1px 12px rgba(0,0,0,0.05)",
          y: hovered ? -6 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── Image Section ── */}
        <div className="basis-[40%] md:basis-[45%] p-2 md:p-4">
          <div className="w-full h-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden relative">
            {/* Image with zoom */}
            <motion.img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
              animate={{ scale: hovered ? 1.08 : 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Sheen sweep on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: hovered ? "160%" : "-100%" }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Category badge inside image — top-left */}
            <div className="absolute top-3 left-3">
              <motion.span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black tracking-[0.3em] uppercase backdrop-blur-md"
                animate={{
                  backgroundColor: hovered ? "rgba(0,0,0,0.85)" : "rgba(236,253,245,0.9)",
                  color: hovered ? "#fff" : "#047857",
                  borderColor: hovered ? "rgba(255,255,255,0.1)" : "rgba(167,243,208,0.5)",
                  letterSpacing: hovered ? "0.4em" : "0.3em",
                }}
                style={{ border: "1px solid" }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.span
                  className="w-1 h-1 rounded-full inline-block flex-shrink-0"
                  animate={{ backgroundColor: hovered ? "rgba(255,255,255,0.6)" : "#10b981" }}
                />
                {project.category}
              </motion.span>
            </div>

            <div className="absolute inset-0 bg-black/[0.03] pointer-events-none" />
          </div>
        </div>

        {/* ── Content Section ── */}
        <div className="basis-[60%] md:basis-[55%] p-6 md:p-12 flex flex-col justify-between">
          <div>
            {/* Title — slides up slightly on hover */}
            <motion.h3
              className="text-3xl md:text-5xl font-black tracking-tighter mb-3 md:mb-4 leading-none uppercase"
              animate={{ y: hovered ? -3 : 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {project.title}
            </motion.h3>

            {/* Description — brightens and shifts on hover */}
            <motion.p
              className="text-sm md:text-lg font-medium leading-tight line-clamp-3"
              animate={{
                color: hovered ? "rgba(0,0,0,0.55)" : "rgba(156,163,175,1)",
                y: hovered ? -2 : 0,
              }}
              transition={{ duration: 0.4, delay: hovered ? 0.05 : 0 }}
            >
              {project.description}
            </motion.p>

            {/* Animated divider line that grows on hover */}
            <motion.div
              className="mt-4 md:mt-6 h-px bg-black origin-left"
              animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 0.08 : 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between pt-6 md:pt-10 border-t border-black/5">

            {/* TechIcon + client — icon spins on hover */}
            <motion.div
              className="flex items-center gap-3 md:gap-4"
              animate={{ x: hovered ? 3 : 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-black/5 flex items-center justify-center text-black"
                animate={{
                  backgroundColor: hovered ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.05)",
                  rotate: hovered ? 360 : 0,
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <TechIcon
                  type={project.category.toLowerCase().includes("saas") ? "code" : "innovation"}
                  className="w-5 h-5 md:w-6 md:h-6"
                  style={{ filter: hovered ? "invert(1)" : "none", transition: "filter 0.3s" } as React.CSSProperties}
                />
              </motion.div>
              <div className="flex flex-col">
                <motion.span
                  className="text-[9px] font-black tracking-widest uppercase"
                  animate={{ opacity: hovered ? 0.5 : 0.3 }}
                >
                  Visionary
                </motion.span>
                <motion.span
                  className="text-xs md:text-sm font-black tracking-tight"
                  animate={{ opacity: hovered ? 1 : 0.7 }}
                >
                  {project.client.name.split(" ")[0]}
                </motion.span>
              </div>
            </motion.div>

            {/* CTA Button — magnetic snap + arrow rotate */}
            <motion.div
              className="relative flex items-center gap-2 md:gap-2.5 px-5 py-3 md:px-7 md:py-4 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase overflow-hidden"
              animate={{
                backgroundColor: hovered ? "#000" : "rgba(0,0,0,1)",
                scale: hovered ? 1.06 : 1,
              }}
              whileTap={{ scale: 0.93 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ color: "#fff" }}
            >
              {/* Fill ripple — expands from center on hover */}
              <motion.span
                className="absolute inset-0 bg-white rounded-full"
                initial={{ scale: 0, opacity: 0 }}
                animate={hovered ? { scale: 2.5, opacity: 0.08 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
              />

              <span className="relative z-10">View</span>

              {/* Arrow — rotates from → to ↗ */}
              <motion.span
                className="relative z-10 flex items-center"
                animate={{ rotate: hovered ? -45 : 0, x: hovered ? 1 : 0, y: hovered ? -1 : 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </motion.span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

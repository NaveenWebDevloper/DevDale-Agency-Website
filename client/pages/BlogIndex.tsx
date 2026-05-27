import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { blogPages, contentCalendar, contentClusters, internalLinkMap, keywordMap, seoArticleIdeas, SEOPage } from "@/lib/seo";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { SmoothScroll } from "@/components/SmoothScroll";
import GradualBlur from "@/components/GradualBlur";

function getImageForBlog(eyebrow: string, path: string): string {
  const normalized = eyebrow.toLowerCase();
  if (normalized.includes("ai")) {
    if (path.includes("chatbot")) return "/challenge_technical_expertise.webp";
    return "/challenge_inefficient_processes.webp";
  }
  if (normalized.includes("seo")) {
    if (path.includes("speed")) return "/challenge_demands.webp";
    return "/challenge_visibility.webp";
  }
  if (normalized.includes("web")) {
    if (path.includes("performance")) return "/webdevvideoimage.webp";
    return "/challenge_branding.webp";
  }
  return "/devdale_logo.svg";
}

function getVideoForBlog(eyebrow: string, path: string): string {
  const normalized = eyebrow.toLowerCase();
  if (normalized.includes("ai")) {
    return "/3rdvideo.mp4";
  }
  if (normalized.includes("seo")) {
    return "/4thvideo.mp4";
  }
  if (normalized.includes("web")) {
    return "/webdevvideo.mp4";
  }
  return "/webdevvideo.mp4";
}

interface BlogCardProps {
  page: SEOPage;
  variants: Variants;
}

function BlogCard({ page, variants }: BlogCardProps) {
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
      whileHover="hover"
      className="flex"
    >
      <Link 
        to={page.path}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group w-full bg-white border border-black/[0.04] rounded-[2.5rem] p-6 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] flex flex-col transition-all duration-500 ease-out relative overflow-hidden h-full"
      >
        {/* Relatable Visual Image/Video Box exactly modeled after the services/solutions aesthetics */}
        <div className="aspect-[16/10] w-full bg-zinc-50 rounded-[2rem] overflow-hidden relative mb-6 border border-black/[0.02] flex items-center justify-center">
          {/* Cover image (fades out slightly on hover) */}
          <img
            loading="lazy"
            src={getImageForBlog(page.eyebrow, page.path)}
            alt={page.h1}
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
            src={getVideoForBlog(page.eyebrow, page.path)}
            muted
            loop
            playsInline
            autoPlay={isMobile}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none ${
              isMobile || isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        <div className="flex flex-col flex-grow">
          {/* Eyebrow Pill Badge */}
          <span className="inline-block self-start px-3 py-1.5 bg-indigo-50 text-[9px] font-black uppercase tracking-widest text-indigo-500 rounded-full mb-4">
            {page.eyebrow}
          </span>

          {/* Blog Title */}
          <h3 className="text-2xl font-bold tracking-tight text-[#18181b] leading-snug group-hover:text-black transition-colors duration-500 mb-3 font-display">
            {page.h1}
          </h3>

          {/* Blog Description Bouncy animation inside Card */}
          <motion.p
            variants={{
              hover: {
                y: -6,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 10,
                }
              }
            }}
            className="text-gray-400 text-sm leading-relaxed mb-6 font-medium group-hover:text-[#27272a] transition-colors duration-500"
          >
            {page.description}
          </motion.p>
        </div>

        {/* Read Article Trigger link */}
        <div className="mt-auto pt-4 border-t border-black/[0.03] flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">
          <span>Read Guide</span>
          <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </Link>
    </motion.div>
  );
}

export default function BlogIndex() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-white text-black relative">
        <Navbar isLoaded />

        
        {/* Decorative premium ambient glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-[120px] pointer-events-none z-0" />
        
        <main className="px-6 pb-28 pt-32 md:px-12 md:pt-44 relative z-10">
          
          {/* Section Header */}
          <section className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-black/[0.08] bg-[#F5F5F7] mb-8 shadow-sm"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-black">Content SEO System</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="max-w-5xl text-5xl font-bold uppercase tracking-tighter md:text-8xl leading-none"
            >
              Web Development, <span className="text-gray-400">SEO</span> <br />
              And <span className="text-indigo-600">AI</span> Growth Guides
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-8 max-w-2xl text-xl md:text-2xl text-gray-500 font-medium leading-relaxed"
            >
              Topical authority clusters, keyword mapping, internal links, and AI search ready content engineered for organic lead generation.
            </motion.p>
          </section>

          {/* Content Clusters Staggered section */}
          <section className="mx-auto mt-24 max-w-7xl">
            <h2 className="mb-10 text-3xl font-bold tracking-tighter uppercase">Pillar Clusters</h2>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid gap-8 md:grid-cols-3"
            >
              {contentClusters.map((cluster, cidx) => (
                <motion.article 
                  key={cluster.cluster} 
                  variants={itemVariants}
                  className="bg-[#FBFBFB] border border-black/[0.04] p-8 rounded-[2.5rem] shadow-sm hover:shadow-md hover:bg-white transition-all duration-500 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold tracking-tighter uppercase">{cluster.cluster}</h3>
                      <span className="text-[10px] font-black opacity-30">Cluster 0{cidx + 1}</span>
                    </div>
                    <ul className="space-y-3.5 mb-8">
                      {cluster.supporting.map((item) => (
                        <li key={item} className="flex items-center gap-3 text-sm font-semibold text-gray-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link to={cluster.pillar} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-black transition-colors">
                    Go to Pillar Page <ArrowUpRight size={14} />
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          </section>

          {/* Dynamic Guides Grid (Highly attractive with relatable images, hover videos and smooth micro-animations) */}
          <section className="mx-auto mt-28 max-w-7xl">
            <h2 className="mb-10 text-3xl font-bold tracking-tighter uppercase">Recent Guides & Strategy Papers</h2>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {blogPages.map((page) => (
                <BlogCard
                  key={page.path}
                  page={page}
                  variants={itemVariants}
                />
              ))}
            </motion.div>
          </section>

          {/* 100 SEO Article Ideas Section */}
          <section className="mx-auto mt-32 max-w-7xl">
            <h2 className="mb-10 text-3xl font-bold tracking-tighter uppercase">100 Programmatic Content Anchors</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {seoArticleIdeas.map((idea, index) => (
                <div key={idea} className="border border-black/[0.05] bg-[#FBFBFB] p-5 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-white hover:border-indigo-500/20 hover:text-black transition-all duration-300">
                  <span className="mr-3 text-indigo-500/40 font-bold tabular-nums">{String(index + 1).padStart(3, "0")}</span>
                  {idea}
                </div>
              ))}
            </div>
          </section>

          {/* Technical SEO Data Maps */}
          <section className="mx-auto mt-32 grid max-w-7xl gap-8 lg:grid-cols-3">
            <DataPanel title="Keyword Map" rows={keywordMap.slice(0, 12).map((item) => `${item.url}: ${item.primaryKeyword}`)} />
            <DataPanel title="Content Calendar" rows={contentCalendar.slice(0, 12).map((item) => `Week ${item.week}: ${item.title}`)} />
            <DataPanel title="Internal Linking Map" rows={internalLinkMap.slice(0, 12).map((item) => `${item.from} -> ${item.to.join(", ")}`)} />
          </section>
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}

function DataPanel({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="border border-black/[0.05] bg-[#FBFBFB] p-8 rounded-[2.5rem]">
      <h2 className="mb-6 text-2xl font-bold uppercase tracking-tighter">{title}</h2>
      <div className="space-y-4">
        {rows.map((row) => (
          <p key={row} className="border-b border-black/[0.04] pb-4 text-xs font-semibold leading-relaxed text-gray-500 last:border-b-0 last:pb-0">
            {row}
          </p>
        ))}
      </div>
    </div>
  );
}

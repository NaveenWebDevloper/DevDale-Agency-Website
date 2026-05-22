import { projects } from "../lib/projects";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MoveRight, Layers, LayoutGrid, Globe, Zap, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { SmoothScroll } from "../components/SmoothScroll";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";
import PageSkeletonLoader from "../components/PageSkeletonLoader";

export default function Projects() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const skeletonTimer = setTimeout(() => setShowSkeleton(false), 600);
    const loadTimer = setTimeout(() => setIsLoaded(true), 700);

    return () => {
      clearTimeout(skeletonTimer);
      clearTimeout(loadTimer);
    };
  }, []);

  const categories = Array.from(new Set(projects.map(p => p.category)));

  // Filter projects by both taxonomy category and case-insensitive search text
  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === "All" || project.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (showSkeleton) {
    return <PageSkeletonLoader type="projects" />;
  }

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white max-w-full">
        <Navbar isLoaded={isLoaded} />
        
        <main className="pt-32 lg:pt-40">
          {/* Hero Header - Inspired by Detail View */}
          <section className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 mb-24">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-end">
                <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Index</span>
                      <div className="w-1 h-1 rounded-full bg-black/10" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black">Global Archive</span>
                   </div>
                   <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-[9rem] font-black tracking-tighter leading-[0.8] uppercase">
                      Selected <br /> <span className="text-gray-200">Narratives.</span>
                   </h1>
                </div>
                <div className="lg:col-span-5 xl:col-span-4 pb-4">
                   <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-black/5 space-y-4">
                      <div className="flex items-center justify-between">
                         <div className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">Total Deployments</div>
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="text-5xl font-black tracking-tighter uppercase">{projects.length} Projects</div>
                      <p className="text-[10px] font-bold text-black/40 leading-relaxed uppercase">
                         Architecting digital excellence through systematic engineering and strategic design.
                      </p>
                   </div>
                </div>
             </div>
          </section>

          {/* Architectural Layout Grid */}
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 py-20 border-t border-black/5 relative items-start">
            
            {/* Left Sidebar - Sticky Filters (Hidden on Mobile to match ProjectDetail.tsx sidebar standard) */}
            <aside className="hidden lg:block lg:col-span-2 self-stretch">
               <div className="sticky top-32 space-y-12">
                  <div className="space-y-8">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Taxonomies</h3>
                     <ul className="space-y-4">
                        <li 
                           onClick={() => setSelectedCategory("All")}
                           className={cn(
                              "flex items-center gap-3 text-[11px] font-black uppercase tracking-widest cursor-pointer group transition-colors",
                              selectedCategory === "All" ? "text-emerald-500 font-black" : "text-black/40 hover:text-black"
                           )}
                        >
                           <LayoutGrid className={cn("w-3 h-3 transition-opacity", selectedCategory === "All" ? "opacity-100" : "opacity-20 group-hover:opacity-100")} /> All Works
                        </li>
                        {categories.map((cat, i) => (
                           <li 
                              key={i} 
                              onClick={() => setSelectedCategory(cat)}
                              className={cn(
                                 "flex items-center gap-3 text-[11px] font-black uppercase tracking-widest cursor-pointer group transition-colors",
                                 selectedCategory === cat ? "text-emerald-500 font-black" : "text-black/40 hover:text-black"
                              )}
                           >
                              <div className={cn("w-1 h-1 rounded-full bg-current transition-opacity", selectedCategory === cat ? "opacity-100" : "opacity-20 group-hover:opacity-100")} /> {cat}
                           </li>
                        ))}
                     </ul>
                  </div>

                  <div className="pt-12 border-t border-black/5 space-y-8">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Project Search</h3>
                     <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-20 group-hover:opacity-100 transition-opacity" />
                        <input 
                           type="text" 
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           placeholder="Filter Index..." 
                           className="w-full bg-gray-50 border border-black/5 rounded-xl px-10 py-3.5 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-black/20 transition-all"
                        />
                     </div>
                  </div>
               </div>
            </aside>

            {/* Middle Column - Dynamic Project List */}
            <article className="lg:col-span-7 space-y-20 lg:space-y-32 h-full">
               
               {/* Mobile-only Taxonomies & Search (lg:hidden) */}
               <div className="lg:hidden space-y-6 pb-8 border-b border-black/5">
                  <div className="space-y-3">
                     <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-black/25">Project Search</h3>
                     <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-20" />
                        <input 
                           type="text" 
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           placeholder="Filter Index..." 
                           className="w-full bg-gray-50 border border-black/5 rounded-xl px-10 py-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-black/20 transition-all"
                        />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-black/25">Taxonomies</h3>
                     <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-6 px-6">
                        <button 
                           onClick={() => setSelectedCategory("All")}
                           className={cn(
                              "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                              selectedCategory === "All"
                                 ? "bg-black text-white border-black"
                                 : "bg-gray-50 text-black/40 border-black/5 hover:text-black"
                           )}
                        >
                           All Works
                        </button>
                        {categories.map((cat, i) => (
                           <button 
                              key={i}
                              onClick={() => setSelectedCategory(cat)}
                              className={cn(
                                 "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                                 selectedCategory === cat
                                    ? "bg-black text-white border-black"
                                    : "bg-gray-50 text-black/40 border-black/5 hover:text-black"
                              )}
                           >
                              {cat}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Project Cards with dynamic filtering transitions */}
               <div className="space-y-20 lg:space-y-32">
                  <AnimatePresence mode="popLayout">
                     {filteredProjects.length === 0 ? (
                        <motion.div 
                           key="no-results"
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -20 }}
                           transition={{ duration: 0.5 }}
                           className="py-20 text-center space-y-6 bg-gray-50/50 rounded-[2.5rem] border border-black/5 p-8"
                        >
                           <div className="text-sm font-black uppercase tracking-widest text-black/40">No Narrative Matches Found</div>
                           <p className="text-[10px] font-bold text-black/35 leading-relaxed uppercase max-w-sm mx-auto">
                              No projects currently match your active filters or text criteria. Try adjusting your query parameters or resetting.
                           </p>
                           <button 
                              onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                              className="px-8 py-3.5 rounded-full bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] hover:-translate-y-1 hover:shadow-xl active:scale-95 transition-all duration-300"
                           >
                              Reset Index Filters
                           </button>
                        </motion.div>
                     ) : (
                        filteredProjects.map((project, i) => (
                           <motion.div
                              key={project.id}
                              layout
                              initial={{ opacity: 0, y: 50 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, margin: "-100px" }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.6 }}
                              className="group"
                           >
                              <Link to={`/work/${project.id}`} className="block space-y-12">
                                 <div className="relative aspect-[16/9] rounded-[3.5rem] overflow-hidden bg-gray-50 border border-black/5 shadow-sm group-hover:shadow-2xl transition-all duration-[1.5s]">
                                    <img 
                                       src={project.image} 
                                       alt={project.title}
                                       className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[2s] scale-100 group-hover:scale-105"
                                    />
                                    <div className="absolute top-8 right-8 px-5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-[9px] font-black uppercase tracking-widest shadow-xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                       View Narrative
                                    </div>
                                 </div>

                                 <div className="px-4 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                                    <div className="md:col-span-8 space-y-4">
                                       <h3 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none group-hover:translate-x-4 transition-transform duration-700">{project.title}</h3>
                                       <p className="max-w-md text-sm font-medium text-black/40 italic leading-relaxed">
                                          {project.description}
                                       </p>
                                    </div>
                                    <div className="md:col-span-4 flex flex-col items-end gap-3 text-right">
                                       <span className="px-3 py-1 rounded-full bg-black text-white text-[8px] font-black uppercase tracking-[0.3em]">{project.category}</span>
                                       <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20">ID_REF_{project.id.toUpperCase().replace('-', '_')}</div>
                                    </div>
                                 </div>
                              </Link>
                           </motion.div>
                        ))
                     )}
                  </AnimatePresence>
               </div>

               {/* Large Call to Action */}
               <div className="py-20 border-t border-black/5 text-center space-y-12">
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.85]">Ready to <br /> Architect Yours?</h2>
                  <button 
                    onClick={() => navigate("/contact")}
                    className="inline-block group px-16 py-8 rounded-full bg-black text-white text-[12px] font-black uppercase tracking-[0.4em] flex items-center gap-6 shadow-2xl hover:-translate-y-2 hover:shadow-black/10 hover:bg-zinc-800 transition-all duration-300 active:scale-95"
                  >
                     Start Your Project
                     <MoveRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </button>
               </div>
            </article>

            {/* Right Sidebar - Sticky Stats & Tech (Hidden on Mobile to match ProjectDetail.tsx sidebar standard) */}
            <aside className="hidden lg:block lg:col-span-3 self-stretch">
               <div className="sticky top-32 space-y-16">
                  <div className="space-y-8 pb-12 border-b border-black/5">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/20">Selected Domains</h3>
                     <div className="flex flex-wrap gap-2">
                        {['Fintech', 'Agri-Tech', 'SaaS', 'Web3', 'E-commerce', 'AI/ML'].map((tag, i) => (
                           <span key={i} className="px-3 py-1.5 rounded-lg bg-gray-50 border border-black/5 text-[9px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all cursor-default">
                              {tag}
                           </span>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-8 pb-12 border-b border-black/5">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/20">Agency Philosophy</h3>
                     <p className="text-[11px] font-bold text-black/40 leading-relaxed uppercase tracking-tight italic">
                        "We do not build interfaces; <br /> we architect digital ecosystems that drive fundamental market transformations."
                     </p>
                  </div>

                  <div className="space-y-10">
                      <div className="flex items-center gap-6 group">
                         <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform">
                            <Globe className="w-5 h-5" />
                         </div>
                         <div>
                            <div className="text-[10px] font-black uppercase tracking-widest mb-1">Global Reach</div>
                            <div className="text-[11px] font-bold opacity-40 uppercase tracking-tighter italic">20+ Deployment Zones</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-6 group">
                         <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center shadow-xl group-hover:-rotate-12 transition-transform">
                            <Zap className="w-5 h-5" />
                         </div>
                         <div>
                            <div className="text-[10px] font-black uppercase tracking-widest mb-1">Rapid Cycles</div>
                            <div className="text-[11px] font-bold opacity-40 uppercase tracking-tighter italic">4-8 Week Sprint Velocity</div>
                         </div>
                      </div>
                  </div>
               </div>
            </aside>
          </div>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
}

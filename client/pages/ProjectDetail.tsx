import { useParams } from "react-router-dom";
import { projects } from "../lib/projects";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Link2, Twitter, Linkedin, Facebook, MessageSquare, Instagram, MoveRight, Mail, Phone, MapPin } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { SmoothScroll } from "../components/SmoothScroll";
import NotFound from "./NotFound";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import PageSkeletonLoader from "../components/PageSkeletonLoader";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const project = projects.find((p) => p.id === id);

  const [isLoaded, setIsLoaded] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    setShowSkeleton(true);
    setIsLoaded(false);
    const skeletonTimer = setTimeout(() => setShowSkeleton(false), 600);
    const loadTimer = setTimeout(() => setIsLoaded(true), 700);

    return () => {
      clearTimeout(skeletonTimer);
      clearTimeout(loadTimer);
    };
  }, [id]);

  if (!project) {
    return <NotFound />;
  }

  const relatedProjects = projects.filter(p => p.id !== id);

  if (showSkeleton) {
    return <PageSkeletonLoader type="detail" />;
  }

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white max-w-[100vw] [overflow-x:clip]">
        <Navbar isLoaded={isLoaded} />

        <main className="pt-24 lg:pt-32">
          {/* Conversational Hero Section */}
          <section className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 mb-20">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
                <div className="lg:col-span-5 space-y-10">
                   {/* Breadcrumbs */}
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">Our Work</span>
                      <div className="w-1 h-1 rounded-full bg-black/10" />
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-md">{project.id.toUpperCase().replace('-', ' ')}</span>
                   </div>

                   <h1 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] uppercase">
                      How {project.title} <br /> Transformed {project.category}
                   </h1>

                   <div className="space-y-6">
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 italic">A conversation with:</div>
                      <div className="flex items-center gap-6">
                         <div className="relative">
                            <img src={project.client.avatar} alt={project.client.name} className="w-16 h-16 rounded-2xl border border-black/5 object-cover" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                         </div>
                         <div>
                            <div className="text-lg font-black tracking-tight uppercase">{project.client.name}</div>
                            <div className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">{project.client.role}</div>
                         </div>
                      </div>
                   </div>

                   {/* Quick Actions Row */}
                   <div className="flex items-center gap-2 flex-wrap pt-4">
                      {[Link2, ArrowLeft, MoveRight, Twitter, Linkedin, MessageSquare, Facebook, Instagram].map((Icon, i) => (
                        <button key={i} className={cn(
                           "w-9 h-9 rounded-xl border border-black/5 flex items-center justify-center transition-all flex-shrink-0",
                           i === 0 ? "bg-black text-white" : "hover:bg-black/5"
                        )}>
                           <Icon className="w-3.5 h-3.5" />
                        </button>
                      ))}
                   </div>
                </div>

                <div className="lg:col-span-7">
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="aspect-[16/9] md:aspect-[16/8] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden border border-black/5 shadow-2xl relative group bg-gray-50"
                   >
                       <img src={project.heroImage} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" alt="Hero Visual" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                   </motion.div>
                </div>
             </div>
          </section>

          {/* Sticky Layout Grid */}
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 py-20 border-t border-black/5 items-start">

            {/* Left Sidebar — sticky until center content ends */}
            <aside className="hidden lg:block lg:col-span-2">
               <div className="sticky top-24 space-y-12">
                  <div>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 mb-8">About</h3>
                     <div className="flex items-center gap-3 mb-4 group">
                        <h4 className="text-3xl font-black tracking-tighter uppercase">{project.title}</h4>
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="opacity-20 group-hover:opacity-100 transition-opacity">
                           <Link2 className="w-5 h-5" />
                        </a>
                     </div>
                     <p className="text-[11px] font-bold text-black/50 leading-relaxed uppercase tracking-tight">
                       {project.description}
                     </p>
                  </div>

                  <div className="space-y-8 pt-8 border-t border-black/5">
                     <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">HQ</h3>
                        <p className="text-sm font-bold opacity-60 tracking-tight">{project.hq}</p>
                     </div>
                     <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Industry</h3>
                        <p className="text-sm font-bold opacity-60 tracking-tight">{project.industry}</p>
                     </div>
                     <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Company Size</h3>
                        <p className="text-sm font-bold opacity-60 tracking-tight">{project.companySize}</p>
                     </div>
                  </div>
               </div>
            </aside>

            {/* Middle Column — scrollable, drives the sticky sidebars */}
            <article className="lg:col-span-7 space-y-12 md:space-y-32">

               {/* Mobile-only sidebar summary (sidebars are hidden on mobile) */}
               <div className="lg:hidden grid grid-cols-2 gap-4 p-6 rounded-3xl bg-gray-50/60 border border-black/5">
                  <div className="space-y-3">
                     <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-black/25">About</h3>
                     <div className="text-base font-black tracking-tighter uppercase">{project.title}</div>
                     <p className="text-[10px] font-bold text-black/50 leading-relaxed">{project.description}</p>
                     <div className="space-y-2 pt-2 border-t border-black/5">
                        <div><span className="text-[8px] font-black uppercase tracking-widest text-black/25">HQ</span><p className="text-[11px] font-bold">{project.hq}</p></div>
                        <div><span className="text-[8px] font-black uppercase tracking-widest text-black/25">Industry</span><p className="text-[11px] font-bold">{project.industry}</p></div>
                     </div>
                  </div>
                  <div className="space-y-3 border-l border-black/5 pl-4">
                     <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-black/25">Services</h3>
                     <ul className="space-y-2">
                        {project.services.map((s, i) => (
                           <li key={i} className="text-[10px] font-bold text-black/60 uppercase tracking-tight">{s}</li>
                        ))}
                     </ul>
                  </div>
               </div>

               <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="space-y-24"
               >
                  <div className="space-y-12">
                     <p className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] uppercase border-b border-black/5 pb-12">
                        “ {project.fullTitle || `India's 1st ${project.category} Suite Brought to Life by DevDale`} ”
                     </p>
                     <div className="pt-8 space-y-12">
                        <h1 className="text-4xl font-black tracking-tighter uppercase">The Challenge</h1>
                        <p className="text-xl font-medium leading-relaxed text-black/70">
                           {project.challenge}
                        </p>
                     </div>
                  </div>

                  <div className="space-y-16">
                     <h2 className="text-4xl font-black tracking-tighter leading-none uppercase">Enter DevDale: Turning Vision into Reality</h2>
                     <p className="text-lg text-black/60 leading-relaxed italic border-l-4 border-black pl-8">
                        {project.about}
                     </p>
                     <div className="space-y-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Strategic Evolution</h4>
                         <ul className="space-y-6">
                            <li className="flex items-start gap-4 p-8 bg-gray-50/50 rounded-3xl border border-black/5">
                               <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                               <span className="text-lg font-bold text-black/70 leading-relaxed uppercase tracking-tight">{project.approach}</span>
                            </li>
                         </ul>
                     </div>
                  </div>

                  <div className="space-y-12">
                     <h2 className="text-4xl font-black tracking-tighter uppercase">Key Features at a Glance</h2>
                     <ul className="grid grid-cols-1 gap-4">
                        {project.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-6 p-10 rounded-[2.5rem] bg-gray-50/50 border border-black/5 hover:border-black/10 transition-colors group">
                             <div className="text-2xl font-black opacity-10 group-hover:opacity-40 transition-opacity">0{i+1}</div>
                             <span className="text-xl font-black uppercase tracking-tight opacity-70 group-hover:opacity-100">{f}</span>
                          </li>
                        ))}
                     </ul>
                  </div>

                  {/* Contextual Banner */}
                  <div className="aspect-[21/9] rounded-[3rem] overflow-hidden border border-black/5 shadow-2xl relative">
                     <img src={project.image} className="w-full h-full object-cover" alt="Product Reveal" />
                     <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                           <div className="translate-x-0.5 w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-black border-b-[10px] border-b-transparent" />
                        </div>
                     </div>
                  </div>
               </motion.div>
            </article>

            {/* Right Sidebar — sticky until center content ends */}
            <aside className="hidden lg:block lg:col-span-3">
               <div className="sticky top-24 space-y-16">
                  <div className="space-y-8 pb-12 border-b border-black/5">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/20">Services Offered</h3>
                     <ul className="space-y-4">
                        {project.services.map((s, i) => (
                           <li key={i} className="text-sm font-bold text-black/70 uppercase tracking-tight hover:translate-x-1 transition-transform cursor-default">
                              {s}
                           </li>
                        ))}
                     </ul>
                  </div>

                  <div className="space-y-6">
                     <div className="flex flex-wrap gap-4">
                        {[Link2, ArrowLeft, Twitter, Linkedin, Facebook, Instagram].map((Icon, i) => (
                           <button key={i} className="w-10 h-10 rounded-xl border border-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm">
                              <Icon className="w-4 h-4" />
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </aside>
          </div>

          {/* Related Section Header */}
          <section className="py-20 px-6 md:px-12 lg:px-20 max-w-[1440px] mx-auto">
             <div className="flex items-center justify-between mb-16">
                <div>
                   <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">What's Next?</h2>
                   <p className="text-sm font-medium text-black/40">The partnership now extends to new digital frontiers with shared vision.</p>
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-black/10">Services</div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-black/5 pt-12">
                {relatedProjects.map((rp) => (
                  <Link to={`/work/${rp.id}`} key={rp.id} className="group space-y-8">
                     <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-gray-50 border border-black/5 relative shadow-sm group-hover:shadow-xl transition-all duration-700">
                        <img src={rp.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110" alt={rp.title} />
                     </div>
                     <div className="px-4 space-y-3">
                        <h4 className="text-xl font-black uppercase tracking-tighter">{rp.title}</h4>
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest">{rp.category}</span>
                     </div>
                  </Link>
                ))}
             </div>
          </section>

          {/* Collaborate Section */}
          <section className="bg-gray-50/50 py-40 border-t border-black/5 px-6 md:px-12 lg:px-20">
             <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32">
                <div className="space-y-16">
                   <div className="space-y-6">
                      <div className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Book a call</div>
                      <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] italic">Let's <br /> Collaborate</h2>
                      <p className="max-w-md text-lg font-medium text-black/50 leading-relaxed italic">
                        Reach out and let's explore how we can bring your ideas to life. Whether you're ready to begin or just have questions.
                      </p>
                   </div>

                   <div className="space-y-12">
                      <div className="space-y-4">
                         <div className="text-3xl font-black tracking-tighter">+91 70756 31155</div>
                         <div className="text-3xl font-black tracking-tighter lowercase hover:underline cursor-pointer">hello@devdale.com</div>
                      </div>
                      <div className="flex gap-8">
                         <a href="#" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                            <Instagram className="w-3 h-3" /> Instagram
                         </a>
                         <a href="#" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                            <Linkedin className="w-3 h-3" /> LinkedIn
                         </a>
                      </div>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                         <input type="text" placeholder="Name" className="w-full bg-white border border-black/5 rounded-2xl px-6 py-5 text-sm font-medium focus:outline-none focus:border-black/20 transition-all shadow-sm" />
                      </div>
                      <div className="space-y-3">
                         <input type="email" placeholder="Email" className="w-full bg-white border border-black/5 rounded-2xl px-6 py-5 text-sm font-medium focus:outline-none focus:border-black/20 transition-all shadow-sm" />
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input type="text" placeholder="Company Name" className="w-full bg-white border border-black/5 rounded-2xl px-6 py-5 text-sm font-medium focus:outline-none focus:border-black/20 transition-all shadow-sm" />
                      <input type="tel" placeholder="Phone" className="w-full bg-white border border-black/5 rounded-2xl px-6 py-5 text-sm font-medium focus:outline-none focus:border-black/20 transition-all shadow-sm" />
                   </div>
                   <select className="w-full bg-white border border-black/5 rounded-2xl px-6 py-5 text-sm font-medium focus:outline-none focus:border-black/20 transition-all appearance-none cursor-pointer shadow-sm text-black/40">
                      <option>Select a budget</option>
                      <option>₹50,000 - ₹1,00,000</option>
                      <option>₹1,00,000 - ₹5,00,000</option>
                   </select>
                   <textarea placeholder="What can we help you with?" rows={6} className="w-full bg-white border border-black/5 rounded-2xl px-6 py-6 text-sm font-medium focus:outline-none focus:border-black/20 transition-all shadow-sm resize-none"></textarea>
                   <Button className="w-full py-8 rounded-2xl bg-black text-white text-sm font-black uppercase tracking-widest shadow-2xl hover:-translate-y-1 transition-all">
                      Send Message
                   </Button>
                   
                   <div className="flex flex-col md:flex-row gap-12 pt-12">
                      <div className="flex gap-4">
                         <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                         </div>
                         <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-black/20 mb-1">Address</div>
                            <div className="text-[11px] font-bold">Phase 3, KPHB, Hyderabad, India</div>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-blue-600" />
                         </div>
                         <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-black/20 mb-1">Office Hours</div>
                            <div className="text-[11px] font-bold">Monday to Friday: 9:00 AM – 6:00 PM IST</div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </section>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { SmoothScroll } from "../components/SmoothScroll";

const Legal = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any } },
  };

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-white relative font-sans selection:bg-black selection:text-white">
        {/* Subtle Dots Background */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(0,0,0,0.08) 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-white via-transparent to-white" />

        <Navbar isLoaded={isLoaded} />

        <main className="relative z-10 pt-40 pb-24 px-6 md:pt-56 md:pb-40">
          <div className="max-w-4xl mx-auto">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              className="flex flex-col gap-20"
            >
              {/* Header */}
              <div className="flex flex-col gap-6 text-center">
                <motion.span variants={itemVariants} className="text-[9px] uppercase font-black tracking-[1em] text-black/20">
                  Legal Protocol
                </motion.span>
                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black tracking-tighter uppercase">
                  Privacy & <span className="text-gray-200">Terms</span>
                </motion.h1>
                <motion.p variants={itemVariants} className="max-w-xl mx-auto text-lg text-black/40 font-medium italic">
                  Last Updated: April 2026. The operational framework for DevDale Agency digital ecosystems.
                </motion.p>
              </div>

              {/* Privacy Policy Section */}
              <motion.section variants={itemVariants} className="flex flex-col gap-10">
                <div className="flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-black/5" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-black/30">Privacy Policy</h2>
                  <div className="h-[1px] flex-1 bg-black/5" />
                </div>
                
                <div className="grid gap-8 text-black/70 leading-relaxed font-medium">
                  <div className="flex flex-col gap-4">
                    <h3 className="text-black font-black uppercase text-xs tracking-widest">01. Data Collection</h3>
                    <p>We collect operational data essential for product development and client communication. This includes but is not limited to identities, contact vectors, and project specifications provided via our digital interfaces.</p>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <h3 className="text-black font-black uppercase text-xs tracking-widest">02. Security Protocol</h3>
                    <p>DevDale Agency employs industry-standard encryption for all data transmissions. We prioritize the integrity of client intellectual property through rigorous internal security standards.</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h3 className="text-black font-black uppercase text-xs tracking-widest">03. Usage Disclosure</h3>
                    <p>User data is never sold or distributed to third-party entities for marketing purposes. Data usage is strictly confined to service improvement and project execution.</p>
                  </div>
                </div>
              </motion.section>

              {/* Terms Section */}
              <motion.section variants={itemVariants} className="flex flex-col gap-10">
                <div className="flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-black/5" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-black/30">Terms & Conditions</h2>
                  <div className="h-[1px] flex-1 bg-black/5" />
                </div>
                
                <div className="grid gap-8 text-black/70 leading-relaxed font-medium">
                  <div className="flex flex-col gap-4">
                    <h3 className="text-black font-black uppercase text-xs tracking-widest">01. Service Scope</h3>
                    <p>All project deliverables are defined within specific Statements of Work (SOW). DevDale Agency reserves the right to adjust architectural timelines based on evolving project complexity following mutual agreement.</p>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <h3 className="text-black font-black uppercase text-xs tracking-widest">02. Intellectual Property</h3>
                    <p>Unless specified otherwise in a custom contract, full ownership of project assets is transferred to the client upon final settlement of all outstanding service fees.</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h3 className="text-black font-black uppercase text-xs tracking-widest">03. Liability & Performance</h3>
                    <p>We strive for digital excellence. DevDale Agency is not liable for secondary performance variations caused by third-party infrastructure or external market shifts beyond our immediate engineering control.</p>
                  </div>
                </div>
              </motion.section>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
};

export default Legal;

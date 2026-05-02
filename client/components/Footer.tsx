"use client";

import { motion, Variants } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
        ease: [0.22, 1, 0.36, 1] as any,
      },
    },
  };

  return (
    <footer id="contact" className="relative w-full bg-black text-white overflow-hidden">
      {/* Noise and Grid Overlays */}
      <div className="absolute inset-0 noise opacity-[0.03] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative z-10 pt-16 md:pt-32 pb-10 md:pb-16">
        <div className="mb-16 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="flex flex-col items-start justify-between gap-8"
          >
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter leading-none mb-4 md:mb-10">
                Let's build <br />
                <span className="text-shine-white">the future</span>.
              </h2>
              <p className="text-base md:text-2xl font-medium text-white/50 tracking-tight leading-relaxed">
                Have a vision that needs engineering? We're ready when you are.
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <button
                onClick={() => navigate('/contact')}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-4 px-8 py-5 md:px-12 md:py-8 rounded-full border border-white/20 hover:bg-white hover:text-black hover:border-white transition-all duration-700"
              >
                <span className="text-lg md:text-2xl font-bold tracking-tight uppercase">Get in touch</span>
                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white text-black group-hover:bg-black group-hover:text-white transition-colors flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer Links Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-32"
        >
          <motion.div variants={itemVariants} className="col-span-1 sm:col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-1 mb-6 md:mb-10 group opacity-80 hover:opacity-100 transition-opacity">
              <img
                src="/devdale_logo.svg"
                alt="DevDale Logo"
                className="w-12 h-12 md:w-16 md:h-16 object-contain invert brightness-[1.5] mix-blend-screen"
              />
              <span className="text-2xl md:text-3xl font-bold tracking-tighter">DevDale<span className="text-white/30">.</span></span>
            </Link>
            <p className="text-sm md:text-lg text-white/40 font-medium leading-relaxed mb-6 md:mb-10">
              A premium engineering lab building next-gen digital experiences.
            </p>
            <div className="flex gap-4 md:gap-6">
              {['Twitter', 'LinkedIn', 'Github'].map(platform => (
                <a key={platform} href="#" className="text-[10px] md:text-sm font-bold tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity">{platform}</a>
              ))}
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div variants={itemVariants}>
            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/20 mb-6 md:mb-10">Navigation</h4>
            <ul className="space-y-4 md:space-y-6 text-base md:text-xl font-bold tracking-tight">
              {[
                { name: 'Home', path: '/' },
                { name: 'Work', path: '/#work' },
                { name: 'About', path: '/about' },
                { name: 'Pricing', path: '/pricing' },
                { name: 'Contact', path: '/contact' }
              ].map(item => (
                <li key={item.name}>
                  <Link to={item.path} className="hover:text-white/60 transition-colors uppercase tracking-widest text-xs font-black">{item.name}</Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Details */}
          <motion.div variants={itemVariants} className="col-span-1 sm:col-span-2 md:col-span-2">
            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/20 mb-6 md:mb-10">Connect</h4>
            <div className="space-y-5 md:space-y-8">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-white/40 block mb-2">Inquiries</span>
                <a href="mailto:hello@devdale.com" className="text-base md:text-2xl lg:text-4xl font-bold tracking-tighter hover:text-white/60 transition-colors break-all leading-tight block">hello@devdale.com</a>
              </div>
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-white/40 block mb-2">Phone</span>
                <a href="tel:+1234567890" className="text-lg md:text-2xl font-bold tracking-tight">+1 (234) 567 890</a>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="pt-8 md:pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8 text-white/20">
          <p className="text-xs md:text-sm font-bold tracking-tight text-center md:text-left">© 2024 DEVDALE. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6 md:gap-12 text-[10px] md:text-xs font-bold tracking-widest uppercase">
            <Link to="/legal" className="hover:text-white transition-colors cursor-pointer">Privacy Policy</Link>
            <Link to="/legal" className="hover:text-white transition-colors cursor-pointer">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

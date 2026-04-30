"use client";

import { motion, Variants } from "framer-motion";
import { TechIcon } from "./TechIcon";

interface Service {
  title: string;
  description: string;
  type: "code" | "cloud" | "strategy" | "growth" | "speed" | "security" | "innovation" | "scale";
  tags: string[];
  color: string;
}

const services: Service[] = [
  {
    title: "Web Development",
    description: "High-performance websites that convert visitors into customers through engineering excellence.",
    type: "code",
    tags: ["React", "Next.js", "Vite"],
    color: "group-hover:shadow-indigo-500/10",
  },
  {
    title: "Cloud Infrastructure",
    description: "Native and cross-platform apps that users love, built on rock-solid cloud architecture.",
    type: "cloud",
    tags: ["AWS", "Google Cloud", "Azure"],
    color: "group-hover:shadow-blue-500/10",
  },
  {
    title: "AI Applications",
    description: "Smart, AI-powered solutions that automate tasks and scale your business operations intelligently.",
    type: "innovation",
    tags: ["OpenAI", "ML", "Python"],
    color: "group-hover:shadow-cyan-500/10",
  },
  {
    title: "Performance Optimization",
    description: "Lightning fast digital experiences that keep your users engaged and improve conversion rates.",
    type: "speed",
    tags: ["Core Web Vitals", "Wasm", "Edge"],
    color: "group-hover:shadow-yellow-500/10",
  },
  {
    title: "Enterprise Security",
    description: "Secure, decentralized and centralized solutions built for the future of digital safety.",
    type: "security",
    tags: ["OAuth", "Encryption", "SOC2"],
    color: "group-hover:shadow-rose-500/10",
  },
  {
    title: "Growth Strategy",
    description: "Beautiful interfaces and data-driven strategies that delight users and drive engagement.",
    type: "growth",
    tags: ["SEO", "Analytics", "CRM"],
    color: "group-hover:shadow-emerald-500/10",
  },
];

export default function Solutions() {
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
    <section id="services" className="relative w-full py-32 bg-gray-50 overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-50/20 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        {/* Section Header */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="h-px w-12 bg-indigo-500" />
            <span className="text-sm font-bold tracking-widest uppercase text-indigo-500">Expertise</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 text-balance"
          >
            Digital <span className="text-gray-400">Solutions</span> <br />
            Built for the <span className="text-indigo-600">Future</span>.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-2xl text-gray-500 max-w-2xl font-medium leading-relaxed"
          >
            From bespoke websites to complex AI orchestrations, we deliver engineering excellence at every touchpoint.
          </motion.p>
        </div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="group h-full"
            >
              <div className={`bg-white border border-black/5 rounded-[2.5rem] p-10 h-full flex flex-col justify-between hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] ${service.color} transition-all duration-700 relative overflow-hidden`}>
                {/* Decorative Icon Glow */}
                <div className={`absolute -top-10 -left-10 w-40 h-40 bg-gray-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                
                <div className="relative z-10">
                  <div className="mb-10 group-hover:scale-110 transition-transform duration-500">
                    <TechIcon type={service.type} color={true} className="w-12 h-12" />
                  </div>

                  <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-black transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-gray-500 leading-relaxed mb-10 group-hover:text-gray-700 transition-colors">
                    {service.description}
                  </p>
                </div>

                <div className="relative z-10 flex flex-wrap gap-2">
                  {service.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="px-4 py-1.5 bg-gray-50 text-[10px] font-bold tracking-widest uppercase text-gray-400 border border-gray-100 rounded-full group-hover:bg-white group-hover:border-black/10 group-hover:text-black transition-all duration-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-32 p-12 md:p-20 bg-black rounded-[3rem] text-center text-white relative overflow-hidden group border border-white/5"
        >
          <div className="absolute inset-0 noise opacity-20 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
          
          <h3 className="text-4xl md:text-6xl font-bold mb-10 relative z-10 tracking-tighter">
            Ready to <span className="text-indigo-400">elevate</span> your project?
          </h3>
          
          <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
             className="relative z-10 px-12 py-5 bg-white text-black rounded-full text-lg font-bold tracking-tight hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all shadow-xl"
          >
            Start a Conversation
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

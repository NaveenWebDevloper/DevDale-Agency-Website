"use client";

import { motion, Variants } from "framer-motion";
import { TechIcon } from "./TechIcon";

interface Step {
  number: number;
  title: string;
  description: string;
  type: "strategy" | "code" | "innovation";
  details: string[];
  color: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Discovery & Strategy",
    description: "We dive deep into your business goals, market position, and user needs to build a solid foundation.",
    type: "strategy",
    details: [
      "In-depth discovery workshop",
      "Comprehensive market analysis",
      "Technical feasibility audit",
      "Strategic roadmap definition",
    ],
    color: "group-hover:text-amber-500",
  },
  {
    number: 2,
    title: "Agile Development",
    description: "Our engineers build your product using modern frameworks, with constant feedback loops and rapid iterations.",
    type: "code",
    details: [
      "Modular components construction",
      "Weekly sprint demonstrations",
      "Scalable cloud architecture",
      "Continuous quality assurance",
    ],
    color: "group-hover:text-indigo-500",
  },
  {
    number: 3,
    title: "Deployment & Scaling",
    description: "We launch with precision and stay with you to monitor, optimize, and scale your product for long-term growth.",
    type: "innovation",
    details: [
      "Zero-downtime deployment",
      "24/7 proactive monitoring",
      "Performance optimization",
      "Future-ready scaling plan",
    ],
    color: "group-hover:text-cyan-500",
  },
];

export default function HowToGetStarted() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as any,
      },
    },
  };

  return (
    <section id="approach" className="relative w-full py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <div className="mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-indigo-50 text-indigo-600 rounded-full"
          >
            Our Process
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-8xl font-bold tracking-tighter text-balance"
          >
            Steps to your <br />
            <span className="text-gray-400">digital <span className="text-indigo-600">future</span></span>.
          </motion.h2>
        </div>

        {/* Process Steps List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12"
        >
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="group relative"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12 p-8 md:p-12 rounded-[3rem] bg-gray-50 border border-black/5 hover:bg-black hover:text-white transition-all duration-700 overflow-hidden">
                {/* Step Number & Icon */}
                <div className="flex-shrink-0 flex items-center gap-6 md:gap-8">
                  <span className={`text-5xl md:text-8xl font-black opacity-10 ${step.color} transition-opacity`}>
                    {String(step.number).padStart(2, "0")}
                  </span>
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-white shadow-xl flex items-center justify-center text-black group-hover:bg-white/10 group-hover:text-white transition-colors duration-500">
                    <TechIcon type={step.type} color={true} className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0 max-w-2xl">
                  <h3 className="text-2xl md:text-4xl font-bold tracking-tighter mb-4 group-hover:text-indigo-400 transition-colors uppercase">{step.title}</h3>
                  <p className="text-lg md:text-xl opacity-60 font-medium leading-relaxed">{step.description}</p>
                </div>

                {/* Details List */}
                <div className="flex-shrink grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-x-8 lg:p-8 lg:border-l border-current opacity-60 group-hover:opacity-90 min-w-0">
                  {step.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2 md:gap-3">
                      <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                      <span className="text-[11px] md:text-sm font-bold tracking-tight uppercase leading-tight break-words">{detail}</span>
                    </div>
                  ))}
                </div>

                {/* Arrow Accent */}
                <div className="absolute top-12 right-12 w-10 h-10 flex items-center justify-center rounded-full border border-current opacity-0 group-hover:opacity-100 transition-all duration-700 scale-50 group-hover:scale-100 text-indigo-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>

              {/* Connector (Vertical) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute left-[4.5rem] bottom-[-3rem] w-px h-12 bg-indigo-600/20" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}





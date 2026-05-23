"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

interface Author {
  name: string;
  role: string;
  image: string;
}

interface FAQItem {
  question: string;
  answer: string;
  author: Author;
}

const NAVEEN: Author = {
  name: "Naveen Vadla",
  role: "Founder & Backend Engineer",
  image: "/NaveenImage.webp"
};

const SRIKANTH: Author = {
  name: "Srikanth",
  role: "Co-Founder & Frontend Engineer",
  image: "/srikanthImage.webp"
};

const faqs: FAQItem[] = [
  {
    question: "How long does a typical project take?",
    answer: "Most projects take 8-16 weeks from discovery to launch, depending on complexity. We use agile methodologies to deliver value incrementally, so you can see progress early.",
    author: NAVEEN,
  },
  {
    question: "What's your pricing model?",
    answer: "We offer flexible pricing: fixed-price projects for well-defined scopes, time-and-materials for exploratory work, or retainer partnerships for ongoing support. Let's discuss what works best for you.",
    author: SRIKANTH,
  },
  {
    question: "Do you provide post-launch support?",
    answer: "Absolutely. We offer 24/7 monitoring, bug fixes, performance optimization, and growth strategy consultation. We're invested in your long-term success.",
    author: NAVEEN,
  },
  {
    question: "Can you integrate with our existing systems?",
    answer: "Yes. We're experts at integrating with legacy systems, third-party APIs, databases, and custom infrastructure. We assess your current setup and build scalable solutions on top of it.",
    author: SRIKANTH,
  },
  {
    question: "What if we need to pivot during the project?",
    answer: "That's expected and normal. Our agile process makes pivoting easy. We iterate based on feedback, market data, and learnings—no massive rewrites needed.",
    author: NAVEEN,
  },
  {
    question: "How do you ensure code quality?",
    answer: "We use automated testing, code reviews, continuous integration/deployment, and strict quality standards. Every line of code is crafted for performance, security, and maintainability.",
    author: SRIKANTH,
  },
];

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
    hidden: { opacity: 0, y: 20 },
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
    <section className="relative w-full py-32 bg-white grid-pattern">
      <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <div className="mb-24 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-gray-100 text-black rounded-full"
          >
            Support
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-8xl font-bold tracking-tighter text-balance mb-8"
          >
            Curiosity <span className="text-gray-400">Welcome</span>.
          </motion.h2>
          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="text-2xl text-gray-500 font-medium leading-relaxed"
          >
            Everything you need to know about partnering with us.
          </motion.p>
        </div>

        {/* FAQ Items */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-6"
        >
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className={cn(
                "rounded-[2.5rem] overflow-hidden border transition-all duration-500",
                openIndex === idx 
                  ? "bg-black text-white border-black shadow-2xl" 
                  : "bg-gray-50 border-black/5 hover:border-black/20"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-8 md:px-12 py-10 text-left flex items-center justify-between gap-6 group"
              >
                <div className="flex items-center gap-5 flex-grow">
                  <span className="text-xl md:text-2xl font-bold tracking-tight">
                    {faq.question}
                  </span>
                </div>

                <div className="flex-shrink-0 w-12 h-12 rounded-full border border-current flex items-center justify-center transition-transform duration-500" style={{ rotate: openIndex === idx ? "45deg" : "0deg" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
              </button>

              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="px-8 md:px-12 pb-12 pt-4 flex gap-6 items-start">
                       <div className="flex-shrink-0 flex flex-col items-center gap-2 pt-1">
                          <div className="relative">
                            <img 
                               src={faq.author.image} 
                               alt={faq.author.name} 
                               width={56}
                               height={56}
                               loading="lazy"
                               className="w-14 h-14 rounded-full object-cover border border-white/10 shadow-xl" 
                            />
                            <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-black bg-emerald-500"></span>
                            </span>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-white/50">{faq.author.name.split(' ')[0]}</span>
                       </div>
                       <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">{faq.author.role}</div>
                          <p className="text-lg md:text-xl font-medium leading-relaxed opacity-85 text-balance">
                            {faq.answer}
                          </p>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-24 text-center p-16 rounded-[3rem] bg-gray-50 border border-black/5"
        >
          <h3 className="text-4xl font-bold tracking-tighter mb-6">Still have questions?</h3>
          <p className="text-xl text-gray-500 mb-10 font-medium">Our team is here to help you navigate every step of your journey.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/contact")}
            className="px-12 py-5 bg-black text-white rounded-full text-lg font-bold tracking-tight hover:shadow-2xl transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]"
          >
            Get in touch
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}



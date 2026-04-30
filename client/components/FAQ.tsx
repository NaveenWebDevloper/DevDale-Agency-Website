"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How long does a typical project take?",
    answer: "Most projects take 8-16 weeks from discovery to launch, depending on complexity. We use agile methodologies to deliver value incrementally, so you can see progress early.",
  },
  {
    question: "What's your pricing model?",
    answer: "We offer flexible pricing: fixed-price projects for well-defined scopes, time-and-materials for exploratory work, or retainer partnerships for ongoing support. Let's discuss what works best for you.",
  },
  {
    question: "Do you provide post-launch support?",
    answer: "Absolutely. We offer 24/7 monitoring, bug fixes, performance optimization, and growth strategy consultation. We're invested in your long-term success.",
  },
  {
    question: "Can you integrate with our existing systems?",
    answer: "Yes. We're experts at integrating with legacy systems, third-party APIs, databases, and custom infrastructure. We assess your current setup and build scalable solutions on top of it.",
  },
  {
    question: "What if we need to pivot during the project?",
    answer: "That's expected and normal. Our agile process makes pivoting easy. We iterate based on feedback, market data, and learnings—no massive rewrites needed.",
  },
  {
    question: "How do you ensure code quality?",
    answer: "We use automated testing, code reviews, continuous integration/deployment, and strict quality standards. Every line of code is crafted for performance, security, and maintainability.",
  },
];

export default function FAQ() {
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
              className={`rounded-[2rem] overflow-hidden border transition-all duration-500 ${
                openIndex === idx 
                  ? "bg-black text-white border-black" 
                  : "bg-gray-50 border-black/5 hover:border-black/20"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-8 md:px-12 py-10 text-left flex items-center justify-between gap-8 group"
              >
                <span className="text-xl md:text-2xl font-bold tracking-tight">
                  {faq.question}
                </span>

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
                    <div className="px-8 md:px-12 pb-12 pt-4">
                      <p className="text-lg md:text-xl font-medium leading-relaxed opacity-60 text-balance">
                        {faq.answer}
                      </p>
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
            className="px-12 py-5 bg-black text-white rounded-full text-lg font-bold tracking-tight hover:shadow-2xl transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]"
          >
            Get in touch
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}


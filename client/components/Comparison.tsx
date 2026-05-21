"use client";

import { motion, Variants } from "framer-motion";

interface Comparison {
  feature: string;
  others: boolean;
  devDale: boolean;
}

const comparisons: Comparison[] = [
  { feature: "Speed to Market (8-12 weeks)", others: false, devDale: true },
  { feature: "Internal Quality Assurance", others: true, devDale: true },
  { feature: "Enterprise Scalability", others: false, devDale: true },
  { feature: "24/7 Dedicated Support", others: false, devDale: true },
  { feature: "Transparent Pricing", others: true, devDale: true },
  { feature: "Advanced AI Integration", others: false, devDale: true },
  { feature: "Post-Launch Data Analytics", others: false, devDale: true },
  { feature: "Strategic Growth Roadmap", others: false, devDale: true },
];

export default function Comparison() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const rowVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const AnimatedCheck = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.path
        d="M20 6L9 17L4 12"
        stroke="#10b981"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </svg>
  );

  const AnimatedCross = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.path
        d="M18 6L6 18"
        stroke="#ef4444"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      <motion.path
        d="M6 6L18 18"
        stroke="#ef4444"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      />
    </svg>
  );

  return (
    <section className="relative w-full py-32 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <div className="mb-24 text-center max-w-4xl mx-auto">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-black text-white rounded-full"
          >
            The Edge
          </motion.span>
          <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-balance mb-8">
            Why settle for <span className="text-gray-600">ordinary</span>?
          </h2>
          <p className="text-2xl text-gray-500 font-medium leading-relaxed">
            Compare our service with traditional alternatives and see the DevDale advantage.
          </p>
        </div>

        {/* Comparison Table */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-16 border border-black/5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden"
        >
           <div className="relative z-10">
             {/* Header - Desktop Only */}
             <div className="hidden md:grid grid-cols-[1fr,120px,120px] border-b border-black/5 mb-4">
               <div className="py-8 px-4 text-xs font-black tracking-widest uppercase opacity-40">Capability</div>
               <div className="py-8 px-4 text-center text-xs font-black tracking-widest uppercase opacity-40">Others</div>
               <div className="py-8 px-4 text-center text-xs font-black tracking-widest uppercase text-black">DevDale</div>
             </div>

             <div className="divide-y divide-black/5">
               {comparisons.map((item, idx) => (
                 <motion.div 
                    key={idx} 
                    variants={rowVariants} 
                    className="group py-6 md:py-0 md:grid md:grid-cols-[1fr,120px,120px] items-center hover:bg-gray-50 transition-colors"
                 >
                    {/* Feature Name */}
                    <div className="px-4 mb-4 md:mb-0 md:py-8">
                       <span className="text-lg md:text-2xl font-black tracking-tight text-black group-hover:translate-x-2 transition-transform inline-block duration-500">
                         {item.feature}
                       </span>
                    </div>

                    {/* Mobile Comparison Labels */}
                    <div className="flex md:contents items-center justify-between px-4">
                      {/* Others */}
                      <div className="flex flex-col md:flex-row items-center gap-2 md:py-8">
                        <span className="md:hidden text-[9px] font-black tracking-widest uppercase opacity-20">Traditional</span>
                        <div className="flex justify-center scale-75 md:scale-100">
                          {item.others ? <AnimatedCheck /> : <AnimatedCross />}
                        </div>
                      </div>

                      {/* DevDale */}
                      <div className="flex flex-col md:flex-row items-center gap-2 md:py-8 bg-black/[0.02] md:bg-transparent p-3 md:p-0 rounded-2xl">
                        <span className="md:hidden text-[9px] font-black tracking-widest uppercase text-black">DevDale</span>
                        <div className="flex justify-center scale-110 md:scale-100">
                           <AnimatedCheck />
                        </div>
                      </div>
                    </div>
                 </motion.div>
               ))}
             </div>
           </div>
        </motion.div>
      </div>
    </section>
  );
}

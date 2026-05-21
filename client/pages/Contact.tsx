import React, { useState, useEffect, memo, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Mail, MessageSquare, User, Globe, MessageCircle, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { SmoothScroll } from "../components/SmoothScroll";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import PageSkeletonLoader from "../components/PageSkeletonLoader";
import { trackClarityEvent } from "@/analytics/clarity";

const Background = memo(() => (
  <div className="absolute inset-0 z-0 pointer-events-none [contain:paint]">
    {/* High-Density Industrial Grid Pattern */}
    <div 
      className="absolute inset-0 opacity-[0.4]"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
      }}
    />
    <div className="absolute inset-0">
      <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-white via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white via-white/40 to-transparent" />
    </div>
    <div className="absolute inset-0 noise opacity-[0.02] transform-gpu" />
  </div>
));

Background.displayName = "Background";

const ContactForm = memo(({ onSubmit, isSubmitting }: { onSubmit: (data: any) => void; isSubmitting: boolean }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: "", email: "", company: "", message: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-6 md:gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1 flex items-center gap-2">
            <User size={10} strokeWidth={3} /> Full Name
          </label>
          <input
            required
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-black/5 border-none rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-black/10 focus:ring-2 focus:ring-black transition-all outline-none"
          />
        </div>
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1 flex items-center gap-2">
            <Mail size={10} strokeWidth={3} /> Work Email
          </label>
          <input
            required
            type="email"
            placeholder="john@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-black/5 border-none rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-black/10 focus:ring-2 focus:ring-black transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1 flex items-center gap-2">
          <Globe size={10} strokeWidth={3} /> Company / Website
        </label>
        <input
          type="text"
          placeholder="https://company.com"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="w-full bg-black/5 border-none rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-black/10 focus:ring-2 focus:ring-black transition-all outline-none"
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1 flex items-center gap-2">
          <MessageCircle size={10} strokeWidth={3} /> Brief Project Description
        </label>
        <textarea
          required
          rows={4}
          placeholder="What are we building together?"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full bg-black/5 border-none rounded-[1.5rem] px-6 py-4 text-sm font-bold placeholder:text-black/10 focus:ring-2 focus:ring-black transition-all outline-none resize-none"
        />
      </div>

      <motion.button
        whileHover={!isSubmitting ? { scale: 1.02 } : {}}
        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
        disabled={isSubmitting}
        type="submit"
        className="w-full bg-black text-white rounded-2xl py-5 font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-4 transition-all hover:bg-zinc-800 shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            Deploying...
            <Loader2 size={14} className="animate-spin" />
          </>
        ) : (
          <>
            Deploy Message
            <Send size={14} className="animate-pulse" />
          </>
        )}
      </motion.button>
    </form>
  );
});

ContactForm.displayName = "ContactForm";

const Contact = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    const skeletonTimer = setTimeout(() => setShowSkeleton(false), 600);
    const loadTimer = setTimeout(() => setIsLoaded(true), 700);

    return () => {
      clearTimeout(skeletonTimer);
      clearTimeout(loadTimer);
    };
  }, []);

  if (showSkeleton) {
    return <PageSkeletonLoader type="contact" />;
  }

  const fireCelebration = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        trackClarityEvent("contact_submit");
        trackClarityEvent("lead_generated");
        fireCelebration();
        toast({
          variant: "success",
          title: "Inquiry Deployed Successfully",
          description: "Mission control has received your vision. Expect a transmission within 24h.",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        const detailedError = errorData.error ? `${errorData.message} (Detail: ${errorData.error})` : (errorData.message || "Protocol Failure");
        throw new Error(detailedError);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Protocol Interrupted",
        description: error.message || "We encountered a glitch. Please try again or email us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any } },
  };

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-white relative font-sans selection:bg-black selection:text-white overflow-hidden transform-gpu">
        <Background />

        <Navbar isLoaded={isLoaded} />

        <main className="relative z-10 pt-32 pb-40 md:pt-44 md:pb-60 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              className="grid grid-cols-1 xl:grid-cols-[1.2fr,1fr] gap-16 lg:gap-32 items-center"
            >
              {/* Left Side: Editorial Content */}
              <div className="flex flex-col gap-12 md:gap-16">
                <div className="flex flex-col gap-6 md:gap-8">
                  <motion.span variants={itemVariants} className="text-[10px] uppercase font-black tracking-[0.5em] text-black/20">
                    Get In Touch
                  </motion.span>
                  <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl xl:text-[7.5rem] font-black tracking-tighter leading-[0.85] uppercase">
                    Let's Build <br />
                    <span className="text-gray-200 block my-1 md:my-2">Something</span>
                    <span className="block text-black">Unforgettable.</span>
                  </motion.h1>
                  <motion.p variants={itemVariants} className="max-w-md text-lg md:text-xl text-black/40 font-medium leading-relaxed italic mt-4">
                    “Strategic precision meets high-end digital architecture. Tell us about your vision, and we'll engineer it into an industry-defining product.”
                  </motion.p>
                </div>

                <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 pr-4">
                  <motion.div variants={itemVariants} className="flex items-center gap-6 group cursor-default">
                    <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white transition-transform group-hover:scale-110 shadow-lg">
                      <Mail size={20} />
                    </div>
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-black/20">Email Us</div>
                      <div className="text-lg font-bold">hello@thedevdale.com</div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex items-center gap-6 group cursor-default">
                    <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white transition-transform group-hover:scale-110 shadow-lg">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-black/20">Quick Chat</div>
                      <div className="text-lg font-bold">@devdale_agency</div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Right Side: Pro Form */}
              <motion.div 
                variants={itemVariants}
                className="relative bg-white border border-black/5 rounded-[3rem] p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden transform-gpu"
              >
                {/* Subtle internal shading */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/20 to-transparent pointer-events-none" />
                <ContactForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
              </motion.div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
};

export default Contact;

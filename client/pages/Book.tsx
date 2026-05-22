import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";

// Safely parse YYYY-MM-DD in local time to avoid UTC shifting
const parseDateSafely = (dateStr: string) => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// Formats a Date object as YYYY-MM-DD using local time coordinates
const getLocalDateString = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

import {
  Calendar,
  Clock,
  Video,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Briefcase,
  DollarSign,
  Sparkles,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { SmoothScroll } from "../components/SmoothScroll";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Interface Definitions
interface Service {
  _id: string;
  name: string;
  slug: string;
  duration: number;
  description?: string;
  price?: number;
  meetingType: string;
  colorTag: string;
  bufferTime: number;
}

interface Slot {
  time: string; // "HH:MM"
  dateTime: string; // ISO string
  available: boolean;
}

export const BUDGET_RANGES = [
  "Under $5,000",
  "$5,000 - $15,000",
  "$15,000 - $30,000",
  "$30,000 - $50,000",
  "$50,000+",
];

export const PROJECT_TYPES = [
  "Website Design & Art Direction",
  "Full-Stack Web Development",
  "AI Applications & Workflows",
  "Native Mobile App Engineering",
  "SEO Optimization & Organic Growth",
  "Discovery Consultation Call",
];

// Spring Transition settings for Apple-grade micro-animations
const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as const;

export default function Book() {
  const [searchParams] = useSearchParams();
  
  // Step tracker: 1 = Service, 2 = Date & Time, 3 = Details Form, 4 = Success
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    projectType: "",
    budgetRange: "",
    notes: "",
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Load agency services
  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services");
        if (!res.ok) throw new Error("Failed to load services database.");
        const data = await res.json();
        setServices(data.services || []);
      } catch (err) {
        toast.error("Could not fetch scheduling services. Please ensure the agency server is running and try again.");
      } finally {
        setLoadingServices(false);
      }
    }
    fetchServices();
  }, []);

  // Recalculate Lenis scroll bounds and refresh GSAP ScrollTrigger whenever step, services, or slots load/change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        (window as any).lenis?.resize();
        ScrollTrigger.refresh();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [step, services, slots]);

  // Fetch slots when date or service changes
  useEffect(() => {
    if (!selectedService || !selectedDate) return;
    
    async function fetchSlots() {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await fetch(
          `/api/availability/slots?serviceId=${selectedService?._id}&date=${selectedDate}`
        );
        if (!res.ok) throw new Error("Failed to retrieve availability slots.");
        const data = await res.json();
        setSlots(data.slots || []);
      } catch (err) {
        toast.error("Failed to load time slots.");
      } finally {
        setLoadingSlots(false);
      }
    }
    
    fetchSlots();
  }, [selectedDate, selectedService]);

  // Pre-fill fields if user landed with service slug
  useEffect(() => {
    const serviceSlug = searchParams.get("service");
    if (serviceSlug && services.length > 0) {
      const match = services.find((s) => s.slug === serviceSlug);
      if (match) {
        setSelectedService(match);
        setStep(2);
      }
    }
  }, [services, searchParams]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedSlot) return;

    if (!formData.name || !formData.email) {
      toast.error("Please enter your name and email.");
      return;
    }

    setSubmitting(true);
    
    // Parse UTM tags
    const utmSource = searchParams.get("utm_source") || undefined;
    const utmMedium = searchParams.get("utm_medium") || undefined;
    const utmCampaign = searchParams.get("utm_campaign") || undefined;

    try {
      const payload = {
        serviceId: selectedService._id,
        customerName: formData.name,
        customerEmail: formData.email,
        customerCompany: formData.company || undefined,
        budgetRange: formData.budgetRange || undefined,
        projectType: formData.projectType || selectedService.name,
        notes: formData.notes || undefined,
        date: selectedDate,
        timeSlot: selectedSlot.time,
        utmSource,
        utmMedium,
        utmCampaign,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Booking transaction failed.");
      }

      setConfirmedBooking(data.booking);
      setStep(4);
      
      // Trigger confetti wow
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#000000", "#ffffff", "#888888"],
      });
      toast.success("Briefing scheduled successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule briefing.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper date generators for calendar picker (next 14 days)
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 21; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      // Skip weekends (Sunday=0, Saturday=6) for professional agencies
      if (nextDay.getDay() !== 0 && nextDay.getDay() !== 6) {
        days.push(nextDay);
      }
    }
    return days;
  };

  return (
    <SmoothScroll>
    <div className="min-h-screen bg-[#f7f4ee] text-black selection:bg-black selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[520px] bg-gradient-to-b from-white via-[#f7f4ee] to-transparent pointer-events-none" />

      <Navbar isLoaded={true} />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24 relative z-10">
        {/* Header Header block */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white/80 text-xs text-zinc-600 mb-4 backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
              <span>DevDale Scheduling Protocol</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black mb-4">
              SECURE YOUR BRIEFING
            </h1>
            <p className="text-zinc-600 max-w-lg mx-auto text-sm md:text-base font-light">
              Connect directly with our engineering core to blueprint, design, and automate your digital architecture.
            </p>
          </motion.div>
        </div>

        {/* Stepper Progress bar */}
        {step < 4 && (
          <div className="max-w-md mx-auto mb-10 px-4">
            <div className="flex justify-between items-center text-xs text-zinc-500 mb-2">
              <span className={step >= 1 ? "text-black font-medium" : ""}>Service</span>
              <span className={step >= 2 ? "text-black font-medium" : ""}>Schedule</span>
              <span className={step >= 3 ? "text-black font-medium" : ""}>Prospect Details</span>
            </div>
            <div className="h-1 bg-zinc-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-black"
                initial={{ width: "33%" }}
                animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}

        {/* Dynamic Booking Window */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-visible shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: SERVICE SELECTION */}
            {step === 1 && (
              <motion.div
                key="step-services"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={springTransition}
                className="p-8 md:p-12"
              >
                <h2 className="text-xl font-bold tracking-tight mb-8 flex items-center gap-2 border-b border-zinc-200 pb-4">
                  <span className="w-1.5 h-6 bg-black rounded-full" />
                  SELECT CRITICAL SERVICE
                </h2>

                {loadingServices ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="h-44 bg-zinc-100 rounded-xl border border-zinc-200 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => {
                      const isSelected = selectedService?._id === service._id;
                      return (
                        <motion.div
                          key={service._id}
                          onClick={() => setSelectedService(service)}
                          whileHover={{ scale: 1.01, borderColor: "#000000" }}
                          whileTap={{ scale: 0.99 }}
                          className={`p-6 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-48 bg-white ${
                            isSelected
                              ? "border-black bg-zinc-50 shadow-lg shadow-black/5"
                              : "border-zinc-200 hover:bg-zinc-50"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
                                {service.meetingType}
                              </span>
                              {service.price ? (
                                <span className="text-sm font-semibold text-zinc-700">
                                  ${service.price.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-xs px-2.5 py-0.5 rounded-full border border-zinc-300 text-zinc-700 bg-zinc-100">
                                  Complimentary
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold tracking-tight text-black mb-2">
                              {service.name}
                            </h3>
                            <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                              {service.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-xs text-zinc-600 pt-4 border-t border-zinc-200">
                            <span className="flex items-center gap-1.5 font-light">
                              <Clock className="w-3.5 h-3.5" />
                              {service.duration} Mins
                            </span>
                            <span className="flex items-center gap-1 text-black font-medium">
                              Select <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-end mt-10">
                  <button
                    disabled={!selectedService}
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-8 py-3 bg-black text-white font-bold rounded-lg text-sm transition-all hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    CONTINUE TO SCHEDULE <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DATE & TIME SELECTOR */}
            {step === 2 && selectedService && (
              <motion.div
                key="step-schedule"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={springTransition}
                className="p-8 md:p-12"
              >
                <div className="flex items-center gap-4 mb-8 border-b border-zinc-200 pb-4">
                  <button
                    onClick={() => setStep(1)}
                    className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-black rounded-full" />
                    SELECT DATE & TIME
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Custom Calendar date list strip */}
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4">
                      AVAILABLE DAYS
                    </label>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scroll border border-zinc-200 p-2 rounded-xl bg-zinc-50/60">
                      {getNextDays().map((day) => {
                        const dateStr = getLocalDateString(day);
                        const isSelected = selectedDate === dateStr;
                        const formatted = day.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        });

                        return (
                          <button
                            key={dateStr}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`w-full p-4 text-left rounded-lg border transition-all flex justify-between items-center cursor-pointer ${
                              isSelected
                                ? "border-black bg-black text-white font-bold"
                                : "border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700"
                            }`}
                          >
                            <span className="text-sm">{formatted}</span>
                            <span className="text-xs text-zinc-500 flex items-center gap-1 font-light">
                              <Calendar className="w-3.5 h-3.5" /> Select
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Time Slot grid */}
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4">
                      {selectedDate
                        ? `SLOTS ON ${parseDateSafely(selectedDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}`
                        : "SELECT A DATE TO LOAD SLOTS"}
                    </label>

                    {!selectedDate ? (
                      <div className="h-64 border border-zinc-200 border-dashed rounded-xl flex flex-col items-center justify-center text-zinc-500 gap-2 bg-zinc-50/60">
                        <Clock className="w-8 h-8 text-zinc-400 animate-pulse" />
                        <span className="text-xs font-light">Awaiting date selection...</span>
                      </div>
                    ) : loadingSlots ? (
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <div key={n} className="h-12 bg-zinc-100 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="h-64 border border-zinc-200 border-dashed rounded-xl flex flex-col items-center justify-center text-zinc-500 gap-2 bg-zinc-50/60">
                        <Calendar className="w-8 h-8 text-zinc-400" />
                        <span className="text-xs font-light text-center px-4">
                          No slots available. Try selecting another date.
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 border border-zinc-200 p-2 rounded-xl bg-zinc-50/60">
                        {slots.map((slot) => {
                          const isSel = selectedSlot?.time === slot.time;
                          return (
                            <button
                              key={slot.time}
                              disabled={!slot.available}
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-3 rounded-lg border text-sm text-center transition-all cursor-pointer ${
                                !slot.available
                                  ? "border-zinc-200 bg-zinc-100 text-zinc-400 line-through opacity-50 cursor-not-allowed"
                                  : isSel
                                  ? "border-black bg-black text-white font-bold shadow-lg shadow-black/5"
                                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                              }`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-12 pt-6 border-t border-zinc-200">
                  <div className="text-xs text-zinc-500 font-light">
                    Selected Service: <span className="text-black font-semibold">{selectedService.name}</span>
                  </div>
                  <button
                    disabled={!selectedSlot}
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-8 py-3 bg-black text-white font-bold rounded-lg text-sm transition-all hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    CONTINUE TO DETAILS <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: BRIEFING FORM */}
            {step === 3 && selectedService && selectedSlot && (
              <motion.div
                key="step-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={springTransition}
                className="p-8 md:p-12"
              >
                <div className="flex items-center gap-4 mb-8 border-b border-zinc-200 pb-4">
                  <button
                    onClick={() => setStep(2)}
                    className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-black rounded-full" />
                    PROSPECT INTENTION PROFILES
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">
                        YOUR FULL NAME *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-lg p-3.5 text-sm outline-none transition-all placeholder:text-zinc-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">
                        EMAIL ADDRESS *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-lg p-3.5 text-sm outline-none transition-all placeholder:text-zinc-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">
                        COMPANY NAME
                      </label>
                      <input
                        type="text"
                        placeholder="Stripe Inc. (Optional)"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full bg-white border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-lg p-3.5 text-sm outline-none transition-all placeholder:text-zinc-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">
                        PROJECT CLASSIFICATION
                      </label>
                      <select
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                        className="w-full bg-white border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-lg p-3.5 text-sm outline-none transition-all"
                      >
                        <option value="">Select Category</option>
                        {PROJECT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-3">
                      ESTIMATED PROJECT BUDGET RANGE (STRIPE/APPLE PREMIUM STYLING)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {BUDGET_RANGES.map((range) => {
                        const isSel = formData.budgetRange === range;
                        return (
                          <button
                            key={range}
                            type="button"
                            onClick={() => setFormData({ ...formData, budgetRange: range })}
                            className={`p-3 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                              isSel
                                ? "border-black bg-black text-white font-semibold"
                                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-black"
                            }`}
                          >
                            {range}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">
                      OPERATION DETAILS & CONTEXT
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Outline your timeline, goals, integrations, and architectural scopes..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-white border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-lg p-3.5 text-sm outline-none transition-all resize-none placeholder:text-zinc-400"
                    />
                  </div>

                  {/* Summary brief */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <span className="text-zinc-500 text-xs font-light block">CONFIRMING BRIEFING</span>
                      <span className="text-sm font-bold block text-black mt-1">
                        {selectedService.name} on {parseDateSafely(selectedDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at {selectedSlot.time} (UTC)
                      </span>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-4 bg-black text-white font-bold text-sm rounded-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? "PROVISIONING..." : "SCHEDULE BRIEFING NOW"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS CONFIRMATION SCREEN */}
            {step === 4 && confirmedBooking && selectedService && (
              <motion.div
                key="step-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={springTransition}
                className="p-8 md:p-12 text-center"
              >
                <div className="inline-flex items-center justify-center p-4 bg-zinc-100 border border-zinc-200 rounded-full mb-6">
                  <CheckCircle className="w-10 h-10 text-black" />
                </div>
                
                <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">
                  BRIEFING CONFIRMED
                </h2>
                <p className="text-zinc-600 text-sm max-w-md mx-auto mb-8 font-light">
                  Your meeting coordinates are active. An automated validation email has been sent to{" "}
                  <strong className="text-black font-medium">{confirmedBooking.customerEmail}</strong>.
                </p>

                <div className="max-w-md mx-auto bg-zinc-50 border border-zinc-200 rounded-xl p-6 mb-8 text-left space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Service</span>
                    <span className="text-sm font-bold text-black">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Date</span>
                    <span className="text-sm font-medium text-black">
                      {parseDateSafely(confirmedBooking.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Time</span>
                    <span className="text-sm font-bold text-black">{confirmedBooking.timeSlot} (Host Local)</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Duration</span>
                    <span className="text-sm font-medium text-black">{selectedService.duration} Mins</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold mt-1">Access Coordinates</span>
                    <a
                      href={confirmedBooking.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded bg-black text-white font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" /> Join Google Meet <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <a
                    href={confirmedBooking.googleMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-8 py-3 bg-black text-white font-bold text-sm rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Video className="w-4 h-4" /> LAUNCH MEETING ROOM
                  </a>
                  <Link
                    to="/"
                    className="w-full sm:w-auto px-8 py-3 border border-zinc-200 hover:bg-zinc-100 transition-colors text-sm rounded-lg font-bold text-zinc-700"
                  >
                    RETURN TO AGENCY HOME
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer variant="light" />
    </div>
    </SmoothScroll>
  );
}

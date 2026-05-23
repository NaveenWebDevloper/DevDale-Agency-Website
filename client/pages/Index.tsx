import { useState, lazy, Suspense } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import { SmoothScroll } from "../components/SmoothScroll";

// Lazy load below-the-fold components
const Challenges = lazy(() => import("../components/Challenges"));
const WhyChoose = lazy(() => import("../components/WhyChoose"));
const Solutions = lazy(() => import("../components/Solutions"));
const Portfolio = lazy(() => import("../components/Portfolio"));
const HowToGetStarted = lazy(() => import("../components/HowToGetStarted"));
const ClientFeedback = lazy(() => import("../components/ClientFeedback"));
const Comparison = lazy(() => import("../components/Comparison"));
const FAQ = lazy(() => import("../components/FAQ"));
const Footer = lazy(() => import("../components/Footer"));

export default function Index() {
  const [isLoaded] = useState(true);

  // Reusable lightweight fallback to prevent layout shifts
  const SectionFallback = () => (
    <div className="w-full h-[400px] bg-gray-50/5 animate-pulse-soft border border-black/[0.02] rounded-[2.5rem]" />
  );

  return (
    <SmoothScroll>
      <div className="w-full max-w-[100vw] overflow-x-hidden bg-white relative">
        <div
          style={{ visibility: isLoaded ? "visible" : "hidden" }}
          aria-hidden={!isLoaded}
        >
          <div className="noise" />
          <Navbar isLoaded={isLoaded} />
          <main>
            <Hero isLoaded={isLoaded} />
            
            <Suspense fallback={<SectionFallback />}>
              <Challenges isLoaded={isLoaded} />
            </Suspense>
            
            <Suspense fallback={<SectionFallback />}>
              <WhyChoose isLoaded={isLoaded} />
            </Suspense>
            
            <Suspense fallback={<SectionFallback />}>
              <Solutions />
            </Suspense>
            
            <Suspense fallback={<SectionFallback />}>
              <Portfolio isLoaded={isLoaded} />
            </Suspense>
            
            <Suspense fallback={<SectionFallback />}>
              <HowToGetStarted />
            </Suspense>
            
            <Suspense fallback={<SectionFallback />}>
              <ClientFeedback />
            </Suspense>
            
            <Suspense fallback={<SectionFallback />}>
              <Comparison />
            </Suspense>
            
            <Suspense fallback={<SectionFallback />}>
              <FAQ />
            </Suspense>
          </main>
          
          <Suspense fallback={<div className="w-full h-48 bg-gray-50/5 animate-pulse-soft" />}>
            <Footer />
          </Suspense>
        </div>
      </div>
    </SmoothScroll>
  );
}

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import PageSkeletonLoader from "./components/PageSkeletonLoader";
import SEO from "./components/SEO";
import ConversionLayer from "./components/ConversionLayer";
import AnalyticsTags from "./components/AnalyticsTags";

// Dynamic page imports
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const Legal = lazy(() => import("./pages/Legal"));
const SeoLandingPage = lazy(() => import("./pages/SeoLandingPage"));
const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const PortfolioIndex = lazy(() => import("./pages/PortfolioIndex"));
const NotFound = lazy(() => import("./pages/NotFound"));

import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SEO />
        <AnalyticsTags />
        <ScrollToTop />
        <Suspense fallback={<PageSkeletonLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/portfolio" element={<PortfolioIndex />} />
            <Route path="/case-studies" element={<SeoLandingPage />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<SeoLandingPage />} />
            <Route path="/services/:slug" element={<SeoLandingPage />} />
            <Route path="/location/:city" element={<SeoLandingPage />} />
            <Route path="/industries/:slug" element={<SeoLandingPage />} />
            <Route path="/work/:id" element={<ProjectDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <ConversionLayer />
        <Analytics />
        <SpeedInsights />
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  );
}

export default App;


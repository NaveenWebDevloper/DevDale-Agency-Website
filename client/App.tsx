import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense, Component, ReactNode } from "react";
import { LazyMotion, domAnimation } from "framer-motion";
import PageSkeletonLoader from "./components/PageSkeletonLoader";
import SEO from "./components/SEO";
import ConversionLayer from "./components/ConversionLayer";
import AnalyticsTags from "./components/AnalyticsTags";
import ClarityTracker from "./components/ClarityTracker";

// Dynamic page imports
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Work = lazy(() => import("./pages/Work"));
const Contact = lazy(() => import("./pages/Contact"));
const Legal = lazy(() => import("./pages/Legal"));
const SeoLandingPage = lazy(() => import("./pages/SeoLandingPage"));
const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const PortfolioIndex = lazy(() => import("./pages/PortfolioIndex"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Book = lazy(() => import("./pages/Book"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

// Lazy-load Vercel telemetry — not critical path, saves initial bundle size
const Analytics = lazy(() =>
  import("@vercel/analytics/react").then((m) => ({ default: m.Analytics }))
);
const SpeedInsights = lazy(() =>
  import("@vercel/speed-insights/react").then((m) => ({ default: m.SpeedInsights }))
);

import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

/**
 * ErrorBoundary — catches crashes in lazy-loaded pages
 * Without this, a chunk load failure silently breaks the entire app.
 */
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white text-black p-8">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-gray-500 text-sm">Please try refreshing the page.</p>
          <a
            href="/"
            className="px-6 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-zinc-800 transition-colors"
          >
            Go Home
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function App() {
  return (
    /**
     * LazyMotion — tree-shakes framer-motion from 138KB → ~75KB.
     * Only domAnimation features are loaded (no 3D transforms, layout animations
     * are loaded lazily). All motion.* must be m.* inside this context.
     * Components using framer-motion directly (Preloader, Hero) use m.* already.
     */
    <LazyMotion features={domAnimation}>
      <TooltipProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <SEO />
          <AnalyticsTags />
          <ClarityTracker />
          <ScrollToTop />
          <ErrorBoundary>
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
                <Route path="/work" element={<Work />} />
                <Route path="/work/:id" element={<ProjectDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/book" element={<Book />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
          <ConversionLayer />
          {/* Vercel telemetry — deferred via Suspense, no fallback needed */}
          <Suspense fallback={null}>
            <Analytics />
            <SpeedInsights />
          </Suspense>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </LazyMotion>
  );
}

export default App;

import { useState } from "react";
import Navbar from "../components/Navbar";
import Preloader from "../components/Preloader";
import Hero from "../components/Hero";
import Challenges from "../components/Challenges";
import WhyChoose from "../components/WhyChoose";
import Solutions from "../components/Solutions";
import Portfolio from "../components/Portfolio";
import HowToGetStarted from "../components/HowToGetStarted";
import ClientFeedback from "../components/ClientFeedback";
import Comparison from "../components/Comparison";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import { SmoothScroll } from "../components/SmoothScroll";

export default function Index() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <SmoothScroll>
      <div className="w-full max-w-[100vw] overflow-x-hidden bg-white relative">
        {/* Preloader sits on top as a visual overlay — content is always in DOM */}
        <Preloader onComplete={() => setIsLoaded(true)} />

        {/*
          CLS FIX: Content is always rendered in the DOM so the browser
          never has to shift elements into existence after the preloader exits.
          We use visibility:hidden (not display:none) so layout is preserved
          and no reflow occurs on reveal — only a paint operation.
        */}
        <div
          style={{ visibility: isLoaded ? "visible" : "hidden" }}
          aria-hidden={!isLoaded}
        >
          <div className="noise" />
          <Navbar isLoaded={isLoaded} />
          <main>
            <Hero isLoaded={isLoaded} />
            <Challenges isLoaded={isLoaded} />
            <WhyChoose isLoaded={isLoaded} />
            <Solutions />
            <Portfolio isLoaded={isLoaded} />
            <HowToGetStarted />
            <ClientFeedback />
            <Comparison />
            <FAQ />
          </main>
          <Footer />
        </div>
      </div>
    </SmoothScroll>
  );
}

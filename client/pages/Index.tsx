import { useState, useEffect } from "react";
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
        <Preloader onComplete={() => setIsLoaded(true)} />
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
    </SmoothScroll>
  );
}

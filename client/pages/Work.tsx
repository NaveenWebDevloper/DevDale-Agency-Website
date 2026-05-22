import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StartProjectForm from "../components/StartProjectForm";
import { SmoothScroll } from "../components/SmoothScroll";

export default function Work() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-white relative font-sans selection:bg-black selection:text-white overflow-hidden">
        <Navbar isLoaded={isLoaded} />
        <main className="relative z-10 pt-20">
          <StartProjectForm />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}

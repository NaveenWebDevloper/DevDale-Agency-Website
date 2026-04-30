import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TextSegment {
  text: string;
  className?: string;
}

interface TypewriterProps {
  allSequences: TextSegment[][];
  className?: string;
  delay?: number;
  speed?: number;
  pauseTime?: number;
}

export const Typewriter = ({ 
  allSequences, 
  className = "", 
  delay = 0, 
  speed = 0.03,
  pauseTime = 4000 
}: TypewriterProps) => {
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentSegments = allSequences[sequenceIndex];
  const allChars = currentSegments.flatMap((segment, sIndex) => 
    segment.text.split("").map(char => ({ char, sIndex }))
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsStarted(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isStarted) return;

    if (!isDeleting && currentIndex < allChars.length) {
      // Typing
      const timeout = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, speed * 1000);
      return () => clearTimeout(timeout);
    } else if (!isDeleting && currentIndex === allChars.length) {
      // Pause at the end
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(timeout);
    } else if (isDeleting && currentIndex > 0) {
      // Deleting (faster than typing for better UX)
      const timeout = setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
      }, speed * 500);
      return () => clearTimeout(timeout);
    } else if (isDeleting && currentIndex === 0) {
      // Finished deleting, move to next sequence
      setIsDeleting(false);
      setSequenceIndex((prev) => (prev + 1) % allSequences.length);
    }
  }, [isStarted, currentIndex, allChars.length, speed, isDeleting, allSequences.length, pauseTime]);

  return (
    <span className={className} style={{ display: "block", position: "relative", textAlign: "center" }}>
      {/* Invisible layer to reserve space (using the longest sequence for stability) */}
      <span className="opacity-0 pointer-events-none select-none block" aria-hidden="true">
        {currentSegments.map((s, i) => (
          <span key={i} className={s.className}>{s.text}</span>
        ))}
      </span>

      {/* Visible typing layer */}
      <div className="absolute inset-0 flex items-start justify-center">
        <div className="w-full text-center">
          {allChars.slice(0, currentIndex).map((item, index) => (
            <span key={index} className={currentSegments[item.sIndex].className}>
              {item.char}
            </span>
          ))}
          {isStarted && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="inline-block w-[2px] h-[1.1em] bg-current ml-0.5 align-middle"
            />
          )}
        </div>
      </div>
    </span>
  );
};

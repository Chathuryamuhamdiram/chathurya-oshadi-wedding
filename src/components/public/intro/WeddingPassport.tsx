"use client";

import { IntroState } from "./WeddingIntro";
import { PassportCover } from "./PassportCover";
import { PassportSpread } from "./PassportSpread";

interface WeddingPassportProps {
  state: IntroState;
  onOpen: () => void;
}

export function WeddingPassport({ state, onOpen }: WeddingPassportProps) {
  // Hide passport during "ready" and "travel"
  const isVisible = state !== "ready" && state !== "travel";
  // When complete, the passport expands and fades out
  const isComplete = state === "complete";

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 transition-all duration-1000 ease-in-out"
      style={{
        opacity: isVisible && !isComplete ? 1 : 0,
        transform: isVisible && !isComplete ? "scale(1)" : (isComplete ? "scale(1.1)" : "scale(0.95)"),
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div 
        className="relative w-[76vw] max-w-[420px] h-[100vw] max-h-[580px] md:w-[480px] md:h-[640px] shadow-2xl rounded-md transition-transform duration-1000"
        style={{
          perspective: "1400px",
          transformStyle: "preserve-3d",
          // When opening, we slightly shift the passport to the right so it stays centered when the left cover flips open
          transform: state === "opening" || state === "stamped" || state === "complete" 
            ? "translateX(25%) rotateY(0deg) scale(0.9)" 
            : "translateX(0%) rotateY(0deg) scale(1)",
        }}
      >
        <PassportSpread state={state} />
        <PassportCover state={state} onOpen={onOpen} />
      </div>
    </div>
  );
}

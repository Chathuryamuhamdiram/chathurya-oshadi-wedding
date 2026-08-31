"use client";

import { useEffect, useState } from "react";
import { TravelDecorations } from "./TravelDecorations";
import { PassportCover } from "./PassportCover";
import { PassportSpread } from "./PassportSpread";

export type IntroState = "ready" | "starting" | "opening" | "revealed" | "transitioning" | "complete";

interface WeddingPassportIntroProps {
  onComplete: () => void;
}

export function WeddingPassportIntro({ onComplete }: WeddingPassportIntroProps) {
  const [state, setState] = useState<IntroState>("ready");
  const [isHovered, setIsHovered] = useState(false);

  // Scroll locking for the entire duration of the intro
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleOpenPassport = () => {
    if (state !== "ready") return;

    // 1. Play background music (if configured elsewhere, it uses standard audio element or we can trigger it)
    // Assuming there's a global audio element, or we just play it if we find it
    const audio = document.getElementById("bg-music") as HTMLAudioElement | null;
    if (audio) {
      audio.volume = 0.25;
      audio.play().catch((e) => console.log("Audio autoplay prevented", e));
    }

    // 2. Hide CTA, animate airplane, lift passport
    setState("starting");

    // 3. Open the cover
    setTimeout(() => {
      setState("opening");
    }, 800);

    // 4. Reveal inside pages (content fades in)
    setTimeout(() => {
      setState("revealed");
    }, 2000); // Wait for the 1200ms cover flip

    // 5. Transition out (scale up and fade out)
    setTimeout(() => {
      setState("transitioning");
    }, 5500); // Give user 3.5 seconds to read the inside

    // 6. Complete and unmount
    setTimeout(() => {
      setState("complete");
      onComplete(); // Triggers the parent state to show the FloatingNav and Hero
    }, 7000); // Wait for the 1000ms transition out
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-[#0C192E] overflow-hidden transition-opacity duration-1000 ease-in-out"
      style={{
        opacity: state === "transitioning" || state === "complete" ? 0 : 1,
        pointerEvents: state === "transitioning" || state === "complete" ? "none" : "auto",
      }}
    >
      <TravelDecorations state={state} />
      
      {/* Central Passport Container */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        <div 
          className="relative w-[76vw] max-w-[420px] h-[100vw] max-h-[580px] md:w-[480px] md:h-[640px] transition-transform duration-1000"
          style={{
            perspective: "1400px",
            transformStyle: "preserve-3d",
            transform: state === "starting" ? "scale(1.02) translateY(-5px)" 
                     : state === "opening" || state === "revealed" ? "translateX(25%) rotateY(0deg) scale(0.9)"
                     : state === "transitioning" ? "scale(1.2)" 
                     : "scale(1)",
          }}
        >
          <PassportSpread state={state} />
          <PassportCover state={state} onOpen={handleOpenPassport} />
        </div>
      </div>

      {/* Interactive CTA: BEGIN OUR JOURNEY */}
      <div 
        className="absolute bottom-10 left-0 right-0 flex justify-center z-40"
        style={{
          opacity: state === "ready" ? 1 : 0,
          pointerEvents: state === "ready" ? "auto" : "none",
          transition: "opacity 300ms ease"
        }}
      >
        <button
          onClick={handleOpenPassport}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Begin our wedding journey"
          className="group flex flex-col items-center justify-center cursor-pointer transition-transform duration-300"
          style={{ transform: isHovered ? "scale(1.02)" : "scale(1)" }}
        >
          {/* Top decorative ornament */}
          <div className="w-48 h-12 md:w-56 md:h-14 mb-2 mix-blend-screen overflow-hidden flex items-center justify-center transition-opacity duration-300" style={{ opacity: isHovered ? "1" : "0.7" }}>
            <img 
              src="/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_54 PM (7).png" 
              alt="Decorative Botanical Ornament" 
              className="object-contain w-full h-full"
              aria-hidden="true"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className={`w-8 h-[1px] bg-[#D7B56D] transition-all duration-300 ${isHovered ? "w-12 opacity-100" : "opacity-60"}`} />
            <span className={`font-serif text-[#D7B56D] text-[11px] md:text-xs tracking-[0.3em] uppercase transition-all duration-300 ${isHovered ? "drop-shadow-[0_0_8px_rgba(215,181,109,0.4)]" : ""}`}>
              Begin Our Journey
            </span>
            <div className={`w-8 h-[1px] bg-[#D7B56D] transition-all duration-300 ${isHovered ? "w-12 opacity-100" : "opacity-60"}`} />
          </div>

          {/* Bottom downward arrow */}
          <svg className={`w-4 h-4 mt-2 transition-transform duration-300 ${isHovered ? "translate-y-1" : ""}`} viewBox="0 0 24 24" fill="none" stroke="#D7B56D" strokeWidth="1">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}

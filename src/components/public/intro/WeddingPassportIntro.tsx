"use client";

import { useState, useEffect } from "react";
import { TravelDecorations } from "./TravelDecorations";
import { PassportBook } from "./PassportBook";

export type IntroState = "ready" | "starting" | "opening" | "revealed" | "fade_bg" | "fade_passport" | "complete";

interface WeddingPassportIntroProps {
  onComplete: () => void;
}

export function WeddingPassportIntro({ onComplete }: WeddingPassportIntroProps) {
  const [state, setState] = useState<IntroState>("ready");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleOpenPassport = () => {
    if (state !== "ready") return;

    const audio = document.getElementById("bg-music") as HTMLAudioElement | null;
    if (audio) {
      audio.volume = 0.25;
      audio.play().catch((e) => console.log("Audio autoplay prevented", e));
    }

    // Stage 1: CTA fades, Airplane moves, Background animating depth, Passport lifting
    setState("starting");

    // Stage 5: Passport opens (after lifting)
    setTimeout(() => {
      setState("opening");
    }, 800);

    // Stage 6/7: Inside pages revealed, Stamp animates
    setTimeout(() => {
      setState("revealed");
    }, 2000); // 1200ms opening

    // Stage 8: Transition - Background fades revealing Hero
    setTimeout(() => {
      setState("fade_bg");
    }, 5500); // 3500ms pause after reveal to allow animations to finish

    // Stage 8b: Transition - Passport slightly enlarges and fades away
    setTimeout(() => {
      setState("fade_passport");
    }, 6500);

    // Stage 9: Complete and unmount
    setTimeout(() => {
      setState("complete");
      onComplete();
    }, 7500);
  };

  const isBgFaded = state === "fade_bg" || state === "fade_passport" || state === "complete";
  const isPassportFaded = state === "fade_passport" || state === "complete";

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-hidden transition-colors duration-1000 ease-in-out"
      style={{
        backgroundColor: isBgFaded ? "transparent" : "#0C192E",
        pointerEvents: isBgFaded ? "none" : "auto",
      }}
    >
      <TravelDecorations state={state} />
      
      {/* Main Content Layout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30 py-4">
        
        {/* Responsive Scale Wrapper & Opacity Wrapper for Safari 3D support */}
        <div 
          className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] flex justify-center items-center ${
            (state === "opening" || state === "revealed" || state === "fade_bg") 
              ? "scale-[0.55] sm:scale-75 md:scale-95 lg:scale-100" 
              : state === "fade_passport"
              ? "scale-[0.6] sm:scale-[0.8] md:scale-105 lg:scale-110"
              : "scale-100"
          }`}
          style={{
            opacity: isPassportFaded ? 0 : 1,
            transitionProperty: "transform, opacity",
            transitionDuration: state === "fade_passport" ? "700ms" : "1200ms"
          }}
        >
          {/* Central Passport Container (Preserve 3D) */}
          <div 
            className="relative h-[55vh] max-h-[460px] md:h-[65vh] md:max-h-[640px] aspect-[1/1.4] transition-transform duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{
              perspective: "1400px",
              transformStyle: "preserve-3d",
              transform: state === "starting" ? "scale(1.03) translateY(-10px)" 
                       : (state === "opening" || state === "revealed" || state === "fade_bg" || state === "fade_passport") ? "translateX(50%) rotateY(0deg)"
                       : "scale(1)",
            }}
          >
            <PassportBook state={state} onOpen={handleOpenPassport} />
          </div>
        </div>

        {/* Interactive CTA: BEGIN OUR JOURNEY */}
        <div 
          className="mt-6 md:mt-10 flex justify-center z-40 pointer-events-auto"
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
            className="group flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 outline-none bg-transparent border-none p-4"
            style={{ transform: isHovered ? "scale(1.02)" : "scale(1)" }}
          >
            {/* Top ornament */}
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-[1px] bg-[#D7B56D] transition-all duration-300 ${isHovered ? "w-12 opacity-100" : "opacity-60"}`} />
              <div className={`w-12 h-3 md:w-16 md:h-4 mix-blend-screen transition-all duration-300 ${isHovered ? "opacity-100 brightness-110" : "opacity-70"}`}>
                <img src="/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_54 PM (7).png" alt="" className="object-contain w-full h-full" aria-hidden="true" />
              </div>
              <div className={`w-8 h-[1px] bg-[#D7B56D] transition-all duration-300 ${isHovered ? "w-12 opacity-100" : "opacity-60"}`} />
            </div>
            
            <span className={`font-serif text-[#D7B56D] text-[11px] md:text-xs tracking-[0.3em] uppercase transition-all duration-300 ${isHovered ? "brightness-125 drop-shadow-[0_0_8px_rgba(215,181,109,0.4)]" : ""}`}>
              Begin Our Journey
            </span>
            
            {/* Bottom ornament */}
            <div className="flex items-center gap-3 mt-3">
              <div className={`w-8 h-[1px] bg-[#D7B56D] transition-all duration-300 ${isHovered ? "w-12 opacity-100" : "opacity-60"}`} />
              <div className={`w-12 h-3 md:w-16 md:h-4 mix-blend-screen transition-all duration-300 rotate-180 ${isHovered ? "opacity-100 brightness-110" : "opacity-70"}`}>
                <img src="/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_54 PM (7).png" alt="" className="object-contain w-full h-full" aria-hidden="true" />
              </div>
              <div className={`w-8 h-[1px] bg-[#D7B56D] transition-all duration-300 ${isHovered ? "w-12 opacity-100" : "opacity-60"}`} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

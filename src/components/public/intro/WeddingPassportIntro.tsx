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

        {/* Interactive CTA: OPEN WEDDING PASSPORT */}
        <div 
          className="mt-4 md:mt-6 flex flex-col items-center justify-center z-40 pointer-events-auto"
          style={{
            opacity: state === "ready" ? 1 : 0,
            pointerEvents: state === "ready" ? "auto" : "none",
            transition: "opacity 300ms ease"
          }}
        >
          {/* Helper Text */}
          <p className="text-white/50 text-[11px] md:text-xs mb-3 font-sans tracking-wide">
            Tap the passport or button to continue
          </p>

          <button
            onClick={handleOpenPassport}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Open wedding passport"
            disabled={state !== "ready"}
            className={`group relative flex items-center justify-center gap-2 outline-none transition-all duration-500 ease-out border border-[#D7B56D]/60 hover:border-[#D7B56D] bg-[#10233B]/40 hover:bg-[#10233B]/80 rounded-full px-6 md:px-8 py-3 md:py-3.5 shadow-[0_0_15px_rgba(215,181,109,0)] hover:shadow-[0_0_20px_rgba(215,181,109,0.2)] ${isHovered ? "scale-105" : "scale-100"}`}
            style={{ minHeight: "44px" }}
          >
            {/* Initial glow for attention */}
            <div className="absolute inset-0 rounded-full bg-[#D7B56D]/20 animate-pulse pointer-events-none" style={{ animationIterationCount: 3, animationDuration: "2s" }} />

            <span className="font-serif text-[#E1BE72] text-[12px] md:text-[13px] tracking-[0.2em] font-medium uppercase relative z-10 transition-colors group-hover:text-white">
              OPEN WEDDING PASSPORT
            </span>
            <span className="relative z-10 text-[#E1BE72] font-serif text-[16px] leading-none mb-[2px] transition-colors group-hover:text-white animate-[pulseRight_2s_ease-in-out_infinite]">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

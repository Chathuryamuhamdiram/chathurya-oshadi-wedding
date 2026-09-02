"use client";

import { IntroState } from "./WeddingPassportIntro";

interface TravelDecorationsProps {
  state: IntroState;
}

const introAssets = {
  sriLankaMap: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_51 PM (2).png",
  palm: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_51 PM (3).png",
  heritage: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_52 PM (4).png",
  flightPath: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_52 PM (5).png",
  airplane: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_52 PM (6).png",
  foreverStamp: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_54 PM (9).png",
  petals1: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_55 PM (10).png",
  petals2: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_06_11 PM.png",
};

export function TravelDecorations({ state }: TravelDecorationsProps) {
  const isBgFaded = state === "fade_bg" || state === "fade_passport" || state === "complete";
  const isAnimating = state !== "ready";

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10 overflow-hidden transition-opacity duration-1000 ease-in-out"
      style={{ opacity: isBgFaded ? 0 : 1 }}
    >
      {/* Base Radial Navy Gradient mimicking the image lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#182B48_0%,_#0C1627_100%)] opacity-95" />
      
      {/* Leather / Paper Texture Overlay */}
      <div 
        className="absolute inset-0 mix-blend-multiply opacity-[0.4]" 
        style={{ 
          backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" 
        }} 
      />

      {/* --- LEFT SIDE DECORATIONS --- */}
      
      {/* Forever Begins Stamp (Background) - 20-35% opacity requested */}
      <div 
        className="absolute top-[15%] left-[2%] md:top-[22%] md:left-[18%] w-40 h-40 md:w-56 md:h-56 mix-blend-screen transition-transform duration-[4000ms] ease-out z-20 opacity-30"
        style={{
          transform: isAnimating ? "scale(1.05) translate(-10px, -10px) rotate(-15deg)" : "scale(1) translate(0, 0) rotate(-15deg)",
        }}
      >
        <img 
          src={introAssets.foreverStamp} 
          alt="" 
          className="object-contain w-full h-full drop-shadow-xl"
          aria-hidden="true"
        />
      </div>

      {/* Sri Lankan Heritage / Stupa (Lower Left) - 10-18% opacity requested. Hide on mobile */}
      <div 
        className="hidden md:block absolute bottom-[8%] left-[-5%] w-[380px] h-auto opacity-[0.15] mix-blend-screen transition-transform duration-[5000ms] ease-out"
        style={{
          transform: isAnimating ? "scale(1.02) translate(10px, -5px)" : "scale(1) translate(0, 0)",
        }}
      >
        <img src={introAssets.heritage} alt="" className="object-contain w-full h-full" aria-hidden="true" />
      </div>

      {/* Tropical Palm (Lower Left) - 10-20% opacity requested. Hide on mobile */}
      <div 
        className="hidden md:block absolute bottom-[10%] left-[18%] w-[280px] h-auto opacity-[0.15] mix-blend-screen transition-transform duration-[6000ms] ease-out"
        style={{
          transform: isAnimating ? "scale(1.04) translate(-10px, -15px)" : "scale(1) translate(0, 0)",
        }}
      >
        <img src={introAssets.palm} alt="" className="object-contain w-full h-full" aria-hidden="true" />
      </div>

      {/* --- RIGHT SIDE DECORATIONS --- */}
      
      {/* Sri Lanka Outline Map (Upper Right) - 10-18% opacity requested */}
      <div 
        className="absolute top-[8%] right-[5%] md:top-[12%] md:right-[15%] w-32 h-48 md:w-48 md:h-64 opacity-[0.15] mix-blend-screen transition-transform duration-[5000ms] ease-out"
        style={{
          transform: isAnimating ? "scale(1.03) translate(-5px, 10px)" : "scale(1) translate(0, 0)",
        }}
      >
        <img src={introAssets.sriLankaMap} alt="" className="object-contain w-full h-full" aria-hidden="true" />
      </div>

      {/* Dotted Flight Path - 15-25% opacity requested. Simplify on mobile via CSS bounds */}
      <div className="absolute top-[20%] right-[-10%] md:top-[30%] md:right-0 w-[120vw] md:w-[80vw] h-[60vh] opacity-20 mix-blend-screen pointer-events-none">
        <img src={introAssets.flightPath} alt="" className="object-contain w-full h-full" aria-hidden="true" />
      </div>

      {/* Airplane on the path */}
      <div 
        className="absolute top-[45%] right-[20%] md:top-[55%] md:right-[28%] w-12 h-12 md:w-16 md:h-16 mix-blend-screen transition-all duration-[3000ms] ease-[cubic-bezier(0.25,1,0.5,1)] z-10"
        style={{
          transform: state === "ready" ? "translate(0, 0) rotate(20deg)" : "translate(-12vw, -12vh) rotate(5deg) scale(1.15)",
          opacity: state === "ready" ? 0.7 : 0.9
        }}
      >
        <img src={introAssets.airplane} alt="" className="object-contain w-full h-full drop-shadow-md" aria-hidden="true" />
      </div>

      {/* --- FOREGROUND PETALS (Slow drift physics) --- */}
      
      {/* Floating Petals (Top Left) */}
      <div 
        className="absolute top-[5%] left-[5%] md:top-[10%] md:left-[10%] w-32 h-32 md:w-64 md:h-64 opacity-40 mix-blend-screen transition-all duration-[8000ms] ease-linear"
        style={{
          transform: isAnimating ? "translate(30px, 40px) rotate(20deg)" : "translate(0, 0) rotate(15deg)",
        }}
      >
        <img src={introAssets.petals2} alt="" className="object-contain w-full h-full" aria-hidden="true" />
      </div>

      {/* Large Petal Cluster (Bottom Right Foreground) - Scale down on mobile */}
      <div 
        className="absolute -bottom-[5%] -right-[15%] md:-bottom-[5%] md:-right-[5%] w-36 h-36 md:w-96 md:h-96 opacity-50 mix-blend-screen blur-[1px] md:blur-[2px] pointer-events-none z-20 transition-all duration-[10000ms] ease-linear"
        style={{
          transform: isAnimating ? "translate(-20px, -30px) rotate(-10deg)" : "translate(0, 0) rotate(-15deg)",
        }}
      >
        <img src={introAssets.petals1} alt="" className="object-contain w-full h-full drop-shadow-xl" aria-hidden="true" />
      </div>
    </div>
  );
}

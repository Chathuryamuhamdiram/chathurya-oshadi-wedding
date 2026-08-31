"use client";

import { IntroState } from "./WeddingIntro";

export function PassportStamp({ state }: { state: IntroState }) {
  const isStamped = state === "stamped" || state === "complete";

  return (
    <div
      className="absolute bottom-6 right-6 md:bottom-12 md:right-12 flex flex-col items-center justify-center w-28 h-28 md:w-32 md:h-32 border-4 border-[#C9A45D]/60 rounded-full z-30"
      style={{
        transform: isStamped ? "scale(1) rotate(-8deg)" : "scale(1.25) rotate(-15deg)",
        opacity: isStamped ? 1 : 0,
        transition: "transform 350ms cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 300ms ease",
        // Stamp ink effect using mix-blend-mode if the background is light
        mixBlendMode: "multiply",
      }}
    >
      <div className="absolute inset-[3px] border border-[#C9A45D]/40 rounded-full" />
      <p className="font-serif text-[10px] md:text-xs text-[#C9A45D] uppercase tracking-widest font-bold mb-1">
        Forever Begins
      </p>
      <div className="w-12 h-[1px] bg-[#C9A45D]/50 my-1" />
      <p className="font-sans text-[8px] md:text-[9px] text-[#C9A45D] uppercase tracking-[0.2em] font-semibold">
        08 Oct 2026
      </p>
      <p className="font-sans text-[7px] md:text-[8px] text-[#C9A45D] uppercase tracking-[0.1em] mt-1">
        Sri Lanka
      </p>
      
      {/* Imperfections for vintage stamp look */}
      <div className="absolute inset-0 bg-[#F8F2E8] opacity-30 rounded-full filter blur-[1px] mix-blend-screen pointer-events-none" style={{ clipPath: "polygon(0 0, 100% 20%, 80% 100%, 10% 80%)" }} />
    </div>
  );
}

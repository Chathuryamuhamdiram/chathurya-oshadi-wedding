"use client";

import { IntroState } from "./WeddingIntro";
import { PassportStamp } from "./PassportStamp";

export function PassportSpread({ state }: { state: IntroState }) {
  // Inside details fade in when state hits "opening" (with a delay handled by CSS or state progression)
  const isDetailsVisible = state === "stamped" || state === "complete";
  const isQuoteVisible = state === "stamped" || state === "complete";

  return (
    <div className="absolute inset-0 flex bg-[#F8F2E8] shadow-inner rounded-md overflow-hidden z-0">
      
      {/* Paper texture overlay for the inside pages */}
      <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />

      {/* Center Spine Crease */}
      <div className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/10 to-transparent pointer-events-none" />
      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/5 pointer-events-none" />

      {/* Left Page: Names & Date */}
      <div className="w-1/2 h-full flex flex-col items-center justify-center p-4 md:p-8 text-center relative border-r border-dashed border-[#8A8379]/20">
        <div 
          className="transition-opacity duration-700 delay-300"
          style={{ opacity: isDetailsVisible ? 1 : 0 }}
        >
          <p className="font-sans text-[8px] md:text-[10px] text-[#10233B]/60 uppercase tracking-[0.3em] mb-4">The Wedding Of</p>
          <h2 className="font-serif text-2xl md:text-3xl text-[#10233B] mb-1">Chathurya</h2>
          <span className="font-serif text-lg md:text-xl text-[#D7B56D] italic">&</span>
          <h2 className="font-serif text-2xl md:text-3xl text-[#10233B] mt-1 mb-6">Oshadi</h2>
          
          <div className="w-12 h-[1px] bg-[#D7B56D]/40 mx-auto mb-6" />
          
          <p className="font-sans text-[9px] md:text-[11px] text-[#10233B] uppercase tracking-[0.2em] font-medium mb-1">08 October 2026</p>
          <p className="font-sans text-[7px] md:text-[8px] text-[#10233B]/60 uppercase tracking-[0.2em]">Hikkaduwa, Sri Lanka</p>
        </div>
      </div>

      {/* Right Page: Schedule & Stamp */}
      <div className="w-1/2 h-full flex flex-col p-4 md:p-8 justify-center relative">
        <div 
          className="transition-opacity duration-700 delay-500 pl-2 md:pl-6"
          style={{ opacity: isDetailsVisible ? 1 : 0 }}
        >
          <div className="mb-6">
            <h3 className="font-serif text-sm md:text-base text-[#10233B] mb-1">Poruwa Ceremony</h3>
            <p className="font-sans text-[8px] md:text-[9px] text-[#D7B56D] uppercase tracking-widest font-semibold mb-1">08:50 AM</p>
            <p className="font-sans text-[7px] md:text-[8px] text-[#10233B]/60 uppercase tracking-widest">Hotel River Park</p>
          </div>
          
          <div>
            <h3 className="font-serif text-sm md:text-base text-[#10233B] mb-1">Reception</h3>
            <p className="font-sans text-[8px] md:text-[9px] text-[#D7B56D] uppercase tracking-widest font-semibold mb-1">10:30 AM</p>
            <p className="font-sans text-[7px] md:text-[8px] text-[#10233B]/60 uppercase tracking-widest">Hotel Grand Palace</p>
          </div>
        </div>

        {/* Passport Stamp Component */}
        <PassportStamp state={state} />
      </div>

      {/* Romantic Quote (Briefly revealed over entire spread) */}
      <div 
        className="absolute inset-x-0 bottom-4 md:bottom-8 flex justify-center pointer-events-none transition-opacity duration-1000 z-40"
        style={{ opacity: isQuoteVisible ? 1 : 0, transitionDelay: "1500ms" }}
      >
        <p className="font-serif italic text-xs md:text-sm text-[#10233B]/80 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
          From our first hello to forever.
        </p>
      </div>
    </div>
  );
}

"use client";

import { IntroState } from "./WeddingIntro";

interface PassportCoverProps {
  state: IntroState;
  onOpen: () => void;
}

export function PassportCover({ state, onOpen }: PassportCoverProps) {
  const isClosed = state === "ready" || state === "travel" || state === "passport";

  return (
    <div
      className="absolute inset-0 origin-left shadow-2xl rounded-r-md border border-[#D7B56D]/20 flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundColor: "#10233B",
        zIndex: isClosed ? 40 : 10,
        transformStyle: "preserve-3d",
        transform: isClosed ? "rotateY(0deg)" : "rotateY(-180deg)",
        transition: "transform 1000ms cubic-bezier(0.4, 0, 0.2, 1), z-index 0ms linear 500ms", // Z-index drops halfway through rotation
        backfaceVisibility: "hidden", // We'll render the inside cover on the back if needed, or just use hidden so we see the spread underneath
      }}
    >
      {/* Leather / Paper Texture */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />
      
      {/* Spine Binding Effect */}
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 to-transparent shadow-[2px_0_4px_rgba(0,0,0,0.2)]" />

      {/* Gold Embossed Frame */}
      <div className="absolute inset-4 md:inset-6 border-[1.5px] border-[#D7B56D]/50 rounded-sm pointer-events-none" />
      <div className="absolute inset-5 md:inset-7 border border-[#D7B56D]/30 rounded-sm pointer-events-none" />

      <div className="flex flex-col items-center text-center z-10 p-6 pt-12">
        <p className="font-sans text-[8px] md:text-[10px] text-[#D7B56D] uppercase tracking-[0.4em] mb-4">You Are Invited</p>
        <h1 className="font-serif text-xl md:text-2xl text-[#D7B56D] tracking-[0.1em] mb-8">WEDDING PASSPORT</h1>
        
        {/* Globe Emblem */}
        <div className="w-16 h-16 md:w-20 md:h-20 border border-[#D7B56D] rounded-full flex items-center justify-center mb-8 relative">
           {/* Simple SVG Globe / Compass */}
           <svg viewBox="0 0 24 24" fill="none" stroke="#D7B56D" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 opacity-80">
             <circle cx="12" cy="12" r="10"></circle>
             <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
             <path d="M2 12h20"></path>
           </svg>
        </div>

        {/* Monogram */}
        <div 
          className="transition-all duration-500 delay-200"
          style={{
            opacity: state === "passport" ? 1 : 0,
            transform: state === "passport" ? "scale(1)" : "scale(0.92)",
          }}
        >
          <h2 className="font-serif text-3xl md:text-4xl text-[#D7B56D] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] mb-4">C & O</h2>
          <h3 className="font-serif text-lg md:text-xl text-[#F8F2E8] mb-1">Chathurya <span className="text-[#D7B56D] italic mx-1">&</span> Oshadi</h3>
          <p className="font-sans text-[9px] md:text-[11px] text-[#F8F2E8]/70 tracking-[0.2em] uppercase">08 October 2026</p>
        </div>
      </div>

      {/* Interactive CTA */}
      <div 
        className="absolute bottom-8 left-0 right-0 flex justify-center transition-opacity duration-500 delay-500 z-20"
        style={{
          opacity: state === "passport" ? 1 : 0,
          pointerEvents: state === "passport" ? "auto" : "none",
        }}
      >
        <button
          onClick={onOpen}
          aria-label="Open Passport"
          className="px-6 py-2 border border-[#D7B56D] bg-[#10233B]/80 backdrop-blur-sm text-[#D7B56D] font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] rounded hover:bg-[#D7B56D] hover:text-[#10233B] transition-colors cursor-pointer"
        >
          Open Passport
        </button>
      </div>

      {/* Inside of the cover (visible when rotating) */}
      <div 
        className="absolute inset-0 bg-[#DED2C1] rounded-r-md border-l border-[#8A8379]/20"
        style={{ 
          transform: "rotateY(180deg)", 
          backfaceVisibility: "hidden", 
          zIndex: -1 
        }}
      >
        <div className="absolute inset-0 opacity-[0.05] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />
      </div>
    </div>
  );
}

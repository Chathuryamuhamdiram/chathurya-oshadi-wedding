"use client";

interface PassportCoverProps {
  state: "ready" | "starting" | "opening" | "revealed" | "transitioning" | "complete";
  onOpen: () => void;
}

export function PassportCover({ state, onOpen }: PassportCoverProps) {
  const isClosed = state === "ready" || state === "starting";

  return (
    <div
      className="absolute inset-0 origin-left shadow-[20px_0_40px_rgba(0,0,0,0.6)] rounded-[8px] flex flex-col items-center overflow-hidden"
      style={{
        backgroundColor: "#0D1828", // Deep navy leather
        zIndex: isClosed ? 40 : 10,
        transformStyle: "preserve-3d",
        transform: isClosed ? "rotateY(0deg)" : "rotateY(-165deg)",
        transition: "transform 1200ms cubic-bezier(0.4, 0, 0.2, 1), z-index 0ms linear 600ms",
        backfaceVisibility: "hidden",
      }}
    >
      {/* Heavy Leather Texture */}
      <div 
        className="absolute inset-0 mix-blend-overlay opacity-30 pointer-events-none" 
        style={{ 
          backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%221.5%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" 
        }} 
      />
      
      {/* Edge / Spine Crease */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none shadow-[inset_3px_0_5px_rgba(255,255,255,0.05)]" />
      <div className="absolute left-[1px] top-0 bottom-0 w-[1px] bg-white/10 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col items-center pt-[10%] pb-[5%]">
        
        {/* Tiny top text */}
        <p className="font-serif text-[#D7B56D] text-[9px] md:text-[10px] uppercase tracking-[0.3em] mb-2 opacity-90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          You Are Invited
        </p>

        {/* Small ornate divider */}
        <svg className="w-8 h-2 mb-6" viewBox="0 0 50 10">
          <path d="M 0,5 L 20,5 L 25,2 L 30,5 L 50,5" fill="none" stroke="#D7B56D" strokeWidth="0.5" opacity="0.6"/>
          <circle cx="25" cy="5" r="1.5" fill="#D7B56D" />
        </svg>

        {/* Large Title */}
        <h1 className="font-serif text-[28px] md:text-[34px] leading-tight text-[#D7B56D] text-center drop-shadow-[0_1px_2px_rgba(0,0,0,1)] tracking-[0.05em] mb-8" style={{ textShadow: "0 1px 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.8)" }}>
          WEDDING<br/>PASSPORT
        </h1>
        
        {/* Intricate Globe Emblem */}
        <div className="relative w-36 h-36 md:w-44 md:h-44 flex items-center justify-center mb-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] mix-blend-screen">
          <img 
            src="/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_54 PM (8).png"
            alt="Gold Travel Globe Emblem"
            className="object-contain w-full h-full opacity-90"
            aria-hidden="true"
          />
        </div>

        {/* Monogram */}
        <h2 className="font-serif text-[32px] md:text-[40px] text-[#D7B56D] drop-shadow-[0_1px_2px_rgba(0,0,0,1)] tracking-[0.1em] mb-4" style={{ textShadow: "0 1px 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.8)" }}>
          C <span className="text-[20px] md:text-[24px]">&</span> O
        </h2>

        {/* Small ornate divider */}
        <svg className="w-6 h-2 mb-3" viewBox="0 0 50 10">
          <path d="M 10,5 L 20,5 L 25,2 L 30,5 L 40,5" fill="none" stroke="#D7B56D" strokeWidth="0.5" opacity="0.6"/>
          <circle cx="25" cy="5" r="1" fill="#D7B56D" />
        </svg>

        {/* Names */}
        <h3 className="font-serif text-base md:text-lg text-[#D7B56D] opacity-90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] tracking-wide mb-2">
          Chathurya & Oshadi
        </h3>

        {/* Date */}
        <p className="font-sans text-[9px] md:text-[10px] text-[#D7B56D] opacity-70 uppercase tracking-[0.2em]">
          08 October 2026
        </p>

        {/* Bottom Clasp Icon */}
        <div className="mt-auto mb-2 flex items-center justify-center w-6 h-4 border-[0.5px] border-[#D7B56D]/50 rounded-[1px] bg-black/20 shadow-inner relative">
          <div className="w-2 h-2 rounded-full border-[0.5px] border-[#D7B56D]/50" />
          <div className="absolute top-1/2 -left-2 w-1.5 h-[0.5px] bg-[#D7B56D]/40" />
          <div className="absolute top-1/2 -right-2 w-1.5 h-[0.5px] bg-[#D7B56D]/40" />
        </div>
      </div>
    </div>
  );
}

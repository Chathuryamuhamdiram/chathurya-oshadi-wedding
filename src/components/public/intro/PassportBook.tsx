"use client";

import { IntroState } from "./WeddingPassportIntro";

interface PassportBookProps {
  state: IntroState;
  onOpen: () => void;
}

export function PassportBook({ state, onOpen }: PassportBookProps) {
  const isClosed = state === "ready" || state === "starting";
  const isDetailsVisible = state === "revealed" || state === "fade_bg" || state === "fade_passport" || state === "complete";

  // Common Paper Texture
  const PaperTexture = () => (
    <div 
      className="absolute inset-0 opacity-[0.35] mix-blend-multiply pointer-events-none" 
      style={{ 
        backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" 
      }} 
    />
  );

  return (
    <div className="relative w-full h-full shadow-[15px_15px_40px_rgba(0,0,0,0.6)] rounded-r-[8px] bg-[#F8F2E8]" style={{ perspective: "1400px", transformStyle: "preserve-3d" }}>
      
      {/* ---------------------------------
          RIGHT PAGE (Backdrop of the book)
          --------------------------------- */}
      <div className="absolute inset-0 bg-[#F8F2E8] rounded-r-[8px] overflow-hidden z-0 flex flex-col justify-center items-center p-6 md:p-10">
        <PaperTexture />
        
        {/* Crease shadow on the left side of the right page */}
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-black/25 via-black/5 to-transparent pointer-events-none" />

        <div className="w-full max-w-[80%] flex flex-col relative z-10 transition-opacity duration-1000" style={{ opacity: isDetailsVisible ? 1 : 0, transitionDelay: "400ms" }}>
          
          {/* Poruwa Ceremony */}
          <div className="mb-10 text-left">
            <h3 className="font-serif text-[16px] md:text-[20px] text-[#10233B] tracking-wide mb-1">
              PORUWA CEREMONY
            </h3>
            <p className="font-sans text-[11px] md:text-[13px] text-[#D7B56D] uppercase tracking-widest font-semibold mb-2">
              08:50 AM
            </p>
            <p className="font-sans text-[10px] md:text-[11px] text-[#8A8379] uppercase tracking-widest leading-relaxed">
              Hotel River Park<br/>
              Hikkaduwa, Sri Lanka
            </p>
          </div>
          
          {/* Reception */}
          <div className="text-left">
            <h3 className="font-serif text-[16px] md:text-[20px] text-[#10233B] tracking-wide mb-1">
              RECEPTION
            </h3>
            <p className="font-sans text-[11px] md:text-[13px] text-[#D7B56D] uppercase tracking-widest font-semibold mb-2">
              10:30 AM
            </p>
            <p className="font-sans text-[10px] md:text-[11px] text-[#8A8379] uppercase tracking-widest leading-relaxed">
              Hotel Grand Palace<br/>
              Hikkaduwa, Sri Lanka
            </p>
          </div>
        </div>

        {/* Landing Stamp Animation */}
        <div 
          className="absolute top-8 md:top-12 right-6 md:right-10 w-28 md:w-36 pointer-events-none mix-blend-multiply transition-all duration-[400ms] ease-out z-20"
          style={{ 
            opacity: isDetailsVisible ? 0.75 : 0, 
            transform: isDetailsVisible ? "scale(1) rotate(-6deg)" : "scale(1.2) rotate(10deg)",
            transitionDelay: state === "revealed" ? "800ms" : "0ms" 
          }}
        >
          <img 
            src="/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_54 PM (9).png" 
            alt="Forever Begins Stamp" 
            className="object-contain w-full h-full sepia-[.3] hue-rotate-[-30deg]"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* ---------------------------------
          THE HINGED COVER (Front Cover + Left Page)
          --------------------------------- */}
      <div
        className="absolute inset-0 origin-left z-10 transition-transform duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{
          transformStyle: "preserve-3d",
          transform: isClosed ? "rotateY(0deg)" : "rotateY(-165deg)",
        }}
      >
        
        {/* --- FRONT COVER (Navy) --- */}
        <div 
          className="absolute inset-0 bg-[#0A111C] rounded-r-[8px] flex flex-col items-center overflow-hidden cursor-pointer"
          onClick={isClosed ? onOpen : undefined}
          style={{ 
            backfaceVisibility: "hidden", 
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
          }}
        >
          {/* Leather Texture */}
          <div 
            className="absolute inset-0 mix-blend-overlay opacity-40 pointer-events-none" 
            style={{ 
              backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%221.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" 
            }} 
          />
          
          {/* Edge Lighting and Deep Shadow Overlay */}
          <div className="absolute inset-0 rounded-r-[8px] border-[1.5px] border-white/5 pointer-events-none mix-blend-screen" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white/10 to-transparent pointer-events-none mix-blend-screen" />
          
          {/* Spine Edge shadow */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />

          {/* Cover Content */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-[12%] px-6 text-center">
            
            {/* Top Text */}
            <div className="flex flex-col items-center">
              <p className="font-serif text-[#D7B56D] text-[9px] md:text-[11px] uppercase tracking-[0.35em] mb-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
                You Are Invited
              </p>
              <svg className="w-8 h-1.5 md:w-10 md:h-2" viewBox="0 0 50 10">
                <path d="M 0,5 L 20,5 L 25,2 L 30,5 L 50,5" fill="none" stroke="#D7B56D" strokeWidth="0.8" opacity="0.8"/>
                <circle cx="25" cy="5" r="1.5" fill="#D7B56D" />
              </svg>
            </div>

            {/* Title & Globe */}
            <div className="flex flex-col items-center w-full">
              <h1 className="font-serif text-[22px] md:text-[30px] leading-[1.1] text-[#D7B56D] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-[0.08em] mb-6">
                WEDDING<br/>PASSPORT
              </h1>
              <div className="relative w-[40%] max-w-[150px] aspect-square flex items-center justify-center mix-blend-screen">
                <img src="/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_54 PM (8).png" alt="Travel Globe" className="object-contain w-full h-full opacity-90 drop-shadow-[0_0_15px_rgba(215,181,109,0.2)]" aria-hidden="true" />
              </div>
            </div>

            {/* Bottom Details */}
            <div className="flex flex-col items-center">
              <h2 className="font-serif text-[26px] md:text-[36px] text-[#D7B56D] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-[0.15em] mb-2">
                C <span className="text-[18px] md:text-[24px] opacity-80">&</span> O
              </h2>
              <svg className="w-6 h-1.5 md:w-8 md:h-2 mb-3" viewBox="0 0 50 10">
                <path d="M 10,5 L 20,5 L 25,2 L 30,5 L 40,5" fill="none" stroke="#D7B56D" strokeWidth="0.8" opacity="0.8"/>
                <circle cx="25" cy="5" r="1.5" fill="#D7B56D" />
              </svg>
              <h3 className="font-serif text-[12px] md:text-[15px] text-[#D7B56D] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] tracking-wide mb-1">
                Chathurya & Oshadi
              </h3>
              <p className="font-sans text-[8px] md:text-[10px] text-[#D7B56D] opacity-80 uppercase tracking-[0.25em]">
                08 October 2026
              </p>
            </div>

          </div>
        </div>

        {/* --- INSIDE LEFT PAGE (Ivory) --- */}
        <div 
          className="absolute inset-0 bg-[#F8F2E8] rounded-l-[8px] flex flex-col items-center justify-center p-6 md:p-10 text-center border-r border-dashed border-[#8A8379]/30 overflow-hidden"
          style={{ 
            backfaceVisibility: "hidden", 
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <PaperTexture />
          
          {/* Crease shadow on the right side of the left page */}
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-black/15 to-transparent pointer-events-none" />

          <div 
            className="transition-opacity duration-1000 relative z-10 w-full h-full flex flex-col items-center justify-center"
            style={{ opacity: isDetailsVisible ? 1 : 0, transitionDelay: "400ms" }}
          >
            <p className="font-sans text-[10px] md:text-[12px] text-[#8A8379] uppercase tracking-[0.35em] mb-8 font-medium">
              THE WEDDING OF
            </p>
            
            <h2 className="font-serif text-[28px] md:text-[36px] text-[#10233B] mb-2 leading-none">
              Chathurya
            </h2>
            <span className="font-serif text-xl md:text-3xl text-[#D7B56D] italic block my-3">
              &
            </span>
            <h2 className="font-serif text-[28px] md:text-[36px] text-[#10233B] mb-10 leading-none">
              Oshadi
            </h2>
            
            <p className="font-sans text-[11px] md:text-[13px] text-[#10233B] uppercase tracking-[0.25em] font-semibold mb-3">
              08 OCTOBER 2026
            </p>
            <p className="font-sans text-[9px] md:text-[11px] text-[#8A8379] uppercase tracking-[0.2em]">
              HIKKADUWA<br/>SRI LANKA
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

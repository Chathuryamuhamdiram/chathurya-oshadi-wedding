"use client";

import { IntroState } from "./WeddingPassportIntro";

interface PassportBookProps {
  state: IntroState;
  onOpen: () => void;
}

export function PassportBook({ state, onOpen }: PassportBookProps) {
  const isClosed = state === "ready" || state === "starting";
  const isDetailsVisible = state === "revealed" || state === "transitioning" || state === "complete";

  // Common Paper Texture
  const PaperTexture = () => (
    <div 
      className="absolute inset-0 opacity-[0.3] mix-blend-multiply pointer-events-none" 
      style={{ 
        backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" 
      }} 
    />
  );

  return (
    <div className="relative w-full h-full shadow-2xl rounded-r-[8px]" style={{ perspective: "1500px", transformStyle: "preserve-3d" }}>
      
      {/* ---------------------------------
          RIGHT PAGE (Backdrop of the book)
          --------------------------------- */}
      <div className="absolute inset-0 bg-[#F8F2E8] rounded-r-[8px] overflow-hidden z-0">
        <PaperTexture />
        
        {/* Crease shadow on the left side of the right page */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />

        <div className="w-full h-full flex flex-col p-6 md:p-10 justify-center relative">
          <div 
            className="transition-opacity duration-1000"
            style={{ opacity: isDetailsVisible ? 1 : 0, transitionDelay: "600ms" }}
          >
            {/* Poruwa Ceremony */}
            <div className="mb-8">
              <h3 className="font-serif text-[15px] md:text-[18px] text-[#10233B] mb-2 tracking-wide">
                Poruwa Ceremony
              </h3>
              <p className="font-sans text-[9px] md:text-[11px] text-[#D7B56D] uppercase tracking-widest font-semibold mb-1">
                08:50 AM
              </p>
              <p className="font-sans text-[8px] md:text-[9px] text-[#8A8379] uppercase tracking-widest leading-tight">
                Hotel River Park<br/>
                <span className="opacity-70 text-[7px] md:text-[8px]">Hikkaduwa, Sri Lanka</span>
              </p>
            </div>
            
            {/* Reception */}
            <div>
              <h3 className="font-serif text-[15px] md:text-[18px] text-[#10233B] mb-2 tracking-wide">
                Reception
              </h3>
              <p className="font-sans text-[9px] md:text-[11px] text-[#D7B56D] uppercase tracking-widest font-semibold mb-1">
                10:30 AM
              </p>
              <p className="font-sans text-[8px] md:text-[9px] text-[#8A8379] uppercase tracking-widest leading-tight">
                Hotel Grand Palace<br/>
                <span className="opacity-70 text-[7px] md:text-[8px]">Hikkaduwa, Sri Lanka</span>
              </p>
            </div>
          </div>

          {/* Romantic Quote */}
          <div 
            className="absolute inset-x-0 bottom-6 md:bottom-8 flex justify-center pointer-events-none transition-opacity duration-1000"
            style={{ opacity: isDetailsVisible ? 1 : 0, transitionDelay: "1500ms" }}
          >
            <p className="font-serif italic text-[11px] md:text-[13px] text-[#10233B]/70 tracking-wide text-center">
              From our first hello<br/>to forever.
            </p>
          </div>
        </div>
      </div>

      {/* ---------------------------------
          THE HINGED COVER (Front Cover + Left Page)
          --------------------------------- */}
      <div
        className="absolute inset-0 origin-left z-10 transition-transform duration-1200 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          transformStyle: "preserve-3d",
          transform: isClosed ? "rotateY(0deg)" : "rotateY(-180deg)",
        }}
      >
        
        {/* --- FRONT COVER (Navy) --- */}
        <div 
          className="absolute inset-0 bg-[#0D1828] rounded-r-[8px] flex flex-col items-center overflow-hidden cursor-pointer"
          onClick={isClosed ? onOpen : undefined}
          style={{ 
            backfaceVisibility: "hidden", 
            WebkitBackfaceVisibility: "hidden", // Safari support
            transform: "rotateY(0deg)", // Explicit for backface rendering
          }}
        >
          {/* Leather Texture */}
          <div 
            className="absolute inset-0 mix-blend-overlay opacity-30 pointer-events-none" 
            style={{ 
              backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%221.5%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" 
            }} 
          />
          
          {/* Spine Edge */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />

          {/* Cover Content */}
          <div className="relative z-10 w-full h-full flex flex-col items-center pt-[12%] pb-[8%]">
            <p className="font-serif text-[#D7B56D] text-[9px] md:text-[11px] uppercase tracking-[0.3em] mb-2 opacity-90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              You Are Invited
            </p>
            <svg className="w-6 h-1.5 md:w-8 md:h-2 mb-4 md:mb-8" viewBox="0 0 50 10">
              <path d="M 0,5 L 20,5 L 25,2 L 30,5 L 50,5" fill="none" stroke="#D7B56D" strokeWidth="0.5" opacity="0.6"/>
              <circle cx="25" cy="5" r="1.5" fill="#D7B56D" />
            </svg>
            <h1 className="font-serif text-[24px] md:text-[36px] leading-tight text-[#D7B56D] text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-[0.05em] mb-6 md:mb-10">
              WEDDING<br/>PASSPORT
            </h1>
            <div className="relative w-28 h-28 md:w-48 md:h-48 flex items-center justify-center mb-6 md:mb-10 mix-blend-screen">
              <img src="/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_54 PM (8).png" alt="Travel Globe" className="object-contain w-full h-full opacity-90" aria-hidden="true" />
            </div>
            <h2 className="font-serif text-[28px] md:text-[44px] text-[#D7B56D] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-[0.1em] mb-2 md:mb-4">
              C <span className="text-[18px] md:text-[28px]">&</span> O
            </h2>
            <svg className="w-5 h-1.5 md:w-6 md:h-2 mb-2 md:mb-4" viewBox="0 0 50 10">
              <path d="M 10,5 L 20,5 L 25,2 L 30,5 L 40,5" fill="none" stroke="#D7B56D" strokeWidth="0.5" opacity="0.6"/>
              <circle cx="25" cy="5" r="1" fill="#D7B56D" />
            </svg>
            <h3 className="font-serif text-[12px] md:text-[16px] text-[#D7B56D] opacity-90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] tracking-wide mb-1 md:mb-2">
              Chathurya & Oshadi
            </h3>
            <p className="font-sans text-[8px] md:text-[10px] text-[#D7B56D] opacity-70 uppercase tracking-[0.2em]">
              08 October 2026
            </p>
          </div>
        </div>

        {/* --- INSIDE LEFT PAGE (Ivory) --- */}
        <div 
          className="absolute inset-0 bg-[#F8F2E8] rounded-l-[8px] flex flex-col items-center justify-center p-6 md:p-10 text-center border-r border-dashed border-[#8A8379]/30 overflow-hidden"
          style={{ 
            backfaceVisibility: "hidden", 
            WebkitBackfaceVisibility: "hidden", // Safari support
            transform: "rotateY(180deg)", // Flips it to the back of the cover!
          }}
        >
          <PaperTexture />
          
          {/* Crease shadow on the right side of the left page */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />

          <div 
            className="transition-opacity duration-1000 relative z-10 w-full h-full flex flex-col items-center justify-center"
            style={{ opacity: isDetailsVisible ? 1 : 0, transitionDelay: "400ms" }}
          >
            <p className="font-sans text-[9px] md:text-[11px] text-[#8A8379] uppercase tracking-[0.3em] mb-6">
              The Wedding Of
            </p>
            <h2 className="font-serif text-[24px] md:text-[34px] text-[#10233B] mb-2">
              Chathurya
            </h2>
            <span className="font-serif text-xl md:text-2xl text-[#D7B56D] italic block my-2">
              &
            </span>
            <h2 className="font-serif text-[24px] md:text-[34px] text-[#10233B] mb-8">
              Oshadi
            </h2>
            
            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-2 mb-8 opacity-60">
              <div className="w-10 h-[0.5px] bg-[#D7B56D]" />
              <div className="w-1.5 h-1.5 bg-[#D7B56D] rotate-45" />
              <div className="w-10 h-[0.5px] bg-[#D7B56D]" />
            </div>
            
            <p className="font-sans text-[10px] md:text-[12px] text-[#10233B] uppercase tracking-[0.2em] font-medium mb-2">
              08 October 2026
            </p>
            <p className="font-sans text-[8px] md:text-[9px] text-[#8A8379] uppercase tracking-[0.2em]">
              Hikkaduwa, Sri Lanka
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

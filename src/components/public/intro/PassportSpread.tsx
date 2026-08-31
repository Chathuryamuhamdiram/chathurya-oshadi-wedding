"use client";

interface PassportSpreadProps {
  state: "ready" | "starting" | "opening" | "revealed" | "transitioning" | "complete";
}

export function PassportSpread({ state }: PassportSpreadProps) {
  const isDetailsVisible = state === "revealed" || state === "transitioning" || state === "complete";
  const isQuoteVisible = state === "revealed" || state === "transitioning" || state === "complete";

  return (
    <div className="absolute inset-0 flex bg-[#F8F2E8] shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] rounded-[8px] overflow-hidden z-0">
      
      {/* Paper texture overlay for the inside pages */}
      <div 
        className="absolute inset-0 opacity-[0.3] mix-blend-multiply pointer-events-none" 
        style={{ 
          backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" 
        }} 
      />

      {/* Center Spine Crease */}
      <div className="absolute left-1/2 top-0 bottom-0 w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#8A8379]/10 to-transparent pointer-events-none" />
      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#8A8379]/20 pointer-events-none" />

      {/* --- LEFT PAGE --- */}
      <div className="w-1/2 h-full flex flex-col items-center justify-center p-4 md:p-8 text-center relative border-r border-dashed border-[#8A8379]/30">
        <div 
          className="transition-opacity duration-1000"
          style={{ opacity: isDetailsVisible ? 1 : 0, transitionDelay: "400ms" }}
        >
          <p className="font-sans text-[8px] md:text-[9px] text-[#8A8379] uppercase tracking-[0.3em] mb-4">
            The Wedding Of
          </p>
          <h2 className="font-serif text-[20px] md:text-[28px] text-[#10233B] mb-1">
            Chathurya
          </h2>
          <span className="font-serif text-lg md:text-xl text-[#D7B56D] italic block my-1">
            &
          </span>
          <h2 className="font-serif text-[20px] md:text-[28px] text-[#10233B] mb-6">
            Oshadi
          </h2>
          
          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-2 mb-6 opacity-60">
            <div className="w-8 h-[0.5px] bg-[#D7B56D]" />
            <div className="w-1 h-1 bg-[#D7B56D] rotate-45" />
            <div className="w-8 h-[0.5px] bg-[#D7B56D]" />
          </div>
          
          <p className="font-sans text-[9px] md:text-[10px] text-[#10233B] uppercase tracking-[0.2em] font-medium mb-1.5">
            08 October 2026
          </p>
          <p className="font-sans text-[7px] md:text-[8px] text-[#8A8379] uppercase tracking-[0.2em]">
            Hikkaduwa, Sri Lanka
          </p>
        </div>
      </div>

      {/* --- RIGHT PAGE --- */}
      <div className="w-1/2 h-full flex flex-col p-4 md:p-8 justify-center relative">
        <div 
          className="transition-opacity duration-1000 pl-2 md:pl-6"
          style={{ opacity: isDetailsVisible ? 1 : 0, transitionDelay: "600ms" }}
        >
          {/* Poruwa Ceremony */}
          <div className="mb-8">
            <h3 className="font-serif text-[13px] md:text-[15px] text-[#10233B] mb-2 tracking-wide">
              Poruwa Ceremony
            </h3>
            <p className="font-sans text-[8px] md:text-[9px] text-[#D7B56D] uppercase tracking-widest font-semibold mb-1">
              08:50 AM
            </p>
            <p className="font-sans text-[7px] md:text-[8px] text-[#8A8379] uppercase tracking-widest leading-tight">
              Hotel River Park<br/>
              <span className="opacity-70 text-[6px] md:text-[7px]">Hikkaduwa, Sri Lanka</span>
            </p>
          </div>
          
          {/* Reception */}
          <div>
            <h3 className="font-serif text-[13px] md:text-[15px] text-[#10233B] mb-2 tracking-wide">
              Reception
            </h3>
            <p className="font-sans text-[8px] md:text-[9px] text-[#D7B56D] uppercase tracking-widest font-semibold mb-1">
              10:30 AM
            </p>
            <p className="font-sans text-[7px] md:text-[8px] text-[#8A8379] uppercase tracking-widest leading-tight">
              Hotel Grand Palace<br/>
              <span className="opacity-70 text-[6px] md:text-[7px]">Hikkaduwa, Sri Lanka</span>
            </p>
          </div>
        </div>

        {/* --- FOREVER BEGINS STAMP --- */}
        <div
          className="absolute bottom-6 right-4 md:bottom-10 md:right-8 flex flex-col items-center justify-center w-28 h-28 md:w-32 md:h-32 border-[3px] border-[#C9A45D]/70 rounded-full z-30 mix-blend-multiply"
          style={{
            transform: isDetailsVisible ? "scale(1) rotate(-6deg)" : "scale(1.3) rotate(-15deg)",
            opacity: isDetailsVisible ? 1 : 0,
            transition: "transform 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 300ms ease",
            transitionDelay: isDetailsVisible ? "1000ms" : "0ms"
          }}
        >
          <div className="absolute inset-[3px] border-[0.5px] border-[#C9A45D]/50 rounded-full" />
          <p className="font-serif text-[10px] md:text-[11px] text-[#C9A45D] uppercase tracking-widest font-bold mb-1 opacity-90">
            Forever
          </p>
          <p className="font-serif text-[10px] md:text-[11px] text-[#C9A45D] uppercase tracking-widest font-bold mb-1 opacity-90">
            Begins
          </p>
          <div className="w-10 h-[0.5px] bg-[#C9A45D]/60 my-1" />
          <p className="font-sans text-[8px] md:text-[9px] text-[#C9A45D] uppercase tracking-[0.2em] font-semibold opacity-90">
            08 Oct 2026
          </p>
          <p className="font-sans text-[7px] md:text-[8px] text-[#C9A45D] uppercase tracking-[0.1em] mt-1 opacity-80">
            Sri Lanka
          </p>
          
          {/* Stamp imperfections */}
          <div className="absolute inset-0 bg-[#F8F2E8] opacity-[0.35] rounded-full filter blur-[1px] mix-blend-screen pointer-events-none" style={{ clipPath: "polygon(0 0, 100% 15%, 85% 100%, 15% 85%)" }} />
        </div>
      </div>

      {/* Romantic Quote */}
      <div 
        className="absolute inset-x-0 bottom-4 md:bottom-8 flex justify-center pointer-events-none transition-opacity duration-1000 z-40"
        style={{ opacity: isQuoteVisible ? 1 : 0, transitionDelay: "1500ms" }}
      >
        <p className="font-serif italic text-[10px] md:text-[12px] text-[#10233B]/70 tracking-wide">
          From our first hello to forever.
        </p>
      </div>

    </div>
  );
}

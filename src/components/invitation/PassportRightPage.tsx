"use client";

import { motion } from "framer-motion";

interface Venue {
  name: string;
  address?: string | null;
  googleMapsUrl?: string | null;
}

interface PassportRightPageProps {
  poruwVenue?: Venue | null;
  mainVenue?: Venue | null;
}

export function PassportRightPage({ poruwVenue, mainVenue }: PassportRightPageProps) {
  const defaultPoruwaVenue = {
    name: "Hotel River Park",
    address: "Hikkaduwa",
  };
  const defaultMainVenue = {
    name: "Hotel Grand Palace",
    address: "Hikkaduwa",
  };

  const poruwa = poruwVenue || defaultPoruwaVenue;
  const main = mainVenue || defaultMainVenue;

  return (
    <div className="relative h-full flex flex-col p-8 overflow-hidden bg-[#151515] text-[#D4AF37]">
      
      {/* Background pattern (guilloche / wavy security lines in dark gold) */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none flex items-center justify-center">
         <svg viewBox="0 0 400 600" className="w-full h-full" fill="none" stroke="#D4AF37" strokeWidth="0.5">
            {Array.from({ length: 40 }).map((_, i) => (
               <path key={i} d={`M 0 ${i*15} Q 100 ${i*15-10} 200 ${i*15} T 400 ${i*15}`} />
            ))}
         </svg>
      </div>

      {/* Border framing */}
      <div className="absolute inset-3 border border-[#D4AF37]/20 rounded-sm pointer-events-none" />
      <div className="absolute inset-4 border border-[#D4AF37]/10 rounded-sm pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col items-center mt-6 mb-10 border-b border-[#D4AF37]/20 pb-4">
        <p className="text-[11px] uppercase tracking-[0.25em] font-sans font-bold text-white">
          Wedding Passport
        </p>
      </div>

      {/* Details Grid */}
      <div className="relative z-10 flex-1 px-4 flex flex-col justify-center space-y-8">
        
        {/* Date & Destination Row */}
        <div className="flex justify-between items-start border-b border-[#D4AF37]/10 pb-6">
          <div>
            <p className="text-[8px] uppercase tracking-[0.2em] font-sans font-bold text-[#D4AF37]/70 mb-1.5">Date</p>
            <p className="font-sans text-xs tracking-widest text-white">08 OCTOBER 2026</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] uppercase tracking-[0.2em] font-sans font-bold text-[#D4AF37]/70 mb-1.5">Destination</p>
            <p className="font-sans text-xs tracking-widest text-white">HIKKADUWA</p>
          </div>
        </div>

        {/* Ceremony */}
        <div className="flex justify-between items-center relative">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
               <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" strokeWidth="1.5">
                 <path d="M12 3v18M8 21v-8a4 4 0 0 1 8 0v8M3 21h18" />
                 <path d="M12 8l-4 4M12 8l4 4" />
               </svg>
               <p className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-[#D4AF37]/70">Ceremony</p>
            </div>
            <p className="font-sans text-sm tracking-wide text-white font-semibold">{poruwa.name.toUpperCase()}</p>
            <p className="font-sans text-[10px] tracking-widest text-[#D4AF37] mt-1">08:50 AM</p>
          </div>
        </div>

        {/* Reception */}
        <div className="flex justify-between items-center relative">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
               <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="4" y="10" width="16" height="11" />
                  <path d="M12 10V3L8 6v4M12 3l4 3v4M8 21v-4h8v4" />
               </svg>
               <p className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-[#D4AF37]/70">Reception</p>
            </div>
            <p className="font-sans text-sm tracking-wide text-white font-semibold">{main.name.toUpperCase()}</p>
            <p className="font-sans text-[10px] tracking-widest text-[#D4AF37] mt-1">ONWARDS</p>
          </div>
        </div>
      </div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="relative z-10 text-center mt-auto pb-4 pt-8"
      >
        <p className="font-serif italic text-xl text-[#D4AF37] leading-relaxed mb-4">
          "A journey of love,<br />a lifetime together."
        </p>
        <div className="flex justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#D4AF37]/60" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

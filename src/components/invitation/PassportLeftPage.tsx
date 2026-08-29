"use client";

import { motion } from "framer-motion";
import { PassportStamp } from "./PassportStamp";

interface PassportLeftPageProps {
  guestName: string;
}

export function PassportLeftPage({ guestName }: PassportLeftPageProps) {
  return (
    <div className="relative h-full flex flex-col p-8 overflow-hidden items-center text-center bg-[#151515] text-[#D4AF37] border-r border-[#D4AF37]/10">
      
      {/* Subtle texture/gradient */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle at center, #D4AF37 0%, transparent 70%)"
      }} />

      {/* Border framing */}
      <div className="absolute inset-3 border border-[#D4AF37]/20 rounded-sm pointer-events-none" />
      <div className="absolute inset-4 border border-[#D4AF37]/10 rounded-sm pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col items-center mt-6 mb-8">
         <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#D4AF37] mb-2" fill="currentColor">
           <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
         </svg>
         <p className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold">
           Love Destination
         </p>
      </div>

      {/* Circular Couple Photo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative z-10 mb-8"
      >
        {/* Outer decorative ring */}
        <div className="w-44 h-44 rounded-full border border-[#D4AF37]/30 mx-auto flex items-center justify-center relative">
           <div className="absolute inset-0 rounded-full border border-[#D4AF37]/10 transform rotate-45 scale-105" />
           <div className="absolute inset-0 rounded-full border border-[#D4AF37]/10 transform -rotate-45 scale-105" />
           
           {/* Inner Photo Frame */}
           <div className="w-36 h-36 rounded-full border-2 border-[#D4AF37] flex items-center justify-center bg-[#1a1a1a] overflow-hidden relative shadow-[0_0_20px_rgba(212,175,55,0.1)]">
             <div className="absolute inset-0 flex items-center justify-center opacity-20 text-[#D4AF37]">
                <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
             </div>
             <p className="text-[9px] uppercase tracking-widest text-[#D4AF37]/60 z-10 font-bold">Couple Photo</p>
           </div>
        </div>
      </motion.div>

      {/* Names */}
      <div className="relative z-10 mb-6 space-y-1">
        <p className="font-serif italic text-xl text-[#D4AF37]/80 mb-2">The wedding of</p>
        <h2 className="font-serif text-3xl md:text-4xl text-white">
          Oshadi
        </h2>
        <p className="font-serif text-2xl text-[#D4AF37] italic">
          &
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-white">
          Chathurya
        </h2>
      </div>

      {/* Bottom Heart / Stamp */}
      <div className="relative z-10 mt-auto flex flex-col items-center w-full">
         <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent mb-6" />
         <p className="text-xs font-sans font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-4">
           October 08, 2026
         </p>
         
         {/* Subtle round stamp in corner */}
         <div className="absolute -bottom-2 -left-2 opacity-40">
            <PassportStamp text="COLOMBO" subText="Arrival" rotation={-15} color="gold" size="lg" delay={0.5} />
         </div>
      </div>
    </div>
  );
}

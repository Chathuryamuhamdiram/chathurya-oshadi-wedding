"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface PassportCoverProps {
  onOpen: () => void;
  sealUrl?: string;
}

export function PassportCover({ onOpen, sealUrl }: PassportCoverProps) {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
    setTimeout(onOpen, 1100);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
      style={{ background: "#111111" }} // Premium black
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Subtle luxury texture */}
      <div 
        className="absolute inset-0 opacity-[0.10] pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
        }}
      />

      {/* Frame / Box Margin around the design */}
      <div className="absolute inset-4 md:inset-6 border border-white/20 pointer-events-none z-20 rounded-sm" />
      <div className="absolute inset-[1.25rem] md:inset-[1.75rem] border border-white/10 pointer-events-none z-20 rounded-sm" />

      {/* Center Graphic / Seal */}
      <div className="absolute inset-8 pointer-events-none opacity-60 overflow-hidden z-20">
        {sealUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sealUrl} alt="Wedding Seal" className="w-[80%] max-w-[280px] object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
          </div>
        ) : (
          <div className="w-full h-full flex items-end justify-center pb-24 md:pb-32">
            <div 
               className="w-[140%] md:w-[100%] h-[50vh] max-h-[400px] relative"
               style={{
                 backgroundColor: "#D4AF37", // Bright gold color
                 maskImage: "url('/world.svg')",
                 WebkitMaskImage: "url('/world.svg')",
                 maskSize: "contain",
                 WebkitMaskSize: "contain",
                 maskRepeat: "no-repeat",
                 WebkitMaskRepeat: "no-repeat",
                 maskPosition: "center bottom",
                 WebkitMaskPosition: "center bottom"
               }}
            />
          </div>
        )}
      </div>

      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.15 }}
        className="relative z-30 flex flex-col items-center justify-start text-center px-10 max-w-sm w-full h-full gap-8 pt-24 md:pt-32 pb-8"
      >
        {/* Top Header */}
        <div className="flex flex-col items-center">
          <p className="text-[10px] uppercase tracking-[0.45em] text-[#D4AF37] font-sans mb-5 font-bold">
            You Are Invited
          </p>
          <div className="mb-2">
            <h1 className="font-serif font-bold text-4xl md:text-5xl text-white tracking-[0.15em] mb-2 drop-shadow-md">
              WEDDING
            </h1>
            <h1 className="font-serif font-bold text-4xl md:text-5xl text-white tracking-[0.15em] drop-shadow-md">
              PASSPORT
            </h1>
          </div>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent my-6" />
          <p className="text-[9px] uppercase tracking-[0.3em] text-white font-sans font-semibold drop-shadow-md">
            Come to celebrate our love
          </p>
        </div>

        {/* Bottom Details */}
        <div className="flex flex-col items-center w-full">
          {/* Airplane Icon */}
          <div className="mb-6">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white transform rotate-45 drop-shadow-md" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>

          <p 
            className="font-serif italic text-4xl md:text-5xl tracking-wider mb-3 drop-shadow-lg"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px rgba(255, 255, 255, 0.9)",
              textShadow: "0px 4px 10px rgba(0,0,0,0.8)"
            }}
          >
            Oshadi & Chathurya
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-sans mb-10 font-bold drop-shadow-md">
            08 October 2026
          </p>

          <button
            onClick={handleOpen}
            disabled={isOpening}
            className="relative px-12 py-3.5 rounded-full text-[11px] font-sans uppercase tracking-[0.25em] font-bold overflow-hidden transition-all disabled:opacity-50 border border-[#D4AF37] text-white bg-black hover:bg-[#D4AF37] hover:text-black shadow-[0_0_15px_rgba(212,175,55,0.15)]"
          >
            {isOpening ? "Opening..." : "Open Invitation"}
          </button>
        </div>
      </motion.div>

      {/* CSS Animation for shine */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}} />
    </motion.div>
  );
}

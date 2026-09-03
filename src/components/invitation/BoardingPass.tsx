"use client";

import { motion } from "framer-motion";

interface BoardingPassProps {
  guestName: string;
}

export function BoardingPass({ guestName }: BoardingPassProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-4xl mx-auto relative mt-8"
    >
      <div className="flex flex-col md:flex-row rounded-xl overflow-hidden shadow-2xl">
        
        {/* Left Stub (Navy Blue) */}
        <div className="w-full md:w-64 bg-[#111111] p-6 flex flex-col items-center justify-between text-center relative border-r border-dashed border-white/20">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#BA9B5D] font-bold leading-relaxed mt-4">
            Love Is<br/>The Greatest<br/>Adventure
          </p>

          <div className="relative w-32 h-32 my-8 flex items-center justify-center">
            {/* Dotted heart path */}
            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0" fill="none">
              <path d="M 10 50 C 10 30 30 30 40 45 C 50 30 70 30 70 50 C 70 70 40 85 40 85 C 40 85 10 70 10 50" stroke="#BA9B5D" strokeWidth="1" strokeDasharray="2 3" />
            </svg>
            <div className="w-10 h-10 rounded-full border border-[#BA9B5D] flex items-center justify-center z-10 bg-[#111111]">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#BA9B5D] transform rotate-45" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
          </div>

          <div className="mb-4">
             <p className="font-sans text-[9px] uppercase tracking-[0.15em] text-[#BA9B5D] leading-relaxed">
               Thank you for<br/>being part of<br/>our special day!
             </p>
             <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#BA9B5D] mx-auto mt-2" fill="currentColor">
               <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
             </svg>
          </div>
        </div>

        {/* Right Ticket (Cream) */}
        <div className="flex-1 bg-[#F6F1E7] p-6 md:p-8 relative flex flex-col md:flex-row gap-6">
          {/* Main info section */}
          <div className="flex-1 space-y-6">
             <div className="flex items-center justify-between border-b border-[#BA9B5D]/20 pb-4">
               <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#334155] font-bold">
                 Boarding Pass To Our Wedding
               </p>
               <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#BA9B5D] transform rotate-45" fill="currentColor">
                 <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
               </svg>
             </div>

             <div>
               <p className="text-[9px] uppercase tracking-widest text-[#8C7A5E] font-bold mb-1">Passenger</p>
               <p 
                 className={`font-serif italic text-[#1E293B] whitespace-nowrap truncate ${
                   guestName.length > 25 ? 'text-lg md:text-xl' :
                   guestName.length > 15 ? 'text-xl md:text-2xl' :
                   'text-2xl md:text-3xl'
                 }`}
                 title={guestName}
               >
                 {guestName}
               </p>
             </div>

             <div className="relative">
                {/* Stamp overlay */}
                <div className="absolute right-0 top-0 opacity-20 pointer-events-none hidden md:block">
                   <svg viewBox="0 0 100 100" className="w-32 h-32" fill="none" stroke="#BA9B5D" strokeWidth="1">
                      <circle cx="50" cy="50" r="45" />
                      <circle cx="50" cy="50" r="35" strokeDasharray="4 4" />
                      <path d="M 50 35 L 65 60 L 35 60 Z" fill="#BA9B5D" />
                   </svg>
                </div>

                <div className="space-y-4">
                   <div>
                     <p className="text-[8px] uppercase tracking-widest text-[#8C7A5E] font-bold mb-0.5">Date</p>
                     <p className="font-sans text-xs tracking-widest text-[#1E293B]">08 OCTOBER 2026</p>
                   </div>
                   <div>
                     <p className="text-[8px] uppercase tracking-widest text-[#8C7A5E] font-bold mb-0.5">Destination</p>
                     <p className="font-sans text-xs tracking-widest text-[#1E293B]">A LIFETIME OF LOVE & HAPPINESS</p>
                   </div>
                   <div>
                     <p className="text-[8px] uppercase tracking-widest text-[#8C7A5E] font-bold mb-0.5">Dress Code</p>
                     <p className="font-sans text-xs tracking-widest text-[#1E293B]">FORMAL / SEMI-FORMAL</p>
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-8 pt-4">
                <div>
                   <p className="text-[8px] uppercase tracking-widest text-[#8C7A5E] font-bold mb-0.5">Flight</p>
                   <p className="font-sans text-xs tracking-widest text-[#1E293B]">CC08OCT26</p>
                </div>
                <div>
                   <p className="text-[8px] uppercase tracking-widest text-[#8C7A5E] font-bold mb-0.5">Gate</p>
                   <p className="font-sans text-xs tracking-widest text-[#1E293B]">LOVE</p>
                </div>
                <div>
                   <p className="text-[8px] uppercase tracking-widest text-[#8C7A5E] font-bold mb-0.5">Seat</p>
                   <p className="font-sans text-xs tracking-widest text-[#1E293B]">FOREVER</p>
                </div>
             </div>
             
             <div className="flex items-center gap-2 pt-2 text-[#BA9B5D]">
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
                   <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <p className="text-[9px] uppercase tracking-widest font-bold">Please RSVP and confirm your seat</p>
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
                   <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
             </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden md:block w-px border-r border-dashed border-[#BA9B5D]/30" />
          <div className="md:hidden w-full h-px border-t border-dashed border-[#BA9B5D]/30 my-2" />

          {/* RSVP & QR section */}
          <div className="md:w-56 flex flex-col items-center text-center">
             <div className="flex items-center gap-2 mb-4 w-full border-b border-[#BA9B5D]/20 pb-4">
                <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#334155] font-bold">RSVP</p>
                <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#BA9B5D]" fill="currentColor">
                   <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
             </div>

             <div className="mb-6 w-full text-left">
                <p className="text-[9px] uppercase tracking-[0.1em] text-[#1E293B] font-bold mb-1">Kindly RSVP Before</p>
                <p className="text-[9px] uppercase tracking-[0.1em] text-[#1E293B] font-bold mb-4">08 August 2026</p>

                <div className="space-y-3">
                   <div className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#8C7A5E] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
                         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                         <path d="M11.99 2C6.479 2 2 6.479 2 11.99c0 1.865.52 3.604 1.424 5.09L2 22l5.054-1.4A9.966 9.966 0 0 0 11.99 22C17.5 22 22 17.521 22 12.01 22 6.479 17.5 2 11.99 2z"/>
                      </svg>
                      <div>
                         <p className="text-[10px] text-[#1E293B] font-mono">078 676 1770</p>
                         <p className="text-[8px] text-[#8C7A5E] italic">Oshadi</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#8C7A5E] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
                         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                         <path d="M11.99 2C6.479 2 2 6.479 2 11.99c0 1.865.52 3.604 1.424 5.09L2 22l5.054-1.4A9.966 9.966 0 0 0 11.99 22C17.5 22 22 17.521 22 12.01 22 6.479 17.5 2 11.99 2z"/>
                      </svg>
                      <div>
                         <p className="text-[10px] text-[#1E293B] font-mono">071 460 9001</p>
                         <p className="text-[8px] text-[#8C7A5E] italic">Chathurya</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="w-full">
                <p className="text-[9px] uppercase tracking-widest text-[#1E293B] font-bold mb-2">Scan To RSVP</p>
                <div className="w-24 h-24 border-2 border-[#1E293B] mx-auto p-1.5 relative bg-white">
                   {/* QR code representation with central heart */}
                   <div className="w-full h-full bg-[#1E293B] flex items-center justify-center p-2 rounded-sm" style={{
                      backgroundImage: "radial-gradient(circle, transparent 20%, #1E293B 20%, #1E293B 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, #1E293B 20%, #1E293B 80%, transparent 80%, transparent)",
                      backgroundSize: "6px 6px",
                      backgroundPosition: "0 0, 3px 3px"
                   }}>
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                         <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#BA9B5D]" fill="currentColor">
                           <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                         </svg>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Barcode Strip edge */}
          <div className="hidden md:flex flex-col items-center justify-between absolute right-4 top-4 bottom-4">
             <p className="text-[7px] text-[#8C7A5E] font-mono transform rotate-90 tracking-[0.2em] w-32 whitespace-nowrap origin-left ml-4 mt-8">
               YOU ARE OUR VIP GUEST
             </p>
             <div className="flex gap-[3px] h-32 items-end">
                {Array.from({ length: 18 }).map((_, i) => {
                   const widths = [2, 3, 1, 4, 2, 1, 3, 2];
                   const w = widths[i % widths.length];
                   return (
                     <div
                       key={i}
                       className="bg-[#1E293B]"
                       style={{ width: w, height: '100%' }}
                     />
                   );
                })}
             </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

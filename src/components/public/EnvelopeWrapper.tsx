"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function EnvelopeWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0d1511] overflow-hidden"
            exit={{ opacity: 0, y: -50, scale: 1.05 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Elegant Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #d4af37 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full border border-[#d4af37]/30 flex items-center justify-center mb-6">
                <span className="font-serif text-2xl text-[#d4af37]">C</span>
                <span className="font-serif text-xl italic text-[#d4af37]/50 mx-1">&</span>
                <span className="font-serif text-2xl text-[#d4af37]">O</span>
              </div>
              
              <h1 className="font-serif text-[7.5vw] sm:text-3xl md:text-5xl text-white tracking-widest mb-4 whitespace-nowrap">
                Chathurya & Oshadi
              </h1>
              <p className="font-sans text-xs uppercase tracking-[0.4em] text-white/50 mb-12">
                08 October 2026
              </p>
              
              <button
                onClick={() => setIsOpen(true)}
                className="group relative px-8 py-3 bg-[#d4af37] text-[#0d1511] font-sans text-xs uppercase tracking-widest font-semibold rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">Open Invitation</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={!isOpen ? "h-screen overflow-hidden" : ""}>
        {children}
      </div>
    </>
  );
}

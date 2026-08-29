"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function RSVPModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length > 0) {
      router.push(`/invite/${code.trim().toUpperCase()}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md"
          >
            <div className="bg-[#0a0f1e] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl" />
              
              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
              >
                ✕
              </button>

              <div className="text-center mb-8 relative z-10">
                <p className="text-xs uppercase tracking-widest text-emerald-400 font-sans mb-2">Welcome</p>
                <h2 className="text-3xl font-serif text-white mb-2">Enter your Code</h2>
                <p className="text-white/50 text-sm font-sans">
                  Please enter the 8-character invitation code provided to you.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A1B2C3D4"
                  maxLength={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-center text-2xl font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all uppercase tracking-widest"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={code.length < 4}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white font-sans font-medium rounded-xl px-5 py-4 transition-all duration-300 shadow-lg shadow-emerald-500/20"
                >
                  Access Invitation
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

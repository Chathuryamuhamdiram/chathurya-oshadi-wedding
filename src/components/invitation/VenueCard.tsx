"use client";

import { motion } from "framer-motion";

interface VenueCardProps {
  label: string;
  name: string;
  address?: string | null;
  time?: string;
  googleMapsUrl?: string | null;
  delay?: number;
}

export function VenueCard({ label, name, address, time, googleMapsUrl, delay = 0 }: VenueCardProps) {
  const mapsUrl = googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${name} ${address || ""}`)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="border border-[#c9a84c]/20 rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.05) 0%, rgba(201,168,76,0.02) 100%)" }}
    >
      <div className="p-5">
        {/* Map icon + label */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#c9a84c]" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#c9a84c]/70 font-sans">{label}</p>
        </div>

        <h3 className="font-serif text-lg text-white mb-0.5">{name}</h3>
        {address && <p className="text-sm text-white/50 font-sans mb-0.5">{address}</p>}
        {time && <p className="text-xs font-mono text-[#c9a84c]/80 mb-3">{time}</p>}

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-[#c9a84c]/20 to-transparent my-3" />

        {/* Maps button */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#c9a84c]/30 text-[#c9a84c] text-xs font-sans uppercase tracking-widest hover:bg-[#c9a84c]/10 transition-colors group"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          Open in Google Maps
        </a>
      </div>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import { PassportStamp } from "./PassportStamp";

interface GuestPassportDetailsProps {
  guestName: string;
  invitationType: string;
  allowedGuestCount: number;
  rsvpStatus: string;
}

export function GuestPassportDetails({
  guestName,
  invitationType,
  allowedGuestCount,
  rsvpStatus,
}: GuestPassportDetailsProps) {
  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-300",
    ATTENDING: "bg-emerald-100 text-emerald-800 border-emerald-300",
    NOT_ATTENDING: "bg-red-100 text-red-800 border-red-300",
    NOT_SURE: "bg-blue-100 text-blue-800 border-blue-300",
  };
  const statusLabel: Record<string, string> = {
    PENDING: "Invited",
    ATTENDING: "Confirmed ✓",
    NOT_ATTENDING: "Declined",
    NOT_SURE: "Pending",
  };

  const fields = [
    { label: "Passenger", value: guestName.toUpperCase() },
    { label: "Invitation Type", value: invitationType === "FAMILY" ? "Family" : "Individual" },
    { label: "Travellers", value: `Up to ${allowedGuestCount} Guest${allowedGuestCount !== 1 ? "s" : ""}` },
    { label: "Date", value: "08 October 2026" },
    { label: "Destination", value: "Hikkaduwa, Sri Lanka" },
    { label: "Class", value: "Wedding Guest" },
  ];

  return (
    <div
      className="relative h-full flex flex-col p-6 md:p-8 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #faf6f0 0%, #f0e8d8 100%)" }}
    >
      {/* Ruling lines */}
      <div className="absolute inset-x-6 top-0 space-y-6 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="h-px bg-[#c9a84c]/10" />
        ))}
      </div>

      {/* Page number */}
      <p className="relative z-10 text-[9px] text-[#8b6914]/40 font-mono uppercase tracking-widest mb-4 text-right">
        Page 3
      </p>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative z-10 mb-5"
      >
        <p className="text-[9px] uppercase tracking-[0.4em] text-[#8b6914]/50 font-sans mb-1">
          Personal Invitation Details
        </p>
        <div className="h-px bg-gradient-to-r from-[#c9a84c]/60 to-transparent mb-4" />

        {/* Photo box */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-20 h-24 flex-shrink-0 border-2 border-[#c9a84c]/30 bg-[#e8dcc8] flex items-center justify-center rounded-sm">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#c9a84c]/40" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8V21.6h19.2V19.2c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-widest text-[#8b6914]/50 font-sans">Passenger</p>
            <p className="font-mono text-sm font-bold text-[#1a1200] leading-tight mt-0.5 break-words">
              {guestName.toUpperCase()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Data fields */}
      <div className="relative z-10 space-y-3 flex-1">
        {fields.slice(1).map((field, i) => (
          <motion.div
            key={field.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
            className="grid grid-cols-2 gap-2 border-b border-[#c9a84c]/15 pb-2"
          >
            <p className="text-[9px] uppercase tracking-widest text-[#8b6914]/50 font-sans">{field.label}</p>
            <p className="text-[11px] font-mono text-[#1a1200] font-medium text-right">{field.value}</p>
          </motion.div>
        ))}

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="grid grid-cols-2 gap-2 border-b border-[#c9a84c]/15 pb-2"
        >
          <p className="text-[9px] uppercase tracking-widest text-[#8b6914]/50 font-sans">Status</p>
          <div className="flex justify-end">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${statusColors[rsvpStatus] || statusColors["PENDING"]}`}>
              {statusLabel[rsvpStatus] || "Invited"}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Stamp */}
      <div className="relative z-10 flex justify-end mt-3">
        <PassportStamp text="INVITED" subText="2026" rotation={10} color="gold" size="sm" delay={1.0} />
      </div>

      {/* Machine readable zone */}
      <div className="relative z-10 mt-3 pt-3 border-t-2 border-[#c9a84c]/20">
        <div className="font-mono text-[7px] text-[#8b6914]/25 tracking-widest break-all">
          {`P<LKA${guestName.toUpperCase().replace(/\s/g, "<").slice(0, 20).padEnd(20, "<")}`}
        </div>
        <div className="font-mono text-[7px] text-[#8b6914]/25 tracking-widest mt-0.5">
          CO0810261LKA2610081&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;08
        </div>
      </div>
    </div>
  );
}

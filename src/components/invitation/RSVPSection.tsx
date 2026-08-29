"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitRSVP } from "@/app/invite/[token]/actions";

interface RSVPSectionProps {
  invitationCode: string;
  guestName: string;
  allowedGuestCount: number;
  currentRsvpStatus: string;
  currentConfirmedCount: number;
  invitationType: string;
}

export function RSVPSection({
  invitationCode,
  guestName,
  allowedGuestCount,
  currentRsvpStatus,
  currentConfirmedCount,
  invitationType,
}: RSVPSectionProps) {
  const [attendance, setAttendance] = useState(currentRsvpStatus !== "PENDING" ? currentRsvpStatus : "");
  const [confirmedGuestCount, setConfirmedGuestCount] = useState(
    currentConfirmedCount > 0 ? currentConfirmedCount : 1
  );
  const [liquorCount, setLiquorCount] = useState(0); // Assuming 0 as default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const isFamily = invitationType === "FAMILY";
  const hasRsvpd = currentRsvpStatus !== "PENDING" && result?.success;

  const countOptions = Array.from({ length: allowedGuestCount }, (_, i) => i + 1);
  const liquorOptions = Array.from({ length: confirmedGuestCount + 1 }, (_, i) => i); // 0 to confirmedGuestCount

  // Client-side validation
  const isValid =
    attendance === "NOT_ATTENDING" ||
    attendance === "NOT_SURE" ||
    (attendance === "ATTENDING" && confirmedGuestCount >= 1 && confirmedGuestCount <= allowedGuestCount && liquorCount <= confirmedGuestCount);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!attendance || !isValid) return;

    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData();
    formData.set("attendance", attendance);
    formData.set("confirmedGuestCount", String(confirmedGuestCount));
    formData.set("liquorCount", String(liquorCount));

    const res = await submitRSVP(invitationCode, formData);
    setResult(res);
    setIsSubmitting(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Section header */}
      <div className="text-center mb-6">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#c9a84c]/60 font-sans mb-2">
          ✈ Confirm Your Seat
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#c9a84c]/30" />
          <p className="font-serif text-2xl text-white">RSVP</p>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#c9a84c]/30" />
        </div>
      </div>

      {/* Current status if already responded */}
      {currentRsvpStatus !== "PENDING" && (
        <div className="border border-[#c9a84c]/20 rounded-xl bg-[#c9a84c]/5 p-4 mb-5 text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#c9a84c]/60 font-sans mb-1">Your Current Response</p>
          <p className="font-mono text-sm font-bold text-[#c9a84c]">
            {currentRsvpStatus === "ATTENDING"
              ? `✓ Attending — ${currentConfirmedCount} Guest${currentConfirmedCount !== 1 ? "s" : ""}`
              : currentRsvpStatus === "NOT_ATTENDING"
              ? "✗ Not Attending"
              : "? Unsure"}
          </p>
          <p className="text-xs text-white/40 font-sans mt-1">You can update your RSVP below</p>
        </div>
      )}

      {/* Family invitation hint */}
      {isFamily && (
        <div className="border border-[#c9a84c]/15 rounded-xl bg-white/5 p-3 mb-5 flex items-center gap-3">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#c9a84c]/60 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <div>
            <p className="text-xs text-white/70 font-sans">
              Family invitation · Up to <span className="text-[#c9a84c] font-bold">{allowedGuestCount}</span> guests
            </p>
            <p className="text-[10px] text-white/40 font-sans">Please select how many members of your family will attend</p>
          </div>
        </div>
      )}

      {/* Success message */}
      <AnimatePresence>
        {result?.success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="border border-emerald-500/30 rounded-2xl bg-emerald-500/10 p-6 mb-5 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <p className="font-serif text-xl text-white mb-1">Thank you, {guestName}!</p>
            <p className="text-sm text-white/60 font-sans">
              {attendance === "ATTENDING"
                ? `We have reserved ${confirmedGuestCount} seat${confirmedGuestCount !== 1 ? "s" : ""} for you. We cannot wait to celebrate with you!`
                : "We are sad to hear that. Thank you for letting us know."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {result?.error && (
        <div className="border border-red-500/30 rounded-xl bg-red-500/10 p-3 mb-4 text-center">
          <p className="text-sm text-red-400 font-sans">{result.error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Attendance selection */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#c9a84c]/60 font-sans mb-2">Will you attend?</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "ATTENDING", label: "Attending", icon: "✓" },
              { value: "NOT_ATTENDING", label: "Can't Make It", icon: "✗" },
              { value: "NOT_SURE", label: "Not Sure", icon: "?" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAttendance(opt.value)}
                className={`py-3 rounded-xl border text-xs font-sans uppercase tracking-widest transition-all duration-200 ${
                  attendance === opt.value
                    ? "border-[#c9a84c] bg-[#c9a84c]/15 text-[#c9a84c]"
                    : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
                }`}
              >
                <span className="block text-base mb-0.5">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Guest count — only shown when attending AND family */}
        {attendance === "ATTENDING" && isFamily && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[10px] uppercase tracking-widest text-[#c9a84c]/60 font-sans mb-2">
              Number of Guests Attending
            </p>
            <select
              value={confirmedGuestCount}
              onChange={(e) => {
                 const newCount = Number(e.target.value);
                 setConfirmedGuestCount(newCount);
                 if (liquorCount > newCount) setLiquorCount(newCount);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#c9a84c]/50 transition-colors"
            >
              {countOptions.map((n) => (
                <option key={n} value={n} className="bg-[#0a0e1f]">
                  {n} {n === 1 ? "Guest" : "Guests"} {n === allowedGuestCount ? "(Maximum)" : ""}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-white/30 font-sans mt-1">
              Maximum {allowedGuestCount} guests per this invitation
            </p>
          </motion.div>
        )}

        {/* Liquor count — only when attending */}
        {attendance === "ATTENDING" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <p className="text-[10px] uppercase tracking-widest text-[#c9a84c]/60 font-sans mb-2">
              Number of Guests Requiring Liquor
            </p>
            <select
              value={liquorCount}
              onChange={(e) => setLiquorCount(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#c9a84c]/50 transition-colors"
            >
              {liquorOptions.map((n) => (
                <option key={n} value={n} className="bg-[#0a0e1f]">
                  {n} {n === 1 ? "Guest" : "Guests"} {n === confirmedGuestCount ? "(Maximum)" : ""}
                </option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!attendance || !isValid || isSubmitting}
          className="relative w-full py-4 rounded-2xl font-sans text-sm uppercase tracking-[0.25em] font-semibold transition-all duration-300 overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #c9a84c, #e8c96a, #c9a84c)" , color: "#0a0e1f" }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Confirming...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                Confirm Your Seat
              </>
            )}
          </span>
        </button>
      </form>
    </motion.div>
  );
}

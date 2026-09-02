"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

type RsvpState = "phone_entry" | "loading" | "multiple_matches" | "no_match" | "code_entry";

interface InvitationMatch {
  invitationCode: string;
  displayName: string;
}

export function RSVPModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [viewState, setViewState] = useState<RsvpState>("phone_entry");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [matches, setMatches] = useState<InvitationMatch[]>([]);
  const router = useRouter();

  // Reset state when opened/closed
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setViewState("phone_entry");
      setPhone("");
      setCode("");
      setMatches([]);
    }, 300);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length < 9) return;

    setViewState("loading");
    try {
      const res = await fetch("/api/invitations/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setViewState("no_match");
        return;
      }

      if (data.invitations.length === 1) {
        router.push(`/invite/${data.invitations[0].invitationCode}`);
        onClose();
      } else if (data.invitations.length > 1) {
        setMatches(data.invitations);
        setViewState("multiple_matches");
      } else {
        setViewState("no_match");
      }
    } catch (error) {
      console.error(error);
      setViewState("no_match");
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
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
            onClick={handleClose}
            className="fixed inset-0 z-[100] bg-[#10233B]/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md p-4"
          >
            <div className="bg-[#F8F2E8] rounded-none md:rounded-lg p-8 md:p-12 shadow-2xl overflow-hidden relative border border-[#D7B56D]/30">
              
              {/* Paper Texture Overlay */}
              <div 
                className="absolute inset-0 mix-blend-multiply opacity-[0.3] pointer-events-none" 
                style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} 
              />
              
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-[#10233B]/40 hover:text-[#10233B] transition-colors z-10"
              >
                ✕
              </button>

              <div className="text-center mb-8 relative z-10">
                <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#D7B56D] font-sans font-medium mb-3">RSVP</p>
                <h2 className="text-2xl md:text-3xl font-serif text-[#10233B] tracking-wide">
                  {viewState === "phone_entry" && "Find Your Invitation"}
                  {viewState === "code_entry" && "Enter Code"}
                  {viewState === "multiple_matches" && "Select Invitation"}
                  {viewState === "loading" && "Searching..."}
                  {viewState === "no_match" && "Not Found"}
                </h2>
              </div>

              <div className="relative z-10">
                {/* STATE: PHONE ENTRY */}
                {viewState === "phone_entry" && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <p className="text-[#10233B]/70 text-xs md:text-sm font-sans text-center mb-6 leading-relaxed">
                      Enter the mobile number used when your invitation was created.
                    </p>
                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 071 234 5678"
                        className="w-full bg-white/50 border-b border-[#10233B]/20 px-4 py-3 text-center text-lg font-sans text-[#10233B] placeholder:text-[#10233B]/30 focus:outline-none focus:border-[#D7B56D] focus:bg-white transition-all tracking-widest"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={phone.replace(/\D/g, '').length < 9}
                        className="w-full bg-[#10233B] hover:bg-[#152e4d] disabled:opacity-50 text-[#F8F2E8] font-sans text-xs tracking-widest uppercase py-4 transition-all duration-300 shadow-md"
                      >
                        Continue →
                      </button>
                    </form>

                    <div className="mt-8 flex flex-col items-center">
                      <div className="w-8 h-[1px] bg-[#D7B56D]/50 mb-6" />
                      <p className="text-[#10233B]/60 text-[11px] mb-3">Have an invitation code?</p>
                      <button 
                        onClick={() => setViewState("code_entry")}
                        className="text-[#D7B56D] text-[10px] uppercase tracking-widest font-semibold hover:text-[#10233B] transition-colors"
                      >
                        Enter Code
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STATE: CODE ENTRY */}
                {viewState === "code_entry" && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <p className="text-[#10233B]/70 text-xs md:text-sm font-sans text-center mb-6 leading-relaxed">
                      Please enter your 8-character code.
                    </p>
                    <form onSubmit={handleCodeSubmit} className="space-y-4">
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="e.g. YD27DCIB"
                        maxLength={8}
                        className="w-full bg-white/50 border-b border-[#10233B]/20 px-4 py-3 text-center text-xl font-mono text-[#10233B] placeholder:text-[#10233B]/20 focus:outline-none focus:border-[#D7B56D] focus:bg-white transition-all tracking-[0.2em] uppercase"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={code.length < 4}
                        className="w-full bg-[#10233B] hover:bg-[#152e4d] disabled:opacity-50 text-[#F8F2E8] font-sans text-xs tracking-widest uppercase py-4 transition-all duration-300 shadow-md"
                      >
                        Open Invitation
                      </button>
                    </form>
                    
                    <div className="mt-8 text-center">
                      <button 
                        onClick={() => setViewState("phone_entry")}
                        className="text-[#10233B]/50 text-[10px] uppercase tracking-widest hover:text-[#10233B] transition-colors"
                      >
                        ← Use Mobile Number
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STATE: LOADING */}
                {viewState === "loading" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-[#D7B56D] animate-spin mb-4" />
                    <p className="text-[#10233B]/60 text-xs tracking-widest uppercase">Locating...</p>
                  </motion.div>
                )}

                {/* STATE: MULTIPLE MATCHES */}
                {viewState === "multiple_matches" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
                    <p className="text-[#10233B]/70 text-xs md:text-sm font-sans text-center mb-6 leading-relaxed">
                      We found more than one invitation. Please select yours:
                    </p>
                    <div className="w-full space-y-3">
                      {matches.map((match) => (
                        <button
                          key={match.invitationCode}
                          onClick={() => {
                            router.push(`/invite/${match.invitationCode}`);
                            onClose();
                          }}
                          className="w-full bg-white/60 hover:bg-white border border-[#10233B]/10 hover:border-[#D7B56D] p-4 flex flex-col items-center justify-center transition-all group"
                        >
                          <span className="font-serif text-[#10233B] text-lg group-hover:text-[#D7B56D] transition-colors">
                            {match.displayName}
                          </span>
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setViewState("phone_entry")}
                      className="mt-8 text-[#10233B]/50 text-[10px] uppercase tracking-widest hover:text-[#10233B] transition-colors"
                    >
                      ← Back
                    </button>
                  </motion.div>
                )}

                {/* STATE: NO MATCH */}
                {viewState === "no_match" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                    <p className="text-[#10233B]/80 text-sm font-sans leading-relaxed mb-8">
                      We couldn't find an invitation linked to that number.<br/><br/>Please check the number or contact Chathurya or Oshadi for assistance.
                    </p>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setViewState("phone_entry")}
                        className="w-full bg-[#10233B] hover:bg-[#152e4d] text-[#F8F2E8] font-sans text-xs tracking-widest uppercase py-3 transition-all duration-300"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => setViewState("code_entry")}
                        className="w-full bg-transparent border border-[#10233B]/20 hover:border-[#D7B56D] text-[#10233B] font-sans text-xs tracking-widest uppercase py-3 transition-all duration-300"
                      >
                        Enter Code Instead
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

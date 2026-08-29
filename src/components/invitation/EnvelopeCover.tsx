"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type EnvelopeState = "closed" | "opening" | "card-rising" | "opened";

interface EnvelopeIntroProps {
  guestName: string;
  invitationCode: string;
  onOpened: () => void;
}

export function EnvelopeIntro({ guestName, invitationCode, onOpened }: EnvelopeIntroProps) {
  const SESSION_KEY = `wedding-envelope-opened-${invitationCode}`;
  const [state, setState] = useState<EnvelopeState>("closed");
  const [skipAnim, setSkipAnim] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const already = sessionStorage.getItem(SESSION_KEY);
      if (already === "true") {
        setSkipAnim(true);
        onOpened();
      }
    }
  }, [SESSION_KEY, onOpened]);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleOpen = () => {
    if (state !== "closed") return;
    if (prefersReducedMotion) {
      if (typeof window !== "undefined") sessionStorage.setItem(SESSION_KEY, "true");
      onOpened();
      return;
    }
    setState("opening");
    setTimeout(() => setState("card-rising"), 900);
    setTimeout(() => {
      setState("opened");
      if (typeof window !== "undefined") sessionStorage.setItem(SESSION_KEY, "true");
      setTimeout(onOpened, 600);
    }, 2200);
  };

  if (skipAnim) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#EEE7DB" }}
      aria-label="Wedding invitation envelope"
    >
      <BackgroundDecor />

      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-6 md:mb-10 z-10 relative px-4"
      >
        <p className="uppercase tracking-[0.35em] text-[10px] md:text-[11px] font-sans font-semibold" style={{ color: "#9A8060" }}>
          A personal invitation for
        </p>
        <p className="font-serif italic mt-2 text-2xl md:text-4xl leading-tight" style={{ color: "#10233B" }}>
          {guestName || "Our Dearest Guest"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{
          opacity: state === "opened" ? 0 : 1,
          y: state === "opened" ? 60 : 0,
          scale: state === "opened" ? 0.97 : 1,
        }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
        style={{
          width: "min(680px, 92vw)",
          height: "min(480px, 66vw)",
          filter: "drop-shadow(0 28px 50px rgba(20,18,14,0.22)) drop-shadow(0 8px 18px rgba(20,18,14,0.15))",
        }}
      >
        <EnvelopeBody state={state} />
        <InvitationPreviewCard state={state} />
        <EnvelopeFlap state={state} />
        <AnimatePresence>
          {state === "closed" && <EnvelopeSeal onOpen={handleOpen} />}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {state === "closed" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 md:mt-12 z-10 relative text-center"
          >
            <button
              onClick={handleOpen}
              aria-label="Open your wedding invitation"
              className="px-10 md:px-14 py-3.5 md:py-4 rounded-full text-[11px] md:text-xs uppercase font-sans font-bold tracking-[0.28em] border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#D7B56D] hover:bg-[#D7B56D] hover:text-[#10233B]"
              style={{ borderColor: "#D7B56D", color: "#10233B", background: "transparent" }}
            >
              Open Invitation
            </button>
            <motion.p
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="mt-4 text-[10px] uppercase tracking-[0.25em] font-sans"
              style={{ color: "#9A8060" }}
            >
              Tap the seal or button to open
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(state === "opening" || state === "card-rising") && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-10 z-10 relative text-[10px] uppercase tracking-[0.3em] font-sans"
            style={{ color: "#9A8060" }}
          >
            Opening your invitation...
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function EnvelopeBody({ state }: { state: EnvelopeState }) {
  return (
    <>
      <div
        className="absolute inset-0 rounded-sm overflow-hidden"
        style={{ background: "linear-gradient(160deg, #F2E8D6 0%, #EBD9BB 100%)", zIndex: 1 }}
      >
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")", backgroundSize: "300px 300px" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(180,155,110,0.13) 100%)" }} />
      </div>

      <div className="absolute inset-0" style={{ zIndex: 2, clipPath: "polygon(0 0, 50% 55%, 0 100%)", background: "linear-gradient(135deg, #E8D9BF 0%, #D9C8A6 100%)" }} />
      <div className="absolute inset-0" style={{ zIndex: 2, clipPath: "polygon(100% 0, 50% 55%, 100% 100%)", background: "linear-gradient(225deg, #EAD9BB 0%, #D6C49E 100%)" }} />
      <div className="absolute inset-0" style={{ zIndex: 3, clipPath: "polygon(0 100%, 50% 55%, 100% 100%)", background: "linear-gradient(180deg, #DDD0B3 0%, #D0C09A 100%)" }} />
      <div className="absolute inset-0 rounded-sm pointer-events-none" style={{ zIndex: 10, boxShadow: "inset 0 0 0 1px rgba(150,120,70,0.2)" }} />
      <div className="absolute pointer-events-none" style={{ top: "6px", left: "6px", right: "6px", bottom: "6px", zIndex: 4, borderRadius: "2px", border: "1px solid rgba(215,181,109,0.25)" }} />

      <AnimatePresence>
        {(state === "closed" || state === "opening") && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-center justify-end pb-[20%] pointer-events-none"
            style={{ zIndex: 5 }}
          >
            <p className="font-serif italic leading-none text-center" style={{ fontSize: "clamp(1.4rem, 4vw, 2.4rem)", color: "#10233B", letterSpacing: "0.04em" }}>Chathurya</p>
            <p className="font-serif text-center my-1" style={{ fontSize: "clamp(0.85rem, 2.5vw, 1.2rem)", color: "#D7B56D", letterSpacing: "0.15em" }}>&amp;</p>
            <p className="font-serif italic leading-none text-center" style={{ fontSize: "clamp(1.4rem, 4vw, 2.4rem)", color: "#10233B", letterSpacing: "0.04em" }}>Oshadi</p>
            <p className="mt-3 font-sans tracking-[0.3em] text-center" style={{ fontSize: "clamp(0.55rem, 1.5vw, 0.7rem)", color: "#9A8060" }}>08 - 10 - 2026</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function EnvelopeFlap({ state }: { state: EnvelopeState }) {
  const isOpen = state === "opening" || state === "card-rising" || state === "opened";
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: isOpen ? 5 : 15, perspective: "1200px" }}>
      <motion.div
        animate={{ rotateX: isOpen ? -180 : 0 }}
        transition={{ duration: 0.85, ease: [0.33, 0, 0.18, 1] }}
        style={{ transformOrigin: "top center", transformStyle: "preserve-3d", backfaceVisibility: "hidden", width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
      >
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", clipPath: "polygon(0 0, 100% 0, 50% 60%)", background: "linear-gradient(170deg, #F5EBD5 0%, #E2CFA7 60%, #D8C49A 100%)" }}
        >
          <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")", backgroundSize: "300px 300px" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(180,145,80,0.0) 0%, rgba(140,110,60,0.15) 85%, rgba(120,90,40,0.25) 100%)" }} />
        </div>
        <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateX(180deg)", clipPath: "polygon(0 0, 100% 0, 50% 60%)", background: "linear-gradient(170deg, #E9DAC0 0%, #D8C49A 100%)" }} />
      </motion.div>
    </div>
  );
}

function EnvelopeSeal({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.button
      key="seal"
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0, transition: { duration: 0.32 } }}
      transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.93 }}
      onClick={onOpen}
      aria-label="Open your invitation by breaking the wax seal"
      className="absolute left-1/2 -translate-x-1/2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B56D] focus-visible:ring-offset-2 focus-visible:rounded-full"
      style={{ top: "52%", zIndex: 20 }}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: "clamp(58px, 11vw, 80px)",
          height: "clamp(58px, 11vw, 80px)",
          background: "conic-gradient(from 0deg, #B8922A, #E2C26A, #C9A53C, #F0D47A, #B8922A)",
          boxShadow: "0 6px 20px rgba(100,70,20,0.45), 0 2px 6px rgba(100,70,20,0.3), inset 0 1px 2px rgba(255,240,180,0.4)",
        }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: "80%", height: "80%", background: "radial-gradient(circle at 40% 35%, #C9A53C, #8A6510)", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.35)" }}
        >
          <span
            className="font-serif italic font-bold select-none"
            style={{ fontSize: "clamp(13px, 2.5vw, 18px)", color: "#F5E5A0", textShadow: "0 1px 3px rgba(0,0,0,0.5)", letterSpacing: "-0.04em" }}
          >
            C&amp;O
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function InvitationPreviewCard({ state }: { state: EnvelopeState }) {
  const isRising = state === "card-rising" || state === "opened";
  const isClosed = state === "closed";
  return (
    <motion.div
      animate={{
        y: isRising ? "-62%" : isClosed ? "20%" : "8%",
        scale: isRising ? 1 : 0.97,
        boxShadow: isRising ? "0 30px 70px rgba(20,18,14,0.28), 0 8px 24px rgba(20,18,14,0.18)" : "0 6px 20px rgba(20,18,14,0.15)",
      }}
      transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
      className="absolute left-[5%] right-[5%] rounded-sm overflow-hidden"
      style={{ height: "94%", bottom: 0, zIndex: 8, background: "#10233B" }}
    >
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "14px 14px" }} />
      <motion.div
        animate={{ opacity: isRising ? 1 : 0 }}
        transition={{ duration: 0.6, delay: isRising ? 0.3 : 0 }}
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
      >
        <p className="uppercase tracking-[0.35em] font-sans font-semibold" style={{ fontSize: "clamp(7px, 1.5vw, 10px)", color: "#D7B56D", marginBottom: "8px" }}>The Wedding of</p>
        <h2 className="font-serif italic leading-tight" style={{ fontSize: "clamp(1.5rem, 4.5vw, 3rem)", color: "#FFFFFF", letterSpacing: "0.03em" }}>Chathurya</h2>
        <p className="font-serif" style={{ fontSize: "clamp(1rem, 2.5vw, 1.6rem)", color: "#D7B56D", margin: "4px 0", letterSpacing: "0.15em" }}>&amp;</p>
        <h2 className="font-serif italic leading-tight" style={{ fontSize: "clamp(1.5rem, 4.5vw, 3rem)", color: "#FFFFFF", letterSpacing: "0.03em" }}>Oshadi</h2>
        <div className="my-4 md:my-6" style={{ width: "clamp(40px, 8vw, 60px)", height: "1px", background: "linear-gradient(to right, transparent, #D7B56D, transparent)" }} />
        <p className="uppercase tracking-[0.3em] font-sans" style={{ fontSize: "clamp(7px, 1.5vw, 10px)", color: "#D7B56D" }}>08 October 2026</p>
        <p className="font-serif italic mt-4 md:mt-6" style={{ fontSize: "clamp(0.7rem, 1.8vw, 1rem)", color: "rgba(235,214,170,0.65)", lineHeight: 1.6 }}>
          &ldquo;A journey of love,<br />a lifetime together.&rdquo;
        </p>
      </motion.div>
    </motion.div>
  );
}

function BackgroundDecor() {
  const svgPaths = (
    <>
      <path d="M10 10 Q60 40 80 90 Q100 140 60 180" stroke="#C9A53C" strokeWidth="1" />
      <path d="M10 10 Q40 60 90 80 Q140 100 180 60" stroke="#C9A53C" strokeWidth="1" />
      <circle cx="10" cy="10" r="3" fill="#C9A53C" />
      <path d="M80 90 Q100 70 85 50" stroke="#C9A53C" strokeWidth="0.8" />
      <path d="M80 90 Q65 108 85 118" stroke="#C9A53C" strokeWidth="0.8" />
      <circle cx="85" cy="50" r="5" fill="none" stroke="#C9A53C" strokeWidth="0.8" />
      <circle cx="85" cy="118" r="5" fill="none" stroke="#C9A53C" strokeWidth="0.8" />
      <path d="M30 50 Q45 35 55 50 Q45 65 30 50Z" fill="none" stroke="#C9A53C" strokeWidth="0.7" />
    </>
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(180,155,110,0.12) 100%)" }} />
      <svg className="absolute top-0 left-0 opacity-[0.12]" style={{ width: "clamp(100px, 25vw, 220px)" }} viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">{svgPaths}</svg>
      <svg className="absolute top-0 right-0 opacity-[0.12]" style={{ width: "clamp(100px, 25vw, 220px)", transform: "scaleX(-1)" }} viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">{svgPaths}</svg>
      <svg className="absolute bottom-0 left-0 opacity-[0.10]" style={{ width: "clamp(80px, 18vw, 160px)", transform: "scaleY(-1)" }} viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">{svgPaths}</svg>
      <svg className="absolute bottom-0 right-0 opacity-[0.10]" style={{ width: "clamp(80px, 18vw, 160px)", transform: "scale(-1)" }} viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">{svgPaths}</svg>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: `${2 + (i % 3)}px`, height: `${2 + (i % 3)}px`, background: "#D7B56D", left: `${10 + i * 11}%`, top: `${15 + ((i * 17) % 70)}%`, opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0], y: [-10, -30] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
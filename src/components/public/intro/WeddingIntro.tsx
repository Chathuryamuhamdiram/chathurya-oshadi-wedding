"use client";

import { useEffect, useState } from "react";
import { TravelPath } from "./TravelPath";
import { WeddingPassport } from "./WeddingPassport";

export type IntroState = "ready" | "travel" | "passport" | "opening" | "stamped" | "complete";

interface WeddingIntroProps {
  onComplete: () => void;
}

export function WeddingIntro({ onComplete }: WeddingIntroProps) {
  const [state, setState] = useState<IntroState>("ready");

  useEffect(() => {
    // Initial sequence: travel line -> passport entry
    const travelTimer = setTimeout(() => setState("travel"), 100); // Slight delay for render
    const passportTimer = setTimeout(() => setState("passport"), 1600); // Travel path takes 1.5s

    return () => {
      clearTimeout(travelTimer);
      clearTimeout(passportTimer);
    };
  }, []);

  const handleOpenPassport = () => {
    setState("opening");

    // Play wedding music directly via Audio API if available
    try {
      const audio = new Audio("/wedding-song.mp3");
      audio.volume = 0.25;
      audio.play().catch(e => console.log("Audio play failed, continuing animation", e));
    } catch (e) {
      console.log("Audio API not supported, continuing animation");
    }

    // Sequence after user taps open
    setTimeout(() => {
      setState("stamped");
    }, 1400); // Wait for passport to open (1000ms) + 400ms pause

    setTimeout(() => {
      setState("complete");
    }, 4500); // Show details for ~3 seconds, then transition to hero

    // Call onComplete briefly after "complete" state is set to allow fade-out
    setTimeout(() => {
      onComplete();
    }, 5500);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-[#10233B] overflow-hidden transition-opacity duration-1000 ease-in-out"
      style={{
        opacity: state === "complete" ? 0 : 1,
        pointerEvents: state === "complete" ? "none" : "auto",
      }}
    >
      {/* Background Enhancements */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-screen pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.05)_0%,_rgba(0,0,0,0.5)_100%)] pointer-events-none" />

      {/* Intro Components */}
      <TravelPath state={state} />
      <WeddingPassport state={state} onOpen={handleOpenPassport} />
    </div>
  );
}

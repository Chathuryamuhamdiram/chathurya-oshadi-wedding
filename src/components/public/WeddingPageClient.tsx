"use client";

import { useState, useEffect } from "react";
import { WeddingIntro } from "./intro/WeddingIntro";
import { FloatingNav } from "./FloatingNav";

export function WeddingPageClient({ children }: { children: React.ReactNode }) {
  const [isIntroComplete, setIsIntroComplete] = useState(false);

  useEffect(() => {
    // Lock body scroll while intro is playing
    if (!isIntroComplete) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isIntroComplete]);

  return (
    <>
      {!isIntroComplete && (
        <WeddingIntro onComplete={() => setIsIntroComplete(true)} />
      )}
      {children}
      {isIntroComplete && <FloatingNav />}
    </>
  );
}

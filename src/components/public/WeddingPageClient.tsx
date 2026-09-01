"use client";

import { useState, useEffect } from "react";
import { WeddingPassportIntro } from "./intro/WeddingPassportIntro";
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
        <WeddingPassportIntro onComplete={() => setIsIntroComplete(true)} />
      )}
      {/* Main Content */}
      <div className={isIntroComplete ? "block" : "fixed inset-0 overflow-hidden"}>
        {children}
      </div>
      {isIntroComplete && <FloatingNav />}
    </>
  );
}

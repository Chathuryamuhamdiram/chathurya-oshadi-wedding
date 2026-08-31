"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Uses the local file the user just added
    audioRef.current = new Audio("/artarea_studio-i-choose-you-185829.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    // Attempt to autoplay immediately on load
    const attemptAutoplay = async () => {
      if (!audioRef.current) return;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setHasInteracted(true);
      } catch (err) {
        // Browser blocked autoplay (expected behavior).
        // We will wait for the first user interaction.
        console.log("Autoplay blocked, waiting for user interaction...");
      }
    };
    attemptAutoplay();

    const handleFirstInteraction = () => {
      if (!hasInteracted && audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.log("Autoplay blocked by browser until direct interaction.", err);
        });
        setHasInteracted(true);
      }
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("scroll", handleFirstInteraction, { once: true });


    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("scroll", handleFirstInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [hasInteracted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex items-center gap-3">
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="hidden md:block bg-[#10233B]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#C8A45A]/30 shadow-lg"
          >
            <p className="text-[10px] font-sans uppercase tracking-widest text-[#D7B56D]">
              {isPlaying ? "Pause Music" : "Play Music"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={togglePlay}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md border transition-all duration-500 overflow-hidden ${
          isPlaying 
            ? "bg-[#10233B]/90 border-[#C8A45A]/50 text-[#D7B56D]" 
            : "bg-[#FFFDF8]/90 border-[#DED2C1] text-[#10233B]"
        }`}
      >
        {isPlaying && (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-dashed border-[#C8A45A]/30 rounded-full scale-75"
          />
        )}
        
        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full bg-[#D7B56D] rounded-full"
            />
          </div>
        )}

        <div className="relative z-10 flex items-center justify-center">
          {isPlaying ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5 opacity-60" />
          )}
        </div>
      </motion.button>
    </div>
  );
}

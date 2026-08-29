"use client";

import { useState, useEffect, useRef } from "react";
import { Music, VolumeX } from "lucide-react";

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://cdn.pixabay.com/download/audio/2022/05/16/audio_053db82349.mp3?filename=romantic-piano-110058.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Audio play blocked by browser", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <button 
      onClick={togglePlay}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white shadow-lg border border-primary/10 flex items-center justify-center text-primary hover:bg-primary/5 hover:scale-110 transition-all duration-300"
      aria-label="Toggle background music"
    >
      {isPlaying ? (
        <Music className="w-5 h-5 animate-pulse" />
      ) : (
        <VolumeX className="w-5 h-5 opacity-50" />
      )}
    </button>
  );
}

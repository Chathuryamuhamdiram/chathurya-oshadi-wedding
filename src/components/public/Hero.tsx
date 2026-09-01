"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Countdown } from "./Countdown";

export function Hero({ imageUrl = "/hero_image_new.jpg" }: { imageUrl?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section id="hero" ref={ref} className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background z-10">
      
      {/* Full screen image with elegant overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#10233B]">
        <motion.div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${imageUrl}')` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
      </div>
      
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/10 z-0" />
      
      {/* Gradient fading to Navy/Charcoal to anchor the light text */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-[#10233B]/90 z-0" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full min-h-screen pt-24 pb-16 md:pb-12"
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-[13vw] sm:text-[4.5rem] leading-[1] md:text-8xl lg:text-[10rem] font-serif text-[#F8F2E8] lg:leading-[0.85] tracking-tight flex flex-col items-center drop-shadow-lg"
        >
          <span>CHATHURYA</span>
          <span className="italic text-[#D7B56D] font-light text-[15vw] sm:text-6xl md:text-7xl lg:text-[8rem] -my-1 md:-my-4 lg:-my-6 drop-shadow-md relative z-10">&</span>
          <span className="relative -mt-2 md:-mt-4">OSHADI</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 md:mt-16 flex flex-col items-center gap-4"
        >
          <p className="text-[10px] md:text-sm text-[#F5F2EA]/90 font-sans tracking-[0.3em] md:tracking-[0.4em] uppercase font-medium">
            08 October 2026
          </p>
          <div className="w-[1px] h-6 bg-[#E5D3B3]/50" />
          <p className="text-[10px] md:text-sm text-[#F5F2EA]/90 font-sans tracking-[0.3em] md:tracking-[0.4em] uppercase font-medium">
            Hikkaduwa
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
          className="mt-12 md:mt-16 mb-8 text-xs md:text-base font-serif italic text-[#F5F2EA]/70 tracking-wider"
        >
          "From our first hello to forever."
        </motion.p>

        {/* Countdown immediately following text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          className="z-20"
        >
          <Countdown targetDate={new Date("2026-10-08T08:50:00+05:30")} />
        </motion.div>
      </motion.div>
    </section>
  );
}

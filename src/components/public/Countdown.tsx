"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CountdownProps {
  targetDate: Date;
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const diff = +targetDate - +new Date();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-3 sm:gap-6 md:gap-10">
      {[
        { label: "Days", value: timeLeft.days },
        { label: "Hours", value: timeLeft.hours },
        { label: "Minutes", value: timeLeft.minutes },
        { label: "Seconds", value: timeLeft.seconds },
      ].map((item, i) => (
        <div key={item.label} className="flex flex-col items-center">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center">
            {/* Background ring */}
            <div className="absolute inset-0 rounded-2xl border border-[#F5F2EA]/20 bg-[#F5F2EA]/5" />
            <AnimatePresence mode="popLayout">
              <motion.span
                key={item.value}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative text-3xl sm:text-4xl md:text-5xl font-serif text-[#F5F2EA] drop-shadow-sm"
              >
                {String(item.value).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-[#F5F2EA]/60 mt-2 font-sans">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

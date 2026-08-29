"use client";

import { useEffect, useState } from "react";

export function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className="text-5xl sm:text-7xl font-light text-white tracking-tight tabular-nums opacity-0">
        00:00 AM
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-5xl sm:text-7xl font-light text-white tracking-tight tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-white/60 font-medium tracking-widest uppercase mt-2 text-sm sm:text-base">
        {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}

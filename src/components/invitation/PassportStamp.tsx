"use client";

import { motion } from "framer-motion";

interface PassportStampProps {
  text: string;
  subText?: string;
  rotation?: number;
  color?: "gold" | "red" | "blue" | "green";
  size?: "sm" | "md" | "lg";
  delay?: number;
}

const colorMap = {
  gold: {
    border: "border-[#c9a84c]",
    text: "text-[#c9a84c]",
    bg: "bg-[#c9a84c]/5",
  },
  red: {
    border: "border-red-800/60",
    text: "text-red-800/80",
    bg: "bg-red-800/5",
  },
  blue: {
    border: "border-blue-900/60",
    text: "text-blue-900/80",
    bg: "bg-blue-900/5",
  },
  green: {
    border: "border-emerald-800/60",
    text: "text-emerald-800/80",
    bg: "bg-emerald-800/5",
  },
};

const sizeMap = {
  sm: "w-16 h-16 text-[7px]",
  md: "w-24 h-24 text-[8px]",
  lg: "w-32 h-32 text-[9px]",
};

export function PassportStamp({
  text,
  subText,
  rotation = -15,
  color = "gold",
  size = "md",
  delay = 0,
}: PassportStampProps) {
  const colors = colorMap[color];
  const sizes = sizeMap[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.4, rotate: rotation - 10 }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={`${sizes} rounded-full border-4 ${colors.border} ${colors.bg} flex flex-col items-center justify-center select-none pointer-events-none`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <span className={`font-mono font-bold uppercase tracking-widest text-center leading-tight ${colors.text}`}>
        {text}
      </span>
      {subText && (
        <span className={`font-mono text-[7px] uppercase tracking-wider mt-0.5 ${colors.text} opacity-70`}>
          {subText}
        </span>
      )}
    </motion.div>
  );
}

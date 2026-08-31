"use client";

import { useEffect, useState } from "react";
import { IntroState } from "./WeddingIntro";

export function TravelPath({ state }: { state: IntroState }) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (state === "travel") {
      setShouldAnimate(true);
    }
  }, [state]);

  if (state === "complete" || state === "ready") return null;

  return (
    <div 
      className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-1000"
      style={{
        opacity: state === "travel" ? 1 : 0, // Fades out when state moves to passport
      }}
    >
      <svg 
        viewBox="0 0 1000 400" 
        className="w-full max-w-[800px] h-full opacity-60"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          id="flightPath"
          d="M 100 300 Q 400 50, 900 300"
          fill="none"
          stroke="#D7B56D"
          strokeWidth="2"
          strokeDasharray="6 6"
          className="flight-line"
        />
        {/* Airplane Icon moving along path */}
        {shouldAnimate && (
          <g className="airplane">
            <path 
              d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" 
              fill="#D7B56D" 
              transform="rotate(45) scale(1.5) translate(-12, -12)"
            />
            <animateMotion 
              dur="1.5s" 
              repeatCount="1" 
              fill="freeze"
              calcMode="spline"
              keyTimes="0;1"
              keySplines="0.42, 0, 0.58, 1"
            >
              <mpath href="#flightPath" />
            </animateMotion>
          </g>
        )}
      </svg>
      <style jsx>{`
        .flight-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawLine 1.5s cubic-bezier(0.42, 0, 0.58, 1) forwards;
        }
        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}

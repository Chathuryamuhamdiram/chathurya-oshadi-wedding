"use client";

interface TravelDecorationsProps {
  state: "ready" | "starting" | "opening" | "revealed" | "transitioning" | "complete";
}

const introAssets = {
  sriLankaMap: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_51 PM (2).png",
  sriLankaStamp: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_50 PM (1).png",
  palm: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_51 PM (3).png",
  heritage: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_52 PM (4).png",
  flightPath: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_52 PM (5).png",
  airplane: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_52 PM (6).png",
  botanical: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_54 PM (7).png",
  globe: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_54 PM (8).png",
  foreverStamp: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_54 PM (9).png",
  petals1: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_02_55 PM (10).png",
  petals2: "/Front_Passport/ChatGPT Image Aug 31, 2026, 08_06_11 PM.png",
};

export function TravelDecorations({ state }: TravelDecorationsProps) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Base Radial Navy Gradient mimicking the image lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#182B48_0%,_#0C1627_100%)] opacity-95" />
      
      {/* Leather / Paper Texture Overlay */}
      <div 
        className="absolute inset-0 mix-blend-multiply opacity-[0.4]" 
        style={{ 
          backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" 
        }} 
      />

      {/* --- LEFT SIDE DECORATIONS --- */}
      
      {/* Forever Begins Stamp (Upper Left) */}
      <div className="absolute top-[18%] left-[5%] md:top-[22%] md:left-[18%] w-40 h-40 md:w-56 md:h-56 opacity-[0.25] rotate-[-8deg] mix-blend-screen">
        <img 
          src={introAssets.foreverStamp} 
          alt="Forever Begins Stamp" 
          className="object-contain w-full h-full"
          aria-hidden="true"
        />
      </div>

      {/* Sri Lankan Heritage / Stupa (Lower Left, pushed slightly left) */}
      <div className="absolute bottom-[5%] left-[-15%] md:bottom-[8%] md:left-[-5%] w-[60vw] md:w-[380px] h-auto opacity-[0.15] mix-blend-screen">
        <img 
          src={introAssets.heritage} 
          alt="Sri Lankan Heritage Stupa" 
          className="object-contain w-full h-full"
          aria-hidden="true"
        />
      </div>

      {/* Tropical Palm (Lower Left, pushed slightly right to separate from Stupa) */}
      <div className="absolute bottom-[8%] left-[15%] md:bottom-[10%] md:left-[18%] w-[45vw] md:w-[280px] h-auto opacity-[0.2] mix-blend-screen">
        <img 
          src={introAssets.palm} 
          alt="Tropical Palm Tree" 
          className="object-contain w-full h-full"
          aria-hidden="true"
        />
      </div>

      {/* --- RIGHT SIDE DECORATIONS --- */}
      
      {/* Sri Lanka Outline Map (Upper Right) */}
      <div className="absolute top-[8%] right-[5%] md:top-[12%] md:right-[15%] w-32 h-48 md:w-48 md:h-64 opacity-[0.18] mix-blend-screen">
        <img 
          src={introAssets.sriLankaMap} 
          alt="Sri Lanka Outline Map" 
          className="object-contain w-full h-full"
          aria-hidden="true"
        />
      </div>

      {/* Dotted Flight Path (Crossing right side) */}
      <div className="absolute top-[20%] right-[-10%] md:top-[30%] md:right-0 w-[120vw] md:w-[80vw] h-[60vh] opacity-[0.25] mix-blend-screen pointer-events-none">
        <img 
          src={introAssets.flightPath} 
          alt="Dotted Flight Path" 
          className="object-contain w-full h-full"
          aria-hidden="true"
        />
      </div>

      {/* Airplane on the path (Animates when state changes from ready) */}
      <div 
        className="absolute top-[45%] right-[20%] md:top-[55%] md:right-[28%] w-12 h-12 md:w-16 md:h-16 mix-blend-screen transition-all duration-[3000ms] ease-out z-10"
        style={{
          transform: state === "ready" ? "translate(0, 0) rotate(20deg)" : "translate(-10vw, -10vh) rotate(5deg) scale(1.2)",
          opacity: state === "ready" ? 0.7 : 0.9
        }}
      >
        <img 
          src={introAssets.airplane} 
          alt="Golden Airplane" 
          className="object-contain w-full h-full drop-shadow-md"
          aria-hidden="true"
        />
      </div>

      {/* --- FOREGROUND PETALS (Depth of field effect) --- */}
      
      {/* Scattered Petals (Top/Left) */}
      <div className="absolute top-[5%] left-[10%] md:top-[8%] md:left-[15%] w-32 h-32 md:w-48 md:h-48 opacity-[0.6] mix-blend-screen blur-[2px] md:blur-[3px] rotate-12">
        <img 
          src={introAssets.petals2} 
          alt="Scattered Ivory Petals" 
          className="object-contain w-full h-full"
          aria-hidden="true"
        />
      </div>

      {/* Large Petal Cluster (Bottom Right Foreground) */}
      <div className="absolute -bottom-[5%] -right-[5%] md:-bottom-[10%] md:-right-[5%] w-64 h-64 md:w-96 md:h-96 opacity-[0.7] mix-blend-screen blur-[6px] md:blur-[10px] rotate-[-15deg]">
        <img 
          src={introAssets.petals1} 
          alt="Foreground Ivory Petals" 
          className="object-contain w-full h-full"
          aria-hidden="true"
        />
      </div>

    </div>
  );
}

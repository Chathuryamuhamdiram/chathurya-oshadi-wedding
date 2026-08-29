"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";


function formatTime(timeStr: string | null) {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'AM' : 'AM'; // Keeping logic same as original but wait, original had AM/PM bug? Let's fix AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return { time: `${hours}:${minutes}`, period: period };
  }
  return { time: timeStr, period: "" };
}

const FALLBACK_EVENTS = [
  {
    id: "fallback-1",
    title: "Poruwa Ceremony",
    description: "A sacred and traditional ceremony to begin our journey as one.",
    eventDate: new Date("2026-10-08"),
    startTime: "08:50",
    endTime: null,
    venue: {
      name: "Hotel River Park",
      address: "Hikkaduwa, Sri Lanka",
      googleMapsUrl: "https://maps.google.com/?q=Hotel+River+Park+Hikkaduwa",
    },
  },
  {
    id: "fallback-2",
    title: "Reception",
    description: "Join us for an evening of celebration, laughter, and love.",
    eventDate: new Date("2026-10-08"),
    startTime: "10:30",
    endTime: null,
    venue: {
      name: "Hotel Grand Palace",
      address: "Hikkaduwa, Sri Lanka",
      googleMapsUrl: "https://maps.google.com/?q=Hotel+Grand+Palace+Hikkaduwa",
    },
  },
];

export function EventSchedule() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const displayEvents = FALLBACK_EVENTS;

  return (
    <section 
      id="schedule" 
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#F8F2E8] py-24 md:py-48 px-6 lg:px-12"
      style={{ isolation: 'auto' }}
    >
      {/* Subtle Paper Texture Layer */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, #DED2C1 1px, transparent 0)",
          backgroundSize: "24px 24px"
        }}
      />
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
        }}
      />

      {/* Top Right Decorative Stamp */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5 }}
        className="pointer-events-none absolute -right-4 top-12 md:right-8 md:top-20 opacity-[0.25] flex items-center"
      >
        <img src="/images/illustrations/stamp_rectangle.png" alt="" className="h-32 md:h-48 w-auto object-contain absolute right-4 md:right-12" />
        <img src="/images/illustrations/stamp_circle.png" alt="" className="h-24 md:h-32 w-auto object-contain absolute -top-4 md:-top-8 right-24 md:right-40" />
      </motion.div>

      {/* Bottom Left Decorative Landscape */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2 }}
        className="pointer-events-none absolute -left-20 bottom-1/4 md:left-0 md:bottom-[20%] opacity-[0.15]"
      >
        <img src="/images/illustrations/landscape_building.png" alt="" className="h-64 md:h-96 w-auto object-contain" />
      </motion.div>

      {/* Bottom Right Decorative Image */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, delay: 0.5 }}
        className="pointer-events-none absolute -right-20 bottom-16 md:right-0 md:bottom-12 z-0 opacity-[0.8]"
      >
        <img 
          src="/images/illustrations/lighthouse_fixed.png" 
          alt="" 
          className="h-64 md:h-[500px] w-auto object-contain" 
        />
      </motion.div>


      {/* Middle Left Decorative Compass */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2 }}
        className="pointer-events-none absolute -left-16 top-1/3 md:left-8 md:top-1/3 opacity-[0.15]"
      >
        <motion.img 
          src="/images/illustrations/compass.png" 
          alt="" 
          className="h-48 md:h-64 w-auto object-contain"
          animate={{ rotate: [-12, 12, -8, 8, -4, 4, 0, -12] }}
          transition={{ 
            duration: 6, 
            ease: "easeInOut", 
            repeat: Infinity,
            repeatDelay: 2
          }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-[1100px]">
        
        {/* HEADER */}
        <div className="mb-24 md:mb-32 flex flex-col items-center text-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="mb-8 flex flex-col items-center"
          >
            {/* Top divider with leaf */}
            <div className="flex items-center justify-center mb-6 w-full max-w-[200px] md:max-w-[300px]">
              <img src="/images/illustrations/leaf_ornament.png" alt="" className="w-full h-auto opacity-70" />
            </div>
            
            <h2 className="font-serif text-[2.5rem] md:text-[4rem] tracking-[0.2em] text-[#10233b] font-normal leading-none mb-6">
              THE DAY
            </h2>
            <div className="h-[1px] w-16 md:w-24 bg-[#D7B56D]/60 mb-6" />
            <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold text-[#D7B56D]">
              08 OCTOBER 2026
            </p>
          </motion.div>
        </div>

        {/* TIMELINE CONTAINER */}
        <div className="relative w-full">
          
          {/* Central Gold Line (Desktop Center, Mobile Left) */}
          <motion.div 
            initial={{ height: 0 }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[1px] bg-[#D7B56D] md:-translate-x-1/2 origin-top"
          />

          <div className="flex flex-col gap-16 md:gap-32 py-12">
            {displayEvents.map((event, index) => {
              const isEven = index % 2 === 0; // index 0 (Poruwa) is even (left side on desktop)
              const timeData = event.startTime ? formatTime(event.startTime) : null;
              
              return (
                <div 
                  key={event.id}
                  className={`relative flex flex-col md:flex-row items-start md:items-center w-full ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Timeline Marker */}
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="absolute left-[24px] md:left-1/2 w-[18px] h-[18px] rounded-full bg-[#D7B56D] border-[2.5px] border-[#F8F2E8] shadow-[0_0_0_1.5px_#D7B56D] -translate-x-1/2 z-10 top-10 md:top-auto"
                  />

                  {/* Content Container (Half Width on Desktop) */}
                  <div className={`w-full pl-20 md:pl-0 md:w-1/2 flex flex-col ${isEven ? 'md:pr-16 md:items-end md:text-right' : 'md:pl-16 md:items-start md:text-left'} relative`}>
                    
                    {/* Faint Background Number */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 0.15, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5 }}
                      className={`absolute top-1/2 -translate-y-1/2 ${isEven ? 'md:-right-6 left-4 md:left-auto' : 'md:-left-6 left-4 md:left-auto'} text-[10rem] md:text-[14rem] font-serif font-light italic text-[#DED2C1] leading-none pointer-events-none select-none z-0`}
                    >
                      0{index + 1}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-10%" }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="relative z-10 w-full"
                    >
                      {/* Time */}
                      {timeData && (
                        <div className={`flex items-baseline gap-2 mb-4 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                          <span className="font-serif italic text-5xl md:text-[4rem] leading-none text-[#b58b3c]">
                            {timeData.time}
                          </span>
                          <span className="font-serif text-sm md:text-base text-[#b58b3c] uppercase font-semibold">
                            {timeData.period}
                          </span>
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="font-serif text-xl md:text-[1.75rem] uppercase tracking-widest text-[#10233B] mb-8 font-normal">
                        {event.title}
                      </h3>

                      {/* Venue & Location */}
                      <div className="space-y-1 mb-8">
                        <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-[#10233B]">
                          {event.venue?.name || "Venue TBA"}
                        </p>
                        <p className="font-sans text-xs md:text-sm text-[#8A8379]">
                          {event.venue?.address || "Location TBA"}
                        </p>
                      </div>

                      {/* Action Link */}
                      {event.venue?.googleMapsUrl && (
                        <div className={`flex ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                          <a 
                            href={event.venue.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex flex-col gap-1.5 items-start cursor-pointer"
                          >
                            <span className="flex items-center gap-3 font-sans text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold text-[#b58b3c] transition-transform group-hover:translate-x-1 duration-300">
                              VIEW MAP
                              <span className="text-lg leading-none mb-0.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">↗</span>
                            </span>
                            <span className="h-[1px] w-full bg-[#D7B56D]/50 group-hover:bg-[#D7B56D] transition-colors duration-300" />
                          </a>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const milestones = [
  {
    year: "2024",
    title: "First Hello",
    description: "Two souls crossed paths and a beautiful friendship was born — one that would quietly grow into something extraordinary.",
    image: "/first_hello.jpg"
  },
  {
    year: "2026",
    title: "The Engagement",
    description: "An intimate moment, a forever promise. The beginning of a journey we knew we would walk together.",
    image: "/engagement.jpg"
  },
  {
    year: "2026",
    title: "Forever Begins",
    description: "Surrounded by those we love most, we celebrate the start of our greatest chapter yet.",
    image: "/forever_begins.jpg"
  },
];

export function OurStory({
  story1Url = "/first_hello.jpg",
  story2Url = "/engagement.jpg",
  story3Url = "/forever_begins.jpg",
}: {
  story1Url?: string;
  story2Url?: string;
  story3Url?: string;
}) {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  
  const yImage1 = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const yImage2 = useTransform(scrollYProgress, [0, 1], ["15%", "-15%"]);

  // Override images dynamically
  const displayMilestones = milestones.map((m, i) => {
    if (i === 0) return { ...m, image: story1Url };
    if (i === 1) return { ...m, image: story2Url };
    if (i === 2) return { ...m, image: story3Url };
    return m;
  });

  return (
    <section id="story" ref={containerRef} className="py-24 md:py-48 bg-background relative z-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Editorial Header */}
        <div className="mb-24 md:mb-48 text-center md:text-left">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-[10px] uppercase tracking-[0.4em] text-foreground/50 mb-6 font-medium"
          >
            The Journey
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-[8rem] font-serif text-foreground font-light tracking-tight leading-[0.9]"
          >
            How it <br className="hidden md:block" />
            <span className="italic text-secondary">began.</span>
          </motion.h2>
        </div>

        {/* Milestones */}
        <div className="space-y-32 md:space-y-48">
          {displayMilestones.map((milestone, i) => {
            const isEven = i % 2 === 0;
            const yTransform = isEven ? yImage1 : yImage2;
            const numberString = `0${i + 1}`;

            return (
              <div 
                key={milestone.title} 
                className={`relative flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-24 items-center md:items-start group`}
              >
                {/* Image Side */}
                <div className="w-full md:w-1/2 flex justify-center md:block">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className={`relative overflow-hidden w-[90%] md:w-full ${isEven ? 'aspect-[3/4]' : 'aspect-[4/5] md:mt-24'} bg-foreground/5 shadow-2xl`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                      style={{ backgroundImage: `url(${milestone.image})`, y: yTransform }}
                    />
                  </motion.div>
                </div>

                {/* Text Side */}
                <div className={`w-full md:w-1/2 flex flex-col ${isEven ? 'md:pl-12' : 'md:pr-12 md:text-right md:items-end'} z-10 text-center md:text-left`}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="text-secondary/60 font-serif italic text-4xl md:text-5xl block mb-2">
                      {numberString}
                    </span>
                    <h3 className="text-6xl md:text-8xl lg:text-[7rem] font-serif text-foreground/10 leading-none tracking-tighter mb-4">
                      {milestone.year}
                    </h3>
                    <h4 className="text-2xl md:text-4xl font-serif text-foreground mb-6 uppercase tracking-widest text-[1rem] md:text-2xl">
                      {milestone.title}
                    </h4>
                    
                    {/* Thin elegant separator */}
                    <div className={`w-12 h-[1px] bg-secondary/50 mb-8 mx-auto md:mx-0 ${isEven ? '' : 'md:ml-auto'}`} />
                    
                    <p className="text-foreground/70 font-sans leading-relaxed text-sm md:text-base max-w-sm mx-auto md:mx-0">
                      {milestone.description}
                    </p>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

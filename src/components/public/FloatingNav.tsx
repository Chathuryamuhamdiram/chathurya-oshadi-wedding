"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, BookHeart, CalendarHeart, Image as ImageIcon, MessageSquareHeart } from "lucide-react";

const NAV_ITEMS = [
  { id: "hero", label: "Home", icon: Home },
  { id: "story", label: "Our Story", icon: BookHeart },
  { id: "schedule", label: "Itinerary", icon: CalendarHeart },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "guestbook", label: "Wishes", icon: MessageSquareHeart },
];

export function FloatingNav() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -50% 0px", // triggers when element is roughly in middle of screen
      threshold: 0,
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    NAV_ITEMS.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-[520px]">
      <motion.nav
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#FFFDF8] rounded-full px-2 md:px-4 py-3 flex items-center justify-between shadow-2xl border border-[#10233B]/10 relative"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="relative flex flex-col items-center justify-center w-16 h-12 outline-none tap-highlight-transparent group"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active-circle"
                  className="absolute -top-6 w-14 h-14 bg-[#10233B] rounded-full shadow-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              
              <span className={`relative z-10 transition-transform duration-300 ${isActive ? '-translate-y-4' : 'translate-y-0 group-hover:-translate-y-1'}`}>
                <Icon
                  size={20}
                  color={isActive ? "#F4DDA8" : "#817B73"}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="transition-colors duration-300"
                />
              </span>
              
              <span 
                className={`absolute bottom-0 text-[9px] md:text-[10px] font-sans font-medium uppercase tracking-wider transition-all duration-300 ${
                  isActive ? 'opacity-100 text-[#10233B]' : 'opacity-0 text-[#817B73] translate-y-2'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
}

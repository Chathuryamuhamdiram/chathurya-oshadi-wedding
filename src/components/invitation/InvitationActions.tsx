"use client";

import { motion } from "framer-motion";

interface InvitationActionsProps {
  token: string;
}

export function InvitationActions({ token }: InvitationActionsProps) {
  const addToCalendar = () => {
    // Google Calendar deep link
    const title = encodeURIComponent("Chathurya & Oshadi Wedding");
    const details = encodeURIComponent("Join us for the wedding celebration at Hikkaduwa, Sri Lanka!");
    const location = encodeURIComponent("Hotel River Park, Hikkaduwa, Sri Lanka");
    const start = "20261008T085000";
    const end = "20261008T200000";
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}&sf=true&output=xml`;
    window.open(url, "_blank");
  };

  const scrollToGuestbook = () => {
    const el = document.getElementById("guestbook-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else window.location.href = "/#guestbook";
  };

  const actions = [
    {
      id: "calendar",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      label: "Add to Calendar",
      onClick: addToCalendar,
      href: undefined,
    },
    {
      id: "map",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
          <line x1="9" y1="3" x2="9" y2="18"/>
          <line x1="15" y1="6" x2="15" y2="21"/>
        </svg>
      ),
      label: "Location Map",
      href: "https://maps.google.com/?q=Hotel+Grand+Palace+Hikkaduwa",
      onClick: undefined,
    },
    {
      id: "contact",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.13 1 .42 1.97.81 2.9a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1-1.06a2 2 0 0 1 2.11-.45c.93.39 1.9.68 2.9.81A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
      label: "Contact Us",
      href: "tel:+94714609001",
      onClick: undefined,
    },
    {
      id: "guestbook",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      label: "Leave Your Wishes",
      onClick: scrollToGuestbook,
      href: undefined,
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-5">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#c9a84c]/50 font-sans">Wedding Details</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, i) => {
          const classes =
            "flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#c9a84c]/30 text-white/60 hover:text-white transition-all duration-200 text-center group";

          const content = (
            <>
              <span className="text-[#c9a84c]/70 group-hover:text-[#c9a84c] transition-colors">
                {action.icon}
              </span>
              <span className="text-[10px] uppercase tracking-widest font-sans">{action.label}</span>
            </>
          );

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
            >
              {action.href ? (
                <a href={action.href} target="_blank" rel="noopener noreferrer" className={classes}>
                  {content}
                </a>
              ) : (
                <button type="button" onClick={action.onClick} className={classes + " w-full"}>
                  {content}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

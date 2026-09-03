"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PassportCover } from "@/components/invitation/PassportCover";
import PassportInvitation from "@/components/invitation/PassportInvitation";

interface Venue {
  name: string;
  address?: string | null;
  googleMapsUrl?: string | null;
}

interface InvitationClientProps {
  guest: {
    invitationCode: string;
    displayName: string;
    invitationType: string;
    allowedGuestCount: number;
    confirmedGuestCount: number;
    rsvpStatus: string;
  };
  poruwVenue: Venue | null;
  mainVenue: Venue | null;
  poruwaTime?: string | null;
  mainTime?: string | null;
  sealUrl?: string;
}

export function InvitationClient({ guest, poruwVenue, mainVenue, poruwaTime, mainTime, sealUrl }: InvitationClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Store the invitation code so the public site's RSVP button can smart-redirect back here
  useEffect(() => {
    if (guest?.invitationCode) {
      sessionStorage.setItem("weddingInvitationCode", guest.invitationCode);
    }
  }, [guest?.invitationCode]);

  const handleDownloadCalendar = () => {
    const title = "Wedding of Oshadi & Chathurya";
    const details = "Join us to celebrate our love!";
    const location = mainVenue?.name || "Hikkaduwa, Sri Lanka";
    // Format for Google Calendar: YYYYMMDDTHHMMSSZ
    // The dates should be in UTC. 08:50 AM SLST (UTC+5:30) is 03:20 AM UTC.
    // We can just omit the 'Z' and let it use local time if we want, but better to be precise.
    const startTime = "20261008T085000"; // Local time, omit Z
    const endTime = "20261008T235900";   // Local time, omit Z

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;

    window.open(googleCalendarUrl, "_blank");
  };

  const handleNavigateToMaps = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <>
      {/* Passport Cover — full-screen overlay until opened */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="passport-cover"
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <PassportCover onOpen={() => setIsOpen(true)} sealUrl={sealUrl} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main invitation content — revealed after opening */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="invitation-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="min-h-screen"
            style={{ background: "#eee7db" }} // Cream background matches PassportInvitation
          >
            <PassportInvitation
              guest={guest}
              poruwVenue={poruwVenue}
              mainVenue={mainVenue}
              poruwaTime={poruwaTime}
              mainTime={mainTime}
              onDownloadCalendar={handleDownloadCalendar}
              onNavigateToMaps={handleNavigateToMaps}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import Link from "next/link";
import {
  CalendarDays,
  Camera,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
  BookHeart,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RSVPSection } from "./RSVPSection";

type Venue = {
  name: string;
  address?: string | null;
  googleMapsUrl?: string | null;
};

type PassportInvitationProps = {
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
  coupleImage?: string;
  onNavigateToMaps: (url: string) => void;
  onDownloadCalendar: () => void;
};

export default function PassportInvitation({
  guest,
  poruwVenue,
  mainVenue,
  coupleImage = "/images/couple.jpg", // We'll just use a placeholder image path
  onNavigateToMaps,
  onDownloadCalendar,
}: PassportInvitationProps) {
  const [activeSection, setActiveSection] = useState<"RSVP" | "PORUWA_MAP" | "MAIN_MAP" | null>(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  const getMapUrl = (venue: Venue | null): string => {
    if (!venue) return "https://maps.google.com";
    if (venue.googleMapsUrl) return venue.googleMapsUrl;
    const query = venue.name + (venue.address ? ` ${venue.address}` : "");
    return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
  };

  const getEmbedUrl = (venue: Venue | null): string | undefined => {
    if (!venue) return undefined;
    const query = venue.name + (venue.address ? ` ${venue.address}` : "");
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&q=${encodeURIComponent(query)}`;
  };

  return (
    <main className="min-h-screen bg-[#eee7db] px-3 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-[1500px]">

        {/* =====================================================
            PASSPORT
        ====================================================== */}
        <section className="relative overflow-hidden rounded-[30px] shadow-[0_25px_65px_rgba(20,25,35,0.22)]">

          <div className="grid min-h-[690px] grid-cols-1 lg:grid-cols-[34%_33%_33%]">

            {/* ================= PASSPORT COVER ================= */}
            <div className="relative flex flex-col items-center justify-between bg-[#10233b] px-8 py-12 text-center text-[#d7b56d]">

              {/* Texture */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px,#fff 1px,transparent 0)",
                  backgroundSize: "12px 12px",
                }}
              />

              <div className="relative z-10">
                <p className="mb-5 tracking-[0.25em] text-sm font-semibold">
                  YOU ARE INVITED
                </p>

                <h1 className="font-serif text-5xl font-semibold leading-[0.95] tracking-wide md:text-6xl text-white">
                  WEDDING
                  <br />
                  PASSPORT
                </h1>
              </div>

              <div className="relative z-10 my-8 flex flex-col items-center">

                {/* World Symbol */}
                <div className="relative flex h-52 w-52 items-center justify-center rounded-full border-2 border-[#d7b56d]">
                  <div className="absolute inset-3 rounded-full border border-[#d7b56d]/70" />

                  <Plane
                    className="absolute -right-2 top-4 rotate-[25deg]"
                    size={36}
                    strokeWidth={1.5}
                  />

                  <span className="text-7xl">🌍</span>
                </div>

                <Heart
                  className="mt-4 fill-[#d7b56d]"
                  size={22}
                  strokeWidth={1}
                />
              </div>

              <div className="relative z-10">
                <h2 className="font-serif text-4xl italic leading-tight text-white">
                  Oshadi & Chathurya
                </h2>

                <p className="mx-auto mt-7 max-w-xs text-sm font-medium leading-7 tracking-[0.12em] text-[#d7b56d]">
                  TOGETHER WITH THEIR FAMILIES
                  <br />
                  INVITE YOU TO CELEBRATE THEIR LOVE
                </p>
                
                {/* Mobile Open Button */}
                <div className="mt-8 lg:hidden">
                  <button 
                    onClick={() => {
                      const el = document.getElementById("couple-page");
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-2 border border-[#d7b56d] rounded-full text-xs font-semibold tracking-widest hover:bg-[#d7b56d] hover:text-[#10233b] transition"
                  >
                    OPEN OUR JOURNEY
                  </button>
                </div>

                <div className="mt-8 text-3xl hidden lg:block">▣</div>
              </div>
            </div>

            {/* ================= CENTER PAGE ================= */}
            <div id="couple-page" className="relative flex flex-col items-center bg-[#f8f2e8] px-7 py-10 text-center md:px-12">

              <PaperTexture />

              <div className="relative z-10 flex h-full flex-col items-center">
                <p className="tracking-[0.18em] text-[#24364a]">
                  LOVE DESTINATION
                </p>

                <p className="mt-5 font-serif text-4xl italic text-[#c39d58]">
                  The Wedding of
                </p>

                {/* Couple photo */}
                <div className="relative mt-7 h-60 w-60 rounded-full border border-[#d6b66e] p-2">
                  <div className="h-full w-full overflow-hidden rounded-full border border-[#d6b66e]/60 bg-[#eee7db] flex items-center justify-center">
                    <img
                      src={coupleImage}
                      alt="Oshadi and Chathurya"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                         // Fallback if image fails to load
                         (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 24 24" stroke="%23c39d58" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
                         (e.target as HTMLImageElement).className = "h-1/2 w-1/2 object-contain opacity-20";
                      }}
                    />
                  </div>
                </div>

                <h2 className="mt-7 font-serif text-[54px] italic leading-[0.95] text-[#17243b]">
                  Oshadi
                  <span className="block text-4xl">&</span>
                  Chathurya
                </h2>

                <p className="mt-7 tracking-[0.13em] text-[#25364a]">
                  OCTOBER 08, 2026
                </p>

                {/* Passport stamp */}
                <div className="absolute bottom-5 right-2 rotate-[-10deg] rounded-full border-2 border-[#c9a868]/40 p-5 text-xs tracking-[0.15em] text-[#c9a868]/60">
                  FOREVER
                  <Heart className="mx-auto my-1" size={24} />
                  LOVE
                </div>
              </div>
            </div>

            {/* ================= RIGHT PAGE ================= */}
            <div className="relative bg-[#f8f2e8] px-8 py-10 md:px-12 border-t lg:border-t-0 lg:border-l border-[#c4b9a6]/30">

              <PaperTexture />

              <div className="relative z-10">
                <h3 className="font-serif text-2xl font-bold tracking-[0.06em] text-[#17243b]">
                  WEDDING PASSPORT
                </h3>

                <DetailBlock label="DATE">
                  08 OCTOBER 2026
                </DetailBlock>

                <DetailBlock label="DESTINATION">
                  HIKKADUWA, SRI LANKA
                </DetailBlock>

                <DetailBlock label="PORUWA CEREMONY">
                  {poruwVenue?.name || "HOTEL RIVER PARK"}
                  <br />
                  08:50 AM
                </DetailBlock>

                <DetailBlock label="MAIN FUNCTION">
                  {mainVenue?.name || "HOTEL GRAND PALACE"}
                  <br />
                  HIKKADUWA
                </DetailBlock>

                <div className="mt-14 text-center font-serif text-3xl italic leading-10 text-[#bd9655]">
                  “A journey of love,
                  <br />
                  a lifetime together.”
                </div>

                <Heart
                  className="mx-auto mt-7 text-[#c6a25e]"
                  size={32}
                  strokeWidth={1.2}
                />

                {/* subtle decorative illustration */}
                <div className="pointer-events-none absolute bottom-2 right-2 text-8xl opacity-[0.08]">
                  ♡
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            BOARDING PASS
        ====================================================== */}
        <section className="mt-9 overflow-hidden rounded-[30px] shadow-[0_20px_55px_rgba(20,25,35,0.17)]">

          <div className="grid min-h-[330px] grid-cols-1 bg-[#f8f2e8] lg:grid-cols-[19%_56%_25%]">

            {/* Boarding pass left */}
            <div className="relative flex flex-col items-center justify-between bg-[#10233b] px-5 py-9 text-center text-[#d7b56d]">

              <p className="font-serif text-lg font-semibold leading-7 tracking-[0.1em] text-white">
                LOVE IS
                <br />
                THE GREATEST
                <br />
                ADVENTURE
              </p>

              <div className="relative my-6">
                <Plane size={38} />

                <div className="absolute -left-10 top-8 h-20 w-20 rounded-full border border-dashed border-[#d7b56d]" />
              </div>

              <p className="text-sm leading-6 tracking-[0.09em] text-white">
                THANK YOU FOR
                <br />
                BEING PART OF
                <br />
                OUR SPECIAL DAY!
              </p>

              <Heart size={17} fill="currentColor" />
            </div>

            {/* Boarding pass main */}
            <div className="relative lg:border-r border-dashed border-[#9c8f78]/40 px-7 py-8 md:px-10">

              <PaperTexture />

              <div className="relative z-10">
                <div className="mb-7 flex items-center justify-between">
                  <h3 className="font-serif text-2xl font-bold tracking-[0.05em] text-[#1a2a40]">
                    BOARDING PASS TO OUR WEDDING
                  </h3>

                  <Plane
                    size={28}
                    className="text-[#c4a25e] hidden sm:block"
                    fill="currentColor"
                  />
                </div>

                <div className="grid gap-7 md:grid-cols-2">

                  <div>
                    <PassField
                      label="PASSENGER"
                      value={guest.displayName}
                      script
                    />

                    <PassField
                      label="DATE"
                      value="08 OCTOBER 2026"
                    />

                    <PassField
                      label="DESTINATION"
                      value="A LIFETIME OF LOVE & HAPPINESS"
                    />

                    <PassField
                      label="INVITED GUESTS"
                      value={`UP TO ${guest.allowedGuestCount} GUEST${
                        guest.allowedGuestCount > 1 ? "S" : ""
                      }`}
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <div className="grid grid-cols-3 gap-4 border-t border-[#bcb19f]/60 pt-7">
                      <MiniPassField label="FLIGHT" value="CO081026" />
                      <MiniPassField label="GATE" value="LOVE" />
                      <MiniPassField label="SEAT" value="FOREVER" />
                    </div>
                  </div>
                </div>

                <div className="mt-7 border-t border-[#c4b9a6]/50 pt-5 text-center text-xs font-semibold tracking-[0.13em] text-[#b18e50]">
                  EXPLORE OUR FULL WEDDING STORY
                </div>

                {/* Visit wedding website */}
                <div className="mt-5 flex justify-center">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full border border-[#c4a25e]/50 px-6 py-2 text-[10px] uppercase font-sans font-bold tracking-[0.22em] text-[#10233b] hover:bg-[#10233b] hover:text-[#d7b56d] hover:border-[#10233b] transition-all duration-300"
                  >
                    <Heart size={11} className="text-[#c4a25e]" />
                    Visit Wedding Website
                  </Link>
                </div>
              </div>
            </div>

            {/* RSVP / Contact */}
            <div className="relative px-7 py-8 bg-[#f8f2e8]">
              <PaperTexture />

              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <h3 className="font-serif text-2xl font-bold tracking-[0.08em] text-[#213247]">
                    RSVP
                  </h3>
                  <Heart
                    size={17}
                    fill="#c4a25e"
                    className="text-[#c4a25e]"
                  />
                </div>

                <p className="mt-7 text-sm font-medium leading-6 tracking-[0.06em] text-[#24364a]">
                  KINDLY RSVP BEFORE
                  <br />
                  08 SEPTEMBER 2026
                </p>

                <div className="mt-7 space-y-5">
                  <a href="https://wa.me/94786761770" target="_blank" rel="noopener noreferrer" className="block">
                    <Contact
                      name="Oshadi"
                      number="078 676 1770"
                    />
                  </a>
                  <a href="https://wa.me/94714609001" target="_blank" rel="noopener noreferrer" className="block">
                    <Contact
                      name="Chathurya"
                      number="071 460 9001"
                    />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSection(activeSection === "RSVP" ? null : "RSVP")}
                  className="mt-8 w-full rounded-xl bg-[#10233b] px-5 py-4 text-sm font-semibold tracking-[0.1em] text-[#f3d79c] transition hover:-translate-y-0.5 hover:bg-[#172e4c]"
                >
                  {guest.rsvpStatus === "PENDING" || guest.rsvpStatus === "RSVP_PENDING" ? "CONFIRM YOUR SEAT" : "UPDATE YOUR RSVP"}
                </button>
                
                {guest.rsvpStatus !== "PENDING" && guest.rsvpStatus !== "RSVP_PENDING" && (
                   <p className="text-center mt-3 text-xs tracking-widest text-[#24364a] font-semibold">
                      STATUS: {guest.rsvpStatus.replace("_", " ")}
                   </p>
                )}

                {/* Decorative barcode – NOT QR */}
                <div className="mt-8 flex h-10 items-stretch gap-[3px] opacity-70">
                  {[2, 5, 2, 3, 6, 2, 4, 2, 7, 3, 2, 6, 3, 2, 5].map(
                    (width, index) => (
                      <span
                        key={index}
                        className="block bg-[#19293b]"
                        style={{ width }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* =====================================================
            RSVP / MAP INLINE SECTIONS
        ====================================================== */}
        <AnimatePresence mode="wait">
          {activeSection === "RSVP" && (
            <motion.section 
              key="rsvp-section"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 36 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden rounded-[30px] shadow-[0_20px_55px_rgba(0,0,0,0.4)] bg-[#111111] relative"
            >
              {/* Subtle dot texture background */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, #c9a84c 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              
              <div className="relative z-10 px-7 py-10 md:px-12">
                <div className="flex justify-end mb-2">
                  <button 
                    onClick={() => setActiveSection(null)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white/50 hover:text-white" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <RSVPSection
                  invitationCode={guest.invitationCode}
                  guestName={guest.displayName}
                  allowedGuestCount={guest.allowedGuestCount}
                  currentRsvpStatus={guest.rsvpStatus}
                  currentConfirmedCount={guest.confirmedGuestCount}
                  invitationType={guest.invitationType as any}
                />
              </div>
            </motion.section>
          )}

          {activeSection === "PORUWA_MAP" && (
            <motion.section 
              key="poruwa-map-section"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 36 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden rounded-[30px] shadow-[0_20px_55px_rgba(20,25,35,0.17)] bg-white"
            >
              <div className="flex justify-between items-center p-6 md:px-12 border-b border-gray-100">
                <h3 className="font-serif text-2xl font-bold tracking-[0.05em] text-[#1a2a40]">
                  Location: Poruwa Ceremony
                </h3>
                <button onClick={() => setActiveSection(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <MapPanel venue={poruwVenue} getMapUrl={getMapUrl} />
            </motion.section>
          )}

          {activeSection === "MAIN_MAP" && (
            <motion.section 
              key="main-map-section"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 36 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden rounded-[30px] shadow-[0_20px_55px_rgba(20,25,35,0.17)] bg-white"
            >
              <div className="flex justify-between items-center p-6 md:px-12 border-b border-gray-100">
                <h3 className="font-serif text-2xl font-bold tracking-[0.05em] text-[#1a2a40]">
                  Location: Main Event
                </h3>
                <button onClick={() => setActiveSection(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <MapPanel venue={mainVenue} getMapUrl={getMapUrl} />
            </motion.section>
          )}
        </AnimatePresence>

        {/* =====================================================
            ACTION BAR
        ====================================================== */}
        <section className="mt-8 rounded-[20px] bg-[#fbf7ef] px-4 py-5 shadow-lg border border-[#c3a367]/20">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">

            <div onClick={() => setActiveSection(activeSection === "RSVP" ? null : "RSVP")} className="cursor-pointer">
              <ActionItem icon={<BookHeart />} label="RSVP" />
            </div>

            <div onClick={onDownloadCalendar} className="cursor-pointer">
              <ActionItem icon={<CalendarDays />} label="ADD TO CALENDAR" />
            </div>

            <div onClick={() => setActiveSection(activeSection === "PORUWA_MAP" ? null : "PORUWA_MAP")} className="cursor-pointer">
              <ActionItem icon={<MapPin />} label="PORUWA MAP" />
            </div>

            <div onClick={() => setActiveSection(activeSection === "MAIN_MAP" ? null : "MAIN_MAP")} className="cursor-pointer">
              <ActionItem icon={<MapPin />} label="MAIN EVENT MAP" />
            </div>

            <div onClick={() => setShowWhatsApp(!showWhatsApp)} className="cursor-pointer sm:col-span-1 md:col-span-1 col-span-2 sm:col-start-2 md:col-start-auto">
              <ActionItem icon={<Phone />} label="WHATSAPP US" />
            </div>

          </div>

          {/* WhatsApp contact picker */}
          <AnimatePresence>
            {showWhatsApp && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="border-t border-[#c3a367]/20 pt-5">
                  <p className="text-center text-[10px] uppercase tracking-[0.25em] text-[#9a8060] font-sans mb-4">
                    Choose who to contact
                  </p>
                  <div className="flex gap-3 justify-center">
                    <a
                      href="https://wa.me/94786761770"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 max-w-[200px] flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[#10233b] text-white hover:bg-[#172e4c] transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#d7b56d]/20 flex items-center justify-center shrink-0">
                        <Phone size={16} className="text-[#d7b56d]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif italic text-white text-sm leading-none">Oshadi</p>
                        <p className="text-[10px] text-[#d7b56d] mt-1 font-sans tracking-wide">078 676 1770</p>
                      </div>
                    </a>
                    <a
                      href="https://wa.me/94714609001"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 max-w-[200px] flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[#10233b] text-white hover:bg-[#172e4c] transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#d7b56d]/20 flex items-center justify-center shrink-0">
                        <Phone size={16} className="text-[#d7b56d]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif italic text-white text-sm leading-none">Chathurya</p>
                        <p className="text-[10px] text-[#d7b56d] mt-1 font-sans tracking-wide">071 460 9001</p>
                      </div>
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}

/* ===========================================================
   HELPER COMPONENTS
=========================================================== */

function PaperTexture() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px,#b8aa95 0.8px,transparent 0)",
          backgroundSize: "9px 9px",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(45deg,#b59b6b 1px,transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
    </>
  );
}

function DetailBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-7">
      <p className="text-xs font-semibold tracking-[0.12em] text-[#314258]">
        {label}
      </p>

      <div className="mt-2 text-lg font-medium leading-7 tracking-[0.04em] text-[#1d2b3d]">
        {children}
      </div>
    </div>
  );
}

function PassField({
  label,
  value,
  script = false,
}: {
  label: string;
  value: string;
  script?: boolean;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold tracking-[0.12em] text-[#35455a]">
        {label}
      </p>

      <p
        className={`mt-2 text-[#18283c] ${
          script
            ? "font-serif text-3xl italic"
            : "text-base font-medium tracking-[0.05em]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniPassField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.1em] text-[#526070]">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold tracking-[0.05em] text-[#17273a]">
        {value}
      </p>
    </div>
  );
}

function Contact({
  name,
  number,
}: {
  name: string;
  number: string;
}) {
  return (
    <div className="flex items-center gap-3 text-[#1c2d41] hover:text-[#c4a25e] transition-colors">
      <MessageCircle size={24} />

      <div>
        <p className="text-sm font-medium">{number}</p>
        <p className="font-serif italic">{name}</p>
      </div>
    </div>
  );
}

function ActionItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex flex-col xl:flex-row h-full min-h-[70px] w-full items-center justify-center gap-2 xl:gap-4 p-3 text-[#172a40] transition hover:bg-[#efe8dc] rounded-xl border border-transparent hover:border-[#c3a367]/20"
    >
      <span className="[&>svg]:h-5 [&>svg]:w-5 xl:[&>svg]:h-6 xl:[&>svg]:w-6 shrink-0 opacity-80">
        {icon}
      </span>

      <span className="text-center xl:text-left text-[10px] xl:text-xs font-semibold leading-snug tracking-[0.08em]">
        {label}
      </span>
    </button>
  );
}

// ─── Map Panel ────────────────────────────────────────────────────────────────

function MapPanel({
  venue,
  getMapUrl,
}: {
  venue: Venue | null;
  getMapUrl: (v: Venue | null) => string;
}) {
  if (!venue) {
    return (
      <div className="flex h-64 items-center justify-center bg-gray-50 text-gray-400 text-sm font-sans">
        Location details coming soon.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 px-6 pb-10 pt-6 bg-[#f9f6f0]">
      {/* Pin icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#10233b]">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#d7b56d]" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      </div>

      {/* Venue name & address */}
      <div className="text-center">
        <h4 className="font-serif text-xl font-bold text-[#10233b] mb-1">{venue.name}</h4>
        {venue.address && (
          <p className="text-sm text-[#9a8060] font-sans">{venue.address}</p>
        )}
      </div>

      {/* Decorative rule */}
      <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#d7b56d] to-transparent" />

      {/* Open in Google Maps button */}
      <a
        href={getMapUrl(venue)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2.5 rounded-full bg-[#10233b] px-8 py-3.5 text-[11px] uppercase font-sans font-bold tracking-[0.25em] text-white hover:bg-[#172e4c] transition-colors"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#d7b56d]" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        Open in Google Maps
      </a>

      <p className="text-[10px] uppercase tracking-[0.2em] text-[#9a8060] font-sans">
        Tap to get directions
      </p>
    </div>
  );
}

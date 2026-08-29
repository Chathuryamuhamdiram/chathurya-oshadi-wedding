"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RSVPModal } from "@/components/public/RSVPModal";
import { Menu, X } from "lucide-react";

import { EnvelopeWrapper } from "@/components/public/EnvelopeWrapper";
import { MusicPlayer } from "@/components/public/MusicPlayer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <EnvelopeWrapper>
      <div className="min-h-screen bg-background flex flex-col selection:bg-secondary/30 selection:text-primary">
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            scrolled
              ? "py-4 bg-background/90 backdrop-blur-xl border-b border-primary/10 shadow-sm"
              : "py-6 bg-gradient-to-b from-black/20 to-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            {/* Mobile Hamburger (left) */}
            <button 
              className={`md:hidden p-2 -ml-2 transition-colors ${scrolled ? "text-primary" : "text-white"}`}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            {/* Desktop Left nav */}
            <nav className="hidden md:flex items-center gap-8 w-1/3">
              <a href="#story" className={`text-xs uppercase tracking-widest transition-colors font-sans ${scrolled ? "text-primary/70 hover:text-primary" : "text-white/90 hover:text-white"}`}>Our Story</a>
              <a href="#events" className={`text-xs uppercase tracking-widest transition-colors font-sans ${scrolled ? "text-primary/70 hover:text-primary" : "text-white/90 hover:text-white"}`}>Events</a>
            </nav>

            {/* Center logo */}
            <div className="w-1/3 flex justify-center">
              <Link href="/" className={`text-xl md:text-2xl font-serif tracking-[0.1em] transition-colors ${scrolled ? "text-primary" : "text-white"}`}>
                C <span className="text-secondary italic mx-1">&</span> O
              </Link>
            </div>

            {/* Right side (Desktop Nav + Mobile/Desktop RSVP) */}
            <div className="flex items-center justify-end gap-8 w-1/3">
              <nav className="hidden md:flex items-center gap-8">
                <a href="#gallery" className={`text-xs uppercase tracking-widest transition-colors font-sans ${scrolled ? "text-primary/70 hover:text-primary" : "text-white/90 hover:text-white"}`}>Gallery</a>
              </nav>
              <button 
                onClick={() => setIsRsvpOpen(true)}
                className={`text-xs uppercase tracking-widest px-4 py-2 md:px-5 md:py-2.5 rounded-full transition-all font-sans cursor-pointer shadow-md whitespace-nowrap
                  ${scrolled 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20"}
                `}
              >
                RSVP
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col p-6 animate-in fade-in duration-300">
            <div className="flex justify-end">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-primary"
                aria-label="Close menu"
              >
                <X size={28} />
              </button>
            </div>
            <nav className="flex flex-col items-center justify-center flex-1 gap-10">
              <Link 
                href="#story" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xl uppercase tracking-widest text-primary font-serif"
              >
                Our Story
              </Link>
              <Link 
                href="#events" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xl uppercase tracking-widest text-primary font-serif"
              >
                Events
              </Link>
              <Link 
                href="#gallery" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xl uppercase tracking-widest text-primary font-serif"
              >
                Gallery
              </Link>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsRsvpOpen(true);
                }}
                className="mt-4 text-sm uppercase tracking-widest px-8 py-3 rounded-full transition-all font-sans cursor-pointer shadow-md bg-primary text-primary-foreground"
              >
                RSVP Now
              </button>
            </nav>
          </div>
        )}

        <main className="flex-1">
          {children}
        </main>

        <footer className="relative z-10 bg-primary pt-16 pb-32 text-center">
          <div className="max-w-xl mx-auto px-6">
            <h2 className="font-serif text-3xl md:text-4xl text-white tracking-widest mb-4">Chathurya <span className="text-secondary italic">&</span> Oshadi</h2>
            <p className="text-xs text-white/60 uppercase tracking-[0.3em] mb-8">08 · 10 · 2026 — Hikkaduwa, Sri Lanka</p>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <a href="https://wa.me/94714609001" target="_blank" rel="noreferrer" className="text-xs text-secondary border border-secondary/30 rounded-full px-6 py-2 hover:bg-secondary hover:text-primary transition-colors">
                Contact via WhatsApp
              </a>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-[10px] text-white/30 uppercase tracking-widest">#ChathuryaAndOshadi2026</p>
              <Link href="/login" className="text-[10px] text-white/20 hover:text-white/60 uppercase tracking-widest transition-colors">
                Admin Panel
              </Link>
            </div>
          </div>
        </footer>

        <RSVPModal isOpen={isRsvpOpen} onClose={() => setIsRsvpOpen(false)} />
        <MusicPlayer />
      </div>
    </EnvelopeWrapper>
  );
}

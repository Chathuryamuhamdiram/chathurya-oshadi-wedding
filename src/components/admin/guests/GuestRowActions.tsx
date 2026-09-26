"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MoreVertical, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import { GuestForm } from "@/app/admin/guests/GuestForm";
import { WhatsAppShareModal } from "@/app/admin/guests/WhatsAppShareModal";
import { DeleteGuestButton } from "@/app/admin/guests/DeleteGuestButton";

export function GuestRowActions({
  guest,
  canEditGuests,
  onUpdateRSVP,
  activeEventId,
  isAllEvents,
  onOptimisticDelete,
  onOptimisticRollback
}: {
  guest: any;
  canEditGuests: boolean;
  onUpdateRSVP: (guest: any) => void;
  activeEventId?: string | null;
  isAllEvents?: boolean;
  onOptimisticDelete: () => void;
  onOptimisticRollback: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${baseUrl}/invite/${guest.invitationCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-end gap-2" ref={dropdownRef}>
      <button
        onClick={() => onUpdateRSVP(guest)}
        disabled={!canEditGuests}
        className="text-xs font-medium bg-[#1e2333] hover:bg-white/10 text-[#d7b56d] border border-[#d7b56d]/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 shrink-0"
      >
        Update RSVP
      </button>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all shrink-0"
          title="More actions"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-[#1e2333] border border-white/10 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
            <Link
              href={`/invite/${guest.invitationCode}`}
              target="_blank"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors w-full text-left"
            >
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              Open Invitation
            </Link>
            
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors w-full text-left"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-emerald-400" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
            
            <div className="h-px bg-white/10 my-1 w-full"></div>
            
            <WhatsAppShareModal guest={guest} asMenuItem onAction={() => setIsOpen(false)} />
            
            <GuestForm existingGuest={guest} activeEventId={isAllEvents ? null : activeEventId} asMenuItem onAction={() => setIsOpen(false)} />
            
            <div className="h-px bg-white/10 my-1 w-full"></div>
            
            <DeleteGuestButton 
              guest={{ id: guest.id, displayName: guest.displayName }} 
              onOptimisticDelete={onOptimisticDelete}
              onOptimisticRollback={onOptimisticRollback}
              asMenuItem
              onAction={() => setIsOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

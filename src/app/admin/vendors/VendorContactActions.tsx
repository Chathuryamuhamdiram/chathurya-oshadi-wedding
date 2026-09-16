"use client";

import { Phone, MessageCircle } from "lucide-react";
import { normalizeForWhatsApp } from "@/lib/utils/phone";

interface VendorContactActionsProps {
  phoneNumber: string;
  vendorName: string;
  contactName?: string | null;
  label?: "Primary" | "Secondary";
  eventName?: string | null;
}

export function VendorContactActions({ 
  phoneNumber, 
  vendorName, 
  contactName, 
  label,
  eventName 
}: VendorContactActionsProps) {
  
  if (!phoneNumber) return null;

  const normalizedWhatsApp = normalizeForWhatsApp(phoneNumber);
  
  // Construct prefilled WhatsApp message
  const nameToAddress = contactName ? contactName.split(' ')[0] : null;
  const eventText = eventName ? `${eventName} event` : "wedding event";
  const message = `Hi ${nameToAddress || ""}${nameToAddress ? "," : ""}\n\nThis is Chathurya regarding ${vendorName} for our ${eventText}.\n\nThank you.`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex flex-col">
        {label && <span className="text-[10px] uppercase tracking-widest text-white/40">{label}</span>}
        <a 
          href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`} 
          className="text-white/90 font-medium text-sm hover:text-blue-400 transition-colors"
        >
          {phoneNumber}
        </a>
      </div>

      <div className="flex items-center gap-2 mt-1 sm:mt-0 sm:ml-2">
        <a 
          href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`}
          title="Call"
          className="flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px] rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors"
        >
          <Phone className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span className="sr-only">Call</span>
        </a>

        {normalizedWhatsApp && (
          <a
            href={`https://wa.me/${normalizedWhatsApp}?text=${encodeURIComponent(message.trim())}`}
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp"
            className="flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px] rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 transition-colors"
          >
            <MessageCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="sr-only">WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  );
}

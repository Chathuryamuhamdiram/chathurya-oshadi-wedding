"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Copy, Check, Share2, X, ExternalLink, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Guest {
  id: string;
  displayName: string;
  invitationType: string;
  allowedGuestCount: number;
  whatsappNumber: string | null;
  invitationCode: string;
}

interface WhatsAppShareModalProps {
  guest: Guest;
}

export function WhatsAppShareModal({ guest }: WhatsAppShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
    setMounted(true);
  }, []);

  const familyText = guest.invitationType === "FAMILY" ? "you and your family" : "you";
  const invitationLink = `${baseUrl}/invite/${guest.invitationCode}`;
  
  const messageText = `Dear ${guest.displayName},

With joyful hearts, we invite ${familyText} to celebrate our special day. 🧡
Your presence would mean the world to us.

Kindly view our invitation below:
${invitationLink}

With love,
Chathurya & Oshadi`;

  // Format number
  let whatsappLink = "";
  let formattedNumber = "";
  let hasValidNumber = false;
  
  if (guest.whatsappNumber) {
    const cleanNum = guest.whatsappNumber.replace(/[^0-9]/g, '');
    formattedNumber = cleanNum.startsWith('0') ? `94${cleanNum.slice(1)}` : cleanNum;
    if (formattedNumber.length >= 9) {
      hasValidNumber = true;
      whatsappLink = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(messageText)}`;
    }
  }

  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(messageText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(invitationLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wedding Invitation',
          text: messageText,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else if (hasValidNumber) {
      window.open(whatsappLink, '_blank');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all font-medium"
        title="Send Invitation"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span>Share</span>
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
              <motion.div
                initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Share Invitation</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar space-y-6">
                
                {/* Guest Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="text-xs text-white/40 mb-1 uppercase tracking-wider">Guest Name</div>
                    <div className="text-sm text-white font-medium truncate">{guest.displayName}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="text-xs text-white/40 mb-1 uppercase tracking-wider">Invitation Type</div>
                    <div className="text-sm text-white font-medium flex items-center gap-2">
                      {guest.invitationType === 'FAMILY' ? 'Family (Max ' + guest.allowedGuestCount + ')' : 'Individual'}
                    </div>
                  </div>
                </div>

                {/* Message Preview */}
                <div>
                  <div className="text-xs text-white/40 mb-2 uppercase tracking-wider font-semibold">Message Preview</div>
                  <div className="bg-[#10141f] rounded-xl p-4 border border-white/5 text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
                    {messageText}
                  </div>
                </div>

                {/* Phone Warning */}
                {!hasValidNumber && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div className="text-sm text-amber-400">
                      WhatsApp number is not available or invalid for this guest. You can still copy the message or link to share manually.
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-6 border-t border-white/5 bg-white/[0.02] flex flex-col gap-3">
                <a 
                  href={invitationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  PREVIEW INVITATION
                </a>

                <div className="flex gap-3">
                  <button
                    onClick={handleCopyMessage}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium border border-white/10 transition-colors"
                  >
                    {copiedMessage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copiedMessage ? "COPIED!" : "COPY MESSAGE"}
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium border border-white/10 transition-colors"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? "COPIED!" : "COPY LINK"}
                  </button>
                </div>

                <div className="flex gap-3">
                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <button
                      onClick={handleWebShare}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] text-sm font-medium border border-[#25D366]/30 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      NATIVE SHARE
                    </button>
                  )}
                  
                  {hasValidNumber && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#25D366]/90 text-white text-sm font-bold shadow-lg shadow-[#25D366]/20 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      SHARE VIA WHATSAPP
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  );
}

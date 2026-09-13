"use client";

import { useState } from "react";
import { Download, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type ExportModalProps = {
  activeEventId: string;
  isAllEvents: boolean;
  searchQuery: string;
  sideTab: string;
  rsvpFilter: string;
  sendFilter: string;
  sortBy: string;
  totalMatching: number;
  totalCapacity: number;
  eventName: string;
  canViewLiquor: boolean;
  canViewCodes: boolean;
};

export function GuestExportModal({
  activeEventId,
  isAllEvents,
  searchQuery,
  sideTab,
  rsvpFilter,
  sendFilter,
  sortBy,
  totalMatching,
  totalCapacity,
  eventName,
  canViewLiquor,
  canViewCodes,
}: ExportModalProps) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Column preferences
  const [columns, setColumns] = useState({
    includePhone: true,
    includeType: true,
    includeAllowed: true,
    includeConfirmed: true,
    includeRsvp: true,
    includeSend: true,
    includeLiquorCount: false,
    includeInvitationCode: false,
  });

  const handleToggle = (key: keyof typeof columns) => {
    setColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/guests/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeEventId,
          isAllEvents,
          searchQuery,
          sideTab,
          rsvpFilter,
          sendFilter,
          sortBy,
          columns
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Export failed");
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const filename = isAllEvents 
        ? "all-events-guest-list.pdf" 
        : `${eventName.toLowerCase().replace(/\s+/g, '-')}-${sideTab.toLowerCase()}-guests.pdf`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-medium px-4 py-3 rounded-lg transition-colors whitespace-nowrap">
          <Download className="w-4 h-4" />
          DOWNLOAD PDF
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#1e2333] border-white/10 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-emerald-400">Export Guest List</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Context Block */}
          <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-2 text-sm">
            <h4 className="text-white/60 uppercase text-xs tracking-wider mb-3">Current Export Context</h4>
            <div className="flex justify-between">
              <span className="text-white/50">Event:</span>
              <span className="font-medium">{eventName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Guest Side:</span>
              <span className="font-medium">{sideTab === "ALL" ? "Both" : sideTab === "BRIDE" ? "Bride" : "Groom"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">RSVP Filter:</span>
              <span className="font-medium">{rsvpFilter}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Search:</span>
              <span className="font-medium">{searchQuery || "None"}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-white/10 flex justify-between">
              <span className="text-white/50">Matching Invitations:</span>
              <span className="text-emerald-400 font-bold">{totalMatching}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Matching Guest Capacity:</span>
              <span className="text-emerald-400 font-bold">{totalCapacity}</span>
            </div>
          </div>

          {totalMatching === 0 ? (
            <div className="text-amber-400 text-sm text-center py-2 bg-amber-500/10 rounded-md border border-amber-500/20">
              No guests match the current filters. Clear filters to export.
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-white/60 uppercase text-xs tracking-wider">Export Options</h4>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={columns.includePhone} onChange={() => handleToggle('includePhone')} className="rounded border-white/20 bg-black/20 text-emerald-500 focus:ring-emerald-500/30" />
                  Include Phone Number
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={columns.includeType} onChange={() => handleToggle('includeType')} className="rounded border-white/20 bg-black/20 text-emerald-500 focus:ring-emerald-500/30" />
                  Include Invitation Type
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={columns.includeAllowed} onChange={() => handleToggle('includeAllowed')} className="rounded border-white/20 bg-black/20 text-emerald-500 focus:ring-emerald-500/30" />
                  Include Allowed Guests
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={columns.includeConfirmed} onChange={() => handleToggle('includeConfirmed')} className="rounded border-white/20 bg-black/20 text-emerald-500 focus:ring-emerald-500/30" />
                  Include Confirmed Guests
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={columns.includeRsvp} onChange={() => handleToggle('includeRsvp')} className="rounded border-white/20 bg-black/20 text-emerald-500 focus:ring-emerald-500/30" />
                  Include RSVP Status
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={columns.includeSend} onChange={() => handleToggle('includeSend')} className="rounded border-white/20 bg-black/20 text-emerald-500 focus:ring-emerald-500/30" />
                  Include Invitation Sent
                </label>
                
                {canViewLiquor && (
                  <label className="flex items-center gap-2 cursor-pointer text-amber-200">
                    <input type="checkbox" checked={columns.includeLiquorCount} onChange={() => handleToggle('includeLiquorCount')} className="rounded border-white/20 bg-black/20 text-emerald-500 focus:ring-emerald-500/30" />
                    Include Liquor Count
                  </label>
                )}
                {canViewCodes && (
                  <label className="flex items-center gap-2 cursor-pointer text-rose-200">
                    <input type="checkbox" checked={columns.includeInvitationCode} onChange={() => handleToggle('includeInvitationCode')} className="rounded border-white/20 bg-black/20 text-emerald-500 focus:ring-emerald-500/30" />
                    Include Invitation Code
                  </label>
                )}
              </div>
            </div>
          )}

          {error && <div className="text-red-400 text-sm">{error}</div>}
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || totalMatching === 0}
            className="px-4 py-2 text-sm bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isExporting ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

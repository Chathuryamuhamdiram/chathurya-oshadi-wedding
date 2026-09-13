"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ALL_EVENTS_VALUE } from "@/lib/event-constants";

export default function MenuExportModal({ 
  activeEventId,
  isAllEvents,
  menuTitle,
  eventName,
  canViewCosts
}: any) {
  const [open, setOpen] = useState(false);
  const [includeDescriptions, setIncludeDescriptions] = useState(true);
  const [includeSectionHeadings, setIncludeSectionHeadings] = useState(true);
  const [includeVenue, setIncludeVenue] = useState(true);
  const [includeCaterer, setIncludeCaterer] = useState(true);
  const [includeCosts, setIncludeCosts] = useState(false);
  const [includeInternalNotes, setIncludeInternalNotes] = useState(false);
  const [includeItemStatus, setIncludeItemStatus] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        eventId: activeEventId,
        includeDescriptions: includeDescriptions.toString(),
        includeSectionHeadings: includeSectionHeadings.toString(),
        includeVenue: includeVenue.toString(),
        includeCaterer: includeCaterer.toString(),
        includeCosts: includeCosts.toString(),
        includeInternalNotes: includeInternalNotes.toString(),
        includeItemStatus: includeItemStatus.toString(),
      });
      
      const response = await fetch(`/api/admin/food-menu/export-pdf?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${menuTitle ? menuTitle.toLowerCase().replace(/\s+/g, '-') : 'food-menu'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isAllEvents) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-medium px-4 py-2 h-10 rounded-lg transition-colors whitespace-nowrap">
        <Download className="w-4 h-4" />
        DOWNLOAD PDF
      </DialogTrigger>
      
      <DialogContent className="bg-[#1e2333] border border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            EXPORT FOOD MENU
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="bg-black/20 rounded-xl p-4 border border-white/5 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Event</span>
              <span className="text-sm font-medium text-emerald-400">{eventName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Menu</span>
              <span className="text-sm font-medium">{menuTitle}</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Include in PDF</p>
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" checked={includeDescriptions} onChange={(e) => setIncludeDescriptions(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded-md checked:bg-emerald-500 checked:border-emerald-500 transition-colors" />
                <div className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none text-white">✓</div>
              </div>
              <span className="text-sm text-white/80 group-hover:text-white transition-colors">Include Descriptions</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" checked={includeSectionHeadings} onChange={(e) => setIncludeSectionHeadings(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded-md checked:bg-emerald-500 checked:border-emerald-500 transition-colors" />
                <div className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none text-white">✓</div>
              </div>
              <span className="text-sm text-white/80 group-hover:text-white transition-colors">Include Section Headings</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" checked={includeVenue} onChange={(e) => setIncludeVenue(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded-md checked:bg-emerald-500 checked:border-emerald-500 transition-colors" />
                <div className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none text-white">✓</div>
              </div>
              <span className="text-sm text-white/80 group-hover:text-white transition-colors">Include Venue</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" checked={includeCaterer} onChange={(e) => setIncludeCaterer(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded-md checked:bg-emerald-500 checked:border-emerald-500 transition-colors" />
                <div className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none text-white">✓</div>
              </div>
              <span className="text-sm text-white/80 group-hover:text-white transition-colors">Include Caterer</span>
            </label>

            {canViewCosts && (
              <>
                <div className="h-px bg-white/10 my-3" />
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/70 mb-3">Internal Fields</p>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={includeCosts} onChange={(e) => setIncludeCosts(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded-md checked:bg-emerald-500 checked:border-emerald-500 transition-colors" />
                    <div className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none text-white">✓</div>
                  </div>
                  <span className="text-sm text-white/80 group-hover:text-white transition-colors">Include Costs</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={includeInternalNotes} onChange={(e) => setIncludeInternalNotes(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded-md checked:bg-emerald-500 checked:border-emerald-500 transition-colors" />
                    <div className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none text-white">✓</div>
                  </div>
                  <span className="text-sm text-white/80 group-hover:text-white transition-colors">Include Internal Notes</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={includeItemStatus} onChange={(e) => setIncludeItemStatus(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded-md checked:bg-emerald-500 checked:border-emerald-500 transition-colors" />
                    <div className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none text-white">✓</div>
                  </div>
                  <span className="text-sm text-white/80 group-hover:text-white transition-colors">Include Item Status</span>
                </label>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10 mt-6">
          <button 
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm text-white/60 hover:text-white font-medium transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isExporting ? "GENERATING..." : "DOWNLOAD PDF"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function MenuExportModal({ 
  activeEventId,
  isAllEvents,
  menuTitle,
  eventName
}: any) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        eventId: activeEventId
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
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Event</span>
              <span className="text-sm font-medium text-emerald-400">{eventName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Menu</span>
              <span className="text-sm font-medium">{menuTitle}</span>
            </div>
          </div>
          
          <p className="text-sm text-white/70">
            This will generate a clean, print-ready PDF containing your event's food menu sections and items.
          </p>
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

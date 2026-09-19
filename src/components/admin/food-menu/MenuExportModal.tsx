"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function MenuExportModal({ 
  activeEventId,
  isAllEvents,
  menuTitle,
  eventName,
  menu
}: any) {
  const [open, setOpen] = useState(false);

  const handleOpenPrintView = () => {
    if (!menu?.id) {
      alert("No menu selected.");
      return;
    }

    // Open the dedicated, clean print page in a new tab.
    // The page renders Sinhala using the browser's native HarfBuzz engine.
    // No canvas. No PDF library. No text splitting.
    // User clicks "Print / Save as PDF" in the print page toolbar.
    const printUrl = `/food-menu/print?menuId=${menu.id}`;
    window.open(printUrl, "_blank");
    setOpen(false);
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

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 text-xs text-white/60 space-y-1">
            <p>A print preview will open in a new tab.</p>
            <p>Click <strong className="text-white/80">&ldquo;Print / Save as PDF&rdquo;</strong> in that tab.</p>
            <p>In Chrome: choose <strong className="text-white/80">Save as PDF</strong> as the printer.</p>
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
            onClick={handleOpenPrintView}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            OPEN PRINT VIEW
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import jsPDF from "jspdf";

export default function MenuExportModal({ 
  activeEventId,
  isAllEvents,
  menuTitle,
  eventName,
  menu
}: any) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState("");

  const handleExport = async () => {
    if (!menu?.id) {
      alert("No menu selected.");
      return;
    }

    setIsExporting(true);
    setStatus("Opening print window…");

    // KEY INSIGHT: We set up the postMessage listener BEFORE opening the popup.
    // Then we open the popup SYNCHRONOUSLY (no await before window.open) so
    // popup blockers don't interfere.
    //
    // The popup loads our print HTML page with ?capture=true.
    // That page runs html2canvas INSIDE THE POPUP where Noto Sans Sinhala
    // is fully loaded in the popup's own font context.
    // This fixes the core issue: html2canvas previously used the parent
    // window's canvas context which defaulted to the Windows system Sinhala
    // font (Iskoola Pota) instead of Noto Sans Sinhala.

    const imageDataPromise = new Promise<string>((resolve, reject) => {
      const TIMEOUT_MS = 30000;
      const timer = setTimeout(() => {
        window.removeEventListener("message", handler);
        reject(new Error("PDF capture timed out after 30s. Please try again."));
      }, TIMEOUT_MS);

      const handler = (event: MessageEvent) => {
        // Only accept messages from our own origin
        if (event.origin !== window.location.origin) return;

        if (event.data?.type === "PDF_CANVAS_READY" && typeof event.data.imageData === "string") {
          clearTimeout(timer);
          window.removeEventListener("message", handler);
          resolve(event.data.imageData);
        }

        if (event.data?.type === "PDF_CANVAS_ERROR") {
          clearTimeout(timer);
          window.removeEventListener("message", handler);
          reject(new Error(event.data.error || "Capture failed in popup"));
        }
      };

      window.addEventListener("message", handler);
    });

    // Open popup SYNCHRONOUSLY — must be direct response to a user click
    const printUrl = `/api/admin/food-menu/print-html?menuId=${menu.id}&capture=true`;
    const popup = window.open(
      printUrl,
      "food-menu-pdf-capture",
      "width=860,height=1100,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no,resizable=yes"
    );

    if (!popup) {
      setIsExporting(false);
      setStatus("");
      alert(
        "⚠️ Popup was blocked by your browser.\n\n" +
        "Please click the popup blocker icon in your address bar and allow popups for this site, then try again."
      );
      return;
    }

    try {
      setStatus("Rendering Sinhala text in popup…");

      const imageData = await imageDataPromise;

      setStatus("Building PDF…");

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imageData);
      const imgHmm = (imgProps.height * pdfW) / imgProps.width;

      let remaining = imgHmm;
      let yPos = 0;

      pdf.addImage(imageData, "JPEG", 0, yPos, pdfW, imgHmm);
      remaining -= pdfH;

      while (remaining > 0) {
        yPos = remaining - imgHmm;
        pdf.addPage();
        pdf.addImage(imageData, "JPEG", 0, yPos, pdfW, imgHmm);
        remaining -= pdfH;
      }

      // Generate clean filename based on event name
      const safeEvent = (eventName || "Wedding")
        .toLowerCase()
        .replace(/[^a-z0-9\u0D80-\u0DFF]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
      const filename = `Chathurya_Oshadi_${safeEvent}_Food_Menu.pdf`;

      pdf.save(filename);
      setOpen(false);
    } catch (error: any) {
      console.error("[PDF Export]", error);
      alert(`PDF export failed: ${error.message}`);
    } finally {
      // Best-effort close the popup if it's still open
      try { if (popup && !popup.closed) popup.close(); } catch {}
      setIsExporting(false);
      setStatus("");
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

          {isExporting && status && (
            <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">
              <span className="inline-block animate-spin">⟳</span>
              <span>{status}</span>
            </div>
          )}

          {!isExporting && (
            <p className="text-sm text-white/60">
              A brief popup window will open to render the Sinhala text correctly, then close automatically.
              Please allow popups for this site if prompted.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10 mt-6">
          <button
            onClick={() => setOpen(false)}
            disabled={isExporting}
            className="px-4 py-2 text-sm text-white/60 hover:text-white font-medium transition-colors disabled:opacity-30"
          >
            CANCEL
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isExporting ? "GENERATING…" : "DOWNLOAD PDF"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
    setStatus("Opening print view…");

    try {
      // --- STEP 1: Create a hidden iframe pointing to our dedicated print HTML endpoint ---
      const iframe = document.createElement("iframe");
      iframe.style.cssText = [
        "position:fixed",
        "top:0",
        "left:0",
        "width:794px",
        "height:1200px",
        "border:none",
        "z-index:9999",
        "opacity:0",
        "pointer-events:none",
        "background:#fff"
      ].join(";");

      const printUrl = `/api/admin/food-menu/print-html?menuId=${menu.id}`;
      iframe.src = printUrl;
      document.body.appendChild(iframe);

      setStatus("Loading fonts & rendering Sinhala…");

      // --- STEP 2: Wait for iframe to fully load AND for fonts to be ready ---
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Print page timed out after 15s")), 15000);

        iframe.onload = async () => {
          try {
            const iWin = iframe.contentWindow as any;
            const iDoc = iframe.contentDocument as Document;

            // Wait for document.fonts.ready inside the iframe
            await iDoc.fonts.ready;

            // Give the browser an extra 500ms to fully paint ligatures
            await new Promise(r => setTimeout(r, 500));

            // Double-check font is actually loaded
            const fontLoaded = iDoc.fonts.check('14px "Noto Sans Sinhala"');
            console.log("[PDF Export] Noto Sans Sinhala loaded:", fontLoaded);

            clearTimeout(timeout);
            resolve();
          } catch(e) {
            clearTimeout(timeout);
            reject(e);
          }
        };

        iframe.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("Failed to load print page"));
        };
      });

      setStatus("Capturing render…");

      const iDoc = iframe.contentDocument as Document;
      const printRoot = iDoc.getElementById("print-root") || iDoc.body;

      // --- STEP 3: Capture the iframe's rendered DOM with html2canvas ---
      const canvas = await html2canvas(printRoot, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: true,
        width: printRoot.scrollWidth,
        height: printRoot.scrollHeight,
        windowWidth: 794,
        windowHeight: printRoot.scrollHeight,
        // Tell html2canvas to use the iframe's document, not the parent's
        foreignObjectRendering: false,
      });

      // Remove the iframe
      document.body.removeChild(iframe);

      console.log("[PDF Export] Canvas size:", canvas.width, "x", canvas.height);
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas captured 0x0 pixels — layout issue");
      }

      setStatus("Building PDF…");

      // --- STEP 4: Paginate the canvas into an A4 jsPDF ---
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgHmm = (imgProps.height * pdfW) / imgProps.width;

      let remaining = imgHmm;
      let yOffset = 0;

      pdf.addImage(imgData, "JPEG", 0, yOffset, pdfW, imgHmm);
      remaining -= pdfH;

      while (remaining > 0) {
        yOffset = remaining - imgHmm;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, yOffset, pdfW, imgHmm);
        remaining -= pdfH;
      }

      // --- STEP 5: Generate clean filename ---
      const safeEventName = (eventName || "Wedding")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_");
      const filename = `Chathurya_Oshadi_${safeEventName}_Food_Menu.pdf`;

      pdf.save(filename);
      setStatus("Done!");
      setOpen(false);
    } catch (error: any) {
      console.error("[PDF Export] Error:", error);
      alert(`PDF export failed: ${error.message || String(error)}`);
    } finally {
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
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <span className="animate-spin">⟳</span>
              <span>{status}</span>
            </div>
          )}

          <p className="text-sm text-white/70">
            Generates a PDF using your browser&apos;s native Sinhala text shaping engine.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10 mt-6">
          <button
            onClick={() => setOpen(false)}
            disabled={isExporting}
            className="px-4 py-2 text-sm text-white/60 hover:text-white font-medium transition-colors disabled:opacity-50"
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

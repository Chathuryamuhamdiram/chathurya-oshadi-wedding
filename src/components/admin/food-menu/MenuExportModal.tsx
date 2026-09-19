"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { notoSansSinhalaBase64 } from "@/lib/fonts/notoSansSinhalaBase64";
import html2canvas from "html2canvas";
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

  const handleExport = async () => {
    setIsExporting(true);

    // Build the print container imperatively and inject into document.body.
    // Positioning as `fixed` at top:0/left:0 with opacity:0 gives html2canvas
    // a real layout box to measure — unlike position:absolute top:-9999px
    // which causes html2canvas to capture 0x0 pixels.
    const container = document.createElement("div");
    container.style.cssText = [
      "position: fixed",
      "top: 0",
      "left: 0",
      "width: 794px",
      "padding: 40px",
      "box-sizing: border-box",
      "background: #ffffff",
      "color: #1F2937",
      `font-family: "Noto Sans Sinhala", "Noto Sans", sans-serif`,
      "line-height: 1.6",
      "letter-spacing: normal",
      "word-spacing: normal",
      "white-space: normal",
      "text-align: left",
      "word-break: normal",
      "overflow-wrap: normal",
      "z-index: -9999",
      "opacity: 0",
      "pointer-events: none"
    ].join(";");

    const sectionsHtml = (menu?.sections || []).map((section: any) => `
      <div style="margin-bottom:25px;">
        <h3 style="color:#10233B;font-size:14px;font-weight:bold;border-bottom:1px solid #E5E7EB;padding-bottom:5px;margin-bottom:10px;text-transform:uppercase;">
          ${section.title}
        </h3>
        ${section.items && section.items.length > 0
          ? `<ul style="list-style:none;padding:0;margin:0;">
              ${section.items.map((item: any) => `
                <li style="font-size:14px;padding:6px 0;border-bottom:1px solid #F3F4F6;letter-spacing:normal;word-spacing:normal;">
                  ${item.name}
                </li>
              `).join('')}
            </ul>`
          : `<p style="font-size:11px;font-style:italic;color:#9CA3AF;">No items in this section</p>`
        }
      </div>
    `).join('');

    container.innerHTML = `
      <style>
        @font-face {
          font-family: "Noto Sans Sinhala";
          src: url("data:font/truetype;charset=utf-8;base64,${notoSansSinhalaBase64}") format("truetype");
          font-weight: 400;
          font-style: normal;
        }
      </style>
      <div style="margin-bottom:30px;">
        <h1 style="color:#10233B;font-size:24px;font-weight:bold;margin:0 0 5px 0;">CHATHURYA &amp; OSHADI</h1>
        <h2 style="color:#D7B56D;font-size:16px;font-weight:normal;margin:0 0 20px 0;">FOOD MENU</h2>
        <div style="font-size:12px;color:#4B5563;">
          <p style="margin:2px 0;">Event: ${eventName || 'Unknown'}</p>
          <p style="margin:2px 0;">Generated: ${new Date().toLocaleDateString('en-GB')}</p>
          ${menu?.title ? `<p style="margin:2px 0;">Menu Title: ${menu.title}</p>` : ''}
          ${menu?.venue ? `<p style="margin:2px 0;">Venue: ${menu.venue}</p>` : ''}
          ${menu?.vendor?.vendorName ? `<p style="margin:2px 0;">Caterer: ${menu.vendor.vendorName}</p>` : ''}
        </div>
      </div>
      <div>${sectionsHtml}</div>
    `;

    document.body.appendChild(container);

    try {
      // Wait for fonts (including our base64 font) to finish loading
      await document.fonts.ready;
      // Two animation frames ensure paint is complete
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      // Extra 300ms buffer for Sinhala ligature composition
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: container.scrollWidth,
        height: container.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgHeightInMm = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeightInMm;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeightInMm);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeightInMm;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeightInMm);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${menuTitle ? menuTitle.toLowerCase().replace(/\s+/g, "-") : "food-menu"}.pdf`);
      setOpen(false);
    } catch (error: any) {
      console.error("Export Error:", error);
      alert(`Failed to export PDF: ${error.message || String(error)}`);
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
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
            This will generate the PDF natively using your browser&apos;s font shaping engine.
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

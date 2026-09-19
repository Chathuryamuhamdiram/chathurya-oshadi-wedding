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
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Dynamically import html2pdf so it doesn't break SSR
      const html2pdfModule = (await import('html2pdf.js')).default;
      
      const sectionsHtml = (menu?.sections || []).map((section: any) => `
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h3 style="color: #10233B; font-size: 14px; font-weight: bold; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase;">
            ${section.title}
          </h3>
          ${(section.items && section.items.length > 0) ? `
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${section.items.map((item: any) => `
                <li style="font-size: 12px; padding: 6px 0; border-bottom: 1px solid #F3F4F6; break-inside: avoid;">
                  ${item.name}
                </li>
              `).join('')}
            </ul>
          ` : `
            <p style="font-size: 11px; font-style: italic; color: #9CA3AF;">No items in this section</p>
          `}
        </div>
      `).join('');

      const htmlContent = `
        <div style="width: 794px; padding: 40px; background-color: white; color: #1F2937; font-family: 'Noto Sans Sinhala', sans-serif; line-height: 1.6;">
          <div style="margin-bottom: 30px;">
            <h1 style="color: #10233B; font-size: 24px; font-weight: bold; margin: 0 0 5px 0;">CHATHURYA & OSHADI</h1>
            <h2 style="color: #D7B56D; font-size: 16px; font-weight: normal; margin: 0 0 20px 0;">FOOD MENU</h2>
            
            <div style="font-size: 12px; color: #4B5563;">
              <p style="margin: 2px 0;">Event: ${eventName || 'Unknown'}</p>
              <p style="margin: 2px 0;">Generated: ${new Date().toLocaleDateString('en-GB')}</p>
              ${menu?.title ? `<p style="margin: 2px 0;">Menu Title: ${menu.title}</p>` : ''}
              ${menu?.venue ? `<p style="margin: 2px 0;">Venue: ${menu.venue}</p>` : ''}
              ${menu?.vendor?.vendorName ? `<p style="margin: 2px 0;">Caterer: ${menu.vendor.vendorName}</p>` : ''}
            </div>
          </div>
          <div>
            ${sectionsHtml}
          </div>
        </div>
      `;

      const opt = {
        margin:       10,
        filename:     `${menuTitle ? menuTitle.toLowerCase().replace(/\s+/g, '-') : 'food-menu'}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdfModule().set(opt).from(htmlContent).save();
      
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
            This will generate a perfectly shaped PDF natively in your browser using the Noto Sans Sinhala font.
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

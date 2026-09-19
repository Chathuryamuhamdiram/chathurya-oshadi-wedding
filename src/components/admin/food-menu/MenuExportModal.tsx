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

  const handleExport = () => {
    setIsExporting(true);
    try {
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
        <div style="max-width: 800px; margin: 0 auto; background-color: white; color: #1F2937; font-family: 'Noto Sans Sinhala', sans-serif; line-height: 1.6;">
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

      // Use a hidden iframe to leverage the browser's native print engine
      // This is the ONLY reliable way to perfectly shape Sinhala Unicode characters in PDFs!
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const contentWindow = iframe.contentWindow;
      if (!contentWindow) throw new Error("Print layout failed to initialize");

      const doc = contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${menuTitle ? menuTitle : 'Food Menu'}</title>
          <style>
            @font-face {
              font-family: 'Noto Sans Sinhala';
              src: url('/fonts/NotoSansSinhala-Regular.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
            }
            @media print {
              @page { margin: 15mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { 
              font-family: 'Noto Sans Sinhala', sans-serif;
              padding: 0;
              margin: 0;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `);
      doc.close();

      // Wait a moment for fonts and layouts to be completely parsed by the iframe
      setTimeout(() => {
        contentWindow.focus();
        contentWindow.print();
        
        // Clean up the iframe and close the dialog
        setTimeout(() => {
          document.body.removeChild(iframe);
          setOpen(false);
          setIsExporting(false);
        }, 500);
      }, 500);

    } catch (error) {
      console.error(error);
      alert("Failed to initiate PDF print dialog.");
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
            This will open your browser's native print dialog. 
            <strong className="text-white block mt-2">Please select "Save as PDF" as the destination.</strong>
            This is required to properly render Sinhala typography.
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
            {isExporting ? "PREPARING..." : "GENERATE PDF"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

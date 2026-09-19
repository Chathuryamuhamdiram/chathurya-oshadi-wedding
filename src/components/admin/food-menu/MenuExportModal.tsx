"use client";

import { useState, useRef } from "react";
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
  const printRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Dynamically import html2pdf so it doesn't break SSR
      const html2pdfModule = (await import('html2pdf.js')).default;
      
      const element = printRef.current;
      if (!element) throw new Error("Print layout not found");

      // Make it visible and reset position to 0,0 for html2canvas
      element.style.display = "block";
      element.style.left = "0px";
      element.style.top = "0px";
      
      // Yield to the browser to ensure layout and paint happen before capturing
      await new Promise(resolve => setTimeout(resolve, 50));

      const opt = {
        margin:       10,
        filename:     `${menuTitle ? menuTitle.toLowerCase().replace(/\s+/g, '-') : 'food-menu'}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdfModule().set(opt).from(element).save();

      // Restore styles
      element.style.display = "none";
      element.style.left = "-9999px";
      element.style.top = "-9999px";
      
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to export PDF.");
      if (printRef.current) printRef.current.style.display = "none";
    } finally {
      setIsExporting(false);
    }
  };

  if (isAllEvents) return null;

  return (
    <>
      {/* Hidden printable area */}
      <div 
        ref={printRef} 
        style={{ display: "none", position: "absolute", left: "-9999px", top: "-9999px", zIndex: -9999, width: "794px", backgroundColor: "white", color: "#1F2937", padding: "40px", fontFamily: "'Noto Sans Sinhala', sans-serif", lineHeight: "1.6" }}
      >
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ color: "#10233B", fontSize: "24px", fontWeight: "bold", margin: "0 0 5px 0" }}>CHATHURYA & OSHADI</h1>
          <h2 style={{ color: "#D7B56D", fontSize: "16px", fontWeight: "normal", margin: "0 0 20px 0" }}>FOOD MENU</h2>
          
          <div style={{ fontSize: "12px", color: "#4B5563" }}>
            <p style={{ margin: "2px 0" }}>Event: {eventName || 'Unknown'}</p>
            <p style={{ margin: "2px 0" }}>Generated: {new Date().toLocaleDateString('en-GB')}</p>
            {menu?.title && <p style={{ margin: "2px 0" }}>Menu Title: {menu.title}</p>}
            {menu?.venue && <p style={{ margin: "2px 0" }}>Venue: {menu.venue}</p>}
            {menu?.vendor && <p style={{ margin: "2px 0" }}>Caterer: {menu.vendor?.vendorName}</p>}
          </div>
        </div>

        <div>
          {menu?.sections?.map((section: any, idx: number) => (
            <div key={section.id} style={{ marginBottom: "25px", pageBreakInside: "avoid" }}>
              <h3 style={{ color: "#10233B", fontSize: "14px", fontWeight: "bold", borderBottom: "1px solid #E5E7EB", paddingBottom: "5px", marginBottom: "10px", textTransform: "uppercase" }}>
                {section.title}
              </h3>
              {section.items?.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {section.items.map((item: any) => (
                    <li key={item.id} style={{ fontSize: "12px", padding: "6px 0", borderBottom: "1px solid #F3F4F6", breakInside: "avoid" }}>
                      {item.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: "11px", fontStyle: "italic", color: "#9CA3AF" }}>No items in this section</p>
              )}
            </div>
          ))}
        </div>
      </div>

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
    </>
  );
}

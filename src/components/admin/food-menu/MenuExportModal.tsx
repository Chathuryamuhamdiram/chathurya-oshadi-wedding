"use client";

import { useState, useRef } from "react";
import { Download, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { notoSansSinhalaBase64 } from "@/lib/fonts/notoSansSinhalaBase64";
import * as htmlToImage from "html-to-image";
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
  const printRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // 1. Wait for fonts to be ready
      await document.fonts.ready;
      
      // 2. Wait two render frames for DOM to fully flush
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const printElement = printRef.current;
      if (!printElement) throw new Error("Print container not found");

      // Temporarily show the print container so html-to-image can capture it properly
      printElement.style.display = "block";
      
      // Add standard A4 dimensions (width ~794px for 96dpi A4 portrait)
      printElement.style.width = "794px";
      printElement.style.padding = "40px"; // Margins
      
      // Capture the rendered DOM to a high-res Canvas
      // Scale 3 provides excellent print quality
      const canvas = await htmlToImage.toCanvas(printElement, {
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          margin: '0'
        }
      });

      // Hide the print container again
      printElement.style.display = "none";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeightInMm = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeightInMm;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInMm);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeightInMm;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInMm);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${menuTitle ? menuTitle.toLowerCase().replace(/\s+/g, '-') : 'food-menu'}.pdf`);
      setOpen(false);
    } catch (error: any) {
      console.error("Export Error:", error);
      alert(`Failed to export PDF: ${error.message || String(error)}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (isAllEvents) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @font-face {
          font-family: 'Noto Sans Sinhala';
          src: url('data:font/truetype;charset=utf-8;base64,${notoSansSinhalaBase64}') format('truetype');
          font-weight: 400;
          font-style: normal;
        }
      `}} />

      {/* Hidden Print Container */}
      <div 
        ref={printRef} 
        style={{ 
          display: 'none', 
          position: 'absolute', 
          top: '-9999px', 
          left: '-9999px',
          fontFamily: '"Noto Sans Sinhala", "Noto Sans", sans-serif',
          backgroundColor: 'white',
          color: '#1F2937',
          lineHeight: '1.6',
          letterSpacing: 'normal',
          wordSpacing: 'normal',
          whiteSpace: 'normal',
          textAlign: 'left',
          wordBreak: 'normal',
          overflowWrap: 'normal'
        }}
      >
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ color: '#10233B', fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>CHATHURYA & OSHADI</h1>
          <h2 style={{ color: '#D7B56D', fontSize: '16px', fontWeight: 'normal', margin: '0 0 20px 0' }}>FOOD MENU</h2>
          
          <div style={{ fontSize: '12px', color: '#4B5563' }}>
            <p style={{ margin: '2px 0' }}>Event: {eventName || 'Unknown'}</p>
            <p style={{ margin: '2px 0' }}>Generated: {new Date().toLocaleDateString('en-GB')}</p>
            {menu?.title && <p style={{ margin: '2px 0' }}>Menu Title: {menu.title}</p>}
            {menu?.venue && <p style={{ margin: '2px 0' }}>Venue: {menu.venue}</p>}
            {menu?.vendor?.vendorName && <p style={{ margin: '2px 0' }}>Caterer: {menu.vendor.vendorName}</p>}
          </div>
        </div>

        <div>
          {(menu?.sections || []).map((section: any, idx: number) => (
            <div key={idx} style={{ marginBottom: '25px', breakInside: 'avoid' }}>
              <h3 style={{ 
                color: '#10233B', 
                fontSize: '14px', 
                fontWeight: 'bold', 
                borderBottom: '1px solid #E5E7EB', 
                paddingBottom: '5px', 
                marginBottom: '10px', 
                textTransform: 'uppercase',
                breakAfter: 'avoid'
              }}>
                {section.title}
              </h3>
              {section.items && section.items.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {section.items.map((item: any, iIdx: number) => (
                    <li key={iIdx} style={{ 
                      fontSize: '14px', 
                      padding: '6px 0', 
                      borderBottom: '1px solid #F3F4F6', 
                      breakInside: 'avoid',
                      letterSpacing: 'normal',
                      wordSpacing: 'normal'
                    }}>
                      {item.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '11px', fontStyle: 'italic', color: '#9CA3AF' }}>No items in this section</p>
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
              This will generate the PDF natively using your browser's font shaping engine.
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

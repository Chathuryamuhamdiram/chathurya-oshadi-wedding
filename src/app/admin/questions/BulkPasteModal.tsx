"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { bulkPasteQuestionsAction } from "./actions";

export function BulkPasteModal({
  isOpen,
  onClose,
  events,
  vendors,
  existingQuestions,
  activeEventId
}: {
  isOpen: boolean;
  onClose: () => void;
  events: any[];
  vendors: any[];
  existingQuestions: any[];
  activeEventId: string;
}) {
  const [pasteText, setPasteText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"INPUT" | "PREVIEW">("INPUT");
  
  const [defaultEventId, setDefaultEventId] = useState<string>(activeEventId === "all" ? "ALL" : activeEventId);
  const [defaultVendorId, setDefaultVendorId] = useState<string>("");
  const [defaultCategory, setDefaultCategory] = useState<string>("Other");
  
  const [previewItems, setPreviewItems] = useState<any[]>([]);

  const handleProcessInput = () => {
    if (!pasteText.trim()) return;

    // split by new lines
    const lines = pasteText.split('\n');
    const items = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      // Cleanup numbered lists (e.g. "1. ", "2) ", "- ", "• ")
      line = line.replace(/^(\d+[\.\)]|\-|\•|\*)\s*/, '').trim();
      
      if (!line) continue;

      // Duplicate check: eventId + vendorId + question
      const isDuplicate = existingQuestions.some(eq => 
        (eq.eventId === (defaultEventId === "ALL" ? null : defaultEventId)) &&
        (eq.vendorId === (defaultVendorId || null)) &&
        (eq.question.toLowerCase() === line.toLowerCase())
      );

      items.push({
        id: Math.random().toString(),
        question: line,
        category: defaultCategory,
        eventId: defaultEventId,
        vendorId: defaultVendorId || null,
        askFromName: null, // manual name not supported in bulk paste yet to keep it simple
        isDuplicate,
        selected: !isDuplicate // default skip duplicate
      });
    }

    setPreviewItems(items);
    setStep("PREVIEW");
  };

  const handleImport = async () => {
    const toImport = previewItems.filter(i => i.selected).map(i => ({
      question: i.question,
      category: i.category,
      eventId: i.eventId,
      vendorId: i.vendorId,
      askFromName: null
    }));

    if (toImport.length === 0) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    const res = await bulkPasteQuestionsAction(toImport);
    if (res.success) {
      setPasteText("");
      setStep("INPUT");
      onClose();
    } else {
      alert(res.error || "Failed to import");
    }
    setIsSubmitting(false);
  };

  const toggleSelect = (id: string) => {
    setPreviewItems(items => items.map(i => i.id === id ? { ...i, selected: !i.selected } : i));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setStep("INPUT");
        onClose();
      }
    }}>
      <DialogContent className="bg-[#11141d] border-white/10 text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Paste Questions</DialogTitle>
          <DialogDescription className="text-white/50">
            {step === "INPUT" ? "Paste multiple questions from a document or message." : "Review and confirm questions to import."}
          </DialogDescription>
        </DialogHeader>

        {step === "INPUT" ? (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase">Default Event</label>
                <select 
                  value={defaultEventId}
                  onChange={e => setDefaultEventId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                >
                  <option value="ALL" className="bg-[#11141d]">General (No Specific Event)</option>
                  {events.map(e => (
                    <option key={e.id} value={e.id} className="bg-[#11141d]">{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase">Default Ask From</label>
                <select 
                  value={defaultVendorId}
                  onChange={e => setDefaultVendorId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                >
                  <option value="" className="bg-[#11141d]">Select Vendor ▼</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id} className="bg-[#11141d]">{v.vendorName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase">Default Category</label>
                <select 
                  value={defaultCategory}
                  onChange={e => setDefaultCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                >
                  {["Function Hall", "Food & Beverage", "Rooms / Accommodation", "Decoration", "Timing", "Payments", "Bar / Liquor", "Parking", "Vendor Access", "Electricity / Power", "Sound / Music", "Photography", "Transport", "Guest Management", "Ceremony", "Other"].map(cat => (
                    <option key={cat} value={cat} className="bg-[#11141d]">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder={`Example:\nCan vendors enter from 6:00 AM?\nWhat time can decorations start?\nIs outside liquor allowed?`}
              rows={8}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 resize-none custom-scrollbar"
            />
            
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleProcessInput}
                disabled={!pasteText.trim()}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                Preview Import
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4 flex flex-col max-h-[60vh]">
            <div className="flex gap-4 text-sm text-white/70">
              <div>Detected: <strong className="text-white">{previewItems.length}</strong></div>
              <div>New: <strong className="text-emerald-400">{previewItems.filter(i => !i.isDuplicate).length}</strong></div>
              <div>Duplicates: <strong className="text-orange-400">{previewItems.filter(i => i.isDuplicate).length}</strong></div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 min-h-0">
              {previewItems.map((item, idx) => (
                <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${item.selected ? 'bg-white/5 border-white/20' : 'bg-transparent border-white/5 opacity-50'}`}>
                  <input 
                    type="checkbox" 
                    checked={item.selected}
                    onChange={() => toggleSelect(item.id)}
                    className="mt-1 shrink-0 accent-emerald-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.isDuplicate && (
                        <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">Duplicate</span>
                      )}
                      {!item.isDuplicate && (
                        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">New</span>
                      )}
                      <span className="text-[10px] text-white/40">{item.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10 shrink-0">
              <button 
                onClick={() => setStep("INPUT")}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleImport}
                disabled={isSubmitting || previewItems.filter(i => i.selected).length === 0}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Importing..." : `Import ${previewItems.filter(i => i.selected).length} Questions`}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

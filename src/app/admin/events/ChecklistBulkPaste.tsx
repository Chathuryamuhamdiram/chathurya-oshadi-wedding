"use client";

import { useState } from "react";
import { ClipboardPaste, AlertCircle, ArrowRight, Save, Trash2, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { parseChecklistText, normalizeItemName, ParsedChecklistItem } from "@/lib/admin/checklist-parser";
import { bulkSaveEventItemsAction } from "./actions";

type ChecklistBulkPasteProps = {
  defaultEventId?: string | null;
  defaultEventName?: string;
  events: {
    id: string;
    title: string;
    items: { id: string; name: string; quantity: string }[];
  }[];
  trigger?: React.ReactElement;
};

type Mode = "SELECT" | "PASTE" | "PREVIEW";

export function ChecklistBulkPaste({
  defaultEventId,
  defaultEventName,
  events,
  trigger
}: ChecklistBulkPasteProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(defaultEventId ? "PASTE" : "SELECT");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(defaultEventId || null);
  const [rawText, setRawText] = useState("");
  const [parsedItems, setParsedItems] = useState<ParsedChecklistItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when opening/closing
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setMode(defaultEventId ? "PASTE" : "SELECT");
      setSelectedEventId(defaultEventId || null);
      setRawText("");
      setParsedItems([]);
    }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const handlePreview = () => {
    try {
      if (!rawText.trim()) return;
      if (!selectedEvent) {
        alert("Error: No event selected for import.");
        return;
      }
      
      const items = parseChecklistText(rawText);
      
      // Duplicate detection
      const existingItems = selectedEvent.items || [];
      
      const processed = items.map(item => {
        const normalizedName = normalizeItemName(item.name);
        const match = existingItems.find(e => normalizeItemName(e.name) === normalizedName);
        
        if (match) {
          return {
            ...item,
            isDuplicate: true,
            duplicateAction: 'SKIP',
            existingId: match.id,
            originalName: match.name // the name currently in DB
          };
        }
        return item;
      });

      setParsedItems(processed);
      setMode("PREVIEW");
    } catch (error: any) {
      console.error("Parse error", error);
      alert("Failed to parse checklist: " + error.message);
    }
  };

  const handleUpdateParsedItem = (id: string, updates: Partial<ParsedChecklistItem>) => {
    setParsedItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleRemoveParsedItem = (id: string) => {
    setParsedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleImport = async () => {
    if (!selectedEventId || parsedItems.length === 0) return;
    setIsSubmitting(true);
    
    // Filter out items that are marked to SKIP
    const itemsToImport = parsedItems.filter(i => !(i.isDuplicate && i.duplicateAction === 'SKIP'));
    
    if (itemsToImport.length === 0) {
      setOpen(false);
      return;
    }
    
    const payload = itemsToImport.map(i => {
      let isDup = i.isDuplicate;
      let exId = i.existingId;
      
      // If user chose ADD_NEW for a duplicate, treat it as entirely new
      if (i.isDuplicate && i.duplicateAction === 'ADD_NEW') {
        isDup = false;
        exId = undefined;
      }
      
      return {
        name: i.name,
        quantity: i.quantity,
        existingId: exId,
        isDuplicate: isDup
      };
    });

    const res = await bulkSaveEventItemsAction(selectedEventId, payload);

    if (res.success) {
      setOpen(false);
    } else {
      alert(res.error || "Failed to import items");
    }
    setIsSubmitting(false);
  };

  const duplicatesCount = parsedItems.filter(i => i.isDuplicate).length;
  const withQuantityCount = parsedItems.filter(i => i.quantity.trim() !== "").length;
  const withoutQuantityCount = parsedItems.length - withQuantityCount;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger ? trigger : (
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition-colors text-sm font-medium">
            <ClipboardPaste className="w-4 h-4" /> Bulk Paste
          </button>
      )} />
      
      <DialogContent className="bg-[#11141d] border-white/10 text-white sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl font-serif flex items-center gap-2">
            <ClipboardPaste className="w-5 h-5 text-purple-400" />
            Paste Checklist
          </DialogTitle>
          <DialogDescription className="text-white/50">
            {mode === "SELECT" && "Select the event to import items into."}
            {mode === "PASTE" && (selectedEvent ? `Importing into: ${selectedEvent.title}` : "Paste your checklist below.")}
            {mode === "PREVIEW" && "Review and correct items before importing."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex-1 min-h-0 flex flex-col">
          
          {/* MODE: SELECT */}
          {mode === "SELECT" && (
            <div className="flex-1 flex flex-col gap-4 py-4">
              <p className="text-sm text-white/70">Please choose which event you want to import this checklist into:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {events.map(event => (
                  <button
                    type="button"
                    key={event.id}
                    onClick={() => {
                      setSelectedEventId(event.id);
                      setMode("PASTE");
                    }}
                    className="flex flex-col items-start p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-500/50 transition-colors text-left"
                  >
                    <span className="font-serif text-lg text-white/90">{event.title}</span>
                    <span className="text-xs text-white/40 mt-1">{event.items.length} existing items</span>
                  </button>
                ))}
                {events.length === 0 && (
                  <div className="col-span-full py-8 text-center text-white/40 text-sm">
                    No events available.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODE: PASTE */}
          {mode === "PASTE" && (
            <div className="flex-1 flex flex-col min-h-0 gap-4">
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste your checklist here...&#10;&#10;Example:&#10;1. සුදු රෙදි – 05 m&#10;2. රතු පරිප්පු – 250 g"
                className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none transition-colors resize-none custom-scrollbar"
              />
              <div className="flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={!rawText.trim()}
                  className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50 transition-colors flex items-center gap-2 text-sm shadow-lg shadow-purple-500/20"
                >
                  Preview Items <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* MODE: PREVIEW */}
          {mode === "PREVIEW" && (
            <div className="flex-1 flex flex-col min-h-0 gap-4">
              {/* Summary Stats */}
              <div className="flex flex-wrap gap-3 shrink-0">
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 flex items-center gap-2">
                  <span className="font-bold text-white">{parsedItems.length}</span> Parsed
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 flex items-center gap-2">
                  <span className="font-bold text-white">{withQuantityCount}</span> W/ Qty
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 flex items-center gap-2">
                  <span className="font-bold text-white">{withoutQuantityCount}</span> Blank Qty
                </div>
                {duplicatesCount > 0 && (
                  <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-center gap-2">
                    <span className="font-bold">{duplicatesCount}</span> Duplicates
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {parsedItems.map(item => (
                  <div key={item.id} className={`flex flex-col gap-2 p-3 rounded-xl border transition-colors ${item.isDuplicate ? 'bg-amber-500/[0.02] border-amber-500/20' : 'bg-white/[0.02] border-white/5'}`}>
                    
                    {item.isDuplicate && (
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-amber-500/80 font-bold mb-1">
                        <AlertCircle className="w-3 h-3" /> Duplicate in Event
                      </div>
                    )}

                    <div className="flex items-center gap-3 w-full">
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => handleUpdateParsedItem(item.id, { name: e.target.value })}
                        className="flex-1 min-w-0 bg-transparent border-b border-white/10 focus:border-purple-500/50 px-1 py-1 text-sm text-white focus:outline-none transition-colors"
                      />
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={e => handleUpdateParsedItem(item.id, { quantity: e.target.value })}
                        placeholder="Qty..."
                        maxLength={20}
                        className="w-24 shrink-0 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-center text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveParsedItem(item.id)}
                        className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors shrink-0"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.isDuplicate && (
                      <div className="flex bg-black/40 rounded overflow-hidden border border-white/5 w-full mt-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateParsedItem(item.id, { duplicateAction: 'SKIP' })}
                          className={`flex-1 px-2 py-1.5 text-[11px] font-medium tracking-wide transition-colors ${item.duplicateAction === 'SKIP' ? 'bg-amber-500/20 text-amber-400' : 'text-white/40 hover:bg-white/5'}`}
                        >
                          SKIP
                        </button>
                        <div className="w-[1px] bg-white/5" />
                        <button
                          type="button"
                          onClick={() => handleUpdateParsedItem(item.id, { duplicateAction: 'UPDATE' })}
                          className={`flex-1 px-2 py-1.5 text-[11px] font-medium tracking-wide transition-colors ${item.duplicateAction === 'UPDATE' ? 'bg-amber-500/20 text-amber-400' : 'text-white/40 hover:bg-white/5'}`}
                        >
                          UPDATE EXISTING
                        </button>
                        <div className="w-[1px] bg-white/5" />
                        <button
                          type="button"
                          onClick={() => handleUpdateParsedItem(item.id, { duplicateAction: 'ADD_NEW' })}
                          className={`flex-1 px-2 py-1.5 text-[11px] font-medium tracking-wide transition-colors ${item.duplicateAction === 'ADD_NEW' ? 'bg-amber-500/20 text-amber-400' : 'text-white/40 hover:bg-white/5'}`}
                        >
                          ADD ANYWAY
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {parsedItems.length === 0 && (
                  <div className="text-center py-8 text-white/40 text-sm">
                    No items left to import.
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setMode("PASTE")}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-white/50 hover:text-white/80 transition-colors text-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={parsedItems.length === 0 || isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 transition-colors flex items-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4" /> Import {parsedItems.filter(i => !(i.isDuplicate && i.duplicateAction === 'SKIP')).length} Items
                </button>
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}

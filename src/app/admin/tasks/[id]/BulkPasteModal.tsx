"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClipboardPaste } from "lucide-react";
import { bulkAddTaskItems } from "../actions";

export function BulkPasteModal({ taskId, existingItems = [] }: { taskId: string, existingItems?: any[] }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePasteSubmit() {
    if (!text.trim()) return;
    setIsSubmitting(true);

    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const newItems: string[] = [];

    // Clean up bullets and numbers
    lines.forEach(line => {
      // Remove leading bullets like -, •, *, or numbers like 1., 2)
      let cleanLine = line.replace(/^[-\u2022*]+\s*/, ''); // hyphens, bullets, asterisks
      cleanLine = cleanLine.replace(/^\d+[\.\)]\s*/, ''); // numbers
      
      cleanLine = cleanLine.trim();
      
      if (cleanLine.length > 0) {
        // Check duplicates against existing items and items already in the new list
        const isDuplicate = 
          existingItems.some((i: any) => i.name.toLowerCase() === cleanLine.toLowerCase()) || 
          newItems.some(name => name.toLowerCase() === cleanLine.toLowerCase());
          
        if (!isDuplicate) {
          newItems.push(cleanLine);
        }
      }
    });

    if (newItems.length > 0) {
      await bulkAddTaskItems(taskId, newItems);
    }
    
    setText("");
    setOpen(false);
    setIsSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-colors border border-white/10">
        <ClipboardPaste className="w-3.5 h-3.5" /> Bulk Paste
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-[#0d1117] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-wide">Bulk Paste Items</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <p className="text-sm text-white/60">
            Paste a list of items below. We will automatically remove bullets and numbers, and skip any items that you already have.
          </p>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="• Item 1&#10;• Item 2&#10;• Item 3"
            rows={8}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 resize-none"
          />
          
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setOpen(false)} 
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/5"
            >
              Cancel
            </button>
            <button 
              onClick={handlePasteSubmit}
              disabled={isSubmitting || !text.trim()} 
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? "Saving..." : "Add Items"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

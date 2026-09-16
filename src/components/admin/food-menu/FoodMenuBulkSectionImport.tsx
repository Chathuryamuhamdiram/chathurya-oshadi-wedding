"use client";

import { useState } from "react";
import { ClipboardPaste, AlertCircle, ArrowRight, Save, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { parseFoodMenuText, normalizeFoodName, ParsedFoodItem } from "@/lib/admin/food-menu-parser";
import { bulkSaveFoodMenuSections } from "@/app/admin/food-menu/actions";

type FoodMenuBulkSectionImportProps = {
  menuId: string;
  existingSections: { id: string; title: string }[];
  trigger?: React.ReactElement;
};

type Mode = "PASTE" | "PREVIEW";

export function FoodMenuBulkSectionImport({
  menuId,
  existingSections,
  trigger
}: FoodMenuBulkSectionImportProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("PASTE");
  const [rawText, setRawText] = useState("");
  const [parsedSections, setParsedSections] = useState<ParsedFoodItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setMode("PASTE");
      setRawText("");
      setParsedSections([]);
    }
  };

  const handlePreview = () => {
    try {
      if (!rawText.trim()) return;
      
      const sections = parseFoodMenuText(rawText);
      
      const processed = sections.map(section => {
        const normalizedName = normalizeFoodName(section.name);
        const match = existingSections.find(e => normalizeFoodName(e.title) === normalizedName);
        
        if (match) {
          return {
            ...section,
            isDuplicate: true,
            duplicateAction: 'SKIP' as const,
          };
        }
        return section;
      });

      setParsedSections(processed);
      setMode("PREVIEW");
    } catch (error: any) {
      console.error("Parse error", error);
      alert("Failed to parse sections: " + error.message);
    }
  };

  const handleUpdateParsedSection = (id: string, updates: Partial<ParsedFoodItem>) => {
    setParsedSections(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleRemoveParsedSection = (id: string) => {
    setParsedSections(prev => prev.filter(item => item.id !== id));
  };

  const handleImport = async () => {
    if (parsedSections.length === 0) return;
    setIsSubmitting(true);
    
    const sectionsToImport = parsedSections.filter(i => !(i.isDuplicate && i.duplicateAction === 'SKIP'));
    
    if (sectionsToImport.length === 0) {
      setOpen(false);
      return;
    }
    
    const payload = sectionsToImport.map(i => {
      let isDup = i.isDuplicate;
      
      if (i.isDuplicate && i.duplicateAction === 'ADD_NEW') {
        isDup = false;
      }
      
      return {
        title: i.name,
        isDuplicate: isDup
      };
    });

    const res = await bulkSaveFoodMenuSections(menuId, payload);

    if (res.success) {
      setOpen(false);
    } else {
      alert("Failed to import sections");
    }
    setIsSubmitting(false);
  };

  const duplicatesCount = parsedSections.filter(i => i.isDuplicate).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger ? trigger : (
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors text-sm font-medium">
            <ClipboardPaste className="w-4 h-4" /> Bulk Add Sections
          </button>
      )} />
      
      <DialogContent className="bg-[#11141d] border-white/10 text-white sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl font-serif flex items-center gap-2">
            <ClipboardPaste className="w-5 h-5 text-emerald-400" />
            Bulk Add Sections
          </DialogTitle>
          <DialogDescription className="text-white/50">
            {mode === "PASTE" ? "Paste your section titles below, one per line." : "Review and correct sections before importing."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex-1 min-h-0 flex flex-col">
          
          {mode === "PASTE" && (
            <div className="flex-1 flex flex-col min-h-0 gap-4">
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste section names here...&#10;&#10;Example:&#10;Welcome Drinks&#10;Starters&#10;Main Course"
                className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none transition-colors resize-none custom-scrollbar"
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
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 transition-colors flex items-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
                >
                  Preview Sections <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {mode === "PREVIEW" && (
            <div className="flex-1 flex flex-col min-h-0 gap-4">
              <div className="flex flex-wrap gap-3 shrink-0">
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 flex items-center gap-2">
                  <span className="font-bold text-white">{parsedSections.length}</span> Parsed
                </div>
                {duplicatesCount > 0 && (
                  <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-center gap-2">
                    <span className="font-bold">{duplicatesCount}</span> Duplicates
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {parsedSections.map(section => (
                  <div key={section.id} className={`flex flex-col gap-2 p-3 rounded-xl border transition-colors ${section.isDuplicate ? 'bg-amber-500/[0.02] border-amber-500/20' : 'bg-white/[0.02] border-white/5'}`}>
                    
                    {section.isDuplicate && (
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-amber-500/80 font-bold mb-1">
                        <AlertCircle className="w-3 h-3" /> Duplicate Section
                      </div>
                    )}

                    <div className="flex items-center gap-3 w-full">
                      <input
                        type="text"
                        value={section.name}
                        onChange={e => handleUpdateParsedSection(section.id, { name: e.target.value })}
                        className="flex-1 min-w-0 bg-transparent border-b border-white/10 focus:border-emerald-500/50 px-1 py-1 text-sm text-white focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveParsedSection(section.id)}
                        className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors shrink-0"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {section.isDuplicate && (
                      <div className="flex bg-black/40 rounded overflow-hidden border border-white/5 w-full mt-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateParsedSection(section.id, { duplicateAction: 'SKIP' })}
                          className={`flex-1 px-2 py-1.5 text-[11px] font-medium tracking-wide transition-colors ${section.duplicateAction === 'SKIP' ? 'bg-amber-500/20 text-amber-400' : 'text-white/40 hover:bg-white/5'}`}
                        >
                          SKIP
                        </button>
                        <div className="w-[1px] bg-white/5" />
                        <button
                          type="button"
                          onClick={() => handleUpdateParsedSection(section.id, { duplicateAction: 'ADD_NEW' })}
                          className={`flex-1 px-2 py-1.5 text-[11px] font-medium tracking-wide transition-colors ${section.duplicateAction === 'ADD_NEW' ? 'bg-amber-500/20 text-amber-400' : 'text-white/40 hover:bg-white/5'}`}
                        >
                          ADD ANYWAY
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {parsedSections.length === 0 && (
                  <div className="text-center py-8 text-white/40 text-sm">
                    No sections left to import.
                  </div>
                )}
              </div>

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
                  disabled={parsedSections.length === 0 || isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 transition-colors flex items-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4" /> Import {parsedSections.filter(i => !(i.isDuplicate && i.duplicateAction === 'SKIP')).length} Sections
                </button>
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}

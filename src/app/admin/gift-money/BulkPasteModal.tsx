"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GiftMoneyEvent, GiftMoneyItem } from "./types";
import { bulkPasteGiftMoneyAction } from "./actions";
import { formatLKR } from "./utils";
import { Loader2, AlertTriangle, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

interface ParsedPreviewItem {
  id: string;
  name: string;
  amount: number;
  note?: string;
  isDuplicate: boolean;
  selected: boolean;
}

export function BulkPasteModal({
  open,
  onOpenChange,
  events,
  defaultEventId,
  existingEntries,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: GiftMoneyEvent[];
  defaultEventId?: string;
  existingEntries: GiftMoneyItem[];
}) {
  const [step, setStep] = useState<"INPUT" | "PREVIEW">("INPUT");
  const [pasteText, setPasteText] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    const matched = events.find((e) => e.id === defaultEventId);
    return matched ? matched.id : events[0]?.id || "";
  });
  const [previewItems, setPreviewItems] = useState<ParsedPreviewItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setStep("INPUT");
    setPasteText("");
    setPreviewItems([]);
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetState();
    onOpenChange(false);
  };

  const handleProcessInput = () => {
    setError(null);
    if (!pasteText.trim()) {
      setError("Please paste some text with names and amounts.");
      return;
    }

    if (!selectedEventId) {
      setError("Please choose a target event (Wedding or Homecoming).");
      return;
    }

    // Filter existing entries for the target event to detect duplicates accurately
    const eventExisting = existingEntries.filter((e) => e.eventId === selectedEventId);
    const existingNameSet = new Set(
      eventExisting.map((e) => e.name.toLowerCase().trim().replace(/\s+/g, " "))
    );

    const lines = pasteText.split("\n");
    const parsed: ParsedPreviewItem[] = [];

    for (let rawLine of lines) {
      let line = rawLine.trim();
      if (!line) continue;

      // 1. Strip leading list numbers / bullet points: "1. ", "01) ", "- ", "• ", "* "
      line = line.replace(/^(\d+[\.\)\-:]|\-|\•|\*)\s*/, "").trim();
      if (!line) continue;

      // 2. Identify delimiters: hyphen / en-dash / em-dash, pipe, tab, or colon
      // Common formats:
      // "Nimal Perera – 15000"
      // "Sunil Silva - 10000 - Envelope"
      // "Kamal Fernando: 20000"
      // "Saman Kumara | 15,000"
      let namePart = "";
      let amountPart = "";
      let notePart = "";

      const separators = ["–", "—", " - ", "|", "\t", ":", ","];
      let matchedSep = separators.find((sep) => line.includes(sep));

      if (matchedSep) {
        const parts = line.split(matchedSep).map((p) => p.trim());
        namePart = parts[0] || "";
        amountPart = parts[1] || "";
        if (parts.length > 2) {
          notePart = parts.slice(2).join(" ").trim();
        }
      } else {
        // Fallback: match trailing numbers as amount
        // e.g. "Nimal Perera 15000" or "Nimal Perera LKR 15,000"
        const trailingAmountMatch = line.match(/^(.*?)(?:LKR\s*|\$|\s+)(\d[\d,.]*)$/i);
        if (trailingAmountMatch) {
          namePart = trailingAmountMatch[1].trim();
          amountPart = trailingAmountMatch[2].trim();
        } else {
          namePart = line;
          amountPart = "0";
        }
      }

      // Clean name
      namePart = namePart.replace(/^LKR\s*/i, "").trim();
      // Clean amount: remove commas and LKR prefix
      const cleanAmountNum = parseFloat(amountPart.replace(/[^0-9.]/g, ""));

      if (!namePart || isNaN(cleanAmountNum) || cleanAmountNum <= 0) {
        // Skip unparseable lines or lines without valid amounts
        continue;
      }

      const normalizedName = namePart.toLowerCase().trim().replace(/\s+/g, " ");
      const isDuplicate = existingNameSet.has(normalizedName);

      parsed.push({
        id: Math.random().toString(36).substring(2, 9),
        name: namePart,
        amount: cleanAmountNum,
        note: notePart || undefined,
        isDuplicate,
        selected: !isDuplicate, // Default: skip duplicate, select new
      });
    }

    if (parsed.length === 0) {
      setError(
        "Could not detect any valid entries. Please format like: 'Nimal Perera – 15000'."
      );
      return;
    }

    setPreviewItems(parsed);
    setStep("PREVIEW");
  };

  const handleImport = async () => {
    const selected = previewItems.filter((item) => item.selected);
    if (selected.length === 0) {
      setError("Please select at least one entry to import.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await bulkPasteGiftMoneyAction(
      selected.map((item) => ({
        name: item.name,
        amount: item.amount,
        eventId: selectedEventId,
        note: item.note || null,
      }))
    );

    setIsSubmitting(false);

    if (result.success) {
      resetState();
      onOpenChange(false);
    } else {
      setError(result.error || "Failed to import entries.");
    }
  };

  const toggleSelect = (id: string) => {
    setPreviewItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const selectAll = (selectOnlyNew: boolean = false) => {
    setPreviewItems((prev) =>
      prev.map((item) => ({
        ...item,
        selected: selectOnlyNew ? !item.isDuplicate : true,
      }))
    );
  };

  const deselectAll = () => {
    setPreviewItems((prev) => prev.map((item) => ({ ...item, selected: false })));
  };

  const currentEvent = events.find((e) => e.id === selectedEventId);
  const duplicateCount = previewItems.filter((i) => i.isDuplicate).length;
  const selectedCount = previewItems.filter((i) => i.selected).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[620px] bg-[#11141d] border-white/10 text-white max-h-[90vh] flex flex-col p-6">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl font-serif tracking-wide text-white">
            Bulk Paste Gift Money
          </DialogTitle>
          <DialogDescription className="text-white/50 text-xs">
            Quickly paste multiple entries from text, WhatsApp, or notes.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 shrink-0 mt-2">
            {error}
          </div>
        )}

        {step === "INPUT" ? (
          <div className="space-y-4 pt-2 flex-1 overflow-y-auto">
            {/* Event Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/70 font-medium block">
                Target Event <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full h-9 rounded-md bg-[#161a26] border border-white/10 text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} {ev.eventType === "WEDDING" ? "(Wedding)" : "(Homecoming)"}
                  </option>
                ))}
              </select>
            </div>

            {/* Paste Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-white/70 font-medium block">
                  Paste Name & Amount List
                </label>
                <span className="text-[11px] text-white/40">1 entry per line</span>
              </div>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={9}
                placeholder={`Nimal Perera – 15000\nSunil Silva – 10000\nKamal Fernando – 20000\nAnura Dias – 50000`}
                className="w-full rounded-md bg-white/5 border border-white/10 text-white text-sm p-3 font-mono placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none leading-relaxed"
              />
            </div>

            {/* Hint Box */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-white/60 space-y-1">
              <p className="font-medium text-white/80">Format Examples:</p>
              <p className="font-mono text-[11px] text-white/50">
                • Nimal Perera – 15000<br />
                • Sunil Silva - 10,000<br />
                • Kamal Fernando | 20000 | Envelope #4
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="bg-transparent border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleProcessInput}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                Preview Entries
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2 flex-1 flex flex-col min-h-0">
            {/* Header summary & controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/10 shrink-0 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-white/60">
                  Target: <strong className="text-white">{currentEvent?.name}</strong>
                </span>
                <span className="text-white/40">|</span>
                <span className="text-white/60">
                  Parsed: <strong className="text-white">{previewItems.length}</strong>
                </span>
                {duplicateCount > 0 && (
                  <>
                    <span className="text-white/40">|</span>
                    <span className="text-amber-400 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {duplicateCount} Duplicate{duplicateCount === 1 ? "" : "s"}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectAll(true)}
                  className="text-emerald-400 hover:underline text-[11px]"
                >
                  Skip Duplicates
                </button>
                <span className="text-white/20">•</span>
                <button
                  type="button"
                  onClick={() => selectAll(false)}
                  className="text-white/70 hover:underline text-[11px]"
                >
                  Select All
                </button>
                <span className="text-white/20">•</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-white/50 hover:underline text-[11px]"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Preview table */}
            <div className="flex-1 overflow-y-auto border border-white/10 rounded-xl bg-[#141824] divide-y divide-white/5">
              {previewItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    item.selected
                      ? "bg-white/[0.04] hover:bg-white/[0.07]"
                      : "opacity-60 bg-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelect(item.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-600 focus:ring-emerald-500/30"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {item.name}
                      </div>
                      {item.note && (
                        <div className="text-xs text-white/40 truncate">
                          {item.note}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {item.isDuplicate ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Duplicate
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        New
                      </span>
                    )}

                    <span className="text-sm font-mono font-semibold text-white">
                      {formatLKR(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("INPUT")}
                disabled={isSubmitting}
                className="bg-transparent border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Edit
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="bg-transparent border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleImport}
                  disabled={isSubmitting || selectedCount === 0}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Import {selectedCount} {selectedCount === 1 ? "Entry" : "Entries"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

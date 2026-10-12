"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GiftMoneyEvent, GiftMoneyItem } from "./types";
import { saveGiftMoneyEntryAction } from "./actions";
import { Loader2 } from "lucide-react";

interface GiftMoneyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: GiftMoneyItem | null;
  events: GiftMoneyEvent[];
  defaultEventId?: string;
}

export function GiftMoneyModal({
  open,
  onOpenChange,
  initialData,
  events,
  defaultEventId,
}: GiftMoneyModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [eventId, setEventId] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name);
        setAmount(initialData.amount.toString());
        setEventId(initialData.eventId);
        setNote(initialData.note || "");
      } else {
        setName("");
        setAmount("");
        // Pick active/default event or first available event (e.g. Wedding)
        const matched = events.find((e) => e.id === defaultEventId);
        setEventId(matched ? matched.id : events[0]?.id || "");
        setNote("");
      }
      setError(null);
    }
  }, [open, initialData, events, defaultEventId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Person / Guest Name is required.");
      return;
    }

    const num = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(num) || num <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    if (!eventId) {
      setError("Please select an event.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    if (initialData?.id) {
      formData.set("id", initialData.id);
    }
    formData.set("name", name.trim());
    formData.set("amount", num.toString());
    formData.set("eventId", eventId);
    if (note.trim()) {
      formData.set("note", note.trim());
    }

    const result = await saveGiftMoneyEntryAction(formData);
    setIsSubmitting(false);

    if (result.success) {
      onOpenChange(false);
    } else {
      setError(result.error || "Failed to save entry.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-[#11141d] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif tracking-wide text-white">
            {initialData ? "Edit Gift Money Entry" : "Add Gift Money Entry"}
          </DialogTitle>
          <DialogDescription className="text-white/50 text-xs">
            {initialData
              ? "Update details for this gift money record."
              : "Record money received from a guest for the Wedding or Homecoming."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Guest Name */}
          <div className="space-y-1.5">
            <label htmlFor="gift-person-name" className="text-xs text-white/70 font-medium block">
              Person / Guest Name <span className="text-rose-400">*</span>
            </label>
            <Input
              id="gift-person-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nimal Perera"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/30"
              autoFocus
            />
          </div>

          {/* Amount Received */}
          <div className="space-y-1.5">
            <label htmlFor="gift-amount" className="text-xs text-white/70 font-medium block">
              Amount Received (LKR) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/40">
                LKR
              </span>
              <Input
                id="gift-amount"
                type="number"
                step="any"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="15000"
                className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/30 font-mono"
              />
            </div>
          </div>

          {/* Event Dropdown */}
          <div className="space-y-1.5">
            <label htmlFor="gift-event" className="text-xs text-white/70 font-medium block">
              Event <span className="text-rose-400">*</span>
            </label>
            <select
              id="gift-event"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full h-9 rounded-md bg-[#161a26] border border-white/10 text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {events.map((ev: GiftMoneyEvent) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} {ev.eventType === "WEDDING" ? "(Wedding)" : ev.eventType === "HOMECOMING" ? "(Homecoming)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label htmlFor="gift-note" className="text-xs text-white/70 font-medium block">
              Note <span className="text-white/30">(Optional)</span>
            </label>
            <textarea
              id="gift-note"
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
              placeholder="e.g. Handed over at the reception, envelope #12"
              rows={2}
              className="w-full rounded-md p-2.5 bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none text-sm"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="bg-transparent border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md shadow-emerald-950/20"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {initialData ? "Save Changes" : "Save Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

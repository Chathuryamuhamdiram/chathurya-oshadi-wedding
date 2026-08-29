"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { saveVenueAction } from "./actions";

export function VenueForm({ existingVenue }: { existingVenue?: any }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");
    
    if (existingVenue?.id) {
      formData.set("id", existingVenue.id);
    }

    const res = await saveVenueAction(formData);
    setIsSubmitting(false);
    if (res.success) {
      setOpen(false);
    } else {
      setError(res.error || "An error occurred");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 text-sm font-sans transition-all duration-200">
        {existingVenue ? "Edit Venue" : "Add Venue"}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] bg-[#0d1117] border border-white/10 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-white/90 tracking-wide">
            {existingVenue ? "Edit Venue" : "New Venue"}
          </DialogTitle>
          <p className="text-white/30 text-sm font-sans">
            Add a location for your wedding events.
          </p>
        </DialogHeader>

        <form action={onSubmit} className="space-y-5 mt-2">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 font-sans">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Venue Name</label>
            <Input
              name="name"
              required
              defaultValue={existingVenue?.name || ""}
              placeholder="e.g. Shangri-La Colombo"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-0 rounded-xl h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Address / Location</label>
            <Input
              name="address"
              defaultValue={existingVenue?.address || ""}
              placeholder="1 Galle Face, Colombo 02"
              className="bg-white/5 border-white/10 text-white focus:border-purple-500/50 focus:ring-0 rounded-xl h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Maps URL</label>
              <Input
                name="googleMapsUrl"
                defaultValue={existingVenue?.googleMapsUrl || ""}
                placeholder="https://maps.app.goo.gl/..."
                className="bg-white/5 border-white/10 text-white focus:border-purple-500/50 focus:ring-0 rounded-xl h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Contact Phone</label>
              <Input
                name="phone"
                defaultValue={existingVenue?.phone || ""}
                placeholder="011 2 498989"
                className="bg-white/5 border-white/10 text-white focus:border-purple-500/50 focus:ring-0 rounded-xl h-11"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm font-sans transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-white text-[#0a0f1e] text-sm font-sans font-medium transition-all duration-200 shadow-lg hover:bg-white/90 disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Save Venue"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

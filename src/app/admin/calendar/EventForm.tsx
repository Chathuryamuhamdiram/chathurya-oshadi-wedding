"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveWeddingEvent } from "./actions";
import { Plus, Calendar as CalendarIcon } from "lucide-react";

export function EventForm({ existingEvent }: { existingEvent?: any }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");
    if (existingEvent) formData.set("id", existingEvent.id);
    
    const res = await saveWeddingEvent(formData);
    setIsSubmitting(false);
    if (res.success) {
      setOpen(false);
    } else {
      setError(res.error || "Failed to save event");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {existingEvent ? (
        <DialogTrigger className="text-purple-400/70 hover:text-purple-400 bg-purple-500/10 px-2 py-1 rounded transition-colors text-xs border border-purple-500/20">
          Edit
        </DialogTrigger>
      ) : (
        <DialogTrigger className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all shadow-lg shadow-purple-500/20">
          <CalendarIcon className="w-4 h-4" /> Add Event
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] bg-[#0d1117] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-wide">{existingEvent ? "Edit Event" : "New Event"}</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4 mt-2">
          {error && <div className="text-sm text-red-400">{error}</div>}
          
          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Event Title</label>
            <Input name="title" defaultValue={existingEvent?.title || ""} required placeholder="e.g., Dress Fitting, Rehearsal Dinner" className="bg-white/5 border-white/10 focus:border-purple-500/50 rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Description</label>
            <Input name="description" defaultValue={existingEvent?.description || ""} placeholder="Add details..." className="bg-white/5 border-white/10 focus:border-purple-500/50 rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Date</label>
            <Input name="eventDate" type="date" required defaultValue={existingEvent?.eventDate ? new Date(existingEvent.eventDate).toISOString().split('T')[0] : ""} className="bg-white/5 border-white/10 focus:border-purple-500/50 rounded-xl flex" style={{ colorScheme: 'dark' }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Start Time</label>
              <Input name="startTime" type="time" defaultValue={existingEvent?.startTime || ""} className="bg-white/5 border-white/10 focus:border-purple-500/50 rounded-xl flex" style={{ colorScheme: 'dark' }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">End Time</label>
              <Input name="endTime" type="time" defaultValue={existingEvent?.endTime || ""} className="bg-white/5 border-white/10 focus:border-purple-500/50 rounded-xl flex" style={{ colorScheme: 'dark' }} />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Visibility</label>
            <Select name="visibility" defaultValue={existingEvent?.visibility || "PRIVATE"}>
              <SelectTrigger className="bg-white/5 border-white/10 focus:border-purple-500/50 rounded-xl h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e2333] border-white/10 text-white">
                <SelectItem value="PRIVATE">Private (Admin only)</SelectItem>
                <SelectItem value="PUBLIC">Public (Guests can see)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors">
              {isSubmitting ? "Saving..." : "Save Event"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

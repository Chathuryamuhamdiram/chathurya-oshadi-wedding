"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveEventAction } from "./actions";

export function EventForm({ venues, existingEvent }: { venues: any[], existingEvent?: any }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [venueId, setVenueId] = useState(existingEvent?.venueId || "UNASSIGNED");
  const [visibility, setVisibility] = useState(existingEvent?.visibility || "PUBLIC");

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");
    formData.set("venueId", venueId);
    formData.set("visibility", visibility);
    
    if (existingEvent?.id) {
      formData.set("id", existingEvent.id);
    }

    const res = await saveEventAction(formData);
    setIsSubmitting(false);
    if (res.success) {
      setOpen(false);
    } else {
      setError(res.error || "An error occurred");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 text-sm font-sans transition-all duration-200 group">
        <span className="text-lg leading-none transition-transform duration-200 group-hover:rotate-90">+</span>
        {existingEvent ? "Edit Event" : "New Event"}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] bg-[#0d1117] border border-white/10 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-white/90 tracking-wide">
            {existingEvent ? "Edit Event" : "Add Event"}
          </DialogTitle>
          <p className="text-white/30 text-sm font-sans">
            Schedule a ceremony, reception, or activity.
          </p>
        </DialogHeader>

        <form action={onSubmit} className="space-y-5 mt-2" key={existingEvent?.updatedAt || "new"}>
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 font-sans">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Event Title</label>
            <Input
              name="title"
              required
              defaultValue={existingEvent?.title || ""}
              placeholder="e.g. Poruwa Ceremony"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-0 rounded-xl h-11"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Date</label>
              <Input
                type="date"
                name="eventDate"
                defaultValue={existingEvent?.eventDate ? new Date(existingEvent.eventDate).toISOString().split('T')[0] : ""}
                className="bg-white/5 border-white/10 text-white focus:border-purple-500/50 focus:ring-0 rounded-xl h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Sort Order</label>
              <Input
                type="number"
                name="sortOrder"
                defaultValue={existingEvent?.sortOrder || 0}
                className="bg-white/5 border-white/10 text-white focus:border-purple-500/50 focus:ring-0 rounded-xl h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Start Time</label>
              <Input
                type="time"
                name="startTime"
                defaultValue={existingEvent?.startTime || ""}
                className="bg-white/5 border-white/10 text-white focus:border-purple-500/50 focus:ring-0 rounded-xl h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">End Time</label>
              <Input
                type="time"
                name="endTime"
                defaultValue={existingEvent?.endTime || ""}
                className="bg-white/5 border-white/10 text-white focus:border-purple-500/50 focus:ring-0 rounded-xl h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Venue</label>
              <Select name="venueId" value={venueId} onValueChange={setVenueId}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white focus:border-purple-500/50 focus:ring-0 rounded-xl h-11 overflow-hidden">
                  <SelectValue>
                    {venueId === "UNASSIGNED" ? "No Venue" : venues.find(v => v.id === venueId)?.name || "No Venue"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#0d1117] border-white/10 text-white">
                  <SelectItem value="UNASSIGNED">No Venue</SelectItem>
                  {venues.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Visibility</label>
              <Select name="visibility" value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white focus:border-purple-500/50 focus:ring-0 rounded-xl h-11 overflow-hidden">
                  <SelectValue>
                    {visibility === "PUBLIC" ? "Public" : visibility === "PRIVATE" ? "Private" : "Invite Only"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#0d1117] border-white/10 text-white">
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="INVITE_ONLY">Invite Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Description</label>
            <Input
              name="description"
              defaultValue={existingEvent?.description || ""}
              placeholder="Any extra details..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-0 rounded-xl h-11"
            />
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
              className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white text-sm font-sans font-medium transition-all duration-200 shadow-lg shadow-purple-500/20"
            >
              {isSubmitting ? "Saving…" : "Save Event"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

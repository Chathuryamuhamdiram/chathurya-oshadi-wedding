"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveLogistics } from "./actions";
import { Plane, Edit } from "lucide-react";

export function LogisticsForm({ existingLogistics, guests }: { existingLogistics?: any, guests: any[] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");
    if (existingLogistics) {
      formData.set("id", existingLogistics.id);
      formData.set("guestId", existingLogistics.guestId);
    }
    
    const res = await saveLogistics(formData);
    setIsSubmitting(false);
    if (res.success) {
      setOpen(false);
    } else {
      setError(res.error || "Failed to save logistics");
    }
  }

  // Format dates for the datetime-local input
  const defaultArrival = existingLogistics?.arrivalDateTime 
    ? new Date(existingLogistics.arrivalDateTime).toISOString().slice(0, 16) 
    : "";
  const defaultDeparture = existingLogistics?.departureDateTime 
    ? new Date(existingLogistics.departureDateTime).toISOString().slice(0, 16) 
    : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {existingLogistics ? (
        <DialogTrigger className="text-teal-400/70 hover:text-teal-400 bg-teal-500/10 px-2 py-1 rounded transition-colors text-xs border border-teal-500/20 inline-flex items-center gap-1">
          <Edit className="w-3 h-3" /> Edit
        </DialogTrigger>
      ) : (
        <DialogTrigger className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-all shadow-lg shadow-teal-500/20">
          <Plane className="w-4 h-4" /> Add Logistics
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[500px] bg-[#0d1117] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-wide">
            {existingLogistics ? "Edit Guest Logistics" : "Add Guest Logistics"}
          </DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4 mt-2">
          {error && <div className="text-sm text-red-400">{error}</div>}
          
          {!existingLogistics && (
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Select Guest</label>
              <Select name="guestId" required>
                <SelectTrigger className="bg-white/5 border-white/10 focus:border-teal-500/50 rounded-xl h-10">
                  <SelectValue placeholder="Choose a guest..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2333] border-white/10 text-white max-h-[200px]">
                  {guests.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Arrival</label>
              <Input name="arrivalDate" type="datetime-local" defaultValue={defaultArrival} className="bg-white/5 border-white/10 focus:border-teal-500/50 rounded-xl flex" style={{ colorScheme: 'dark' }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Departure</label>
              <Input name="departureDate" type="datetime-local" defaultValue={defaultDeparture} className="bg-white/5 border-white/10 focus:border-teal-500/50 rounded-xl flex" style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Accommodation / Hotel</label>
            <Input name="accommodationName" defaultValue={existingLogistics?.accommodationName || ""} placeholder="e.g. The Grand Hotel" className="bg-white/5 border-white/10 focus:border-teal-500/50 rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Transport Notes</label>
            <Input name="transportNotes" defaultValue={existingLogistics?.transportNotes || ""} placeholder="e.g. Needs airport pickup, taking shuttle" className="bg-white/5 border-white/10 focus:border-teal-500/50 rounded-xl" />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors">
              {isSubmitting ? "Saving..." : "Save Details"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

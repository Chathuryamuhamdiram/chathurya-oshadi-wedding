"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createSeatingTable } from "./actions";
import { Plus } from "lucide-react";

export function TableForm() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");
    
    const res = await createSeatingTable(formData);
    setIsSubmitting(false);
    if (res.success) {
      setOpen(false);
    } else {
      setError(res.error || "Failed to create table");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/20">
        <Plus className="w-4 h-4" /> Add Table
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-[#0d1117] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-wide">Create Seating Table</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4 mt-2">
          {error && <div className="text-sm text-red-400">{error}</div>}
          
          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Table Name / Number</label>
            <Input name="name" required placeholder="e.g., Table 1, Head Table" className="bg-white/5 border-white/10 focus:border-indigo-500/50 rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Seat Capacity</label>
            <Input name="capacity" type="number" min="1" max="20" defaultValue="8" required className="bg-white/5 border-white/10 focus:border-indigo-500/50 rounded-xl" />
          </div>

          <div className="flex justify-end pt-4 border-t border-white/5">
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
              {isSubmitting ? "Saving..." : "Create Table"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

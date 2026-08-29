"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { saveBudgetCategory } from "./actions";

export function CategoryForm() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");
    const res = await saveBudgetCategory(formData);
    setIsSubmitting(false);
    if (res.success) {
      setOpen(false);
    } else {
      setError(res.error || "Failed to save category");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
        + New Category
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#0d1117] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-wide">Add Budget Category</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4 mt-2">
          {error && <div className="text-sm text-red-400">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Category Name</label>
            <Input name="name" required placeholder="e.g., Attire, Venue" className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl" />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-colors">
              {isSubmitting ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

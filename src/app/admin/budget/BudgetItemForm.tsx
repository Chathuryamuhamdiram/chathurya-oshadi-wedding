"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveBudgetItem } from "./actions";
import { Plus } from "lucide-react";

export function BudgetItemForm({ categories, vendors = [] }: { categories: any[], vendors?: any[] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");
    const res = await saveBudgetItem(formData);
    setIsSubmitting(false);
    if (res.success) {
      setOpen(false);
    } else {
      setError(res.error || "Failed to save item");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-all shadow-lg shadow-emerald-500/20">
        <Plus className="w-4 h-4" /> Add Item
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#0d1117] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-wide">Add Budget Item</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4 mt-2">
          {error && <div className="text-sm text-red-400">{error}</div>}
          
          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Item Title</label>
            <Input name="title" required placeholder="e.g., Wedding Dress" className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Category</label>
              <Select name="categoryId" required>
                <SelectTrigger className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl h-10">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2333] border-white/10 text-white">
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Estimated Cost</label>
              <Input name="estimatedCost" type="number" min="0" step="0.01" required placeholder="0.00" className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Linked Vendor (Optional)</label>
            <Select name="vendorId">
              <SelectTrigger className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl h-10">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e2333] border-white/10 text-white">
                <SelectItem value="none">None</SelectItem>
                {vendors.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.vendorName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-white/30">Select a vendor to sync expenses against their total bill.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Due Date</label>
            <Input name="paymentDueDate" type="date" className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl flex" style={{ colorScheme: 'dark' }} />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-colors">
              {isSubmitting ? "Saving..." : "Save Item"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { saveExpense } from "./actions";
import { DollarSign } from "lucide-react";

export function ExpenseForm({ budgetItemId, itemName }: { budgetItemId: string, itemName: string }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");
    formData.set("budgetItemId", budgetItemId);
    const res = await saveExpense(formData);
    setIsSubmitting(false);
    if (res.success) {
      setOpen(false);
    } else {
      setError(res.error || "Failed to log payment");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition-colors border border-emerald-500/20">
        <DollarSign className="w-3.5 h-3.5" /> Pay
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#0d1117] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-wide">Log Payment</DialogTitle>
          <p className="text-sm text-white/40 font-sans">Payment for: <span className="text-white/80">{itemName}</span></p>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4 mt-2">
          {error && <div className="text-sm text-red-400">{error}</div>}
          
          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Expense Name / Note</label>
            <Input name="expenseName" required placeholder="e.g., Advance Payment, Final Balance" className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Amount Paid</label>
            <Input name="amount" type="number" min="0.01" step="0.01" required placeholder="$0.00" className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl" />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-colors">
              {isSubmitting ? "Saving..." : "Record Payment"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

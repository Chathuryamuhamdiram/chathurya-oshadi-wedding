"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { saveExpense } from "./actions";
import { DollarSign } from "lucide-react";
import { DeleteExpenseButton } from "./DeleteExpenseButton";

export function ExpenseForm({ 
  budgetItemId, 
  itemName, 
  expenses = [] 
}: { 
  budgetItemId: string; 
  itemName: string;
  expenses?: { id: string; expenseName: string; amount: number; expenseDate: Date }[];
}) {
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

        {expenses.length > 0 && (
          <div className="space-y-2 mt-4 bg-white/5 border border-white/10 p-4 rounded-xl max-h-48 overflow-y-auto">
            <h4 className="text-xs uppercase tracking-widest text-white/40 mb-2">Payment History</h4>
            {expenses.map(e => (
              <div key={e.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <div>
                  <div className="text-white/80">{e.expenseName}</div>
                  <div className="text-white/40 text-xs">{new Date(e.expenseDate).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-mono text-emerald-400 font-medium">${e.amount.toLocaleString()}</div>
                  <DeleteExpenseButton id={e.id} expenseName={e.expenseName} amount={e.amount} />
                </div>
              </div>
            ))}
          </div>
        )}

        <form action={onSubmit} className="space-y-4 mt-2 border-t border-white/10 pt-4">
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

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveBudgetItem } from "./actions";
import { Plus, Edit2, Info } from "lucide-react";

export function BudgetItemForm({ categories, vendors = [], existingItem, trigger, activeEventId }: { categories: any[], vendors?: any[], existingItem?: any, trigger?: React.ReactNode, activeEventId?: string | null }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState<string>(existingItem?.vendorId || "none");
  const [estimatedCost, setEstimatedCost] = useState<string>(existingItem?.estimatedCost ? String(existingItem.estimatedCost) : "");

  const isEdit = !!existingItem;

  // Find the advance expense if it exists
  const advanceExpense = existingItem?.expenses?.find((e: any) => e.expenseType === "ADVANCE");

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");
    if (isEdit && existingItem.id) {
      formData.append("id", existingItem.id);
    }
    const res = await saveBudgetItem(formData);
    setIsSubmitting(false);
    if (res.success) {
      setOpen(false);
    } else {
      setError(res.error || "Failed to save item");
    }
  }

  const selectedVendor = vendors.find(v => v.id === selectedVendorId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="cursor-pointer inline-flex">
          {trigger || (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-all shadow-lg shadow-emerald-500/20">
              <Plus className="w-4 h-4" /> Add Item
            </div>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#0d1117] border-white/10 text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-wide">{isEdit ? "Edit Budget Item" : "Add Budget Item"}</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-5 mt-2">
          {activeEventId && <input type="hidden" name="eventId" value={activeEventId} />}
          {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">{error}</div>}
          
          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Item Title</label>
            <Input name="title" defaultValue={existingItem?.title} required placeholder="e.g., Wedding Dress" className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Linked Vendor (Optional)</label>
            <Select name="vendorId" value={selectedVendorId} onValueChange={(val) => setSelectedVendorId(val || "none")}>
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

          {selectedVendor && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl space-y-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-400">
                  <span className="font-semibold text-blue-300">{selectedVendor.vendorName}</span> ({selectedVendor.serviceCategory})
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm bg-black/20 p-3 rounded-lg border border-black/20">
                <div>
                  <div className="text-blue-400/60 text-xs">Contract Amount</div>
                  <div className="font-mono text-blue-300 font-medium">LKR {Number(selectedVendor.finalAmount).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-blue-400/60 text-xs">Outstanding</div>
                  <div className="font-mono text-blue-300 font-medium">LKR {Math.max(0, Number(selectedVendor.finalAmount) - (Number(selectedVendor.advancePaid) + 0)).toLocaleString()}</div>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setEstimatedCost(String(selectedVendor.finalAmount))}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                Use Vendor Contract Value as Total Amount
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Category</label>
              <Select name="categoryId" defaultValue={existingItem?.categoryId} required>
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
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Total Amount (Estimated Cost)</label>
              <Input 
                name="estimatedCost" 
                type="number" 
                min="0" 
                step="0.01" 
                required 
                placeholder="0.00" 
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl" 
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <h4 className="text-sm font-medium text-white/80 mb-4 font-serif">Advance Payment (Optional)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-sans uppercase tracking-widest text-white/40">Advance Paid</label>
                <Input 
                  name="advancePaid" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  defaultValue={advanceExpense ? Number(advanceExpense.amount) : ""}
                  placeholder="0.00" 
                  className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-sans uppercase tracking-widest text-white/40">Advance Date</label>
                <Input 
                  name="advancePaymentDate" 
                  type="date" 
                  defaultValue={advanceExpense ? new Date(advanceExpense.expenseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                  className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl flex" 
                  style={{ colorScheme: 'dark' }} 
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-4 border-t border-white/5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Next Payment Due Date</label>
            <Input name="paymentDueDate" defaultValue={existingItem?.paymentDueDate ? new Date(existingItem.paymentDueDate).toISOString().split('T')[0] : ""} type="date" className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl flex" style={{ colorScheme: 'dark' }} />
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-colors">
              {isSubmitting ? "Saving..." : (isEdit ? "Update Item" : "Save Item")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

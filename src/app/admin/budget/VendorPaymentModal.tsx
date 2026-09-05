"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveExpense } from "./actions";
import { useSearchParams, useRouter } from "next/navigation";

export function VendorPaymentModal({ vendors = [], categories = [] }: { vendors: any[], categories: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams?.get("action");
  const vendorIdFromUrl = searchParams?.get("vendorId");

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [selectedVendorId, setSelectedVendorId] = useState<string>(vendorIdFromUrl || "");
  const [selectedBudgetItemId, setSelectedBudgetItemId] = useState<string>("");

  useEffect(() => {
    if (action === "payment" && vendorIdFromUrl) {
      setOpen(true);
      setSelectedVendorId(vendorIdFromUrl);
    }
  }, [action, vendorIdFromUrl]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Clear URL params on close
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.delete("action");
      params.delete("vendorId");
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  };

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");
    formData.set("budgetItemId", selectedBudgetItemId);
    const res = await saveExpense(formData);
    setIsSubmitting(false);
    if (res.success) {
      handleOpenChange(false);
    } else {
      setError(res.error || "Failed to log payment");
    }
  }

  // Get all budget items linked to the selected vendor
  const linkedItems = categories.flatMap(c => c.items).filter(i => i.vendorId === selectedVendorId);
  const selectedVendor = vendors.find(v => v.id === selectedVendorId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0d1117] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-wide">Record Vendor Payment</DialogTitle>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4 mt-2">
          {error && <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</div>}
          
          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Vendor</label>
            <Select value={selectedVendorId} onValueChange={(val) => setSelectedVendorId(val || "")} required>
              <SelectTrigger className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl h-10">
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e2333] border-white/10 text-white">
                {vendors.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.vendorName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedVendor && (
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Budget Item to Pay</label>
              <Select value={selectedBudgetItemId} onValueChange={(val) => setSelectedBudgetItemId(val || "")} required>
                <SelectTrigger className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl h-10">
                  <SelectValue placeholder="Select linked budget item..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2333] border-white/10 text-white">
                  {linkedItems.length === 0 ? (
                    <div className="p-3 text-sm text-white/40">No budget items linked to this vendor.</div>
                  ) : (
                    linkedItems.map((item: any) => (
                      <SelectItem key={item.id} value={item.id}>{item.title} (Balance: LKR {Math.max(0, item.estimatedCost - item.paidAmount).toLocaleString()})</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Expense Name / Note</label>
              <Input name="expenseName" required placeholder="e.g., Final Installment" className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Payment Type</label>
              <Select name="expenseType" defaultValue="INSTALLMENT">
                <SelectTrigger className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2333] border-white/10 text-white">
                  <SelectItem value="ADVANCE">Advance</SelectItem>
                  <SelectItem value="INSTALLMENT">Installment</SelectItem>
                  <SelectItem value="FINAL_PAYMENT">Final Payment</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Amount Paid (LKR)</label>
            <Input name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00" className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl" />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmitting || !selectedBudgetItemId} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-sm font-medium transition-colors">
              {isSubmitting ? "Saving..." : "Record Payment"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

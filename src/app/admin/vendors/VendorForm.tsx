"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveVendor } from "./actions";
import { Plus, Building2 } from "lucide-react";

export function VendorForm({ existingVendor }: { existingVendor?: any }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");
    if (existingVendor) formData.set("id", existingVendor.id);
    
    const res = await saveVendor(formData);
    setIsSubmitting(false);
    if (res.success) {
      setOpen(false);
    } else {
      setError(res.error || "Failed to save vendor");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {existingVendor ? (
        <DialogTrigger className="text-blue-400/70 hover:text-blue-400 bg-blue-500/10 px-2 py-1 rounded transition-colors text-xs border border-blue-500/20">
          Edit
        </DialogTrigger>
      ) : (
        <DialogTrigger className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all shadow-lg shadow-blue-500/20">
          <Building2 className="w-4 h-4" /> Add Vendor
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] bg-[#0d1117] border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-wide">{existingVendor ? "Edit Vendor" : "New Vendor"}</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4 mt-2">
          {error && <div className="text-sm text-red-400">{error}</div>}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Vendor Business Name</label>
              <Input name="vendorName" defaultValue={existingVendor?.vendorName || ""} required placeholder="e.g., Sparkle Photography" className="bg-white/5 border-white/10 focus:border-blue-500/50 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Category</label>
              <Select name="serviceCategory" defaultValue={existingVendor?.serviceCategory || "Photography"}>
                <SelectTrigger className="bg-white/5 border-white/10 focus:border-blue-500/50 rounded-xl h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2333] border-white/10 text-white">
                  <SelectItem value="Photography">Photography</SelectItem>
                  <SelectItem value="Videography">Videography</SelectItem>
                  <SelectItem value="Venue">Venue</SelectItem>
                  <SelectItem value="Catering">Catering</SelectItem>
                  <SelectItem value="Florist">Florist</SelectItem>
                  <SelectItem value="Attire">Attire</SelectItem>
                  <SelectItem value="Music">Music / DJ</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Contact Name</label>
              <Input name="contactName" defaultValue={existingVendor?.contactName || ""} placeholder="e.g. Sarah Smith" className="bg-white/5 border-white/10 focus:border-blue-500/50 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Email</label>
              <Input name="email" type="email" defaultValue={existingVendor?.email || ""} placeholder="sarah@example.com" className="bg-white/5 border-white/10 focus:border-blue-500/50 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Quoted Amount</label>
              <Input name="quotationAmount" type="number" min="0" step="0.01" defaultValue={existingVendor?.quotationAmount || ""} placeholder="$0.00" className="bg-white/5 border-white/10 focus:border-blue-500/50 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Final Agreed</label>
              <Input name="finalAmount" type="number" min="0" step="0.01" defaultValue={existingVendor?.finalAmount || ""} placeholder="$0.00" className="bg-white/5 border-white/10 focus:border-blue-500/50 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Advance Paid</label>
              <Input name="advancePaid" type="number" min="0" step="0.01" defaultValue={existingVendor?.advancePaid || ""} placeholder="$0.00" className="bg-white/5 border-white/10 focus:border-blue-500/50 rounded-xl" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Next Payment Due Date</label>
            <Input name="nextPaymentDue" type="date" defaultValue={existingVendor?.nextPaymentDue ? new Date(existingVendor.nextPaymentDue).toISOString().split('T')[0] : ""} className="bg-white/5 border-white/10 focus:border-blue-500/50 rounded-xl flex" style={{ colorScheme: 'dark' }} />
          </div>

          <div className="flex justify-end pt-4 border-t border-white/5">
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
              {isSubmitting ? "Saving..." : "Save Vendor"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

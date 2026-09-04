"use client";

import { useState } from "react";
import { Plus, X, Loader2, Edit2 } from "lucide-react";
import { saveContribution } from "./actions";
import { Contribution } from "@prisma/client";

interface ContributionFormProps {
  contribution?: any;
  trigger?: React.ReactNode;
}

export function ContributionForm({ contribution, trigger }: ContributionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!contribution;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    if (isEdit && contribution.id) {
      formData.append("id", contribution.id);
    }

    const result = await saveContribution(formData);
    
    setIsSubmitting(false);
    
    if (result.success) {
      setIsOpen(false);
    } else {
      setError(result.error || "Failed to save contribution");
    }
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger || (
          <button className="flex items-center gap-2 bg-[#BA9B5D] text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#A88A4F] transition-colors">
            <Plus className="w-4 h-4" />
            Add Contribution
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e2333] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-semibold text-white tracking-wide">
                {isEdit ? "Edit Contribution" : "Add Contribution"}
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="text-sm text-red-400">{error}</div>}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                  Contributor Name *
                </label>
                <input
                  type="text"
                  name="contributorName"
                  defaultValue={contribution?.contributorName}
                  required
                  placeholder="e.g. Chathurya's Family"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#BA9B5D] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                    Amount (LKR) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    defaultValue={contribution?.amount}
                    required
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#BA9B5D] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="contributionDate"
                    required
                    defaultValue={contribution?.contributionDate ? new Date(contribution.contributionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#BA9B5D] transition-colors"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    defaultValue={contribution?.paymentMethod || "Bank Transfer"}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#BA9B5D] transition-colors"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card">Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={contribution?.status || "RECEIVED"}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#BA9B5D] transition-colors"
                  >
                    <option value="RECEIVED">RECEIVED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                  Reference No. (Optional)
                </label>
                <input
                  type="text"
                  name="reference"
                  defaultValue={contribution?.reference || ""}
                  placeholder="Txn ID, Cheque No, etc."
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#BA9B5D] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  defaultValue={contribution?.notes || ""}
                  rows={2}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#BA9B5D] transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-[#BA9B5D] text-black px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#A88A4F] transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEdit ? "Update" : "Save"} Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

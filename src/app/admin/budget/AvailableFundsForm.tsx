"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { saveAvailableFunds } from "./actions";
import { useRouter } from "next/navigation";

export function AvailableFundsForm({ currentAmount, lastUpdated, snapshots = [] }: { currentAmount: number, lastUpdated: string | null, snapshots?: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(currentAmount.toString());
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("amount", amount);
    formData.set("effectiveDate", effectiveDate);
    if (note) formData.set("note", note);

    const res = await saveAvailableFunds(formData);

    if (res?.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
      setIsOpen(false);
      setNote("");
      router.refresh();
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-semibold tracking-widest uppercase transition-colors"
      >
        Update Money On Hand
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1e2d] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#BA9B5D]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Set Available Funds</h2>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white/80 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5">
                  Current Money on Hand (LKR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#BA9B5D]"
                  placeholder="e.g. 500000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5">
                  Effective Date *
                </label>
                <input
                  type="date"
                  required
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#BA9B5D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5">
                  Note / Source
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#BA9B5D]"
                  placeholder="e.g. Current available wedding fund"
                />
              </div>

              {snapshots.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/5">
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Update History</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {snapshots.map((s) => (
                      <div key={s.id} className="flex justify-between items-center text-xs p-2 rounded bg-white/5">
                        <div>
                          <p className="text-white/80">LKR {Number(s.amount).toLocaleString()}</p>
                          <p className="text-white/40">{new Date(s.effectiveDate).toLocaleDateString()} {s.note ? `- ${s.note}` : ''}</p>
                        </div>
                        <p className="text-white/40">{s.updatedBy?.fullName || "Admin"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

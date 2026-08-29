"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveGuestAction } from "./actions";

export function GuestForm({ existingGuest }: { existingGuest?: any }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isNewParam = searchParams.get("new") === "true";

  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [side, setSide] = useState(existingGuest?.side || "BRIDE");

  useEffect(() => {
    if (isNewParam && !existingGuest) {
      setOpen(true);
      // Clean up the URL so it doesn't reopen if they refresh
      router.replace(pathname, { scroll: false });
    }
  }, [isNewParam, existingGuest, router, pathname]);

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");
    formData.set("side", side);
    
    if (existingGuest?.id) {
      formData.set("id", existingGuest.id);
    }
    
    const res = await saveGuestAction(formData);
    setIsSubmitting(false);
    if (res.success) {
      setOpen(false);
    } else {
      setError(res.error || "An error occurred");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 text-sm font-sans transition-all duration-200 group">
        {!existingGuest && <span className="text-lg leading-none transition-transform duration-200 group-hover:rotate-90">+</span>}
        {existingGuest ? "Edit Guest" : "Add Guest"}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto bg-[#0d1117] border border-white/10 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-white/90 tracking-wide">
            {existingGuest ? "Edit Invitation" : "New Invitation"}
          </DialogTitle>
          <p className="text-white/30 text-sm font-sans">
            {existingGuest ? "Update guest details and counts." : "A unique invitation code will be generated automatically."}
          </p>
        </DialogHeader>

        <form action={onSubmit} className="space-y-5 mt-2">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 font-sans">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Display Name</label>
            <Input
              name="displayName"
              required
              defaultValue={existingGuest?.displayName || ""}
              placeholder="e.g. Mr. & Mrs. Perera"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:ring-0 rounded-xl h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Type</label>
              <Select name="invitationType" defaultValue={existingGuest?.invitationType || "INDIVIDUAL"}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-emerald-500/50 focus:ring-0 rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1117] border-white/10 text-white">
                  <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                  <SelectItem value="FAMILY">Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Allowed Seats</label>
              <Input
                type="number"
                name="allowedGuestCount"
                required
                min={1}
                defaultValue={existingGuest?.allowedGuestCount || 1}
                className="bg-white/5 border-white/10 text-white focus:border-emerald-500/50 focus:ring-0 rounded-xl h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Side</label>
              <Select name="side" value={side} onValueChange={setSide}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-emerald-500/50 focus:ring-0 rounded-xl h-11">
                  <SelectValue>
                    {side === "BRIDE" ? "Bride's Side" : side === "GROOM" ? "Groom's Side" : "Both"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#0d1117] border-white/10 text-white">
                  <SelectItem value="BRIDE">Bride's Side</SelectItem>
                  <SelectItem value="GROOM">Groom's Side</SelectItem>
                  <SelectItem value="BOTH">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Liquor Count</label>
              <Input
                type="number"
                name="liquorCount"
                min={0}
                defaultValue={existingGuest?.liquorCount || 0}
                className="bg-white/5 border-white/10 text-white focus:border-emerald-500/50 focus:ring-0 rounded-xl h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">WhatsApp Number</label>
            <Input
              name="whatsappNumber"
              defaultValue={existingGuest?.whatsappNumber || ""}
              placeholder="+94770000000"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:ring-0 rounded-xl h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Email Address</label>
            <Input
              type="email"
              name="email"
              defaultValue={existingGuest?.email || ""}
              placeholder="guest@example.com"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:ring-0 rounded-xl h-11"
            />
          </div>

          <div className="flex justify-end pt-2 gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm font-sans transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-sm font-sans font-medium transition-all duration-200 shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? "Saving…" : "Save Guest"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

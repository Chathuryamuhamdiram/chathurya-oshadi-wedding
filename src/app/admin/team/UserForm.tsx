"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveUserAction } from "./actions";
import { Pencil } from "lucide-react";

export function UserForm({ existingUser }: { existingUser?: any }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState(existingUser?.role || "FAMILY_MEMBER");

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");
    if (existingUser) {
      formData.append("id", existingUser.id);
    }
    const res = await saveUserAction(formData);
    setIsSubmitting(false);
    if (res.success) {
      setOpen(false);
    } else {
      setError(res.error || "An error occurred");
    }
  }

  // Module permissions are now managed by roles.

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {existingUser ? (
        <DialogTrigger className="p-2 text-white/40 hover:text-emerald-400 transition-colors">
          <Pencil className="w-4 h-4" />
        </DialogTrigger>
      ) : (
        <DialogTrigger className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 text-sm font-sans transition-all duration-200 group">
          <span className="text-lg leading-none transition-transform duration-200 group-hover:rotate-90">+</span>
          Add Person
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[425px] bg-[#0d1117] border border-white/10 text-white shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-white/90 tracking-wide">{existingUser ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
          <p className="text-white/30 text-sm font-sans">{existingUser ? "Update their details or permissions." : "Create a login account for a team member."}</p>
        </DialogHeader>

        <form action={onSubmit} className="space-y-5 mt-2">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 font-sans">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Full Name</label>
            <Input
              name="fullName"
              required
              defaultValue={existingUser?.fullName || ""}
              placeholder="e.g. Uncle Samantha"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:ring-0 rounded-xl h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Email (Used for login)</label>
            <Input
              name="email"
              type="email"
              required
              defaultValue={existingUser?.email || ""}
              placeholder="sam@example.com"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:ring-0 rounded-xl h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">{existingUser ? "New Password" : "Password"}</label>
              <Input
                name="password"
                type="password"
                required={!existingUser}
                placeholder={existingUser ? "Leave blank to keep" : "******"}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:ring-0 rounded-xl h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Phone</label>
              <Input
                name="phone"
                defaultValue={existingUser?.phone || ""}
                placeholder="077 123 4567"
                className="bg-white/5 border-white/10 text-white focus:border-emerald-500/50 focus:ring-0 rounded-xl h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Role</label>
            <Select name="role" value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-emerald-500/50 focus:ring-0 rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1117] border-white/10 text-white">
                <SelectItem value="FAMILY_MEMBER">Family Member (Portal Only)</SelectItem>
                <SelectItem value="ADMIN">Admin (Dashboard Access)</SelectItem>
              </SelectContent>
            </Select>
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
              {isSubmitting ? "Saving…" : "Save Team Member"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

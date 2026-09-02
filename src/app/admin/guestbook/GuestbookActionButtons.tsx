"use client";

import { useState } from "react";
import { Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import { toggleGuestbookVisibility, deleteGuestbookEntry } from "./actions";

import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";

export function GuestbookActionButtons({ id, isPublic, authorName }: { id: string, isPublic: boolean, authorName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    await toggleGuestbookVisibility(id, isPublic);
    setIsToggling(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteGuestbookEntry(id);
    setIsDeleting(false);
    setDeleteOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleToggle}
        disabled={isToggling}
        className={`p-2 rounded-lg transition-colors ${
          isPublic 
            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
            : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
        }`}
        title={isPublic ? "Make Private" : "Make Public"}
      >
        {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>

      <button 
        onClick={() => setDeleteOpen(true)}
        disabled={isDeleting}
        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
        title="Delete Message"
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>

      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Guestbook Entry?"
        recordName={authorName}
        description="Are you sure you want to permanently delete this guestbook message?"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
}

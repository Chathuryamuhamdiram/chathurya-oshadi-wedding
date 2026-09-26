"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { deleteGuestAction } from "./actions";

export function DeleteGuestButton({ 
  guest, 
  onOptimisticDelete,
  onOptimisticRollback,
  compact
}: { 
  guest: { id: string; displayName: string },
  onOptimisticDelete?: () => void,
  onOptimisticRollback?: () => void,
  compact?: boolean
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    if (onOptimisticDelete) {
      onOptimisticDelete();
    }
    const res = await deleteGuestAction(guest.id);
    setLoading(false);
    if (res.success) {
      setOpen(false);
    } else {
      if (onOptimisticRollback) {
        onOptimisticRollback();
      }
      alert(res.error || "Failed to delete guest.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={compact
          ? "h-[32px] px-2 flex items-center justify-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg transition-all shrink-0 whitespace-nowrap"
          : "p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all duration-200"}
        title="Delete Guest"
      >
        <Trash2 className="w-3.5 h-3.5" />
        {compact && <span>Delete</span>}
      </button>

      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Guest?"
        recordName={guest.displayName}
        description={
          <>
            <p>You are about to permanently delete this guest.</p>
            <p className="text-red-400/90 font-medium mt-2">This will also remove their personalized invitation, RSVP data, and seating assignments.</p>
            <p className="mt-2">This action cannot be undone.</p>
          </>
        }
        onConfirm={handleDelete}
        loading={loading}
        requiresTypedConfirmation={false}
      />
    </>
  );
}

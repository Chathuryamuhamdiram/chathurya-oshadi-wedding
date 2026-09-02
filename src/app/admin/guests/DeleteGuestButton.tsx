"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { deleteGuestAction } from "./actions";

export function DeleteGuestButton({ guest }: { guest: { id: string; displayName: string } }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteGuestAction(guest.id);
    setLoading(false);
    if (res.success) {
      setOpen(false);
    } else {
      alert(res.error || "Failed to delete guest.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all duration-200"
        title="Delete Guest"
      >
        <Trash2 className="w-4 h-4" />
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

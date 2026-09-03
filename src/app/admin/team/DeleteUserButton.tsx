"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { deleteUserAction } from "./actions";

export function DeleteUserButton({ user }: { user: { id: string; fullName: string } }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteUserAction(user.id);
    setIsDeleting(false);
    if (res.success) {
      setOpen(false);
    } else {
      alert(res.error || "Failed to delete user.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-white/40 hover:text-red-400 transition-colors"
        title="Delete User"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Team Member?"
        description={
          <div className="space-y-2">
            <p>You are about to permanently delete <strong>{user.fullName}</strong>.</p>
            <p className="text-red-400">This action cannot be undone. Their tasks will become unassigned.</p>
          </div>
        }
        onConfirm={handleDelete}
        loading={isDeleting}
        requiresTypedConfirmation={true}
        confirmationText="DELETE"
        confirmButtonText="Delete"
      />
    </>
  );
}

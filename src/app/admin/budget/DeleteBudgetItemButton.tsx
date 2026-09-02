"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { deleteBudgetItem } from "./actions";

export function DeleteBudgetItemButton({ id, title }: { id: string, title: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteBudgetItem(id);
    setLoading(false);
    if (res.success) {
      setOpen(false);
    } else {
      alert(res.error || "Failed to delete budget item.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-red-400/70 hover:text-red-400 bg-red-500/10 px-2 py-1 rounded transition-colors text-xs border border-red-500/20 inline-flex items-center"
        title="Delete Budget Item"
      >
        <Trash2 className="w-3 h-3" />
      </button>

      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Budget Item?"
        recordName={title}
        description="You are about to permanently delete this budget item. This action cannot be undone."
        requiresTypedConfirmation={true}
        confirmationText="DELETE"
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}

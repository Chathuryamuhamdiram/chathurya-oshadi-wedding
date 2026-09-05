"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { deleteBudgetCategory } from "./actions";

export function DeleteBudgetCategoryButton({ id, name }: { id: string, name: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteBudgetCategory(id);
    setLoading(false);
    if (res.success) {
      setOpen(false);
    } else {
      alert(res.error || "Failed to delete budget category.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors ml-3"
        title="Delete Category"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Budget Category?"
        recordName={name}
        description="You are about to permanently delete this budget category. This action cannot be undone, and you cannot delete a category if it contains budget items."
        requiresTypedConfirmation={true}
        confirmationText="DELETE"
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}

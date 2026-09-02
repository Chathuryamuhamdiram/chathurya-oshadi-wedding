"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { deleteExpense } from "./actions";

export function DeleteExpenseButton({ id, expenseName, amount }: { id: string, expenseName: string, amount: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteExpense(id);
    setLoading(false);
    if (res.success) {
      setOpen(false);
    } else {
      alert(res.error || "Failed to delete expense.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-red-400 hover:text-red-300 p-1 hover:bg-red-400/10 rounded transition-colors"
        title="Delete Expense"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Payment/Expense?"
        recordName={`${expenseName} - $${amount.toLocaleString()}`}
        description="You are about to permanently delete this payment. The budget item's total paid amount and status will be recalculated."
        requiresTypedConfirmation={true}
        confirmationText="DELETE"
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}

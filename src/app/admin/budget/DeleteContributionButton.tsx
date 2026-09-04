"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { deleteContribution } from "./actions";

export function DeleteContributionButton({ 
  id, 
  contributorName, 
  amount 
}: { 
  id: string; 
  contributorName: string;
  amount: number;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");
    const result = await deleteContribution(id);
    
    if (result.success) {
      setShowDelete(false);
    } else {
      setError(result.error || "Failed to delete contribution");
    }
    setIsDeleting(false);
  };

  return (
    <>
      <button
        onClick={() => setShowDelete(true)}
        className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
        title="Delete Contribution"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <DeleteConfirmationDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        title="Delete Contribution"
        description={
          <>
            Are you sure you want to delete the contribution of LKR {amount.toLocaleString()} from {contributorName}? This action cannot be undone.
            {error && <div className="mt-2 text-sm text-red-500 font-medium">{error}</div>}
          </>
        }
        loading={isDeleting}
        requiresTypedConfirmation={true}
      />
    </>
  );
}

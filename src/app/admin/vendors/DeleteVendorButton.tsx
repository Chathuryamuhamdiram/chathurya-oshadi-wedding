"use client";

import { useState } from "react";
import { Trash2, ArchiveRestore } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { deleteVendor, restoreVendor } from "./actions";

export function DeleteVendorButton({ 
  id, 
  vendorName, 
  isArchived 
}: { 
  id: string, 
  vendorName: string,
  isArchived: boolean
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteVendor(id);
    setLoading(false);
    if (res.success) {
      setOpen(false);
    } else {
      alert(res.error || "Failed to delete vendor.");
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    const res = await restoreVendor(id);
    setLoading(false);
    if (!res.success) {
      alert(res.error || "Failed to restore vendor.");
    }
  };

  if (isArchived) {
    return (
      <button
        onClick={handleRestore}
        disabled={loading}
        className="text-emerald-400/70 hover:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded transition-colors text-xs border border-emerald-500/20 inline-flex items-center gap-1 disabled:opacity-50"
        title="Restore Vendor"
      >
        <ArchiveRestore className="w-3 h-3" /> Restore
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-colors inline-block"
        title="Delete Vendor"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Vendor?"
        recordName={vendorName}
        description={
          <>
            <p>You are about to delete this vendor.</p>
            <p className="mt-2 text-amber-400/90 text-sm">
              Note: If this vendor has linked financial history (budget items, expenses, etc.), they will be archived instead of permanently deleted to preserve financial records.
            </p>
          </>
        }
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}

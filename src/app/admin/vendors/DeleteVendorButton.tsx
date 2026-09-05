"use client";

import { useState } from "react";
import { Trash2, ArchiveRestore, Archive } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { deleteVendor, restoreVendor, archiveVendor } from "./actions";

export function DeleteVendorButton({ 
  id, 
  vendorName, 
  isArchived 
}: { 
  id: string, 
  vendorName: string,
  isArchived: boolean
}) {
  const [openDelete, setOpenDelete] = useState(false);
  const [openArchive, setOpenArchive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteVendor(id);
    setLoading(false);
    if (res.success) {
      setOpenDelete(false);
    } else {
      alert(res.error || "Failed to delete vendor.");
    }
  };

  const handleArchive = async () => {
    setLoading(true);
    const res = await archiveVendor(id);
    setLoading(false);
    if (res.success) {
      setOpenArchive(false);
    } else {
      alert(res.error || "Failed to archive vendor.");
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
        onClick={() => setOpenArchive(true)}
        className="p-2 rounded hover:bg-amber-500/10 text-amber-400/70 hover:text-amber-400 border border-transparent hover:border-amber-500/20 transition-colors inline-block"
        title="Archive Vendor"
      >
        <Archive className="w-4 h-4" />
      </button>

      <button
        onClick={() => setOpenDelete(true)}
        className="p-2 rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-colors inline-block"
        title="Delete Vendor"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <DeleteConfirmationDialog
        open={openArchive}
        onOpenChange={setOpenArchive}
        title="Archive Vendor?"
        recordName={vendorName}
        description={
          <>
            <p>You are about to archive this vendor.</p>
            <p className="mt-2 text-amber-400/90 text-sm">
              Archiving hides the vendor from the main active view but preserves their financial history.
            </p>
          </>
        }
        onConfirm={handleArchive}
        loading={loading}
      />

      <DeleteConfirmationDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Delete Vendor?"
        recordName={vendorName}
        description={
          <>
            <p>You are about to permanently delete this vendor.</p>
            <p className="mt-2 text-red-400/90 text-sm">
              This vendor cannot be deleted if they have linked budget items. You must unlink them or archive them instead.
            </p>
          </>
        }
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}

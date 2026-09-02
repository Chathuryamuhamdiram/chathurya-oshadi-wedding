"use client";

import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { deleteGalleryImage } from "./actions";

export function DeleteGalleryButton({ id, altText }: { id: string, altText: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteGalleryImage(id);
    setLoading(false);
    if (res.success) {
      setOpen(false);
    } else {
      alert(res.error || "Failed to delete image.");
    }
  };

  return (
    <>
      <button 
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
      >
        Delete
      </button>

      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Image?"
        recordName={altText || "Gallery Image"}
        description={
          <>
            <p>You are about to permanently delete this image from the gallery.</p>
            <p className="mt-2 text-red-500 font-medium text-sm">Note: Only Super Admins can perform this action.</p>
          </>
        }
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}

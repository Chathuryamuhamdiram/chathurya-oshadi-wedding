"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { deleteEventAction, deleteVenueAction, deleteEventItemAction } from "./actions";

export function DeleteEventButton({ 
  id, 
  title, 
  type 
}: { 
  id: string, 
  title: string, 
  type: "event" | "venue" | "item" 
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    let res;
    if (type === "event") res = await deleteEventAction(id);
    else if (type === "venue") res = await deleteVenueAction(id);
    else res = await deleteEventItemAction(id);
    
    setLoading(false);
    if (res.success) {
      setOpen(false);
    } else {
      alert(res.error || `Failed to delete ${type}.`);
    }
  };

  const descriptions = {
    event: "You are about to permanently delete this wedding event and all its associated items.",
    venue: "You are about to permanently delete this venue.",
    item: "You are about to remove this checklist item."
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
        title={`Delete ${type}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title={`Delete ${type === 'item' ? 'Item' : type === 'venue' ? 'Venue' : 'Event'}?`}
        recordName={title}
        description={
          <>
            <p>{descriptions[type]}</p>
            <p className="mt-2 font-medium text-red-400">This action cannot be undone.</p>
          </>
        }
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}

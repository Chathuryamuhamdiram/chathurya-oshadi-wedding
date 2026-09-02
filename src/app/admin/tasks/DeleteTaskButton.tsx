"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { deleteTask } from "./actions";
import { useRouter } from "next/navigation";

export function DeleteTaskButton({ task, redirectAfter = false }: { task: { id: string; title: string }, redirectAfter?: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteTask(task.id);
    setLoading(false);
    if (res.success) {
      setOpen(false);
      if (redirectAfter) {
        router.push("/admin/tasks");
      }
    } else {
      alert(res.error || "Failed to delete task.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-colors"
        title="Delete Task"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Task?"
        recordName={task.title}
        description={
          <>
            <p>You are about to permanently delete this task.</p>
            <p className="text-red-400/90 font-medium mt-2">This will also remove all associated comments, reminders, and file attachments.</p>
            <p className="mt-2">This action cannot be undone.</p>
          </>
        }
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}

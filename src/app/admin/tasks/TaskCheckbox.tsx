"use client";

import { useTransition } from "react";
import { updateTaskStatus } from "./actions";
import { Check } from "lucide-react";

export function TaskCheckbox({ taskId, isCompleted }: { taskId: string, isCompleted: boolean }) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await updateTaskStatus(taskId, !isCompleted);
    });
  }

  return (
    <button 
      onClick={toggle}
      disabled={isPending}
      className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
        isCompleted 
          ? "bg-emerald-500 border-emerald-500 text-white" 
          : "bg-white/5 border-white/20 text-transparent hover:border-emerald-400"
      } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <Check className="w-4 h-4" />
    </button>
  );
}

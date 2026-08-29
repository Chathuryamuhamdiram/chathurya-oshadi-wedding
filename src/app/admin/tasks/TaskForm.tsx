"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveTask } from "./actions";
import { Plus } from "lucide-react";

export function TaskForm({ users, existingTask }: { users: any[], existingTask?: any }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  let initialReminderType = "none";
  let initialCustomDate = "";
  if (existingTask?.reminderSettings) {
    try {
      const parsed = JSON.parse(existingTask.reminderSettings);
      if (parsed.customDate) {
        initialReminderType = "CUSTOM";
        initialCustomDate = parsed.customDate;
      } else if (parsed.remindAt && parsed.remindAt.length > 0) {
        initialReminderType = parsed.remindAt[0];
      }
    } catch(e) {}
  }
  
  const [reminderType, setReminderType] = useState(initialReminderType);
  const [assignedUserId, setAssignedUserId] = useState(existingTask?.assignedUserId || "none");
  const [status, setStatus] = useState(existingTask?.status || "NOT_STARTED");

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");
    if (existingTask) formData.set("id", existingTask.id);
    
    // Add custom date to formData if custom is selected
    if (reminderType === "CUSTOM") {
      formData.set("reminderType", "CUSTOM");
    } else {
      formData.set("reminderType", reminderType);
    }
    
    const res = await saveTask(formData);
    setIsSubmitting(false);
    if (res.success) {
      setOpen(false);
    } else {
      setError(res.error || "Failed to save task");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {existingTask ? (
        <DialogTrigger className="text-emerald-400/70 hover:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded transition-colors text-xs">
          Edit
        </DialogTrigger>
      ) : (
        <DialogTrigger className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-all shadow-lg shadow-emerald-500/20">
          <Plus className="w-4 h-4" /> Add Task
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] bg-[#0d1117] border-white/10 text-white overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-wide">{existingTask ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4 mt-2">
          {error && <div className="text-sm text-red-400">{error}</div>}
          
          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Task Title</label>
            <Input name="title" defaultValue={existingTask?.title || ""} required placeholder="e.g., Book Photographer" className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-widest text-white/40">Description (Optional)</label>
            <Input name="description" defaultValue={existingTask?.description || ""} placeholder="Add details..." className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Category</label>
              <Input name="category" defaultValue={existingTask?.category || ""} placeholder="e.g. Venue, Attire" className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Priority</label>
              <Select name="priority" defaultValue={existingTask?.priority || "MEDIUM"}>
                <SelectTrigger className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2333] border-white/10 text-white">
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Start Date</label>
              <Input name="startDate" type="date" defaultValue={existingTask?.startDate ? new Date(existingTask.startDate).toISOString().split('T')[0] : ""} className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl flex" style={{ colorScheme: 'dark' }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Due Date</label>
              <Input name="dueDate" type="date" defaultValue={existingTask?.dueDate ? new Date(existingTask.dueDate).toISOString().split('T')[0] : ""} className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl flex" style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Reminders</label>
              <Select value={reminderType} onValueChange={setReminderType}>
                <SelectTrigger className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2333] border-white/10 text-white">
                  <SelectItem value="none">No Reminders</SelectItem>
                  <SelectItem value="7_DAYS_BEFORE">1 Week Before</SelectItem>
                  <SelectItem value="3_DAYS_BEFORE">3 Days Before</SelectItem>
                  <SelectItem value="1_DAY_BEFORE">1 Day Before</SelectItem>
                  <SelectItem value="DUE_TODAY">On Due Date</SelectItem>
                  <SelectItem value="CUSTOM">Custom Date & Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Assign To (Optional)</label>
              <Select name="assignedUserId" value={assignedUserId} onValueChange={setAssignedUserId}>
                <SelectTrigger className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl h-10">
                  <SelectValue placeholder="Select family member">
                    {assignedUserId === "none" ? "Unassigned" : (users.find(u => u.id === assignedUserId)?.fullName || "Unknown User")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#1e2333] border-white/10 text-white">
                  <SelectItem value="none">Unassigned</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {reminderType === "CUSTOM" && (
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40 text-emerald-400">Custom Reminder Date & Time</label>
              <Input name="customReminderDate" type="datetime-local" defaultValue={initialCustomDate} required className="bg-emerald-500/10 border-emerald-500/30 focus:border-emerald-500/50 rounded-xl flex" style={{ colorScheme: 'dark' }} />
            </div>
          )}

          {existingTask && (
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-white/40">Status</label>
              <Select name="status" value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2333] border-white/10 text-white">
                  <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="WAITING">Waiting on someone</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/5">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20">
              {isSubmitting ? "Saving..." : "Save Task"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

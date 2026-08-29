"use client";

import { useState } from "react";
import { Plus, Check, Trash2, Download, ListTodo } from "lucide-react";
import { saveEventItemAction, toggleEventItemStatusAction, deleteEventItemAction } from "./actions";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

export function EventItemList({ 
  eventId, 
  eventTitle,
  initialItems 
}: { 
  eventId: string;
  initialItems: { id: string; name: string; quantity: number; status: string }[];
}) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const res = await saveEventItemAction(eventId, newItemName, newItemQuantity);
    if (res.success) {
      setNewItemName("");
      setNewItemQuantity(1);
    } else {
      alert(res.error || "Failed to add item");
    }
    setIsSubmitting(false);
  }

  async function handleToggle(id: string, currentStatus: string) {
    const res = await toggleEventItemStatusAction(id, currentStatus);
    if (!res.success) {
      alert(res.error || "Failed to update item");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const res = await deleteEventItemAction(id);
    if (!res.success) {
      alert(res.error || "Failed to delete item");
    }
  }

  function downloadPDF() {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`${eventTitle} - Requirements Checklist`, 14, 22);

    // Table
    const tableData = initialItems.map(item => [
      item.name, 
      item.quantity.toString(),
      item.status === "BOUGHT" ? "Yes" : "Pending"
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Item Description", "Qty", "Bought / Status"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }, // Emerald-500
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Checklist.pdf`);
  }

  return (
    <div className="mt-6 pt-6 border-t border-white/[0.06] flex flex-wrap items-center gap-3">
      <Dialog>
        <DialogTrigger className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors text-sm font-medium">
          <ListTodo className="w-4 h-4" /> Requirements Checklist
        </DialogTrigger>
        <DialogContent className="bg-[#11141d] border-white/10 text-white max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">{eventTitle} Checklist</DialogTitle>
            <DialogDescription className="text-white/50">Manage items needed for this event.</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <div className="space-y-2 mb-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {initialItems.map(item => {
                const isBought = item.status === "BOUGHT";
                return (
                  <div key={item.id} className="flex items-center justify-between group bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggle(item.id, item.status)}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                          isBought 
                            ? "bg-emerald-500 border-emerald-500 text-white" 
                            : "bg-white/5 border-white/20 text-transparent hover:border-emerald-500/50"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <span className={`text-sm font-sans transition-colors break-words ${isBought ? "text-white/40 line-through" : "text-white/90 group-hover:text-white"}`}>
                        {item.name} <span className="text-white/40 ml-2 text-xs">x{item.quantity}</span>
                      </span>
                    </label>
                    
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 ml-2 shrink-0 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              {initialItems.length === 0 && (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                  <p className="text-white/40 text-sm font-sans">No items added yet.</p>
                </div>
              )}
            </div>

            <form onSubmit={handleAddItem} className="flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                placeholder="Add new requirement..."
                disabled={isSubmitting}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none transition-colors"
              />
              <input
                type="number"
                min="1"
                value={newItemQuantity}
                onChange={e => setNewItemQuantity(parseInt(e.target.value) || 1)}
                disabled={isSubmitting}
                className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-center text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!newItemName.trim() || isSubmitting}
                className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <button 
        onClick={downloadPDF}
        disabled={initialItems.length === 0}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors text-sm font-medium disabled:opacity-50"
      >
        <Download className="w-4 h-4" /> PDF
      </button>
    </div>
  );
}

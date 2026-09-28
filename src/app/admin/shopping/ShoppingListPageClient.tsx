"use client";

import { useState } from "react";
import { Plus, ShoppingCart, Archive, FolderOpen, Calendar, Trash2 } from "lucide-react";
import Link from "next/link";
import { createShoppingList, updateShoppingList, deleteShoppingList, duplicateShoppingList } from "./actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { hasPermission, PERMISSIONS, type PermissionCode } from "@/lib/permissions";
import { format } from "date-fns";

type ShoppingListType = {
  id: string;
  name: string;
  eventContext: string | null;
  eventId: string | null;
  shoppingDate: string | null;
  notes: string | null;
  status: string;
  items: { id: string; isBought: boolean }[];
  event: { id: string; name: string; eventType: string } | null;
};

export default function ShoppingListPageClient({ lists, role, permissions, events }: { lists: ShoppingListType[], role: string, permissions: string[], events: { id: string, name: string, eventType: string }[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState<"ACTIVE" | "ARCHIVED" | "COMPLETED">("ACTIVE");
  const [formData, setFormData] = useState({ name: "", eventContext: "", eventId: "", shoppingDate: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate = hasPermission(role, permissions, PERMISSIONS.SHOPPING_CREATE as PermissionCode);
  const canDelete = hasPermission(role, permissions, PERMISSIONS.SHOPPING_DELETE as PermissionCode);

  const filteredLists = lists.filter(l => l.status === filter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setIsSubmitting(true);
    try {
      await createShoppingList({
        name: formData.name,
        eventContext: formData.eventContext || undefined,
        eventId: formData.eventId || undefined,
        shoppingDate: formData.shoppingDate ? new Date(formData.shoppingDate) : undefined,
        notes: formData.notes
      });
      setIsCreateOpen(false);
      setFormData({ name: "", eventContext: "", eventId: "", shoppingDate: "", notes: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";
    await updateShoppingList(id, { status: newStatus });
  };

  const handleDuplicate = async (list: ShoppingListType) => {
    const newName = prompt("Enter new list name:", `${list.name} (Copy)`);
    if (!newName) return;
    await duplicateShoppingList(list.id, newName, list.eventContext || undefined, list.eventId || undefined);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this shopping list? This cannot be undone and will delete all items within it.")) {
      await deleteShoppingList(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-emerald-400" />
            Shopping Lists
          </h1>
          <p className="text-white/60 mt-1">Manage your shopping requirements across all events.</p>
        </div>
        
        {canCreate && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5" />
            New Shopping List
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {["ACTIVE", "COMPLETED", "ARCHIVED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as "ACTIVE" | "ARCHIVED" | "COMPLETED")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === status 
                ? "bg-white/10 text-white" 
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLists.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
            <ShoppingCart className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60">No {filter.toLowerCase()} shopping lists found.</p>
          </div>
        ) : (
          filteredLists.map((list) => {
            const total = list.items.length;
            const bought = list.items.filter((i) => i.isBought).length;
            const progress = total === 0 ? 0 : Math.round((bought / total) * 100);

            return (
              <div key={list.id} className="group bg-[#1e2333] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all shadow-xl hover:shadow-emerald-500/5 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{list.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-white/50 mt-1">
                      {list.eventContext && <span className="bg-white/5 px-2 py-0.5 rounded-md">{list.eventContext}</span>}
                      {list.event && <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md">{list.event.name}</span>}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/60">{bought} / {total} Bought</span>
                    <span className="text-white font-medium">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-emerald-500/70'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-white/40 mb-5">
                  {list.shoppingDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(list.shoppingDate), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>

                <div className="mt-auto flex items-center gap-2 pt-4 border-t border-white/5">
                  <Link 
                    href={`/admin/shopping/${list.id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Open
                  </Link>
                  <button 
                    onClick={() => handleArchive(list.id, list.status)}
                    className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-colors"
                    title={list.status === "ARCHIVED" ? "Unarchive" : "Archive"}
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  {canCreate && (
                    <button 
                      onClick={() => handleDuplicate(list)}
                      className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-emerald-400 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button 
                      onClick={() => handleDelete(list.id)}
                      className="p-2 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#1e2333] border-white/10 text-white p-6 max-w-md">
          <DialogHeader>
            <DialogTitle>New Shopping List</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">List Name *</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="e.g. Wedding Essentials"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Context (Optional)</label>
              <select 
                value={formData.eventContext}
                onChange={e => setFormData({...formData, eventContext: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="" className="bg-[#1e2333]">General</option>
                <option value="Wedding" className="bg-[#1e2333]">Wedding</option>
                <option value="Homecoming" className="bg-[#1e2333]">Homecoming</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Link to Event (Optional)</label>
              <select 
                value={formData.eventId}
                onChange={e => setFormData({...formData, eventId: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="" className="bg-[#1e2333]">None</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id} className="bg-[#1e2333]">{ev.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Shopping Date (Optional)</label>
              <input 
                type="date" 
                value={formData.shoppingDate}
                onChange={e => setFormData({...formData, shoppingDate: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Notes</label>
              <textarea 
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[80px]"
                placeholder="Optional notes..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => setIsCreateOpen(false)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || !formData.name}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
              >
                {isSubmitting ? "Creating..." : "Create List"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

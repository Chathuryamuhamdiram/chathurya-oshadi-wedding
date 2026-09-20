"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Square, Trash2, Edit2, Plus, Check } from "lucide-react";
import { toggleTaskItem, deleteTaskItem, updateTaskItemName, saveTaskItem } from "../actions";
import { BulkPasteModal } from "./BulkPasteModal";

export function TaskItemsClient({ task, currentUserId }: { task: any, currentUserId: string }) {
  const [items, setItems] = useState(task.items || []);
  const [newItemName, setNewItemName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setItems(task.items || []);
  }, [task.items]);

  const completedCount = items.filter((i: any) => i.completed).length;
  const totalCount = items.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  async function handleToggle(id: string, completed: boolean) {
    setItems(items.map((i: any) => i.id === id ? { ...i, completed } : i));
    await toggleTaskItem(id, completed);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setItems(items.filter((i: any) => i.id !== id));
    await deleteTaskItem(id);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setIsSubmitting(true);
    await saveTaskItem(task.id, newItemName.trim());
    setNewItemName("");
    setIsSubmitting(false);
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) return;
    setItems(items.map((i: any) => i.id === id ? { ...i, name: editName.trim() } : i));
    await updateTaskItemName(id, editName.trim());
    setEditingId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Task Items</h3>
        <BulkPasteModal taskId={task.id} existingItems={items} />
      </div>
      
      {totalCount > 0 && (
        <div className="mb-6 bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-white/60">Progress</span>
            <span className="text-emerald-400 font-medium">{progressPct}% ({completedCount}/{totalCount})</span>
          </div>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-2 mb-6">
        {items.length === 0 ? (
          <p className="text-white/40 text-sm">No items added yet. Add items to track progress.</p>
        ) : (
          items.map((item: any) => (
            <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${item.completed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center gap-3 flex-1">
                <button onClick={() => handleToggle(item.id, !item.completed)} className={`text-xl transition-colors ${item.completed ? 'text-emerald-500' : 'text-white/30 hover:text-white/60'}`}>
                  {item.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </button>
                
                {editingId === item.id ? (
                  <div className="flex-1 flex gap-2">
                    <input 
                      autoFocus
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(item.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="flex-1 bg-black/40 text-sm text-white px-2 py-1 rounded border border-white/20 focus:outline-none focus:border-emerald-500"
                    />
                    <button onClick={() => handleSaveEdit(item.id)} className="text-emerald-400 hover:text-emerald-300 p-1">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className={`text-sm ${item.completed ? 'text-white/40 line-through' : 'text-white/90'}`}>
                    {item.name}
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingId(item.id); setEditName(item.name); }}
                  className="text-white/40 hover:text-white transition-colors p-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400/70 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input 
          type="text" 
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add a new item..." 
          disabled={isSubmitting}
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
        />
        <button type="submit" disabled={isSubmitting || !newItemName.trim()} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg text-sm transition-colors font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>
    </div>
  );
}

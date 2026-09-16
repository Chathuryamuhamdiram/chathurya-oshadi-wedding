"use client";

import { useState } from "react";
import { EventPlanItem } from "@prisma/client";
import { saveEventPlanItem, deleteEventPlanItem, reorderEventPlanItems } from "./actions";
import { EventPlanBulkImport } from "./EventPlanBulkImport";
import { ArrowUp, ArrowDown, Edit2, Trash2, Plus, Clock, FileDown, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/ui/TimePicker";

interface EventPlanClientProps {
  items: EventPlanItem[];
  eventId: string;
  eventName: string;
  isAllEvents: boolean;
}

export function EventPlanClient({ items: initialItems, eventId, eventName, isAllEvents }: EventPlanClientProps) {
  const [items, setItems] = useState(initialItems);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formActivity, setFormActivity] = useState("");
  const [formTime, setFormTime] = useState("");

  const handleMove = async (index: number, direction: -1 | 1) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === items.length - 1)) return;

    const newItems = [...items];
    const itemToMove = newItems[index];
    
    // Swap
    newItems[index] = newItems[index + direction];
    newItems[index + direction] = itemToMove;
    
    // Update sortOrder values locally
    const updatedWithOrder = newItems.map((item, i) => ({ ...item, sortOrder: i * 10 }));
    setItems(updatedWithOrder as EventPlanItem[]);

    // Save to DB
    await reorderEventPlanItems(updatedWithOrder.map(i => ({ id: i.id, sortOrder: i.sortOrder })));
  };

  const handleSave = async (id: string | null) => {
    if (!formActivity.trim()) return;

    // Use a large sort order if new to put it at the end
    const sortOrder = id ? items.find(i => i.id === id)?.sortOrder ?? 0 : (items.length > 0 ? items[items.length - 1].sortOrder + 10 : 10);
    
    const result = await saveEventPlanItem(id, eventId, formActivity, formTime, sortOrder);
    if (result.success) {
      if (id) {
        // update locally
        setItems(items.map(i => i.id === id ? { ...i, activity: formActivity.trim(), plannedTime: formTime || null } : i));
        setEditingId(null);
      } else {
        // We rely on server action's revalidatePath, but we can reset form
        setAddingNew(false);
        // Page reload will fetch the new item correctly with its ID. In a fully optimized app, we'd use router.refresh() here.
        window.location.reload(); 
      }
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;
    
    const result = await deleteEventPlanItem(id);
    if (result.success) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const startEdit = (item: EventPlanItem) => {
    setEditingId(item.id);
    setFormActivity(item.activity);
    setFormTime(item.plannedTime || "");
  };

  const handleDownloadPDF = () => {
    window.open(`/api/admin/event-plan/export-pdf?eventId=${eventId}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-medium text-white tracking-wide uppercase">
          {eventName} PLAN
        </h3>
        {!isAllEvents && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF} className="bg-white/5 border-white/10 hover:bg-white/10">
              <FileDown className="w-4 h-4 mr-2" /> PDF
            </Button>
            <Button variant="outline" onClick={() => setIsBulkOpen(true)} className="bg-white/5 border-white/10 hover:bg-white/10">
              Bulk Paste
            </Button>
          </div>
        )}
      </div>

      {isAllEvents && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm p-4 rounded-xl mb-4">
          Select a specific event from the top-right Event Selector to add or edit Event Plan items.
        </div>
      )}

      <div className="bg-[#1e2333] border border-white/10 rounded-2xl overflow-hidden p-6 relative">
        <div className="absolute left-[84px] sm:left-[112px] top-6 bottom-6 w-px bg-white/10" />

        <div className="space-y-2 relative z-10">
          {items.map((item, index) => (
            <div key={item.id} className="group flex items-start gap-4 sm:gap-6 py-2 transition-all">
              
              {/* Actions & Time Column */}
              <div className="w-[80px] sm:w-[120px] shrink-0 flex flex-col items-end gap-1">
                {editingId === item.id ? (
                   <TimePicker 
                      name="time" 
                      defaultValue={formTime}
                      onChange={(e) => setFormTime(e.target.value)} 
                   />
                ) : (
                  <div className="text-white/80 font-mono text-sm sm:text-base mt-1">
                    {item.plannedTime || <span className="text-white/30">—</span>}
                  </div>
                )}
              </div>

              {/* Node Indicator */}
              <div className="shrink-0 relative flex items-center justify-center w-6 h-6 mt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-[#1e2333]" />
                <div className="absolute top-1/2 right-full w-4 h-px bg-white/10" />
              </div>

              {/* Content Column */}
              <div className="flex-1 min-w-0 flex items-start justify-between gap-4 mt-0.5">
                {editingId === item.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input 
                      value={formActivity} 
                      onChange={(e) => setFormActivity(e.target.value)} 
                      className="bg-white/5 border-white/10 h-8"
                      autoFocus
                    />
                    <Button size="sm" onClick={() => handleSave(item.id)} className="h-8 shrink-0">Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 shrink-0">Cancel</Button>
                  </div>
                ) : (
                  <>
                    <div className="text-white/90 font-medium break-words leading-relaxed">{item.activity}</div>
                    
                    {/* Controls */}
                    {!isAllEvents && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => startEdit(item)} className="p-1.5 text-white/40 hover:text-white rounded hover:bg-white/5 transition-colors" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-white/40 hover:text-red-400 rounded hover:bg-white/5 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1" />
                        <button onClick={() => handleMove(index, -1)} disabled={index === 0} className="p-1.5 text-white/40 hover:text-white disabled:opacity-30 rounded hover:bg-white/5 transition-colors" title="Move Up">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleMove(index, 1)} disabled={index === items.length - 1} className="p-1.5 text-white/40 hover:text-white disabled:opacity-30 rounded hover:bg-white/5 transition-colors" title="Move Down">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Add New Row */}
          {!isAllEvents && items.length > 0 && !addingNew && (
            <div className="flex items-start gap-4 sm:gap-6 py-4">
              <div className="w-[80px] sm:w-[120px] shrink-0" />
              <div className="shrink-0 flex items-center justify-center w-6 h-6" />
              <div className="flex-1">
                <button onClick={() => { setAddingNew(true); setFormActivity(""); setFormTime(""); }} className="flex items-center gap-2 text-indigo-400 text-sm font-medium hover:text-indigo-300 transition-colors bg-indigo-500/10 px-4 py-2 rounded-lg hover:bg-indigo-500/20">
                  <Plus className="w-4 h-4" /> Add Plan Item
                </button>
              </div>
            </div>
          )}

          {!isAllEvents && items.length === 0 && !addingNew && (
            <div className="text-center py-12">
               <p className="text-white/40 mb-4">No events planned yet.</p>
               <Button onClick={() => { setAddingNew(true); setFormActivity(""); setFormTime(""); }}>
                 <Plus className="w-4 h-4 mr-2" /> Add First Item
               </Button>
            </div>
          )}

          {/* New Item Form */}
          {addingNew && (
            <div className="flex items-start gap-4 sm:gap-6 py-4 bg-white/[0.02] -mx-6 px-6 border-y border-white/5">
              <div className="w-[80px] sm:w-[120px] shrink-0">
                 <TimePicker 
                    name="newTime" 
                    defaultValue={formTime}
                    onChange={(e) => setFormTime(e.target.value)} 
                 />
              </div>
              <div className="shrink-0 flex items-center justify-center w-6 h-6 mt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/50" />
              </div>
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                <Input 
                  value={formActivity} 
                  onChange={(e) => setFormActivity(e.target.value)} 
                  placeholder="Activity (e.g. Poruwa Ceremony)"
                  className="bg-white/5 border-white/10"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button onClick={() => handleSave(null)}>Add</Button>
                  <Button variant="ghost" onClick={() => setAddingNew(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {isBulkOpen && (
        <EventPlanBulkImport 
          eventId={eventId} 
          eventName={eventName}
          existingItems={items}
          onClose={() => { setIsBulkOpen(false); window.location.reload(); }}
        />
      )}
    </div>
  );
}

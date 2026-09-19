"use client";

import { useState, useEffect } from "react";
import { EventPlanItem } from "@prisma/client";
import { saveEventPlanItem, deleteEventPlanItem, reorderEventPlanItems } from "./actions";
import { EventPlanBulkImport } from "./EventPlanBulkImport";
import { Edit2, Trash2, Plus, FileDown, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/ui/TimePicker";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

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
  
  // Strict mode hydration workaround for dnd
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  // Form states
  const [formActivity, setFormActivity] = useState("");
  const [formTime, setFormTime] = useState("");

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, reorderedItem);

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
        // Page reload will fetch the new item correctly with its ID
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
    window.open(`/event-plan/print?eventId=${eventId}`, "_blank");
  };

  if (!isMounted) return null;

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

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="event-plan-list">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="bg-[#1e2333] border border-white/10 rounded-2xl overflow-hidden p-4 sm:p-6 relative"
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={isAllEvents || editingId !== null}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        "group relative flex items-start sm:items-center py-3 px-2 sm:px-4 rounded-xl hover:bg-white/5 transition-colors gap-3 sm:gap-6",
                        snapshot.isDragging && "bg-white/10 shadow-xl z-50 ring-1 ring-white/20"
                      )}
                    >
                      {/* Background vertical line (except on last item) */}
                      {index !== items.length - 1 && !snapshot.isDragging && (
                        <div className="absolute left-[39px] sm:left-[67px] top-10 bottom-[-12px] w-px bg-white/10 hidden sm:block" />
                      )}

                      {/* Hover Actions (Far Left / Mobile top) */}
                      {!isAllEvents && editingId === null && (
                        <div 
                          {...provided.dragHandleProps}
                          className="absolute left-0 sm:-left-3 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 cursor-grab active:cursor-grabbing text-white/30 hover:text-white top-2 sm:top-auto z-20"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>
                      )}

                      {/* Zone 1: Order Number & Timeline Dot */}
                      <div className="flex items-center gap-3 sm:gap-4 shrink-0 z-10 w-[40px] sm:w-[60px] ml-6 sm:ml-0">
                        <span className="text-white/40 font-mono text-sm sm:text-base font-medium">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-indigo-500/80 ring-4 ring-[#1e2333] hidden sm:block" />
                      </div>

                      {/* Zone 2 & 3 wrapper for mobile stacking */}
                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6">
                        
                        {/* Zone 2: Activity Name */}
                        <div className="flex-1 min-w-0">
                          {editingId === item.id ? (
                            <Input 
                              value={formActivity} 
                              onChange={(e) => setFormActivity(e.target.value)} 
                              className="bg-black/20 border-white/10 h-9 text-base w-full"
                              autoFocus
                            />
                          ) : (
                            <div className="text-white/90 font-medium text-[15px] sm:text-base break-words leading-snug">
                              {item.activity}
                            </div>
                          )}
                        </div>

                        {/* Zone 3: Time & Actions */}
                        <div className="shrink-0 flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                          
                          {/* Time Display */}
                          {editingId === item.id ? (
                             <div className="w-[120px]">
                               <TimePicker 
                                  name="time" 
                                  defaultValue={formTime}
                                  onChange={(e) => setFormTime(e.target.value)} 
                               />
                             </div>
                          ) : (
                            <div className="text-white/60 font-mono text-[13px] sm:text-sm bg-black/20 px-3 py-1.5 rounded-md min-w-[90px] text-center border border-white/5">
                              {item.plannedTime || "—"}
                            </div>
                          )}

                          {/* Edit/Save Actions */}
                          {!isAllEvents && (
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              {editingId === item.id ? (
                                <>
                                  <Button size="sm" onClick={() => handleSave(item.id)} className="h-8">Save</Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8">Cancel</Button>
                                </>
                              ) : (
                                <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEdit(item)} className="p-2 text-white/40 hover:text-white rounded hover:bg-white/10 transition-colors" title="Edit">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(item.id)} className="p-2 text-white/40 hover:text-red-400 rounded hover:bg-white/10 transition-colors" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </div>

                    </div>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}

              {/* Add New Row */}
              {!isAllEvents && items.length > 0 && !addingNew && (
                <div className="flex items-start gap-4 sm:gap-6 py-4 px-2 sm:px-4 mt-2">
                  <div className="w-[40px] sm:w-[60px] shrink-0 ml-6 sm:ml-0" />
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 py-4 bg-white/[0.02] -mx-4 sm:-mx-6 px-4 sm:px-6 border-y border-white/5 mt-2">
                  <div className="w-auto sm:w-[60px] shrink-0">
                    <span className="text-indigo-400/50 font-mono text-sm sm:text-base font-medium hidden sm:block">
                      {String(items.length + 1).padStart(2, '0')}
                    </span>
                  </div>
                  
                  <div className="flex-1 flex flex-col sm:flex-row w-full gap-3">
                    <Input 
                      value={formActivity} 
                      onChange={(e) => setFormActivity(e.target.value)} 
                      placeholder="Activity (e.g. Poruwa Ceremony)"
                      className="bg-black/20 border-white/10 h-9 flex-1"
                      autoFocus
                    />
                    <div className="w-full sm:w-[140px] shrink-0">
                       <TimePicker 
                          name="newTime" 
                          defaultValue={formTime}
                          onChange={(e) => setFormTime(e.target.value)} 
                       />
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button onClick={() => handleSave(null)} className="h-9">Add</Button>
                      <Button variant="ghost" onClick={() => setAddingNew(false)} className="h-9">Cancel</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

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

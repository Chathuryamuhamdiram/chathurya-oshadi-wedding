"use client";

import { useState, useRef } from "react";
import { Plus, Edit2, Trash2, GripVertical, FileDown, UtensilsCrossed } from "lucide-react";
import { createOrUpdateMenu, addSection, updateSection, deleteSection, addItem, updateItem, deleteItem, reorderSections, reorderItems } from "@/app/admin/food-menu/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MenuExportModal from "./MenuExportModal";
import { FoodMenuBulkSectionImport } from "./FoodMenuBulkSectionImport";
import { FoodMenuBulkItemImport } from "./FoodMenuBulkItemImport";

const InlineAddItemForm = ({ sectionId, onAdd, onCancel }: { sectionId: string, onAdd: (name: string) => Promise<void>, onCancel: () => void }) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await onAdd(name);
    setName("");
    setIsSubmitting(false);
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <input 
        ref={inputRef}
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter item name..."
        disabled={isSubmitting}
        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
      />
      <button type="submit" disabled={isSubmitting || !name.trim()} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">Add</button>
      <button type="button" onClick={onCancel} className="px-3 py-2 text-white/50 hover:text-white text-sm">Cancel</button>
    </form>
  )
}

export default function FoodMenuClient({
  activeEventId,
  isAllEvents,
  activeEvent,
  menus,
  vendors,
  canEdit
}: any) {
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [inlineAddSectionId, setInlineAddSectionId] = useState<string | null>(null);

  if (isAllEvents) {
    return (
      <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/[0.1] rounded-2xl">
        <UtensilsCrossed className="w-12 h-12 text-white/20 mb-4" />
        <h2 className="text-xl font-serif text-white/90 mb-2">Select an Event</h2>
        <p className="text-white/40 text-sm font-sans max-w-md text-center">
          Please select a specific event from the top navigation to view or manage its Food Menu.
        </p>
      </div>
    );
  }

  const menu = menus.find((m: any) => m.eventId === activeEventId);

  const handleSaveMenu = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      venue: formData.get("venue"),
      vendorId: formData.get("vendorId") || null,
      status: formData.get("status"),
      notes: formData.get("notes")
    };
    await createOrUpdateMenu(activeEventId, data);
    setIsMenuDialogOpen(false);
  };

  const handleSaveSection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    
    if (editingSection) {
      await updateSection(editingSection.id, title);
    } else {
      await addSection(menu.id, title);
    }
    setIsSectionDialogOpen(false);
  };

  const handleInlineAddItem = async (sectionId: string, name: string) => {
    const data = { name };
    await addItem(sectionId, data);
  };

  const handleSaveItemEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      status: editingItem.status // keep existing
    };
    await updateItem(editingItem.id, data);
    setIsItemDialogOpen(false);
  };

  const handleDeleteSection = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this section? All items inside will be lost.")) {
      await deleteSection(id);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteItem(id);
    }
  };

  const moveSection = async (index: number, direction: 'up' | 'down') => {
    if (!menu) return;
    const newSections = [...menu.sections];
    if (direction === 'up' && index > 0) {
      const temp = newSections[index];
      newSections[index] = newSections[index - 1];
      newSections[index - 1] = temp;
    } else if (direction === 'down' && index < newSections.length - 1) {
      const temp = newSections[index];
      newSections[index] = newSections[index + 1];
      newSections[index + 1] = temp;
    } else {
      return;
    }
    await reorderSections(menu.id, newSections.map(s => s.id));
  };

  const moveItem = async (section: any, index: number, direction: 'up' | 'down') => {
    const newItems = [...section.items];
    if (direction === 'up' && index > 0) {
      const temp = newItems[index];
      newItems[index] = newItems[index - 1];
      newItems[index - 1] = temp;
    } else if (direction === 'down' && index < newItems.length - 1) {
      const temp = newItems[index];
      newItems[index] = newItems[index + 1];
      newItems[index + 1] = temp;
    } else {
      return;
    }
    await reorderItems(section.id, newItems.map(i => i.id));
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif text-white tracking-wide">Food Menu</h1>
            <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
              {activeEvent?.name}
            </span>
          </div>
          <p className="text-white/40 text-sm font-sans mt-1">Manage the food and beverage menu for this event.</p>
        </div>
        
        {menu && (
          <div className="flex gap-3">
            <MenuExportModal 
              activeEventId={activeEventId}
              isAllEvents={isAllEvents}
              menuTitle={menu.title}
              eventName={activeEvent?.name}
              canViewCosts={canEdit} 
            />
            {canEdit && (
              <button 
                onClick={() => {
                  setEditingMenu(menu);
                  setIsMenuDialogOpen(true);
                }}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Menu Details
              </button>
            )}
          </div>
        )}
      </div>

      {!menu ? (
        <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/[0.1] rounded-2xl">
          <UtensilsCrossed className="w-12 h-12 text-white/20 mb-4" />
          <h2 className="text-xl font-serif text-white/90 mb-2">No Menu Created</h2>
          <p className="text-white/40 text-sm font-sans max-w-md text-center mb-6">
            There is no menu configured for this event yet.
          </p>
          {canEdit && (
            <button
              onClick={() => {
                setEditingMenu(null);
                setIsMenuDialogOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Menu
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Menu Details Card */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Menu Title</p>
                <p className="text-sm text-white/90 font-medium">{menu.title}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Status</p>
                <span className={`text-xs px-2.5 py-1 rounded-md border ${
                  menu.status === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  menu.status === "CANCELLED" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                  "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  {menu.status}
                </span>
              </div>
              {menu.venue && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Venue</p>
                  <p className="text-sm text-white/90">{menu.venue}</p>
                </div>
              )}
              {menu.vendor && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Vendor/Caterer</p>
                  <p className="text-sm text-white/90">{menu.vendor.vendorName}</p>
                </div>
              )}
            </div>
            {menu.notes && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Notes</p>
                <p className="text-sm text-white/60">{menu.notes}</p>
              </div>
            )}
          </div>

          {/* Sections */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif text-white/90">Menu Sections</h2>
              {canEdit && (
                <div className="flex items-center gap-3">
                  <FoodMenuBulkSectionImport 
                    menuId={menu.id}
                    existingSections={menu.sections.map((s: any) => ({ id: s.id, title: s.title }))}
                  />
                  <button
                    onClick={() => {
                      setEditingSection(null);
                      setIsSectionDialogOpen(true);
                    }}
                    className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    ADD SECTION
                  </button>
                </div>
              )}
            </div>

            {menu.sections.map((section: any, sIdx: number) => (
              <div key={section.id} className="bg-[#1e2333] border border-white/5 rounded-2xl overflow-hidden">
                {/* Section Header */}
                <div className="bg-black/20 px-6 py-4 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-4">
                    {canEdit && (
                      <div className="flex flex-col gap-1 opacity-50 hover:opacity-100 transition-opacity">
                        <button onClick={() => moveSection(sIdx, 'up')} disabled={sIdx === 0} className="disabled:opacity-20">▲</button>
                        <button onClick={() => moveSection(sIdx, 'down')} disabled={sIdx === menu.sections.length - 1} className="disabled:opacity-20">▼</button>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-serif text-white uppercase tracking-wider">{section.title}</h3>
                      <p className="text-xs text-white/40 mt-0.5">{section.items.length} items</p>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setEditingSection(section);
                          setIsSectionDialogOpen(true);
                        }}
                        className="p-1.5 text-white/40 hover:text-white/80 transition-colors"
                        title="Edit Section"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-1.5 text-white/40 hover:text-red-400 transition-colors"
                        title="Delete Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Section Items */}
                <div className="p-6">
                  {section.items.length === 0 && inlineAddSectionId !== section.id ? (
                    <p className="text-sm text-white/40 italic">No items added to this section.</p>
                  ) : (
                    <div className="space-y-2">
                      {section.items.map((item: any, iIdx: number) => (
                        <div key={item.id} className="flex items-center justify-between gap-4 p-2.5 rounded-lg hover:bg-white/5 transition-colors group">
                          <div className="flex items-center gap-4">
                            {canEdit && (
                              <div className="flex flex-col gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => moveItem(section, iIdx, 'up')} disabled={iIdx === 0} className="disabled:opacity-20">▲</button>
                                <button onClick={() => moveItem(section, iIdx, 'down')} disabled={iIdx === section.items.length - 1} className="disabled:opacity-20">▼</button>
                              </div>
                            )}
                            <span className="font-medium text-white/90 text-sm">{item.name}</span>
                          </div>
                          
                          {canEdit && (
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setIsItemDialogOpen(true);
                                }}
                                className="p-1.5 text-white/40 hover:text-white/80 transition-colors bg-black/20 rounded-md"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 text-white/40 hover:text-red-400 transition-colors bg-black/20 rounded-md"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {canEdit && (
                    <div className="mt-4 border-t border-white/5 pt-4">
                      {inlineAddSectionId === section.id ? (
                        <InlineAddItemForm 
                          sectionId={section.id} 
                          onAdd={async (name) => {
                            await handleInlineAddItem(section.id, name);
                          }}
                          onCancel={() => setInlineAddSectionId(null)} 
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setInlineAddSectionId(section.id)}
                            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Add Item
                          </button>
                          <FoodMenuBulkItemImport 
                            sectionId={section.id}
                            sectionTitle={section.title}
                            existingItems={section.items.map((i: any) => ({ id: i.id, name: i.name }))}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu Dialog */}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent className="bg-[#1e2333] border border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMenu ? "Edit Menu" : "Create Menu"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveMenu} className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Menu Title *</label>
              <input name="title" defaultValue={editingMenu?.title || "Wedding Reception Menu"} required className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Venue</label>
              <input name="venue" defaultValue={editingMenu?.venue || ""} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Vendor/Caterer</label>
              <select name="vendorId" defaultValue={editingMenu?.vendorId || ""} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 appearance-none">
                <option value="">-- None --</option>
                {vendors?.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.vendorName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Status</label>
              <select name="status" defaultValue={editingMenu?.status || "DRAFT"} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 appearance-none">
                <option value="DRAFT">Draft</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Internal Notes</label>
              <textarea name="notes" defaultValue={editingMenu?.notes || ""} rows={3} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button type="button" onClick={() => setIsMenuDialogOpen(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">Save Menu</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Section Dialog */}
      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent className="bg-[#1e2333] border border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSection ? "Edit Section" : "Add Section"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSection} className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Section Title *</label>
              <input name="title" defaultValue={editingSection?.title || ""} placeholder="e.g. Welcome Drinks, Main Course" required className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button type="button" onClick={() => setIsSectionDialogOpen(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">Save Section</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Item Dialog (Edit only, name only) */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="bg-[#1e2333] border border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveItemEdit} className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Item Name *</label>
              <input name="name" defaultValue={editingItem?.name || ""} required className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button type="button" onClick={() => setIsItemDialogOpen(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">Save Item</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

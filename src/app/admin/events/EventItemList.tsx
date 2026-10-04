"use client";

import { useState } from "react";
import { Plus, Check, Trash2, Download, ListTodo, Edit2, Phone, MessageCircle } from "lucide-react";
import { saveEventItemAction, toggleEventItemStatusAction, deleteEventItemAction, editEventItemAction } from "./actions";
import { DeleteEventButton } from "./DeleteEventButton";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ChecklistBulkPaste } from "./ChecklistBulkPaste";
import { ClipboardPaste } from "lucide-react";

type Vendor = {
  id: string;
  vendorName: string;
  phone: string | null;
  whatsappNumber: string | null;
};

type EventItem = {
  id: string;
  name: string;
  quantity: string;
  status: string;
  vendorId?: string | null;
  orderedPrice?: string | null;
  orderStatus?: string | null;
  orderedAt?: string | null;
  orderNote?: string | null;
  vendor?: {
    vendorName: string;
    phone: string | null;
    whatsappNumber: string | null;
  } | null;
};

export function EventItemList({ 
  eventId, 
  eventTitle,
  initialItems,
  vendors = []
}: { 
  eventId: string;
  eventTitle: string;
  initialItems: EventItem[];
  vendors?: Vendor[];
}) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<EventItem | null>(null);

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const res = await saveEventItemAction(eventId, newItemName, newItemQuantity);
    if (res.success) {
      setNewItemName("");
      setNewItemQuantity("");
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

  async function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await editEventItemAction(formData);
    if (res.success) {
      setEditingItem(null);
    } else {
      alert(res.error || "Failed to update item");
    }
    setIsSubmitting(false);
  }

  function downloadPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${eventTitle} - Requirements Checklist`, 14, 22);

    const tableData = initialItems.map(item => [
      item.name, 
      item.quantity,
      item.vendor?.vendorName || "-",
      item.orderedPrice ? `LKR ${Number(item.orderedPrice).toLocaleString()}` : "-",
      item.orderStatus === "ORDERED" ? "Ordered" : item.orderStatus === "PURCHASED" ? "Purchased" : "Pending",
      item.status === "BOUGHT" ? "Yes" : "Pending"
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Item", "Qty", "Vendor", "Price", "Order Status", "Bought"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Checklist.pdf`);
  }

  const itemsOrdered = initialItems.filter(i => i.orderedPrice).length;
  const totalOrderedValue = initialItems.reduce((acc, curr) => acc + (curr.orderedPrice ? Number(curr.orderedPrice) : 0), 0);
  const itemsPurchased = initialItems.filter(i => i.status === "BOUGHT" || i.orderStatus === "PURCHASED").length;

  return (
    <div className="mt-6 pt-6 border-t border-white/[0.06] flex flex-wrap items-center gap-3">
      <Dialog>
        <DialogTrigger className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors text-sm font-medium">
          <ListTodo className="w-4 h-4" /> Requirements Checklist
        </DialogTrigger>
        <DialogContent className="bg-[#11141d] border-white/10 text-white sm:max-w-2xl max-h-[90vh] flex flex-col p-4 md:p-6">
          <DialogHeader className="shrink-0 mb-4">
            <DialogTitle className="text-xl font-serif">{eventTitle} Checklist</DialogTitle>
            <DialogDescription className="text-white/50">Manage items needed for this event.</DialogDescription>
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-sans text-white/60 bg-white/5 p-3 rounded-xl border border-white/10">
              <div><span className="text-white/40">Total:</span> <span className="text-white">{initialItems.length}</span></div>
              <div><span className="text-white/40">Purchased:</span> <span className="text-emerald-400">{itemsPurchased}</span></div>
              <div><span className="text-white/40">Ordered:</span> <span className="text-purple-400">{itemsOrdered}</span></div>
              <div><span className="text-white/40">Total Ordered Value:</span> <span className="text-white">LKR {totalOrderedValue.toLocaleString()}</span></div>
            </div>
          </DialogHeader>

          <div className="mt-2 flex-1 min-h-0 flex flex-col">
            <div className="space-y-3 mb-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {initialItems.map(item => {
                const isBought = item.status === "BOUGHT";
                return (
                  <div key={item.id} className="flex flex-col group bg-white/[0.02] border border-white/5 p-3 rounded-xl transition-colors hover:border-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="flex items-center gap-3 cursor-pointer min-w-0 flex-1">
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
                        <div className="flex flex-col min-w-0">
                          <span className={`text-sm font-medium transition-colors truncate ${isBought ? "text-white/40 line-through" : "text-white/90 group-hover:text-white"}`}>
                            {item.name}
                          </span>
                          <span className={`text-xs transition-colors ${isBought ? "text-white/30" : "text-white/50"}`}>
                            {item.quantity}
                          </span>
                        </div>
                      </label>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit Order Info"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <div className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <DeleteEventButton type="item" id={item.id} title={item.name} />
                        </div>
                      </div>
                    </div>

                    {/* Secondary info row */}
                    {(item.vendor || item.orderedPrice || (item.orderStatus && item.orderStatus !== "NOT_ORDERED") || item.orderNote) && (
                      <div className="mt-3 pl-8 flex flex-wrap items-center gap-3 text-xs text-white/50 border-t border-white/[0.04] pt-2">
                        {item.vendor && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-white/70 font-medium">{item.vendor.vendorName}</span>
                            {item.vendor.phone && (
                              <a href={`tel:${item.vendor.phone}`} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="Call">
                                <Phone className="w-3 h-3" />
                              </a>
                            )}
                            {item.vendor.whatsappNumber && (
                              <a href={`https://wa.me/${item.vendor.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="p-1 rounded hover:bg-white/10 text-emerald-400/60 hover:text-emerald-400 transition-colors" title="WhatsApp">
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}
                        {item.orderedPrice && (
                          <div className="flex items-center gap-1">
                            {item.vendor && <span className="w-1 h-1 rounded-full bg-white/20 mx-1"></span>}
                            <span className="font-mono text-emerald-400/80">LKR {Number(item.orderedPrice).toLocaleString()}</span>
                          </div>
                        )}
                        {item.orderStatus && item.orderStatus !== "NOT_ORDERED" && (
                          <div className="flex items-center gap-1">
                            {(item.vendor || item.orderedPrice) && <span className="w-1 h-1 rounded-full bg-white/20 mx-1"></span>}
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                              item.orderStatus === 'ORDERED' ? 'bg-purple-500/10 text-purple-400' :
                              item.orderStatus === 'PURCHASED' ? 'bg-emerald-500/10 text-emerald-400' :
                              item.orderStatus === 'CANCELLED' ? 'bg-red-500/10 text-red-400' :
                              'bg-white/10 text-white/70'
                            }`}>
                              {item.orderStatus}
                            </span>
                          </div>
                        )}
                        {item.orderNote && (
                          <div className="w-full mt-1.5 text-white/40 italic">
                            "{item.orderNote}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {initialItems.length === 0 && (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                  <p className="text-white/40 text-sm font-sans">No items added yet.</p>
                </div>
              )}
            </div>

            <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-white/10 shrink-0">
              <input
                type="text"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                placeholder="Add new requirement..."
                disabled={isSubmitting}
                className="flex-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none transition-colors"
              />
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <input
                  type="text"
                  value={newItemQuantity}
                  onChange={e => setNewItemQuantity(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Quantity..."
                  maxLength={40}
                  className="flex-1 sm:w-28 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-center text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newItemName.trim() || isSubmitting}
                  className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20 sm:w-auto w-1/3 flex justify-center items-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <ChecklistBulkPaste 
                  defaultEventId={eventId}
                  defaultEventName={eventTitle}
                  events={[{ id: eventId, title: eventTitle, items: initialItems as any }]}
                  trigger={
                    <button type="button" title="Bulk Paste" className="px-4 py-2.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 transition-colors sm:w-auto flex justify-center items-center">
                      <ClipboardPaste className="w-5 h-5" />
                    </button>
                  }
                />
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="bg-[#11141d] border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Requirement</DialogTitle>
            <DialogDescription className="text-white/50">Update item details, vendor, and pricing.</DialogDescription>
          </DialogHeader>
          
          {editingItem && (
            <form onSubmit={handleSaveEdit} className="space-y-4 mt-2">
              <input type="hidden" name="id" value={editingItem.id} />
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase">Item Name</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={editingItem.name} 
                  required 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase">Quantity</label>
                <input 
                  type="text" 
                  name="quantity" 
                  defaultValue={editingItem.quantity} 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase">Vendor</label>
                <select 
                  name="vendorId" 
                  defaultValue={editingItem.vendorId || ""}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                >
                  <option value="" className="bg-[#11141d]">Select Vendor ▼</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id} className="bg-[#11141d]">{v.vendorName}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50 uppercase">Ordered Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-sm text-white/40">LKR</span>
                    <input 
                      type="text" 
                      name="orderedPrice" 
                      defaultValue={editingItem.orderedPrice || ""}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50 uppercase">Status</label>
                  <select 
                    name="orderStatus" 
                    defaultValue={editingItem.orderStatus || "NOT_ORDERED"}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                  >
                    <option value="NOT_ORDERED" className="bg-[#11141d]">Not Ordered</option>
                    <option value="ORDERED" className="bg-[#11141d]">Ordered</option>
                    <option value="PURCHASED" className="bg-[#11141d]">Purchased</option>
                    <option value="CANCELLED" className="bg-[#11141d]">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase">Order Note (Optional)</label>
                <textarea 
                  name="orderNote" 
                  defaultValue={editingItem.orderNote || ""}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
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

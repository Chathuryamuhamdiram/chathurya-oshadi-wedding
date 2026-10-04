"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Filter, Phone, MessageCircle, Presentation, ClipboardCopy, Trash2, Edit2, Play } from "lucide-react";
import { saveQuestionAction, deleteQuestionAction } from "./actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { MeetingMode } from "./MeetingMode";
import { BulkPasteModal } from "./BulkPasteModal";

const CATEGORIES = [
  "Function Hall", "Food & Beverage", "Rooms / Accommodation", 
  "Decoration", "Timing", "Payments", "Bar / Liquor", 
  "Parking", "Vendor Access", "Electricity / Power", 
  "Sound / Music", "Photography", "Transport", 
  "Guest Management", "Ceremony", "Other"
];

const STATUS_COLORS: Record<string, string> = {
  "TO_ASK": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "ASKED": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "ANSWERED": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "FOLLOW_UP": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "CLOSED": "bg-white/5 text-white/40 border-white/10"
};

const STATUS_LABELS: Record<string, string> = {
  "TO_ASK": "To Ask",
  "ASKED": "Asked",
  "ANSWERED": "Answered",
  "FOLLOW_UP": "Follow-up",
  "CLOSED": "Closed"
};

export function QuestionsClient({
  initialQuestions,
  vendors,
  events,
  activeEventId
}: {
  initialQuestions: any[];
  vendors: any[];
  events: any[];
  activeEventId: string;
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterVendorId, setFilterVendorId] = useState("ALL");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [meetingModeOpen, setMeetingModeOpen] = useState(false);
  const [bulkPasteOpen, setBulkPasteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredQuestions = useMemo(() => {
    return initialQuestions.filter(q => {
      if (filterStatus !== "ALL" && q.status !== filterStatus) return false;
      if (filterCategory !== "ALL" && q.category !== filterCategory) return false;
      if (filterVendorId !== "ALL") {
        if (filterVendorId === "OTHER" && q.vendorId) return false;
        if (filterVendorId !== "OTHER" && q.vendorId !== filterVendorId) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        return (
          q.question.toLowerCase().includes(s) || 
          (q.answer && q.answer.toLowerCase().includes(s)) ||
          (q.vendor?.vendorName && q.vendor.vendorName.toLowerCase().includes(s)) ||
          (q.askFromName && q.askFromName.toLowerCase().includes(s))
        );
      }
      return true;
    });
  }, [initialQuestions, search, filterStatus, filterCategory, filterVendorId]);

  // Group by category if needed, but simple list works too. Let's do a simple grouped view
  const groupedQuestions = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const q of filteredQuestions) {
      if (!groups[q.category]) groups[q.category] = [];
      groups[q.category].push(q);
    }
    return groups;
  }, [filteredQuestions]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await saveQuestionAction(formData);
    setIsSubmitting(false);
    
    if (res.success) {
      setIsFormOpen(false);
      setEditingItem(null);
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const res = await deleteQuestionAction(deletingId);
    if (res.success) {
      setDeleteOpen(false);
      setDeletingId(null);
    } else {
      alert(res.error);
    }
  };

  const openEdit = (q: any) => {
    setEditingItem(q);
    setIsFormOpen(true);
  };

  const handleMeetingMode = () => {
    if (filterVendorId === "ALL" || filterVendorId === "OTHER") {
      alert("Please select a specific vendor in the 'Ask From' filter before entering Meeting Mode.");
      return;
    }
    setMeetingModeOpen(true);
  };

  const currentMeetingVendor = vendors.find(v => v.id === filterVendorId);

  return (
    <>
      <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-4 lg:p-6 shadow-xl mb-6 flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search questions or answers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#11141d] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select
            value={filterVendorId}
            onChange={(e) => setFilterVendorId(e.target.value)}
            className="bg-[#11141d] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none flex-1 lg:flex-none min-w-[140px]"
          >
            <option value="ALL">All Vendors</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.vendorName}</option>
            ))}
            <option value="OTHER">Other / Manual</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#11141d] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none flex-1 lg:flex-none min-w-[140px]"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#11141d] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none flex-1 lg:flex-none min-w-[140px]"
          >
            <option value="ALL">All Status</option>
            {Object.keys(STATUS_LABELS).map(k => (
              <option key={k} value={k}>{STATUS_LABELS[k]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button 
          onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
        <button 
          onClick={() => setBulkPasteOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
        >
          <ClipboardCopy className="w-4 h-4" /> Bulk Paste
        </button>
        <button 
          onClick={handleMeetingMode}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e2333] border border-white/10 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors ml-auto"
        >
          <Presentation className="w-4 h-4 text-emerald-400" /> Meeting Mode
        </button>
      </div>

      <div className="space-y-8">
        {Object.keys(groupedQuestions).length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl">
            <MessageCircle className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No questions found</h3>
            <p className="text-white/40">Try adjusting your filters or add a new question.</p>
          </div>
        ) : (
          Object.keys(groupedQuestions).sort().map(category => (
            <div key={category} className="space-y-4">
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest pl-2 border-l-2 border-emerald-500">
                {category}
              </h3>
              <div className="bg-[#1e2333] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <div className="divide-y divide-white/5">
                  {groupedQuestions[category].map(q => (
                    <div key={q.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${STATUS_COLORS[q.status]}`}>
                              {STATUS_LABELS[q.status]}
                            </span>
                            {q.followUpRequired && (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border bg-orange-500/10 text-orange-400 border-orange-500/20">
                                Needs Follow-up {q.followUpDate && `(${new Date(q.followUpDate).toLocaleDateString()})`}
                              </span>
                            )}
                            <span className="text-xs text-white/50">
                              {q.vendor ? q.vendor.vendorName : q.askFromName || "Unassigned"}
                            </span>
                            {q.vendor && (
                              <div className="flex items-center gap-1">
                                {q.vendor.phone && (
                                  <a href={`tel:${q.vendor.phone}`} className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-emerald-400 transition-colors" title="Call">
                                    <Phone className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <p className="text-[15px] font-medium text-white/90">{q.question}</p>
                          
                          {q.answer && (
                            <div className="mt-3 p-3 rounded-lg bg-[#11141d] border border-white/5 text-sm text-emerald-400/90 whitespace-pre-wrap">
                              <strong className="text-white/40 block mb-1 text-xs uppercase tracking-wider">Answer:</strong>
                              {q.answer}
                            </div>
                          )}
                          
                          {q.internalNote && (
                            <p className="text-xs text-white/40 italic mt-2">
                              Note: {q.internalNote}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEdit(q)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => { setDeletingId(q.id); setDeleteOpen(true); }}
                            className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-[#11141d] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Question" : "Add Question"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-4">
            {editingItem && <input type="hidden" name="id" value={editingItem.id} />}
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50 uppercase">Question *</label>
              <textarea
                name="question"
                required
                defaultValue={editingItem?.question}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 resize-none h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase">Category</label>
                <select
                  name="category"
                  defaultValue={editingItem?.category || "Other"}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#11141d]">{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase">Event</label>
                <select
                  name="eventId"
                  defaultValue={editingItem?.eventId || (activeEventId === 'all' ? "ALL" : activeEventId)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                >
                  <option value="ALL" className="bg-[#11141d]">General (No Specific Event)</option>
                  {events.map(e => <option key={e.id} value={e.id} className="bg-[#11141d]">{e.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50 uppercase">Ask From (Vendor)</label>
              <select
                name="vendorId"
                defaultValue={editingItem?.vendorId || ""}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
              >
                <option value="" className="bg-[#11141d]">Select Vendor (or type below)</option>
                {vendors.map(v => <option key={v.id} value={v.id} className="bg-[#11141d]">{v.vendorName}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50 uppercase">Or Ask From (Manual Name)</label>
              <input
                name="askFromName"
                defaultValue={editingItem?.askFromName || ""}
                placeholder="e.g. Hotel Manager, Priest"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase">Status</label>
                <select
                  name="status"
                  defaultValue={editingItem?.status || "TO_ASK"}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                >
                  {Object.keys(STATUS_LABELS).map(k => <option key={k} value={k} className="bg-[#11141d]">{STATUS_LABELS[k]}</option>)}
                </select>
              </div>
            </div>

            {editingItem && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase">Answer</label>
                <textarea
                  name="answer"
                  defaultValue={editingItem?.answer || ""}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 resize-none h-20"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50 uppercase">Internal Note (Optional)</label>
              <input
                name="internalNote"
                defaultValue={editingItem?.internalNote || ""}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex items-center gap-4 py-2 border-t border-white/10">
              <label className="flex items-center gap-2 text-sm text-white">
                <input 
                  type="checkbox" 
                  name="followUpRequired" 
                  value="true" 
                  defaultChecked={editingItem?.followUpRequired} 
                  className="accent-orange-500 w-4 h-4" 
                />
                Needs Follow-up
              </label>
              <input
                type="date"
                name="followUpDate"
                defaultValue={editingItem?.followUpDate ? new Date(editingItem.followUpDate).toISOString().split('T')[0] : ""}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Question"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Question?"
        recordName="this question"
        description={<p>You are about to delete this question. This action cannot be undone.</p>}
        onConfirm={handleDelete}
        loading={isSubmitting}
      />

      <MeetingMode
        isOpen={meetingModeOpen}
        onClose={() => setMeetingModeOpen(false)}
        questions={filteredQuestions}
        vendorName={currentMeetingVendor?.vendorName}
        vendorPhone={currentMeetingVendor?.phone}
        vendorWhatsapp={currentMeetingVendor?.whatsappNumber}
      />

      <BulkPasteModal
        isOpen={bulkPasteOpen}
        onClose={() => setBulkPasteOpen(false)}
        events={events}
        vendors={vendors}
        existingQuestions={initialQuestions}
        activeEventId={activeEventId}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { parseEventPlanText, ParsedEventPlanItem } from "@/lib/admin/event-plan-parser";
import { bulkSaveEventPlanItems } from "./actions";
import { X, Check, AlertTriangle, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventPlanBulkImportProps {
  eventId: string;
  eventName: string;
  existingItems: { id: string; activity: string; plannedTime: string | null }[];
  onClose: () => void;
}

export function EventPlanBulkImport({ eventId, eventName, existingItems, onClose }: EventPlanBulkImportProps) {
  const [text, setText] = useState("");
  const [previewItems, setPreviewItems] = useState<ParsedEventPlanItem[] | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePreview = () => {
    const parsed = parseEventPlanText(text);
    
    // Duplicate detection
    const verified = parsed.map(item => {
      // Find matching activity name (case insensitive)
      const existingMatch = existingItems.find(ex => ex.activity.toLowerCase() === item.activity.toLowerCase());
      
      if (existingMatch) {
        return {
          ...item,
          status: "DUPLICATE" as const,
          existingId: existingMatch.id,
        };
      }

      // Check if time conflict (SAME TIME) - optional warning
      if (item.plannedTime) {
        const timeMatch = existingItems.find(ex => ex.plannedTime === item.plannedTime);
        if (timeMatch) {
           return {
             ...item,
             status: "SAME TIME" as const,
           }
        }
      }

      return item;
    });

    setPreviewItems(verified);
  };

  const handleActionChange = (id: string, newStatus: ParsedEventPlanItem["status"]) => {
    setPreviewItems(prev => prev ? prev.map(p => p.id === id ? { ...p, status: newStatus } : p) : null);
  };

  const handleSave = async () => {
    if (!previewItems) return;
    setSaving(true);
    
    const result = await bulkSaveEventPlanItems(eventId, previewItems);
    setSaving(false);
    
    if (result.success) {
      onClose();
    } else {
      alert("Error saving: " + result.error);
    }
  };

  if (previewItems) {
    const newCount = previewItems.filter(p => p.status === "NEW" || p.status === "SAME TIME").length;
    const dupCount = previewItems.filter(p => p.status === "DUPLICATE").length;

    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#1e2333] border border-white/10 rounded-3xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div>
              <h2 className="text-xl font-semibold text-white">Event Plan Import Preview</h2>
              <p className="text-sm text-white/50 mt-1">Event: <span className="text-indigo-400 font-medium">{eventName}</span></p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/60">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 bg-[#0d1117] border-b border-white/5 flex gap-6 text-sm">
            <div className="text-white/60">Parsed: <span className="text-white font-medium">{previewItems.length}</span></div>
            <div className="text-emerald-400">New: <span className="font-medium">{newCount}</span></div>
            <div className="text-amber-400">Duplicates/Conflicts: <span className="font-medium">{dupCount}</span></div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {previewItems.map(item => (
              <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-white font-medium flex items-center gap-2">
                    {item.activity}
                    {item.status === "DUPLICATE" && <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold">Duplicate</span>}
                    {item.status === "SAME TIME" && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold">Time Conflict</span>}
                  </div>
                  <div className="text-white/50 text-sm mt-1">{item.plannedTime || "Time not set"}</div>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === "DUPLICATE" ? (
                    <select 
                      className="bg-[#0d1117] text-white border border-white/10 rounded-lg text-sm px-3 py-1.5 focus:border-indigo-500 outline-none"
                      value={item.status}
                      onChange={(e) => handleActionChange(item.id, e.target.value as any)}
                    >
                      <option value="DUPLICATE">SKIP (Duplicate)</option>
                      <option value="SAME TIME">UPDATE EXISTING (Use New Time)</option>
                      <option value="NEW">ADD ANYWAY</option>
                    </select>
                  ) : item.status === "SAME TIME" ? (
                     <select 
                      className="bg-[#0d1117] text-white border border-white/10 rounded-lg text-sm px-3 py-1.5 focus:border-indigo-500 outline-none"
                      value={item.status}
                      onChange={(e) => handleActionChange(item.id, e.target.value as any)}
                    >
                      <option value="SAME TIME">ADD ANYWAY</option>
                      <option value="DUPLICATE">SKIP</option>
                    </select>
                  ) : (
                    <div className="text-emerald-400 text-sm flex items-center gap-1 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                      <Check className="w-4 h-4" /> Adding
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
            <Button variant="ghost" onClick={() => setPreviewItems(null)}>Back to Edit</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Confirm & Save"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1e2333] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-xl font-semibold text-white">Bulk Add Event Plan</h2>
            <p className="text-sm text-white/50 mt-1">Event: <span className="text-indigo-400 font-medium">{eventName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex gap-3 text-indigo-200 text-sm">
            <Info className="w-5 h-5 shrink-0 text-indigo-400" />
            <div>
              Paste your schedule here. Supported formats include:<br/>
              <code className="bg-black/30 px-1 py-0.5 rounded text-indigo-300 mt-1 inline-block">Activity - Time</code> or <code className="bg-black/30 px-1 py-0.5 rounded text-indigo-300 mt-1 inline-block">1. Activity – Time</code><br/>
              Sinhala is fully supported.
            </div>
          </div>
          
          <textarea
            className="w-full h-64 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:border-indigo-500/50 outline-none resize-none font-mono text-sm"
            placeholder="Bride Preparation – 08:10 AM&#10;Poruwa Ceremony – 08:50 AM&#10;Reception – 10:30 AM"
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handlePreview} disabled={!text.trim()}>Preview Import</Button>
        </div>
      </div>
    </div>
  );
}

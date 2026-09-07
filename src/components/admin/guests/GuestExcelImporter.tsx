"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X, AlertCircle, CheckCircle2, Download, RefreshCw, ChevronLeft } from "lucide-react";
import { GuestImportPreviewTable } from "./GuestImportPreviewTable";
import { ProcessedRow } from "@/lib/guest-import";
import { useRouter } from "next/navigation";

type Props = {
  activeEventId: string | null;
  events: { id: string; name: string }[];
};

export function GuestExcelImporter({ activeEventId, events }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Flow State
  const [step, setStep] = useState<"CONTEXT" | "UPLOAD" | "PREVIEW" | "CONFIRM" | "SUMMARY">("CONTEXT");
  
  // Data State
  const [selectedEventId, setSelectedEventId] = useState<string>(activeEventId || "");
  const [selectedSide, setSelectedSide] = useState<"BRIDE" | "GROOM" | "BOTH">("BRIDE");
  const [file, setFile] = useState<File | null>(null);
  
  // Server Response State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<ProcessedRow[]>([]);
  const [summary, setSummary] = useState<any>(null);
  
  // UI State
  const [filter, setFilter] = useState("ALL");
  const [selectedRowIndexes, setSelectedRowIndexes] = useState<Set<number>>(new Set());

  // Reset entirely
  const handleReset = () => {
    setStep("CONTEXT");
    setFile(null);
    setPreviewRows([]);
    setSummary(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSelectedRowIndexes(new Set());
  };

  const handleDownloadTemplate = () => {
    window.location.href = "/api/admin/guests/import/template";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  // Phase 1: Upload and get preview
  const handleUpload = async () => {
    if (!file || !selectedEventId || !selectedSide) return;
    
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("eventId", selectedEventId);
    formData.append("side", selectedSide);

    try {
      const res = await fetch("/api/admin/guests/import/preview", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      setPreviewRows(data.rows);
      
      // Auto-select safe rows
      const safeIndexes = new Set<number>();
      data.rows.forEach((r: ProcessedRow) => {
        if (r.classification === "NEW" || r.classification === "UPDATE") {
          safeIndexes.add(r.row.index);
        }
      });
      setSelectedRowIndexes(safeIndexes);
      
      setStep("PREVIEW");
    } catch (err: any) {
      setError(err.message || "Failed to process the file.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Phase 2: Commit selected rows
  const handleCommit = async () => {
    setIsProcessing(true);
    setError(null);

    const operationsToCommit = previewRows.filter(r => selectedRowIndexes.has(r.row.index));

    try {
      const res = await fetch("/api/admin/guests/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          side: selectedSide,
          operations: operationsToCommit
        }),
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      setSummary(data.summary);
      setStep("SUMMARY");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to commit import.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRow = (index: number) => {
    const next = new Set(selectedRowIndexes);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedRowIndexes(next);
  };

  // --- Renders ---

  if (step === "CONTEXT") {
    return (
      <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
          <FileSpreadsheet className="text-[#d7b56d]" /> 
          Import Guests
        </h2>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-white/60">1. Select the destination for this import:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">Event</label>
                <select 
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#d7b56d]"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  <option value="" disabled>Select Event...</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">Guest Side</label>
                <select 
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#d7b56d]"
                  value={selectedSide}
                  onChange={(e) => setSelectedSide(e.target.value as any)}
                >
                  <option value="BRIDE">Bride's Side</option>
                  <option value="GROOM">Groom's Side</option>
                  <option value="BOTH">Both / Common</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <p className="text-sm text-white/60 mb-4">2. Prepare your data:</p>
            <button 
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Excel Template
            </button>
          </div>

          <div className="pt-6 flex justify-end">
            <button 
              onClick={() => setStep("UPLOAD")}
              disabled={!selectedEventId}
              className="bg-[#d7b56d] hover:bg-[#c4a25e] text-[#10233b] font-bold px-6 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue to Upload
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "UPLOAD") {
    return (
      <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 shadow-xl">
        <button onClick={() => setStep("CONTEXT")} className="text-white/40 hover:text-white flex items-center gap-1 text-xs mb-4 uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4" /> Back to Context
        </button>
        
        <h2 className="text-xl font-serif text-white mb-2">Upload File</h2>
        <div className="flex items-center gap-2 text-sm text-[#d7b56d] mb-6 font-medium">
          Target: {events.find(e => e.id === selectedEventId)?.name} / {selectedSide} Side
        </div>

        <div className="border-2 border-dashed border-white/10 rounded-xl p-10 flex flex-col items-center justify-center bg-black/20 text-center hover:bg-white/5 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-12 h-12 text-white/20 mb-4" />
          <h3 className="text-white font-medium mb-1">Click to select file</h3>
          <p className="text-white/40 text-sm">.xlsx or .csv up to 5MB</p>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept=".xlsx, .xls, .csv" 
          />
        </div>

        {file && (
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between">
            <span className="text-emerald-400 text-sm flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" /> {file.name}</span>
            <button onClick={() => setFile(null)} className="text-emerald-400/60 hover:text-emerald-400"><X className="w-4 h-4" /></button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="pt-6 flex justify-end">
          <button 
            onClick={handleUpload}
            disabled={!file || isProcessing}
            className="flex items-center gap-2 bg-[#d7b56d] hover:bg-[#c4a25e] text-[#10233b] font-bold px-6 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Processing...</> : "Upload & Preview"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "PREVIEW") {
    const stats = {
      new: previewRows.filter(r => r.classification === "NEW").length,
      updates: previewRows.filter(r => r.classification === "UPDATE").length,
      duplicates: previewRows.filter(r => r.classification === "DUPLICATE").length,
      otherEvent: previewRows.filter(r => r.classification === "OTHER_EVENT").length,
      otherSide: previewRows.filter(r => r.classification === "OTHER_SIDE").length,
      conflicts: previewRows.filter(r => r.classification === "CONFLICT").length,
      invalid: previewRows.filter(r => r.classification === "INVALID").length,
    };

    return (
      <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-serif text-white mb-1">Preview Import</h2>
            <div className="flex items-center gap-2 text-sm text-[#d7b56d] font-medium">
              Target: {events.find(e => e.id === selectedEventId)?.name} / {selectedSide} Side
            </div>
          </div>
          <button onClick={handleReset} className="text-white/60 hover:text-white text-sm">Cancel Import</button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "New", value: stats.new, color: "text-emerald-400" },
            { label: "Updates", value: stats.updates, color: "text-blue-400" },
            { label: "Other Event", value: stats.otherEvent, color: "text-amber-400" },
            { label: "Other Side", value: stats.otherSide, color: "text-purple-400" },
            { label: "Duplicates", value: stats.duplicates, color: "text-white/40" },
            { label: "Conflicts", value: stats.conflicts, color: "text-red-400" },
            { label: "Invalid", value: stats.invalid, color: "text-red-400" },
          ].map((s, i) => (
            <div key={i} className="bg-black/30 border border-white/5 rounded-lg p-3 text-center cursor-pointer hover:bg-white/5" onClick={() => setFilter(s.label.toUpperCase().replace(" ", "_"))}>
              <p className="text-2xl font-light mb-1">{s.value}</p>
              <p className={`text-[10px] uppercase tracking-widest font-bold ${s.color}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["ALL", "NEW", "UPDATE", "OTHER_EVENT", "OTHER_SIDE", "CONFLICT", "INVALID", "DUPLICATE"].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === f ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-white/40 border-transparent hover:bg-white/5 hover:text-white'}`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Table */}
        <GuestImportPreviewTable 
          rows={previewRows} 
          selectedRows={selectedRowIndexes} 
          onToggleRow={toggleRow} 
          filter={filter} 
        />

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-white/5">
          <p className="text-sm text-white/60">
            <strong className="text-white">{selectedRowIndexes.size}</strong> rows selected for import
          </p>
          <button 
            onClick={() => setStep("CONFIRM")}
            disabled={selectedRowIndexes.size === 0}
            className="bg-[#d7b56d] hover:bg-[#c4a25e] text-[#10233b] font-bold px-6 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Review & Confirm
          </button>
        </div>
      </div>
    );
  }

  if (step === "CONFIRM") {
    const selectedOps = previewRows.filter(r => selectedRowIndexes.has(r.row.index));
    const toCreate = selectedOps.filter(r => r.classification === "NEW" || r.classification === "OTHER_EVENT" || r.classification === "OTHER_SIDE").length;
    const toUpdate = selectedOps.filter(r => r.classification === "UPDATE").length;

    return (
      <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-8 shadow-xl max-w-xl mx-auto text-center space-y-6">
        <AlertCircle className="w-16 h-16 text-[#d7b56d] mx-auto opacity-50" />
        <h2 className="text-2xl font-serif text-white">Ready to Import</h2>
        
        <div className="bg-black/30 border border-white/5 rounded-xl p-6 space-y-4 text-left">
          <div className="flex justify-between border-b border-white/5 pb-4">
            <span className="text-white/60">Target Event</span>
            <span className="text-white font-medium">{events.find(e => e.id === selectedEventId)?.name}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-4">
            <span className="text-white/60">Guest Side</span>
            <span className="text-white font-medium">{selectedSide}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-4">
            <span className="text-white/60">Creating Guests</span>
            <span className="text-emerald-400 font-bold">+{toCreate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Updating Guests</span>
            <span className="text-blue-400 font-bold">~{toUpdate}</span>
          </div>
        </div>

        <p className="text-sm text-white/40 px-4">
          Clicking import will write these changes to the database. Existing invitation codes and RSVP data will be preserved.
        </p>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button 
            onClick={() => setStep("PREVIEW")}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <button 
            onClick={handleCommit}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#d7b56d] hover:bg-[#c4a25e] text-[#10233b] font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {isProcessing ? <><RefreshCw className="w-5 h-5 animate-spin" /> Committing...</> : "Confirm Import"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "SUMMARY") {
    return (
      <div className="bg-[#1e2333] border border-emerald-500/30 rounded-2xl p-8 shadow-xl max-w-xl mx-auto text-center space-y-6">
        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
        <h2 className="text-2xl font-serif text-white">Import Complete</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 border border-white/5 rounded-xl p-4">
            <p className="text-3xl font-light text-emerald-400 mb-1">{summary?.created || 0}</p>
            <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Created</p>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-4">
            <p className="text-3xl font-light text-blue-400 mb-1">{summary?.updated || 0}</p>
            <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Updated</p>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-4">
            <p className="text-3xl font-light text-white/60 mb-1">{summary?.skipped || 0}</p>
            <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Skipped</p>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-4">
            <p className={`text-3xl font-light mb-1 ${summary?.failed > 0 ? "text-red-400" : "text-white/60"}`}>{summary?.failed || 0}</p>
            <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Failed</p>
          </div>
        </div>

        <button 
          onClick={handleReset}
          className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors mt-6"
        >
          Import Another File
        </button>
      </div>
    );
  }

  return null;
}

"use client";

import { ProcessedRow } from "@/lib/guest-import";
import { Check, X, AlertTriangle, Info } from "lucide-react";

type Props = {
  rows: ProcessedRow[];
  selectedRows: Set<number>;
  onToggleRow: (index: number) => void;
  filter: string;
};

export function GuestImportPreviewTable({ rows, selectedRows, onToggleRow, filter }: Props) {
  const filteredRows = rows.filter((r) => {
    if (filter === "ALL") return true;
    return r.classification === filter;
  });

  const getStatusBadge = (classification: string) => {
    switch (classification) {
      case "NEW": return <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">New</span>;
      case "UPDATE": return <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">Update</span>;
      case "DUPLICATE": return <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md bg-white/5 text-white/40 border border-white/10">Duplicate</span>;
      case "OTHER_EVENT": return <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">Other Event</span>;
      case "OTHER_SIDE": return <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">Other Side</span>;
      case "CONFLICT": return <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md bg-red-500/10 text-red-400 border border-red-500/20"><AlertTriangle className="w-3 h-3 inline mr-1"/>Conflict</span>;
      case "INVALID": return <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md bg-red-500/10 text-red-400 border border-red-500/20"><X className="w-3 h-3 inline mr-1"/>Invalid</span>;
      default: return null;
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-white/10 bg-black/20">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-white/5 text-white/60 font-medium">
          <tr>
            <th className="px-4 py-3 w-12 text-center">Import</th>
            <th className="px-4 py-3 w-16">Row</th>
            <th className="px-4 py-3">Guest Name</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 w-64">Notes / Changes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {filteredRows.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-white/40">
                No rows match the selected filter.
              </td>
            </tr>
          ) : (
            filteredRows.map((op) => {
              const { classification, row, changes } = op;
              const isSelectable = classification !== "INVALID" && classification !== "CONFLICT" && classification !== "DUPLICATE";
              const isSelected = selectedRows.has(row.index);

              return (
                <tr key={row.index} className={`hover:bg-white/5 transition-colors ${!isSelectable ? 'opacity-50 bg-black/40' : ''}`}>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      disabled={!isSelectable}
                      onClick={() => isSelectable && onToggleRow(row.index)}
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                        isSelected 
                          ? 'bg-emerald-500 border-emerald-500 text-black' 
                          : 'border-white/20 bg-black/40 text-transparent hover:border-white/40'
                      } ${!isSelectable ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}
                    >
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-white/40 font-mono text-xs">{row.index}</td>
                  <td className="px-4 py-3 text-white font-medium">{row.guestName || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-white/60 bg-white/5 px-2 py-0.5 rounded">
                      {row.invitationType} ({row.allowedGuestCount})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/60 font-mono text-xs">{row.whatsappNumber || "—"}</td>
                  <td className="px-4 py-3">
                    {getStatusBadge(classification)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 max-w-xs truncate">
                      {changes && classification === "UPDATE" && <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      <span className={`text-xs truncate ${classification === "CONFLICT" || classification === "INVALID" ? "text-red-400" : "text-white/60"}`}>
                        {changes || "—"}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

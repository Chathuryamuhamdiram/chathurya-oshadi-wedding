"use client";

import { useState, useMemo } from "react";
import { 
  GiftMoneyEvent, 
  GiftMoneyItem, 
  EventFilterType, 
  SortOrderType 
} from "./types";
import { formatLKR } from "./utils";
import { generateGiftMoneyPdf } from "./pdf-export";
import { deleteGiftMoneyEntryAction, logPdfExportAction } from "./actions";
import { GiftMoneyModal } from "./GiftMoneyModal";
import { BulkPasteModal } from "./BulkPasteModal";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { 
  Plus, 
  Search, 
  Download, 
  FileSpreadsheet, 
  Edit2, 
  Trash2, 
  Heart, 
  PartyPopper, 
  Coins, 
  ArrowUpDown,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface GiftMoneyClientProps {
  initialEntries: GiftMoneyItem[];
  events: GiftMoneyEvent[];
}

export function GiftMoneyClient({ initialEntries, events }: GiftMoneyClientProps) {
  // Filter & Search states
  const [filter, setFilter] = useState<EventFilterType>("ALL");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrderType>("RECENT");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GiftMoneyItem | null>(null);
  const [isBulkPasteOpen, setIsBulkPasteOpen] = useState(false);

  // Delete dialog state
  const [deleteItem, setDeleteItem] = useState<GiftMoneyItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // PDF Export state
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // 1. Calculate overall totals from all entries (independent of search/event filter)
  const allWeddingTotal = useMemo(() => {
    return initialEntries
      .filter((e) => e.event.eventType === "WEDDING")
      .reduce((sum, e) => sum + e.amount, 0);
  }, [initialEntries]);

  const allHomecomingTotal = useMemo(() => {
    return initialEntries
      .filter((e) => e.event.eventType === "HOMECOMING")
      .reduce((sum, e) => sum + e.amount, 0);
  }, [initialEntries]);

  const allGrandTotal = useMemo(() => {
    return allWeddingTotal + allHomecomingTotal;
  }, [allWeddingTotal, allHomecomingTotal]);

  // 2. Filter & Sort entries
  const filteredAndSortedEntries = useMemo(() => {
    let result = [...initialEntries];

    // Filter by Event
    if (filter === "WEDDING") {
      result = result.filter((e) => e.event.eventType === "WEDDING");
    } else if (filter === "HOMECOMING") {
      result = result.filter((e) => e.event.eventType === "HOMECOMING");
    }

    // Filter by Search (Person / Guest Name)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((e) => e.name.toLowerCase().includes(q));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOrder) {
        case "NAME_ASC":
          return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        case "AMOUNT_DESC":
          return b.amount - a.amount;
        case "AMOUNT_ASC":
          return a.amount - b.amount;
        case "RECENT":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [initialEntries, filter, search, sortOrder]);

  // Handle Edit
  const handleEdit = (item: GiftMoneyItem) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    setDeleteError(null);

    const res = await deleteGiftMoneyEntryAction(deleteItem.id);
    setIsDeleting(false);

    if (res.success) {
      setDeleteItem(null);
    } else {
      setDeleteError(res.error || "Failed to delete entry.");
    }
  };

  // Handle PDF Export
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      // PDF respects CURRENT FILTER and current SORT ORDER
      generateGiftMoneyPdf({
        entries: filteredAndSortedEntries,
        filter,
        weddingTotal: allWeddingTotal,
        homecomingTotal: allHomecomingTotal,
        grandTotal: allGrandTotal,
      });

      // Audit Log
      const exportedCount = filteredAndSortedEntries.length;
      const exportedAmount = filteredAndSortedEntries.reduce((s, e) => s + e.amount, 0);
      await logPdfExportAction(filter, exportedCount, exportedAmount);
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Active event ID for defaulting in the add modal
  const defaultEventId = useMemo(() => {
    if (filter === "WEDDING") {
      return events.find((e) => e.eventType === "WEDDING")?.id;
    }
    if (filter === "HOMECOMING") {
      return events.find((e) => e.eventType === "HOMECOMING")?.id;
    }
    return events[0]?.id;
  }, [filter, events]);

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-wide">
            Gift Money Register
          </h1>
          <p className="text-white/50 text-xs sm:text-sm mt-1">
            Track and manage monetary gifts received from guests for Wedding and Homecoming.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            variant="outline"
            className="bg-[#10233B]/40 hover:bg-[#10233B] text-[#D7B56D] border-[#D7B56D]/30 hover:border-[#D7B56D]/60 text-xs sm:text-sm font-medium transition-all shadow-sm"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Download PDF
          </Button>

          <Button
            onClick={() => setIsBulkPasteOpen(true)}
            variant="outline"
            className="bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border-white/10 text-xs sm:text-sm font-medium transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-400" />
            Bulk Paste
          </Button>

          <Button
            onClick={() => {
              setEditingItem(null);
              setIsAddModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium shadow-lg shadow-emerald-950/30 transition-all"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* 2. Total Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Wedding Total */}
        {(filter === "ALL" || filter === "WEDDING") && (
          <div
            className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
              filter === "WEDDING"
                ? "sm:col-span-3 bg-gradient-to-br from-[#121c2c] to-[#17253a] border-emerald-500/30 shadow-lg"
                : "bg-[#141824] border-white/5 hover:border-white/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-emerald-400" />
                Wedding Total
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                {initialEntries.filter((e) => e.event.eventType === "WEDDING").length} Gifts
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-serif font-bold text-white mt-3 truncate tracking-tight">
              {formatLKR(allWeddingTotal)}
            </div>
            <p className="text-[11px] text-white/40 mt-1">
              Monetary gifts received during the main wedding reception
            </p>
          </div>
        )}

        {/* Homecoming Total */}
        {(filter === "ALL" || filter === "HOMECOMING") && (
          <div
            className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
              filter === "HOMECOMING"
                ? "sm:col-span-3 bg-gradient-to-br from-[#121c2c] to-[#17253a] border-blue-500/30 shadow-lg"
                : "bg-[#141824] border-white/5 hover:border-white/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <PartyPopper className="w-3.5 h-3.5 text-blue-400" />
                Homecoming Total
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                {initialEntries.filter((e) => e.event.eventType === "HOMECOMING").length} Gifts
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-serif font-bold text-white mt-3 truncate tracking-tight">
              {formatLKR(allHomecomingTotal)}
            </div>
            <p className="text-[11px] text-white/40 mt-1">
              Monetary gifts received during the homecoming celebration
            </p>
          </div>
        )}

        {/* Grand Total (shown when filter === 'ALL') */}
        {filter === "ALL" && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#161f30] to-[#1e2a40] border border-[#D7B56D]/30 relative overflow-hidden group shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[#D7B56D] text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-[#D7B56D]" />
                Grand Total
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#D7B56D]/15 text-[#D7B56D] border border-[#D7B56D]/30 font-medium">
                {initialEntries.length} Total
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-serif font-bold text-[#F8F2E8] mt-3 truncate tracking-tight">
              {formatLKR(allGrandTotal)}
            </div>
            <p className="text-[11px] text-white/50 mt-1">
              Wedding Total + Homecoming Total
            </p>
          </div>
        )}
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="bg-[#141824] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Event Filters */}
        <div className="flex items-center bg-black/20 p-1 rounded-xl border border-white/5 self-start md:self-auto">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === "ALL"
                ? "bg-white/15 text-white shadow-sm font-semibold"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            All ({initialEntries.length})
          </button>
          <button
            onClick={() => setFilter("WEDDING")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              filter === "WEDDING"
                ? "bg-emerald-500/20 text-emerald-300 shadow-sm font-semibold border border-emerald-500/30"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            Wedding ({initialEntries.filter((e) => e.event.eventType === "WEDDING").length})
          </button>
          <button
            onClick={() => setFilter("HOMECOMING")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              filter === "HOMECOMING"
                ? "bg-blue-500/20 text-blue-300 shadow-sm font-semibold border border-blue-500/30"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            Homecoming ({initialEntries.filter((e) => e.event.eventType === "HOMECOMING").length})
          </button>
        </div>

        {/* Right: Search & Sorting */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Name..."
              className="w-full pl-9 pr-3 py-1.5 bg-black/20 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-xl border border-white/10">
            <ArrowUpDown className="w-3.5 h-3.5 text-white/40 shrink-0" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrderType)}
              className="bg-transparent text-xs text-white/80 focus:outline-none cursor-pointer pr-1"
            >
              <option value="RECENT" className="bg-[#161a26] text-white">
                Recently Added
              </option>
              <option value="NAME_ASC" className="bg-[#161a26] text-white">
                Name A–Z
              </option>
              <option value="AMOUNT_DESC" className="bg-[#161a26] text-white">
                Amount High to Low
              </option>
              <option value="AMOUNT_ASC" className="bg-[#161a26] text-white">
                Amount Low to High
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Main Table */}
      <div className="bg-[#141824] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                <th className="py-3.5 px-4">Person / Guest Name</th>
                <th className="py-3.5 px-4">Event</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4">Note</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAndSortedEntries.length > 0 ? (
                filteredAndSortedEntries.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Name */}
                    <td className="py-3 px-4 font-medium text-white">
                      {item.name}
                    </td>

                    {/* Event Badge */}
                    <td className="py-3 px-4">
                      {item.event.eventType === "WEDDING" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Heart className="w-3 h-3" />
                          Wedding
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <PartyPopper className="w-3 h-3" />
                          Homecoming
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right font-mono font-semibold text-white tracking-tight">
                      {formatLKR(item.amount)}
                    </td>

                    {/* Note */}
                    <td className="py-3 px-4 text-white/50 text-xs max-w-xs truncate">
                      {item.note || <span className="text-white/20">—</span>}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                          title="Edit Entry"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteItem(item);
                            setDeleteError(null);
                          }}
                          className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/40">
                    <Coins className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium text-white/60">
                      No gift money entries found
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      {search
                        ? `No records matching "${search}".`
                        : "Click '+ Add Entry' or 'Bulk Paste' to start recording gifts."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer info */}
        {filteredAndSortedEntries.length > 0 && (
          <div className="px-4 py-3 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-2">
            <span>
              Showing {filteredAndSortedEntries.length} of {initialEntries.length} records
            </span>
            <div className="font-mono text-white/70">
              Filtered Total:{" "}
              <strong className="text-white">
                {formatLKR(
                  filteredAndSortedEntries.reduce((sum, item) => sum + item.amount, 0)
                )}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* 5. Modals */}
      <GiftMoneyModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        initialData={editingItem}
        events={events}
        defaultEventId={defaultEventId}
      />

      <BulkPasteModal
        open={isBulkPasteOpen}
        onOpenChange={setIsBulkPasteOpen}
        events={events}
        defaultEventId={defaultEventId}
        existingEntries={initialEntries}
      />

      {/* Delete Confirmation Component */}
      <DeleteConfirmationDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Gift Money Entry"
        recordName={
          deleteItem
            ? `${deleteItem.name} — ${formatLKR(deleteItem.amount)} (${deleteItem.event.name})`
            : undefined
        }
        description={
          <>
            Are you sure you want to delete this record? This action cannot be undone.
            {deleteError && (
              <div className="mt-2 text-sm text-red-500 font-medium">{deleteError}</div>
            )}
          </>
        }
        loading={isDeleting}
        requiresTypedConfirmation={false}
      />
    </div>
  );
}

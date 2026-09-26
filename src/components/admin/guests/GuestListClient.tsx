"use client";

import { useState, useTransition, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GuestForm } from "@/app/admin/guests/GuestForm";
import { WhatsAppShareModal } from "@/app/admin/guests/WhatsAppShareModal";
import { DeleteGuestButton } from "@/app/admin/guests/DeleteGuestButton";
import { updateGuestSendStatus } from "@/app/admin/guests/actions";
import { Search, RefreshCw, CheckCircle2, Link2, UserCheck } from "lucide-react";
import { GuestExportModal } from "./GuestExportModal";
import { AdminRSVPModal } from "./AdminRSVPModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function getRsvpColor(status: string) {
  switch (status) {
    case "ATTENDING":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "NOT_ATTENDING":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "NOT_SURE":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    default:
      return "bg-white/5 text-white/40 border-white/10";
  }
}

function getTypeColor(type: string) {
  return type === "FAMILY"
    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
    : "bg-purple-500/10 text-purple-400 border-purple-500/20";
}

export function GuestListClient({
  initialGuests,
  activeEventId,
  isAllEvents,
  canEditGuests,
  canExportGuests,
  canViewLiquor,
  canViewCodes,
  eventName,
}: {
  initialGuests: any[];
  activeEventId: string;
  isAllEvents: boolean;
  canEditGuests: boolean;
  canExportGuests?: boolean;
  canViewLiquor?: boolean;
  canViewCodes?: boolean;
  eventName?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sideTab, setSideTab] = useState<"ALL" | "GROOM" | "BRIDE">("ALL");
  const [rsvpFilter, setRsvpFilter] = useState("ALL");
  const [sendFilter, setSendFilter] = useState("ALL");
  const [groupFilter, setGroupFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("RECENTLY_ADDED");
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [showRefreshSuccess, setShowRefreshSuccess] = useState(false);
  const [selectedRSVPGuest, setSelectedRSVPGuest] = useState<any>(null);
  const router = useRouter();

  const [optimisticDeletes, setOptimisticDeletes] = useState<Set<string>>(new Set());

  const handleRefresh = useCallback(() => {
    startRefreshTransition(() => {
      router.refresh();
    });
    
    // Show success indicator briefly
    setShowRefreshSuccess(true);
    setTimeout(() => setShowRefreshSuccess(false), 2000);
  }, [router]);

  // Manual refresh logic remains unchanged

  // Handle Checkbox Toggle
  const handleToggleSend = (guest: any, currentSend: boolean) => {
    if (!canEditGuests || isPending) return;

    // Find the relevant EventGuest record for the current event context
    const eg = guest.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
    if (!eg) return;

    startTransition(async () => {
      const res = await updateGuestSendStatus(guest.id, eg.eventId, !currentSend);
      if (!res.success) {
        alert(res.error || "Failed to update send status");
      }
    });
  };

  // Memoized filtering and sorting
  const filteredAndSortedGuests = useMemo(() => {
    let result = initialGuests.filter(g => !optimisticDeletes.has(g.id));

    // 1. Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.displayName.toLowerCase().includes(q) ||
          (g.whatsappNumber && g.whatsappNumber.includes(q)) ||
          g.invitationCode.toLowerCase().includes(q)
      );
    }

    // 2. Side Filter
    if (sideTab !== "ALL") {
      result = result.filter((g) => g.side === sideTab);
    }

    // 3. RSVP Filter
    if (rsvpFilter !== "ALL") {
      result = result.filter((g) => {
        const eg = g.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
        const status = (eg?.rsvpStatus && eg.rsvpStatus !== "PENDING") ? eg.rsvpStatus : g.rsvpStatus;
        return status === rsvpFilter;
      });
    }

    // 4. Send Filter
    if (sendFilter !== "ALL") {
      const targetSend = sendFilter === "SENT";
      result = result.filter((g) => {
        const eg = g.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
        const isSent = eg ? eg.send : false;
        return isSent === targetSend;
      });
    }

    // 5. Group Filter
    if (groupFilter !== "ALL") {
      result = result.filter((g) => {
        const eg = g.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
        return eg?.guestGroup === groupFilter;
      });
    }

    // 6. Sort By
    result.sort((a, b) => {
      switch (sortBy) {
        case "NAME_AZ":
          return a.displayName.localeCompare(b.displayName);
        case "NAME_ZA":
          return b.displayName.localeCompare(a.displayName);
        case "GROOM_FIRST":
          if (a.side === "GROOM" && b.side !== "GROOM") return -1;
          if (a.side !== "GROOM" && b.side === "GROOM") return 1;
          return 0;
        case "BRIDE_FIRST":
          if (a.side === "BRIDE" && b.side !== "BRIDE") return -1;
          if (a.side !== "BRIDE" && b.side === "BRIDE") return 1;
          return 0;
        case "RSVP_CONFIRMED_FIRST": {
          const egA = a.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
          const egB = b.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
          const statusA = (egA?.rsvpStatus && egA.rsvpStatus !== "PENDING") ? egA.rsvpStatus : a.rsvpStatus;
          const statusB = (egB?.rsvpStatus && egB.rsvpStatus !== "PENDING") ? egB.rsvpStatus : b.rsvpStatus;
          if (statusA === "ATTENDING" && statusB !== "ATTENDING") return -1;
          if (statusA !== "ATTENDING" && statusB === "ATTENDING") return 1;
          return 0;
        }
        case "RSVP_PENDING_FIRST": {
          const egA = a.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
          const egB = b.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
          const statusA = (egA?.rsvpStatus && egA.rsvpStatus !== "PENDING") ? egA.rsvpStatus : a.rsvpStatus;
          const statusB = (egB?.rsvpStatus && egB.rsvpStatus !== "PENDING") ? egB.rsvpStatus : b.rsvpStatus;
          if (statusA === "PENDING" && statusB !== "PENDING") return -1;
          if (statusA !== "PENDING" && statusB === "PENDING") return 1;
          return 0;
        }
        case "SENT_FIRST":
        case "NOT_SENT_FIRST":
          const egA = a.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
          const egB = b.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
          const sendA = egA ? egA.send : false;
          const sendB = egB ? egB.send : false;
          if (sortBy === "SENT_FIRST") return sendA === sendB ? 0 : sendA ? -1 : 1;
          return sendA === sendB ? 0 : sendA ? 1 : -1;
        case "SEATS_HIGH_LOW":
          return b.allowedGuestCount - a.allowedGuestCount;
        case "LIQUOR_HIGH_LOW":
          return b.liquorCount - a.liquorCount;
        case "RECENTLY_ADDED":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [initialGuests, optimisticDeletes, searchQuery, sideTab, rsvpFilter, sendFilter, groupFilter, sortBy, activeEventId, isAllEvents]);

  const expectedTotalGuests = filteredAndSortedGuests.reduce((sum, g) => {
    const eg = g.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
    const rsvpStatus = (eg?.rsvpStatus && eg.rsvpStatus !== "PENDING") ? eg.rsvpStatus : g.rsvpStatus;
    const confirmed = (eg?.confirmedCount && eg.confirmedCount > 0) ? eg.confirmedCount : g.confirmedGuestCount;
    
    if (rsvpStatus === "NOT_ATTENDING") return sum;
    if (rsvpStatus === "ATTENDING") return sum + confirmed;
    return sum + g.allowedGuestCount;
  }, 0);

  const totalConfirmed = filteredAndSortedGuests.reduce((sum, g) => {
    const eg = g.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
    const confirmed = (eg?.confirmedCount && eg.confirmedCount > 0) ? eg.confirmedCount : g.confirmedGuestCount;
    return sum + confirmed;
  }, 0);

  const totalLiquor = filteredAndSortedGuests.reduce((sum, g) => {
    const eg = g.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
    const liquor = (eg?.liquorCount && eg.liquorCount > 0) ? eg.liquorCount : g.liquorCount;
    return sum + liquor;
  }, 0);

  // Send KPI
  let totalSent = 0;
  let totalNotSent = 0;
  if (!isAllEvents) {
    filteredAndSortedGuests.forEach(g => {
      const eg = g.eventGuests.find((eg: any) => eg.eventId === activeEventId);
      if (eg && eg.send) totalSent++;
      else totalNotSent++;
    });
  }

  return (
    <div className="space-y-6">
      
      {/* Optional Send Summary KPI (only if single event mode) */}
      {!isAllEvents && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { 
              label: sideTab === "ALL" ? "Total Guest Count" : sideTab === "GROOM" ? "Groom Guest Count" : "Bride Guest Count", 
              value: expectedTotalGuests, 
              icon: sideTab === "ALL" ? "👥" : sideTab === "GROOM" ? "🤵" : "👰", 
              color: sideTab === "ALL" ? "from-violet-500/20 to-purple-500/10 border-violet-500/20" : sideTab === "GROOM" ? "from-blue-500/20 to-indigo-500/10 border-blue-500/20" : "from-pink-500/20 to-rose-500/10 border-pink-500/20" 
            },
            { label: "Confirmed Guests", value: totalConfirmed, icon: "◉", color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20" },
            { label: "Liquor Count", value: totalLiquor, icon: "◈", color: "from-amber-500/20 to-orange-500/10 border-amber-500/20" }
          ].map((card) => (
            <div
              key={card.label}
              className={`relative rounded-2xl border bg-gradient-to-br ${card.color} p-6 overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-30 bg-white/10 -translate-y-1/2 translate-x-1/2" />
              <p className="text-3xl font-serif text-white">{card.value}</p>
              <p className="text-white/50 text-sm font-sans mt-1">{card.label}</p>
              <span className="absolute bottom-4 right-5 text-2xl opacity-20 text-white">{card.icon}</span>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-[#1e2333] border border-white/5 rounded-xl px-4 py-3 flex flex-col gap-2.5">
        
        {/* ROW 1: Search, Side, Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
          
          <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-[240px] xl:w-[280px] shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search Guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20 w-full h-10 transition-colors"
              />
            </div>

            {/* Guest Side Tabs */}
            <div className="flex items-center p-1 bg-black/20 rounded-lg border border-white/5 w-full md:w-auto h-10 shrink-0">
              {["ALL", "GROOM", "BRIDE"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSideTab(tab as any)}
                  className={`flex-1 md:w-[100px] xl:w-[115px] h-full text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                    sideTab === tab
                      ? "bg-white/10 text-white shadow-sm border border-white/5"
                      : "text-white/40 hover:text-white/80 border border-transparent"
                  }`}
                >
                  {tab === "ALL" ? "All Guests" : tab === "GROOM" ? "Groom Side" : "Bride Side"}
                </button>
              ))}
            </div>
          </div>

          {/* Actions: PDF + Refresh */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
            {canExportGuests && (
              <div className="flex-1 md:flex-none">
                <GuestExportModal 
                  activeEventId={activeEventId}
                  isAllEvents={isAllEvents}
                  searchQuery={searchQuery}
                  sideTab={sideTab}
                  rsvpFilter={rsvpFilter}
                  sendFilter={sendFilter}
                  groupFilter={groupFilter}
                  sortBy={sortBy}
                  totalMatching={filteredAndSortedGuests.length}
                  totalCapacity={expectedTotalGuests}
                  eventName={eventName || "All Events"}
                  canViewLiquor={!!canViewLiquor}
                  canViewCodes={!!canViewCodes}
                  className="h-10 w-full md:w-auto"
                />
              </div>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-2 px-4 h-10 bg-black/20 hover:bg-black/40 border border-white/10 rounded-lg text-white/70 hover:text-white text-sm transition-all duration-200 disabled:opacity-50 w-full md:w-[120px] shrink-0"
              title="Refresh Guest List"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {showRefreshSuccess ? (
                <span className="text-emerald-400">Updated</span>
              ) : (
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              )}
            </button>
          </div>
        </div>

        {/* ROW 2: Filters */}
        <div className="flex flex-wrap items-center gap-4 md:gap-5 w-full">
          {/* RSVP */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-white/40 uppercase tracking-wider leading-none pt-px">RSVP:</span>
            <Select value={rsvpFilter} onValueChange={(val) => setRsvpFilter(val || "ALL")}>
              <SelectTrigger className="w-[120px] h-10 bg-black/20 border border-white/10 rounded-[8px] px-3 text-white text-sm focus:ring-1 focus:ring-white/20 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start" sideOffset={4} className="bg-[#1e2333] border-white/10 text-white min-w-[120px]">
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ATTENDING">Confirmed</SelectItem>
                <SelectItem value="NOT_ATTENDING">Declined</SelectItem>
                <SelectItem value="NOT_SURE">Not Sure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Send */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-white/40 uppercase tracking-wider leading-none pt-px">SEND:</span>
            <Select value={sendFilter} onValueChange={(val) => setSendFilter(val || "ALL")}>
              <SelectTrigger className="w-[130px] h-10 bg-black/20 border border-white/10 rounded-[8px] px-3 text-white text-sm focus:ring-1 focus:ring-white/20 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start" sideOffset={4} className="bg-[#1e2333] border-white/10 text-white min-w-[130px]">
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="NOT_SENT">Not Sent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Group */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-white/40 uppercase tracking-wider leading-none pt-px">GROUP:</span>
            <Select value={groupFilter} onValueChange={(val) => setGroupFilter(val || "ALL")}>
              <SelectTrigger className="w-[140px] h-10 bg-black/20 border border-white/10 rounded-[8px] px-3 text-white text-sm focus:ring-1 focus:ring-white/20 shadow-none">
                <SelectValue placeholder="All Groups" />
              </SelectTrigger>
              <SelectContent align="start" sideOffset={4} className="bg-[#1e2333] border-white/10 text-white min-w-[140px] max-h-[300px]">
                <SelectItem value="ALL">All Groups</SelectItem>
                <SelectItem value="Mother's Friends">Mother's Friends</SelectItem>
                <SelectItem value="Father's Friends">Father's Friends</SelectItem>
                <SelectItem value="My Friends">My Friends</SelectItem>
                <SelectItem value="Bride's Friends">Bride's Friends</SelectItem>
                <SelectItem value="Groom's Friends">Groom's Friends</SelectItem>
                <SelectItem value="Relatives">Relatives</SelectItem>
                <SelectItem value="Family Friends">Family Friends</SelectItem>
                <SelectItem value="Work Friends">Work Friends</SelectItem>
                <SelectItem value="Neighbours">Neighbours</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-white/40 uppercase tracking-wider leading-none pt-px">SORT:</span>
            <Select value={sortBy} onValueChange={(val) => setSortBy(val || "RECENTLY_ADDED")}>
              <SelectTrigger className="w-[190px] h-10 bg-black/20 border border-white/10 rounded-[8px] px-3 text-white text-sm focus:ring-1 focus:ring-white/20 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start" sideOffset={4} className="bg-[#1e2333] border-white/10 text-white min-w-[190px]">
                <SelectItem value="RECENTLY_ADDED">Recently Added</SelectItem>
                <SelectItem value="NAME_AZ">Guest Name A–Z</SelectItem>
                <SelectItem value="NAME_ZA">Guest Name Z–A</SelectItem>
                <SelectItem value="GROOM_FIRST">Groom Side First</SelectItem>
                <SelectItem value="BRIDE_FIRST">Bride Side First</SelectItem>
                <SelectItem value="RSVP_CONFIRMED_FIRST">RSVP Confirmed First</SelectItem>
                <SelectItem value="RSVP_PENDING_FIRST">RSVP Pending First</SelectItem>
                <SelectItem value="SENT_FIRST">Sent First</SelectItem>
                <SelectItem value="NOT_SENT_FIRST">Not Sent First</SelectItem>
                <SelectItem value="SEATS_HIGH_LOW">Seat Count High to Low</SelectItem>
                <SelectItem value="LIQUOR_HIGH_LOW">Liquor Count High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters */}
          {(searchQuery !== "" || sideTab !== "ALL" || rsvpFilter !== "ALL" || sendFilter !== "ALL" || sortBy !== "RECENTLY_ADDED") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSideTab("ALL");
                setRsvpFilter("ALL");
                setSendFilter("ALL");
                setGroupFilter("ALL");
                setSortBy("RECENTLY_ADDED");
              }}
              className="text-[11px] font-medium text-white/40 hover:text-white/80 transition-colors h-10 flex items-center justify-center w-full md:w-auto md:ml-auto uppercase tracking-wider px-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Guests Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden backdrop-blur-sm">
        {filteredAndSortedGuests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="text-4xl opacity-20">✦</div>
            <p className="text-white/30 font-sans text-sm">No guests found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm table-fixed min-w-[850px]">
              <thead>
                <tr className="text-white/30 text-xs uppercase tracking-widest border-b border-white/[0.04]">
                  <th className="px-2 py-3 font-medium min-w-[150px] w-[260px]">Guest Name</th>
                  <th className="px-2 py-3 font-medium w-[100px]">Type</th>
                  <th className="px-2 py-3 font-medium w-[70px]">Side</th>
                  <th className="px-2 py-3 font-medium w-[130px]">Group</th>
                  <th className="px-2 py-3 font-medium w-[55px] text-center">Seats</th>
                  <th className="px-2 py-3 font-medium w-[55px] text-center">Liquor</th>
                  <th className="px-2 py-3 font-medium w-[95px]">RSVP</th>
                  <th className="px-2 py-3 font-medium w-[55px] text-center">Send</th>
                  <th className="px-2 py-3 font-medium w-auto text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedGuests.map((guest) => {
                  const eg = guest.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
                  const isSent = eg ? eg.send : false;
                  const sendAt = eg?.sendAt ? new Date(eg.sendAt).toLocaleString() : null;

                  return (
                    <tr
                      key={guest.id}
                      className="border-t border-white/[0.04] hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="px-2 py-3">
                        <div className="flex flex-col gap-0.5">
                          <p className="font-medium text-white/90 text-sm whitespace-normal leading-snug">{guest.displayName}</p>
                          {guest.whatsappNumber && (
                            <p className="text-white/30 text-xs">{guest.whatsappNumber}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${getTypeColor(guest.invitationType)}`}>
                          {guest.invitationType}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <span className="text-white/70 text-xs tracking-wider">
                          {guest.side === "BRIDE" ? "Bride" : guest.side === "GROOM" ? "Groom" : "Both"}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <span className="text-white/50 text-xs tracking-wider">
                          {eg?.guestGroup || "—"}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-white/80 font-medium">
                            {((eg?.rsvpStatus && eg.rsvpStatus !== "PENDING") ? eg.rsvpStatus : guest.rsvpStatus) === "ATTENDING" 
                              ? ((eg?.confirmedCount && eg.confirmedCount > 0) ? eg.confirmedCount : guest.confirmedGuestCount) 
                              : ((eg?.rsvpStatus && eg.rsvpStatus !== "PENDING") ? eg.rsvpStatus : guest.rsvpStatus) === "NOT_ATTENDING" ? 0 : guest.allowedGuestCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span className="text-white/50">{((eg?.liquorCount && eg.liquorCount > 0) ? eg.liquorCount : guest.liquorCount)}</span>
                      </td>
                      <td className="px-2 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${getRsvpColor((eg?.rsvpStatus && eg.rsvpStatus !== "PENDING") ? eg.rsvpStatus : guest.rsvpStatus)}`}>
                          {(eg?.rsvpStatus && eg.rsvpStatus !== "PENDING") ? eg.rsvpStatus : guest.rsvpStatus}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <div 
                          className="flex items-center justify-center w-full h-full"
                          title={sendAt ? `Sent on: ${sendAt}` : "Not sent yet"}
                        >
                          <input
                            type="checkbox"
                            checked={isSent}
                            disabled={!canEditGuests || isPending || !eg}
                            onChange={() => handleToggleSend(guest, isSent)}
                            className="w-4 h-4 rounded border-white/20 bg-black/20 text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-0 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mx-auto"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                          <Link
                            href={`/invite/${guest.invitationCode}`}
                            target="_blank"
                            className="h-[32px] px-2 flex items-center justify-center gap-1.5 text-xs text-emerald-400/80 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-all shrink-0 whitespace-nowrap"
                            title="Open / Copy Invitation"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>Link</span>
                          </Link>
                          
                          <button
                            onClick={() => setSelectedRSVPGuest(guest)}
                            disabled={!canEditGuests}
                            className="h-[32px] px-2 flex items-center justify-center gap-1.5 text-xs bg-[#d7b56d]/10 hover:bg-[#d7b56d]/20 text-[#d7b56d] border border-[#d7b56d]/20 rounded-lg transition-all disabled:opacity-50 shrink-0 whitespace-nowrap"
                            title="Update RSVP"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>RSVP</span>
                          </button>
                          
                          <WhatsAppShareModal guest={guest} compact />
  
                          <GuestForm existingGuest={guest} activeEventId={isAllEvents ? null : activeEventId} compact />
                          
                          <DeleteGuestButton 
                            guest={{ id: guest.id, displayName: guest.displayName }} 
                            onOptimisticDelete={() => setOptimisticDeletes(prev => new Set(prev).add(guest.id))}
                            onOptimisticRollback={() => {
                              setOptimisticDeletes(prev => {
                                const next = new Set(prev);
                                next.delete(guest.id);
                                return next;
                              });
                            }}
                            compact
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminRSVPModal
        isOpen={!!selectedRSVPGuest}
        onClose={() => setSelectedRSVPGuest(null)}
        guest={selectedRSVPGuest}
        activeEventId={activeEventId}
      />
    </div>
  );
}

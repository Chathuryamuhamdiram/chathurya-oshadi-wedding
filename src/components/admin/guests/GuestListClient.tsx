"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { GuestForm } from "@/app/admin/guests/GuestForm";
import { WhatsAppShareModal } from "@/app/admin/guests/WhatsAppShareModal";
import { DeleteGuestButton } from "@/app/admin/guests/DeleteGuestButton";
import { updateGuestSendStatus } from "@/app/admin/guests/actions";
import { Search } from "lucide-react";

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
}: {
  initialGuests: any[];
  activeEventId: string;
  isAllEvents: boolean;
  canEditGuests: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sideTab, setSideTab] = useState<"ALL" | "GROOM" | "BRIDE">("ALL");
  const [rsvpFilter, setRsvpFilter] = useState("ALL");
  const [sendFilter, setSendFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("RECENTLY_ADDED");
  const [isPending, startTransition] = useTransition();

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
    let result = [...initialGuests];

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
      result = result.filter((g) => g.rsvpStatus === rsvpFilter);
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

    // 5. Sort By
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
        case "RSVP_CONFIRMED_FIRST":
          if (a.rsvpStatus === "ATTENDING" && b.rsvpStatus !== "ATTENDING") return -1;
          if (a.rsvpStatus !== "ATTENDING" && b.rsvpStatus === "ATTENDING") return 1;
          return 0;
        case "RSVP_PENDING_FIRST":
          if (a.rsvpStatus === "PENDING" && b.rsvpStatus !== "PENDING") return -1;
          if (a.rsvpStatus !== "PENDING" && b.rsvpStatus === "PENDING") return 1;
          return 0;
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
  }, [initialGuests, searchQuery, sideTab, rsvpFilter, sendFilter, sortBy, activeEventId, isAllEvents]);

  const expectedTotalGuests = filteredAndSortedGuests.reduce((sum, g) => {
    if (g.rsvpStatus === "NOT_ATTENDING") return sum;
    if (g.rsvpStatus === "ATTENDING") return sum + g.confirmedGuestCount;
    return sum + g.allowedGuestCount;
  }, 0);

  const totalConfirmed = filteredAndSortedGuests.reduce((sum, g) => sum + g.confirmedGuestCount, 0);
  const totalLiquor = filteredAndSortedGuests.reduce((sum, g) => sum + g.liquorCount, 0);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: sideTab === "ALL" ? "Total Guests" : sideTab === "GROOM" ? "Groom Guests" : "Bride Guests", 
              value: expectedTotalGuests, 
              icon: sideTab === "ALL" ? "👥" : sideTab === "GROOM" ? "🤵" : "👰", 
              color: sideTab === "ALL" ? "from-violet-500/20 to-purple-500/10 border-violet-500/20" : sideTab === "GROOM" ? "from-blue-500/20 to-indigo-500/10 border-blue-500/20" : "from-pink-500/20 to-rose-500/10 border-pink-500/20" 
            },
            { label: "Confirmed Guests", value: totalConfirmed, icon: "◉", color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20" },
            { label: "Liquor Count", value: totalLiquor, icon: "◈", color: "from-amber-500/20 to-orange-500/10 border-amber-500/20" },
            { label: "Invitations Sent", value: `${totalSent} / ${filteredAndSortedGuests.length}`, icon: "✉", color: "from-cyan-500/20 to-sky-500/10 border-cyan-500/20" },
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
      <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        {/* Left Side: Search & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search Guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20 w-full md:w-64"
            />
          </div>

          <div className="flex items-center p-1 bg-black/20 rounded-lg border border-white/5 overflow-x-auto">
            {["ALL", "GROOM", "BRIDE"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSideTab(tab as any)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  sideTab === tab
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/40 hover:text-white/80"
                }`}
              >
                {tab === "ALL" ? "All Guests" : tab === "GROOM" ? "Groom Side" : "Bride Side"}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 uppercase tracking-widest">RSVP:</span>
            <select
              value={rsvpFilter}
              onChange={(e) => setRsvpFilter(e.target.value)}
              className="bg-black/20 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/30 appearance-none cursor-pointer"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="ATTENDING">Confirmed</option>
              <option value="NOT_ATTENDING">Declined</option>
              <option value="NOT_SURE">Not Sure</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 uppercase tracking-widest">Send:</span>
            <select
              value={sendFilter}
              onChange={(e) => setSendFilter(e.target.value)}
              className="bg-black/20 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/30 appearance-none cursor-pointer"
            >
              <option value="ALL">All</option>
              <option value="SENT">Sent</option>
              <option value="NOT_SENT">Not Sent</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 uppercase tracking-widest">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black/20 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/30 appearance-none cursor-pointer"
            >
              <option value="RECENTLY_ADDED">Recently Added</option>
              <option value="NAME_AZ">Guest Name A–Z</option>
              <option value="NAME_ZA">Guest Name Z–A</option>
              <option value="GROOM_FIRST">Groom Side First</option>
              <option value="BRIDE_FIRST">Bride Side First</option>
              <option value="RSVP_CONFIRMED_FIRST">RSVP Confirmed First</option>
              <option value="RSVP_PENDING_FIRST">RSVP Pending First</option>
              <option value="SENT_FIRST">Sent First</option>
              <option value="NOT_SENT_FIRST">Not Sent First</option>
              <option value="SEATS_HIGH_LOW">Seat Count High to Low</option>
              <option value="LIQUOR_HIGH_LOW">Liquor Count High to Low</option>
            </select>
          </div>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-white/30 text-xs uppercase tracking-widest">
                  <th className="px-6 py-4 font-medium">Guest Name</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Side</th>
                  <th className="px-6 py-4 font-medium">Seats</th>
                  <th className="px-6 py-4 font-medium">Liquor</th>
                  <th className="px-6 py-4 font-medium">RSVP</th>
                  <th className="px-6 py-4 font-medium">Send</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
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
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white/90">{guest.displayName}</p>
                          {guest.whatsappNumber && (
                            <p className="text-white/30 text-xs mt-0.5">{guest.whatsappNumber}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(guest.invitationType)}`}>
                          {guest.invitationType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white/70 text-xs tracking-wider">
                          {guest.side === "BRIDE" ? "Bride" : guest.side === "GROOM" ? "Groom" : "Both"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white/80 font-medium">{guest.confirmedGuestCount}</span>
                          <span className="text-white/20">/</span>
                          <span className="text-white/40">{guest.allowedGuestCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white/50">{guest.liquorCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRsvpColor(guest.rsvpStatus)}`}>
                          {guest.rsvpStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div 
                          className="flex items-center justify-center w-6 h-6"
                          title={sendAt ? `Sent on: ${sendAt}` : "Not sent yet"}
                        >
                          <input
                            type="checkbox"
                            checked={isSent}
                            disabled={!canEditGuests || isPending || !eg}
                            onChange={() => handleToggleSend(guest, isSent)}
                            className="w-4 h-4 rounded border-white/20 bg-black/20 text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-0 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/invite/${guest.invitationCode}`}
                            target="_blank"
                            className="font-mono text-xs text-emerald-400/70 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-2"
                            title="View Invitation"
                          >
                            <span>{guest.invitationCode}</span>
                            <span>🔗</span>
                          </Link>
                          
                          <WhatsAppShareModal guest={guest} />
  
                          <div>
                            <GuestForm existingGuest={guest} activeEventId={isAllEvents ? null : activeEventId} />
                          </div>
                          
                          <DeleteGuestButton guest={{ id: guest.id, displayName: guest.displayName }} />
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
    </div>
  );
}

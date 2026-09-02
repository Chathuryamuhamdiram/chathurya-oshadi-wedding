import { prisma } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { GuestForm } from "./GuestForm";
import { WhatsAppShareModal } from "./WhatsAppShareModal";
import { DeleteGuestButton } from "./DeleteGuestButton";

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

export default async function AdminGuestsPage() {
  const guests = await prisma.guest.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalAllowed = guests.reduce((sum, g) => sum + g.allowedGuestCount, 0);
  const totalConfirmed = guests.reduce((sum, g) => sum + g.confirmedGuestCount, 0);
  const totalLiquor = guests.reduce((sum, g) => sum + g.liquorCount, 0);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-wide">Guest Management</h1>
          <p className="text-white/40 text-sm font-sans mt-1">{guests.length} guests · {totalAllowed} seats allocated</p>
        </div>
        <GuestForm />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Invitations", value: guests.length, icon: "✦", color: "from-violet-500/20 to-purple-500/10 border-violet-500/20" },
          { label: "Confirmed Guests", value: totalConfirmed, icon: "◉", color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20" },
          { label: "Liquor Count", value: totalLiquor, icon: "◈", color: "from-amber-500/20 to-orange-500/10 border-amber-500/20" },
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

      {/* Guests Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden backdrop-blur-sm">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-sm font-sans text-white/60 uppercase tracking-widest">Guest List</h2>
        </div>

        {guests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="text-4xl opacity-20">✦</div>
            <p className="text-white/30 font-sans text-sm">No guests yet. Add your first invitation.</p>
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
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest, i) => (
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
                          <GuestForm existingGuest={guest} />
                        </div>
                        
                        <DeleteGuestButton guest={{ id: guest.id, displayName: guest.displayName }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

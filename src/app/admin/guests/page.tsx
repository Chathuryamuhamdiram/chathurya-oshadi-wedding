import { prisma } from "@/lib/db";
import { GuestForm } from "./GuestForm";
import { getActiveEventId, ALL_EVENTS_VALUE } from "@/lib/event-context";
import { GuestListClient } from "@/components/admin/guests/GuestListClient";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";

export default async function AdminGuestsPage() {
  const sessionCookie = (await cookies()).get("admin_session")?.value;
  let canEditGuests = false;
  if (sessionCookie) {
    const payload = await verifyJWT(sessionCookie);
    if (payload) {
      const permissions = (payload.permissions as string[]) || [];
      const role = payload.role as string;
      canEditGuests = permissions.includes("guest.edit") || role === "SUPER_ADMIN";
    }
  }

  const activeEventId = await getActiveEventId();
  const isAllEvents = activeEventId === ALL_EVENTS_VALUE;

  let activeEvent = null;
  if (!isAllEvents) {
    activeEvent = await prisma.ceremonyEvent.findUnique({
      where: { id: activeEventId },
      select: { id: true, name: true, eventType: true }
    });
  }

  const rawGuests = await prisma.guest.findMany({
    include: {
      eventGuests: {
        include: { event: { select: { id: true, name: true } } }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  const guests = isAllEvents 
    ? rawGuests 
    : rawGuests.filter(g => g.eventGuests.some(eg => eg.eventId === activeEventId) || g.eventGuests.length === 0);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif text-white tracking-wide">Guest Management</h1>
            {isAllEvents ? (
              <span className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-white/40 border border-white/10 font-sans">All Events</span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">{activeEvent?.name}</span>
            )}
          </div>
          <p className="text-white/40 text-sm font-sans mt-1">Manage all your guest invitations efficiently.</p>
        </div>
        <GuestForm activeEventId={isAllEvents ? null : activeEventId} />
      </div>

      {/* Guest List Client Component with Tabs, Filters, Sort, and Table */}
      <GuestListClient 
        initialGuests={guests} 
        activeEventId={activeEventId} 
        isAllEvents={isAllEvents} 
        canEditGuests={canEditGuests} 
      />
    </div>
  );
}

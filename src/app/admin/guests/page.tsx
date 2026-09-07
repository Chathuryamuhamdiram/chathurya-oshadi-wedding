import { prisma } from "@/lib/db";
import { GuestForm } from "./GuestForm";
import { getActiveEventId, ALL_EVENTS_VALUE } from "@/lib/event-context";
import { GuestListClient } from "@/components/admin/guests/GuestListClient";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { GuestExcelImporter } from "@/components/admin/guests/GuestExcelImporter";
import { FileSpreadsheet } from "lucide-react";

export default async function AdminGuestsPage() {
  const sessionCookie = (await cookies()).get("admin_session")?.value;
  let canEditGuests = false;
  let canImportGuests = false;
  if (sessionCookie) {
    const payload = await verifyJWT(sessionCookie);
    if (payload) {
      const permissions = (payload.permissions as string[]) || [];
      const role = payload.role as string;
      canEditGuests = permissions.includes("guest.edit") || role === "SUPER_ADMIN";
      canImportGuests = permissions.includes("guest.import") || role === "SUPER_ADMIN";
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

  // Get all events for the importer dropdown
  const allEvents = await prisma.ceremonyEvent.findMany({ select: { id: true, name: true } });

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
        <div className="flex items-center gap-3">
          <GuestForm activeEventId={isAllEvents ? null : activeEventId} />
        </div>
      </div>

      {canImportGuests && (
        <details className="group">
          <summary className="flex items-center justify-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-4 py-3 rounded-lg transition-colors list-none max-w-[200px] ml-auto mb-6">
            <FileSpreadsheet className="w-4 h-4" />
            Import Excel
          </summary>
          <div className="mt-4 mb-8">
            <GuestExcelImporter activeEventId={isAllEvents ? null : activeEventId} events={allEvents} />
          </div>
        </details>
      )}

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

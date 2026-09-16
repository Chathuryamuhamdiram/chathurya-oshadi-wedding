import { prisma } from "@/lib/db";
import { getActiveEventId, ALL_EVENTS_VALUE } from "@/lib/event-context";
import { EventPlanClient } from "./EventPlanClient";
import { Calendar, ListTodo } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";

export default async function EventPlanPage() {
  await requirePermission(PERMISSIONS.CALENDAR_VIEW); // Reuse events view permission
  
  const activeEventId = await getActiveEventId();
  const isAllEvents = activeEventId === ALL_EVENTS_VALUE;

  // Fetch Ceremony events
  const ceremonies = await prisma.ceremonyEvent.findMany({
    where: { isActive: true },
    orderBy: { eventDate: 'asc' }
  });

  const activeEvent = isAllEvents ? null : ceremonies.find(c => c.id === activeEventId);

  if (ceremonies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-white/40" />
        </div>
        <h2 className="text-xl font-medium text-white mb-2">No Events Found</h2>
        <p className="text-white/40 max-w-md">Please create an event (e.g. Wedding, Homecoming) in the Events module first.</p>
      </div>
    );
  }

  // Fetch Event Plan items based on active event filter
  const items = await prisma.eventPlanItem.findMany({
    where: activeEvent ? { eventId: activeEvent.id } : undefined,
    orderBy: { sortOrder: 'asc' },
    include: { event: true } // Need event name for 'All Events' view grouping
  });

  // Grouping logic for "All Events" mode
  const displayCeremonies = isAllEvents ? ceremonies : activeEvent ? [activeEvent] : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight flex items-center gap-3">
            <ListTodo className="w-8 h-8 text-indigo-400" />
            Event Plan
          </h1>
          <p className="text-white/40 mt-1">
            Manage the chronological run sheet for the event day.
          </p>
        </div>
      </div>

      <div className="space-y-12">
        {displayCeremonies.map(ceremony => {
          const ceremonyItems = items.filter(i => i.eventId === ceremony.id);
          return (
            <div key={ceremony.id}>
              <EventPlanClient 
                items={ceremonyItems} 
                eventId={ceremony.id} 
                eventName={ceremony.name} 
                isAllEvents={isAllEvents} 
              />
            </div>
          )
        })}
      </div>

    </div>
  );
}

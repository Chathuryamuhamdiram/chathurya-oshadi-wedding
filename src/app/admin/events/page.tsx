import { prisma } from "@/lib/db";
import { EventForm } from "./EventForm";
import { VenueForm } from "./VenueForm";
import { EventItemList } from "./EventItemList";

export default async function EventsDashboardPage() {
  const venues = await prisma.venue.findMany({
    orderBy: { name: 'asc' }
  });

  const events = await prisma.weddingEvent.findMany({
    include: { venue: true, items: true },
    orderBy: [
      { eventDate: 'asc' },
      { sortOrder: 'asc' },
      { startTime: 'asc' }
    ]
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-wide">Itinerary & Events</h1>
          <p className="text-white/40 text-sm font-sans mt-1">Manage venues and the wedding day schedule.</p>
        </div>
        <div className="flex gap-3">
          <VenueForm />
          <EventForm venues={venues} />
        </div>
      </div>

      {/* Events Timeline */}
      <div className="space-y-6">
        <h2 className="text-xl font-serif text-white/90">Event Schedule</h2>
        
        {events.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/[0.1] rounded-2xl">
            <div className="text-4xl opacity-20 mb-3">📅</div>
            <p className="text-white/40 text-sm font-sans">No events scheduled yet.</p>
          </div>
        ) : (
          <div className="relative border-l border-white/10 ml-4 md:ml-6 space-y-8 pb-4">
            {events.map((event) => (
              <div key={event.id} className="relative pl-8 md:pl-10">
                {/* Timeline Dot */}
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                
                <div className="bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-colors rounded-2xl p-5 md:p-6 group">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-serif text-white">{event.title}</h3>
                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border text-white/40 bg-white/5 border-white/10">
                          {event.visibility}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm font-sans text-white/60 mb-4">
                        {event.eventDate && (
                          <div className="flex items-center gap-1.5">
                            <span>📅</span> {new Date(event.eventDate).toLocaleDateString()}
                          </div>
                        )}
                        {(event.startTime || event.endTime) && (
                          <div className="flex items-center gap-1.5">
                            <span>🕒</span> {event.startTime || "?"} - {event.endTime || "?"}
                          </div>
                        )}
                        {event.venue && (
                          <div className="flex items-center gap-1.5 text-purple-300">
                            <span>📍</span> {event.venue.name}
                          </div>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="text-sm font-sans text-white/50">{event.description}</p>
                      )}
                      
                      <EventItemList eventId={event.id} eventTitle={event.title} initialItems={event.items} />
                    </div>
                    
                    <div className="shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity mt-4 md:mt-0">
                      <EventForm venues={venues} existingEvent={event} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Venues Grid */}
      <div className="space-y-6 pt-8 border-t border-white/[0.06]">
        <h2 className="text-xl font-serif text-white/90">Locations & Venues</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div key={venue.id} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
              <h3 className="text-lg font-serif text-white/90 mb-1">{venue.name}</h3>
              {venue.address && <p className="text-sm font-sans text-white/50 mb-3">{venue.address}</p>}
              
              <div className="space-y-2 mt-4 pt-4 border-t border-white/[0.06]">
                {venue.phone && (
                  <p className="text-xs font-sans text-white/60 flex items-center gap-2">
                    <span>📞</span> {venue.phone}
                  </p>
                )}
                {venue.googleMapsUrl && (
                  <a href={venue.googleMapsUrl} target="_blank" rel="noreferrer" className="text-xs font-sans text-blue-400 hover:text-blue-300 flex items-center gap-2">
                    <span>🗺️</span> View on Map
                  </a>
                )}
              </div>
            </div>
          ))}
          {venues.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-white/[0.1] rounded-2xl">
              <p className="text-white/40 text-sm font-sans">No venues added yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

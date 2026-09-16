import { prisma } from "@/lib/db";
import { LiveClock } from "./LiveClock";
import { Phone, Calendar as CalendarIcon, CheckSquare, AlertTriangle, ArrowRight } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { getActiveEventId, ALL_EVENTS_VALUE } from "@/lib/event-context";

export default async function AdminWeddingDayPage() {
  await requirePermission(PERMISSIONS.WEDDING_DAY_VIEW);
  const now = new Date();
  
  const activeEventId = await getActiveEventId();
  const activeEvent = activeEventId !== ALL_EVENTS_VALUE 
    ? await prisma.ceremonyEvent.findUnique({ where: { id: activeEventId } }) 
    : null;

  // 1. Fetch Events, Vendors, and Pending Tasks
  const [events, vendors, tasks, planItems] = await Promise.all([
    prisma.weddingEvent.findMany({ 
      where: { eventDate: { not: null } },
      orderBy: [
        { eventDate: 'asc' },
        { startTime: 'asc' }
      ]
    }),
    prisma.vendor.findMany({ 
      where: { 
        OR: [
          { phone: { not: null } },
          { whatsappNumber: { not: null } }
        ]
      },
      orderBy: { serviceCategory: 'asc' }
    }),
    prisma.task.findMany({ 
      where: { 
        status: { not: "COMPLETED" },
        priority: { in: ["HIGH", "CRITICAL"] }
      },
      orderBy: { priority: 'asc' } // CRITICAL, HIGH
    }),
    prisma.eventPlanItem.findMany({
      where: activeEvent ? { eventId: activeEvent.id } : undefined,
      orderBy: { sortOrder: 'asc' }
    })
  ]);

  // Determine "Up Next" event (the first event in the future) for the top banner
  let upcomingEvents = events.filter(e => e.eventDate && e.eventDate >= new Date(now.setHours(0,0,0,0)));
  if (upcomingEvents.length === 0) upcomingEvents = events; 
  
  const upNext = upcomingEvents[0];
  
  // Use Event Plan items as the source of truth for Run of Show
  const laterEvents = planItems;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Live Clock Header */}
      <div className="bg-gradient-to-b from-[#1e2333] to-[#0d1117] border border-white/5 rounded-3xl p-8 sm:p-12 relative overflow-hidden flex items-center justify-center min-h-[250px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 w-full">
          <LiveClock />
        </div>
      </div>

      {/* Up Next Card */}
      {upNext ? (
        <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-2 text-indigo-400 font-semibold tracking-widest uppercase text-xs mb-3">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" /> Up Next
          </div>
          <h2 className="text-3xl font-semibold text-white mb-2">{upNext.title}</h2>
          <div className="flex items-center gap-4 text-white/70 text-sm">
            {upNext.startTime && (
              <span className="font-mono bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                {upNext.startTime} {upNext.endTime ? `- ${upNext.endTime}` : ''}
              </span>
            )}
            {upNext.eventDate && (
              <span>{new Date(upNext.eventDate).toLocaleDateString()}</span>
            )}
          </div>
          {upNext.description && (
            <p className="mt-4 text-white/50 text-sm">{upNext.description}</p>
          )}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 text-center">
          <p className="text-white/40">No upcoming events found.</p>
        </div>
      )}

      {/* Run of Show */}
      {laterEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest px-2">Run of Show (Event Plan)</h3>
          <div className="bg-[#1e2333] border border-white/5 rounded-2xl overflow-hidden relative">
            <div className="absolute left-[70px] top-6 bottom-6 w-px bg-white/10" />
            {laterEvents.map((evt, idx) => (
              <div key={evt.id} className="group flex items-start gap-4 sm:gap-6 py-4 px-4 transition-all hover:bg-white/5 relative z-10">
                <div className="w-[50px] shrink-0 flex flex-col items-end gap-1">
                  <div className="text-white/80 font-mono text-sm mt-0.5">
                    {evt.plannedTime || <span className="text-white/30">—</span>}
                  </div>
                </div>
                <div className="shrink-0 relative flex items-center justify-center w-5 h-5 mt-1 -ml-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-[#1e2333]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium break-words leading-relaxed">{evt.activity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Urgent Tasks */}
      {tasks.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-red-400 uppercase tracking-widest px-2">
            <AlertTriangle className="w-4 h-4" /> Pending Urgent Tasks
          </h3>
          <div className="grid gap-2">
            {tasks.map(task => (
              <div key={task.id} className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-red-200 font-medium">{task.title}</div>
                  <div className="text-red-400/50 text-xs mt-1">Priority: {task.priority}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4 text-red-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Vendor Contacts */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest px-2">Vendor Contacts</h3>
        {vendors.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-4 text-center text-white/40 text-sm">
            No vendors with phone numbers added.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {vendors.map(vendor => (
              <div key={vendor.id} className="bg-[#1e2333] border border-white/5 rounded-xl p-4 flex items-center justify-between group">
                <div>
                  <div className="text-white font-medium">{vendor.vendorName}</div>
                  <div className="text-white/40 text-xs mt-0.5">{vendor.serviceCategory || "Vendor"} • {vendor.contactName || "No Name"}</div>
                </div>
                {vendor.phone && (
                  <a href={`tel:${vendor.phone}`} className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

import { prisma } from "@/lib/db";
import { TableForm } from "./TableForm";
import { AssignTableSelect } from "./AssignTableSelect";
import { Users, AlertCircle, LayoutGrid, Info } from "lucide-react";

export default async function AdminSeatingPage() {
  const tables = await prisma.seatingTable.findMany({
    include: { guests: true },
    orderBy: { createdAt: 'asc' }
  });

  const allGuests = await prisma.guest.findMany({
    where: { rsvpStatus: "ATTENDING" },
    orderBy: { displayName: 'asc' }
  });

  // Calculate stats
  let unassignedCount = 0;

  allGuests.forEach(g => {
    if (!g.tableId) unassignedCount++;
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-wide">Seating & Meals</h1>
          <p className="text-white/50 text-sm mt-1">Organize your floor plan.</p>
        </div>
        <div className="flex items-center gap-4">
          <TableForm />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[140px]">
          <div className="flex items-center gap-2 text-white/50 text-sm font-medium tracking-wide">
            <Users className="w-4 h-4" /> Guest Seating
          </div>
          <div>
            <div className="text-4xl font-serif text-white">{unassignedCount}</div>
            <div className="text-white/40 text-sm mt-1">Guests waiting to be seated</div>
          </div>
        </div>
        <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[140px]">
          <div className="flex items-center gap-2 text-white/50 text-sm font-medium tracking-wide">
            <Info className="w-4 h-4" /> Table Capacity
          </div>
          <div>
            <div className="text-4xl font-serif text-white">{tables.reduce((acc, t) => acc + (t.capacity - t.guests.length), 0)}</div>
            <div className="text-white/40 text-sm mt-1">Total empty seats remaining</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Floor Plan (Tables) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-lg font-medium text-white tracking-wide">
            <LayoutGrid className="w-5 h-5 text-indigo-400" /> Floor Plan
          </div>
          
          {tables.length === 0 ? (
            <div className="bg-white/5 p-12 text-center rounded-2xl border border-white/5">
              <LayoutGrid className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Tables Created</h3>
              <p className="text-white/40 text-sm">Create your first table to start seating guests.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {tables.map(table => {
                const isFull = table.guests.length >= table.capacity;
                return (
                  <div key={table.id} className="bg-[#1e2333] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                    <div className="px-5 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-white/80">{table.name}</h2>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isFull ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-white/50 border border-white/10'
                      }`}>
                        {table.guests.length} / {table.capacity}
                      </span>
                    </div>
                    
                    <div className="p-2 flex-1 space-y-1">
                      {table.guests.length === 0 ? (
                        <div className="text-center text-white/30 text-xs py-6">Empty table</div>
                      ) : (
                        table.guests.map(guest => (
                          <div key={guest.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.02] transition-colors group">
                            <span className="text-sm text-white/80 truncate pr-2">{guest.displayName}</span>
                            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <AssignTableSelect guestId={guest.id} currentTableId={table.id} tables={tables} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Unassigned Guests Roster */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-lg font-medium text-white tracking-wide">
            <Users className="w-5 h-5 text-indigo-400" /> Unassigned Roster
          </div>
          
          <div className="bg-[#1e2333] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[600px]">
            <div className="px-5 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
              <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Guest</span>
              <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Table Assignment</span>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {allGuests.filter(g => !g.tableId).length === 0 ? (
                <div className="text-center text-white/30 text-sm py-10">All confirmed guests have been seated! 🎉</div>
              ) : (
                allGuests.filter(g => !g.tableId).map(guest => (
                  <div key={guest.id} className="flex flex-col gap-2 p-3 rounded-xl border border-white/5 hover:border-indigo-500/30 bg-white/[0.01] transition-colors">
                    <span className="text-sm font-medium text-white/90">{guest.displayName}</span>
                    <div className="flex items-center gap-2">
                      <AssignTableSelect guestId={guest.id} currentTableId={guest.tableId} tables={tables} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

import { prisma } from "@/lib/db";
import { LogisticsForm } from "./LogisticsForm";
import { Plane, Building2, Car, Users, MapPin } from "lucide-react";

export default async function AdminLogisticsPage() {
  const [allGuests, allLogistics] = await Promise.all([
    prisma.guest.findMany({
      orderBy: { displayName: 'asc' }
    }),
    prisma.guestLogistics.findMany({
      include: { guest: true },
      orderBy: { arrivalDateTime: 'asc' }
    })
  ]);

  // Guests who don't have logistics yet
  const guestsWithoutLogistics = allGuests.filter(g => 
    !allLogistics.some(l => l.guestId === g.id)
  );

  // Stats
  const totalWithHotels = allLogistics.filter(l => l.accommodationName).length;
  const totalWithTransport = allLogistics.filter(l => l.transportNotes).length;
  
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const arrivalsToday = allLogistics.filter(l => 
    l.arrivalDateTime && 
    l.arrivalDateTime >= today && 
    l.arrivalDateTime < tomorrow
  ).length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-wide">Logistics & Transport</h1>
          <p className="text-white/50 text-sm mt-1">Manage out-of-town guests, flights, and accommodations.</p>
        </div>
        <div className="flex items-center gap-4">
          <LogisticsForm guests={guestsWithoutLogistics} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[140px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-2 text-white/50 text-sm font-medium tracking-wide">
            <Building2 className="w-4 h-4" /> Hotel Placements
          </div>
          <div className="text-3xl font-semibold text-white mt-auto">
            {totalWithHotels} <span className="text-base font-normal text-white/30">guests</span>
          </div>
        </div>
        
        <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[140px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-2 text-white/50 text-sm font-medium tracking-wide">
            <Plane className="w-4 h-4 text-teal-400" /> Arrivals Today
          </div>
          <div className="text-3xl font-semibold text-white mt-auto">
            {arrivalsToday}
          </div>
        </div>

        <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[140px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-2 text-white/50 text-sm font-medium tracking-wide">
            <Car className="w-4 h-4" /> Transport Notes
          </div>
          <div className="text-3xl font-semibold text-white mt-auto">
            {totalWithTransport}
          </div>
        </div>
      </div>

      {/* Logistics Data Table */}
      <div className="bg-[#1e2333] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Travel Itineraries</h2>
        </div>
        
        {allLogistics.length === 0 ? (
          <div className="bg-white/5 p-12 text-center">
            <MapPin className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Logistics Logged</h3>
            <p className="text-white/40 text-sm">Add logistics for out-of-town guests to track hotels and flights.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-white/30 text-xs uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4 font-medium">Guest</th>
                  <th className="px-6 py-4 font-medium">Arrival</th>
                  <th className="px-6 py-4 font-medium">Departure</th>
                  <th className="px-6 py-4 font-medium">Accommodation</th>
                  <th className="px-6 py-4 font-medium">Transport</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allLogistics.map(logistics => (
                  <tr key={logistics.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white/90">{logistics.guest.displayName}</div>
                      <div className="text-white/40 text-xs mt-0.5">{logistics.guest.email || "No Email"}</div>
                    </td>
                    <td className="px-6 py-4">
                      {logistics.arrivalDateTime ? (
                        <div className="flex flex-col">
                          <span className="text-white/80">{new Date(logistics.arrivalDateTime).toLocaleDateString()}</span>
                          <span className="text-white/40 text-xs">{new Date(logistics.arrivalDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
                        </div>
                      ) : (
                        <span className="text-white/20">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {logistics.departureDateTime ? (
                        <div className="flex flex-col">
                          <span className="text-white/80">{new Date(logistics.departureDateTime).toLocaleDateString()}</span>
                          <span className="text-white/40 text-xs">{new Date(logistics.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
                        </div>
                      ) : (
                        <span className="text-white/20">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {logistics.accommodationName ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          <Building2 className="w-3 h-3" /> {logistics.accommodationName}
                        </span>
                      ) : (
                        <span className="text-white/20">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {logistics.transportNotes ? (
                        <div className="text-amber-200/80 text-xs truncate max-w-[200px]">
                          {logistics.transportNotes}
                        </div>
                      ) : (
                        <span className="text-white/20">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <LogisticsForm existingLogistics={logistics} guests={[]} />
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

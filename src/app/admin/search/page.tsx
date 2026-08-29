import { prisma } from "@/lib/db";
import Link from "next/link";
import { Users, Store, CheckSquare, Search as SearchIcon } from "lucide-react";

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-white/20">
          <SearchIcon className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-medium text-white mb-2">Search Spark</h1>
        <p className="text-white/50 max-w-sm text-sm">
          Type in the top navbar to search for guests, vendors, or tasks across your entire wedding plan.
        </p>
      </div>
    );
  }

  // Concurrent queries for better performance
  const [guests, vendors, tasks] = await Promise.all([
    prisma.guest.findMany({
      where: {
        OR: [
          { displayName: { contains: query } },
          { email: { contains: query } },
          { whatsappNumber: { contains: query } },
        ],
      },
      take: 10,
    }),
    prisma.vendor.findMany({
      where: {
        OR: [
          { vendorName: { contains: query } },
          { contactName: { contains: query } },
          { email: { contains: query } },
        ],
      },
      take: 10,
    }),
    prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: 10,
    }),
  ]);

  const totalResults = guests.length + vendors.length + tasks.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Search Results</h1>
        <p className="text-white/50 text-sm mt-1">
          Found {totalResults} result{totalResults === 1 ? "" : "s"} for "{query}"
        </p>
      </div>

      {totalResults === 0 && (
        <div className="bg-white/5 rounded-2xl p-12 text-center border border-white/5">
          <p className="text-white/40">No matching records found. Try a different search term.</p>
        </div>
      )}

      {guests.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4" /> Guests ({guests.length})
          </h2>
          <div className="grid gap-3">
            {guests.map((guest) => (
              <Link
                key={guest.id}
                href="/admin/guests"
                className="bg-[#1e2333] border border-white/5 hover:border-emerald-500/30 rounded-xl p-4 transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                    {guest.displayName}
                  </div>
                  <div className="text-white/40 text-sm mt-0.5">
                    {guest.whatsappNumber || guest.email || "No contact info"} • {guest.rsvpStatus}
                  </div>
                </div>
                <div className="text-xs font-medium text-emerald-400/50 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                  View Guest
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {vendors.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest flex items-center gap-2">
            <Store className="w-4 h-4" /> Vendors ({vendors.length})
          </h2>
          <div className="grid gap-3">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href="/admin/vendors"
                className="bg-[#1e2333] border border-white/5 hover:border-blue-500/30 rounded-xl p-4 transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="text-white font-medium group-hover:text-blue-400 transition-colors">
                    {vendor.vendorName}
                  </div>
                  <div className="text-white/40 text-sm mt-0.5">
                    {vendor.serviceCategory || "General"} • {vendor.contactName || "No contact"}
                  </div>
                </div>
                <div className="text-xs font-medium text-blue-400/50 bg-blue-500/10 px-2.5 py-1 rounded-md">
                  View Vendor
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {tasks.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest flex items-center gap-2">
            <CheckSquare className="w-4 h-4" /> Tasks ({tasks.length})
          </h2>
          <div className="grid gap-3">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href="/admin/tasks"
                className="bg-[#1e2333] border border-white/5 hover:border-amber-500/30 rounded-xl p-4 transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="text-white font-medium group-hover:text-amber-400 transition-colors">
                    {task.title}
                  </div>
                  <div className="text-white/40 text-sm mt-0.5 line-clamp-1">
                    {task.description || "No description"}
                  </div>
                </div>
                <div className="text-xs font-medium text-amber-400/50 bg-amber-500/10 px-2.5 py-1 rounded-md">
                  View Task
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

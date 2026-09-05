import { prisma } from "@/lib/db";
import { BudgetBreakdownChart, GuestAttendanceDonut } from "@/components/admin/DashboardCharts";
import { ArrowRight, ArrowUpRight, ArrowDownRight, MoreHorizontal, Filter, Download, Plus, Settings, DollarSign } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const sessionCookie = (await cookies()).get("admin_session")?.value;
  if (!sessionCookie) return null;
  const payload = await verifyJWT(sessionCookie);
  if (!payload) return null;
  const permissions = (payload.permissions as string[]) || [];
  const role = payload.role as string;

  const canViewBudget = permissions.includes("budget.view") || role === "SUPER_ADMIN";
  const canViewGuests = permissions.includes("guest.view") || role === "SUPER_ADMIN";
  const canViewTasks = permissions.includes("task.view") || role === "SUPER_ADMIN" || role === "FAMILY_MEMBER";

  // 1. Fetch Top Stats Data
  const now = new Date();
  const nextEvent = await prisma.weddingEvent.findFirst({
    where: { eventDate: { gte: now } },
    orderBy: { eventDate: 'asc' }
  });

  let totalPlanned = 0, totalSpent = 0;
  if (canViewBudget) {
    const budgetStats = await prisma.budgetItem.aggregate({
      _sum: { estimatedCost: true, paidAmount: true }
    });
    totalPlanned = Number(budgetStats._sum.estimatedCost || 0);
    totalSpent = Number(budgetStats._sum.paidAmount || 0);
  }

  let allowedGuests = 0, confirmedGuests = 0;
  if (canViewGuests) {
    const guestStats = await prisma.guest.aggregate({
      _sum: { allowedGuestCount: true, confirmedGuestCount: true }
    });
    allowedGuests = guestStats._sum.allowedGuestCount || 0;
    confirmedGuests = guestStats._sum.confirmedGuestCount || 0;
  }

  // 2. Fetch Chart Data
  let donutData = [
    { name: 'Attending', value: 0 },
    { name: 'Declined', value: 0 },
    { name: 'Pending', value: 0 },
  ];
  let attending = 0, declined = 0, pending = 0;
  
  if (canViewGuests) {
    const rsvpGroup = await prisma.guest.groupBy({
      by: ['rsvpStatus'],
      _sum: { allowedGuestCount: true }
    });
    rsvpGroup.forEach(g => {
      if (g.rsvpStatus === 'ATTENDING') attending += g._sum.allowedGuestCount || 0;
      else if (g.rsvpStatus === 'NOT_ATTENDING') declined += g._sum.allowedGuestCount || 0;
      else pending += g._sum.allowedGuestCount || 0;
    });
    donutData = [
      { name: 'Attending', value: attending },
      { name: 'Declined', value: declined },
      { name: 'Pending', value: pending },
    ];
  }

  // Area Chart Mock Data for Demo (Could aggregate real expenses by month)
  const areaData = [
    { name: 'Jan', planned: 4000, spent: 2400 },
    { name: 'Feb', planned: 5000, spent: 3800 },
    { name: 'Mar', planned: 6000, spent: 5800 },
    { name: 'Apr', planned: 8000, spent: 7500 },
    { name: 'May', planned: 12000, spent: Math.round(totalSpent) },
  ];

  // 3. Fetch Recent Activity (Expenses)
  let recentExpenses: any[] = [];
  if (canViewBudget) {
    recentExpenses = await prisma.expense.findMany({
      take: 4,
      orderBy: { expenseDate: 'desc' },
      include: { budgetItem: true }
    });
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-wide">Dashboard</h1>
          <p className="text-white/50 text-sm mt-1">An easy way to manage your wedding with care and precision.</p>
        </div>
      </div>

      {/* TOP AREA: Quick Info Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stat Card 1: Green Alert Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-emerald-500 p-6 flex flex-col justify-between shadow-lg shadow-emerald-500/20 group h-[160px]">
          {/* SVG Background Decoration (Matches Spark Admin Geometric Star) */}
          <div className="absolute -top-12 -right-12 w-48 h-48 opacity-20 pointer-events-none transform group-hover:rotate-12 transition-transform duration-700">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(50,50)">
                <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#000" />
                <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#000" transform="rotate(60)" />
                <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#000" transform="rotate(120)" />
              </g>
            </svg>
          </div>
          
          <div className="relative z-10">
            <span className="inline-block px-2.5 py-1 bg-black/20 text-white text-xs font-semibold rounded-md uppercase tracking-wider mb-3">
              Upcoming Event
            </span>
            <div className="text-white/90 text-sm font-medium mb-1">
              {nextEvent?.eventDate ? new Date(nextEvent.eventDate).toLocaleDateString() : "No upcoming events"}
            </div>
            <div className="text-white text-xl font-semibold leading-tight">
              {nextEvent?.title || "Plan your next milestone"}
            </div>
          </div>
          <Link href="/admin/events" className="relative z-10 flex items-center gap-2 text-white text-sm font-medium hover:opacity-80 transition-opacity mt-2 w-fit">
            <span>See Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stat Card 2: Budget Utilization */}
        {canViewBudget && (
          <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[160px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/50 text-sm font-medium tracking-wide">Budget Utilization</span>
                <button className="text-white/40 hover:text-white transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <div className="text-3xl font-semibold text-white">
                ${totalSpent.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{totalPlanned > 0 ? Math.round((totalSpent/totalPlanned)*100) : 0}% of Planned</span>
              </div>
            </div>
          </div>
        )}

        {/* Stat Card 3: Guest Confirmations */}
        {canViewGuests && (
          <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[160px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/50 text-sm font-medium tracking-wide">Total Confirmations</span>
                <button className="text-white/40 hover:text-white transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <div className="text-3xl font-semibold text-white">
                {confirmedGuests} <span className="text-lg text-white/30">/ {allowedGuests}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-400 bg-amber-500/10 w-fit px-2 py-1 rounded-md">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>{allowedGuests - confirmedGuests} pending</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Main Grid: Details + Sidebar Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Left Area (Col 9) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          
          {/* Revenue Chart Box */}
          {canViewBudget && (
            <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-semibold text-white">Budget Breakdown</h2>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <span className="text-white/50">Planned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="text-white/50">Spent</span>
                  </div>
                </div>
              </div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-semibold text-white">${totalPlanned.toLocaleString()}</span>
                <span className="text-xs font-medium text-white/40 uppercase tracking-widest">Total Planned</span>
              </div>
              
              {/* Recharts Area Chart */}
              <BudgetBreakdownChart data={areaData} />
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Transaction List (Recent Payments) */}
            {canViewBudget && (
              <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Recent Payments</h2>
                  <div className="flex items-center gap-2 text-white/50">
                    <button className="hover:text-white transition-colors p-1"><Filter className="w-4 h-4"/></button>
                    <button className="hover:text-white transition-colors p-1"><Download className="w-4 h-4"/></button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                  {recentExpenses.length === 0 ? (
                    <div className="text-center text-white/30 text-sm mt-10">No recent payments.</div>
                  ) : (
                    recentExpenses.map(exp => (
                      <div key={exp.id} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">{exp.expenseName}</div>
                          <div className="text-xs text-white/50 mt-0.5">{new Date(exp.expenseDate).toLocaleDateString()}</div>
                        </div>
                        <div className="text-emerald-400 font-semibold whitespace-nowrap">
                          +${exp.amount.toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Product Overview (RSVP Logistics) */}
            {canViewGuests && (
              <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Logistics Overview</h2>
                  <div className="flex items-center gap-2 text-white/50">
                    <button className="hover:text-white transition-colors p-1"><Plus className="w-4 h-4"/></button>
                    <button className="hover:text-white transition-colors p-1"><Settings className="w-4 h-4"/></button>
                  </div>
                </div>

                <div className="space-y-5">
                  {[
                    { label: "Invitations Sent", value: allowedGuests, max: 250, color: "bg-indigo-400" },
                    { label: "Confirmed Guests", value: confirmedGuests, max: allowedGuests || 1, color: "bg-emerald-400" },
                    { label: "Declined", value: declined, max: allowedGuests || 1, color: "bg-red-400" },
                    { label: "Pending Responses", value: pending, max: allowedGuests || 1, color: "bg-amber-400" },
                  ].map((item, idx) => {
                    const percent = item.max > 0 ? Math.min(100, Math.round((item.value / item.max) * 100)) : 0;
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white/70">{item.label}</span>
                          <span className="text-sm font-semibold text-white">{item.value}</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
        </div>

        {/* Right Area (Col 3) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          
          {/* Performance Donut */}
          <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-2">Guest Attendance</h2>
            
            <GuestAttendanceDonut data={donutData} />

            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Attending
                </div>
                <span className="text-sm font-medium text-white">{attending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Declined
                </div>
                <span className="text-sm font-medium text-white">{declined}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Pending
                </div>
                <span className="text-sm font-medium text-white">{pending}</span>
              </div>
            </div>
          </div>

          {/* Promo Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-indigo-600 p-6 flex flex-col justify-end min-h-[220px] shadow-lg shadow-indigo-500/20 group">
            {/* SVG Background Decoration */}
            <div className="absolute -top-16 -right-16 w-56 h-56 opacity-20 pointer-events-none transform group-hover:rotate-45 transition-transform duration-1000">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(50,50)">
                  <circle cx="0" cy="0" r="40" stroke="#fff" strokeWidth="12" />
                  <circle cx="0" cy="0" r="15" fill="#fff" />
                </g>
              </svg>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-white leading-tight mb-2">
                Level up your planning to the next level.
              </h3>
              <p className="text-white/70 text-sm mb-4">
                Get ready for Wedding Day Mode.
              </p>
              <button className="bg-white text-indigo-600 text-sm font-bold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors w-full">
                Check updates now
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

import { prisma } from "@/lib/db";
import { EventForm } from "./EventForm";
import { Calendar as CalendarIcon, Clock, CheckSquare, Building2, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";

type TimelineItem = {
  id: string;
  date: Date;
  type: 'EVENT' | 'TASK' | 'VENDOR_PAYMENT' | 'BUDGET_PAYMENT';
  title: string;
  subtitle?: string;
  amount?: number;
  status?: string;
  link?: string;
};

export default async function AdminCalendarPage() {
  // 1. Fetch all dates
  const [events, tasks, vendors, budgetItems] = await Promise.all([
    prisma.weddingEvent.findMany({ where: { eventDate: { not: null } } }),
    prisma.task.findMany({ where: { dueDate: { not: null }, status: { not: "COMPLETED" } } }),
    prisma.vendor.findMany({ where: { nextPaymentDue: { not: null } } }),
    prisma.budgetItem.findMany({ where: { paymentDueDate: { not: null }, paymentStatus: { not: "FULLY_PAID" } } })
  ]);

  // 2. Aggregate into timeline
  const timeline: TimelineItem[] = [];

  events.forEach(e => {
    if (e.eventDate) timeline.push({
      id: `evt_${e.id}`,
      date: e.eventDate,
      type: 'EVENT',
      title: e.title,
      subtitle: e.startTime ? `${e.startTime} ${e.endTime ? '- ' + e.endTime : ''}` : undefined,
    });
  });

  tasks.forEach(t => {
    if (t.dueDate) timeline.push({
      id: `tsk_${t.id}`,
      date: t.dueDate,
      type: 'TASK',
      title: t.title,
      subtitle: t.priority + " Priority",
      link: "/admin/tasks"
    });
  });

  vendors.forEach(v => {
    if (v.nextPaymentDue) {
      const balance = Number(v.finalAmount) - Number(v.advancePaid);
      if (balance > 0) {
        timeline.push({
          id: `vnd_${v.id}`,
          date: v.nextPaymentDue,
          type: 'VENDOR_PAYMENT',
          title: `Payment Due: ${v.vendorName}`,
          amount: balance,
          link: "/admin/vendors"
        });
      }
    }
  });

  budgetItems.forEach(b => {
    if (b.paymentDueDate) {
      const balance = Number(b.estimatedCost) - Number(b.paidAmount);
      if (balance > 0) {
        timeline.push({
          id: `bdg_${b.id}`,
          date: b.paymentDueDate,
          type: 'BUDGET_PAYMENT',
          title: `Budget Due: ${b.title}`,
          amount: balance,
          link: "/admin/budget"
        });
      }
    }
  });

  // 3. Sort chronologically
  timeline.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group by month
  const groupedTimeline = timeline.reduce((acc, item) => {
    const monthYear = item.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(item);
    return acc;
  }, {} as Record<string, TimelineItem[]>);

  const now = new Date();
  now.setHours(0,0,0,0);

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-wide">Master Timeline</h1>
          <p className="text-white/50 text-sm mt-1">Every event, task, and payment in one unified view.</p>
        </div>
        <div className="flex items-center gap-4">
          <EventForm />
        </div>
      </div>

      <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {timeline.length === 0 ? (
          <div className="text-center py-20">
            <CalendarIcon className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Your timeline is empty</h3>
            <p className="text-white/40">Add tasks, set vendor payment dates, or create custom events.</p>
          </div>
        ) : (
          <div className="space-y-12 relative z-10">
            {Object.entries(groupedTimeline).map(([month, items]) => (
              <div key={month} className="space-y-6">
                <h2 className="text-lg font-serif tracking-wide text-white/80 sticky top-0 bg-[#1e2333]/90 backdrop-blur-md py-2 border-b border-white/5 z-10">
                  {month}
                </h2>
                <div className="space-y-4">
                  {items.map(item => {
                    const isPast = item.date < now;
                    let icon, colorClass, borderClass, bgClass;

                    if (item.type === 'EVENT') {
                      icon = <CalendarIcon className="w-5 h-5" />;
                      colorClass = "text-purple-400";
                      borderClass = "border-purple-500/20";
                      bgClass = "bg-purple-500/10";
                    } else if (item.type === 'TASK') {
                      icon = <CheckSquare className="w-5 h-5" />;
                      colorClass = "text-blue-400";
                      borderClass = "border-blue-500/20";
                      bgClass = "bg-blue-500/10";
                    } else {
                      icon = item.type === 'VENDOR_PAYMENT' ? <Building2 className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />;
                      colorClass = "text-amber-400";
                      borderClass = "border-amber-500/20";
                      bgClass = "bg-amber-500/10";
                    }

                    if (isPast) {
                      colorClass = "text-white/40";
                      borderClass = "border-white/5";
                      bgClass = "bg-white/5";
                    }

                    return (
                      <div key={item.id} className={`flex gap-4 p-4 rounded-2xl border ${borderClass} bg-white/[0.02] hover:bg-white/[0.04] transition-colors group`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bgClass} ${colorClass}`}>
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className={`text-sm font-medium truncate ${isPast ? 'text-white/50' : 'text-white'}`}>
                            {item.title}
                          </div>
                          <div className="flex items-center gap-3 text-xs mt-1">
                            <span className={isPast ? 'text-red-400/80 font-medium' : 'text-white/40'}>
                              {item.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            {item.subtitle && <span className="text-white/40 border-l border-white/10 pl-3">{item.subtitle}</span>}
                            {item.amount && <span className="text-amber-400/70 border-l border-amber-500/20 pl-3 font-mono">${item.amount.toLocaleString()}</span>}
                          </div>
                        </div>
                        {item.link && (
                          <div className="flex items-center">
                            <Link href={item.link} className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${bgClass} ${colorClass}`}>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

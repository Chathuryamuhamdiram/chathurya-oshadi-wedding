"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";

// 1. Budget Breakdown Chart (Bar Chart)
export function BudgetBreakdownChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[250px] w-full mt-4 flex items-center justify-center border border-white/5 bg-black/20 rounded-xl">
        <p className="text-white/40 text-sm">No budget items added for this event yet.</p>
      </div>
    );
  }

  return (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
            tickFormatter={(value) => formatCurrencyCompact(value)}
            width={80}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e2333', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: any) => [formatCurrency(value), ""]}
          />
          <Bar dataKey="planned" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Planned" />
          <Bar dataKey="spent" fill="#34d399" radius={[4, 4, 0, 0]} name="Paid" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 2. Guest Attendance Donut Chart
const COLORS = ['#34d399', '#f87171', '#fbbf24']; // Attending (Emerald), Declined (Red), Pending (Amber)

export function GuestAttendanceDonut({ data }: { data: any[] }) {
  return (
    <div className="h-[220px] w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e2333', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

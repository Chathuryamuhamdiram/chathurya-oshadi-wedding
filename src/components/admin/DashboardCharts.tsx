"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

// 1. Budget Overview Chart (Donut + Progress Bar)
export function BudgetBreakdownChart({
  totalPlanned,
  totalSpent,
}: {
  totalPlanned: number;
  totalSpent: number;
}) {
  const remaining = Math.max(totalPlanned - totalSpent, 0);
  const percent =
    totalPlanned > 0 ? Math.round((totalSpent / totalPlanned) * 100) : 0;
  const isOverspent = totalSpent > totalPlanned;
  const progressWidth = Math.min(percent, 100);

  const donutData = [
    { name: "Paid", value: totalSpent || 0 },
    { name: "Remaining", value: remaining || (totalPlanned === 0 ? 1 : 0) },
  ];
  const DONUT_COLORS = ["#34d399", "#1e293b"];

  if (totalPlanned === 0) {
    return (
      <div className="h-[220px] w-full flex items-center justify-center border border-white/5 bg-black/20 rounded-xl mt-4">
        <p className="text-white/40 text-sm">
          No budget activity recorded for this event yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-6">
      {/* Donut + Progress Row */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut */}
        <div className="relative w-[180px] h-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={82}
                startAngle={90}
                endAngle={-270}
                paddingAngle={totalSpent > 0 && remaining > 0 ? 3 : 0}
                dataKey="value"
                stroke="none"
              >
                {donutData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e2333",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: any) => [formatCurrency(value), ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className={`text-2xl font-bold ${isOverspent ? "text-red-400" : "text-white"}`}
            >
              {percent}%
            </span>
            <span className="text-white/40 text-xs mt-0.5">Payment Progress</span>
          </div>
        </div>

        {/* Legend + Progress Bar */}
        <div className="flex-1 w-full space-y-5">
          {/* Legend */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-sm text-white/60">Paid</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#1e293b] border border-white/10 shrink-0" />
              <span className="text-sm text-white/60">Remaining</span>
            </div>
          </div>

          {/* Progress bar label */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/40 uppercase tracking-widest">
                Paid vs Remaining
              </span>
              {isOverspent && (
                <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md">
                  Overspent
                </span>
              )}
            </div>
            {/* Track */}
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isOverspent ? "bg-red-400" : "bg-emerald-400"}`}
                style={{ width: `${progressWidth}%` }}
              />
            </div>
            {/* Amounts */}
            <div className="flex justify-between mt-2">
              <span className="text-xs text-emerald-400 font-medium">
                {formatCurrency(totalSpent)} paid
              </span>
              <span className="text-xs text-white/40 font-medium">
                {formatCurrency(remaining)} remaining
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Guest Attendance Donut Chart
const GUEST_COLORS = ["#34d399", "#f87171", "#fbbf24"];

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
              <Cell
                key={`cell-${index}`}
                fill={GUEST_COLORS[index % GUEST_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e2333",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fff",
            }}
            itemStyle={{ color: "#fff" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

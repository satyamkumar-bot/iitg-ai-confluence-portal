"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface EventStat {
  id: string;
  title: string;
  total: number;
  confirmed: number;
  awaiting: number;
}

interface StatusStat {
  name: string;
  count: number;
  color: string;
}

export function DashboardCharts({
  eventStats,
  statusBreakdown,
}: {
  eventStats: EventStat[];
  statusBreakdown: StatusStat[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
      {/* Chart 1: Registrations per event */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="text-sm font-semibold text-slate-800 mb-1">
          Synchronized Registrations per Event
        </div>
        <div className="text-xs text-slate-500 mb-4">
          Breakdown of total form responses received vs organizer confirmed
        </div>
        <div className="h-64 w-full">
          {eventStats.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No event registrations available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="title" tick={{ fontSize: 10, fill: "#64748B" }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: "#64748B" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="total" name="Total Responses" fill="#0284C7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="confirmed" name="Confirmed" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Status distribution */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="text-sm font-semibold text-slate-800 mb-1">
          Registration Status Distribution
        </div>
        <div className="text-xs text-slate-500 mb-4">
          Current organizer review and approval breakdown across all events
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusBreakdown}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
              >
                {statusBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

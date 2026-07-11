"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { BookingResponseDTO } from "@/features/bookings/services/booking.service";

const COLORS = ["#f97316", "#dc2626", "#eab308", "#3b82f6", "#10b981", "#8b5cf6"];

interface BookingDashboardProportionChartProps {
  bookings: BookingResponseDTO[];
}

export function BookingDashboardProportionChart({ bookings }: BookingDashboardProportionChartProps) {
  const data = useMemo(() => {
    const counts = new Map<string, number>();
    
    bookings.forEach((b) => {
      const locationName = b.timeslots?.[0]?.location_name ?? "ไม่ได้ระบุพื้นที่";
      counts.set(locationName, (counts.get(locationName) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Show top 5
  }, [bookings]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
      <h3 className="text-base font-bold text-gray-900 mb-6">
        สัดส่วนพื้นที่การขอใช้บริการ
      </h3>
      <div className="flex-1 min-h-[250px] relative flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-gray-900">{total}</span>
          <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">
            TOTAL SPACES
          </span>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {data.map((item, index) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

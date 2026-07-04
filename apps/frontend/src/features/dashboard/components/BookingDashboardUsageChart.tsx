"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import type { BookingResponseDTO } from "@/features/bookings/services/booking.service";
import { subDays, format, isAfter, startOfDay } from "date-fns";
import { th } from "date-fns/locale";

interface BookingDashboardUsageChartProps {
  bookings: BookingResponseDTO[];
}

export function BookingDashboardUsageChart({ bookings }: BookingDashboardUsageChartProps) {
  const data = useMemo(() => {
    // Generate last 30 days array
    const today = startOfDay(new Date());
    const thirtyDaysAgo = subDays(today, 29);
    
    // Initialize map with 0 counts for all 30 days
    const dateCounts = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = subDays(today, i);
      const dateKey = format(d, "yyyy-MM-dd");
      dateCounts.set(dateKey, 0);
    }

    // Populate with real bookings
    bookings.forEach((b) => {
      const bDate = startOfDay(new Date(b.created_at));
      if (isAfter(bDate, thirtyDaysAgo) || bDate.getTime() === thirtyDaysAgo.getTime()) {
        const dateKey = format(bDate, "yyyy-MM-dd");
        if (dateCounts.has(dateKey)) {
          dateCounts.set(dateKey, (dateCounts.get(dateKey) || 0) + 1);
        }
      }
    });

    // Convert map to array for recharts
    const chartData = [];
    let count = 0;
    for (const [dateKey, value] of dateCounts.entries()) {
      // Only label every 5th day to avoid crowding the X-axis
      const d = new Date(dateKey);
      const name = count % 5 === 0 || count === 29 ? format(d, "d MMM", { locale: th }) : "";
      chartData.push({ name, value, fullDate: format(d, "d MMM yyyy", { locale: th }) });
      count++;
    }
    return chartData;
  }, [bookings]);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-gray-900">
          แนวโน้มการขอใช้บริการ (30 วันที่ผ่านมา)
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            ส่งออกข้อมูล
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            รายเดือน ⌄
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <Tooltip
              cursor={{ fill: "#f3f4f6" }}
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
            />
            <Bar
              dataKey="value"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

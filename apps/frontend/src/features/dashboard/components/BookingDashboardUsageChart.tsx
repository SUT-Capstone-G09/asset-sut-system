"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BookingResponseDTO } from "@/features/bookings/services/booking.service";
import { format, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { th } from "date-fns/locale";

interface BookingDashboardUsageChartProps {
  bookings: BookingResponseDTO[];
}

export function BookingDashboardUsageChart({ bookings }: BookingDashboardUsageChartProps) {
  const [filter, setFilter] = useState<"daily" | "monthly" | "yearly">("daily");
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());

  const handlePrev = () => {
    const d = new Date(referenceDate);
    if (filter === "daily") d.setMonth(d.getMonth() - 1);
    else if (filter === "monthly") d.setFullYear(d.getFullYear() - 1);
    else if (filter === "yearly") d.setFullYear(d.getFullYear() - 10);
    setReferenceDate(d);
  };

  const handleNext = () => {
    const d = new Date(referenceDate);
    if (filter === "daily") d.setMonth(d.getMonth() + 1);
    else if (filter === "monthly") d.setFullYear(d.getFullYear() + 1);
    else if (filter === "yearly") d.setFullYear(d.getFullYear() + 10);
    setReferenceDate(d);
  };

  const handleToday = () => {
    setReferenceDate(new Date());
  };

  const data = useMemo(() => {
    const targetDate = startOfDay(referenceDate);

    if (filter === "yearly") {
      const currentYear = targetDate.getFullYear();
      const startDecade = Math.floor(currentYear / 10) * 10;
      const chartData: { key: string; name: string; fullDate: string; value: number }[] = [];
      
      for (let i = 0; i <= 10; i++) {
        const year = startDecade + i;
        chartData.push({
          key: String(year),
          name: String(year),
          fullDate: String(year),
          value: 0
        });
      }
      
      bookings.forEach(b => {
        const bDate = new Date(b.created_at);
        const yearKey = String(bDate.getFullYear());
        const yearData = chartData.find(c => c.key === yearKey);
        if (yearData) {
          yearData.value++;
        }
      });
      return chartData;
    } else if (filter === "monthly") {
      const chartData: { key: string; name: string; fullDate: string; value: number }[] = [];
      for (let i = 0; i < 12; i++) {
        const d = new Date(targetDate.getFullYear(), i, 1);
        const monthKey = format(d, "yyyy-MM");
        chartData.push({
          key: monthKey,
          name: format(d, "MMM", { locale: th }),
          fullDate: format(d, "MMMM yyyy", { locale: th }),
          value: 0
        });
      }
      
      bookings.forEach(b => {
        const bDate = new Date(b.created_at);
        const monthKey = format(bDate, "yyyy-MM");
        const monthData = chartData.find(c => c.key === monthKey);
        if (monthData) {
          monthData.value++;
        }
      });
      return chartData;
    } else {
      const start = startOfMonth(targetDate);
      const end = endOfMonth(targetDate);
      const daysInterval = eachDayOfInterval({ start, end });
      
      const dateCounts = new Map<string, number>();
      daysInterval.forEach(d => {
        const dateKey = format(d, "yyyy-MM-dd");
        dateCounts.set(dateKey, 0);
      });

      const firstDay = daysInterval[0];
      const lastDay = daysInterval[daysInterval.length - 1];

      bookings.forEach((b) => {
        const bDate = startOfDay(new Date(b.created_at));
        if (bDate >= firstDay && bDate <= lastDay) {
          const dateKey = format(bDate, "yyyy-MM-dd");
          if (dateCounts.has(dateKey)) {
            dateCounts.set(dateKey, (dateCounts.get(dateKey) || 0) + 1);
          }
        }
      });

      const chartData: { name: string; fullDate: string; value: number }[] = [];
      for (const [dateKey, value] of dateCounts.entries()) {
        const d = new Date(dateKey);
        const dayNum = d.getDate();
        const isLastDay = dayNum === daysInterval.length;
        const showDay = dayNum === 1 || (dayNum % 5 === 0 && (dayNum !== 30 || isLastDay || daysInterval.length === 30)) || isLastDay;
        const name = showDay ? format(d, "d MMM", { locale: th }) : "";
        
        chartData.push({ name, value, fullDate: format(d, "d MMM yyyy", { locale: th }) });
      }
      return chartData;
    }
  }, [bookings, filter, referenceDate]);

  const filterLabel = {
    daily: "รายวัน",
    monthly: "รายเดือน",
    yearly: "รายปี"
  }[filter];

  const periodLabel = {
    daily: format(referenceDate, "MMMM yyyy", { locale: th }),
    monthly: `ปี ${format(referenceDate, "yyyy", { locale: th })}`,
    yearly: `ช่วงปี ${Math.floor(referenceDate.getFullYear() / 10) * 10} - ${Math.floor(referenceDate.getFullYear() / 10) * 10 + 10}`
  }[filter];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-gray-900">
            แนวโน้มการขอใช้บริการ
          </h3>
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-0.5 shadow-sm">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-[#f26522] hover:bg-orange-50 rounded-md" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-bold text-slate-700 min-w-[110px] text-center select-none">
              {periodLabel}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-[#f26522] hover:bg-orange-50 rounded-md" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs font-bold text-slate-600 border-slate-200" onClick={handleToday}>
            ปัจจุบัน
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs font-bold text-slate-600 border-slate-200">
            ส่งออกข้อมูล
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs px-3 font-medium text-slate-600 border-slate-200">
                {filterLabel} <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 rounded-xl text-sm">
              <DropdownMenuItem onClick={() => { setFilter("daily"); setReferenceDate(new Date()); }} className="cursor-pointer text-slate-600">
                รายวัน
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setFilter("monthly"); setReferenceDate(new Date()); }} className="cursor-pointer text-slate-600">
                รายเดือน
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setFilter("yearly"); setReferenceDate(new Date()); }} className="cursor-pointer text-slate-600">
                รายปี
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 15, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              dy={10}
              interval={0}
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

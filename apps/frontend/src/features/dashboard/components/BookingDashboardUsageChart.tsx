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

interface BookingDashboardUsageChartProps {
  bookings: BookingResponseDTO[];
}

// แปลงวันที่เป็น string รูปแบบ "yyyy-MM-dd" ตาม local timezone (ป้องกัน UTC shift)
function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// แสดงวันที่เป็น พ.ศ. ไทย
function toThaiDate(date: Date, options: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString("th-TH", options);
}

export function BookingDashboardUsageChart({ bookings }: BookingDashboardUsageChartProps) {
  const [filter, setFilter] = useState<"weekly" | "daily" | "monthly" | "yearly">("daily");
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());

  const handlePrev = () => {
    const d = new Date(referenceDate);
    if (filter === "weekly") d.setDate(d.getDate() - 7);
    else if (filter === "daily") d.setMonth(d.getMonth() - 1);
    else if (filter === "monthly") d.setFullYear(d.getFullYear() - 1);
    else if (filter === "yearly") d.setFullYear(d.getFullYear() - 10);
    setReferenceDate(d);
  };

  const handleNext = () => {
    const d = new Date(referenceDate);
    if (filter === "weekly") d.setDate(d.getDate() + 7);
    else if (filter === "daily") d.setMonth(d.getMonth() + 1);
    else if (filter === "monthly") d.setFullYear(d.getFullYear() + 1);
    else if (filter === "yearly") d.setFullYear(d.getFullYear() + 10);
    setReferenceDate(d);
  };

  const handleToday = () => {
    setReferenceDate(new Date());
  };

  const data = useMemo(() => {
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();

    if (filter === "yearly") {
      // ── รายปี ──────────────────────────────────────────────
      const beYear = year + 543;
      const startDecadeBE = Math.floor((beYear - 1) / 10) * 10 + 1;
      const startDecadeCE = startDecadeBE - 543;
      const chartData: { key: string; name: string; fullDate: string; value: number; showLabel?: boolean }[] = [];

      for (let i = 0; i < 10; i++) {
        const y = startDecadeCE + i;
        const buddhistYear = String(startDecadeBE + i);
        chartData.push({
          key: String(y),
          name: buddhistYear,
          fullDate: `ปี พ.ศ. ${buddhistYear}`,
          value: 0,
          showLabel: true,
        });
      }

      bookings.forEach((b) => {
        const bYear = new Date(b.created_at).getFullYear();
        const entry = chartData.find((c) => c.key === String(bYear));
        if (entry) entry.value++;
      });
      return chartData;

    } else if (filter === "monthly") {
      // ── รายเดือน ────────────────────────────────────────────
      const chartData: { key: string; name: string; fullDate: string; value: number; showLabel: boolean }[] = [];

      for (let i = 0; i < 12; i++) {
        const d = new Date(year, i, 1);
        const monthKey = `${year}-${String(i + 1).padStart(2, "0")}`;
        chartData.push({
          key: monthKey,
          name: toThaiDate(d, { month: "short" }),
          fullDate: toThaiDate(d, { month: "long", year: "numeric" }),
          value: 0,
          showLabel: true,
        });
      }

      bookings.forEach((b) => {
        const bDate = new Date(b.created_at);
        const monthKey = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, "0")}`;
        const entry = chartData.find((c) => c.key === monthKey);
        if (entry) entry.value++;
      });
      return chartData;

    } else if (filter === "weekly") {
      // ── รายสัปดาห์ ──────────────────────────────────────────────
      const startOfWeek = new Date(year, month, referenceDate.getDate() - referenceDate.getDay());
      const chartData: { key: string; name: string; fullDate: string; value: number; showLabel: boolean }[] = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        const key = toLocalDateKey(d);
        chartData.push({
          key,
          name: toThaiDate(d, { weekday: "short" }),
          fullDate: toThaiDate(d, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
          value: 0,
          showLabel: true,
        });
      }

      bookings.forEach((b) => {
        const bKey = toLocalDateKey(new Date(b.created_at));
        const entry = chartData.find((c) => c.key === bKey);
        if (entry) entry.value++;
      });

      return chartData;

    } else {
      // ── รายวัน ──────────────────────────────────────────────
      // สร้างทุกวันในเดือนที่เลือก
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const chartData: { key: string; name: string; fullDate: string; value: number; showLabel: boolean }[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        const key = toLocalDateKey(d); // "yyyy-MM-dd" ตาม local time
        const showLabel =
          day === 1 ||
          (day % 5 === 0 && daysInMonth - day > 1) ||
          day === daysInMonth;
        chartData.push({
          key,
          name: toThaiDate(d, { day: "numeric", month: "short" }),
          fullDate: toThaiDate(d, { day: "numeric", month: "long", year: "numeric" }),
          value: 0,
          showLabel,
        });
      }

      // นับ bookings โดยใช้ local date key (ป้องกัน UTC shift)
      bookings.forEach((b) => {
        const bDate = new Date(b.created_at);
        const bYear = bDate.getFullYear();
        const bMonth = bDate.getMonth();
        if (bYear !== year || bMonth !== month) return;
        const bKey = toLocalDateKey(bDate);
        const entry = chartData.find((c) => c.key === bKey);
        if (entry) entry.value++;
      });

      return chartData;
    }
  }, [bookings, filter, referenceDate]);

  const filterLabel = {
    daily: "รายวัน",
    weekly: "รายสัปดาห์",
    monthly: "รายเดือน",
    yearly: "รายปี",
  }[filter];

  const periodLabel = (() => {
    if (filter === "weekly") {
      const startOfWeek = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() - referenceDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return `${toThaiDate(startOfWeek, { day: "numeric", month: "short" })} - ${toThaiDate(endOfWeek, { day: "numeric", month: "short", year: "numeric" })}`;
    } else if (filter === "daily") {
      return referenceDate.toLocaleDateString("th-TH", { month: "long", year: "numeric" });
    } else if (filter === "monthly") {
      return `ปี ${referenceDate.toLocaleDateString("th-TH", { year: "numeric" })}`;
    } else {
      const beYear = referenceDate.getFullYear() + 543;
      const startDecadeBE = Math.floor((beYear - 1) / 10) * 10 + 1;
      return `ช่วงปี พ.ศ. ${startDecadeBE} - ${startDecadeBE + 9}`;
    }
  })();

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
            <span className="text-xs font-bold text-slate-700 min-w-[130px] text-center select-none">
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
            <DropdownMenuContent align="end" className="w-36 rounded-xl text-sm">
              <DropdownMenuItem onClick={() => { setFilter("daily"); setReferenceDate(new Date()); }} className="cursor-pointer text-slate-600">
                รายวัน
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setFilter("weekly"); setReferenceDate(new Date()); }} className="cursor-pointer text-slate-600">
                รายสัปดาห์
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
              tick={{ fontSize: 11, fill: "#6b7280" }}
              dy={10}
              interval={0}
              tickFormatter={(value, index) => {
                const item = data[index];
                return item?.showLabel ? value : "";
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(243,244,246,0.8)" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelFormatter={(_, payload) => {
                if (payload && payload.length > 0) {
                  return (payload[0].payload as { fullDate: string }).fullDate;
                }
                return "";
              }}
              formatter={(value) => [value, "จำนวนการจอง"]}
            />
            <Bar
              dataKey="value"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

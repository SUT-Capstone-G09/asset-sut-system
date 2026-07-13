"use client";

import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, startOfDay, isBefore,
} from "date-fns";
import { th } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { DayInfo } from "@/features/bookings/types/booking-calendar";
import { cn } from "@/lib/utils";

const DOW = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

interface MonthlyCalendarProps {
  currentMonth: Date;
  today: Date;
  minBookableDate: Date;
  selectedDates: string[];
  onToggleDate: (date: Date) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onClearAll: () => void;
  onSelectWeekend: () => void;
  onSelectNextWeekdays: () => void;
  onSelectThisWeek: () => void;
  getDayInfo: (date: Date) => DayInfo;
}

export default function MonthlyCalendar({
  currentMonth, today, minBookableDate, selectedDates,
  onToggleDate, onPrev, onNext, onToday,
  onClearAll, onSelectWeekend, onSelectNextWeekdays, onSelectThisWeek,
  getDayInfo,
}: MonthlyCalendarProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">
            {format(currentMonth, "MMMM yyyy", { locale: th })}
          </h2>
          <div className="flex items-center gap-1">
            <button onClick={onPrev} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
              <ChevronLeft size={16} className="text-gray-500" />
            </button>
            <button onClick={onNext} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
              <ChevronRight size={16} className="text-gray-500" />
            </button>
          </div>
          <button
            onClick={onToday}
            className="text-sm text-brand-primary font-medium hover:underline"
          >
            วันนี้
          </button>
        </div>
      </div>

      {/* Quick Select */}
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="text-gray-500 self-center">เลือกเร็ว:</span>
        {[
          { label: "สุดสัปดาห์นี้", fn: onSelectWeekend },
          { label: "สัปดาห์หน้า (จ-ศ)", fn: onSelectNextWeekdays },
          { label: "ทั้งสัปดาห์", fn: onSelectThisWeek },
        ].map(({ label, fn }) => (
          <button
            key={label}
            onClick={fn}
            className="px-3 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary transition-colors"
          >
            {label}
          </button>
        ))}
        <button
          onClick={onClearAll}
          className="px-3 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors flex items-center gap-1"
        >
          🗑 ล้างการเลือก
        </button>
      </div>

      {/* Lead time notice */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
        <Info size={14} className="shrink-0" />
        <span>
          สามารถจองล่วงหน้าได้ตั้งแต่วันที่{" "}
          <span className="font-semibold">{format(minBookableDate, "d MMMM yyyy", { locale: th })}</span>{" "}
          เป็นต้นไป
        </span>
      </div>

      {/* Legend — shown before the grid so color meanings are known before picking */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {[
          { color: "bg-brand-primary", label: "เลือกแล้ว" },
          { color: "bg-white border border-gray-200", label: "ว่าง" },
          { color: "bg-red-50 border border-red-100", label: "เต็ม" },
          { color: "bg-orange-50 border border-orange-100", label: "มีช่วงเวลาที่ถูกจอง" },
          { color: "bg-gray-100", label: "ไม่เปิดให้บริการ" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={cn("w-3.5 h-3.5 rounded-sm shrink-0", color)} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1">
        {DOW.map((d, i) => (
          <div
            key={d}
            className={cn(
              "text-center text-xs font-semibold py-1",
              i === 0 || i === 6 ? "text-brand-primary" : "text-gray-400"
            )}
          >
            {d}
          </div>
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const info = getDayInfo(day);
          const inMonth = isSameMonth(day, currentMonth);
          const selected = selectedDates.includes(dateStr);
          const isCurrentDay = isToday(day);
          const isPast = isBefore(startOfDay(day), today);
          const isTooSoon = !isPast && isBefore(startOfDay(day), minBookableDate);
          const dow = day.getDay();
          const isWeekend = dow === 0 || dow === 6;
          const disabled = isPast || isTooSoon || info.status === "full" || info.status === "closed";

          return (
            <button
              key={dateStr}
              onClick={() => onToggleDate(day)}
              disabled={disabled}
              className={cn(
                "relative aspect-square flex flex-col items-center justify-start pt-1 rounded-xl text-sm transition-all select-none",
                !inMonth && "opacity-20 pointer-events-none",
                // selected
                selected && "bg-brand-primary text-white font-semibold",
                // available
                !selected && !disabled && inMonth && "hover:bg-orange-50 cursor-pointer",
                // full
                info.status === "full" && !selected && "bg-red-50 text-red-300 cursor-not-allowed",
                // partial
                info.status === "partial" && !selected && "bg-orange-50",
                // closed
                info.status === "closed" && !selected && "bg-gray-100 text-gray-300 cursor-not-allowed",
                // past / inside minimum lead time
                (isPast || isTooSoon) && !selected && "opacity-40 cursor-not-allowed",
                // weekend text color (when not selected)
                !selected && isWeekend && info.status === "available" && "text-brand-primary",
              )}
            >
              {/* Day number */}
              <span
                className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-full text-sm",
                  isCurrentDay && !selected && "border-2 border-brand-primary text-brand-primary font-bold",
                  isCurrentDay && selected && "border-2 border-white",
                )}
              >
                {format(day, "d")}
              </span>

              {/* Status indicators */}
              {info.status === "full" && (
                <span className="text-[9px] text-red-400 mt-0.5 font-medium">เต็ม</span>
              )}
              {info.status === "partial" && !selected && (
                <span className="text-[8px] text-orange-500 mt-0.5 leading-tight text-center px-0.5 truncate w-full font-medium">
                  {info.partialSlot ?? "ว่างบางส่วน"}
                </span>
              )}
              {info.status === "closed" && (
                <span className="text-[9px] text-gray-400 mt-0.5 leading-tight text-center px-0.5 truncate w-full">
                  {info.note}
                </span>
              )}
              {selected && (
                <span className="text-[10px] mt-0.5">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

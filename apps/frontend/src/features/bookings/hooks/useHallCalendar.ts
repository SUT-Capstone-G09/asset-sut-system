import { useState } from "react";
import {
  addMonths, subMonths, format, startOfWeek, endOfWeek,
  addDays, nextMonday, isBefore, startOfDay,
} from "date-fns";
import { DayInfo } from "@/features/bookings/types/booking-calendar";

// การจองโถงเลือกเฉพาะ "วัน" (ไม่มีเวลา) — ต่างจาก useBookingCalendar ที่มี dayTimes/fullDay/ราคา
// สถานะรายวันเป็น available เสมอ (ความว่างของบูธไปตรวจที่หน้าเลือกเซลล์ตามวันที่แทน)
const MIN_BOOKING_LEAD_DAYS = 7;

export function useHallCalendar() {
  const today = startOfDay(new Date());
  const minBookableDate = addDays(today, MIN_BOOKING_LEAD_DAYS);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  const toggleDate = (date: Date) => {
    if (isBefore(startOfDay(date), minBookableDate)) return;
    const dateStr = format(date, "yyyy-MM-dd");
    setSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr].sort()
    );
  };

  const selectDates = (dates: Date[]) => {
    const strs = dates
      .filter((d) => !isBefore(startOfDay(d), minBookableDate))
      .map((d) => format(d, "yyyy-MM-dd"));
    setSelectedDates((prev) => [...new Set([...prev, ...strs])].sort());
  };

  return {
    today,
    minBookableDate,
    currentMonth,
    prevMonth: () => setCurrentMonth((m) => subMonths(m, 1)),
    nextMonth: () => setCurrentMonth((m) => addMonths(m, 1)),
    goToToday: () => setCurrentMonth(today),
    selectedDates,
    toggleDate,
    removeDate: (dateStr: string) =>
      setSelectedDates((prev) => prev.filter((d) => d !== dateStr)),
    clearAll: () => setSelectedDates([]),
    // กู้คืนวันที่เลือกจาก draft (ตอนย้อนกลับมาจากหน้ายืนยัน) + เลื่อนปฏิทินไปเดือนของวันแรก
    restore: (dates: string[]) => {
      const sorted = [...new Set(dates)].sort();
      setSelectedDates(sorted);
      if (sorted.length > 0) {
        setCurrentMonth(startOfDay(new Date(`${sorted[0]}T00:00:00`)));
      }
    },
    selectWeekend: () => {
      const sat = endOfWeek(today, { weekStartsOn: 0 });
      const sun = startOfWeek(today, { weekStartsOn: 0 });
      selectDates([sun, sat]);
    },
    selectNextWeekdays: () => {
      const mon = nextMonday(today);
      selectDates(Array.from({ length: 5 }, (_, i) => addDays(mon, i)));
    },
    selectThisWeek: () => {
      const sun = startOfWeek(today, { weekStartsOn: 0 });
      selectDates(Array.from({ length: 7 }, (_, i) => addDays(sun, i)));
    },
    getDayInfo: (): DayInfo => ({ status: "available" }),
  };
}

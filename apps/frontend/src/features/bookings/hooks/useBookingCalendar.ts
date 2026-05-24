import { useState, useMemo } from "react";
import {
  addMonths, subMonths, format, startOfWeek, endOfWeek,
  addDays, nextMonday, isBefore, startOfDay,
} from "date-fns";
import { Room } from "@/features/bookings/types";
import { DayBookingTime } from "@/features/bookings/types/booking-calendar";
import { getDayInfo } from "@/features/bookings/data/mock-availability";

function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
}

const DEFAULT_TIME: DayBookingTime = { startTime: "09:00", endTime: "11:00" };

export function useBookingCalendar(room: Room) {
  const today = startOfDay(new Date());
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [dayTimes, setDayTimes] = useState<Record<string, DayBookingTime>>({});
  const [sameTimeForAll, setSameTimeForAll] = useState(false);
  const [globalTime, setGlobalTime] = useState<DayBookingTime>(DEFAULT_TIME);

  const getEffectiveTime = (dateStr: string): DayBookingTime =>
    sameTimeForAll ? globalTime : (dayTimes[dateStr] ?? DEFAULT_TIME);

  const toggleDate = (date: Date) => {
    if (isBefore(startOfDay(date), today)) return;
    const info = getDayInfo(date);
    if (info.status === "full" || info.status === "closed") return;

    const dateStr = format(date, "yyyy-MM-dd");
    setSelectedDates((prev) => {
      if (prev.includes(dateStr)) return prev.filter((d) => d !== dateStr);
      return [...prev, dateStr].sort();
    });
    setDayTimes((prev) => ({
      ...prev,
      [dateStr]: prev[dateStr] ?? (sameTimeForAll ? globalTime : DEFAULT_TIME),
    }));
  };

  const removeDate = (dateStr: string) =>
    setSelectedDates((prev) => prev.filter((d) => d !== dateStr));

  const updateDayTime = (dateStr: string, field: keyof DayBookingTime, value: string) =>
    setDayTimes((prev) => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] ?? DEFAULT_TIME), [field]: value },
    }));

  const updateGlobalTime = (field: keyof DayBookingTime, value: string) => {
    setGlobalTime((prev) => ({ ...prev, [field]: value }));
  };

  const clearAll = () => setSelectedDates([]);

  const selectDates = (dates: Date[]) => {
    const valid = dates.filter((d) => {
      const info = getDayInfo(d);
      return !isBefore(startOfDay(d), today) && info.status !== "full" && info.status !== "closed";
    });
    const strs = valid.map((d) => format(d, "yyyy-MM-dd"));
    setSelectedDates((prev) => [...new Set([...prev, ...strs])].sort());
    setDayTimes((prev) => {
      const next = { ...prev };
      strs.forEach((s) => { if (!next[s]) next[s] = sameTimeForAll ? globalTime : DEFAULT_TIME; });
      return next;
    });
  };

  const selectWeekend = () => {
    const sat = endOfWeek(today, { weekStartsOn: 0 });
    const sun = startOfWeek(today, { weekStartsOn: 0 });
    selectDates([sun, sat]);
  };

  const selectNextWeekdays = () => {
    const mon = nextMonday(today);
    selectDates(Array.from({ length: 5 }, (_, i) => addDays(mon, i)));
  };

  const selectThisWeek = () => {
    const sun = startOfWeek(today, { weekStartsOn: 0 });
    selectDates(Array.from({ length: 7 }, (_, i) => addDays(sun, i)));
  };

  const totalStats = useMemo(() => {
    let totalHours = 0;
    let totalPrice = 0;
    for (const dateStr of selectedDates) {
      const t = sameTimeForAll ? globalTime : (dayTimes[dateStr] ?? DEFAULT_TIME);
      const h = calcHours(t.startTime, t.endTime);
      totalHours += h;
      totalPrice += h * room.pricePerHour;
    }
    return { totalHours, totalPrice };
  }, [selectedDates, dayTimes, sameTimeForAll, globalTime, room.pricePerHour]);

  return {
    today,
    currentMonth,
    prevMonth: () => setCurrentMonth((m) => subMonths(m, 1)),
    nextMonth: () => setCurrentMonth((m) => addMonths(m, 1)),
    goToToday: () => setCurrentMonth(today),
    selectedDates,
    toggleDate,
    removeDate,
    dayTimes,
    updateDayTime,
    sameTimeForAll,
    setSameTimeForAll,
    globalTime,
    updateGlobalTime,
    getEffectiveTime,
    clearAll,
    selectWeekend,
    selectNextWeekdays,
    selectThisWeek,
    totalStats,
  };
}

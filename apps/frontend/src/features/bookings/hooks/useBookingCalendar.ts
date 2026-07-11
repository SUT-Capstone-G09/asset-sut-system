import { useState, useMemo, useEffect } from "react";
import {
  addMonths, subMonths, format, startOfWeek, endOfWeek,
  addDays, nextMonday, isBefore, startOfDay,
} from "date-fns";
import { Room } from "@/features/bookings/types";
import { DayBookingTime, DayInfo } from "@/features/bookings/types/booking-calendar";
import { getMonthlyAvailability, MonthlyAvailabilityMap } from "@/features/bookings/services/location.service";

function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
}

function toDayInfo(map: MonthlyAvailabilityMap, dateStr: string): DayInfo {
  const entry = map[dateStr];
  if (!entry) return { status: "available" };
  if (entry.status === "full") return { status: "full" };
  if (entry.status === "partial") {
    const ranges = entry.booked_ranges;
    const label = ranges && ranges.length > 0
      ? ranges.map(([s, e]) => `${s}-${e}`).join(", ")
      : `${entry.booked_hours ?? 0} ชม.`;
    return { status: "partial", partialSlot: label };
  }
  return { status: "available" };
}

const DEFAULT_TIME: DayBookingTime = { startTime: "09:00", endTime: "11:00" };
// Spans the full bookable window (matches TIME_OPTIONS bounds in BookingPanel)
// so a full-day booking blocks the entire day, not just office hours.
const FULL_DAY_TIME: DayBookingTime = { startTime: "07:00", endTime: "21:00" };

function matchesFullDay(t: DayBookingTime): boolean {
  return t.startTime === FULL_DAY_TIME.startTime && t.endTime === FULL_DAY_TIME.endTime;
}
const MIN_BOOKING_LEAD_DAYS = 7;

export function useBookingCalendar(room: Room) {
  const today = startOfDay(new Date());
  const minBookableDate = addDays(today, MIN_BOOKING_LEAD_DAYS);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [dayTimes, setDayTimes] = useState<Record<string, DayBookingTime>>({});
  const [fullDayDates, setFullDayDates] = useState<Record<string, boolean>>({});
  const [sameTimeForAll, setSameTimeForAll] = useState(false);
  const [globalTime, setGlobalTime] = useState<DayBookingTime>(DEFAULT_TIME);
  const [availabilityMap, setAvailabilityMap] = useState<MonthlyAvailabilityMap>({});

  const isFullDayAvailable = room.pricePerDay !== undefined;

  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    getMonthlyAvailability(Number(room.id), year, month)
      .then(setAvailabilityMap)
      .catch(() => setAvailabilityMap({}));
  }, [room.id, currentMonth]);

  const getEffectiveTime = (dateStr: string): DayBookingTime => {
    if (fullDayDates[dateStr]) return FULL_DAY_TIME;
    return sameTimeForAll ? globalTime : (dayTimes[dateStr] ?? DEFAULT_TIME);
  };

  // Returns the first booked range that conflicts with [startTime, endTime], or null if clear.
  const getTimeConflict = (dateStr: string, startTime: string, endTime: string): [string, string] | null => {
    const ranges = availabilityMap[dateStr]?.booked_ranges;
    if (!ranges) return null;
    for (const [rs, re] of ranges) {
      if (startTime < re && endTime > rs) return [rs, re];
    }
    return null;
  };

  const toggleDate = (date: Date) => {
    if (isBefore(startOfDay(date), minBookableDate)) return;
    const dateStr = format(date, "yyyy-MM-dd");
    const info = toDayInfo(availabilityMap, dateStr);
    if (info.status === "full") return;
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

  const toggleFullDay = (dateStr: string) => {
    if (!isFullDayAvailable) return;
    const next = !fullDayDates[dateStr];
    setFullDayDates((prev) => ({ ...prev, [dateStr]: next }));
    setDayTimes((prev) => ({ ...prev, [dateStr]: next ? FULL_DAY_TIME : DEFAULT_TIME }));
  };

  const allFullDay = isFullDayAvailable && selectedDates.length > 0 &&
    selectedDates.every((d) => fullDayDates[d]);

  const setAllFullDay = (value: boolean) => {
    if (!isFullDayAvailable) return;
    setFullDayDates((prev) => {
      const next = { ...prev };
      selectedDates.forEach((d) => { next[d] = value; });
      return next;
    });
    setDayTimes((prev) => {
      const next = { ...prev };
      selectedDates.forEach((d) => { next[d] = value ? FULL_DAY_TIME : DEFAULT_TIME; });
      return next;
    });
  };

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
      const dateStr = format(d, "yyyy-MM-dd");
      const info = toDayInfo(availabilityMap, dateStr);
      return !isBefore(startOfDay(d), minBookableDate) && info.status !== "full";
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
      const t = getEffectiveTime(dateStr);
      const h = calcHours(t.startTime, t.endTime);
      totalHours += h;
      const useDaily = (fullDayDates[dateStr] || matchesFullDay(t)) && room.pricePerDay !== undefined;
      totalPrice += useDaily ? room.pricePerDay! : h * room.pricePerHour;
    }
    return { totalHours, totalPrice };
  }, [selectedDates, dayTimes, sameTimeForAll, globalTime, fullDayDates, room.pricePerHour, room.pricePerDay]);

  return {
    today,
    minBookableDate,
    currentMonth,
    prevMonth: () => setCurrentMonth((m) => subMonths(m, 1)),
    nextMonth: () => setCurrentMonth((m) => addMonths(m, 1)),
    goToToday: () => setCurrentMonth(today),
    selectedDates,
    toggleDate,
    removeDate,
    dayTimes,
    updateDayTime,
    fullDayDates,
    toggleFullDay,
    isFullDayAvailable,
    allFullDay,
    setAllFullDay,
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
    availabilityMap,
    getDayInfo: (date: Date) => toDayInfo(availabilityMap, format(date, "yyyy-MM-dd")),
    getTimeConflict,
  };
}

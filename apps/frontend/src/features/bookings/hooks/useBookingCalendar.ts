import { useState, useMemo, useEffect } from "react";
import {
  addMonths, subMonths, format, startOfWeek, endOfWeek,
  addDays, nextMonday, isBefore, startOfDay,
} from "date-fns";
import { toast } from "sonner";
import { Room } from "@/features/bookings/types";
import { DayBookingTime, DayInfo } from "@/features/bookings/types/booking-calendar";
import { getMonthlyAvailability, MonthlyAvailabilityMap } from "@/features/bookings/services/location.service";
import { calculateSlotPrice } from "@/features/bookings/utils/pricing";
import { useAuthContext } from "@/lib/context/auth-context";

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

const DEFAULT_TIME: DayBookingTime = { startTime: "08:30", endTime: "09:30" };
// Spans the full bookable window (matches TIME_OPTIONS bounds in BookingPanel)
// so a full-day booking blocks the entire day, not just office hours.
const FULL_DAY_TIME: DayBookingTime = { startTime: "07:00", endTime: "21:00" };

export function matchesFullDay(t: DayBookingTime): boolean {
  return t.startTime === FULL_DAY_TIME.startTime && t.endTime === FULL_DAY_TIME.endTime;
}
const MIN_BOOKING_LEAD_DAYS = 7;

// sessionStorage key holding the in-progress calendar selection for a room —
// exported so BookingConfirmView can clear it once the selection has been
// promoted to an actual booking draft (see its handleConfirm).
export function calendarDraftKey(roomId: string): string {
  return `booking_calendar_draft_${roomId}`;
}

interface CalendarDraft {
  selectedDates: string[];
  dayTimes: Record<string, DayBookingTime>;
  fullDayDates: Record<string, boolean>;
  sameTimeForAll: boolean;
  globalTime: DayBookingTime;
}

export function useBookingCalendar(room: Room) {
  const { isAuthenticated } = useAuthContext();
  const today = startOfDay(new Date());
  const minBookableDate = addDays(today, MIN_BOOKING_LEAD_DAYS);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [dayTimes, setDayTimes] = useState<Record<string, DayBookingTime>>({});
  const [fullDayDates, setFullDayDates] = useState<Record<string, boolean>>({});
  const [sameTimeForAll, setSameTimeForAll] = useState(false);
  const [globalTime, setGlobalTime] = useState<DayBookingTime>(DEFAULT_TIME);
  const [availabilityMap, setAvailabilityMap] = useState<MonthlyAvailabilityMap>({});
  const [restoredDraft, setRestoredDraft] = useState(false);

  // Restore an in-progress selection for this room after a refresh — a plain
  // useState() would otherwise lose it entirely, since nothing here persists
  // until this effect runs on mount.
  useEffect(() => {
    (() => {
      const raw = sessionStorage.getItem(calendarDraftKey(room.id));
      if (raw) {
        try {
          const draft: CalendarDraft = JSON.parse(raw);
          // The draft may be stale — e.g. left open past the 7-day lead
          // window, or across a date rollover — so re-validate against
          // minBookableDate before restoring instead of trusting it as-is.
          // (Whether a restored date got booked out from under the user in
          // the meantime still can't be fully known client-side; that's
          // caught by the existing conflict check once its month loads, and
          // enforced authoritatively by the backend at submit time either way.)
          const dates = (draft.selectedDates ?? []).filter(
            (d) => !isBefore(new Date(d), minBookableDate)
          );
          setSelectedDates(dates);
          const keep = new Set(dates);
          setDayTimes(
            Object.fromEntries(
              Object.entries(draft.dayTimes ?? {}).filter(([d]) => keep.has(d))
            )
          );
          setFullDayDates(
            Object.fromEntries(
              Object.entries(draft.fullDayDates ?? {}).filter(([d]) => keep.has(d))
            )
          );
          setSameTimeForAll(draft.sameTimeForAll ?? false);
          setGlobalTime(draft.globalTime ?? DEFAULT_TIME);
        } catch {
          // corrupted draft — ignore and start fresh
        }
      }
      setRestoredDraft(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  // Keep the draft in sync so a refresh (or accidental back-navigation) never
  // loses the selection. Skipped until the restore above has run, so we don't
  // immediately overwrite a saved draft with the empty initial state.
  useEffect(() => {
    if (!restoredDraft) return;
    if (selectedDates.length === 0) {
      sessionStorage.removeItem(calendarDraftKey(room.id));
      return;
    }
    const draft: CalendarDraft = { selectedDates, dayTimes, fullDayDates, sameTimeForAll, globalTime };
    sessionStorage.setItem(calendarDraftKey(room.id), JSON.stringify(draft));
  }, [restoredDraft, room.id, selectedDates, dayTimes, fullDayDates, sameTimeForAll, globalTime]);

  const isFullDayAvailable = room.pricePerDay !== undefined;

  useEffect(() => {
    let cancelled = false;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    getMonthlyAvailability(Number(room.id), year, month)
      .then((map) => {
        if (!cancelled) setAvailabilityMap(map);
      })
      .catch(() => {
        if (!cancelled) setAvailabilityMap({});
      });
    // Clicking next/prev month rapidly can let an older month's response land
    // after a newer one — without this guard it would silently overwrite
    // availabilityMap with stale data while a different month is displayed.
    return () => {
      cancelled = true;
    };
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
    if (!isAuthenticated) {
      toast.error("กรุณาเข้าสู่ระบบก่อนเลือกวันจอง");
      return;
    }
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

  // A day that already has any booking on it (even just a morning slot) can't
  // be switched to full-day — that would need the whole day free.
  const hasExistingBooking = (dateStr: string): boolean => {
    const entry = availabilityMap[dateStr];
    return !!entry && entry.status !== "available";
  };

  const toggleFullDay = (dateStr: string) => {
    if (!isFullDayAvailable) return;
    const next = !fullDayDates[dateStr];
    if (next && hasExistingBooking(dateStr)) {
      toast.error("วันนี้มีการจองอยู่แล้วบางส่วน ไม่สามารถจองเต็มวันได้");
      return;
    }
    setFullDayDates((prev) => ({ ...prev, [dateStr]: next }));
    setDayTimes((prev) => ({ ...prev, [dateStr]: next ? FULL_DAY_TIME : DEFAULT_TIME }));
  };

  const allFullDay = isFullDayAvailable && selectedDates.length > 0 &&
    selectedDates.every((d) => fullDayDates[d]);

  const setAllFullDay = (value: boolean) => {
    if (!isFullDayAvailable) return;
    const eligible = value ? selectedDates.filter((d) => !hasExistingBooking(d)) : selectedDates;
    if (value && eligible.length < selectedDates.length) {
      toast.error("บางวันมีการจองอยู่แล้ว จึงข้ามไม่ตั้งเป็นเต็มวันให้");
    }
    setFullDayDates((prev) => {
      const next = { ...prev };
      eligible.forEach((d) => { next[d] = value; });
      return next;
    });
    setDayTimes((prev) => {
      const next = { ...prev };
      eligible.forEach((d) => { next[d] = value ? FULL_DAY_TIME : DEFAULT_TIME; });
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
    if (!isAuthenticated) {
      toast.error("กรุณาเข้าสู่ระบบก่อนเลือกวันจอง");
      return;
    }
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
      totalPrice += useDaily
        ? room.pricePerDay!
        : calculateSlotPrice(t.startTime, t.endTime, room.pricePerHour, room.pricePerHourOffPeak ?? room.pricePerHour, room.pricePerDay);
    }
    return { totalHours, totalPrice };
  }, [selectedDates, dayTimes, sameTimeForAll, globalTime, fullDayDates, room.pricePerHour, room.pricePerHourOffPeak, room.pricePerDay]);

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
    hasExistingBooking,
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

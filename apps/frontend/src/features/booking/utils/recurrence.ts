import { addDays, addWeeks, addMonths, parseISO, format as formatDateFns, getDay, startOfWeek } from "date-fns";

export interface RecurrenceParams {
  startDate: string; // YYYY-MM-DD
  frequency: "daily" | "weekly" | "monthly" | "custom";
  customInterval?: number;
  customUnit?: "day" | "week" | "month";
  daysOfWeek?: number[]; // [1, 2, 3, 4, 5, 6, 0] (1=Mon, ..., 0=Sun)
  endDateType: "none" | "date" | "count";
  endDate?: string; // YYYY-MM-DD
  endCount?: number;
}

export function generateRecurrenceDates(params: RecurrenceParams): string[] {
  const dates: string[] = [];
  const start = parseISO(params.startDate);
  if (isNaN(start.getTime())) return [];

  // Safety limits: max 50 bookings to avoid performance hits
  const maxOccurrences = params.endDateType === "count" ? Math.min(params.endCount || 10, 50) : 50;
  const maxSearchDays = 730; // Do not check past 2 years

  let interval = 1;
  let unit: "day" | "week" | "month" = "day";

  if (params.frequency === "daily") {
    unit = "day";
    interval = 1;
  } else if (params.frequency === "weekly") {
    unit = "week";
    interval = 1;
  } else if (params.frequency === "monthly") {
    unit = "month";
    interval = 1;
  } else if (params.frequency === "custom") {
    unit = params.customUnit || "day";
    interval = params.customInterval || 1;
  }

  interval = Math.max(1, interval);

  if (unit === "day") {
    let current = start;
    let daysSearched = 0;
    while (dates.length < maxOccurrences && daysSearched < maxSearchDays) {
      if (params.endDateType === "date" && params.endDate) {
        const end = parseISO(params.endDate);
        if (current > end) break;
      }
      dates.push(formatDateFns(current, "yyyy-MM-dd"));
      current = addDays(current, interval);
      daysSearched += interval;
    }
  } else if (unit === "month") {
    let current = start;
    let monthsSearched = 0;
    while (dates.length < maxOccurrences && monthsSearched < 36) {
      if (params.endDateType === "date" && params.endDate) {
        const end = parseISO(params.endDate);
        if (current > end) break;
      }
      dates.push(formatDateFns(current, "yyyy-MM-dd"));
      current = addMonths(current, interval);
      monthsSearched += interval;
    }
  } else if (unit === "week") {
    // If no days of week are selected, fall back to start date's day of week
    const selectedDays = params.daysOfWeek && params.daysOfWeek.length > 0
      ? params.daysOfWeek
      : [getDay(start)];

    // Find the Monday of the week containing the start date (weekStartsOn: 1 = Monday)
    const firstWeekMonday = startOfWeek(start, { weekStartsOn: 1 });
    
    let weekIndex = 0;
    let weeksSearched = 0;
    
    while (dates.length < maxOccurrences && weeksSearched < 104) {
      const currentWeekMonday = addWeeks(firstWeekMonday, weekIndex * interval);
      
      // Check each day of this week in order: Monday to Sunday
      const weekDays = [1, 2, 3, 4, 5, 6, 0];
      
      for (const dayOfWeek of weekDays) {
        if (selectedDays.includes(dayOfWeek)) {
          let dayOffset = dayOfWeek - 1; // 1 (Mon) -> 0, 2 (Tue) -> 1, ..., 6 (Sat) -> 5
          if (dayOfWeek === 0) dayOffset = 6; // 0 (Sun) -> 6
          
          const targetDate = addDays(currentWeekMonday, dayOffset);
          
          // Only match dates starting from the selected start date
          if (targetDate >= start) {
            if (params.endDateType === "date" && params.endDate) {
              const end = parseISO(params.endDate);
              if (targetDate > end) continue;
            }
            
            dates.push(formatDateFns(targetDate, "yyyy-MM-dd"));
            if (dates.length >= maxOccurrences) break;
          }
        }
      }
      
      weekIndex++;
      weeksSearched += interval;
    }
  }

  // Fallback: If no dates were generated (e.g., start date was excluded somehow), add start date
  if (dates.length === 0) {
    dates.push(params.startDate);
  }

  return dates;
}

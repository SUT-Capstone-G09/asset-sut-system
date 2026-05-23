export type DayStatus = "available" | "full" | "partial" | "closed";

export interface DayInfo {
  status: DayStatus;
  note?: string;
  partialSlot?: string;
}

export interface DayBookingTime {
  startTime: string;
  endTime: string;
}

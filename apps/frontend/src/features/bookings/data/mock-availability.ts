import { DayInfo } from "@/features/bookings/types/booking-calendar";

export function getDayInfo(date: Date): DayInfo {
  const dow = date.getDay(); // 0=Sun
  const dom = date.getDate();

  if (dow === 0) return { status: "closed", note: "ไม่เปิดให้บริการ" };
  if (dom % 13 === 0) return { status: "closed", note: "ปิดปรับปรุง" };
  if (dom % 9 === 0) return { status: "full" };
  if (dom % 6 === 0) return { status: "partial", partialSlot: "13:00-17:00 จองแล้ว" };

  return { status: "available" };
}

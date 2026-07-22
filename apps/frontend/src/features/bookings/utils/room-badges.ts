import { CheckCircle, Clock } from "lucide-react";

// Shared between RoomCard (grid) and RoomListRow (list) so the two views
// stay visually consistent instead of drifting apart over time.
export const BADGE_STYLES: Record<string, string> = {
  ยอดนิยม: "bg-brand-primary text-white",
  ใหม่: "bg-violet-500 text-white",
  Premium: "bg-yellow-500 text-white",
};

// "ว่างทุกวัน" (fully open this month) reads as an unambiguous green go-signal;
// "ว่างบางวัน" (already has bookings) gets its own color+icon so the two
// aren't visually identical at a glance despite meaning different things.
export const AVAILABILITY_STYLES: Record<string, { className: string; Icon: typeof CheckCircle }> = {
  ว่างทุกวัน: { className: "bg-green-500 text-white", Icon: CheckCircle },
  ว่างบางวัน: { className: "bg-amber-500 text-white", Icon: Clock },
};

export function getAvailabilityStyle(availability: string) {
  return AVAILABILITY_STYLES[availability] ?? AVAILABILITY_STYLES["ว่างทุกวัน"];
}

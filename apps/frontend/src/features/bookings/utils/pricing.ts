// Office hours: 08:30–16:30. Time inside this window bills at the normal hourly
// rate; time outside it (earlier, later, or straddling the boundary) bills at the
// off-peak hourly rate, prorated by the exact minutes on each side. Mirrors
// calculatePrice() in apps/backend/internal/services/booking.go.
export const OFFICE_START_MIN = 8 * 60 + 30;
export const OFFICE_END_MIN = 16 * 60 + 30;

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function overlapMinutes(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  const start = Math.max(aStart, bStart);
  const end = Math.min(aEnd, bEnd);
  return Math.max(0, end - start);
}

// Prorated price for a single "HH:mm"–"HH:mm" slot given the office-hours rate
// and the off-peak rate. Pass the same value for both if no off-peak rate applies.
// Pass dailyRate when the location has one configured — bookings longer than 4
// hours bill at that flat rate instead of being prorated hourly, mirroring
// calculatePrice()'s ">4h → daily tier" rule in booking.go exactly. Omitting
// dailyRate (or passing undefined) skips that override, which will disagree
// with what the backend actually charges for any slot over 4 hours.
export function calculateSlotPrice(
  startTime: string,
  endTime: string,
  officeRate: number,
  offPeakRate: number,
  dailyRate?: number
): number {
  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);
  if (endMin <= startMin) return 0;

  if (dailyRate != null && (endMin - startMin) / 60 > 4) {
    return dailyRate;
  }

  const officeMinutes = overlapMinutes(startMin, endMin, OFFICE_START_MIN, OFFICE_END_MIN);
  const offPeakMinutes = (endMin - startMin) - officeMinutes;

  return Math.round((officeMinutes / 60) * officeRate + (offPeakMinutes / 60) * offPeakRate);
}

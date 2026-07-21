import { describe, expect, it } from "vitest";
import { calculateSlotPrice } from "./pricing";

// Same rates as apps/backend/internal/services/booking_price_test.go so the
// two suites are directly comparable — if a rule drifts between frontend and
// backend, the expected numbers here and there stop matching by inspection.
const OFFICE_RATE = 200;
const OFFPEAK_RATE = 300;
const DAILY_RATE = 1200;

describe("calculateSlotPrice", () => {
  it("prices a slot fully inside office hours at the office rate", () => {
    // 09:00-11:00 = 2h, fully inside 08:30-16:30.
    expect(calculateSlotPrice("09:00", "11:00", OFFICE_RATE, OFFPEAK_RATE)).toBe(2 * OFFICE_RATE);
  });

  it("prices a slot fully outside office hours at the off-peak rate", () => {
    // 17:00-19:00 = 2h, fully after 16:30.
    expect(calculateSlotPrice("17:00", "19:00", OFFICE_RATE, OFFPEAK_RATE)).toBe(2 * OFFPEAK_RATE);
  });

  it("prorates a slot that straddles the office-hours boundary", () => {
    // 15:00-19:00: 1.5h office (15:00-16:30) + 2.5h off-peak (16:30-19:00).
    const want = Math.round(1.5 * OFFICE_RATE + 2.5 * OFFPEAK_RATE);
    expect(calculateSlotPrice("15:00", "19:00", OFFICE_RATE, OFFPEAK_RATE)).toBe(want);
  });

  it("does not truncate fractional hours", () => {
    // 09:00-11:30 = 2.5h, fully inside office hours.
    expect(calculateSlotPrice("09:00", "11:30", OFFICE_RATE, OFFPEAK_RATE)).toBe(
      Math.round(2.5 * OFFICE_RATE)
    );
  });

  it("bills the flat daily rate once a slot exceeds 4 hours, regardless of time of day", () => {
    // 14:00-19:00 = 5h, straddles the boundary but must use the flat rate,
    // not the 2.5h office / 2.5h off-peak proration it'd otherwise get.
    expect(calculateSlotPrice("14:00", "19:00", OFFICE_RATE, OFFPEAK_RATE, DAILY_RATE)).toBe(
      DAILY_RATE
    );
  });

  it("does not apply the >4h daily override when no dailyRate is given", () => {
    // Same 5h slot as above, but the location has no daily tier configured —
    // must fall back to prorating hourly instead of silently charging 0.
    const want = Math.round(2.5 * OFFICE_RATE + 2.5 * OFFPEAK_RATE);
    expect(calculateSlotPrice("14:00", "19:00", OFFICE_RATE, OFFPEAK_RATE)).toBe(want);
  });

  it("does not apply the daily override at exactly 4 hours (boundary is strictly >4h)", () => {
    // 14:30-18:30 = exactly 4h, straddling the boundary (2h office + 2h
    // off-peak) — must still prorate hourly, matching the backend's
    // `hours > 4` (not `>=`) check, even though a dailyRate is given.
    const want = Math.round(2 * OFFICE_RATE + 2 * OFFPEAK_RATE);
    expect(calculateSlotPrice("14:30", "18:30", OFFICE_RATE, OFFPEAK_RATE, DAILY_RATE)).toBe(want);
  });

  it("returns 0 when end time is not after start time", () => {
    expect(calculateSlotPrice("11:00", "09:00", OFFICE_RATE, OFFPEAK_RATE)).toBe(0);
    expect(calculateSlotPrice("09:00", "09:00", OFFICE_RATE, OFFPEAK_RATE)).toBe(0);
  });
});

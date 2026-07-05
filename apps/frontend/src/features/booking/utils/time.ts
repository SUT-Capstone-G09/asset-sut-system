/**
 * Computes the duration in hours between start and end times in a given time slot string
 * (e.g. "09:00 - 12:00 น.")
 */
export function getHoursFromTimeSlot(timeSlot: string): number {
  try {
    const match = timeSlot.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
    if (match) {
      const startHour = parseInt(match[1], 10);
      const startMin = parseInt(match[2], 10);
      const endHour = parseInt(match[3], 10);
      const endMin = parseInt(match[4], 10);
      let diffMin = endHour * 60 + endMin - (startHour * 60 + startMin);
      if (diffMin < 0) {
        diffMin += 24 * 60; // add 24 hours
      }
      return Math.max(1, diffMin / 60);
    }
  } catch (e) {
    console.error("Error parsing time slot:", e);
  }
  return 3; // Default fallback
}

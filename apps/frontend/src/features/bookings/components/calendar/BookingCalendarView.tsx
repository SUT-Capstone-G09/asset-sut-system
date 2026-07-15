"use client";

import { useRouter } from "next/navigation";
import { Room } from "@/features/bookings/types";
import { useBookingCalendar } from "@/features/bookings/hooks/useBookingCalendar";
import MonthlyCalendar from "@/features/bookings/components/calendar/MonthlyCalendar";
import BookingPanel from "@/features/bookings/components/calendar/BookingPanel";

interface BookingCalendarViewProps {
  room: Room;
}

export default function BookingCalendarView({ room }: BookingCalendarViewProps) {
  const router = useRouter();
  const cal = useBookingCalendar(room);

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">เลือกวันที่ต้องการจอง</h1>
        <p className="text-gray-500 text-sm mt-1">เลือกได้หลายวัน คลิกซ้ำเพื่อยกเลิก</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        <MonthlyCalendar
          currentMonth={cal.currentMonth}
          today={cal.today}
          minBookableDate={cal.minBookableDate}
          selectedDates={cal.selectedDates}
          onToggleDate={cal.toggleDate}
          onPrev={cal.prevMonth}
          onNext={cal.nextMonth}
          onToday={cal.goToToday}
          onClearAll={cal.clearAll}
          onSelectWeekend={cal.selectWeekend}
          onSelectNextWeekdays={cal.selectNextWeekdays}
          onSelectThisWeek={cal.selectThisWeek}
          getDayInfo={cal.getDayInfo}
        />

        <div className="lg:sticky lg:top-24">
          <BookingPanel
            room={room}
            selectedDates={cal.selectedDates}
            getEffectiveTime={cal.getEffectiveTime}
            updateDayTime={cal.updateDayTime}
            removeDate={cal.removeDate}
            fullDayDates={cal.fullDayDates}
            toggleFullDay={cal.toggleFullDay}
            hasExistingBooking={cal.hasExistingBooking}
            isFullDayAvailable={cal.isFullDayAvailable}
            allFullDay={cal.allFullDay}
            setAllFullDay={cal.setAllFullDay}
            sameTimeForAll={cal.sameTimeForAll}
            setSameTimeForAll={cal.setSameTimeForAll}
            globalTime={cal.globalTime}
            updateGlobalTime={cal.updateGlobalTime}
            totalStats={cal.totalStats}
            getTimeConflict={cal.getTimeConflict}
            onConfirm={() => {
              const timeslots = cal.selectedDates.map((dateStr) => {
                const t = cal.getEffectiveTime(dateStr);
                return {
                  date: dateStr,
                  startTime: t.startTime,
                  endTime: t.endTime,
                  isFullDay: !!cal.fullDayDates[dateStr] || (t.startTime === "07:00" && t.endTime === "21:00"),
                };
              });
              sessionStorage.setItem(
                `booking_draft_${room.id}`,
                JSON.stringify({ locationId: room.id, timeslots })
              );
              router.push(`/bookings/${room.id}/confirm`);
            }}
          />
        </div>
      </div>
    </div>
  );
}

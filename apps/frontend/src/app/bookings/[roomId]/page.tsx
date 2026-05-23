import { notFound } from "next/navigation";
import { mockRooms } from "@/features/bookings/data/mock-rooms";
import BookingCalendarView from "@/features/bookings/components/calendar/BookingCalendarView";
import PageContainer from "@/components/layout/PageContainer";

export default async function BookingCalendarPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const room = mockRooms.find((r) => r.id === roomId);
  if (!room) notFound();

  return (
    <PageContainer>
      <BookingCalendarView room={room} />
    </PageContainer>
  );
}

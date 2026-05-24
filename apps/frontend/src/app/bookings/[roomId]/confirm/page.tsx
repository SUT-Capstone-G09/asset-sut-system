import { notFound } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import BookingConfirmView from "@/features/bookings/components/confirm/BookingConfirmView";
import { mockRooms } from "@/features/bookings/data/mock-rooms";

export default async function BookingConfirmPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const room = mockRooms.find((r) => r.id === roomId);
  if (!room) notFound();

  return (
    <PageContainer>
      <BookingConfirmView room={room} />
    </PageContainer>
  );
}

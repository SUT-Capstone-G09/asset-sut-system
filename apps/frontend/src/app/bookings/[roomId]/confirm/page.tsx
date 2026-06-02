"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import BookingConfirmView from "@/features/bookings/components/confirm/BookingConfirmView";
import { getLocationById, locationDetailToRoom } from "@/features/bookings/services/location.service";
import { Room } from "@/features/bookings/types";

export default function BookingConfirmPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const [room, setRoom] = useState<Room | null>(null);
  const [notFound404, setNotFound404] = useState(false);

  useEffect(() => {
    getLocationById(Number(roomId))
      .then((loc) => setRoom(locationDetailToRoom(loc)))
      .catch(() => setNotFound404(true));
  }, [roomId]);

  if (notFound404) notFound();
  if (!room) return null;

  return (
    <PageContainer>
      <BookingConfirmView room={room} />
    </PageContainer>
  );
}

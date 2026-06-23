"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import BookingConfirmView from "@/features/bookings/components/confirm/BookingConfirmView";
import { getLocationById, locationDetailToRoom } from "@/features/bookings/services/location.service";
import { Room } from "@/features/bookings/types";
import { useAuthContext } from "@/lib/context/auth-context";

export default function BookingConfirmPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const [room, setRoom] = useState<Room | null>(null);
  const [notFound404, setNotFound404] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    getLocationById(Number(roomId))
      .then((loc) => setRoom(locationDetailToRoom(loc, user?.requester_type_id)))
      .catch(() => setNotFound404(true));
  }, [roomId, user?.requester_type_id]);

  if (notFound404) notFound();
  if (!room) return null;

  return (
    <PageContainer>
      <BookingConfirmView room={room} />
    </PageContainer>
  );
}

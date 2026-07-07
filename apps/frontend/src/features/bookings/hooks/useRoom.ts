"use client";

import { useEffect, useState } from "react";
import { getLocationById, locationDetailToRoom } from "@/features/bookings/services/location.service";
import { useAuthContext } from "@/lib/context/auth-context";
import { Room } from "@/features/bookings/types";

interface UseRoomResult {
  room: Room | null;
  notFound: boolean;
}

export function useRoom(roomId: string): UseRoomResult {
  const [room, setRoom] = useState<Room | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    getLocationById(Number(roomId))
      .then((loc) => setRoom(locationDetailToRoom(loc, user?.requester_type_id)))
      .catch(() => setNotFound(true));
  }, [roomId, user?.requester_type_id]);

  return { room, notFound };
}

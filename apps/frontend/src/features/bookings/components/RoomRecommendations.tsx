"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import RoomCard from "@/features/bookings/components/RoomCard";
import { getLocations, locationToRoom } from "@/features/bookings/services/location.service";
import { Room } from "@/features/bookings/types";
import { useAuthContext } from "@/lib/context/auth-context";

export default function RoomRecommendations() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const { user } = useAuthContext();
  const requesterTypeId = user?.requester_type_id;

  useEffect(() => {
    getLocations()
      .then((locations) => setRooms(locations.map((loc) => locationToRoom(loc, requesterTypeId)).slice(0, 6)))
      .catch(() => setRooms([]));
  }, [requesterTypeId]);

  if (rooms.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={20} className="text-brand-primary" />
        <h2 className="text-xl font-bold text-gray-900">ห้องแนะนำ</h2>
        <span className="text-sm text-gray-400 font-normal">ห้องยอดนิยมที่ผู้ใช้เลือกมากที่สุด</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} dayCount={1} />
        ))}
      </div>
    </div>
  );
}

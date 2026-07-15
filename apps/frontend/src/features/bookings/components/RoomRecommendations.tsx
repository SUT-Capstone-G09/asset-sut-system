"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import RoomCard from "@/features/bookings/components/RoomCard";
import {
  getLocations,
  getRoomAvailabilityBadge,
  locationToRoom,
  LocationDTO,
} from "@/features/bookings/services/location.service";
import { Room } from "@/features/bookings/types";
import { useAuthContext } from "@/lib/context/auth-context";

const CATEGORY_TO_TYPE: Record<string, string> = {
  meeting: "ห้องประชุม",
  classroom: "ห้องเรียน",
  sports: "สนามกีฬา",
  hall: "โถงอาคาร",
};

interface Props {
  category?: string;
}

export default function RoomRecommendations({ category }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const { user } = useAuthContext();
  const requesterTypeId = user?.requester_type_id;

  useEffect(() => {
    getLocations()
      .then(async (locations) => {
        const filtered = category
          ? locations.filter((loc: LocationDTO) => loc.type === CATEGORY_TO_TYPE[category])
          : locations;
        const base = filtered.map((loc) => locationToRoom(loc, requesterTypeId)).slice(0, 6);
        setRooms(base);

        // Upgrade the operational-status placeholder badge to a real,
        // booking-derived one once each room's monthly data resolves.
        const withRealAvailability = await Promise.all(
          base.map(async (room) => {
            const availability = await getRoomAvailabilityBadge(Number(room.id)).catch(
              () => room.availability
            );
            return { ...room, availability };
          })
        );
        setRooms(withRealAvailability);
      })
      .catch(() => setRooms([]));
  }, [requesterTypeId, category]);

  if (rooms.length === 0) return null;

  const typeName = category ? CATEGORY_TO_TYPE[category] : null;

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={20} className="text-brand-primary" />
        <h2 className="text-xl font-bold text-gray-900">
          {typeName ? `${typeName}แนะนำ` : "ห้องแนะนำ"}
        </h2>
        <span className="text-sm text-gray-400 font-normal">
          {typeName ? `${typeName}ยอดนิยมภายในมหาวิทยาลัย` : "ห้องยอดนิยมที่ผู้ใช้เลือกมากที่สุด"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}

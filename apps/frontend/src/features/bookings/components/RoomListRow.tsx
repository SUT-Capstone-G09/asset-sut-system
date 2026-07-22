"use client";

import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Room } from "@/features/bookings/types";
import { cn } from "@/lib/utils";
import { BADGE_STYLES, getAvailabilityStyle } from "@/features/bookings/utils/room-badges";

interface RoomListRowProps {
  room: Room;
}

export default function RoomListRow({ room }: RoomListRowProps) {
  const capacityLabel =
    room.capacityMin === room.capacityMax
      ? `${room.capacityMax} คน`
      : `${room.capacityMin}-${room.capacityMax} คน`;

  const locationLabel = [room.building, room.floor].filter(Boolean).join(" ");
  const availabilityStyle = getAvailabilityStyle(room.availability);
  const AvailabilityIcon = availabilityStyle.Icon;

  return (
    <Link
      href={`/bookings/${room.id}`}
      className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-3 hover:shadow-md hover:border-gray-200 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative h-24 w-24 sm:h-24 sm:w-24 rounded-xl overflow-hidden shrink-0">
        <img src={room.image} alt={room.name} className="h-full w-full object-cover" />
        {room.badge && (
          <span className={cn("absolute top-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full", BADGE_STYLES[room.badge])}>
            {room.badge}
          </span>
        )}
      </div>

      {/* Name + location */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 text-base leading-snug truncate">{room.name}</h3>
        <p className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
          <MapPin size={12} className="text-brand-primary shrink-0" />
          <span className="truncate">{locationLabel}</span>
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <Users size={12} className="text-gray-400" />
            {capacityLabel}
          </span>
          <span className={cn("flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full", availabilityStyle.className)}>
            <AvailabilityIcon size={10} />
            {room.availability}
          </span>
        </div>
      </div>

      {/* Price + CTA */}
      <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
        <p className="text-brand-primary font-bold text-base whitespace-nowrap">
          ฿{room.pricePerHour.toLocaleString()}
          <span className="text-xs font-normal text-gray-500">/ชม.</span>
        </p>
        <Button
          size="sm"
          tabIndex={-1}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold px-5 rounded-lg pointer-events-none"
        >
          เลือก
        </Button>
      </div>
    </Link>
  );
}

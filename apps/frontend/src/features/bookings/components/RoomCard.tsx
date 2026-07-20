"use client";

import Link from "next/link";
import { MapPin, Users, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Room } from "@/features/bookings/types";
import { cn } from "@/lib/utils";

const BADGE_STYLES: Record<string, string> = {
  ยอดนิยม: "bg-brand-primary text-white",
  ใหม่: "bg-violet-500 text-white",
  Premium: "bg-yellow-500 text-white",
};

// "ว่างทุกวัน" (fully open this month) reads as an unambiguous green go-signal;
// "ว่างบางวัน" (already has bookings) gets its own color+icon so the two
// aren't visually identical at a glance despite meaning different things.
const AVAILABILITY_STYLES: Record<string, { className: string; Icon: typeof CheckCircle }> = {
  ว่างทุกวัน: { className: "bg-green-500 text-white", Icon: CheckCircle },
  ว่างบางวัน: { className: "bg-amber-500 text-white", Icon: Clock },
};

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const capacityLabel =
    room.capacityMin === room.capacityMax
      ? `${room.capacityMax} คน`
      : `${room.capacityMin}-${room.capacityMax} คน`;

  const locationLabel = [room.building, room.floor].filter(Boolean).join(" ");
  const availabilityStyle = AVAILABILITY_STYLES[room.availability] ?? AVAILABILITY_STYLES["ว่างทุกวัน"];
  const AvailabilityIcon = availabilityStyle.Icon;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3">
          {room.badge && (
            <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", BADGE_STYLES[room.badge])}>
              {room.badge}
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span className={cn("flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full", availabilityStyle.className)}>
            <AvailabilityIcon size={11} />
            {room.availability}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-snug">{room.name}</h3>
          <p className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
            <MapPin size={12} className="text-brand-primary" />
            {locationLabel}
          </p>
        </div>

        {/* Specs */}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5 text-sm text-gray-600">
            <Users size={14} className="text-gray-400" />
            {capacityLabel}
          </span>
          {room.amenities.map((a) => (
            <span key={a} className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
              {a}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between pt-1 border-t border-gray-50">
          <div>
            <p className="text-brand-primary font-bold text-lg">
              ฿{room.pricePerHour.toLocaleString()}
              <span className="text-sm font-normal text-gray-500">/ชม.</span>
            </p>
          </div>
          <Link href={`/bookings/${room.id}`}>
            <Button
              size="sm"
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold px-5 rounded-lg"
            >
              เลือก
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

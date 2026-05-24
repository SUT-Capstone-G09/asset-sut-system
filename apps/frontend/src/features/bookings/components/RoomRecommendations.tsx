"use client";

import { Sparkles } from "lucide-react";
import RoomCard from "@/features/bookings/components/RoomCard";
import { mockRooms } from "@/features/bookings/data/mock-rooms";

const FEATURED_ROOMS = mockRooms.filter((r) => r.badge);

export default function RoomRecommendations() {
  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={20} className="text-brand-primary" />
        <h2 className="text-xl font-bold text-gray-900">ห้องแนะนำ</h2>
        <span className="text-sm text-gray-400 font-normal">ห้องยอดนิยมที่ผู้ใช้เลือกมากที่สุด</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURED_ROOMS.map((room) => (
          <RoomCard key={room.id} room={room} dayCount={1} />
        ))}
      </div>
    </div>
  );
}

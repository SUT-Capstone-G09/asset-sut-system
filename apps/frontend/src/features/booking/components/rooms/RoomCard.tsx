"use client"

import { MapPin, ArrowRight, Users } from "lucide-react";
import { Room } from "../../types/room";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface RoomCardProps {
  room: Room;
  onClick?: () => void;
}

const statusConfig = {
  available: {
    label: "ใช้งานได้",
    color: "bg-emerald-50/90 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
  },
  maintenance: {
    label: "ปิดปรับปรุง",
    color: "bg-red-50/90 text-red-500 border-red-100",
    dot: "bg-red-400",
  },
};

export default function RoomCard({
  room,
  onClick,
}: RoomCardProps) {
  const status = statusConfig[room.status ?? "available"];

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group overflow-hidden",
        "bg-white w-full",
        "transition-all duration-300",
        "hover:shadow-md hover:border-[#f26522]/20 hover:-translate-y-1",
        "cursor-pointer flex flex-col gap-0 py-0 border-slate-200/60 rounded-[7px]"
      )}
    >
      {/* Card Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 rounded-t-[7px]">
        <img
          src={room.image}
          alt={room.roomName}
          loading="lazy"
          suppressHydrationWarning={true}
          className="
            h-full w-full object-cover
            transition-transform duration-700
            group-hover:scale-110
          "
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20" />

        {/* Top Badges */}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {/* Status Badge */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm shadow-sm ring-1 ring-black/5",
              status.color.split(" ")[1]
            )}
          >
            <div className={cn("size-1.5 rounded-full animate-pulse", status.dot)} />
            <span className="text-[9px] font-black uppercase tracking-widest">
              {status.label}
            </span>
          </div>

          {/* Room Number */}
          <div className="flex items-center gap-1 px-2 py-0.5 bg-black/40 backdrop-blur-md border border-white/20 rounded-md">
            <span className="text-[8px] font-bold text-white uppercase tracking-wider">
              {room.roomNumber}
            </span>
          </div>
        </div>

        {/* Bottom Category */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-md rounded-md border border-white/20">
            <MapPin size={10} className="text-[#f26522]" strokeWidth={2.5} />
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">
              {room.category}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <CardHeader className="space-y-1 p-5 pb-0">
        <CardTitle
          className="
            text-[16px] font-bold leading-snug
            text-slate-900 line-clamp-1 group-hover:text-[#f26522] transition-colors
            text-left
          "
        >
          {room.roomName}
        </CardTitle>

        <CardDescription
          className="
            text-[12px] leading-relaxed
            text-slate-500 line-clamp-2
            text-left
          "
        >
          {room.building}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 py-4 space-y-3">
        {/* Capacity Info */}
        <div className="rounded-[7px] bg-slate-50 px-4 py-3 flex items-start gap-2.5">
          <Users size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <div className="min-w-0 text-left">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">ความจุผู้ใช้บริการ</p>
            <p className="text-[14px] font-black text-slate-700 mt-1">
              {room.capacity} <span className="text-[12px] font-normal text-slate-500">ที่นั่ง</span>
            </p>
          </div>
        </div>

        {/* Equipment Badges */}
        <div className="space-y-1 text-left">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">อุปกรณ์ในห้อง</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {room.equipment && room.equipment.length > 0 ? (
              room.equipment.slice(0, 3).map((eq, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-[9px] font-medium bg-slate-100 text-slate-600 rounded"
                >
                  {eq}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-slate-400">ไม่มีอุปกรณ์เฉพาะ</span>
            )}
            {room.equipment && room.equipment.length > 3 && (
              <span className="px-2 py-0.5 text-[9px] font-bold bg-[#f26522]/10 text-[#f26522] rounded">
                +{room.equipment.length - 3}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <button
          className={cn(
            "flex w-full items-center justify-center gap-2",
            "rounded-[7px] bg-slate-50 py-3",
            "text-[12px] font-semibold text-slate-600",
            "transition-all duration-300",
            "group-hover:bg-[#f26522] group-hover:text-white",
            "active:scale-[0.98] cursor-pointer"
          )}
        >
          ดูรายละเอียดห้อง
          <ArrowRight
            size={14}
            className="
              transition-transform duration-200
              group-hover:translate-x-0.5
            "
          />
        </button>
      </CardFooter>
    </Card>
  );
}

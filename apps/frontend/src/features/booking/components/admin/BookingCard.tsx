"use client"

import { MapPin, ArrowRight, User, Calendar, Clock } from "lucide-react";
import { Booking } from "../../types/booking";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface BookingCardProps {
  booking: Booking;
  onClick?: () => void;
}

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    dot: string;
  }
> = {
  pending: {
    label: "รออนุมัติ",
    color: "bg-amber-50/90 text-amber-700 border-amber-100",
    dot: "bg-amber-400",
  },
  approved: {
    label: "อนุมัติแล้ว",
    color: "bg-emerald-50/90 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "ปฏิเสธ",
    color: "bg-red-50/90 text-red-500 border-red-100",
    dot: "bg-red-400",
  },
};

export default function BookingCard({
  booking,
  onClick,
}: BookingCardProps) {
  const status = statusConfig[booking.status ?? "pending"];

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
          src={booking.image}
          alt={booking.roomName}
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

          {/* Booking ID */}
          <div className="flex items-center gap-1 px-2 py-0.5 bg-black/40 backdrop-blur-md border border-white/20 rounded-md">
            <span className="text-[8px] font-bold text-white uppercase tracking-wider">
              {booking.id}
            </span>
          </div>
        </div>

        {/* Bottom Category */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-md rounded-md border border-white/20">
            <MapPin size={10} className="text-[#f26522]" strokeWidth={2.5} />
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">
              {booking.category}
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
          "
        >
          {booking.roomName}
        </CardTitle>

        <CardDescription
          className="
            text-[12px] leading-relaxed
            text-slate-500 line-clamp-2
          "
        >
          {booking.building}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 py-4 space-y-3">
        {/* Requester Info */}
        <div className="rounded-[7px] bg-slate-50 px-4 py-3 flex items-start gap-2.5">
          <User size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">ผู้ขอใช้พื้นที่</p>
            <p className="text-[12px] font-bold text-slate-700 truncate mt-1">
              {booking.requesterName}
            </p>
            <p className="text-[9.5px] font-medium text-slate-400 mt-0.5">
              ID: {booking.requesterId} ({booking.requesterType === 'student' ? 'นักศึกษา' : booking.requesterType === 'staff' ? 'เจ้าหน้าที่' : 'ภายนอก'})
            </p>
          </div>
        </div>

        {/* Date and Time slots */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
          <div className="flex items-center gap-1.5 bg-slate-50/50 p-2 rounded-[7px] border border-slate-100">
            <Calendar size={12} className="text-[#f26522] shrink-0" />
            <span className="truncate">{booking.date}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50/50 p-2 rounded-[7px] border border-slate-100">
            <Clock size={12} className="text-[#f26522] shrink-0" />
            <span className="truncate">{booking.timeSlot}</span>
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
            "active:scale-[0.98]"
          )}
        >
          ดูรายละเอียด
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

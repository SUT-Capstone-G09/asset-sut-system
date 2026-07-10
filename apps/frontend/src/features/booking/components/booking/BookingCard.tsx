"use client";

import { MapPin, User, Calendar, Clock, Mail, ChevronRight, Receipt } from "lucide-react";
import { Booking, BOOKING_STATUS_CONFIG } from "../../types/booking";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookingCardProps {
  booking: Booking;
  onClick?: () => void;
  onEditClick?: () => void;
  onExpensesClick?: () => void;
  onUpdateStatus?: (id: string, status: any) => void;
}

export default function BookingCard({ 
  booking, 
  onClick, 
  onEditClick, 
  onExpensesClick,
  onUpdateStatus 
}: BookingCardProps) {
  const status = BOOKING_STATUS_CONFIG[booking.status ?? "pending"];

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group overflow-hidden",
        "bg-white w-full flex flex-col md:flex-row",
        "transition-all duration-300",
        "hover:shadow-xl hover:shadow-slate-200/50 hover:border-[#f26522]/30 hover:-translate-y-1",
        "cursor-pointer border border-slate-100 rounded-[12px] p-4 gap-6",
      )}
    >
      {/* 1. Left Side: Image */}
      <div className="w-full md:w-[240px] shrink-0 bg-slate-100 rounded-[8px] overflow-hidden aspect-square md:aspect-auto md:h-auto">
        <img
          src={booking.image}
          alt={booking.roomName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* 2. Middle Section: Room Info & User Info */}
      <div className="flex-[2] flex flex-col justify-center gap-5 py-2">
        {/* Status, Title, Location */}
        <div className="space-y-3">
          <div className="w-fit">
            <div
              className={cn(
                "h-9 px-4 py-2 rounded-full border flex items-center gap-2 text-xs font-bold tracking-wide",
                status.gridBg || "bg-slate-100 border-slate-200",
                status.gridText || "text-slate-700",
              )}
            >
              <div className={cn("size-2 rounded-full", status.dot || "bg-slate-400")} />
              {status.label || "ไม่ทราบสถานะ"}
            </div>
          </div>

          <h3 className="text-[22px] font-extrabold text-slate-900 leading-snug group-hover:text-[#f26522] transition-colors line-clamp-2">
            {booking.roomName}
          </h3>

          <div className="flex items-center gap-1.5 text-slate-500">
            <MapPin size={16} className="shrink-0" />
            <span className="text-sm">{booking.building}</span>
          </div>
        </div>

        <hr className="border-slate-100 w-full" />

        {/* User Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="size-9 rounded-full bg-blue-100/50 text-blue-600 flex items-center justify-center shrink-0">
              <User size={16} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-slate-500 font-medium">ผู้ขอใช้บริการ</span>
              <span className="text-sm font-bold text-slate-800 truncate">{booking.requesterName}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3.5">
            <div className="size-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Mail size={16} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-slate-500 font-medium">อีเมล</span>
              <span className="text-sm font-bold text-slate-800 truncate">
                {booking.contactEmail || "ไม่ระบุอีเมล"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Right Section: Date/Time & Buttons */}
      <div className="flex-1 flex flex-col justify-between md:border-l border-slate-100 md:pl-6 min-w-[220px] py-2 gap-6">
        {/* Date and Time */}
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="size-11 rounded-xl bg-[#f26522] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Calendar size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-slate-500 font-medium">วันที่</span>
              <span className="text-[15px] font-bold text-slate-900 truncate">{booking.date}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="size-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 shadow-sm">
              <Clock size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-slate-500 font-medium">เวลา</span>
              <span className="text-[15px] font-bold text-slate-900 truncate">{booking.timeSlot}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-auto">
          {(booking.status === "approved" || booking.status === "pending" || booking.status === "completed") && (
            <Button 
              variant="secondary"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg h-[44px] font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
              onClick={(e) => { e.stopPropagation(); onExpensesClick ? onExpensesClick() : onClick?.(); }}
            >
              <Receipt size={16} />
              จัดการค่าใช้จ่าย
            </Button>
          )}
          <Button 
            className="w-full bg-[#f26522] text-white hover:bg-[#d8561d] rounded-lg h-[44px] font-bold text-sm shadow-sm transition-colors"
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
          >
            ดูรายละเอียด
          </Button>
          <Button 
            variant="outline"
            className="w-full border-slate-200 text-slate-900 hover:bg-slate-50 rounded-lg h-[44px] font-bold text-sm"
            onClick={(e) => { e.stopPropagation(); onEditClick ? onEditClick() : onClick?.(); }}
          >
            แก้ไข
          </Button>
        </div>
      </div>
    </Card>
  );
}

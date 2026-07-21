"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  List,
  MapPin,
  ArrowRight,
  Search,
  Clock,
  Calendar,
  User,
} from "lucide-react";
import BookingCard from "./BookingCard";
import BookingDrawer from "./BookingDrawer";
import { BookingGridSkeleton } from "./BookingSkeleton";
import {
  Booking,
  BOOKING_STATUS_CONFIG,
} from "@/features/booking/types/booking";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookingGridProps {
  filteredBookings: Booking[];
  buildings: string[];
  onResetFilters: () => void;
  onUpdateStatus: (
    id: string,
    status:
      | "pending"
      | "approved"
      | "rejected"
      | "cancelled"
      | "completed",
  ) => void;
  onEdit: (updatedBooking: Booking) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export default function BookingGrid({
  filteredBookings,
  buildings,
  onResetFilters,
  onUpdateStatus,
  onEdit,
  onDelete,
  isLoading = false,
}: BookingGridProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");

  const handleOpenDrawer = (booking: Booking, mode: "view" | "edit" = "view") => {
    setSelectedBooking(booking);
    setDrawerMode(mode);
    setIsDrawerOpen(true);
  };

  if (isLoading) {
    return <BookingGridSkeleton />;
  }

  return (
    <div className="space-y-12 pb-20">
      {buildings.length > 0 ? (
        buildings.map((building) => {
          const items = filteredBookings.filter((b) => b.building === building);
          if (items.length === 0) return null; // Hide empty sections after filtering

          return (
            <div key={building} className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 group">
                  <div className="w-1.5 h-8 bg-[#f26522] rounded-full shadow-[0_0_15px_rgba(242,101,34,0.4)] transition-all group-hover:h-10" />
                  <div className="space-y-0.5">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight text-left">
                      {building}
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        {items.length} Bookings Requested
                      </span>
                    </div>
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-slate-100/80 backdrop-blur-sm rounded-lg p-1 gap-1 border border-slate-200/50 shadow-inner">
                  <ViewToggleButton
                    isActive={viewMode === "grid"}
                    onClick={() => setViewMode("grid")}
                    icon={LayoutGrid}
                  />
                  <ViewToggleButton
                    isActive={viewMode === "list"}
                    onClick={() => setViewMode("list")}
                    icon={List}
                  />
                </div>
              </div>

              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 gap-6">
                  {items.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onClick={() => handleOpenDrawer(booking, "view")}
                      onEditClick={() => handleOpenDrawer(booking, "edit")}
                      onExpensesClick={() => router.push(`/admin/booking/${booking.id}/expenses`)}
                      onUpdateStatus={onUpdateStatus}
                    />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="space-y-4">
                  {items.map((booking) => (
                    <ListRow
                      key={booking.id}
                      booking={booking}
                      onClick={() => handleOpenDrawer(booking)}
                      onUpdateStatus={onUpdateStatus}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-32 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <div className="p-6 bg-white rounded-lg shadow-xl shadow-slate-200 mb-4">
            <Search size={48} className="text-slate-300" />
          </div>
          <p className="text-lg font-bold text-slate-900">
            ไม่พบคำขอจองที่ตรงเงื่อนไข
          </p>
          <p className="text-sm text-slate-400">
            ลองปรับการค้นหาหรือล้างตัวกรอง
          </p>
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="mt-6 rounded-[7px] border-slate-200 text-slate-600 font-bold cursor-pointer"
          >
            ล้างตัวกรองทั้งหมด
          </Button>
        </div>
      )}

      {/* If buildings have elements but filtered result is 0 */}
      {buildings.length > 0 && filteredBookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <div className="p-6 bg-white rounded-lg shadow-xl shadow-slate-200 mb-4">
            <Search size={48} className="text-slate-300" />
          </div>
          <p className="text-lg font-bold text-slate-900">
            ไม่พบคำขอจองที่ตรงเงื่อนไข
          </p>
          <p className="text-sm text-slate-400">
            ลองปรับการค้นหาหรือล้างตัวกรอง
          </p>
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="mt-6 rounded-[7px] border-slate-200 text-slate-600 font-bold cursor-pointer"
          >
            ล้างตัวกรองทั้งหมด
          </Button>
        </div>
      )}

      <BookingDrawer
        booking={
          selectedBooking
            ? filteredBookings.find((b) => b.id === selectedBooking.id) ||
              selectedBooking
            : null
        }
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateStatus={onUpdateStatus}
        onEdit={onEdit}
        onDelete={onDelete}
        initialMode={drawerMode}
      />
    </div>
  );
}

function ViewToggleButton({
  isActive,
  onClick,
  icon: Icon,
}: {
  isActive: boolean;
  onClick: () => void;
  icon: React.ElementType;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-1.5 rounded-md transition-all duration-300 cursor-pointer",
        isActive
          ? "bg-white text-[#f26522] shadow-md shadow-slate-200 scale-105"
          : "text-slate-400 hover:text-slate-600 hover:bg-white/50",
      )}
    >
      <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
    </button>
  );
}

function ListRow({
  booking,
  onClick,
  onUpdateStatus,
}: {
  booking: Booking;
  onClick: () => void;
  onUpdateStatus?: (
    id: string,
    status: "pending" | "approved" | "rejected" | "cancelled" | "completed"
  ) => void;
}) {
  const status =
    BOOKING_STATUS_CONFIG[booking.status] || BOOKING_STATUS_CONFIG.pending;

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg border border-slate-100 p-5",
        "flex items-center gap-6 cursor-pointer group transition-all duration-300",
        "hover:shadow-xl hover:shadow-slate-200/50 hover:border-[#f26522]/20 hover:translate-x-1",
      )}
    >
      <div className="relative size-20 rounded-md overflow-hidden shrink-0 shadow-sm">
        <img
          src={booking.image}
          alt={booking.roomName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
      </div>

      <div className="flex-1 min-w-0 space-y-1 text-left">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#f26522] flex items-center gap-1.5">
          <MapPin size={12} strokeWidth={3} /> {booking.category}
        </p>
        <h3 className="text-xl font-bold text-slate-900 truncate group-hover:text-[#f26522] transition-colors leading-tight">
          {booking.roomName}
        </h3>
        <p className="text-xs text-slate-400 font-bold truncate">
          โดย: {booking.requesterName} (ID: {booking.requesterId})
        </p>
      </div>

      <div className="hidden lg:flex items-center gap-12 shrink-0 px-8 border-x border-slate-100">
        <ListInfoItem
          icon={Calendar}
          label="วันที่ใช้ห้อง"
          value={booking.date}
        />
        <ListInfoItem icon={Clock} label="เวลา" value={booking.timeSlot} />
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            สถานะ
          </p>
          <div onClick={(e) => e.stopPropagation()} className="inline-block mt-0.5">
            <Select
              value={booking.status}
              onValueChange={(val) => {
                onUpdateStatus?.(booking.id, val as any);
              }}
            >
              <SelectTrigger
                className={cn(
                  "h-auto px-2 py-0.5 min-h-[22px] rounded-[4px] border focus:ring-0 focus:ring-offset-0 cursor-pointer flex items-center shadow-none text-[9px] font-black uppercase tracking-wider shrink-0 w-fit mx-auto",
                  status.gridBg,
                  status.gridText,
                  "[&>svg]:size-3 [&>svg]:ml-1"
                )}
              >
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent className="bg-white z-[200]">
                <SelectItem value="pending" className="text-xs font-bold text-amber-700 focus:bg-amber-50">
                  <div className="flex items-center gap-1.5"><div className="size-1.5 rounded-full bg-amber-500" /><span>รออนุมัติ</span></div>
                </SelectItem>
                <SelectItem value="approved" className="text-xs font-bold text-emerald-700 focus:bg-emerald-50">
                  <div className="flex items-center gap-1.5"><div className="size-1.5 rounded-full bg-emerald-500" /><span>อนุมัติ</span></div>
                </SelectItem>
                <SelectItem value="rejected" className="text-xs font-bold text-red-600 focus:bg-red-50">
                  <div className="flex items-center gap-1.5"><div className="size-1.5 rounded-full bg-red-500" /><span>ปฏิเสธ</span></div>
                </SelectItem>
                <SelectItem value="completed" className="text-xs font-bold text-teal-700 focus:bg-teal-50">
                  <div className="flex items-center gap-1.5"><div className="size-1.5 rounded-full bg-teal-500" /><span>เสร็จสิ้น</span></div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <button
        className={cn(
          "shrink-0 size-12 rounded-md bg-slate-50 text-slate-400 cursor-pointer",
          "group-hover:bg-[#f26522] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#f26522]/30",
          "transition-all duration-300 flex items-center justify-center",
        )}
      >
        <ArrowRight
          size={20}
          strokeWidth={2.5}
          className="transition-transform group-hover:translate-x-1"
        />
      </button>
    </div>
  );
}

function ListInfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="text-center space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 justify-center">
        <Icon size={10} />
        {label}
      </p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}

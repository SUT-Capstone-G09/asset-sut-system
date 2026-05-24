"use client"

import React, { useState } from "react";
import { LayoutGrid, List, MapPin, ArrowRight, Search, Users } from "lucide-react";
import RoomCard from "./RoomCard";
import RoomDrawer from "./RoomDrawer";
import { Room } from "@/features/booking/types/room";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RoomGridProps {
  filteredRooms: Room[];
  buildings: string[];
  onResetFilters: () => void;
  onUpdateStatus: (id: string, status: "available" | "maintenance") => void;
  onEdit: (updatedRoom: Room) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export default function RoomGrid({ 
  filteredRooms, 
  buildings,
  onResetFilters,
  onUpdateStatus,
  onEdit,
  onDelete,
  isLoading = false
}: RoomGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenDrawer = (room: Room) => {
    setSelectedRoom(room);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-12 pb-20">
      {buildings.length > 0 ? (
        buildings.map((building) => {
          const items = filteredRooms.filter((r) => r.building === building);
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
                        {items.length} ห้องในอาคารนี้
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
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 justify-items-center">
                  {items.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onClick={() => handleOpenDrawer(room)}
                    />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="space-y-4">
                  {items.map((room) => (
                    <ListRow
                      key={room.id}
                      room={room}
                      onClick={() => handleOpenDrawer(room)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })
      ) : (
        /* Empty State */
        <EmptyState onResetFilters={onResetFilters} />
      )}

      {/* If buildings have elements but filtered result is 0 */}
      {buildings.length > 0 && filteredRooms.length === 0 && (
        <EmptyState onResetFilters={onResetFilters} />
      )}

      <RoomDrawer
        room={selectedRoom}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateStatus={onUpdateStatus}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

function ViewToggleButton({ isActive, onClick, icon: Icon }: { isActive: boolean; onClick: () => void; icon: React.ElementType }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-1.5 rounded-md transition-all duration-300 cursor-pointer",
        isActive
          ? "bg-white text-[#f26522] shadow-md shadow-slate-200 scale-105"
          : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
      )}
    >
      <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
    </button>
  );
}

const statusConfig = {
  available: {
    label: "ใช้งานได้",
    text: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-100",
  },
  maintenance: {
    label: "ปิดปรับปรุง",
    text: "text-red-600",
    bg: "bg-red-50 border-red-100",
  },
};

function ListRow({ room, onClick }: { room: Room; onClick: () => void }) {
  const status = statusConfig[room.status] || statusConfig.available;

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg border border-slate-100 p-5",
        "flex items-center gap-6 cursor-pointer group transition-all duration-300",
        "hover:shadow-xl hover:shadow-slate-200/50 hover:border-[#f26522]/20 hover:-translate-x-1"
      )}
    >
      <div className="relative size-20 rounded-md overflow-hidden shrink-0 shadow-sm">
        <img
          src={room.image}
          alt={room.roomName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
      </div>

      <div className="flex-1 min-w-0 space-y-1 text-left">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#f26522] flex items-center gap-1.5">
          <MapPin size={12} strokeWidth={3} /> {room.category}
        </p>
        <h3 className="text-xl font-bold text-slate-900 truncate group-hover:text-[#f26522] transition-colors leading-tight">
          {room.roomName}
        </h3>
        <p className="text-xs text-slate-400 font-bold truncate">
          รหัสห้อง: {room.roomNumber}
        </p>
      </div>

      <div className="hidden lg:flex items-center gap-12 shrink-0 px-8 border-x border-slate-100">
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 justify-center">
            <Users size={10} />
            ความจุ
          </p>
          <p className="text-sm font-bold text-slate-700">
            {room.capacity} ที่นั่ง
          </p>
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">สถานะห้อง</p>
          <span className={cn("px-2.5 py-0.5 rounded-[4px] border text-[9px] font-black uppercase tracking-wider shrink-0", status.bg, status.text)}>
            {status.label}
          </span>
        </div>
      </div>

      <button className={cn(
        "shrink-0 size-12 rounded-md bg-slate-50 text-slate-400 cursor-pointer",
        "group-hover:bg-[#f26522] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#f26522]/30",
        "transition-all duration-300 flex items-center justify-center"
      )}>
        <ArrowRight size={20} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}

function EmptyState({ onResetFilters }: { onResetFilters: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
      <div className="p-6 bg-white rounded-lg shadow-xl shadow-slate-200 mb-4">
        <Search size={48} className="text-slate-300" />
      </div>
      <p className="text-lg font-bold text-slate-900">ไม่พบห้องที่ตรงเงื่อนไข</p>
      <p className="text-sm text-slate-400">ลองปรับการค้นหาหรือล้างตัวกรอง</p>
      <Button 
        variant="outline" 
        onClick={onResetFilters}
        className="mt-6 rounded-[7px] border-slate-200 text-slate-600 font-bold cursor-pointer"
      >
        ล้างตัวกรองทั้งหมด
      </Button>
    </div>
  );
}

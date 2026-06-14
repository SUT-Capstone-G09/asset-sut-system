"use client";

import { ChevronDown, LayoutGrid, List } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RoomCard from "@/features/bookings/components/RoomCard";
import { Room, SortOption, ViewMode } from "@/features/bookings/types";
import { cn } from "@/lib/utils";

interface RoomResultsListProps {
  rooms: Room[];
  sortBy: SortOption;
  onSortChange: (v: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  dayCount: number;
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "ราคาต่ำสุด", value: "price_asc" },
  { label: "ราคาสูงสุด", value: "price_desc" },
  { label: "ความจุมากสุด", value: "capacity" },
];

export default function RoomResultsList({
  rooms,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  dayCount,
}: RoomResultsListProps) {
  const currentSort = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "";

  return (
    <div className="mt-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">ห้องที่ว่าง</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            พบ <span className="font-semibold text-gray-700">{rooms.length} ห้อง</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="whitespace-nowrap">เรียงตาม:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white hover:border-gray-300 hover:text-gray-900 transition-colors cursor-pointer outline-none">
                  {currentSort}
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 p-1">
                {SORT_OPTIONS.map((o) => (
                  <DropdownMenuItem
                    key={o.value}
                    onClick={() => onSortChange(o.value)}
                    className={cn(
                      "cursor-pointer rounded-md px-3 py-2 text-sm transition-colors",
                      sortBy === o.value
                        ? "text-brand-primary font-medium bg-brand-primary/5"
                        : "text-gray-700"
                    )}
                  >
                    {o.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* View Toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "p-2 transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-brand-primary text-white"
                  : "bg-white text-gray-400 hover:text-gray-600"
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={cn(
                "p-2 transition-colors border-l border-gray-200 cursor-pointer",
                viewMode === "list"
                  ? "bg-brand-primary text-white"
                  : "bg-white text-gray-400 hover:text-gray-600"
              )}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {rooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center text-center">
          <p className="text-gray-400 text-lg font-medium">ไม่พบห้องที่ตรงกับเงื่อนไข</p>
          <p className="text-gray-400 text-sm mt-1">ลองปรับจำนวนคนหรือวันที่ใหม่</p>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              : "flex flex-col gap-4"
          )}
        >
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} dayCount={dayCount} />
          ))}
        </div>
      )}
    </div>
  );
}

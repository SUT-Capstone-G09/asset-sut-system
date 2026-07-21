"use client"

import React from "react";
import { Search, Filter, RotateCcw, LayoutGrid, List, Map } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AREA_CATEGORIES } from "../../constants";
import { cn } from "@/lib/utils";

interface AreaFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  onReset: () => void;
  categories?: { value: string; label: string }[];
  viewMode: "grid" | "list" | "map";
  setViewMode: (mode: "grid" | "list" | "map") => void;
  showCategoryFilter?: boolean;
  showStatusFilter?: boolean;
  hasFloorPlan?: boolean;
}

export default function AreaFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  onReset,
  categories,
  viewMode,
  setViewMode,
  showCategoryFilter = true,
  showStatusFilter = true,
  hasFloorPlan = false,
}: AreaFiltersProps) {
  const hasActiveFilters =
    searchQuery ||
    (showCategoryFilter && selectedCategory !== "all") ||
    (showStatusFilter && selectedStatus !== "all");

  // ใช้ categories ที่ส่งเข้ามาแบบ dynamic หรือ fallback ไปหาค่า static ใน constant
  const displayCategories = categories || (AREA_CATEGORIES as unknown as { value: string; label: string }[]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-card p-4 rounded-md border border-border/50 shadow-sm">
      {/* Left Section: Search and Filters */}
      <div className="flex flex-col sm:flex-row flex-1 gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อสถานที่, ผู้เช่า หรือเลขที่ห้อง..."
            className="w-full pl-10 pr-4 py-2 border border-border/80 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm bg-background h-10"
          />
        </div>

        {/* Category Filter */}
        {showCategoryFilter && (
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-md border-border/80 bg-background text-sm h-10 gap-2">
              <Filter size={14} className="text-muted-foreground shrink-0" />
              <SelectValue placeholder="ทุกประเภท" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="rounded-md">
              <SelectItem value="all">ทุกประเภท</SelectItem>
              {displayCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Status Filter */}
        {showStatusFilter && (
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-md border-border/80 bg-background text-sm h-10 gap-2">
              <Filter size={14} className="text-muted-foreground shrink-0" />
              <SelectValue placeholder="ทุกสถานะ" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="rounded-md">
              <SelectItem value="all">ทุกสถานะ</SelectItem>
              <SelectItem value="available">ว่างอยู่</SelectItem>
              <SelectItem value="occupied">มีผู้เช่า</SelectItem>
              <SelectItem value="maintenance">ปิดซ่อมบำรุง</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Right Section: View Mode & Reset Filters Button */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        {/* View Toggle */}
        <div className="flex items-center bg-slate-100/80 backdrop-blur-sm rounded-md p-1 gap-1 border border-slate-200/50 shadow-inner h-10 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            title="Grid view"
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-md transition-all duration-200",
              viewMode === "grid"
                ? "bg-[#f26522] text-white shadow-sm font-black"
                : "text-muted-foreground hover:text-foreground hover:bg-slate-200/80"
            )}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            title="List view"
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-md transition-all duration-200",
              viewMode === "list"
                ? "bg-[#f26522] text-white shadow-sm font-black"
                : "text-muted-foreground hover:text-foreground hover:bg-slate-200/80"
            )}
          >
            <List size={15} />
          </button>
          {hasFloorPlan && (
            <button
              type="button"
              onClick={() => setViewMode("map")}
              title="Floor Plan view"
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-md transition-all duration-200",
                viewMode === "map"
                  ? "bg-[#f26522] text-white shadow-sm font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-slate-200/80"
              )}
            >
              <Map size={15} />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            title="ล้างตัวกรอง"
            className="size-10 flex items-center justify-center text-muted-foreground bg-background border border-border/80 rounded-md hover:bg-slate-50 hover:text-foreground transition-colors shrink-0"
          >
            <RotateCcw size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

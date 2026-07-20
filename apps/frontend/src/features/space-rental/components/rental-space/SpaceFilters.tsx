"use client";

import React from "react";
import { Search, Filter, RotateCcw, LayoutGrid, List, Map, Building2, Briefcase } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMMERCIAL_CATEGORIES, CommercialCategoryType } from "../../constants";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useAreasDashboard } from "../../hooks/useAreasDashboard";

interface AreaFiltersProps {
  searchQuery?: string;
  setSearchQuery?: (val: string) => void;
  selectedCategory?: string;
  setSelectedCategory?: (val: string) => void;
  categories?: { value: string; label: string }[];
  selectedBuilding?: string;
  onSelectBuilding?: (val: string) => void;
  buildingOptions?: { value: string; label: string }[];
  selectedBusinessType?: CommercialCategoryType | "all";
  onSelectBusinessType?: (val: CommercialCategoryType | "all") => void;
  selectedStatus?: string;
  setSelectedStatus?: (val: string) => void;
  onReset?: () => void;
  viewMode?: "grid" | "list" | "map";
  setViewMode?: (mode: "grid" | "list" | "map") => void;
  showCategoryFilter?: boolean;
  showBuildingFilter?: boolean;
  showBusinessTypeFilter?: boolean;
  showStatusFilter?: boolean;
  hasFloorPlan?: boolean;
}

export default function AreaFilters(props: AreaFiltersProps) {
  // ดึงค่าเริ่มต้นจาก Hook ประจำหน้า Dashboard (URL Search Params)
  const dashboard = useAreasDashboard();

  // Smart Fallback: ใช้ค่าจาก Props หากถูกส่งมา override (สำหรับ Unit Test หรือ Modal) 
  // หากไม่ถูกส่งมา ให้ใช้ State ปัจจุบันจาก URL โดยอัตโนมัติ
  const searchQuery = props.searchQuery ?? dashboard.searchQuery;
  const setSearchQuery = props.setSearchQuery ?? dashboard.setSearchQuery;

  const selectedCategory = props.selectedCategory ?? dashboard.selectedTypeFilter;
  const setSelectedCategory = props.setSelectedCategory ?? dashboard.setSelectedTypeFilter;
  const categories = props.categories ?? dashboard.dynamicCategories;

  const selectedBuilding = props.selectedBuilding ?? dashboard.selectedBuildingFilter;
  const onSelectBuilding = props.onSelectBuilding ?? dashboard.handleSelectBuilding;
  const buildingOptions = props.buildingOptions ?? dashboard.buildingOptions;

  const selectedBusinessType = props.selectedBusinessType ?? dashboard.selectedBusinessTypeFilter;
  const onSelectBusinessType = props.onSelectBusinessType ?? dashboard.handleSelectBusinessType;

  const selectedStatus = props.selectedStatus ?? dashboard.selectedStatusFilter;
  const setSelectedStatus = props.setSelectedStatus ?? dashboard.setSelectedStatusFilter;

  const viewMode = props.viewMode ?? dashboard.viewMode;
  const setViewMode = props.setViewMode ?? dashboard.setViewMode;
  const onReset = props.onReset ?? dashboard.handleResetFilters;

  const showCategoryFilter = props.showCategoryFilter ?? true;
  const showBuildingFilter = props.showBuildingFilter ?? true;
  const showBusinessTypeFilter = props.showBusinessTypeFilter ?? true;
  const showStatusFilter = props.showStatusFilter ?? true;
  const hasFloorPlan = props.hasFloorPlan ?? false;

  const hasActiveFilters =
    searchQuery ||
    (showCategoryFilter && selectedCategory !== "all") ||
    (showBuildingFilter && selectedBuilding !== "all") ||
    (showBusinessTypeFilter && selectedBusinessType !== "all") ||
    (showStatusFilter && selectedStatus !== "all");

  return (
    <div className="flex flex-col gap-3 bg-card p-4 rounded-md border border-border/50 shadow-sm">
      {/* Row 1: Search + View Toggle + Reset */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="ค้นหาชื่อพื้นที่, ผู้เช่า, รหัสพื้นที่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background rounded-md h-10 border-border/80 text-sm focus-visible:ring-1"
          />
        </div>

        {/* View Mode Toggle & Reset */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="มุมมองการ์ด"
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-md transition-all duration-200 cursor-pointer",
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
              title="มุมมองรายการ"
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-md transition-all duration-200 cursor-pointer",
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
                title="มุมมองผังอาคาร"
                className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-md transition-all duration-200 cursor-pointer",
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
              className="size-10 flex items-center justify-center text-muted-foreground bg-background border border-border/80 rounded-md hover:bg-slate-50 hover:text-foreground transition-colors shrink-0 cursor-pointer"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Filter Dropdowns */}
      <div className="flex flex-wrap gap-2">
        {/* Building filter */}
        {showBuildingFilter && (
          <Select value={selectedBuilding} onValueChange={onSelectBuilding}>
            <SelectTrigger
              className={cn(
                "w-full sm:w-[200px] rounded-md border-border/80 bg-background text-sm h-10 gap-2 cursor-pointer",
                selectedBuilding !== "all" && "border-[#f26522]/50 bg-[#f26522]/5 text-[#f26522]"
              )}
            >
              <Building2 size={14} className="shrink-0 text-current" />
              <SelectValue placeholder="เลือกอาคาร..." />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="rounded-md max-h-60">
              <SelectItem value="all">ทุกอาคาร</SelectItem>
              {buildingOptions.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Business Type filter */}
        {showBusinessTypeFilter && (
          <Select
            value={selectedBusinessType}
            onValueChange={(val) => onSelectBusinessType(val as CommercialCategoryType | "all")}
          >
            <SelectTrigger
              className={cn(
                "w-full sm:w-[200px] rounded-md border-border/80 bg-background text-sm h-10 gap-2 cursor-pointer",
                selectedBusinessType !== "all" && "border-[#f26522]/50 bg-[#f26522]/5 text-[#f26522]"
              )}
            >
              <Briefcase size={14} className="shrink-0 text-current" />
              <SelectValue placeholder="ทุกประเภทธุรกิจ" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="rounded-md">
              <SelectItem value="all">ทุกประเภทธุรกิจ</SelectItem>
              {COMMERCIAL_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Building type group filter (เดิม) */}
        {showCategoryFilter && (
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-md border-border/80 bg-background text-sm h-10 gap-2 cursor-pointer">
              <Filter size={14} className="text-muted-foreground shrink-0" />
              <SelectValue placeholder="ทุกประเภทอาคาร" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="rounded-md">
              <SelectItem value="all">ทุกประเภทอาคาร</SelectItem>
              {(categories ?? []).map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Status filter */}
        {showStatusFilter && (
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[150px] rounded-md border-border/80 bg-background text-sm h-10 gap-2 cursor-pointer">
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
    </div>
  );
}

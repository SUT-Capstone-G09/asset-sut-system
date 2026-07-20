"use client";

import React from "react";
import { Search, ListFilter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockBuildings, mockBuildingTypes } from "@/features/space-rental/data/mock-buildings";

export interface TenantFilterState {
  search: string;
  buildingTypeId: string; // "all" or stringified number
  buildingId: string;     // "all" or stringified number
}

interface TenantSearchBarProps {
  filters: TenantFilterState;
  onChange: (filters: TenantFilterState) => void;
}

export function TenantSearchBar({ filters, onChange }: TenantSearchBarProps) {
  // Filter buildings by selected type
  const filteredBuildings =
    filters.buildingTypeId === "all"
      ? mockBuildings
      : mockBuildings.filter(
          (b) => b.building_type_id === Number(filters.buildingTypeId)
        );

  const handleTypeChange = (val: string) => {
    // Reset building selection when type changes
    onChange({ ...filters, buildingTypeId: val, buildingId: "all" });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <Input
          type="text"
          placeholder="ค้นหาชื่อสถานที่, ผู้เช่า หรือเลขที่ห้อง..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-10 h-10 rounded-md border-slate-200 bg-white text-sm"
        />
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-slate-200 shrink-0" />

      {/* Building Type Filter */}
      <div className="flex items-center gap-1.5 shrink-0">
        <ListFilter size={14} className="text-slate-400 shrink-0" />
        <Select value={filters.buildingTypeId} onValueChange={handleTypeChange}>
          <SelectTrigger className="h-10 min-w-[130px] rounded-md border-slate-200 bg-white text-sm text-slate-600 focus:ring-orange-500/20">
            <SelectValue placeholder="อาคารทั้งหมด" />
          </SelectTrigger>
          <SelectContent className="rounded-md">
            <SelectItem value="all">อาคารทั้งหมด</SelectItem>
            {mockBuildingTypes.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-slate-200 shrink-0" />

      {/* Building (สถานที่) Filter */}
      <div className="flex items-center gap-1.5 shrink-0">
        <ListFilter size={14} className="text-slate-400 shrink-0" />
        <Select
          value={filters.buildingId}
          onValueChange={(val) => onChange({ ...filters, buildingId: val })}
        >
          <SelectTrigger className="h-10 min-w-[150px] rounded-md border-slate-200 bg-white text-sm text-slate-600 focus:ring-orange-500/20">
            <SelectValue placeholder="พื้นที่ทั้งหมด" />
          </SelectTrigger>
          <SelectContent className="rounded-md">
            <SelectItem value="all">พื้นที่ทั้งหมด</SelectItem>
            {filteredBuildings.map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

"use client"

import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RoomFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  selectedBuilding: string;
  setSelectedBuilding: (val: string) => void;
  categories: string[];
  buildings: string[];
  onReset: () => void;
}

interface FilterOption {
  value: string;
  label: string;
}

// dropdown ตัวกรอง → combobox (พิมพ์ค้นหาได้) ; label อาจต่างจาก value (เช่นสถานะ) เลย map ผ่าน label
function FilterCombobox({
  value,
  onChange,
  options,
  placeholder,
  widthClass,
}: {
  value: string;
  onChange: (v: string) => void;
  options: FilterOption[];
  placeholder: string;
  widthClass: string;
}) {
  const labels = options.map((o) => o.label);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? null;
  return (
    <div className={cn("w-full text-left", widthClass)}>
      <Combobox
        items={labels}
        value={selectedLabel}
        onValueChange={(label) => {
          const opt = options.find((o) => o.label === label);
          onChange(opt ? opt.value : "all");
        }}
      >
        <ComboboxInput
          placeholder={placeholder}
          className="h-11 w-full rounded-[7px] bg-slate-50"
        />
        <ComboboxContent>
          <ComboboxEmpty>ไม่พบรายการ</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export default function RoomFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  selectedBuilding,
  setSelectedBuilding,
  categories,
  buildings,
  onReset,
}: RoomFiltersProps) {
  const categoryOptions: FilterOption[] = [
    { value: "all", label: "ทุกประเภทห้อง" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];
  const buildingOptions: FilterOption[] = [
    { value: "all", label: "ทุกอาคาร" },
    ...buildings.map((b) => ({ value: b, label: b })),
  ];
  const statusOptions: FilterOption[] = [
    { value: "all", label: "ทุกสถานะห้อง" },
    { value: "available", label: "ใช้งานได้" },
    { value: "maintenance", label: "ปิดปรับปรุง" },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-4 items-center bg-white p-4 rounded-[7px] shadow-sm border border-slate-100 w-full">
      {/* Search Input */}
      <div className="relative flex-1 w-full text-left">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input
          placeholder="ค้นหาห้อง, รหัสห้อง, รายละเอียด..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-slate-50 border-none rounded-[7px] focus-visible:ring-1 focus-visible:ring-[#f26522]/30 w-full"
        />
      </div>

      {/* Category Filter */}
      <FilterCombobox
        value={selectedCategory}
        onChange={setSelectedCategory}
        options={categoryOptions}
        placeholder="ทุกประเภทห้อง"
        widthClass="xl:w-48"
      />

      {/* Building Filter */}
      <FilterCombobox
        value={selectedBuilding}
        onChange={setSelectedBuilding}
        options={buildingOptions}
        placeholder="ทุกอาคาร"
        widthClass="xl:w-56"
      />

      {/* Status Filter */}
      <FilterCombobox
        value={selectedStatus}
        onChange={setSelectedStatus}
        options={statusOptions}
        placeholder="ทุกสถานะห้อง"
        widthClass="xl:w-40"
      />

      {/* Reset Button */}
      <Button
        variant="ghost"
        onClick={onReset}
        className="h-11 px-4 text-slate-400 hover:text-[#f26522] hover:bg-[#f26522]/5 rounded-[7px] gap-2 transition-all shrink-0 cursor-pointer w-full xl:w-auto"
      >
        <RotateCcw size={16} />
        <span className="text-xs font-bold uppercase tracking-wider">ล้างตัวกรอง</span>
      </Button>
    </div>
  );
}

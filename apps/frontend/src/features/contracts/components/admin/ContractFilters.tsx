import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContractFiltersProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedArea: string;
  onAreaChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedBusinessType: string;
  onBusinessTypeChange: (value: string) => void;
  selectedYear: string;
  onYearChange: (value: string) => void;
  onResetFilters: () => void;
  areaOptions: { id: string; name: string }[];
}

export default function ContractFilters({
  searchTerm,
  onSearchTermChange,
  selectedArea,
  onAreaChange,
  selectedStatus,
  onStatusChange,
  selectedBusinessType,
  onBusinessTypeChange,
  selectedYear,
  onYearChange,
  onResetFilters,
  areaOptions,
}: ContractFiltersProps) {
  const hasActiveFilters =
    searchTerm ||
    selectedArea !== "all" ||
    selectedStatus !== "all" ||
    selectedBusinessType !== "all" ||
    selectedYear !== "all";

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-card p-4 rounded-[7px] border border-border/50 shadow-sm">
      {/* Left Section: Search and Filter Selects */}
      <div className="flex flex-col sm:flex-row flex-1 gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Search size={16} />
          </div>
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="ค้นหาเลขที่สัญญา, ชื่อผู้ประกอบการ, แบรนด์..."
            variant="brand"
            className="pl-10 pr-4 h-10"
          />
        </div>

        {/* Area Filter */}
        <Select value={selectedArea} onValueChange={onAreaChange}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-[7px] border-border/80 bg-background text-sm h-10 gap-2">
            <SelectValue placeholder="ทั้งหมด ทุกพื้นที่" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4} className="rounded-[7px]">
            <SelectItem value="all">ทั้งหมด ทุกพื้นที่</SelectItem>
            {areaOptions.map((area) => (
              <SelectItem key={area.id} value={area.id}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-[7px] border-border/80 bg-background text-sm h-10 gap-2">
            <SelectValue placeholder="ทุกสถานะ" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4} className="rounded-[7px]">
            <SelectItem value="all">ทุกสถานะ</SelectItem>
            <SelectItem value="active">ใช้งานปกติ (Active)</SelectItem>
            <SelectItem value="expiring">ใกล้หมดสัญญา (Expiring)</SelectItem>
            <SelectItem value="expired">หมดอายุ (Expired)</SelectItem>
            <SelectItem value="terminated">ยกเลิกแล้ว (Terminated)</SelectItem>
          </SelectContent>
        </Select>

        {/* Business Type Filter */}
        <Select value={selectedBusinessType} onValueChange={onBusinessTypeChange}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-[7px] border-border/80 bg-background text-sm h-10 gap-2">
            <SelectValue placeholder="ทุกประเภทธุรกิจ" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4} className="rounded-[7px]">
            <SelectItem value="all">ทุกประเภทธุรกิจ</SelectItem>
            <SelectItem value="อาหารและเครื่องดื่ม">อาหารและเครื่องดื่ม</SelectItem>
            <SelectItem value="ขนมหวาน">ขนมหวาน</SelectItem>
            <SelectItem value="ร้านสะดวกซื้อ">ร้านสะดวกซื้อ</SelectItem>
            <SelectItem value="เครื่องดื่ม">เครื่องดื่ม</SelectItem>
            <SelectItem value="บริการ">บริการ</SelectItem>
          </SelectContent>
        </Select>

        {/* Year Filter */}
        <Select value={selectedYear} onValueChange={onYearChange}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-[7px] border-border/80 bg-background text-sm h-10 gap-2">
            <SelectValue placeholder="ทุกปีเริ่มต้น" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4} className="rounded-[7px]">
            <SelectItem value="all">ทุกปีเริ่มต้น</SelectItem>
            <SelectItem value="2023">2023 (พ.ศ. 2566)</SelectItem>
            <SelectItem value="2024">2024 (พ.ศ. 2567)</SelectItem>
            <SelectItem value="2025">2025 (พ.ศ. 2568)</SelectItem>
            <SelectItem value="2026">2026 (พ.ศ. 2569)</SelectItem>
            <SelectItem value="2027">2027 (พ.ศ. 2570)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Right Section: Reset Button */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="outline"
          onClick={onResetFilters}
          title="ล้างตัวกรอง"
          className="size-10 flex items-center justify-center shrink-0 cursor-pointer"
        >
          <RotateCcw size={15} />
        </Button>
      )}
    </div>
  );
}

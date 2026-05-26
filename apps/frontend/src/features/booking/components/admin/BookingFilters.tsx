"use client"

import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface BookingFiltersProps {
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

export default function BookingFilters({
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
  onReset
}: BookingFiltersProps) {
  return (
    <div className="flex flex-col xl:flex-row gap-4 items-center bg-white p-4 rounded-[7px] shadow-sm border border-slate-100 w-full">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input 
          placeholder="ค้นหาห้องเรียน, รหัสห้อง, ชื่อผู้ขอ หรือจุดประสงค์..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-slate-50 border-none rounded-[7px] focus-visible:ring-1 focus-visible:ring-[#f26522]/30 w-full"
        />
      </div>

      {/* Dynamic Category Filter */}
      <div className="w-full xl:w-48">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="h-11 bg-slate-50 border-none rounded-[7px] focus:ring-1 focus:ring-[#f26522]/30">
            <SelectValue placeholder="ทุกประเภทห้อง" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกประเภทห้อง</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dynamic Building Filter */}
      <div className="w-full xl:w-56">
        <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
          <SelectTrigger className="h-11 bg-slate-50 border-none rounded-[7px] focus:ring-1 focus:ring-[#f26522]/30">
            <SelectValue placeholder="ทุกอาคาร" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกอาคาร</SelectItem>
            {buildings.map((bldg) => (
              <SelectItem key={bldg} value={bldg}>
                {bldg}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="w-full xl:w-40">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="h-11 bg-slate-50 border-none rounded-[7px] focus:ring-1 focus:ring-[#f26522]/30">
            <SelectValue placeholder="ทุกสถานะการจอง" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกสถานะการจอง</SelectItem>
            <SelectItem value="pending">รออนุมัติ</SelectItem>
            <SelectItem value="pending_payment">รอชำระเงิน</SelectItem>
            <SelectItem value="verifying_payment">รอตรวจสอบการชำระเงิน</SelectItem>
            <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
            <SelectItem value="rejected">ปฏิเสธ</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

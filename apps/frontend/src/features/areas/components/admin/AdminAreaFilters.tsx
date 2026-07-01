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
import { AREA_CATEGORIES } from "../../constants";

interface AdminAreaFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  onReset: () => void;
}

export default function AdminAreaFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onReset
}: AdminAreaFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-[7px] shadow-sm border border-slate-100">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input 
          placeholder="ค้นหาชื่อสถานที่ หรือเลขที่ห้อง..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-slate-50 border-none rounded-[7px] focus-visible:ring-1 focus-visible:ring-[#f26522]/30"
        />
      </div>

      {/* Category Filter */}
      <div className="w-full md:w-64">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="h-11 bg-slate-50 border-none rounded-[7px] focus:ring-1 focus:ring-[#f26522]/30">
            <SelectValue placeholder="ทุกประเภทพื้นที่" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกประเภทพื้นที่</SelectItem>
            {AREA_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      <Button 
        variant="ghost" 
        onClick={onReset}
        className="h-11 px-4 text-slate-400 hover:text-[#f26522] hover:bg-[#f26522]/5 rounded-[7px] gap-2 transition-all"
      >
        <RotateCcw size={16} />
        <span className="text-xs font-bold uppercase tracking-wider">ล้างตัวกรอง</span>
      </Button>
    </div>
  );
}
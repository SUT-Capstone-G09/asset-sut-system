"use client"

import React, { useState } from "react";
import { Search, RotateCcw, ChevronDown, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminAreaFilters() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div 
      className={cn(
        "bg-white p-2.5 rounded-[28px] border border-slate-100",
        "shadow-sm flex flex-col md:flex-row items-center gap-3"
      )}
    >
      {/* Search Bar */}
      <div className="relative flex-1 w-full">
        <Search 
          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 size-4 transition-colors group-focus-within:text-[#f26522]" 
        />
        <Input 
          placeholder="ค้นหาอาคาร / ห้อง / ชื่อพื้นที่..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={cn(
            "h-14 pl-12 pr-6 bg-slate-50 border-none rounded-[22px] text-sm font-medium",
            "focus-visible:ring-2 focus-visible:ring-[#f26522]/20 focus-visible:bg-white",
            "transition-all duration-300 placeholder:text-slate-400"
          )}
        />
      </div>

      {/* Selectors Group */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Building Selector */}
        <FilterButton label="อาคาร" value="ทั้งหมด" />
        
        {/* Status Selector */}
        <FilterButton label="สถานะ" value="ทั้งหมด" />

        {/* Reset Button */}
        <Button 
          variant="ghost" 
          onClick={() => setSearchTerm("")}
          className={cn(
            "h-14 px-6 rounded-[22px] gap-2 font-bold",
            "text-slate-400 hover:text-[#f26522] hover:bg-[#f26522]/5",
            "transition-all duration-300 active:scale-95"
          )}
        >
          <RotateCcw className="size-4" />
          <span className="hidden sm:inline">รีเซ็ต</span>
        </Button>
      </div>
    </div>
  );
}

function FilterButton({ label, value }: { label: string; value: string }) {
  return (
    <button
      className={cn(
        `
        h-12 px-4
        inline-flex items-center gap-3
        rounded-xl
        border border-gray-200
        bg-white
        transition-colors
        hover:bg-gray-50
        `
      )}
    >
      <div className="text-left leading-tight">
        <div className="text-[10px] font-medium text-gray-400">
          {label}
        </div>

        <div className="text-sm font-medium text-gray-900">
          {value}
        </div>
      </div>

      <ChevronDown className="size-4 text-gray-400" />
    </button>
  );
}
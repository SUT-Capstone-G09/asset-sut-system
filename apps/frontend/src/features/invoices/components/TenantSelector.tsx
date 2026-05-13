"use client";

import React, { useState, useMemo } from "react";
import { Search, MapPin, Store, CheckCircle2, ChevronRight, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockLocations, mockTenants } from "../data/mock";
import { Tenant } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TenantSelectorProps {
  onSelect: (tenant: Tenant) => void;
  selectedTenantId?: string;
}

export function TenantSelector({ onSelect, selectedTenantId }: TenantSelectorProps) {
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTenants = useMemo(() => {
    return mockTenants.filter((t) => {
      const matchesLocation =
        selectedLocationId === "all" || t.locationId === selectedLocationId;
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.contractNo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLocation && matchesSearch;
    });
  }, [selectedLocationId, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Step 1: Location Filter & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            ขั้นตอนที่ 1: เลือกสถานที่
          </label>
          <Select
            value={selectedLocationId}
            onValueChange={setSelectedLocationId}
          >
            <SelectTrigger className="w-full h-12 bg-white border-slate-200 rounded-xl focus:ring-orange-500/20">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" />
                <SelectValue placeholder="เลือกสถานที่" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              <SelectItem value="all">ทั้งหมด</SelectItem>
              {mockLocations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            ขั้นตอนที่ 2: ระบุผู้เช่าที่ต้องการ
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="พิมพ์ชื่อร้าน หรือเลขที่สัญญา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-slate-100/50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tenant List */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          รายการผู้เช่า ({filteredTenants.length})
        </p>
        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredTenants.length > 0 ? (
            filteredTenants.map((tenant) => {
              const isSelected = selectedTenantId === tenant.id;
              return (
                <button
                  key={tenant.id}
                  onClick={() => onSelect(tenant)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                    isSelected
                      ? "bg-orange-50 border-orange-200 shadow-sm"
                      : "bg-white border-slate-100 hover:border-orange-200 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                      isSelected ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"
                    )}>
                      {tenant.shortName}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{tenant.name}</h4>
                      <p className="text-xs text-slate-400">สัญญา: {tenant.contractNo}</p>
                    </div>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 size={24} className="text-orange-500" />
                  ) : (
                    <ChevronRight size={20} className="text-slate-300" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Store size={40} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">ไม่พบข้อมูลผู้เช่าที่ค้นหา</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

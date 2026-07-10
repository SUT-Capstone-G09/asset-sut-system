"use client"

import React, { useState, useMemo } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Building2, Search, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { BuildingFormValues } from "@/features/areas/schemas/building-schema";
import { mockBuildings, mockBuildingTypes } from "@/features/areas/data/mock-buildings";

export default function BuildingFormFields() {
  const {
    register,
    control,
    setValue,
    formState: { errors }
  } = useFormContext<BuildingFormValues>();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. ดึงประเภทอาคารที่มีอยู่แล้วจากข้อมูลจริง/mock เพื่อเป็นตัวเลือก
  const [availableTypes, setAvailableTypes] = useState<string[]>(() => {
    return mockBuildingTypes.map((type) => type.name);
  });

  // 2. กรองข้อมูลตามที่พิมพ์ค้นหา
  const filteredTypes = useMemo(() => {
    return availableTypes.filter((type) =>
      type.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [availableTypes, searchTerm]);

  // 3. ฟังก์ชันการสร้างประเภทอาคารใหม่แบบ Inline
  const handleCreateNewType = (newType: string) => {
    const trimmed = newType.trim();
    if (!trimmed) return;
    
    // อัปเดตรายการตัวเลือกในหน้า UI
    if (!availableTypes.includes(trimmed)) {
      setAvailableTypes((prev) => [...prev, trimmed]);
      
      // บันทึกลง Mock Database ส่วนกลางเพื่อให้วิดเจ็ตอื่นๆ ในแอปเห็นการจัดหมวดหมู่นี้ด้วย
      mockBuildingTypes.push({
        id: mockBuildingTypes.length + 101,
        name: trimmed
      });
    }
    
    // ตั้งค่าประเภทนี้ลงใน React Hook Form
    setValue("building_type_name", trimmed);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. อินพุตชื่ออาคาร */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold text-slate-500 ml-1">ชื่ออาคาร / สถานที่หลัก</Label>
        <Input
          {...register("name")}
          placeholder="เช่น โรงอาหารกาสะลองคำ, อาคารเรียนรวม 3"
          className={cn(
            "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#f26522]/30 transition-all",
            errors.name && "border-red-500 focus-visible:ring-red-500/30"
          )}
        />
        {errors.name && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.name.message}</p>}
      </div>

      {/* 2. ช่องประเภทอาคาร แบบค้นหาและสร้างใหม่ได้ (Combobox Search & Create) */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold text-slate-500 ml-1">ประเภทอาคาร (หมวดหมู่)</Label>
        
        <Controller
          name="building_type_name"
          control={control}
          render={({ field }) => (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isOpen}
                  className="w-full h-12 justify-between rounded-[7px] bg-slate-50 hover:bg-slate-50 border-transparent hover:border-slate-200 text-left font-normal text-slate-800 focus:ring-1 focus:ring-[#f26522]/30"
                >
                  {field.value ? (
                    <span className="flex items-center gap-2">
                      <Building2 size={16} className="text-[#f26522]" />
                      {field.value}
                    </span>
                  ) : (
                    <span className="text-slate-400">เลือกประเภทอาคาร หรือพิมพ์เพื่อเพิ่มใหม่</span>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-slate-100 rounded-lg shadow-xl" align="start">
                <div className="flex items-center border-b border-slate-100 px-3 py-2 bg-slate-50 rounded-t-lg">
                  <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    placeholder="พิมพ์ชื่อประเภท เช่น ร้านค้า, สหกรณ์..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex h-9 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="max-h-[220px] overflow-y-auto p-1.5 space-y-1">
                  {/* แสดงรายการที่มีอยู่แล้ว */}
                  {filteredTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        field.onChange(type);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between hover:bg-slate-50 transition-colors",
                        field.value === type ? "bg-[#f26522]/5 text-[#f26522] font-bold" : "text-slate-700"
                      )}
                    >
                      <span>{type}</span>
                      {field.value === type && <Check size={14} className="text-[#f26522]" />}
                    </button>
                  ))}

                  {/* ปุ่มกดสร้างประเภทใหม่ (จะแสดงเมื่อไม่พบคำค้นหา) */}
                  {searchTerm.trim() !== "" && !availableTypes.some(t => t.toLowerCase() === searchTerm.toLowerCase().trim()) && (
                    <button
                      type="button"
                      onClick={() => handleCreateNewType(searchTerm)}
                      className="w-full text-left px-3 py-2.5 text-xs text-[#f26522] hover:bg-[#f26522]/5 font-bold rounded-md flex items-center gap-2 border border-dashed border-[#f26522]/20 mt-1"
                    >
                      <Plus size={14} strokeWidth={3} />
                      <span>สร้างประเภท "{searchTerm.trim()}" ใหม่</span>
                    </button>
                  )}

                  {filteredTypes.length === 0 && searchTerm.trim() === "" && (
                    <p className="text-xs text-slate-400 py-4 text-center">ไม่มีข้อมูลประเภทอาคาร</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        />
      </div>

      {/* 3. รายละเอียดอาคาร */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold text-slate-500 ml-1">รายละเอียด / หมายเหตุ</Label>
        <Textarea
          {...register("description")}
          placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับอาคาร..."
          className="rounded-[7px] min-h-[120px] bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#f26522]/30 transition-all p-4 resize-none"
        />
      </div>

    </div>
  );
}

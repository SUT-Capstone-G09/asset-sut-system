"use client"

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Search, Plus, Check, Image, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BuildingFormValues } from "@/features/space-rental/schemas/building-schema";
import { mockBuildings, mockBuildingTypes } from "@/features/space-rental/data/mock-buildings";
import { FileDropzone } from "@/components/ui/MultiDropZone";
import { uploadFile, UPLOAD_FOLDERS } from "@/lib/services/upload";

// Dynamic import เพื่อหลีกเลี่ยงปัญหา SSR ของ Leaflet
const MapPicker = dynamic(() => import("@/components/map/MapPicker"), { ssr: false });

export default function BuildingFormFields() {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors }
  } = useFormContext<BuildingFormValues>();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [blueprintFiles, setBlueprintFiles] = useState<File[]>([]);
  const hasFloorPlan = watch("has_floor_plan");
  const floorPlanType = watch("floor_plan_type") || "image";
  const lat = watch("lat");
  const lng = watch("lng");

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
        <Label className="text-xs font-bold text-slate-500 ml-1">
          ชื่ออาคาร / สถานที่หลัก
          <span className="text-red-500 ml-0.5">*</span>
        </Label>
        <Input
          {...register("name")}
          placeholder="เช่น โรงอาหารกาสะลองคำ, อาคารเรียนรวม 3"
          className={cn(
            "rounded-md h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-brand-primary/30 transition-all text-slate-900 font-normal",
            errors.name && "border-red-500 focus-visible:ring-red-500/30"
          )}
        />
        {errors.name && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.name.message}</p>}
      </div>

      {/* 2. ช่องประเภทอาคาร แบบ Inline Custom Dropdown */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold text-slate-500 ml-1">ประเภทอาคาร</Label>

        <Controller
          name="building_type_name"
          control={control}
          render={({ field }) => (
            <div className="relative">
              {/* Trigger */}
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-full h-12 px-4 flex items-center justify-between rounded-md bg-slate-50 border border-transparent hover:border-slate-200 text-sm text-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
              >
                {field.value ? (
                  <span className="flex items-center gap-2">
                    <Building2 size={15} className="text-brand-primary shrink-0" />
                    <span>{field.value}</span>
                  </span>
                ) : (
                  <span className="text-slate-400">เลือกประเภทอาคาร หรือพิมพ์เพื่อเพิ่มใหม่</span>
                )}
                <svg className={cn("h-4 w-4 text-slate-400 transition-transform shrink-0", isOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {/* Inline dropdown panel */}
              {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-lg shadow-xl overflow-hidden">
                  {/* Search input */}
                  <div className="flex items-center border-b border-slate-100 px-3 py-2 bg-slate-50">
                    <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
                    <input
                      autoFocus
                      placeholder="เช่น โรงอาหาร, อาคารเรียนรวม, หอพักนักศึกษา..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex h-9 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                  </div>

                  {/* Options list */}
                  <div className="max-h-[200px] overflow-y-auto p-1.5 space-y-0.5">
                    {filteredTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          field.onChange(type);
                          setSearchTerm("");
                          setIsOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between transition-colors",
                          field.value === type
                            ? "bg-brand-primary/5 text-brand-primary font-bold"
                            : "text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        <span>{type}</span>
                        {field.value === type && <Check size={14} className="text-brand-primary" />}
                      </button>
                    ))}

                    {/* สร้างประเภทใหม่ */}
                    {searchTerm.trim() !== "" && !availableTypes.some(t => t.toLowerCase() === searchTerm.toLowerCase().trim()) && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleCreateNewType(searchTerm);
                        }}
                        className="w-full text-left px-3 py-2.5 text-xs text-brand-primary hover:bg-brand-primary/5 font-bold rounded-md flex items-center gap-2 border border-dashed border-brand-primary/20 mt-1"
                      >
                        <Plus size={14} strokeWidth={3} />
                        <span>สร้างประเภท "{searchTerm.trim()}" ใหม่</span>
                      </button>
                    )}

                    {filteredTypes.length === 0 && searchTerm.trim() === "" && (
                      <p className="text-xs text-slate-400 py-4 text-center">ไม่มีข้อมูลประเภทอาคาร</p>
                    )}
                  </div>
                </div>
              )}

              {/* Click-outside overlay */}
              {isOpen && (
                <div
                  className="fixed inset-0 z-40"
                  onMouseDown={() => { setIsOpen(false); setSearchTerm(""); }}
                />
              )}
            </div>
          )}
        />
      </div>

      {/* 3. รายละเอียดอาคาร */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold text-slate-500 ml-1">รายละเอียด / หมายเหตุ</Label>
        <Textarea
          {...register("description")}
          placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับอาคาร..."
          className="rounded-md min-h-[120px] bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-brand-primary/30 transition-all p-4 resize-none text-slate-900 font-normal"
        />
      </div>

      {/* 4. ที่อยู่อาคาร */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold text-slate-500 ml-1">ที่อยู่อาคาร</Label>
        <Input
          {...register("address")}
          placeholder="เช่น ถนนมหาวิทยาลัย ต.สุรนารี อ.เมือง จ.นครราชสีมา 30000"
          className={cn(
            "rounded-md h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-brand-primary/30 transition-all text-slate-900 font-normal",
            errors.address && "border-red-500 focus-visible:ring-red-500/30"
          )}
        />
        {errors.address && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.address.message}</p>}
      </div>

      {/* 5. ระบุพิกัดทางภูมิศาสตร์ */}
      <div className="space-y-3">
        <Label className="text-xs font-bold text-slate-500 ml-1">พิกัดทางภูมิศาสตร์</Label>

        {/* Coordinate display badges */}
        {lat != null && lng != null ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-md px-3 py-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Latitude</span>
              <span className="text-xs font-mono font-bold text-slate-700">{lat.toFixed(7)}</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-md px-3 py-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Longitude</span>
              <span className="text-xs font-mono font-bold text-slate-700">{lng.toFixed(7)}</span>
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-slate-400 font-medium bg-slate-50 border border-slate-100 rounded-md px-3 py-2.5 text-center">
            ยังไม่ได้ระบุพิกัด — คลิกบนแผนที่เพื่อปักหมุด
          </div>
        )}

        {/* Leaflet Map Picker */}
        <div className="rounded-md overflow-hidden border border-slate-200 shadow-sm">
          <MapPicker
            lat={lat}
            lng={lng}
            onPick={(pickedLat, pickedLng) => {
              setValue("lat", pickedLat);
              setValue("lng", pickedLng);
            }}
            height="220px"
          />
        </div>
        <p className="text-[10px] text-slate-400 font-medium ml-1">คลิกบนแผนที่เพื่อปักหมุดตำแหน่งอาคาร หรือลากหมุดเพื่อปรับตำแหน่ง</p>
      </div>

      {/* 6. สวิตช์ระบุว่าอาคารมีแผนผัง */}
      <div className="flex items-start gap-3.5 p-4 rounded-md border border-slate-100 bg-slate-50/50">
        <Controller
          name="has_floor_plan"
          control={control}
          render={({ field }) => (
            <input
              type="checkbox"
              id="has_floor_plan"
              checked={field.value}
              onChange={(e) => {
                field.onChange(e.target.checked);
                if (!e.target.checked) {
                  setValue("blueprint_url", "");
                }
              }}
              className="size-4.5 rounded accent-brand-primary cursor-pointer mt-0.5 shrink-0"
            />
          )}
        />
        <div className="space-y-0.5 select-none cursor-pointer">
          <label htmlFor="has_floor_plan" className="text-xs font-bold text-slate-700 cursor-pointer">
            ระบุว่าอาคารมีแผนผังโครงสร้าง
          </label>
          <p className="text-[10px] text-slate-400 font-medium">เปิดใช้งานแผนภาพผังอาคารสำหรับกำหนดพิกัดตำแหน่งพื้นที่จัดสรรหรือหน่วยจองย่อย</p>
        </div>
      </div>

      {/* 5. ตัวเลือกย่อยสำหรับแผนผัง (แสดงเฉพาะเมื่อระบุว่ามีแผนผังเท่านั้น) */}
      {hasFloorPlan && (
        <div className="space-y-3.5 pl-6 border-l-2 border-slate-100 animate-in fade-in duration-300">
          <Label className="text-xs font-bold text-slate-500">รูปแบบการกำหนดโครงสร้างแผนผัง</Label>

          <div className="space-y-2.5">
            {/* ตัวเลือกแสดงผลแปลนแบบรูปภาพนิ่ง */}
            <div
              onClick={() => setValue('floor_plan_type', 'image')}
              className={cn(
                "p-3.5 rounded-md border-2 text-left cursor-pointer transition-all flex items-start gap-3",
                floorPlanType === 'image'
                  ? "border-brand-primary bg-brand-primary/5"
                  : "border-slate-200/80 bg-white hover:border-slate-300"
              )}
            >
              <input
                type="radio"
                name="floorPlanType"
                checked={floorPlanType === 'image'}
                onChange={() => setValue('floor_plan_type', 'image')}
                className="size-4.5 accent-brand-primary mt-0.5 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Image size={15} className={floorPlanType === 'image' ? "text-brand-primary" : "text-slate-500"} />
                  <p className="text-xs font-bold text-slate-800">แสดงผลแปลนแบบรูปภาพนิ่ง</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">ใช้สำหรับแสดงรูปภาพพิมพ์เขียวโครงสร้างอาคารเพื่อใช้อ้างอิงทางกายภาพเท่านั้น</p>
              </div>
            </div>

            {/* ตัวเลือกเปิดใช้งานแผนผังระบบแคนวาส */}
            <div
              onClick={() => {
                setValue('floor_plan_type', 'canvas');
                setValue("blueprint_url", "");
              }}
              className={cn(
                "p-3.5 rounded-md border-2 text-left cursor-pointer transition-all flex items-start gap-3",
                floorPlanType === 'canvas'
                  ? "border-brand-primary bg-brand-primary/5"
                  : "border-slate-200/80 bg-white hover:border-slate-300"
              )}
            >
              <input
                type="radio"
                name="floorPlanType"
                checked={floorPlanType === 'canvas'}
                onChange={() => {
                  setValue('floor_plan_type', 'canvas');
                  setValue("blueprint_url", "");
                }}
                className="size-4.5 accent-brand-primary mt-0.5 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Grid3X3 size={15} className={floorPlanType === 'canvas' ? "text-brand-primary" : "text-slate-500"} />
                  <p className="text-xs font-bold text-slate-800">เปิดใช้งานแผนผังระบบแคนวาส</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">ใช้สำหรับเปิดใช้งานหน้าแคนวาส เพื่อใช้วาดรูปทรง ลากวางกำหนดพิกัด และจัดการสถานะพื้นที่ย่อยแต่ละจุดได้แบบเรียลไทม์</p>
              </div>
            </div>
          </div>

          {/* ช่องอัปโหลดรูปแปลน (แสดงเฉพาะเมื่อเลือก 'image') */}
          {floorPlanType === 'image' && (
            <div className="space-y-2.5 pt-2 animate-in fade-in duration-300">
              <Label className="text-xs font-bold text-slate-400">ภาพพิมพ์เขียว/ผังพื้นหลังอาคาร</Label>
              <Controller
                name="blueprint_url"
                control={control}
                render={({ field }) => {
                  const existingFiles = field.value
                    ? [
                      {
                        id: "blueprint-img",
                        name: field.value.split("/").pop() || "แปลนอาคาร.jpg",
                        url: field.value,
                      },
                    ]
                    : [];

                  const handleBlueprintChange = async (files: File[]) => {
                    setBlueprintFiles(files);
                    if (files.length > 0) {
                      try {
                        const result = await uploadFile(files[0], UPLOAD_FOLDERS.LOCATION_PICS);
                        field.onChange(result.object_key);
                      } catch (error) {
                        console.error("Blueprint upload failed:", error);
                      }
                    } else {
                      field.onChange("");
                    }
                  };

                  return (
                    <FileDropzone
                      files={blueprintFiles}
                      onFilesChange={handleBlueprintChange}
                      existingFiles={existingFiles}
                      onExistingFileRemove={() => field.onChange("")}
                      multiple={false}
                      accept="image/jpeg,image/png,image/webp"
                      maxSizeMB={15}
                      hint="รองรับไฟล์ภาพ JPG, PNG, WEBP สำหรับพิมพ์เขียวเปล่า (สูงสุด 15MB)"
                    />
                  );
                }}
              />
            </div>
          )}
        </div>
      )}

    </div>
  );
}

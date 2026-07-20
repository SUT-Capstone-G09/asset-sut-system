"use client"

import React, { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { AREA_CATEGORIES, BUILDINGS, AREA_TO_BUILDINGS } from "../../constants";
import { cn } from "@/lib/utils";
import { AreaFormValues } from "../../schemas/area-schema";

import { FileDropzone } from "@/components/ui/MultiDropZone";
import { uploadFile, UPLOAD_FOLDERS } from "@/lib/services/upload";

interface AreaFormFieldsProps {
  isEdit?: boolean;
  isLockedContext?: boolean;
}

export default function AreaFormFields({ isEdit = false, isLockedContext = false }: AreaFormFieldsProps) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<AreaFormValues>();

  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Watch selected area (parent Area/Zone) to dynamically filter buildings
  const selectedArea = watch("area");
  const availableBuildings = selectedArea && AREA_TO_BUILDINGS[selectedArea]
    ? BUILDINGS.filter(b => AREA_TO_BUILDINGS[selectedArea].includes(b.value))
    : BUILDINGS;

  // Standalone mode is active if we are in locked context and the building has no type (i.e. 'อื่นๆ' or empty)
  const isStandalone = isLockedContext && (!selectedArea || selectedArea === "อื่นๆ");

  const handleAreaChange = (val: string, onChange: (v: string) => void) => {
    onChange(val);
    setValue("building", ""); // Reset building value when parent Area changes
  };

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-6">
      {/* 1. รูปภาพประกอบ (กว้างเต็ม 2 คอลัมน์) */}
      <div className="col-span-2 space-y-2.5">
        <Label className="text-xs font-bold text-slate-500 ml-1">รูปภาพประกอบ</Label>

        <Controller
          name="image"
          control={control}
          render={({ field }) => {
            const existingFiles = field.value
              ? [
                {
                  id: "saved-img",
                  name: field.value.split("/").pop() || "รูปภาพประกอบ.jpg",
                  url: field.value,
                },
              ]
              : [];

            const handleFilesChange = async (newFiles: File[]) => {
              setImageFiles(newFiles);
              if (newFiles.length > 0) {
                try {
                  const result = await uploadFile(newFiles[0], UPLOAD_FOLDERS.LOCATION_PICS);
                  field.onChange(result.object_key);
                } catch (error) {
                  console.error("Image upload failed:", error);
                }
              } else {
                field.onChange("");
              }
            };

            const handleExistingRemove = () => {
              field.onChange("");
            };

            return (
              <FileDropzone
                files={imageFiles}
                onFilesChange={handleFilesChange}
                existingFiles={existingFiles}
                onExistingFileRemove={handleExistingRemove}
                multiple={false}
                accept="image/jpeg,image/png,image/webp"
                maxSizeMB={10}
                hint="รองรับไฟล์รูปภาพ JPG, PNG, WEBP (สูงสุด 10MB)"
              />
            );
          }}
        />
      </div>

      {/* 2. ข้อมูลพื้นที่เช่า: ชื่อพื้นที่เช่า (ฝั่งซ้าย) */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold text-slate-500 ml-1">
          ชื่อพื้นที่เช่า
          <span className="text-red-500 ml-0.5">*</span>
        </Label>
        <Input
          {...register("name")}
          placeholder="เช่น ร้านกาแฟ, ล็อคอาหาร A01"
          className={cn(
            "rounded-md h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-brand-primary/30 transition-all text-slate-900 font-normal",
            errors.name && "border-red-500 focus-visible:ring-red-500/30"
          )}
        />
        {errors.name && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.name.message}</p>}
      </div>

      {/* 3. ข้อมูลพื้นที่เช่า: รหัสพื้นที่ (ฝั่งขวา) */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold text-slate-500 ml-1">
          รหัสพื้นที่ (Area Code)
          <span className="text-red-500 ml-0.5">*</span>
        </Label>
        <Input
          {...register("areaCode")}
          placeholder="เช่น CAF-01, DORM-101"
          className={cn(
            "rounded-md h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-brand-primary/30 transition-all text-slate-900 font-normal",
            errors.areaCode && "border-red-500 focus-visible:ring-red-500/30"
          )}
        />
        {errors.areaCode && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.areaCode.message}</p>}
      </div>

      {/* 4. พื้นที่หลัก (โซน/ประเภทตึก) (ฝั่งซ้าย) */}
      {!isStandalone && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-bold text-slate-500 ml-1">
            พื้นที่หลัก (โซน/ประเภทตึก)
            <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <Controller
            name="area"
            control={control}
            render={({ field }) => (
              <Select onValueChange={(val) => handleAreaChange(val, field.onChange)} value={field.value} disabled={isLockedContext}>
                <SelectTrigger className={cn(
                  "rounded-md !h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-1 focus:ring-brand-primary/30 transition-all text-slate-900 font-normal w-full disabled:opacity-100 disabled:text-slate-900",
                  errors.area && "border-red-500",
                  isLockedContext && "opacity-100 bg-slate-100 cursor-not-allowed"
                )}>
                  <SelectValue placeholder="เลือกพื้นที่หลัก" />
                </SelectTrigger>
                <SelectContent>
                  {AREA_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.area && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.area.message}</p>}
        </div>
      )}

      {/* 5. อาคาร / สถานที่ย่อย (ฝั่งขวา / เต็มคอลัมน์เมื่อเป็นอาคารเดี่ยว) */}
      <div className={cn("flex flex-col gap-1.5", isStandalone ? "col-span-2" : "col-span-1")}>
        <Label className="text-xs font-bold text-slate-500 ml-1">
          อาคาร / สถานที่ย่อย
          <span className="text-red-500 ml-0.5">*</span>
        </Label>
        <Controller
          name="building"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value} disabled={isLockedContext}>
              <SelectTrigger className={cn(
                "rounded-md !h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-1 focus:ring-brand-primary/30 transition-all text-slate-900 font-normal w-full disabled:opacity-100 disabled:text-slate-900",
                errors.building && "border-red-500",
                isLockedContext && "opacity-100 bg-slate-100 cursor-not-allowed"
              )}>
                <SelectValue placeholder="เลือกสถานที่ตั้งย่อย" />
              </SelectTrigger>
              <SelectContent>
                {availableBuildings.map((b) => (
                  <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.building && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.building.message}</p>}
      </div>

      {/* 6. ขนาดพื้นที่ (ตร.ม.) (ฝั่งซ้าย) */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold text-slate-500 ml-1">ขนาดพื้นที่ (ตร.ม.)</Label>
        <Input
          {...register("size")}
          placeholder="0.00"
          className={cn(
            "rounded-md h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-brand-primary/30 transition-all text-slate-900 font-normal",
            errors.size && "border-red-500 focus-visible:ring-red-500/30"
          )}
        />
        {errors.size && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.size.message}</p>}
      </div>

      {/* 7. ค่าเช่า/เดือน (บาท) (ฝั่งขวา) */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold text-slate-500 ml-1">ค่าเช่า/เดือน (บาท)</Label>
        <Input
          type="number"
          {...register("price")}
          placeholder="0.00"
          className={cn(
            "rounded-md h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-brand-primary/30 transition-all text-slate-900 font-normal",
            errors.price && "border-red-500 focus-visible:ring-red-500/30"
          )}
        />
        {errors.price && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.price.message}</p>}
      </div>

      {/* 8. รายละเอียด / หมายเหตุ (กว้างเต็ม 2 คอลัมน์) */}
      <div className="col-span-2 space-y-2.5">
        <Label className="text-xs font-bold text-slate-500 ml-1">รายละเอียด / หมายเหตุ</Label>
        <Textarea
          {...register("description")}
          placeholder="ระบุรายละเอียดเพิ่มเติม..."
          className="rounded-md min-h-[120px] bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-brand-primary/30 transition-all p-4 resize-none text-slate-900 font-normal"
        />
      </div>
    </div>
  );
}

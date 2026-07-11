"use client";

import React, { useRef, useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Sliders,
  Upload,
  FileText,
  X,
  Banknote,
  Paperclip,
  Image as ImageIcon,
} from "lucide-react";
import { RoomFormValues } from "../../../schemas/room-schema";
import { cn } from "@/lib/utils";
import ImageUpload from "@/components/ui/image-upload";
import RoomRateModal from "../RoomRateModal";
import {
  getLocations,
  getLocationTypes,
  getBuildings,
  BuildingDTO,
} from "@/features/bookings/services/location.service";

interface RoomFormFieldsProps {
  isEdit?: boolean;
}

const EQUIPMENT_LIST = [
  "เครื่องฉายโปรเจคเตอร์",
  "ไมโครโฟนไร้สาย",
  "กระดานไวท์บอร์ด",
  "ระบบคอมพิวเตอร์ลูกข่าย",
  "ระบบไฮบริด (Zoom/Teams)",
  "ระบบควบคุมจอภาพนักเรียน",
  "จอภาพอัจฉริยะ Smart Screen",
  "ระบบประชุมทางไกล Video Conference",
  "เครื่องชงกาแฟอัตโนมัติ",
  "ไมโครโฟนประชุมรายบุคคล",
  "เครื่องปรับอากาศ",
  "สมาร์ททีวี",
  "กล้องคอนเฟอเรนซ์",
];

export default function RoomFormFields({
  isEdit = false,
}: RoomFormFieldsProps) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<RoomFormValues>();

  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [buildings, setBuildings] = useState<BuildingDTO[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [locs, types, bldgs] = await Promise.all([
          getLocations(),
          getLocationTypes(),
          getBuildings(),
        ]);

        const uniqueCategories = types.map((t) => t.type);
        setCategories(uniqueCategories);

        setBuildings(bldgs);
      } catch (error) {
        console.error("Failed to fetch locations data", error);
      }
    }
    fetchData();
  }, []);

  const themeColor = "#f26522";
  const themeBg = "bg-[#f26522]/10";
  const themeRing = "focus-visible:ring-[#f26522]/30";

  // Watch rates and documents fields
  const rates = watch("rates") || {
    hourlyInternal: 0,
    hourlyExternal: 0,
    dailyInternal: 0,
    dailyExternal: 0,
  };
  const documents = watch("documents") || [];

  const handleSaveRates = (newRates: typeof rates) => {
    setValue("rates", newRates, { shouldValidate: true, shouldDirty: true });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newDocs = Array.from(files).map((f) => f.name);
      setValue("documents", [...documents, ...newDocs], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleRemoveDoc = (index: number) => {
    const updatedDocs = documents.filter((_, i) => i !== index);
    setValue("documents", updatedDocs, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // Determine if rates are configured (not all zeros)
  const isRatesConfigured =
    rates.hourlyInternal > 0 ||
    rates.hourlyExternal > 0 ||
    rates.dailyInternal > 0 ||
    rates.dailyExternal > 0;

  return (
    <div className="space-y-8">
      {/* 1. Cover Photo at the very top (รูปภาพสถานที่) */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-left space-y-4">
        <div
          className="flex items-center gap-2.5"
          style={{ color: themeColor }}
        >
          <div
            className={cn(
              "size-8 rounded-[7px] flex items-center justify-center shadow-sm border border-slate-100",
              themeBg,
            )}
          >
            <ImageIcon size={18} strokeWidth={2.5} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">
            รูปภาพสถานที่
          </h3>
        </div>

        <Controller
          name="image"
          control={control}
          render={({ field }) => (
            <ImageUpload
              value={field.value}
              onChange={field.onChange}
              error={errors.image?.message}
            />
          )}
        />
      </div>

      {/* 2. Basic Info Card (ข้อมูลพื้นฐาน) */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-left space-y-6">
        <div
          className="flex items-center gap-2.5 mb-2"
          style={{ color: themeColor }}
        >
          <div
            className={cn(
              "size-8 rounded-[7px] flex items-center justify-center shadow-sm border border-slate-100",
              themeBg,
            )}
          >
            <Building2 size={18} strokeWidth={2.5} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">
            ข้อมูลพื้นฐาน
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Space Name */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500">
              ชื่อห้อง (Room Name)
            </Label>
            <Input
              {...register("roomName")}
              placeholder="เช่น ห้อง A"
              className={cn(
                "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all pl-4",
                themeRing,
                errors.roomName &&
                  "border-red-500 focus-visible:ring-red-500/30",
              )}
            />
            {errors.roomName && (
              <p className="text-[10px] font-bold text-red-500 ml-1">
                {errors.roomName.message}
              </p>
            )}
          </div>

          {/* Building Name */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500">
              ชื่ออาคาร (Building Name)
            </Label>
            <Controller
              name="buildingId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    className={cn(
                      "rounded-[7px] data-[size=default]:h-12 w-full pl-4 bg-slate-50 border-transparent focus:bg-white focus:ring-1 transition-all",
                      themeRing,
                      errors.buildingId && "border-red-500",
                    )}
                  >
                    <SelectValue placeholder="เลือกอาคาร" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((bldg) => (
                      <SelectItem key={bldg.id} value={bldg.id.toString()}>
                        {bldg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.buildingId && (
              <p className="text-[10px] font-bold text-red-500 ml-1">
                {errors.buildingId.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Space Type */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500">
              ประเภทของห้อง (Room Type)
            </Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    className={cn(
                      "rounded-[7px] data-[size=default]:h-12 w-full pl-4 bg-slate-50 border-transparent focus:bg-white focus:ring-1 transition-all",
                      themeRing,
                      errors.category && "border-red-500",
                    )}
                  >
                    <SelectValue placeholder="เลือกประเภทของสถานที่" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-[10px] font-bold text-red-500 ml-1">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500">
              ความจุ (Capacity)
            </Label>
            <div className="relative">
              <Input
                type="number"
                {...register("capacity")}
                placeholder="เช่น 12"
                className={cn(
                  "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all pl-10",
                  themeRing,
                  errors.capacity &&
                    "border-red-500 focus-visible:ring-red-500/30",
                )}
              />
              <Users
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
            {errors.capacity && (
              <p className="text-[10px] font-bold text-red-500 ml-1">
                {errors.capacity.message}
              </p>
            )}
          </div>
        </div>

        {/* Rate (อัตราค่าใช้จ่าย) Trigger */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500">
            อัตราค่าใช้จ่าย (Rate)
          </Label>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Button
              type="button"
              onClick={() => setIsRateModalOpen(true)}
              className="h-12 px-6 rounded-lg bg-[#f26522] hover:bg-[#d8561d] text-white font-bold gap-2 shadow-lg shadow-[#f26522]/15 transition-all hover:scale-[1.01] cursor-pointer shrink-0"
            >
              <Banknote size={18} />
              กำหนดค่าใช้จ่าย
            </Button>

            {/* Show configuration summary */}
            {isRatesConfigured ? (
              <div className="flex-1 text-xs bg-slate-50 border border-slate-100 rounded-lg p-3 w-full grid grid-cols-2 gap-2 text-slate-600 font-bold">
                <div>
                  <span className="text-[10px] text-slate-400 block font-black uppercase">
                    รายชั่วโมง (Internal / External)
                  </span>
                  <span className="text-[#f26522]">
                    {rates.hourlyInternal} ฿
                  </span>{" "}
                  / <span>{rates.hourlyExternal} ฿</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-black uppercase">
                    รายวัน (Internal / External)
                  </span>
                  <span className="text-[#0284c7]">
                    {rates.dailyInternal} ฿
                  </span>{" "}
                  / <span>{rates.dailyExternal} ฿</span>
                </div>
              </div>
            ) : (
              <p className="text-xs font-bold text-slate-400 self-center">
                ยังไม่ได้กำหนดอัตราค่าใช้จ่าย (อัตราเริ่มต้นเป็น 0 ฿)
              </p>
            )}
          </div>
        </div>

        {/* Location Description */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500">
            คำอธิบายสถานที่ (Location Description)
          </Label>
          <Textarea
            {...register("notes")}
            placeholder="ระบุคำอธิบาย หรือรายละเอียดเพิ่มเติมของสถานที่..."
            className={cn(
              "rounded-[7px] min-h-[100px] bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all p-4 resize-none",
              themeRing,
            )}
          />
        </div>
      </div>

      {/* 3. Accessories row, then Space Documents row */}
      <div className="space-y-8">
        {/* Accessories Box */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-left space-y-4">
          <div
            className="flex items-center gap-2.5"
            style={{ color: themeColor }}
          >
            <div
              className={cn(
                "size-8 rounded-[7px] flex items-center justify-center shadow-sm border border-slate-100",
                themeBg,
              )}
            >
              <Sliders size={18} strokeWidth={2.5} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">
              อุปกรณ์เสริม
            </h3>
          </div>

          <Controller
            name="equipment"
            control={control}
            render={({ field }) => {
              const currentVals = field.value || [];
              return (
                <div className="flex flex-col gap-2.5 bg-slate-50/50 p-4 rounded-[7px] border border-slate-100 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {EQUIPMENT_LIST.map((eq) => {
                    const isChecked = currentVals.includes(eq);
                    return (
                      <label
                        key={eq}
                        className="flex items-center gap-2.5 text-xs font-bold text-slate-600 cursor-pointer p-1 select-none hover:text-slate-800 transition-colors"
                      >
                        <div className="relative flex items-center justify-center size-4 shrink-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...currentVals, eq]);
                              } else {
                                field.onChange(
                                  currentVals.filter((v: string) => v !== eq),
                                );
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div
                            className={cn(
                              "size-4 rounded border transition-all flex items-center justify-center shrink-0",
                              isChecked
                                ? "bg-[#f26522] border-[#f26522] text-white"
                                : "border-slate-300 bg-white hover:border-[#f26522] peer-focus-visible:border-[#f26522] peer-focus-visible:ring-2 peer-focus-visible:ring-[#f26522]/30",
                            )}
                          >
                            {isChecked && (
                              <svg
                                className="w-2.5 h-2.5 stroke-current stroke-[3px]"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4.5 12.75l6 6 9-13.5"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span>{eq}</span>
                      </label>
                    );
                  })}
                </div>
              );
            }}
          />
        </div>

        {/* Space Documents (เอกสารแนบ) */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-left space-y-5">
          <div
            className="flex items-center gap-2.5"
            style={{ color: themeColor }}
          >
            <div
              className={cn(
                "size-8 rounded-[7px] flex items-center justify-center shadow-sm border border-slate-100",
                themeBg,
              )}
            >
              <Paperclip size={18} strokeWidth={2.5} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">
              เอกสารแนบ (Space Documents)
            </h3>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf,image/*"
            className="hidden"
            multiple
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-[#f26522]/30 rounded-[7px] p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group shadow-inner"
          >
            <div className="size-16 rounded-[7px] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 text-brand-primary mb-4">
                <Upload className="w-6 h-6" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-slate-900">
                คลิกเพื่ออัปโหลดเอกสาร (PDF, PNG, JPG)
              </p>
              <p className="text-xs text-slate-400 font-medium">
                รองรับ PDF, PNG, JPG (สูงสุด 10MB)
              </p>
            </div>
          </div>

          {/* Uploaded Files List */}
          {documents.length > 0 && (
            <div className="space-y-2 pt-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">
                รายการไฟล์ที่อัปโหลด
              </Label>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs font-bold text-slate-600 gap-3 hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={15} className="text-[#f26522] shrink-0" />
                      <span className="truncate">{doc}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(idx)}
                      className="size-6 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Room Number Field (Maintained for backward compatibility / schema requirements) */}
      <input type="hidden" {...register("roomNumber")} />

      {/* Rate Configuration Modal Overlay */}
      <RoomRateModal
        open={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        initialRates={rates}
        onSave={handleSaveRates}
      />
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
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
  Banknote,
  Image as ImageIcon,
  LayoutGrid,
} from "lucide-react";
import { HallFormValues } from "../../../schemas/hall-schema";
import { cn } from "@/lib/utils";
import ImageUpload from "@/features/areas/components/admin/forms/ImageUpload";
import RoomRateModal from "@/features/booking/components/rooms/RoomRateModal";
import { getBuildings, BuildingDTO } from "@/features/bookings/services/location.service";

export default function HallFormFields() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<HallFormValues>();

  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [buildings, setBuildings] = useState<BuildingDTO[]>([]);

  useEffect(() => {
    getBuildings()
      .then(setBuildings)
      .catch((error) => console.error("Failed to fetch buildings", error));
  }, []);

  const themeColor = "#f26522";
  const themeBg = "bg-[#f26522]/10";
  const themeRing = "focus-visible:ring-[#f26522]/30";

  const rates = watch("rates") || {
    hourlyInternal: 0,
    hourlyExternal: 0,
    hourlyOffPeakInternal: 0,
    hourlyOffPeakExternal: 0,
    dailyInternal: 0,
    dailyExternal: 0,
  };

  const handleSaveRates = (newRates: typeof rates) => {
    setValue("rates", newRates, { shouldValidate: true, shouldDirty: true });
  };

  const isRatesConfigured =
    rates.hourlyInternal > 0 ||
    rates.hourlyExternal > 0 ||
    rates.dailyInternal > 0 ||
    rates.dailyExternal > 0 ||
    (rates.hourlyOffPeakInternal ?? 0) > 0 ||
    (rates.hourlyOffPeakExternal ?? 0) > 0;

  return (
    <div className="space-y-8">
      {/* 1. รูปพื้นที่จริง (ถ่ายจากกล้อง) */}
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
            รูปพื้นที่จริง
          </h3>
        </div>
        <p className="text-[11px] font-bold text-slate-400 -mt-2">
          รูปถ่ายพื้นที่จริงจากกล้อง (ใช้แสดงบนการ์ด) — ส่วนรูปผัง top-view
          สำหรับตั้งสเกลจะอัปโหลดในหน้า “จัดการผังพื้นที่”
        </p>

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

      {/* 2. ข้อมูลพื้นฐาน */}
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
          {/* ชื่อโถง */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500">
              ชื่อโถงพื้นที่ (Space Name)
            </Label>
            <Input
              {...register("name")}
              placeholder="เช่น โถงอเนกประสงค์ ชั้น 1"
              className={cn(
                "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all pl-4",
                themeRing,
                errors.name && "border-red-500 focus-visible:ring-red-500/30",
              )}
            />
            {errors.name && (
              <p className="text-[10px] font-bold text-red-500 ml-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* อาคาร */}
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
                      "rounded-[7px] h-12 data-[size=default]:h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-1 transition-all w-full pl-4 ",
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

        {/* ประเภท (ล็อกเป็นโถงอาคาร) */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500">
            ประเภทของสถานที่ (Building Type)
          </Label>
          <div className="flex items-center gap-2.5 h-12 px-4 rounded-[7px] bg-slate-50 border border-slate-100 text-sm font-bold text-slate-600">
            <LayoutGrid size={16} className="text-[#f26522]" />
            โถงอาคาร
          </div>
        </div>

        {/* ราคา */}
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

        {/* คำอธิบาย */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500">
            คำอธิบายพื้นที่ (Space Description)
          </Label>
          <Textarea
            {...register("notes")}
            placeholder="ระบุคำอธิบาย หรือรายละเอียดเพิ่มเติมของโถงพื้นที่..."
            className={cn(
              "rounded-[7px] min-h-[100px] bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all p-4 resize-none",
              themeRing,
            )}
          />
        </div>
      </div>

      <RoomRateModal
        open={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        initialRates={rates}
        onSave={handleSaveRates}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Building2, Image as ImageIcon, LayoutGrid } from "lucide-react";
import { HallFormValues } from "../../../schemas/hall-schema";
import { cn } from "@/lib/utils";
import ImageUpload from "@/components/ui/image-upload";
import { getBuildings } from "../../../services/hallService";

export default function HallFormFields({
  portalContainer,
}: {
  // portal dropdown ของ combobox เข้า Sheet (ฟอร์มอยู่ใน drawer) ไม่งั้นถูกบังหลัง Sheet
  portalContainer?: HTMLElement | null;
}) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<HallFormValues>();

  // ต้องเลือกจากอาคารที่มีจริงเท่านั้น — backend บันทึกด้วย building_id ชื่อที่พิมพ์เองจะ resolve ไม่ได้
  const [buildings, setBuildings] = useState<string[]>([]);

  useEffect(() => {
    getBuildings()
      .then((list) => setBuildings(list.map((b) => b.name)))
      .catch((err) => console.error("Failed to load buildings:", err));
  }, []);

  const themeColor = "#f26522";
  const themeBg = "bg-[#f26522]/10";
  const themeRing = "focus-visible:ring-[#f26522]/30";

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
              name="building"
              control={control}
              render={({ field }) => (
                <Combobox
                  items={buildings}
                  value={field.value || null}
                  onValueChange={(v) => field.onChange(v ?? "")}
                >
                  <ComboboxInput
                    placeholder="เลือกอาคาร / พิมพ์ชื่อ..."
                    className={cn(
                      "h-12 w-full rounded-[7px] bg-slate-50",
                      errors.building && "border-red-500",
                    )}
                  />
                  <ComboboxContent container={portalContainer}>
                    <ComboboxEmpty>ไม่พบอาคาร</ComboboxEmpty>
                    <ComboboxList>
                      {(item: string) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              )}
            />
            {errors.building && (
              <p className="text-[10px] font-bold text-red-500 ml-1">
                {errors.building.message}
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

    </div>
  );
}

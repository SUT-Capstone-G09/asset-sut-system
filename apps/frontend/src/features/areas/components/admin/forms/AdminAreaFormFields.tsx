"use client"

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
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  User
} from "lucide-react";
import { AREA_CATEGORIES, BUILDINGS, AREA_TO_BUILDINGS } from "../../../constants";
import { cn } from "@/lib/utils";
import { AreaFormValues } from "../../../schemas/area-schema";

import ImageUpload from "./ImageUpload";

interface AdminAreaFormFieldsProps {
  isEdit?: boolean;
}

export default function AdminAreaFormFields({ isEdit = false }: AdminAreaFormFieldsProps) {
  const { 
    register, 
    control,
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<AreaFormValues>();

  const themeColor = "#f26522";
  const themeBg = "bg-[#f26522]/10";
  const themeRing = "focus-visible:ring-[#f26522]/30";

  // Watch selected area (parent Area/Zone) to dynamically filter buildings
  const selectedArea = watch("area");
  const availableBuildings = selectedArea && AREA_TO_BUILDINGS[selectedArea]
    ? BUILDINGS.filter(b => AREA_TO_BUILDINGS[selectedArea].includes(b.value))
    : BUILDINGS;

  const handleAreaChange = (val: string, onChange: (v: string) => void) => {
    onChange(val);
    setValue("building", ""); // Reset building value when parent Area changes
  };

  return (
    <div className="space-y-10">
      {/* Section: Image */}
      <div className="space-y-4">
        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">
          รูปภาพประกอบ
        </Label>
        
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


      {/* Section: Area Info */}
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 mb-2" style={{ color: themeColor }}>
          <div className={cn("size-8 rounded-[7px] flex items-center justify-center shadow-sm border border-slate-100", themeBg)}>
            <Building2 size={18} strokeWidth={2.5} />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">ข้อมูลพื้นที่เช่า</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-2.5">
            <Label className="text-xs font-bold text-slate-500 ml-1">ชื่อสถานที่ / รหัสพื้นที่</Label>
            <Input 
              {...register("name")}
              placeholder="ระบุรหัสห้อง หรือชื่อพื้นที่" 
              className={cn(
                "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all", 
                themeRing,
                errors.name && "border-red-500 focus-visible:ring-red-500/30"
              )} 
            />
            {errors.name && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.name.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">พื้นที่หลัก (โซน/ประเภทตึก)</Label>
              <Controller
                name="area"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(val) => handleAreaChange(val, field.onChange)} value={field.value}>
                    <SelectTrigger className={cn(
                      "rounded-[7px] h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-1 transition-all", 
                      themeRing,
                      errors.area && "border-red-500"
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
            
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">อาคาร / สถานที่ย่อย</Label>
              <Controller
                name="building"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={cn(
                      "rounded-[7px] h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-1 transition-all", 
                      themeRing,
                      errors.building && "border-red-500"
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
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">ขนาดพื้นที่ (ตร.ม.)</Label>
              <Input 
                {...register("size")}
                placeholder="0.00" 
                className={cn(
                  "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all", 
                  themeRing,
                  errors.size && "border-red-500 focus-visible:ring-red-500/30"
                )} 
              />
              {errors.size && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.size.message}</p>}
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">ค่าเช่า/เดือน (บาท)</Label>
              <Input 
                type="number" 
                {...register("price")}
                placeholder="0.00" 
                className={cn(
                  "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all", 
                  themeRing,
                  errors.price && "border-red-500 focus-visible:ring-red-500/30"
                )} 
              />
              {errors.price && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.price.message}</p>}
            </div>
          </div>

          <div className="space-y-2.5">
            <Label className="text-xs font-bold text-slate-500 ml-1">รายละเอียด / หมายเหตุ</Label>
            <Textarea 
              {...register("description")}
              placeholder="ระบุรายละเอียดเพิ่มเติม..." 
              className={cn(
                "rounded-[7px] min-h-[120px] bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all p-4 resize-none", 
                themeRing
              )} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

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
  User,
  UploadCloud
} from "lucide-react";
import { AREA_CATEGORIES, BUILDINGS } from "../../../data/constants";
import { Button } from "@/components/ui/button";
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
    formState: { errors }
  } = useFormContext<AreaFormValues>();

  const themeColor = "#f26522";
  const themeBg = "bg-[#f26522]/10";
  const themeRing = "focus-visible:ring-[#f26522]/30";

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
              <Label className="text-xs font-bold text-slate-500 ml-1">อาคาร / สถานที่</Label>
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
                      <SelectValue placeholder="เลือกสถานที่" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUILDINGS.map((b) => (
                        <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.building && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.building.message}</p>}
            </div>
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">ประเภท</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={cn(
                      "rounded-[7px] h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-1 transition-all", 
                      themeRing,
                      errors.category && "border-red-500"
                    )}>
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      {AREA_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.category.message}</p>}
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

      <Separator className="bg-slate-100" />

      {/* Section: Tenant Info */}
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 mb-2" style={{ color: themeColor }}>
          <div className={cn("size-8 rounded-[7px] flex items-center justify-center shadow-sm border border-slate-100", themeBg)}>
            <User size={18} strokeWidth={2.5} />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">ข้อมูลผู้เช่า & สัญญา</h3>
        </div>
        
        <div className="space-y-5">
          <div className="space-y-2.5">
            <Label className="text-xs font-bold text-slate-500 ml-1">ชื่อผู้ประกอบการ / บริษัท</Label>
            <Input 
              {...register("tenantName")}
              placeholder="ระบุชื่อผู้เช่า หรือชื่อบริษัทผู้ประกอบการ" 
              className={cn("rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all", themeRing)} 
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">เลขบัตรประจำตัวประชาชน / ทะเบียนนิติบุคคล (ID)</Label>
              <Input 
                {...register("citizenId")}
                placeholder="ระบุเลขประจำตัวประชาชน หรือเลขทะเบียนนิติบุคคล" 
                className={cn("rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all", themeRing)} 
              />
            </div>
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">เลขที่สัญญา</Label>
              <Input 
                {...register("contractNumber")}
                placeholder="ระบุเลขที่สัญญาเช่า" 
                className={cn("rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all", themeRing)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">ชื่อสัญญา</Label>
              <Input 
                {...register("contractName")}
                placeholder="ระบุชื่อสัญญาเช่าพื้นที่" 
                className={cn("rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all", themeRing)} 
              />
            </div>
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">วันสิ้นสุดสัญญาเช่า</Label>
              <Input 
                {...register("contractEndDate")}
                placeholder="DD/MM/YYYY" 
                className={cn("rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all", themeRing)} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

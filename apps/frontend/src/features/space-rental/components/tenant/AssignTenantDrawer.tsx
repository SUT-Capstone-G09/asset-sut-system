"use client"

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, X, Save, Loader2 } from "lucide-react";
import { RentalSpace } from "@/features/space-rental/types/rental-space";
import { cn } from "@/lib/utils";

const tenantSchema = z.object({
  tenantName: z.string().min(1, "กรุณาระบุชื่อผู้ประกอบการ / บริษัท"),
  citizenId: z.string().min(1, "กรุณาระบุเลขประจำตัวประชาชน / ทะเบียนนิติบุคคล"),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

interface Props {
  location: RentalSpace | null;
  open: boolean;
  onClose: () => void;
  onSave?: (updatedLoc: RentalSpace) => void;
}

export default function AssignTenantDrawer({ location, open, onClose, onSave }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      tenantName: "",
      citizenId: ""
    }
  });

  useEffect(() => {
    if (location) {
      reset({
        tenantName: location.tenantName === "-" ? "" : (location.tenantName || ""),
        citizenId: location.citizenId || ""
      });
    }
  }, [location, reset]);

  const onSubmit = async (data: TenantFormValues) => {
    if (!location) return;
    setIsSubmitting(true);
    
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedLocation: RentalSpace = {
      ...location,
      tenantName: data.tenantName,
      citizenId: data.citizenId,
    };

    onSave?.(updatedLocation);
    setIsSubmitting(false);
    onClose();
    alert("มอบสิทธิ์ผู้เช่าสำเร็จ!");
  };

  if (!location) return null;

  const themeRing = "focus-visible:ring-[#f26522]/30";

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-[540px] p-0 border-none bg-white flex flex-col h-full shadow-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center">
                <User size={20} className="text-[#f26522]" strokeWidth={2.5} />
              </div>
              
              <div>
                <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight">
                  มอบสิทธิ์ผู้เช่า
                </SheetTitle>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  พื้นที่: {location.name}
                </p>
              </div>

              <SheetDescription className="sr-only">
                ฟอร์มมอบสิทธิ์ผู้เช่าให้กับพื้นที่เช่านี้
              </SheetDescription>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="size-9 rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center group"
            >
              <X size={18} className="transition-transform group-hover:rotate-90" />
            </button>
          </SheetHeader>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            <div className="space-y-5">
              
              {/* Tenant Name */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-slate-500 ml-1">ชื่อผู้ประกอบการ / บริษัท</Label>
                <Input
                  {...register("tenantName")}
                  placeholder="ระบุชื่อผู้ประกอบการ หรือชื่อบริษัท"
                  className={cn(
                    "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all",
                    themeRing,
                    errors.tenantName && "border-red-500 focus-visible:ring-red-500/30"
                  )}
                />
                {errors.tenantName && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.tenantName.message}</p>}
              </div>

              {/* ID / Citizen Card */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-slate-500 ml-1">เลขประจำตัวประชาชน / ทะเบียนนิติบุคคล (ID)</Label>
                <Input
                  {...register("citizenId")}
                  placeholder="ระบุเลขประจำตัวประชาชน 13 หลัก หรือทะเบียนนิติบุคคล"
                  className={cn(
                    "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all",
                    themeRing,
                    errors.citizenId && "border-red-500 focus-visible:ring-red-500/30"
                  )}
                />
                {errors.citizenId && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.citizenId.message}</p>}
              </div>

            </div>
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-5 border-t border-slate-100 flex items-center gap-4 bg-white/90 backdrop-blur-md shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-[7px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
            >
              ยกเลิก
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-[7px] bg-[#f26522] hover:bg-[#d8561d] text-white font-bold shadow-lg shadow-[#f26522]/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

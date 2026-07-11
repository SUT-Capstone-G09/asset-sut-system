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
import { FileText, X, Save, Loader2 } from "lucide-react";
import { RentalSpace } from "@/features/space-rental/types/rental-space";
import { cn } from "@/lib/utils";

const contractSchema = z.object({
  contractNumber: z.string().min(1, "กรุณาระบุเลขที่สัญญา"),
  contractName: z.string().min(1, "กรุณาระบุชื่อสัญญาเช่า"),
  contractEndDate: z.string().min(1, "กรุณาระบุวันสิ้นสุดสัญญา (DD/MM/YYYY)"),
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface Props {
  location: RentalSpace | null;
  open: boolean;
  onClose: () => void;
  onSave?: (updatedLoc: RentalSpace) => void;
}

export default function CreateContractDrawer({ location, open, onClose, onSave }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contractNumber: "",
      contractName: "",
      contractEndDate: ""
    }
  });

  useEffect(() => {
    if (location) {
      reset({
        contractNumber: location.contractNumber || "",
        contractName: location.contractName || "",
        contractEndDate: location.contractEndDate || ""
      });
    }
  }, [location, reset]);

  const onSubmit = async (data: ContractFormValues) => {
    if (!location) return;
    setIsSubmitting(true);
    
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedLocation: RentalSpace = {
      ...location,
      contractNumber: data.contractNumber,
      contractName: data.contractName,
      contractEndDate: data.contractEndDate,
      status: "occupied" // Transition to Occupied status
    };

    onSave?.(updatedLocation);
    setIsSubmitting(false);
    onClose();
    alert("ทำสัญญาเช่าสำเร็จ!");
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
                <FileText size={20} className="text-[#f26522]" strokeWidth={2.5} />
              </div>
              
              <div>
                <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight">
                  ทำสัญญาเช่าพื้นที่
                </SheetTitle>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  พื้นที่: {location.name}
                </p>
              </div>

              <SheetDescription className="sr-only">
                ฟอร์มสร้างสัญญาเช่าพื้นที่ใหม่
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
              
              {/* Contract Number */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-slate-500 ml-1">เลขที่สัญญา</Label>
                <Input
                  {...register("contractNumber")}
                  placeholder="เช่น CON-69-0124"
                  className={cn(
                    "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all",
                    themeRing,
                    errors.contractNumber && "border-red-500 focus-visible:ring-red-500/30"
                  )}
                />
                {errors.contractNumber && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.contractNumber.message}</p>}
              </div>

              {/* Contract Name */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-slate-500 ml-1">ชื่อสัญญาเช่า</Label>
                <Input
                  {...register("contractName")}
                  placeholder="ระบุชื่อสัญญา เช่น สัญญาเช่าพื้นที่ประกอบการร้านค้า"
                  className={cn(
                    "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all",
                    themeRing,
                    errors.contractName && "border-red-500 focus-visible:ring-red-500/30"
                  )}
                />
                {errors.contractName && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.contractName.message}</p>}
              </div>

              {/* Contract End Date */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-slate-500 ml-1">วันสิ้นสุดสัญญาเช่า</Label>
                <Input
                  {...register("contractEndDate")}
                  placeholder="DD/MM/YYYY"
                  className={cn(
                    "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all",
                    themeRing,
                    errors.contractEndDate && "border-red-500 focus-visible:ring-red-500/30"
                  )}
                />
                {errors.contractEndDate && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.contractEndDate.message}</p>}
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
              {isSubmitting ? "กำลังบันทึก..." : "สร้างสัญญา"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

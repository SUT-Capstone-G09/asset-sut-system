"use client"

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  X,
  Save,
  Loader2
} from "lucide-react";
import AreaFormFields from "./AreaFormFields";
import { areaSchema, AreaFormValues } from "../../schemas/area-schema";
import React, { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd?: (newLoc: any) => void;
  defaultBuildingName?: string;
  defaultAreaName?: string;
  defaultCoordinates?: [number, number];
  defaultAddress?: string;
  isLockedContext?: boolean;
}

export default function SpaceCreateDrawer({
  open,
  onClose,
  onAdd,
  defaultBuildingName = "",
  defaultAreaName = "",
  defaultCoordinates,
  defaultAddress = "",
  isLockedContext = false
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<AreaFormValues>({
    resolver: zodResolver(areaSchema) as any,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      areaCode: "",
      building: defaultBuildingName,
      area: defaultAreaName,
      size: "",
      price: undefined,
      description: "",
      image: ""
    }
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        name: "",
        areaCode: "",
        building: defaultBuildingName,
        area: defaultAreaName,
        size: "",
        price: undefined,
        description: "",
        image: ""
      });
    }
  }, [open, defaultBuildingName, defaultAreaName, defaultCoordinates, methods]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    console.log("Submitting Create Area Data:", data);
    
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const finalCoordinates = defaultCoordinates || [14.8804616, 102.0161729];

    const newArea = {
      id: String(Date.now()),
      name: data.name,
      areaCode: data.areaCode,
      building: data.building,
      area: data.area,
      size: data.size,
      price: data.price ? Number(data.price) : undefined,
      description: data.description || "",
      image: data.image || "https://beta.sut.ac.th/damt/wp-content/uploads/sites/189/2021/01/1-2.jpg",
      status: "vacant",
      coordinates: finalCoordinates,
      address: defaultAddress || "มหาวิทยาลัยเทคโนโลยีสุรนารี",
      tenantName: "",
      citizenId: "",
      contractNumber: "",
      contractName: "",
      contractEndDate: ""
    };
    
    onAdd?.(newArea);
    
    setIsSubmitting(false);
    methods.reset();
    onClose();
    alert("บันทึกข้อมูลสำเร็จ!");
  };


  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        showCloseButton={false}
        className="w-full sm:max-w-[640px] p-0 border-none bg-white flex flex-col h-full shadow-2xl"
      >
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center">
                  <Plus size={20} className="text-[#f26522]" strokeWidth={3} />
                </div>
                
                <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight">
                  เพิ่มสถานที่ใหม่
                </SheetTitle>

                <SheetDescription className="sr-only">
                  ฟอร์มสำหรับกรอกข้อมูลเพื่อเพิ่มสถานที่เช่าใหม่ในระบบ
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

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <AreaFormFields isLockedContext={isLockedContext} />
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
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}

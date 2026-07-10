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
import BuildingFormFields from "../forms/BuildingFormFields";
import { buildingSchema, BuildingFormValues } from "../../../schemas/building-schema";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd?: (newBuilding: any) => void | Promise<void>;
}

export default function BuildingCreateDrawer({ open, onClose, onAdd }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<BuildingFormValues>({
    resolver: zodResolver(buildingSchema) as any,
    defaultValues: {
      name: "",
      building_type_name: "",
      description: ""
    }
  });

  const onSubmit = async (data: BuildingFormValues) => {
    setIsSubmitting(true);
    console.log("Submitting Create Building Data:", data);
    
    try {
      if (onAdd) {
        await onAdd(data);
      }
      methods.reset();
      onClose();
      alert("บันทึกข้อมูลอาคารสำเร็จ!");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        showCloseButton={false}
        className="w-full sm:max-w-[540px] p-0 border-none bg-white flex flex-col h-full shadow-2xl"
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
                  เพิ่มอาคารใหม่
                </SheetTitle>

                <SheetDescription className="sr-only">
                  ฟอร์มสำหรับกรอกข้อมูลเพื่อเพิ่มอาคารหรือสถานที่หลักใหม่ในระบบ
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

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <BuildingFormFields />
            </div>

            {/* Footer */}
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

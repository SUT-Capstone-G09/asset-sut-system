"use client"

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  X,
  Save,
  Loader2
} from "lucide-react";
import { RentalSpace } from "@/features/space-rental/types/rental-space";
import AdminAreaFormFields from "./AdminAreaFormFields";
import { areaSchema, AreaFormValues } from "../../schemas/area-schema";

interface Props {
  location: RentalSpace | null;
  open: boolean;
  onClose: () => void;
  onUpdateLocation?: (updatedLoc: RentalSpace) => void;
}

export default function SpaceEditDrawer({ location, open, onClose, onUpdateLocation }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<AreaFormValues>({
    resolver: zodResolver(areaSchema) as any,
    defaultValues: {
      name: "",
      building: "",
      area: "",
      size: "",
      price: undefined,
      description: "",
      tenantName: "",
      contractEndDate: "",
      contractName: "",
      citizenId: "",
      contractNumber: "",
      image: ""
    }
  });

  // Update form values when location changes
  useEffect(() => {
    if (location) {
      methods.reset({
        name: location.name || "",
        building: location.building || "",
        area: location.area || "",
        size: location.size || "",
        price: location.price || undefined,
        description: location.description || "",
        tenantName: location.tenantName || "",
        contractEndDate: location.contractEndDate || "",
        contractName: location.contractName || "",
        citizenId: location.citizenId || "",
        contractNumber: location.contractNumber || "",
        image: location.image || ""
      });
    }
  }, [location, methods]);

  const onSubmit = async (data: any) => {
    if (!location) return;
    setIsSubmitting(true);
    console.log("Updating Area Data:", data);
    
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedLocation = {
      ...location,
      name: data.name,
      building: data.building,
      area: data.area,
      size: data.size,
      price: data.price ? Number(data.price) : undefined,
      description: data.description || "",
      image: data.image || location.image,
    };

    onUpdateLocation?.(updatedLocation);
    
    setIsSubmitting(false);
    onClose();
    alert("แก้ไขข้อมูลสำเร็จ!");
  };

  if (!location) return null;

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
                  <Pencil size={20} className="text-[#f26522]" strokeWidth={2.5} />
                </div>
                
                <div>
                  <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight">
                    แก้ไขข้อมูลสถานที่
                  </SheetTitle>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    กำลังแก้ไข: {location.name}
                  </p>
                </div>

                <SheetDescription className="sr-only">
                  ฟอร์มสำหรับแก้ไขข้อมูลสถานที่เช่า
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
              <AdminAreaFormFields isEdit />
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
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}

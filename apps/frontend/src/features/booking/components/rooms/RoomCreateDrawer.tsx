"use client"

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, X, Save, Loader2, AlertCircle } from "lucide-react";
import { Room } from "../../types/room";
import { roomSchema, RoomFormValues } from "../../schemas/room-schema";
import RoomFormFields from "./forms/RoomFormFields";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (newRoom: Room) => void | Promise<void>;
}

const FIELD_LABELS: Record<string, string> = {
  roomName: "ชื่อห้อง",
  building: "อาคาร",
  category: "ประเภทห้อง",
  capacity: "ความจุ",
  image: "รูปภาพ",
  rates: "อัตราค่าใช้จ่าย",
};

export default function RoomCreateDrawer({ open, onClose, onSave }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const methods = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema) as any,
    defaultValues: {
      roomName: "",
      roomNumber: "",
      building: "",
      category: "",
      capacity: 1,
      image: "",
      status: "available",
      equipment: [],
      notes: "",
      rates: {
        hourlyInternal: 0,
        hourlyExternal: 0,
        dailyInternal: 0,
        dailyExternal: 0
      },
      documents: []
    }
  });

  const onSubmit = async (data: RoomFormValues) => {
    setFormErrors([]);
    setIsSubmitting(true);
    try {
      const newRoom: Room = {
        id: "",
        roomName: data.roomName,
        roomNumber: data.roomNumber ?? "",
        building: data.building,
        category: data.category,
        capacity: Number(data.capacity),
        image: data.image ?? "",
        status: data.status,
        equipment: data.equipment || [],
        notes: data.notes,
        rates: data.rates,
        documents: data.documents || [],
      };
      await onSave(newRoom);
      methods.reset();
      onClose();
    } catch (err) {
      console.error("Failed to save room:", err);
      setFormErrors(["เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const missing = Object.keys(errors)
      .filter((k) => k in FIELD_LABELS)
      .map((k) => FIELD_LABELS[k]);
    setFormErrors(
      missing.length > 0
        ? [`กรุณากรอกข้อมูลให้ครบ: ${missing.join(", ")}`]
        : ["กรุณาตรวจสอบข้อมูลให้ถูกต้อง"]
    );
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-[640px] p-0 border-none bg-white flex flex-col h-full shadow-2xl"
      >
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit, onInvalid)} className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 shrink-0 bg-white text-left">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center">
                  <Plus size={20} className="text-[#f26522]" strokeWidth={2.5} />
                </div>
                
                <div>
                  <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight">
                    เพิ่มข้อมูลห้องใหม่
                  </SheetTitle>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    กรอกข้อมูลเพื่อบันทึกเข้าสู่ระบบการจอง
                  </p>
                </div>

                <SheetDescription className="sr-only">
                  กรอกข้อมูลห้องที่ฟอร์มด้านล่างเพื่อทำการสร้างห้องใหม่
                </SheetDescription>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="size-9 rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center group cursor-pointer"
              >
                <X size={18} className="transition-transform group-hover:rotate-90" />
              </button>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <RoomFormFields />
            </div>

            {/* Sticky Footer */}
            <div className="px-6 py-5 border-t border-slate-100 flex flex-col gap-3 bg-white/90 backdrop-blur-md shrink-0">
              {formErrors.length > 0 && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-[7px] px-4 py-3">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs font-bold text-red-600">{formErrors[0]}</p>
                </div>
              )}
              <div className="flex items-center gap-4">
              <Button 
                type="button"
                variant="ghost" 
                onClick={onClose} 
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-[7px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                ยกเลิก
              </Button>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-[7px] bg-[#f26522] hover:bg-[#d8561d] text-white font-bold shadow-lg shadow-[#f26522]/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูลห้อง"}
              </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}

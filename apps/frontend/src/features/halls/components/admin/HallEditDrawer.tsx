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
import { Pencil, X, Save, Loader2, AlertCircle } from "lucide-react";
import { Hall } from "../../types/hall";
import { hallSchema, HallFormValues } from "../../schemas/hall-schema";
import HallFormFields from "./forms/HallFormFields";

interface Props {
  hall: Hall | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedHall: Hall) => void | Promise<void>;
}

const FIELD_LABELS: Record<string, string> = {
  name: "ชื่อโถงพื้นที่",
  building: "อาคาร",
  image: "รูปพื้นที่จริง",
};

export default function HallEditDrawer({ hall, open, onClose, onSave }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const methods = useForm<HallFormValues>({
    resolver: zodResolver(hallSchema) as any,
    defaultValues: {
      name: "",
      building: "",
      image: "",
      status: "available",
      notes: "",
      rates: { hourlyInternal: 0, hourlyExternal: 0, dailyInternal: 0, dailyExternal: 0 },
    },
  });

  useEffect(() => {
    if (hall) {
      methods.reset({
        name: hall.name || "",
        building: hall.building || "",
        image: hall.image || "",
        status: hall.status || "available",
        notes: hall.notes || "",
        rates: hall.rates || { hourlyInternal: 0, hourlyExternal: 0, dailyInternal: 0, dailyExternal: 0 },
      });
    }
  }, [hall, methods]);

  const onSubmit = async (data: HallFormValues) => {
    if (!hall) return;
    setFormErrors([]);
    setIsSubmitting(true);
    try {
      const updatedHall: Hall = {
        ...hall,
        name: data.name,
        building: data.building,
        image: data.image || hall.image,
        status: data.status,
        notes: data.notes,
        rates: data.rates,
      };
      await onSave(updatedHall);
      onClose();
    } catch (err) {
      console.error("Failed to update hall:", err);
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

  if (!hall) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-[640px] p-0 border-none bg-white flex flex-col h-full shadow-2xl"
      >
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit, onInvalid)} className="flex flex-col h-full">
            <SheetHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 shrink-0 bg-white text-left">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center">
                  <Pencil size={20} className="text-[#f26522]" strokeWidth={2.5} />
                </div>
                <div>
                  <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight">
                    แก้ไขโถงพื้นที่
                  </SheetTitle>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    รหัสในระบบ: {hall.id}
                  </p>
                </div>
                <SheetDescription className="sr-only">
                  แก้ไขแบบฟอร์มข้อมูลโถงพื้นที่ด้านล่าง
                </SheetDescription>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="size-9 rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center group cursor-pointer"
              >
                <X size={18} className="transition-transform group-hover:rotate-90" />
              </button>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <HallFormFields />
            </div>

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
                  className="flex-1 h-12 rounded-[7px] bg-primary hover:bg-brand-primary-600 text-white font-bold shadow-lg shadow-[#f26522]/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}

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
import { Pencil, X, Save, Loader2 } from "lucide-react";
import { Room } from "../../types/room";
import { roomSchema, RoomFormValues } from "../../schemas/room-schema";
import RoomFormFields from "./forms/RoomFormFields";

interface Props {
  room: Room | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedRoom: Room) => void;
}

export default function RoomEditDrawer({ room, open, onClose, onSave }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Pre-fill form when room details are loaded
  useEffect(() => {
    if (room) {
      methods.reset({
        roomName: room.roomName || "",
        roomNumber: room.roomNumber || "",
        building: room.building || "",
        category: room.category || "",
        capacity: room.capacity || 1,
        image: room.image || "",
        status: room.status || "available",
        equipment: room.equipment || [],
        notes: room.notes || "",
        rates: room.rates || {
          hourlyInternal: 0,
          hourlyExternal: 0,
          dailyInternal: 0,
          dailyExternal: 0
        },
        documents: room.documents || []
      });
    }
  }, [room, methods]);

  const onSubmit = async (data: RoomFormValues) => {
    if (!room) return;
    setIsSubmitting(true);
    
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedRoom: Room = {
      ...room,
      roomName: data.roomName,
      roomNumber: data.roomNumber,
      building: data.building,
      category: data.category,
      capacity: Number(data.capacity),
      image: data.image || room.image,
      status: data.status,
      equipment: data.equipment || [],
      notes: data.notes,
      rates: data.rates,
      documents: data.documents || []
    };

    onSave(updatedRoom);
    setIsSubmitting(false);
    onClose();
    alert("แก้ไขข้อมูลห้องสำเร็จ!");
  };

  if (!room) return null;

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
            <SheetHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 shrink-0 bg-white text-left">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center">
                  <Pencil size={20} className="text-[#f26522]" strokeWidth={2.5} />
                </div>
                
                <div>
                  <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight">
                    แก้ไขข้อมูลห้อง
                  </SheetTitle>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    รหัสห้องในระบบ: {room.id}
                  </p>
                </div>

                <SheetDescription className="sr-only">
                  แก้ไขแบบฟอร์มข้อมูลห้องด้านล่าง
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
              <RoomFormFields isEdit />
            </div>

            {/* Sticky Footer */}
            <div className="px-6 py-5 border-t border-slate-100 flex items-center gap-4 bg-white/90 backdrop-blur-md shrink-0">
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
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}

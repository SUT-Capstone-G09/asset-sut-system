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
import { bookingSchema, BookingFormValues } from "../../schemas/booking-schema";
import BookingFormFields from "./forms/BookingFormFields";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/lib/context/auth-context";
import { Booking } from "../../types/booking";
import { generateRecurrenceDates } from "../../utils/recurrence";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (newBooking: Booking | Booking[]) => void;
  type: string;
}

export default function BookingCreateDrawer({ open, onClose, onAdd, type }: Props) {
  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema) as any,
    defaultValues: {
      roomName: "",
      roomNumber: "",
      building: "",
      category: "",
      requesterName: "",
      requesterId: "",
      requesterType: "student",
      purpose: "",
      date: "",
      timeSlot: "",
      attendees: 1,
      contactPhone: "",
      contactEmail: "",
      notes: "",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
      equipment: [],
      attachedDocuments: [],
      expenses: [],
      housekeeperPrice: 0,
      housekeeperCount: 0,
      repeat: false,
      repeatFrequency: "daily",
      repeatCustomInterval: 1,
      repeatCustomUnit: "day",
      repeatDaysOfWeek: [],
      repeatEndDateType: "none",
      repeatEndDate: "",
      repeatEndCount: 10
    }
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        roomName: "",
        roomNumber: "",
        building: "",
        category: "",
        requesterName: "",
        requesterId: "",
        requesterType: "student",
        purpose: "",
        date: "",
        timeSlot: "",
        attendees: 1,
        contactPhone: "",
        contactEmail: "",
        notes: "",
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
        equipment: [],
        attachedDocuments: [],
        expenses: [],
        housekeeperPrice: 0,
        housekeeperCount: 0,
        repeat: false,
        repeatFrequency: "daily",
        repeatCustomInterval: 1,
        repeatCustomUnit: "day",
        repeatDaysOfWeek: [],
        repeatEndDateType: "none",
        repeatEndDate: "",
        repeatEndCount: 10
      });
    }
  }, [open, methods]);

  const onSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const randomId = `${type === "classroom" ? "CB" : type === "meeting" ? "MB" : type === "sport" ? "SB" : "HB"}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const formattedDate = now.toLocaleDateString("th-TH") + " " + now.toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' }) + " น.";

    if (data.repeat) {
      const getLocalDateString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const newBooking: Booking = {
        id: randomId,
        roomName: data.roomName,
        roomNumber: data.roomNumber,
        building: data.building,
        category: data.category,
        requesterName: data.requesterName,
        requesterId: data.requesterId,
        requesterType: data.requesterType,
        purpose: data.purpose,
        date: data.date || getLocalDateString(),
        timeSlot: data.timeSlot,
        status: "pending", // default to pending
        attendees: data.attendees,
        image: data.image || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
        createdAt: formattedDate,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        notes: data.notes,
        equipment: data.equipment,
        attachedDocuments: data.attachedDocuments || [],
        expenses: data.expenses || [],
        housekeeperPrice: data.housekeeperPrice || 0,
        housekeeperCount: data.housekeeperCount || 0,
        repeat: true,
        repeatFrequency: data.repeatFrequency,
        repeatCustomInterval: data.repeatCustomInterval,
        repeatCustomUnit: data.repeatCustomUnit,
        repeatDaysOfWeek: data.repeatDaysOfWeek,
        repeatEndDateType: data.repeatEndDateType,
        repeatEndDate: data.repeatEndDate,
        repeatEndCount: data.repeatEndCount,
      };

      onAdd(newBooking);
      setIsSubmitting(false);
      methods.reset();
      onClose();
      alert("ยื่นคำขอจองสำเร็จ! (บันทึกข้อมูลทำซ้ำ)");
    } else {
      const newBooking: Booking = {
        id: randomId,
        roomName: data.roomName,
        roomNumber: data.roomNumber,
        building: data.building,
        category: data.category,
        requesterName: data.requesterName,
        requesterId: data.requesterId,
        requesterType: data.requesterType,
        purpose: data.purpose,
        date: data.date || "",
        timeSlot: data.timeSlot,
        status: "pending", // default to pending
        attendees: data.attendees,
        image: data.image || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
        createdAt: formattedDate,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        notes: data.notes,
        equipment: data.equipment,
        attachedDocuments: data.attachedDocuments || [],
        expenses: data.expenses || [],
        housekeeperPrice: data.housekeeperPrice || 0,
        housekeeperCount: data.housekeeperCount || 0
      };

      onAdd(newBooking);
      setIsSubmitting(false);
      methods.reset();
      onClose();
      alert("ยื่นคำขอจองสำเร็จ!");
    }
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
                  {type === "classroom" ? "ยื่นขอจองห้องเรียน" : type === "meeting" ? "ยื่นขอจองห้องประชุม" : type === "sport" ? "ยื่นขอจองสนามกีฬา" : type === "hall" ? "ยื่นขอจองโถงอาคาร" : "ยื่นขอจองพื้นที่"}
                </SheetTitle>

                <SheetDescription className="sr-only">
                  กรอกข้อมูลรายละเอียดด้านล่างเพื่อทำการขอจองใช้พื้นที่
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
              <BookingFormFields type={type} />
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
                {isSubmitting ? "กำลังบันทึก..." : "ส่งคำขอจอง"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}

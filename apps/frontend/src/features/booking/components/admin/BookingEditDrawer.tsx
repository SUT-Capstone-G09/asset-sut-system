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
import { Booking } from "../../types/booking";
import { bookingSchema, BookingFormValues } from "../../schemas/booking-schema";
import BookingFormFields from "./forms/BookingFormFields";
import { mockRooms } from "../../data/rooms";

interface Props {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedBooking: Booking) => void;
}

const getHoursFromTimeSlot = (timeSlot: string): number => {
  try {
    const match = timeSlot.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
    if (match) {
      const startHour = parseInt(match[1], 10);
      const startMin = parseInt(match[2], 10);
      const endHour = parseInt(match[3], 10);
      const endMin = parseInt(match[4], 10);
      const diffMin = (endHour * 60 + endMin) - (startHour * 60 + startMin);
      return Math.max(1, diffMin / 60);
    }
  } catch (e) {
    console.error("Error parsing time slot:", e);
  }
  return 3; // Default fallback
};

export default function BookingEditDrawer({ booking, open, onClose, onSave }: Props) {
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
      image: "",
      status: "pending",
      equipment: [],
      expenses: [],
      receiptImage: "",
      attachedDocuments: []
    }
  });

  // Pre-fill form when booking details are loaded
  useEffect(() => {
    if (booking) {
      // Find room rates to calculate default room rate for first-time booking
      const room = mockRooms.find(r => r.roomNumber === booking.roomNumber || r.roomName === booking.roomName);
      const isInternal = booking.requesterType === "student" || booking.requesterType === "staff";
      const hourlyRate = isInternal 
        ? (room?.rates?.hourlyInternal ?? 150) 
        : (room?.rates?.hourlyExternal ?? 400);
      const hours = getHoursFromTimeSlot(booking.timeSlot || "");
      
      const defaultExpenses = booking.expenses && booking.expenses.length > 0
        ? booking.expenses
        : [{ name: "ค่าห้องรายชั่วโมง", amount: hourlyRate * hours }];

      methods.reset({
        roomName: booking.roomName || "",
        roomNumber: booking.roomNumber || "",
        building: booking.building || "",
        category: booking.category || "",
        requesterName: booking.requesterName || "",
        requesterId: booking.requesterId || "",
        requesterType: booking.requesterType || "student",
        purpose: booking.purpose || "",
        date: booking.date || "",
        timeSlot: booking.timeSlot || "",
        attendees: booking.attendees || 1,
        contactPhone: booking.contactPhone || "",
        contactEmail: booking.contactEmail || "",
        notes: booking.notes || "",
        image: booking.image || "",
        status: booking.status || "pending",
        equipment: booking.equipment || [],
        expenses: defaultExpenses,
        receiptImage: booking.receiptImage || "",
        attachedDocuments: booking.attachedDocuments || []
      });
    }
  }, [booking, methods]);

  const onSubmit = async (data: BookingFormValues) => {
    if (!booking) return;
    setIsSubmitting(true);
    
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedBooking: Booking = {
      ...booking,
      roomName: data.roomName,
      roomNumber: data.roomNumber,
      building: data.building,
      category: data.category,
      requesterName: data.requesterName,
      requesterId: data.requesterId,
      requesterType: data.requesterType,
      purpose: data.purpose,
      date: data.date,
      timeSlot: data.timeSlot,
      status: data.status || booking.status,
      attendees: data.attendees,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      notes: data.notes,
      image: data.image || booking.image,
      equipment: data.equipment,
      expenses: data.expenses,
      receiptImage: data.receiptImage,
      attachedDocuments: data.attachedDocuments
    };

    onSave(updatedBooking);
    setIsSubmitting(false);
    onClose();
    alert("แก้ไขคำขอจองสำเร็จ!");
  };

  if (!booking) return null;
  const isClassroom = booking.id.startsWith("CB");

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
                    แก้ไขคำขอจองพื้นที่
                  </SheetTitle>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    รหัสการจอง: {booking.id}
                  </p>
                </div>

                <SheetDescription className="sr-only">
                  แก้ไขฟอร์มคำขอจองด้านล่าง
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
              <BookingFormFields isEdit type={isClassroom ? "classroom" : "meeting"} />
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

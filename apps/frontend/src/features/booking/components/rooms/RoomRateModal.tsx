"use client"

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, X, Clock, Calendar, Moon } from "lucide-react";

interface RoomRates {
  hourlyInternal: number;
  hourlyExternal: number;
  hourlyOffPeakInternal: number;
  hourlyOffPeakExternal: number;
  dailyInternal: number;
  dailyExternal: number;
}

// Off-peak fields are optional on input — older/unset rooms may not have them yet.
type RoomRatesInput = Omit<RoomRates, "hourlyOffPeakInternal" | "hourlyOffPeakExternal"> &
  Partial<Pick<RoomRates, "hourlyOffPeakInternal" | "hourlyOffPeakExternal">>;

interface RoomRateModalProps {
  open: boolean;
  onClose: () => void;
  initialRates: RoomRatesInput;
  onSave: (rates: RoomRates) => void;
}

export default function RoomRateModal({
  open,
  onClose,
  initialRates,
  onSave,
}: RoomRateModalProps) {
  const normalize = (r: RoomRatesInput): RoomRates => ({
    ...r,
    hourlyOffPeakInternal: r.hourlyOffPeakInternal ?? 0,
    hourlyOffPeakExternal: r.hourlyOffPeakExternal ?? 0,
  });

  const [rates, setRates] = useState<RoomRates>(normalize(initialRates));

  useEffect(() => {
    if (open) {
      setRates(normalize(initialRates));
    }
  }, [open, initialRates]);

  const handleChange = (field: keyof RoomRates, value: string) => {
    const numValue = value === "" ? 0 : Number(value);
    setRates((prev) => ({
      ...prev,
      [field]: numValue >= 0 ? numValue : 0,
    }));
  };

  const handleSubmit = () => {
    onSave(rates);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[480px] rounded-xl p-0 border-none overflow-hidden shadow-2xl bg-white" showCloseButton={false}>
        {/* Header - Orange Theme */}
        <DialogHeader className="bg-[#f26522] px-6 py-5 flex flex-row items-center justify-between text-white shrink-0 relative text-left">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
              <CreditCard size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight text-white">
                ตั้งค่าอัตราค่าใช้จ่าย
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black text-white/70 uppercase tracking-widest mt-0.5">
                Cost Rate Management
              </DialogDescription>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-[7px] text-black hover:bg-black/20 hover:text-black transition-all flex items-center justify-center group cursor-pointer absolute right-4 top-1/2 -translate-y-1/2"
          >
            <X size={18} className="transition-transform group-hover:rotate-90" />
          </button>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-6 text-left">
          {/* Section: Hourly Rate */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-[3px] border-[#f26522] pl-2.5">
              <Clock size={16} className="text-[#f26522]" />
              <h4 className="text-sm font-black text-slate-800">รายชั่วโมง (Hourly Rate)</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400">บุคลากรภายใน (SUT INTERNAL)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={rates.hourlyInternal ?? ""}
                    onChange={(e) => handleChange("hourlyInternal", e.target.value)}
                    placeholder="200"
                    className="rounded-lg h-11 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#f26522]/30 pr-10 font-bold text-slate-700 transition-all pl-3"
                    min="0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">฿</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400">บุคคลภายนอก (EXTERNAL)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={rates.hourlyExternal ?? ""}
                    onChange={(e) => handleChange("hourlyExternal", e.target.value)}
                    placeholder="500"
                    className="rounded-lg h-11 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#f26522]/30 pr-10 font-bold text-slate-700 transition-all pl-3"
                    min="0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">฿</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Off-Peak Hourly Rate */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-[3px] border-[#6d28d9] pl-2.5">
              <Moon size={16} className="text-[#6d28d9]" />
              <h4 className="text-sm font-black text-slate-800">รายชั่วโมงนอกเวลาราชการ (Off-Peak Rate)</h4>
            </div>
            <p className="text-[11px] text-slate-400 -mt-2">นอกช่วง 08:30–16:30 น. — คิดตามสัดส่วนเวลาจริงที่คาบเกี่ยว</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400">บุคลากรภายใน (SUT INTERNAL)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={rates.hourlyOffPeakInternal ?? ""}
                    onChange={(e) => handleChange("hourlyOffPeakInternal", e.target.value)}
                    placeholder="300"
                    className="rounded-lg h-11 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#6d28d9]/30 pr-10 font-bold text-slate-700 transition-all pl-3"
                    min="0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">฿</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400">บุคคลภายนอก (EXTERNAL)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={rates.hourlyOffPeakExternal ?? ""}
                    onChange={(e) => handleChange("hourlyOffPeakExternal", e.target.value)}
                    placeholder="750"
                    className="rounded-lg h-11 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#6d28d9]/30 pr-10 font-bold text-slate-700 transition-all pl-3"
                    min="0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">฿</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Daily Rate */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-[3px] border-[#0284c7] pl-2.5">
              <Calendar size={16} className="text-[#0284c7]" />
              <h4 className="text-sm font-black text-slate-800">รายวัน (Daily Rate)</h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400">บุคลากรภายใน (SUT INTERNAL)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={rates.dailyInternal ?? ""}
                    onChange={(e) => handleChange("dailyInternal", e.target.value)}
                    placeholder="1500"
                    className="rounded-lg h-11 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#f26522]/30 pr-10 font-bold text-slate-700 transition-all pl-3"
                    min="0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">฿</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400">บุคคลภายนอก (EXTERNAL)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={rates.dailyExternal ?? ""}
                    onChange={(e) => handleChange("dailyExternal", e.target.value)}
                    placeholder="3500"
                    className="rounded-lg h-11 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#f26522]/30 pr-10 font-bold text-slate-700 transition-all pl-3"
                    min="0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">฿</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Tinted subtle background */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 h-11 rounded-lg font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 h-11 rounded-lg bg-[#f26522] hover:bg-[#d8561d] text-white font-bold shadow-lg shadow-[#f26522]/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              ยืนยันการตั้งค่า
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

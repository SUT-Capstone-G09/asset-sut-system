"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  UploadCloud, 
  X, 
  Building2, 
  FileText, 
  User 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AdminAreaCreateDrawer({ open, onClose }: Props) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        showCloseButton={false}
        className="w-full sm:max-w-[640px] p-0 border-none bg-white flex flex-col h-full shadow-2xl"
      >
        {/* ===== Sticky Header ===== */}
        <SheetHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#f26522]/10 flex items-center justify-center">
              <Plus size={20} className="text-[#f26522]" strokeWidth={3} />
            </div>
            <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight">
              เพิ่มสถานที่ใหม่
            </SheetTitle>
            <SheetDescription className="sr-only">
              ฟอร์มสำหรับกรอกข้อมูลเพื่อเพิ่มสถานที่เช่าใหม่ในระบบ
            </SheetDescription>
          </div>
          <button 
            onClick={onClose} 
            className="size-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center group"
          >
            <X size={18} className="transition-transform group-hover:rotate-90" />
          </button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">
        
          {/* Section: Upload Image */}
          <div className="space-y-4">
            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
              รูปภาพประกอบ
            </Label>
            <div className="border-2 border-dashed border-slate-200 rounded-[24px] p-12 flex flex-col items-center justify-center gap-4 bg-slate-50 hover:bg-white hover:border-[#f26522]/30 transition-all cursor-pointer group shadow-inner">
              <div className="size-16 rounded-2xl bg-white shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <UploadCloud size={32} className="text-[#f26522]" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-base font-bold text-slate-900">คลิกเพื่ออัปโหลดรูปภาพ</p>
                <p className="text-xs text-slate-400">รองรับ JPG, PNG (สูงสุด 10MB)</p>
              </div>
            </div>
          </div>

          {/* Section: Area Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 text-[#f26522] mb-2">
              <div className="size-7 rounded-lg bg-[#f26522]/10 flex items-center justify-center">
                <Building2 size={16} strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">ข้อมูลพื้นที่</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="room-id" className="text-xs font-bold text-slate-500 ml-1">รหัสห้อง / ชื่อพื้นที่</Label>
                <Input id="room-id" placeholder="ระบุรหัสห้อง เช่น CAF-01" className="rounded-xl h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#f26522]/30 transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-500 ml-1">อาคาร / สถานที่</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-1 focus:ring-[#f26522]/30 transition-all">
                      <SelectValue placeholder="เลือกสถานที่" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prow">โรงอาหารพราวแสดทอง</SelectItem>
                      <SelectItem value="kasalong">โรงอาหารกาสะลองคำ</SelectItem>
                      <SelectItem value="dorm14">หอพักสุรนิเวศ 14</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-500 ml-1">ประเภท</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-1 focus:ring-[#f26522]/30 transition-all">
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="canteen">โรงอาหาร</SelectItem>
                      <SelectItem value="cafe">ร้านกาแฟ</SelectItem>
                      <SelectItem value="shop">ร้านสะดวกซื้อ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-500 ml-1">ขนาดพื้นที่ (ตร.ม.)</Label>
                  <Input type="number" placeholder="0.00" className="rounded-xl h-12 bg-slate-50 border-transparent" />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-500 ml-1">ค่าบำรุง/เดือน (บาท)</Label>
                  <Input type="number" placeholder="0.00" className="rounded-xl h-12 bg-slate-50 border-transparent" />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-slate-500 ml-1">หมายเหตุ</Label>
                <Textarea 
                  placeholder="ระบุรายละเอียดเพิ่มเติม..." 
                  className="rounded-xl min-h-[120px] bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#f26522]/30 transition-all p-4 resize-none" 
                />
              </div>
            </div>
          </div>

          <Separator className="bg-slate-100" />

          {/* Section: Contract Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 text-[#f26522] mb-2">
              <div className="size-7 rounded-lg bg-[#f26522]/10 flex items-center justify-center">
                <FileText size={16} strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">ข้อมูลสัญญา</h3>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-slate-500 ml-1">ชื่อสัญญา</Label>
                <Input placeholder="ระบุชื่อสัญญา" className="rounded-xl h-12 bg-slate-50 border-transparent" />
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-slate-500 ml-1">เลขที่สัญญา</Label>
                <Input placeholder="ระบุเลขที่สัญญา" className="rounded-xl h-12 bg-slate-50 border-transparent" />
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-slate-500 ml-1">วันเริ่มสัญญา</Label>
                <Input type="date" className="rounded-xl h-12 bg-slate-50 border-transparent" />
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-slate-500 ml-1">วันสิ้นสุดสัญญา</Label>
                <Input type="date" className="rounded-xl h-12 bg-slate-50 border-transparent" />
              </div>
            </div>
          </div>

          <Separator className="bg-slate-100" />

          {/* Section: Tenant Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 text-[#f26522] mb-2">
              <div className="size-7 rounded-lg bg-[#f26522]/10 flex items-center justify-center">
                <User size={16} strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">ข้อมูลผู้เช่า</h3>
            </div>
            <div className="space-y-5">
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-slate-500 ml-1">ชื่อบริษัท / ผู้ประกอบการ</Label>
                <Input placeholder="ระบุชื่อผู้เช่า" className="rounded-xl h-12 bg-slate-50 border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-500 ml-1">เบอร์โทรศัพท์</Label>
                  <Input placeholder="0XX-XXX-XXXX" className="rounded-xl h-12 bg-slate-50 border-transparent" />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-500 ml-1">Email</Label>
                  <Input type="email" placeholder="example@email.com" className="rounded-xl h-12 bg-slate-50 border-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Sticky Footer ===== */}
        <div className="px-6 py-5 border-t border-slate-100 flex items-center gap-4 bg-white/90 backdrop-blur-md shrink-0">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="flex-1 h-12 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
          >
            ยกเลิก
          </Button>
          <Button className="flex-1 h-12 rounded-xl bg-[#f26522] hover:bg-[#d8561d] text-white font-bold shadow-lg shadow-[#f26522]/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            บันทึกข้อมูล
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

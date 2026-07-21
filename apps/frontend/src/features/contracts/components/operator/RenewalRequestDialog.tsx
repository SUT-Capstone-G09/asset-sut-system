"use client";

import React from "react";
import { 
  Store, 
  User, 
  Building, 
  Upload,
  FileText,
  CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileDropzone } from "@/components/ui/MultiDropZone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface OperatorRenewalRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tenantType: "individual" | "juristic";
  onTenantTypeChange: (type: "individual" | "juristic") => void;
  businessName: string;
  onBusinessNameChange: (val: string) => void;
  ownerName: string;
  onOwnerNameChange: (val: string) => void;
  subLocation: string;
  contractNo: string;
  expiryDate: string;
  intent: "intend" | "not_intend";
  onIntentChange: (val: "intend" | "not_intend") => void;
  suggestions: string;
  onSuggestionsChange: (val: string) => void;
  taxId: string;
  onTaxIdChange: (val: string) => void;
  phone: string;
  onPhoneChange: (val: string) => void;
  attachedFile: File | null;
  onAttachedFileChange: (file: File | null) => void;
  termsAccepted: boolean;
  onTermsAcceptedChange: (val: boolean) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function OperatorRenewalRequestDialog({
  isOpen,
  onOpenChange,
  tenantType,
  onTenantTypeChange,
  businessName,
  onBusinessNameChange,
  ownerName,
  onOwnerNameChange,
  subLocation,
  contractNo,
  expiryDate,
  intent,
  onIntentChange,
  suggestions,
  onSuggestionsChange,
  taxId,
  onTaxIdChange,
  phone,
  onPhoneChange,
  attachedFile,
  onAttachedFileChange,
  termsAccepted,
  onTermsAcceptedChange,
  isSubmitting,
  onSubmit,
}: OperatorRenewalRequestDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-full sm:h-auto sm:max-w-[500px] bg-white rounded-none sm:rounded-[7px] p-0 overflow-hidden border-none z-130 shadow-2xl flex flex-col max-h-screen sm:max-h-[85vh]">
        <form onSubmit={onSubmit} className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100 shrink-0">
            <DialogTitle className="text-lg font-bold text-slate-900">
              ยื่นคำร้องความประสงค์ขอต่ออายุสัญญา
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              กรอกรายละเอียดความประสงค์ขอต่ออายุสัญญาเช่าพื้นที่เชิงพาณิชย์
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            
            {/* ส่วนที่ 1: ข้อมูลสัญญาและผู้เช่าเดิม */}
            <div className="space-y-3 bg-slate-50/40 p-4 border border-slate-100 rounded-[7px]">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <FileText size={14} className="text-[#f26522]" />
                ข้อมูลสัญญาเช่าเดิม
              </h4>
              <div className="grid grid-cols-2 gap-3.5 pt-1 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">เลขที่สัญญา:</span>
                  <span className="font-bold text-slate-700">{contractNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">จะครบกำหนดสิ้นสุดสัญญา วันที่:</span>
                  <span className="font-bold text-slate-700">{expiryDate}</span>
                </div>
                <div className="col-span-2 pt-1">
                  <span className="text-slate-400 block mb-0.5">สถานที่ประกอบการ:</span>
                  <span className="font-bold text-slate-700">{subLocation}</span>
                </div>
              </div>
            </div>

            {/* ส่วนที่ 2: ข้อมูลผู้ประกอบการและร้านค้า */}
            <div className="space-y-3 bg-slate-50/40 p-4 border border-slate-100 rounded-[7px]">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Store size={14} className="text-[#f26522]" />
                ข้อมูลผู้ประกอบการและร้านค้า
              </h4>
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 block">
                    ชื่อผู้ประกอบการ / ผู้รับมอบอำนาจ
                  </Label>
                  <Input
                    value={ownerName}
                    onChange={(e) => onOwnerNameChange(e.target.value)}
                    className="h-10 bg-white border-slate-200 rounded-[7px] px-3.5 font-semibold text-slate-700 text-sm focus-visible:ring-[#f26522]/30"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 block">
                    ชื่อสถานประกอบการ / ร้านค้า
                  </Label>
                  <Input
                    value={businessName}
                    onChange={(e) => onBusinessNameChange(e.target.value)}
                    className="h-10 bg-white border-slate-200 rounded-[7px] px-3.5 font-semibold text-slate-700 text-sm focus-visible:ring-[#f26522]/30"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 block">
                      เลขผู้เสียภาษี / บัตรประชาชน
                    </Label>
                    <Input
                      value={taxId}
                      onChange={(e) => onTaxIdChange(e.target.value)}
                      className="h-10 bg-white border-slate-200 rounded-[7px] px-3.5 font-semibold text-slate-700 text-sm focus-visible:ring-[#f26522]/30"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 block">
                      เบอร์โทรศัพท์ติดต่อ
                    </Label>
                    <Input
                      value={phone}
                      onChange={(e) => onPhoneChange(e.target.value)}
                      className="h-10 bg-white border-slate-200 rounded-[7px] px-3.5 font-semibold text-slate-700 text-sm focus-visible:ring-[#f26522]/30"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ส่วนที่ 3: ความประสงค์การใช้พื้นที่ */}
            <div className="space-y-3 bg-slate-50/40 p-4 border border-slate-100 rounded-[7px]">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <CheckSquare size={14} className="text-[#f26522]" />
                ความประสงค์การใช้พื้นที่
              </h4>
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onIntentChange("intend")}
                  className={cn(
                    "w-full flex items-start gap-2.5 p-3 border rounded-[7px] text-xs font-bold text-left transition-all cursor-pointer",
                    intent === "intend"
                      ? "border-[#f26522] bg-[#f26522]/5 text-[#f26522]"
                      : "border-slate-200 text-slate-650 hover:bg-slate-50"
                  )}
                >
                  <span className={cn(
                    "size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                    intent === "intend" ? "border-[#f26522] text-[#f26522]" : "border-slate-350"
                  )}>
                    {intent === "intend" && <span className="size-2 rounded-full bg-[#f26522]" />}
                  </span>
                  <span>ประสงค์ จะใช้พื้นที่ดังกล่าว ตามเงื่อนไขที่มหาวิทยาลัยฯ เสนอ</span>
                </button>
                <button
                  type="button"
                  onClick={() => onIntentChange("not_intend")}
                  className={cn(
                    "w-full flex items-start gap-2.5 p-3 border rounded-[7px] text-xs font-bold text-left transition-all cursor-pointer",
                    intent === "not_intend"
                      ? "border-rose-500 bg-rose-500/5 text-rose-600"
                      : "border-slate-200 text-slate-650 hover:bg-slate-50"
                  )}
                >
                  <span className={cn(
                    "size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                    intent === "not_intend" ? "border-rose-500 text-rose-500" : "border-slate-350"
                  )}>
                    {intent === "not_intend" && <span className="size-2 rounded-full bg-rose-500" />}
                  </span>
                  <span>ไม่ประสงค์ จะใช้พื้นที่ดังกล่าว</span>
                </button>
              </div>
            </div>

            {/* ส่วนที่ 4: ข้อเสนอแนะเพิ่มเติม */}
            <div className="space-y-3 bg-slate-50/40 p-4 border border-slate-100 rounded-[7px]">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Building size={14} className="text-[#f26522]" />
                ข้อเสนอแนะเพิ่มเติม
              </h4>
              <div className="space-y-1.5 pt-1">
                <textarea
                  value={suggestions}
                  onChange={(e) => onSuggestionsChange(e.target.value)}
                  placeholder="กรอกข้อเสนอแนะเพิ่มเติม (ถ้ามี)..."
                  className="w-full h-20 p-3 bg-white border border-slate-200 rounded-[7px] text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] resize-none"
                />
              </div>
            </div>

            {/* ประเภทนิติบุคคล / แนบคำร้องเพิ่มเติม */}
            <div className="space-y-3 bg-slate-50/40 p-4 border border-slate-100 rounded-[7px]">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <User size={14} className="text-[#f26522]" />
                รูปแบบการส่งเอกสาร
              </h4>
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 block">
                    ประเภทการดำเนินธุรกิจ
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onTenantTypeChange("individual");
                        onAttachedFileChange(null);
                      }}
                      className={cn(
                        "flex items-center justify-center gap-2 p-2.5 border rounded-[7px] text-xs font-bold transition-all cursor-pointer",
                        tenantType === "individual"
                          ? "border-[#f26522] bg-[#f26522]/5 text-[#f26522]"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      <User size={14} />
                      <span>บุคคลธรรมดา</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onTenantTypeChange("juristic")}
                      className={cn(
                        "flex items-center justify-center gap-2 p-2.5 border rounded-[7px] text-xs font-bold transition-all cursor-pointer",
                        tenantType === "juristic"
                          ? "border-[#f26522] bg-[#f26522]/5 text-[#f26522]"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      <Building size={14} />
                      <span>นิติบุคคล</span>
                    </button>
                  </div>
                </div>

                {tenantType === "juristic" && (
                  <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                    <Label className="text-xs font-bold text-slate-500 block">
                      หนังสือแสดงความประสงค์ขอต่อสัญญาจากต้นสังกัด <span className="text-rose-500">*</span>
                    </Label>
                    <FileDropzone
                      files={attachedFile ? [attachedFile] : []}
                      onFilesChange={(files) => onAttachedFileChange(files.length > 0 ? files[0] : null)}
                      multiple={false}
                      accept=".pdf"
                      hint="คลิกหรือลากวางไฟล์เอกสารเพื่ออัปโหลด (PDF เท่านั้น)"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Declaration Checkbox */}
            <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100">
              <input
                type="checkbox"
                id="accept-terms"
                checked={termsAccepted}
                onChange={(e) => onTermsAcceptedChange(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-[#f26522] focus:ring-[#f26522] cursor-pointer size-4"
                required
              />
              <label htmlFor="accept-terms" className="text-xs text-slate-500 leading-normal select-none cursor-pointer font-semibold">
                ข้าพเจ้ายื่นความประสงค์ขอต่ออายุสัญญาเช่าพื้นที่และยินยอมให้มหาวิทยาลัยตรวจสอบข้อมูลผู้เสียภาษีและประวัติดำเนินการค้าเพื่อพิจารณาอนุมัติ
              </label>
            </div>
          </div>

          <DialogFooter className="p-6 border-t border-slate-100 bg-slate-50 flex flex-row justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-[7px] font-bold text-xs cursor-pointer border-slate-200"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 rounded-[7px] font-bold text-xs text-white bg-[#f26522] hover:bg-[#d8561d] transition-all cursor-pointer flex items-center justify-center min-w-[100px]"
            >
              {isSubmitting ? "กำลังส่งคำร้อง..." : "ส่งคำร้องต่อสัญญา"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

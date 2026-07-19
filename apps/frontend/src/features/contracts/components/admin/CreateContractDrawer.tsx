import React from "react";
import { X, FileText, UploadCloud, CheckCircle, Save, Loader2, AlertTriangle } from "lucide-react";
import { tenantAreaOptions } from "@/features/space-rental/data/tenant-areas";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateContract } from "../../hooks/useCreateContract";
import { mockUsers } from "../../data/mock-users";
import { FileDropzone } from "@/components/ui/file-dropzone";

interface CreateContractDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTenant: any) => void;
  initialAreaId?: string;
  onErrorToast: (message: string) => void;
}

export default function CreateContractDrawer({
  isOpen,
  onClose,
  onSuccess,
  initialAreaId = "cafeterias",
  onErrorToast,
}: CreateContractDrawerProps) {
  const {
    formAreaId,
    setFormAreaId,
    selectedUser,
    setSelectedUser,
    businessName,
    setBusinessName,
    taxId,
    setTaxId,
    phone,
    setPhone,
    nationalId,
    setNationalId,
    registeredAddress,
    setRegisteredAddress,
    selectedAreaObj,
    formSubLocation,
    setFormSubLocation,
    formBusinessType,
    setFormBusinessType,
    monthlyRental,
    setMonthlyRental,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    deposit,
    setDeposit,
    scholarship,
    setScholarship,
    terms,
    setTerms,
    note,
    setNote,
    uploadedFile,
    setUploadedFile,
    uploadedVerificationFile,
    setUploadedVerificationFile,
    showCloseConfirm,
    setShowCloseConfirm,
    isSubmitting,
    handleModalCloseAttempt,
    handleForceClose,
    handleCreateContractSubmit,
  } = useCreateContract({
    isOpen,
    onClose,
    onSuccess,
    initialAreaId,
    onErrorToast,
  });

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleModalCloseAttempt}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:max-w-[640px] p-0 border-none bg-white flex flex-col h-full shadow-2xl z-120 animate-in slide-in-from-right duration-300"
        >
          <form onSubmit={handleCreateContractSubmit} className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-[7px] bg-brand-primary-50 flex items-center justify-center">
                  <FileText size={20} className="text-brand-primary" strokeWidth={3} />
                </div>

                <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight">
                  สร้างสัญญาใหม่
                </SheetTitle>

                <SheetDescription className="sr-only">
                  กรอกข้อมูลสัญญาเช่าเพื่ออัปเดตสิทธิ์ผู้ประกอบการ
                </SheetDescription>
              </div>

              {/* Close Button */}
              <Button
                type="button"
                variant="ghost"
                onClick={handleModalCloseAttempt}
                className="size-9 p-0 rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center group"
              >
                <X size={18} className="transition-transform group-hover:rotate-90" />
              </Button>
            </SheetHeader>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              {/* ส่วนที่ 0: เลือกพื้นที่หลักสำหรับการเช่า */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 border-l-4 border-brand-primary pl-2.5">
                  เลือกพื้นที่จัดทำสัญญา
                </h4>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                    พื้นที่เช่าหลัก (Location Area)
                  </Label>
                  <Select value={formAreaId} onValueChange={setFormAreaId}>
                    <SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm font-semibold text-slate-700 h-11">
                      <SelectValue placeholder="เลือกพื้นที่เช่าหลัก" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className="rounded-md bg-white z-130">
                      {tenantAreaOptions.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* ส่วนที่ 1: ข้อมูลผู้ประกอบการ */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 border-l-4 border-brand-primary pl-2.5">
                  ข้อมูลส่วนตัวผู้ประกอบการ
                </h4>

                {/* Select User (Owner) */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    เลือกผู้ใช้งานที่จะเป็นคู่สัญญา (User)
                  </Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm font-semibold text-slate-700 h-11">
                      <SelectValue placeholder="เลือกผู้ใช้งาน" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className="rounded-md bg-white z-130">
                      {mockUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Business Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      ชื่อร้านค้า / แบรนด์
                    </Label>
                    <Input
                      type="text"
                      placeholder="เช่น ข้าวมันไก่เฮียอ้วน"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="font-semibold"
                      required
                    />
                  </div>

                  {/* Tax ID */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      เลขประจำตัวผู้เสียภาษี
                    </Label>
                    <Input
                      type="text"
                      placeholder="เลข 13 หลัก"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      เบอร์โทรศัพท์ติดต่อ
                    </Label>
                    <Input
                      type="tel"
                      placeholder="เช่น 0812345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="font-semibold"
                      required
                    />
                  </div>

                  {/* National ID */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      เลขบัตรประชาชน (13 หลัก)
                    </Label>
                    <Input
                      type="text"
                      placeholder="เลขบัตรประชาชนผู้ประกอบการ"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Registered Address */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    ที่อยู่จดทะเบียนร้านค้า
                  </Label>
                  <Textarea
                    placeholder="ที่อยู่ตามหน้าบัตรประชาชน หรือทะเบียนบ้าน..."
                    value={registeredAddress}
                    onChange={(e) => setRegisteredAddress(e.target.value)}
                    className="font-semibold min-h-[85px]"
                    required
                  />
                </div>
              </div>

              {/* ส่วนที่ 2: ข้อมูลพื้นที่เช่าย่อยและประเภทธุรกิจ */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 border-l-4 border-brand-primary pl-2.5">
                  การจองพื้นที่และประเภทธุรกิจ
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Sub location */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      พื้นที่เช่าย่อย (Sub-location)
                    </Label>
                    <Select value={formSubLocation} onValueChange={setFormSubLocation}>
                      <SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm font-semibold text-slate-700 h-11">
                        <SelectValue placeholder="เลือกพื้นที่เช่าย่อย" />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={4} className="rounded-md bg-white z-130">
                        {selectedAreaObj.subLocations.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Business Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      ประเภทธุรกิจ (Business Type)
                    </Label>
                    <Select value={formBusinessType} onValueChange={setFormBusinessType}>
                      <SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm font-semibold text-slate-700 h-11">
                        <SelectValue placeholder="เลือกประเภทธุรกิจ" />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={4} className="rounded-md bg-white z-130">
                        {selectedAreaObj.businessTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* ส่วนที่ 3: ข้อมูลสัญญาและจำนวนเงิน */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 border-l-4 border-brand-primary pl-2.5">
                  ข้อมูลสัญญาเช่าและการเงิน
                </h4>

                <div className="grid grid-cols-3 gap-4">
                  {/* Monthly Rental */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      ค่าบำรุงเช่า / เดือน
                    </Label>
                    <Input
                      type="number"
                      value={monthlyRental}
                      onChange={(e) => setMonthlyRental(e.target.value)}
                      className="font-semibold"
                      required
                    />
                  </div>

                  {/* Deposit */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      หลักประกันสัญญา (บาท)
                    </Label>
                    <Input
                      type="number"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      className="font-semibold"
                      />
                  </div>

                  {/* Scholarship */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      ทุนการศึกษาสนับสนุน
                    </Label>
                    <Input
                      type="number"
                      value={scholarship}
                      onChange={(e) => setScholarship(e.target.value)}
                      className="font-semibold"
                      />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      วันที่เริ่มต้นสัญญา
                    </Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="font-semibold"
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      วันที่สิ้นสุดสัญญา
                    </Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Special Terms */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    เงื่อนไขสัญญาเพิ่มเติม
                  </Label>
                  <Textarea
                    placeholder="เช่น ต้องเปิดร้านขายสินค้าสัปดาห์ละ 6 วันเป็นอย่างน้อย..."
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    className="font-semibold min-h-[70px]"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    หมายเหตุอื่น ๆ
                  </Label>
                  <Input
                    type="text"
                    placeholder="หมายเหตุกระบวนการปฏิบัติการ..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="font-semibold"
                  />
                </div>
              </div>

              {/* ส่วนที่ 4: อัปโหลดเอกสารสัญญาเช่าหลัก */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 border-l-4 border-brand-primary pl-2.5">
                  เอกสารแนบประกอบ
                </h4>

                {/* Verification File Dropzone */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-slate-555 block uppercase tracking-wider">
                    เอกสารใบสมัครประกอบการค้าและบัตรประชาชนคู่สัญญา <span className="text-rose-500">*</span>
                  </Label>
                  <FileDropzone
                    files={uploadedVerificationFile ? [uploadedVerificationFile] : []}
                    onFilesChange={(files) => setUploadedVerificationFile(files.length > 0 ? files[0] : null)}
                    multiple={false}
                    accept=".pdf,.png,.jpg,.jpeg"
                    hint="คลิกหรือลากวางสำเนาบัตรประชาชน/ใบสมัคร (PDF, PNG, JPG)"
                  />
                </div>

                {/* Signed Contract Dropzone */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-slate-555 block uppercase tracking-wider">
                    เอกสารสัญญาเช่าหลักฉบับทางการที่ลงนามแล้ว <span className="text-rose-500">*</span>
                  </Label>
                  <FileDropzone
                    files={uploadedFile ? [uploadedFile] : []}
                    onFilesChange={(files) => setUploadedFile(files.length > 0 ? files[0] : null)}
                    multiple={false}
                    accept=".pdf"
                    hint="คลิกหรือลากวางเอกสารสัญญาเช่าที่ลงนามแล้ว (PDF)"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="px-6 py-5 border-t border-slate-100 flex items-center gap-4 bg-white/90 backdrop-blur-md shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={handleModalCloseAttempt}
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-[7px] font-bold text-slate-400 hover:text-slate-655 hover:bg-slate-50 transition-all"
              >
                ยกเลิก
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-[7px] bg-brand-primary hover:bg-brand-primary-600 text-white font-bold shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกสัญญา"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* ACCIDENTAL EXIT CONFIRMATION ALERT */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-130 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
            onClick={() => setShowCloseConfirm(false)}
          />
          <div className="relative bg-white rounded-[7px] w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200 z-140">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h4 className="text-lg font-bold text-slate-855 mb-2">ยืนยันการยกเลิก</h4>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              คุณต้องการปิดหน้าต่างนี้ใช่หรือไม่? ข้อมูลสัญญาเช่าและไฟล์ที่คุณแนบไว้ทั้งหมดจะสูญหาย
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="destructive"
                onClick={handleForceClose}
                className="flex-1 font-bold py-2.5 rounded-[7px] text-sm shadow-sm h-auto cursor-pointer"
              >
                ยืนยันปิดฟอร์ม
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCloseConfirm(false)}
                className="flex-1 text-slate-650 font-bold py-2.5 rounded-[7px] text-sm h-auto cursor-pointer"
              >
                กรอกข้อมูลต่อ
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


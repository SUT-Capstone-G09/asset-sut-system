import React from "react";
import { X, FileText, UploadCloud, CheckCircle, Save, Loader2, AlertTriangle } from "lucide-react";
import { tenantAreaOptions } from "@/features/tenants/data/tenant-areas";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCreateContract } from "../../hooks/useCreateContract";
import { mockUsers } from "../../data/mock-users";

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
              <button
                type="button"
                onClick={handleModalCloseAttempt}
                className="size-9 rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center group"
              >
                <X size={18} className="transition-transform group-hover:rotate-90" />
              </button>
            </SheetHeader>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              {/* ส่วนที่ 0: เลือกพื้นที่หลักสำหรับการเช่า */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 border-l-4 border-brand-primary pl-2.5">
                  เลือกพื้นที่จัดทำสัญญา
                </h4>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-505 block uppercase tracking-wider">
                    พื้นที่เช่าหลัก (Location Area)
                  </label>
                  <select
                    value={formAreaId}
                    onChange={(e) => setFormAreaId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
                  >
                    {tenantAreaOptions.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ส่วนที่ 1: ข้อมูลผู้ประกอบการ */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 border-l-4 border-brand-primary pl-2.5">
                  ข้อมูลส่วนตัวผู้ประกอบการ
                </h4>

                {/* Select User (Owner) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    เลือกผู้ใช้งานที่จะเป็นคู่สัญญา (User)
                  </label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
                  >
                    {mockUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Business Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      ชื่อร้านค้า / แบรนด์
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น ข้าวมันไก่เฮียอ้วน"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                      required
                    />
                  </div>

                  {/* Tax ID */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      เลขประจำตัวผู้เสียภาษี
                    </label>
                    <input
                      type="text"
                      placeholder="เลข 13 หลัก"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      เบอร์โทรศัพท์ติดต่อ
                    </label>
                    <input
                      type="tel"
                      placeholder="เช่น 0812345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                      required
                    />
                  </div>

                  {/* National ID */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      เลขบัตรประชาชน (13 หลัก)
                    </label>
                    <input
                      type="text"
                      placeholder="เลขบัตรประชาชนผู้ประกอบการ"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                      required
                    />
                  </div>
                </div>

                {/* Registered Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    ที่อยู่จดทะเบียนร้านค้า
                  </label>
                  <textarea
                    placeholder="ที่อยู่ตามหน้าบัตรประชาชน หรือทะเบียนบ้าน..."
                    value={registeredAddress}
                    onChange={(e) => setRegisteredAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[7px] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700 placeholder:text-slate-300 min-h-[85px] resize-none"
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      พื้นที่เช่าย่อย (Sub-location)
                    </label>
                    <select
                      value={formSubLocation}
                      onChange={(e) => setFormSubLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
                    >
                      {selectedAreaObj.subLocations.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Business Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      ประเภทธุรกิจ (Business Type)
                    </label>
                    <select
                      value={formBusinessType}
                      onChange={(e) => setFormBusinessType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
                    >
                      {selectedAreaObj.businessTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      ค่าบำรุงเช่า / เดือน
                    </label>
                    <input
                      type="number"
                      value={monthlyRental}
                      onChange={(e) => setMonthlyRental(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
                      required
                    />
                  </div>

                  {/* Deposit */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      หลักประกันสัญญา (บาท)
                    </label>
                    <input
                      type="number"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
                    />
                  </div>

                  {/* Scholarship */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      ทุนการศึกษาสนับสนุน
                    </label>
                    <input
                      type="number"
                      value={scholarship}
                      onChange={(e) => setScholarship(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      วันที่เริ่มต้นสัญญา
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      วันที่สิ้นสุดสัญญา
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
                      required
                    />
                  </div>
                </div>

                {/* Special Terms */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    เงื่อนไขสัญญาเพิ่มเติม
                  </label>
                  <textarea
                    placeholder="เช่น ต้องเปิดร้านขายสินค้าสัปดาห์ละ 6 วันเป็นอย่างน้อย..."
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[7px] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-700 min-h-[70px] resize-none"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    หมายเหตุอื่น ๆ
                  </label>
                  <input
                    type="text"
                    placeholder="หมายเหตุกระบวนการปฏิบัติการ..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-700"
                  />
                </div>
              </div>

              {/* ส่วนที่ 4: อัปโหลดเอกสารสัญญาเช่าหลัก */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 border-l-4 border-brand-primary pl-2.5">
                  เอกสารแนบประกอบ
                </h4>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-555 block uppercase tracking-wider">
                    เอกสารใบสมัครประกอบการค้าและบัตรประชาชนคู่สัญญา <span className="text-rose-500">*</span>
                  </label>
                  <div
                    className={cn(
                      "relative rounded-2xl p-6 border-2 border-dashed flex flex-col items-center justify-center text-center transition-all min-h-[110px]",
                      uploadedVerificationFile
                        ? "border-success-500 bg-success-50/10"
                        : "border-slate-200 bg-slate-50/50"
                    )}
                  >
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadedVerificationFile({ name: e.target.files[0].name, size: "1.2 MB" });
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {uploadedVerificationFile ? (
                      <div>
                        <CheckCircle size={20} className="text-success-500 mx-auto mb-1" />
                        <p className="text-xs font-black text-slate-800">{uploadedVerificationFile.name}</p>
                      </div>
                    ) : (
                      <div>
                        <UploadCloud size={20} className="text-slate-400 mx-auto mb-1" />
                        <p className="text-xs font-bold text-slate-700">
                          คลิกเพื่ออัปโหลดสำเนาบัตรประชาชนคู่สัญญา
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-555 block uppercase tracking-wider">
                    เอกสารสัญญาเช่าหลักฉบับทางการที่ลงนามแล้ว <span className="text-rose-500">*</span>
                  </label>
                  <div
                    className={cn(
                      "relative rounded-2xl p-6 border-2 border-dashed flex flex-col items-center justify-center text-center transition-all min-h-[110px]",
                      uploadedFile ? "border-success-500 bg-success-50/10" : "border-slate-200 bg-slate-50/50"
                    )}
                  >
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadedFile({ name: e.target.files[0].name, size: "2.4 MB" });
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {uploadedFile ? (
                      <div>
                        <CheckCircle size={20} className="text-success-500 mx-auto mb-1" />
                        <p className="text-xs font-black text-slate-800">{uploadedFile.name}</p>
                      </div>
                    ) : (
                      <div>
                        <UploadCloud size={20} className="text-slate-400 mx-auto mb-1" />
                        <p className="text-xs font-bold text-slate-700">
                          คลิกเพื่ออัปโหลดเอกสารสัญญาลงนาม (PDF)
                        </p>
                      </div>
                    )}
                  </div>
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
          <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200 z-140">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h4 className="text-lg font-bold text-slate-855 mb-2">ยืนยันการยกเลิก</h4>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              คุณต้องการปิดหน้าต่างนี้ใช่หรือไม่? ข้อมูลสัญญาเช่าและไฟล์ที่คุณแนบไว้ทั้งหมดจะสูญหาย
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleForceClose}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                ยืนยันปิดฟอร์ม
              </button>
              <button
                type="button"
                onClick={() => setShowCloseConfirm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                กรอกข้อมูลต่อ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React from "react";
import {
  ChevronLeft,
  CheckCircle,
  Ban,
  RefreshCw,
  UploadCloud,
  ArrowRight,
  Printer,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import TenantProfileSummary from "./TenantProfileSummary";
import ActiveContractSummary from "./ActiveContractSummary";
import { useContractActions } from "../../hooks/useContractActions";
import { mockBuildings } from "@/features/space-rental/data/mock-buildings";
import { mockLocations } from "@/features/space-rental/data/mock-rental-spaces";
import { tenantAreaOptions } from "@/features/space-rental/data/tenant-areas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function AdminContractActionsView() {
  const {
    router,
    actionType,
    setActionType,
    tenant,
    area,
    areaId,
    activeContract,
    renewStartDate,
    setRenewStartDate,
    renewEndDate,
    setRenewEndDate,
    renewRental,
    setRenewRental,
    renewDeposit,
    setRenewDeposit,
    renewScholarship,
    setRenewScholarship,
    renewTerms,
    setRenewTerms,
    renewNote,
    setRenewNote,
    renewFile,
    terminateDate,
    setTerminateDate,
    terminateReason,
    setTerminateReason,
    refundDeposit,
    setRefundDeposit,
    terminateFile,
    isDragging,
    isSubmitting,
    isSuccess,
    generatedContractNo,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSubmit,
    hasSingleActiveContract
  } = useContractActions();

  if (!tenant) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold">
        ไม่พบข้อมูลผู้ประกอบการรายนี้ในระบบ
      </div>
    );
  }

  // Success view overlay
  if (isSuccess) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300 pt-16">
        <div className="bg-white rounded-[7px] border border-slate-100 p-12 text-center shadow-xl space-y-6">
          <div className={cn(
            "w-20 h-20 rounded-[7px] flex items-center justify-center mx-auto shadow-lg",
            actionType === "renew" 
              ? "bg-success-50 text-success-500 shadow-success-100" 
              : "bg-error-50 text-error-500 shadow-error-100"
          )}>
            {actionType === "renew" ? <CheckCircle size={44} /> : <Ban size={44} />}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {actionType === "renew" ? "ต่ออายุสัญญาสำเร็จ!" : "บอกเลิกสัญญาเช่าสำเร็จ!"}
            </h1>
            <p className="text-slate-400 text-sm">
              {actionType === "renew" 
                ? `ระบบได้ออกหมายเลขกำกับสัญญาใหม่คือ ${generatedContractNo} เรียบร้อยแล้ว`
                : "สัญญาสถานะถูกปรับเป็นยกเลิกแล้วในระบบฐานข้อมูล"}
            </p>
          </div>

          {actionType === "terminate" && hasSingleActiveContract && (
            <div className="bg-warning-50/50 border border-warning-200 rounded-[7px] p-5 text-left flex items-start gap-3">
              <ShieldAlert className="text-warning-650 shrink-0 mt-0.5" size={20} />
              <div className="space-y-1">
                <span className="text-xs font-bold text-warning-700 block">ระบบเปลี่ยนสิทธิ์ผู้ใช้เป็นปกติ (Role Demoted)</span>
                <p className="text-xs text-warning-600 leading-relaxed font-semibold">
                  เนื่องจากผู้เช่า {tenant.ownerName} ไม่เหลือสัญญาอื่นๆ ที่มีผลใช้งานอยู่ ระบบได้ทำการเปลี่ยนสิทธิ์จากผู้ประกอบการ (Tenant) กลับเป็นผู้ใช้ธรรมดา (User) อัตโนมัติเรียบร้อยแล้ว
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
            <Button
              onClick={() => {
                const parts = tenant.id.split("-");
                const subLocationIndex = Number(parts[1]);
                const area = tenantAreaOptions.find((a) => a.id === areaId);
                const subLocationName = area?.subLocations[subLocationIndex];
                
                const building = mockBuildings.find((b) => b.name === subLocationName);
                if (building) {
                  const space = mockLocations.find(
                    (l) => l.building === subLocationName && 
                    (l.tenantName === tenant.name || l.name === tenant.name)
                  );
                  if (space) {
                    router.push(`/admin/space-rental/building/${building.id}/space/${space.id}`);
                  } else {
                    router.push(`/admin/space-rental/building/${building.id}`);
                  }
                } else {
                  router.push("/admin/space-rental");
                }
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-11 rounded-[7px] text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              กลับหน้ารายละเอียดและประวัติผู้ประกอบการ
              <ArrowRight size={14} />
            </Button>

            <Button
              onClick={() => router.push("/admin/contracts")}
              variant="outline"
              className="w-full h-11 rounded-[7px] font-medium text-xs border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              กลับหน้าสัญญาเช่าทั้งหมด
            </Button>

            <Button
              onClick={() => window.print()}
              variant="secondary"
              className="w-full h-11 rounded-[7px] text-slate-600 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer size={14} />
              พิมพ์เอกสารยืนยันรายการ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* Header Row */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          onClick={() => router.back()}
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-[7px] cursor-pointer"
        >
          <ChevronLeft size={20} />
        </Button>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          จัดการสัญญารายผู้ประกอบการ
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          ทำเรื่องขอต่ออายุสัญญาเช่า หรือจัดเตรียมแจ้งหนังสือบอกเลิกสัญญาตามความจำนง
        </p>
      </div>

      {/* Grid: Left Summary, Right interactive form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Summary info Card (5 of 12) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Tenant profile block */}
          <TenantProfileSummary tenant={tenant} areaName={area.name} />

          {/* Current Contract specs */}
          {activeContract && (
            <ActiveContractSummary activeContract={activeContract} />
          )}

        </div>

        {/* Right Side: Interactive Action Form (7 of 12) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Action Choice Tabs */}
          <div className="bg-white rounded-[7px] border border-slate-100 p-1.5 shadow-sm flex gap-1">
            <Button
              type="button"
              onClick={() => setActionType("renew")}
              variant={actionType === "renew" ? "default" : "ghost"}
              className={cn(
                "flex-1 h-11 px-6 rounded-[7px] text-xs font-medium transition-all gap-2 cursor-pointer",
                actionType === "renew"
                  ? "bg-[#f26522] hover:bg-[#d8561d] text-white shadow-md shadow-[#f26522]/10"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <RefreshCw size={14} />
              ทำเรื่องต่อสัญญา (Renew Contract)
            </Button>

            <Button
              type="button"
              onClick={() => setActionType("terminate")}
              variant={actionType === "terminate" ? "destructive" : "ghost"}
              className={cn(
                "flex-1 h-11 px-6 rounded-[7px] text-xs font-medium transition-all gap-2 cursor-pointer",
                actionType === "terminate"
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/10"
                  : "text-slate-500 hover:text-rose-600 hover:bg-rose-50/50"
              )}
            >
              <Ban size={14} />
              ยกเลิกสัญญา (Terminate Lease)
            </Button>
          </div>

          {/* Form container */}
          <form onSubmit={handleSubmit} className="bg-white rounded-[7px] p-8 border border-slate-100 shadow-sm space-y-6">
            
            {/* Form Fields: Renew Mode */}
            {actionType === "renew" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-3">
                  ข้อมูลสำหรับการทำสัญญาฉบับใหม่
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-500 block uppercase tracking-wider">วันเริ่มสัญญาใหม่</Label>
                    <Input
                      type="date"
                      value={renewStartDate}
                      onChange={(e) => setRenewStartDate(e.target.value)}
                      className="h-11 bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-500 block uppercase tracking-wider">วันครบสัญญาใหม่</Label>
                    <Input
                      type="date"
                      value={renewEndDate}
                      onChange={(e) => setRenewEndDate(e.target.value)}
                      className="h-11 bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-500 block uppercase tracking-wider">ค่าเช่า / เดือน</Label>
                    <Input
                      type="number"
                      value={renewRental}
                      onChange={(e) => setRenewRental(Number(e.target.value))}
                      className="h-11 bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary font-semibold text-slate-700"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-500 block uppercase tracking-wider">หลักประกัน (บาท)</Label>
                    <Input
                      type="number"
                      value={renewDeposit}
                      onChange={(e) => setRenewDeposit(Number(e.target.value))}
                      className="h-11 bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary font-semibold text-slate-700"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-500 block uppercase tracking-wider">ทุนการศึกษา (บาท)</Label>
                    <Input
                      type="number"
                      value={renewScholarship}
                      onChange={(e) => setRenewScholarship(Number(e.target.value))}
                      className="h-11 bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary font-semibold text-slate-700"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 block uppercase tracking-wider">เงื่อนไขเพิ่มเติมประกอบสัญญา</Label>
                  <Textarea
                    value={renewTerms}
                    onChange={(e) => setRenewTerms(e.target.value)}
                    placeholder="ระบุข้อกำหนดเพิ่มเติมทางกฎหมาย หรือข้อตกลงพิเศษอื่นๆ..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-[7px] p-3 text-sm focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary font-semibold text-slate-700 min-h-[70px] resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 block uppercase tracking-wider">หมายเหตุปฏิบัติการ</Label>
                  <Input
                    type="text"
                    value={renewNote}
                    onChange={(e) => setRenewNote(e.target.value)}
                    placeholder="หมายเหตุกระบวนการยื่นต่อสัญญาเช่า..."
                    className="h-11 bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary font-semibold text-slate-700"
                  />
                </div>

                {/* Upload signed lease contract */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 block uppercase tracking-wider">
                    อัปโหลดเอกสารสัญญาเช่าที่ลงนามแล้ว (PDF/JPG) <span className="text-rose-500">*</span>
                  </Label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "relative rounded-[7px] p-8 border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[160px]",
                      isDragging
                        ? "border-brand-primary bg-brand-primary/5"
                        : renewFile
                          ? "border-success-500 bg-success-50/10"
                          : "border-slate-200 hover:border-[#f26522] bg-slate-50/50"
                    )}
                  >
                    <input
                      type="file"
                      id="renew-file-input"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    
                    {renewFile ? (
                      <div className="space-y-2">
                        <CheckCircle size={28} className="text-success-500 mx-auto" />
                        <div>
                          <p className="text-xs font-black text-slate-800">{renewFile.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{renewFile.size}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <UploadCloud size={28} className="text-slate-400 mx-auto" />
                        <div>
                          <p className="text-xs font-bold text-slate-750">ลากไฟล์สแกนสัญญาลงนามมาวาง หรือคลิกเพื่ออัปโหลด</p>
                          <p className="text-[10px] text-slate-400 mt-1">รองรับไฟล์รูปแบบ PDF, JPG, PNG ขนาดสูงสุด 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields: Terminate Mode */}
            {actionType === "terminate" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-3">
                  ข้อมูลการขอบอกเลิกสัญญาเช่า
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-500 block uppercase tracking-wider">วันที่มีผลสิ้นสุดสัญญา</Label>
                    <Input
                      type="date"
                      value={terminateDate}
                      onChange={(e) => setTerminateDate(e.target.value)}
                      className="h-11 bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus-visible:ring-error-500/20 focus-visible:border-error-500 font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-500 block uppercase tracking-wider">เงินค้ำประกันที่คืน (บาท)</Label>
                    <Input
                      type="number"
                      value={refundDeposit}
                      onChange={(e) => setRefundDeposit(Number(e.target.value))}
                      className="h-11 bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus-visible:ring-error-500/20 focus-visible:border-error-500 font-semibold text-slate-700"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 block uppercase tracking-wider">
                    สาเหตุ/เหตุผลประกอบการยกเลิกสัญญา <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    value={terminateReason}
                    onChange={(e) => setTerminateReason(e.target.value)}
                    placeholder="ระบุเหตุผลในการบอกเลิกสัญญา เช่น เลิกกิจการ, ทำงานผิดสัญญา, หมดสัญญาก่อนกำหนด..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-[7px] p-3.5 text-sm focus-visible:ring-error-500/20 focus-visible:border-error-500 font-semibold text-slate-700 min-h-[90px] resize-none"
                    required
                  />
                </div>

                {/* Upload cancellation document */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 block uppercase tracking-wider">
                    หนังสือยื่นคำร้องขอยกเลิก (ถ้ามี)
                  </Label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "relative rounded-[7px] p-8 border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[140px]",
                      isDragging
                        ? "border-error-500 bg-error-500/5"
                        : terminateFile
                          ? "border-error-500 bg-error-50/10"
                          : "border-slate-200 hover:border-error-500 bg-slate-50/50"
                    )}
                  >
                    <input
                      type="file"
                      id="terminate-file-input"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    
                    {terminateFile ? (
                      <div className="space-y-2">
                        <CheckCircle size={28} className="text-error-500 mx-auto" />
                        <div>
                          <p className="text-xs font-black text-slate-800">{terminateFile.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{terminateFile.size}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <UploadCloud size={28} className="text-slate-400 mx-auto" />
                        <div>
                          <p className="text-xs font-bold text-slate-700">ลากไฟล์เอกสารคำร้องมาวางที่นี่ หรือคลิกเพื่ออัปโหลด</p>
                          <p className="text-[10px] text-slate-400 mt-1">รองรับ PDF, JPG, PNG ขนาดสูงสุด 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Warning Alert regarding user role sync if terminating */}
                {hasSingleActiveContract && (
                  <div className="bg-warning-50 border border-warning-200/80 rounded-[7px] p-5 flex items-start gap-3.5 animate-in slide-in-from-top-2 duration-300">
                    <ShieldAlert className="text-warning-600 shrink-0 mt-0.5" size={20} />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-warning-700 block uppercase tracking-wider">
                        ⚠️ การปรับปรุงสิทธิ์อัตโนมัติ (Automated Role Sync Alert)
                      </span>
                      <p className="text-[11px] text-warning-600 font-semibold leading-relaxed">
                        เนื่องจากคู่สัญญารายนี้ ไม่มีสัญญาการเช่าพื้นที่ active สัญญารายอื่นอีกในระบบ เมื่อท่านยืนยันบันทึกบอกเลิกสัญญาเช่านี้ <strong>ระบบจะลดระดับสิทธิ์ (Role) ของผู้ใช้งานรายนี้จาก "ผู้ประกอบการ (Tenant)" กลับไปเป็น "ผู้ใช้ทั่วไป (User)" โดยอัตโนมัติ</strong> เพื่อความปลอดภัยของข้อมูล
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Submit & Cancel panel */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "flex-1 h-11 rounded-[7px] text-xs font-medium shadow-md text-white cursor-pointer",
                  actionType === "renew"
                    ? "bg-[#f26522] hover:bg-[#d8561d] shadow-[#f26522]/10"
                    : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10"
                )}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin mr-2" />
                    กำลังประมวลผล...
                  </>
                ) : (
                  <>
                    {actionType === "renew" ? "ยืนยันการต่อสัญญาเช่า" : "ยืนยันการบอกเลิกสัญญาเช่า"}
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={() => router.back()}
                variant="secondary"
                className="h-11 rounded-[7px] text-xs font-medium text-slate-600 cursor-pointer"
              >
                ยกเลิกและย้อนกลับ
              </Button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}

"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Ban,
  Clock,
  Store,
  RefreshCw,
  UploadCloud,
  X,
  FileText,
  DollarSign,
  User,
  Phone,
  Mail,
  ShieldAlert,
  ArrowRight,
  Printer,
  Building
} from "lucide-react";
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";
import { tenantAreaOptions } from "@/features/tenants/data/tenant-areas";
import { generateMockTenants } from "@/features/tenants/data/mock-tenants";
import { cn } from "@/lib/utils";

function ContractActionsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tenantId = searchParams.get("tenantId") || "";
  const queryAction = searchParams.get("action") || "renew";

  // State to track current action type
  const [actionType, setActionType] = useState<"renew" | "terminate">(
    queryAction === "terminate" ? "terminate" : "renew"
  );

  // Locate the tenant and their area information
  const areaId = useMemo(() => {
    return tenantId ? tenantId.split("-")[0] : "cafeterias";
  }, [tenantId]);

  const area = useMemo(() => {
    return tenantAreaOptions.find(a => a.id === areaId) || tenantAreaOptions[0];
  }, [areaId]);

  const allTenantsInArea = useMemo(() => {
    return generateMockTenants(area.id, area.subLocations);
  }, [area]);

  const tenant = useMemo(() => {
    return allTenantsInArea.find(t => t.id === tenantId) || allTenantsInArea[0];
  }, [allTenantsInArea, tenantId]);

  // Extract current active contract details
  const activeContract = useMemo(() => {
    if (!tenant) return null;
    return tenant.contracts?.find(c => c.status === "active" || c.status === "expiring") || {
      id: `ct-${tenant.id}-current`,
      contractNumber: "CT-2024-0089",
      startDate: tenant.contractStartDate || "2024-01-01",
      endDate: tenant.contractEndDate || "2026-12-31",
      monthlyRental: 5000,
      deposit: tenant.deposit || 10000,
      scholarship: tenant.scholarship || 2000,
      terms: tenant.terms || "ต้องเปิดบริการอย่างน้อย 6 วันต่อสัปดาห์ และแต่งกายถูกต้องตามระเบียบที่กำหนด",
      note: tenant.note || "ไม่มีหมายเหตุเพิ่มเติม",
      status: "active" as const
    };
  }, [tenant]);

  // Form States: Renew
  const [renewStartDate, setRenewStartDate] = useState("2026-07-01");
  const [renewEndDate, setRenewEndDate] = useState("2028-06-30");
  const [renewRental, setRenewRental] = useState(activeContract?.monthlyRental || 5000);
  const [renewDeposit, setRenewDeposit] = useState(activeContract?.deposit || 10000);
  const [renewScholarship, setRenewScholarship] = useState(activeContract?.scholarship || 2000);
  const [renewTerms, setRenewTerms] = useState(activeContract?.terms || "");
  const [renewNote, setRenewNote] = useState("");
  const [renewFile, setRenewFile] = useState<{ name: string; size: string } | null>(null);

  // Form States: Terminate
  const [terminateDate, setTerminateDate] = useState(new Date().toISOString().split("T")[0]);
  const [terminateReason, setTerminateReason] = useState("");
  const [refundDeposit, setRefundDeposit] = useState(activeContract?.deposit || 10000);
  const [terminateFile, setTerminateFile] = useState<{ name: string; size: string } | null>(null);

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedContractNo, setGeneratedContractNo] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const fileObj = { name: file.name, size: `${sizeInMB} MB` };
      
      if (actionType === "renew") {
        setRenewFile(fileObj);
      } else {
        setTerminateFile(fileObj);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const fileObj = { name: file.name, size: `${sizeInMB} MB` };

      if (actionType === "renew") {
        setRenewFile(fileObj);
      } else {
        setTerminateFile(fileObj);
      }
    }
  };

  // Submit Action Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (actionType === "renew" && !renewFile) {
      alert("กรุณาอัปโหลดเอกสารสัญญาฉบับใหม่ที่ผ่านการลงนามเรียบร้อยแล้ว");
      return;
    }
    if (actionType === "terminate" && !terminateReason) {
      alert("กรุณาระบุเหตุผลการบอกเลิกสัญญาเช่า");
      return;
    }

    setIsSubmitting(true);

    // Simulate backend response time
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Generate a mock contract number on renew
      if (actionType === "renew") {
        const rand = Math.floor(Math.random() * 900) + 100;
        setGeneratedContractNo(`CT-2026-${rand}`);
      }
    }, 1500);
  };

  // Check if tenant has only 1 active contract
  const hasSingleActiveContract = useMemo(() => {
    if (!tenant || !tenant.contracts) return true;
    const activeContractsCount = tenant.contracts.filter(
      c => c.status === "active" || c.status === "expiring"
    ).length;
    return activeContractsCount <= 1;
  }, [tenant]);

  // Convert Date to Thai Date Format
  const formatThaiDate = (dateStr: string) => {
    const months = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

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
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-12 text-center shadow-xl space-y-6">
          <div className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg",
            actionType === "renew" 
              ? "bg-success-50 text-success-500 shadow-success-100" 
              : "bg-error-50 text-error-550 shadow-error-100"
          )}>
            {actionType === "renew" ? <CheckCircle size={44} /> : <Ban size={44} />}
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {actionType === "renew" ? "ต่ออายุสัญญาสำเร็จ!" : "บอกเลิกสัญญาเช่าสำเร็จ!"}
            </h2>
            <p className="text-slate-400 text-sm">
              {actionType === "renew" 
                ? `ระบบได้ออกหมายเลขกำกับสัญญาใหม่คือ ${generatedContractNo} เรียบร้อยแล้ว`
                : "สัญญาสถานะถูกปรับเป็นยกเลิกแล้วในระบบฐานข้อมูล"}
            </p>
          </div>

          {actionType === "terminate" && hasSingleActiveContract && (
            <div className="bg-warning-50/50 border border-warning-200 rounded-2xl p-5 text-left flex items-start gap-3">
              <ShieldAlert className="text-warning-550 shrink-0 mt-0.5" size={20} />
              <div className="space-y-1">
                <span className="text-xs font-black text-warning-700 block">ระบบเปลี่ยนสิทธิ์ผู้ใช้เป็นปกติ (Role Demoted)</span>
                <p className="text-xs text-warning-600 leading-relaxed font-semibold">
                  เนื่องจากผู้เช่า {tenant.ownerName} ไม่เหลือสัญญาอื่นๆ ที่มีผลใช้งานอยู่ ระบบได้ทำการเปลี่ยนสิทธิ์จากผู้ประกอบการ (Tenant) กลับเป็นผู้ใช้ธรรมดา (User) อัตโนมัติเรียบร้อยแล้ว
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
            <button
              onClick={() => router.push(`/admin/tenants/lists/${areaId}/${tenant.id}`)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
            >
              กลับหน้ารายละเอียดและประวัติผู้ประกอบการ
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => router.push("/admin/contracts")}
              className="w-full bg-white hover:bg-slate-50 text-slate-655 border border-slate-200 font-bold py-3.5 rounded-xl text-xs transition-all"
            >
              กลับหน้าสัญญาเช่าทั้งหมด
            </button>

            <button
              onClick={() => window.print()}
              className="w-full bg-slate-105 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Printer size={14} />
              พิมพ์เอกสารยืนยันรายการ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* Header Row */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ChevronLeft size={20} />
        </button>
        <AssetBreadcrumb
          items={[
            { label: "Admin", href: "/admin" },
            { label: "สัญญาเช่าทั้งหมด", href: "/admin/contracts" },
            { label: "จัดการรายการสัญญา" }
          ]}
        />
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
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-100 pb-3">
              ผู้ประกอบการ / คู่สัญญาเช่า
            </span>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{tenant.ownerName}</h2>
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md">
                {tenant.businessType}
              </span>
            </div>

            <div className="space-y-3.5 pt-2 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2.5">
                <Store size={14} className="text-slate-400 shrink-0" />
                <span>ร้านค้า: {tenant.name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Building size={14} className="text-slate-400 shrink-0" />
                <span>พื้นที่: {area.name} ({tenant.subLocation})</span>
              </div>
              <div className="flex items-center gap-2.5 border-t border-slate-100 pt-3">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <span>เบอร์โทร: {tenant.phone || "081-234-5678"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <span>อีเมล: {tenant.ownerName.includes("สมชาย") ? "somchai.s@outlook.com" : "tenant.owner@outlook.com"}</span>
              </div>
            </div>
          </div>

          {/* Current Contract specs */}
          {activeContract && (
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-100 pb-3">
                สัญญาปัจจุบันที่กำลังใช้อยู่
              </span>

              <div className="space-y-1">
                <span className="text-xs font-black text-slate-400">หมายเลขสัญญา</span>
                <p className="text-lg font-black text-slate-850">{activeContract.contractNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">วันเริ่มสัญญา</span>
                  <span className="text-slate-800 text-sm font-black block">{formatThaiDate(activeContract.startDate)}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">วันหมดสัญญา</span>
                  <span className="text-slate-800 text-sm font-black block">{formatThaiDate(activeContract.endDate)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-650">
                <div className="flex justify-between">
                  <span>ค่าบำรุงเช่ารายเดือน</span>
                  <span className="font-bold text-slate-800">{activeContract.monthlyRental.toLocaleString()} บาท</span>
                </div>
                <div className="flex justify-between">
                  <span>เงินประกันความเสียหาย</span>
                  <span className="font-bold text-slate-800">{activeContract.deposit.toLocaleString()} บาท</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Interactive Action Form (7 of 12) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Action Choice Tabs */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-3 shadow-sm flex">
            <button
              type="button"
              onClick={() => setActionType("renew")}
              className={cn(
                "flex-1 py-4 px-6 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2",
                actionType === "renew"
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/10"
                  : "bg-white text-slate-505 hover:text-slate-800"
              )}
            >
              <RefreshCw size={14} />
              ทำเรื่องต่อสัญญา (Renew Contract)
            </button>

            <button
              type="button"
              onClick={() => setActionType("terminate")}
              className={cn(
                "flex-1 py-4 px-6 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2",
                actionType === "terminate"
                  ? "bg-error-600 text-white shadow-md shadow-error-100"
                  : "bg-white text-slate-505 hover:text-error-600"
              )}
            >
              <Ban size={14} />
              ยกเลิกสัญญา (Terminate Lease)
            </button>
          </div>

          {/* Form container */}
          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
            
            {/* Form Fields: Renew Mode */}
            {actionType === "renew" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <h3 className="text-lg font-black text-slate-800 tracking-tight border-b border-slate-100 pb-3">
                  ข้อมูลสำหรับการทำสัญญาฉบับใหม่
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">วันเริ่มสัญญาใหม่</label>
                    <input
                      type="date"
                      value={renewStartDate}
                      onChange={(e) => setRenewStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">วันครบสัญญาใหม่</label>
                    <input
                      type="date"
                      value={renewEndDate}
                      onChange={(e) => setRenewEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">ค่าเช่า / เดือน</label>
                    <input
                      type="number"
                      value={renewRental}
                      onChange={(e) => setRenewRental(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-700"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">หลักประกัน (บาท)</label>
                    <input
                      type="number"
                      value={renewDeposit}
                      onChange={(e) => setRenewDeposit(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-700"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">ทุนการศึกษา (บาท)</label>
                    <input
                      type="number"
                      value={renewScholarship}
                      onChange={(e) => setRenewScholarship(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-700"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">เงื่อนไขเพิ่มเติมประกอบสัญญา</label>
                  <textarea
                    value={renewTerms}
                    onChange={(e) => setRenewTerms(e.target.value)}
                    placeholder="ระบุข้อกำหนดเพิ่มเติมทางกฎหมาย หรือข้อตกลงพิเศษอื่นๆ..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-700 min-h-[70px] resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">หมายเหตุปฏิบัติการ</label>
                  <input
                    type="text"
                    value={renewNote}
                    onChange={(e) => setRenewNote(e.target.value)}
                    placeholder="หมายเหตุกระบวนการยื่นต่อสัญญาเช่า..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-700"
                  />
                </div>

                {/* Upload signed lease contract */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                    อัปโหลดเอกสารสัญญาเช่าที่ลงนามแล้ว (PDF/JPG) <span className="text-error-500">*</span>
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "relative rounded-2xl p-8 border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[160px]",
                      isDragging
                        ? "border-brand-primary bg-brand-primary/5"
                        : renewFile
                          ? "border-success-500 bg-success-50/10"
                          : "border-slate-200 hover:border-brand-primary bg-slate-50/50"
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
                <h3 className="text-lg font-black text-slate-800 tracking-tight border-b border-slate-100 pb-3">
                  ข้อมูลการขอบอกเลิกสัญญาเช่า
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">วันที่มีผลสิ้นสุดสัญญา</label>
                    <input
                      type="date"
                      value={terminateDate}
                      onChange={(e) => setTerminateDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-error-500/20 focus:border-error-500 font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">เงินค้ำประกันที่คืน (บาท)</label>
                    <input
                      type="number"
                      value={refundDeposit}
                      onChange={(e) => setRefundDeposit(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-error-500/20 focus:border-error-500 font-semibold text-slate-700"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                    สาเหตุ/เหตุผลประกอบการยกเลิกสัญญา <span className="text-error-500">*</span>
                  </label>
                  <textarea
                    value={terminateReason}
                    onChange={(e) => setTerminateReason(e.target.value)}
                    placeholder="ระบุเหตุผลในการบอกเลิกสัญญา เช่น เลิกกิจการ, ทำงานผิดสัญญา, หมดสัญญาก่อนกำหนด..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-error-500/20 focus:border-error-500 font-semibold text-slate-700 min-h-[90px] resize-none"
                    required
                  />
                </div>

                {/* Upload cancellation document */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                    หนังสือยื่นคำร้องขอยกเลิก (ถ้ามี)
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "relative rounded-2xl p-8 border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[140px]",
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
                  <div className="bg-warning-50 border border-warning-200/80 rounded-2xl p-5 flex items-start gap-3.5 animate-in slide-in-from-top-2 duration-300">
                    <ShieldAlert className="text-warning-500 shrink-0 mt-0.5" size={20} />
                    <div className="space-y-1">
                      <span className="text-xs font-black text-warning-700 block uppercase tracking-wider">
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
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "flex-1 font-black py-4 px-6 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md text-white",
                  actionType === "renew"
                    ? "bg-brand-primary hover:bg-brand-primary-600 shadow-brand-primary/10"
                    : "bg-error-600 hover:bg-error-700 shadow-error-100"
                )}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    กำลังประมวลผลรายการฐานข้อมูล...
                  </>
                ) : (
                  <>
                    {actionType === "renew" ? "ยืนยันการต่อสัญญาเช่า" : "ยืนยันการบอกเลิกสัญญาเช่า"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 px-6 rounded-xl text-xs transition-all"
              >
                ยกเลิกและย้อนกลับ
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}

export default function AdminContractsActionsPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-500 font-bold flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="animate-spin text-brand-primary mr-2" />
        กำลังโหลดข้อมูลการจัดการสัญญา...
      </div>
    }>
      <ContractActionsForm />
    </Suspense>
  );
}

"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  RefreshCw,
  Ban,
  Download,
  CheckCircle,
  X,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  User,
  History,
  ZoomIn,
  ZoomOut,
  Save,
  Edit2
} from "lucide-react";
import { RentalSpace } from "@/features/space-rental/types/rental-space";
import { generateMockTenants, MockContract, MockTenant } from "@/features/space-rental/data/mock-tenants";
import { tenantAreaOptions } from "@/features/space-rental/data/tenant-areas";
import { cn } from "@/lib/utils";

interface SingleTenantSectionProps {
  location: RentalSpace;
  onCreateContractClick?: () => void;
}

export default function SingleTenantSection({
  location,
  onCreateContractClick
}: SingleTenantSectionProps) {
  const router = useRouter();

  // Load all mock tenants deterministic list
  const allTenants = useMemo(() => {
    return tenantAreaOptions.flatMap((area) =>
      generateMockTenants(area.id, area.subLocations)
    );
  }, []);

  // Find matching tenant based on tenantName in RentalSpace
  const tenant = useMemo(() => {
    if (!location.tenantName || location.tenantName === "-") return null;
    return allTenants.find((t) => t.name === location.tenantName) || null;
  }, [location.tenantName, allTenants]);

  // States mirroring dev-G09 layout
  const [notes, setNotes] = useState<string>(tenant?.note || "");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [ownerName, setOwnerName] = useState(tenant?.ownerName || "");
  const [phone, setPhone] = useState(tenant?.phone || "");
  const [nationalId, setNationalId] = useState(tenant?.nationalId || "");
  const [email, setEmail] = useState(tenant?.ownerName?.includes("สมชาย") ? "somchai.s@outlook.com" : "tenant.owner@outlook.com");
  const [taxId, setTaxId] = useState(tenant?.taxId || "");
  const [address, setAddress] = useState("111 มหาวิทยาลัยเทคโนโลยีสุรนารี ถ.มหาวิทยาลัย ต.สุรนารี อ.เมือง นครราชสีมา 30000");

  // PDF Preview modal state
  const [selectedPreviewContract, setSelectedPreviewContract] = useState<MockContract | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [zoom, setZoom] = useState<number>(1.0);

  // Toast Notification State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" }>({
    show: false,
    message: "",
    type: "success"
  });

  // Sync state when tenant loads
  useEffect(() => {
    if (tenant) {
      setOwnerName(tenant.ownerName);
      setPhone(tenant.phone || "");
      setNationalId(tenant.nationalId || "");
      setTaxId(tenant.taxId || "");
      setNotes(tenant.note || "");
    }
  }, [tenant]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

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
    const year = date.getFullYear() + 543; // Buddhist Era
    return `${day} ${month} ${year}`;
  };

  // Retrieve current active contract
  const currentContract = useMemo(() => {
    const found = tenant?.contracts?.find(c => c.status === "active" || c.status === "expiring");
    if (found) return found;

    return {
      id: `ct-${location.id}-current`,
      contractNumber: location.contractNumber || `CT-2024-0089`,
      startDate: location.contractEndDate ? "2024-01-01" : "2024-01-01",
      endDate: location.contractEndDate || "2026-12-31",
      monthlyRental: location.price || 5000,
      deposit: tenant?.deposit || 10000,
      scholarship: tenant?.scholarship || 2000,
      terms: tenant?.terms || "ต้องเปิดบริการอย่างน้อย 6 วันต่อสัปดาห์ และแต่งกายถูกต้องตามระเบียบที่กำหนด",
      note: tenant?.note || "ไม่มีหมายเหตุเพิ่มเติม",
      status: "active" as const
    };
  }, [tenant, location]);

  const handleProfileSave = () => {
    if (!ownerName || !phone || !nationalId || !taxId) {
      showToast("กรุณากรอกข้อมูลหลักให้ครบถ้วน", "error");
      return;
    }
    setIsEditingProfile(false);
    showToast("บันทึกการแก้ไขข้อมูลส่วนตัวสำเร็จ", "success");
  };

  const handleProfileCancel = () => {
    setOwnerName(tenant?.ownerName || "");
    setPhone(tenant?.phone || "");
    setNationalId(tenant?.nationalId || "");
    setTaxId(tenant?.taxId || "");
    setIsEditingProfile(false);
  };

  const handleOpenPdfPreview = (contract: MockContract) => {
    setSelectedPreviewContract(contract);
    setIsPreviewModalOpen(true);
  };

  if (!location.tenantName || location.tenantName === "-") {
    return (
      <div className="rounded-[7px] border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
        <p className="text-[13px] font-bold text-slate-400">ยังไม่มีการทำสัญญา (พื้นที่ว่าง)</p>
        <p className="text-[10px] text-slate-400 mt-1">สามารถทำการเพิ่มข้อมูลผู้เช่าได้โดยการมอบสิทธิ์ผู้ประกอบการ</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-[160] flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-[7px] shadow-2xl border border-white/10 animate-in slide-in-from-top-4 duration-300">
          {toast.type === "success" && <CheckCircle className="text-emerald-500" size={20} />}
          {toast.type === "error" && <AlertTriangle className="text-rose-500" size={20} />}
          {toast.type === "info" && <FileText className="text-amber-500" size={20} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Main Grid Layout from dev-G09 (5 Columns Left, 7 Columns Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Profile info, ID verification, and Active contract details (5 of 12) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* ข้อมูลยืนยันตัวตนผู้เช่า (Editable Card) */}
          <div className="bg-white rounded-[7px] p-8 border border-slate-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <span className="text-slate-400 text-sm font-bold tracking-tight">ข้อมูลส่วนตัวผู้ประกอบการ</span>
                
                {isEditingProfile ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleProfileCancel}
                      className="text-xs font-bold px-3 py-1.5 rounded-[7px] bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handleProfileSave}
                      className="text-xs font-bold px-3 py-1.5 rounded-[7px] bg-[#f26522] text-white hover:bg-[#d8561d] transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Save size={12} />
                      บันทึก
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="text-xs font-bold px-3 py-1.5 rounded-[7px] bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60 transition-all flex items-center gap-1"
                  >
                    <Edit2 size={12} />
                    แก้ไขข้อมูล
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <div className="space-y-4 mb-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">ชื่อคู่สัญญา / เจ้าของแบรนด์</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">เบอร์โทรศัพท์</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">เลขประจำตัวประชาชน</label>
                      <input
                        type="text"
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">อีเมลติดต่อ</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">เลขประจำตัวผู้เสียภาษี</label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">ที่อยู่ตามทะเบียนบ้าน</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700 min-h-[70px] resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-6">
                    {location.tenantName}
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">หมายเลขโทรศัพท์</span>
                      <span className="text-slate-700 font-semibold text-sm flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />
                        {phone || "081-234-5678"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">เลขบัตรประชาชน</span>
                      <span className="text-slate-700 font-semibold text-sm flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        {nationalId || "1-3012-00445-67-8"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">อีเมล</span>
                      <span className="text-slate-700 font-semibold text-sm flex items-center gap-2 truncate">
                        <Mail size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{email}</span>
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">เลขประจำตัวผู้เสียภาษี</span>
                      <span className="text-slate-700 font-semibold text-sm flex items-center gap-2">
                        <FileText size={14} className="text-slate-400" />
                        {taxId || "0105560000000"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider mb-2">ที่อยู่ตามทะเบียนบ้าน</span>
                    <span className="text-slate-600 text-xs font-medium leading-relaxed flex items-start gap-2">
                      <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      {address}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Note Section */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">บันทึกเกี่ยวกับผู้เช่า (สำหรับเจ้าหน้าที่)</span>
              <div className="relative">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="เพิ่มข้อมูลบันทึกเกี่ยวกับผู้ประกอบการ..."
                  className="w-full text-slate-700 font-semibold text-sm border border-slate-200 rounded-[7px] p-3 pb-12 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all min-h-[80px] resize-none"
                />
                <button
                  type="button"
                  onClick={() => showToast("บันทึกโน้ตสำเร็จ", "success")}
                  className="absolute right-2.5 bottom-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-[5px] transition-colors shadow-xs cursor-pointer"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>

          {/* บัตรประชาชนตรวจสอบ (ID Verification document block) */}
          <div className="bg-white rounded-[7px] p-6 border border-slate-200/60 shadow-sm space-y-3">
            <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">เอกสารยืนยันตัวตน (สำเนาบัตรประชาชน)</span>
            <div className="relative aspect-video w-full rounded-[6px] overflow-hidden border border-slate-200 bg-slate-950/90 group shadow-inner">
              <Image
                src="/thai_id_mock.png"
                alt="สำเนาบัตรประชาชน"
                fill
                className="object-cover opacity-85 transition-transform duration-500 group-hover:scale-103"
                sizes="(max-width: 768px) 100vw, 30vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/10" />
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-[5px] border border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-white font-medium truncate max-w-[70%]">บัตรประชาชน_{ownerName || location.tenantName}.png</span>
                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  ตรวจสอบแล้ว
                </span>
              </div>
            </div>
          </div>

          {/* สรุปข้อมูลสัญญาเช่าฉบับปัจจุบัน */}
          <div className="bg-white rounded-[7px] p-8 border border-slate-200/60 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-0.5">
                <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">สัญญาปัจจุบัน</span>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                  {currentContract.contractNumber}
                </h3>
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2.5 py-1 rounded-full border",
                currentContract.status === "expiring"
                  ? "bg-amber-50 text-amber-600 border-amber-200"
                  : "bg-emerald-50 text-emerald-600 border-emerald-200"
              )}>
                {currentContract.status === "expiring" ? "ใกล้หมดอายุ" : "ปกติ"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/50 p-4 rounded-[7px] border border-slate-200/60 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">วันเริ่มสัญญา</span>
                <span className="text-slate-800 text-sm font-black">{formatThaiDate(currentContract.startDate)}</span>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-[7px] border border-slate-200/60 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">วันหมดสัญญา</span>
                <span className="text-slate-800 text-sm font-black">{formatThaiDate(currentContract.endDate)}</span>
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">ค่าเช่ารายเดือน</span>
                <span className="text-slate-800 font-black">{currentContract.monthlyRental.toLocaleString()} บาท/เดือน</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3">
                <span className="text-slate-400 font-bold">เงินประกันสัญญา</span>
                <span className="text-slate-800 font-black">{currentContract.deposit.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3">
                <span className="text-slate-400 font-bold">สนับสนุนการศึกษา</span>
                <span className="text-slate-800 font-black">{currentContract.scholarship.toLocaleString()} บาท</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">เงื่อนไขสัญญาเพิ่มเติม</span>
              <p className="text-slate-700 text-xs font-semibold leading-relaxed bg-slate-50 p-3.5 rounded-[7px] border border-slate-200/40">
                {currentContract.terms}
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Contract History Timeline & Navigation Quick-actions (7 of 12) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* ส่วนประวัติสัญญาเช่าย้อนหลัง */}
          <div className="bg-white rounded-[7px] p-8 border border-slate-200/60 shadow-sm flex flex-col h-full min-h-[550px]">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-[5px] bg-[#f26522]/10 text-[#f26522]">
                  <History size={18} />
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">ประวัติสัญญาย้อนหลัง</h3>
              </div>
              <span className="text-xs text-slate-400 font-bold">
                จำนวนสัญญาทั้งหมด {tenant?.contracts?.length || 1} ฉบับ
              </span>
            </div>

            {/* List timeline cards */}
            <div className="flex-1 space-y-5">
              {tenant?.contracts && tenant.contracts.length > 0 ? (
                tenant.contracts.map((contract) => {
                  const isActiveOrExpiring = contract.status === "active" || contract.status === "expiring";
                  return (
                    <div 
                      key={contract.id} 
                      className={cn(
                        "p-5 rounded-[7px] border transition-all relative overflow-hidden flex flex-col md:flex-row justify-between md:items-center gap-4",
                        isActiveOrExpiring
                          ? "bg-slate-50/70 border-[#f26522]/20 hover:border-[#f26522]/40 shadow-xs"
                          : contract.status === "expired"
                            ? "bg-white border-slate-100 hover:border-slate-200/80"
                            : "bg-white border-rose-100 hover:border-rose-200"
                      )}
                    >
                      {/* Decorative status strip */}
                      <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        contract.status === "active"
                          ? "bg-emerald-500"
                          : contract.status === "expiring"
                            ? "bg-amber-500"
                            : contract.status === "expired"
                              ? "bg-slate-300"
                              : "bg-rose-500"
                      )} />

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-700 uppercase">{contract.contractNumber}</span>
                          <span className={cn(
                            "text-[9px] font-bold px-2 py-0.5 rounded-full border",
                            contract.status === "active"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : contract.status === "expiring"
                                ? "bg-amber-50 text-amber-600 border-amber-100"
                                : contract.status === "expired"
                                  ? "bg-slate-100 text-slate-500 border-slate-200"
                                  : "bg-rose-50 text-rose-600 border-rose-100"
                          )}>
                            {contract.status === "active"
                              ? "ใช้งานอยู่"
                              : contract.status === "expiring"
                                ? "ใกล้หมดอายุ"
                                : contract.status === "expired"
                                  ? "หมดอายุ"
                                  : "ยกเลิกแล้ว"}
                          </span>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                          <Calendar size={13} />
                          <span>{formatThaiDate(contract.startDate)} - {formatThaiDate(contract.endDate)}</span>
                        </div>

                        {/* financials */}
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                          <span>ค่าเช่า: {contract.monthlyRental.toLocaleString()} บ./ด.</span>
                          <span>ประกัน: {contract.deposit.toLocaleString()} บ.</span>
                        </div>
                      </div>

                      {/* Detail button */}
                      <button
                        type="button"
                        onClick={() => handleOpenPdfPreview(contract)}
                        className="bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-[7px] px-4 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 transition-all self-start md:self-auto shrink-0 shadow-xs cursor-pointer"
                      >
                        <FileText size={14} />
                        ดูเอกสารสัญญา
                      </button>
                    </div>
                  );
                })
              ) : (
                // Fallback row matching initial tenant schema
                <div className="p-5 rounded-[7px] border border-[#f26522]/20 bg-slate-50/70 flex flex-col md:flex-row justify-between md:items-center gap-4 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-700 uppercase">{currentContract.contractNumber}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-100">
                        ใช้งานอยู่
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                      <Calendar size={13} />
                      <span>{formatThaiDate(currentContract.startDate)} - {formatThaiDate(currentContract.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                      <span>ค่าเช่า: {currentContract.monthlyRental.toLocaleString()} บ./ด.</span>
                      <span>ประกัน: {currentContract.deposit.toLocaleString()} บ.</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenPdfPreview(currentContract as any)}
                    className="bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-[7px] px-4 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 transition-all self-start md:self-auto shrink-0 cursor-pointer"
                  >
                    <FileText size={14} />
                    ดูเอกสารสัญญา
                  </button>
                </div>
              )}
            </div>

            {/* Quick Contract Operations Actions Panel (ต่อสัญญา / ยกเลิก) */}
            <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50 p-6 rounded-[7px] border border-slate-200/60">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">
                การดำเนินการและจัดการสัญญาเช่า (Actions)
              </h4>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/admin/contracts/actions?tenantId=${tenant?.id || "fallback"}&action=renew`)}
                  className="flex-1 bg-[#f26522] hover:bg-[#d8561d] text-white font-bold py-3.5 px-4 rounded-[7px] text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-[#f26522]/10 cursor-pointer"
                >
                  <RefreshCw size={14} />
                  ทำเรื่องต่ออายุสัญญาเช่า
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/admin/contracts/actions?tenantId=${tenant?.id || "fallback"}&action=terminate`)}
                  className="flex-1 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 font-bold py-3.5 px-4 rounded-[7px] text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Ban size={14} />
                  บอกเลิกสัญญาเช่าปัจจุบัน
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* PDF DOCUMENT PREVIEW MODAL */}
      {selectedPreviewContract && isPreviewModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsPreviewModalOpen(false)}
          />

          <div className="relative bg-white rounded-[7px] w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] z-[160] animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header Toolbar */}
            <div className="bg-slate-200 px-6 py-4 flex items-center justify-between border-b border-slate-300 shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  สัญญา: {selectedPreviewContract.contractNumber} ({selectedPreviewContract.status === "active" || selectedPreviewContract.status === "expiring" ? "สัญญาปัจจุบัน" : "หมดอายุ"})
                </span>
              </div>

              {/* Close, Zoom, and Download Panel */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom(prev => Math.max(0.6, prev - 0.1))}
                  className="p-1 hover:bg-slate-300 rounded text-slate-600 transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs font-bold text-slate-600 w-10 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))}
                  className="p-1 hover:bg-slate-300 rounded text-slate-600 transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
                <div className="w-px h-5 bg-slate-300 mx-2" />
                <button
                  onClick={() => showToast("กำลังดาวน์โหลดเอกสาร...", "info")}
                  className="p-1 hover:bg-slate-300 rounded text-slate-600 transition-colors cursor-pointer"
                  title="Download PDF"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="ml-3 p-1 bg-slate-300/40 hover:bg-slate-300 rounded-[5px] text-slate-600 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Document simulated watermark page inside modal */}
            <div className="flex-1 p-8 overflow-y-auto flex justify-center bg-slate-100/90 items-start">
              <div
                style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
                className="bg-white w-[595px] min-h-[800px] shadow-lg border border-slate-200 p-12 transition-transform duration-200 relative flex flex-col justify-between select-none rounded-[4px]"
              >
                
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
                  <div className="w-64 h-64 border-[12px] border-slate-900 rounded-full flex items-center justify-center font-black text-5xl text-slate-900 tracking-wider -rotate-45">
                    SUT
                  </div>
                </div>

                <div className="relative z-10 space-y-6 flex-1">
                  <div className="text-center space-y-1">
                    <h3 className="font-bold text-base text-slate-900">
                      หนังสือสัญญาเช่าพื้นที่เพื่อประกอบการค้า
                    </h3>
                    <p className="text-[9px] text-slate-400">มหาวิทยาลัยเทคโนโลยีสุรนารี</p>
                  </div>

                  <div className="text-right text-[9px] text-slate-500 space-y-0.5">
                    <p>ทำที่ มหาวิทยาลัยเทคโนโลยีสุรนารี</p>
                    <p>วันที่ {formatThaiDate(selectedPreviewContract.startDate)}</p>
                  </div>

                  <div className="space-y-3 pt-2 text-[9px] leading-relaxed text-slate-500">
                    <p>
                      สัญญาฉบับนี้ทำขึ้นระหว่าง มหาวิทยาลัยเทคโนโลยีสุรนารี โดยผู้ได้รับมอบอำนาจ ซึ่งต่อไปในสัญญานี้เรียกว่า "ผู้ให้เช่า" ฝ่ายหนึ่ง กับ <span className="font-bold text-slate-700">{location.tenantName}</span> ซึ่งต่อไปในสัญญานี้เรียกว่า "ผู้เช่า" อีกฝ่ายหนึ่ง
                    </p>
                    <p>
                      คู่สัญญาทั้งสองฝ่ายตกลงเห็นพ้องกันมีข้อความสัญญาเช่าดังต่อไปนี้:
                    </p>
                    
                    <div className="space-y-1.5 pt-1">
                      <span className="font-bold text-slate-700 block">ข้อ 1. รายละเอียดพื้นที่</span>
                      <p>ผู้ให้เช่าตกลงให้เช่า และผู้เช่าตกลงเช่าพื้นที่ในบริเวณ {location.building || "โรงอาหาร"} โซน {location.area} เพื่อวัตถุประสงค์ในการทำธุรกิจประเภทอาหารและเครื่องดื่ม</p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="font-bold text-slate-700 block">ข้อ 2. ค่าบำรุงและภาระการเงิน</span>
                      <p>ผู้เช่าตกลงชำระค่าบำรุงในอัตรา {selectedPreviewContract.monthlyRental.toLocaleString()} บาทต่อเดือน โดยจะชำระภายในระยะเวลาที่มหาวิทยาลัยกำหนด พร้อมวางเงินหลักประกันสัญญาเช่าจำนวน {selectedPreviewContract.deposit.toLocaleString()} บาท และสนับสนุนทุนการศึกษาจำนวน {selectedPreviewContract.scholarship.toLocaleString()} บาทถ้วน</p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="font-bold text-slate-700 block">ข้อ 3. ระยะเวลาสัญญา</span>
                      <p>สัญญาฉบับนี้มีระยะเวลากำหนดไว้ตั้งแต่วันที่ {formatThaiDate(selectedPreviewContract.startDate)} จนถึงวันที่ {formatThaiDate(selectedPreviewContract.endDate)}</p>
                    </div>

                    {selectedPreviewContract.terms && (
                      <div className="space-y-1.5 pt-1">
                        <span className="font-bold text-slate-700 block">ข้อ 4. เงื่อนไขเพิ่มเติม</span>
                        <p>{selectedPreviewContract.terms}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Signatures */}
                <div className="relative z-10 grid grid-cols-2 gap-8 pt-8 border-t border-slate-100 mt-8">
                  <div className="text-center space-y-2">
                    <p className="text-[9px] text-slate-400">ลงชื่อ .................................................... ผู้ให้เช่า</p>
                    <p className="text-[9px] text-slate-500">(เจ้าหน้าที่บริหารสินทรัพย์)</p>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-[9px] text-slate-400">ลงชื่อ .................................................... ผู้เช่า</p>
                    <p className="text-[9px] text-slate-500">({ownerName || location.tenantName})</p>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

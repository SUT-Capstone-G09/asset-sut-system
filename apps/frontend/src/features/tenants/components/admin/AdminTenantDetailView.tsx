"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Printer,
  RefreshCw,
  Ban,
  UploadCloud,
  ZoomIn,
  ZoomOut,
  Download,
  CheckCircle,
  X,
  FileText,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";
import { MockTenant } from "../../data/mock-tenants";
import { cn } from "@/lib/utils";

interface AdminTenantDetailViewProps {
  tenant: MockTenant;
  areaId: string;
  areaName: string;
}

export default function AdminTenantDetailView({
  tenant: initialTenant,
  areaId,
  areaName,
}: AdminTenantDetailViewProps) {
  const router = useRouter();
  
  // State variables
  const [tenant, setTenant] = useState<MockTenant>(initialTenant);
  const [status, setStatus] = useState<"active" | "terminated">("active");
  const [contractEndDate, setContractEndDate] = useState<string>(initialTenant.contractEndDate);
  const [notes, setNotes] = useState<string>("");
  
  // Calculate start date (typically 2 years before contract end date)
  const getStartDate = (endDateStr: string) => {
    const endDate = new Date(endDateStr);
    if (isNaN(endDate.getTime())) return "2024-01-01";
    const startYear = endDate.getFullYear() - 2;
    // Format to YYYY-MM-DD
    const month = String(endDate.getMonth() + 1).padStart(2, '0');
    const day = String(endDate.getDate()).padStart(2, '0');
    return `${startYear}-${month}-${day}`;
  };

  const [contractStartDate, setContractStartDate] = useState<string>(getStartDate(initialTenant.contractEndDate));

  // PDF Viewer Zoom State
  const [zoom, setZoom] = useState<number>(1.0);
  
  // Modals States
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  
  // Renewal Dates Inputs
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  
  // Upload Document State
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" }>({
    show: false,
    message: "",
    type: "success"
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
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

  // Print Document action
  const handlePrint = () => {
    showToast("กำลังจัดเตรียมไฟล์ PDF สำหรับพิมพ์...", "info");
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  // Renew lease action
  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStartDate || !newEndDate) {
      showToast("กรุณากรอกข้อมูลวันที่ให้ครบถ้วน", "error");
      return;
    }
    
    setContractStartDate(newStartDate);
    setContractEndDate(newEndDate);
    setStatus("active"); // Reactivate if it was terminated
    setIsRenewModalOpen(false);
    showToast("ต่ออายุสัญญาเช่าเรียบร้อยแล้ว", "success");
  };

  // Terminate lease action
  const handleTerminateConfirm = () => {
    setStatus("terminated");
    setIsTerminateModalOpen(false);
    showToast("ยกเลิกสัญญาเช่าเรียบร้อยแล้ว", "success");
  };

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadedFile({
        name: file.name,
        size: `${sizeInMB} MB`
      });
      showToast(`อัปโหลดไฟล์ ${file.name} เรียบร้อยแล้ว`, "success");
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
      setUploadedFile({
        name: file.name,
        size: `${sizeInMB} MB`
      });
      showToast(`อัปโหลดไฟล์ ${file.name} เรียบร้อยแล้ว`, "success");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    showToast("ลบเอกสารที่อัปโหลดแล้ว", "info");
  };

  // Dynamic values
  const contractIdNumber = tenant.id.replace(/[^\d]/g, "") || "0089";
  const formattedContractId = `#CT-2024-${contractIdNumber.padStart(4, "0")}`;
  const displayAddress = "123/45 สุขุมวิท ซอย 21, คลองเตยเหนือ, วัฒนา, กรุงเทพมหานคร 10110, ประเทศไทย";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16 relative">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-120 flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 animate-in slide-in-from-top-4 duration-300">
          {toast.type === "success" && <CheckCircle className="text-emerald-500" size={20} />}
          {toast.type === "error" && <AlertTriangle className="text-rose-500" size={20} />}
          {toast.type === "info" && <FileText className="text-amber-500" size={20} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header Section / Breadcrumbs */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/admin/tenants/lists/${areaId}`)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ChevronLeft size={20} />
          </button>
          <AssetBreadcrumb
            items={[
              { label: "Admin", href: "/admin" },
              { label: "ผู้ประกอบการ", href: "/admin/tenants/lists" },
              { label: areaName, href: `/admin/tenants/lists/${areaId}` },
              { label: tenant.name },
            ]}
          />
        </div>
      </div>

      {/* Top Section: Verification info and Document scan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Card: ข้อมูลยืนยันตัวตนผู้เช่า */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-slate-400 text-sm font-bold tracking-tight">ข้อมูลยืนยันตัวตนผู้เช่า</span>
            </div>
            
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-8">
              {tenant.ownerName}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">หมายเลขโทรศัพท์</span>
                <span className="text-slate-700 font-semibold text-base flex items-center gap-2">
                  <Phone size={16} className="text-slate-400" />
                  +66 81-234-5678
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">ที่อยู่อีเมล</span>
                <span className="text-slate-700 font-semibold text-base flex items-center gap-2">
                  <Mail size={16} className="text-slate-400" />
                  {tenant.ownerName.includes("สมชาย") ? "somchai.s@outlook.com" : "tenant.owner@outlook.com"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100/80">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider mb-2">ที่อยู่ตามทะเบียนบ้าน</span>
            <span className="text-slate-600 text-sm font-medium leading-relaxed flex items-start gap-2">
              <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
              {displayAddress}
            </span>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100/80 space-y-3">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">บันทึกเพิ่มเติม (สำหรับเจ้าหน้าที่)</span>
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เพิ่มข้อมูลบันทึกเกี่ยวกับผู้ประกอบการ..."
                className="w-full text-slate-700 font-semibold text-sm border border-slate-200 rounded-xl p-3 pb-14 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-800 transition-all min-h-[90px] resize-none"
              />
              <button
                type="button"
                onClick={() => showToast("บันทึกโน้ตสำเร็จ", "success")}
                className="absolute right-3.5 bottom-3.5 bg-slate-950 hover:bg-slate-850 text-white text-xs font-black px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>

        {/* Right Card: เอกสารประกอบการตรวจสอบ */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-bold tracking-tight">เอกสารประกอบการตรวจสอบ</span>
            </div>
            
            {/* Scanned ID card frame */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner group">
              <Image
                src="/thai_id_mock.png"
                alt="สำเนาบัตรประชาชน"
                fill
                className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {/* Blur privacy shield simulator */}
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-slate-950/20" />
              
              {/* Document footer tag inside the image */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                <span className="text-xs text-white font-medium tracking-wide">บัตรประชาชน_สมชาย_สุขใจ.png</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  ตรวจสอบแล้ว
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Contract Detail Header Row */}
      <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-8">
        
        {/* Main Contract details action row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
          <div>
            <span className="text-xs text-slate-400 font-bold tracking-widest uppercase block mb-1">
              หมายเลขกำกับสัญญา {formattedContractId}
            </span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {areaId === "student-dormitories" || areaId === "staff-housing"
                ? "สัญญาเช่า"
                : "สัญญาเช่าพื้นที่ประกอบการ"}
            </h2>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm px-5 py-3.5 rounded-2xl border border-slate-200 shadow-sm transition-all active:scale-[0.98]"
            >
              <Printer size={16} />
              พิมพ์เอกสาร
            </button>
            <button
              onClick={() => {
                setNewStartDate(contractStartDate);
                setNewEndDate(contractEndDate);
                setIsRenewModalOpen(true);
              }}
              className="flex items-center gap-2 bg-slate-950 hover:bg-slate-850 text-white font-bold text-sm px-5 py-3.5 rounded-2xl shadow-md transition-all active:scale-[0.98]"
            >
              <RefreshCw size={16} />
              ต่อสัญญาเช่า
            </button>
            <button
              onClick={() => setIsTerminateModalOpen(true)}
              disabled={status === "terminated"}
              className={cn(
                "flex items-center gap-2 font-bold text-sm px-5 py-3.5 rounded-2xl border transition-all active:scale-[0.98]",
                status === "terminated"
                  ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-white hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 shadow-sm"
              )}
            >
              <Ban size={16} />
              บอกเลิกสัญญา
            </button>
          </div>
        </div>

        {/* Bottom Section: Left (Start/End dates + new Upload) and Right (PDF Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Columns (4 of 12) - Dates & File Upload */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Start & End Dates Display */}
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-6">
              
              <div className="flex gap-4 items-start">
                <div className="w-1.5 h-12 bg-emerald-500 rounded-full shrink-0" />
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-bold tracking-wide block uppercase">วันที่เริ่มสัญญา</span>
                  <span className="text-slate-800 text-lg font-black">{formatThaiDate(contractStartDate)}</span>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-1.5 h-12 bg-rose-500 rounded-full shrink-0" />
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-bold tracking-wide block uppercase">วันที่สิ้นสุดสัญญา</span>
                  <span className="text-slate-800 text-lg font-black">{formatThaiDate(contractEndDate)}</span>
                </div>
              </div>

            </div>

            {/* Dotted Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={cn(
                "relative rounded-2xl p-6 border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[180px]",
                isDragging
                  ? "border-brand-primary bg-brand-primary/5"
                  : uploadedFile
                    ? "border-emerald-500/40 bg-emerald-50/10"
                    : "border-slate-200 hover:border-brand-primary/60 bg-white"
              )}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              
              {uploadedFile ? (
                <div className="space-y-3 w-full">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-850 truncate max-w-full px-4">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-slate-400">{uploadedFile.size}</p>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <X size={12} />
                    ลบไฟล์
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto group-hover:text-brand-primary transition-colors">
                    <UploadCloud size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">เอกสารสัญญาฉบับใหม่</h4>
                    <p className="text-xs text-slate-400 mt-1">ลากไฟล์ PDF หรือ JPG ที่สแกนแล้วมาวางที่นี่</p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Columns (8 of 12) - PDF Previewer */}
          <div className="lg:col-span-8 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
            
            {/* PDF Toolbar */}
            <div className="bg-slate-200 px-6 py-4 flex items-center justify-between border-b border-slate-300">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ตัวอย่าง:: {uploadedFile ? uploadedFile.name : "CONTRACT_MAIN_V2.PDF"}
                </span>
              </div>

              {/* Toolbar Zoom & Download Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom(prev => Math.max(0.6, prev - 0.1))}
                  className="p-1.5 hover:bg-slate-300 rounded-lg text-slate-600 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs font-bold text-slate-600 w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))}
                  className="p-1.5 hover:bg-slate-300 rounded-lg text-slate-600 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
                <div className="w-px h-5 bg-slate-300 mx-2" />
                <button
                  onClick={() => showToast("กำลังดาวน์โหลดเอกสาร...", "info")}
                  className="p-1.5 hover:bg-slate-300 rounded-lg text-slate-600 transition-colors"
                  title="Download PDF"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            {/* Document page simulated preview */}
            <div className="flex-1 p-8 overflow-auto flex justify-center bg-slate-100/80 items-start">
              <div
                style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
                className="bg-white w-[595px] min-h-[842px] shadow-lg border border-slate-200 p-12 transition-transform duration-200 relative flex flex-col justify-between select-none"
              >
                {/* Simulated SUT Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none z-0">
                  <div className="w-72 h-72 border-16 border-slate-900 rounded-full flex items-center justify-center font-black text-6xl text-slate-900 tracking-wider -rotate-45">
                    SUT
                  </div>
                </div>

                <div className="relative z-10 space-y-8 flex-1">
                  {/* Document Title header */}
                  <div className="text-center space-y-2">
                    <h3 className="font-bold text-lg text-slate-900">
                      {areaId === "student-dormitories" || areaId === "staff-housing"
                        ? "หนังสือสัญญาเช่าที่พักอาศัย"
                        : "หนังสือสัญญาเช่าพื้นที่เพื่อประกอบการค้า"}
                    </h3>
                    <p className="text-[10px] text-slate-400">มหาวิทยาลัยเทคโนโลยีสุรนารี</p>
                  </div>

                  {/* Date & Location section */}
                  <div className="text-right text-[10px] text-slate-500 space-y-1">
                    <p>ทำที่ มหาวิทยาลัยเทคโนโลยีสุรนารี</p>
                    <p>วันที่ {formatThaiDate(contractStartDate)}</p>
                  </div>

                  {/* Contract content skeletons */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-16 bg-slate-200 rounded-sm" />
                      <div className="h-3 flex-1 bg-slate-100 rounded-sm" />
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-400">
                      สัญญาฉบับนี้ทำขึ้นระหว่าง มหาวิทยาลัยเทคโนโลยีสุรนารี โดยผู้ได้รับมอบอำนาจ ซึ่งต่อไปในสัญญานี้เรียกว่า "ผู้ให้เช่า" ฝ่ายหนึ่ง กับ <span className="font-bold text-slate-700">{tenant.ownerName}</span> ซึ่งต่อไปในสัญญานี้เรียกว่า "ผู้เช่า" อีกฝ่ายหนึ่ง
                    </p>
                    <p className="text-[10px] leading-relaxed text-slate-400">
                      คู่สัญญาทั้งสองฝ่ายตกลงเห็นพ้องกันมีข้อความสัญญาเช่าดังต่อไปนี้:
                    </p>
                    
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-600">ข้อ 1.</span>
                        <div className="h-2.5 flex-1 bg-slate-100 rounded-sm" />
                      </div>
                      <div className="h-2.5 w-5/6 bg-slate-100/80 rounded-sm" />
                      <div className="h-2.5 w-11/12 bg-slate-100/80 rounded-sm" />
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-600">ข้อ 2.</span>
                        <div className="h-2.5 flex-1 bg-slate-100 rounded-sm" />
                      </div>
                      <div className="h-2.5 w-full bg-slate-100/80 rounded-sm" />
                      <div className="h-2.5 w-4/6 bg-slate-100/80 rounded-sm" />
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-600">ข้อ 3.</span>
                        <div className="h-2.5 flex-1 bg-slate-100 rounded-sm" />
                      </div>
                      <p className="text-[10px] leading-relaxed text-slate-400">
                        ระยะเวลาการเช่ามีกำหนด <span className="font-bold text-slate-600">2 ปี</span> เริ่มตั้งแต่วันที่ <span className="font-bold text-slate-700">{formatThaiDate(contractStartDate)}</span> จนถึงวันที่ <span className="font-bold text-slate-700">{formatThaiDate(contractEndDate)}</span> เป็นต้นไป
                      </p>
                    </div>
                  </div>
                </div>

                {/* Signatures mock */}
                <div className="relative z-10 grid grid-cols-2 gap-8 pt-12 border-t border-slate-100">
                  <div className="text-center space-y-4">
                    <p className="text-[10px] text-slate-400">ลงชื่อ .................................................... ผู้ให้เช่า</p>
                    <p className="text-[10px] text-slate-500">(เจ้าหน้าที่บริหารสินทรัพย์)</p>
                  </div>
                  <div className="text-center space-y-4">
                    <p className="text-[10px] text-slate-400">ลงชื่อ .................................................... ผู้เช่า</p>
                    <p className="text-[10px] text-slate-500">({tenant.ownerName})</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* RENEW LEASE MODAL */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsRenewModalOpen(false)}
          />

          <div className="relative bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 transform transition-all animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsRenewModalOpen(false)}
              className="absolute right-8 top-8 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={24} />
            </button>

            <form onSubmit={handleRenewSubmit} className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg shadow-slate-900/10">
                  <RefreshCw size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-800">
                  ต่อสัญญาเช่า
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  กำหนดระยะเวลาสัญญาเช่าใหม่สำหรับผู้เช่ารายนี้
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">วันที่เริ่มสัญญาใหม่</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">วันที่สิ้นสุดสัญญาใหม่</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  className="w-full bg-slate-950 hover:bg-slate-850 text-white font-black py-4 rounded-2xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                >
                  ยืนยันการต่อสัญญา
                </button>
                <button
                  type="button"
                  onClick={() => setIsRenewModalOpen(false)}
                  className="w-full text-slate-400 font-bold py-3 hover:text-slate-600 transition-all text-sm"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TERMINATE LEASE MODAL */}
      {isTerminateModalOpen && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsTerminateModalOpen(false)}
          />

          <div className="relative bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 transform transition-all animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsTerminateModalOpen(false)}
              className="absolute right-8 top-8 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle size={44} />
              </div>

              <h3 className="text-2xl font-black text-slate-850 mb-3">
                ยืนยันการบอกเลิกสัญญา
              </h3>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-8 px-4">
                คุณแน่ใจหรือไม่ว่าต้องการบอกเลิกสัญญาของ <span className="font-bold text-slate-700">{tenant.ownerName}</span>? การดำเนินการนี้จะเปลี่ยนสถานะสัญญาเป็นยกเลิกและไม่สามารถย้อนกลับได้
              </p>

              <div className="flex flex-col w-full space-y-3">
                <button
                  onClick={handleTerminateConfirm}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-rose-100 transition-all active:scale-[0.98]"
                >
                  บอกเลิกสัญญาเช่า
                </button>
                <button
                  onClick={() => setIsTerminateModalOpen(false)}
                  className="w-full bg-white text-slate-450 font-bold py-3 hover:text-slate-650 transition-all text-sm"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

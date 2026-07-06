"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Ban,
  Clock,
  Store,
  ChevronRight,
  X,
  Plus,
  FileText,
  UploadCloud,
  Save,
  Loader2
} from "lucide-react";
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";
import { tenantAreaOptions } from "@/features/tenants/data/tenant-areas";
import { generateMockTenants, MockTenant } from "@/features/tenants/data/mock-tenants";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const mockUsers = [
  { id: "user_01", name: "คุณ สมชาย แข็งขัน", email: "somchai.k@sut.ac.th" },
  { id: "user_02", name: "คุณ มะลิ สวยงาม", email: "mali.s@sut.ac.th" },
  { id: "user_03", name: "คุณ วิชา การดี", email: "wicha.k@sut.ac.th" },
  { id: "user_04", name: "คุณ นารี จิตใจดี", email: "naree.j@sut.ac.th" },
  { id: "user_05", name: "คุณ ปองพล ขยันยิ่ง", email: "pongpol.k@sut.ac.th" },
];

function AdminContractsDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dynamic tenants state to allow adding newly created mock tenants instantly
  const initialTenants = useMemo(() => {
    return tenantAreaOptions.flatMap(area => generateMockTenants(area.id, area.subLocations));
  }, []);

  const [tenantsList, setTenantsList] = useState<MockTenant[]>([]);

  useEffect(() => {
    setTenantsList(initialTenants);
  }, [initialTenants]);

  // Aggregate contracts from active tenants list
  const allContracts = useMemo(() => {
    return tenantsList.flatMap(tenant => {
      if (!tenant.contracts) return [];
      const areaId = tenant.id.split("-")[0];
      const areaName = tenantAreaOptions.find(a => a.id === areaId)?.name || "โรงอาหาร";
      
      return tenant.contracts.map(contract => ({
        ...contract,
        tenantId: tenant.id,
        tenantName: tenant.ownerName,
        shopName: tenant.name,
        businessType: tenant.businessType,
        subLocation: tenant.subLocation,
        areaId,
        areaName,
      }));
    });
  }, [tenantsList]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBusinessType, setSelectedBusinessType] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  // Create Contract Drawer Form States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Inputs
  const [formAreaId, setFormAreaId] = useState("cafeterias");
  const [selectedUser, setSelectedUser] = useState("user_01");
  const [businessName, setBusinessName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");
  
  const selectedAreaObj = useMemo(() => {
    return tenantAreaOptions.find(a => a.id === formAreaId) || tenantAreaOptions[0];
  }, [formAreaId]);

  const [formSubLocation, setFormSubLocation] = useState("");
  const [formBusinessType, setFormBusinessType] = useState("");

  // Sync sub locations and business types when area switches in form
  useEffect(() => {
    if (selectedAreaObj) {
      setFormSubLocation(selectedAreaObj.subLocations[0] || "");
      setFormBusinessType(selectedAreaObj.businessTypes[0] || "อาหารและเครื่องดื่ม");
    }
  }, [selectedAreaObj]);

  const [monthlyRental, setMonthlyRental] = useState("5000");
  const [startDate, setStartDate] = useState("2026-07-01");
  const [endDate, setEndDate] = useState("2028-06-30");
  const [deposit, setDeposit] = useState("10000");
  const [scholarship, setScholarship] = useState("2000");
  const [terms, setTerms] = useState("");
  const [note, setNote] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [uploadedVerificationFile, setUploadedVerificationFile] = useState<{ name: string; size: string } | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success"
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  // Check URL triggers to auto-open drawer
  const createParam = searchParams.get("create");
  const areaIdParam = searchParams.get("areaId");

  useEffect(() => {
    if (createParam === "true") {
      setIsCreateModalOpen(true);
      if (areaIdParam && tenantAreaOptions.some(a => a.id === areaIdParam)) {
        setFormAreaId(areaIdParam);
      }
    }
  }, [createParam, areaIdParam]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedArea("all");
    setSelectedStatus("all");
    setSelectedBusinessType("all");
    setSelectedYear("all");
  };

  // Form close confirmation logic
  const handleModalCloseAttempt = () => {
    const isDirty = !!(businessName || taxId || phone || nationalId || registeredAddress || terms || note);
    if (isDirty) {
      setShowCloseConfirm(true);
    } else {
      setIsCreateModalOpen(false);
    }
  };

  const handleForceClose = () => {
    setIsCreateModalOpen(false);
    setShowCloseConfirm(false);
    resetFormFields();
  };

  const resetFormFields = () => {
    setBusinessName("");
    setTaxId("");
    setPhone("");
    setNationalId("");
    setRegisteredAddress("");
    setMonthlyRental("5000");
    setDeposit("10000");
    setScholarship("2000");
    setTerms("");
    setNote("");
    setUploadedFile(null);
    setUploadedVerificationFile(null);
  };

  // Create Contract Submission Logic (adds to mock local state)
  const handleCreateContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !taxId || !registeredAddress || !startDate || !endDate || !phone || !nationalId) {
      showToast("กรุณากรอกข้อมูลหลักให้ครบถ้วน", "error");
      return;
    }

    setIsSubmitting(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    const userObj = mockUsers.find(u => u.id === selectedUser);
    const ownerName = userObj ? userObj.name : "ผู้เช่ารายใหม่";
    const tenantIdVal = `${formAreaId}-${Date.now()}`;

    // Mock contract object
    const newContract = {
      id: `ct-${tenantIdVal}-current`,
      contractNumber: `CT-2026-${Math.floor(Math.random() * 900) + 100}`,
      startDate,
      endDate,
      monthlyRental: parseFloat(monthlyRental) || 5000,
      deposit: parseFloat(deposit) || 10000,
      scholarship: parseFloat(scholarship) || 2000,
      terms: terms || "ต้องเปิดบริการอย่างน้อย 6 วันต่อสัปดาห์ และแต่งกายถูกต้องตามระเบียบที่กำหนด",
      note: note || "ไม่มีหมายเหตุเพิ่มเติม",
      status: "active" as const,
    };

    const newTenant: MockTenant = {
      id: tenantIdVal,
      name: businessName,
      subLocation: formSubLocation,
      businessType: formBusinessType,
      ownerName,
      contractEndDate: endDate,
      contractStartDate: startDate,
      bannerUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80", // Default Food banner
      phone,
      nationalId,
      taxId,
      deposit: parseFloat(deposit) || 10000,
      scholarship: parseFloat(scholarship) || 2000,
      terms,
      note,
      contracts: [newContract]
    };

    setTenantsList(prev => [newTenant, ...prev]);
    setIsCreateModalOpen(false);
    showToast(`สร้างสัญญาเช่าสำหรับร้าน ${businessName} สำเร็จ และอัปเดตสิทธิ์ของ ${ownerName} เป็น Tenant เรียบร้อย`, "success");
    resetFormFields();
  };

  // Status statistics
  const stats = useMemo(() => {
    const result = {
      total: allContracts.length,
      active: 0,
      expiring: 0,
      expired: 0,
      terminated: 0,
    };
    allContracts.forEach(c => {
      if (c.status === "active") result.active++;
      else if (c.status === "expiring") result.expiring++;
      else if (c.status === "expired") result.expired++;
      else if (c.status === "terminated") result.terminated++;
    });
    return result;
  }, [allContracts]);

  // Filter and sort contracts
  const filteredAndSortedContracts = useMemo(() => {
    let result = [...allContracts];

    // Search filter
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        c =>
          c.contractNumber.toLowerCase().includes(q) ||
          c.tenantName.toLowerCase().includes(q) ||
          c.shopName.toLowerCase().includes(q)
      );
    }

    // Area filter
    if (selectedArea !== "all") {
      result = result.filter(c => c.areaId === selectedArea);
    }

    // Status filter
    if (selectedStatus !== "all") {
      result = result.filter(c => c.status === selectedStatus);
    }

    // Business type filter
    if (selectedBusinessType !== "all") {
      result = result.filter(c => c.businessType === selectedBusinessType);
    }

    // Year filter (based on start date)
    if (selectedYear !== "all") {
      result = result.filter(c => c.startDate.startsWith(selectedYear));
    }

    // Default sorting priority
    const statusPriority: Record<string, number> = {
      expiring: 1,
      active: 2,
      expired: 3,
      terminated: 4,
    };

    result.sort((a, b) => {
      const priorityA = statusPriority[a.status] || 99;
      const priorityB = statusPriority[b.status] || 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    });

    return result;
  }, [allContracts, searchTerm, selectedArea, selectedStatus, selectedBusinessType, selectedYear]);

  // Convert Date to Thai format
  const formatThaiDate = (dateStr: string) => {
    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = (date.getFullYear() + 543).toString().substring(2);
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-120 flex items-center gap-3 bg-neutral-800 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle className="text-success-500" size={20} />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <AssetBreadcrumb
          items={[
            { label: "Admin", href: "/admin" },
            { label: "สัญญาเช่าทั้งหมด" }
          ]}
        />
      </div>

      {/* Page Title & Create Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            การจัดการสัญญาเช่าทั้งหมด (Lease Contracts)
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            ระบบรวมศูนย์ข้อมูลสัญญาเช่า สัญญาพื้นที่ประกอบการค้า และประวัติการทำสัญญาย้อนหลังในทุกพื้นที่ของมหาวิทยาลัย
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-600 text-white px-5 py-3.5 rounded-xl text-xs font-black shadow-lg shadow-brand-primary-500/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={3} />
          สร้างสัญญาใหม่
        </button>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">สัญญาเช่าทั้งหมด</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{stats.total}</span>
            <span className="text-xs text-slate-400 font-bold">ฉบับ</span>
          </div>
        </div>

        <div className="bg-success-50/20 rounded-2xl p-6 border border-success-100 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-success-600 uppercase tracking-widest block">กำลังใช้งานปกติ</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-success-600">{stats.active}</span>
            <span className="text-xs text-success-500 font-bold">ฉบับ</span>
          </div>
        </div>

        <div className="bg-warning-50/25 rounded-2xl p-6 border border-warning-100 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-warning-600 uppercase tracking-widest block">ใกล้หมดสัญญา</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-warning-600">{stats.expiring}</span>
            <span className="text-xs text-warning-500 font-bold">ฉบับ</span>
          </div>
        </div>

        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200/60 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">หมดอายุแล้ว</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-500">{stats.expired}</span>
            <span className="text-xs text-slate-400 font-bold">ฉบับ</span>
          </div>
        </div>

        <div className="bg-error-50/20 rounded-2xl p-6 border border-error-100 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-error-600 uppercase tracking-widest block">บอกเลิก/ยกเลิก</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-error-600">{stats.terminated}</span>
            <span className="text-xs text-error-500 font-bold">ฉบับ</span>
          </div>
        </div>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 pointer-events-none">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเลขที่สัญญา, ชื่อผู้ประกอบการ, แบรนด์..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-medium text-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={handleResetFilters}
            className="w-full md:w-auto bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-xl px-4 py-3 text-xs font-black transition-all flex items-center justify-center gap-1.5"
          >
            <X size={14} />
            ล้างตัวกรองทั้งหมด
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">พื้นที่ (Areas)</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="all">ทั้งหมด ทุกพื้นที่</option>
              {tenantAreaOptions.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">สถานะสัญญา</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="active">ใช้งานปกติ (Active)</option>
              <option value="expiring">ใกล้หมดสัญญา (Expiring)</option>
              <option value="expired">หมดอายุ (Expired)</option>
              <option value="terminated">ยกเลิกแล้ว (Terminated)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ประเภทสัญญา (ธุรกิจ)</label>
            <select
              value={selectedBusinessType}
              onChange={(e) => setSelectedBusinessType(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="all">ทุกประเภทธุรกิจ</option>
              <option value="อาหารและเครื่องดื่ม">อาหารและเครื่องดื่ม</option>
              <option value="ขนมหวาน">ขนมหวาน</option>
              <option value="ร้านสะดวกซื้อ">ร้านสะดวกซื้อ</option>
              <option value="เครื่องดื่ม">เครื่องดื่ม</option>
              <option value="บริการ">บริการ</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ปีเริ่มต้นสัญญา</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="all">ทุกปีเริ่มต้น</option>
              <option value="2023">2023 (พ.ศ. 2566)</option>
              <option value="2024">2024 (พ.ศ. 2567)</option>
              <option value="2025">2025 (พ.ศ. 2568)</option>
              <option value="2026">2026 (พ.ศ. 2569)</option>
              <option value="2027">2027 (พ.ศ. 2570)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts Table List */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 border-b border-slate-100 text-xs font-bold uppercase tracking-wider">
                <th className="py-5 px-6 font-bold">เลขที่สัญญา</th>
                <th className="py-5 px-4 font-bold">คู่สัญญา / ผู้ประกอบการ</th>
                <th className="py-5 px-4 font-bold">สถานที่เช่า</th>
                <th className="py-5 px-4 font-bold">ประเภทธุรกิจ</th>
                <th className="py-5 px-4 font-bold">ระยะเวลาสัญญา</th>
                <th className="py-5 px-4 font-bold text-right">ค่าเช่ารายเดือน</th>
                <th className="py-5 px-6 font-bold text-center">สถานะ</th>
                <th className="py-5 px-6 font-bold text-center">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70 text-sm font-medium text-slate-700">
              {filteredAndSortedContracts.length > 0 ? (
                filteredAndSortedContracts.map((contract) => {
                  const areaPath = contract.areaId;
                  const tenantPath = contract.tenantId;

                  return (
                    <tr 
                      key={contract.id}
                      className={cn(
                        "hover:bg-slate-50/50 transition-colors group",
                        contract.status === "expiring" && "bg-warning-500/5 hover:bg-warning-500/10"
                      )}
                    >
                      <td className="py-4.5 px-6">
                        <span className="font-black text-slate-800 tracking-tight block">
                          {contract.contractNumber}
                        </span>
                      </td>

                      <td className="py-4.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block text-sm">{contract.tenantName}</span>
                          <span className="text-slate-400 text-xs flex items-center gap-1">
                            <Store size={12} className="shrink-0" />
                            {contract.shopName}
                          </span>
                        </div>
                      </td>

                      <td className="py-4.5 px-4">
                        <div className="space-y-0.5 text-xs">
                          <span className="font-bold text-slate-700 block">{contract.areaName}</span>
                          <span className="text-slate-400 font-medium">{contract.subLocation}</span>
                        </div>
                      </td>

                      <td className="py-4.5 px-4">
                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                          {contract.businessType}
                        </span>
                      </td>

                      <td className="py-4.5 px-4">
                        <div className="space-y-0.5 text-xs text-slate-500 font-semibold">
                          <span>{formatThaiDate(contract.startDate)} - {formatThaiDate(contract.endDate)}</span>
                        </div>
                      </td>

                      <td className="py-4.5 px-4 text-right font-black text-slate-800">
                        {contract.monthlyRental.toLocaleString()} บ.
                      </td>

                      <td className="py-4.5 px-6 text-center">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-xs",
                          contract.status === "active"
                            ? "bg-success-50 text-success-600 border-success-100"
                            : contract.status === "expiring"
                              ? "bg-warning-50 text-warning-600 border-warning-100 animate-pulse"
                              : contract.status === "expired"
                                ? "bg-neutral-100 text-neutral-500 border-neutral-200"
                                : "bg-error-50 text-error-600 border-error-100"
                        )}>
                          {contract.status === "active" && <CheckCircle size={10} />}
                          {contract.status === "expiring" && <AlertTriangle size={10} />}
                          {contract.status === "expired" && <Clock size={10} />}
                          {contract.status === "terminated" && <Ban size={10} />}
                          
                          {contract.status === "active" && "ปกติ"}
                          {contract.status === "expiring" && "ใกล้หมดสัญญา"}
                          {contract.status === "expired" && "หมดอายุ"}
                          {contract.status === "terminated" && "ยกเลิกแล้ว"}
                        </span>
                      </td>

                      <td className="py-4.5 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/tenants/lists/${areaPath}/${tenantPath}`)}
                            className="bg-white hover:bg-slate-50 text-slate-655 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                            title="ดูรายละเอียดผู้ประกอบการ"
                          >
                            ผู้เช่า
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/contracts/actions?tenantId=${tenantPath}&contractId=${contract.id}`)}
                            className="bg-brand-primary hover:bg-brand-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                            title="จัดการสัญญาเช่า"
                          >
                            จัดการสัญญา
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                    ไม่พบข้อมูลสัญญาเช่าที่ตรงตามเงื่อนไขการค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE CONTRACT DRAWER (จากหน้ารายพื้นที่ย่อย ย้ายมาศูนย์กลาง) */}
      <Sheet open={isCreateModalOpen} onOpenChange={handleModalCloseAttempt}>
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
                  <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">พื้นที่เช่าหลัก (Location Area)</label>
                  <select
                    value={formAreaId}
                    onChange={(e) => setFormAreaId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
                  >
                    {tenantAreaOptions.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
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
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">เลือกผู้ใช้งานที่จะเป็นคู่สัญญา (User)</label>
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ชื่อร้านค้า / แบรนด์</label>
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">เลขประจำตัวผู้เสียภาษี</label>
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">เบอร์โทรศัพท์ติดต่อ</label>
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">เลขบัตรประชาชน (13 หลัก)</label>
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
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ที่อยู่จดทะเบียนร้านค้า</label>
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">พื้นที่เช่าย่อย (Sub-location)</label>
                    <select
                      value={formSubLocation}
                      onChange={(e) => setFormSubLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
                    >
                      {selectedAreaObj.subLocations.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  {/* Business Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ประเภทธุรกิจ (Business Type)</label>
                    <select
                      value={formBusinessType}
                      onChange={(e) => setFormBusinessType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
                    >
                      {selectedAreaObj.businessTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ค่าบำรุงเช่า / เดือน</label>
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">หลักประกันสัญญา (บาท)</label>
                    <input
                      type="number"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
                    />
                  </div>

                  {/* Scholarship */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ทุนการศึกษาสนับสนุน</label>
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">วันที่เริ่มต้นสัญญา</label>
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">วันที่สิ้นสุดสัญญา</label>
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
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">เงื่อนไขสัญญาเพิ่มเติม</label>
                  <textarea
                    placeholder="เช่น ต้องเปิดร้านขายสินค้าสัปดาห์ละ 6 วันเป็นอย่างน้อย..."
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[7px] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-700 min-h-[70px] resize-none"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">หมายเหตุอื่น ๆ</label>
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
                      uploadedVerificationFile ? "border-success-500 bg-success-50/10" : "border-slate-200 bg-slate-50/50"
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
                        <p className="text-xs font-bold text-slate-700">คลิกเพื่ออัปโหลดสำเนาบัตรประชาชนคู่สัญญา</p>
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
                        <p className="text-xs font-bold text-slate-700">คลิกเพื่ออัปโหลดเอกสารสัญญาลงนาม (PDF)</p>
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

    </div>
  );
}

export default function AdminContractsDashboard() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-500 font-bold flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-brand-primary mr-2" />
        กำลังโหลดข้อมูลสัญญาเช่า...
      </div>
    }>
      <AdminContractsDashboardContent />
    </Suspense>
  );
}

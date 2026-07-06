"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Calendar, Store, MoreHorizontal, User, X, Plus, FileText, UploadCloud, CheckCircle, AlertTriangle, Save, Loader2 } from "lucide-react";
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

export default function AdminTenantSubAreaView({ areaId }: { areaId: string }) {
  const area = tenantAreaOptions.find((a) => a.id === areaId);
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!area) return null;
  const [selectedSub, setSelectedSub] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal and Toast States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success"
  });

  // Form inputs state
  const [selectedUser, setSelectedUser] = useState("user_01");
  const [businessName, setBusinessName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");
  const [selectedSubLocation, setSelectedSubLocation] = useState(area.subLocations[0] || "");
  const [selectedBusinessType, setSelectedBusinessType] = useState(area.businessTypes[0] || "อาหารและเครื่องดื่ม");
  const [monthlyRental, setMonthlyRental] = useState("5000");
  const [startDate, setStartDate] = useState("2026-07-01");
  const [endDate, setEndDate] = useState("2028-06-30");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);

  // Excel & Wizard states (เพิ่มใหม่)
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [deposit, setDeposit] = useState("10000");
  const [scholarship, setScholarship] = useState("2000");
  const [terms, setTerms] = useState("");
  const [note, setNote] = useState("");
  const [uploadedVerificationFile, setUploadedVerificationFile] = useState<{ name: string; size: string } | null>(null);

  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const businessTypeFilter = searchParams.get("businessType");

  const initialTenants = useMemo(() => generateMockTenants(area.id, area.subLocations), [area]);
  const [tenantsList, setTenantsList] = useState<MockTenant[]>([]);

  // Initialize list of tenants
  useEffect(() => {
    setTenantsList(initialTenants);
  }, [initialTenants]);

  const filteredTenants = useMemo(() => {
    let result = tenantsList;

    // Filter by sub location
    if (selectedSub !== "all") {
      result = result.filter((t) => t.subLocation === selectedSub);
    }

    // Filter by URL businessType
    if (businessTypeFilter) {
      result = result.filter((t) => t.businessType === businessTypeFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.ownerName.toLowerCase().includes(q) ||
          t.businessType.toLowerCase().includes(q)
      );
    }

    return result;
  }, [tenantsList, selectedSub, searchQuery, businessTypeFilter]);

  // Construct backHref that preserves current URL query params
  const currentQuery = searchParams.toString();
  const backHref = `/admin/tenants/lists${currentQuery ? `?${currentQuery}` : ""}`;

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  const handleCreateContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !taxId || !registeredAddress || !startDate || !endDate || !phone || !nationalId) {
      showToast("กรุณากรอกข้อมูลหลักให้ครบถ้วน", "error");
      return;
    }

    setIsSubmitting(true);
    // จำลองการเรียก API (1.5 วินาที)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    const userObj = mockUsers.find(u => u.id === selectedUser);
    const ownerName = userObj ? userObj.name : "ผู้เช่ารายใหม่";

    // Generate a mock bannerUrl based on selectedBusinessType
    const dessertImages = [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80",
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&q=80"
    ];
    const foodImages = [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80"
    ];
    const drinkImages = [
      "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=500&q=80",
      "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=500&q=80"
    ];
    const convenienceStoreImages = [
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&q=80"
    ];
    const serviceImages = [
      "https://images.unsplash.com/photo-1545173168-9f19472ef7f4?w=500&q=80"
    ];

    let bannerUrl = serviceImages[0];
    if (selectedBusinessType.includes("อาหาร")) bannerUrl = foodImages[Math.floor(Math.random() * foodImages.length)];
    else if (selectedBusinessType.includes("ขนม")) bannerUrl = dessertImages[Math.floor(Math.random() * dessertImages.length)];
    else if (selectedBusinessType.includes("เครื่องดื่ม") || selectedBusinessType.includes("กาแฟ")) bannerUrl = drinkImages[Math.floor(Math.random() * drinkImages.length)];
    else if (selectedBusinessType.includes("สะดวกซื้อ") || selectedBusinessType.includes("ร้านค้า")) bannerUrl = convenienceStoreImages[Math.floor(Math.random() * convenienceStoreImages.length)];

    const newTenant: MockTenant = {
      id: `${areaId}-${Date.now()}`,
      name: businessName,
      subLocation: selectedSubLocation,
      businessType: selectedBusinessType,
      ownerName,
      contractEndDate: endDate,
      bannerUrl,
      phone,
      nationalId,
      deposit: parseFloat(deposit) || 0,
      scholarship: parseFloat(scholarship) || 0,
      terms,
      note,
      contractStartDate: startDate,
      taxId,
    };

    setTenantsList((prev) => [newTenant, ...prev]);
    setIsCreateModalOpen(false);

    // Show toast detailing role change
    showToast(
      `สร้างสัญญาเช่าสำหรับร้าน ${businessName} สำเร็จ และอัปเดตสิทธิ์ของ ${ownerName} เป็นผู้ประกอบการ (Tenant) อัตโนมัติ`,
      "success"
    );

    // Reset inputs
    setBusinessName("");
    setTaxId("");
    setRegisteredAddress("");
    setPhone("");
    setNationalId("");
    setDeposit("10000");
    setScholarship("2000");
    setTerms("");
    setNote("");
    setUploadedFile(null);
    setUploadedVerificationFile(null);
  };

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
    // Reset all form inputs to prevent lingering dirty states
    setBusinessName("");
    setTaxId("");
    setRegisteredAddress("");
    setPhone("");
    setNationalId("");
    setDeposit("10000");
    setScholarship("2000");
    setTerms("");
    setNote("");
    setUploadedFile(null);
    setUploadedVerificationFile(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-120 flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle className="text-emerald-500" size={20} />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-linear-to-br from-card to-card/50 p-8 rounded-3xl border border-border/60 shadow-sm relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl" />

          <div className="flex items-start gap-5 relative z-10">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20 ring-4 ring-brand-primary/10">
              <area.icon size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">{area.name}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50">
                  <MapPin size={14} className="text-brand-primary" />
                  มี {area.subLocations.length} พื้นที่ย่อย
                </span>
                <span className="flex items-center gap-1.5 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50">
                  <Store size={14} className="text-brand-primary" />
                  ผู้ประกอบการทั้งหมด {tenantsList.length} ราย
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto z-10">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="ค้นหาร้านค้า, ชื่อเจ้าของ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm bg-background shadow-sm h-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(businessTypeFilter || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 bg-card p-3 rounded-2xl border border-border/50 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">ตัวกรองที่ใช้งาน:</p>
          {businessTypeFilter && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              ประเภทธุรกิจ: {businessTypeFilter}
              <button
                type="button"
                onClick={() => {
                  const newParams = new URLSearchParams(window.location.search);
                  newParams.delete("businessType");
                  router.push(`${window.location.pathname}?${newParams.toString()}`);
                }}
                className="hover:bg-brand-primary/20 rounded-full p-0.5 transition-colors animate-in fade-in zoom-in-50 duration-200"
                title="ล้างการกรองประเภทธุรกิจ"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              คำค้นหา: {searchQuery}
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="hover:bg-brand-primary/20 rounded-full p-0.5 transition-colors animate-in fade-in zoom-in-50 duration-200"
                title="ล้างคำค้นหา"
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Sub Locations Navigator (Tabs Style) */}
      <div className="flex items-center gap-8 overflow-x-auto border-b border-border/60 scrollbar-hide mb-2">
        <button
          onClick={() => setSelectedSub("all")}
          className={cn(
            "relative pb-4 text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2",
            selectedSub === "all"
              ? "text-brand-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          ทั้งหมด
          <span className={cn(
            "px-1.5 py-0.5 rounded-full text-[10px] transition-colors",
            selectedSub === "all" ? "bg-brand-primary/10 text-brand-primary" : "bg-slate-100 text-slate-500"
          )}>
            {tenantsList.length}
          </span>
          {selectedSub === "all" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
          )}
        </button>

        {area.subLocations.map((sub) => {
          const count = tenantsList.filter((t) => t.subLocation === sub).length;
          return (
            <button
              key={sub}
              onClick={() => setSelectedSub(sub)}
              className={cn(
                "relative pb-4 text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2",
                selectedSub === sub
                  ? "text-brand-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {sub}
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] transition-colors",
                selectedSub === sub ? "bg-brand-primary/10 text-brand-primary" : "bg-slate-100 text-slate-500"
              )}>
                {count}
              </span>
              {selectedSub === sub && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Grid of Tenants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTenants.length > 0 ? (
          filteredTenants.map((tenant) => (
            <div
              key={tenant.id}
              onClick={() => {
                const currentParams = new URLSearchParams(window.location.search);
                const queryStr = currentParams.toString();
                router.push(`/admin/tenants/lists/${area.id}/${tenant.id}${queryStr ? `?${queryStr}` : ""}`);
              }}
              className="group flex flex-col bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:border-brand-primary/30 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              {/* Card Top / Cover Area */}
              <div className="h-28 relative overflow-hidden bg-slate-100">
                {tenant.bannerUrl ? (
                  <img
                    src={tenant.bannerUrl}
                    alt={tenant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-r from-slate-100 to-slate-50" />
                )}

                {/* Overlay for action button */}
                <div className="absolute inset-0 p-3 flex justify-end items-start bg-linear-to-b from-black/10 to-transparent">
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()} // Prevent card click navigation trigger
                    className="text-slate-700 hover:text-foreground p-1.5 bg-white/80 backdrop-blur-md rounded-full transition-colors shadow-xs"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              {/* Avatar section */}
              <div className="px-5 pt-5 mb-2">
                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 shadow-sm">
                  <Store size={24} strokeWidth={1.5} />
                </div>
              </div>

              {/* Card Content */}
              <div className="flex-1 flex flex-col px-5 pb-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-lg text-foreground leading-tight line-clamp-1 group-hover:text-brand-primary transition-colors">
                    {tenant.name}
                  </h3>
                </div>

                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-4">
                  <MapPin size={12} />
                  {tenant.subLocation}
                </p>

                <div className="space-y-3 mt-auto">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <User size={14} />
                      เจ้าของร้าน
                    </span>
                    <span className="font-medium text-foreground">{tenant.ownerName}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Store size={14} />
                      ประเภทธุรกิจ
                    </span>
                    <span className="font-medium text-foreground bg-slate-100 px-2 py-0.5 rounded-md text-xs">
                      {tenant.businessType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-3 border-t border-border/50">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar size={14} />
                      สัญญาหมดอายุ
                    </span>
                    <span className="font-medium text-foreground">{tenant.contractEndDate}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-card rounded-3xl border border-dashed border-border">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Search size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">ไม่พบข้อมูลผู้ประกอบการ</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              ไม่พบสถานประกอบการในพื้นที่ที่คุณเลือก หรือคำค้นหาไม่ตรงกับข้อมูลที่มีในระบบ
            </p>
          </div>
        )}
      </div>

      {/* CREATE CONTRACT DRAWER (สอดคล้องกับหน้า admin/areas) */}
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
                <div className="size-9 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center">
                  <FileText size={20} className="text-[#f26522]" strokeWidth={3} />
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

              {/* ส่วนที่ 1: ข้อมูลผู้ประกอบการ */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 border-l-4 border-[#f26522] pl-2.5">
                  ข้อมูลส่วนตัวผู้ประกอบการ
                </h4>

                {/* Select User (Owner) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">เลือกผู้ใช้งานที่จะเป็นคู่สัญญา (User)</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700 placeholder:text-slate-300"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700 placeholder:text-slate-300"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700 placeholder:text-slate-300"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                      required
                    />
                  </div>
                </div>

                {/* Registered Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ที่อยู่จดทะเบียนร้านค้า</label>
                  <textarea
                    placeholder="กรอกที่อยู่จดทะเบียนร้านค้า..."
                    value={registeredAddress}
                    onChange={(e) => setRegisteredAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[7px] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700 min-h-[60px] resize-none placeholder:text-slate-300"
                    required
                  />
                </div>

                {/* Upload Verification Document */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">เอกสารตรวจสอบ (สำเนาบัตรประชาชน)</label>
                  <div
                    onClick={() => document.getElementById("verification-file-upload")?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-[#f26522]/40 rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-50/50 transition-all flex flex-col items-center justify-center gap-1 min-h-[100px]"
                  >
                    <UploadCloud className="text-slate-400" size={22} />
                    <span className="text-xs font-bold text-slate-650 truncate max-w-full px-4">
                      {uploadedVerificationFile ? uploadedVerificationFile.name : "แนบสำเนาบัตรประชาชน"}
                    </span>
                    <span className="text-[10px] text-slate-400">PDF หรือรูปภาพ ไม่เกิน 5MB</span>
                    <input
                      type="file"
                      id="verification-file-upload"
                      accept="application/pdf,image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setUploadedVerificationFile({
                            name: e.target.files[0].name,
                            size: `${(e.target.files[0].size / 1024 / 1024).toFixed(2)} MB`
                          });
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* ส่วนที่ 2: รายละเอียดพื้นที่และสัญญา */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 border-l-4 border-[#f26522] pl-2.5">
                  รายละเอียดพื้นที่และระยะเวลาสัญญา
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Select Sub-location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">พื้นที่จัดสรร / โซนย่อย</label>
                    <select
                      value={selectedSubLocation}
                      onChange={(e) => setSelectedSubLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700"
                    >
                      {area.subLocations.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Business Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ประเภทธุรกิจ</label>
                    <select
                      value={selectedBusinessType}
                      onChange={(e) => setSelectedBusinessType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700"
                    >
                      {area.businessTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">วันที่เริ่มสัญญา</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700"
                      required
                    />
                  </div>
                </div>

                {/* Upload File Zone (Contract) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">เอกสารสัญญาเช่าหลัก (PDF)</label>
                  <div
                    onClick={() => document.getElementById("contract-file-upload")?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-[#f26522]/40 rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-50/50 transition-all flex flex-col items-center justify-center gap-1 min-h-[100px]"
                  >
                    <UploadCloud className="text-slate-400" size={22} />
                    <span className="text-xs font-bold text-slate-650 truncate max-w-full px-4">
                      {uploadedFile ? uploadedFile.name : "แนบเอกสารสัญญาที่เซ็นแล้ว (PDF)"}
                    </span>
                    <span className="text-[10px] text-slate-400">PDF ขนาดไม่เกิน 5MB</span>
                    <input
                      type="file"
                      id="contract-file-upload"
                      accept="application/pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setUploadedFile({
                            name: e.target.files[0].name,
                            size: `${(e.target.files[0].size / 1024 / 1024).toFixed(2)} MB`
                          });
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* ส่วนที่ 3: ข้อตกลงการเงินและหมายเหตุ */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 border-l-4 border-[#f26522] pl-2.5">
                  ข้อตกลงการเงินและเงื่อนไขเพิ่มเติม
                </h4>

                <div className="grid grid-cols-3 gap-4">
                  {/* Monthly Rental */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ค่าบำรุง/เดือน</label>
                    <input
                      type="number"
                      value={monthlyRental}
                      onChange={(e) => setMonthlyRental(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700"
                      required
                    />
                  </div>

                  {/* Security Deposit */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">หลักประกัน (บาท)</label>
                    <input
                      type="number"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700"
                      required
                    />
                  </div>

                  {/* Scholarship */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ทุนการศึกษา (บาท)</label>
                    <input
                      type="number"
                      value={scholarship}
                      onChange={(e) => setScholarship(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Terms */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">เงื่อนไขเพิ่มเติม</label>
                    <textarea
                      placeholder="เงื่อนไขการใช้พื้นที่..."
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700 min-h-[60px] resize-none placeholder:text-slate-300"
                    />
                  </div>

                  {/* Note */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">หมายเหตุ</label>
                    <textarea
                      placeholder="บันทึกเพิ่มเติม..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all font-semibold text-slate-700 min-h-[60px] resize-none placeholder:text-slate-300"
                    />
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
                className="flex-1 h-12 rounded-[7px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                ยกเลิก
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-[7px] bg-[#f26522] hover:bg-[#d8561d] text-white font-bold shadow-lg shadow-[#f26522]/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
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

      {/* ACCIDENTAL EXIT CONFIRMATION ALERT (เพื่อลดข้อผิดพลาด) */}
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
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm transition-colors"
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

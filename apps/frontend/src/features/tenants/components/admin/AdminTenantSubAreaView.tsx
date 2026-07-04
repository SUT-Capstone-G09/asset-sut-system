"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Calendar, Store, MoreHorizontal, User, X, Plus, FileText, UploadCloud, CheckCircle } from "lucide-react";
import { tenantAreaOptions } from "@/features/tenants/data/tenant-areas";
import { generateMockTenants, MockTenant } from "@/features/tenants/data/mock-tenants";
import { cn } from "@/lib/utils";
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";

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

  const handleCreateContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !taxId || !registeredAddress || !startDate || !endDate) {
      showToast("กรุณากรอกข้อมูลให้ครบถ้วน", "error");
      return;
    }

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
    setUploadedFile(null);
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
        <AssetBreadcrumb
          items={[
            { label: "Admin", href: "/admin" },
            { label: "ผู้ประกอบการ", href: backHref },
            { label: area.name },
          ]}
        />

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

            {/* Create Contract Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.98] h-10 whitespace-nowrap"
            >
              <Plus size={16} />
              สร้างสัญญาใหม่
            </button>
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

      {/* CREATE CONTRACT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsCreateModalOpen(false)}
          />

          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl p-10 transform transition-all animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh] z-120">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-8 top-8 text-slate-300 hover:text-slate-555 transition-colors"
            >
              <X size={24} />
            </button>

            <form onSubmit={handleCreateContractSubmit} className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-primary text-white rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg shadow-brand-primary/10">
                  <FileText size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-800">
                  สร้างสัญญาใหม่
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  กรอกข้อมูลสัญญาเช่าเพื่ออัปเดตสิทธิ์ผู้เช่าโดยอัตโนมัติ
                </p>
              </div>

              <div className="space-y-4">
                {/* Select User (Owner) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">เลือกผู้ใช้งานที่จะเป็นคู่สัญญา (User)</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700 placeholder:text-slate-300"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700 placeholder:text-slate-300"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700 min-h-[70px] resize-none placeholder:text-slate-300"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Select Sub-location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">พื้นที่จัดสรร / โซนย่อย</label>
                    <select
                      value={selectedSubLocation}
                      onChange={(e) => setSelectedSubLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
                    >
                      {area.businessTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Monthly Rental */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ค่าเช่า (บาท/เดือน)</label>
                    <input
                      type="number"
                      value={monthlyRental}
                      onChange={(e) => setMonthlyRental(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
                      required
                    />
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">เริ่มสัญญา</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">สิ้นสุดสัญญา</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-slate-700"
                      required
                    />
                  </div>
                </div>

                {/* Upload File Zone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">เอกสารสัญญาเช่า (PDF)</label>
                  <div
                    onClick={() => document.getElementById("contract-file-upload")?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-brand-primary/40 rounded-2xl p-5 text-center cursor-pointer hover:bg-slate-50/50 transition-all flex flex-col items-center justify-center gap-1.5"
                  >
                    <UploadCloud className="text-slate-400" size={24} />
                    <span className="text-xs font-bold text-slate-600">
                      {uploadedFile ? uploadedFile.name : "ลากไฟล์มาวาง หรือ คลิกเพื่ออัปโหลดไฟล์"}
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

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-primary/10 transition-all active:scale-[0.98]"
                >
                  ยืนยันการสร้างสัญญาและอัปเดตสิทธิ์
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-full text-slate-400 font-bold py-2 hover:text-slate-600 transition-all text-sm"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Store, MoreHorizontal, User } from "lucide-react";
import { tenantAreaOptions } from "@/features/tenants/data/tenant-areas";
import { generateMockTenants } from "@/features/tenants/data/mock-tenants";
import { cn } from "@/lib/utils";
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";

export default function AdminTenantSubAreaView({ areaId }: { areaId: string }) {
  const area = tenantAreaOptions.find((a) => a.id === areaId);
  const router = useRouter();

  if (!area) return null;
  const [selectedSub, setSelectedSub] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allTenants = useMemo(() => generateMockTenants(area.id, area.subLocations), [area]);

  const filteredTenants = useMemo(() => {
    let result = allTenants;

    // Filter by sub location
    if (selectedSub !== "all") {
      result = result.filter((t) => t.subLocation === selectedSub);
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
  }, [allTenants, selectedSub, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <AssetBreadcrumb
          items={[
            { label: "Admin", href: "/admin" },
            { label: "ผู้ประกอบการ", href: "/admin/tenants/lists" },
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
                  ผู้ประกอบการทั้งหมด {allTenants.length} ราย
                </span>
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 z-10">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="ค้นหาร้านค้า, ชื่อเจ้าของ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm bg-background shadow-sm"
            />
          </div>
        </div>
      </div>

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
            {allTenants.length}
          </span>
          {selectedSub === "all" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
          )}
        </button>
        
        {area.subLocations.map((sub) => {
          const count = allTenants.filter(t => t.subLocation === sub).length;
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
              onClick={() => router.push(`/admin/tenants/lists/${area.id}/${tenant.id}`)}
              className="group flex flex-col bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:border-brand-primary/30 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              {/* Card Top / Cover Area */}
              <div className="h-16 bg-linear-to-r from-slate-100 to-slate-50 relative p-4 flex justify-end items-start group-hover:from-brand-primary/5 group-hover:to-transparent transition-colors">
                <button className="text-muted-foreground hover:text-foreground p-1.5 bg-white/60 backdrop-blur-md rounded-full transition-colors">
                  <MoreHorizontal size={16} />
                </button>
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
    </div>
  );
}

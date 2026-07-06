"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Inbox, LayoutGrid, List, RotateCcw, Filter } from "lucide-react";
import { tenantAreaOptions } from "@/features/tenants/data/tenant-areas";
import AdminTenantAreaCard from "./AdminTenantAreaCard";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

type ViewMode = "grid" | "list";

export default function AdminTenantAreaGrid() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read Select inputs directly from URL query parameters (source of truth)
  const selectedAreaType = searchParams.get("areaType") || "all";
  const selectedBusinessType = searchParams.get("businessType") || "all";
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Keep a local state for input text, initialized from searchParams
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  // Sync searchQuery local state to URL search parameters with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(window.location.search);
      if (searchQuery) {
        newParams.set("search", searchQuery);
      } else {
        newParams.delete("search");
      }
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, pathname, router]);

  // Handle dropdown value changes to update URL directly
  const handleAreaTypeChange = (value: string) => {
    const newParams = new URLSearchParams(window.location.search);
    if (value !== "all") {
      newParams.set("areaType", value);
    } else {
      newParams.delete("areaType");
    }
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const handleBusinessTypeChange = (value: string) => {
    const newParams = new URLSearchParams(window.location.search);
    if (value !== "all") {
      newParams.set("businessType", value);
    } else {
      newParams.delete("businessType");
    }
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const areaTypes = useMemo(() => {
    return Array.from(new Set(tenantAreaOptions.map((area) => area.name)));
  }, []);

  const businessTypes = useMemo(() => {
    return Array.from(new Set(tenantAreaOptions.flatMap((area) => area.businessTypes)));
  }, []);

  const filteredAndSortedAreas = useMemo(() => {
    return tenantAreaOptions.filter((area) => {
      // Filter by Area Type
      if (selectedAreaType !== "all" && area.name !== selectedAreaType) {
        return false;
      }

      // Filter by Business Type
      if (selectedBusinessType !== "all" && !area.businessTypes.includes(selectedBusinessType)) {
        return false;
      }

      // Filter by Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          area.name.toLowerCase().includes(query) ||
          area.businessTypes.some((bt) => bt.toLowerCase().includes(query)) ||
          area.subLocations.some((sl) => sl.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [searchQuery, selectedAreaType, selectedBusinessType]);

  // Utility to push search params to area detail page
  const handleAreaSelect = (areaId: string) => {
    const currentParams = new URLSearchParams(window.location.search);
    const queryStr = currentParams.toString();
    router.push(`/admin/tenants/lists/${areaId}${queryStr ? `?${queryStr}` : ""}`);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        {/* Left Section: Search and Filters */}
        <div className="flex flex-col sm:flex-row flex-1 gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="ค้นหาสถานที่, ประเภทร้านค้า หรือ โซนย่อย..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm bg-background h-10"
            />
          </div>

          {/* Area Type Filter */}
          <Select value={selectedAreaType} onValueChange={handleAreaTypeChange}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-border/80 bg-background text-sm h-10 gap-2">
              <Filter size={14} className="text-muted-foreground shrink-0" />
              <SelectValue placeholder="ทุกประเภทพื้นที่" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="rounded-xl">
              <SelectItem value="all">ทุกประเภทพื้นที่</SelectItem>
              {areaTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Business Type Filter */}
          <Select value={selectedBusinessType} onValueChange={handleBusinessTypeChange}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-border/80 bg-background text-sm h-10 gap-2">
              <Filter size={14} className="text-muted-foreground shrink-0" />
              <SelectValue placeholder="ทุกประเภทธุรกิจ" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="rounded-xl">
              <SelectItem value="all">ทุกประเภทธุรกิจ</SelectItem>
              {businessTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right Section: Sort and View Mode */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-xl border border-border/80 bg-background p-1 gap-0.5 shrink-0 h-10">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Grid view"
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200",
                viewMode === "grid"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-slate-100"
              )}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title="List view"
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200",
                viewMode === "list"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-slate-100"
              )}
            >
              <List size={15} />
            </button>
          </div>

          {/* Reset Filters Button */}
          {(searchQuery || selectedAreaType !== "all" || selectedBusinessType !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                router.push(pathname);
              }}
              title="ล้างตัวกรอง"
              className="flex items-center justify-center h-10 w-10 rounded-xl border border-border/80 bg-background text-muted-foreground hover:text-brand-primary hover:bg-brand-primary/5 transition-all duration-200 shrink-0"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      {(searchQuery || selectedAreaType !== "all" || selectedBusinessType !== "all") && (
        <p className="text-xs text-muted-foreground px-1">
          พบ{" "}
          <span className="font-bold text-foreground">{filteredAndSortedAreas.length}</span>{" "}
          สถานที่จาก
          {searchQuery && ` คำค้นหา "${searchQuery}"`}
          {selectedAreaType !== "all" && ` ประเภทพื้นที่ "${selectedAreaType}"`}
          {selectedBusinessType !== "all" && ` ประเภทธุรกิจ "${selectedBusinessType}"`}
        </p>
      )}

      {/* Results */}
      {filteredAndSortedAreas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-2xl border border-dashed border-border shadow-sm">
          <div className="bg-muted p-4 rounded-full mb-4">
            <Inbox size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">ไม่พบข้อมูลสถานที่</h3>
          <p className="text-muted-foreground max-w-md text-sm">
            ไม่พบสถานที่ที่ตรงกับคำค้นหา &quot;{searchQuery}&quot;
            <br />
            ลองใช้คำค้นหาอื่นหรือลดเงื่อนไขการกรอง
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredAndSortedAreas.map((area) => (
            <AdminTenantAreaCard
              key={area.id}
              area={area}
              isSelected={false}
              onSelect={() => handleAreaSelect(area.id)}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* List Header */}
          <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50">
            <span className="w-9" />
            <span>ชื่อสถานที่ / โซนย่อย</span>
            <span className="w-48">ประเภทธุรกิจ</span>
            <span className="w-16 text-right">ผู้ประกอบการ</span>
            <span className="w-4" />
          </div>
          {filteredAndSortedAreas.map((area) => (
            <AdminTenantAreaCard
              key={area.id}
              area={area}
              isSelected={false}
              onSelect={() => handleAreaSelect(area.id)}
              viewMode="list"
            />
          ))}
        </div>
      )}
    </div>
  );
}


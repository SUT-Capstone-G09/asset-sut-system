"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Inbox, LayoutGrid, List } from "lucide-react";
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

type SortOption = "default" | "name-asc" | "name-desc" | "tenant-desc" | "tenant-asc";
type ViewMode = "grid" | "list";

export default function AdminTenantAreaGrid() {
  const [selectedAreaId, setSelectedAreaId] = useState(
    tenantAreaOptions[0]?.id ?? ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filteredAndSortedAreas = useMemo(() => {
    let result = tenantAreaOptions.filter((area) => {
      const query = searchQuery.toLowerCase();
      return (
        area.name.toLowerCase().includes(query) ||
        area.businessTypes.some((bt) => bt.toLowerCase().includes(query)) ||
        area.subLocations.some((sl) => sl.toLowerCase().includes(query))
      );
    });

    switch (sortBy) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name, "th"));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name, "th"));
        break;
      case "tenant-desc":
        result.sort((a, b) => b.tenantCount - a.tenantCount);
        break;
      case "tenant-asc":
        result.sort((a, b) => a.tenantCount - b.tenantCount);
        break;
      default:
        break;
    }

    return result;
  }, [searchQuery, sortBy]);

  return (
    <div className="space-y-5 pb-16">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-3.5 rounded-2xl border border-border/50 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="ค้นหาสถานที่, ประเภทร้านค้า หรือ โซนย่อย..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm bg-background"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="flex-1 sm:flex-none sm:w-[220px] rounded-xl border-border/80 bg-background text-sm h-9 gap-2">
              <SlidersHorizontal size={14} className="text-muted-foreground shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="rounded-xl">
              <SelectItem value="default">เรียงตามค่าเริ่มต้น</SelectItem>
              <SelectItem value="name-asc">ชื่อสถานที่ (ก-ฮ)</SelectItem>
              <SelectItem value="name-desc">ชื่อสถานที่ (ฮ-ก)</SelectItem>
              <SelectItem value="tenant-desc">ผู้ประกอบการ (มากไปน้อย)</SelectItem>
              <SelectItem value="tenant-asc">ผู้ประกอบการ (น้อยไปมาก)</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex items-center rounded-xl border border-border/80 bg-background p-1 gap-0.5 shrink-0">
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
        </div>
      </div>

      {/* Result count */}
      {searchQuery && (
        <p className="text-xs text-muted-foreground px-1">
          พบ{" "}
          <span className="font-bold text-foreground">{filteredAndSortedAreas.length}</span>{" "}
          สถานที่จากคำค้นหา &quot;{searchQuery}&quot;
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
              isSelected={selectedAreaId === area.id}
              onSelect={() => setSelectedAreaId(area.id)}
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
              isSelected={selectedAreaId === area.id}
              onSelect={() => setSelectedAreaId(area.id)}
              viewMode="list"
            />
          ))}
        </div>
      )}
    </div>
  );
}


"use client"

import React from "react";
import { LayoutGrid, List, MapPin, ArrowRight, Search } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import SpaceCard from "./SpaceCard";
import { SpaceGridSkeleton } from "./SpaceSkeleton";
import { RentalSpace } from "@/features/space-rental/types/rental-space";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SpaceGridProps {
  filteredLocations: RentalSpace[];
  categories: string[];
  onResetFilters: () => void;
  isLoading?: boolean;
  onUpdateLocation?: (updatedLoc: RentalSpace) => void;
  viewMode?: "grid" | "list" | "map";
  setViewMode?: (mode: "grid" | "list" | "map") => void;
}

export default function SpaceGrid({ 
  filteredLocations, 
  categories,
  onResetFilters,
  isLoading = false,
  onUpdateLocation,
  viewMode = "grid",
  setViewMode
}: SpaceGridProps) {
  const router = useRouter();
  const params = useParams();
  const buildingId = params.buildingId ? Number(params.buildingId) : 0;

  const handleOpenSpacePage = (location: RentalSpace) => {
    router.push(`/admin/space-rental/building/${buildingId}/space/${location.id}`);
  };

  if (isLoading) {
    return <SpaceGridSkeleton />;
  }

  return (
    <div className="space-y-12 pb-20">
      {categories.length > 0 ? (
        categories.map((category) => {
          const items = filteredLocations.filter((l) => l.area === category);

          return (
            <div key={category} className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                {categories.length > 1 ? (
                  <div className="flex items-center gap-4 group">
                    <div className="w-1.5 h-8 bg-[#f26522] rounded-full shadow-[0_0_15px_rgba(242,101,34,0.4)] transition-all group-hover:h-10" />
                    <div className="space-y-0.5">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {category}
                      </h2>
                      <div className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          {items.length} Locations Available
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div />
                )}

              </div>

              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                  {items.map((location) => (
                    <SpaceCard
                      key={location.id}
                      location={location}
                      onClick={() => handleOpenSpacePage(location)}
                      showCategory={categories.length > 1}
                    />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="space-y-4">
                  {items.map((location) => (
                    <ListRow
                      key={location.id}
                      location={location}
                      onClick={() => handleOpenSpacePage(location)}
                      showCategory={categories.length > 1}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-32 bg-slate-50 rounded-md border-2 border-dashed border-slate-200">
          <div className="p-6 bg-white rounded-md shadow-xl shadow-slate-200 mb-4">
            <Search size={48} className="text-slate-300" />
          </div>
          <p className="text-lg font-bold text-slate-900">ไม่พบข้อมูลที่ตรงเงื่อนไข</p>
          <p className="text-sm text-slate-400">ลองปรับการค้นหาหรือล้างตัวกรอง</p>
          <Button 
            variant="outline" 
            onClick={onResetFilters}
            className="mt-6 rounded-md border-slate-200 text-slate-600 font-bold"
          >
            ล้างตัวกรองทั้งหมด
          </Button>
        </div>
      )}

    </div>
  );
}


function ListRow({ 
  location, 
  onClick,
  showCategory = true 
}: { 
  location: RentalSpace; 
  onClick: () => void;
  showCategory?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-md border border-slate-100 p-5",
        "flex items-center gap-6 cursor-pointer group transition-all duration-300",
        "hover:shadow-xl hover:shadow-slate-200/50 hover:border-[#f26522]/20 hover:-translate-x-1"
      )}
    >
      <div className="relative size-20 rounded-md overflow-hidden shrink-0 shadow-sm">
        <img
          src={location.image}
          alt={location.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        {showCategory && (
          <p className="text-[10px] font-black uppercase tracking-widest text-[#f26522] flex items-center gap-1.5">
            <MapPin size={12} strokeWidth={3} /> {location.area}
          </p>
        )}
        <h3 className="text-xl font-bold text-slate-900 truncate group-hover:text-[#f26522] transition-colors leading-tight">
          {location.name}
        </h3>
      </div>

      {location.area !== "โรงอาหาร" && (
        <div className="hidden lg:flex items-center gap-12 shrink-0 px-8 border-x border-slate-100">
          <ListInfoItem 
            label="สถานะ" 
            value={location.status === 'occupied' ? 'มีผู้เช่า' : 'ว่าง'} 
            highlight={location.status === 'occupied'} 
          />
        </div>
      )}

      <button className={cn(
        "shrink-0 size-12 rounded-md bg-slate-50 text-slate-400",
        "group-hover:bg-[#f26522] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#f26522]/30",
        "transition-all duration-300 flex items-center justify-center"
      )}>
        <ArrowRight size={20} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}

function ListInfoItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className={cn(
        "text-sm font-bold",
        highlight ? "text-emerald-600" : "text-slate-700"
      )}>
        {value}
      </p>
    </div>
  );
}

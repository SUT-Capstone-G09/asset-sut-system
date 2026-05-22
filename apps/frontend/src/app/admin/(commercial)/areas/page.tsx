"use client"

import React, { useMemo, Suspense } from "react";
import { Search, Building2 } from "lucide-react";
import AdminAreaHeader from "@/features/areas/components/admin/AdminAreaHeader";
import AdminAreaFilters from "@/features/areas/components/admin/AdminAreaFilters";
import AdminAreaGrid from "@/features/areas/components/admin/AdminAreaGrid";
import AdminAreaCategoryCard, { categoryIconMap } from "@/features/areas/components/admin/AdminAreaCategoryCard";
import { useAreaFilters } from "@/features/areas/hooks/useAreaFilters";
import { mockLocations } from "@/features/areas/data/locations";
import { Button } from "@/components/ui/button";

function AdminAreasPageContent() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    handleResetFilters,
    filteredLocations,
    categories
  } = useAreaFilters();

  const visibleCategories = useMemo(() => {
    return Array.from(new Set(filteredLocations.map((loc) => loc.category)));
  }, [filteredLocations]);

  const CategoryIcon = selectedCategory !== "all" ? (categoryIconMap[selectedCategory] || Building2) : Building2;
  const isDetailView = selectedCategory !== "all";

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <AdminAreaHeader 
        selectedCategory={selectedCategory} 
        onBack={() => setSelectedCategory("all")} 
      />

      {isDetailView ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white to-slate-50/50 p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#f26522]/5 rounded-full blur-3xl" />
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#f26522] text-white shadow-lg shadow-[#f26522]/20 ring-4 ring-[#f26522]/10">
                  <CategoryIcon size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight">{selectedCategory}</h1>
                </div>
              </div>

              <div className="relative w-full md:w-72 z-10">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อสถานที่ หรือเลขที่ห้อง..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200/80 rounded-[7px] focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all text-sm bg-white shadow-sm"
                />
              </div>
            </div>
          </div>

          <AdminAreaGrid 
            filteredLocations={filteredLocations}
            categories={[selectedCategory]}
            onResetFilters={handleResetFilters}
          />
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <AdminAreaFilters 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onReset={handleResetFilters}
          />

          {/* Section Header */}
          <div className="flex items-center gap-4 group">
            <div className="w-1.5 h-6 bg-[#f26522] rounded-full shadow-[0_0_15px_rgba(242,101,34,0.3)]" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">ประเภทพื้นที่</h2>
          </div>

          {visibleCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCategories.map((cat) => {
                const catLocations = mockLocations.filter((loc) => loc.category === cat);
                return (
                  <AdminAreaCategoryCard
                    key={cat}
                    categoryName={cat}
                    locations={catLocations}
                    isSelected={false}
                    onSelect={() => setSelectedCategory(cat)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 animate-in fade-in duration-300">
              <div className="p-5 bg-white rounded-xl shadow-md mb-4">
                <Search size={36} className="text-slate-300" />
              </div>
              <p className="text-base font-bold text-slate-700">ไม่พบประเภทพื้นที่ที่ตรงเงื่อนไขการค้นหา</p>
              <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือล้างการค้นหาเพื่อดูข้อมูลทั้งหมด</p>
              <Button 
                variant="outline" 
                onClick={handleResetFilters}
                className="mt-6 rounded-lg border-slate-200 text-slate-600 font-bold text-xs"
              >
                ล้างตัวกรองทั้งหมด
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminAreasPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f26522]" />
        </div>
      }
    >
      <AdminAreasPageContent />
    </Suspense>
  );
}


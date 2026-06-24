"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Location } from "@/features/areas/types/location";
import {
  MapPin,
  Search,
  X,
  LayoutGrid,
  Navigation,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AREA_CATEGORIES } from "@/features/areas/constants";
import LocationCard, { getCategoryIcon } from "./LocationCard";

const MapContainer = dynamic(() => import("@/components/map/MapContainer"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-brand-primary rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-400">กำลังโหลดแผนที่...</p>
      </div>
    </div>
  ),
});

/* Props */
interface AreasMapSectionProps {
  locations: Location[];
  categories: string[];
}

export default function AreasMapSection({
  locations,
  categories: allCategories,
}: AreasMapSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Carousel scroll states & ref
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollLimits = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 2);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 2);
    }
  }, []);

  useEffect(() => {
    checkScrollLimits();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollLimits);
      window.addEventListener("resize", checkScrollLimits);
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", checkScrollLimits);
      }
      window.removeEventListener("resize", checkScrollLimits);
    };
  }, [checkScrollLimits]);

  const scrollCarousel = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const filteredLocations = locations.filter((loc) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      loc.name.toLowerCase().includes(q) ||
      (loc.building ?? "").toLowerCase().includes(q) ||
      (loc.description ?? "").toLowerCase().includes(q);
    const matchesCategory =
      !selectedCategory || loc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory(null);
  }, []);

  const hasActiveFilters = searchQuery.length > 0 || selectedCategory !== null;

  return (
    <section className="space-y-6 py-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center">
              <Navigation size={14} className="text-brand-primary" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-primary">
              University Map
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            สำรวจพื้นที่เช่าทั้งหมด
          </h2>
          <p className="text-sm text-gray-400 max-w-lg">
            ค้นหาและเลือกพื้นที่ที่เหมาะสมกับธุรกิจของคุณ
            ภายในมหาวิทยาลัยเทคโนโลยีสุรนารี
          </p>
        </div>

        {/* Summary stat chips */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 border border-gray-100 rounded-xl">
            <MapPin size={14} className="text-brand-primary" />
            <span className="text-xs font-bold text-gray-700">
              {locations.length}
            </span>
            <span className="text-xs text-gray-400">สถานที่</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 border border-gray-100 rounded-xl">
            <LayoutGrid size={14} className="text-brand-primary" />
            <span className="text-xs font-bold text-gray-700">
              {allCategories.length}
            </span>
            <span className="text-xs text-gray-400">หมวดหมู่</span>
          </div>
        </div>
      </div>

      {/* Main Split Container */}
      <div className="relative bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
        {/* Map + Overlay Controls + Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px]">
          {/* Map Area */}
          <div className="relative h-[500px] lg:h-[640px] bg-gray-100">
            <MapContainer locations={filteredLocations} />

            {/* Floating controls — all at top */}
            <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col sm:flex-row sm:items-center gap-2.5">
              <div className="relative w-full sm:w-72 md:w-80 lg:w-96 shrink-0">
                <input
                  type="text"
                  placeholder="ค้นหาพื้นที่ อาคาร หรือร้านค้า..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-12 pr-10 bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-lg shadow-black/8 rounded-xl text-[13px] font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40 transition-all"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center pointer-events-none z-10">
                  <Search className="text-brand-primary" size={14} />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
                  >
                    <X size={12} className="text-gray-500" />
                  </button>
                )}
              </div>

              {/* Category chips */}
              <div className="relative flex items-center min-w-0 flex-1 group/carousel">
                {showLeftArrow && (
                  <button
                    onClick={() => scrollCarousel("left")}
                    className="absolute left-1 z-20 w-7 h-7 rounded-full bg-white/95 hover:bg-white border border-gray-200/80 shadow-md flex items-center justify-center text-gray-600 hover:text-brand-primary transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                )}

                <div
                  ref={scrollRef}
                  className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth min-w-0 flex-1 px-1 py-0.5"
                >
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold backdrop-blur-md border shadow-sm transition-all shrink-0 ${
                      !selectedCategory
                        ? "bg-brand-primary text-white border-brand-primary/80 shadow-orange-200/50"
                        : "bg-white/90 text-gray-600 border-white/60 hover:bg-white"
                    }`}
                  >
                    <LayoutGrid size={12} />
                    ทั้งหมด
                  </button>
                  {AREA_CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat.value;
                    return (
                      <button
                        key={cat.value}
                        onClick={() =>
                          setSelectedCategory(isActive ? null : cat.value)
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold backdrop-blur-md border shadow-sm transition-all shrink-0 ${
                          isActive
                            ? "bg-brand-primary text-white border-brand-primary/80 shadow-orange-200/50"
                            : "bg-white/90 text-gray-600 border-white/60 hover:bg-white"
                        }`}
                      >
                        {getCategoryIcon(cat.value)}
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {showRightArrow && (
                  <button
                    onClick={() => scrollCarousel("right")}
                    className="absolute right-1 z-20 w-7 h-7 rounded-full bg-white/95 hover:bg-white border border-gray-200/80 shadow-md flex items-center justify-center text-gray-600 hover:text-brand-primary transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Directory */}
          <div className="flex flex-col h-[500px] lg:h-[640px] border-l border-gray-100">
            {/* Sidebar Header */}
            <div className="px-5 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    รายการพื้นที่
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {hasActiveFilters ? (
                      <>
                        พบ{" "}
                        <span className="font-bold text-brand-primary">
                          {filteredLocations.length}
                        </span>{" "}
                        จาก {locations.length} รายการ
                      </>
                    ) : (
                      <>ทั้งหมด {locations.length} รายการ</>
                    )}
                  </p>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[11px] font-semibold text-brand-primary hover:text-brand-primary/70 transition-colors flex items-center gap-1"
                  >
                    <X size={12} />
                    ล้างตัวกรอง
                  </button>
                )}
              </div>
            </div>

            {/* Location Cards List */}
            <div className="flex-1 overflow-y-auto">
              {filteredLocations.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {filteredLocations.map((loc) => (
                    <LocationCard
                      key={loc.id}
                      location={loc}
                      isHovered={hoveredId === loc.id}
                      onMouseEnter={() => setHoveredId(loc.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    />
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="h-full flex flex-col items-center justify-center text-center px-8 py-12">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Search size={24} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">
                    ไม่พบพื้นที่ที่ตรงกัน
                  </p>
                  <p className="text-xs text-gray-400 mb-4 max-w-[200px]">
                    ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่นดูนะคะ
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-xs font-semibold text-brand-primary hover:text-brand-primary/70 transition-colors"
                  >
                    ล้างตัวกรองทั้งหมด
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar Footer */}
            {filteredLocations.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                <p className="text-[10px] text-gray-400 text-center">
                  คลิกที่รายการเพื่อดูตำแหน่งบนแผนที่ ·
                  กดที่หมุดบนแผนที่เพื่อดูรายละเอียด
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

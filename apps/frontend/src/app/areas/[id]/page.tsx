"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import {
  ArrowLeft,
  MapPin,
  Phone,
  FileText,
  Store,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Share2,
  Calendar,
  ArrowUpRight,
  Mail,
  Car,
  Wind,
  Laptop,
  ShoppingBag,
  Utensils,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import Footer from "@/components/layout/footer";
import { mockLocations } from "@/features/space-rental/data/mock-rental-spaces";
import { mockFloorPlans } from "@/features/space-rental/data/mock-floor-plans";
import { RentalSpace } from "@/features/space-rental/types/rental-space";
import { FloorPlanData, MapElement } from "@/features/space-rental/types/floor-plan";

// Dynamically load Leaflet MiniMap to prevent SSR window errors
const MiniMap = dynamic(() => import("@/components/map/MiniMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-brand-primary rounded-full animate-spin" />
        <span>กำลังโหลดแผนที่ตำแหน่ง...</span>
      </div>
    </div>
  ),
});

import StallCard from "@/features/space-rental/components/public/StallCard";

export default function AreaDetailPage() {
  const params = useParams<{ id: string }>();
  const locationIndex = mockLocations.findIndex((loc) => loc.id === params.id);
  const location = mockLocations[locationIndex];

  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollAmount = clientWidth * 0.8;
      carouselRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!location) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <PageContainer>
          <div className="text-center py-24 text-slate-500 font-medium">
            <p className="text-lg">ไม่พบข้อมูลพื้นที่เช่าที่ท่านระบุ</p>
            <Link
              href="/areas"
              className="text-brand-primary font-bold hover:underline mt-4 inline-block"
            >
              กลับไปหน้าหลักพื้นที่เช่า
            </Link>
          </div>
        </PageContainer>
        <Footer />
      </div>
    );
  }

  const isCanteen = location.area === "โรงอาหาร";

  // Fetch stalls inside this location using mockFloorPlans data
  const floorPlan = mockFloorPlans.find(fp => fp.locationId === location.id);
  const stalls = floorPlan 
    ? floorPlan.elements.filter(el => el.type === "area" && el.areaType === "shop") 
    : [];

  const occupiedStallsCount = stalls.filter(s => s.status === "occupied").length;
  const vacantStallsCount = stalls.filter(s => s.status === "open").length;
  const totalStallsCount = stalls.length;
  const occupancyPercent = totalStallsCount > 0 ? Math.round((occupiedStallsCount / totalStallsCount) * 100) : 0;

  // Dynamic Building Amenities list based on category
  const buildingAmenities = [];
  if (location.area === "โรงอาหาร") {
    buildingAmenities.push(
      { label: "โต๊ะ & ที่นั่งทานอาหาร", desc: "มีโซนพื้นที่นั่งรับประทานอาหารรวมขนาดใหญ่", icon: <Utensils size={18} /> },
      { label: "ร้านอาหารย่อยภายใน", desc: "มีตัวเลือกแผงอาหารและเครื่องดื่มบริการครบวงจร", icon: <Store size={18} /> },
      { label: "ที่จอดรถบริการ", desc: "มีจุดจอดรถยนต์และจักรยานยนต์สะดวกสบายรอบอาคาร", icon: <Car size={18} /> },
      { label: "ระบบระบายอากาศ", desc: "พัดลมและระบบหมุนเวียนอากาศกลางของโรงอาหาร", icon: <Wind size={18} /> }
    );
  } else if (location.area === "อาคารเรียนรวม" || location.area === "หอพักนักศึกษา") {
    buildingAmenities.push(
      { label: "Co-Working Space", desc: "ใกล้โซนอ่านหนังสือและจุดนั่งทำงานของนักศึกษา", icon: <Laptop size={18} /> },
      { label: "สินค้า & บริการ", desc: "ใกล้ตู้บริการอัตโนมัติหรือร้านค้าสะดวกซื้อ", icon: <ShoppingBag size={18} /> },
      { label: "ที่จอดรถบริการ", desc: "มีลานจอดรถยนต์และรถจักรยานยนต์ประจำอาคาร", icon: <Car size={18} /> }
    );
  } else {
    buildingAmenities.push(
      { label: "ที่จอดรถบริการ", desc: "มีลานจอดรถส่วนกลางสำหรับผู้มาติดต่อ", icon: <Car size={18} /> },
      { label: "สินค้า & บริการ", desc: "ใกล้พื้นที่บริการเชิงพาณิชย์หลักของมหาวิทยาลัย", icon: <ShoppingBag size={18} /> }
    );
  }

  // Generate a multi-image gallery dynamically using other mock location images
  const galleryImages = [
    location.image,
    mockLocations[(locationIndex + 1) % mockLocations.length].image,
    mockLocations[(locationIndex + 2) % mockLocations.length].image,
    mockLocations[(locationIndex + 3) % mockLocations.length].image,
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageContainer withPadding={true} withBreadcrumb={false}>
        
        {/* Core Layout Container */}
        <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-8">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-1">
              <Link
                href="/areas"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-primary transition-colors mb-2"
              >
                <ArrowLeft size={14} />
                ย้อนกลับไปค้นหา
              </Link>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {location.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary text-xs font-bold">
                  {location.area}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 font-medium flex items-center gap-1">
                <MapPin size={14} className="text-brand-primary shrink-0" />
                {location.building && <span>อาคาร {location.building} · </span>}
                <span>{location.address}</span>
              </p>
            </div>

            {/* Share Actions */}
            <div className="flex items-center gap-2">
              <button className="h-9 px-3.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 active:scale-95 transition-all">
                <Share2 size={14} />
                แชร์พื้นที่
              </button>
            </div>
          </div>

          {/* Airbnb-style Gallery Grid */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-2xl overflow-hidden shadow-sm bg-slate-100">
            {/* Main large image */}
            <div className="md:col-span-3 h-[280px] sm:h-[350px] md:h-[450px] relative overflow-hidden group">
              <img
                src={galleryImages[0]}
                alt={location.name}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
            {/* Right stacked images */}
            <div className="hidden md:flex flex-col gap-3 h-[450px]">
              <div className="flex-1 overflow-hidden relative group">
                <img
                  src={galleryImages[1]}
                  alt="Gallery alternate view 1"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 overflow-hidden relative group">
                <img
                  src={galleryImages[2]}
                  alt="Gallery alternate view 2"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 overflow-hidden relative group">
                <img
                  src={galleryImages[3]}
                  alt="Gallery alternate view 3"
                  className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-black tracking-wider bg-black/30 pointer-events-none">
                  + 4 รูปภาพเพิ่มเติม
                </div>
              </div>
            </div>
          </section>

          {/* Single-Column Workspace Layout */}
          <div className="space-y-10 pt-4">
            
            {/* Shared Building Amenities Section */}
            <section className="space-y-4">
              <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-5 bg-brand-primary rounded-full" />
                ข้อมูลของพื้นที่
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {buildingAmenities.map((amenity, idx) => (
                  <div 
                    key={idx}
                    className="border border-slate-100 rounded-2xl p-4 flex items-start gap-3.5 bg-white shadow-xs hover:border-slate-200 transition-colors"
                  >
                    <div className="p-2.5 bg-brand-primary/5 text-brand-primary rounded-xl shrink-0">
                      {amenity.icon}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-slate-800">{amenity.label}</h4>
                      <p className="text-[10px] text-slate-400 font-medium leading-normal">{amenity.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Floor Plan Blueprint Image (Canteen only) */}
            {isCanteen && (
              <section className="space-y-4">
                <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-brand-primary rounded-full" />
                  แผนผัง
                </h2>
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white p-4 max-w-2xl">
                  <img
                    src="/floor_plan_mockup.png"
                    alt="ผังแบบแปลนพื้นที่ตัวอย่าง"
                    className="w-full h-auto object-contain rounded-xl"
                  />
                </div>
              </section>
            )}

            {/* Visual Floor Plan Stall Listings Directory (Canteen only) */}
            {isCanteen && (
              <section className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-brand-primary rounded-full" />
                      ร้านค้าและแผงย่อย
                    </h2>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-bold text-slate-700">
                      แผงที่มีผู้เช่า: {occupiedStallsCount} / {totalStallsCount || 8} แผง ({occupancyPercent}%)
                    </span>
                    <div className="w-48 h-2 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-primary rounded-full transition-all duration-500"
                        style={{ width: `${occupancyPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {stalls.length > 0 ? (
                  <div className="relative group/carousel px-1">
                    {/* Prev Button */}
                    <button 
                      onClick={() => scroll("left")}
                      className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-brand-primary active:scale-90 transition-all opacity-0 group-hover/carousel:opacity-100 duration-300"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* Scrollable Carousel Track */}
                    <div 
                      ref={carouselRef}
                      className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-none"
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                      {stalls
                        .filter((stall) => stall.status !== "reserved" && stall.status !== "unavailable")
                        .map((stall) => (
                          <div 
                            key={stall.id} 
                            className="snap-start shrink-0 w-full max-w-[280px] flex"
                          >
                            <StallCard stall={stall} />
                          </div>
                        ))}
                    </div>

                    {/* Next Button */}
                    <button 
                      onClick={() => scroll("right")}
                      className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-brand-primary active:scale-90 transition-all opacity-0 group-hover/carousel:opacity-100 duration-300"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                    <p className="text-xs font-bold text-slate-400">ยังไม่มีข้อมูลแผงย่อยสำหรับสถานที่นี้</p>
                  </div>
                )}
              </section>
            )}

            {/* Geographic Leaflet Map */}
            <section className="space-y-4">
              <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-5 bg-brand-primary rounded-full" />
                แผนที่แสดงพิกัดที่ตั้งทรัพย์สิน (Location Coordinate)
              </h2>
              <div className="h-[300px] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                {location.coordinates ? (
                  <MiniMap coordinates={location.coordinates} />
                ) : (
                  <div className="h-full w-full bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-semibold">
                    ไม่มีพิกัดตำแหน่งระบุไว้
                  </div>
                )}
              </div>
            </section>

          </div>

        </div>
      </PageContainer>
      <Footer />
    </div>
  );
}


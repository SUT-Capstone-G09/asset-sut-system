import Link from "next/link";
import dynamic from "next/dynamic";
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
} from "lucide-react";
import type { Metadata } from "next";
import PageContainer from "@/components/layout/PageContainer";
import Footer from "@/components/layout/footer";
import { mockLocations } from "@/features/space-rental/data/mock-rental-spaces";
import { mockFloorPlans } from "@/features/space-rental/data/mock-floor-plans";
import { RentalSpace } from "@/features/space-rental/types/rental-space";
import { FloorPlanData, MapElement } from "@/features/space-rental/types/floor-plan";
import AreaStallsSection from "@/features/space-rental/components/public/AreaStallsSection";
import LocationMiniMap from "@/features/space-rental/components/public/LocationMiniMap";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const location = mockLocations.find((loc) => loc.id === id);
  return {
    title: location ? `${location.name} | SUT Asset Management` : "รายละเอียดพื้นที่เช่า",
    description: location ? location.description : "ระบบจัดการพื้นที่จัดสรรเชิงพาณิชย์",
  };
}

export default async function AreaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locationIndex = mockLocations.findIndex((loc) => loc.id === id);
  const location = mockLocations[locationIndex];

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
              <AreaStallsSection
                stalls={stalls}
                occupiedCount={occupiedStallsCount}
                totalCount={totalStallsCount}
                percent={occupancyPercent}
              />
            )}

            {/* Geographic Leaflet Map */}
            <section className="space-y-4">
              <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-5 bg-brand-primary rounded-full" />
                แผนที่แสดงพิกัดที่ตั้งทรัพย์สิน (Location Coordinate)
              </h2>
              <div className="h-[300px] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                {location.coordinates ? (
                  <LocationMiniMap coordinates={location.coordinates} />
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


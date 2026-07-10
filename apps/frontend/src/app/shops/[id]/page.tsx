"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockFloorPlans } from "@/features/space-rental/data/mock-floor-plans";
import { mockLocations } from "@/features/space-rental/data/mock-rental-spaces";
import { RentalSpace } from "@/features/space-rental/types/rental-space";
import { FloorPlanData, MapElement } from "@/features/space-rental/types/floor-plan";
import { 
  Store, MapPin, Tag, Clock, Phone, MessageSquare, 
  Mail, CheckCircle, ArrowLeft
} from "lucide-react";
import { Label } from "@/components/ui/label";
import PageContainer from "@/components/layout/PageContainer";
import Footer from "@/components/layout/footer";

const FacebookIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

// Helper to get dynamic premium cover banner based on category
const getCoverImage = (shopType: string) => {
  const type = (shopType || "").toLowerCase();
  if (type.includes("เครื่องดื่ม") || type.includes("กาแฟ") || type.includes("ชา") || type.includes("คาเฟ่") || type.includes("beverage")) {
    return "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80"; // Cafe
  }
  if (type.includes("ก๋วยเตี๋ยว") || type.includes("เส้น") || type.includes("บะหมี่") || type.includes("ราเมง") || type.includes("noodle")) {
    return "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80"; // Noodles
  }
  if (type.includes("ส้มตำ") || type.includes("อีสาน") || type.includes("รสจัด") || type.includes("แซ่บ")) {
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80"; // Spicy/Thai food
  }
  if (type.includes("ชาบู") || type.includes("สุกี้") || type.includes("ปิ้งย่าง") || type.includes("หมูกระทะ")) {
    return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"; // Shabu/Hotpot/Restaurant
  }
  if (type.includes("ขนม") || type.includes("หวาน") || type.includes("เบเกอรี่") || type.includes("dessert")) {
    return "https://images.unsplash.com/photo-1511018556340-d16986a1c194?auto=format&fit=crop&w=1200&q=80"; // Dessert/Bakery/Cafe
  }
  return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80"; // General food banner
};

export default function ShopProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Default fallback values
  const defaultProfile = {
    shop_name: "ร้านค้าในระบบ SUT",
    location: "ไม่ระบุพื้นที่",
    shop_type: "อาหารและเครื่องดื่ม",
    status: "เปิดทำการ",
    operating_days: "จันทร์ - ศุกร์ (08:00 - 17:00 น.)",
    phone: "081-234-5678",
    line_id: "sut_shop_line",
    facebook: "sut_shop_official",
    email: "operator@sut.ac.th",
    shop_image: "",
  };

  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    // 1. Find the stall from mockFloorPlans
    const allStalls = mockFloorPlans.flatMap(fp => fp.elements).filter(el => el.type === "area" && el.areaType === "shop");
    const stall = allStalls.find(s => s.id === params.id);

    // 2. Find the location name from mockLocations
    let locationName = "โรงอาหาร SUT";
    if (stall) {
      const floorPlan = mockFloorPlans.find(fp => fp.elements.some(el => el.id === stall.id));
      if (floorPlan) {
        const loc = mockLocations.find(l => l.id === floorPlan.locationId);
        if (loc) {
          locationName = `${loc.name} - ล็อก ${stall.label || "ไม่ระบุ"}`;
        }
      }
    }

    // Determine the mock category based on name
    const getMockCategory = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes("เตี๋ยว") || n.includes("บะหมี่") || n.includes("ราเมง")) return "อาหารจานเดียว (ประเภทเส้น)";
      if (n.includes("ส้มตำ") || n.includes("แซ่บ") || n.includes("ลาบ")) return "อาหารอีสาน / รสจัด";
      if (n.includes("ข้าว") || n.includes("แกง")) return "อาหารจานเดียว / ข้าวราดแกง";
      if (n.includes("น้ำ") || n.includes("เครื่องดื่ม") || n.includes("ชา") || n.includes("กาแฟ")) return "เครื่องดื่ม & คาเฟ่";
      if (n.includes("ขนม") || n.includes("หวาน")) return "ขนมหวาน & ของว่าง";
      return "อาหารและเครื่องดื่ม";
    };

    // 3. Try to load saved details from localStorage to keep edits persistent
    const localStorageKey = `shop_profile_${params.id}`;
    const savedData = localStorage.getItem(localStorageKey);

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        requestAnimationFrame(() => {
          setProfile(parsed);
        });
      } catch {
        // Fallback if error parsing
      }
    } else if (stall) {
      const initialProfile = {
        shop_name: stall.tenant || stall.name || "ร้านอาหารแสนอร่อย",
        location: locationName,
        shop_type: getMockCategory(stall.tenant || stall.name || ""),
        status: stall.status === "occupied" ? "เปิดทำการ" : "ปิดทำการชั่วคราว",
        operating_days: "จันทร์ - ศุกร์ (08:00 - 18:00 น.)",
        phone: "081-234-5678",
        line_id: "sut_shop_line",
        facebook: "sut_shop_official",
        email: "operator@sut.ac.th",
        shop_image: "",
      };
      requestAnimationFrame(() => {
        setProfile(initialProfile);
      });
      localStorage.setItem(localStorageKey, JSON.stringify(initialProfile));
    }
  }, [params.id]);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30">
      <PageContainer withPadding={true} withBreadcrumb={false}>
        {/* Core Layout Container */}
        <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-8 animate-in fade-in duration-500">
          
          {/* Back Navigation Link */}
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-primary transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft size={14} />
            ย้อนกลับ
          </button>

          {/* Shop Profile Header Banner Card */}
          <div className="relative rounded-md border border-slate-100 bg-white shadow-sm overflow-hidden">
            {/* Cover Image */}
            <div className="relative h-48 sm:h-56 md:h-64 bg-slate-100 overflow-hidden">
              <img 
                src={getCoverImage(profile.shop_type)} 
                alt="Cover Image" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Logo Box - centered and overlapping bottom border */}
            <div className="absolute top-48 sm:top-56 md:top-64 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl bg-white p-1 shadow-md border-2 border-white flex items-center justify-center overflow-hidden">
              {profile.shop_image ? (
                <img src={profile.shop_image} alt="Shop Logo" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-200 flex items-center justify-center text-brand-primary text-3xl sm:text-4xl font-black font-sans rounded-lg">
                  {profile.shop_name.replace("ร้าน", "").charAt(0)}
                </div>
              )}
            </div>

            {/* Shop Details */}
            <div className="pt-14 sm:pt-16 md:pt-20 pb-6 px-6 text-center space-y-2">
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                {profile.shop_name}
              </h1>
              
              <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500">
                <Tag size={14} className="text-brand-primary opacity-80" />
                <span>ประเภท: {profile.shop_type}</span>
              </div>
            </div>
          </div>

          {/* Grid Layout Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch">
            
            {/* Left Side: Shop Stats Card */}
            <div className="md:col-span-3 bg-white rounded-md border border-slate-100 p-6 md:p-8 shadow-sm space-y-6 h-full">
              <h2 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-2 border-b border-slate-50 pb-4">
                <span className="w-1 h-4 bg-brand-primary rounded-full" />
                ข้อมูลร้านค้า
              </h2>

              <div className="flex flex-col gap-6">
                
                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-50/80 text-brand-primary rounded-md shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">แผงค้า / พื้นที่เช่า</p>
                    <p className="text-sm font-black text-slate-800 leading-snug">{profile.location}</p>
                  </div>
                </div>

                {/* Operating hours */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-50/80 text-brand-primary rounded-md shrink-0">
                    <Clock size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">วัน & เวลาทำการ</p>
                    <p className="text-sm font-black text-slate-800 leading-snug">{profile.operating_days}</p>
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-50/80 text-brand-primary rounded-md shrink-0">
                    <Store size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ประเภทบริการ</p>
                    <p className="text-sm font-black text-slate-800 leading-snug">{profile.shop_type}</p>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-50/80 text-brand-primary rounded-md shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">สถานะการตรวจสอบ</p>
                    <p className="text-sm font-black text-emerald-600">เปิดบริการปกติ</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Side: Contact info (Read-only) */}
            <div className="md:col-span-2 bg-white rounded-md border border-slate-100 p-6 md:p-8 shadow-sm space-y-6 h-full">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <h2 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <span className="w-1 h-4 bg-brand-primary rounded-full" />
                  ช่องทางติดต่อร้าน
                </h2>
              </div>

              <div className="space-y-4">
                {/* Phone */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" />
                    เบอร์โทรศัพท์ติดต่อ
                  </Label>
                  <p className="text-sm font-black text-slate-800 px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-md">
                    {profile.phone}
                  </p>
                </div>

                {/* LINE ID */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-slate-400" />
                    LINE ID
                  </Label>
                  <p className="text-sm font-black text-slate-800 px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-md">
                    {profile.line_id ? `@${profile.line_id}` : "- ไม่ระบุ -"}
                  </p>
                </div>

                {/* Facebook */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <FacebookIcon size={13} className="text-slate-400" />
                    Facebook
                  </Label>
                  <p className="text-sm font-black text-slate-800 px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-md">
                    {profile.facebook ? profile.facebook : "- ไม่ระบุ -"}
                  </p>
                </div>

                {/* Email (Read only) */}
                <div className="space-y-1.5 border-t border-slate-50 pt-4">
                  <Label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Mail size={13} className="text-slate-400" />
                    อีเมลติดต่อบัญชี
                  </Label>
                  <p className="text-sm font-semibold text-slate-400 px-3 py-2 bg-slate-50/50 rounded-md truncate">
                    {profile.email}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </PageContainer>
      <Footer />
    </div>
  );
}


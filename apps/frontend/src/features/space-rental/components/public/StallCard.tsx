"use client";

import { AlertTriangle, FileText, Store, ArrowRight } from "lucide-react";
import { MapElement } from "@/features/space-rental/types/floor-plan";
import Link from "next/link";

interface StallCardProps {
  stall: MapElement;
}

function getStallDetails(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("เตี๋ยว") || normalized.includes("บะหมี่") || normalized.includes("ราเมง")) {
    return {
      category: "อาหารหลัก (เส้น)",
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60",
    };
  }
  if (normalized.includes("ส้มตำ") || normalized.includes("แซ่บ") || normalized.includes("ลาบ")) {
    return {
      category: "อาหารอีสาน/รสจัด",
      image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500&auto=format&fit=crop&q=60",
    };
  }
  if (normalized.includes("ข้าว") || normalized.includes("แกง")) {
    return {
      category: "อาหารจานเดียว/ราดแกง",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
    };
  }
  if (normalized.includes("น้ำ") || normalized.includes("เครื่องดื่ม") || normalized.includes("ชา") || normalized.includes("กาแฟ")) {
    return {
      category: "เครื่องดื่ม & คาเฟ่",
      image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60",
    };
  }
  if (normalized.includes("ขนม") || normalized.includes("หวาน") || normalized.includes("บัวลอย") || normalized.includes("เค้ก")) {
    return {
      category: "ของหวาน & เบเกอรี่",
      image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=60",
    };
  }
  return {
    category: "อาหารและเครื่องดื่ม",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=60",
  };
}

export default function StallCard({ stall }: StallCardProps) {
  const isOccupied = stall.status === "occupied";
  const isMaintenance = stall.status === "maintenance";
  const stallInfo = getStallDetails(stall.tenant || stall.name || "");

  if (isOccupied) {
    return (
      <Link 
        href={`/shops/${stall.id}`}
        className="group overflow-hidden bg-white border border-slate-200/60 shadow-sm rounded-[7px] w-full h-full flex flex-col gap-0 py-0 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-md cursor-pointer text-left decoration-transparent"
      >
        {/* Image Container */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100 rounded-t-[7px]">
          <img
            src={stallInfo.image}
            alt={stall.tenant || stall.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-80" />

          {/* Category / Stall Label Badge */}
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-md rounded-md border border-white/20">
              <span className="text-[9px] font-bold text-white uppercase tracking-wider font-sans">
                แผง {stall.label}
              </span>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="space-y-1.5 p-5 pb-0 min-h-[100px] font-sans">
          <h4 className="text-[18px] font-bold leading-snug text-slate-900 line-clamp-1 group-hover:text-brand-primary transition-colors">
            {stall.tenant || stall.name}
          </h4>
          <p className="text-[12px] leading-relaxed text-slate-500 line-clamp-1">
            ประเภทร้าน: {stallInfo.category}
          </p>
        </div>

        {/* Action Footer */}
        <div className="p-5 mt-auto pt-4 font-sans">
          <div className="flex w-full items-center justify-center gap-2 rounded-[7px] bg-slate-50 py-3 text-[12px] font-semibold text-slate-600 transition-all duration-200 group-hover:bg-brand-primary group-hover:text-white active:scale-[0.98]">
            ดูรายละเอียด
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </div>
        </div>
      </Link>
    );
  }

  if (isMaintenance) {
    return (
      <div className="group overflow-hidden bg-white border border-slate-200/60 shadow-sm rounded-[7px] w-full h-full flex flex-col gap-0 py-0 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-md text-left">
        {/* Image Container */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100/80 flex items-center justify-center border-b border-slate-100 rounded-t-[7px]">
          <AlertTriangle size={36} className="text-amber-500/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-transparent opacity-80" />

          {/* Category / Stall Label Badge */}
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-md rounded-md border border-white/20">
              <span className="text-[9px] font-bold text-white uppercase tracking-wider font-sans">
                แผง {stall.label}
              </span>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="space-y-1.5 p-5 pb-0 min-h-[100px] font-sans">
          <h4 className="text-[18px] font-bold leading-snug text-slate-800 line-clamp-1">
            ปิดปรับปรุงชั่วคราว
          </h4>
        </div>

      </div>
    );
  }

  // Vacant Card (การ์ดแผงว่าง)
  return (
    <Link 
      href="/bookings"
      className="group overflow-hidden bg-white border border-slate-200/60 shadow-sm rounded-[7px] w-full h-full flex flex-col gap-0 py-0 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-md cursor-pointer text-left decoration-transparent"
    >
      {/* Image Container */}
      <div className="relative h-44 w-full overflow-hidden bg-orange-50/20 flex items-center justify-center border-b border-slate-100 rounded-t-[7px] group-hover:bg-orange-50/30 transition-colors">
        <Store size={36} className="text-brand-primary/20 group-hover:scale-110 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-transparent opacity-80" />

        {/* Category / Stall Label Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-md rounded-md border border-white/20">
            <span className="text-[9px] font-bold text-white uppercase tracking-wider font-sans">
              แผง {stall.label}
            </span>
          </div>
        </div>
      </div>

      {/* Content Details */}
      <div className="space-y-1.5 p-5 pb-0 min-h-[100px] font-sans">
        <h4 className="text-[18px] font-bold leading-snug text-slate-800 line-clamp-1 group-hover:text-brand-primary transition-colors">
          เปิดรับสมัครผู้เช่า
        </h4>
        <p className="text-[12px] leading-relaxed text-slate-500 line-clamp-2">
          โอกาสขยายกิจการร้านอาหาร/เครื่องดื่มใน มทส. ยื่นขอจองสิทธิ์ที่นี่
        </p>
      </div>

      {/* Action Footer */}
      <div className="p-5 mt-auto pt-4 font-sans">
        <div
          className="flex w-full items-center justify-center gap-2 rounded-[7px] bg-brand-primary text-white py-3 text-[12px] font-semibold transition-all duration-200 group-hover:bg-[#d8561d] active:scale-[0.98]"
        >
          สนใจจองพื้นที่
        </div>
      </div>
    </Link>
  );
}


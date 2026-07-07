"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Stock photos standing in for real room photos until each category has one
// uploaded — see docs/booking-flow-fixes.md for the swap-out plan. Picked
// and visually checked individually (Unsplash's old keyword-search endpoint
// is dead, so these are specific verified photo IDs, not a live query).
const AREA_TYPES = [
  {
    id: "meeting",
    label: "ห้องประชุม",
    tag: "ยอดนิยม",
    description: "ประชุมทีม, ทำงานกลุ่ม, นำเสนองาน",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80",
    accent: "bg-brand-primary",
  },
  {
    id: "classroom",
    label: "อาคารเรียน",
    description: "ห้องเรียน, ห้องบรรยาย, พื้นที่อ่านหนังสือ",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80",
    accent: "bg-brand-secondary",
  },
  {
    id: "sports",
    label: "สนามกีฬา",
    description: "ศูนย์กีฬา, ลู่วิ่ง, สนามแบดมินตัน, ฟิตเนส",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80",
    accent: "bg-success-500",
  },
  {
    id: "hall",
    label: "โถงอาคาร",
    description: "พื้นที่ส่วนกลาง, ลานจัดกิจกรรม, นิทรรศการ",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&q=80",
    accent: "bg-brand-accent",
  },
] as const;

export default function BookingAreaSelector() {
  const router = useRouter();

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-14 md:py-20">
      {/* Header — left-aligned, not a centered hero banner */}
      <div className="mb-10 md:mb-14 max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-primary mb-3">
          จองพื้นที่ใช้งาน
        </p>
        <h1 className="text-[28px] md:text-[34px] font-bold text-gray-900 leading-tight mb-3">
          เลือกประเภทสถานที่ที่ต้องการจอง
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed">
          ค้นหาห้องและพื้นที่ที่เหมาะสมกับการใช้งานของคุณ ตั้งแต่ห้องประชุมไปจนถึงพื้นที่จัดกิจกรรม
        </p>
      </div>

      {/* Area type grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {AREA_TYPES.map((area) => (
          <button
            key={area.id}
            onClick={() => router.push(`/bookings/search?category=${area.id}`)}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left transition-colors hover:border-gray-300"
          >
            <div className="relative h-40 w-full overflow-hidden">
              <img
                src={area.image}
                alt={area.label}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className={cn("absolute bottom-0 left-0 h-1 w-10", area.accent)} />
            </div>

            <div className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-gray-900">{area.label}</h3>
                  {"tag" in area && (
                    <span className="text-[11px] font-semibold text-brand-primary bg-brand-primary/10 rounded-full px-2 py-0.5">
                      {area.tag}
                    </span>
                  )}
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 shrink-0 mt-1 transition-all group-hover:text-gray-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <p className="text-sm text-gray-500 mt-1">{area.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

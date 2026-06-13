"use client";

import { useRouter } from "next/navigation";
import { Users, GraduationCap, Trophy, Landmark, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const AREA_TYPES = [
  {
    id: "meeting",
    label: "ห้องประชุม",
    description: "ห้องประชุมขนาดเล็ก กลาง และใหญ่ พร้อมสิ่งอำนวยความสะดวกครบครัน",
    icon: Users,
    color: "bg-blue-50 text-blue-600 border-blue-100",
    hover: "hover:bg-blue-600 hover:text-white hover:border-blue-600",
    accent: "bg-blue-600",
  },
  {
    id: "classroom",
    label: "ห้องเรียน",
    description: "ห้องบรรยายและห้องปฏิบัติการสำหรับการเรียนการสอนและฝึกอบรม",
    icon: GraduationCap,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    hover: "hover:bg-emerald-600 hover:text-white hover:border-emerald-600",
    accent: "bg-emerald-600",
  },
  {
    id: "sports",
    label: "สนามกีฬา",
    description: "สนามกีฬาและพื้นที่ออกกำลังกายหลากหลายประเภทภายในมหาวิทยาลัย",
    icon: Trophy,
    color: "bg-orange-50 text-orange-600 border-orange-100",
    hover: "hover:bg-orange-600 hover:text-white hover:border-orange-600",
    accent: "bg-orange-600",
  },
  {
    id: "hall",
    label: "โถงอาคาร",
    description: "พื้นที่สาธารณะและโถงอาคารสำหรับจัดงานและกิจกรรมต่าง ๆ",
    icon: Landmark,
    color: "bg-purple-50 text-purple-600 border-purple-100",
    hover: "hover:bg-purple-600 hover:text-white hover:border-purple-600",
    accent: "bg-purple-600",
  },
] as const;

export default function BookingAreaSelector() {
  const router = useRouter();

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-14">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-brand-secondary mb-3">
          เลือกประเภทพื้นที่
        </h1>
        <p className="text-gray-500 text-base max-w-xl mx-auto">
          เลือกประเภทพื้นที่ที่ต้องการจอง เพื่อค้นหาห้องและพื้นที่ที่เหมาะสมกับความต้องการของคุณ
        </p>
      </div>

      {/* Area Type Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {AREA_TYPES.map((area) => {
          const Icon = area.icon;
          return (
            <button
              key={area.id}
              onClick={() => router.push(`/bookings/search?category=${area.id}`)}
              className={cn(
                "group relative flex flex-col items-start gap-5 rounded-2xl border-2 p-7 text-left transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg",
                area.color,
                area.hover
              )}
            >
              {/* Icon */}
              <div className={cn(
                "flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300",
                "bg-white/60 group-hover:bg-white/20"
              )}>
                <Icon className="w-7 h-7" />
              </div>

              {/* Text */}
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{area.label}</h3>
                <p className="text-sm leading-relaxed opacity-80 group-hover:opacity-90">
                  {area.description}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center gap-1.5 text-sm font-semibold mt-1">
                <span>ค้นหา</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

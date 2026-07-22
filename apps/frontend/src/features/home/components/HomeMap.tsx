"use client";

import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

const legendItems = [
  { color: "#f26522", label: "ศูนย์อาหารและบริการ" },
  { color: "#e55a1a", label: "ตลาด" },
  { color: "#d4541a", label: "ร้านเบเกอรี่ / ร้านกาแฟ" },
  { color: "#c44e18", label: "ข้าว / แกง" },
  { color: "#a67436", label: "อาหารเพื่อสุขภาพ" },
  { color: "#2d5fa6", label: "อาหารนานาชาติ (อิสลาม)" },
  { color: "#3b75c4", label: "สุดยอด (อาหาร)" },
  { color: "#6d6e70", label: "ร้านค้าทั่วไปอื่น ๆ" },
  { color: "#8b5cf6", label: "อาคารเรียน / TCDC" },
  { color: "#10b981", label: "โรงภาพยนตร์" },
  { color: "#f59e0b", label: "อื่น ๆ" },
];

export default function HomeMap() {
  return (
    <section className="bg-gray-50 border-t border-gray-100 py-14">
      <div className="max-w-[1280px] mx-auto px-8 md:px-16">

        {/* Section Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#f26522] flex items-center justify-center shadow-md shadow-orange-200">
              <MapPin className="size-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">แผนผังพื้นที่เช่า</h2>
              <p className="text-sm font-bold text-[#f26522] tracking-widest">✦ ASSET SUT MAP ✦</p>
            </div>
          </div>
          <div className="h-0.5 w-24 bg-gradient-to-r from-[#f26522] to-[#a67436] rounded-full mt-2" />
        </div>

        {/* Map + Legend Grid */}
        <div className="grid md:grid-cols-[1fr_260px] gap-8 items-start">

          {/* Map Container */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative group">
            <div
              className="aspect-[4/3] w-full bg-gradient-to-br from-sky-100 via-green-50 to-emerald-100 flex items-center justify-center relative"
              style={{
                backgroundImage: "radial-gradient(circle at 30% 40%, #bfdbfe 0%, transparent 50%), radial-gradient(circle at 70% 60%, #bbf7d0 0%, transparent 50%)"
              }}
            >
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
                  backgroundSize: "30px 30px"
                }}
              />

              {/* Fake map pins */}
              {[
                { top: "25%", left: "30%" },
                { top: "35%", left: "50%" },
                { top: "45%", left: "38%" },
                { top: "55%", left: "60%" },
                { top: "30%", left: "65%" },
                { top: "60%", left: "42%" },
                { top: "40%", left: "25%" },
                { top: "50%", left: "72%" },
              ].map((pos, i) => (
                <div
                  key={i}
                  className="absolute flex flex-col items-center animate-bounce"
                  style={{
                    top: pos.top,
                    left: pos.left,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: "2s",
                  }}
                >
                  <div className="w-5 h-5 rounded-full bg-[#f26522] border-2 border-white shadow-md flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div className="w-0.5 h-2 bg-[#f26522]" />
                </div>
              ))}

              {/* Center label */}
              <div className="relative z-10 text-center p-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white shadow-sm">
                  <p className="text-sm font-bold text-gray-700">แผนผังเชิงโต้ตอบ</p>
                  <p className="text-xs text-gray-400 mt-1">Interactive Map — กำลังพัฒนา</p>
                </div>
              </div>
            </div>

            {/* Map Footer */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-50">
              <span className="text-xs text-gray-400">มหาวิทยาลัยเทคโนโลยีสุรนารี</span>
              <Link href="/areas">
                <button className="flex items-center gap-1 text-xs font-bold text-[#f26522] hover:text-[#d4541a] transition-colors group/btn">
                  เปิดแผนที่เต็มจอ
                  <ArrowRight className="size-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-black text-gray-700 mb-4 flex items-center gap-2">
              <MapPin className="size-4 text-[#f26522]" />
              ประเภทพื้นที่
            </h3>
            <div className="space-y-2.5">
              {legendItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3 group cursor-pointer">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors leading-snug">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link href="/areas">
                <button className="w-full bg-[#f26522] hover:bg-[#d4541a] text-white text-xs font-bold py-3 rounded-xl transition-all hover:shadow-md hover:shadow-orange-200 flex items-center justify-center gap-2 group">
                  ดูพื้นที่ทั้งหมด
                  <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

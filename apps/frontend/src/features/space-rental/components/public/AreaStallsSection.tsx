"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StallCard from "./StallCard";

interface AreaStallsSectionProps {
  stalls: any[];
  occupiedCount: number;
  totalCount: number;
  percent: number;
}

export default function AreaStallsSection({
  stalls,
  occupiedCount,
  totalCount,
  percent,
}: AreaStallsSectionProps) {
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

  return (
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
            แผงที่มีผู้เช่า: {occupiedCount} / {totalCount || 8} แผง ({percent}%)
          </span>
          <div className="w-48 h-2 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-primary rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {stalls.length > 0 ? (
        <div className="relative group/carousel px-1">
          {/* Prev Button */}
          <button 
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-brand-primary active:scale-90 transition-all opacity-0 group-hover/carousel:opacity-100 duration-300 cursor-pointer"
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
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-brand-primary active:scale-90 transition-all opacity-0 group-hover/carousel:opacity-100 duration-300 cursor-pointer"
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
  );
}

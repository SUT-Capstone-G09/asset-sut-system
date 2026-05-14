"use client"

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HomeNews() {
  const newsItems = [
    { id: 1, title: "ข่าวประชาสัมพันธ์ 1", image: "" },
    { id: 2, title: "ข่าวประชาสัมพันธ์ 2", image: "" },
    { id: 3, title: "ข่าวประชาสัมพันธ์ 3", image: "" },
  ];

  return (
    <section className="relative -mt-32 z-30 container mx-auto px-6">
      <div className="bg-white rounded-[40px] shadow-2xl p-12 md:p-16">
        <div className="flex flex-col items-center space-y-12">
          {/* Header */}
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            ประชาสัมพันธ์
          </h2>

          {/* Carousel Placeholder */}
          <div className="relative w-full flex items-center justify-between">
            <button className="p-2 text-gray-400 hover:text-[#f26522] transition-colors">
              <ChevronLeft size={40} strokeWidth={1.5} />
            </button>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
              {newsItems.map((item, idx) => (
                <div 
                  key={item.id}
                  className={`
                    bg-white rounded-3xl border border-gray-100 shadow-sm
                    aspect-[3/4] transition-all hover:scale-105 hover:shadow-lg
                    ${idx === 1 ? 'scale-110 shadow-md border-gray-200' : 'opacity-80 scale-95'}
                  `}
                >
                  <div className="w-full h-full flex items-center justify-center p-4">
                    {/* Placeholder for News Content */}
                    <div className="w-full h-full bg-gray-50 rounded-2xl border border-dashed border-gray-200" />
                  </div>
                </div>
              ))}
            </div>

            <button className="p-2 text-gray-400 hover:text-[#f26522] transition-colors">
              <ChevronRight size={40} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

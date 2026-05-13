"use client"

import { useState } from "react";
import dynamic from "next/dynamic";
import { Location } from "@/features/areas/types/location";
import { MapPin, Search } from "lucide-react";

const MapContainer = dynamic(
  () => import('@/components/map/MapContainer'),
  { 
    ssr: false,
    loading: () => (
      <div 
        className="
          h-[600px] w-full flex items-center justify-center 
          bg-gray-100 rounded-2xl
        "
      >
        <p className="text-lg font-medium text-gray-400 animate-pulse">
          กำลังโหลดแผนที่...
        </p>
      </div>
    )
  }
);

interface AreasMapSectionProps {
  locations: Location[];
  categories: string[];
}

export default function AreasMapSection({ locations, categories }: AreasMapSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLocations = locations.filter(loc => {
    return loc.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <section className="space-y-8 py-6">
      {/* Header */}
      <div 
        className="
          flex flex-col lg:flex-row lg:items-end justify-between gap-8 
          border-b border-gray-100 pb-10
        "
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-[2px] bg-[#f26522]" />
            <span 
              className="
                text-[10px] font-black uppercase tracking-[0.4em] 
                text-[#f26522]
              "
            >
              Explore Space
            </span>
          </div>

          <h2 
            className="
              text-4xl md:text-5xl font-black leading-none uppercase tracking-tighter 
              text-gray-900
            "
          >
            Interactive <br />
            <span className="text-gray-400">Map View</span>
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-72 h-11
                px-4 pl-11
                bg-gray-50 border border-gray-100
                rounded-xl
                text-xs font-medium focus:outline-none focus:border-[#f26522] 
                transition-all
              "
            />
          </div>
        </div>
      </div>
      
      {/* Split Layout */}
      <div 
        className="
          grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-0 overflow-hidden 
          bg-white border border-gray-100 rounded-2xl
        "
      >
        {/* Map Side */}
        <div className="relative h-[600px] lg:h-[700px] w-full bg-gray-50">
          <MapContainer />
        </div>

        {/* List Side */}
        <div 
          className="
            flex flex-col h-[600px] lg:h-[700px] 
            bg-white border-l border-gray-100
          "
        >
          <div className="p-8 border-b border-gray-50 space-y-1">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
              Location Directory
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#f26522] uppercase tracking-[0.2em]">
                All Locations
              </span>
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                {filteredLocations.length} results found
              </span>
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto custom-scrollbar">
            {categories.map((cat) => {
              const catLocations = filteredLocations.filter(l => l.category === cat);
              if (catLocations.length === 0) return null;

              return (
                <div key={cat}>
                  {/* Category Header */}
                  <div 
                    className="
                      sticky top-0 z-10 px-6 py-5 flex items-center justify-between 
                      bg-gray-50/50 backdrop-blur-sm border-b border-gray-100
                    "
                  >
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                      {cat}
                    </span>
                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                      {catLocations.length} locations
                    </span>
                  </div>

                  {catLocations.map((loc) => (
                    <div 
                      key={loc.id}
                      className="
                        group p-8 bg-white border-b border-gray-50 
                        hover:bg-gray-50/50 transition-all cursor-pointer
                      "
                    >
                      <div className="flex items-center gap-6">
                        <div className="space-y-1.5 flex-grow">
                          <h4 
                            className="
                              text-lg font-bold text-gray-900 leading-tight 
                              group-hover:text-[#f26522] transition-colors
                            "
                          >
                            {loc.name}
                          </h4>
                          <p className="text-xs text-gray-400 font-medium italic">
                            {loc.address}
                          </p>
                        </div>
                        <div 
                          className="
                            w-10 h-10 flex items-center justify-center 
                            bg-white border border-gray-100 rounded-full shadow-sm 
                            text-gray-300 group-hover:bg-[#f26522] group-hover:text-white group-hover:border-[#f26522] 
                            transition-all
                          "
                        >
                          <MapPin size={16} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {filteredLocations.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-30">
                <Search size={40} className="text-gray-200" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  No matching space found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

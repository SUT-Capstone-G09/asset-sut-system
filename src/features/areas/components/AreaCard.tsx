import Link from "next/link";
import { Store, ChevronRight } from "lucide-react";
import { Location } from "@/features/areas/types/location";

interface AreaCardProps {
  location: Location;
}

export default function AreaCard({ location }: AreaCardProps) {
  return (
    <Link
      href={`/location/${location.id}`}
      className="
        group relative flex flex-col h-full
        bg-white border border-gray-100 rounded-2xl overflow-hidden 
        shadow-sm hover:shadow-2xl transition-all duration-500 
      "
    >
      {/* Image Section */}
      <div className="relative h-56 w-full overflow-hidden">
        <img 
          src={location.image} 
          alt={location.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"  
        />

        <div 
          className="
            absolute top-4 right-4 z-10
            px-3 py-1 bg-white/90 backdrop-blur rounded-lg shadow-sm
            text-[10px] font-bold text-[#f26522] uppercase tracking-widest 
          "
        >
          {location.category}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 flex flex-col flex-grow space-y-5">
        <h4 
          className="
            text-2xl font-bold leading-tight text-gray-900 
            group-hover:text-[#f26522] transition-colors 
          "
        >
          {location.name}
        </h4>
        
        {/* Stats/Info */}
        <div className="pt-2 space-y-3 border-t border-gray-50">
          <div className="flex items-center text-sm">
            <span className="w-24 font-bold text-gray-400">หน่วยงาน:</span>
            <span className="font-semibold italic text-gray-700">SUT Property</span>
          </div>

          <div className="flex items-center text-sm">
            <span className="w-24 font-bold text-gray-400">สถานะ:</span>
            <span className="flex items-center gap-2 font-bold text-emerald-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              เปิดให้บริการ
            </span>
          </div>
        </div>

        {/* Action Button Section */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          {location.category === 'โรงอาหาร' ? (
            <div 
              className="
                flex items-center text-sm font-black uppercase tracking-wider 
                text-[#f26522] 
              "
            >
              ดูผังร้าน <ChevronRight size={20} className="ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          ) : (
            <div 
              className="
                flex items-center text-sm font-bold uppercase tracking-wider 
                text-gray-500 group-hover:text-[#f26522] transition-colors
              "
            >
              รายละเอียด <ChevronRight size={20} className="ml-1 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
            </div>
          )}
          
          <div 
            className="
              p-2 bg-gray-50 rounded-xl text-gray-300 
              group-hover:bg-[#f26522]/10 group-hover:text-[#f26522] transition-colors
            "
          >
            <Store size={20} />
          </div>
        </div>
      </div>
    </Link>
  )
}
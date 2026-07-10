"use client"

import { RentalSpace } from "@/features/areas/types/rental-space";
import { ChevronRight } from "lucide-react";
import { getCategoryIcon } from "@/utils/commercial-category-icons";


interface LocationCardProps {
  location: RentalSpace;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick?: () => void;
}

export default function LocationCard({
  location,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: LocationCardProps) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`
        group relative px-5 py-4 cursor-pointer transition-all duration-200
        ${isHovered ? "bg-orange-50/50" : "bg-white hover:bg-gray-50/50"}
      `}
    >
      {/* Active indicator bar */}
      <div className={`
        absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full transition-all duration-200
        ${isHovered ? "bg-brand-primary" : "bg-transparent"}
      `} />

      <div className="flex gap-3.5">
        {/* Thumbnail */}
        <div className={`
          relative w-[72px] h-[72px] rounded-xl overflow-hidden shrink-0
          border-2 transition-all duration-200
          ${isHovered ? "border-brand-primary/30 shadow-md shadow-orange-100" : "border-gray-100"}
        `}>
          <img
            src={location.image}
            alt={location.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Tags row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(() => {
              const CategoryIcon = getCategoryIcon(location.area);
              return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-brand-primary/8 text-brand-primary">
                  <CategoryIcon size={10} />
                  {location.area}
                </span>
              );
            })()}
          </div>

          {/* Title */}
          <h4 className="text-[13px] font-bold text-gray-900 leading-snug truncate group-hover:text-brand-primary transition-colors duration-200">
            {location.name}
          </h4>

          {/* RentalSpace info */}
          <p className="text-[11px] text-gray-400 truncate leading-tight">
            {location.building ?? location.address}
          </p>
        </div>

        {/* Chevron */}
        <div className="flex items-center shrink-0">
          <ChevronRight
            size={16}
            className={`transition-all duration-200 ${isHovered ? "text-brand-primary translate-x-0.5" : "text-gray-200"}`}
          />
        </div>
      </div>
    </div>
  );
}

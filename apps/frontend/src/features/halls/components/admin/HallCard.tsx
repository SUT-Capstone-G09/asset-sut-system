"use client"

import { MapPin, ArrowRight, LayoutGrid } from "lucide-react";
import { Hall } from "../../types/hall";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

interface HallCardProps {
  hall: Hall;
  hasFloorPlan?: boolean;
  onClick?: () => void;
}

const statusConfig = {
  available: {
    label: "ใช้งานได้",
    color: "bg-emerald-50/90 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
  },
  maintenance: {
    label: "ปิดปรับปรุง",
    color: "bg-red-50/90 text-red-500 border-red-100",
    dot: "bg-red-400",
  },
};

export default function HallCard({ hall, hasFloorPlan, onClick }: HallCardProps) {
  const status = statusConfig[hall.status ?? "available"];

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group overflow-hidden bg-white w-full transition-all duration-300",
        "hover:shadow-md hover:border-[#f26522]/20 hover:-translate-y-1",
        "cursor-pointer flex flex-col gap-0 py-0 border-slate-200/60 rounded-[7px]"
      )}
    >
      {/* Card Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 rounded-t-[7px]">
        <img
          src={hall.image}
          alt={hall.name}
          loading="lazy"
          suppressHydrationWarning={true}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20" />

        {/* Top Badges */}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm shadow-sm ring-1 ring-black/5",
              status.color.split(" ")[1]
            )}
          >
            <div className={cn("size-1.5 rounded-full animate-pulse", status.dot)} />
            <span className="text-[9px] font-black uppercase tracking-widest">{status.label}</span>
          </div>

          {hasFloorPlan && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-[#f26522]/90 backdrop-blur-md border border-white/20 rounded-md">
              <LayoutGrid size={10} className="text-white" strokeWidth={2.5} />
              <span className="text-[8px] font-bold text-white uppercase tracking-wider">มีผัง</span>
            </div>
          )}
        </div>

        {/* Bottom Category */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-md rounded-md border border-white/20">
            <MapPin size={10} className="text-[#f26522]" strokeWidth={2.5} />
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">{hall.category}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <CardHeader className="space-y-1 p-5 pb-0">
        <CardTitle className="text-[16px] font-bold leading-snug text-slate-900 line-clamp-1 group-hover:text-[#f26522] transition-colors text-left">
          {hall.name}
        </CardTitle>
        <CardDescription className="text-[12px] leading-relaxed text-slate-500 line-clamp-2 text-left">
          {hall.building}
        </CardDescription>
      </CardHeader>

      <CardFooter className="p-5 pt-4">
        <button
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-[7px] bg-slate-50 py-3",
            "text-[12px] font-semibold text-slate-600 transition-all duration-300",
            "group-hover:bg-[#f26522] group-hover:text-white active:scale-[0.98] cursor-pointer"
          )}
        >
          ดูรายละเอียดโถง
          <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </CardFooter>
    </Card>
  );
}

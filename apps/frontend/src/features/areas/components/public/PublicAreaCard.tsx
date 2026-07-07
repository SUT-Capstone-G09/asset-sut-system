"use client"

import { MapPin, ArrowRight } from "lucide-react";
import { Location } from "@/features/areas/types/location";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

interface PublicAreaCardProps {
  location: Location;
}

export default function PublicAreaCard({ location }: PublicAreaCardProps) {
  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(`/areas/${location.id}`)}
      className={cn(
        "group overflow-hidden",
        "bg-white w-full max-w-[300px] mx-auto",
        "transition-all duration-500 ease-out",
        "hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]",
        "cursor-pointer flex flex-col gap-0 py-0 border-slate-200/60 shadow-sm rounded-[7px]"
      )}
    >
      {/* Image Container */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 rounded-t-[7px]">

        <img
          src={location.image}
          alt={location.name}
          loading="lazy"
          suppressHydrationWarning={true}
          className="
            h-full w-full object-cover
            transition-transform duration-700
            group-hover:scale-110
          "
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-80" />

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-md rounded-md border border-white/20">
            <MapPin size={10} className="text-[#f26522]" strokeWidth={2.5} />
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">
              {location.category}
            </span>
          </div>
        </div>
      </div>

      {/* Header Info */}
      <CardHeader className="space-y-1.5 p-5 pb-0">
        <CardTitle
          className="
            text-[18px] font-bold leading-snug
            text-slate-900 line-clamp-1
            group-hover:text-[#f26522] transition-colors
          "
        >
          {location.name}
        </CardTitle>

        <CardDescription
          className="
            text-[12px] leading-relaxed
            text-slate-500 line-clamp-2
          "
        >
          {location.address}
        </CardDescription>
      </CardHeader>

      {/* Action Footer */}
      <CardFooter className="p-5 mt-auto">
        <button
          className={cn(
            "flex w-full items-center justify-center gap-2",
            "rounded-[7px] bg-slate-50 py-3",
            "text-[12px] font-semibold text-slate-600",
            "transition-all duration-200",
            "hover:bg-[#f26522] hover:text-white",
            "active:scale-[0.98]"
          )}
        >
          ดูรายละเอียด
          <ArrowRight
            size={14}
            className="
              transition-transform duration-200
              group-hover:translate-x-0.5
            "
          />
        </button>
      </CardFooter>
    </Card>
  );
}
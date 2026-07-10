// 1. React
import React, { useState } from "react";

// 2. Third-party libraries
import {
  MapPin,
  Building2,
  Maximize2,
  Calendar,
  Banknote,
  ExternalLink,
  Pencil,
  FileText,
  LayoutGrid,
} from "lucide-react";

// 3. Next.js
import { useRouter } from "next/navigation";

// 4. Feature Components
import { HighlightCard } from "../../drawers/sections/HighlightCard";
import SpaceEditDrawer from "../../drawers/SpaceEditDrawer";

// 5. Types & Helpers
import { RentalSpace } from "../../../../types/rental-space";
import { Building } from "../../../../types/building";
import { getCanteenStallStats } from "../../../../utils/stall-helpers";
import { cn } from "@/lib/utils";

interface SpaceDetailInfoTabProps {
  location: RentalSpace;
  building: Building;
  onUpdateLocation: (updatedLoc: RentalSpace) => void;
}

export default function SpaceDetailInfoTab({
  location,
  building,
  onUpdateLocation,
}: SpaceDetailInfoTabProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isCanteen = location.area === "โรงอาหาร";

  const { total: totalStallsCount } = getCanteenStallStats(location.id);

  const infoItems = [
    {
      icon: MapPin,
      label: "อาคาร / สถานที่",
      value: location.building || "ไม่ระบุ",
    },
    {
      icon: Building2,
      label: isCanteen ? "รหัสศูนย์อาหาร" : "รหัสห้อง / ชื่อพื้นที่",
      value: location.roomNumber || "ไม่ระบุ",
    },
    {
      icon: Maximize2,
      label: isCanteen ? "ขนาดพื้นที่รวม" : "ขนาดพื้นที่เช่า",
      value: location.size || "ไม่ระบุ",
    },
    ...(isCanteen
      ? [
          {
            icon: Calendar,
            label: "เวลาเปิดให้บริการ",
            value: "06:00 - 20:00 น.",
          },
        ]
      : [
          {
            icon: Banknote,
            label: "อัตราเช่าต่อเดือน",
            value: location.price ? `${location.price.toLocaleString()} บาท` : "ไม่ระบุ",
          },
        ]),
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left: Images */}
      <div className="md:col-span-1 space-y-3">
        <div className="relative rounded-[7px] overflow-hidden h-56 w-full bg-slate-100 group">
          <img
            src={location.image}
            alt={location.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <button className="absolute bottom-3 right-3 size-9 rounded-[7px] bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center">
            <ExternalLink size={16} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-[7px] overflow-hidden bg-slate-100 border border-transparent hover:border-[#f26522] transition-all cursor-pointer"
            >
              <img
                src={location.image}
                className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
          <div className="aspect-square rounded-[7px] bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer">
            +4
          </div>
        </div>
      </div>

      {/* Right: Info */}
      <div className="md:col-span-2 space-y-8">
        <div className="space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
            <Building2 size={14} className="text-[#f26522]" />
            ข้อมูลทั่วไปของพื้นที่
          </h3>

          {isCanteen ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <HighlightCard
                icon={MapPin}
                label="อาคาร / สถานที่"
                value={location.building || "ไม่ระบุ"}
                subValue="สถานที่ตั้งศูนย์อาหาร"
                theme="blue"
                className="w-full"
              />
              <HighlightCard
                icon={Store}
                label="ความจุแผงค้าย่อย"
                value={`${totalStallsCount} แผง`}
                subValue="จำนวนแผงค้าย่อยทั้งหมด"
                theme="orange"
                className="w-full"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 h-full flex">
                <HighlightCard
                  icon={Banknote}
                  label="ราคาเช่า"
                  value={location.price ? `${location.price.toLocaleString()} ฿` : "N/A"}
                  subValue="ต่อเดือน"
                  theme="emerald"
                  className="w-full flex-1"
                />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {infoItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-[7px] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all group"
                  >
                    <div className="size-8 rounded-[7px] bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover:border-[#f26522]/20 group-hover:bg-[#f26522]/5 transition-colors">
                      <item.icon
                        size={15}
                        className="text-[#6d6e70] group-hover:text-[#f26522] transition-colors"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-widest">
                        {item.label}
                      </p>
                      <p className="text-[12px] font-bold text-slate-700 truncate">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <hr className="border-slate-100" />

        <div className="space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
            <Pencil size={14} className="text-[#f26522]" />
            หมายเหตุ & การจัดการพื้นที่
          </h3>

          <div className="rounded-[7px] border border-slate-100 bg-slate-50/50 p-4 flex gap-3 group hover:bg-white hover:border-slate-200 transition-all">
            <div className="size-8 rounded-[7px] bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
              <FileText size={15} className="text-[#6d6e70]" />
            </div>
            <div className="flex-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                หมายเหตุเพิ่มเติม / รายละเอียด
              </span>
              <p className="text-[12px] text-slate-600 leading-relaxed">
                {location.description || "-"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {isCanteen ? (
              <AdminActionButton
                label="แก้ไขแปลนผัง (Floor Plan)"
                icon={LayoutGrid}
                variant="primary"
                className="col-span-2 w-full"
                onClick={() =>
                  router.push(`/admin/space-rental/floor-plan/${location.id}`)
                }
              />
            ) : (
              <>
                <AdminActionButton
                  label="แก้ไขข้อมูลทั่วไป"
                  icon={Pencil}
                  variant="secondary"
                  className="w-full"
                  onClick={() => setIsEditOpen(true)}
                />
                <AdminActionButton
                  label="จัดการแปลนพื้นที่"
                  icon={LayoutGrid}
                  variant="secondary"
                  className="w-full opacity-50 cursor-not-allowed"
                  onClick={undefined}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Nested Edit Space Drawer */}
      <SpaceEditDrawer
        location={location}
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdateLocation={onUpdateLocation}
      />
    </div>
  );
}

// Local helper component to stay independent
interface AdminActionButtonProps {
  label: string;
  icon: React.ElementType;
  variant: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
}

function AdminActionButton({
  label,
  icon: Icon,
  variant,
  className,
  onClick,
}: AdminActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-12 px-4 inline-flex items-center justify-center gap-3 rounded-[7px] border transition-all text-[13px] font-bold active:scale-[0.98]",
        variant === "primary"
          ? "bg-[#f26522] border-[#f26522] text-white shadow-lg shadow-[#f26522]/20 hover:bg-[#d8561d]"
          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
        className
      )}
    >
      <Icon size={16} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );
}

// Simple fallback if Store icon isn't imported
function Store(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M30 7H2v0" />
      <path d="M2 12h20" />
    </svg>
  );
}

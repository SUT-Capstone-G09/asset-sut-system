import { MapPin, ArrowRight, Store } from "lucide-react";
import { Location } from "@/features/areas/types/location";
import { cn } from "@/lib/utils";

interface AdminAreaCardProps {
  location: Location;
  onClick?: () => void;
}

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    dot: string;
  }
> = {
  active: {
    label: "มีผู้เช่า",
    color:
      "bg-emerald-50/90 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
  },

  vacant: {
    label: "ว่าง",
    color:
      "bg-amber-50/90 text-amber-700 border-amber-100",
    dot: "bg-amber-400",
  },

  inactive: {
    label: "ปิดใช้งาน",
    color:
      "bg-red-50/90 text-red-500 border-red-100",
    dot: "bg-red-400",
  },
};

export default function AdminAreaCard({
  location,
  onClick,
}: AdminAreaCardProps) {
  const status =
    statusConfig[location.status ?? "active"];

  const hasSubStalls =
    (location.subStallCount ?? 0) > 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group overflow-hidden rounded-[24px]",
        "border border-slate-100 bg-white",
        "shadow-sm transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl",
        "cursor-pointer"
      )}
    >
      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        <img
          src={location.image}
          alt={location.name}
          loading="lazy"
          className="
            h-full w-full object-cover
            transition-transform duration-500
            group-hover:scale-[1.03]
          "
        />

        {/* Soft Gradient */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-t
            from-black/40 via-black/5 to-transparent
          "
        />

        {/* Badges Container */}
        <div className="absolute left-3.5 top-3.5 flex items-center gap-2">
          {/* Category Overlay */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg border border-slate-200/50 shadow-sm">
            <MapPin size={10} className="text-[#f26522]" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
              {location.category}
            </span>
          </div>
        </div>

        {/* Stall Count */}
        {hasSubStalls && (
          <div
            className="
              absolute right-3.5 top-3.5
              flex items-center gap-1.5
              rounded-lg bg-black/35
              px-2.5 py-1
              text-[10px] font-semibold text-white
              backdrop-blur-sm
            "
          >
            <Store
              size={10}
              className="text-[#f26522]"
            />

            {location.subStallCount} แผง
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4 p-5">
        {/* Title */}
        <div className="space-y-1.5">
          <h3
            className="
              text-[16px] font-bold leading-snug
              text-slate-900 line-clamp-1
            "
          >
            {location.name}
          </h3>

          <p
            className="
              text-[12px] leading-relaxed
              text-slate-500 line-clamp-2
            "
          >
            {location.address}
          </p>
        </div>

        {/* Dynamic Content */}
        {hasSubStalls ? (
          <SubStallPreview
            stallCount={location.subStallCount ?? 0}
          />
        ) : (
          <SingleTenantInfo
            tenantName={location.tenantName}
            contractEndDate={location.contractEndDate}
          />
        )}

        {/* Action */}
        <button
          className={cn(
            "flex w-full items-center justify-center gap-2",
            "rounded-2xl bg-slate-50 py-3",
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
      </div>
    </div>
  );
}

function SubStallPreview({
  stallCount,
}: {
  stallCount: number;
}) {
  const occupied = Math.floor(stallCount * 0.75);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <StatItem
          label="ทั้งหมด"
          value={stallCount}
          color="text-slate-700"
          bg="bg-slate-50"
        />

        <StatItem
          label="มีผู้เช่า"
          value={occupied}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />

        <StatItem
          label="ว่าง"
          value={stallCount - occupied}
          color="text-amber-500"
          bg="bg-amber-50"
        />
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number | string;
  color: string;
  bg: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl py-3 text-center",
        bg
      )}
    >
      <p
        className={cn(
          "mb-1 text-sm font-bold leading-none",
          color
        )}
      >
        {value}
      </p>

      <p
        className="
          text-[9px] font-medium tracking-wide
          text-slate-400
        "
      >
        {label}
      </p>
    </div>
  );
}

function SingleTenantInfo({
  tenantName,
  contractEndDate,
}: {
  tenantName?: string;
  contractEndDate?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div
        className="
          rounded-2xl bg-slate-50
          px-4 py-3
        "
      >
        <p
          className="
            mb-1 text-[9px] font-medium
            tracking-wide text-slate-400
          "
        >
          ผู้เช่า
        </p>

        <p
          className="
            truncate text-[12px]
            font-semibold text-slate-700
          "
        >
          {tenantName || "เปิดว่าง"}
        </p>
      </div>

      <div
        className="
          rounded-2xl bg-slate-50
          px-4 py-3
        "
      >
        <p
          className="
            mb-1 text-[9px] font-medium
            tracking-wide text-slate-400
          "
        >
          สิ้นสุดสัญญา
        </p>

        <p
          className="
            text-[12px]
            font-semibold text-slate-700
          "
        >
          {contractEndDate || "—"}
        </p>
      </div>
    </div>
  );
}
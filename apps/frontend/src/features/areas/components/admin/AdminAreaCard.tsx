import { MapPin, ArrowRight, Store } from "lucide-react";
import { Location } from "@/features/areas/types/location";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

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
    color: "bg-emerald-50/90 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
  },
  vacant: {
    label: "ว่าง",
    color: "bg-amber-50/90 text-amber-700 border-amber-100",
    dot: "bg-amber-400",
  },
  inactive: {
    label: "ปิดใช้งาน",
    color: "bg-red-50/90 text-red-500 border-red-100",
    dot: "bg-red-400",
  },
};

export default function AdminAreaCard({
  location,
  onClick,
}: AdminAreaCardProps) {
  const status = statusConfig[location.status ?? "active"];
  const hasSubStalls = (location.subStallCount ?? 0) > 0;
  const isCanteen = location.category === "โรงอาหาร";

  return (

    <Card
      onClick={onClick}
      className={cn(
        "group overflow-hidden",
        "bg-white w-full",
        "transition-all duration-300",
        "hover:shadow-md hover:border-[#f26522]/20 hover:-translate-y-1",
        "cursor-pointer flex flex-col gap-0 py-0 border-slate-200/60 rounded-[7px]"
      )}
    >
      {/* Image */}
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20" />

        {/* Top Badges */}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {!isCanteen ? (
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm shadow-sm ring-1 ring-black/5",
                status.color.split(" ")[1]
              )}
            >
              <div className={cn("size-1.5 rounded-full animate-pulse", status.dot)} />
              <span className="text-[9px] font-black uppercase tracking-widest">
                {status.label}
              </span>
            </div>
          ) : (
            <div />
          )}

          {/* Count Badge */}

          {hasSubStalls && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/20">
              <Store size={10} className="text-[#f26522]" />
              <span className="text-[9px] font-bold text-white">
                {location.subStallCount}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Category */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-md rounded-md border border-white/20">
            <MapPin size={10} className="text-[#f26522]" strokeWidth={2.5} />
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">
              {location.category}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <CardHeader className="space-y-1.5 p-5 pb-0">
        <CardTitle
          className="
            text-[16px] font-bold leading-snug
            text-slate-900 line-clamp-1
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

      <CardContent className="p-5 py-4">
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
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <button
          className={cn(
            "flex w-full items-center justify-center gap-2",
            "rounded-[7px] bg-slate-50 py-3",
            "text-[12px] font-semibold text-slate-600",
            "transition-all duration-300",
            "group-hover:bg-brand-primary group-hover:text-white",
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
        "rounded-[7px] py-3 text-center",
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
          rounded-[7px] bg-slate-50
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
          rounded-[7px] bg-slate-50
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
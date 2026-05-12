import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TenantAreaOption } from "@/features/tenants/types/tenant-area";

interface AdminTenantAreaCardProps {
  area: TenantAreaOption;
  isSelected: boolean;
  onSelect: () => void;
  viewMode?: "grid" | "list";
}

export default function AdminTenantAreaCard({
  area,
  isSelected,
  onSelect,
  viewMode = "grid",
}: AdminTenantAreaCardProps) {
  const Icon = area.icon;

  // ---- LIST VIEW ----
  if (viewMode === "list") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "group w-full flex items-center gap-4 px-5 py-3.5 rounded-xl border text-left transition-all duration-200",
          isSelected
            ? "border-brand-primary bg-brand-primary/5 shadow-sm"
            : "border-border bg-card hover:border-brand-primary/40 hover:bg-slate-50/60"
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
            isSelected
              ? "bg-brand-primary text-white"
              : "bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white"
          )}
        >
          <Icon size={18} strokeWidth={2.5} />
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{area.name}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {area.subLocations.slice(0, 2).join(", ")}
            {area.subLocations.length > 2 && ` +${area.subLocations.length - 2}`}
          </p>
        </div>

        {/* Business Types */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          {area.businessTypes.slice(0, 2).map((type) => (
            <span
              key={type}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
            >
              {type}
            </span>
          ))}
          {area.businessTypes.length > 2 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
              +{area.businessTypes.length - 2}
            </span>
          )}
        </div>

        {/* Tenant Count */}
        <div className="shrink-0 text-right min-w-[60px]">
          <p className={cn("text-xl font-black", isSelected ? "text-brand-primary" : "text-foreground")}>
            {area.tenantCount}
          </p>
          <p className="text-[10px] text-muted-foreground">ราย</p>
        </div>

        {/* Arrow */}
        <ArrowRight
          size={16}
          className={cn(
            "shrink-0 transition-all duration-200",
            isSelected
              ? "text-brand-primary translate-x-0.5"
              : "text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-0.5"
          )}
        />
      </button>
    );
  }

  // ---- GRID VIEW ----
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isSelected
          ? "border-brand-primary shadow-md ring-1 ring-brand-primary/20 bg-brand-primary/2"
          : "border-border shadow-sm hover:border-brand-primary/40 hover:shadow-md hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="group flex h-full w-full flex-col text-left outline-none"
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-1.5 transition-all duration-300",
            isSelected ? "bg-brand-primary" : "bg-transparent group-hover:bg-brand-primary/40"
          )}
        />

        <div className="flex flex-1 flex-col justify-between p-6 w-full pl-7">
          <div className="flex w-full items-start justify-between">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
                isSelected
                  ? "bg-brand-primary text-white shadow-sm"
                  : "bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white group-hover:shadow-sm"
              )}
            >
              <Icon size={24} strokeWidth={2.5} />
            </div>
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
                isSelected
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "text-muted-foreground group-hover:text-brand-primary group-hover:bg-brand-primary/5"
              )}
            >
              <ArrowRight
                size={20}
                className={cn(
                  "transition-transform duration-300",
                  isSelected ? "translate-x-1" : "group-hover:translate-x-1"
                )}
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-bold tracking-tight text-foreground">{area.name}</h3>

            {/* Business Type Tags */}
            <div className="flex flex-wrap gap-1.5">
              {area.businessTypes.slice(0, 2).map((type) => (
                <span
                  key={type}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                >
                  {type}
                </span>
              ))}
              {area.businessTypes.length > 2 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                  +{area.businessTypes.length - 2}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 border-t border-border/60 pt-4">
              <span className="text-3xl font-black text-foreground">{area.tenantCount}</span>
              <span className="text-sm font-medium text-muted-foreground leading-tight">
                ผู้ประกอบการ
                <br />
                ทั้งหมด
              </span>
            </div>
          </div>
        </div>
      </button>
    </Card>
  );
}


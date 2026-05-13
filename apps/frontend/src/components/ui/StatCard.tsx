import React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  /** Icon element from lucide-react or any ReactNode */
  icon: React.ReactNode;
  /** Small uppercase label shown at the top-right */
  label: string;
  /** Large prominent value */
  value: string | number;
  /** Optional unit shown after the value (e.g. "บาท", "พื้นที่") */
  unit?: string;
  /** Supporting description text */
  description: string;
  /** Applies the primary brand colour (orange) accent */
  highlight?: boolean;
  /** Optional extra content rendered at the bottom (e.g. a link button) */
  action?: React.ReactNode;
}

/**
 * Shared stat summary card.
 *
 * @example
 * <StatCard
 *   icon={<CreditCard size={20} />}
 *   label="Total Revenue"
 *   value="3,210"
 *   description="รายได้รายเดือน"
 * />
 */
export function StatCard({
  icon,
  label,
  value,
  unit,
  description,
  highlight,
  action,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between rounded-[7px] border bg-white p-6 shadow-sm transition-shadow hover:shadow-md",
        highlight ? "border-[#E9652B]/30" : "border-slate-100"
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "rounded-[7px] p-2.5",
            highlight
              ? "bg-[#E9652B]/10 text-[#E9652B]"
              : "bg-slate-100 text-slate-500"
          )}
        >
          {icon}
        </div>
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            highlight ? "text-[#E9652B]" : "text-slate-400"
          )}
        >
          {label}
        </span>
      </div>

      <div className="mt-4 space-y-1">
        <div className="flex items-baseline gap-1.5">
          <p
            className={cn(
              "text-5xl font-black tracking-tight",
              highlight ? "text-[#E9652B]" : "text-slate-900"
            )}
          >
            {value}
          </p>
          {unit && (
            <span className={cn(
              "text-sm font-semibold",
              highlight ? "text-[#E9652B]/70" : "text-slate-400"
            )}>
              {unit}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">{description}</p>
      </div>

      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

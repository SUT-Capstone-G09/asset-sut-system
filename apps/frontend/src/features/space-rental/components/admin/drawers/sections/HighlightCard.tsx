import React from "react";
import { cn } from "@/lib/utils";

interface HighlightCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  subValue: string;
  theme: "emerald" | "amber" | "blue" | "orange";
  className?: string;
}

export function HighlightCard({ icon: Icon, label, value, subValue, theme, className }: HighlightCardProps) {
  const themes = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    orange: "bg-[#f26522]/5 text-[#f26522] border-[#f26522]/10",
  };

  return (
    <div className={cn("p-5 rounded-[7px] border transition-all hover:scale-[1.02] flex flex-col justify-between", themes[theme], className)}>
      <div>
        <div className="flex items-center gap-2 mb-3 opacity-70">
          <Icon size={16} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <div className="space-y-0.5">
          <p className="text-xl font-black text-slate-900 leading-tight">{value}</p>
        </div>
      </div>
      <p className="text-[10px] font-bold opacity-60 uppercase mt-2">{subValue}</p>
    </div>
  );
}

"use client"

import React, { useMemo } from "react";
import { Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FloorPlanData, FloorPlanStall } from "@/features/areas/types/floor-plan";

// ─── Design Tokens (ยึดตาม Design System) ────────────────────────
const CELL_COLORS = {
  empty: "bg-slate-50",
  wall: "bg-slate-700",
  walkway: "bg-amber-100/80",
  stall: "bg-slate-200",
};

const STALL_STATUS_BG: Record<string, string> = {
  occupied: "bg-emerald-400/90",
  vacant: "bg-amber-400/90",
  inactive: "bg-slate-400/90",
};

interface FloorPlanViewerProps {
  data: FloorPlanData;
  onStallClick?: (stall: FloorPlanStall) => void;
  compact?: boolean;
}

export default function FloorPlanViewer({
  data,
  onStallClick,
  compact = false,
}: FloorPlanViewerProps) {
  const { rows, cols, grid, stalls } = data;

  const stallMap = useMemo(() => {
    const map = new Map<string, FloorPlanStall>();
    for (const stall of stalls) {
      for (const [r, c] of stall.cells) {
        map.set(`${r}-${c}`, stall);
      }
    }
    return map;
  }, [stalls]);

  const cellSize = compact ? "h-5" : "h-8";
  const fontSize = compact ? "text-[6px]" : "text-[9px]";
  const gap = compact ? "gap-[1px]" : "gap-[2px]";
  const minCellWidth = compact ? "24px" : "32px";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <Grid3X3 size={14} className="text-slate-300" />
          <span>{data.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {[
            { color: "bg-emerald-400", label: "มีผู้เช่า" },
            { color: "bg-amber-400", label: "ว่าง" },
            { color: "bg-slate-400", label: "ปิดปรับปรุง" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={cn("size-2 rounded-sm", item.color)} />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div
        className={cn("inline-grid select-none", gap)}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(${minCellWidth}, 1fr))` }}
      >
        {grid.map((row, r) =>
          row.map((cellType, c) => {
            const stall = stallMap.get(`${r}-${c}`);
            const isFirstCell =
              stall && stall.cells[0][0] === r && stall.cells[0][1] === c;

            const bgColor = stall
              ? STALL_STATUS_BG[stall.status]
              : CELL_COLORS[cellType];

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => stall && onStallClick?.(stall)}
                className={cn(
                  "relative rounded-[2px] transition-all duration-150",
                  cellSize,
                  bgColor,
                  stall && onStallClick && "cursor-pointer hover:brightness-90 hover:scale-105"
                )}
                title={stall ? `${stall.label} — ${stall.name || "ยังไม่ตั้งชื่อ"}` : undefined}
              >
                {isFirstCell && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span
                      className={cn(
                        "font-black text-white drop-shadow-sm leading-none truncate px-0.5",
                        fontSize
                      )}
                    >
                      {stall.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Stats */}
      {!compact && stalls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: "ทั้งหมด",
              value: stalls.length,
              color: "text-slate-700",
              bg: "bg-slate-50",
            },
            {
              label: "มีผู้เช่า",
              value: stalls.filter((s) => s.status === "occupied").length,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "ว่าง",
              value: stalls.filter((s) => s.status === "vacant").length,
              color: "text-amber-500",
              bg: "bg-amber-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={cn("rounded-[7px] py-3 text-center", stat.bg)}
            >
              <p className={cn("mb-1 text-sm font-bold leading-none", stat.color)}>
                {stat.value}
              </p>
              <p className="text-[9px] font-medium tracking-wide text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

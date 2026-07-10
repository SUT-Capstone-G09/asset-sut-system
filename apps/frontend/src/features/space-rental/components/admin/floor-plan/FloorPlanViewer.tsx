"use client"

import React, { useState } from "react";
import { Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FloorPlanData, FloorPlanStall } from "@/features/space-rental/types/floor-plan";
import Canvas from "./Canvas";

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
  const [scale, setScale] = useState(compact ? 0.5 : 0.8);
  const [pan, setPan] = useState({ x: 20, y: -80 });

  const shops = data.elements.filter(el => el.type === 'area' && el.areaType === 'shop');
  
  const handleSelectElement = (id: string | null) => {
    if (!id || !onStallClick) return;
    const element = data.elements.find(el => el.id === id);
    if (element && element.type === 'area' && element.areaType === 'shop') {
      onStallClick(element);
    }
  };

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
            { color: "bg-emerald-400", label: "ว่าง" },
            { color: "bg-amber-400", label: "จองแล้ว" },
            { color: "bg-rose-500", label: "มีผู้เช่า" },
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

      {/* Canvas Workspace */}
      <div className={cn("relative border border-slate-100 rounded-[7px] overflow-hidden bg-slate-50", compact ? "h-[300px]" : "h-[500px]")}>
        <Canvas
          elements={data.elements}
          layers={data.layers}
          selectedId={null}
          canvasMode="select"
          scale={scale}
          pan={pan}
          selectElement={handleSelectElement}
          updateElement={() => {}}
          deleteElement={() => {}}
          addElement={() => {}}
          reorderElement={() => {}}
          setCanvasMode={() => {}}
          setScale={setScale}
          setPan={setPan}
          previewMode={true}
        />
      </div>

      {/* Statistics */}
      {!compact && shops.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              label: "ทั้งหมด",
              value: shops.length,
              color: "text-slate-700",
              bg: "bg-slate-50",
            },
            {
              label: "ว่าง",
              value: shops.filter((s) => s.status === "open").length,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "จองแล้ว",
              value: shops.filter((s) => s.status === "reserved").length,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "มีผู้เช่า",
              value: shops.filter((s) => s.status === "occupied").length,
              color: "text-rose-600",
              bg: "bg-rose-50",
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

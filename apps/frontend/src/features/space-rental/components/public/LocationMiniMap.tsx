"use client";

import React from "react";
import dynamic from "next/dynamic";

const MiniMap = dynamic(() => import("@/components/map/MiniMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-brand-primary rounded-full animate-spin" />
        <span>กำลังโหลดแผนที่ตำแหน่ง...</span>
      </div>
    </div>
  ),
});

interface LocationMiniMapProps {
  coordinates: [number, number];
}

export default function LocationMiniMap({ coordinates }: LocationMiniMapProps) {
  return <MiniMap coordinates={coordinates} />;
}

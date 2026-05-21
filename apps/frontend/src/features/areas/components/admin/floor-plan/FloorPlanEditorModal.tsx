"use client"

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LayoutGrid, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FloorPlanData } from "@/features/areas/types/floor-plan";
import { mockFloorPlans } from "@/features/areas/data/floor-plans";
import FloorPlanEditor from "./FloorPlanEditor";

interface FloorPlanEditorModalProps {
  locationId: string;
  locationName: string;
  open: boolean;
  onClose: () => void;
}

export default function FloorPlanEditorModal({
  locationId,
  locationName,
  open,
  onClose,
}: FloorPlanEditorModalProps) {
  const [floorPlan, setFloorPlan] = useState<FloorPlanData | null>(null);

  useEffect(() => {
    if (!open) return;

    // ดึงจาก localStorage ก่อน
    const stored = localStorage.getItem("floor-plans");
    if (stored) {
      const all: FloorPlanData[] = JSON.parse(stored);
      const found = all.find((fp) => fp.locationId === locationId);
      if (found) {
        setFloorPlan(found);
        return;
      }
    }

    // Fallback ไปใช้ mock data
    const mock = mockFloorPlans.find((fp) => fp.locationId === locationId);
    if (mock) {
      setFloorPlan({
        ...mock,
        grid: mock.grid.map((row) => [...row]),
        stalls: mock.stalls.map((s) => ({ ...s, cells: [...s.cells] })),
      });
    }
  }, [locationId, open]);

  const handleSave = (updated: FloorPlanData) => {
    setFloorPlan(updated);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "max-w-[90vw] w-full xl:max-w-[1100px] max-h-[90vh]",
          "rounded-[7px] p-0 border-none shadow-2xl",
          "flex flex-col overflow-hidden"
        )}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center">
              <LayoutGrid size={20} className="text-[#f26522]" strokeWidth={2.5} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                แก้ไขแปลนผัง (เป็นแผงผังตัวอย่าง)
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {locationName}
              </DialogDescription>
            </div>
          </div>

          <button
            onClick={onClose}
            className="size-9 rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center group"
          >
            <X size={18} className="transition-transform group-hover:rotate-90" />
          </button>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {floorPlan ? (
            <FloorPlanEditor initialData={floorPlan} onSave={handleSave} />
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-2">
                <LayoutGrid size={48} className="text-slate-200 mx-auto" />
                <p className="text-sm font-bold text-slate-400">
                  ไม่พบข้อมูลแปลนผังสำหรับสถานที่นี้
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

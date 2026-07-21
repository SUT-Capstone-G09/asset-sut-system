"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LayoutGrid, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { HallFloorPlan, createEmptyFloorPlan } from "../../../types/floorplan";
import {
  getHallFloorPlan,
  saveHallFloorPlan,
} from "../../../services/hallFloorPlanService";
import HallFloorPlanEditor from "./HallFloorPlanEditor";

interface Props {
  hallId: string;
  hallName: string;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function HallFloorPlanModal({
  hallId,
  hallName,
  open,
  onClose,
  onSaved,
}: Props) {
  const [floorPlan, setFloorPlan] = useState<HallFloorPlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setFloorPlan(null);
    getHallFloorPlan(hallId)
      .then((fp) => {
        if (!cancelled) setFloorPlan(fp ?? createEmptyFloorPlan(hallId));
      })
      .catch(() => {
        if (!cancelled) setFloorPlan(createEmptyFloorPlan(hallId));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hallId, open]);

  const handleSave = async (
    updated: HallFloorPlan,
    topViewImageKey?: string,
  ) => {
    const saved = await saveHallFloorPlan(hallId, updated, topViewImageKey); // throw = editor จับ
    setFloorPlan(saved);
    onSaved?.();
    // ดีเลย์ให้ spinner "กำลังบันทึก..." หมุนต่ออีกครู่ก่อนปิด — ต้อง await เพื่อให้ editor คง isSaving=true ระหว่างนี้
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "max-w-[95vw] w-full xl:max-w-[1200px] max-h-[92vh]",
          "rounded-[7px] p-0 border-none shadow-2xl flex flex-col overflow-hidden",
        )}
      >
        <DialogHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center">
              <LayoutGrid
                size={20}
                className="text-[#f26522]"
                strokeWidth={2.5}
              />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                จัดการผังพื้นที่
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {hallName}
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center group"
          >
            <X
              size={18}
              className="transition-transform group-hover:rotate-90"
            />
          </button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/40">
          {loading || !floorPlan ? (
            <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm font-bold">กำลังโหลดผัง...</span>
            </div>
          ) : (
            <HallFloorPlanEditor initial={floorPlan} onSave={handleSave} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

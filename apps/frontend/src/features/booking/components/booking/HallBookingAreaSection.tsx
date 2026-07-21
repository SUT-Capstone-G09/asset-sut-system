"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Grid3X3, LayoutGrid } from "lucide-react";
import { HallFloorPlan } from "@/features/halls/types/floorplan";
import { getPublicHallFloorPlan } from "@/features/bookings/services/hall.service";
import { HallPurposeDetail } from "../../types/booking";
import { cn } from "@/lib/utils";

const keyOf = (r: number, c: number) => `${r},${c}`;

interface Props {
  locationId?: number;
  purposes?: HallPurposeDetail[];
}

// แสดง "พื้นที่ที่ผู้ใช้เลือก" สำหรับการขอใช้พื้นที่โถงแบบตั้งบูธจำหน่ายสินค้า (per_sqm) — read-only ในหน้า admin
// โหลดผังพื้นที่ (public) ครั้งเดียว แล้วไฮไลต์เซลล์บูธที่ผู้ขอเลือกของแต่ละวัตถุประสงค์
export default function HallBookingAreaSection({ locationId, purposes }: Props) {
  const boothPurposes = useMemo(
    () =>
      (purposes || []).filter(
        (p) => p.pricingModel === "per_sqm" && (p.selectedCells?.length ?? 0) > 0,
      ),
    [purposes],
  );

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<HallFloorPlan | null>(null);

  useEffect(() => {
    if (!locationId || boothPurposes.length === 0) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const fp = await getPublicHallFloorPlan(locationId);
        if (!cancelled) setPlan(fp);
      } catch {
        if (!cancelled) setPlan(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locationId, boothPurposes.length]);

  // ไม่ใช่การจองแบบตั้งบูธ → ไม่ต้องแสดง section นี้
  if (boothPurposes.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
        <LayoutGrid size={14} className="text-[#f26522]" />
        พื้นที่ที่เลือก (จำหน่ายสินค้า)
      </h3>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-400 text-sm">
          <Loader2 size={16} className="animate-spin" /> กำลังโหลดผังพื้นที่...
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {boothPurposes.map((p) => (
            <BoothPurposeCard key={p.id} purpose={p} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}

function BoothPurposeCard({
  purpose,
  plan,
}: {
  purpose: HallPurposeDetail;
  plan: HallFloorPlan | null;
}) {
  const cells = purpose.selectedCells ?? [];
  const selected = useMemo(
    () => new Set(cells.map(([r, c]) => keyOf(r, c))),
    [cells],
  );

  const hasPlan =
    !!plan && !!plan.topViewImageUrl && plan.gridCols > 0 && plan.gridRows > 0;

  // ขอบเขตกริด: ใช้จากผังถ้ามี ไม่งั้นคำนวณจากกรอบของเซลล์ที่เลือก (fallback แสดงรูปทรงคร่าว ๆ)
  const bounds = useMemo(() => {
    let maxR = 0;
    let maxC = 0;
    for (const [r, c] of cells) {
      if (r > maxR) maxR = r;
      if (c > maxC) maxC = c;
    }
    return { rows: maxR + 1, cols: maxC + 1 };
  }, [cells]);

  const gridCols = hasPlan ? plan!.gridCols : bounds.cols;
  const gridRows = hasPlan ? plan!.gridRows : bounds.rows;

  const blocked = useMemo(
    () => new Set((plan?.blockedCells ?? []).map(([r, c]) => keyOf(r, c))),
    [plan],
  );

  const overlay = plan?.overlay ?? { x: 0, y: 0, w: 1, h: 1 };
  const ow = overlay.w || 1;
  const oh = overlay.h || 1;
  const naturalW = plan?.imageNaturalW ?? 0;
  const naturalH = plan?.imageNaturalH ?? 0;
  const regionAspect =
    hasPlan && naturalW > 0 && naturalH > 0
      ? (naturalW * ow) / (naturalH * oh)
      : gridCols / Math.max(gridRows, 1);

  const areaSqm =
    purpose.areaSqm ??
    (plan?.cellSizeM ? cells.length * plan.cellSizeM * plan.cellSizeM : undefined);

  return (
    <div className="rounded-[7px] border border-slate-100 bg-slate-50/50 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[13px] font-bold text-slate-700">
          {purpose.purposeName}
        </span>
        <span className="flex items-center gap-1 text-xs font-bold text-[#f26522] bg-[#f26522]/10 px-2.5 py-1 rounded-full">
          <Grid3X3 size={12} /> {cells.length} ช่อง
          {areaSqm !== undefined &&
            ` · ~${areaSqm.toLocaleString(undefined, { maximumFractionDigits: 2 })} ตร.ม.`}
        </span>
      </div>

      <div className="flex justify-center bg-white rounded-lg p-2 border border-slate-100">
        <div
          className="relative w-full max-w-md overflow-hidden rounded-md select-none"
          style={{ aspectRatio: regionAspect }}
        >
          {hasPlan && (
            /* crop รูปให้เหลือแค่กรอบกริด (overlay region) แล้วขยายเต็มกรอบ */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={plan!.topViewImageUrl}
              alt={`ผัง ${purpose.purposeName}`}
              className="absolute max-w-none pointer-events-none"
              style={{
                width: `${100 / ow}%`,
                height: `${100 / oh}%`,
                left: `${-(overlay.x / ow) * 100}%`,
                top: `${-(overlay.y / oh) * 100}%`,
              }}
            />
          )}
          {!hasPlan && <div className="absolute inset-0 bg-slate-100" />}

          <div className="absolute inset-0">
            {Array.from({ length: gridRows }).map((_, r) =>
              Array.from({ length: gridCols }).map((_, c) => {
                const k = keyOf(r, c);
                const isSel = selected.has(k);
                const isBlocked = blocked.has(k);
                return (
                  <div
                    key={k}
                    className={cn(
                      "absolute border",
                      isSel
                        ? "bg-brand-primary/70 border-brand-primary"
                        : isBlocked
                          ? "bg-red-500/50 border-red-600/60"
                          : "border-slate-300/50",
                    )}
                    style={{
                      left: `${(c / gridCols) * 100}%`,
                      top: `${(r / gridRows) * 100}%`,
                      width: `${(1 / gridCols) * 100}%`,
                      height: `${(1 / gridRows) * 100}%`,
                    }}
                  />
                );
              }),
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-brand-primary/70" /> พื้นที่ที่เลือก
        </span>
        {hasPlan && blocked.size > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-red-500/50" /> ห้ามจอง
          </span>
        )}
        {!hasPlan && (
          <span className="text-slate-400 italic">
            * โถงนี้ยังไม่มีผังพื้นที่ — แสดงเป็นตำแหน่งคร่าว ๆ จากช่องที่เลือก
          </span>
        )}
      </div>
    </div>
  );
}

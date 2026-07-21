"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { HallFloorPlan } from "@/features/halls/types/floorplan";
import {
  getPublicHallFloorPlan,
  getBookedCells,
} from "@/features/bookings/services/hall.service";

const keyOf = (r: number, c: number) => `${r},${c}`;

interface Props {
  hallId: string;
  hallName: string;
  dates: string[]; // YYYY-MM-DD ที่ผู้ใช้เลือก — ใช้ query เซลล์ที่ถูกจองในวันเหล่านั้น
  initialSelected: number[][]; // เซลล์ที่เลือกไว้ก่อนหน้า
  onClose: () => void;
  onConfirm: (cells: number[][], cellSizeM: number) => void;
}

// โมดัลเลือกเซลล์บูธบนผังโถง — ถูก mount สดทุกครั้งที่เปิด (parent render แบบ conditional)
// เพื่อให้ effect โหลดข้อมูลรอบเดียวตอน mount และเลี่ยง sync setState ใน effect (react-hooks rule)
export default function HallFloorPlanSelector({
  hallId,
  hallName,
  dates,
  initialSelected,
  onClose,
  onConfirm,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<HallFloorPlan | null>(null);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [booked, setBooked] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelected.map(([r, c]) => keyOf(r, c))),
  );

  // drag paint state (ใช้ state แทน ref เพื่อเลี่ยงกฎ react-hooks/refs)
  const [painting, setPainting] = useState(false);
  const [paintVal, setPaintVal] = useState(true);

  const datesKey = dates.join(",");
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [fp, bookedCells] = await Promise.all([
          getPublicHallFloorPlan(hallId),
          getBookedCells(hallId, dates),
        ]);
        if (cancelled) return;
        setPlan(fp);
        setBlocked(
          new Set((fp?.blockedCells ?? []).map(([r, c]) => keyOf(r, c))),
        );
        setBooked(new Set(bookedCells.map(([r, c]) => keyOf(r, c))));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hallId, datesKey]);

  const cellSizeM = plan?.cellSizeM ?? 0;
  const gridCols = plan?.gridCols ?? 0;
  const gridRows = plan?.gridRows ?? 0;
  const overlay = plan?.overlay ?? { x: 0, y: 0, w: 1, h: 1 };

  // แสดงเฉพาะกรอบพื้นที่กริด: crop รูปให้เหลือแค่ overlay region แล้วขยายเต็มกรอบ
  // aspect ของกรอบ = สัดส่วนจริงของ region (naturalW·w : naturalH·h) เพื่อไม่ให้รูปบิด
  const ow = overlay.w || 1;
  const oh = overlay.h || 1;
  const naturalW = plan?.imageNaturalW ?? 0;
  const naturalH = plan?.imageNaturalH ?? 0;
  const regionAspect =
    naturalW > 0 && naturalH > 0 ? (naturalW * ow) / (naturalH * oh) : ow / oh;

  const isBusy = (r: number, c: number) =>
    blocked.has(keyOf(r, c)) || booked.has(keyOf(r, c));

  const applyCell = (r: number, c: number, val: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (val) next.add(keyOf(r, c));
      else next.delete(keyOf(r, c));
      return next;
    });

  const onCellDown = (r: number, c: number) => {
    if (isBusy(r, c)) return;
    const val = !selected.has(keyOf(r, c));
    setPaintVal(val);
    setPainting(true);
    applyCell(r, c, val);
  };
  const onCellEnter = (r: number, c: number) => {
    if (!painting || isBusy(r, c)) return;
    applyCell(r, c, paintVal);
  };

  const areaSqm = useMemo(
    () => selected.size * cellSizeM * cellSizeM,
    [selected, cellSizeM],
  );

  const hasPlan =
    !!plan && !!plan.topViewImageUrl && gridCols > 0 && gridRows > 0;

  const confirm = () => {
    const cells = Array.from(selected).map(
      (k) => k.split(",").map(Number) as number[],
    );
    onConfirm(cells, cellSizeM);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      {/* z-[1201] override: ดัน content เหนือ topbar (fixed z-[1001]) ไม่งั้น title/ปุ่มปิดถูกทับ */}
      <DialogContent className="z-[1001] sm:max-w-4xl max-h-[88vh] overflow-y-auto mt-10 p-5 gap-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            เลือกพื้นที่บูธ — {hallName}
          </DialogTitle>
          <p className="text-sm text-gray-500">
            คลิกหรือลากบนช่องที่ว่างเพื่อเลือกพื้นที่บูธ · ช่องสีเทา =
            มีผู้จองแล้วในวันที่เลือก · ช่องสีแดง = ห้ามจอง (เลือกไม่ได้)
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
            <Loader2 size={18} className="animate-spin" />{" "}
            กำลังโหลดผังพื้นที่...
          </div>
        ) : !hasPlan ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
            <Ban size={28} className="text-gray-300" />
            <p className="text-sm text-gray-500">
              โถงนี้ยังไม่มีผังพื้นที่ ไม่สามารถเลือกบูธได้
            </p>
            <p className="text-xs text-gray-400">
              กรุณาติดต่อผู้ดูแล หรือเลือกวัตถุประสงค์อื่น
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-center bg-slate-50 rounded-xl p-3">
              <div
                className="relative w-full max-w-2xl overflow-hidden rounded-lg select-none"
                style={{ aspectRatio: regionAspect }}
                onPointerUp={() => setPainting(false)}
                onPointerLeave={() => setPainting(false)}
              >
                {/* crop รูปให้เหลือแค่ overlay region (กรอบกริด) แล้วขยายเต็มกรอบ */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={plan!.topViewImageUrl}
                  alt={`ผัง ${hallName}`}
                  className="absolute max-w-none pointer-events-none"
                  style={{
                    width: `${100 / ow}%`,
                    height: `${100 / oh}%`,
                    left: `${-(overlay.x / ow) * 100}%`,
                    top: `${-(overlay.y / oh) * 100}%`,
                  }}
                />

                <div className="absolute inset-0">
                  {Array.from({ length: gridRows }).map((_, r) =>
                    Array.from({ length: gridCols }).map((_, c) => {
                      const k = keyOf(r, c);
                      const isBlocked = blocked.has(k);
                      const isBooked = booked.has(k);
                      const isSel = selected.has(k);
                      return (
                        <div
                          key={k}
                          onPointerDown={() => onCellDown(r, c)}
                          onPointerEnter={() => onCellEnter(r, c)}
                          title={
                            isBlocked
                              ? "ช่องนี้ห้ามจอง"
                              : isBooked
                                ? "ช่องนี้มีผู้จองแล้วในวันที่เลือก"
                                : undefined
                          }
                          className={cn(
                            "absolute border transition-colors duration-100",
                            // ห้ามจอง (ผังกำหนด) = แดง ; มีผู้จองแล้วในวันนั้น = เทา ; ทั้งคู่เลือกไม่ได้
                            isBlocked
                              ? "bg-red-500/60 border-red-600/70 cursor-not-allowed"
                              : isBooked
                                ? "bg-slate-500/60 border-slate-600/70 cursor-not-allowed"
                                : isSel
                                  ? "bg-brand-primary/70 border-brand-primary cursor-pointer"
                                  : "bg-white/5 border-gray-300/70 hover:bg-brand-primary/30 cursor-pointer",
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

            {/* Legend + summary */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-brand-primary/70" />{" "}
                เลือกแล้ว
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-slate-500/60" />{" "}
                มีผู้จองแล้ว
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-red-500/60" /> ห้ามจอง
              </span>
              <span className="ml-auto font-medium text-gray-700">
                เลือก {selected.size} ช่อง
                {cellSizeM > 0 &&
                  ` · ~${areaSqm.toLocaleString(undefined, { maximumFractionDigits: 2 })} ตร.ม.`}
              </span>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-xl border-gray-200 text-gray-600"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={confirm}
            disabled={!hasPlan || selected.size === 0}
            className="h-10 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold disabled:opacity-50"
          >
            ยืนยันพื้นที่ ({selected.size})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

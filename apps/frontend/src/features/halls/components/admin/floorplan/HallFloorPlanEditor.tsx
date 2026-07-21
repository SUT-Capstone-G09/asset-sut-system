"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  Move,
  Ban,
  RotateCcw,
  Save,
  Loader2,
  ImageIcon,
  Grid3X3,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { HallFloorPlan, Overlay } from "../../../types/floorplan";
import { uploadHallFloorPlanImage } from "@/features/halls/services/hallFloorPlanService";
import { useAppDialog } from "../../../hooks/useAppDialog";
import { toast } from "sonner";

type Mode = "upload" | "frame" | "block";
// จุดที่กำลังลาก: ย้ายทั้งกรอบ (move) หรือปรับขนาดจาก 8 จุด (มุม 4 + กึ่งกลางขอบ 4)
type DragKind = "move" | "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const keyOf = (r: number, c: number) => `${r},${c}`;
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

// ขนาดกรอบขั้นต่ำ (สัดส่วนของรูป) กันไม่ให้ลากจนกรอบหาย
const MIN_FRAME = 0.03;

// 8 จุดปรับขนาด: ตำแหน่ง (% ของกรอบ) + cursor ที่เหมาะกับทิศทาง
const HANDLES: { kind: DragKind; left: string; top: string; cursor: string }[] =
  [
    { kind: "nw", left: "0%", top: "0%", cursor: "nwse-resize" },
    { kind: "n", left: "50%", top: "0%", cursor: "ns-resize" },
    { kind: "ne", left: "100%", top: "0%", cursor: "nesw-resize" },
    { kind: "e", left: "100%", top: "50%", cursor: "ew-resize" },
    { kind: "se", left: "100%", top: "100%", cursor: "nwse-resize" },
    { kind: "s", left: "50%", top: "100%", cursor: "ns-resize" },
    { kind: "sw", left: "0%", top: "100%", cursor: "nesw-resize" },
    { kind: "w", left: "0%", top: "50%", cursor: "ew-resize" },
  ];

// คำนวณกรอบใหม่จากการลาก: ย้าย (move) หรือขยับขอบตามจุดที่จับ (dx,dy = สัดส่วนของรูป)
function resizeFrame(
  kind: DragKind,
  box: Overlay,
  dx: number,
  dy: number,
): Overlay {
  if (kind === "move") {
    return {
      ...box,
      x: clamp(box.x + dx, 0, Math.max(0, 1 - box.w)),
      y: clamp(box.y + dy, 0, Math.max(0, 1 - box.h)),
    };
  }
  let left = box.x;
  let right = box.x + box.w;
  let top = box.y;
  let bottom = box.y + box.h;
  if (kind.includes("w")) left = clamp(left + dx, 0, right - MIN_FRAME);
  if (kind.includes("e")) right = clamp(right + dx, left + MIN_FRAME, 1);
  if (kind.includes("n")) top = clamp(top + dy, 0, bottom - MIN_FRAME);
  if (kind.includes("s")) bottom = clamp(bottom + dy, top + MIN_FRAME, 1);
  return { x: left, y: top, w: right - left, h: bottom - top };
}

interface Props {
  initial: HallFloorPlan;
  // topViewImageKey = object_key ของรูปที่เพิ่งอัปโหลดในเซสชันนี้ (ถ้าไม่ได้เปลี่ยนรูป = undefined)
  onSave: (fp: HallFloorPlan, topViewImageKey?: string) => void | Promise<void>;
}

export default function HallFloorPlanEditor({ initial, onSave }: Props) {
  const { confirm, notify, dialog } = useAppDialog();
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState(initial.topViewImageUrl); // presigned URL สำหรับแสดงผล
  const [imageKey, setImageKey] = useState<string | undefined>(undefined); // object_key ของรูปที่เพิ่งอัปโหลด
  const [uploading, setUploading] = useState(false);
  const [naturalW, setNaturalW] = useState(initial.imageNaturalW);
  const [naturalH, setNaturalH] = useState(initial.imageNaturalH);

  const [gridCols, setGridCols] = useState(initial.gridCols);
  const [gridRows, setGridRows] = useState(initial.gridRows);
  const [cellSizeM, setCellSizeM] = useState(initial.cellSizeM);

  const [overlay, setOverlay] = useState<Overlay>(initial.overlay);

  const [blocked, setBlocked] = useState<Set<string>>(
    () => new Set(initial.blockedCells.map(([r, c]) => keyOf(r, c))),
  );

  const [mode, setMode] = useState<Mode>(
    initial.topViewImageUrl ? "frame" : "upload",
  );
  const [isSaving, setIsSaving] = useState(false);

  // ── ขนาดพื้นที่จริง (เมตร) — ใช้คำนวณกริด และมาตราส่วน (px/เมตร) ร่วมกับกรอบ ──
  const [metersX, setMetersX] = useState(
    initial.realWidthM ? String(initial.realWidthM) : "",
  );
  const [metersY, setMetersY] = useState(
    initial.realLengthM ? String(initial.realLengthM) : "",
  );

  // ── Frame drag/resize ──
  const dragRef = useRef<{
    kind: DragKind;
    startX: number;
    startY: number;
    box: Overlay;
  } | null>(null);

  // ── Block paint ──
  const paintValRef = useRef<boolean>(true);
  const [painting, setPainting] = useState(false);

  // มาตราส่วนคำนวณจากกรอบ: กว้างกรอบ(px) ÷ กว้างจริง(ม.) — ไม่ต้องคลิกจุดวัดอีกต่อไป
  const pxPerMX = useMemo(() => {
    const w = parseFloat(metersX);
    return w > 0 && naturalW && overlay.w > 0
      ? (overlay.w * naturalW) / w
      : undefined;
  }, [metersX, naturalW, overlay.w]);
  const pxPerMY = useMemo(() => {
    const l = parseFloat(metersY);
    return l > 0 && naturalH && overlay.h > 0
      ? (overlay.h * naturalH) / l
      : undefined;
  }, [metersY, naturalH, overlay.h]);

  const calibrated = pxPerMX !== undefined && pxPerMY !== undefined;

  // กรอกความกว้างจริง → จำนวนคอลัมน์ = กว้าง ÷ ขนาดช่อง (เปลี่ยนขนาดช่องแล้วแปลงค่าอัตโนมัติ)
  useEffect(() => {
    const w = parseFloat(metersX);
    if (w > 0 && cellSizeM > 0)
      setGridCols(clamp(Math.round(w / cellSizeM), 1, 100));
  }, [metersX, cellSizeM]);

  // กรอกความยาวจริง → จำนวนแถว = ยาว ÷ ขนาดช่อง
  useEffect(() => {
    const l = parseFloat(metersY);
    if (l > 0 && cellSizeM > 0)
      setGridRows(clamp(Math.round(l / cellSizeM), 1, 100));
  }, [metersY, cellSizeM]);

  // ── Upload (อ่านขนาดจริง + อัปโหลดไป MinIO เก็บ object_key) ──
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      setNaturalW(img.naturalWidth);
      setNaturalH(img.naturalHeight);
      setUploading(true);
      try {
        const res = await uploadHallFloorPlanImage(initial.hallId, file);
        setImageUrl(res.url); // presigned URL สำหรับ preview
        setImageKey(res.object_key); // เก็บ key ไว้ส่งตอนบันทึก
        setMode("frame");
      } catch {
        notify({
          message: "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
          variant: "danger",
        });
      } finally {
        URL.revokeObjectURL(localUrl);
        if (fileInputRef.current) fileInputRef.current.value = ""; // ให้เลือกไฟล์เดิมซ้ำได้
        setUploading(false);
      }
    };
    img.src = localUrl;
  };

  // ── Frame drag/resize ──
  const startDrag = (kind: DragKind, e: React.PointerEvent) => {
    if (mode !== "frame") return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      kind,
      startX: e.clientX,
      startY: e.clientY,
      box: { ...overlay },
    };
  };
  const onCanvasPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - d.startX) / rect.width;
    const dy = (e.clientY - d.startY) / rect.height;
    // คำนวณจากกรอบ "ตอนเริ่มลาก" (d.box) แบบ absolute เพื่อกัน drift และกัน crash ตอน StrictMode
    setOverlay(resizeFrame(d.kind, d.box, dx, dy));
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  // ── Block paint ──
  const applyCell = (r: number, c: number, val: boolean) => {
    setBlocked((prev) => {
      const next = new Set(prev);
      if (val) next.add(keyOf(r, c));
      else next.delete(keyOf(r, c));
      return next;
    });
  };
  const onCellDown = (r: number, c: number) => {
    const val = !blocked.has(keyOf(r, c));
    paintValRef.current = val;
    setPainting(true);
    applyCell(r, c, val);
  };
  const onCellEnter = (r: number, c: number) => {
    if (painting) applyCell(r, c, paintValRef.current);
  };

  const blockedList = useMemo(
    () =>
      Array.from(blocked)
        .map((k) => k.split(",").map(Number) as [number, number])
        .filter(([r, c]) => r < gridRows && c < gridCols), // ตัดช่องที่หลุดขอบเมื่อกริดเล็กลง
    [blocked, gridRows, gridCols],
  );

  // ── Save / Reset ──
  const handleSave = async () => {
    if (!imageUrl) {
      notify({
        message: "กรุณาอัปโหลดรูปผัง top-view ก่อน",
        variant: "danger",
      });
      return;
    }
    setIsSaving(true);
    const fp: HallFloorPlan = {
      hallId: initial.hallId,
      topViewImageUrl: imageUrl,
      imageNaturalW: naturalW,
      imageNaturalH: naturalH,
      gridCols,
      gridRows,
      cellSizeM,
      realWidthM: parseFloat(metersX) || undefined,
      realLengthM: parseFloat(metersY) || undefined,
      overlay,
      pxPerMX,
      pxPerMY,
      blockedCells: blockedList,
      updatedAt: new Date().toISOString(),
    };
    try {
      await onSave(fp, imageKey);
      setImageKey(undefined); // บันทึกแล้ว รูปกลายเป็นของเดิม
      toast.success("บันทึกผังพื้นที่เรียบร้อยแล้ว");
    } catch (err) {
      console.error(err);
      notify({
        message: "บันทึกผังไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
        variant: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ล้างผังทั้งหมดกลับเป็นค่าว่าง (เริ่มใหม่) — ยังไม่กระทบ DB จนกว่าจะกดบันทึก
  const handleReset = async () => {
    const ok = await confirm({
      title: "ล้างผังทั้งหมด?",
      message:
        "ล้างรูป, สเกล, กริด และช่องห้ามจองทั้งหมดเพื่อเริ่มใหม่\nข้อมูลที่บันทึกไว้ใน DB จะยังไม่ถูกลบจนกว่าจะกดบันทึก",
      confirmText: "ล้างทั้งหมด",
      variant: "danger",
    });
    if (!ok) return;
    setImageUrl("");
    setImageKey(undefined);
    setNaturalW(0);
    setNaturalH(0);
    setGridCols(10);
    setGridRows(8);
    setCellSizeM(1);
    setOverlay({ x: 0, y: 0, w: 1, h: 1 });
    setBlocked(new Set());
    setMetersX("");
    setMetersY("");
    setMode("upload");
  };

  const tools: {
    mode: Mode;
    label: string;
    icon: React.ElementType;
    disabled?: boolean;
  }[] = [
    { mode: "upload", label: "อัปโหลดผัง", icon: ImageIcon },
    {
      mode: "frame",
      label: "ปรับกรอบพื้นที่",
      icon: Move,
      disabled: !imageUrl,
    },
    { mode: "block", label: "ช่องห้ามจอง", icon: Ban, disabled: !imageUrl },
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-[7px] shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          {tools.map((t) => (
            <button
              key={t.mode}
              disabled={t.disabled}
              onClick={() => setMode(t.mode)}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-[7px] text-xs font-bold transition-all",
                t.disabled && "opacity-40 cursor-not-allowed",
                mode === t.mode
                  ? "bg-[#f26522] text-white shadow-lg shadow-[#f26522]/20"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-slate-200/60",
              )}
            >
              <t.icon size={15} strokeWidth={2.5} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {imageUrl && (
            <Button
              variant="outline"
              onClick={() => !uploading && fileInputRef.current?.click()}
              disabled={uploading}
              className="h-9 px-3 rounded-[7px] gap-1.5 text-xs font-bold border-slate-200 text-slate-600 hover:text-[#f26522] hover:border-[#f26522]/40"
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              เปลี่ยนรูปผัง
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-9 px-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[7px] gap-1.5 text-xs font-bold"
          >
            <RotateCcw size={14} />
            ล้างทั้งหมด
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 px-5 rounded-[7px] font-bold text-xs text-white gap-2 bg-primary hover:bg-brand-primary-600 shadow-lg shadow-[#f26522]/20"
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {isSaving ? "กำลังบันทึก..." : "บันทึกผัง"}
          </Button>
        </div>
      </div>

      {/* ขนาดพื้นที่จริง & กริด */}
      <div className="bg-white p-4 rounded-[7px] shadow-sm border border-slate-100 flex flex-wrap items-end gap-4">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest w-full">
          <Grid3X3 size={14} className="text-slate-300" /> ขนาดพื้นที่ & กริด
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-blue-600">
            ความกว้างจริง (ม.)
          </Label>
          <Input
            type="number"
            value={metersX}
            onChange={(e) => setMetersX(e.target.value)}
            className="h-9 w-28 rounded-[7px] bg-slate-50"
            placeholder="เช่น 10"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-emerald-600">
            ความยาวจริง (ม.)
          </Label>
          <Input
            type="number"
            value={metersY}
            onChange={(e) => setMetersY(e.target.value)}
            className="h-9 w-28 rounded-[7px] bg-slate-50"
            placeholder="เช่น 8"
          />
        </div>
        <NumField
          label="ขนาดช่อง (ม.)"
          value={cellSizeM}
          min={0.1}
          step={0.1}
          onChange={setCellSizeM}
        />
        <NumField
          label="คอลัมน์ (auto)"
          value={gridCols}
          min={1}
          max={100}
          onChange={setGridCols}
        />
        <NumField
          label="แถว (auto)"
          value={gridRows}
          min={1}
          max={100}
          onChange={setGridRows}
        />
        <div className="text-[11px] font-bold text-slate-400">
          {calibrated ? (
            <span className="text-emerald-600">
              ✓ มาตราส่วนพร้อม — คำนวณจากขนาดกรอบ
            </span>
          ) : (
            <span className="text-amber-500">
              กรอกความกว้าง/ยาวจริง แล้วลากกรอบให้พอดีพื้นที่
            </span>
          )}
        </div>
      </div>

      {/* คำแนะนำโหมดปรับกรอบ */}
      {mode === "frame" && imageUrl && (
        <div className="bg-white p-4 rounded-[7px] shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="size-8 shrink-0 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center">
            <Move size={16} className="text-[#f26522]" strokeWidth={2.5} />
          </div>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            ลาก<span className="font-bold text-slate-800">กลางกรอบ</span>
            เพื่อย้ายตำแหน่ง และลาก
            <span className="font-bold text-slate-800">
              จุดปรับขนาด 8 จุด
            </span>{" "}
            เพื่อครอบพื้นที่จริงของโถงให้พอดี —
            มาตราส่วนจะคำนวณจากขนาดกรอบเทียบกับความกว้าง/ยาวจริงที่กรอกไว้อัตโนมัติ
          </p>
        </div>
      )}

      {/* Canvas */}
      <div className="bg-white rounded-[7px] shadow-sm border border-slate-100 p-5 overflow-auto">
        {!imageUrl ? (
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-[#f26522]/30 rounded-[7px] p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group shadow-inner"
          >
            <div className="size-16 rounded-[7px] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              {uploading ? (
                <Loader2 size={32} className="text-[#f26522] animate-spin" />
              ) : (
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 text-brand-primary mb-4">
                  <Upload className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-slate-900">
                {uploading
                  ? "กำลังอัปโหลด..."
                  : "คลิกเพื่ออัปโหลดรูปผัง top-view"}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                ภาพผังมองจากด้านบน สำหรับตั้งสเกลและวางกริด
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              ref={containerRef}
              className="relative inline-block select-none max-w-full"
              onPointerMove={onCanvasPointerMove}
              onPointerUp={() => {
                endDrag();
                setPainting(false);
              }}
              onPointerLeave={() => {
                endDrag();
                setPainting(false);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="floor plan"
                className="block max-w-full h-auto pointer-events-none"
              />

              {/* Overlay frame */}
              {imageUrl && overlay.w > 0 && overlay.h > 0 && (
                <div
                  onPointerDown={(e) => startDrag("move", e)}
                  className={cn(
                    "absolute border-2 border-[#f26522]",
                    mode === "frame" && "cursor-move bg-[#f26522]/5",
                    // block mode: เปิด pointer events เพื่อให้ cell ลูกรับคลิกได้; โหมดอื่นปิดเพื่อให้คลิกทะลุไป container
                    mode !== "frame" &&
                      mode !== "block" &&
                      "pointer-events-none",
                  )}
                  style={{
                    left: `${overlay.x * 100}%`,
                    top: `${overlay.y * 100}%`,
                    width: `${overlay.w * 100}%`,
                    height: `${overlay.h * 100}%`,
                  }}
                >
                  {/* Grid cells — visible in frame (visual) & block (interactive) */}
                  {(mode === "frame" || mode === "block") &&
                    Array.from({ length: gridRows }).map((_, r) =>
                      Array.from({ length: gridCols }).map((_, c) => {
                        const isBlocked = blocked.has(keyOf(r, c));
                        return (
                          <div
                            key={keyOf(r, c)}
                            onPointerDown={
                              mode === "block"
                                ? () => onCellDown(r, c)
                                : undefined
                            }
                            onPointerEnter={
                              mode === "block"
                                ? () => onCellEnter(r, c)
                                : undefined
                            }
                            className={cn(
                              "absolute border transition-colors duration-100",
                              mode === "block"
                                ? "pointer-events-auto cursor-pointer"
                                : "pointer-events-none",
                              isBlocked
                                ? "bg-red-500/70 border-red-600/80" // เลือกห้ามจองแล้ว = แดงเข้ม
                                : mode === "block"
                                  ? "bg-white/5 border-gray-300/70 hover:bg-red-500/30" // hover = preview แดงจาง
                                  : "bg-transparent border-gray-300/70",
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

                  {/* จุดปรับขนาด 8 จุด (มุม 4 + กึ่งกลางขอบ 4) — เฉพาะโหมดปรับกรอบ */}
                  {mode === "frame" &&
                    HANDLES.map((h) => (
                      <div
                        key={h.kind}
                        onPointerDown={(e) => startDrag(h.kind, e)}
                        className="absolute size-3 rounded-xs bg-white border-2 border-[#f26522] shadow-sm pointer-events-auto hover:scale-125 transition-transform"
                        style={{
                          left: h.left,
                          top: h.top,
                          transform: "translate(-50%, -50%)",
                          cursor: h.cursor,
                          touchAction: "none",
                        }}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        {imageUrl && (
          <div className="flex items-center gap-4 mt-4 flex-wrap text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>
              กริด {gridCols}×{gridRows}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-red-500/70" /> ช่องห้ามจอง
              ({blocked.size})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm border-2 border-[#f26522]" />{" "}
              กรอบพื้นที่
            </span>
            {mode === "frame" && (
              <span className="text-[#f26522]">
                ลากกลางกรอบเพื่อย้าย • ลากจุด 8 จุดเพื่อปรับขนาด
              </span>
            )}
            {mode === "block" && (
              <span className="text-[#f26522]">
                คลิก/ลากช่องเพื่อสลับห้ามจอง
              </span>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {dialog}
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-bold text-slate-500">{label}</Label>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(clamp(v, min ?? -Infinity, max ?? Infinity));
        }}
        className="h-9 w-24 rounded-[7px] bg-slate-50"
      />
    </div>
  );
}

"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  Ruler,
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
import { uploadFile, UPLOAD_FOLDERS } from "@/lib/services/upload";
import { useAppDialog } from "../../../hooks/useAppDialog";
import { toast } from "sonner";

type Mode = "upload" | "scale" | "frame" | "block";
type Axis = "x" | "y";
interface Pt { x: number; y: number } // normalized 0..1

interface Props {
  initial: HallFloorPlan;
  // topViewImageKey = object_key ของรูปที่เพิ่งอัปโหลดในเซสชันนี้ (ถ้าไม่ได้เปลี่ยนรูป = undefined)
  onSave: (fp: HallFloorPlan, topViewImageKey?: string) => void | Promise<void>;
}

const keyOf = (r: number, c: number) => `${r},${c}`;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

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
  const [pxPerMX, setPxPerMX] = useState<number | undefined>(initial.pxPerMX);
  const [pxPerMY, setPxPerMY] = useState<number | undefined>(initial.pxPerMY);

  const [blocked, setBlocked] = useState<Set<string>>(
    () => new Set(initial.blockedCells.map(([r, c]) => keyOf(r, c)))
  );

  const [mode, setMode] = useState<Mode>(initial.topViewImageUrl ? "scale" : "upload");
  const [isSaving, setIsSaving] = useState(false);

  // ── Scale state ──
  const [axis, setAxis] = useState<Axis>("x");
  const [metersX, setMetersX] = useState(initial.realWidthM ? String(initial.realWidthM) : "");
  const [metersY, setMetersY] = useState(initial.realLengthM ? String(initial.realLengthM) : "");
  const [tempPts, setTempPts] = useState<Pt[]>([]);
  const [lineX, setLineX] = useState<[Pt, Pt] | null>(null);
  const [lineY, setLineY] = useState<[Pt, Pt] | null>(null);

  // ── Frame drag ──
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  // ── Block paint ──
  const paintValRef = useRef<boolean>(true);
  const [painting, setPainting] = useState(false);

  const calibrated = pxPerMX !== undefined && pxPerMY !== undefined;

  // กรอกความกว้างจริง → จำนวนคอลัมน์ = กว้าง ÷ ขนาดช่อง (เปลี่ยนขนาดช่องแล้วแปลงค่าอัตโนมัติ)
  useEffect(() => {
    const w = parseFloat(metersX);
    if (w > 0 && cellSizeM > 0) setGridCols(clamp(Math.round(w / cellSizeM), 1, 100));
  }, [metersX, cellSizeM]);

  // กรอกความยาวจริง → จำนวนแถว = ยาว ÷ ขนาดช่อง
  useEffect(() => {
    const l = parseFloat(metersY);
    if (l > 0 && cellSizeM > 0) setGridRows(clamp(Math.round(l / cellSizeM), 1, 100));
  }, [metersY, cellSizeM]);

  // ล็อกขนาดกรอบอัตโนมัติจากสเกลจริง เมื่อ calibrate แล้ว
  useEffect(() => {
    if (pxPerMX === undefined || pxPerMY === undefined || !naturalW || !naturalH) return;
    const w = (gridCols * cellSizeM * pxPerMX) / naturalW;
    const h = (gridRows * cellSizeM * pxPerMY) / naturalH;
    setOverlay((prev) => ({
      x: clamp(prev.x, 0, Math.max(0, 1 - w)),
      y: clamp(prev.y, 0, Math.max(0, 1 - h)),
      w: Math.min(w, 1),
      h: Math.min(h, 1),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pxPerMX, pxPerMY, gridCols, gridRows, cellSizeM, naturalW, naturalH]);

  const relPoint = useCallback((clientX: number, clientY: number): Pt => {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: clamp((clientX - rect.left) / rect.width, 0, 1),
      y: clamp((clientY - rect.top) / rect.height, 0, 1),
    };
  }, []);

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
        const res = await uploadFile(file, UPLOAD_FOLDERS.LOCATION_PICS);
        setImageUrl(res.url); // presigned URL สำหรับ preview
        setImageKey(res.object_key); // เก็บ key ไว้ส่งตอนบันทึก
        // เปลี่ยนรูปใหม่ → สเกลเดิม (px/เมตร) ใช้ไม่ได้เพราะขนาดรูปต่างกัน ต้องตั้งสเกลใหม่
        setPxPerMX(undefined);
        setPxPerMY(undefined);
        setLineX(null);
        setLineY(null);
        setTempPts([]);
        setAxis("x");
        setMode("scale");
      } catch {
        notify({ message: "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", variant: "danger" });
      } finally {
        URL.revokeObjectURL(localUrl);
        if (fileInputRef.current) fileInputRef.current.value = ""; // ให้เลือกไฟล์เดิมซ้ำได้
        setUploading(false);
      }
    };
    img.src = localUrl;
  };

  // ── Scale clicks ──
  const handleScaleClick = (e: React.MouseEvent) => {
    if (mode !== "scale") return;
    const p = relPoint(e.clientX, e.clientY);
    const next = [...tempPts, p];
    if (next.length < 2) {
      setTempPts(next);
      return;
    }
    // ครบ 2 จุด
    const meters = parseFloat(axis === "x" ? metersX : metersY);
    if (!meters || meters <= 0) {
      notify({ message: "กรุณากรอกระยะจริง (เมตร) ให้ถูกต้องก่อนวัด", variant: "danger" });
      setTempPts([]);
      return;
    }
    const [a, b] = next;
    if (axis === "x") {
      const dxPx = Math.abs(b.x - a.x) * naturalW;
      if (dxPx <= 0) { notify({ message: "จุดสองจุดต้องห่างกันในแนวนอน", variant: "danger" }); setTempPts([]); return; }
      setPxPerMX(dxPx / meters);
      setLineX([a, b]);
      setAxis("y");
    } else {
      const dyPx = Math.abs(b.y - a.y) * naturalH;
      if (dyPx <= 0) { notify({ message: "จุดสองจุดต้องห่างกันในแนวตั้ง", variant: "danger" }); setTempPts([]); return; }
      setPxPerMY(dyPx / meters);
      setLineY([a, b]);
    }
    setTempPts([]);
  };

  // ── Frame drag ──
  const onOverlayPointerDown = (e: React.PointerEvent) => {
    if (mode !== "frame") return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: overlay.x, oy: overlay.y };
  };
  const onOverlayPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (mode !== "frame" || !d || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - d.startX) / rect.width;
    const dy = (e.clientY - d.startY) / rect.height;
    // ใช้ค่า local (d) ใน updater เพื่อไม่ให้ dereference ref ที่อาจเป็น null (กัน crash ตอน StrictMode เรียก updater ซ้ำ)
    setOverlay((prev) => ({
      ...prev,
      x: clamp(d.ox + dx, 0, Math.max(0, 1 - prev.w)),
      y: clamp(d.oy + dy, 0, Math.max(0, 1 - prev.h)),
    }));
  };
  const onOverlayPointerUp = () => { dragRef.current = null; };

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
    [blocked, gridRows, gridCols]
  );

  // ── Save / Reset ──
  const handleSave = async () => {
    if (!imageUrl) { notify({ message: "กรุณาอัปโหลดรูปผัง top-view ก่อน", variant: "danger" }); return; }
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
      notify({ message: "บันทึกผังไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", variant: "danger" });
    } finally {
      setIsSaving(false);
    }
  };

  // ล้างผังทั้งหมดกลับเป็นค่าว่าง (เริ่มใหม่) — ยังไม่กระทบ DB จนกว่าจะกดบันทึก
  const handleReset = async () => {
    const ok = await confirm({
      title: "ล้างผังทั้งหมด?",
      message: "ล้างรูป, สเกล, กริด และช่องห้ามจองทั้งหมดเพื่อเริ่มใหม่\nข้อมูลที่บันทึกไว้ใน DB จะยังไม่ถูกลบจนกว่าจะกดบันทึก",
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
    setPxPerMX(undefined);
    setPxPerMY(undefined);
    setBlocked(new Set());
    setMetersX("");
    setMetersY("");
    setLineX(null);
    setLineY(null);
    setTempPts([]);
    setAxis("x");
    setMode("upload");
  };

  const tools: { mode: Mode; label: string; icon: React.ElementType; disabled?: boolean }[] = [
    { mode: "upload", label: "อัปโหลดผัง", icon: ImageIcon },
    { mode: "scale", label: "ตั้งสเกล", icon: Ruler, disabled: !imageUrl },
    { mode: "frame", label: "ปรับกรอบ", icon: Move, disabled: !imageUrl },
    { mode: "block", label: "ช่องห้ามจอง", icon: Ban, disabled: !imageUrl },
  ];

  // grid cells geometry (percent of container)
  const cellW = overlay.w / gridCols;
  const cellH = overlay.h / gridRows;

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
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-slate-200/60"
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
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
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
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isSaving ? "กำลังบันทึก..." : "บันทึกผัง"}
          </Button>
        </div>
      </div>

      {/* Grid params */}
      <div className="bg-white p-4 rounded-[7px] shadow-sm border border-slate-100 flex flex-wrap items-end gap-4">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
          <Grid3X3 size={14} className="text-slate-300" /> ตั้งค่ากริด
        </div>
        <NumField label="คอลัมน์ (auto)" value={gridCols} min={1} max={100} onChange={setGridCols} />
        <NumField label="แถว (auto)" value={gridRows} min={1} max={100} onChange={setGridRows} />
        <NumField label="ขนาดช่อง (ม.)" value={cellSizeM} min={0.1} step={0.1} onChange={setCellSizeM} />
        <p className="w-full text-[10px] font-bold text-slate-400 order-last">
          * คอลัมน์/แถวคำนวณจากความกว้าง/ยาวจริง ÷ ขนาดช่อง (กรอกในโหมด “ตั้งสเกล”) — เปลี่ยนขนาดช่องแล้วค่าจะแปลงอัตโนมัติ
        </p>
        <div className="text-[11px] font-bold text-slate-400">
          {calibrated ? (
            <span className="text-emerald-600">✓ ตั้งสเกลแล้ว — กรอบล็อกตามระยะจริง</span>
          ) : (
            <span className="text-amber-500">ยังไม่ได้ตั้งสเกล (กรอบปรับขนาดอิสระ)</span>
          )}
        </div>
      </div>

      {/* Scale controls */}
      {mode === "scale" && imageUrl && (
        <div className="bg-white p-4 rounded-[7px] shadow-sm border border-slate-100 space-y-3">
          <p className="text-xs font-bold text-slate-600">
            กรอกความกว้าง/ยาวจริง (เมตร) → ระบบคำนวณจำนวนคอลัมน์/แถวให้อัตโนมัติ (= เมตร ÷ ขนาดช่อง) และคลิก 2 จุดบนรูปเพื่อล็อกสเกลกรอบให้ตรงพื้นที่จริง (
            <span className={axis === "x" ? "text-blue-600" : "text-emerald-600"}>
              กำลังวัด: {axis === "x" ? "แกนกว้าง (นอน)" : "แกนยาว (ตั้ง)"}
            </span>
            )
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-blue-600">ความกว้างจริง (ม.)</Label>
              <Input
                type="number"
                value={metersX}
                onChange={(e) => setMetersX(e.target.value)}
                className="h-9 w-32 rounded-[7px] bg-slate-50"
                placeholder="เช่น 10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-emerald-600">ความยาวจริง (ม.)</Label>
              <Input
                type="number"
                value={metersY}
                onChange={(e) => setMetersY(e.target.value)}
                className="h-9 w-32 rounded-[7px] bg-slate-50"
                placeholder="เช่น 8"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => { setAxis("x"); setTempPts([]); }}
              className="h-9 rounded-[7px] text-xs font-bold"
            >
              วัดแกนกว้างใหม่
            </Button>
            <Button
              variant="outline"
              onClick={() => { setAxis("y"); setTempPts([]); }}
              className="h-9 rounded-[7px] text-xs font-bold"
            >
              วัดแกนยาวใหม่
            </Button>
          </div>
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
                {uploading ? "กำลังอัปโหลด..." : "คลิกเพื่ออัปโหลดรูปผัง top-view"}
              </p>
              <p className="text-xs text-slate-400 font-medium">ภาพผังมองจากด้านบน สำหรับตั้งสเกลและวางกริด</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              ref={containerRef}
              className={cn(
                "relative inline-block select-none max-w-full",
                mode === "scale" && "cursor-crosshair"
              )}
              onClick={handleScaleClick}
              onPointerMove={onOverlayPointerMove}
              onPointerUp={() => { onOverlayPointerUp(); setPainting(false); }}
              onPointerLeave={() => { onOverlayPointerUp(); setPainting(false); }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="floor plan" className="block max-w-full h-auto pointer-events-none" />

              {/* Scale lines (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {lineX && (
                  <line x1={lineX[0].x * 100} y1={lineX[0].y * 100} x2={lineX[1].x * 100} y2={lineX[1].y * 100} stroke="#2563eb" strokeWidth={0.5} />
                )}
                {lineY && (
                  <line x1={lineY[0].x * 100} y1={lineY[0].y * 100} x2={lineY[1].x * 100} y2={lineY[1].y * 100} stroke="#059669" strokeWidth={0.5} />
                )}
                {tempPts.map((p, i) => (
                  <circle key={i} cx={p.x * 100} cy={p.y * 100} r={0.8} fill={axis === "x" ? "#2563eb" : "#059669"} />
                ))}
              </svg>

              {/* Overlay frame */}
              {imageUrl && overlay.w > 0 && overlay.h > 0 && (
                <div
                  onPointerDown={onOverlayPointerDown}
                  className={cn(
                    "absolute border-2 border-[#f26522]",
                    mode === "frame" && "cursor-move bg-[#f26522]/5",
                    // block mode: เปิด pointer events เพื่อให้ cell ลูกรับคลิกได้; โหมดอื่นปิดเพื่อให้คลิกทะลุไป container
                    mode !== "frame" && mode !== "block" && "pointer-events-none"
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
                            onPointerDown={mode === "block" ? () => onCellDown(r, c) : undefined}
                            onPointerEnter={mode === "block" ? () => onCellEnter(r, c) : undefined}
                            className={cn(
                              "absolute border transition-colors duration-100",
                              mode === "block" ? "pointer-events-auto cursor-pointer" : "pointer-events-none",
                              isBlocked
                                ? "bg-red-500/70 border-red-600/80" // เลือกห้ามจองแล้ว = แดงเข้ม
                                : mode === "block"
                                  ? "bg-white/5 border-white/50 hover:bg-red-500/30" // hover = preview แดงจาง
                                  : "bg-transparent border-white/40"
                            )}
                            style={{
                              left: `${(c / gridCols) * 100}%`,
                              top: `${(r / gridRows) * 100}%`,
                              width: `${(1 / gridCols) * 100}%`,
                              height: `${(1 / gridRows) * 100}%`,
                            }}
                          />
                        );
                      })
                    )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        {imageUrl && (
          <div className="flex items-center gap-4 mt-4 flex-wrap text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>กริด {gridCols}×{gridRows}</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-red-500/70" /> ช่องห้ามจอง ({blocked.size})</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm border-2 border-[#f26522]" /> กรอบพื้นที่</span>
            {mode === "frame" && <span className="text-[#f26522]">ลากกรอบเพื่อวางทับมุมเริ่มพื้นที่</span>}
            {mode === "block" && <span className="text-[#f26522]">คลิก/ลากช่องเพื่อสลับห้ามจอง</span>}
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {dialog}
    </div>
  );
}

function NumField({
  label, value, onChange, min, max, step = 1,
}: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
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

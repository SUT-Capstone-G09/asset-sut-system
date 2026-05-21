"use client"

import React, { useState, useCallback, useRef } from "react";
import {
  Box,
  Footprints,
  Eraser,
  Store,
  RotateCcw,
  Save,
  Loader2,
  Grid3X3,
  MousePointer2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CellType,
  FloorPlanData,
  FloorPlanStall,
} from "@/features/areas/types/floor-plan";
import FloorPlanStallDialog from "./FloorPlanStallDialog";

// ─── Design Tokens (ยึดตาม Design System ของโปรเจกต์) ──────────
const BRAND = "#f26522";
const CELL_COLORS: Record<CellType, string> = {
  empty: "bg-slate-50 border-slate-200/60",
  wall: "bg-slate-700 border-slate-800",
  walkway: "bg-amber-100/80 border-amber-200",
  stall: "bg-emerald-100/80 border-emerald-300",
};

const STALL_STATUS_COLORS: Record<string, string> = {
  occupied: "bg-emerald-400/90",
  vacant: "bg-amber-400/90",
  inactive: "bg-slate-400/90",
};

const STALL_STATUS_RING: Record<string, string> = {
  occupied: "ring-emerald-500/30",
  vacant: "ring-amber-500/30",
  inactive: "ring-slate-500/30",
};

type ToolMode = "select" | "wall" | "walkway" | "eraser" | "stall";

interface FloorPlanEditorProps {
  initialData: FloorPlanData;
  onSave: (data: FloorPlanData) => void;
}

export default function FloorPlanEditor({
  initialData,
  onSave,
}: FloorPlanEditorProps) {
  // ── State ──────────────────────────────────────────────────────
  const [grid, setGrid] = useState<CellType[][]>(
    () => initialData.grid.map((row) => [...row])
  );
  const [stalls, setStalls] = useState<FloorPlanStall[]>(
    () => [...initialData.stalls]
  );
  const [tool, setTool] = useState<ToolMode>("select");
  const [isPainting, setIsPainting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Stall creation flow
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [stallDialogOpen, setStallDialogOpen] = useState(false);

  // Selection start for stall range-select
  const selectionStart = useRef<[number, number] | null>(null);

  const rows = initialData.rows;
  const cols = initialData.cols;

  // ── Helpers ────────────────────────────────────────────────────
  const findStall = useCallback(
    (r: number, c: number) =>
      stalls.find((s) => s.cells.some(([sr, sc]) => sr === r && sc === c)),
    [stalls]
  );

  // ── Tool actions ───────────────────────────────────────────────
  const paintCell = useCallback(
    (r: number, c: number) => {
      if (tool === "select") return;

      // ห้ามวาดทับ stall ที่มีอยู่ (ยกเว้น eraser)
      const existingStall = findStall(r, c);

      if (tool === "eraser") {
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          next[r][c] = "empty";
          return next;
        });
        // ลบ stall ที่ครอบเซลล์นี้
        if (existingStall) {
          setStalls((prev) => prev.filter((s) => s.id !== existingStall.id));
        }
        return;
      }

      if (existingStall) return;

      if (tool === "wall" || tool === "walkway") {
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          next[r][c] = tool;
          return next;
        });
      }
    },
    [tool, findStall]
  );

  const handleMouseDown = (r: number, c: number) => {
    if (tool === "stall") {
      selectionStart.current = [r, c];
      setSelectedCells([[r, c]]);
      return;
    }
    setIsPainting(true);
    paintCell(r, c);
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (tool === "stall" && selectionStart.current) {
      const [sr, sc] = selectionStart.current;
      const cells: [number, number][] = [];
      const rMin = Math.min(sr, r), rMax = Math.max(sr, r);
      const cMin = Math.min(sc, c), cMax = Math.max(sc, c);
      for (let ri = rMin; ri <= rMax; ri++) {
        for (let ci = cMin; ci <= cMax; ci++) {
          cells.push([ri, ci]);
        }
      }
      setSelectedCells(cells);
      return;
    }
    if (isPainting) paintCell(r, c);
  };

  const handleMouseUp = () => {
    if (tool === "stall" && selectedCells.length > 0) {
      selectionStart.current = null;
      setStallDialogOpen(true);
      return;
    }
    setIsPainting(false);
  };

  // ── Stall creation ─────────────────────────────────────────────
  const handleStallCreate = (label: string, name: string) => {
    const newStall: FloorPlanStall = {
      id: `s${Date.now()}`,
      label,
      name,
      status: "vacant",
      cells: selectedCells,
    };

    // Mark cells in grid
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      for (const [r, c] of selectedCells) {
        next[r][c] = "stall";
      }
      return next;
    });

    setStalls((prev) => [...prev, newStall]);
    setSelectedCells([]);
    setStallDialogOpen(false);
    setTool("select");
  };

  const handleStallCancel = () => {
    setSelectedCells([]);
    setStallDialogOpen(false);
  };

  // ── Save ───────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const updatedData: FloorPlanData = {
      ...initialData,
      grid: grid.map((row) => [...row]),
      stalls: [...stalls],
      updatedAt: new Date().toISOString(),
    };

    // บันทึกลง localStorage
    const stored = localStorage.getItem("floor-plans");
    const all: FloorPlanData[] = stored ? JSON.parse(stored) : [];
    const idx = all.findIndex((fp) => fp.id === updatedData.id);
    if (idx >= 0) all[idx] = updatedData;
    else all.push(updatedData);
    localStorage.setItem("floor-plans", JSON.stringify(all));

    onSave(updatedData);
    setIsSaving(false);
  };

  // ── Reset ──────────────────────────────────────────────────────
  const handleReset = () => {
    setGrid(initialData.grid.map((row) => [...row]));
    setStalls([...initialData.stalls]);
    setSelectedCells([]);
    setTool("select");
  };

  // ── Cell style helper ──────────────────────────────────────────
  const getCellStyle = (r: number, c: number) => {
    const isSelected = selectedCells.some(([sr, sc]) => sr === r && sc === c);
    if (isSelected) {
      return "bg-blue-300/60 border-blue-400 ring-2 ring-blue-400/40";
    }

    const stall = findStall(r, c);
    if (stall) {
      const isTopLeft =
        stall.cells[0][0] === r && stall.cells[0][1] === c;
      return cn(
        STALL_STATUS_COLORS[stall.status],
        "ring-1",
        STALL_STATUS_RING[stall.status],
        "border-transparent",
        isTopLeft && "z-10"
      );
    }

    return CELL_COLORS[grid[r][c]];
  };

  // ── Render ─────────────────────────────────────────────────────
  const tools: {
    mode: ToolMode;
    label: string;
    icon: React.ElementType;
    shortLabel: string;
  }[] = [
    { mode: "select", label: "เลือก", icon: MousePointer2, shortLabel: "Select" },
    { mode: "wall", label: "กำแพง", icon: Box, shortLabel: "Wall" },
    { mode: "walkway", label: "ทางเดิน", icon: Footprints, shortLabel: "Walk" },
    { mode: "stall", label: "สร้างแผง", icon: Store, shortLabel: "Stall" },
    { mode: "eraser", label: "ยางลบ", icon: Eraser, shortLabel: "Erase" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-[7px] shadow-sm border border-slate-100">
        {/* Tool Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {tools.map((t) => (
            <button
              key={t.mode}
              onClick={() => { setTool(t.mode); setSelectedCells([]); }}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-[7px] text-xs font-bold transition-all",
                tool === t.mode
                  ? "bg-[#f26522] text-white shadow-lg shadow-[#f26522]/20"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-slate-200/60"
              )}
            >
              <t.icon size={15} strokeWidth={2.5} />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-9 px-3 text-slate-400 hover:text-[#f26522] hover:bg-[#f26522]/5 rounded-[7px] gap-1.5 text-xs font-bold transition-all"
          >
            <RotateCcw size={14} />
            รีเซ็ต
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "h-9 px-5 rounded-[7px] font-bold text-xs text-white gap-2",
              "bg-[#f26522] hover:bg-[#d8561d] transition-all",
              "shadow-lg shadow-[#f26522]/20"
            )}
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isSaving ? "กำลังบันทึก..." : "บันทึกผัง"}
          </Button>
        </div>
      </div>

      {/* ── Grid Canvas ─────────────────────────────────────── */}
      <div className="bg-white rounded-[7px] shadow-sm border border-slate-100 p-5 overflow-x-auto">
        {/* Legend */}
        <div className="flex items-center gap-5 mb-5 flex-wrap">
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Grid3X3 size={14} className="text-slate-300" />
            <span>ผัง {rows}×{cols}</span>
          </div>
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            {[
              { color: "bg-emerald-400", label: "มีผู้เช่า" },
              { color: "bg-amber-400", label: "ว่าง" },
              { color: "bg-slate-400", label: "ปิดปรับปรุง" },
              { color: "bg-slate-700", label: "กำแพง" },
              { color: "bg-amber-100", label: "ทางเดิน" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={cn("size-2.5 rounded-sm", item.color)} />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div
          className="inline-grid gap-[2px] select-none"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(36px, 1fr))` }}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { setIsPainting(false); }}
        >
          {grid.map((row, r) =>
            row.map((_, c) => {
              const stall = findStall(r, c);
              const isFirstCell =
                stall &&
                stall.cells[0][0] === r &&
                stall.cells[0][1] === c;

              return (
                <div
                  key={`${r}-${c}`}
                  onMouseDown={() => handleMouseDown(r, c)}
                  onMouseEnter={() => handleMouseEnter(r, c)}
                  className={cn(
                    "relative h-9 rounded-[3px] border transition-all duration-150",
                    getCellStyle(r, c),
                    tool !== "select" && "cursor-crosshair",
                    tool === "select" && stall && "cursor-pointer hover:brightness-90"
                  )}
                  title={stall ? `${stall.label} — ${stall.name || "ยังไม่ตั้งชื่อ"}` : undefined}
                >
                  {/* แสดงชื่อแผงที่เซลล์แรก */}
                  {isFirstCell && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[9px] font-black text-white drop-shadow-sm leading-none text-center px-0.5 truncate">
                        {stall.label}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Stall List Summary ──────────────────────────────── */}
      {stalls.length > 0 && (
        <div className="bg-white rounded-[7px] shadow-sm border border-slate-100 p-5">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            รายการแผงค้า ({stalls.length} แผง)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {stalls.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-[7px] border transition-all",
                  "hover:shadow-sm hover:border-slate-200 bg-slate-50/50 border-slate-100"
                )}
              >
                <div
                  className={cn(
                    "size-8 rounded-[7px] flex items-center justify-center text-[10px] font-black text-white shrink-0",
                    STALL_STATUS_COLORS[s.status]
                  )}
                >
                  {s.label}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">
                    {s.name || "ยังไม่ตั้งชื่อ"}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {s.status === "occupied" ? "มีผู้เช่า" : s.status === "vacant" ? "ว่าง" : "ปิดปรับปรุง"}
                    {" · "}
                    {s.cells.length} เซลล์
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Stall Dialog ────────────────────────────────────── */}
      <FloorPlanStallDialog
        open={stallDialogOpen}
        onConfirm={handleStallCreate}
        onCancel={handleStallCancel}
        cellCount={selectedCells.length}
        existingLabels={stalls.map((s) => s.label)}
      />
    </div>
  );
}

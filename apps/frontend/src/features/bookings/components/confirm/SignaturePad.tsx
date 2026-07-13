"use client";

import { useRef, useState, useEffect } from "react";
import { Loader2, Eraser, Upload, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSavedSignature, saveSignature, deleteSavedSignature, SignatureResult } from "@/lib/services/signature.service";

// Keeps uploaded signatures crisp without bloating the generated PDF.
const MAX_SIGNATURE_KB = 500;
const MIN_SIGNATURE_KB = 2;

async function dataUrlToFile(dataUrl: string, filename = "signature.png"): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: "image/png" });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Signature must be a transparent PNG, not a flat-colored background — check
// the decoded pixels for any non-opaque alpha value.
function hasTransparentPixel(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(true); return; }
      ctx.drawImage(img, 0, 0);
      try {
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) { resolve(true); return; }
        }
        resolve(false);
      } catch {
        resolve(true); // can't read pixels (e.g. CORS) — don't block the user
      }
    };
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
}

export default function SignaturePad({ onChange, onModeChange }: { onChange: (url: string | null) => void; onModeChange?: (mode: "draw" | "upload" | "saved") => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [mode, setMode] = useState<"draw" | "upload" | "saved">("draw");
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SignatureResult | null>(null);
  const [savingSig, setSavingSig] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [deletingSaved, setDeletingSaved] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const loadSaved = () => {
    setLoadError(false);
    getSavedSignature()
      .then((result) => {
        if (result) {
          setSaved(result);
          setMode("saved");
          onChange(result.url);
          onModeChange?.("saved");
        }
      })
      .catch(() => setLoadError(true));
  };

  useEffect(() => {
    loadSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e: MouseEvent | TouchEvent, c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect();
    const sx = c.width / r.width, sy = c.height / r.height;
    if ("touches" in e) return { x: (e.touches[0].clientX - r.left) * sx, y: (e.touches[0].clientY - r.top) * sy };
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
  };

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    // The canvas unmounts when switching to upload mode, so a fresh blank
    // canvas is mounted each time draw mode is re-entered — re-attach
    // listeners to it and reset the empty state to match.
    setIsEmpty(true);
    const ctx = c.getContext("2d")!;

    const down = (e: MouseEvent | TouchEvent) => { e.preventDefault(); drawing.current = true; last.current = pos(e, c); };
    const move = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!drawing.current || !last.current) return;
      const p = pos(e, c);
      ctx.beginPath(); ctx.strokeStyle = "#111"; ctx.lineWidth = 1.8; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      last.current = p; setIsEmpty(false); onChange(c.toDataURL("image/png"));
    };
    const up = () => { drawing.current = false; last.current = null; };

    c.addEventListener("mousedown", down); c.addEventListener("mousemove", move);
    c.addEventListener("mouseup", up); c.addEventListener("mouseleave", up);
    c.addEventListener("touchstart", down, { passive: false }); c.addEventListener("touchmove", move, { passive: false });
    c.addEventListener("touchend", up);
    return () => {
      c.removeEventListener("mousedown", down); c.removeEventListener("mousemove", move);
      c.removeEventListener("mouseup", up); c.removeEventListener("mouseleave", up);
      c.removeEventListener("touchstart", down); c.removeEventListener("touchmove", move);
      c.removeEventListener("touchend", up);
    };
  }, [onChange, mode]);

  const clear = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setIsEmpty(true); onChange(null);
  };

  const switchMode = (m: "draw" | "upload" | "saved") => {
    setMode(m);
    onModeChange?.(m);
    setUploadError(null);
    setJustSaved(false);
    if (m === "draw") {
      onChange(isEmpty ? null : canvasRef.current?.toDataURL("image/png") ?? null);
    } else if (m === "upload") {
      onChange(uploadPreview);
    } else {
      onChange(saved?.url ?? null);
    }
  };

  const handleSaveForNextTime = async () => {
    const dataUrl = mode === "draw"
      ? (isEmpty ? null : canvasRef.current?.toDataURL("image/png") ?? null)
      : uploadPreview;
    if (!dataUrl) return;
    setSavingSig(true);
    try {
      const file = await dataUrlToFile(dataUrl);
      const result = await saveSignature(file);
      setSaved(result);
      setJustSaved(true);
    } catch {
      setUploadError("บันทึกลายเซ็นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSavingSig(false);
    }
  };

  const handleDeleteSaved = async () => {
    setDeletingSaved(true);
    try {
      await deleteSavedSignature();
      setSaved(null);
      switchMode("draw");
    } finally {
      setDeletingSaved(false);
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);

    if (file.type !== "image/png") {
      setUploadError("รองรับเฉพาะไฟล์ PNG เท่านั้น");
      return;
    }
    const sizeKB = file.size / 1024;
    if (sizeKB > MAX_SIGNATURE_KB) {
      setUploadError(`ไฟล์ใหญ่เกินไป (ไม่เกิน ${MAX_SIGNATURE_KB} KB)`);
      return;
    }
    if (sizeKB < MIN_SIGNATURE_KB) {
      setUploadError(`ไฟล์เล็กเกินไป ภาพอาจไม่คมชัด (อย่างน้อย ${MIN_SIGNATURE_KB} KB)`);
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    const transparent = await hasTransparentPixel(dataUrl);
    if (!transparent) {
      setUploadError("กรุณาใช้ไฟล์ PNG ที่มีพื้นหลังโปร่งใส (ไม่มีพื้นหลังสีทึบ)");
      return;
    }

    setUploadPreview(dataUrl);
    onChange(dataUrl);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-gray-600">ลายเซ็น <span className="text-red-400">*</span></label>
        {mode === "draw" && (
          <button onClick={clear} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400">
            <Eraser size={12} /> ลบ
          </button>
        )}
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5 mb-1.5">
          <span>โหลดลายเซ็นที่บันทึกไว้ไม่สำเร็จ</span>
          <button type="button" onClick={loadSaved} className="font-semibold underline underline-offset-2 shrink-0">
            ลองใหม่
          </button>
        </div>
      )}

      {/* Mode tabs */}
      <div className="flex gap-1.5 mb-1.5">
        {saved && (
          <button
            type="button"
            onClick={() => switchMode("saved")}
            className={cn(
              "flex-1 text-xs py-1 rounded-md border transition-colors",
              mode === "saved" ? "bg-orange-50 border-brand-primary/40 text-brand-primary font-semibold" : "border-gray-200 text-gray-500 hover:border-gray-300"
            )}
          >
            ลายเซ็นที่บันทึกไว้
          </button>
        )}
        <button
          type="button"
          onClick={() => switchMode("draw")}
          className={cn(
            "flex-1 text-xs py-1 rounded-md border transition-colors",
            mode === "draw" ? "bg-orange-50 border-brand-primary/40 text-brand-primary font-semibold" : "border-gray-200 text-gray-500 hover:border-gray-300"
          )}
        >
          วาดลายเซ็น
        </button>
        <button
          type="button"
          onClick={() => switchMode("upload")}
          className={cn(
            "flex-1 text-xs py-1 rounded-md border transition-colors",
            mode === "upload" ? "bg-orange-50 border-brand-primary/40 text-brand-primary font-semibold" : "border-gray-200 text-gray-500 hover:border-gray-300"
          )}
        >
          อัปโหลดไฟล์
        </button>
      </div>

      {mode === "saved" ? (
        <>
          <div className="rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 h-[75px] flex items-center justify-center">
            {saved && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={saved.url} alt="ลายเซ็นที่บันทึกไว้" className="h-full max-h-[70px] object-contain" />
            )}
          </div>
          <button
            type="button"
            onClick={handleDeleteSaved}
            disabled={deletingSaved}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 mt-1 disabled:opacity-50"
          >
            {deletingSaved ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} ลบลายเซ็นที่บันทึกไว้
          </button>
        </>
      ) : mode === "draw" ? (
        <>
          <div className={cn("rounded-xl border-2 border-dashed overflow-hidden bg-gray-50", isEmpty ? "border-red-200" : "border-gray-200")}>
            <canvas ref={canvasRef} width={600} height={100} className="w-full h-[75px] cursor-crosshair touch-none" />
          </div>
          <p className="text-xs text-gray-400 mt-1">วาดลายเซ็นในกรอบด้านบน</p>
          {!isEmpty && (
            <button
              type="button"
              onClick={handleSaveForNextTime}
              disabled={savingSig}
              className="flex items-center gap-1 text-xs text-brand-primary hover:underline mt-1 disabled:opacity-50"
            >
              {savingSig ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {justSaved ? "บันทึกแล้ว" : "บันทึกลายเซ็นนี้ไว้ใช้ครั้งหน้า"}
            </button>
          )}
        </>
      ) : (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png"
            className="hidden"
            onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 h-[75px] transition-colors overflow-hidden",
              uploadError ? "border-red-200 bg-red-50/30" : "border-gray-200 bg-gray-50 hover:bg-white"
            )}
          >
            {uploadPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={uploadPreview} alt="ลายเซ็น" className="h-full max-h-[70px] object-contain" />
            ) : (
              <>
                <Upload size={16} className="text-gray-400" />
                <span className="text-xs text-gray-400">คลิกเพื่ออัปโหลดลายเซ็น</span>
              </>
            )}
          </button>
          <p className={cn("text-xs mt-1", uploadError ? "text-red-500" : "text-gray-400")}>
            {uploadError ?? `เฉพาะ PNG พื้นหลังโปร่งใส ขนาด ${MIN_SIGNATURE_KB}–${MAX_SIGNATURE_KB} KB`}
          </p>
          {uploadPreview && !uploadError && (
            <button
              type="button"
              onClick={handleSaveForNextTime}
              disabled={savingSig}
              className="flex items-center gap-1 text-xs text-brand-primary hover:underline mt-1 disabled:opacity-50"
            >
              {savingSig ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {justSaved ? "บันทึกแล้ว" : "บันทึกลายเซ็นนี้ไว้ใช้ครั้งหน้า"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

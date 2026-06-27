"use client";

import { useRef, useState, useEffect } from "react";
import { X, Download, Loader2, Eraser, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Room } from "@/features/bookings/types";
import { cn } from "@/lib/utils";

interface Timeslot {
  date: string;
  startTime: string;
  endTime: string;
}

interface DocumentFormModalProps {
  room: Room;
  timeslots: Timeslot[];
  purpose: string;
  onClose: () => void;
  onGenerated: (file: File) => void;
  onPurposeChange?: (value: string) => void;
}

const THAI_MONTHS_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const THAI_MONTHS_LONG  = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];

function parseDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { d, m, y, be: y + 543 };
}
function fmtLong(dateStr: string) {
  const { d, m, be } = parseDate(dateStr);
  return `${d} ${THAI_MONTHS_LONG[m - 1]} พ.ศ. ${be}`;
}
function fmtShortD(dateStr: string) { return String(parseDate(dateStr).d); }
function fmtShortM(dateStr: string) { return THAI_MONTHS_SHORT[parseDate(dateStr).m - 1]; }
function fmtShortBE(dateStr: string) { return String(parseDate(dateStr).be); }

function todayParts() {
  const n = new Date();
  return { d: n.getDate(), m: THAI_MONTHS_LONG[n.getMonth()], be: n.getFullYear() + 543 };
}


// ── Signature pad ─────────────────────────────────────────────────────────────

function SignaturePad({ onChange }: { onChange: (url: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const pos = (e: MouseEvent | TouchEvent, c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect();
    const sx = c.width / r.width, sy = c.height / r.height;
    if ("touches" in e) return { x: (e.touches[0].clientX - r.left) * sx, y: (e.touches[0].clientY - r.top) * sy };
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
  };

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
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
  }, [onChange]);

  const clear = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setIsEmpty(true); onChange(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-gray-600">ลายเซ็น <span className="text-red-400">*</span></label>
        <button onClick={clear} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400">
          <Eraser size={12} /> ลบ
        </button>
      </div>
      <div className={cn("rounded-xl border-2 border-dashed overflow-hidden bg-gray-50", isEmpty ? "border-red-200" : "border-gray-200")}>
        <canvas ref={canvasRef} width={600} height={100} className="w-full h-[75px] cursor-crosshair touch-none" />
      </div>
      <p className="text-xs text-gray-400 mt-1">วาดลายเซ็นในกรอบด้านบน</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface FormData {
  prefix: string;
  fullName: string;
  position: string;
  department: string;
  address: string;
  phone: string;
  attendees: string;
  purposeText: string;
  buildingType: string;
  otherBuilding: string;
}

const BUILDING_OPTIONS = ["อาคาร 80 พรรษา", "อาคารเรียนรวม 1", "สนามกีฬา", "อื่นๆ"];

export default function DocumentFormModal({ room, timeslots, purpose, onClose, onGenerated, onPurposeChange }: DocumentFormModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedFile, setGeneratedFile] = useState<File | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    prefix: "นาย",
    fullName: "",
    position: "",
    department: "",
    address: "",
    phone: "",
    attendees: "",
    purposeText: purpose,
    buildingType: "อื่นๆ",
    otherBuilding: room.name,
  });

  const set = (f: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((p) => ({ ...p, [f]: value }));
      if (f === "purposeText") onPurposeChange?.(value);
    };

  // date/time helpers from timeslots
  const firstSlot = timeslots[0];
  const lastSlot  = timeslots[timeslots.length - 1];
  const today     = todayParts();

  // total days
  const totalDays = timeslots.length;

  const handleGenerate = async () => {
    if (!printRef.current) return;
    setGenerating(true);
    try {
      const { default: html2canvas } = await import("html2canvas-pro");
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const w = pdf.internal.pageSize.getWidth();
      pdf.addImage(imgData, "PNG", 0, 0, w, (canvas.height * w) / canvas.width);
      const blob = pdf.output("blob");
      const fileName = `คำขออนุญาตใช้${room.name}.pdf`;
      const file = new File([blob], fileName, { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), { href: url, download: fileName }).click();
      URL.revokeObjectURL(url);
      setGeneratedFile(file);
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirm = () => {
    if (generatedFile) onGenerated(generatedFile);
    onClose();
  };

  const isValid = form.fullName.trim() && form.department.trim() && form.phone.trim() && form.purposeText.trim() && sig !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm py-8 px-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">สร้างเอกสารคำขออนุญาตใช้สถานที่</h2>
            <p className="text-xs text-gray-400 mt-0.5">กรอกข้อมูลแล้วระบบจะสร้างไฟล์ PDF อัตโนมัติ</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

          {/* ── Document preview ─────────────────────────────── */}
          <div className="p-5 bg-gray-50 overflow-y-auto max-h-[85vh]">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">ตัวอย่างเอกสาร</p>

            <div
              ref={printRef}
              className="bg-white shadow border border-gray-200 rounded-lg px-10 py-8 text-[12.5px] leading-[1.9]"
              style={{ fontFamily: '"Sarabun", "TH Sarabun New", serif' }}
            >
              {/* Title */}
              <p className="text-center font-bold text-[15px] mb-1">
                การขออนุญาตใช้อาคารสถานที่ มหาวิทยาลัยเทคโนโลยีสุรนารี
              </p>

              {/* Org + address + date block — right aligned */}
              <div className="text-right text-[12px] mb-3">
                <p>
                  ชื่อบริษัท/หน่วยงาน
                  <span className="border-b border-dotted border-gray-700 inline-block min-w-[140px] mx-1 align-bottom">
                    {form.department}
                  </span>
                  ที่อยู่
                  <span className="border-b border-dotted border-gray-700 inline-block min-w-[150px] mx-1 align-bottom">
                    {form.address}
                  </span>
                </p>
                <p>
                  วันที่
                  <span className="border-b border-dotted border-gray-700 inline-block w-10 mx-1 align-bottom text-center">{today.d}</span>
                  เดือน
                  <span className="border-b border-dotted border-gray-700 inline-block w-28 mx-1 align-bottom text-center">{today.m}</span>
                  พ.ศ.
                  <span className="border-b border-dotted border-gray-700 inline-block w-14 mx-1 align-bottom text-center">{today.be}</span>
                </p>
              </div>

              {/* Subject + To */}
              <p>
                <span className="font-bold">เรื่อง</span>{" "}
                ขออนุญาตใช้สถานที่
                <span className="border-b border-dotted border-gray-700 inline-block min-w-[200px] mx-1 align-bottom text-center">
                  {room.name}
                </span>
              </p>
              <p className="mb-2">
                <span className="font-bold">เรียน</span>{" "}
                อธิการบดีมหาวิทยาลัยเทคโนโลยีสุรนารี
              </p>

              {/* Requester */}
              <div className="flex items-baseline pl-8">
                <span className="shrink-0">ด้วยข้าพเจ้า </span>
                <span className="flex-1 border-b border-dotted border-gray-700 ml-1 text-left">
                  {form.prefix}{form.fullName}
                </span>
              </div>
              <p>
                ตำแหน่ง
                <span className="border-b border-dotted border-gray-700 inline-block min-w-[140px] mx-1 align-bottom text-center">
                  {form.position}
                </span>
                บริษัท/หน่วยงาน
                <span className="border-b border-dotted border-gray-700 inline-block min-w-[120px] mx-1 align-bottom text-center">
                  {form.department}
                </span>
                เบอร์โทรศัพท์
                <span className="border-b border-dotted border-gray-700 inline-block min-w-[90px] mx-1 align-bottom text-center">
                  {form.phone}
                </span>
              </p>
              <p>มีความประสงค์จะขออนุญาตใช้อาคารสถานที่</p>

              {/* Building checkboxes */}
              <div className="flex flex-wrap gap-x-6 gap-y-0.5 ml-8 mb-1">
                {BUILDING_OPTIONS.map((opt) => (
                  <span key={opt} className="flex items-center gap-1">
                    <span className="text-base">{form.buildingType === opt ? "☑" : "□"}</span>
                    {opt === "อื่นๆ"
                      ? <>อื่นๆ
                          <span className="border-b border-dotted border-gray-700 inline-block min-w-[80px] mx-1 align-bottom text-center text-[11px]">
                            {form.buildingType === "อื่นๆ" ? form.otherBuilding : ""}
                          </span>
                        </>
                      : opt}
                  </span>
                ))}
              </div>

              {/* Purpose on one line */}
              <div className="flex items-baseline gap-1 ml-8">
                <span className="shrink-0">- ข้าพเจ้าขอใช้อาคารสถานที่ เพื่อ</span>
                <span className="flex-1 border-b border-dotted border-gray-700">
                  {form.purposeText}
                </span>
              </div>

              {/* Date range */}
              {firstSlot && lastSlot && (
                <p>
                  ระยะเวลา
                  <span className="border-b border-dotted border-gray-700 inline-block w-8 mx-1 align-bottom text-center">{totalDays}</span>
                  วัน ระหว่างวันที่
                  <span className="border-b border-dotted border-gray-700 inline-block w-8 mx-1 align-bottom text-center">{fmtShortD(firstSlot.date)}</span>
                  เดือน
                  <span className="border-b border-dotted border-gray-700 inline-block w-20 mx-1 align-bottom text-center">{fmtShortM(firstSlot.date)}</span>
                  พ.ศ.
                  <span className="border-b border-dotted border-gray-700 inline-block w-14 mx-1 align-bottom text-center">{fmtShortBE(firstSlot.date)}</span>
                  ถึงวันที่
                  <span className="border-b border-dotted border-gray-700 inline-block w-8 mx-1 align-bottom text-center">{fmtShortD(lastSlot.date)}</span>
                  เดือน
                  <span className="border-b border-dotted border-gray-700 inline-block w-20 mx-1 align-bottom text-center">{fmtShortM(lastSlot.date)}</span>
                  พ.ศ.
                  <span className="border-b border-dotted border-gray-700 inline-block w-14 mx-1 align-bottom text-center">{fmtShortBE(lastSlot.date)}</span>
                </p>
              )}

              {/* Time + attendees */}
              {firstSlot && (
                <p>
                  ตั้งแต่เวลา
                  <span className="border-b border-dotted border-gray-700 inline-block w-16 mx-1 align-bottom text-center">{firstSlot.startTime}</span>
                  น. ถึงเวลา
                  <span className="border-b border-dotted border-gray-700 inline-block w-16 mx-1 align-bottom text-center">{lastSlot?.endTime}</span>
                  น. โดยมีผู้เข้าใช้อาคารสถานที่ในครั้งนี้ จำนวน
                  <span className="border-b border-dotted border-gray-700 inline-block w-14 mx-1 align-bottom text-center">{form.attendees}</span>
                  คน
                </p>
              )}

              {/* Declaration */}
              <p className="mt-3 indent-8">
                - ข้าพเจ้าขอรับรองว่า จะมิให้เกิดเหตุการณ์ใดๆ อันจะนำมาซึ่งความเสียหายแก่ทรัพย์สินของมหาวิทยาลัย
                หรือนำมาซึ่งเหตุที่น่าจะเป็นที่เสื่อมเสียหรือเป็นการไม่เหมาะสมใดๆ แก่มหาวิทยาลัย
                หากเกิดความเสียหายทาง บริษัท/หน่วยงานจะเป็นผู้รับผิดชอบ
              </p>

              {/* Closing */}
              <p className="text-center mt-4 mb-6">จึงเรียนมาเพื่อโปรดพิจารณา</p>

              {/* Signature */}
              <div className="flex justify-end mt-6">
                <div className="min-w-[320px]">
                  {/* Row: ลงชื่อ [line+sig] ผู้ขออนุญาต */}
                  <div className="flex items-end gap-2">
                    <span className="shrink-0 whitespace-nowrap">ลงชื่อ</span>
                    {/* Signature area — dotted line at bottom, signature image overlaid */}
                    <div className="flex-1 relative" style={{ height: "60px" }}>
                      <div className="absolute bottom-0 left-0 right-0 border-b border-dotted border-gray-600" />
                      {sig && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={sig}
                          alt="ลายเซ็น"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      )}
                    </div>
                    <span className="shrink-0 whitespace-nowrap">ผู้ขออนุญาต</span>
                  </div>
                  {/* Name below the line */}
                  <p className="text-center mt-1">
                    ({form.prefix}{form.fullName || "…………………………………"})
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Form inputs ───────────────────────────────────── */}
          <div className="p-5 overflow-y-auto max-h-[85vh]">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">กรอกข้อมูล</p>
            <div className="flex flex-col gap-3.5">

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  ชื่อ-นามสกุล <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <select value={form.prefix} onChange={set("prefix")} className="border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30">
                    {["นาย","นาง","นางสาว","ดร.","รศ.ดร.","ผศ.ดร.","ศ.ดร."].map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <input type="text" value={form.fullName} onChange={set("fullName")} placeholder="ชื่อ นามสกุล"
                    className={cn("flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30", form.fullName ? "border-gray-200" : "border-red-200")} />
                </div>
              </div>

              <FField label="ตำแหน่ง" placeholder="เช่น นักศึกษา, อาจารย์" value={form.position} onChange={set("position")} />
              <FField label="หน่วยงาน / บริษัท" placeholder="เช่น สำนักวิชาวิศวกรรมศาสตร์" value={form.department} onChange={set("department")} required />
              <FField label="ที่อยู่" placeholder="ที่อยู่หน่วยงาน" value={form.address} onChange={set("address")} />
              <FField label="เบอร์โทรศัพท์" placeholder="0XX-XXX-XXXX" value={form.phone} onChange={set("phone")} required type="tel" />
              <FField label="จำนวนผู้เข้าร่วม (คน)" placeholder={`สูงสุด ${room.capacityMax} คน`} value={form.attendees} onChange={set("attendees")} type="number" />

              {/* Building type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">อาคารสถานที่ที่ขอใช้</label>
                <div className="flex flex-wrap gap-2">
                  {BUILDING_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, buildingType: opt }))}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs border transition-colors",
                        form.buildingType === opt ? "bg-orange-50 border-brand-primary/40 text-brand-primary font-semibold" : "border-gray-200 text-gray-500 hover:border-gray-300"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {form.buildingType === "อื่นๆ" && (
                  <input type="text" value={form.otherBuilding} onChange={set("otherBuilding")} placeholder="ระบุสถานที่"
                    className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
                )}
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  วัตถุประสงค์ <span className="text-red-400">*</span>
                </label>
                <textarea value={form.purposeText} onChange={set("purposeText")} placeholder="ระบุวัตถุประสงค์..." rows={2}
                  className={cn("w-full border rounded-lg px-3 py-2 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none", form.purposeText ? "border-gray-200" : "border-red-200")} />
              </div>

              {/* Pre-filled info */}
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-700">
                <p className="font-semibold mb-1">ข้อมูลจากการจอง (กรอกอัตโนมัติ)</p>
                <p>• ห้อง: {room.name}</p>
                {timeslots.map((ts, i) => (
                  <p key={i}>• {fmtLong(ts.date)} เวลา {ts.startTime}–{ts.endTime} น.</p>
                ))}
              </div>

              {/* Signature */}
              <SignaturePad onChange={setSig} />

              {/* Submit */}
              {generatedFile ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-green-700">ดาวน์โหลดสำเร็จ</p>
                      <p className="text-xs text-green-600 truncate">{generatedFile.name}</p>
                    </div>
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="text-xs text-green-600 hover:text-green-800 underline underline-offset-2 shrink-0"
                    >
                      ดาวน์โหลดอีกครั้ง
                    </button>
                  </div>
                  <Button
                    onClick={handleConfirm}
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold h-11 rounded-xl flex items-center justify-center gap-2"
                  >
                    ตกลง
                  </Button>
                </div>
              ) : (
                <>
                  <Button onClick={handleGenerate} disabled={!isValid || generating}
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold h-11 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                    {generating
                      ? <><Loader2 size={16} className="animate-spin" /> กำลังสร้าง PDF...</>
                      : <><Download size={16} /> ดาวน์โหลด PDF</>}
                  </Button>
                  {!isValid && (
                    <p className="text-xs text-red-400 text-center -mt-2">กรุณากรอกข้อมูลที่จำเป็นและวาดลายเซ็น</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FField({ label, placeholder, value, onChange, required, type = "text" }: {
  label: string; placeholder?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={cn("w-full border rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
          required && !value ? "border-red-200" : "border-gray-200")} />
    </div>
  );
}

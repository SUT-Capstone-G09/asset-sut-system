"use client";

import { useRef, useState } from "react";
import { X, Download, Loader2, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Room } from "@/features/bookings/types";
import { cn } from "@/lib/utils";
import { verifyPasswordApi } from "@/lib/services/auth.service";
import { fmtLong, fmtShortD, fmtShortM, fmtShortBE, todayParts } from "@/lib/utils/thaiDate";
import { useThaiAddressAutofill } from "@/features/bookings/hooks/useThaiAddressAutofill";
import SignaturePad from "./SignaturePad";
import FField from "./FField";

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
}

interface FormData {
  prefix: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  houseNo: string;
  road: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  phone: string;
  attendees: string;
  buildingType: string;
  otherBuilding: string;
}

const BUILDING_OPTIONS = ["อาคาร 80 พรรษา", "อาคารเรียนรวม 1", "สนามกีฬา", "อื่น ๆ"];

export default function DocumentFormModal({ room, timeslots, purpose, onClose, onGenerated }: DocumentFormModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedFile, setGeneratedFile] = useState<File | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const [sigMode, setSigMode] = useState<"draw" | "upload" | "saved">("draw");
  const [showPwPrompt, setShowPwPrompt] = useState(false);
  const [pwValue, setPwValue] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [form, setForm] = useState<FormData>({
    prefix: "",
    firstName: "",
    lastName: "",
    position: "",
    department: "",
    houseNo: "",
    road: "",
    subdistrict: "",
    district: "",
    province: "",
    postalCode: "",
    phone: "",
    attendees: "",
    buildingType: "อื่น ๆ",
    otherBuilding: room.name,
  });

  const set = (f: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((p) => ({ ...p, [f]: e.target.value }));
    };

  const {
    subdistrictOptions,
    districtOptions,
    handlePostalCodeChange,
    handleSubdistrictChange,
    handleDistrictChange,
  } = useThaiAddressAutofill(form, setForm);

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

  // Step-up auth: re-confirm the account password before applying a reused
  // signature (uploaded file or saved-from-before) to a new document. Not
  // required when freshly drawn — drawing it live each time is itself proof
  // of present intent.
  const requestSign = () => {
    if (sigMode === "draw") {
      handleGenerate();
      return;
    }
    setPwValue("");
    setPwError(null);
    setShowPwPrompt(true);
  };

  const confirmPasswordAndSign = async () => {
    if (!pwValue) return;
    setVerifying(true);
    setPwError(null);
    try {
      await verifyPasswordApi(pwValue);
      setShowPwPrompt(false);
      await handleGenerate();
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "รหัสผ่านไม่ถูกต้อง");
    } finally {
      setVerifying(false);
    }
  };

  const phoneValid = form.phone ? /^0\d{8,9}$/.test(form.phone.replace(/[-\s]/g, "")) : false;
  const attendeesNum = parseInt(form.attendees);
  const attendeesValid = !form.attendees || (!isNaN(attendeesNum) && attendeesNum > 0 && attendeesNum <= room.capacityMax);

  const isValid = !!(form.prefix && form.firstName.trim() && form.lastName.trim() && form.position.trim() && form.department.trim() && phoneValid && attendeesValid && purpose.trim() && sig !== null);

  return (
    <div className="fixed inset-0 z-[1200] flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm py-8 px-4">
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
                  <span className="border-b border-dotted border-gray-700 inline-block min-w-[200px] mx-1 align-bottom">
                    {form.department}
                  </span>
                </p>
                <p>
                  ที่อยู่
                  <span className="border-b border-dotted border-gray-700 inline-block min-w-[300px] mx-1 align-bottom">
                    {[form.houseNo, form.road, form.subdistrict, form.district, form.province, form.postalCode].filter(Boolean).join(" ")}
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
                  {form.prefix}{form.firstName} {form.lastName}
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
                    {opt === "อื่น ๆ"
                      ? <>อื่น ๆ
                          <span className="border-b border-dotted border-gray-700 inline-block min-w-[80px] mx-1 align-bottom text-center text-[11px]">
                            {form.buildingType === "อื่น ๆ" ? form.otherBuilding : ""}
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
                  {purpose}
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
                    ({form.firstName || form.lastName ? `${form.prefix}${form.firstName} ${form.lastName}` : "…………………………………"})
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
                  คำนำหน้า <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.prefix}
                  onChange={set("prefix")}
                  className={cn(
                    "w-full border rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
                    form.prefix ? "border-gray-200" : "border-red-200"
                  )}
                >
                  <option value="" disabled>เลือกคำนำหน้า</option>
                  {["นาย","นาง","นางสาว","ดร.","รศ.ดร.","ผศ.ดร.","ศ.ดร."].map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>

              <div className="flex gap-2">
                <FField label="ชื่อ" placeholder="ชื่อจริง" value={form.firstName} onChange={set("firstName")} required className="flex-1" />
                <FField label="นามสกุล" placeholder="นามสกุล" value={form.lastName} onChange={set("lastName")} required className="flex-1" />
              </div>

              <FField label="ตำแหน่ง" placeholder="เช่น นักศึกษา, อาจารย์" value={form.position} onChange={set("position")} required />
              <FField label="หน่วยงาน / บริษัท" placeholder="เช่น สำนักวิชาวิศวกรรมศาสตร์" value={form.department} onChange={set("department")} required />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ที่อยู่</label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <FField label="บ้านเลขที่" placeholder="123/4" value={form.houseNo} onChange={set("houseNo")} className="flex-1" />
                    <FField label="ถนน" placeholder="ถนนมิตรภาพ" value={form.road} onChange={set("road")} className="flex-1" />
                  </div>
                  <div className="flex gap-2">
                    <FField label="ตำบล / แขวง" placeholder="ตำบลสุรนารี" value={form.subdistrict} onChange={handleSubdistrictChange} className="flex-1"
                      selectOptions={subdistrictOptions} />
                    <FField label="อำเภอ / เขต" placeholder="อำเภอเมือง" value={form.district} onChange={handleDistrictChange} className="flex-1"
                      selectOptions={districtOptions} />
                  </div>
                  <div className="flex gap-2">
                    <FField label="จังหวัด" placeholder="นครราชสีมา" value={form.province} onChange={set("province")} className="flex-1" />
                    <FField label="รหัสไปรษณีย์" placeholder="30000" value={form.postalCode} onChange={handlePostalCodeChange} className="w-28" maxLength={5} />
                  </div>
                  <p className="text-xs text-gray-400 -mt-1">กรอกรหัสไปรษณีย์เพื่อเติมตำบล/อำเภอ/จังหวัดอัตโนมัติ</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  เบอร์โทรศัพท์ <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="0XX-XXX-XXXX"
                  className={cn(
                    "w-full border rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
                    form.phone && !phoneValid ? "border-red-200" : "border-gray-200"
                  )}
                />
                {form.phone && !phoneValid && (
                  <p className="text-xs text-red-500 mt-1">รูปแบบไม่ถูกต้อง — กรอกตัวเลข 10 หลัก เช่น 0812345678</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  จำนวนผู้เข้าร่วม (คน)
                </label>
                <input
                  type="number"
                  value={form.attendees}
                  onChange={set("attendees")}
                  placeholder={`สูงสุด ${room.capacityMax} คน`}
                  min={1}
                  max={room.capacityMax}
                  className={cn(
                    "w-full border rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
                    form.attendees && !attendeesValid ? "border-red-200" : "border-gray-200"
                  )}
                />
                {form.attendees && !attendeesValid && (
                  <p className="text-xs text-red-500 mt-1">เกินความจุสูงสุดของห้อง ({room.capacityMax} คน)</p>
                )}
              </div>

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
                {form.buildingType === "อื่น ๆ" && (
                  <input type="text" value={form.otherBuilding} onChange={set("otherBuilding")} placeholder="ระบุสถานที่"
                    className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
                )}
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
              <SignaturePad onChange={setSig} onModeChange={setSigMode} />

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
                  <Button onClick={requestSign} disabled={!isValid || generating}
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

      {/* Password re-confirmation before signing */}
      {showPwPrompt && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <Lock size={16} className="text-brand-primary" />
              <h3 className="font-bold text-gray-900">ยืนยันรหัสผ่านก่อนเซ็นเอกสาร</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">กรอกรหัสผ่านบัญชีของคุณเพื่อยืนยันการเซ็นเอกสารนี้</p>
            <input
              type="password"
              autoFocus
              value={pwValue}
              onChange={(e) => setPwValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") confirmPasswordAndSign(); }}
              placeholder="รหัสผ่าน"
              className={cn(
                "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
                pwError ? "border-red-300" : "border-gray-200"
              )}
            />
            {pwError && <p className="text-xs text-red-500 mt-1.5">{pwError}</p>}
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowPwPrompt(false)}
                className="flex-1 h-10 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <Button
                onClick={confirmPasswordAndSign}
                disabled={!pwValue || verifying}
                className="flex-1 h-10 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verifying ? <Loader2 size={14} className="animate-spin" /> : null}
                ยืนยันและเซ็น
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBooking } from "@/features/bookings/services/booking.service";
import { calendarDraftKey } from "@/features/bookings/hooks/useBookingCalendar";
import { createDocument, getDocumentTypeId } from "@/features/payment/services/document.service";
import { uploadFile, UPLOAD_FOLDERS, MAX_UPLOAD_SIZE_MB } from "@/lib/services/upload";
import DocumentFormModal from "@/features/bookings/components/confirm/DocumentFormModal";
import {
  CalendarDays,
  Car,
  Check,
  Clock,
  Download,
  Eye,
  FilePen,
  FileText,
  FileUp,
  Info,
  Lightbulb,
  MapPin,
  Monitor,
  Music2,
  PenLine,
  Receipt,
  Tv2,
  Users,
  Utensils,
  Wifi,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Room } from "@/features/bookings/types";
import { calculateSlotPrice } from "@/features/bookings/utils/pricing";
import { cn } from "@/lib/utils";

const AMENITY_ICONS: Record<string, React.ElementType> = {
  WiFi: Wifi,
  โปรเจคเตอร์: Monitor,
  "Smart TV": Tv2,
  ไวท์บอร์ด: PenLine,
  ระบบเสียง: Music2,
  แสงสี: Lightbulb,
  ที่จอดรถ: Car,
  รวมบริการต้อนรับ: Utensils,
};

const STEPS = [
  { label: "เริ่มต้นการจอง", description: "กรอกข้อมูลเบื้องต้นเรียบร้อยแล้ว", done: true },
  { label: "รอดำเนินการอนุมัติ", description: "คำขอจะได้รับการตรวจสอบโดยผู้ดูแล", done: false },
  { label: "รอชำระเงิน", description: "ชำระผ่านช่องทางต่าง ๆ ของมหาวิทยาลัย", done: false },
  { label: "เสร็จสิ้น", description: "การจองของคุณเสร็จสมบูรณ์", done: false },
];

interface BookingDraft {
  locationId: string;
  timeslots: { date: string; startTime: string; endTime: string; isFullDay?: boolean }[];
}

interface BookingConfirmViewProps {
  room: Room;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatThaiDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${d} ${months[m - 1]} ${y + 543}`;
}

function calcSlotHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return (eh * 60 + em - sh * 60 - sm) / 60;
}

function calcTotalHours(timeslots: { startTime: string; endTime: string }[]): number {
  return timeslots.reduce((sum, ts) => sum + calcSlotHours(ts.startTime, ts.endTime), 0);
}

const FULL_DAY_START = "07:00";
const FULL_DAY_END = "21:00";

function isFullDaySlot(ts: { startTime: string; endTime: string; isFullDay?: boolean }): boolean {
  return ts.isFullDay === true || (ts.startTime === FULL_DAY_START && ts.endTime === FULL_DAY_END);
}

function splitByType(
  timeslots: { startTime: string; endTime: string; isFullDay?: boolean }[],
  pricePerDay: number | undefined
) {
  const fullDay = timeslots.filter((ts) => isFullDaySlot(ts) && pricePerDay != null);
  const hourly = timeslots.filter((ts) => !isFullDaySlot(ts) || pricePerDay == null);
  return { fullDay, hourly };
}

interface DocumentEntry {
  file: File;
  source: "manual" | "generated";
}

export default function BookingConfirmView({ room }: BookingConfirmViewProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);
  const [showDocModal, setShowDocModal] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [termsRead, setTermsRead] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`booking_draft_${room.id}`);
    if (raw) {
      setDraft(JSON.parse(raw));
    } else {
      router.replace(`/bookings/${room.id}`);
    }
  }, [room.id, router]);

  if (!draft) return null;

  const hasDocument = documents.length > 0;
  const hasManualUpload = documents.some((d) => d.source === "manual");
  const hasGeneratedDoc = documents.some((d) => d.source === "generated");
  const { fullDay: fullDaySlots, hourly: hourlySlots } = splitByType(draft.timeslots, room.pricePerDay);
  const fullDayTotal = fullDaySlots.length * (room.pricePerDay ?? 0);
  const hourlyHours = calcTotalHours(hourlySlots);
  const hourlyTotal = hourlySlots.reduce(
    (sum, ts) =>
      sum +
      calculateSlotPrice(
        ts.startTime,
        ts.endTime,
        room.pricePerHour,
        room.pricePerHourOffPeak ?? room.pricePerHour,
        room.pricePerDay
      ),
    0
  );
  const totalHours = calcTotalHours(draft.timeslots);
  const totalPrice = fullDayTotal + hourlyTotal;

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    const tooLarge = incoming.filter((f) => f.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024);
    const accepted = incoming.filter((f) => f.size <= MAX_UPLOAD_SIZE_MB * 1024 * 1024);

    if (tooLarge.length > 0) {
      toast.error(
        tooLarge.length === 1
          ? `ไฟล์ "${tooLarge[0].name}" ใหญ่เกินไป (ไม่เกิน ${MAX_UPLOAD_SIZE_MB} MB)`
          : `ข้าม ${tooLarge.length} ไฟล์ที่ใหญ่เกิน ${MAX_UPLOAD_SIZE_MB} MB`
      );
    }

    setDocuments((prev) => [
      ...prev,
      ...accepted.map((file): DocumentEntry => ({ file, source: "manual" })),
    ]);
  };

  const removeFile = (index: number) =>
    setDocuments((prev) => prev.filter((_, i) => i !== index));

  const openLocalFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const downloadLocalFile = (file: File) => {
    const url = URL.createObjectURL(file);
    Object.assign(document.createElement("a"), { href: url, download: file.name }).click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleConfirm = async () => {
    if (!draft || !purpose.trim()) return;

    // Guard against degenerate slots (end ≤ start) so we never submit a request
    // the backend will reject anyway — full-day slots always carry start < end.
    const hasInvalidSlot = draft.timeslots.some((ts) => !isFullDaySlot(ts) && ts.endTime <= ts.startTime);
    if (hasInvalidSlot) {
      const msg = "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      // Send explicit +07:00 (Bangkok) offsets instead of converting through
      // the browser's local timezone via toISOString() — the backend reads
      // the clock-time component directly (see calculatePrice/minutesOfDay
      // in booking.go) to decide office-hours vs. off-peak pricing, so the
      // wire format must preserve the Thai wall-clock hour the user picked
      // regardless of what timezone the browser itself is running in.
      const timeslots = draft.timeslots.map((ts) => ({
        location_id: Number(draft.locationId),
        date: `${ts.date}T00:00:00+07:00`,
        start_time: `${ts.date}T${ts.startTime}:00+07:00`,
        end_time: `${ts.date}T${ts.endTime}:00+07:00`,
        is_full_day: !!ts.isFullDay,
      }));
      const booking = await createBooking({ purpose: purpose.trim(), timeslots });
      sessionStorage.removeItem(`booking_draft_${room.id}`);
      sessionStorage.removeItem(calendarDraftKey(room.id));

      // Upload each document — ส่งวันที่จองและชื่อสถานที่เพื่อตั้งชื่อไฟล์และจัด folder
      const bookingDate = draft.timeslots[0]?.date; // "YYYY-MM-DD"
      let uploadFailures = 0;
      for (const { file, source } of documents) {
        try {
          const uploaded = await uploadFile(file, UPLOAD_FOLDERS.BOOKING_DOCS, bookingDate, room.name, booking.id);
          // "booking_form" for files we generated ourselves (DocumentFormModal)
          // — we know exactly what they are. "other" for anything the user
          // attached manually, since MIME type alone can't tell a booking
          // form from an ID card scan etc. Resolved by name (not a hardcoded
          // id) so this can't silently break if the seed order ever changes.
          const documentTypeId = await getDocumentTypeId(source === "generated" ? "booking_form" : "other");
          await createDocument({
            booking_id: booking.id,
            document_type_id: documentTypeId,
            file_name: uploaded.file_name,
            bucket_name: uploaded.bucket_name,
            object_key: uploaded.object_key,
            file_url: uploaded.url,
            content_type: uploaded.content_type,
            method_id: 1,
          });
        } catch (err) {
          uploadFailures++;
          const reason = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
          toast.error(
            `อัปโหลดเอกสาร "${file.name}" ไม่สำเร็จ (${reason}) — การจองถูกบันทึกแล้ว แต่ต้องอัปโหลดเอกสารนี้ใหม่ในหน้ารายละเอียดการจอง`,
            { duration: 10000 }
          );
        }
      }

      // A document is required to submit (see the disabled-button guard
      // below), so if every upload failed, the booking now sits with none —
      // land the user on the detail page where "อัปโหลดเอกสารเพิ่มเติม" lets
      // them fix it, instead of the generic list where the gap is invisible.
      router.push(uploadFailures > 0 ? `/my-bookings/${booking.id}` : "/my-bookings");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">สรุปรายละเอียดการจอง</h1>
        <p className="text-gray-500 text-sm mt-1">ตรวจสอบข้อมูลการจองห้องและช่วงเวลาที่เลือกก่อนยืนยัน</p>
      </div>

      <BookingStatusStepper steps={STEPS} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* ── Left column ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Room info */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader icon="door" label="ข้อมูลห้องที่เลือก" />

            <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden flex gap-0">
              <div className="w-40 shrink-0">
                <img src={room.image} alt={room.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col justify-center gap-2 p-4">
                <h3 className="text-lg font-bold text-brand-primary">{room.name}</h3>
                <p className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin size={13} className="text-brand-primary shrink-0" />
                  {[room.building, room.floor].filter(Boolean).join(" · ")}
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    <Users size={11} /> {room.capacityMax} ที่นั่ง
                  </span>
                  <span className="flex items-center gap-1 text-xs bg-orange-50 text-brand-primary px-2.5 py-1 rounded-full font-medium">
                    ฿{room.pricePerHour.toLocaleString()}/ชม.
                  </span>
                </div>
              </div>
            </div>

            {/* Timeslots */}
            {draft && draft.timeslots.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">ช่วงเวลาที่จอง</p>
                <div className="flex flex-col gap-2">
                  {draft.timeslots.map((ts, i) => {
                    const hours = calcSlotHours(ts.startTime, ts.endTime);
                    return (
                      <div key={i} className="flex items-center gap-3 px-3.5 py-2.5 bg-orange-50 rounded-xl border border-orange-100">
                        <CalendarDays size={15} className="text-brand-primary shrink-0" />
                        <span className="text-sm font-medium text-gray-700">{formatThaiDate(ts.date)}</span>
                        <Clock size={13} className="text-gray-400 shrink-0 ml-1" />
                        <span className="text-sm text-gray-600">{ts.startTime} – {ts.endTime}</span>
                        <span className="ml-auto text-xs bg-white border border-orange-100 text-brand-primary px-2 py-0.5 rounded-full font-medium">
                          {hours} ชม.
                        </span>
                      </div>
                    );
                  })}
                </div>
                {draft.timeslots.length > 1 && (
                  <p className="text-xs text-gray-400 mt-2 text-right">
                    รวม {totalHours} ชั่วโมง · {draft.timeslots.length} ช่วง
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Amenities */}
          {room.amenities.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionHeader icon="equipment" label="สิ่งอำนวยความสะดวก" />
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.amenities.map((name) => {
                  const Icon = AMENITY_ICONS[name] ?? Wifi;
                  return (
                    <div
                      key={name}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 shrink-0">
                        <Icon size={15} className="text-brand-primary" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">{name}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Document management */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader icon="document" label="การจัดการเอกสาร" />

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DocCard
                icon={<FileUp size={28} className="text-brand-primary" />}
                title="อัปโหลดเอกสาร"
                description="สำหรับผู้ที่มีเอกสารพร้อมแล้ว"
                selected={hasManualUpload}
                onClick={() => fileInputRef.current?.click()}
              />
              <DocCard
                icon={<FilePen size={28} className="text-brand-primary" />}
                title="สร้างเอกสารผ่านระบบ"
                description="สร้างไฟล์ PDF อัตโนมัติจากข้อมูลการจอง"
                selected={hasGeneratedDoc}
                onClick={() => setShowDocModal(true)}
              />
            </div>

            {documents.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                {documents.map(({ file, source }, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                        <span className="shrink-0 text-[10px] font-medium text-brand-primary bg-orange-50 px-1.5 py-0.5 rounded-full">
                          {source === "manual" ? "อัปโหลด" : "สร้างอัตโนมัติ"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        title="ดูเอกสาร"
                        onClick={() => openLocalFile(file)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-primary hover:bg-orange-50 transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        title="ดาวน์โหลด"
                        onClick={() => downloadLocalFile(file)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-primary hover:bg-orange-50 transition-colors"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        title="ลบไฟล์"
                        onClick={() => removeFile(i)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Right column ─────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-24 flex flex-col gap-4">

          {/* Price summary */}
          {totalHours > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-100 text-brand-primary shrink-0">
                  <Receipt size={15} />
                </div>
                <h3 className="font-bold text-gray-900">สรุปค่าใช้จ่าย</h3>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                {fullDaySlots.length > 0 && (
                  <>
                    <div className="flex justify-between text-gray-500">
                      <span>ราคา/วัน (เต็มวัน)</span>
                      <span>฿{(room.pricePerDay ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>จำนวนวันเต็มวัน</span>
                      <span>{fullDaySlots.length} วัน</span>
                    </div>
                  </>
                )}
                {hourlySlots.length > 0 && (
                  <>
                    <div className="flex justify-between text-gray-500">
                      <span>ราคา/ชั่วโมง</span>
                      <span>฿{room.pricePerHour.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>จำนวนชั่วโมง</span>
                      <span>{hourlyHours} ชม.</span>
                    </div>
                  </>
                )}
                <div className="h-px bg-gray-100 my-1" />
                <div className="flex justify-between font-bold text-base text-gray-900">
                  <span>ราคารวม</span>
                  <span className="text-brand-primary">฿{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* General disclaimer, not itemized — see BookingPanel.tsx for
                  the same wording/rationale. */}
              <div className="mt-4 bg-gray-50 rounded-xl p-3 flex items-start gap-2">
                <Info size={13} className="text-gray-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 leading-relaxed">
                  ราคานี้เป็นค่าห้องเท่านั้น อาจมีค่าใช้จ่ายเพิ่มเติม เช่น ค่าแม่บ้าน ค่าไฟฟ้า
                  หรือค่าบริการอื่น ๆ ตามที่เจ้าหน้าที่กำหนดภายหลัง
                </p>
              </div>
            </div>
          )}

          {/* Purpose input */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              วัตถุประสงค์การจอง <span className="text-red-400">*</span>
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="ระบุวัตถุประสงค์การใช้งานพื้นที่..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none"
            />
          </div>

          {/* Terms and Conditions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              ข้อตกลงและเงื่อนไข <span className="text-red-400">*</span>
            </label>
            <div
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollHeight - el.scrollTop <= el.clientHeight + 10) setTermsRead(true);
              }}
              className="h-44 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-600 leading-relaxed space-y-2 select-none"
            >
              <p className="font-semibold text-gray-700">ข้อตกลงและเงื่อนไขการจองและเข้าใช้พื้นที่</p>
              <p className="text-gray-400 italic">โปรดอ่านและทำความเข้าใจข้อปฏิบัติในการจองและใช้งานพื้นที่อย่างละเอียด การยืนยันการจอง ถือเป็นการยอมรับเงื่อนไขดังต่อไปนี้</p>
              <p className="font-semibold text-gray-700">1. ระเบียบทั่วไปสำหรับการจองทุกประเภท</p>
              <p><span className="font-medium">สิทธิการใช้งาน:</span> ผู้จองต้องใช้ข้อมูลที่แท้จริง สิทธิในการจองเป็นสิทธิเฉพาะตัว ไม่อนุญาตให้โอนสิทธิหรือจองแทนผู้อื่นโดยเด็ดขาด</p>
              <p><span className="font-medium">เวลาการใช้งาน:</span> ต้องเข้าใช้และคืนพื้นที่ตามเวลาที่ระบุไว้ในระบบ หากเกินเวลาอาจมีผลต่อการพิจารณาสิทธิการจองในครั้งต่อไป</p>
              <p><span className="font-medium">การยกเลิก:</span> หากไม่สามารถมาใช้งานได้ ต้องกดยกเลิกในระบบล่วงหน้าอย่างน้อย 2 ชั่วโมงก่อนถึงกำหนดเวลา</p>
              <p><span className="font-medium">การไม่เข้าใช้งาน (No-show):</span> หากผู้จองไม่มาแสดงตัวภายใน 15 นาที ระบบจะยกเลิกการจองอัตโนมัติ และหากเกิดกรณีนี้ติดต่อกัน 3 ครั้ง ระบบจะระงับสิทธิการใช้งานเป็นเวลา 30 วัน</p>
              <p className="font-semibold text-gray-700">2. ข้อปฏิบัติเฉพาะพื้นที่</p>
              <p className="font-medium">หมวดห้องประชุมและห้องเรียน:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>ใช้เพื่อการประชุม การศึกษา หรือกิจกรรมทางวิชาการเท่านั้น</li>
                <li>งดการส่งเสียงดังรบกวนห้องเรียนหรือห้องประชุมข้างเคียง</li>
                <li>ห้ามนำอาหารที่มีกลิ่นแรงหรือเครื่องดื่มที่อาจทำให้เกิดคราบเลอะเทอะเข้ามาภายในห้อง</li>
                <li>เมื่อใช้งานเสร็จสิ้น ต้องปิดเครื่องปรับอากาศ ไฟส่องสว่าง โปรเจกเตอร์ และจัดโต๊ะเก้าอี้ให้อยู่ในสภาพเดิม</li>
              </ul>
              <p className="font-medium">หมวดโถงอาคาร (พื้นที่จัดกิจกรรม/นิทรรศการ):</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>การติดตั้งโครงสร้าง บอร์ด ป้าย หรือเวที ต้องไม่กีดขวางทางเดินหลักและประตูหนีไฟ</li>
                <li>ห้ามตอก เจาะ หรือติดเทปกาวที่ก่อให้เกิดความเสียหายต่อพื้นผิวอาคาร</li>
                <li>ผู้จองต้องรับผิดชอบในการจัดเก็บขยะและทำความสะอาดพื้นที่ทันทีหลังจบกิจกรรม</li>
              </ul>
              <p className="font-semibold text-gray-700">3. ความรับผิดชอบต่อความเสียหาย</p>
              <p>หากเกิดความเสียหายต่อสถานที่ อุปกรณ์ หรือทรัพย์สินส่วนรวม อันเกิดจากการใช้งานผิดประเภทหรือความประมาทเลินเล่อ ผู้จองจะต้องเป็นผู้รับผิดชอบชดใช้ค่าเสียหายตามที่เกิดขึ้นจริง</p>
              <p className="font-semibold text-gray-700">4. การยอมรับข้อตกลง</p>
              <p>การกดยืนยันการจองถือเป็นการยืนยันว่าผู้จองได้อ่านและยอมรับข้อตกลงทั้งหมดข้างต้น</p>
            </div>
            {!termsRead && (
              <p className="text-xs text-gray-400 mt-1">เลื่อนอ่านจนถึงด้านล่างเพื่อยอมรับข้อตกลง</p>
            )}
            <label className={cn("flex items-start gap-2 mt-2 cursor-pointer", !termsRead && "opacity-40 cursor-not-allowed")}>
              <input
                type="checkbox"
                disabled={!termsRead}
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <span className="text-xs text-gray-600">
                ข้าพเจ้าได้อ่าน ทำความเข้าใจ และยอมรับข้อปฏิบัติในการจองพื้นที่ทุกประการ
              </span>
            </label>

            <div className="h-px bg-gray-100 my-4" />

            <Button
              onClick={handleConfirm}
              disabled={!hasDocument || !purpose.trim() || !termsAccepted || submitting}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold h-12 rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "กำลังส่งคำขอ..." : "ยืนยันการจอง"}
            </Button>
            {(!hasDocument || !purpose.trim() || !termsAccepted) && (
              <p className="text-xs text-red-400 text-center mt-2">
                {!purpose.trim()
                  ? "กรุณาระบุวัตถุประสงค์การจอง"
                  : !hasDocument
                  ? "กรุณาอัปโหลดเอกสารหรือสร้างเอกสารก่อนยืนยัน"
                  : "กรุณายอมรับข้อตกลงและเงื่อนไขก่อนยืนยัน"}
              </p>
            )}
            {submitError && (
              <p className="text-xs text-red-500 text-center mt-2">{submitError}</p>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full h-12 rounded-xl text-base font-medium border-gray-200 text-gray-600 hover:text-gray-900"
          >
            ย้อนกลับ
          </Button>

          {/* Warning */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3">
            <span className="text-orange-500 mt-0.5 shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-orange-700 mb-1">ข้อมูลสำคัญ</p>
              <p className="text-xs text-orange-600 leading-relaxed">
                การยกเลิกการจองต้องทำล่วงหน้าอย่างน้อย 24 ชั่วโมง
                เพื่อรับเงินคืนเต็มจำนวน หากยกเลิกหลังจากนั้นระบบจะหักค่าธรรมเนียม 50%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {showDocModal && draft && (
      <DocumentFormModal
        room={room}
        timeslots={draft.timeslots}
        purpose={purpose}
        onPurposeChange={setPurpose}
        onClose={() => setShowDocModal(false)}
        onGenerated={(file) => {
          setDocuments((prev) => [...prev, { file, source: "generated" }]);
        }}
      />
    )}
    </>
  );
}

function BookingStatusStepper({ steps }: { steps: typeof STEPS }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 mb-6">
      <div className="flex items-start">
        {steps.map((step, i) => (
          <div key={i} className={cn("flex items-start", i < steps.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center gap-2 w-16 sm:w-28 shrink-0">
              <div
                className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                  step.done ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-400"
                )}
              >
                {step.done ? <Check size={15} strokeWidth={3} /> : i + 1}
              </div>
              <div className="text-center">
                <p
                  className={cn(
                    "text-[11px] sm:text-xs font-semibold leading-tight",
                    step.done ? "text-brand-primary" : "text-gray-400"
                  )}
                >
                  {step.label}
                </p>
                <p className="hidden sm:block text-[11px] text-gray-400 mt-0.5 leading-snug">
                  {step.description}
                </p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 mt-4 sm:mt-4.5 mx-1 sm:mx-2",
                  step.done ? "bg-brand-primary" : "bg-gray-100"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  const icons: Record<string, React.ElementType> = {
    door: Users,
    equipment: Wifi,
    document: FilePen,
  };
  const Icon = icons[icon];
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-100 text-brand-primary shrink-0">
        {Icon && <Icon size={15} />}
      </div>
      <h2 className="font-bold text-gray-900">{label}</h2>
    </div>
  );
}

function DocCard({ icon, title, description, selected, onClick }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl border transition-colors text-left",
        selected
          ? "border-brand-primary/30 bg-orange-50"
          : "border-gray-100 bg-gray-50 hover:border-brand-primary/30 hover:bg-orange-50"
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center shrink-0">
          <Check size={11} className="text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

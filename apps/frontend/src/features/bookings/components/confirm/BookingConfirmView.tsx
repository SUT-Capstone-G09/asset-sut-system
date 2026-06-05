"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/features/bookings/services/booking.service";
import { createDocument } from "@/features/payment/services/document.service";
import { uploadFile } from "@/lib/services/upload";
import DocumentFormModal from "@/features/bookings/components/confirm/DocumentFormModal";
import {
  CalendarDays,
  Car,
  Check,
  Clock,
  FilePen,
  FileText,
  FileUp,
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
  { label: "รอชำระเงิน", description: "ชำระผ่านช่องทางต่างๆ ของมหาวิทยาลัย", done: false },
  { label: "เสร็จสิ้น", description: "การจองของคุณเสร็จสมบูรณ์", done: false },
];

interface BookingDraft {
  locationId: string;
  timeslots: { date: string; startTime: string; endTime: string }[];
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

export default function BookingConfirmView({ room }: BookingConfirmViewProps) {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [generateDoc, setGenerateDoc] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`booking_draft_${room.id}`);
    if (raw) setDraft(JSON.parse(raw));
  }, [room.id]);

  const hasDocument = uploadedFiles.length > 0 || generateDoc;
  const totalHours = draft ? calcTotalHours(draft.timeslots) : 0;
  const totalPrice = totalHours * room.pricePerHour;

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setUploadedFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const removeFile = (index: number) =>
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));

  const handleConfirm = async () => {
    if (!draft || !purpose.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const timeslots = draft.timeslots.map((ts) => ({
        location_id: Number(draft.locationId),
        date: new Date(`${ts.date}T00:00:00`).toISOString(),
        start_time: new Date(`${ts.date}T${ts.startTime}:00`).toISOString(),
        end_time: new Date(`${ts.date}T${ts.endTime}:00`).toISOString(),
      }));
      const booking = await createBooking({ purpose: purpose.trim(), timeslots });
      sessionStorage.removeItem(`booking_draft_${room.id}`);

      // Upload each document to MinIO then save record to DB
      for (const file of uploadedFiles) {
        try {
          const uploaded = await uploadFile(file, "documents");
          await createDocument({
            booking_id: booking.id,
            document_type_id: file.type === "application/pdf" ? 2 : 4,
            file_name: uploaded.file_name,
            bucket_name: "payment-qr",
            object_key: uploaded.object_key,
            file_url: uploaded.url,
            content_type: uploaded.content_type,
            method_id: 1,
          });
        } catch {
          // Non-blocking — booking already created, document save failure shouldn't block redirect
        }
      }

      router.push("/my-bookings");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <div className="max-w-[1280px] mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">สรุปรายละเอียดการจอง</h1>
        <p className="text-gray-500 text-sm mt-1">ตรวจสอบข้อมูลการจองห้องและช่วงเวลาที่เลือกก่อนยืนยัน</p>
      </div>

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
                selected={uploadedFiles.length > 0}
                onClick={() => fileInputRef.current?.click()}
              />
              <DocCard
                icon={<FilePen size={28} className="text-brand-primary" />}
                title="สร้างเอกสารผ่านระบบ"
                description="สร้างไฟล์ PDF อัตโนมัติจากข้อมูลการจอง"
                selected={generateDoc}
                onClick={() => setShowDocModal(true)}
              />
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                    >
                      <X size={15} />
                    </button>
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
                <Receipt size={16} className="text-brand-primary" />
                <h3 className="font-bold text-gray-900">สรุปค่าใช้จ่าย</h3>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>ราคา/ชั่วโมง</span>
                  <span>฿{room.pricePerHour.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>จำนวนชั่วโมงรวม</span>
                  <span>{totalHours} ชม.</span>
                </div>
                <div className="h-px bg-gray-100 my-1" />
                <div className="flex justify-between font-bold text-base text-gray-900">
                  <span>ราคารวม</span>
                  <span className="text-brand-primary">฿{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Status stepper */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-5">สถานะการจอง</h3>
            <div className="flex flex-col">
              {STEPS.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                      step.done ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-400"
                    )}>
                      {step.done ? <Check size={14} strokeWidth={3} /> : i + 1}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="w-px flex-1 bg-gray-100 my-1" style={{ minHeight: 20 }} />
                    )}
                  </div>
                  <div className="pb-5">
                    <p className={cn(
                      "text-sm font-semibold",
                      step.done ? "text-brand-primary" : "text-gray-400"
                    )}>
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Purpose input */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
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

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleConfirm}
              disabled={!hasDocument || !purpose.trim() || submitting}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold h-12 rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "กำลังส่งคำขอ..." : "ยืนยันการจอง"}
            </Button>
            {(!hasDocument || !purpose.trim()) && (
              <p className="text-xs text-red-400 text-center">
                {!purpose.trim() ? "กรุณาระบุวัตถุประสงค์การจอง" : "กรุณาอัปโหลดเอกสารหรือสร้างเอกสารก่อนยืนยัน"}
              </p>
            )}
            {submitError && (
              <p className="text-xs text-red-500 text-center">{submitError}</p>
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
        onClose={() => setShowDocModal(false)}
        onGenerated={(file) => {
          setUploadedFiles((prev) => [...prev, file]);
          setGenerateDoc(true);
        }}
      />
    )}
    </>
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
      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-100 text-brand-primary">
        {Icon && <Icon size={14} />}
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
